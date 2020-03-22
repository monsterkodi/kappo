// koffee 1.12.0

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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwZmluZC5qcyIsInNvdXJjZVJvb3QiOiIuLi9jb2ZmZWUiLCJzb3VyY2VzIjpbImFwcGZpbmQuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUE7Ozs7Ozs7QUFBQSxJQUFBOztBQVFBLE1BQTBDLE9BQUEsQ0FBUSxLQUFSLENBQTFDLEVBQUUscUJBQUYsRUFBVyxpQkFBWCxFQUFrQixpQkFBbEIsRUFBeUIsZUFBekIsRUFBK0IsYUFBL0IsRUFBb0M7O0FBRXBDLE9BQUEsR0FBVSxTQUFDLEVBQUQ7QUFFTixRQUFBO0lBQUEsSUFBQSxHQUFPO0lBQ1AsSUFBSyxDQUFBLFFBQUEsQ0FBTCxHQUFpQjtJQUNqQixVQUFBLEdBQWEsQ0FDVCxlQURTLEVBRVQseUJBRlMsRUFHVCxzQkFIUyxFQUlULGdDQUpTLEVBS1QsR0FMUztJQU9iLFVBQUEsR0FBYSxVQUFVLENBQUMsTUFBWCxDQUFrQixLQUFLLENBQUMsR0FBTixDQUFVLE1BQVYsRUFBa0IsRUFBbEIsQ0FBbEI7SUFDYixXQUFBLEdBQWMsVUFBVSxDQUFDO0FBRXpCO1NBQUEsNENBQUE7O1FBQ0ksT0FBQSxHQUFVLEtBQUssQ0FBQyxHQUFOLENBQVUsTUFBVixFQUFrQjtZQUFBLFVBQUEsRUFBWSxLQUFaO1lBQW1CLFNBQUEsRUFBVyxDQUE5QjtTQUFsQjtRQUNWLElBQUEsR0FBTyxPQUFBLENBQVEsS0FBSyxDQUFDLE9BQU4sQ0FBYyxTQUFkLENBQVIsRUFBa0MsT0FBbEM7UUFDUCxJQUFJLENBQUMsRUFBTCxDQUFRLE9BQVIsRUFBaUIsU0FBQyxHQUFEO21CQUFPLE9BQUEsQ0FBRSxHQUFGLENBQU0sc0JBQUEsR0FBdUIsR0FBN0I7UUFBUCxDQUFqQjtRQUNBLElBQUksQ0FBQyxFQUFMLENBQVEsS0FBUixFQUFlLFNBQUE7WUFDWCxXQUFBLElBQWU7WUFDZixJQUFHLFdBQUEsS0FBZSxDQUFsQjt1QkFFSSxFQUFBLENBQUcsSUFBSCxFQUZKOztRQUZXLENBQWY7cUJBS0EsSUFBSSxDQUFDLEVBQUwsQ0FBUSxXQUFSLEVBQXFCLFNBQUMsR0FBRDtBQUNqQixnQkFBQTtZQUFBLElBQUcsS0FBSyxDQUFDLEdBQU4sQ0FBVSxHQUFWLENBQUEsS0FBa0IsS0FBckI7Z0JBQ0ksSUFBRyxDQUFJLG1CQUFtQixDQUFDLElBQXBCLENBQXlCLEtBQUssQ0FBQyxJQUFOLENBQVcsR0FBWCxDQUF6QixDQUFQO29CQUNJLElBQUEsR0FBTyxLQUFLLENBQUMsSUFBTixDQUFXLEdBQVg7MkJBQ1AsSUFBSyxDQUFBLElBQUEsQ0FBTCxHQUFhLElBRmpCO2lCQURKOztRQURpQixDQUFyQjtBQVRKOztBQWRNOztBQTZCVixNQUFNLENBQUMsT0FBUCxHQUFpQiIsInNvdXJjZXNDb250ZW50IjpbIiMjI1xuIDAwMDAwMDAgICAwMDAwMDAwMCAgIDAwMDAwMDAwICAgMDAwMDAwMDAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgIFxuMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgMDAwMCAgMDAwICAwMDAgICAwMDAgIFxuMDAwMDAwMDAwICAwMDAwMDAwMCAgIDAwMDAwMDAwICAgMDAwMDAwICAgIDAwMCAgMDAwIDAgMDAwICAwMDAgICAwMDAgIFxuMDAwICAgMDAwICAwMDAgICAgICAgIDAwMCAgICAgICAgMDAwICAgICAgIDAwMCAgMDAwICAwMDAwICAwMDAgICAwMDAgIFxuMDAwICAgMDAwICAwMDAgICAgICAgIDAwMCAgICAgICAgMDAwICAgICAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgIFxuIyMjXG5cbnsgd2Fsa2RpciwgcHJlZnMsIHNsYXNoLCBsYXN0LCBsb2csIF8gfSA9IHJlcXVpcmUgJ2t4aydcblxuYXBwRmluZCA9IChjYikgLT5cblxuICAgIGFwcHMgPSB7fVxuICAgIGFwcHNbJ0ZpbmRlciddID0gXCIvU3lzdGVtL0xpYnJhcnkvQ29yZVNlcnZpY2VzL0ZpbmRlci5hcHBcIlxuICAgIGFwcEZvbGRlcnMgPSBbXG4gICAgICAgIFwiL0FwcGxpY2F0aW9uc1wiXG4gICAgICAgIFwiL0FwcGxpY2F0aW9ucy9VdGlsaXRpZXNcIlxuICAgICAgICBcIi9TeXN0ZW0vQXBwbGljYXRpb25zXCJcbiAgICAgICAgXCIvU3lzdGVtL0FwcGxpY2F0aW9ucy9VdGlsaXRpZXNcIlxuICAgICAgICBcIn5cIlxuICAgICAgICBdXG4gICAgYXBwRm9sZGVycyA9IGFwcEZvbGRlcnMuY29uY2F0IHByZWZzLmdldCAnZGlycycsIFtdXG4gICAgZm9sZGVyc0xlZnQgPSBhcHBGb2xkZXJzLmxlbmd0aFxuICAgIFxuICAgIGZvciBhcHBGb2xkZXIgaW4gYXBwRm9sZGVyc1xuICAgICAgICB3YWxrT3B0ID0gcHJlZnMuZ2V0ICd3YWxrJywgbm9fcmVjdXJzZTogZmFsc2UsIG1heF9kZXB0aDogNFxuICAgICAgICB3YWxrID0gd2Fsa2RpciBzbGFzaC5yZXNvbHZlKGFwcEZvbGRlciksIHdhbGtPcHRcbiAgICAgICAgd2Fsay5vbiAnZXJyb3InLCAoZXJyKSAtPiBsb2cgXCJbRVJST1JdIGZpbmRBcHBzIC0tICN7ZXJyfVwiXG4gICAgICAgIHdhbGsub24gJ2VuZCcsIC0+XG4gICAgICAgICAgICBmb2xkZXJzTGVmdCAtPSAxXG4gICAgICAgICAgICBpZiBmb2xkZXJzTGVmdCA9PSAwXG4gICAgICAgICAgICAgICAgIyBsb2cgXCJmb3VuZDogI3tfLnNpemUgYXBwc31cIlxuICAgICAgICAgICAgICAgIGNiIGFwcHNcbiAgICAgICAgd2Fsay5vbiAnZGlyZWN0b3J5JywgKGRpcikgLT5cbiAgICAgICAgICAgIGlmIHNsYXNoLmV4dChkaXIpID09ICdhcHAnIFxuICAgICAgICAgICAgICAgIGlmIG5vdCAvKEhlbHBlciR8TlAkfEVIJCkvLnRlc3Qgc2xhc2guYmFzZSBkaXJcbiAgICAgICAgICAgICAgICAgICAgbmFtZSA9IHNsYXNoLmJhc2UgZGlyXG4gICAgICAgICAgICAgICAgICAgIGFwcHNbbmFtZV0gPSBkaXJcblxubW9kdWxlLmV4cG9ydHMgPSBhcHBGaW5kICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgIl19
//# sourceURL=../coffee/appfind.coffee