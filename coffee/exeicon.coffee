###
0000000  000   000  00000000  000   0000000   0000000   000   000  
00        000 000   000       000  000       000   000  0000  000  
000000     00000    0000000   000  000       000   000  000 0 000  
00        000 000   000       000  000       000   000  000  0000  
0000000  000   000  00000000  000   0000000   0000000   000   000  
###

{ slash, empty, fs, childp, error, log } = require 'kxk'
    
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
        
        appPath = opt.appPath
        pngPath = ExeIcon.pngPath opt
        
        childp.exec "#{__dirname}/../bin/Quick_Any2Ico.exe  -formats=512 \"-res=#{appPath}\" \"-icon=#{pngPath}\"", opt, (err,stdout,stderr) -> 
            if not err 
                log stdout
                opt.cb pngPath, opt.cbArg
            else
                error stdout, stderr, err
                ExeIcon.brokenIcon opt
                
        # { getIconForPath, ICON_SIZE_LARGE, ICON_SIZE_MEDIUM, ICON_SIZE_EXTRA_LARGE } = require 'system-icon'
#             
        # getIconForPath appPath, ICON_SIZE_EXTRA_LARGE, (err, data) ->
            # if not err?
                # ExeIcon.saveIconData data, opt
            # else
                # getIconForPath appPath, ICON_SIZE_LARGE, (err, data) ->
                    # if not err?
                        # ExeIcon.saveIconData data, opt
                    # else
                        # getIconForPath appPath, ICON_SIZE_MEDIUM, (err, data) ->
                            # if not err?
                                # ExeIcon.saveIconData data, opt
                            # else 
                                # extractIcon = require 'win-icon-extractor'
                                # extractIcon(appPath).then (result) ->
                                    # if result
                                        # data = result.slice 'data:image/png;base64,'.length
                                        # ExeIcon.saveIconBase64 data, opt
                                    # else
                                        # ExeIcon.brokenIcon opt
                
    @saveIconData: (data, opt) ->
        
        pngPath = ExeIcon.pngPath opt
        fs.writeFile pngPath, data, (err) ->
            if not err?
                # log 'saveIconData', pngPath
                opt.cb pngPath, opt.cbArg
            else
                error "saveIconData: #{err}"
                ExeIcon.brokenIcon opt

    @saveIconBase64: (data, opt) ->
        
        pngPath = ExeIcon.pngPath opt
        fs.writeFile pngPath, data, {encoding: 'base64'}, (err) ->
            if not err?
                # log 'saveIconBase64', pngPath
                opt.cb pngPath, opt.cbArg
            else
                error "saveIconBase64: #{err}"
                ExeIcon.brokenIcon opt
                
    @brokenIcon: (opt) ->
        
        brokenPath = slash.join __dirname, '..', 'img', 'broken.png'
        opt.cb brokenPath, opt.cbArg
        
module.exports = ExeIcon
