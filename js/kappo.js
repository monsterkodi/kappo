// koffee 1.14.0

/*
000   000   0000000   00000000   00000000    0000000
000  000   000   000  000   000  000   000  000   000
0000000    000000000  00000000   00000000   000   000
000  000   000   000  000        000        000   000
000   000  000   000  000        000         0000000
 */
var $, _, addToHistory, allKeys, appHist, apps, args, backspace, biggerWindow, blacklist, cancelSearchOrClose, childIndex, childp, clamp, clampBounds, clearSearch, clickID, clipboard, complete, currentApp, currentIndex, currentIsApp, currentIsScript, currentName, doSearch, downID, electron, elem, empty, fs, fuzzaldrin, fuzzy, getAppIcon, getBounds, getScriptIcon, history, iconDir, ipc, kerror, keyinfo, klog, kpos, listHistory, maximizeWindow, minimizeWindow, moveWindow, open, openCurrent, openDevTools, openInFinder, pkg, post, prefs, preventKeyRepeat, ref, results, scheme, screenSize, scripts, search, select, selectName, setBounds, setIcon, setStyle, showDots, sizeWindow, slash, smallerWindow, srcmap, stopEvent, sw, toggleAppToggle, toggleDoubleActivation, toggleWindowSize, valid, wheelAccu, winHide, winMain;

ref = require('kxk'), post = ref.post, args = ref.args, srcmap = ref.srcmap, childIndex = ref.childIndex, setStyle = ref.setStyle, stopEvent = ref.stopEvent, keyinfo = ref.keyinfo, history = ref.history, valid = ref.valid, empty = ref.empty, childp = ref.childp, scheme = ref.scheme, clamp = ref.clamp, prefs = ref.prefs, elem = ref.elem, fs = ref.fs, slash = ref.slash, open = ref.open, klog = ref.klog, kerror = ref.kerror, kpos = ref.kpos, sw = ref.sw, $ = ref.$, _ = ref._;

pkg = require('../package.json');

fuzzy = require('fuzzy');

fuzzaldrin = require('fuzzaldrin');

electron = require('electron');

clipboard = electron.clipboard;

iconDir = slash.resolve((post.get('userData')) + "/icons");

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
    post.on('fade', function() {
        var restore;
        if (!slash.win()) {
            return;
        }
        $('#main').classList.remove('fade');
        $('#main').style.opacity = 0;
        restore = function() {
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
        return post.toMain('hideWin');
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
            klog('openCurrent', currentName);
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
        klog("currentApp " + appName + " -> " + currentName, lastMatches, scriptMatches);
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
    klog("listHistory " + offset, appHist.list);
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
    klog("listHistory index " + index, results);
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

openDevTools = function() {
    return post.toMain('devTools');
};

screenSize = function() {
    var ss;
    ss = electron.ipcRenderer.sendSync('getScreenSize');
    klog('screenSize', ss);
    return ss;
};

clampBounds = function(b) {
    b.width = clamp(200, 600, b.width);
    b.height = clamp(200, 600, b.height);
    b.x = clamp(0, screenSize().width - b.width, b.x);
    b.y = clamp(0, screenSize().height - b.height, b.y);
    return b;
};

getBounds = function() {
    var b;
    b = electron.ipcRenderer.sendSync('getWinBounds');
    klog('getBounds', b);
    return b;
};

setBounds = function(b) {
    electron.ipcRenderer.send('setWinBounds', b);
    return klog('setBounds', b);
};

sizeWindow = function(d) {
    var b, cx;
    b = getBounds();
    cx = b.x + b.width / 2;
    b.width += d;
    b.height += d;
    clampBounds(b);
    b.x = cx - b.width / 2;
    return setBounds(clampBounds(b));
};

moveWindow = function(dx, dy) {
    var b;
    b = getBounds();
    b.x += dx;
    b.y += dy;
    return setBounds(clampBounds(b));
};

biggerWindow = function() {
    return sizeWindow(50);
};

smallerWindow = function() {
    return sizeWindow(-50);
};

minimizeWindow = function() {
    return setBounds({
        x: screenSize().width / 2 - 100,
        y: 0,
        width: 200,
        height: 200
    });
};

maximizeWindow = function() {
    return setBounds({
        x: screenSize().width / 2 - 300,
        y: 0,
        width: 600,
        height: 600
    });
};

toggleWindowSize = function() {
    if (getBounds().width > 200) {
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
    klog(combo);
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
            return openDevTools();
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoia2FwcG8uanMiLCJzb3VyY2VSb290IjoiLi4vY29mZmVlIiwic291cmNlcyI6WyJrYXBwby5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7OztBQUFBLElBQUE7O0FBUUEsTUFDZ0YsT0FBQSxDQUFRLEtBQVIsQ0FEaEYsRUFBRSxlQUFGLEVBQVEsZUFBUixFQUFjLG1CQUFkLEVBQXNCLDJCQUF0QixFQUFrQyx1QkFBbEMsRUFBNEMseUJBQTVDLEVBQXVELHFCQUF2RCxFQUFnRSxxQkFBaEUsRUFBeUUsaUJBQXpFLEVBQWdGLGlCQUFoRixFQUF1RixtQkFBdkYsRUFDRSxtQkFERixFQUNVLGlCQURWLEVBQ2lCLGlCQURqQixFQUN3QixlQUR4QixFQUM4QixXQUQ5QixFQUNrQyxpQkFEbEMsRUFDeUMsZUFEekMsRUFDK0MsZUFEL0MsRUFDcUQsbUJBRHJELEVBQzZELGVBRDdELEVBQ21FLFdBRG5FLEVBQ3VFLFNBRHZFLEVBQzBFOztBQUUxRSxHQUFBLEdBQWUsT0FBQSxDQUFRLGlCQUFSOztBQUNmLEtBQUEsR0FBZSxPQUFBLENBQVEsT0FBUjs7QUFDZixVQUFBLEdBQWUsT0FBQSxDQUFRLFlBQVI7O0FBQ2YsUUFBQSxHQUFlLE9BQUEsQ0FBUSxVQUFSOztBQUVmLFNBQUEsR0FBZSxRQUFRLENBQUM7O0FBQ3hCLE9BQUEsR0FBZSxLQUFLLENBQUMsT0FBTixDQUFnQixDQUFDLElBQUksQ0FBQyxHQUFMLENBQVMsVUFBVCxDQUFELENBQUEsR0FBc0IsUUFBdEM7O0FBQ2YsR0FBQSxHQUFlLFFBQVEsQ0FBQzs7QUFFeEIsT0FBQSxHQUFlOztBQUNmLE9BQUEsR0FBZTs7QUFDZixJQUFBLEdBQWU7O0FBQ2YsT0FBQSxHQUFlOztBQUNmLE9BQUEsR0FBZTs7QUFDZixNQUFBLEdBQWU7O0FBQ2YsV0FBQSxHQUFlOztBQUNmLFlBQUEsR0FBZTs7QUFFZixJQUFJLENBQUMsRUFBTCxDQUFRLFNBQVIsRUFBa0IsU0FBQyxJQUFEO1dBQVEsT0FB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UyxXQXhCVDtBQUFBLGFBd0JxQixXQXhCckI7QUFBQSxhQXdCb0MsUUF4QnBDO0FBQUEsYUF3QjZDLFFBeEI3QzttQkF3QjZELGdCQUFBLENBQUE7QUF4QjdEO0FBVmlCOztBQW9DckIsT0FBQSxDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiIyMjXG4wMDAgICAwMDAgICAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAwMDAwMCAgICAwMDAwMDAwXG4wMDAgIDAwMCAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMFxuMDAwMDAwMCAgICAwMDAwMDAwMDAgIDAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAgICAwMDBcbjAwMCAgMDAwICAgMDAwICAgMDAwICAwMDAgICAgICAgIDAwMCAgICAgICAgMDAwICAgMDAwXG4wMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgICAwMDAgICAgICAgICAwMDAwMDAwXG4jIyNcblxueyBwb3N0LCBhcmdzLCBzcmNtYXAsIGNoaWxkSW5kZXgsIHNldFN0eWxlLCBzdG9wRXZlbnQsIGtleWluZm8sIGhpc3RvcnksIHZhbGlkLCBlbXB0eSwgY2hpbGRwLFxuICBzY2hlbWUsIGNsYW1wLCBwcmVmcywgZWxlbSwgZnMsIHNsYXNoLCBvcGVuLCBrbG9nLCBrZXJyb3IsIGtwb3MsIHN3LCAkLCBfIH0gPSByZXF1aXJlICdreGsnXG5cbnBrZyAgICAgICAgICA9IHJlcXVpcmUgJy4uL3BhY2thZ2UuanNvbidcbmZ1enp5ICAgICAgICA9IHJlcXVpcmUgJ2Z1enp5J1xuZnV6emFsZHJpbiAgID0gcmVxdWlyZSAnZnV6emFsZHJpbidcbmVsZWN0cm9uICAgICA9IHJlcXVpcmUgJ2VsZWN0cm9uJ1xuXG5jbGlwYm9hcmQgICAgPSBlbGVjdHJvbi5jbGlwYm9hcmRcbmljb25EaXIgICAgICA9IHNsYXNoLnJlc29sdmUgXCIje3Bvc3QuZ2V0KCd1c2VyRGF0YScpfS9pY29uc1wiXG5pcGMgICAgICAgICAgPSBlbGVjdHJvbi5pcGNSZW5kZXJlclxuICAgIFxuYXBwSGlzdCAgICAgID0gbnVsbFxucmVzdWx0cyAgICAgID0gW11cbmFwcHMgICAgICAgICA9IHt9XG5zY3JpcHRzICAgICAgPSB7fVxuYWxsS2V5cyAgICAgID0gW11cbnNlYXJjaCAgICAgICA9ICcnXG5jdXJyZW50TmFtZSAgPSAnJ1xuY3VycmVudEluZGV4ID0gMFxuXG5wb3N0Lm9uICdtYWlubG9nJyAodGV4dCkgLT4gbG9nIFwiPj4+IFwiICsgdGV4dFxucG9zdC5vbiAnYXBwc0ZvdW5kJyAtPiB7IGFwcHMsIHNjcmlwdHMsIGFsbEtleXMgfSA9IHBvc3QuZ2V0ICdhcHBzJ1xuXG4jIDAwMCAgIDAwMCAgMDAwICAwMDAgICAwMDAgIDAwICAgICAwMCAgIDAwMDAwMDAgICAwMDAgIDAwMCAgIDAwMFxuIyAwMDAgMCAwMDAgIDAwMCAgMDAwMCAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAwICAwMDBcbiMgMDAwMDAwMDAwICAwMDAgIDAwMCAwIDAwMCAgMDAwMDAwMDAwICAwMDAwMDAwMDAgIDAwMCAgMDAwIDAgMDAwXG4jIDAwMCAgIDAwMCAgMDAwICAwMDAgIDAwMDAgIDAwMCAwIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMCAgMDAwMFxuIyAwMCAgICAgMDAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAwMDAgICAwMDBcblxud2luTWFpbiA9IC0+XG5cbiAgICB3aW5kb3cub25lcnJvciA9IChtc2csIHNvdXJjZSwgbGluZSwgY29sLCBlcnIpIC0+XG4gICAgICAgIHNyY21hcC5sb2dFcnIgZXJyXG4gICAgICAgIHRydWVcbiAgICBcbiAgICBrbG9nLnNsb2cuaWNvbiA9IHNsYXNoLmZpbGVVcmwgc2xhc2guam9pbiBfX2Rpcm5hbWUsICcuLicgJ2ltZycgJ21lbnVAMngucG5nJ1xuICAgIFxuICAgIHBvc3Qub24gJ2ZhZGUnIC0+XG4gICAgICAgIFxuICAgICAgICBpZiBub3Qgc2xhc2gud2luKClcbiAgICAgICAgICAgICMgd2luLnNob3coKVxuICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgICAgICBcbiAgICAgICAgIyBbeCx5XSA9IHdpbi5nZXRQb3NpdGlvbigpICAgICAjIGVuYWJsZSBzbW9vdGggZmFkZSBvbiB3aW5kb3dzOlxuICAgICAgICAjIHdpbi5zZXRQb3NpdGlvbiAtMTAwMDAsLTEwMDAwICMgbW92ZSB3aW5kb3cgb2Zmc2NyZWVuIGJlZm9yZSBzaG93XG4gICAgICAgICMgd2luLnNob3coKVxuICAgICAgICAkKCcjbWFpbicpLmNsYXNzTGlzdC5yZW1vdmUgJ2ZhZGUnXG4gICAgICAgICQoJyNtYWluJykuc3R5bGUub3BhY2l0eSA9IDBcbiAgICAgICAgXG4gICAgICAgIHJlc3RvcmUgPSAtPiBcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgIyBpZiB4IDwgLTEwIG9yIHkgPCAtMTAgIyBrZXkgcmVwZWF0IGhpY2t1cCAnZml4J1xuICAgICAgICAgICAgICAgICMgYiA9IHdpbi5nZXRCb3VuZHMoKVxuICAgICAgICAgICAgICAgICMgeCA9IChzY3JlZW5TaXplKCkud2lkdGggLSBiLndpZHRoKS8yXG4gICAgICAgICAgICAgICAgIyB5ID0gMFxuICAgICAgICAgICAgIyBlbHNlXG4gICAgICAgICAgICAgICAgIyB3aW4uc2V0UG9zaXRpb24geCx5XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAkKCcjbWFpbicpLmNsYXNzTGlzdC5hZGQgJ2ZhZGUnXG4gICAgICAgICAgICBcbiAgICAgICAgc2V0VGltZW91dCByZXN0b3JlLCAzMCAjIGdpdmUgd2luZG93cyBzb21lIHRpbWUgdG8gZG8gaXQncyBmbGlja2VyaW5nXG4gICAgICAgIFxuICAgIHByZWZzLmluaXQoKVxuXG4gICAgeyBhcHBzLCBzY3JpcHRzLCBhbGxLZXlzIH0gPSBwb3N0LmdldCAnYXBwcydcblxuICAgIGFwcEhpc3QgPSBuZXcgaGlzdG9yeVxuICAgICAgICBsaXN0OiAgICAgIHByZWZzLmdldCAnaGlzdG9yeScgW11cbiAgICAgICAgbWF4TGVuZ3RoOiBwcmVmcy5nZXQgJ21heEhpc3RvcnlMZW5ndGgnIDEwXG5cbiAgICBzY2hlbWUuc2V0IHByZWZzLmdldCAnc2NoZW1lJyAnYnJpZ2h0J1xuICAgIFxud2luSGlkZSA9IC0+IFxuXG4gICAgaWYgbm90IGFyZ3MuZGVidWdcbiAgICAgICAgcG9zdC50b01haW4gJ2hpZGVXaW4nXG4gICAgXG4jICAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAwMDAwMCAgMDAwICAgMDAwXG4jIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwMCAgMDAwXG4jIDAwMCAgIDAwMCAgMDAwMDAwMDAgICAwMDAwMDAwICAgMDAwIDAgMDAwXG4jIDAwMCAgIDAwMCAgMDAwICAgICAgICAwMDAgICAgICAgMDAwICAwMDAwXG4jICAwMDAwMDAwICAgMDAwICAgICAgICAwMDAwMDAwMCAgMDAwICAgMDAwXG5cbm9wZW5DdXJyZW50ID0gLT5cblxuICAgIGlwYy5zZW5kICdjbG9zZUFib3V0J1xuICAgIFxuICAgIGlmIGN1cnJlbnRJbmRleCA+IDAgYW5kIHNlYXJjaC5sZW5ndGhcbiAgICAgICAgcHJlZnMuc2V0IFwic2VhcmNoOiN7c2VhcmNofToje2N1cnJlbnROYW1lfVwiLCAxICsgcHJlZnMuZ2V0IFwic2VhcmNoOiN7c2VhcmNofToje2N1cnJlbnROYW1lfVwiIDBcblxuICAgIGlmIGN1cnJlbnRJc0FwcCgpXG5cbiAgICAgICAgYWRkVG9IaXN0b3J5KClcbiAgICAgICAgXG4gICAgICAgIGlmIHNsYXNoLndpbigpXG5cbiAgICAgICAgICAgICMga2xvZyAnbGF1bmNoJyBjdXJyZW50TmFtZSwgYXBwc1tjdXJyZW50TmFtZV1cbiAgICAgICAgICAgIHd4dyA9IHJlcXVpcmUgJ3d4dydcbiAgICAgICAgICAgIHd4dyAnbGF1bmNoJyBhcHBzW2N1cnJlbnROYW1lXVxuICAgICAgICAgICAgd2luSGlkZSgpXG5cbiAgICAgICAgZWxzZVxuICAgICAgICAgICAga2xvZyAnb3BlbkN1cnJlbnQnIGN1cnJlbnROYW1lXG4gICAgICAgICAgICBjaGlsZHAuZXhlYyBcIm9wZW4gLWEgXFxcIiN7YXBwc1tjdXJyZW50TmFtZV19XFxcIlwiIChlcnIpIC0+XG4gICAgICAgICAgICAgICAgaWYgZXJyPyB0aGVuIGxvZyBcIltFUlJPUl0gY2FuJ3Qgb3BlbiAje2FwcHNbY3VycmVudE5hbWVdfSAje2Vycn1cIlxuICAgICAgICAgICAgICAgIFxuICAgIGVsc2UgaWYgc2NyaXB0c1tjdXJyZW50TmFtZV0/XG4gICAgICAgIFxuICAgICAgICBpZiBzY3JpcHRzW2N1cnJlbnROYW1lXS5mb3JlZ3JvdW5kP1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBleGUgPSBzbGFzaC5maWxlIHNjcmlwdHNbY3VycmVudE5hbWVdLmZvcmVncm91bmRcbiAgICAgICAgICAgIGFkZFRvSGlzdG9yeSgpXG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIHNsYXNoLndpbigpXG4gICAgICAgICAgICAgICAgd3h3ID0gcmVxdWlyZSAnd3h3J1xuICAgICAgICAgICAgICAgIGluZm8gPSB3eHcoJ2luZm8nIGV4ZSk/WzBdXG4gICAgICAgICAgICAgICAgaWYgaW5mb1xuICAgICAgICAgICAgICAgICAgICB3aW5IaWRlKClcbiAgICAgICAgICAgICAgICAgICAgd3h3ICdzaG93JyAgZXhlXG4gICAgICAgICAgICAgICAgICAgIHd4dyAncmFpc2UnIGV4ZVxuICAgICAgICAgICAgICAgICAgICB3eHcgJ2ZvY3VzJyBleGVcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgIFxuICAgICAgICBpZiBzY3JpcHRzW2N1cnJlbnROYW1lXS5leGVjP1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBjaGlsZHAuZXhlYyBzY3JpcHRzW2N1cnJlbnROYW1lXS5leGVjLCAoZXJyKSAtPlxuICAgICAgICAgICAgICAgIGlmIGVycj8gdGhlbiBsb2cgXCJbRVJST1JdIGNhbid0IGV4ZWN1dGUgc2NyaXB0ICN7c2NyaXB0c1tjdXJyZW50TmFtZV19OiAje2Vycn1cIlxuICAgICAgICAgICAgICAgIFxuICAgICAgICBlbHNlXG4gICAgICAgICAgICBwb3N0LnRvTWFpbiAncnVuU2NyaXB0JyBjdXJyZW50TmFtZVxuICAgICAgICAgICAgd2luSGlkZSgpXG5cbnBvc3Qub24gJ29wZW5DdXJyZW50JyAgb3BlbkN1cnJlbnRcblxuIyAgMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgIDAwMDAwMDAwICAgMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAwXG4jIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwMCAgMDAwICAgICAwMDBcbiMgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAgMCAwMDAgICAgIDAwMFxuIyAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgMDAwMCAgICAgMDAwXG4jICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgMDAwICAgMDAwICAgICAwMDBcblxuY3VycmVudEFwcCA9IChhcHBOYW1lKSAtPlxuXG4gICAgY3VycmVudE5hbWUgICA9ICdrYXBwbycgaWYgZW1wdHkgY3VycmVudE5hbWVcbiAgICBhcHBOYW1lICAgICAgID0gJ2thcHBvJyBpZiBlbXB0eSBhcHBOYW1lXG4gICAgbGFzdE1hdGNoZXMgICA9IGN1cnJlbnROYW1lLnRvTG93ZXJDYXNlKCkgPT0gYXBwTmFtZS50b0xvd2VyQ2FzZSgpXG4gICAgc2NyaXB0TWF0Y2hlcyA9IHNjcmlwdHNbY3VycmVudE5hbWVdPy5mb3JlZ3JvdW5kPyBhbmQgc2xhc2guYmFzZShzY3JpcHRzW2N1cnJlbnROYW1lXS5mb3JlZ3JvdW5kKS50b0xvd2VyQ2FzZSgpID09IGFwcE5hbWUudG9Mb3dlckNhc2UoKVxuICAgICAgICBcbiAgICBpZiAobGFzdE1hdGNoZXMgb3Igc2NyaXB0TWF0Y2hlcykgYW5kIGFwcEhpc3QucHJldmlvdXMoKSBhbmQgcHJlZnMuZ2V0ICdhcHBUb2dnbGUnIHRydWVcbiAgICAgICAgbGlzdEhpc3RvcnkgMVxuICAgICAgICBzZWFyY2ggPSAnJ1xuICAgIGVsc2VcbiAgICAgICAga2xvZyBcImN1cnJlbnRBcHAgI3thcHBOYW1lfSAtPiAje2N1cnJlbnROYW1lfVwiIGxhc3RNYXRjaGVzLCBzY3JpcHRNYXRjaGVzXG4gICAgICAgIG5hbWUgPSBjdXJyZW50TmFtZVxuICAgICAgICBkb1NlYXJjaCAnJ1xuICAgICAgICBzZWxlY3ROYW1lIG5hbWUgaWYgbm90IGVtcHR5IG5hbWVcbiAgICAgICAgc2VhcmNoID0gJydcbiAgICAgICAgJCgnYXBwbmFtZScpLmlubmVySFRNTCA9IG5hbWVcbiAgICAgICAgXG4gICAgJCgnI21haW4nKS5jbGFzc0xpc3QuYWRkICdmYWRlJ1xuXG5wb3N0Lm9uICdjdXJyZW50QXBwJyBjdXJyZW50QXBwXG5cbmN1cnJlbnRJc0FwcCA9ID0+IG5vdCBjdXJyZW50SXNTY3JpcHQoKVxuY3VycmVudElzU2NyaXB0ID0gLT4gcmVzdWx0c1tjdXJyZW50SW5kZXhdPy5zY3JpcHQ/XG5cbiMgMDAwMDAwMDAwICAgMDAwMDAwMCAgICAwMDAwMDAwICAgIDAwMDAwMDAgICAwMDAgICAgICAwMDAwMDAwMCAgXG4jICAgIDAwMCAgICAgMDAwICAgMDAwICAwMDAgICAgICAgIDAwMCAgICAgICAgMDAwICAgICAgMDAwICAgICAgIFxuIyAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwICAwMDAwICAwMDAgIDAwMDAgIDAwMCAgICAgIDAwMDAwMDAgICBcbiMgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAwMDAgICAgICAgXG4jICAgIDAwMCAgICAgIDAwMDAwMDAgICAgMDAwMDAwMCAgICAwMDAwMDAwICAgMDAwMDAwMCAgMDAwMDAwMDAgIFxuXG50b2dnbGVBcHBUb2dnbGUgPSAtPlxuICAgIFxuICAgIHByZWZzLnNldCAnYXBwVG9nZ2xlJyBub3QgcHJlZnMuZ2V0ICdhcHBUb2dnbGUnIHRydWVcbiAgICBcbnRvZ2dsZURvdWJsZUFjdGl2YXRpb24gPSAtPlxuXG4gICAgcHJlZnMuc2V0ICdoaWRlT25Eb3VibGVBY3RpdmF0aW9uJywgbm90IHByZWZzLmdldCAnaGlkZU9uRG91YmxlQWN0aXZhdGlvbicsIGZhbHNlXG4gICAgXG4jIDAwMCAgIDAwMCAgMDAwICAgMDAwMDAwMCAgMDAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMDAwMDAwICAgMDAwICAgMDAwXG4jIDAwMCAgIDAwMCAgMDAwICAwMDAgICAgICAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgIDAwMCAwMDBcbiMgMDAwMDAwMDAwICAwMDAgIDAwMDAwMDAgICAgICAwMDAgICAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICAgIDAwMDAwXG4jIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgMDAwICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwXG4jIDAwMCAgIDAwMCAgMDAwICAwMDAwMDAwICAgICAgMDAwICAgICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgICAgMDAwXG5cbmxpc3RIaXN0b3J5ID0gKG9mZnNldD0wKSAtPlxuICAgIGtsb2cgXCJsaXN0SGlzdG9yeSAje29mZnNldH1cIiBhcHBIaXN0Lmxpc3RcbiAgICByZXN1bHRzID0gW11cbiAgICBpZiB2YWxpZCBhcHBIaXN0XG4gICAgICAgIGZvciBoIGluIGFwcEhpc3QubGlzdFxuICAgICAgICAgICAgcmVzdWx0ID0gXy5jbG9uZSBoXG4gICAgICAgICAgICByZXN1bHQuc3RyaW5nID89IHJlc3VsdC5uYW1lXG4gICAgICAgICAgICByZXN1bHRzLnB1c2ggcmVzdWx0XG4gICAgaW5kZXggPSByZXN1bHRzLmxlbmd0aCAtIDEgLSBvZmZzZXRcbiAgICBrbG9nIFwibGlzdEhpc3RvcnkgaW5kZXggI3tpbmRleH1cIiByZXN1bHRzXG4gICAgc2VsZWN0IGluZGV4XG4gICAgc2hvd0RvdHMoKVxuXG5hZGRUb0hpc3RvcnkgPSAtPlxuICAgIFxuICAgIHJldHVybiBpZiBlbXB0eSByZXN1bHRzW2N1cnJlbnRJbmRleF1cbiAgICBcbiAgICByZXN1bHQgPSBfLmNsb25lIHJlc3VsdHNbY3VycmVudEluZGV4XVxuICAgIGRlbGV0ZSByZXN1bHQuc3RyaW5nXG4gICAgYXBwSGlzdC5hZGQgcmVzdWx0XG4gICAgcHJlZnMuc2V0ICdoaXN0b3J5JyBhcHBIaXN0Lmxpc3RcbiAgICBcbm9wZW5JbkZpbmRlciA9ICgpIC0+XG4gICAgXG4gICAgY2hpbGRwLnNwYXduICdvc2FzY3JpcHQnLCBbXG4gICAgICAgICctZScsICd0ZWxsIGFwcGxpY2F0aW9uIFwiRmluZGVyXCInLFxuICAgICAgICAnLWUnLCBcInJldmVhbCBQT1NJWCBmaWxlIFxcXCIje2FwcHNbY3VycmVudE5hbWVdfVxcXCJcIixcbiAgICAgICAgJy1lJywgJ2FjdGl2YXRlJyxcbiAgICAgICAgJy1lJywgJ2VuZCB0ZWxsJ11cblxuIyAgMDAwMDAwMCAgMDAwICAgICAgMDAwMDAwMDAgICAwMDAwMDAwICAgMDAwMDAwMDBcbiMgMDAwICAgICAgIDAwMCAgICAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgIDAwMFxuIyAwMDAgICAgICAgMDAwICAgICAgMDAwMDAwMCAgIDAwMDAwMDAwMCAgMDAwMDAwMFxuIyAwMDAgICAgICAgMDAwICAgICAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwXG4jICAwMDAwMDAwICAwMDAwMDAwICAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDBcblxuY2xlYXJTZWFyY2ggPSAtPlxuXG4gICAgaWYgcmVzdWx0cy5sZW5ndGhcbiAgICAgICAgc2VhcmNoID0gJydcbiAgICAgICAgcmVzdWx0cyA9IFtyZXN1bHRzW01hdGgubWluIGN1cnJlbnRJbmRleCwgcmVzdWx0cy5sZW5ndGgtMV1dXG4gICAgICAgIHJlc3VsdHNbMF0uc3RyaW5nID0gY3VycmVudE5hbWVcbiAgICAgICAgJCgnYXBwbmFtZScpLmlubmVySFRNTCA9IGN1cnJlbnROYW1lXG4gICAgICAgIGN1cnJlbnRJbmRleCA9IDBcbiAgICAgICAgc2hvd0RvdHMoKVxuICAgIGVsc2VcbiAgICAgICAgZG9TZWFyY2ggJydcblxucG9zdC5vbiAnY2xlYXJTZWFyY2gnICBjbGVhclNlYXJjaFxuXG4jIDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwXG4jIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwMCAgMDAwXG4jIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwIDAgMDAwXG4jIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAwMDAwXG4jIDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwICAgMDAwICAgMDAwXG5cbmdldFNjcmlwdEljb24gPSAoc2NyaXB0TmFtZSkgLT4gc2V0SWNvbiBzY3JpcHRzW3NjcmlwdE5hbWVdLmltZ1xuXG5nZXRBcHBJY29uID0gKGFwcE5hbWUpIC0+XG5cbiAgICBpZiBzbGFzaC53aW4oKVxuICAgICAgICBhcHBJY29uID0gcmVxdWlyZSAnLi9leGVpY29uJ1xuICAgIGVsc2VcbiAgICAgICAgYXBwSWNvbiA9IHJlcXVpcmUgJy4vYXBwaWNvbidcblxuICAgIGFwcEljb24uZ2V0XG4gICAgICAgIGFwcFBhdGg6IGFwcHNbYXBwTmFtZV1cbiAgICAgICAgaWNvbkRpcjogaWNvbkRpclxuICAgICAgICBzaXplOiAgICA1MTJcbiAgICAgICAgY2I6ICAgICAgc2V0SWNvblxuXG5zZXRJY29uID0gKGljb25QYXRoKSAtPlxuICAgIFxuICAgICQoJ2FwcGljb24nKS5zdHlsZS5iYWNrZ3JvdW5kSW1hZ2UgPSBcInVybChcXFwiI3tzbGFzaC5maWxlVXJsIGljb25QYXRofVxcXCIpXCJcblxuIyAgMDAwMDAwMCAgMDAwMDAwMDAgIDAwMCAgICAgIDAwMDAwMDAwICAgMDAwMDAwMCAgMDAwMDAwMDAwXG4jIDAwMCAgICAgICAwMDAgICAgICAgMDAwICAgICAgMDAwICAgICAgIDAwMCAgICAgICAgICAwMDBcbiMgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAgICAgICAwMDAwMDAwICAgMDAwICAgICAgICAgIDAwMFxuIyAgICAgIDAwMCAgMDAwICAgICAgIDAwMCAgICAgIDAwMCAgICAgICAwMDAgICAgICAgICAgMDAwXG4jIDAwMDAwMDAgICAwMDAwMDAwMCAgMDAwMDAwMCAgMDAwMDAwMDAgICAwMDAwMDAwICAgICAwMDBcblxuc2VsZWN0ID0gKGluZGV4KSA9PlxuICAgIGN1cnJlbnRJbmRleCA9IChpbmRleCArIHJlc3VsdHMubGVuZ3RoKSAlIHJlc3VsdHMubGVuZ3RoXG4gICAgaWYgZW1wdHkgcmVzdWx0c1tjdXJyZW50SW5kZXhdXG4gICAgICAgIGxvZyAnZGFmdWs/IGluZGV4OicsIGluZGV4LCAncmVzdWx0czonLCByZXN1bHRzXG4gICAgICAgIHJldHVyblxuICAgIGN1cnJlbnROYW1lID0gcmVzdWx0c1tjdXJyZW50SW5kZXhdLm5hbWVcbiAgICAkKCdhcHBuYW1lJykuaW5uZXJIVE1MID0gcmVzdWx0c1tjdXJyZW50SW5kZXhdLnN0cmluZ1xuICAgICQoJy5jdXJyZW50Jyk/LmNsYXNzTGlzdC5yZW1vdmUgJ2N1cnJlbnQnXG4gICAgJChcImRvdF8je2N1cnJlbnRJbmRleH1cIik/LmNsYXNzTGlzdC5hZGQgJ2N1cnJlbnQnXG4gICAgaWYgY3VycmVudElzQXBwKClcbiAgICAgICAgZ2V0QXBwSWNvbiBjdXJyZW50TmFtZVxuICAgIGVsc2VcbiAgICAgICAgZ2V0U2NyaXB0SWNvbiBjdXJyZW50TmFtZVxuXG5zZWxlY3ROYW1lID0gKG5hbWUpIC0+XG4gICAgXG4gICAgcmV0dXJuIGlmIGVtcHR5IG5hbWVcbiAgICBzZWxlY3QgcmVzdWx0cy5maW5kSW5kZXggKHIpIC0+XG4gICAgICAgIHI/Lm5hbWUudG9Mb3dlckNhc2UoKSA9PSBuYW1lLnRvTG93ZXJDYXNlKClcblxuIyAgIDAwMDAwMDAgICAgIDAwMDAwMDAgICAwMDAwMDAwMDAgICAwMDAwMDAwXG4jICAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgMDAwXG4jICAgMDAwICAgMDAwICAwMDAgICAwMDAgICAgIDAwMCAgICAgMDAwMDAwMFxuIyAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgICAgICAgMDAwXG4jICAgMDAwMDAwMCAgICAgMDAwMDAwMCAgICAgIDAwMCAgICAgMDAwMDAwMFxuXG5zaG93RG90cyA9IC0+XG5cbiAgICBkb3RzID0kICdhcHBkb3RzJ1xuICAgIGRvdHMuaW5uZXJIVE1MID0gJydcblxuICAgIHdpbldpZHRoID0gc3coKVxuICAgIHNldFN0eWxlICcjYXBwbmFtZScgJ2ZvbnQtc2l6ZScgXCIje3BhcnNlSW50IDEwKzIqKHdpbldpZHRoLTEwMCkvMTAwfXB4XCJcblxuICAgIHJldHVybiBpZiByZXN1bHRzLmxlbmd0aCA8IDJcblxuICAgIGRvdHIgPSBlbGVtIGlkOidhcHBkb3RyJ1xuICAgIGRvdHMuYXBwZW5kQ2hpbGQgZG90clxuXG4gICAgcyA9IHdpbldpZHRoIC8gcmVzdWx0cy5sZW5ndGhcbiAgICBzID0gY2xhbXAgMSwgd2luV2lkdGgvMTAwLCBzXG4gICAgcyA9IHBhcnNlSW50IHNcbiAgICBzZXRTdHlsZSAnLmFwcGRvdCcsICd3aWR0aCcsIFwiI3tzfXB4XCJcbiAgICBzZXRTdHlsZSAnLmFwcGRvdCcsICdoZWlnaHQnLCBcIiN7c31weFwiXG5cbiAgICBmb3IgaSBpbiBbMC4uLnJlc3VsdHMubGVuZ3RoXVxuICAgICAgICBkb3QgPSBlbGVtICdzcGFuJywgY2xhc3M6J2FwcGRvdCcsIGlkOiBcImRvdF8je2l9XCJcbiAgICAgICAgaWYgaSA9PSBjdXJyZW50SW5kZXhcbiAgICAgICAgICAgIGRvdC5jbGFzc0xpc3QuYWRkICdjdXJyZW50J1xuICAgICAgICBkb3RyLmFwcGVuZENoaWxkIGRvdFxuXG4jIDAwMDAwMDAgICAgMDAwICAgICAgIDAwMDAwMDAgICAgMDAwMDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAwMDAgICAwMDAwMDAwICAwMDAwMDAwMDAgIFxuIyAwMDAgICAwMDAgIDAwMCAgICAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgMDAwICAgMDAwICAgICAgMDAwICAwMDAgICAgICAgICAgMDAwICAgICBcbiMgMDAwMDAwMCAgICAwMDAgICAgICAwMDAwMDAwMDAgIDAwMCAgICAgICAwMDAwMDAwICAgIDAwMCAgICAgIDAwMCAgMDAwMDAwMCAgICAgIDAwMCAgICAgXG4jIDAwMCAgIDAwMCAgMDAwICAgICAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAwMDAgICAwMDAgICAgICAwMDAgICAgICAgMDAwICAgICAwMDAgICAgIFxuIyAwMDAwMDAwICAgIDAwMDAwMDAgIDAwMCAgIDAwMCAgIDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgMDAwICAwMDAwMDAwICAgICAgMDAwICAgICBcblxuYmxhY2tsaXN0ID0gLT5cblxuICAgIGlnbm9yZSA9IHByZWZzLmdldCAnaWdub3JlJywgW11cbiAgICBcbiAgICBfLnB1bGwgaWdub3JlLCBhcHBzW2N1cnJlbnROYW1lXVxuICAgIF8ucHVsbCBpZ25vcmUsIG51bGxcbiAgICBpZiB2YWxpZCBhcHBzW2N1cnJlbnROYW1lXVxuICAgICAgICBpZ25vcmUucHVzaCBhcHBzW2N1cnJlbnROYW1lXVxuICAgIGVsc2VcbiAgICAgICAgbG9nIFwiY2FuJ3QgaWdub3JlICcje2N1cnJlbnROYW1lfSdcIlxuICAgIFxuICAgIHByZWZzLnNldCAnaWdub3JlJywgaWdub3JlXG4gICAgXG4gICAgZGVsZXRlIGFwcHNbY3VycmVudE5hbWVdXG4gICAgXG4gICAgcmVzdWx0cy5zcGxpY2UgY3VycmVudEluZGV4LCAxXG4gICAgXG4gICAgc2VsZWN0IGN1cnJlbnRJbmRleFxuICAgIFxuIyAgMDAwMDAwMCAgMDAwMDAwMDAgICAwMDAwMDAwICAgMDAwMDAwMDAgICAgMDAwMDAwMCAgMDAwICAgMDAwXG4jIDAwMCAgICAgICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDBcbiMgMDAwMDAwMCAgIDAwMDAwMDAgICAwMDAwMDAwMDAgIDAwMDAwMDAgICAgMDAwICAgICAgIDAwMDAwMDAwMFxuIyAgICAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwXG4jIDAwMDAwMDAgICAwMDAwMDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgICAwMDAwMDAwICAwMDAgICAwMDBcblxuZG9TZWFyY2ggPSAocykgLT5cbiAgICBcbiAgICBzZWFyY2ggID0gc1xuICAgIG5hbWVzICAgPSBhbGxLZXlzXG4gICAgZnV6emllZCA9IGZ1enp5LmZpbHRlciBzZWFyY2gsIG5hbWVzLCBwcmU6ICc8Yj4nLCBwb3N0OiAnPC9iPidcbiAgICBmdXp6aWVkID0gXy5zb3J0QnkgZnV6emllZCwgKG8pIC0+IDIgLSBmdXp6YWxkcmluLnNjb3JlIG8ub3JpZ2luYWwsIHNlYXJjaFxuXG4gICAgaWYgc2VhcmNoLmxlbmd0aFxuICAgICAgICBpZiBwcyA9IHByZWZzLmdldCBcInNlYXJjaDoje3NlYXJjaH1cIlxuICAgICAgICAgICAgZnV6emllZCA9IF8uc29ydEJ5IGZ1enppZWQsIChvKSAtPiBOdW1iZXIuTUFYX1NBRkVfSU5URUdFUiAtIChwc1tvLm9yaWdpbmFsXSA/IDApXG5cbiAgICByZXN1bHRzID0gW11cbiAgICBmb3IgZiBpbiBmdXp6aWVkXG4gICAgICAgIHIgPSBuYW1lOiBmLm9yaWdpbmFsLCBzdHJpbmc6IGYuc3RyaW5nXG4gICAgICAgIHIuc2NyaXB0ID0gc2NyaXB0c1tyLm5hbWVdIGlmIHNjcmlwdHNbci5uYW1lXVxuICAgICAgICByZXN1bHRzLnB1c2ggclxuXG4gICAgaWYgdmFsaWQgcmVzdWx0c1xuICAgICAgICBpZiBzID09ICcnXG4gICAgICAgICAgICBpZiBzbGFzaC53aW4oKVxuICAgICAgICAgICAgICAgIHNlbGVjdE5hbWUgJ3Rlcm1pbmFsJ1xuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIHNlbGVjdE5hbWUgJ0ZpbmRlcidcbiAgICAgICAgZWxzZVxuICAgICAgICAgICAgc2VsZWN0IDBcbiAgICAgICAgc2hvd0RvdHMoKVxuICAgIGVsc2VcbiAgICAgICAgJCgnYXBwZG90cycpLmlubmVySFRNTCA9ICcnXG4gICAgICAgICQoJ2FwcG5hbWUnKS5pbm5lckhUTUwgPSBcIjxiPiN7c2VhcmNofTwvYj5cIlxuXG5jb21wbGV0ZSAgPSAoa2V5KSAtPiBkb1NlYXJjaCBzZWFyY2ggKyBrZXlcbmJhY2tzcGFjZSA9ICAgICAgIC0+IGRvU2VhcmNoIHNlYXJjaC5zdWJzdHIgMCwgc2VhcmNoLmxlbmd0aC0xXG5cbmNhbmNlbFNlYXJjaE9yQ2xvc2UgPSAtPlxuICAgIFxuICAgIGlwYy5zZW5kICdjbG9zZUFib3V0J1xuICAgIFxuICAgIGlmIHNlYXJjaC5sZW5ndGhcbiAgICAgICAgZG9TZWFyY2ggJydcbiAgICBlbHNlXG4gICAgICAgIHBvc3QudG9NYWluICdjYW5jZWwnXG5cbmNsaWNrSUQgPSBkb3duSUQgPSAwXG53aW5kb3cub25tb3VzZWRvd24gID0gKGUpIC0+IGNsaWNrSUQgKz0gMSA7IGRvd25JRCA9IGNsaWNrSURcbndpbmRvdy5vbm1vdXNldXAgICAgPSAoZSkgLT4gb3BlbkN1cnJlbnQoKSBpZiBkb3duSUQgPT0gY2xpY2tJRFxud2luZG93Lm9ubW91c2Vtb3ZlICA9IChlKSAtPiBpZiBlLmJ1dHRvbnMgdGhlbiBkb3duSUQgPSAtMVxud2luZG93Lm9udW5sb2FkID0gLT4gZG9jdW1lbnQub25rZXlkb3duID0gbnVsbFxud2luZG93Lm9uYmx1ciAgID0gLT4gd2luSGlkZSgpXG53aW5kb3cub25yZXNpemUgPSAtPiBzaG93RG90cygpXG5cbndoZWVsQWNjdSA9IDBcbndpbmRvdy5vbndoZWVsICA9IChldmVudCkgLT5cbiAgICB3aGVlbEFjY3UgKz0gKGV2ZW50LmRlbHRhWCArIGV2ZW50LmRlbHRhWSkvNDRcbiAgICBpZiB3aGVlbEFjY3UgPiAxXG4gICAgICAgIHNlbGVjdCBjdXJyZW50SW5kZXgrMSAlIHJlc3VsdHMubGVuZ3RoXG4gICAgICAgIHdoaWxlIHdoZWVsQWNjdSA+IDFcbiAgICAgICAgICAgIHdoZWVsQWNjdSAtPSAxXG4gICAgZWxzZSBpZiB3aGVlbEFjY3UgPCAtMVxuICAgICAgICBzZWxlY3QgY3VycmVudEluZGV4K3Jlc3VsdHMubGVuZ3RoLTEgJSByZXN1bHRzLmxlbmd0aFxuICAgICAgICB3aGlsZSB3aGVlbEFjY3UgPCAtMVxuICAgICAgICAgICAgd2hlZWxBY2N1ICs9IDFcblxuIyAgMDAwMDAwMCAgMDAwICAwMDAwMDAwICAwMDAwMDAwMFxuIyAwMDAgICAgICAgMDAwICAgICAwMDAgICAwMDBcbiMgMDAwMDAwMCAgIDAwMCAgICAwMDAgICAgMDAwMDAwMFxuIyAgICAgIDAwMCAgMDAwICAgMDAwICAgICAwMDBcbiMgMDAwMDAwMCAgIDAwMCAgMDAwMDAwMCAgMDAwMDAwMDBcblxub3BlbkRldlRvb2xzID0gLT4gcG9zdC50b01haW4gJ2RldlRvb2xzJ1xuc2NyZWVuU2l6ZSA9IC0+IHNzID0gZWxlY3Ryb24uaXBjUmVuZGVyZXIuc2VuZFN5bmMgJ2dldFNjcmVlblNpemUnOyBrbG9nICdzY3JlZW5TaXplJyBzczsgc3NcblxuY2xhbXBCb3VuZHMgPSAoYikgLT5cbiAgICBiLndpZHRoID0gY2xhbXAgMjAwLCA2MDAsIGIud2lkdGhcbiAgICBiLmhlaWdodCA9IGNsYW1wIDIwMCwgNjAwLCBiLmhlaWdodFxuICAgIGIueCA9IGNsYW1wIDAsIHNjcmVlblNpemUoKS53aWR0aCAtIGIud2lkdGgsIGIueFxuICAgIGIueSA9IGNsYW1wIDAsIHNjcmVlblNpemUoKS5oZWlnaHQgLSBiLmhlaWdodCwgYi55XG4gICAgYlxuXG5nZXRCb3VuZHMgPSAgICAgLT4gYiA9IGVsZWN0cm9uLmlwY1JlbmRlcmVyLnNlbmRTeW5jICdnZXRXaW5Cb3VuZHMnOyBrbG9nICdnZXRCb3VuZHMnIGI7IGJcbnNldEJvdW5kcyA9IChiKSAtPiBlbGVjdHJvbi5pcGNSZW5kZXJlci5zZW5kICdzZXRXaW5Cb3VuZHMnIGI7IGtsb2cgJ3NldEJvdW5kcycgYlxuICAgIFxuc2l6ZVdpbmRvdyA9IChkKSAtPlxuICAgIGIgPSBnZXRCb3VuZHMoKVxuICAgIGN4ID0gYi54ICsgYi53aWR0aC8yXG4gICAgYi53aWR0aCs9ZFxuICAgIGIuaGVpZ2h0Kz1kXG4gICAgY2xhbXBCb3VuZHMgYlxuICAgIGIueCA9IGN4IC0gYi53aWR0aC8yXG4gICAgc2V0Qm91bmRzIGNsYW1wQm91bmRzIGJcblxubW92ZVdpbmRvdyA9IChkeCxkeSkgLT5cbiAgICBiID0gZ2V0Qm91bmRzKClcbiAgICBiLngrPWR4XG4gICAgYi55Kz1keVxuICAgIHNldEJvdW5kcyBjbGFtcEJvdW5kcyBiXG5cbmJpZ2dlcldpbmRvdyAgICAgPSAtPiBzaXplV2luZG93IDUwXG5zbWFsbGVyV2luZG93ICAgID0gLT4gc2l6ZVdpbmRvdyAtNTBcbm1pbmltaXplV2luZG93ICAgPSAtPiBzZXRCb3VuZHMgeDpzY3JlZW5TaXplKCkud2lkdGgvMi0xMDAsIHk6MCwgd2lkdGg6MjAwLCBoZWlnaHQ6MjAwXG5tYXhpbWl6ZVdpbmRvdyAgID0gLT4gc2V0Qm91bmRzIHg6c2NyZWVuU2l6ZSgpLndpZHRoLzItMzAwLCB5OjAsIHdpZHRoOjYwMCwgaGVpZ2h0OjYwMFxudG9nZ2xlV2luZG93U2l6ZSA9IC0+IGlmIGdldEJvdW5kcygpLndpZHRoID4gMjAwIHRoZW4gbWluaW1pemVXaW5kb3coKSBlbHNlIG1heGltaXplV2luZG93KClcblxucHJldmVudEtleVJlcGVhdCA9IC0+IGxvZyAna2V5UmVwZWF0IGFoZWFkISdcblxuIyAwMDAgICAwMDAgIDAwMDAwMDAwICAwMDAgICAwMDBcbiMgMDAwICAwMDAgICAwMDAgICAgICAgIDAwMCAwMDBcbiMgMDAwMDAwMCAgICAwMDAwMDAwICAgICAwMDAwMFxuIyAwMDAgIDAwMCAgIDAwMCAgICAgICAgICAwMDBcbiMgMDAwICAgMDAwICAwMDAwMDAwMCAgICAgMDAwXG5cbmRvY3VtZW50Lm9ua2V5ZG93biA9IChldmVudCkgLT5cblxuICAgIHsgbW9kLCBrZXksIGNvbWJvLCBjaGFyIH0gPSBrZXlpbmZvLmZvckV2ZW50IGV2ZW50XG5cbiAgICBrbG9nIGNvbWJvICNpZiBhcmdzLnZlcmJvc2VcbiAgICBcbiAgICBpZiBjaGFyPyBhbmQgY29tYm8ubGVuZ3RoID09IDFcbiAgICAgICAgY29tcGxldGUga2V5XG4gICAgICAgIHJldHVyblxuXG4gICAgc3dpdGNoIGNvbWJvXG4gICAgICAgIHdoZW4gJ2YxJyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGVuIHByZXZlbnRLZXlSZXBlYXQoKVxuICAgICAgICB3aGVuICdkZWxldGUnICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhlbiBibGFja2xpc3QoKVxuICAgICAgICB3aGVuICdiYWNrc3BhY2UnICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhlbiBiYWNrc3BhY2UoKVxuICAgICAgICB3aGVuICdjb21tYW5kK2JhY2tzcGFjZScsICAgICAgICdjdHJsK2JhY2tzcGFjZScgICAgdGhlbiBkb1NlYXJjaCAnJ1xuICAgICAgICB3aGVuICdjb21tYW5kK2knLCAnY3RybCtpJyAgICAgICAgICAgICAgICAgICAgICAgICAgdGhlbiBzY2hlbWUudG9nZ2xlKClcbiAgICAgICAgd2hlbiAnZXNjJyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoZW4gY2FuY2VsU2VhcmNoT3JDbG9zZSgpXG4gICAgICAgIHdoZW4gJ2Rvd24nLCAncmlnaHQnICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGVuIHNlbGVjdCBjdXJyZW50SW5kZXgrMVxuICAgICAgICB3aGVuICd1cCcgICwgJ2xlZnQnICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhlbiBzZWxlY3QgY3VycmVudEluZGV4LTFcbiAgICAgICAgd2hlbiAnZW50ZXInICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoZW4gb3BlbkN1cnJlbnQoKVxuICAgICAgICB3aGVuICdjb21tYW5kK2FsdCtpJywgICAgICAgICAgICdjdHJsK2FsdCtpJyAgICAgICAgdGhlbiBvcGVuRGV2VG9vbHMoKVxuICAgICAgICB3aGVuICdjb21tYW5kKz0nLCAgICAgICAgICAgICAgICdjdHJsKz0nICAgICAgICAgICAgdGhlbiBiaWdnZXJXaW5kb3coKVxuICAgICAgICB3aGVuICdjb21tYW5kKy0nLCAgICAgICAgICAgICAgICdjdHJsKy0nICAgICAgICAgICAgdGhlbiBzbWFsbGVyV2luZG93KClcbiAgICAgICAgd2hlbiAnY29tbWFuZCtyJywgICAgICAgICAgICAgICAnY3RybCtyJyAgICAgICAgICAgIHRoZW4gcG9zdC50b01haW4gJ2ZpbmRBcHBzJ1xuICAgICAgICB3aGVuICdjb21tYW5kK2gnLCAgICAgICAgICAgICAgICdhbHQraCcgICAgICAgICAgICAgdGhlbiBsaXN0SGlzdG9yeSgpXG4gICAgICAgIHdoZW4gJ2NvbW1hbmQrZicsICAgICAgICAgICAgICAgJ2N0cmwrZicgICAgICAgICAgICB0aGVuIG9wZW5JbkZpbmRlcigpXG4gICAgICAgIHdoZW4gJ2NvbW1hbmQrdCcsICAgICAgICAgICAgICAgJ2N0cmwrdCcgICAgICAgICAgICB0aGVuIHRvZ2dsZUFwcFRvZ2dsZSgpXG4gICAgICAgIHdoZW4gJ2NvbW1hbmQrZCcsICAgICAgICAgICAgICAgJ2N0cmwrZCcgICAgICAgICAgICB0aGVuIHRvZ2dsZURvdWJsZUFjdGl2YXRpb24oKVxuICAgICAgICB3aGVuICdhbHQrY29tbWFuZCsvJywgICAgICAgICAgICdhbHQrY3RybCsvJyAgICAgICAgdGhlbiBwb3N0LnRvTWFpbiAnYWJvdXQnXG4gICAgICAgIHdoZW4gJ2NvbW1hbmQrLCcsICAgICAgICAgICAgICAgJ2N0cmwrLCcgICAgICAgICAgICB0aGVuIG9wZW4gcHJlZnMuc3RvcmUuZmlsZVxuICAgICAgICB3aGVuICdjb21tYW5kK3VwJywgICAgICAgICAgICAgICdjdHJsK3VwJyAgICAgICAgICAgdGhlbiBtb3ZlV2luZG93IDAsLTIwXG4gICAgICAgIHdoZW4gJ2NvbW1hbmQrZG93bicsICAgICAgICAgICAgJ2N0cmwrZG93bicgICAgICAgICB0aGVuIG1vdmVXaW5kb3cgMCwgMjBcbiAgICAgICAgd2hlbiAnY29tbWFuZCtsZWZ0JywgICAgICAgICAgICAnY3RybCtsZWZ0JyAgICAgICAgIHRoZW4gbW92ZVdpbmRvdyAtMjAsIDBcbiAgICAgICAgd2hlbiAnY29tbWFuZCtyaWdodCcsICAgICAgICAgICAnY3RybCtyaWdodCcgICAgICAgIHRoZW4gbW92ZVdpbmRvdyAgMjAsIDBcbiAgICAgICAgd2hlbiAnY29tbWFuZCswJywnY29tbWFuZCtvJywgICAnY3RybCswJywnY3RybCtvJyAgIHRoZW4gdG9nZ2xlV2luZG93U2l6ZSgpXG5cbndpbk1haW4oKVxuIl19
//# sourceURL=../coffee/kappo.coffee