
# 000   000  000  000   000  000       0000000   000   000  000   000   0000000  000   000
# 000 0 000  000  0000  000  000      000   000  000   000  0000  000  000       000   000
# 000000000  000  000 0 000  000      000000000  000   000  000 0 000  000       000000000
# 000   000  000  000  0000  000      000   000  000   000  000  0000  000       000   000
# 00     00  000  000   000  0000000  000   000   0000000   000   000   0000000  000   000

{ slash, childp, empty, error, log } = require 'kxk'

winList = require './winlist'
ffi   = require 'ffi'

{ U } = require 'win32-api'

user32 = U.load()
userFF = new ffi.Library 'user32',
    SetForegroundWindow: ['int', ['pointer']]
    SetActiveWindow:     ['int', ['pointer']]

foreground = (winID) ->
    
    winctl = require 'winctl'
                          
    winctl.FindWindows (w) -> 
        if winID == w.getHwnd() 
            log 'foreground', winID
            w.showWindow winctl.WindowStates.SHOW
            w.setForegroundWindow()
            false
        true
    
winLaunch = (exePath) ->
    
    list = winList()
    
    log "winLaunch #{exePath} #{list.length}", list
    
    focusWins = []
    
    for win in list
        
        if win.path == exePath
            
            log "-------- foreground for #{exePath}", win.path
  
            foreground win.winID
            # r = user32.ShowWindow win.hwnd, 9 # SW_RESTORE
            # s = user32.ShowWindow win.hwnd, 5 # SW_SHOW
            # f = userFF.SetForegroundWindow win.hwnd
            # a = userFF.SetActiveWindow win.hwnd
            
            focusWins.push win
            # log "shown", r, s, f, a
            
    if not empty focusWins
        
        return focusWins: focusWins
        
    log "start #{exePath}"

    subprocess = childp.spawn "\"#{exePath}\"", [], detached: true, stdio: 'ignore', shell: true
    subprocess.on 'error', (err) ->
        error 'winLaunch -- failed to start subprocess.'
        
    return subprocess: subprocess

module.exports = winLaunch
