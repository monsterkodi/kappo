// koffee 1.3.0

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
            img: slash.resolve(__dirname + "/../node_modules/wxw/icons/terminal.png"),
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2NyaXB0cy5qcyIsInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyIiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7OztBQUFBLElBQUE7O0FBUUEsTUFBd0IsT0FBQSxDQUFRLEtBQVIsQ0FBeEIsRUFBRSxpQkFBRixFQUFTLGlCQUFULEVBQWdCOztBQUVoQixVQUFBLEdBQWMsU0FBQTtBQUVWLFFBQUE7SUFBQSxHQUFBLEdBQU0sT0FBQSxDQUFRLEtBQVI7V0FDTixHQUFBLENBQUksT0FBSixFQUFZLE9BQVo7QUFIVTs7QUFLZCxVQUFBLEdBQWEsU0FBQTtBQUVULFFBQUE7SUFBQSxPQUFBLEdBQ0k7UUFBQSxPQUFBLEVBQ0k7WUFBQSxFQUFBLEVBQVEsVUFBUjtZQUNBLEdBQUEsRUFBUSxLQUFLLENBQUMsT0FBTixDQUFpQixTQUFELEdBQVcseUJBQTNCLENBRFI7U0FESjtRQUdBLEtBQUEsRUFDSTtZQUFBLElBQUEsRUFBUSxhQUFSO1lBQ0EsR0FBQSxFQUFRLEtBQUssQ0FBQyxPQUFOLENBQWlCLFNBQUQsR0FBVyx1QkFBM0IsQ0FEUjtTQUpKO1FBTUEsUUFBQSxFQUNJO1lBQUEsSUFBQSxFQUFRLGtCQUFSO1lBQ0EsR0FBQSxFQUFRLEtBQUssQ0FBQyxPQUFOLENBQWlCLFNBQUQsR0FBVywwQkFBM0IsQ0FEUjtTQVBKO1FBU0EsT0FBQSxFQUNJO1lBQUEsSUFBQSxFQUFRLGtCQUFSO1lBQ0EsR0FBQSxFQUFRLEtBQUssQ0FBQyxPQUFOLENBQWlCLFNBQUQsR0FBVyx5QkFBM0IsQ0FEUjtTQVZKO1FBWUEsUUFBQSxFQUVJO1lBQUEsSUFBQSxFQUFRLG1KQUFSO1lBQ0EsR0FBQSxFQUFRLEtBQUssQ0FBQyxPQUFOLENBQWlCLFNBQUQsR0FBVyx5Q0FBM0IsQ0FEUjtZQUVBLFVBQUEsRUFBWSw4QkFGWjtTQWRKOztXQWlCSjtBQXBCUzs7QUFzQmIsVUFBQSxHQUFhLFNBQUE7QUFFVCxRQUFBO0lBQUEsT0FBQSxHQUNJO1FBQUEsS0FBQSxFQUNJO1lBQUEsSUFBQSxFQUFRLGdCQUFSO1lBQ0EsR0FBQSxFQUFXLFNBQUQsR0FBVyx1QkFEckI7U0FESjtRQUdBLFFBQUEsRUFDSTtZQUFBLElBQUEsRUFBUSx3REFBUjtZQUNBLEdBQUEsRUFBVyxTQUFELEdBQVcsMEJBRHJCO1NBSko7UUFNQSxPQUFBLEVBQ0k7WUFBQSxJQUFBLEVBQVEsc0RBQVI7WUFDQSxHQUFBLEVBQVcsU0FBRCxHQUFXLHlCQURyQjtTQVBKOztJQVVKLElBQUcsS0FBSyxDQUFDLEdBQU4sQ0FBVSxpQkFBVixDQUFIO1FBQ0ksT0FBTyxDQUFDLFFBQVEsQ0FBQyxJQUFqQixHQUF3Qiw4REFENUI7O0lBRUEsSUFBRyxLQUFLLENBQUMsR0FBTixDQUFVLGdCQUFWLENBQUg7UUFDSSxPQUFPLENBQUMsT0FBTyxDQUFDLElBQWhCLEdBQXVCLDhEQUQzQjs7V0FFQTtBQWpCUzs7QUFtQmIsTUFBTSxDQUFDLE9BQVAsR0FDSTtJQUFBLFVBQUEsRUFBWSxVQUFaO0lBQ0EsVUFBQSxFQUFZLFVBRFoiLCJzb3VyY2VzQ29udGVudCI6WyIjIyNcbiAwMDAwMDAwICAgMDAwMDAwMCAgMDAwMDAwMDAgICAwMDAgIDAwMDAwMDAwICAgMDAwMDAwMDAwICAgMDAwMDAwMFxuMDAwICAgICAgIDAwMCAgICAgICAwMDAgICAwMDAgIDAwMCAgMDAwICAgMDAwICAgICAwMDAgICAgIDAwMFxuMDAwMDAwMCAgIDAwMCAgICAgICAwMDAwMDAwICAgIDAwMCAgMDAwMDAwMDAgICAgICAwMDAgICAgIDAwMDAwMDBcbiAgICAgMDAwICAwMDAgICAgICAgMDAwICAgMDAwICAwMDAgIDAwMCAgICAgICAgICAgMDAwICAgICAgICAgIDAwMFxuMDAwMDAwMCAgICAwMDAwMDAwICAwMDAgICAwMDAgIDAwMCAgMDAwICAgICAgICAgICAwMDAgICAgIDAwMDAwMDBcbiMjI1xuXG57IHByZWZzLCBzbGFzaCwgbG9nIH0gPSByZXF1aXJlICdreGsnXG5cbndpblJlY3ljbGUgID0gLT5cbiAgICBcbiAgICB3eHcgPSByZXF1aXJlICd3eHcnXG4gICAgd3h3ICd0cmFzaCcgJ2VtcHR5J1xuICAgIFxud2luU2NyaXB0cyA9ICgpIC0+XG4gICAgXG4gICAgc2NyaXB0cyA9IFxuICAgICAgICByZWN5Y2xlOlxuICAgICAgICAgICAgY2I6ICAgICB3aW5SZWN5Y2xlXG4gICAgICAgICAgICBpbWc6ICAgIHNsYXNoLnJlc29sdmUgXCIje19fZGlybmFtZX0vLi4vc2NyaXB0cy9yZWN5Y2xlLnBuZ1wiXG4gICAgICAgIHNsZWVwOlxuICAgICAgICAgICAgZXhlYzogICAnc2h1dGRvd24gL2gnXG4gICAgICAgICAgICBpbWc6ICAgIHNsYXNoLnJlc29sdmUgXCIje19fZGlybmFtZX0vLi4vc2NyaXB0cy9zbGVlcC5wbmdcIlxuICAgICAgICBzaHV0ZG93bjpcbiAgICAgICAgICAgIGV4ZWM6ICAgJ3NodXRkb3duIC9zIC90IDAnXG4gICAgICAgICAgICBpbWc6ICAgIHNsYXNoLnJlc29sdmUgXCIje19fZGlybmFtZX0vLi4vc2NyaXB0cy9zaHV0ZG93bi5wbmdcIlxuICAgICAgICByZXN0YXJ0OlxuICAgICAgICAgICAgZXhlYzogICAnc2h1dGRvd24gL3IgL3QgMCdcbiAgICAgICAgICAgIGltZzogICAgc2xhc2gucmVzb2x2ZSBcIiN7X19kaXJuYW1lfS8uLi9zY3JpcHRzL3Jlc3RhcnQucG5nXCJcbiAgICAgICAgdGVybWluYWw6XG4gICAgICAgICAgICAjIGV4ZWM6ICAgXCJDOi9tc3lzNjQvdXNyL2Jpbi9taW50dHkuZXhlIC1pIFxcXCIje3NsYXNoLnJlc29sdmUgXCIje19fZGlybmFtZX0vLi4vc2NyaXB0cy90ZXJtaW5hbC5pY29cIn1cXFwiIC1vICdBcHBMYXVuY2hDbWQ9QzpcXG1zeXM2NFxcbWluZ3c2NC5leGUnIC1vICdBcHBJRD1NU1lTMi5TaGVsbC5NSU5HVzY0LjknIC1wIDk1MCwwIC10ICdmaXNoJyAtLSAgL3Vzci9iaW4vc2ggLWxjIGZpc2hcIlxuICAgICAgICAgICAgZXhlYzogICBcIkM6L21zeXM2NC91c3IvYmluL21pbnR0eS5leGUgLW8gJ0FwcExhdW5jaENtZD1DOlxcbXN5czY0XFxtaW5ndzY0LmV4ZScgLW8gJ0FwcElEPU1TWVMyLlNoZWxsLk1JTkdXNjQuOScgLXAgOTUwLDAgLXQgJ2Zpc2gnIC0tICAvdXNyL2Jpbi9zaCAtbGMgZmlzaFwiXG4gICAgICAgICAgICBpbWc6ICAgIHNsYXNoLnJlc29sdmUgXCIje19fZGlybmFtZX0vLi4vbm9kZV9tb2R1bGVzL3d4dy9pY29ucy90ZXJtaW5hbC5wbmdcIlxuICAgICAgICAgICAgZm9yZWdyb3VuZDogXCJDOi9tc3lzNjQvdXNyL2Jpbi9taW50dHkuZXhlXCJcbiAgICBzY3JpcHRzXG5cbm1hY1NjcmlwdHMgPSAoKSAtPlxuICAgIFxuICAgIHNjcmlwdHMgPVxuICAgICAgICBzbGVlcDpcbiAgICAgICAgICAgIGV4ZWM6ICAgXCJwbXNldCBzbGVlcG5vd1wiXG4gICAgICAgICAgICBpbWc6ICAgIFwiI3tfX2Rpcm5hbWV9Ly4uL3NjcmlwdHMvc2xlZXAucG5nXCJcbiAgICAgICAgc2h1dGRvd246XG4gICAgICAgICAgICBleGVjOiAgIFwib3Nhc2NyaXB0IC1lICd0ZWxsIGFwcCBcXFwiU3lzdGVtIEV2ZW50c1xcXCIgdG8gc2h1dCBkb3duJ1wiXG4gICAgICAgICAgICBpbWc6ICAgIFwiI3tfX2Rpcm5hbWV9Ly4uL3NjcmlwdHMvc2h1dGRvd24ucG5nXCJcbiAgICAgICAgcmVzdGFydDpcbiAgICAgICAgICAgIGV4ZWM6ICAgXCJvc2FzY3JpcHQgLWUgJ3RlbGwgYXBwIFxcXCJTeXN0ZW0gRXZlbnRzXFxcIiB0byByZXN0YXJ0J1wiXG4gICAgICAgICAgICBpbWc6ICAgIFwiI3tfX2Rpcm5hbWV9Ly4uL3NjcmlwdHMvcmVzdGFydC5wbmdcIlxuXG4gICAgaWYgcHJlZnMuZ2V0ICdjb25maXJtU2h1dGRvd24nXG4gICAgICAgIHNjcmlwdHMuc2h1dGRvd24uZXhlYyA9IFwib3Nhc2NyaXB0IC1lICd0ZWxsIGFwcCBcXFwibG9naW53aW5kb3dcXFwiIHRvIMKrZXZlbnQgYWV2dHJzZG7CuydcIlxuICAgIGlmIHByZWZzLmdldCAnY29uZmlybVJlc3RhcnQnXG4gICAgICAgIHNjcmlwdHMucmVzdGFydC5leGVjID0gXCJvc2FzY3JpcHQgLWUgJ3RlbGwgYXBwIFxcXCJsb2dpbndpbmRvd1xcXCIgdG8gwqtldmVudCBhZXZ0cnJzdMK7J1wiXG4gICAgc2NyaXB0c1xuXG5tb2R1bGUuZXhwb3J0cyA9IFxuICAgIG1hY1NjcmlwdHM6IG1hY1NjcmlwdHNcbiAgICB3aW5TY3JpcHRzOiB3aW5TY3JpcHRzXG4gICAgIl19
//# sourceURL=../coffee/scripts.coffee