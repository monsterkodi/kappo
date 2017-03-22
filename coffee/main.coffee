# 00     00   0000000   000  000   000
# 000   000  000   000  000  0000  000
# 000000000  000000000  000  000 0 000
# 000 0 000  000   000  000  000  0000
# 000   000  000   000  000  000   000

{osascript}   = require './tools/tools'
prefs         = require './tools/prefs'
about         = require './tools/about'
log           = require './tools/log'
pkg           = require '../package.json'
childp        = require 'child_process'
electron      = require 'electron'
path          = require 'path'
fs            = require 'fs-extra'
_             = require 'lodash'
app           = electron.app
BrowserWindow = electron.BrowserWindow
Tray          = electron.Tray
Menu          = electron.Menu
clipboard     = electron.clipboard
ipc           = electron.ipcMain
win           = null
tray          = null
debug         = false

# 000  00000000    0000000
# 000  000   000  000     
# 000  00000000   000     
# 000  000        000     
# 000  000         0000000

ipc.on 'cancel', -> activateApp()
    
# 0000000    0000000  000000000  000  000   000  00000000
#000   000  000          000     000  000   000  000     
#000000000  000          000     000   000 000   0000000 
#000   000  000          000     000     000     000     
#000   000   0000000     000     000      0      00000000

appName = null
activeApp = null
getActiveApp = ->
    activeApp = childp.execSync "#{__dirname}/../bin/appswitch -P"
    if win?
        if appName?
            win.webContents.send 'currentApp', appName 
        else
            win.webContents.send 'clearSearch'            
    else
        createWindow()

activateApp = ->
    if not activeApp?
        win?.hide()
        return
    childp.exec "#{__dirname}/../bin/appswitch -fp #{activeApp}", (err) -> win?.hide()

#000   000  000  000   000  0000000     0000000   000   000
#000 0 000  000  0000  000  000   000  000   000  000 0 000
#000000000  000  000 0 000  000   000  000   000  000000000
#000   000  000  000  0000  000   000  000   000  000   000
#00     00  000  000   000  0000000     0000000   00     00

toggleWindow = ->
    if win?.isVisible()
        activateApp()   
    else
        win.show()
        win.focus()
        script = osascript """
        tell application "System Events"
            set n to name of first application process whose frontmost is true
        end tell
        do shell script "echo " & n
        """
        name = childp.execSync "osascript #{script}"
        appName = String(name).trim() 
        getActiveApp()

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
    win.on 'ready-to-show', -> win.show()
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
        color:      "#080808"
        background: "#282828"
    
app.on 'window-all-closed', (event) -> event.preventDefault()

#00000000   00000000   0000000   0000000    000   000
#000   000  000       000   000  000   000   000 000 
#0000000    0000000   000000000  000   000    00000  
#000   000  000       000   000  000   000     000   
#000   000  00000000  000   000  0000000       000   

app.on 'ready', -> 
    
    tray = new Tray "#{__dirname}/../img/menu.png"
    tray.on 'click', toggleWindow
    app.dock.hide() if app.dock
    
    # 00     00  00000000  000   000  000   000
    # 000   000  000       0000  000  000   000
    # 000000000  0000000   000 0 000  000   000
    # 000 0 000  000       000  0000  000   000
    # 000   000  00000000  000   000   0000000 
    
    Menu.setApplicationMenu Menu.buildFromTemplate [
        label: app.getName()
        submenu: [
            label: "About #{pkg.name}"
            accelerator: 'Command+.'
            click: -> showAbout()
        ,            
            type: 'separator'
        ,
            label: 'Quit'
            accelerator: 'Command+Q'
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
            accelerator: 'Cmd+W'
            click:       -> win?.close()
        ,
            type: 'separator'
        ,                            
            label:       'Reload Window'
            accelerator: 'Ctrl+Alt+Cmd+L'
            click:       -> reloadWindow()
        ,                
            label:       'Toggle DevTools'
            accelerator: 'Cmd+Alt+I'
            click:       -> win?.webContents.openDevTools()
        ]
    ]
        
    prefs.init shortcut: 'F1'

    electron.globalShortcut.register prefs.get('shortcut'), toggleWindow
    
    showWindow()
    