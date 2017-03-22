# 000   000  000   0000000  000000000   0000000   00000000   000   000
# 000   000  000  000          000     000   000  000   000   000 000 
# 000000000  000  0000000      000     000   000  0000000      00000  
# 000   000  000       000     000     000   000  000   000     000   
# 000   000  000  0000000      000      0000000   000   000     000   

{last} = require './tools'
_      = require 'lodash'

class History
    
    constructor: (@list=[]) ->
        
    add: (i) ->
        _.pull @list, i
        @list.push i
        
    previous: ->
        if @list.length > 1 then @list[@list.length-2]
        else null
    
    current: -> last @list
            
module.exports = History
