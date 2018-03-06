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
