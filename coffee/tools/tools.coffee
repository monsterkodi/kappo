# 000000000   0000000    0000000   000       0000000
#    000     000   000  000   000  000      000     
#    000     000   000  000   000  000      0000000 
#    000     000   000  000   000  000           000
#    000      0000000    0000000   0000000  0000000 

path = require 'path'
_    = require 'lodash'

module.exports = 

    #  0000000   00000000   00000000    0000000   000   000
    # 000   000  000   000  000   000  000   000   000 000 
    # 000000000  0000000    0000000    000000000    00000  
    # 000   000  000   000  000   000  000   000     000   
    # 000   000  000   000  000   000  000   000     000   

    last:  (a) -> 
        if not _.isArray a
            return a
        if a?.length
            return a[a.length-1]
        null

    # 000   000   0000000   000      000   000  00000000
    # 000   000  000   000  000      000   000  000     
    #  000 000   000000000  000      000   000  0000000 
    #    000     000   000  000      000   000  000     
    #     0      000   000  0000000   0000000   00000000

    clamp: (r1, r2, v) ->
        if r1 > r2
            [r1,r2] = [r2,r1]
        v = Math.max(v, r1) if r1?
        v = Math.min(v, r2) if r2?
        v

    # 00000000    0000000   000000000  000   000
    # 000   000  000   000     000     000   000
    # 00000000   000000000     000     000000000
    # 000        000   000     000     000   000
    # 000        000   000     000     000   000
    
    unresolve: (p) -> p.replace os.homedir(), "~"    
    fileName:  (p) -> path.basename p, path.extname p
    extName:   (p) -> path.extname(p).slice 1
    resolve:   (p) -> 
        i = p.indexOf '$'
        while i >= 0
            for k,v of process.env
                if k == p.slice i+1, i+1+k.length
                    p = p.slice(0, i) + v + p.slice(i+k.length+1)
                    i = p.indexOf '$'
                    break
        path.normalize path.resolve p.replace /^\~/, process.env.HOME

    encodePath: (p) ->
        p = encodeURI p
        p = p.replace /\#/g, "%23"
        p = p.replace /\&/g, "%26"
        p = p.replace /\'/g, "%27"
    
    # 0000000     0000000   00     00
    # 000   000  000   000  000   000
    # 000   000  000   000  000000000
    # 000   000  000   000  000 0 000
    # 0000000     0000000   000   000
        
    $: (idOrClass, e=document) -> 
        if idOrClass[0] in ['.', "#"] or e != document
            e.querySelector idOrClass
        else
            document.getElementById idOrClass

    sw: () -> document.body.clientWidth
    sh: () -> document.body.clientHeight

    setStyle: (selector, key, value, ssid=0) ->
        for rule in document.styleSheets[ssid].cssRules
            if rule.selectorText == selector
                rule.style[key] = value
                return
        document.styleSheets[ssid].insertRule "#{selector} { #{key}: #{value} }", document.styleSheets[ssid].cssRules.length

    childIndex: (e) -> Array.prototype.indexOf.call(e.parentNode.childNodes, e)
