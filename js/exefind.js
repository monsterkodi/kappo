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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXhlZmluZC5qcyIsInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyIiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7OztBQUFBLElBQUEsa0RBQUE7SUFBQTs7QUFRQSxNQUEyQyxPQUFBLENBQVEsS0FBUixDQUEzQyxFQUFFLGVBQUYsRUFBUSxpQkFBUixFQUFlLHFCQUFmLEVBQXdCLGlCQUF4QixFQUErQixlQUEvQixFQUFxQzs7QUFFckMsT0FBQSxHQUFVLFNBQUMsRUFBRDtBQUVOLFFBQUE7SUFBQSxJQUFBLEdBQU8sS0FBSyxDQUFDLEdBQU4sQ0FBVSxNQUFWLEVBQWlCLEVBQWpCO0lBRVAsSUFBQSxHQUFPO0lBQ1AsSUFBSSxDQUFDLEdBQUwsQ0FBUyxTQUFDLENBQUQ7ZUFBTyxJQUFLLENBQUEsS0FBSyxDQUFDLElBQU4sQ0FBVyxDQUFYLENBQUEsQ0FBTCxHQUFxQixLQUFLLENBQUMsT0FBTixDQUFjLENBQWQ7SUFBNUIsQ0FBVDtJQUVBLElBQUssQ0FBQSxLQUFBLENBQUwsR0FBbUI7SUFDbkIsSUFBSyxDQUFBLE1BQUEsQ0FBTCxHQUFtQjtJQUNuQixJQUFLLENBQUEsU0FBQSxDQUFMLEdBQW1CO0lBQ25CLElBQUssQ0FBQSxTQUFBLENBQUwsR0FBbUI7SUFDbkIsSUFBSyxDQUFBLFVBQUEsQ0FBTCxHQUFtQjtJQUVuQixJQUFBLEdBQU8sQ0FBQyxDQUFDLEtBQUYsQ0FBUSxLQUFLLENBQUMsR0FBTixDQUFVLE1BQVYsRUFBaUIsRUFBakIsQ0FBUjtJQUVQLElBQUksQ0FBQyxJQUFMLENBQVUsa0JBQVY7SUFDQSxJQUFJLENBQUMsSUFBTCxDQUFVLHdCQUFWO0lBQ0EsSUFBSSxDQUFDLElBQUwsQ0FBVSxLQUFLLENBQUMsT0FBTixDQUFjLGlCQUFkLENBQVY7SUFDQSxJQUFJLENBQUMsSUFBTCxDQUFVLEtBQUssQ0FBQyxPQUFOLENBQWMsSUFBZCxDQUFWO0lBRUEsY0FBQSxHQUFpQixPQUFBLENBQVEsZUFBUjtJQUVqQixhQUFBLEdBQWdCLFNBQUMsSUFBRDtBQUNaLFlBQUE7UUFBQSxJQUFBLEdBQU8sSUFBSSxDQUFDLFdBQUwsQ0FBQTtBQUNQO0FBQUEsYUFBQSxzQ0FBQTs7WUFDSSxJQUFlLElBQUksQ0FBQyxVQUFMLENBQWdCLEtBQWhCLENBQWY7QUFBQSx1QkFBTyxLQUFQOztBQURKO0FBRUE7QUFBQSxhQUFBLHdDQUFBOztZQUNJLElBQWUsSUFBSSxDQUFDLE9BQUwsQ0FBYSxRQUFiLENBQUEsSUFBMEIsQ0FBekM7QUFBQSx1QkFBTyxLQUFQOztBQURKO0FBRUE7QUFBQSxhQUFBLHdDQUFBOztZQUNJLElBQWUsSUFBQSxLQUFRLEtBQXZCO0FBQUEsdUJBQU8sS0FBUDs7QUFESjtlQUVBO0lBUlk7SUFVaEIsYUFBQSxHQUFnQixTQUFDLElBQUQ7QUFDWixZQUFBO0FBQUE7QUFBQSxhQUFBLHNDQUFBOztZQUNJLElBQWUsSUFBSSxDQUFDLE9BQUwsQ0FBYSxJQUFiLENBQUEsSUFBc0IsQ0FBckM7QUFBQSx1QkFBTyxLQUFQOztBQURKO2VBRUE7SUFIWTtJQUtoQixNQUFBLEdBQVMsS0FBSyxDQUFDLEdBQU4sQ0FBVSxRQUFWLEVBQW1CLEVBQW5CO0lBQ1QsV0FBQSxHQUFjLElBQUksQ0FBQztBQUVuQjtTQUFBLHNDQUFBOztRQUVJLE9BQUEsR0FBVSxLQUFLLENBQUMsR0FBTixDQUFVLE1BQVYsRUFBaUI7WUFBQSxVQUFBLEVBQVksS0FBWjtZQUFrQixTQUFBLEVBQVcsQ0FBN0I7U0FBakI7UUFDVixJQUFBLEdBQU8sT0FBQSxDQUFRLEtBQUssQ0FBQyxPQUFOLENBQWMsU0FBZCxDQUFSLEVBQWtDLE9BQWxDO1FBRVAsSUFBSSxDQUFDLEVBQUwsQ0FBUSxPQUFSLEVBQWdCLFNBQUMsR0FBRDtZQUNaLElBQUksQ0FBQyxNQUFMLENBQVksU0FBWixFQUFzQixhQUFBLEdBQWMsR0FBRyxDQUFDLEtBQXhDO21CQUErQyxPQUFBLENBQy9DLEdBRCtDLENBQzNDLHNCQUFBLEdBQXVCLEdBRG9CO1FBRG5DLENBQWhCO1FBSUEsSUFBSSxDQUFDLEVBQUwsQ0FBUSxLQUFSLEVBQWMsU0FBQTtZQUVWLFdBQUEsSUFBZTtZQUNmLElBQUcsV0FBQSxLQUFlLENBQWxCO2tEQUdJLEdBQUksZUFIUjs7UUFIVSxDQUFkO3FCQVFBLElBQUksQ0FBQyxFQUFMLENBQVEsTUFBUixFQUFlLFNBQUMsSUFBRDtBQUVYLGdCQUFBO1lBQUEsSUFBQSxHQUFPLEtBQUssQ0FBQyxPQUFOLENBQWMsSUFBZDtZQUNQLElBQUcsS0FBSyxDQUFDLEdBQU4sQ0FBVSxJQUFWLENBQUEsS0FBbUIsS0FBdEI7Z0JBQ0ksSUFBQSxHQUFPLEtBQUssQ0FBQyxJQUFOLENBQVcsSUFBWDtnQkFDUCxJQUFHLGFBQVksTUFBWixFQUFBLElBQUEsS0FBQSxJQUF1QixDQUFJLGFBQUEsQ0FBYyxJQUFkLENBQTNCLElBQW1ELENBQUksYUFBQSxDQUFjLElBQWQsQ0FBMUQ7b0JBQ0ksSUFBTyxrQkFBUDsrQkFDSSxJQUFLLENBQUEsSUFBQSxDQUFMLEdBQWEsS0FEakI7cUJBREo7aUJBRko7O1FBSFcsQ0FBZjtBQWpCSjs7QUF4Q007O0FBa0VWLE1BQU0sQ0FBQyxPQUFQLEdBQWlCIiwic291cmNlc0NvbnRlbnQiOlsiIyMjXG4wMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgICAgICAgMDAwMDAwMDAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwXG4wMDAgICAgICAgIDAwMCAwMDAgICAwMDAgICAgICAgICAgICAgMDAwICAgICAgIDAwMCAgMDAwMCAgMDAwICAwMDAgICAwMDBcbjAwMDAwMDAgICAgIDAwMDAwICAgIDAwMDAwMDAgICAgICAgICAwMDAwMDAgICAgMDAwICAwMDAgMCAwMDAgIDAwMCAgIDAwMFxuMDAwICAgICAgICAwMDAgMDAwICAgMDAwICAgICAgICAgICAgIDAwMCAgICAgICAwMDAgIDAwMCAgMDAwMCAgMDAwICAgMDAwXG4wMDAwMDAwMCAgMDAwICAgMDAwICAwMDAwMDAwMCAgICAgICAgMDAwICAgICAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwXG4jIyNcblxueyBwb3N0LCBzbGFzaCwgd2Fsa2RpciwgcHJlZnMsIGtsb2csIF8gfSA9IHJlcXVpcmUgJ2t4aydcblxuZXhlRmluZCA9IChjYikgLT5cblxuICAgIGFwcGwgPSBwcmVmcy5nZXQgJ2FwcHMnIFtdXG4gICAgXG4gICAgYXBwcyA9IHt9XG4gICAgYXBwbC5tYXAgKGEpIC0+IGFwcHNbc2xhc2guYmFzZSBhXSA9IHNsYXNoLnJlc29sdmUgYVxuICAgIFxuICAgIGFwcHNbJ2NtZCddICAgICAgPSBcIkM6L1dpbmRvd3MvU3lzdGVtMzIvY21kLmV4ZVwiXG4gICAgYXBwc1snY2FsYyddICAgICA9IFwiQzovV2luZG93cy9TeXN0ZW0zMi9jYWxjLmV4ZVwiXG4gICAgYXBwc1snVGFza21nciddICA9IFwiQzovV2luZG93cy9TeXN0ZW0zMi9UYXNrbWdyLmV4ZVwiXG4gICAgYXBwc1sncmVnZWRpdCddICA9IFwiQzovV2luZG93cy9yZWdlZGl0LmV4ZVwiXG4gICAgYXBwc1snZXhwbG9yZXInXSA9IFwiQzovV2luZG93cy9leHBsb3Jlci5leGVcIlxuXG4gICAgZGlycyA9IF8uY2xvbmUgcHJlZnMuZ2V0ICdkaXJzJyBbXVxuICAgIFxuICAgIGRpcnMucHVzaCBcIkM6L1Byb2dyYW0gRmlsZXNcIlxuICAgIGRpcnMucHVzaCBcIkM6L1Byb2dyYW0gRmlsZXMgKHg4NilcIlxuICAgIGRpcnMucHVzaCBzbGFzaC5yZXNvbHZlICd+L0FwcERhdGEvTG9jYWwnXG4gICAgZGlycy5wdXNoIHNsYXNoLnJlc29sdmUgJ34vJ1xuXG4gICAgaWdub3JlRGVmYXVsdHMgPSByZXF1aXJlICcuLi9iaW4vaWdub3JlJ1xuXG4gICAgaWdub3JlZEJ5TmFtZSA9IChmaWxlKSAtPlxuICAgICAgICBmaWxlID0gZmlsZS50b0xvd2VyQ2FzZSgpXG4gICAgICAgIGZvciBzdGFydCBpbiBpZ25vcmVEZWZhdWx0cy5zdGFydHNXaXRoXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZSBpZiBmaWxlLnN0YXJ0c1dpdGggc3RhcnRcbiAgICAgICAgZm9yIGNvbnRhaW5zIGluIGlnbm9yZURlZmF1bHRzLmNvbnRhaW5zXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZSBpZiBmaWxlLmluZGV4T2YoY29udGFpbnMpID49IDBcbiAgICAgICAgZm9yIG1hdGNoIGluIGlnbm9yZURlZmF1bHRzLm1hdGNoZXNcbiAgICAgICAgICAgIHJldHVybiB0cnVlIGlmIGZpbGUgPT0gbWF0Y2hcbiAgICAgICAgZmFsc2VcbiAgICAgICAgXG4gICAgaWdub3JlZEJ5UGF0aCA9IChmaWxlKSAtPlxuICAgICAgICBmb3IgcGF0aCBpbiBpZ25vcmVEZWZhdWx0cy5wYXRoXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZSBpZiBmaWxlLmluZGV4T2YocGF0aCkgPj0gMFxuICAgICAgICBmYWxzZVxuICAgICAgICAgICAgXG4gICAgaWdub3JlID0gcHJlZnMuZ2V0ICdpZ25vcmUnIFtdXG4gICAgZm9sZGVyc0xlZnQgPSBkaXJzLmxlbmd0aFxuXG4gICAgZm9yIGV4ZUZvbGRlciBpbiBkaXJzXG4gICAgICAgIFxuICAgICAgICB3YWxrT3B0ID0gcHJlZnMuZ2V0ICd3YWxrJyBub19yZWN1cnNlOiBmYWxzZSBtYXhfZGVwdGg6IDRcbiAgICAgICAgd2FsayA9IHdhbGtkaXIgc2xhc2gucmVzb2x2ZShleGVGb2xkZXIpLCB3YWxrT3B0XG5cbiAgICAgICAgd2Fsay5vbiAnZXJyb3InIChlcnIpIC0+IFxuICAgICAgICAgICAgcG9zdC50b1dpbnMgJ21haW5sb2cnIFwid2FsayBlcnJvciAje2Vyci5zdGFja31cIlxuICAgICAgICAgICAgbG9nIFwiW0VSUk9SXSBmaW5kRXhlcyAtLSAje2Vycn1cIlxuXG4gICAgICAgIHdhbGsub24gJ2VuZCcgLT5cblxuICAgICAgICAgICAgZm9sZGVyc0xlZnQgLT0gMVxuICAgICAgICAgICAgaWYgZm9sZGVyc0xlZnQgPT0gMFxuICAgICAgICAgICAgICAgICMgcG9zdC50b1dpbnMgJ21haW5sb2cnIFwiYXBwcyAje2FwcHN9XCJcbiAgICAgICAgICAgICAgICAjIGtsb2cgJ2FwcHMnIGFwcHNcbiAgICAgICAgICAgICAgICBjYj8gYXBwc1xuXG4gICAgICAgIHdhbGsub24gJ2ZpbGUnIChmaWxlKSAtPlxuXG4gICAgICAgICAgICBmaWxlID0gc2xhc2gucmVzb2x2ZSBmaWxlXG4gICAgICAgICAgICBpZiBzbGFzaC5leHQoZmlsZSkgPT0gJ2V4ZSdcbiAgICAgICAgICAgICAgICBuYW1lID0gc2xhc2guYmFzZSBmaWxlXG4gICAgICAgICAgICAgICAgaWYgZmlsZSBub3QgaW4gaWdub3JlIGFuZCBub3QgaWdub3JlZEJ5TmFtZShuYW1lKSBhbmQgbm90IGlnbm9yZWRCeVBhdGgoZmlsZSlcbiAgICAgICAgICAgICAgICAgICAgaWYgbm90IGFwcHNbbmFtZV0/XG4gICAgICAgICAgICAgICAgICAgICAgICBhcHBzW25hbWVdID0gZmlsZVxuXG5tb2R1bGUuZXhwb3J0cyA9IGV4ZUZpbmRcbiJdfQ==
//# sourceURL=../coffee/exefind.coffee