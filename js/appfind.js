// koffee 1.3.0

/*
 0000000   00000000   00000000   00000000  000  000   000  0000000    
000   000  000   000  000   000  000       000  0000  000  000   000  
000000000  00000000   00000000   000000    000  000 0 000  000   000  
000   000  000        000        000       000  000  0000  000   000  
000   000  000        000        000       000  000   000  0000000
 */
var _, appFind, log, prefs, ref, slash, walkdir;

ref = require('kxk'), walkdir = ref.walkdir, prefs = ref.prefs, slash = ref.slash, log = ref.log, _ = ref._;

appFind = function(cb) {
    var appFolder, appFolders, apps, foldersLeft, i, len, results, walk, walkOpt;
    apps = {};
    apps['Finder'] = "/System/Library/CoreServices/Finder.app";
    appFolders = ["/Applications", "/Applications/Utilities"];
    appFolders = appFolders.concat(prefs.get('dirs', []));
    foldersLeft = appFolders.length;
    results = [];
    for (i = 0, len = appFolders.length; i < len; i++) {
        appFolder = appFolders[i];
        walkOpt = prefs.get('walk', {
            no_recurse: true
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
                name = slash.base(dir);
                return apps[name] = dir;
            }
        }));
    }
    return results;
};

module.exports = appFind;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwZmluZC5qcyIsInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyIiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7OztBQUFBLElBQUE7O0FBUUEsTUFBb0MsT0FBQSxDQUFRLEtBQVIsQ0FBcEMsRUFBRSxxQkFBRixFQUFXLGlCQUFYLEVBQWtCLGlCQUFsQixFQUF5QixhQUF6QixFQUE4Qjs7QUFFOUIsT0FBQSxHQUFVLFNBQUMsRUFBRDtBQUVOLFFBQUE7SUFBQSxJQUFBLEdBQU87SUFDUCxJQUFLLENBQUEsUUFBQSxDQUFMLEdBQWlCO0lBQ2pCLFVBQUEsR0FBYSxDQUNULGVBRFMsRUFFVCx5QkFGUztJQUliLFVBQUEsR0FBYSxVQUFVLENBQUMsTUFBWCxDQUFrQixLQUFLLENBQUMsR0FBTixDQUFVLE1BQVYsRUFBa0IsRUFBbEIsQ0FBbEI7SUFDYixXQUFBLEdBQWMsVUFBVSxDQUFDO0FBRXpCO1NBQUEsNENBQUE7O1FBQ0ksT0FBQSxHQUFVLEtBQUssQ0FBQyxHQUFOLENBQVUsTUFBVixFQUFrQjtZQUFBLFVBQUEsRUFBWSxJQUFaO1NBQWxCO1FBQ1YsSUFBQSxHQUFPLE9BQUEsQ0FBUSxLQUFLLENBQUMsT0FBTixDQUFjLFNBQWQsQ0FBUixFQUFrQyxPQUFsQztRQUNQLElBQUksQ0FBQyxFQUFMLENBQVEsT0FBUixFQUFpQixTQUFDLEdBQUQ7bUJBQU8sT0FBQSxDQUFFLEdBQUYsQ0FBTSxzQkFBQSxHQUF1QixHQUE3QjtRQUFQLENBQWpCO1FBQ0EsSUFBSSxDQUFDLEVBQUwsQ0FBUSxLQUFSLEVBQWUsU0FBQTtZQUNYLFdBQUEsSUFBZTtZQUNmLElBQUcsV0FBQSxLQUFlLENBQWxCO3VCQUVJLEVBQUEsQ0FBRyxJQUFILEVBRko7O1FBRlcsQ0FBZjtxQkFLQSxJQUFJLENBQUMsRUFBTCxDQUFRLFdBQVIsRUFBcUIsU0FBQyxHQUFEO0FBQ2pCLGdCQUFBO1lBQUEsSUFBRyxLQUFLLENBQUMsR0FBTixDQUFVLEdBQVYsQ0FBQSxLQUFrQixLQUFyQjtnQkFDSSxJQUFBLEdBQU8sS0FBSyxDQUFDLElBQU4sQ0FBVyxHQUFYO3VCQUNQLElBQUssQ0FBQSxJQUFBLENBQUwsR0FBYSxJQUZqQjs7UUFEaUIsQ0FBckI7QUFUSjs7QUFYTTs7QUF5QlYsTUFBTSxDQUFDLE9BQVAsR0FBaUIiLCJzb3VyY2VzQ29udGVudCI6WyIjIyNcbiAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAwMDAwMCAgIDAwMDAwMDAwICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICBcbjAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgIDAwMDAgIDAwMCAgMDAwICAgMDAwICBcbjAwMDAwMDAwMCAgMDAwMDAwMDAgICAwMDAwMDAwMCAgIDAwMDAwMCAgICAwMDAgIDAwMCAwIDAwMCAgMDAwICAgMDAwICBcbjAwMCAgIDAwMCAgMDAwICAgICAgICAwMDAgICAgICAgIDAwMCAgICAgICAwMDAgIDAwMCAgMDAwMCAgMDAwICAgMDAwICBcbjAwMCAgIDAwMCAgMDAwICAgICAgICAwMDAgICAgICAgIDAwMCAgICAgICAwMDAgIDAwMCAgIDAwMCAgMDAwMDAwMCAgICBcbiMjI1xuXG57IHdhbGtkaXIsIHByZWZzLCBzbGFzaCwgbG9nLCBfIH0gPSByZXF1aXJlICdreGsnXG5cbmFwcEZpbmQgPSAoY2IpIC0+XG5cbiAgICBhcHBzID0ge31cbiAgICBhcHBzWydGaW5kZXInXSA9IFwiL1N5c3RlbS9MaWJyYXJ5L0NvcmVTZXJ2aWNlcy9GaW5kZXIuYXBwXCJcbiAgICBhcHBGb2xkZXJzID0gW1xuICAgICAgICBcIi9BcHBsaWNhdGlvbnNcIlxuICAgICAgICBcIi9BcHBsaWNhdGlvbnMvVXRpbGl0aWVzXCJcbiAgICAgICAgXVxuICAgIGFwcEZvbGRlcnMgPSBhcHBGb2xkZXJzLmNvbmNhdCBwcmVmcy5nZXQgJ2RpcnMnLCBbXVxuICAgIGZvbGRlcnNMZWZ0ID0gYXBwRm9sZGVycy5sZW5ndGhcbiAgICBcbiAgICBmb3IgYXBwRm9sZGVyIGluIGFwcEZvbGRlcnNcbiAgICAgICAgd2Fsa09wdCA9IHByZWZzLmdldCAnd2FsaycsIG5vX3JlY3Vyc2U6IHRydWVcbiAgICAgICAgd2FsayA9IHdhbGtkaXIgc2xhc2gucmVzb2x2ZShhcHBGb2xkZXIpLCB3YWxrT3B0XG4gICAgICAgIHdhbGsub24gJ2Vycm9yJywgKGVycikgLT4gbG9nIFwiW0VSUk9SXSBmaW5kQXBwcyAtLSAje2Vycn1cIlxuICAgICAgICB3YWxrLm9uICdlbmQnLCAtPlxuICAgICAgICAgICAgZm9sZGVyc0xlZnQgLT0gMVxuICAgICAgICAgICAgaWYgZm9sZGVyc0xlZnQgPT0gMFxuICAgICAgICAgICAgICAgICMgbG9nIFwiZm91bmQ6ICN7Xy5zaXplIGFwcHN9XCJcbiAgICAgICAgICAgICAgICBjYiBhcHBzXG4gICAgICAgIHdhbGsub24gJ2RpcmVjdG9yeScsIChkaXIpIC0+XG4gICAgICAgICAgICBpZiBzbGFzaC5leHQoZGlyKSA9PSAnYXBwJ1xuICAgICAgICAgICAgICAgIG5hbWUgPSBzbGFzaC5iYXNlIGRpclxuICAgICAgICAgICAgICAgIGFwcHNbbmFtZV0gPSBkaXJcblxubW9kdWxlLmV4cG9ydHMgPSBhcHBGaW5kICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgIl19
//# sourceURL=../coffee/appfind.coffee