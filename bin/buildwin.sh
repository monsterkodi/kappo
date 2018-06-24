#!/usr/bin/env bash
cd `dirname $0`/..

if rm -rf kappo-win32-x64; then

    konrad
    
    node_modules/.bin/electron-rebuild
    
    IGNORE="/(.*\.dmg$|Icon$|watch$|coffee$|bin/.*\.sh$|bin/.*\.noon$|bin/.*\.json$|icons$|.*md$|pug$|styl$|.*\.noon$|.*\.lock$|img/banner\.png|img/dmg|img/shot|img/.*\.pxm)"
    
    node_modules/electron-packager/cli.js . --overwrite --icon=img/app.ico --ignore=$IGNORE
    
    rm -rf kappo-win32-x64/resources/app/inno
fi