###
0000000  000   000  00000000  000   0000000   0000000   000   000  
00        000 000   000       000  000       000   000  0000  000  
000000     00000    0000000   000  000       000   000  000 0 000  
00        000 000   000       000  000       000   000  000  0000  
0000000  000   000  00000000  000   0000000   0000000   000   000  
###

{ slash, empty, fs, childp, kerror, klog } = require 'kxk'
    
class ExeIcon
    
    @cache = {}
    
    @pngPath: (opt) ->
        
        slash.resolve slash.join opt.iconDir, slash.base(opt.appPath) + ".png"

    @get: (opt) ->
        
        pngPath = ExeIcon.pngPath opt
        if ExeIcon.cache[pngPath]
            opt.cb pngPath, opt.cbArg
        else
            fs.stat pngPath, (err, stat) ->
                if not err? and stat.isFile()
                    ExeIcon.cache[pngPath] = true
                    opt.cb pngPath, opt.cbArg
                else
                    ExeIcon.getIcon opt
                    
    @getIcon: (opt) ->
        
        appPath = slash.resolve opt.appPath
        pngPath = ExeIcon.pngPath opt
        
        klog 'getIcon', appPath, pngPath
        
        any2Ico = slash.path __dirname + '/../bin/Quick_Any2Ico.exe'
        
        if false #slash.isFile any2Ico
            
            childp.exec "\"#{any2Ico}\" -formats=512 -res=\"#{appPath}\" -icon=\"#{pngPath}\"", opt, (err,stdout,stderr) -> 
                if not err 
                    # log stdout
                    opt.cb pngPath, opt.cbArg
                else
                    if slash.ext(appPath)!= 'lnk'
                        kerror stdout, stderr, err
                    ExeIcon.brokenIcon opt

        else
            wxw = require 'wxw'
            wxw 'icon' appPath, pngPath
            opt.cb pngPath, opt.cbArg
                
    @saveIconData: (data, opt) ->
        
        pngPath = ExeIcon.pngPath opt
        fs.writeFile pngPath, data, (err) ->
            if not err?
                opt.cb pngPath, opt.cbArg
            else
                kerror "saveIconData: #{err}"
                ExeIcon.brokenIcon opt

    @saveIconBase64: (data, opt) ->
        
        pngPath = ExeIcon.pngPath opt
        fs.writeFile pngPath, data, {encoding: 'base64'}, (err) ->
            if not err?
                opt.cb pngPath, opt.cbArg
            else
                kerror "saveIconBase64: #{err}"
                ExeIcon.brokenIcon opt
                
    @brokenIcon: (opt) ->
        
        brokenPath = slash.join __dirname, '..', 'img', 'broken.png'
        opt.cb brokenPath, opt.cbArg
        
module.exports = ExeIcon
