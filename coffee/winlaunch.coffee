
# 000   000  000  000   000  000       0000000   000   000  000   000   0000000  000   000
# 000 0 000  000  0000  000  000      000   000  000   000  0000  000  000       000   000
# 000000000  000  000 0 000  000      000000000  000   000  000 0 000  000       000000000
# 000   000  000  000  0000  000      000   000  000   000  000  0000  000       000   000
# 00     00  000  000   000  0000000  000   000   0000000   000   000   0000000  000   000

{ slash, childp, empty, error, log } = require 'kxk'

winList = require './winlist'
ffi   = require 'ffi'

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
    SystemParametersInfoW:    ['int', ['uint32', 'uint32', 'pointer', 'uint32']]
    keybd_event:              ['void', ['byte', 'char', 'uint32', 'pointer']]
    
kernel = new ffi.Library 'kernel32',
    GetCurrentThreadId:       ['uint32', []]
    
winLaunch = (exePath) ->
    
    focusWins = []

    user.SystemParametersInfoW 0x2001,0,null,1
    
    for win in winList()
        
        if win.path == exePath
            
            log "-------- foreground #{win.visible} #{win.ownerID} #{win.winID} #{exePath} :: #{win.title} "
  
            if win.visible and not win.ownerID and win.title

                VK_MENU    = 0x12 # ALT key
                SW_RESTORE = 9
                KEYDOWN    = 1
                KEYUP      = 3
                
                user.keybd_event VK_MENU, 0, KEYDOWN, null # fake ALT press to enable foreground switch
                user.SetForegroundWindow win.hwnd          # no wonder windows is so bad
                user.keybd_event VK_MENU, 0, KEYUP, null
                
                # hCurWnd = user.GetForegroundWindow()
                # dwMyID  = kernel.GetCurrentThreadId()
                # dwCurID = user.GetWindowThreadProcessId hCurWnd, null
#                 
                # user.AttachThreadInput   dwCurID, dwMyID, true
                # user.ShowWindow win.hwnd, SW_RESTORE
                # user.SetForegroundWindow win.hwnd
                # user.AttachThreadInput   dwCurID, dwMyID, false
                
                focusWins.push win
            
    if not empty focusWins
        
        return focusWins:focusWins
        
    log "+++++++++ start #{exePath}"

    subprocess = childp.spawn "\"#{exePath}\"", [], detached: true, stdio: 'ignore', shell: true
    subprocess.on 'error', (err) ->
        error 'winLaunch -- failed to start subprocess.'
        
    return subprocess:subprocess

module.exports = winLaunch
