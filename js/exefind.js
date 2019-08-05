// koffee 1.3.0

/*
00000000  000   000  00000000        00000000  000  000   000  0000000
000        000 000   000             000       000  0000  000  000   000
0000000     00000    0000000         000000    000  000 0 000  000   000
000        000 000   000             000       000  000  0000  000   000
00000000  000   000  00000000        000       000  000   000  0000000
 */
var _, exeFind, log, post, prefs, ref, slash, walkdir,
    indexOf = [].indexOf;

ref = require('kxk'), post = ref.post, slash = ref.slash, walkdir = ref.walkdir, prefs = ref.prefs, log = ref.log, _ = ref._;

exeFind = function(cb) {
    var appl, apps, dirs, exeFolder, foldersLeft, i, ignore, ignoreDefaults, ignoredByDefault, len, results, walk, walkOpt;
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
    ignoredByDefault = function(file) {
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
                if (indexOf.call(ignore, file) < 0 && !ignoredByDefault(name)) {
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXhlZmluZC5qcyIsInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyIiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7OztBQUFBLElBQUEsaURBQUE7SUFBQTs7QUFRQSxNQUEwQyxPQUFBLENBQVEsS0FBUixDQUExQyxFQUFFLGVBQUYsRUFBUSxpQkFBUixFQUFlLHFCQUFmLEVBQXdCLGlCQUF4QixFQUErQixhQUEvQixFQUFvQzs7QUFFcEMsT0FBQSxHQUFVLFNBQUMsRUFBRDtBQUVOLFFBQUE7SUFBQSxJQUFBLEdBQU8sS0FBSyxDQUFDLEdBQU4sQ0FBVSxNQUFWLEVBQWtCLEVBQWxCO0lBRVAsSUFBQSxHQUFPO0lBQ1AsSUFBSSxDQUFDLEdBQUwsQ0FBUyxTQUFDLENBQUQ7ZUFBTyxJQUFLLENBQUEsS0FBSyxDQUFDLElBQU4sQ0FBVyxDQUFYLENBQUEsQ0FBTCxHQUFxQixLQUFLLENBQUMsT0FBTixDQUFjLENBQWQ7SUFBNUIsQ0FBVDtJQUVBLElBQUssQ0FBQSxLQUFBLENBQUwsR0FBbUI7SUFDbkIsSUFBSyxDQUFBLE1BQUEsQ0FBTCxHQUFtQjtJQUNuQixJQUFLLENBQUEsU0FBQSxDQUFMLEdBQW1CO0lBQ25CLElBQUssQ0FBQSxTQUFBLENBQUwsR0FBbUI7SUFDbkIsSUFBSyxDQUFBLFVBQUEsQ0FBTCxHQUFtQjtJQUVuQixJQUFBLEdBQU8sQ0FBQyxDQUFDLEtBQUYsQ0FBUSxLQUFLLENBQUMsR0FBTixDQUFVLE1BQVYsRUFBa0IsRUFBbEIsQ0FBUjtJQUVQLElBQUksQ0FBQyxJQUFMLENBQVUsa0JBQVY7SUFDQSxJQUFJLENBQUMsSUFBTCxDQUFVLHdCQUFWO0lBQ0EsSUFBSSxDQUFDLElBQUwsQ0FBVSxLQUFLLENBQUMsT0FBTixDQUFjLGlCQUFkLENBQVY7SUFDQSxJQUFJLENBQUMsSUFBTCxDQUFVLEtBQUssQ0FBQyxPQUFOLENBQWMsSUFBZCxDQUFWO0lBRUEsY0FBQSxHQUFpQixPQUFBLENBQVEsZUFBUjtJQUVqQixnQkFBQSxHQUFtQixTQUFDLElBQUQ7QUFDZixZQUFBO1FBQUEsSUFBQSxHQUFPLElBQUksQ0FBQyxXQUFMLENBQUE7QUFDUDtBQUFBLGFBQUEsc0NBQUE7O1lBQ0ksSUFBZSxJQUFJLENBQUMsVUFBTCxDQUFnQixLQUFoQixDQUFmO0FBQUEsdUJBQU8sS0FBUDs7QUFESjtBQUVBO0FBQUEsYUFBQSx3Q0FBQTs7WUFDSSxJQUFlLElBQUksQ0FBQyxPQUFMLENBQWEsUUFBYixDQUFBLElBQTBCLENBQXpDO0FBQUEsdUJBQU8sS0FBUDs7QUFESjtBQUVBO0FBQUEsYUFBQSx3Q0FBQTs7WUFDSSxJQUFlLElBQUEsS0FBUSxLQUF2QjtBQUFBLHVCQUFPLEtBQVA7O0FBREo7ZUFFQTtJQVJlO0lBVW5CLE1BQUEsR0FBUyxLQUFLLENBQUMsR0FBTixDQUFVLFFBQVYsRUFBb0IsRUFBcEI7SUFDVCxXQUFBLEdBQWMsSUFBSSxDQUFDO0FBRW5CO1NBQUEsc0NBQUE7O1FBRUksT0FBQSxHQUFVLEtBQUssQ0FBQyxHQUFOLENBQVUsTUFBVixFQUFrQjtZQUFBLFVBQUEsRUFBWSxLQUFaO1lBQW1CLFNBQUEsRUFBVyxDQUE5QjtTQUFsQjtRQUNWLElBQUEsR0FBTyxPQUFBLENBQVEsS0FBSyxDQUFDLE9BQU4sQ0FBYyxTQUFkLENBQVIsRUFBa0MsT0FBbEM7UUFFUCxJQUFJLENBQUMsRUFBTCxDQUFRLE9BQVIsRUFBaUIsU0FBQyxHQUFEO1lBQ2IsSUFBSSxDQUFDLE1BQUwsQ0FBWSxTQUFaLEVBQXVCLGFBQUEsR0FBYyxHQUFHLENBQUMsS0FBekM7bUJBQWdELE9BQUEsQ0FDaEQsR0FEZ0QsQ0FDNUMsc0JBQUEsR0FBdUIsR0FEcUI7UUFEbkMsQ0FBakI7UUFJQSxJQUFJLENBQUMsRUFBTCxDQUFRLEtBQVIsRUFBZSxTQUFBO1lBRVgsV0FBQSxJQUFlO1lBQ2YsSUFBRyxXQUFBLEtBQWUsQ0FBbEI7a0RBRUksR0FBSSxlQUZSOztRQUhXLENBQWY7cUJBT0EsSUFBSSxDQUFDLEVBQUwsQ0FBUSxNQUFSLEVBQWdCLFNBQUMsSUFBRDtBQUVaLGdCQUFBO1lBQUEsSUFBQSxHQUFPLEtBQUssQ0FBQyxPQUFOLENBQWMsSUFBZDtZQUNQLElBQUcsS0FBSyxDQUFDLEdBQU4sQ0FBVSxJQUFWLENBQUEsS0FBbUIsS0FBdEI7Z0JBQ0ksSUFBQSxHQUFPLEtBQUssQ0FBQyxJQUFOLENBQVcsSUFBWDtnQkFDUCxJQUFHLGFBQVksTUFBWixFQUFBLElBQUEsS0FBQSxJQUF1QixDQUFJLGdCQUFBLENBQWlCLElBQWpCLENBQTlCO29CQUNJLElBQU8sa0JBQVA7K0JBQ0ksSUFBSyxDQUFBLElBQUEsQ0FBTCxHQUFhLEtBRGpCO3FCQURKO2lCQUZKOztRQUhZLENBQWhCO0FBaEJKOztBQW5DTTs7QUE0RFYsTUFBTSxDQUFDLE9BQVAsR0FBaUIiLCJzb3VyY2VzQ29udGVudCI6WyIjIyNcbjAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAgICAgICAwMDAwMDAwMCAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDBcbjAwMCAgICAgICAgMDAwIDAwMCAgIDAwMCAgICAgICAgICAgICAwMDAgICAgICAgMDAwICAwMDAwICAwMDAgIDAwMCAgIDAwMFxuMDAwMDAwMCAgICAgMDAwMDAgICAgMDAwMDAwMCAgICAgICAgIDAwMDAwMCAgICAwMDAgIDAwMCAwIDAwMCAgMDAwICAgMDAwXG4wMDAgICAgICAgIDAwMCAwMDAgICAwMDAgICAgICAgICAgICAgMDAwICAgICAgIDAwMCAgMDAwICAwMDAwICAwMDAgICAwMDBcbjAwMDAwMDAwICAwMDAgICAwMDAgIDAwMDAwMDAwICAgICAgICAwMDAgICAgICAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDBcbiMjI1xuXG57IHBvc3QsIHNsYXNoLCB3YWxrZGlyLCBwcmVmcywgbG9nLCBfIH0gPSByZXF1aXJlICdreGsnXG5cbmV4ZUZpbmQgPSAoY2IpIC0+XG5cbiAgICBhcHBsID0gcHJlZnMuZ2V0ICdhcHBzJywgW11cbiAgICBcbiAgICBhcHBzID0ge31cbiAgICBhcHBsLm1hcCAoYSkgLT4gYXBwc1tzbGFzaC5iYXNlIGFdID0gc2xhc2gucmVzb2x2ZSBhXG4gICAgXG4gICAgYXBwc1snY21kJ10gICAgICA9IFwiQzovV2luZG93cy9TeXN0ZW0zMi9jbWQuZXhlXCJcbiAgICBhcHBzWydjYWxjJ10gICAgID0gXCJDOi9XaW5kb3dzL1N5c3RlbTMyL2NhbGMuZXhlXCJcbiAgICBhcHBzWydUYXNrbWdyJ10gID0gXCJDOi9XaW5kb3dzL1N5c3RlbTMyL1Rhc2ttZ3IuZXhlXCJcbiAgICBhcHBzWydyZWdlZGl0J10gID0gXCJDOi9XaW5kb3dzL3JlZ2VkaXQuZXhlXCJcbiAgICBhcHBzWydleHBsb3JlciddID0gXCJDOi9XaW5kb3dzL2V4cGxvcmVyLmV4ZVwiXG5cbiAgICBkaXJzID0gXy5jbG9uZSBwcmVmcy5nZXQgJ2RpcnMnLCBbXVxuICAgIFxuICAgIGRpcnMucHVzaCBcIkM6L1Byb2dyYW0gRmlsZXNcIlxuICAgIGRpcnMucHVzaCBcIkM6L1Byb2dyYW0gRmlsZXMgKHg4NilcIlxuICAgIGRpcnMucHVzaCBzbGFzaC5yZXNvbHZlICd+L0FwcERhdGEvTG9jYWwnXG4gICAgZGlycy5wdXNoIHNsYXNoLnJlc29sdmUgJ34vJ1xuXG4gICAgaWdub3JlRGVmYXVsdHMgPSByZXF1aXJlICcuLi9iaW4vaWdub3JlJ1xuXG4gICAgaWdub3JlZEJ5RGVmYXVsdCA9IChmaWxlKSAtPlxuICAgICAgICBmaWxlID0gZmlsZS50b0xvd2VyQ2FzZSgpXG4gICAgICAgIGZvciBzdGFydCBpbiBpZ25vcmVEZWZhdWx0cy5zdGFydHNXaXRoXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZSBpZiBmaWxlLnN0YXJ0c1dpdGggc3RhcnRcbiAgICAgICAgZm9yIGNvbnRhaW5zIGluIGlnbm9yZURlZmF1bHRzLmNvbnRhaW5zXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZSBpZiBmaWxlLmluZGV4T2YoY29udGFpbnMpID49IDBcbiAgICAgICAgZm9yIG1hdGNoIGluIGlnbm9yZURlZmF1bHRzLm1hdGNoZXNcbiAgICAgICAgICAgIHJldHVybiB0cnVlIGlmIGZpbGUgPT0gbWF0Y2hcbiAgICAgICAgZmFsc2VcbiAgICAgICAgICAgIFxuICAgIGlnbm9yZSA9IHByZWZzLmdldCAnaWdub3JlJywgW11cbiAgICBmb2xkZXJzTGVmdCA9IGRpcnMubGVuZ3RoXG5cbiAgICBmb3IgZXhlRm9sZGVyIGluIGRpcnNcbiAgICAgICAgXG4gICAgICAgIHdhbGtPcHQgPSBwcmVmcy5nZXQgJ3dhbGsnLCBub19yZWN1cnNlOiBmYWxzZSwgbWF4X2RlcHRoOiA0XG4gICAgICAgIHdhbGsgPSB3YWxrZGlyIHNsYXNoLnJlc29sdmUoZXhlRm9sZGVyKSwgd2Fsa09wdFxuXG4gICAgICAgIHdhbGsub24gJ2Vycm9yJywgKGVycikgLT4gXG4gICAgICAgICAgICBwb3N0LnRvV2lucyAnbWFpbmxvZycsIFwid2FsayBlcnJvciAje2Vyci5zdGFja31cIlxuICAgICAgICAgICAgbG9nIFwiW0VSUk9SXSBmaW5kRXhlcyAtLSAje2Vycn1cIlxuXG4gICAgICAgIHdhbGsub24gJ2VuZCcsIC0+XG5cbiAgICAgICAgICAgIGZvbGRlcnNMZWZ0IC09IDFcbiAgICAgICAgICAgIGlmIGZvbGRlcnNMZWZ0ID09IDBcbiAgICAgICAgICAgICAgICAjIHBvc3QudG9XaW5zICdtYWlubG9nJywgXCJhcHBzICN7YXBwc31cIlxuICAgICAgICAgICAgICAgIGNiPyBhcHBzXG5cbiAgICAgICAgd2Fsay5vbiAnZmlsZScsIChmaWxlKSAtPlxuXG4gICAgICAgICAgICBmaWxlID0gc2xhc2gucmVzb2x2ZSBmaWxlXG4gICAgICAgICAgICBpZiBzbGFzaC5leHQoZmlsZSkgPT0gJ2V4ZSdcbiAgICAgICAgICAgICAgICBuYW1lID0gc2xhc2guYmFzZSBmaWxlXG4gICAgICAgICAgICAgICAgaWYgZmlsZSBub3QgaW4gaWdub3JlIGFuZCBub3QgaWdub3JlZEJ5RGVmYXVsdCBuYW1lXG4gICAgICAgICAgICAgICAgICAgIGlmIG5vdCBhcHBzW25hbWVdP1xuICAgICAgICAgICAgICAgICAgICAgICAgYXBwc1tuYW1lXSA9IGZpbGVcblxubW9kdWxlLmV4cG9ydHMgPSBleGVGaW5kXG4iXX0=
//# sourceURL=../coffee/exefind.coffee