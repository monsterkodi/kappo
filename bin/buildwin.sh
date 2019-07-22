#!/usr/bin/env bash
DIR=`dirname $0`
BIN=$DIR/../node_modules/.bin
cd $DIR/..

npm install

if rm -rf kappo-win32-x64; then

    if $BIN/konrad; then

        $BIN/electron-rebuild

        IGNORE="(inno|.*\.dmg$|Icon$|.*\.lock$|img\/dmg.*\.png)"
        $BIN/electron-packager . --overwrite --ignore=$IGNORE --icon=img/app.ico

        start kappo-win32-x64/kappo.exe
    fi
fi