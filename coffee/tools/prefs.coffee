# 00000000   00000000   00000000  00000000   0000000
# 000   000  000   000  000       000       000     
# 00000000   0000000    0000000   000000    0000000 
# 000        000   000  000       000            000
# 000        000   000  00000000  000       0000000 

Store    = require './store' 
pkg      = require '../../package.json'
electron = require 'electron'

class Prefs
    
    @store = null
    
    @init: (defs={}) -> 
        app = electron.app ? electron.remote.app
        file = "#{app.getPath('appData')}/#{pkg.productName}/#{pkg.productName}.noon"
        @store = new Store file:file, defaults:defs
        
    @get:  (key, value) -> @store.get key, value
    @set:  (key, value) -> @store.set key, value
    @del:  (key, value) -> @store.del key
    @save: (cb)         -> @store.save cb
        
module.exports = Prefs
