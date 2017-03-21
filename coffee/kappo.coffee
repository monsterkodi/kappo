# 000   000   0000000   00000000   00000000    0000000   
# 000  000   000   000  000   000  000   000  000   000  
# 0000000    000000000  00000000   00000000   000   000  
# 000  000   000   000  000        000        000   000  
# 000   000  000   000  000        000         0000000   
{
encodePath,
childIndex,
resolve,
last,
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
path        = require 'path'
electron    = require 'electron'
clipboard   = electron.clipboard
browser     = electron.remote.BrowserWindow
ipc         = electron.ipcRenderer
iconDir     = null
win         = null
apps        = {}
search      = ''
current     = 0

ipc.on 'setWinID', (event, id) -> winMain id

# 000   000  000  000   000  00     00   0000000   000  000   000  
# 000 0 000  000  0000  000  000   000  000   000  000  0000  000  
# 000000000  000  000 0 000  000000000  000000000  000  000 0 000  
# 000   000  000  000  0000  000 0 000  000   000  000  000  0000  
# 00     00  000  000   000  000   000  000   000  000  000   000  

winMain = (id) ->
    
    window.win = win = browser.fromId id 
    # win.webContents.openDevTools()
    # setTimeout win.focus, 500

    iconDir = resolve "#{__dirname}/../icons/apps"
    fs.ensureDirSync iconDir

    prefs.init "#{electron.remote.app.getPath('userData')}/#{pkg.productName}.noon"
    setScheme prefs.get 'scheme', 'dark.css'
    findApps()

# 00000000  000  000   000  0000000     0000000   00000000   00000000    0000000  
# 000       000  0000  000  000   000  000   000  000   000  000   000  000       
# 000000    000  000 0 000  000   000  000000000  00000000   00000000   0000000   
# 000       000  000  0000  000   000  000   000  000        000             000  
# 000       000  000   000  0000000    000   000  000        000        0000000   

findApps = ->
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
                apps['Finder'] = "/System/Library/CoreServices/Finder.app"
                # log apps
        walk.on 'directory', (dir) -> 
            if path.extname(dir) == '.app'
                name = path.basename dir, '.app'
                apps[name] = dir 
   
#  0000000   00000000   00000000  000   000  
# 000   000  000   000  000       0000  000  
# 000   000  00000000   0000000   000 0 000  
# 000   000  000        000       000  0000  
#  0000000   000        00000000  000   000  
 
openCurrent = () ->
    cdiv =$ '.current'
    appPath = apps[cdiv.id]
    childp.exec "open -a \"#{appPath}\"", (err) -> win?.hide()

# 0000000   00000000   00000000   000   0000000   0000000   000   000
#000   000  000   000  000   000  000  000       000   000  0000  000
#000000000  00000000   00000000   000  000       000   000  000 0 000
#000   000  000        000        000  000       000   000  000  0000
#000   000  000        000        000   0000000   0000000   000   000
        
getAppIcon = (appDiv) ->
    appName = appDiv.id
    iconPath = "#{iconDir}/#{appName}.png"
    appIcon.get 
        appPath: apps[appName]
        iconDir: iconDir 
        size:    512
        cbArg:   appDiv
        cb: (iconPath, appDiv) ->
            img = appDiv.firstChild
            img.style.backgroundImage = "url(file://#{encodePath iconPath})"
            img.style.display = ''

#  0000000   0000000   00     00  00000000   000      00000000  000000000  00000000  
# 000       000   000  000   000  000   000  000      000          000     000       
# 000       000   000  000000000  00000000   000      0000000      000     0000000   
# 000       000   000  000 0 000  000        000      000          000     000       
#  0000000   0000000   000   000  000        0000000  00000000     000     00000000  

complete = (key) -> apply search + key
backspace = -> apply search.substr 0, search.length-1
apply = (s) ->
    search = s
    appNames = Object.keys apps
    fuzzied = fuzzy.filter search, appNames, pre: '<b>', post: '</b>'
    fuzzied = _.sortBy fuzzied, (o) -> o.score
    fuzzied.reverse()
    sel =$ 'main'
    sel.innerHTML = ''
    for f in fuzzied
        tit = elem class: 'appname', html: f.string
        img = elem class: 'appicon'
        img.style.display = 'none'
        app = elem id: f.original, class: 'app', children: [img, tit]
        getAppIcon app
        sel.appendChild app
    highlight 0
    
# 000   000  000   0000000   000   000  000      000   0000000   000   000  000000000
# 000   000  000  000        000   000  000      000  000        000   000     000   
# 000000000  000  000  0000  000000000  000      000  000  0000  000000000     000   
# 000   000  000  000   000  000   000  000      000  000   000  000   000     000   
# 000   000  000   0000000   000   000  0000000  000   0000000   000   000     000   

highlight = (index) =>
    cdiv =$ '.current' 
    if cdiv? then cdiv.classList.remove 'current'
    sel =$ 'main'
    appDivs = sel.childNodes
    current = Math.max 0, Math.min index, appDivs.length-1
    appDiv = appDivs[current]
    if appDiv?
        appDiv.classList.add 'current'
        appDiv.scrollIntoViewIfNeeded()
    
window.onClick = (index) ->
    highlight index
    doCurrent()

appForElem = (elem) ->        
    if elem.classList?.contains('app') then return elem
    if elem.parentNode? then return appForElem elem.parentNode
    
$('main').addEventListener "mouseover", (event) ->
    appDiv = appForElem event.target 
    highlight childIndex appDiv if appDiv?

window.onunload = -> document.onkeydown = null

#  0000000  000000000  000   000  000      00000000  
# 000          000      000 000   000      000       
# 0000000      000       00000    000      0000000   
#      000     000        000     000      000       
# 0000000      000        000     0000000  00000000  

toggleStyle = ->
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
    if combo == key and key.length == 1
        complete key
        return
    switch combo
        when 'backspace'         then backspace()
        when 'command+backspace' then apply ''
        when 'command+i'         then toggleStyle()
        when 'esc'               then ipc.send 'done'
        when 'down', 'right'     then highlight current+1
        when 'up'  , 'left'      then highlight current-1
        when 'enter'             then openCurrent()
        when 'command+alt+i'     then win?.webContents.openDevTools()

