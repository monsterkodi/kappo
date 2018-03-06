###
000   000  000  000   000  000      000   0000000  000000000  
000 0 000  000  0000  000  000      000  000          000     
000000000  000  000 0 000  000      000  0000000      000     
000   000  000  000  0000  000      000       000     000     
00     00  000  000   000  0000000  000  0000000      000     
###

{ slash, empty, log } = require 'kxk'

{ U, K, conf, types, windef } = require 'win32-api'

kernel32 = K.load()
user32   = U.load()

ffi   = require 'ffi'
ref   = require 'ref'
wchar = require 'ref-wchar'

kernel = new ffi.Library 'kernel32',
    OpenProcess:                ['pointer', ['uint32', 'int', 'uint32']]
    CloseHandle:                ['int',     ['pointer']]
    QueryFullProcessImageNameW: ['int',     ['pointer', 'uint32', 'pointer', 'pointer']]

winList = ->
        
    winID      = ref.address hWnd
    
    textBuffer = Buffer.alloc 10000
    user32.GetWindowTextW hWnd, textBuffer, 5000
    winTitle   = wchar.toString ref.reinterpretUntilZeros textBuffer, wchar.size
    
    if empty winTitle
        return 1
    
    procBuffer = ref.alloc 'uint32'
    threadID   = user32.GetWindowThreadProcessId hWnd, procBuffer
    procID     = ref.get procBuffer
    
    procHandle = kernel.OpenProcess 0x1000, false, procID
    textLength = ref.alloc 'uint32', 5000
    kernel.QueryFullProcessImageNameW procHandle, 0, textBuffer, textLength
    
    procPath = slash.path wchar.toString ref.reinterpretUntilZeros textBuffer, wchar.size
    
    kernel.CloseHandle procHandle
    
    if ref.address user32.GetWindow hWnd, 4 # GW_OWNER
        return 1
        
    if not user32.IsWindowVisible hWnd
        return 1
        
        procPath = slash.path wchar.toString ref.reinterpretUntilZeros textBuffer, wchar.size
        
        kernel.CloseHandle procHandle
                
        windows.push
            hwnd:     hWnd
            winID:    winID
            procID:   procID
            threadID: threadID
            path:     procPath
            title:    winTitle
            
        return 1
    
    user32.EnumWindows enumProc, 0
    windows
        
module.exports = winList
