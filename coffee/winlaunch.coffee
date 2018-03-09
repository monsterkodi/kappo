
# 000   000  000  000   000  000       0000000   000   000  000   000   0000000  000   000
# 000 0 000  000  0000  000  000      000   000  000   000  0000  000  000       000   000
# 000000000  000  000 0 000  000      000000000  000   000  000 0 000  000       000000000
# 000   000  000  000  0000  000      000   000  000   000  000  0000  000       000   000
# 00     00  000  000   000  0000000  000   000   0000000   000   000   0000000  000   000

{ slash, childp, empty, error, log } = require 'kxk'

{ foreground } = require 'wxw'

winLaunch = (exePath) ->
    
    focusWins = foreground exePath
        
    if not empty focusWins
        
        return focusWins:focusWins
        
    subprocess = childp.spawn "\"#{exePath}\"", [], detached: true, stdio: 'ignore', shell: true
    subprocess.on 'error', (err) ->
        error 'winLaunch -- failed to start subprocess.'
        
    return subprocess:subprocess

module.exports = winLaunch
