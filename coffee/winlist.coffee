
{ slash, empty, log } = require 'kxk'

{ U, K, conf, types, windef } = require 'win32-api'

kernel32 = K.load()
user32   = U.load()
W        = windef

ffi   = require 'ffi'
ref   = require 'ref'
wchar = require 'ref-wchar'


kernel = new ffi.Library 'kernel32',
    OpenProcess: ['pointer', ['uint32', 'int', 'uint32']]
    CloseHandle: ['int', ['pointer']]
    QueryFullProcessImageNameW: ['int', ['pointer', 'uint32', 'pointer', 'pointer']]

windows = []

enumWindowsProc = ffi.Callback W.BOOL, [W.HWND, W.LPARAM], (hWnd, lParam) ->
        
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
        
    windows.push
        winID:    winID
        procID:   procID
        threadID: threadID
        path:     procPath
        title:    winTitle
        
    return 1
    
getWindows = ->

    windows = []
    user32.EnumWindows enumWindowsProc, 2
    windows
        
module.exports = getWindows

#       var keydownCtrl = new KeybdInput()
#       keydownCtrl.type = 1
#       keydownCtrl.wVk = 0x0011
#       keydownCtrl.wScan = 0
#       keydownCtrl.dwFlags = 0x0000
#       keydownCtrl.time = 0
#       keydownCtrl.dwExtraInfo = 0
#   
#       var keyupCtrl = new KeybdInput()
#       keyupCtrl.type = 1
#       keyupCtrl.wVk = 0x0011
#       keyupCtrl.wScan = 0
#       keyupCtrl.dwFlags = 0x0002
#       keyupCtrl.time = 0
#       keyupCtrl.dwExtraInfo = 0
#   
#       var keydownV = new KeybdInput()
#       keydownV.type = 1
#       keydownV.wVk = 0x0056
#       keydownV.wScan = 0
#       keydownV.dwFlags = 0x0000
#       keydownV.time = 0
#       keydownV.dwExtraInfo = 0
#   
#       var keyupV = new KeybdInput()
#       keyupV.type = 1
#       keyupV.wVk = 0x0056
#       keyupV.wScan = 0
#       keyupV.dwFlags = 0x0002
#       keyupV.time = 0
   # keyupV.dwExtraInfo = 0

   # var r1 = user32.SendInput (1, keydownCtrl.ref() , 28)
#             var r2 = user32.SendInput (1, keydownV.ref() , 28)
#             var r3 = user32.SendInput (1, keyupV.ref() , 28)
#             var r4 = user32.SendInput (1, keyupCtrl.ref() , 28)
