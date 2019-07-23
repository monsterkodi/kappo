###
00     00   0000000   000  000   000
000   000  000   000  000  0000  000
000000000  000000000  000  000 0 000
000 0 000  000   000  000  000  0000
000   000  000   000  000  000   000
###

{ post, srcmap, walkdir, about, args, childp, prefs, karg, valid, slash, kstr, klog, os, fs, _ } = require 'kxk'

pkg           = require '../package.json'
electron      = require 'electron'

app           = electron.app
BrowserWindow = electron.BrowserWindow
Tray          = electron.Tray
Menu          = electron.Menu
clipboard     = electron.clipboard
iconDir       = slash.resolve "#{app.getPath('userData')}/icons"

win           = null
tray          = null

apps          = {}
scripts       = {}
allKeys       = []

process.on 'uncaughtException', (err) ->
    srcmap.logErr err, '🔻'
    true

klog.slog.icon = slash.fileUrl slash.resolve slash.join __dirname, '..', 'img', 'menu@2x.png'

app.setName pkg.productName

args = args.init """
    verbose     log verbose     false
    debug       log debug       false  -D
"""

# 00000000    0000000    0000000  000000000
# 000   000  000   000  000          000   
# 00000000   000   000  0000000      000   
# 000        000   000       000     000   
# 000         0000000   0000000      000   

post.on 'winlog',    (text) -> log ">>> " + text
post.on 'runScript', (name) -> scripts[name].cb()
post.on 'cancel',   -> activateApp()
post.on 'about',    -> showAbout()
post.on 'findApps', -> findApps()

post.onGet 'apps', -> apps: apps, scripts:scripts, allKeys:allKeys

# 00000000  000  000   000  0000000           0000000   00000000   00000000    0000000  
# 000       000  0000  000  000   000        000   000  000   000  000   000  000       
# 000000    000  000 0 000  000   000        000000000  00000000   00000000   0000000   
# 000       000  000  0000  000   000        000   000  000        000             000  
# 000       000  000   000  0000000          000   000  000        000        0000000   

findApps = ->

    sortKeys = ->

        allKeys = Object.keys(apps).concat Object.keys(scripts)
        allKeys.sort (a,b) -> a.toLowerCase().localeCompare b.toLowerCase()
        
        if win
            post.toWins 'appsFound'
        else
            createWindow()
            hideWin = -> win?.hide()
            if not args.debug
                setTimeout hideWin, 1000
    
    if slash.win()
        exeFind = require './exefind'
        exeFind (exes) -> 
            if valid exes
                apps = exes
                sortKeys()
    else
        appFind = require './appfind'
        appFind (appl) -> 
            apps = appl
            sortKeys()
            
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
        top = wxw('info' 'top')[0]
        if top?.path?
            appName = activeApp = slash.base top.path
    else
        activeApp = childp.execSync "#{__dirname}/../bin/appswitch -P"

    log 'getActiveApp', appName, activeApp, win? if args.verbose
        
    if win?
        if appName?
            log 'getActiveApp currentApp', appName if args.verbose
            post.toWins 'currentApp', appName
        else
            log 'getActiveApp clearSearch', appName if args.verbose
            post.toWins 'clearSearch'
        log 'getActiveApp fade' if args.verbose
        post.toWins 'fade'
    else
        createWindow()

#  0000000    0000000  000000000  000  000   000   0000000   000000000  00000000  
# 000   000  000          000     000  000   000  000   000     000     000       
# 000000000  000          000     000   000 000   000000000     000     0000000   
# 000   000  000          000     000     000     000   000     000     000       
# 000   000   0000000     000     000      0      000   000     000     00000000  

activateApp = ->

    if slash.win()
        if activeWin
            wxw = require 'wxw'
            info = wxw('info' activeWin)[0]
            if info?.path
                klog 'activate' info.path
                wxw 'launch' info.path
                # wxw 'raise' info.path
                # wxw 'focus' info.path
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
        if prefs.get 'hideOnDoubleActivation', false
            win.hide()
        else
            post.toWins 'openCurrent'
            activateApp() if not slash.win()
    else
        if slash.win()
            if not win?
                createWindow()
            else
                getActiveApp()
                win.focus()
        else
            osascript = require('osascript').eval
            osascript """
                tell application "System Events"
                    set n to name of first application process whose frontmost is true
                end tell
                do shell script "echo " & n
                """, type:'AppleScript', (err,name) ->
                    appName = String(name).trim()
                    if not win?
                        createWindow()
                    else
                        getActiveApp()
                        win.focus()

reloadWindow = -> win.webContents.reloadIgnoringCache()

#  0000000  00000000   00000000   0000000   000000000  00000000  
# 000       000   000  000       000   000     000     000       
# 000       0000000    0000000   000000000     000     0000000   
# 000       000   000  000       000   000     000     000       
#  0000000  000   000  00000000  000   000     000     00000000  

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
        webPreferences:
            nodeIntegration: true

    bounds = prefs.get 'bounds'
    win.setBounds bounds if bounds?
    win.loadURL "file://#{__dirname}/index.html"
    win.on 'closed', -> win = null
    win.on 'resize', onWinResize
    win.on 'move',   saveBounds
    win.on 'ready-to-show', ->
        getActiveApp()
        if args.debug
            win.show()
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

    if not app.requestSingleInstanceLock()
        log 'other instance running!'
        app.exit 0
        return
    
    tray = new Tray "#{__dirname}/../img/menu.png"
    tray.on 'click', toggleWindow
    
    if os.platform() != 'darwin'
        tray.setContextMenu Menu.buildFromTemplate [
            label: "Quit"
            click: -> app.exit 0; process.exit 0
        ,
            label: "About"
            click: showAbout
        ,
            label: "Activate"
            click: toggleWindow
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

    scr = require './scripts'
    if slash.win()
        scripts = scr.winScripts()
    else
        scripts = scr.macScripts()
    
    findApps()
            