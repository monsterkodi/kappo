// koffee 1.3.0

/*
 0000000   00000000   00000000   000   0000000   0000000   000   000  
000   000  000   000  000   000  000  000       000   000  0000  000  
000000000  00000000   00000000   000  000       000   000  000 0 000  
000   000  000        000        000  000       000   000  000  0000  
000   000  000        000        000   0000000   0000000   000   000
 */
var AppIcon, childp, error, fs, log, plist, ref, slash;

ref = require('kxk'), childp = ref.childp, fs = ref.fs, slash = ref.slash, error = ref.error, log = ref.log;

plist = require('simple-plist');

AppIcon = (function() {
    function AppIcon() {}

    AppIcon.cache = {};

    AppIcon.pngPath = function(opt) {
        return slash.resolve(slash.join(opt.iconDir, slash.base(opt.appPath) + ".png"));
    };

    AppIcon.get = function(opt) {
        var pngPath;
        pngPath = AppIcon.pngPath(opt);
        if (AppIcon.cache[pngPath]) {
            return opt.cb(pngPath, opt.cbArg);
        } else {
            return fs.stat(pngPath, function(err, stat) {
                if ((err == null) && stat.isFile()) {
                    AppIcon.cache[pngPath] = true;
                    return opt.cb(pngPath, opt.cbArg);
                } else {
                    return AppIcon.getIcon(opt);
                }
            });
        }
    };

    AppIcon.getIcon = function(opt) {
        var appPath, infoPath;
        appPath = opt.appPath;
        infoPath = slash.join(appPath, 'Contents', 'Info.plist');
        return plist.readFile(infoPath, function(err, obj) {
            var icnsPath;
            if (err == null) {
                if (obj['CFBundleIconFile'] != null) {
                    icnsPath = slash.join(slash.dirname(infoPath), 'Resources', obj['CFBundleIconFile']);
                    if (!icnsPath.endsWith('.icns')) {
                        icnsPath += ".icns";
                    }
                    return AppIcon.saveIcon(icnsPath, opt);
                } else {
                    return AppIcon.brokenIcon(opt);
                }
            } else {
                console.error("getIcon: " + err);
                return AppIcon.brokenIcon(opt);
            }
        });
    };

    AppIcon.saveIcon = function(icnsPath, opt) {
        var pngPath;
        pngPath = AppIcon.pngPath(opt);
        return childp.exec("/usr/bin/sips -Z " + opt.size + " -s format png \"" + icnsPath + "\" --out \"" + pngPath + "\"", function(err) {
            if (err == null) {
                return opt.cb(pngPath, opt.cbArg);
            } else {
                console.error("saveIcon: " + err);
                return AppIcon.brokenIcon(opt);
            }
        });
    };

    AppIcon.brokenIcon = function(opt) {
        var brokenPath;
        brokenPath = slash.join(__dirname, '..', 'img', 'broken.png');
        return opt.cb(brokenPath, opt.cbArg);
    };

    return AppIcon;

})();

module.exports = AppIcon;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwaWNvbi5qcyIsInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyIiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7OztBQUFBLElBQUE7O0FBUUEsTUFBb0MsT0FBQSxDQUFRLEtBQVIsQ0FBcEMsRUFBRSxtQkFBRixFQUFVLFdBQVYsRUFBYyxpQkFBZCxFQUFxQixpQkFBckIsRUFBNEI7O0FBRTVCLEtBQUEsR0FBUSxPQUFBLENBQVEsY0FBUjs7QUFFRjs7O0lBRUYsT0FBQyxDQUFBLEtBQUQsR0FBUzs7SUFFVCxPQUFDLENBQUEsT0FBRCxHQUFVLFNBQUMsR0FBRDtlQUVOLEtBQUssQ0FBQyxPQUFOLENBQWMsS0FBSyxDQUFDLElBQU4sQ0FBVyxHQUFHLENBQUMsT0FBZixFQUF3QixLQUFLLENBQUMsSUFBTixDQUFXLEdBQUcsQ0FBQyxPQUFmLENBQUEsR0FBMEIsTUFBbEQsQ0FBZDtJQUZNOztJQUlWLE9BQUMsQ0FBQSxHQUFELEdBQU0sU0FBQyxHQUFEO0FBRUYsWUFBQTtRQUFBLE9BQUEsR0FBVSxPQUFPLENBQUMsT0FBUixDQUFnQixHQUFoQjtRQUNWLElBQUcsT0FBTyxDQUFDLEtBQU0sQ0FBQSxPQUFBLENBQWpCO21CQUNJLEdBQUcsQ0FBQyxFQUFKLENBQU8sT0FBUCxFQUFnQixHQUFHLENBQUMsS0FBcEIsRUFESjtTQUFBLE1BQUE7bUJBR0ksRUFBRSxDQUFDLElBQUgsQ0FBUSxPQUFSLEVBQWlCLFNBQUMsR0FBRCxFQUFNLElBQU47Z0JBQ2IsSUFBTyxhQUFKLElBQWEsSUFBSSxDQUFDLE1BQUwsQ0FBQSxDQUFoQjtvQkFDSSxPQUFPLENBQUMsS0FBTSxDQUFBLE9BQUEsQ0FBZCxHQUF5QjsyQkFDekIsR0FBRyxDQUFDLEVBQUosQ0FBTyxPQUFQLEVBQWdCLEdBQUcsQ0FBQyxLQUFwQixFQUZKO2lCQUFBLE1BQUE7MkJBSUksT0FBTyxDQUFDLE9BQVIsQ0FBZ0IsR0FBaEIsRUFKSjs7WUFEYSxDQUFqQixFQUhKOztJQUhFOztJQWFOLE9BQUMsQ0FBQSxPQUFELEdBQVUsU0FBQyxHQUFEO0FBRU4sWUFBQTtRQUFBLE9BQUEsR0FBVSxHQUFHLENBQUM7UUFDZCxRQUFBLEdBQVcsS0FBSyxDQUFDLElBQU4sQ0FBVyxPQUFYLEVBQW9CLFVBQXBCLEVBQWdDLFlBQWhDO2VBQ1gsS0FBSyxDQUFDLFFBQU4sQ0FBZSxRQUFmLEVBQXlCLFNBQUMsR0FBRCxFQUFNLEdBQU47QUFDckIsZ0JBQUE7WUFBQSxJQUFPLFdBQVA7Z0JBQ0ksSUFBRywrQkFBSDtvQkFDSSxRQUFBLEdBQVcsS0FBSyxDQUFDLElBQU4sQ0FBVyxLQUFLLENBQUMsT0FBTixDQUFjLFFBQWQsQ0FBWCxFQUFvQyxXQUFwQyxFQUFpRCxHQUFJLENBQUEsa0JBQUEsQ0FBckQ7b0JBQ1gsSUFBdUIsQ0FBSSxRQUFRLENBQUMsUUFBVCxDQUFrQixPQUFsQixDQUEzQjt3QkFBQSxRQUFBLElBQVksUUFBWjs7MkJBQ0EsT0FBTyxDQUFDLFFBQVIsQ0FBaUIsUUFBakIsRUFBMkIsR0FBM0IsRUFISjtpQkFBQSxNQUFBOzJCQUtJLE9BQU8sQ0FBQyxVQUFSLENBQW1CLEdBQW5CLEVBTEo7aUJBREo7YUFBQSxNQUFBO2dCQVFHLE9BQUEsQ0FBQyxLQUFELENBQU8sV0FBQSxHQUFZLEdBQW5CO3VCQUNDLE9BQU8sQ0FBQyxVQUFSLENBQW1CLEdBQW5CLEVBVEo7O1FBRHFCLENBQXpCO0lBSk07O0lBZ0JWLE9BQUMsQ0FBQSxRQUFELEdBQVcsU0FBQyxRQUFELEVBQVcsR0FBWDtBQUVQLFlBQUE7UUFBQSxPQUFBLEdBQVUsT0FBTyxDQUFDLE9BQVIsQ0FBZ0IsR0FBaEI7ZUFDVixNQUFNLENBQUMsSUFBUCxDQUFZLG1CQUFBLEdBQW9CLEdBQUcsQ0FBQyxJQUF4QixHQUE2QixtQkFBN0IsR0FBZ0QsUUFBaEQsR0FBeUQsYUFBekQsR0FBc0UsT0FBdEUsR0FBOEUsSUFBMUYsRUFBK0YsU0FBQyxHQUFEO1lBQzNGLElBQU8sV0FBUDt1QkFDSSxHQUFHLENBQUMsRUFBSixDQUFPLE9BQVAsRUFBZ0IsR0FBRyxDQUFDLEtBQXBCLEVBREo7YUFBQSxNQUFBO2dCQUdHLE9BQUEsQ0FBQyxLQUFELENBQU8sWUFBQSxHQUFhLEdBQXBCO3VCQUNDLE9BQU8sQ0FBQyxVQUFSLENBQW1CLEdBQW5CLEVBSko7O1FBRDJGLENBQS9GO0lBSE87O0lBVVgsT0FBQyxDQUFBLFVBQUQsR0FBYSxTQUFDLEdBQUQ7QUFFVCxZQUFBO1FBQUEsVUFBQSxHQUFhLEtBQUssQ0FBQyxJQUFOLENBQVcsU0FBWCxFQUFzQixJQUF0QixFQUE0QixLQUE1QixFQUFtQyxZQUFuQztlQUNiLEdBQUcsQ0FBQyxFQUFKLENBQU8sVUFBUCxFQUFtQixHQUFHLENBQUMsS0FBdkI7SUFIUzs7Ozs7O0FBS2pCLE1BQU0sQ0FBQyxPQUFQLEdBQWlCIiwic291cmNlc0NvbnRlbnQiOlsiIyMjXG4gMDAwMDAwMCAgIDAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAgICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgXG4wMDAgICAwMDAgIDAwMCAgIDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMDAgIDAwMCAgXG4wMDAwMDAwMDAgIDAwMDAwMDAwICAgMDAwMDAwMDAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAwIDAwMCAgXG4wMDAgICAwMDAgIDAwMCAgICAgICAgMDAwICAgICAgICAwMDAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgMDAwMCAgXG4wMDAgICAwMDAgIDAwMCAgICAgICAgMDAwICAgICAgICAwMDAgICAwMDAwMDAwICAgMDAwMDAwMCAgIDAwMCAgIDAwMCAgXG4jIyNcblxueyBjaGlsZHAsIGZzLCBzbGFzaCwgZXJyb3IsIGxvZyB9ID0gcmVxdWlyZSAna3hrJ1xuXG5wbGlzdCA9IHJlcXVpcmUgJ3NpbXBsZS1wbGlzdCdcblxuY2xhc3MgQXBwSWNvblxuICAgIFxuICAgIEBjYWNoZSA9IHt9XG4gICAgXG4gICAgQHBuZ1BhdGg6IChvcHQpIC0+XG4gICAgICAgIFxuICAgICAgICBzbGFzaC5yZXNvbHZlIHNsYXNoLmpvaW4gb3B0Lmljb25EaXIsIHNsYXNoLmJhc2Uob3B0LmFwcFBhdGgpICsgXCIucG5nXCJcblxuICAgIEBnZXQ6IChvcHQpIC0+XG4gICAgICAgIFxuICAgICAgICBwbmdQYXRoID0gQXBwSWNvbi5wbmdQYXRoIG9wdFxuICAgICAgICBpZiBBcHBJY29uLmNhY2hlW3BuZ1BhdGhdXG4gICAgICAgICAgICBvcHQuY2IgcG5nUGF0aCwgb3B0LmNiQXJnXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIGZzLnN0YXQgcG5nUGF0aCwgKGVyciwgc3RhdCkgLT5cbiAgICAgICAgICAgICAgICBpZiBub3QgZXJyPyBhbmQgc3RhdC5pc0ZpbGUoKVxuICAgICAgICAgICAgICAgICAgICBBcHBJY29uLmNhY2hlW3BuZ1BhdGhdID0gdHJ1ZVxuICAgICAgICAgICAgICAgICAgICBvcHQuY2IgcG5nUGF0aCwgb3B0LmNiQXJnXG4gICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICBBcHBJY29uLmdldEljb24gb3B0XG4gICAgICAgICBcbiAgICBAZ2V0SWNvbjogKG9wdCkgLT5cbiAgICAgICAgXG4gICAgICAgIGFwcFBhdGggPSBvcHQuYXBwUGF0aFxuICAgICAgICBpbmZvUGF0aCA9IHNsYXNoLmpvaW4gYXBwUGF0aCwgJ0NvbnRlbnRzJywgJ0luZm8ucGxpc3QnXG4gICAgICAgIHBsaXN0LnJlYWRGaWxlIGluZm9QYXRoLCAoZXJyLCBvYmopIC0+XG4gICAgICAgICAgICBpZiBub3QgZXJyP1xuICAgICAgICAgICAgICAgIGlmIG9ialsnQ0ZCdW5kbGVJY29uRmlsZSddP1xuICAgICAgICAgICAgICAgICAgICBpY25zUGF0aCA9IHNsYXNoLmpvaW4gc2xhc2guZGlybmFtZShpbmZvUGF0aCksICdSZXNvdXJjZXMnLCBvYmpbJ0NGQnVuZGxlSWNvbkZpbGUnXVxuICAgICAgICAgICAgICAgICAgICBpY25zUGF0aCArPSBcIi5pY25zXCIgaWYgbm90IGljbnNQYXRoLmVuZHNXaXRoICcuaWNucydcbiAgICAgICAgICAgICAgICAgICAgQXBwSWNvbi5zYXZlSWNvbiBpY25zUGF0aCwgb3B0XG4gICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICBBcHBJY29uLmJyb2tlbkljb24gb3B0XG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgZXJyb3IgXCJnZXRJY29uOiAje2Vycn1cIlxuICAgICAgICAgICAgICAgIEFwcEljb24uYnJva2VuSWNvbiBvcHRcbiAgICAgICAgICAgICAgICBcbiAgICBAc2F2ZUljb246IChpY25zUGF0aCwgb3B0KSAtPlxuICAgICAgICBcbiAgICAgICAgcG5nUGF0aCA9IEFwcEljb24ucG5nUGF0aCBvcHRcbiAgICAgICAgY2hpbGRwLmV4ZWMgXCIvdXNyL2Jpbi9zaXBzIC1aICN7b3B0LnNpemV9IC1zIGZvcm1hdCBwbmcgXFxcIiN7aWNuc1BhdGh9XFxcIiAtLW91dCBcXFwiI3twbmdQYXRofVxcXCJcIiwgKGVycikgLT5cbiAgICAgICAgICAgIGlmIG5vdCBlcnI/XG4gICAgICAgICAgICAgICAgb3B0LmNiIHBuZ1BhdGgsIG9wdC5jYkFyZ1xuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIGVycm9yIFwic2F2ZUljb246ICN7ZXJyfVwiXG4gICAgICAgICAgICAgICAgQXBwSWNvbi5icm9rZW5JY29uIG9wdFxuICAgICBcbiAgICBAYnJva2VuSWNvbjogKG9wdCkgLT5cbiAgICAgICAgXG4gICAgICAgIGJyb2tlblBhdGggPSBzbGFzaC5qb2luIF9fZGlybmFtZSwgJy4uJywgJ2ltZycsICdicm9rZW4ucG5nJ1xuICAgICAgICBvcHQuY2IgYnJva2VuUGF0aCwgb3B0LmNiQXJnXG4gICAgICAgIFxubW9kdWxlLmV4cG9ydHMgPSBBcHBJY29uXG4iXX0=
//# sourceURL=../coffee/appicon.coffee