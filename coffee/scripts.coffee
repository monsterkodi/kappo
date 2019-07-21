###
 0000000   0000000  00000000   000  00000000   000000000   0000000
000       000       000   000  000  000   000     000     000
0000000   000       0000000    000  00000000      000     0000000
     000  000       000   000  000  000           000          000
0000000    0000000  000   000  000  000           000     0000000
###

{ prefs, slash, log } = require 'kxk'

winRecycle  = ->
    
    wxw = require 'wxw'
    wxw 'trash' 'empty'
    
winScripts = () ->
    
    scripts = 
        recycle:
            cb:     winRecycle
            img:    slash.resolve "#{__dirname}/../scripts/recycle.png"
        sleep:
            exec:   'shutdown /h'
            img:    slash.resolve "#{__dirname}/../scripts/sleep.png"
        shutdown:
            exec:   'shutdown /s /t 0'
            img:    slash.resolve "#{__dirname}/../scripts/shutdown.png"
        restart:
            exec:   'shutdown /r /t 0'
            img:    slash.resolve "#{__dirname}/../scripts/restart.png"
        terminal:
            exec:   "C:/msys64/usr/bin/mintty.exe -i \"#{slash.resolve "#{__dirname}/../scripts/terminal.ico"}\" -o 'AppLaunchCmd=C:\msys64\mingw64.exe' -o 'AppID=MSYS2.Shell.MINGW64.9' -p 950,0 -t 'fish' --  /usr/bin/sh -lc fish"
            img:    slash.resolve "#{__dirname}/../scripts/terminal.png"
            foreground: "C:/msys64/usr/bin/mintty.exe"
    scripts

macScripts = () ->
    
    scripts =
        sleep:
            exec:   "pmset sleepnow"
            img:    "#{__dirname}/../scripts/sleep.png"
        shutdown:
            exec:   "osascript -e 'tell app \"System Events\" to shut down'"
            img:    "#{__dirname}/../scripts/shutdown.png"
        restart:
            exec:   "osascript -e 'tell app \"System Events\" to restart'"
            img:    "#{__dirname}/../scripts/restart.png"

    if prefs.get 'confirmShutdown'
        scripts.shutdown.exec = "osascript -e 'tell app \"loginwindow\" to «event aevtrsdn»'"
    if prefs.get 'confirmRestart'
        scripts.restart.exec = "osascript -e 'tell app \"loginwindow\" to «event aevtrrst»'"
    scripts

module.exports = 
    macScripts: macScripts
    winScripts: winScripts
    