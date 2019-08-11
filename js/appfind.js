// koffee 1.4.0

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
    appFolders = ["/Applications", "/Applications/Utilities", "~"];
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
                name = slash.base(dir);
                return apps[name] = dir;
            }
        }));
    }
    return results;
};

module.exports = appFind;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwZmluZC5qcyIsInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyIiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7OztBQUFBLElBQUE7O0FBUUEsTUFBb0MsT0FBQSxDQUFRLEtBQVIsQ0FBcEMsRUFBRSxxQkFBRixFQUFXLGlCQUFYLEVBQWtCLGlCQUFsQixFQUF5QixhQUF6QixFQUE4Qjs7QUFFOUIsT0FBQSxHQUFVLFNBQUMsRUFBRDtBQUVOLFFBQUE7SUFBQSxJQUFBLEdBQU87SUFDUCxJQUFLLENBQUEsUUFBQSxDQUFMLEdBQWlCO0lBQ2pCLFVBQUEsR0FBYSxDQUNULGVBRFMsRUFFVCx5QkFGUyxFQUdULEdBSFM7SUFLYixVQUFBLEdBQWEsVUFBVSxDQUFDLE1BQVgsQ0FBa0IsS0FBSyxDQUFDLEdBQU4sQ0FBVSxNQUFWLEVBQWtCLEVBQWxCLENBQWxCO0lBQ2IsV0FBQSxHQUFjLFVBQVUsQ0FBQztBQUV6QjtTQUFBLDRDQUFBOztRQUNJLE9BQUEsR0FBVSxLQUFLLENBQUMsR0FBTixDQUFVLE1BQVYsRUFBa0I7WUFBQSxVQUFBLEVBQVksS0FBWjtZQUFtQixTQUFBLEVBQVcsQ0FBOUI7U0FBbEI7UUFDVixJQUFBLEdBQU8sT0FBQSxDQUFRLEtBQUssQ0FBQyxPQUFOLENBQWMsU0FBZCxDQUFSLEVBQWtDLE9BQWxDO1FBQ1AsSUFBSSxDQUFDLEVBQUwsQ0FBUSxPQUFSLEVBQWlCLFNBQUMsR0FBRDttQkFBTyxPQUFBLENBQUUsR0FBRixDQUFNLHNCQUFBLEdBQXVCLEdBQTdCO1FBQVAsQ0FBakI7UUFDQSxJQUFJLENBQUMsRUFBTCxDQUFRLEtBQVIsRUFBZSxTQUFBO1lBQ1gsV0FBQSxJQUFlO1lBQ2YsSUFBRyxXQUFBLEtBQWUsQ0FBbEI7dUJBRUksRUFBQSxDQUFHLElBQUgsRUFGSjs7UUFGVyxDQUFmO3FCQUtBLElBQUksQ0FBQyxFQUFMLENBQVEsV0FBUixFQUFxQixTQUFDLEdBQUQ7QUFDakIsZ0JBQUE7WUFBQSxJQUFHLEtBQUssQ0FBQyxHQUFOLENBQVUsR0FBVixDQUFBLEtBQWtCLEtBQXJCO2dCQUNJLElBQUEsR0FBTyxLQUFLLENBQUMsSUFBTixDQUFXLEdBQVg7dUJBQ1AsSUFBSyxDQUFBLElBQUEsQ0FBTCxHQUFhLElBRmpCOztRQURpQixDQUFyQjtBQVRKOztBQVpNOztBQTBCVixNQUFNLENBQUMsT0FBUCxHQUFpQiIsInNvdXJjZXNDb250ZW50IjpbIiMjI1xuIDAwMDAwMDAgICAwMDAwMDAwMCAgIDAwMDAwMDAwICAgMDAwMDAwMDAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgIFxuMDAwICAgMDAwICAwMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgICAgIDAwMCAgMDAwMCAgMDAwICAwMDAgICAwMDAgIFxuMDAwMDAwMDAwICAwMDAwMDAwMCAgIDAwMDAwMDAwICAgMDAwMDAwICAgIDAwMCAgMDAwIDAgMDAwICAwMDAgICAwMDAgIFxuMDAwICAgMDAwICAwMDAgICAgICAgIDAwMCAgICAgICAgMDAwICAgICAgIDAwMCAgMDAwICAwMDAwICAwMDAgICAwMDAgIFxuMDAwICAgMDAwICAwMDAgICAgICAgIDAwMCAgICAgICAgMDAwICAgICAgIDAwMCAgMDAwICAgMDAwICAwMDAwMDAwICAgIFxuIyMjXG5cbnsgd2Fsa2RpciwgcHJlZnMsIHNsYXNoLCBsb2csIF8gfSA9IHJlcXVpcmUgJ2t4aydcblxuYXBwRmluZCA9IChjYikgLT5cblxuICAgIGFwcHMgPSB7fVxuICAgIGFwcHNbJ0ZpbmRlciddID0gXCIvU3lzdGVtL0xpYnJhcnkvQ29yZVNlcnZpY2VzL0ZpbmRlci5hcHBcIlxuICAgIGFwcEZvbGRlcnMgPSBbXG4gICAgICAgIFwiL0FwcGxpY2F0aW9uc1wiXG4gICAgICAgIFwiL0FwcGxpY2F0aW9ucy9VdGlsaXRpZXNcIlxuICAgICAgICBcIn5cIlxuICAgICAgICBdXG4gICAgYXBwRm9sZGVycyA9IGFwcEZvbGRlcnMuY29uY2F0IHByZWZzLmdldCAnZGlycycsIFtdXG4gICAgZm9sZGVyc0xlZnQgPSBhcHBGb2xkZXJzLmxlbmd0aFxuICAgIFxuICAgIGZvciBhcHBGb2xkZXIgaW4gYXBwRm9sZGVyc1xuICAgICAgICB3YWxrT3B0ID0gcHJlZnMuZ2V0ICd3YWxrJywgbm9fcmVjdXJzZTogZmFsc2UsIG1heF9kZXB0aDogNFxuICAgICAgICB3YWxrID0gd2Fsa2RpciBzbGFzaC5yZXNvbHZlKGFwcEZvbGRlciksIHdhbGtPcHRcbiAgICAgICAgd2Fsay5vbiAnZXJyb3InLCAoZXJyKSAtPiBsb2cgXCJbRVJST1JdIGZpbmRBcHBzIC0tICN7ZXJyfVwiXG4gICAgICAgIHdhbGsub24gJ2VuZCcsIC0+XG4gICAgICAgICAgICBmb2xkZXJzTGVmdCAtPSAxXG4gICAgICAgICAgICBpZiBmb2xkZXJzTGVmdCA9PSAwXG4gICAgICAgICAgICAgICAgIyBsb2cgXCJmb3VuZDogI3tfLnNpemUgYXBwc31cIlxuICAgICAgICAgICAgICAgIGNiIGFwcHNcbiAgICAgICAgd2Fsay5vbiAnZGlyZWN0b3J5JywgKGRpcikgLT5cbiAgICAgICAgICAgIGlmIHNsYXNoLmV4dChkaXIpID09ICdhcHAnXG4gICAgICAgICAgICAgICAgbmFtZSA9IHNsYXNoLmJhc2UgZGlyXG4gICAgICAgICAgICAgICAgYXBwc1tuYW1lXSA9IGRpclxuXG5tb2R1bGUuZXhwb3J0cyA9IGFwcEZpbmQgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAiXX0=
//# sourceURL=../coffee/appfind.coffee