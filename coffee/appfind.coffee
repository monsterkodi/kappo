###
 0000000   00000000   00000000   00000000  000  000   000  0000000    
000   000  000   000  000   000  000       000  0000  000  000   000  
000000000  00000000   00000000   000000    000  000 0 000  000   000  
000   000  000        000        000       000  000  0000  000   000  
000   000  000        000        000       000  000   000  0000000    
###

{ walkdir, prefs, slash, log, _ } = require 'kxk'

appFind = (cb) ->

    apps = {}
    apps['Finder'] = "/System/Library/CoreServices/Finder.app"
    appFolders = [
        "/Applications"
        "/Applications/Utilities"
        "~"
        ]
    appFolders = appFolders.concat prefs.get 'dirs', []
    foldersLeft = appFolders.length
    
    for appFolder in appFolders
        walkOpt = prefs.get 'walk', no_recurse: false, max_depth: 4
        walk = walkdir slash.resolve(appFolder), walkOpt
        walk.on 'error', (err) -> log "[ERROR] findApps -- #{err}"
        walk.on 'end', ->
            foldersLeft -= 1
            if foldersLeft == 0
                # log "found: #{_.size apps}"
                cb apps
        walk.on 'directory', (dir) ->
            if slash.ext(dir) == 'app'
                name = slash.base dir
                apps[name] = dir

module.exports = appFind                
            