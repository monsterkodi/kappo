// koffee 1.12.0

/*
 0000000   0000000  00000000   000  00000000   000000000   0000000
000       000       000   000  000  000   000     000     000
0000000   000       0000000    000  00000000      000     0000000
     000  000       000   000  000  000           000          000
0000000    0000000  000   000  000  000           000     0000000
 */
var log, macScripts, prefs, ref, slash, winRecycle, winScripts;

ref = require('kxk'), prefs = ref.prefs, slash = ref.slash, log = ref.log;

winRecycle = function() {
    var wxw;
    wxw = require('wxw');
    return wxw('trash', 'empty');
};

winScripts = function() {
    var scripts;
    scripts = {
        recycle: {
            cb: winRecycle,
            img: slash.resolve(__dirname + "/../scripts/recycle.png")
        },
        sleep: {
            exec: 'shutdown /h',
            img: slash.resolve(__dirname + "/../scripts/sleep.png")
        },
        shutdown: {
            exec: 'shutdown /s /t 0',
            img: slash.resolve(__dirname + "/../scripts/shutdown.png")
        },
        restart: {
            exec: 'shutdown /r /t 0',
            img: slash.resolve(__dirname + "/../scripts/restart.png")
        },
        terminal: {
            exec: "C:/msys64/usr/bin/mintty.exe -o 'AppLaunchCmd=C:\msys64\mingw64.exe' -o 'AppID=MSYS2.Shell.MINGW64.9' -p 950,0 -t 'fish' --  /usr/bin/sh -lc fish",
            img: slash.resolve(__dirname + "/../img/terminal.png"),
            foreground: "C:/msys64/usr/bin/mintty.exe"
        }
    };
    return scripts;
};

macScripts = function() {
    var scripts;
    scripts = {
        sleep: {
            exec: "pmset sleepnow",
            img: __dirname + "/../scripts/sleep.png"
        },
        shutdown: {
            exec: "osascript -e 'tell app \"System Events\" to shut down'",
            img: __dirname + "/../scripts/shutdown.png"
        },
        restart: {
            exec: "osascript -e 'tell app \"System Events\" to restart'",
            img: __dirname + "/../scripts/restart.png"
        }
    };
    if (prefs.get('confirmShutdown')) {
        scripts.shutdown.exec = "osascript -e 'tell app \"loginwindow\" to «event aevtrsdn»'";
    }
    if (prefs.get('confirmRestart')) {
        scripts.restart.exec = "osascript -e 'tell app \"loginwindow\" to «event aevtrrst»'";
    }
    return scripts;
};

module.exports = {
    macScripts: macScripts,
    winScripts: winScripts
};

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2NyaXB0cy5qcyIsInNvdXJjZVJvb3QiOiIuLi9jb2ZmZWUiLCJzb3VyY2VzIjpbInNjcmlwdHMuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUE7Ozs7Ozs7QUFBQSxJQUFBOztBQVFBLE1BQXdCLE9BQUEsQ0FBUSxLQUFSLENBQXhCLEVBQUUsaUJBQUYsRUFBUyxpQkFBVCxFQUFnQjs7QUFFaEIsVUFBQSxHQUFjLFNBQUE7QUFFVixRQUFBO0lBQUEsR0FBQSxHQUFNLE9BQUEsQ0FBUSxLQUFSO1dBQ04sR0FBQSxDQUFJLE9BQUosRUFBWSxPQUFaO0FBSFU7O0FBS2QsVUFBQSxHQUFhLFNBQUE7QUFFVCxRQUFBO0lBQUEsT0FBQSxHQUNJO1FBQUEsT0FBQSxFQUNJO1lBQUEsRUFBQSxFQUFRLFVBQVI7WUFDQSxHQUFBLEVBQVEsS0FBSyxDQUFDLE9BQU4sQ0FBaUIsU0FBRCxHQUFXLHlCQUEzQixDQURSO1NBREo7UUFHQSxLQUFBLEVBQ0k7WUFBQSxJQUFBLEVBQVEsYUFBUjtZQUNBLEdBQUEsRUFBUSxLQUFLLENBQUMsT0FBTixDQUFpQixTQUFELEdBQVcsdUJBQTNCLENBRFI7U0FKSjtRQU1BLFFBQUEsRUFDSTtZQUFBLElBQUEsRUFBUSxrQkFBUjtZQUNBLEdBQUEsRUFBUSxLQUFLLENBQUMsT0FBTixDQUFpQixTQUFELEdBQVcsMEJBQTNCLENBRFI7U0FQSjtRQVNBLE9BQUEsRUFDSTtZQUFBLElBQUEsRUFBUSxrQkFBUjtZQUNBLEdBQUEsRUFBUSxLQUFLLENBQUMsT0FBTixDQUFpQixTQUFELEdBQVcseUJBQTNCLENBRFI7U0FWSjtRQVlBLFFBQUEsRUFFSTtZQUFBLElBQUEsRUFBUSxtSkFBUjtZQUNBLEdBQUEsRUFBUSxLQUFLLENBQUMsT0FBTixDQUFpQixTQUFELEdBQVcsc0JBQTNCLENBRFI7WUFFQSxVQUFBLEVBQVksOEJBRlo7U0FkSjs7V0FpQko7QUFwQlM7O0FBc0JiLFVBQUEsR0FBYSxTQUFBO0FBRVQsUUFBQTtJQUFBLE9BQUEsR0FDSTtRQUFBLEtBQUEsRUFDSTtZQUFBLElBQUEsRUFBUSxnQkFBUjtZQUNBLEdBQUEsRUFBVyxTQUFELEdBQVcsdUJBRHJCO1NBREo7UUFHQSxRQUFBLEVBQ0k7WUFBQSxJQUFBLEVBQVEsd0RBQVI7WUFDQSxHQUFBLEVBQVcsU0FBRCxHQUFXLDBCQURyQjtTQUpKO1FBTUEsT0FBQSxFQUNJO1lBQUEsSUFBQSxFQUFRLHNEQUFSO1lBQ0EsR0FBQSxFQUFXLFNBQUQsR0FBVyx5QkFEckI7U0FQSjs7SUFVSixJQUFHLEtBQUssQ0FBQyxHQUFOLENBQVUsaUJBQVYsQ0FBSDtRQUNJLE9BQU8sQ0FBQyxRQUFRLENBQUMsSUFBakIsR0FBd0IsOERBRDVCOztJQUVBLElBQUcsS0FBSyxDQUFDLEdBQU4sQ0FBVSxnQkFBVixDQUFIO1FBQ0ksT0FBTyxDQUFDLE9BQU8sQ0FBQyxJQUFoQixHQUF1Qiw4REFEM0I7O1dBRUE7QUFqQlM7O0FBbUJiLE1BQU0sQ0FBQyxPQUFQLEdBQ0k7SUFBQSxVQUFBLEVBQVksVUFBWjtJQUNBLFVBQUEsRUFBWSxVQURaIiwic291cmNlc0NvbnRlbnQiOlsiIyMjXG4gMDAwMDAwMCAgIDAwMDAwMDAgIDAwMDAwMDAwICAgMDAwICAwMDAwMDAwMCAgIDAwMDAwMDAwMCAgIDAwMDAwMDBcbjAwMCAgICAgICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgIDAwMCAgIDAwMCAgICAgMDAwICAgICAwMDBcbjAwMDAwMDAgICAwMDAgICAgICAgMDAwMDAwMCAgICAwMDAgIDAwMDAwMDAwICAgICAgMDAwICAgICAwMDAwMDAwXG4gICAgIDAwMCAgMDAwICAgICAgIDAwMCAgIDAwMCAgMDAwICAwMDAgICAgICAgICAgIDAwMCAgICAgICAgICAwMDBcbjAwMDAwMDAgICAgMDAwMDAwMCAgMDAwICAgMDAwICAwMDAgIDAwMCAgICAgICAgICAgMDAwICAgICAwMDAwMDAwXG4jIyNcblxueyBwcmVmcywgc2xhc2gsIGxvZyB9ID0gcmVxdWlyZSAna3hrJ1xuXG53aW5SZWN5Y2xlICA9IC0+XG4gICAgXG4gICAgd3h3ID0gcmVxdWlyZSAnd3h3J1xuICAgIHd4dyAndHJhc2gnICdlbXB0eSdcbiAgICBcbndpblNjcmlwdHMgPSAoKSAtPlxuICAgIFxuICAgIHNjcmlwdHMgPSBcbiAgICAgICAgcmVjeWNsZTpcbiAgICAgICAgICAgIGNiOiAgICAgd2luUmVjeWNsZVxuICAgICAgICAgICAgaW1nOiAgICBzbGFzaC5yZXNvbHZlIFwiI3tfX2Rpcm5hbWV9Ly4uL3NjcmlwdHMvcmVjeWNsZS5wbmdcIlxuICAgICAgICBzbGVlcDpcbiAgICAgICAgICAgIGV4ZWM6ICAgJ3NodXRkb3duIC9oJ1xuICAgICAgICAgICAgaW1nOiAgICBzbGFzaC5yZXNvbHZlIFwiI3tfX2Rpcm5hbWV9Ly4uL3NjcmlwdHMvc2xlZXAucG5nXCJcbiAgICAgICAgc2h1dGRvd246XG4gICAgICAgICAgICBleGVjOiAgICdzaHV0ZG93biAvcyAvdCAwJ1xuICAgICAgICAgICAgaW1nOiAgICBzbGFzaC5yZXNvbHZlIFwiI3tfX2Rpcm5hbWV9Ly4uL3NjcmlwdHMvc2h1dGRvd24ucG5nXCJcbiAgICAgICAgcmVzdGFydDpcbiAgICAgICAgICAgIGV4ZWM6ICAgJ3NodXRkb3duIC9yIC90IDAnXG4gICAgICAgICAgICBpbWc6ICAgIHNsYXNoLnJlc29sdmUgXCIje19fZGlybmFtZX0vLi4vc2NyaXB0cy9yZXN0YXJ0LnBuZ1wiXG4gICAgICAgIHRlcm1pbmFsOlxuICAgICAgICAgICAgIyBleGVjOiAgIFwiQzovbXN5czY0L3Vzci9iaW4vbWludHR5LmV4ZSAtaSBcXFwiI3tzbGFzaC5yZXNvbHZlIFwiI3tfX2Rpcm5hbWV9Ly4uL3NjcmlwdHMvdGVybWluYWwuaWNvXCJ9XFxcIiAtbyAnQXBwTGF1bmNoQ21kPUM6XFxtc3lzNjRcXG1pbmd3NjQuZXhlJyAtbyAnQXBwSUQ9TVNZUzIuU2hlbGwuTUlOR1c2NC45JyAtcCA5NTAsMCAtdCAnZmlzaCcgLS0gIC91c3IvYmluL3NoIC1sYyBmaXNoXCJcbiAgICAgICAgICAgIGV4ZWM6ICAgXCJDOi9tc3lzNjQvdXNyL2Jpbi9taW50dHkuZXhlIC1vICdBcHBMYXVuY2hDbWQ9QzpcXG1zeXM2NFxcbWluZ3c2NC5leGUnIC1vICdBcHBJRD1NU1lTMi5TaGVsbC5NSU5HVzY0LjknIC1wIDk1MCwwIC10ICdmaXNoJyAtLSAgL3Vzci9iaW4vc2ggLWxjIGZpc2hcIlxuICAgICAgICAgICAgaW1nOiAgICBzbGFzaC5yZXNvbHZlIFwiI3tfX2Rpcm5hbWV9Ly4uL2ltZy90ZXJtaW5hbC5wbmdcIlxuICAgICAgICAgICAgZm9yZWdyb3VuZDogXCJDOi9tc3lzNjQvdXNyL2Jpbi9taW50dHkuZXhlXCJcbiAgICBzY3JpcHRzXG5cbm1hY1NjcmlwdHMgPSAoKSAtPlxuICAgIFxuICAgIHNjcmlwdHMgPVxuICAgICAgICBzbGVlcDpcbiAgICAgICAgICAgIGV4ZWM6ICAgXCJwbXNldCBzbGVlcG5vd1wiXG4gICAgICAgICAgICBpbWc6ICAgIFwiI3tfX2Rpcm5hbWV9Ly4uL3NjcmlwdHMvc2xlZXAucG5nXCJcbiAgICAgICAgc2h1dGRvd246XG4gICAgICAgICAgICBleGVjOiAgIFwib3Nhc2NyaXB0IC1lICd0ZWxsIGFwcCBcXFwiU3lzdGVtIEV2ZW50c1xcXCIgdG8gc2h1dCBkb3duJ1wiXG4gICAgICAgICAgICBpbWc6ICAgIFwiI3tfX2Rpcm5hbWV9Ly4uL3NjcmlwdHMvc2h1dGRvd24ucG5nXCJcbiAgICAgICAgcmVzdGFydDpcbiAgICAgICAgICAgIGV4ZWM6ICAgXCJvc2FzY3JpcHQgLWUgJ3RlbGwgYXBwIFxcXCJTeXN0ZW0gRXZlbnRzXFxcIiB0byByZXN0YXJ0J1wiXG4gICAgICAgICAgICBpbWc6ICAgIFwiI3tfX2Rpcm5hbWV9Ly4uL3NjcmlwdHMvcmVzdGFydC5wbmdcIlxuXG4gICAgaWYgcHJlZnMuZ2V0ICdjb25maXJtU2h1dGRvd24nXG4gICAgICAgIHNjcmlwdHMuc2h1dGRvd24uZXhlYyA9IFwib3Nhc2NyaXB0IC1lICd0ZWxsIGFwcCBcXFwibG9naW53aW5kb3dcXFwiIHRvIMKrZXZlbnQgYWV2dHJzZG7CuydcIlxuICAgIGlmIHByZWZzLmdldCAnY29uZmlybVJlc3RhcnQnXG4gICAgICAgIHNjcmlwdHMucmVzdGFydC5leGVjID0gXCJvc2FzY3JpcHQgLWUgJ3RlbGwgYXBwIFxcXCJsb2dpbndpbmRvd1xcXCIgdG8gwqtldmVudCBhZXZ0cnJzdMK7J1wiXG4gICAgc2NyaXB0c1xuXG5tb2R1bGUuZXhwb3J0cyA9IFxuICAgIG1hY1NjcmlwdHM6IG1hY1NjcmlwdHNcbiAgICB3aW5TY3JpcHRzOiB3aW5TY3JpcHRzXG4gICAgIl19
//# sourceURL=../coffee/scripts.coffee