#!/usr/bin/env bash

DIR=`dirname $0`
BIN=$DIR/../node_modules/.bin
cd $DIR/..

if rm -rf kappo-darwin-x64; then

    if $BIN/konrad; then
    
        IGNORE="/(.*\.dmg$|Icon$|watch$|coffee$|bin/.*\.sh$|bin/.*\.noon$|bin/.*\.json$|icons$|.*md$|pug$|styl$|.*\.noon$|.*\.lock$|img/banner\.png|img/dmg|img/shot|img/.*\.pxm)"
        
        if $BIN/electron-packager . --overwrite --icon=img/app.icns --darwinDarkModeSupport --ignore=$IGNORE; then
        
            rm -rf /Applications/kappo.app
            cp -R kappo-darwin-x64/kappo.app /Applications
            
            open /Applications/kappo.app 
        fi
    fi
fi