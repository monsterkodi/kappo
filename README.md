
![kappo](img/shot.png)

**kappo** is a simple application launcher for macOS.

# manual

Press **F1** or click on the menu bar icon to activate **kappo**.

Enter some characters to search for matching applications.

Multiple matches are indicated with small dots below the application name.
You can navigate through them with the cursor keys.

Click or press **enter** to activate the current application.

Press **esc** to cancel the current search or close the window.

The window size and position can be changed with the mouse or the following shortcuts:
    
- **⌘up|down|left|right** move window
- **⌘-** decrease window size
- **⌘=** increase window size
- **⌘0** center on screen and toggle between minimum and maximum size

Press **⌘i** to change between the bright and dark scheme.

You can change the default activation key in

    ~/Library/Application\ Support/kappo/prefs.noon

after first lauch of **kappo**. 

# how

**kappo** is a very simple [electron](http://electron.atom.io/) application.

It uses [fuzzy](https://www.npmjs.com/package/fuzzy) to search for matches and [fuzzaldrin](https://www.npmjs.com/package/fuzzaldrin) to sort them.

Application handling is done via the [appswitch](https://github.com/nriley/appswitch) tool.

# why

I have been using various application launcher software for many years now:

- [Quicksilver](https://qsapp.com/)
- [LaunchBar](https://www.obdev.at/products/launchbar/index.html)
- [Alfred](https://www.alfredapp.com/)

All of them are very good.

But they also do way more than I need or want them to do. 

What I need:

- fast
- efficient fuzzy search, e.g. **ff** should find Firefox
- sleep and shutdown commands *TBD*

What I want:

- clean, minimal look
- focus on the application icons, not the names
- large and resizable application icons
- switch between apps (what the macOS **⌘+Tab** does) when apps match
    
almost there 😊


