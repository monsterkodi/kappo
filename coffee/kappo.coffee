###
000   000   0000000   00000000   00000000    0000000
000  000   000   000  000   000  000   000  000   000
0000000    000000000  00000000   00000000   000   000
000  000   000   000  000        000        000   000
000   000  000   000  000        000         0000000
###

{ childIndex, setStyle, keyinfo, history, valid, empty, childp,
  scheme, clamp, prefs, post, elem, fs, slash, log, error, pos, sw, $, _ } = require 'kxk'

pkg          = require '../package.json'
fuzzy        = require 'fuzzy'
fuzzaldrin   = require 'fuzzaldrin'
electron     = require 'electron'

clipboard    = electron.clipboard
browser      = electron.remote.BrowserWindow
ipc          = electron.ipcRenderer
win          = electron.remote.getCurrentWindow()
iconDir      = slash.resolve "#{electron.remote.app.getPath('userData')}/icons"

appHist      = null
results      = []
apps         = {}
scripts      = {}
allKeys      = []
search       = ''
currentName  = ''
current      = 0

post.on 'slog', (text) ->

    console.log 'slog', text
    post.toMain 'winlog', text

# 000   000  000  000   000  00     00   0000000   000  000   000
# 000 0 000  000  0000  000  000   000  000   000  000  0000  000
# 000000000  000  000 0 000  000000000  000000000  000  000 0 000
# 000   000  000  000  0000  000 0 000  000   000  000  000  0000
# 00     00  000  000   000  000   000  000   000  000  000   000

winMain = () ->

    window.win = win

    ipc.on 'clearSearch', clearSearch
    ipc.on 'currentApp',  currentApp

    prefs.init()

    { apps, scripts, allKeys } = post.get 'apps'

    # log 'winMain', allKeys

    appHist = new history
        list:      prefs.get 'history', []
        maxLength: prefs.get 'maxHistoryLength', 10

    scheme.set prefs.get 'scheme', 'bright'

#  0000000   00000000   00000000  000   000
# 000   000  000   000  000       0000  000
# 000   000  00000000   0000000   000 0 000
# 000   000  000        000       000  0000
#  0000000   000        00000000  000   000

openCurrent = ->

    if current > 0 and search.length
        prefs.set "search:#{search}:#{currentName}", 1 + prefs.get "search:#{search}:#{currentName}", 0

    if currentIsApp()

        appHist.add currentName
        prefs.set 'history', appHist.list
        
        if slash.win()

            launch = require './winlaunch'
             
            if launch apps[currentName]
                win.hide()

        else
            childp.exec "open -a \"#{apps[currentName]}\"", (err) ->
                if err? then log "[ERROR] can't open #{apps[currentName]} #{err}"
                
    else if scripts[currentName]?
        
        if scripts[currentName].foreground?
            
            appHist.add currentName
            prefs.set 'history', appHist.list
            
            if slash.win()
                { foreground } = require 'wxw'
                if not empty foreground scripts[currentName].foreground
                    win.hide()
                    return
        
        if scripts[currentName].exec?
            
            childp.exec scripts[currentName].exec, (err) ->
                if err? then log "[ERROR] can't execute script #{scripts[currentName]}: #{err}"
                
        else
            post.toMain 'runScript', currentName
            win.hide()

blacklist = ->

    ignore = prefs.get 'ignore', []
    
    _.pull ignore, apps[currentName]
    ignore.push    apps[currentName]
    
    prefs.set 'ignore', ignore
    
    delete apps[currentName]
    
    results.splice current, 1
    
    select current

#  0000000  000   000  00000000   00000000   00000000  000   000  000000000
# 000       000   000  000   000  000   000  000       0000  000     000
# 000       000   000  0000000    0000000    0000000   000 0 000     000
# 000       000   000  000   000  000   000  000       000  0000     000
#  0000000   0000000   000   000  000   000  00000000  000   000     000

currentApp = (e, appName) ->

    # log 'currentApp appName:', appName, 'currentName:', currentName

    lastMatches = currentName.toLowerCase() == appName.toLowerCase()
    scriptMatches = scripts[currentName]?.foreground? and slash.base(scripts[currentName].foreground).toLowerCase() == appName.toLowerCase()
        
    if (lastMatches or scriptMatches) and appHist.previous()
        doSearch appHist.previous()
        search = ''
    else
        name = currentName
        doSearch ''
        selectName name if not empty name
        search = ''
        $('appname').innerHTML = name

currentIsApp = => not currentIsScript()
currentIsScript = -> results[current]?.script?

# 000   000  000   0000000  000000000   0000000   00000000   000   000
# 000   000  000  000          000     000   000  000   000   000 000
# 000000000  000  0000000      000     000   000  0000000      00000
# 000   000  000       000     000     000   000  000   000     000
# 000   000  000  0000000      000      0000000   000   000     000

listHistory = () ->
    results = []
    for h in appHist.list
        results.push string: h, name: h
    select results.length-1
    showDots()

openInFinder = () ->
    childp.spawn 'osascript', [
        '-e', 'tell application "Finder"',
        '-e', "reveal POSIX file \"#{apps[currentName]}\"",
        '-e', 'activate',
        '-e', 'end tell']

#  0000000  000      00000000   0000000   00000000
# 000       000      000       000   000  000   000
# 000       000      0000000   000000000  0000000
# 000       000      000       000   000  000   000
#  0000000  0000000  00000000  000   000  000   000

clearSearch = ->

    log 'clearSearch'

    if results.length
        search = ''
        results = [results[Math.min current, results.length-1]]
        results[0].string = currentName
        $('appname').innerHTML = currentName
        current = 0
        showDots()
    else
        doSearch ''
    win.show()

# 000   0000000   0000000   000   000
# 000  000       000   000  0000  000
# 000  000       000   000  000 0 000
# 000  000       000   000  000  0000
# 000   0000000   0000000   000   000

getScriptIcon = (scriptName) -> setIcon scripts[scriptName].img

getAppIcon = (appName) ->

    if slash.win()
        appIcon = require './exeicon'
    else
        appIcon = require './appicon'

    appIcon.get
        appPath: apps[appName]
        iconDir: iconDir
        size:    512
        cb:      setIcon

setIcon = (iconPath) ->

    $('appicon').style.backgroundImage = "url(#{slash.fileUrl iconPath})"

#  0000000  00000000  000      00000000   0000000  000000000
# 000       000       000      000       000          000
# 0000000   0000000   000      0000000   000          000
#      000  000       000      000       000          000
# 0000000   00000000  0000000  00000000   0000000     000

select = (index) =>
    # log 'select', index
    current = (index + results.length) % results.length
    if not results[current]?
        log 'dafuk? index:', index, 'results:', results
    currentName = results[current].name
    $('appname').innerHTML = results[current].string
    $('.current')?.classList.remove 'current'
    $("dot_#{current}")?.classList.add 'current'
    if currentIsApp()
        getAppIcon currentName
    else
        getScriptIcon currentName

selectName = (name) ->
    # log 'selectName', name
    select results.findIndex (r) ->
        r.name.toLowerCase() == name.toLowerCase()

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

    return if results.length < 2

    dotr = elem id:'appdotr'
    dots.appendChild dotr

    s = winWidth / results.length
    s = clamp 1, winWidth/100, s
    s = parseInt s
    setStyle '.appdot', 'width', "#{s}px"
    setStyle '.appdot', 'height', "#{s}px"

    for i in [0...results.length]
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
    
    search  = s
    names   = allKeys
    fuzzied = fuzzy.filter search, names, pre: '<b>', post: '</b>'
    fuzzied = _.sortBy fuzzied, (o) -> 2 - fuzzaldrin.score o.original, search

    if search.length
        if ps = prefs.get "search:#{search}"
            fuzzied = _.sortBy fuzzied, (o) -> Number.MAX_SAFE_INTEGER - (ps[o.original] ? 0)

    results = []
    for f in fuzzied
        r = name: f.original, string: f.string
        r.script = scripts[r.name] if scripts[r.name]
        results.push r

    if results.length
        if s == ''
            if slash.win()
                selectName 'explorer'
            else
                selectName 'Finder'
        else
            select 0
        showDots()
    else
        $('appdots').innerHTML = ''
        $('appname').innerHTML = "<b>#{search}</b>"

complete  = (key) -> doSearch search + key
backspace =       -> doSearch search.substr 0, search.length-1

cancelSearchOrClose = ->
    if search.length
        doSearch ''
    else
        ipc.send 'cancel'

clickID = downID = 0
window.onmousedown = (e) -> clickID += 1 ; downID = clickID
window.onmouseup = (e) -> openCurrent() if downID == clickID
window.onmousemove = (e) -> if e.buttons then downID = -1
window.onunload = -> document.onkeydown = null
window.onblur   = -> win.hide()
window.onresize = -> showDots()

wheelAccu = 0
window.onwheel  = (event) ->
    wheelAccu += (event.deltaX + event.deltaY)/44
    if wheelAccu > 1
        select current+1 % results.length
        wheelAccu -= 1
    else if wheelAccu < -1
        select current+results.length-1 % results.length
        wheelAccu += 1

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

# 000   000  00000000  000   000
# 000  000   000        000 000
# 0000000    0000000     00000
# 000  000   000          000
# 000   000  00000000     000

document.onkeydown = (event) ->

    { mod, key, combo, char } = keyinfo.forEvent event

    if char? and combo.length == 1
        complete key
        return

    # log 'combo', combo

    switch combo
        when 'delete'                                       then blacklist()
        when 'backspace'                                    then backspace()
        when 'command+backspace',       'ctrl+backspace'    then doSearch ''
        when 'command+i', 'ctrl+i'                          then scheme.toggle()
        when 'esc'                                          then cancelSearchOrClose()
        when 'down', 'right'                                then select current+1
        when 'up'  , 'left'                                 then select current-1
        when 'enter'                                        then openCurrent()
        when 'command+alt+i',           'ctrl+alt+i'        then win.webContents.openDevTools()
        when 'command+=',               'ctrl+='            then biggerWindow()
        when 'command+-',               'ctrl+-'            then smallerWindow()
        when 'command+r',               'ctrl+r'            then findApps()
        when 'command+h',               'ctrl+h'            then listHistory()
        when 'command+f',               'ctrl+f'            then openInFinder()
        when 'command+up',              'ctrl+up'           then moveWindow 0,-20
        when 'command+down',            'ctrl+down'         then moveWindow 0, 20
        when 'command+left',            'ctrl+left'         then moveWindow -20, 0
        when 'command+right',           'ctrl+right'        then moveWindow  20, 0
        when 'command+0','command+o',   'ctrl+0','ctrl+o'   then toggleWindowSize()

winMain()

