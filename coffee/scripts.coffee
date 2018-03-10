###
 0000000   0000000  00000000   000  00000000   000000000   0000000
000       000       000   000  000  000   000     000     000
0000000   000       0000000    000  00000000      000     0000000
     000  000       000   000  000  000           000          000
0000000    0000000  000   000  000  000           000     0000000
###

{ prefs, slash, log } = require 'kxk'

winRecycle  = ->
    
    { user, shell } = require 'wxw'
    
    if prefs.get 'confirmRecycle', false
        confirm = 0
    else
        confirm = 1
        
    shell.SHEmptyRecycleBinW user.GetForegroundWindow(), null, confirm
    
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