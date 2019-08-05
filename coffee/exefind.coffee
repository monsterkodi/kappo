###
00000000  000   000  00000000        00000000  000  000   000  0000000
000        000 000   000             000       000  0000  000  000   000
0000000     00000    0000000         000000    000  000 0 000  000   000
000        000 000   000             000       000  000  0000  000   000
00000000  000   000  00000000        000       000  000   000  0000000
###

{ post, slash, walkdir, prefs, log, _ } = require 'kxk'

exeFind = (cb) ->

    appl = prefs.get 'apps', []
    
    apps = {}
    appl.map (a) -> apps[slash.base a] = slash.resolve a
    
    apps['cmd']      = "C:/Windows/System32/cmd.exe"
    apps['calc']     = "C:/Windows/System32/calc.exe"
    apps['Taskmgr']  = "C:/Windows/System32/Taskmgr.exe"
    apps['regedit']  = "C:/Windows/regedit.exe"
    apps['explorer'] = "C:/Windows/explorer.exe"

    dirs = _.clone prefs.get 'dirs', []
    
    dirs.push "C:/Program Files"
    dirs.push "C:/Program Files (x86)"
    dirs.push slash.resolve '~/AppData/Local'
    dirs.push slash.resolve '~/'

    ignoreDefaults = require '../bin/ignore'

    ignoredByDefault = (file) ->
        file = file.toLowerCase()
        for start in ignoreDefaults.startsWith
            return true if file.startsWith start
        for contains in ignoreDefaults.contains
            return true if file.indexOf(contains) >= 0
        for match in ignoreDefaults.matches
            return true if file == match
        false
            
    ignore = prefs.get 'ignore', []
    foldersLeft = dirs.length

    for exeFolder in dirs
        
        walkOpt = prefs.get 'walk', no_recurse: false, max_depth: 4
        walk = walkdir slash.resolve(exeFolder), walkOpt

        walk.on 'error', (err) -> 
            post.toWins 'mainlog', "walk error #{err.stack}"
            log "[ERROR] findExes -- #{err}"

        walk.on 'end', ->

            foldersLeft -= 1
            if foldersLeft == 0
                # post.toWins 'mainlog', "apps #{apps}"
                cb? apps

        walk.on 'file', (file) ->

            file = slash.resolve file
            if slash.ext(file) == 'exe'
                name = slash.base file
                if file not in ignore and not ignoredByDefault name
                    if not apps[name]?
                        apps[name] = file

module.exports = exeFind
