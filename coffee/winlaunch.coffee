
# 000   000  000  000   000  000       0000000   000   000  000   000   0000000  000   000
# 000 0 000  000  0000  000  000      000   000  000   000  0000  000  000       000   000
# 000000000  000  000 0 000  000      000000000  000   000  000 0 000  000       000000000
# 000   000  000  000  0000  000      000   000  000   000  000  0000  000       000   000
# 00     00  000  000   000  0000000  000   000   0000000   000   000   0000000  000   000

{ slash, childp, empty, klog } = require 'kxk'

wxw = require 'wxw'

winLaunch = (exePath) ->
    
    exe = slash.file exePath
    info = wxw('info' exe)?[0]
    if info?
        # wxw 'raise' exe
        wxw 'focus' exe
        return true 
                
    if "cmd" == slash.base exePath
        childp.exec "start cmd /k"
        return true
        
    subprocess = childp.spawn "\"#{exePath}\"", [], detached:true, stdio:'ignore', shell:true
    subprocess.on 'error', (err) ->
        error "winLaunch -- failed to start subprocess #{exePath} #{args.join ' '}."
        
    true

module.exports = winLaunch
