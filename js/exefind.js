// koffee 1.4.0

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
                klog('apps', apps);
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXhlZmluZC5qcyIsInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyIiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7OztBQUFBLElBQUEsa0RBQUE7SUFBQTs7QUFRQSxNQUEyQyxPQUFBLENBQVEsS0FBUixDQUEzQyxFQUFFLGVBQUYsRUFBUSxpQkFBUixFQUFlLHFCQUFmLEVBQXdCLGlCQUF4QixFQUErQixlQUEvQixFQUFxQzs7QUFFckMsT0FBQSxHQUFVLFNBQUMsRUFBRDtBQUVOLFFBQUE7SUFBQSxJQUFBLEdBQU8sS0FBSyxDQUFDLEdBQU4sQ0FBVSxNQUFWLEVBQWtCLEVBQWxCO0lBRVAsSUFBQSxHQUFPO0lBQ1AsSUFBSSxDQUFDLEdBQUwsQ0FBUyxTQUFDLENBQUQ7ZUFBTyxJQUFLLENBQUEsS0FBSyxDQUFDLElBQU4sQ0FBVyxDQUFYLENBQUEsQ0FBTCxHQUFxQixLQUFLLENBQUMsT0FBTixDQUFjLENBQWQ7SUFBNUIsQ0FBVDtJQUVBLElBQUssQ0FBQSxLQUFBLENBQUwsR0FBbUI7SUFDbkIsSUFBSyxDQUFBLE1BQUEsQ0FBTCxHQUFtQjtJQUNuQixJQUFLLENBQUEsU0FBQSxDQUFMLEdBQW1CO0lBQ25CLElBQUssQ0FBQSxTQUFBLENBQUwsR0FBbUI7SUFDbkIsSUFBSyxDQUFBLFVBQUEsQ0FBTCxHQUFtQjtJQUVuQixJQUFBLEdBQU8sQ0FBQyxDQUFDLEtBQUYsQ0FBUSxLQUFLLENBQUMsR0FBTixDQUFVLE1BQVYsRUFBa0IsRUFBbEIsQ0FBUjtJQUVQLElBQUksQ0FBQyxJQUFMLENBQVUsa0JBQVY7SUFDQSxJQUFJLENBQUMsSUFBTCxDQUFVLHdCQUFWO0lBQ0EsSUFBSSxDQUFDLElBQUwsQ0FBVSxLQUFLLENBQUMsT0FBTixDQUFjLGlCQUFkLENBQVY7SUFDQSxJQUFJLENBQUMsSUFBTCxDQUFVLEtBQUssQ0FBQyxPQUFOLENBQWMsSUFBZCxDQUFWO0lBRUEsY0FBQSxHQUFpQixPQUFBLENBQVEsZUFBUjtJQUVqQixhQUFBLEdBQWdCLFNBQUMsSUFBRDtBQUNaLFlBQUE7UUFBQSxJQUFBLEdBQU8sSUFBSSxDQUFDLFdBQUwsQ0FBQTtBQUNQO0FBQUEsYUFBQSxzQ0FBQTs7WUFDSSxJQUFlLElBQUksQ0FBQyxVQUFMLENBQWdCLEtBQWhCLENBQWY7QUFBQSx1QkFBTyxLQUFQOztBQURKO0FBRUE7QUFBQSxhQUFBLHdDQUFBOztZQUNJLElBQWUsSUFBSSxDQUFDLE9BQUwsQ0FBYSxRQUFiLENBQUEsSUFBMEIsQ0FBekM7QUFBQSx1QkFBTyxLQUFQOztBQURKO0FBRUE7QUFBQSxhQUFBLHdDQUFBOztZQUNJLElBQWUsSUFBQSxLQUFRLEtBQXZCO0FBQUEsdUJBQU8sS0FBUDs7QUFESjtlQUVBO0lBUlk7SUFVaEIsYUFBQSxHQUFnQixTQUFDLElBQUQ7QUFDWixZQUFBO0FBQUE7QUFBQSxhQUFBLHNDQUFBOztZQUNJLElBQWUsSUFBSSxDQUFDLE9BQUwsQ0FBYSxJQUFiLENBQUEsSUFBc0IsQ0FBckM7QUFBQSx1QkFBTyxLQUFQOztBQURKO2VBRUE7SUFIWTtJQUtoQixNQUFBLEdBQVMsS0FBSyxDQUFDLEdBQU4sQ0FBVSxRQUFWLEVBQW9CLEVBQXBCO0lBQ1QsV0FBQSxHQUFjLElBQUksQ0FBQztBQUVuQjtTQUFBLHNDQUFBOztRQUVJLE9BQUEsR0FBVSxLQUFLLENBQUMsR0FBTixDQUFVLE1BQVYsRUFBa0I7WUFBQSxVQUFBLEVBQVksS0FBWjtZQUFtQixTQUFBLEVBQVcsQ0FBOUI7U0FBbEI7UUFDVixJQUFBLEdBQU8sT0FBQSxDQUFRLEtBQUssQ0FBQyxPQUFOLENBQWMsU0FBZCxDQUFSLEVBQWtDLE9BQWxDO1FBRVAsSUFBSSxDQUFDLEVBQUwsQ0FBUSxPQUFSLEVBQWlCLFNBQUMsR0FBRDtZQUNiLElBQUksQ0FBQyxNQUFMLENBQVksU0FBWixFQUF1QixhQUFBLEdBQWMsR0FBRyxDQUFDLEtBQXpDO21CQUFnRCxPQUFBLENBQ2hELEdBRGdELENBQzVDLHNCQUFBLEdBQXVCLEdBRHFCO1FBRG5DLENBQWpCO1FBSUEsSUFBSSxDQUFDLEVBQUwsQ0FBUSxLQUFSLEVBQWUsU0FBQTtZQUVYLFdBQUEsSUFBZTtZQUNmLElBQUcsV0FBQSxLQUFlLENBQWxCO2dCQUVJLElBQUEsQ0FBSyxNQUFMLEVBQVksSUFBWjtrREFDQSxHQUFJLGVBSFI7O1FBSFcsQ0FBZjtxQkFRQSxJQUFJLENBQUMsRUFBTCxDQUFRLE1BQVIsRUFBZ0IsU0FBQyxJQUFEO0FBRVosZ0JBQUE7WUFBQSxJQUFBLEdBQU8sS0FBSyxDQUFDLE9BQU4sQ0FBYyxJQUFkO1lBQ1AsSUFBRyxLQUFLLENBQUMsR0FBTixDQUFVLElBQVYsQ0FBQSxLQUFtQixLQUF0QjtnQkFDSSxJQUFBLEdBQU8sS0FBSyxDQUFDLElBQU4sQ0FBVyxJQUFYO2dCQUNQLElBQUcsYUFBWSxNQUFaLEVBQUEsSUFBQSxLQUFBLElBQXVCLENBQUksYUFBQSxDQUFjLElBQWQsQ0FBM0IsSUFBbUQsQ0FBSSxhQUFBLENBQWMsSUFBZCxDQUExRDtvQkFDSSxJQUFPLGtCQUFQOytCQUNJLElBQUssQ0FBQSxJQUFBLENBQUwsR0FBYSxLQURqQjtxQkFESjtpQkFGSjs7UUFIWSxDQUFoQjtBQWpCSjs7QUF4Q007O0FBa0VWLE1BQU0sQ0FBQyxPQUFQLEdBQWlCIiwic291cmNlc0NvbnRlbnQiOlsiIyMjXG4wMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgICAgICAgMDAwMDAwMDAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwXG4wMDAgICAgICAgIDAwMCAwMDAgICAwMDAgICAgICAgICAgICAgMDAwICAgICAgIDAwMCAgMDAwMCAgMDAwICAwMDAgICAwMDBcbjAwMDAwMDAgICAgIDAwMDAwICAgIDAwMDAwMDAgICAgICAgICAwMDAwMDAgICAgMDAwICAwMDAgMCAwMDAgIDAwMCAgIDAwMFxuMDAwICAgICAgICAwMDAgMDAwICAgMDAwICAgICAgICAgICAgIDAwMCAgICAgICAwMDAgIDAwMCAgMDAwMCAgMDAwICAgMDAwXG4wMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgICAgICAgMDAwICAgICAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwXG4jIyNcblxueyBwb3N0LCBzbGFzaCwgd2Fsa2RpciwgcHJlZnMsIGtsb2csIF8gfSA9IHJlcXVpcmUgJ2t4aydcblxuZXhlRmluZCA9IChjYikgLT5cblxuICAgIGFwcGwgPSBwcmVmcy5nZXQgJ2FwcHMnLCBbXVxuICAgIFxuICAgIGFwcHMgPSB7fVxuICAgIGFwcGwubWFwIChhKSAtPiBhcHBzW3NsYXNoLmJhc2UgYV0gPSBzbGFzaC5yZXNvbHZlIGFcbiAgICBcbiAgICBhcHBzWydjbWQnXSAgICAgID0gXCJDOi9XaW5kb3dzL1N5c3RlbTMyL2NtZC5leGVcIlxuICAgIGFwcHNbJ2NhbGMnXSAgICAgPSBcIkM6L1dpbmRvd3MvU3lzdGVtMzIvY2FsYy5leGVcIlxuICAgIGFwcHNbJ1Rhc2ttZ3InXSAgPSBcIkM6L1dpbmRvd3MvU3lzdGVtMzIvVGFza21nci5leGVcIlxuICAgIGFwcHNbJ3JlZ2VkaXQnXSAgPSBcIkM6L1dpbmRvd3MvcmVnZWRpdC5leGVcIlxuICAgIGFwcHNbJ2V4cGxvcmVyJ10gPSBcIkM6L1dpbmRvd3MvZXhwbG9yZXIuZXhlXCJcblxuICAgIGRpcnMgPSBfLmNsb25lIHByZWZzLmdldCAnZGlycycsIFtdXG4gICAgXG4gICAgZGlycy5wdXNoIFwiQzovUHJvZ3JhbSBGaWxlc1wiXG4gICAgZGlycy5wdXNoIFwiQzovUHJvZ3JhbSBGaWxlcyAoeDg2KVwiXG4gICAgZGlycy5wdXNoIHNsYXNoLnJlc29sdmUgJ34vQXBwRGF0YS9Mb2NhbCdcbiAgICBkaXJzLnB1c2ggc2xhc2gucmVzb2x2ZSAnfi8nXG5cbiAgICBpZ25vcmVEZWZhdWx0cyA9IHJlcXVpcmUgJy4uL2Jpbi9pZ25vcmUnXG5cbiAgICBpZ25vcmVkQnlOYW1lID0gKGZpbGUpIC0+XG4gICAgICAgIGZpbGUgPSBmaWxlLnRvTG93ZXJDYXNlKClcbiAgICAgICAgZm9yIHN0YXJ0IGluIGlnbm9yZURlZmF1bHRzLnN0YXJ0c1dpdGhcbiAgICAgICAgICAgIHJldHVybiB0cnVlIGlmIGZpbGUuc3RhcnRzV2l0aCBzdGFydFxuICAgICAgICBmb3IgY29udGFpbnMgaW4gaWdub3JlRGVmYXVsdHMuY29udGFpbnNcbiAgICAgICAgICAgIHJldHVybiB0cnVlIGlmIGZpbGUuaW5kZXhPZihjb250YWlucykgPj0gMFxuICAgICAgICBmb3IgbWF0Y2ggaW4gaWdub3JlRGVmYXVsdHMubWF0Y2hlc1xuICAgICAgICAgICAgcmV0dXJuIHRydWUgaWYgZmlsZSA9PSBtYXRjaFxuICAgICAgICBmYWxzZVxuICAgICAgICBcbiAgICBpZ25vcmVkQnlQYXRoID0gKGZpbGUpIC0+XG4gICAgICAgIGZvciBwYXRoIGluIGlnbm9yZURlZmF1bHRzLnBhdGhcbiAgICAgICAgICAgIHJldHVybiB0cnVlIGlmIGZpbGUuaW5kZXhPZihwYXRoKSA+PSAwXG4gICAgICAgIGZhbHNlXG4gICAgICAgICAgICBcbiAgICBpZ25vcmUgPSBwcmVmcy5nZXQgJ2lnbm9yZScsIFtdXG4gICAgZm9sZGVyc0xlZnQgPSBkaXJzLmxlbmd0aFxuXG4gICAgZm9yIGV4ZUZvbGRlciBpbiBkaXJzXG4gICAgICAgIFxuICAgICAgICB3YWxrT3B0ID0gcHJlZnMuZ2V0ICd3YWxrJywgbm9fcmVjdXJzZTogZmFsc2UsIG1heF9kZXB0aDogNFxuICAgICAgICB3YWxrID0gd2Fsa2RpciBzbGFzaC5yZXNvbHZlKGV4ZUZvbGRlciksIHdhbGtPcHRcblxuICAgICAgICB3YWxrLm9uICdlcnJvcicsIChlcnIpIC0+IFxuICAgICAgICAgICAgcG9zdC50b1dpbnMgJ21haW5sb2cnLCBcIndhbGsgZXJyb3IgI3tlcnIuc3RhY2t9XCJcbiAgICAgICAgICAgIGxvZyBcIltFUlJPUl0gZmluZEV4ZXMgLS0gI3tlcnJ9XCJcblxuICAgICAgICB3YWxrLm9uICdlbmQnLCAtPlxuXG4gICAgICAgICAgICBmb2xkZXJzTGVmdCAtPSAxXG4gICAgICAgICAgICBpZiBmb2xkZXJzTGVmdCA9PSAwXG4gICAgICAgICAgICAgICAgIyBwb3N0LnRvV2lucyAnbWFpbmxvZycgXCJhcHBzICN7YXBwc31cIlxuICAgICAgICAgICAgICAgIGtsb2cgJ2FwcHMnIGFwcHNcbiAgICAgICAgICAgICAgICBjYj8gYXBwc1xuXG4gICAgICAgIHdhbGsub24gJ2ZpbGUnLCAoZmlsZSkgLT5cblxuICAgICAgICAgICAgZmlsZSA9IHNsYXNoLnJlc29sdmUgZmlsZVxuICAgICAgICAgICAgaWYgc2xhc2guZXh0KGZpbGUpID09ICdleGUnXG4gICAgICAgICAgICAgICAgbmFtZSA9IHNsYXNoLmJhc2UgZmlsZVxuICAgICAgICAgICAgICAgIGlmIGZpbGUgbm90IGluIGlnbm9yZSBhbmQgbm90IGlnbm9yZWRCeU5hbWUobmFtZSkgYW5kIG5vdCBpZ25vcmVkQnlQYXRoKGZpbGUpXG4gICAgICAgICAgICAgICAgICAgIGlmIG5vdCBhcHBzW25hbWVdP1xuICAgICAgICAgICAgICAgICAgICAgICAgYXBwc1tuYW1lXSA9IGZpbGVcblxubW9kdWxlLmV4cG9ydHMgPSBleGVGaW5kXG4iXX0=
//# sourceURL=../coffee/exefind.coffee