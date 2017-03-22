# 000   000   0000000   00000000   00000000    0000000   
# 000  000   000   000  000   000  000   000  000   000  
# 0000000    000000000  00000000   00000000   000   000  
# 000  000   000   000  000        000        000   000  
# 000   000  000   000  000        000         0000000   
{
encodePath,
childIndex,
setStyle,
resolve,
clamp,
last,
sw,
$}          = require './tools/tools'
appIcon     = require './tools/appicon'
keyinfo     = require './tools/keyinfo'
prefs       = require './tools/prefs'
elem        = require './tools/elem'
log         = require './tools/log'
pkg         = require '../package.json'
_           = require 'lodash'
childp      = require 'child_process'
fs          = require 'fs-extra'
walkdir     = require 'walkdir'
fuzzy       = require 'fuzzy'
fuzzaldrin  = require 'fuzzaldrin'
path        = require 'path'
electron    = require 'electron'
clipboard   = electron.clipboard
browser     = electron.remote.BrowserWindow
ipc         = electron.ipcRenderer
win         = electron.remote.getCurrentWindow()
iconDir     = null
fuzzied     = []
apps        = {}
search      = ''
currentApp  = ''
current     = 0

# 000   000  000  000   000  00     00   0000000   000  000   000  
# 000 0 000  000  0000  000  000   000  000   000  000  0000  000  
# 000000000  000  000 0 000  000000000  000000000  000  000 0 000  
# 000   000  000  000  0000  000 0 000  000   000  000  000  0000  
# 00     00  000  000   000  000   000  000   000  000  000   000  

winMain = () ->
    
    window.win = win

    ipc.on 'clearSearch', clearSearch

    iconDir = resolve "#{__dirname}/../icons"
    fs.ensureDirSync iconDir

    prefs.init()
    setScheme prefs.get 'scheme', 'dark.css'
    findApps()

# 00000000  000  000   000  0000000     0000000   00000000   00000000    0000000  
# 000       000  0000  000  000   000  000   000  000   000  000   000  000       
# 000000    000  000 0 000  000   000  000000000  00000000   00000000   0000000   
# 000       000  000  0000  000   000  000   000  000        000             000  
# 000       000  000   000  0000000    000   000  000        000        0000000   

findApps = ->
    apps['Finder'] = "/System/Library/CoreServices/Finder.app"
    appFolders = [
        "/Applications"
        "/Applications/Utilities"
        ]
    foldersLeft = appFolders.length
    
    for appFolder in appFolders

        walk = walkdir resolve(appFolder), no_recurse: true
        walk.on 'error', (err) -> log "[ERROR] #{err}"
        walk.on 'end', -> 
            foldersLeft -= 1 
            if foldersLeft == 0
                doSearch ''
        walk.on 'directory', (dir) -> 
            if path.extname(dir) == '.app'
                name = path.basename dir, '.app'
                apps[name] = dir 
   
#  0000000   00000000   00000000  000   000  
# 000   000  000   000  000       0000  000  
# 000   000  00000000   0000000   000 0 000  
# 000   000  000        000       000  0000  
#  0000000   000        00000000  000   000  
 
openCurrent = -> 
    childp.exec "open -a \"#{apps[currentApp]}\"", (err) -> 
        if err?
            log "[ERROR] can't open #{apps[currentApp]}"
        # else
            # appName = path.basename currentApp, '.app'
            # childp.exec "#{__dirname}/../bin/appswitch -fa \"#{appName}\"", (err) ->
                # if err? then log "[ERROR] can't appswitch to #{appName}"

# 0000000   00000000   00000000   000   0000000   0000000   000   000
#000   000  000   000  000   000  000  000       000   000  0000  000
#000000000  00000000   00000000   000  000       000   000  000 0 000
#000   000  000        000        000  000       000   000  000  0000
#000   000  000        000        000   0000000   0000000   000   000
        
getAppIcon = (appName) ->
    iconPath = "#{iconDir}/#{appName}.png"
    appIcon.get 
        appPath: apps[appName]
        iconDir: iconDir 
        size:    512
        cb: (iconPath) ->
            img =$ 'appicon'
            img.style.backgroundImage = "url(file://#{encodePath iconPath})"

#  0000000  00000000  000      00000000   0000000  000000000  
# 000       000       000      000       000          000     
# 0000000   0000000   000      0000000   000          000     
#      000  000       000      000       000          000     
# 0000000   00000000  0000000  00000000   0000000     000     

select = (index) =>
    current = (index + fuzzied.length) % fuzzied.length
    currentApp = fuzzied[current].original
    $('appname').innerHTML = fuzzied[current].string
    $('.current')?.classList.remove 'current'
    $("dot_#{current}")?.classList.add 'current'
    getAppIcon currentApp

#   0000000     0000000   000000000   0000000  
#   000   000  000   000     000     000       
#   000   000  000   000     000     0000000   
#   000   000  000   000     000          000  
#   0000000     0000000      000     0000000   

showDots = ->
    
    dots =$ 'appdots'
    dots.innerHTML = ''
    
    winWidth = sw()
    setStyle '#appname', 'font-size', "#{parseInt 10+2*(winWidth-100)/100}px"
    
    return if fuzzied.length < 2
    
    dotr = elem id:'appdotr'
    dots.appendChild dotr
    
    s = winWidth / fuzzied.length
    s = clamp 1, winWidth/100, s
    setStyle '.appdot', 'width', "#{s}px"
    setStyle '.appdot', 'height', "#{s}px"
    
    for i in [0...fuzzied.length]
        dot = elem 'span', class:'appdot', id: "dot_#{i}"
        if i == current
            dot.classList.add 'current'
        dotr.appendChild dot

#  0000000  00000000   0000000   00000000    0000000  000   000  
# 000       000       000   000  000   000  000       000   000  
# 0000000   0000000   000000000  0000000    000       000000000  
#      000  000       000   000  000   000  000       000   000  
# 0000000   00000000  000   000  000   000   0000000  000   000  

doSearch = (s) ->
    search = s
    appNames = Object.keys apps
    fuzzied = fuzzy.filter search, appNames, pre: '<b>', post: '</b>'
    fuzzied = _.sortBy fuzzied, (o) -> 2 - fuzzaldrin.score o.original, search
                
    if fuzzied.length
        select 0
        showDots()
    else
        $('appdots').innerHTML = ''
        $('appname').innerHTML = "<b>#{search}</b>"

complete  = (key) -> doSearch search + key
backspace =       -> doSearch search.substr 0, search.length-1

cancelSearchOrClose = -> if search.length then doSearch '' else ipc.send 'cancel'
clearSearch = ->
    if fuzzied.length
        search = ''
        fuzzied = [fuzzied[Math.min current, fuzzied.length-1]]
        fuzzied[0].string = currentApp
        $('appname').innerHTML = currentApp
        current = 0
        showDots()
    else
        doSearch ''
        
window.onclick  = -> openCurrent()
window.onunload = -> document.onkeydown = null    
window.onblur   = -> win.hide()
window.onresize = -> showDots()

#  0000000  000  0000000  00000000  
# 000       000     000   000       
# 0000000   000    000    0000000   
#      000  000   000     000       
# 0000000   000  0000000  00000000  

screenSize = -> electron.screen.getPrimaryDisplay().workAreaSize

clampBounds = (b) ->
    b.width = clamp 200, 600, b.width
    b.height = clamp 200, 600, b.height
    b.x = clamp 0, screenSize().width - b.width, b.x
    b.y = clamp 0, screenSize().height - b.height, b.y
    b

sizeWindow = (d) -> 
    b = win.getBounds() 
    cx = b.x + b.width/2
    b.width+=d 
    b.height+=d 
    clampBounds b
    b.x = cx - b.width/2
    win.setBounds clampBounds b
    
moveWindow = (dx,dy) -> 
    b = win.getBounds()
    b.x+=dx
    b.y+=dy
    win.setBounds clampBounds b
    
biggerWindow     = -> sizeWindow 50
smallerWindow    = -> sizeWindow -50
minimizeWindow   = -> win.setBounds x:screenSize().width/2-100, y:0, width:200, height:200
maximizeWindow   = -> win.setBounds x:screenSize().width/2-300, y:0, width:600, height:600
toggleWindowSize = -> if win.getBounds().width > 200 then minimizeWindow() else maximizeWindow()

#  0000000   0000000  000   000  00000000  00     00  00000000  
# 000       000       000   000  000       000   000  000       
# 0000000   000       000000000  0000000   000000000  0000000   
#      000  000       000   000  000       000 0 000  000       
# 0000000    0000000  000   000  00000000  000   000  00000000  

toggleScheme = ->
    link =$ 'style-link' 
    currentScheme = last link.href.split('/')
    schemes = ['dark.css', 'bright.css']
    nextSchemeIndex = ( schemes.indexOf(currentScheme) + 1) % schemes.length
    nextScheme = schemes[nextSchemeIndex]
    ipc.send 'setScheme', path.basename nextScheme, '.css'
    prefs.set 'scheme', nextScheme
    setScheme nextScheme
    
setScheme = (scheme) ->
    link =$ 'style-link' 
    newlink = elem 'link', 
        rel:  'stylesheet'
        type: 'text/css'
        href: 'css/'+scheme
        id:   'style-link'
    link.parentNode.replaceChild newlink, link

# 000   000  00000000  000   000
# 000  000   000        000 000 
# 0000000    0000000     00000  
# 000  000   000          000   
# 000   000  00000000     000   

document.onkeydown = (event) ->
    {mod, key, combo} = keyinfo.forEvent event
    if mod in ['', 'shift'] and key.length == 1
        complete key
        return
    switch combo
        when 'backspace'         then backspace()
        when 'command+backspace' then doSearch ''
        when 'command+i'         then toggleScheme()
        when 'esc'               then cancelSearchOrClose()
        when 'down', 'right'     then select current+1
        when 'up'  , 'left'      then select current-1
        when 'enter'             then openCurrent()
        when 'command+alt+i'     then win.webContents.openDevTools()
        when 'command+='         then biggerWindow()
        when 'command+-'         then smallerWindow()
        when 'command+up'        then moveWindow 0,-20
        when 'command+down'      then moveWindow 0, 20
        when 'command+left'      then moveWindow -20, 0
        when 'command+right'     then moveWindow  20, 0
        when 'command+0'         then toggleWindowSize()

winMain()

