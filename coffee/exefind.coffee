###
00000000  000   000  00000000        00000000  000  000   000  0000000
000        000 000   000             000       000  0000  000  000   000
0000000     00000    0000000         000000    000  000 0 000  000   000
000        000 000   000             000       000  000  0000  000   000
00000000  000   000  00000000        000       000  000   000  0000000
###

{ slash, walkdir, prefs, log, _ } = require 'kxk'

exeFind = (cb) ->

    appl = prefs.get 'apps', []
    
    apps = {}
    appl.map (a) -> apps[slash.base a] = slash.resolve a
    
    apps['cmd']      = "C:/Windows/System32/cmd.exe"
    apps['calc']     = "C:/Windows/System32/calc.exe"
    apps['Taskmgr']  = "C:/Windows/System32/Taskmgr.exe"
    apps['regedit']  = "C:/Windows/regedit.exe"
    apps['explorer'] = "C:/Windows/explorer.exe"

    exeFolders = prefs.get 'dirs', []
    
    exeFolders.push "C:/Program Files"
    exeFolders.push "C:/Program Files (x86)"
    exeFolders.push slash.resolve '~/AppData/Local'

    # dirs
            # C:/Users/kodi/s
            # C:/Users/kodi/shell/bin
    # apps
            # C:/msys64/fish.lnk
            # C:/msys64/usr/bin/mintty.exe
            # C:/Users/kodi/s/konrad/app/konrad-win32-x64/konrad.exe
    
    # dirs
        # C:/Users/t.kohnhorst/shell/bin
    # apps
        # C:/Users/t.kohnhorst/s/konrad/app/konrad-win32-x64/konrad.exe
        # C:/Program Files (x86)/Microsoft Visual Studio 14.0/Common7/IDE/devenv.exe

    ignore = prefs.get 'ignore', []
    foldersLeft = exeFolders.length

    for exeFolder in exeFolders
        
        log 'search', exeFolder
        
        walkOpt = prefs.get 'walk', no_recurse: false, max_depth: 3
        walk = walkdir slash.resolve(exeFolder), walkOpt

        walk.on 'error', (err) -> log "[ERROR] findExes -- #{err}"

        walk.on 'end', ->

            foldersLeft -= 1
            if foldersLeft == 0
                log "found: #{_.size apps}"
                cb? apps

        walk.on 'file', (file) ->

            file = slash.resolve file
            if slash.ext(file) == 'exe'
                name = slash.base file
                if file not in ignore
                    apps[name] = file

module.exports = exeFind