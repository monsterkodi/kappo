###
000   000   0000000   00000000   00000000    0000000
000  000   000   000  000   000  000   000  000   000
0000000    000000000  00000000   00000000   000   000
000  000   000   000  000        000        000   000
000   000  000   000  000        000         0000000
###

{ post, args, srcmap, childIndex, setStyle, stopEvent, keyinfo, history, valid, empty, childp,
  scheme, clamp, prefs, elem, fs, slash, open, klog, kerror, kpos, sw, $, _ } = require 'kxk'

pkg          = require '../package.json'
fuzzy        = require 'fuzzy'
fuzzaldrin   = require 'fuzzaldrin'
electron     = require 'electron'

clipboard    = electron.clipboard
browser      = electron.remote.BrowserWindow
win          = electron.remote.getCurrentWindow()
iconDir      = slash.resolve "#{electron.remote.app.getPath('userData')}/icons"
ipc          = electron.ipcRenderer
    
appHist      = null
results      = []
apps         = {}
scripts      = {}
allKeys      = []
search       = ''
currentName  = ''
currentIndex = 0

post.on 'mainlog', (text) -> log ">>> " + text
post.on 'appsFound', -> { apps, scripts, allKeys } = post.get 'apps'

# 000   000  000  000   000  00     00   0000000   000  000   000
# 000 0 000  000  0000  000  000   000  000   000  000  0000  000
# 000000000  000  000 0 000  000000000  000000000  000  000 0 000
# 000   000  000  000  0000  000 0 000  000   000  000  000  0000
# 00     00  000  000   000  000   000  000   000  000  000   000

winMain = ->

    window.onerror = (msg, source, line, col, err) ->
        srcmap.logErr err
        true
    
    klog.slog.icon = slash.fileUrl slash.join __dirname, '..', 'img', 'menu@2x.png'
    
    window.win = win

    post.on 'fade', ->
        
        if not slash.win()
            win.show()
            return
            
        [x,y] = win.getPosition()     # enable smooth fade on windows:
        win.setPosition -10000,-10000 # move window offscreen before show
        win.show()
        $('#main').classList.remove 'fade'
        $('#main').style.opacity = 0
        
        restore = -> 
            
            if x < -10 or y < -10 # key repeat hickup 'fix'
                b = win.getBounds()
                x = (screenSize().width - b.width)/2
                y = 0
            else
                win.setPosition x,y
                
            $('#main').classList.add 'fade'
            
        setTimeout restore, 30 # give windows some time to do it's flickering
        
    prefs.init()

    { apps, scripts, allKeys } = post.get 'apps'

    appHist = new history
        list:      prefs.get 'history', []
        maxLength: prefs.get 'maxHistoryLength', 10

    scheme.set prefs.get 'scheme', 'bright'
    
winHide = -> 
    
    if not args.debug
        win.hide()
    
#  0000000   00000000   00000000  000   000
# 000   000  000   000  000       0000  000
# 000   000  00000000   0000000   000 0 000
# 000   000  000        000       000  0000
#  0000000   000        00000000  000   000

openCurrent = ->

    ipc.send 'closeAbout'
    
    if currentIndex > 0 and search.length
        prefs.set "search:#{search}:#{currentName}", 1 + prefs.get "search:#{search}:#{currentName}", 0

    if currentIsApp()

        addToHistory()
        
        if slash.win()

            wxw = require 'wxw'
            wxw 'launch' apps[currentName]
            winHide()

        else
            childp.exec "open -a \"#{apps[currentName]}\"", (err) ->
                if err? then log "[ERROR] can't open #{apps[currentName]} #{err}"
                
    else if scripts[currentName]?
        
        if scripts[currentName].foreground?
            
            exe = slash.file scripts[currentName].foreground
            klog 'exe'
            addToHistory()
            
            if slash.win()
                wxw = require 'wxw'
                info = wxw('info' exe)?[0]
                if info
                    winHide()
                    wxw 'show'  exe
                    wxw 'raise' exe
                    wxw 'focus' exe
                    return
        
        if scripts[currentName].exec?
            
            childp.exec scripts[currentName].exec, (err) ->
                if err? then log "[ERROR] can't execute script #{scripts[currentName]}: #{err}"
                
        else
            post.toMain 'runScript', currentName
            winHide()

post.on 'openCurrent',  openCurrent

#  0000000  000   000  00000000   00000000   00000000  000   000  000000000
# 000       000   000  000   000  000   000  000       0000  000     000
# 000       000   000  0000000    0000000    0000000   000 0 000     000
# 000       000   000  000   000  000   000  000       000  0000     000
#  0000000   0000000   000   000  000   000  00000000  000   000     000

currentApp = (appName) ->

    currentName   = 'kappo' if empty currentName
    appName       = 'kappo' if empty appName
    lastMatches   = currentName.toLowerCase() == appName.toLowerCase()
    scriptMatches = scripts[currentName]?.foreground? and slash.base(scripts[currentName].foreground).toLowerCase() == appName.toLowerCase()
        
    if (lastMatches or scriptMatches) and appHist.previous() and prefs.get 'appToggle', true
        listHistory 1
        search = ''
    else
        name = currentName
        doSearch ''
        selectName name if not empty name
        search = ''
        $('appname').innerHTML = name
        
    $('#main').classList.add 'fade'

post.on 'currentApp', currentApp

currentIsApp = => not currentIsScript()
currentIsScript = -> results[currentIndex]?.script?

# 000000000   0000000    0000000    0000000   000      00000000  
#    000     000   000  000        000        000      000       
#    000     000   000  000  0000  000  0000  000      0000000   
#    000     000   000  000   000  000   000  000      000       
#    000      0000000    0000000    0000000   0000000  00000000  

toggleAppToggle = ->
    
    prefs.set 'appToggle', not prefs.get 'appToggle', true
    
toggleDoubleActivation = ->

    prefs.set 'hideOnDoubleActivation', not prefs.get 'hideOnDoubleActivation', false
    
# 000   000  000   0000000  000000000   0000000   00000000   000   000
# 000   000  000  000          000     000   000  000   000   000 000
# 000000000  000  0000000      000     000   000  0000000      00000
# 000   000  000       000     000     000   000  000   000     000
# 000   000  000  0000000      000      0000000   000   000     000

listHistory = (offset=0) ->
    
    results = []
    if valid appHist
        for h in appHist.list
            result = _.clone h
            result.string ?= result.name
            results.push result
    index = results.length - 1 - offset
    select index
    showDots()

addToHistory = ->
    
    return if empty results[currentIndex]
    
    result = _.clone results[currentIndex]
    delete result.string
    appHist.add result
    prefs.set 'history', appHist.list
    
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

    if results.length
        search = ''
        results = [results[Math.min currentIndex, results.length-1]]
        results[0].string = currentName
        $('appname').innerHTML = currentName
        currentIndex = 0
        showDots()
    else
        doSearch ''

post.on 'clearSearch',  clearSearch

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
    
    $('appicon').style.backgroundImage = "url(\"#{slash.fileUrl iconPath}\")"

#  0000000  00000000  000      00000000   0000000  000000000
# 000       000       000      000       000          000
# 0000000   0000000   000      0000000   000          000
#      000  000       000      000       000          000
# 0000000   00000000  0000000  00000000   0000000     000

select = (index) =>
    currentIndex = (index + results.length) % results.length
    if empty results[currentIndex]
        log 'dafuk? index:', index, 'results:', results
        return
    currentName = results[currentIndex].name
    $('appname').innerHTML = results[currentIndex].string
    $('.current')?.classList.remove 'current'
    $("dot_#{currentIndex}")?.classList.add 'current'
    if currentIsApp()
        getAppIcon currentName
    else
        getScriptIcon currentName

selectName = (name) ->
    
    return if empty name
    select results.findIndex (r) ->
        r?.name.toLowerCase() == name.toLowerCase()

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
        if i == currentIndex
            dot.classList.add 'current'
        dotr.appendChild dot

# 0000000    000       0000000    0000000  000   000  000      000   0000000  000000000  
# 000   000  000      000   000  000       000  000   000      000  000          000     
# 0000000    000      000000000  000       0000000    000      000  0000000      000     
# 000   000  000      000   000  000       000  000   000      000       000     000     
# 0000000    0000000  000   000   0000000  000   000  0000000  000  0000000      000     

blacklist = ->

    ignore = prefs.get 'ignore', []
    
    _.pull ignore, apps[currentName]
    _.pull ignore, null
    if valid apps[currentName]
        ignore.push apps[currentName]
    else
        log "can't ignore '#{currentName}'"
    
    prefs.set 'ignore', ignore
    
    delete apps[currentName]
    
    results.splice currentIndex, 1
    
    select currentIndex
    
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

    if valid results
        if s == ''
            if slash.win()
                selectName 'terminal'
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
    
    ipc.send 'closeAbout'
    
    if search.length
        doSearch ''
    else
        post.toMain 'cancel'

clickID = downID = 0
window.onmousedown  = (e) -> clickID += 1 ; downID = clickID
window.onmouseup    = (e) -> openCurrent() if downID == clickID
window.onmousemove  = (e) -> if e.buttons then downID = -1
window.onunload = -> document.onkeydown = null
window.onblur   = -> winHide()
window.onresize = -> showDots()

wheelAccu = 0
window.onwheel  = (event) ->
    wheelAccu += (event.deltaX + event.deltaY)/44
    if wheelAccu > 1
        select currentIndex+1 % results.length
        while wheelAccu > 1
            wheelAccu -= 1
    else if wheelAccu < -1
        select currentIndex+results.length-1 % results.length
        while wheelAccu < -1
            wheelAccu += 1

#  0000000  000  0000000  00000000
# 000       000     000   000
# 0000000   000    000    0000000
#      000  000   000     000
# 0000000   000  0000000  00000000

screenSize = -> electron.remote.screen.getPrimaryDisplay().workAreaSize

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

preventKeyRepeat = -> log 'keyRepeat ahead!'

# 000   000  00000000  000   000
# 000  000   000        000 000
# 0000000    0000000     00000
# 000  000   000          000
# 000   000  00000000     000

document.onkeydown = (event) ->

    { mod, key, combo, char } = keyinfo.forEvent event

    log combo if args.verbose
    
    if char? and combo.length == 1
        complete key
        return

    switch combo
        when 'f1'                                           then preventKeyRepeat()
        when 'delete'                                       then blacklist()
        when 'backspace'                                    then backspace()
        when 'command+backspace',       'ctrl+backspace'    then doSearch ''
        when 'command+i', 'ctrl+i'                          then scheme.toggle()
        when 'esc'                                          then cancelSearchOrClose()
        when 'down', 'right'                                then select currentIndex+1
        when 'up'  , 'left'                                 then select currentIndex-1
        when 'enter'                                        then openCurrent()
        when 'command+alt+i',           'ctrl+alt+i'        then args.debug = true; win.webContents.openDevTools()
        when 'command+=',               'ctrl+='            then biggerWindow()
        when 'command+-',               'ctrl+-'            then smallerWindow()
        when 'command+r',               'ctrl+r'            then post.toMain 'findApps'
        when 'command+h',               'alt+h'             then listHistory()
        when 'command+f',               'ctrl+f'            then openInFinder()
        when 'command+t',               'ctrl+t'            then toggleAppToggle()
        when 'command+d',               'ctrl+d'            then toggleDoubleActivation()
        when 'command+.',               'ctrl+.'            then post.toMain 'about'
        when 'command+,',               'ctrl+,'            then open prefs.store.file
        when 'command+up',              'ctrl+up'           then moveWindow 0,-20
        when 'command+down',            'ctrl+down'         then moveWindow 0, 20
        when 'command+left',            'ctrl+left'         then moveWindow -20, 0
        when 'command+right',           'ctrl+right'        then moveWindow  20, 0
        when 'command+0','command+o',   'ctrl+0','ctrl+o'   then toggleWindowSize()

winMain()
