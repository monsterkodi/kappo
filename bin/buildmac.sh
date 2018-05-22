#!/usr/bin/env bash
cd `dirname $0`/..

NAME=kappo

2>/dev/null 1>/dev/null killall $NAME
2>/dev/null 1>/dev/null killall $NAME

konrad 

IGNORE="/(.*\.dmg$|Icon$|watch$|coffee$|bin/.*\.sh$|bin/.*\.noon$|bin/.*\.json$|icons$|.*md$|pug$|styl$|.*\.noon$|.*\.lock$|img/banner\.png|img/dmg|img/shot|img/.*\.pxm)"

node_modules/electron-packager/cli.js . --overwrite --icon=img/$NAME.icns --ignore=$IGNORE

rm -f $NAME-darwin-x64/LICENSE*
rm -f $NAME-darwin-x64/version
