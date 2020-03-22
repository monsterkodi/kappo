// koffee 1.12.0

/*
00000000  000   000  00000000        00000000  000  000   000  0000000
000        000 000   000             000       000  0000  000  000   000
0000000     00000    0000000         000000    000  000 0 000  000   000
000        000 000   000             000       000  000  0000  000   000
00000000  000   000  00000000        000       000  000   000  0000000
 */
var _, exeFind, klog, post, prefs, ref, slash, walkdir,
    indexOf = [].indexOf;

ref = require('kxk'), post = ref.post, slash = ref.slash, walkdir = ref.walkdir, prefs = ref.prefs, klog = ref.klog, _ = ref._;

exeFind = function(cb) {
    var appl, apps, dirs, exeFolder, foldersLeft, i, ignore, ignoreDefaults, ignoredByName, ignoredByPath, len, results, walk, walkOpt;
    appl = prefs.get('apps', []);
    apps = {};
    appl.map(function(a) {
        return apps[slash.base(a)] = slash.resolve(a);
    });
    apps['cmd'] = "C:/Windows/System32/cmd.exe";
    apps['calc'] = "C:/Windows/System32/calc.exe";
    apps['Taskmgr'] = "C:/Windows/System32/Taskmgr.exe";
    apps['regedit'] = "C:/Windows/regedit.exe";
    apps['explorer'] = "C:/Windows/explorer.exe";
    dirs = _.clone(prefs.get('dirs', []));
    dirs.push("C:/Program Files");
    dirs.push("C:/Program Files (x86)");
    dirs.push(slash.resolve('~/AppData/Local'));
    dirs.push(slash.resolve('~/'));
    ignoreDefaults = require('../bin/ignore');
    ignoredByName = function(file) {
        var contains, i, j, k, len, len1, len2, match, ref1, ref2, ref3, start;
        file = file.toLowerCase();
        ref1 = ignoreDefaults.startsWith;
        for (i = 0, len = ref1.length; i < len; i++) {
            start = ref1[i];
            if (file.startsWith(start)) {
                return true;
            }
        }
        ref2 = ignoreDefaults.contains;
        for (j = 0, len1 = ref2.length; j < len1; j++) {
            contains = ref2[j];
            if (file.indexOf(contains) >= 0) {
                return true;
            }
        }
        ref3 = ignoreDefaults.matches;
        for (k = 0, len2 = ref3.length; k < len2; k++) {
            match = ref3[k];
            if (file === match) {
                return true;
            }
        }
        return false;
    };
    ignoredByPath = function(file) {
        var i, len, path, ref1;
        ref1 = ignoreDefaults.path;
        for (i = 0, len = ref1.length; i < len; i++) {
            path = ref1[i];
            if (file.indexOf(path) >= 0) {
                return true;
            }
        }
        return false;
    };
    ignore = prefs.get('ignore', []);
    foldersLeft = dirs.length;
    results = [];
    for (i = 0, len = dirs.length; i < len; i++) {
        exeFolder = dirs[i];
        walkOpt = prefs.get('walk', {
            no_recurse: false,
            max_depth: 4
        });
        walk = walkdir(slash.resolve(exeFolder), walkOpt);
        walk.on('error', function(err) {
            post.toWins('mainlog', "walk error " + err.stack);
            return console.log("[ERROR] findExes -- " + err);
        });
        walk.on('end', function() {
            foldersLeft -= 1;
            if (foldersLeft === 0) {
                return typeof cb === "function" ? cb(apps) : void 0;
            }
        });
        results.push(walk.on('file', function(file) {
            var name;
            file = slash.resolve(file);
            if (slash.ext(file) === 'exe') {
                name = slash.base(file);
                if (indexOf.call(ignore, file) < 0 && !ignoredByName(name) && !ignoredByPath(file)) {
                    if (apps[name] == null) {
                        return apps[name] = file;
                    }
                }
            }
        }));
    }
    return results;
};

module.exports = exeFind;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXhlZmluZC5qcyIsInNvdXJjZVJvb3QiOiIuLi9jb2ZmZWUiLCJzb3VyY2VzIjpbImV4ZWZpbmQuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUE7Ozs7Ozs7QUFBQSxJQUFBLGtEQUFBO0lBQUE7O0FBUUEsTUFBMkMsT0FBQSxDQUFRLEtBQVIsQ0FBM0MsRUFBRSxlQUFGLEVBQVEsaUJBQVIsRUFBZSxxQkFBZixFQUF3QixpQkFBeEIsRUFBK0IsZUFBL0IsRUFBcUM7O0FBRXJDLE9BQUEsR0FBVSxTQUFDLEVBQUQ7QUFFTixRQUFBO0lBQUEsSUFBQSxHQUFPLEtBQUssQ0FBQyxHQUFOLENBQVUsTUFBVixFQUFpQixFQUFqQjtJQUVQLElBQUEsR0FBTztJQUNQLElBQUksQ0FBQyxHQUFMLENBQVMsU0FBQyxDQUFEO2VBQU8sSUFBSyxDQUFBLEtBQUssQ0FBQyxJQUFOLENBQVcsQ0FBWCxDQUFBLENBQUwsR0FBcUIsS0FBSyxDQUFDLE9BQU4sQ0FBYyxDQUFkO0lBQTVCLENBQVQ7SUFFQSxJQUFLLENBQUEsS0FBQSxDQUFMLEdBQW1CO0lBQ25CLElBQUssQ0FBQSxNQUFBLENBQUwsR0FBbUI7SUFDbkIsSUFBSyxDQUFBLFNBQUEsQ0FBTCxHQUFtQjtJQUNuQixJQUFLLENBQUEsU0FBQSxDQUFMLEdBQW1CO0lBQ25CLElBQUssQ0FBQSxVQUFBLENBQUwsR0FBbUI7SUFFbkIsSUFBQSxHQUFPLENBQUMsQ0FBQyxLQUFGLENBQVEsS0FBSyxDQUFDLEdBQU4sQ0FBVSxNQUFWLEVBQWlCLEVBQWpCLENBQVI7SUFFUCxJQUFJLENBQUMsSUFBTCxDQUFVLGtCQUFWO0lBQ0EsSUFBSSxDQUFDLElBQUwsQ0FBVSx3QkFBVjtJQUNBLElBQUksQ0FBQyxJQUFMLENBQVUsS0FBSyxDQUFDLE9BQU4sQ0FBYyxpQkFBZCxDQUFWO0lBQ0EsSUFBSSxDQUFDLElBQUwsQ0FBVSxLQUFLLENBQUMsT0FBTixDQUFjLElBQWQsQ0FBVjtJQUVBLGNBQUEsR0FBaUIsT0FBQSxDQUFRLGVBQVI7SUFFakIsYUFBQSxHQUFnQixTQUFDLElBQUQ7QUFDWixZQUFBO1FBQUEsSUFBQSxHQUFPLElBQUksQ0FBQyxXQUFMLENBQUE7QUFDUDtBQUFBLGFBQUEsc0NBQUE7O1lBQ0ksSUFBZSxJQUFJLENBQUMsVUFBTCxDQUFnQixLQUFoQixDQUFmO0FBQUEsdUJBQU8sS0FBUDs7QUFESjtBQUVBO0FBQUEsYUFBQSx3Q0FBQTs7WUFDSSxJQUFlLElBQUksQ0FBQyxPQUFMLENBQWEsUUFBYixDQUFBLElBQTBCLENBQXpDO0FBQUEsdUJBQU8sS0FBUDs7QUFESjtBQUVBO0FBQUEsYUFBQSx3Q0FBQTs7WUFDSSxJQUFlLElBQUEsS0FBUSxLQUF2QjtBQUFBLHVCQUFPLEtBQVA7O0FBREo7ZUFFQTtJQVJZO0lBVWhCLGFBQUEsR0FBZ0IsU0FBQyxJQUFEO0FBQ1osWUFBQTtBQUFBO0FBQUEsYUFBQSxzQ0FBQTs7WUFDSSxJQUFlLElBQUksQ0FBQyxPQUFMLENBQWEsSUFBYixDQUFBLElBQXNCLENBQXJDO0FBQUEsdUJBQU8sS0FBUDs7QUFESjtlQUVBO0lBSFk7SUFLaEIsTUFBQSxHQUFTLEtBQUssQ0FBQyxHQUFOLENBQVUsUUFBVixFQUFtQixFQUFuQjtJQUNULFdBQUEsR0FBYyxJQUFJLENBQUM7QUFFbkI7U0FBQSxzQ0FBQTs7UUFFSSxPQUFBLEdBQVUsS0FBSyxDQUFDLEdBQU4sQ0FBVSxNQUFWLEVBQWlCO1lBQUEsVUFBQSxFQUFZLEtBQVo7WUFBa0IsU0FBQSxFQUFXLENBQTdCO1NBQWpCO1FBQ1YsSUFBQSxHQUFPLE9BQUEsQ0FBUSxLQUFLLENBQUMsT0FBTixDQUFjLFNBQWQsQ0FBUixFQUFrQyxPQUFsQztRQUVQLElBQUksQ0FBQyxFQUFMLENBQVEsT0FBUixFQUFnQixTQUFDLEdBQUQ7WUFDWixJQUFJLENBQUMsTUFBTCxDQUFZLFNBQVosRUFBc0IsYUFBQSxHQUFjLEdBQUcsQ0FBQyxLQUF4QzttQkFBK0MsT0FBQSxDQUMvQyxHQUQrQyxDQUMzQyxzQkFBQSxHQUF1QixHQURvQjtRQURuQyxDQUFoQjtRQUlBLElBQUksQ0FBQyxFQUFMLENBQVEsS0FBUixFQUFjLFNBQUE7WUFFVixXQUFBLElBQWU7WUFDZixJQUFHLFdBQUEsS0FBZSxDQUFsQjtrREFHSSxHQUFJLGVBSFI7O1FBSFUsQ0FBZDtxQkFRQSxJQUFJLENBQUMsRUFBTCxDQUFRLE1BQVIsRUFBZSxTQUFDLElBQUQ7QUFFWCxnQkFBQTtZQUFBLElBQUEsR0FBTyxLQUFLLENBQUMsT0FBTixDQUFjLElBQWQ7WUFDUCxJQUFHLEtBQUssQ0FBQyxHQUFOLENBQVUsSUFBVixDQUFBLEtBQW1CLEtBQXRCO2dCQUNJLElBQUEsR0FBTyxLQUFLLENBQUMsSUFBTixDQUFXLElBQVg7Z0JBQ1AsSUFBRyxhQUFZLE1BQVosRUFBQSxJQUFBLEtBQUEsSUFBdUIsQ0FBSSxhQUFBLENBQWMsSUFBZCxDQUEzQixJQUFtRCxDQUFJLGFBQUEsQ0FBYyxJQUFkLENBQTFEO29CQUNJLElBQU8sa0JBQVA7K0JBQ0ksSUFBSyxDQUFBLElBQUEsQ0FBTCxHQUFhLEtBRGpCO3FCQURKO2lCQUZKOztRQUhXLENBQWY7QUFqQko7O0FBeENNOztBQWtFVixNQUFNLENBQUMsT0FBUCxHQUFpQiIsInNvdXJjZXNDb250ZW50IjpbIiMjI1xuMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgICAgICAgIDAwMDAwMDAwICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMFxuMDAwICAgICAgICAwMDAgMDAwICAgMDAwICAgICAgICAgICAgIDAwMCAgICAgICAwMDAgIDAwMDAgIDAwMCAgMDAwICAgMDAwXG4wMDAwMDAwICAgICAwMDAwMCAgICAwMDAwMDAwICAgICAgICAgMDAwMDAwICAgIDAwMCAgMDAwIDAgMDAwICAwMDAgICAwMDBcbjAwMCAgICAgICAgMDAwIDAwMCAgIDAwMCAgICAgICAgICAgICAwMDAgICAgICAgMDAwICAwMDAgIDAwMDAgIDAwMCAgIDAwMFxuMDAwMDAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMDAgICAgICAgIDAwMCAgICAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMFxuIyMjXG5cbnsgcG9zdCwgc2xhc2gsIHdhbGtkaXIsIHByZWZzLCBrbG9nLCBfIH0gPSByZXF1aXJlICdreGsnXG5cbmV4ZUZpbmQgPSAoY2IpIC0+XG5cbiAgICBhcHBsID0gcHJlZnMuZ2V0ICdhcHBzJyBbXVxuICAgIFxuICAgIGFwcHMgPSB7fVxuICAgIGFwcGwubWFwIChhKSAtPiBhcHBzW3NsYXNoLmJhc2UgYV0gPSBzbGFzaC5yZXNvbHZlIGFcbiAgICBcbiAgICBhcHBzWydjbWQnXSAgICAgID0gXCJDOi9XaW5kb3dzL1N5c3RlbTMyL2NtZC5leGVcIlxuICAgIGFwcHNbJ2NhbGMnXSAgICAgPSBcIkM6L1dpbmRvd3MvU3lzdGVtMzIvY2FsYy5leGVcIlxuICAgIGFwcHNbJ1Rhc2ttZ3InXSAgPSBcIkM6L1dpbmRvd3MvU3lzdGVtMzIvVGFza21nci5leGVcIlxuICAgIGFwcHNbJ3JlZ2VkaXQnXSAgPSBcIkM6L1dpbmRvd3MvcmVnZWRpdC5leGVcIlxuICAgIGFwcHNbJ2V4cGxvcmVyJ10gPSBcIkM6L1dpbmRvd3MvZXhwbG9yZXIuZXhlXCJcblxuICAgIGRpcnMgPSBfLmNsb25lIHByZWZzLmdldCAnZGlycycgW11cbiAgICBcbiAgICBkaXJzLnB1c2ggXCJDOi9Qcm9ncmFtIEZpbGVzXCJcbiAgICBkaXJzLnB1c2ggXCJDOi9Qcm9ncmFtIEZpbGVzICh4ODYpXCJcbiAgICBkaXJzLnB1c2ggc2xhc2gucmVzb2x2ZSAnfi9BcHBEYXRhL0xvY2FsJ1xuICAgIGRpcnMucHVzaCBzbGFzaC5yZXNvbHZlICd+LydcblxuICAgIGlnbm9yZURlZmF1bHRzID0gcmVxdWlyZSAnLi4vYmluL2lnbm9yZSdcblxuICAgIGlnbm9yZWRCeU5hbWUgPSAoZmlsZSkgLT5cbiAgICAgICAgZmlsZSA9IGZpbGUudG9Mb3dlckNhc2UoKVxuICAgICAgICBmb3Igc3RhcnQgaW4gaWdub3JlRGVmYXVsdHMuc3RhcnRzV2l0aFxuICAgICAgICAgICAgcmV0dXJuIHRydWUgaWYgZmlsZS5zdGFydHNXaXRoIHN0YXJ0XG4gICAgICAgIGZvciBjb250YWlucyBpbiBpZ25vcmVEZWZhdWx0cy5jb250YWluc1xuICAgICAgICAgICAgcmV0dXJuIHRydWUgaWYgZmlsZS5pbmRleE9mKGNvbnRhaW5zKSA+PSAwXG4gICAgICAgIGZvciBtYXRjaCBpbiBpZ25vcmVEZWZhdWx0cy5tYXRjaGVzXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZSBpZiBmaWxlID09IG1hdGNoXG4gICAgICAgIGZhbHNlXG4gICAgICAgIFxuICAgIGlnbm9yZWRCeVBhdGggPSAoZmlsZSkgLT5cbiAgICAgICAgZm9yIHBhdGggaW4gaWdub3JlRGVmYXVsdHMucGF0aFxuICAgICAgICAgICAgcmV0dXJuIHRydWUgaWYgZmlsZS5pbmRleE9mKHBhdGgpID49IDBcbiAgICAgICAgZmFsc2VcbiAgICAgICAgICAgIFxuICAgIGlnbm9yZSA9IHByZWZzLmdldCAnaWdub3JlJyBbXVxuICAgIGZvbGRlcnNMZWZ0ID0gZGlycy5sZW5ndGhcblxuICAgIGZvciBleGVGb2xkZXIgaW4gZGlyc1xuICAgICAgICBcbiAgICAgICAgd2Fsa09wdCA9IHByZWZzLmdldCAnd2Fsaycgbm9fcmVjdXJzZTogZmFsc2UgbWF4X2RlcHRoOiA0XG4gICAgICAgIHdhbGsgPSB3YWxrZGlyIHNsYXNoLnJlc29sdmUoZXhlRm9sZGVyKSwgd2Fsa09wdFxuXG4gICAgICAgIHdhbGsub24gJ2Vycm9yJyAoZXJyKSAtPiBcbiAgICAgICAgICAgIHBvc3QudG9XaW5zICdtYWlubG9nJyBcIndhbGsgZXJyb3IgI3tlcnIuc3RhY2t9XCJcbiAgICAgICAgICAgIGxvZyBcIltFUlJPUl0gZmluZEV4ZXMgLS0gI3tlcnJ9XCJcblxuICAgICAgICB3YWxrLm9uICdlbmQnIC0+XG5cbiAgICAgICAgICAgIGZvbGRlcnNMZWZ0IC09IDFcbiAgICAgICAgICAgIGlmIGZvbGRlcnNMZWZ0ID09IDBcbiAgICAgICAgICAgICAgICAjIHBvc3QudG9XaW5zICdtYWlubG9nJyBcImFwcHMgI3thcHBzfVwiXG4gICAgICAgICAgICAgICAgIyBrbG9nICdhcHBzJyBhcHBzXG4gICAgICAgICAgICAgICAgY2I/IGFwcHNcblxuICAgICAgICB3YWxrLm9uICdmaWxlJyAoZmlsZSkgLT5cblxuICAgICAgICAgICAgZmlsZSA9IHNsYXNoLnJlc29sdmUgZmlsZVxuICAgICAgICAgICAgaWYgc2xhc2guZXh0KGZpbGUpID09ICdleGUnXG4gICAgICAgICAgICAgICAgbmFtZSA9IHNsYXNoLmJhc2UgZmlsZVxuICAgICAgICAgICAgICAgIGlmIGZpbGUgbm90IGluIGlnbm9yZSBhbmQgbm90IGlnbm9yZWRCeU5hbWUobmFtZSkgYW5kIG5vdCBpZ25vcmVkQnlQYXRoKGZpbGUpXG4gICAgICAgICAgICAgICAgICAgIGlmIG5vdCBhcHBzW25hbWVdP1xuICAgICAgICAgICAgICAgICAgICAgICAgYXBwc1tuYW1lXSA9IGZpbGVcblxubW9kdWxlLmV4cG9ydHMgPSBleGVGaW5kXG4iXX0=
//# sourceURL=../coffee/exefind.coffee