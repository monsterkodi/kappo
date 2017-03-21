# 000   000  00000000  000   000  000   000   0000000   00     00  00000000
# 000  000   000        000 000   0000  000  000   000  000   000  000     
# 0000000    0000000     00000    000 0 000  000000000  000000000  0000000 
# 000  000   000          000     000  0000  000   000  000 0 000  000     
# 000   000  00000000     000     000   000  000   000  000   000  00000000

keycode = require 'keycode'

class Keyinfo
    
    @modifierNames = ['shift', 'ctrl', 'alt', 'command']
    @modifierChars = ['⇧', '^', '⌥', '⌘']
    
    @isModifier: (keyname) -> keyname in @modifierNames

    @modifiersForEvent: (event) => 
        mods = []
        mods.push 'command' if event.metaKey
        mods.push 'alt'     if event.altKey
        mods.push 'ctrl'    if event.ctrlKey 
        mods.push 'shift'   if event.shiftKey
        return mods.join '+'
        
    @join: () -> 
        args = [].slice.call arguments, 0
        args = args.filter (e) -> e.length
        args.join '+'
            
    @comboForEvent: (event) =>
        key = keycode event
        if key not in @modifierNames
            return @join @modifiersForEvent(event), key
        return ""

    @keynameForEvent: (event) => 
        name = keycode event
        return "" if name in ["left command", "right command", "ctrl", "alt", "shift"]
        name

    @forEvent: (event) =>
        mod:   @modifiersForEvent event
        key:   @keynameForEvent event
        combo: @comboForEvent event
        
    @short: (combo) ->
        for i in [0...@modifierNames.length]
            modifierName = @modifierNames[i]+'+'
            combo = combo.replace modifierName, @modifierChars[i]
        combo.toUpperCase()

module.exports = Keyinfo
