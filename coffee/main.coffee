###
00     00   0000000   000  000   000
000   000  000   000  000  0000  000
000000000  000000000  000  000 0 000
000 0 000  000   000  000  000  0000
000   000  000   000  000  000   000
###

{ walkdir, about, karg, childp, prefs, post, karg, slash, log, fs, _ } = require 'kxk'

pkg           = require '../package.json'
electron      = require 'electron'

app           = electron.app
BrowserWindow = electron.BrowserWindow
Tray          = electron.Tray
Menu          = electron.Menu
clipboard     = electron.clipboard
ipc           = electron.ipcMain
iconDir       = slash.resolve "#{app.getPath('userData')}/icons"

win           = null
tray          = null

apps          = {}
scripts       = {}
allKeys       = []

app.setName pkg.productName

args = karg """
kappo
    debug  . ? log debug    . = false . - D

version  #{pkg.version}
"""

# 000  00000000    0000000
# 000  000   000  000
# 000  00000000   000
# 000  000        000
# 000  000         0000000

ipc.on  'cancel', -> activateApp()

post.on 'winlog', (text) -> log ">>> " + text
post.on 'runScript', (name) -> scripts[name].cb()
post.onGet 'apps', -> apps: apps, scripts:scripts, allKeys:allKeys

# 0000000    0000000  000000000  000  000   000  00000000
#000   000  000          000     000  000   000  000
#000000000  000          000     000   000 000   0000000
#000   000  000          000     000     000     000
#000   000   0000000     000     000      0      00000000

appName   = null
activeApp = null
activeWin = null

getActiveApp = ->

    if slash.win()
        wxw = require 'wxw'
        activeWin = wxw.active()
        wxwInfo = wxw.wininfo activeWin
        if wxwInfo?.path?
            appName = activeApp = slash.base wxwInfo.path
    else
        activeApp = childp.execSync "#{__dirname}/../bin/appswitch -P"

    if win?
        if appName?
            win.webContents.send 'currentApp', appName
        else
            win.webContents.send 'clearSearch'
        win.webContents.send 'fade'
    else
        createWindow()

activateApp = ->

    if slash.win()
        if activeWin
            wxw = require 'wxw'
            wxw.foreground wxw.wininfo(activeWin).path
        win?.hide()
    else

        if not activeApp?
            win?.hide()
        else
            childp.exec "#{__dirname}/../bin/appswitch -fp #{activeApp}", (err) -> win?.hide()

#000   000  000  000   000  0000000     0000000   000   000
#000 0 000  000  0000  000  000   000  000   000  000 0 000
#000000000  000  000 0 000  000   000  000   000  000000000
#000   000  000  000  0000  000   000  000   000  000   000
#00     00  000  000   000  0000000     0000000   00     00

toggleWindow = ->
    
    if win?.isVisible()
        win.webContents.send 'openCurrent'
        # activateApp()
    else
        if slash.win()
            if not win?
                createWindow()
            else
                getActiveApp()
                win.focus()
        else
            osascript = require 'osascript'
            name = osascript """
            tell application "System Events"
                set n to name of first application process whose frontmost is true
            end tell
            do shell script "echo " & n
            """
            appName = String(name).trim()

            if not win?
                createWindow()
            else
                getActiveApp()
                win.focus()

reloadWindow = -> win.webContents.reloadIgnoringCache()

createWindow = ->

    return if win?

    win = new BrowserWindow
        width:           300
        height:          300
        center:          true
        alwaysOnTop:     true
        movable:         true
        resizable:       true
        transparent:     true
        frame:           false
        maximizable:     false
        minimizable:     false
        minWidth:        200
        minHeight:       200
        maxWidth:        600
        maxHeight:       600
        fullscreen:      false
        show:            false

    bounds = prefs.get 'bounds'
    win.setBounds bounds if bounds?
    win.loadURL "file://#{__dirname}/index.html"
    win.on 'closed', -> win = null
    win.on 'resize', onWinResize
    win.on 'move',   saveBounds
    win.on 'ready-to-show', ->
        getActiveApp()
        if args.debug
            win.webContents.openDevTools()
    win

saveBounds = -> if win? then prefs.set 'bounds', win.getBounds()

squareTimer = null

onWinResize = (event) ->
    
    clearTimeout squareTimer
    adjustSize = ->
        b = win.getBounds()
        if b.width != b.height
            b.width = b.height = Math.min b.width, b.height
            win.setBounds b
        saveBounds()
    squareTimer = setTimeout adjustSize, 300

showAbout = ->
    
    if prefs.get('scheme', 'bright') == 'bright'
        color = '#fff'
        textc = '#ddd'
        highl = '#000'
    else
        textc = '#444'
        highl = '#fff'
        color = '#111'
        
    about
        img:        "#{__dirname}/../img/about.png"
        color:      textc
        highlight:  highl
        background: color
        size:       200
        pkg:        pkg

app.on 'window-all-closed', (event) -> event.preventDefault()

#00000000   00000000   0000000   0000000    000   000
#000   000  000       000   000  000   000   000 000
#0000000    0000000   000000000  000   000    00000
#000   000  000       000   000  000   000     000
#000   000  00000000  000   000  0000000       000

app.on 'ready', ->

    if app.makeSingleInstance(->)
        app.exit 0
        return

    tray = new Tray "#{__dirname}/../img/menu.png"
    tray.on 'click', toggleWindow
    
    tray.setContextMenu Menu.buildFromTemplate [
        label: "Quit"
        click: -> app.exit 0; process.exit 0
    ,
        label: "About"
        click: showAbout
    ]
        
    app.dock?.hide()

    # 00     00  00000000  000   000  000   000
    # 000   000  000       0000  000  000   000
    # 000000000  0000000   000 0 000  000   000
    # 000 0 000  000       000  0000  000   000
    # 000   000  00000000  000   000   0000000

    Menu.setApplicationMenu Menu.buildFromTemplate [
        label: app.getName()
        submenu: [
            label: "About #{pkg.name}"
            accelerator: 'CmdOrCtrl+.'
            click: -> showAbout()
        ,
            type: 'separator'
        ,
            label: 'Quit'
            accelerator: 'CmdOrCtrl+Q'
            click: ->
                saveBounds()
                app.exit 0
                process.exit 0
        ]
    ,
        # 000   000  000  000   000  0000000     0000000   000   000
        # 000 0 000  000  0000  000  000   000  000   000  000 0 000
        # 000000000  000  000 0 000  000   000  000   000  000000000
        # 000   000  000  000  0000  000   000  000   000  000   000
        # 00     00  000  000   000  0000000     0000000   00     00

        label: 'Window'
        submenu: [
            label:       'Close Window'
            accelerator: 'CmdOrCtrl+W'
            click:       -> win?.close()
        ,
            type: 'separator'
        ,
            label:       'Reload Window'
            accelerator: 'CmdOrCtrl+Alt+L'
            click:       -> reloadWindow()
        ,
            label:       'Toggle DevTools'
            accelerator: 'CmdOrCtrl+Alt+I'
            click:       -> win?.webContents.openDevTools()
        ]
    ]

    prefs.init shortcut: 'F1'

    electron.globalShortcut.register prefs.get('shortcut'), toggleWindow

    fs.ensureDirSync iconDir

    sortKeys = ->
        allKeys = Object.keys(apps).concat Object.keys(scripts)
        allKeys.sort (a,b) -> a.toLowerCase().localeCompare b.toLowerCase()
    
    scr = require './scripts'
    if slash.win()
        scripts = scr.winScripts()
        exeFind = require './exefind'
        exeFind (exes) -> 
            apps = exes
            sortKeys()
    else
        scripts = scr.macScripts()
        appFind = require './appfind'
        appFind (appl) -> 
            apps = appl
            sortKeys()
            

