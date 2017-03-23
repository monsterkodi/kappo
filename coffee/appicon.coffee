# 0000000   00000000   00000000   000   0000000   0000000   000   000  
#000   000  000   000  000   000  000  000       000   000  0000  000  
#000000000  00000000   00000000   000  000       000   000  000 0 000  
#000   000  000        000        000  000       000   000  000  0000  
#000   000  000        000        000   0000000   0000000   000   000  
{
resolve,
log}      = require 'kxk'
fs        = require 'fs'
path      = require 'path'
plist     = require 'simple-plist'
childp    = require 'child_process'

class AppIcon
    
    @cache = {}
    
    @pngPath: (opt) ->
        resolve path.join opt.iconDir, path.basename(opt.appPath, path.extname(opt.appPath)) + ".png"

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
        infoPath = path.join appPath, 'Contents', 'Info.plist'
        plist.readFile infoPath, (err, obj) ->
            if not err?
                if obj['CFBundleIconFile']?
                    icnsPath = path.join path.dirname(infoPath), 'Resources', obj['CFBundleIconFile']
                    icnsPath += ".icns" if not icnsPath.endsWith '.icns'
                    AppIcon.saveIcon icnsPath, opt
                
    @saveIcon: (icnsPath, opt) ->
        pngPath = AppIcon.pngPath opt
        childp.exec "/usr/bin/sips -Z #{opt.size} -s format png \"#{icnsPath}\" --out \"#{pngPath}\"", (err) ->
            if not err?
                opt.cb pngPath, opt.cbArg
            else
                log "[ERROR] saveIcon: #{err}"
                
module.exports = AppIcon
