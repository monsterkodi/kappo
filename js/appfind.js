// koffee 1.4.0

/*
 0000000   00000000   00000000   00000000  000  000   000  0000000    
000   000  000   000  000   000  000       000  0000  000  000   000  
000000000  00000000   00000000   000000    000  000 0 000  000   000  
000   000  000        000        000       000  000  0000  000   000  
000   000  000        000        000       000  000   000  0000000
 */
var _, appFind, last, log, prefs, ref, slash, walkdir;

ref = require('kxk'), walkdir = ref.walkdir, prefs = ref.prefs, slash = ref.slash, last = ref.last, log = ref.log, _ = ref._;

appFind = function(cb) {
    var appFolder, appFolders, apps, foldersLeft, i, len, results, walk, walkOpt;
    apps = {};
    apps['Finder'] = "/System/Library/CoreServices/Finder.app";
    appFolders = ["/Applications", "/Applications/Utilities", "/System/Applications", "/System/Applications/Utilities", "~"];
    appFolders = appFolders.concat(prefs.get('dirs', []));
    foldersLeft = appFolders.length;
    results = [];
    for (i = 0, len = appFolders.length; i < len; i++) {
        appFolder = appFolders[i];
        walkOpt = prefs.get('walk', {
            no_recurse: false,
            max_depth: 4
        });
        walk = walkdir(slash.resolve(appFolder), walkOpt);
        walk.on('error', function(err) {
            return console.log("[ERROR] findApps -- " + err);
        });
        walk.on('end', function() {
            foldersLeft -= 1;
            if (foldersLeft === 0) {
                return cb(apps);
            }
        });
        results.push(walk.on('directory', function(dir) {
            var name;
            if (slash.ext(dir) === 'app') {
                if (!/(Helper$|NP$|EH$)/.test(slash.base(dir))) {
                    name = slash.base(dir);
                    return apps[name] = dir;
                }
            }
        }));
    }
    return results;
};

module.exports = appFind;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwZmluZC5qcyIsInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyIiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7OztBQUFBLElBQUE7O0FBUUEsTUFBMEMsT0FBQSxDQUFRLEtBQVIsQ0FBMUMsRUFBRSxxQkFBRixFQUFXLGlCQUFYLEVBQWtCLGlCQUFsQixFQUF5QixlQUF6QixFQUErQixhQUEvQixFQUFvQzs7QUFFcEMsT0FBQSxHQUFVLFNBQUMsRUFBRDtBQUVOLFFBQUE7SUFBQSxJQUFBLEdBQU87SUFDUCxJQUFLLENBQUEsUUFBQSxDQUFMLEdBQWlCO0lBQ2pCLFVBQUEsR0FBYSxDQUNULGVBRFMsRUFFVCx5QkFGUyxFQUdULHNCQUhTLEVBSVQsZ0NBSlMsRUFLVCxHQUxTO0lBT2IsVUFBQSxHQUFhLFVBQVUsQ0FBQyxNQUFYLENBQWtCLEtBQUssQ0FBQyxHQUFOLENBQVUsTUFBVixFQUFrQixFQUFsQixDQUFsQjtJQUNiLFdBQUEsR0FBYyxVQUFVLENBQUM7QUFFekI7U0FBQSw0Q0FBQTs7UUFDSSxPQUFBLEdBQVUsS0FBSyxDQUFDLEdBQU4sQ0FBVSxNQUFWLEVBQWtCO1lBQUEsVUFBQSxFQUFZLEtBQVo7WUFBbUIsU0FBQSxFQUFXLENBQTlCO1NBQWxCO1FBQ1YsSUFBQSxHQUFPLE9BQUEsQ0FBUSxLQUFLLENBQUMsT0FBTixDQUFjLFNBQWQsQ0FBUixFQUFrQyxPQUFsQztRQUNQLElBQUksQ0FBQyxFQUFMLENBQVEsT0FBUixFQUFpQixTQUFDLEdBQUQ7bUJBQU8sT0FBQSxDQUFFLEdBQUYsQ0FBTSxzQkFBQSxHQUF1QixHQUE3QjtRQUFQLENBQWpCO1FBQ0EsSUFBSSxDQUFDLEVBQUwsQ0FBUSxLQUFSLEVBQWUsU0FBQTtZQUNYLFdBQUEsSUFBZTtZQUNmLElBQUcsV0FBQSxLQUFlLENBQWxCO3VCQUVJLEVBQUEsQ0FBRyxJQUFILEVBRko7O1FBRlcsQ0FBZjtxQkFLQSxJQUFJLENBQUMsRUFBTCxDQUFRLFdBQVIsRUFBcUIsU0FBQyxHQUFEO0FBQ2pCLGdCQUFBO1lBQUEsSUFBRyxLQUFLLENBQUMsR0FBTixDQUFVLEdBQVYsQ0FBQSxLQUFrQixLQUFyQjtnQkFDSSxJQUFHLENBQUksbUJBQW1CLENBQUMsSUFBcEIsQ0FBeUIsS0FBSyxDQUFDLElBQU4sQ0FBVyxHQUFYLENBQXpCLENBQVA7b0JBQ0ksSUFBQSxHQUFPLEtBQUssQ0FBQyxJQUFOLENBQVcsR0FBWDsyQkFDUCxJQUFLLENBQUEsSUFBQSxDQUFMLEdBQWEsSUFGakI7aUJBREo7O1FBRGlCLENBQXJCO0FBVEo7O0FBZE07O0FBNkJWLE1BQU0sQ0FBQyxPQUFQLEdBQWlCIiwic291cmNlc0NvbnRlbnQiOlsiIyMjXG4gMDAwMDAwMCAgIDAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAwMDAwMCAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgICAgXG4wMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAgICAgMDAwICAwMDAwICAwMDAgIDAwMCAgIDAwMCAgXG4wMDAwMDAwMDAgIDAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAwMDAgICAgMDAwICAwMDAgMCAwMDAgIDAwMCAgIDAwMCAgXG4wMDAgICAwMDAgIDAwMCAgICAgICAgMDAwICAgICAgICAwMDAgICAgICAgMDAwICAwMDAgIDAwMDAgIDAwMCAgIDAwMCAgXG4wMDAgICAwMDAgIDAwMCAgICAgICAgMDAwICAgICAgICAwMDAgICAgICAgMDAwICAwMDAgICAwMDAgIDAwMDAwMDAgICAgXG4jIyNcblxueyB3YWxrZGlyLCBwcmVmcywgc2xhc2gsIGxhc3QsIGxvZywgXyB9ID0gcmVxdWlyZSAna3hrJ1xuXG5hcHBGaW5kID0gKGNiKSAtPlxuXG4gICAgYXBwcyA9IHt9XG4gICAgYXBwc1snRmluZGVyJ10gPSBcIi9TeXN0ZW0vTGlicmFyeS9Db3JlU2VydmljZXMvRmluZGVyLmFwcFwiXG4gICAgYXBwRm9sZGVycyA9IFtcbiAgICAgICAgXCIvQXBwbGljYXRpb25zXCJcbiAgICAgICAgXCIvQXBwbGljYXRpb25zL1V0aWxpdGllc1wiXG4gICAgICAgIFwiL1N5c3RlbS9BcHBsaWNhdGlvbnNcIlxuICAgICAgICBcIi9TeXN0ZW0vQXBwbGljYXRpb25zL1V0aWxpdGllc1wiXG4gICAgICAgIFwiflwiXG4gICAgICAgIF1cbiAgICBhcHBGb2xkZXJzID0gYXBwRm9sZGVycy5jb25jYXQgcHJlZnMuZ2V0ICdkaXJzJywgW11cbiAgICBmb2xkZXJzTGVmdCA9IGFwcEZvbGRlcnMubGVuZ3RoXG4gICAgXG4gICAgZm9yIGFwcEZvbGRlciBpbiBhcHBGb2xkZXJzXG4gICAgICAgIHdhbGtPcHQgPSBwcmVmcy5nZXQgJ3dhbGsnLCBub19yZWN1cnNlOiBmYWxzZSwgbWF4X2RlcHRoOiA0XG4gICAgICAgIHdhbGsgPSB3YWxrZGlyIHNsYXNoLnJlc29sdmUoYXBwRm9sZGVyKSwgd2Fsa09wdFxuICAgICAgICB3YWxrLm9uICdlcnJvcicsIChlcnIpIC0+IGxvZyBcIltFUlJPUl0gZmluZEFwcHMgLS0gI3tlcnJ9XCJcbiAgICAgICAgd2Fsay5vbiAnZW5kJywgLT5cbiAgICAgICAgICAgIGZvbGRlcnNMZWZ0IC09IDFcbiAgICAgICAgICAgIGlmIGZvbGRlcnNMZWZ0ID09IDBcbiAgICAgICAgICAgICAgICAjIGxvZyBcImZvdW5kOiAje18uc2l6ZSBhcHBzfVwiXG4gICAgICAgICAgICAgICAgY2IgYXBwc1xuICAgICAgICB3YWxrLm9uICdkaXJlY3RvcnknLCAoZGlyKSAtPlxuICAgICAgICAgICAgaWYgc2xhc2guZXh0KGRpcikgPT0gJ2FwcCcgXG4gICAgICAgICAgICAgICAgaWYgbm90IC8oSGVscGVyJHxOUCR8RUgkKS8udGVzdCBzbGFzaC5iYXNlIGRpclxuICAgICAgICAgICAgICAgICAgICBuYW1lID0gc2xhc2guYmFzZSBkaXJcbiAgICAgICAgICAgICAgICAgICAgYXBwc1tuYW1lXSA9IGRpclxuXG5tb2R1bGUuZXhwb3J0cyA9IGFwcEZpbmQgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAiXX0=
//# sourceURL=../coffee/appfind.coffee