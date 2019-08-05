// koffee 1.3.0

/*
000   000   0000000   00000000   00000000    0000000
000  000   000   000  000   000  000   000  000   000
0000000    000000000  00000000   00000000   000   000
000  000   000   000  000        000        000   000
000   000  000   000  000        000         0000000
 */
var $, _, addToHistory, allKeys, appHist, apps, args, backspace, biggerWindow, blacklist, browser, cancelSearchOrClose, childIndex, childp, clamp, clampBounds, clearSearch, clickID, clipboard, complete, currentApp, currentIndex, currentIsApp, currentIsScript, currentName, doSearch, downID, electron, elem, empty, fs, fuzzaldrin, fuzzy, getAppIcon, getScriptIcon, history, iconDir, ipc, kerror, keyinfo, klog, kpos, listHistory, maximizeWindow, minimizeWindow, moveWindow, open, openCurrent, openInFinder, pkg, post, prefs, preventKeyRepeat, ref, results, scheme, screenSize, scripts, search, select, selectName, setIcon, setStyle, showDots, sizeWindow, slash, smallerWindow, srcmap, stopEvent, sw, toggleAppToggle, toggleDoubleActivation, toggleWindowSize, valid, wheelAccu, win, winHide, winMain;

ref = require('kxk'), post = ref.post, args = ref.args, srcmap = ref.srcmap, childIndex = ref.childIndex, setStyle = ref.setStyle, stopEvent = ref.stopEvent, keyinfo = ref.keyinfo, history = ref.history, valid = ref.valid, empty = ref.empty, childp = ref.childp, scheme = ref.scheme, clamp = ref.clamp, prefs = ref.prefs, elem = ref.elem, fs = ref.fs, slash = ref.slash, open = ref.open, klog = ref.klog, kerror = ref.kerror, kpos = ref.kpos, sw = ref.sw, $ = ref.$, _ = ref._;

pkg = require('../package.json');

fuzzy = require('fuzzy');

fuzzaldrin = require('fuzzaldrin');

electron = require('electron');

clipboard = electron.clipboard;

browser = electron.remote.BrowserWindow;

win = electron.remote.getCurrentWindow();

iconDir = slash.resolve((electron.remote.app.getPath('userData')) + "/icons");

ipc = electron.ipcRenderer;

appHist = null;

results = [];

apps = {};

scripts = {};

allKeys = [];

search = '';

currentName = '';

currentIndex = 0;

post.on('mainlog', function(text) {
    return console.log(">>> " + text);
});

post.on('appsFound', function() {
    var ref1;
    return ref1 = post.get('apps'), apps = ref1.apps, scripts = ref1.scripts, allKeys = ref1.allKeys, ref1;
});

winMain = function() {
    var ref1;
    window.onerror = function(msg, source, line, col, err) {
        srcmap.logErr(err);
        return true;
    };
    klog.slog.icon = slash.fileUrl(slash.join(__dirname, '..', 'img', 'menu@2x.png'));
    window.win = win;
    post.on('fade', function() {
        var ref1, restore, x, y;
        if (!slash.win()) {
            win.show();
            return;
        }
        ref1 = win.getPosition(), x = ref1[0], y = ref1[1];
        win.setPosition(-10000, -10000);
        win.show();
        $('#main').classList.remove('fade');
        $('#main').style.opacity = 0;
        restore = function() {
            var b;
            if (x < -10 || y < -10) {
                b = win.getBounds();
                x = (screenSize().width - b.width) / 2;
                y = 0;
            } else {
                win.setPosition(x, y);
            }
            return $('#main').classList.add('fade');
        };
        return setTimeout(restore, 30);
    });
    prefs.init();
    ref1 = post.get('apps'), apps = ref1.apps, scripts = ref1.scripts, allKeys = ref1.allKeys;
    appHist = new history({
        list: prefs.get('history', []),
        maxLength: prefs.get('maxHistoryLength', 10)
    });
    return scheme.set(prefs.get('scheme', 'bright'));
};

winHide = function() {
    if (!args.debug) {
        return win.hide();
    }
};

openCurrent = function() {
    var exe, info, ref1, wxw;
    ipc.send('closeAbout');
    if (currentIndex > 0 && search.length) {
        prefs.set("search:" + search + ":" + currentName, 1 + prefs.get("search:" + search + ":" + currentName, 0));
    }
    if (currentIsApp()) {
        addToHistory();
        if (slash.win()) {
            wxw = require('wxw');
            wxw('launch', apps[currentName]);
            return winHide();
        } else {
            return childp.exec("open -a \"" + apps[currentName] + "\"", function(err) {
                if (err != null) {
                    return console.log("[ERROR] can't open " + apps[currentName] + " " + err);
                }
            });
        }
    } else if (scripts[currentName] != null) {
        if (scripts[currentName].foreground != null) {
            exe = slash.file(scripts[currentName].foreground);
            addToHistory();
            if (slash.win()) {
                wxw = require('wxw');
                info = (ref1 = wxw('info', exe)) != null ? ref1[0] : void 0;
                if (info) {
                    winHide();
                    wxw('show', exe);
                    wxw('raise', exe);
                    wxw('focus', exe);
                    return;
                }
            }
        }
        if (scripts[currentName].exec != null) {
            return childp.exec(scripts[currentName].exec, function(err) {
                if (err != null) {
                    return console.log("[ERROR] can't execute script " + scripts[currentName] + ": " + err);
                }
            });
        } else {
            post.toMain('runScript', currentName);
            return winHide();
        }
    }
};

post.on('openCurrent', openCurrent);

currentApp = function(appName) {
    var lastMatches, name, ref1, scriptMatches;
    if (empty(currentName)) {
        currentName = 'kappo';
    }
    if (empty(appName)) {
        appName = 'kappo';
    }
    lastMatches = currentName.toLowerCase() === appName.toLowerCase();
    scriptMatches = (((ref1 = scripts[currentName]) != null ? ref1.foreground : void 0) != null) && slash.base(scripts[currentName].foreground).toLowerCase() === appName.toLowerCase();
    if ((lastMatches || scriptMatches) && appHist.previous() && prefs.get('appToggle', true)) {
        listHistory(1);
        search = '';
    } else {
        name = currentName;
        doSearch('');
        if (!empty(name)) {
            selectName(name);
        }
        search = '';
        $('appname').innerHTML = name;
    }
    return $('#main').classList.add('fade');
};

post.on('currentApp', currentApp);

currentIsApp = (function(_this) {
    return function() {
        return !currentIsScript();
    };
})(this);

currentIsScript = function() {
    var ref1;
    return ((ref1 = results[currentIndex]) != null ? ref1.script : void 0) != null;
};

toggleAppToggle = function() {
    return prefs.set('appToggle', !prefs.get('appToggle', true));
};

toggleDoubleActivation = function() {
    return prefs.set('hideOnDoubleActivation', !prefs.get('hideOnDoubleActivation', false));
};

listHistory = function(offset) {
    var h, index, j, len, ref1, result;
    if (offset == null) {
        offset = 0;
    }
    results = [];
    if (valid(appHist)) {
        ref1 = appHist.list;
        for (j = 0, len = ref1.length; j < len; j++) {
            h = ref1[j];
            result = _.clone(h);
            if (result.string != null) {
                result.string;
            } else {
                result.string = result.name;
            }
            results.push(result);
        }
    }
    index = results.length - 1 - offset;
    select(index);
    return showDots();
};

addToHistory = function() {
    var result;
    if (empty(results[currentIndex])) {
        return;
    }
    result = _.clone(results[currentIndex]);
    delete result.string;
    appHist.add(result);
    return prefs.set('history', appHist.list);
};

openInFinder = function() {
    return childp.spawn('osascript', ['-e', 'tell application "Finder"', '-e', "reveal POSIX file \"" + apps[currentName] + "\"", '-e', 'activate', '-e', 'end tell']);
};

clearSearch = function() {
    if (results.length) {
        search = '';
        results = [results[Math.min(currentIndex, results.length - 1)]];
        results[0].string = currentName;
        $('appname').innerHTML = currentName;
        currentIndex = 0;
        return showDots();
    } else {
        return doSearch('');
    }
};

post.on('clearSearch', clearSearch);

getScriptIcon = function(scriptName) {
    return setIcon(scripts[scriptName].img);
};

getAppIcon = function(appName) {
    var appIcon;
    if (slash.win()) {
        appIcon = require('./exeicon');
    } else {
        appIcon = require('./appicon');
    }
    return appIcon.get({
        appPath: apps[appName],
        iconDir: iconDir,
        size: 512,
        cb: setIcon
    });
};

setIcon = function(iconPath) {
    return $('appicon').style.backgroundImage = "url(\"" + (slash.fileUrl(iconPath)) + "\")";
};

select = (function(_this) {
    return function(index) {
        var ref1, ref2;
        currentIndex = (index + results.length) % results.length;
        if (empty(results[currentIndex])) {
            console.log('dafuk? index:', index, 'results:', results);
            return;
        }
        currentName = results[currentIndex].name;
        $('appname').innerHTML = results[currentIndex].string;
        if ((ref1 = $('.current')) != null) {
            ref1.classList.remove('current');
        }
        if ((ref2 = $("dot_" + currentIndex)) != null) {
            ref2.classList.add('current');
        }
        if (currentIsApp()) {
            return getAppIcon(currentName);
        } else {
            return getScriptIcon(currentName);
        }
    };
})(this);

selectName = function(name) {
    if (empty(name)) {
        return;
    }
    return select(results.findIndex(function(r) {
        return (r != null ? r.name.toLowerCase() : void 0) === name.toLowerCase();
    }));
};

showDots = function() {
    var dot, dotr, dots, i, j, ref1, results1, s, winWidth;
    dots = $('appdots');
    dots.innerHTML = '';
    winWidth = sw();
    setStyle('#appname', 'font-size', (parseInt(10 + 2 * (winWidth - 100) / 100)) + "px");
    if (results.length < 2) {
        return;
    }
    dotr = elem({
        id: 'appdotr'
    });
    dots.appendChild(dotr);
    s = winWidth / results.length;
    s = clamp(1, winWidth / 100, s);
    s = parseInt(s);
    setStyle('.appdot', 'width', s + "px");
    setStyle('.appdot', 'height', s + "px");
    results1 = [];
    for (i = j = 0, ref1 = results.length; 0 <= ref1 ? j < ref1 : j > ref1; i = 0 <= ref1 ? ++j : --j) {
        dot = elem('span', {
            "class": 'appdot',
            id: "dot_" + i
        });
        if (i === currentIndex) {
            dot.classList.add('current');
        }
        results1.push(dotr.appendChild(dot));
    }
    return results1;
};

blacklist = function() {
    var ignore;
    ignore = prefs.get('ignore', []);
    _.pull(ignore, apps[currentName]);
    _.pull(ignore, null);
    if (valid(apps[currentName])) {
        ignore.push(apps[currentName]);
    } else {
        console.log("can't ignore '" + currentName + "'");
    }
    prefs.set('ignore', ignore);
    delete apps[currentName];
    results.splice(currentIndex, 1);
    return select(currentIndex);
};

doSearch = function(s) {
    var f, fuzzied, j, len, names, ps, r;
    search = s;
    names = allKeys;
    fuzzied = fuzzy.filter(search, names, {
        pre: '<b>',
        post: '</b>'
    });
    fuzzied = _.sortBy(fuzzied, function(o) {
        return 2 - fuzzaldrin.score(o.original, search);
    });
    if (search.length) {
        if (ps = prefs.get("search:" + search)) {
            fuzzied = _.sortBy(fuzzied, function(o) {
                var ref1;
                return Number.MAX_SAFE_INTEGER - ((ref1 = ps[o.original]) != null ? ref1 : 0);
            });
        }
    }
    results = [];
    for (j = 0, len = fuzzied.length; j < len; j++) {
        f = fuzzied[j];
        r = {
            name: f.original,
            string: f.string
        };
        if (scripts[r.name]) {
            r.script = scripts[r.name];
        }
        results.push(r);
    }
    if (valid(results)) {
        if (s === '') {
            if (slash.win()) {
                selectName('terminal');
            } else {
                selectName('Finder');
            }
        } else {
            select(0);
        }
        return showDots();
    } else {
        $('appdots').innerHTML = '';
        return $('appname').innerHTML = "<b>" + search + "</b>";
    }
};

complete = function(key) {
    return doSearch(search + key);
};

backspace = function() {
    return doSearch(search.substr(0, search.length - 1));
};

cancelSearchOrClose = function() {
    ipc.send('closeAbout');
    if (search.length) {
        return doSearch('');
    } else {
        return post.toMain('cancel');
    }
};

clickID = downID = 0;

window.onmousedown = function(e) {
    clickID += 1;
    return downID = clickID;
};

window.onmouseup = function(e) {
    if (downID === clickID) {
        return openCurrent();
    }
};

window.onmousemove = function(e) {
    if (e.buttons) {
        return downID = -1;
    }
};

window.onunload = function() {
    return document.onkeydown = null;
};

window.onblur = function() {
    return winHide();
};

window.onresize = function() {
    return showDots();
};

wheelAccu = 0;

window.onwheel = function(event) {
    var results1, results2;
    wheelAccu += (event.deltaX + event.deltaY) / 44;
    if (wheelAccu > 1) {
        select(currentIndex + 1 % results.length);
        results1 = [];
        while (wheelAccu > 1) {
            results1.push(wheelAccu -= 1);
        }
        return results1;
    } else if (wheelAccu < -1) {
        select(currentIndex + results.length - 1 % results.length);
        results2 = [];
        while (wheelAccu < -1) {
            results2.push(wheelAccu += 1);
        }
        return results2;
    }
};

screenSize = function() {
    return electron.remote.screen.getPrimaryDisplay().workAreaSize;
};

clampBounds = function(b) {
    b.width = clamp(200, 600, b.width);
    b.height = clamp(200, 600, b.height);
    b.x = clamp(0, screenSize().width - b.width, b.x);
    b.y = clamp(0, screenSize().height - b.height, b.y);
    return b;
};

sizeWindow = function(d) {
    var b, cx;
    b = win.getBounds();
    cx = b.x + b.width / 2;
    b.width += d;
    b.height += d;
    clampBounds(b);
    b.x = cx - b.width / 2;
    return win.setBounds(clampBounds(b));
};

moveWindow = function(dx, dy) {
    var b;
    b = win.getBounds();
    b.x += dx;
    b.y += dy;
    return win.setBounds(clampBounds(b));
};

biggerWindow = function() {
    return sizeWindow(50);
};

smallerWindow = function() {
    return sizeWindow(-50);
};

minimizeWindow = function() {
    return win.setBounds({
        x: screenSize().width / 2 - 100,
        y: 0,
        width: 200,
        height: 200
    });
};

maximizeWindow = function() {
    return win.setBounds({
        x: screenSize().width / 2 - 300,
        y: 0,
        width: 600,
        height: 600
    });
};

toggleWindowSize = function() {
    if (win.getBounds().width > 200) {
        return minimizeWindow();
    } else {
        return maximizeWindow();
    }
};

preventKeyRepeat = function() {
    return console.log('keyRepeat ahead!');
};

document.onkeydown = function(event) {
    var char, combo, key, mod, ref1;
    ref1 = keyinfo.forEvent(event), mod = ref1.mod, key = ref1.key, combo = ref1.combo, char = ref1.char;
    if (args.verbose) {
        console.log(combo);
    }
    if ((char != null) && combo.length === 1) {
        complete(key);
        return;
    }
    switch (combo) {
        case 'f1':
            return preventKeyRepeat();
        case 'delete':
            return blacklist();
        case 'backspace':
            return backspace();
        case 'command+backspace':
        case 'ctrl+backspace':
            return doSearch('');
        case 'command+i':
        case 'ctrl+i':
            return scheme.toggle();
        case 'esc':
            return cancelSearchOrClose();
        case 'down':
        case 'right':
            return select(currentIndex + 1);
        case 'up':
        case 'left':
            return select(currentIndex - 1);
        case 'enter':
            return openCurrent();
        case 'command+alt+i':
        case 'ctrl+alt+i':
            args.debug = true;
            return win.webContents.openDevTools();
        case 'command+=':
        case 'ctrl+=':
            return biggerWindow();
        case 'command+-':
        case 'ctrl+-':
            return smallerWindow();
        case 'command+r':
        case 'ctrl+r':
            return post.toMain('findApps');
        case 'command+h':
        case 'alt+h':
            return listHistory();
        case 'command+f':
        case 'ctrl+f':
            return openInFinder();
        case 'command+t':
        case 'ctrl+t':
            return toggleAppToggle();
        case 'command+d':
        case 'ctrl+d':
            return toggleDoubleActivation();
        case 'alt+command+/':
        case 'alt+ctrl+/':
            return post.toMain('about');
        case 'command+,':
        case 'ctrl+,':
            return open(prefs.store.file);
        case 'command+up':
        case 'ctrl+up':
            return moveWindow(0, -20);
        case 'command+down':
        case 'ctrl+down':
            return moveWindow(0, 20);
        case 'command+left':
        case 'ctrl+left':
            return moveWindow(-20, 0);
        case 'command+right':
        case 'ctrl+right':
            return moveWindow(20, 0);
        case 'command+0':
        case 'command+o':
        case 'ctrl+0':
        case 'ctrl+o':
            return toggleWindowSize();
    }
};

winMain();

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoia2FwcG8uanMiLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsiIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUE7Ozs7Ozs7QUFBQSxJQUFBOztBQVFBLE1BQ2dGLE9BQUEsQ0FBUSxLQUFSLENBRGhGLEVBQUUsZUFBRixFQUFRLGVBQVIsRUFBYyxtQkFBZCxFQUFzQiwyQkFBdEIsRUFBa0MsdUJBQWxDLEVBQTRDLHlCQUE1QyxFQUF1RCxxQkFBdkQsRUFBZ0UscUJBQWhFLEVBQXlFLGlCQUF6RSxFQUFnRixpQkFBaEYsRUFBdUYsbUJBQXZGLEVBQ0UsbUJBREYsRUFDVSxpQkFEVixFQUNpQixpQkFEakIsRUFDd0IsZUFEeEIsRUFDOEIsV0FEOUIsRUFDa0MsaUJBRGxDLEVBQ3lDLGVBRHpDLEVBQytDLGVBRC9DLEVBQ3FELG1CQURyRCxFQUM2RCxlQUQ3RCxFQUNtRSxXQURuRSxFQUN1RSxTQUR2RSxFQUMwRTs7QUFFMUUsR0FBQSxHQUFlLE9BQUEsQ0FBUSxpQkFBUjs7QUFDZixLQUFBLEdBQWUsT0FBQSxDQUFRLE9BQVI7O0FBQ2YsVUFBQSxHQUFlLE9BQUEsQ0FBUSxZQUFSOztBQUNmLFFBQUEsR0FBZSxPQUFBLENBQVEsVUFBUjs7QUFFZixTQUFBLEdBQWUsUUFBUSxDQUFDOztBQUN4QixPQUFBLEdBQWUsUUFBUSxDQUFDLE1BQU0sQ0FBQzs7QUFDL0IsR0FBQSxHQUFlLFFBQVEsQ0FBQyxNQUFNLENBQUMsZ0JBQWhCLENBQUE7O0FBQ2YsT0FBQSxHQUFlLEtBQUssQ0FBQyxPQUFOLENBQWdCLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsT0FBcEIsQ0FBNEIsVUFBNUIsQ0FBRCxDQUFBLEdBQXlDLFFBQXpEOztBQUNmLEdBQUEsR0FBZSxRQUFRLENBQUM7O0FBRXhCLE9BQUEsR0FBZTs7QUFDZixPQUFBLEdBQWU7O0FBQ2YsSUFBQSxHQUFlOztBQUNmLE9BQUEsR0FBZTs7QUFDZixPQUFBLEdBQWU7O0FBQ2YsTUFBQSxHQUFl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LFdBdEJwQzttQkFzQjZELFVBQUEsQ0FBVyxDQUFDLEVBQVosRUFBZ0IsQ0FBaEI7QUF0QjdELGFBdUJTLGVBdkJUO0FBQUEsYUF1Qm9DLFlBdkJwQzttQkF1QjZELFVBQUEsQ0FBWSxFQUFaLEVBQWdCLENBQWhCO0FBdkI3RCxhQXdCUyxXQXhCVDtBQUFBLGFBd0JxQixXQXhCckI7QUFBQSxhQXdCb0MsUUF4QnBDO0FBQUEsYUF3QjZDLFFBeEI3QzttQkF3QjZELGdCQUFBLENBQUE7QUF4QjdEO0FBVmlCOztBQW9DckIsT0FBQSxDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiIyMjXG4wMDAgICAwMDAgICAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAwMDAwMCAgICAwMDAwMDAwXG4wMDAgIDAwMCAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMFxuMDAwMDAwMCAgICAwMDAwMDAwMDAgIDAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAgICAwMDBcbjAwMCAgMDAwICAgMDAwICAgMDAwICAwMDAgICAgICAgIDAwMCAgICAgICAgMDAwICAgMDAwXG4wMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgICAwMDAgICAgICAgICAwMDAwMDAwXG4jIyNcblxueyBwb3N0LCBhcmdzLCBzcmNtYXAsIGNoaWxkSW5kZXgsIHNldFN0eWxlLCBzdG9wRXZlbnQsIGtleWluZm8sIGhpc3RvcnksIHZhbGlkLCBlbXB0eSwgY2hpbGRwLFxuICBzY2hlbWUsIGNsYW1wLCBwcmVmcywgZWxlbSwgZnMsIHNsYXNoLCBvcGVuLCBrbG9nLCBrZXJyb3IsIGtwb3MsIHN3LCAkLCBfIH0gPSByZXF1aXJlICdreGsnXG5cbnBrZyAgICAgICAgICA9IHJlcXVpcmUgJy4uL3BhY2thZ2UuanNvbidcbmZ1enp5ICAgICAgICA9IHJlcXVpcmUgJ2Z1enp5J1xuZnV6emFsZHJpbiAgID0gcmVxdWlyZSAnZnV6emFsZHJpbidcbmVsZWN0cm9uICAgICA9IHJlcXVpcmUgJ2VsZWN0cm9uJ1xuXG5jbGlwYm9hcmQgICAgPSBlbGVjdHJvbi5jbGlwYm9hcmRcbmJyb3dzZXIgICAgICA9IGVsZWN0cm9uLnJlbW90ZS5Ccm93c2VyV2luZG93XG53aW4gICAgICAgICAgPSBlbGVjdHJvbi5yZW1vdGUuZ2V0Q3VycmVudFdpbmRvdygpXG5pY29uRGlyICAgICAgPSBzbGFzaC5yZXNvbHZlIFwiI3tlbGVjdHJvbi5yZW1vdGUuYXBwLmdldFBhdGgoJ3VzZXJEYXRhJyl9L2ljb25zXCJcbmlwYyAgICAgICAgICA9IGVsZWN0cm9uLmlwY1JlbmRlcmVyXG4gICAgXG5hcHBIaXN0ICAgICAgPSBudWxsXG5yZXN1bHRzICAgICAgPSBbXVxuYXBwcyAgICAgICAgID0ge31cbnNjcmlwdHMgICAgICA9IHt9XG5hbGxLZXlzICAgICAgPSBbXVxuc2VhcmNoICAgICAgID0gJydcbmN1cnJlbnROYW1lICA9ICcnXG5jdXJyZW50SW5kZXggPSAwXG5cbnBvc3Qub24gJ21haW5sb2cnLCAodGV4dCkgLT4gbG9nIFwiPj4+IFwiICsgdGV4dFxucG9zdC5vbiAnYXBwc0ZvdW5kJywgLT4geyBhcHBzLCBzY3JpcHRzLCBhbGxLZXlzIH0gPSBwb3N0LmdldCAnYXBwcydcblxuIyAwMDAgICAwMDAgIDAwMCAgMDAwICAgMDAwICAwMCAgICAgMDAgICAwMDAwMDAwICAgMDAwICAwMDAgICAwMDBcbiMgMDAwIDAgMDAwICAwMDAgIDAwMDAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwMCAgMDAwXG4jIDAwMDAwMDAwMCAgMDAwICAwMDAgMCAwMDAgIDAwMDAwMDAwMCAgMDAwMDAwMDAwICAwMDAgIDAwMCAwIDAwMFxuIyAwMDAgICAwMDAgIDAwMCAgMDAwICAwMDAwICAwMDAgMCAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAgIDAwMDBcbiMgMDAgICAgIDAwICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwICAgMDAwXG5cbndpbk1haW4gPSAtPlxuXG4gICAgd2luZG93Lm9uZXJyb3IgPSAobXNnLCBzb3VyY2UsIGxpbmUsIGNvbCwgZXJyKSAtPlxuICAgICAgICBzcmNtYXAubG9nRXJyIGVyclxuICAgICAgICB0cnVlXG4gICAgXG4gICAga2xvZy5zbG9nLmljb24gPSBzbGFzaC5maWxlVXJsIHNsYXNoLmpvaW4gX19kaXJuYW1lLCAnLi4nLCAnaW1nJywgJ21lbnVAMngucG5nJ1xuICAgIFxuICAgIHdpbmRvdy53aW4gPSB3aW5cblxuICAgIHBvc3Qub24gJ2ZhZGUnIC0+XG4gICAgICAgIFxuICAgICAgICBpZiBub3Qgc2xhc2gud2luKClcbiAgICAgICAgICAgIHdpbi5zaG93KClcbiAgICAgICAgICAgIHJldHVyblxuICAgICAgICAgICAgXG4gICAgICAgIFt4LHldID0gd2luLmdldFBvc2l0aW9uKCkgICAgICMgZW5hYmxlIHNtb290aCBmYWRlIG9uIHdpbmRvd3M6XG4gICAgICAgIHdpbi5zZXRQb3NpdGlvbiAtMTAwMDAsLTEwMDAwICMgbW92ZSB3aW5kb3cgb2Zmc2NyZWVuIGJlZm9yZSBzaG93XG4gICAgICAgIHdpbi5zaG93KClcbiAgICAgICAgJCgnI21haW4nKS5jbGFzc0xpc3QucmVtb3ZlICdmYWRlJ1xuICAgICAgICAkKCcjbWFpbicpLnN0eWxlLm9wYWNpdHkgPSAwXG4gICAgICAgIFxuICAgICAgICByZXN0b3JlID0gLT4gXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIHggPCAtMTAgb3IgeSA8IC0xMCAjIGtleSByZXBlYXQgaGlja3VwICdmaXgnXG4gICAgICAgICAgICAgICAgYiA9IHdpbi5nZXRCb3VuZHMoKVxuICAgICAgICAgICAgICAgIHggPSAoc2NyZWVuU2l6ZSgpLndpZHRoIC0gYi53aWR0aCkvMlxuICAgICAgICAgICAgICAgIHkgPSAwXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgd2luLnNldFBvc2l0aW9uIHgseVxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgJCgnI21haW4nKS5jbGFzc0xpc3QuYWRkICdmYWRlJ1xuICAgICAgICAgICAgXG4gICAgICAgIHNldFRpbWVvdXQgcmVzdG9yZSwgMzAgIyBnaXZlIHdpbmRvd3Mgc29tZSB0aW1lIHRvIGRvIGl0J3MgZmxpY2tlcmluZ1xuICAgICAgICBcbiAgICBwcmVmcy5pbml0KClcblxuICAgIHsgYXBwcywgc2NyaXB0cywgYWxsS2V5cyB9ID0gcG9zdC5nZXQgJ2FwcHMnXG5cbiAgICBhcHBIaXN0ID0gbmV3IGhpc3RvcnlcbiAgICAgICAgbGlzdDogICAgICBwcmVmcy5nZXQgJ2hpc3RvcnknLCBbXVxuICAgICAgICBtYXhMZW5ndGg6IHByZWZzLmdldCAnbWF4SGlzdG9yeUxlbmd0aCcsIDEwXG5cbiAgICBzY2hlbWUuc2V0IHByZWZzLmdldCAnc2NoZW1lJywgJ2JyaWdodCdcbiAgICBcbndpbkhpZGUgPSAtPiBcbiAgICBcbiAgICBpZiBub3QgYXJncy5kZWJ1Z1xuICAgICAgICB3aW4uaGlkZSgpXG4gICAgXG4jICAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAwMDAwMCAgMDAwICAgMDAwXG4jIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwMCAgMDAwXG4jIDAwMCAgIDAwMCAgMDAwMDAwMDAgICAwMDAwMDAwICAgMDAwIDAgMDAwXG4jIDAwMCAgIDAwMCAgMDAwICAgICAgICAwMDAgICAgICAgMDAwICAwMDAwXG4jICAwMDAwMDAwICAgMDAwICAgICAgICAwMDAwMDAwMCAgMDAwICAgMDAwXG5cbm9wZW5DdXJyZW50ID0gLT5cblxuICAgIGlwYy5zZW5kICdjbG9zZUFib3V0J1xuICAgIFxuICAgIGlmIGN1cnJlbnRJbmRleCA+IDAgYW5kIHNlYXJjaC5sZW5ndGhcbiAgICAgICAgcHJlZnMuc2V0IFwic2VhcmNoOiN7c2VhcmNofToje2N1cnJlbnROYW1lfVwiLCAxICsgcHJlZnMuZ2V0IFwic2VhcmNoOiN7c2VhcmNofToje2N1cnJlbnROYW1lfVwiLCAwXG5cbiAgICBpZiBjdXJyZW50SXNBcHAoKVxuXG4gICAgICAgIGFkZFRvSGlzdG9yeSgpXG4gICAgICAgIFxuICAgICAgICBpZiBzbGFzaC53aW4oKVxuXG4gICAgICAgICAgICAjIGtsb2cgJ2xhdW5jaCcgY3VycmVudE5hbWUsIGFwcHNbY3VycmVudE5hbWVdXG4gICAgICAgICAgICB3eHcgPSByZXF1aXJlICd3eHcnXG4gICAgICAgICAgICB3eHcgJ2xhdW5jaCcgYXBwc1tjdXJyZW50TmFtZV1cbiAgICAgICAgICAgIHdpbkhpZGUoKVxuXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIGNoaWxkcC5leGVjIFwib3BlbiAtYSBcXFwiI3thcHBzW2N1cnJlbnROYW1lXX1cXFwiXCIsIChlcnIpIC0+XG4gICAgICAgICAgICAgICAgaWYgZXJyPyB0aGVuIGxvZyBcIltFUlJPUl0gY2FuJ3Qgb3BlbiAje2FwcHNbY3VycmVudE5hbWVdfSAje2Vycn1cIlxuICAgICAgICAgICAgICAgIFxuICAgIGVsc2UgaWYgc2NyaXB0c1tjdXJyZW50TmFtZV0/XG4gICAgICAgIFxuICAgICAgICBpZiBzY3JpcHRzW2N1cnJlbnROYW1lXS5mb3JlZ3JvdW5kP1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBleGUgPSBzbGFzaC5maWxlIHNjcmlwdHNbY3VycmVudE5hbWVdLmZvcmVncm91bmRcbiAgICAgICAgICAgIGFkZFRvSGlzdG9yeSgpXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIHNsYXNoLndpbigpXG4gICAgICAgICAgICAgICAgd3h3ID0gcmVxdWlyZSAnd3h3J1xuICAgICAgICAgICAgICAgIGluZm8gPSB3eHcoJ2luZm8nIGV4ZSk/WzBdXG4gICAgICAgICAgICAgICAgaWYgaW5mb1xuICAgICAgICAgICAgICAgICAgICB3aW5IaWRlKClcbiAgICAgICAgICAgICAgICAgICAgd3h3ICdzaG93JyAgZXhlXG4gICAgICAgICAgICAgICAgICAgIHd4dyAncmFpc2UnIGV4ZVxuICAgICAgICAgICAgICAgICAgICB3eHcgJ2ZvY3VzJyBleGVcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgIFxuICAgICAgICBpZiBzY3JpcHRzW2N1cnJlbnROYW1lXS5leGVjP1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBjaGlsZHAuZXhlYyBzY3JpcHRzW2N1cnJlbnROYW1lXS5leGVjLCAoZXJyKSAtPlxuICAgICAgICAgICAgICAgIGlmIGVycj8gdGhlbiBsb2cgXCJbRVJST1JdIGNhbid0IGV4ZWN1dGUgc2NyaXB0ICN7c2NyaXB0c1tjdXJyZW50TmFtZV19OiAje2Vycn1cIlxuICAgICAgICAgICAgICAgIFxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBwb3N0LnRvTWFpbiAncnVuU2NyaXB0JywgY3VycmVudE5hbWVcbiAgICAgICAgICAgIHdpbkhpZGUoKVxuXG5wb3N0Lm9uICdvcGVuQ3VycmVudCcsICBvcGVuQ3VycmVudFxuXG4jICAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMDBcbiMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAwICAwMDAgICAgIDAwMFxuIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAwMDAwICAgIDAwMDAwMDAgICAgMDAwMDAwMCAgIDAwMCAwIDAwMCAgICAgMDAwXG4jIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAwMDAwICAgICAwMDBcbiMgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAgICAwMDAgICAgIDAwMFxuXG5jdXJyZW50QXBwID0gKGFwcE5hbWUpIC0+XG5cbiAgICBjdXJyZW50TmFtZSAgID0gJ2thcHBvJyBpZiBlbXB0eSBjdXJyZW50TmFtZVxuICAgIGFwcE5hbWUgICAgICAgPSAna2FwcG8nIGlmIGVtcHR5IGFwcE5hbWVcbiAgICBsYXN0TWF0Y2hlcyAgID0gY3VycmVudE5hbWUudG9Mb3dlckNhc2UoKSA9PSBhcHBOYW1lLnRvTG93ZXJDYXNlKClcbiAgICBzY3JpcHRNYXRjaGVzID0gc2NyaXB0c1tjdXJyZW50TmFtZV0/LmZvcmVncm91bmQ/IGFuZCBzbGFzaC5iYXNlKHNjcmlwdHNbY3VycmVudE5hbWVdLmZvcmVncm91bmQpLnRvTG93ZXJDYXNlKCkgPT0gYXBwTmFtZS50b0xvd2VyQ2FzZSgpXG4gICAgICAgIFxuICAgIGlmIChsYXN0TWF0Y2hlcyBvciBzY3JpcHRNYXRjaGVzKSBhbmQgYXBwSGlzdC5wcmV2aW91cygpIGFuZCBwcmVmcy5nZXQgJ2FwcFRvZ2dsZScsIHRydWVcbiAgICAgICAgbGlzdEhpc3RvcnkgMVxuICAgICAgICBzZWFyY2ggPSAnJ1xuICAgIGVsc2VcbiAgICAgICAgbmFtZSA9IGN1cnJlbnROYW1lXG4gICAgICAgIGRvU2VhcmNoICcnXG4gICAgICAgIHNlbGVjdE5hbWUgbmFtZSBpZiBub3QgZW1wdHkgbmFtZVxuICAgICAgICBzZWFyY2ggPSAnJ1xuICAgICAgICAkKCdhcHBuYW1lJykuaW5uZXJIVE1MID0gbmFtZVxuICAgICAgICBcbiAgICAkKCcjbWFpbicpLmNsYXNzTGlzdC5hZGQgJ2ZhZGUnXG5cbnBvc3Qub24gJ2N1cnJlbnRBcHAnLCBjdXJyZW50QXBwXG5cbmN1cnJlbnRJc0FwcCA9ID0+IG5vdCBjdXJyZW50SXNTY3JpcHQoKVxuY3VycmVudElzU2NyaXB0ID0gLT4gcmVzdWx0c1tjdXJyZW50SW5kZXhdPy5zY3JpcHQ/XG5cbiMgMDAwMDAwMDAwICAgMDAwMDAwMCAgICAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAgICAgICAwMDAwMDAwMCAgXG4jICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgICAgICAgIDAwMCAgICAgICAgMDAwICAgICAgMDAwICAgICAgIFxuIyAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAwMDAwICAwMDAgIDAwMDAgIDAwMCAgICAgIDAwMDAwMDAgICBcbiMgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAwMDAgICAgICAgXG4jICAgIDAwMCAgICAgIDAwMDAwMDAgICAgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMCAgMDAwMDAwMDAgIFxuXG50b2dnbGVBcHBUb2dnbGUgPSAtPlxuICAgIFxuICAgIHByZWZzLnNldCAnYXBwVG9nZ2xlJywgbm90IHByZWZzLmdldCAnYXBwVG9nZ2xlJywgdHJ1ZVxuICAgIFxudG9nZ2xlRG91YmxlQWN0aXZhdGlvbiA9IC0+XG5cbiAgICBwcmVmcy5zZXQgJ2hpZGVPbkRvdWJsZUFjdGl2YXRpb24nLCBub3QgcHJlZnMuZ2V0ICdoaWRlT25Eb3VibGVBY3RpdmF0aW9uJywgZmFsc2VcbiAgICBcbiMgMDAwICAgMDAwICAwMDAgICAwMDAwMDAwICAwMDAwMDAwMDAgICAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAgICAwMDBcbiMgMDAwICAgMDAwICAwMDAgIDAwMCAgICAgICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgMDAwIDAwMFxuIyAwMDAwMDAwMDAgIDAwMCAgMDAwMDAwMCAgICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAwMDAwICAgICAgMDAwMDBcbiMgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAwMDBcbiMgMDAwICAgMDAwICAwMDAgIDAwMDAwMDAgICAgICAwMDAgICAgICAwMDAwMDAwICAgMDAwICAgMDAwICAgICAwMDBcblxubGlzdEhpc3RvcnkgPSAob2Zmc2V0PTApIC0+XG4gICAgXG4gICAgcmVzdWx0cyA9IFtdXG4gICAgaWYgdmFsaWQgYXBwSGlzdFxuICAgICAgICBmb3IgaCBpbiBhcHBIaXN0Lmxpc3RcbiAgICAgICAgICAgIHJlc3VsdCA9IF8uY2xvbmUgaFxuICAgICAgICAgICAgcmVzdWx0LnN0cmluZyA/PSByZXN1bHQubmFtZVxuICAgICAgICAgICAgcmVzdWx0cy5wdXNoIHJlc3VsdFxuICAgIGluZGV4ID0gcmVzdWx0cy5sZW5ndGggLSAxIC0gb2Zmc2V0XG4gICAgc2VsZWN0IGluZGV4XG4gICAgc2hvd0RvdHMoKVxuXG5hZGRUb0hpc3RvcnkgPSAtPlxuICAgIFxuICAgIHJldHVybiBpZiBlbXB0eSByZXN1bHRzW2N1cnJlbnRJbmRleF1cbiAgICBcbiAgICByZXN1bHQgPSBfLmNsb25lIHJlc3VsdHNbY3VycmVudEluZGV4XVxuICAgIGRlbGV0ZSByZXN1bHQuc3RyaW5nXG4gICAgYXBwSGlzdC5hZGQgcmVzdWx0XG4gICAgcHJlZnMuc2V0ICdoaXN0b3J5JywgYXBwSGlzdC5saXN0XG4gICAgXG5vcGVuSW5GaW5kZXIgPSAoKSAtPlxuICAgIFxuICAgIGNoaWxkcC5zcGF3biAnb3Nhc2NyaXB0JywgW1xuICAgICAgICAnLWUnLCAndGVsbCBhcHBsaWNhdGlvbiBcIkZpbmRlclwiJyxcbiAgICAgICAgJy1lJywgXCJyZXZlYWwgUE9TSVggZmlsZSBcXFwiI3thcHBzW2N1cnJlbnROYW1lXX1cXFwiXCIsXG4gICAgICAgICctZScsICdhY3RpdmF0ZScsXG4gICAgICAgICctZScsICdlbmQgdGVsbCddXG5cbiMgIDAwMDAwMDAgIDAwMCAgICAgIDAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAwXG4jIDAwMCAgICAgICAwMDAgICAgICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDBcbiMgMDAwICAgICAgIDAwMCAgICAgIDAwMDAwMDAgICAwMDAwMDAwMDAgIDAwMDAwMDBcbiMgMDAwICAgICAgIDAwMCAgICAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMFxuIyAgMDAwMDAwMCAgMDAwMDAwMCAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwXG5cbmNsZWFyU2VhcmNoID0gLT5cblxuICAgIGlmIHJlc3VsdHMubGVuZ3RoXG4gICAgICAgIHNlYXJjaCA9ICcnXG4gICAgICAgIHJlc3VsdHMgPSBbcmVzdWx0c1tNYXRoLm1pbiBjdXJyZW50SW5kZXgsIHJlc3VsdHMubGVuZ3RoLTFdXVxuICAgICAgICByZXN1bHRzWzBdLnN0cmluZyA9IGN1cnJlbnROYW1lXG4gICAgICAgICQoJ2FwcG5hbWUnKS5pbm5lckhUTUwgPSBjdXJyZW50TmFtZVxuICAgICAgICBjdXJyZW50SW5kZXggPSAwXG4gICAgICAgIHNob3dEb3RzKClcbiAgICBlbHNlXG4gICAgICAgIGRvU2VhcmNoICcnXG5cbnBvc3Qub24gJ2NsZWFyU2VhcmNoJywgIGNsZWFyU2VhcmNoXG5cbiMgMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDBcbiMgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAwICAwMDBcbiMgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgMCAwMDBcbiMgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgIDAwMDBcbiMgMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgICAwMDBcblxuZ2V0U2NyaXB0SWNvbiA9IChzY3JpcHROYW1lKSAtPiBzZXRJY29uIHNjcmlwdHNbc2NyaXB0TmFtZV0uaW1nXG5cbmdldEFwcEljb24gPSAoYXBwTmFtZSkgLT5cblxuICAgIGlmIHNsYXNoLndpbigpXG4gICAgICAgIGFwcEljb24gPSByZXF1aXJlICcuL2V4ZWljb24nXG4gICAgZWxzZVxuICAgICAgICBhcHBJY29uID0gcmVxdWlyZSAnLi9hcHBpY29uJ1xuXG4gICAgYXBwSWNvbi5nZXRcbiAgICAgICAgYXBwUGF0aDogYXBwc1thcHBOYW1lXVxuICAgICAgICBpY29uRGlyOiBpY29uRGlyXG4gICAgICAgIHNpemU6ICAgIDUxMlxuICAgICAgICBjYjogICAgICBzZXRJY29uXG5cbnNldEljb24gPSAoaWNvblBhdGgpIC0+XG4gICAgXG4gICAgJCgnYXBwaWNvbicpLnN0eWxlLmJhY2tncm91bmRJbWFnZSA9IFwidXJsKFxcXCIje3NsYXNoLmZpbGVVcmwgaWNvblBhdGh9XFxcIilcIlxuXG4jICAwMDAwMDAwICAwMDAwMDAwMCAgMDAwICAgICAgMDAwMDAwMDAgICAwMDAwMDAwICAwMDAwMDAwMDBcbiMgMDAwICAgICAgIDAwMCAgICAgICAwMDAgICAgICAwMDAgICAgICAgMDAwICAgICAgICAgIDAwMFxuIyAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgICAgIDAwMDAwMDAgICAwMDAgICAgICAgICAgMDAwXG4jICAgICAgMDAwICAwMDAgICAgICAgMDAwICAgICAgMDAwICAgICAgIDAwMCAgICAgICAgICAwMDBcbiMgMDAwMDAwMCAgIDAwMDAwMDAwICAwMDAwMDAwICAwMDAwMDAwMCAgIDAwMDAwMDAgICAgIDAwMFxuXG5zZWxlY3QgPSAoaW5kZXgpID0+XG4gICAgY3VycmVudEluZGV4ID0gKGluZGV4ICsgcmVzdWx0cy5sZW5ndGgpICUgcmVzdWx0cy5sZW5ndGhcbiAgICBpZiBlbXB0eSByZXN1bHRzW2N1cnJlbnRJbmRleF1cbiAgICAgICAgbG9nICdkYWZ1az8gaW5kZXg6JywgaW5kZXgsICdyZXN1bHRzOicsIHJlc3VsdHNcbiAgICAgICAgcmV0dXJuXG4gICAgY3VycmVudE5hbWUgPSByZXN1bHRzW2N1cnJlbnRJbmRleF0ubmFtZVxuICAgICQoJ2FwcG5hbWUnKS5pbm5lckhUTUwgPSByZXN1bHRzW2N1cnJlbnRJbmRleF0uc3RyaW5nXG4gICAgJCgnLmN1cnJlbnQnKT8uY2xhc3NMaXN0LnJlbW92ZSAnY3VycmVudCdcbiAgICAkKFwiZG90XyN7Y3VycmVudEluZGV4fVwiKT8uY2xhc3NMaXN0LmFkZCAnY3VycmVudCdcbiAgICBpZiBjdXJyZW50SXNBcHAoKVxuICAgICAgICBnZXRBcHBJY29uIGN1cnJlbnROYW1lXG4gICAgZWxzZVxuICAgICAgICBnZXRTY3JpcHRJY29uIGN1cnJlbnROYW1lXG5cbnNlbGVjdE5hbWUgPSAobmFtZSkgLT5cbiAgICBcbiAgICByZXR1cm4gaWYgZW1wdHkgbmFtZVxuICAgIHNlbGVjdCByZXN1bHRzLmZpbmRJbmRleCAocikgLT5cbiAgICAgICAgcj8ubmFtZS50b0xvd2VyQ2FzZSgpID09IG5hbWUudG9Mb3dlckNhc2UoKVxuXG4jICAgMDAwMDAwMCAgICAgMDAwMDAwMCAgIDAwMDAwMDAwMCAgIDAwMDAwMDBcbiMgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDBcbiMgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDAwMDAwXG4jICAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgICAgICAwMDBcbiMgICAwMDAwMDAwICAgICAwMDAwMDAwICAgICAgMDAwICAgICAwMDAwMDAwXG5cbnNob3dEb3RzID0gLT5cblxuICAgIGRvdHMgPSQgJ2FwcGRvdHMnXG4gICAgZG90cy5pbm5lckhUTUwgPSAnJ1xuXG4gICAgd2luV2lkdGggPSBzdygpXG4gICAgc2V0U3R5bGUgJyNhcHBuYW1lJywgJ2ZvbnQtc2l6ZScsIFwiI3twYXJzZUludCAxMCsyKih3aW5XaWR0aC0xMDApLzEwMH1weFwiXG5cbiAgICByZXR1cm4gaWYgcmVzdWx0cy5sZW5ndGggPCAyXG5cbiAgICBkb3RyID0gZWxlbSBpZDonYXBwZG90cidcbiAgICBkb3RzLmFwcGVuZENoaWxkIGRvdHJcblxuICAgIHMgPSB3aW5XaWR0aCAvIHJlc3VsdHMubGVuZ3RoXG4gICAgcyA9IGNsYW1wIDEsIHdpbldpZHRoLzEwMCwgc1xuICAgIHMgPSBwYXJzZUludCBzXG4gICAgc2V0U3R5bGUgJy5hcHBkb3QnLCAnd2lkdGgnLCBcIiN7c31weFwiXG4gICAgc2V0U3R5bGUgJy5hcHBkb3QnLCAnaGVpZ2h0JywgXCIje3N9cHhcIlxuXG4gICAgZm9yIGkgaW4gWzAuLi5yZXN1bHRzLmxlbmd0aF1cbiAgICAgICAgZG90ID0gZWxlbSAnc3BhbicsIGNsYXNzOidhcHBkb3QnLCBpZDogXCJkb3RfI3tpfVwiXG4gICAgICAgIGlmIGkgPT0gY3VycmVudEluZGV4XG4gICAgICAgICAgICBkb3QuY2xhc3NMaXN0LmFkZCAnY3VycmVudCdcbiAgICAgICAgZG90ci5hcHBlbmRDaGlsZCBkb3RcblxuIyAwMDAwMDAwICAgIDAwMCAgICAgICAwMDAwMDAwICAgIDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgMDAwICAgMDAwMDAwMCAgMDAwMDAwMDAwICBcbiMgMDAwICAgMDAwICAwMDAgICAgICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgIDAwMCAgIDAwMCAgICAgIDAwMCAgMDAwICAgICAgICAgIDAwMCAgICAgXG4jIDAwMDAwMDAgICAgMDAwICAgICAgMDAwMDAwMDAwICAwMDAgICAgICAgMDAwMDAwMCAgICAwMDAgICAgICAwMDAgIDAwMDAwMDAgICAgICAwMDAgICAgIFxuIyAwMDAgICAwMDAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgMDAwICAgMDAwICAgICAgMDAwICAgICAgIDAwMCAgICAgMDAwICAgICBcbiMgMDAwMDAwMCAgICAwMDAwMDAwICAwMDAgICAwMDAgICAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgIDAwMCAgMDAwMDAwMCAgICAgIDAwMCAgICAgXG5cbmJsYWNrbGlzdCA9IC0+XG5cbiAgICBpZ25vcmUgPSBwcmVmcy5nZXQgJ2lnbm9yZScsIFtdXG4gICAgXG4gICAgXy5wdWxsIGlnbm9yZSwgYXBwc1tjdXJyZW50TmFtZV1cbiAgICBfLnB1bGwgaWdub3JlLCBudWxsXG4gICAgaWYgdmFsaWQgYXBwc1tjdXJyZW50TmFtZV1cbiAgICAgICAgaWdub3JlLnB1c2ggYXBwc1tjdXJyZW50TmFtZV1cbiAgICBlbHNlXG4gICAgICAgIGxvZyBcImNhbid0IGlnbm9yZSAnI3tjdXJyZW50TmFtZX0nXCJcbiAgICBcbiAgICBwcmVmcy5zZXQgJ2lnbm9yZScsIGlnbm9yZVxuICAgIFxuICAgIGRlbGV0ZSBhcHBzW2N1cnJlbnROYW1lXVxuICAgIFxuICAgIHJlc3VsdHMuc3BsaWNlIGN1cnJlbnRJbmRleCwgMVxuICAgIFxuICAgIHNlbGVjdCBjdXJyZW50SW5kZXhcbiAgICBcbiMgIDAwMDAwMDAgIDAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAwICAgIDAwMDAwMDAgIDAwMCAgIDAwMFxuIyAwMDAgICAgICAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwXG4jIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwMDAwMDAwICAwMDAwMDAwICAgIDAwMCAgICAgICAwMDAwMDAwMDBcbiMgICAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMFxuIyAwMDAwMDAwICAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgMDAwMDAwMCAgMDAwICAgMDAwXG5cbmRvU2VhcmNoID0gKHMpIC0+XG4gICAgXG4gICAgc2VhcmNoICA9IHNcbiAgICBuYW1lcyAgID0gYWxsS2V5c1xuICAgIGZ1enppZWQgPSBmdXp6eS5maWx0ZXIgc2VhcmNoLCBuYW1lcywgcHJlOiAnPGI+JywgcG9zdDogJzwvYj4nXG4gICAgZnV6emllZCA9IF8uc29ydEJ5IGZ1enppZWQsIChvKSAtPiAyIC0gZnV6emFsZHJpbi5zY29yZSBvLm9yaWdpbmFsLCBzZWFyY2hcblxuICAgIGlmIHNlYXJjaC5sZW5ndGhcbiAgICAgICAgaWYgcHMgPSBwcmVmcy5nZXQgXCJzZWFyY2g6I3tzZWFyY2h9XCJcbiAgICAgICAgICAgIGZ1enppZWQgPSBfLnNvcnRCeSBmdXp6aWVkLCAobykgLT4gTnVtYmVyLk1BWF9TQUZFX0lOVEVHRVIgLSAocHNbby5vcmlnaW5hbF0gPyAwKVxuXG4gICAgcmVzdWx0cyA9IFtdXG4gICAgZm9yIGYgaW4gZnV6emllZFxuICAgICAgICByID0gbmFtZTogZi5vcmlnaW5hbCwgc3RyaW5nOiBmLnN0cmluZ1xuICAgICAgICByLnNjcmlwdCA9IHNjcmlwdHNbci5uYW1lXSBpZiBzY3JpcHRzW3IubmFtZV1cbiAgICAgICAgcmVzdWx0cy5wdXNoIHJcblxuICAgIGlmIHZhbGlkIHJlc3VsdHNcbiAgICAgICAgaWYgcyA9PSAnJ1xuICAgICAgICAgICAgaWYgc2xhc2gud2luKClcbiAgICAgICAgICAgICAgICBzZWxlY3ROYW1lICd0ZXJtaW5hbCdcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICBzZWxlY3ROYW1lICdGaW5kZXInXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIHNlbGVjdCAwXG4gICAgICAgIHNob3dEb3RzKClcbiAgICBlbHNlXG4gICAgICAgICQoJ2FwcGRvdHMnKS5pbm5lckhUTUwgPSAnJ1xuICAgICAgICAkKCdhcHBuYW1lJykuaW5uZXJIVE1MID0gXCI8Yj4je3NlYXJjaH08L2I+XCJcblxuY29tcGxldGUgID0gKGtleSkgLT4gZG9TZWFyY2ggc2VhcmNoICsga2V5XG5iYWNrc3BhY2UgPSAgICAgICAtPiBkb1NlYXJjaCBzZWFyY2guc3Vic3RyIDAsIHNlYXJjaC5sZW5ndGgtMVxuXG5jYW5jZWxTZWFyY2hPckNsb3NlID0gLT5cbiAgICBcbiAgICBpcGMuc2VuZCAnY2xvc2VBYm91dCdcbiAgICBcbiAgICBpZiBzZWFyY2gubGVuZ3RoXG4gICAgICAgIGRvU2VhcmNoICcnXG4gICAgZWxzZVxuICAgICAgICBwb3N0LnRvTWFpbiAnY2FuY2VsJ1xuXG5jbGlja0lEID0gZG93bklEID0gMFxud2luZG93Lm9ubW91c2Vkb3duICA9IChlKSAtPiBjbGlja0lEICs9IDEgOyBkb3duSUQgPSBjbGlja0lEXG53aW5kb3cub25tb3VzZXVwICAgID0gKGUpIC0+IG9wZW5DdXJyZW50KCkgaWYgZG93bklEID09IGNsaWNrSURcbndpbmRvdy5vbm1vdXNlbW92ZSAgPSAoZSkgLT4gaWYgZS5idXR0b25zIHRoZW4gZG93bklEID0gLTFcbndpbmRvdy5vbnVubG9hZCA9IC0+IGRvY3VtZW50Lm9ua2V5ZG93biA9IG51bGxcbndpbmRvdy5vbmJsdXIgICA9IC0+IHdpbkhpZGUoKVxud2luZG93Lm9ucmVzaXplID0gLT4gc2hvd0RvdHMoKVxuXG53aGVlbEFjY3UgPSAwXG53aW5kb3cub253aGVlbCAgPSAoZXZlbnQpIC0+XG4gICAgd2hlZWxBY2N1ICs9IChldmVudC5kZWx0YVggKyBldmVudC5kZWx0YVkpLzQ0XG4gICAgaWYgd2hlZWxBY2N1ID4gMVxuICAgICAgICBzZWxlY3QgY3VycmVudEluZGV4KzEgJSByZXN1bHRzLmxlbmd0aFxuICAgICAgICB3aGlsZSB3aGVlbEFjY3UgPiAxXG4gICAgICAgICAgICB3aGVlbEFjY3UgLT0gMVxuICAgIGVsc2UgaWYgd2hlZWxBY2N1IDwgLTFcbiAgICAgICAgc2VsZWN0IGN1cnJlbnRJbmRleCtyZXN1bHRzLmxlbmd0aC0xICUgcmVzdWx0cy5sZW5ndGhcbiAgICAgICAgd2hpbGUgd2hlZWxBY2N1IDwgLTFcbiAgICAgICAgICAgIHdoZWVsQWNjdSArPSAxXG5cbiMgIDAwMDAwMDAgIDAwMCAgMDAwMDAwMCAgMDAwMDAwMDBcbiMgMDAwICAgICAgIDAwMCAgICAgMDAwICAgMDAwXG4jIDAwMDAwMDAgICAwMDAgICAgMDAwICAgIDAwMDAwMDBcbiMgICAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwXG4jIDAwMDAwMDAgICAwMDAgIDAwMDAwMDAgIDAwMDAwMDAwXG5cbnNjcmVlblNpemUgPSAtPiBlbGVjdHJvbi5yZW1vdGUuc2NyZWVuLmdldFByaW1hcnlEaXNwbGF5KCkud29ya0FyZWFTaXplXG5cbmNsYW1wQm91bmRzID0gKGIpIC0+XG4gICAgYi53aWR0aCA9IGNsYW1wIDIwMCwgNjAwLCBiLndpZHRoXG4gICAgYi5oZWlnaHQgPSBjbGFtcCAyMDAsIDYwMCwgYi5oZWlnaHRcbiAgICBiLnggPSBjbGFtcCAwLCBzY3JlZW5TaXplKCkud2lkdGggLSBiLndpZHRoLCBiLnhcbiAgICBiLnkgPSBjbGFtcCAwLCBzY3JlZW5TaXplKCkuaGVpZ2h0IC0gYi5oZWlnaHQsIGIueVxuICAgIGJcblxuc2l6ZVdpbmRvdyA9IChkKSAtPlxuICAgIGIgPSB3aW4uZ2V0Qm91bmRzKClcbiAgICBjeCA9IGIueCArIGIud2lkdGgvMlxuICAgIGIud2lkdGgrPWRcbiAgICBiLmhlaWdodCs9ZFxuICAgIGNsYW1wQm91bmRzIGJcbiAgICBiLnggPSBjeCAtIGIud2lkdGgvMlxuICAgIHdpbi5zZXRCb3VuZHMgY2xhbXBCb3VuZHMgYlxuXG5tb3ZlV2luZG93ID0gKGR4LGR5KSAtPlxuICAgIGIgPSB3aW4uZ2V0Qm91bmRzKClcbiAgICBiLngrPWR4XG4gICAgYi55Kz1keVxuICAgIHdpbi5zZXRCb3VuZHMgY2xhbXBCb3VuZHMgYlxuXG5iaWdnZXJXaW5kb3cgICAgID0gLT4gc2l6ZVdpbmRvdyA1MFxuc21hbGxlcldpbmRvdyAgICA9IC0+IHNpemVXaW5kb3cgLTUwXG5taW5pbWl6ZVdpbmRvdyAgID0gLT4gd2luLnNldEJvdW5kcyB4OnNjcmVlblNpemUoKS53aWR0aC8yLTEwMCwgeTowLCB3aWR0aDoyMDAsIGhlaWdodDoyMDBcbm1heGltaXplV2luZG93ICAgPSAtPiB3aW4uc2V0Qm91bmRzIHg6c2NyZWVuU2l6ZSgpLndpZHRoLzItMzAwLCB5OjAsIHdpZHRoOjYwMCwgaGVpZ2h0OjYwMFxudG9nZ2xlV2luZG93U2l6ZSA9IC0+IGlmIHdpbi5nZXRCb3VuZHMoKS53aWR0aCA+IDIwMCB0aGVuIG1pbmltaXplV2luZG93KCkgZWxzZSBtYXhpbWl6ZVdpbmRvdygpXG5cbnByZXZlbnRLZXlSZXBlYXQgPSAtPiBsb2cgJ2tleVJlcGVhdCBhaGVhZCEnXG5cbiMgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwICAgMDAwXG4jIDAwMCAgMDAwICAgMDAwICAgICAgICAwMDAgMDAwXG4jIDAwMDAwMDAgICAgMDAwMDAwMCAgICAgMDAwMDBcbiMgMDAwICAwMDAgICAwMDAgICAgICAgICAgMDAwXG4jIDAwMCAgIDAwMCAgMDAwMDAwMDAgICAgIDAwMFxuXG5kb2N1bWVudC5vbmtleWRvd24gPSAoZXZlbnQpIC0+XG5cbiAgICB7IG1vZCwga2V5LCBjb21ibywgY2hhciB9ID0ga2V5aW5mby5mb3JFdmVudCBldmVudFxuXG4gICAgbG9nIGNvbWJvIGlmIGFyZ3MudmVyYm9zZVxuICAgIFxuICAgIGlmIGNoYXI/IGFuZCBjb21iby5sZW5ndGggPT0gMVxuICAgICAgICBjb21wbGV0ZSBrZXlcbiAgICAgICAgcmV0dXJuXG5cbiAgICBzd2l0Y2ggY29tYm9cbiAgICAgICAgd2hlbiAnZjEnICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoZW4gcHJldmVudEtleVJlcGVhdCgpXG4gICAgICAgIHdoZW4gJ2RlbGV0ZScgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGVuIGJsYWNrbGlzdCgpXG4gICAgICAgIHdoZW4gJ2JhY2tzcGFjZScgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGVuIGJhY2tzcGFjZSgpXG4gICAgICAgIHdoZW4gJ2NvbW1hbmQrYmFja3NwYWNlJywgICAgICAgJ2N0cmwrYmFja3NwYWNlJyAgICB0aGVuIGRvU2VhcmNoICcnXG4gICAgICAgIHdoZW4gJ2NvbW1hbmQraScsICdjdHJsK2knICAgICAgICAgICAgICAgICAgICAgICAgICB0aGVuIHNjaGVtZS50b2dnbGUoKVxuICAgICAgICB3aGVuICdlc2MnICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhlbiBjYW5jZWxTZWFyY2hPckNsb3NlKClcbiAgICAgICAgd2hlbiAnZG93bicsICdyaWdodCcgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoZW4gc2VsZWN0IGN1cnJlbnRJbmRleCsxXG4gICAgICAgIHdoZW4gJ3VwJyAgLCAnbGVmdCcgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGVuIHNlbGVjdCBjdXJyZW50SW5kZXgtMVxuICAgICAgICB3aGVuICdlbnRlcicgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhlbiBvcGVuQ3VycmVudCgpXG4gICAgICAgIHdoZW4gJ2NvbW1hbmQrYWx0K2knLCAgICAgICAgICAgJ2N0cmwrYWx0K2knICAgICAgICB0aGVuIGFyZ3MuZGVidWcgPSB0cnVlOyB3aW4ud2ViQ29udGVudHMub3BlbkRldlRvb2xzKClcbiAgICAgICAgd2hlbiAnY29tbWFuZCs9JywgICAgICAgICAgICAgICAnY3RybCs9JyAgICAgICAgICAgIHRoZW4gYmlnZ2VyV2luZG93KClcbiAgICAgICAgd2hlbiAnY29tbWFuZCstJywgICAgICAgICAgICAgICAnY3RybCstJyAgICAgICAgICAgIHRoZW4gc21hbGxlcldpbmRvdygpXG4gICAgICAgIHdoZW4gJ2NvbW1hbmQrcicsICAgICAgICAgICAgICAgJ2N0cmwrcicgICAgICAgICAgICB0aGVuIHBvc3QudG9NYWluICdmaW5kQXBwcydcbiAgICAgICAgd2hlbiAnY29tbWFuZCtoJywgICAgICAgICAgICAgICAnYWx0K2gnICAgICAgICAgICAgIHRoZW4gbGlzdEhpc3RvcnkoKVxuICAgICAgICB3aGVuICdjb21tYW5kK2YnLCAgICAgICAgICAgICAgICdjdHJsK2YnICAgICAgICAgICAgdGhlbiBvcGVuSW5GaW5kZXIoKVxuICAgICAgICB3aGVuICdjb21tYW5kK3QnLCAgICAgICAgICAgICAgICdjdHJsK3QnICAgICAgICAgICAgdGhlbiB0b2dnbGVBcHBUb2dnbGUoKVxuICAgICAgICB3aGVuICdjb21tYW5kK2QnLCAgICAgICAgICAgICAgICdjdHJsK2QnICAgICAgICAgICAgdGhlbiB0b2dnbGVEb3VibGVBY3RpdmF0aW9uKClcbiAgICAgICAgd2hlbiAnYWx0K2NvbW1hbmQrLycsICAgICAgICAgICAnYWx0K2N0cmwrLycgICAgICAgIHRoZW4gcG9zdC50b01haW4gJ2Fib3V0J1xuICAgICAgICB3aGVuICdjb21tYW5kKywnLCAgICAgICAgICAgICAgICdjdHJsKywnICAgICAgICAgICAgdGhlbiBvcGVuIHByZWZzLnN0b3JlLmZpbGVcbiAgICAgICAgd2hlbiAnY29tbWFuZCt1cCcsICAgICAgICAgICAgICAnY3RybCt1cCcgICAgICAgICAgIHRoZW4gbW92ZVdpbmRvdyAwLC0yMFxuICAgICAgICB3aGVuICdjb21tYW5kK2Rvd24nLCAgICAgICAgICAgICdjdHJsK2Rvd24nICAgICAgICAgdGhlbiBtb3ZlV2luZG93IDAsIDIwXG4gICAgICAgIHdoZW4gJ2NvbW1hbmQrbGVmdCcsICAgICAgICAgICAgJ2N0cmwrbGVmdCcgICAgICAgICB0aGVuIG1vdmVXaW5kb3cgLTIwLCAwXG4gICAgICAgIHdoZW4gJ2NvbW1hbmQrcmlnaHQnLCAgICAgICAgICAgJ2N0cmwrcmlnaHQnICAgICAgICB0aGVuIG1vdmVXaW5kb3cgIDIwLCAwXG4gICAgICAgIHdoZW4gJ2NvbW1hbmQrMCcsJ2NvbW1hbmQrbycsICAgJ2N0cmwrMCcsJ2N0cmwrbycgICB0aGVuIHRvZ2dsZVdpbmRvd1NpemUoKVxuXG53aW5NYWluKClcbiJdfQ==
//# sourceURL=../coffee/kappo.coffee