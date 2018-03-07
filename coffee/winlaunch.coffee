
# 000   000  000  000   000  000       0000000   000   000  000   000   0000000  000   000
# 000 0 000  000  0000  000  000      000   000  000   000  0000  000  000       000   000
# 000000000  000  000 0 000  000      000000000  000   000  000 0 000  000       000000000
# 000   000  000  000  0000  000      000   000  000   000  000  0000  000       000   000
# 00     00  000  000   000  0000000  000   000   0000000   000   000   0000000  000   000

{ slash, childp, empty, error, log } = require 'kxk'

winList = require './winlist'
ffi = require 'ffi'

user = new ffi.Library 'user32',
    SetForegroundWindow:      ['int',  ['pointer']]
    SetActiveWindow:          ['int',  ['pointer']]
    BringWindowToTop:         ['int',  ['pointer']]
    ShowWindow:               ['int',  ['pointer', 'uint32']]
    SwitchToThisWindow:       ['void', ['pointer', 'int']]
    GetForegroundWindow:      ['pointer', []]
    GetWindowThreadProcessId: ['uint32', ['pointer', 'pointer']]
    AttachThreadInput:        ['int', ['uint32', 'uint32', 'int']]
    SetWindowPos:             ['int', ['pointer', 'pointer', 'int', 'int', 'int', 'int', 'uint32']]
    SetFocus:                 ['pointer', ['pointer']]
    keybd_event:              ['void', ['byte', 'char', 'uint32', 'pointer']]
    GetWindowLongW:           ['long', ['pointer', 'int']]
    
kernel = new ffi.Library 'kernel32',
    GetCurrentThreadId:       ['uint32', []]
    
winLaunch = (exePath) ->
    
    focusWins = []
    
    appWins = winList().filter (win) -> win.path == exePath
    visWins = appWins.filter (win) -> not win.minimized
    
    if visWins.length == 0
        visWins = appWins

    # log visWins
    
    for win in visWins
        
        # log "-------- foreground #{win.winID} #{exePath} :: #{win.title} "
  
        VK_MENU     = 0x12 # ALT key
        SW_RESTORE  = 9
        KEYDOWN     = 1
        KEYUP       = 3
        
        if win.minimized
            user.ShowWindow win.hwnd, SW_RESTORE
        
        user.keybd_event VK_MENU, 0, KEYDOWN, null # fake ALT press to enable foreground switch
        user.SetForegroundWindow win.hwnd          # ... no wonder windows is so bad
        user.keybd_event VK_MENU, 0, KEYUP, null
                
        focusWins.push win
            
    if not empty focusWins
        
        return focusWins:focusWins
        
    # log "+++++++++ start #{exePath}"

    subprocess = childp.spawn "\"#{exePath}\"", [], detached: true, stdio: 'ignore', shell: true
    subprocess.on 'error', (err) ->
        error 'winLaunch -- failed to start subprocess.'
        
    return subprocess:subprocess

module.exports = winLaunch
