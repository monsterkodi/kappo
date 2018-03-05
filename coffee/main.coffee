###
00     00   0000000   000  000   000
000   000  000   000  000  0000  000
000000000  000000000  000  000 0 000
000 0 000  000   000  000  000  0000
000   000  000   000  000  000   000
###

{ osascript, walkdir, about, karg, childp, prefs, post, karg, slash, log, fs, _ } = require 'kxk'

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

post.on 'winlog', (text) -> console.log ">>> " + text
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
        activeApp = activeWinApp()
        appName = activeApp
        winctl = require 'winctl'
        activeWin = winctl.GetActiveWindow()
        log 'activeApp: ', activeApp, activeWin.getHwnd(), activeWin.getTitle()
    else
        activeApp = childp.execSync "#{__dirname}/../bin/appswitch -P"
        
    if win?
        if appName?
            win.webContents.send 'currentApp', appName 
        else
            win.webContents.send 'clearSearch'            
    else
        createWindow()

activateApp = ->
            
    if slash.win()
        log "activate: #{activeApp} #{activeWin?.getHwnd()} #{activeWin?.getTitle()}"
        winctl = require 'winctl'
        activeWin?.showWindow winctl.WindowStates.SHOW
        activeWin?.setForegroundWindow()
        win?.hide()
    else
        
        if not activeApp?
            win?.hide()
        else        
            childp.exec "#{__dirname}/../bin/appswitch -fp #{activeApp}", (err) -> win?.hide()

activeWinApp = ->
    
    activeWin = require 'active-win'
    winInfo = activeWin.sync()

    if winInfo?.owner?
        return slash.base winInfo.owner.name
    return null
    
#000   000  000  000   000  0000000     0000000   000   000
#000 0 000  000  0000  000  000   000  000   000  000 0 000
#000000000  000  000 0 000  000   000  000   000  000000000
#000   000  000  000  0000  000   000  000   000  000   000
#00     00  000  000   000  0000000     0000000   00     00

toggleWindow = ->
    
    if win?.isVisible()
        activateApp()
    else
        if slash.win()
            if not win?
                createWindow()
            else
                getActiveApp()
                win.show()
                win.focus()
        else
            script = osascript """
            tell application "System Events"
                set n to name of first application process whose frontmost is true
            end tell
            do shell script "echo " & n
            """
            name = childp.execSync "osascript #{script}"
            appName = String(name).trim()
            
            if not win?
                createWindow()
            else
                getActiveApp()
                win.show()
                win.focus()            

reloadWindow = -> win.webContents.reloadIgnoringCache()

showWindow = -> getActiveApp()
    
createWindow = ->
    
    return if win?
    
    win = new BrowserWindow
        width:           300
        height:          300
        center:          true
        alwaysOnTop:     true
        movable:         true
        resizable:       true
        backgroundColor: '#181818'
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
        win.show()
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
    about 
        img:        "#{__dirname}/../img/about.png"
        color:      "#ddd"
        highlight:  "#000"
        background: "#fff"
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
    
    if slash.win()
        findExes()
    else
        findScripts()
        findApps()
    
sortKeys = ->
    
    allKeys = Object.keys(apps).concat Object.keys(scripts)
    allKeys.sort (a,b) -> a.toLowerCase().localeCompare b.toLowerCase() 

# 00000000  000  000   000  0000000          00000000  000   000  00000000   0000000  
# 000       000  0000  000  000   000        000        000 000   000       000       
# 000000    000  000 0 000  000   000        0000000     00000    0000000   0000000   
# 000       000  000  0000  000   000        000        000 000   000            000  
# 000       000  000   000  0000000          00000000  000   000  00000000  0000000   

findExes = ->
    
    apps['cmd']      = "C:/Windows/System32/cmd.exe"
    apps['calc']     = "C:/Windows/System32/calc.exe"
    apps['regedit']  = "C:/Windows/regedit.exe"
    apps['explorer'] = "C:/Windows/explorer.exe"
    
    exeFolders  = [ "C:/Program Files", "C:/Program Files (x86)", "C:/Users/kodi/s" ]
    exeFolders  = exeFolders.concat prefs.get 'dirs', []
    foldersLeft = exeFolders.length
    
    for exeFolder in exeFolders
        walkOpt = prefs.get 'walk', no_recurse: false, max_depth: 3 
        walk = walkdir slash.resolve(exeFolder), walkOpt
        
        walk.on 'error', (err) -> log "[ERROR] findExes -- #{err}"
        
        walk.on 'end', -> 
            
            foldersLeft -= 1 
            if foldersLeft == 0
                sortKeys()
                # doSearch ''
                # log 'app search done', apps
                
        walk.on 'file', (file) -> 
            
            if slash.ext(file) == 'exe'
                name = slash.base file
                apps[name] = file
                
                iconPath = "#{iconDir}/#{name}.png"

                return if slash.isFile iconPath
                
                { getIconForPath, ICON_SIZE_LARGE, ICON_SIZE_MEDIUM } = require 'system-icon'
                    
                # log 'file:', file
                
                getIconForPath file, ICON_SIZE_LARGE, (err, result) ->
                    if not err?
                        fs.writeFileSync iconPath, result
                    else
                        getIconForPath file, ICON_SIZE_MEDIUM, (err, result) ->
                            if not err?
                                # log 'medium', file
                                fs.writeFileSync iconPath, result
                            else 
                                # log "extract", file
                                extractIcon = require 'win-icon-extractor'
                                extractIcon(file).then (result) ->
                                    result = result.slice 'data:image/png;base64,'.length
                                    try
                                        fs.writeFileSync iconPath, result, encoding: 'base64'
                                    catch err
                                        log "write icon #{iconPath} failed"
                                                        
# 00000000  000  000   000  0000000           0000000   0000000  00000000   000  00000000   000000000   0000000  
# 000       000  0000  000  000   000        000       000       000   000  000  000   000     000     000       
# 000000    000  000 0 000  000   000        0000000   000       0000000    000  00000000      000     0000000   
# 000       000  000  0000  000   000             000  000       000   000  000  000           000          000  
# 000       000  000   000  0000000          0000000    0000000  000   000  000  000           000     0000000   

findScripts = () ->
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
    
# 00000000  000  000   000  0000000           0000000   00000000   00000000    0000000  
# 000       000  0000  000  000   000        000   000  000   000  000   000  000       
# 000000    000  000 0 000  000   000        000000000  00000000   00000000   0000000   
# 000       000  000  0000  000   000        000   000  000        000             000  
# 000       000  000   000  0000000          000   000  000        000        0000000   

findApps = ->
    
    apps['Finder'] = "/System/Library/CoreServices/Finder.app"
    appFolders = [
        "/Applications"
        "/Applications/Utilities"
        ]
    appFolders = appFolders.concat prefs.get 'dirs', []
    foldersLeft = appFolders.length
    
    for appFolder in appFolders
        walkOpt = prefs.get 'walk', no_recurse: true
        walk = walkdir slash.resolve(appFolder), walkOpt
        walk.on 'error', (err) -> log "[ERROR] findApps -- #{err}"
        walk.on 'end', -> 
            foldersLeft -= 1 
            if foldersLeft == 0
                sortKeys()
                # doSearch ''
        walk.on 'directory', (dir) -> 
            if slash.ext(dir) == 'app'
                name = slash.base dir
                apps[name] = dir
    
    