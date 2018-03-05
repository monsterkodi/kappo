###
 0000000   00000000   00000000   000   0000000   0000000   000   000  
000   000  000   000  000   000  000  000       000   000  0000  000  
000000000  00000000   00000000   000  000       000   000  000 0 000  
000   000  000        000        000  000       000   000  000  0000  
000   000  000        000        000   0000000   0000000   000   000  
###

{ childp, fs, slash, error, log } = require 'kxk'

plist = require 'simple-plist'

class AppIcon
    
    @cache = {}
    
    @pngPath: (opt) ->
        slash.resolve slash.join opt.iconDir, slash.base(opt.appPath) + ".png"

    @get: (opt) ->
        pngPath = AppIcon.pngPath opt
        if AppIcon.cache[pngPath]
            opt.cb pngPath, opt.cbArg
        else
            fs.stat pngPath, (err, stat) ->
                if not err? and stat.isFile()
                    AppIcon.cache[pngPath] = true
                    opt.cb pngPath, opt.cbArg
                else
                    AppIcon.getIcon opt
         
    @getIcon: (opt) ->
        appPath = opt.appPath
        infoPath = slash.join appPath, 'Contents', 'Info.plist'
        plist.readFile infoPath, (err, obj) ->
            if not err?
                if obj['CFBundleIconFile']?
                    icnsPath = slash.join slash.dirname(infoPath), 'Resources', obj['CFBundleIconFile']
                    icnsPath += ".icns" if not icnsslash.endsWith '.icns'
                    AppIcon.saveIcon icnsPath, opt
                else
                    AppIcon.brokenIcon opt
            else
                error "getIcon: #{err}"
                AppIcon.brokenIcon opt
                
    @saveIcon: (icnsPath, opt) ->
        pngPath = AppIcon.pngPath opt
        childp.exec "/usr/bin/sips -Z #{opt.size} -s format png \"#{icnsPath}\" --out \"#{pngPath}\"", (err) ->
            if not err?
                opt.cb pngPath, opt.cbArg
            else
                error "saveIcon: #{err}"
                AppIcon.brokenIcon opt
     
    @brokenIcon: (opt) ->
        brokenPath = slash.join __dirname, '..', 'img', 'broken.png'
        opt.cb brokenPath, opt.cbArg
        
module.exports = AppIcon
