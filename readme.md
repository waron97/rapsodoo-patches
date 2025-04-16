# Symphony Process Builder Patches

This repository is home to a series of self-contained JS and CSS scripts designed to make life a bit easier in the Symphony Process Builder.

## Installing a snippet

The snippets are either a JS file or a combination of a JS and a CSS file. 
These assets are intended to be injected into the Symphony website through extensions like Code Injector ([Firefox](https://addons.mozilla.org/en-US/firefox/addon/codeinjector/)) or User JavaScript and CSS ([Chrome](https://chromewebstore.google.com/detail/user-javascript-and-css/nbhcbdghjpllgmfilhnhkllmkecfmpld)).
These extensions usually allow the user to specify JS or CSS files to inject into only a particular host.
For the Sorgenia test environment, this will be something like `https:\/\/sorgenia-test-02\.symple\.cloud` for Code Injector.

On some browsers, it may be necessary to enable [developer mode](/readme_assets/chrome_dev_mode.jpg) in the Extensions Manager.

## Snippet Overview

The project contains 5 patches that can be independently applied:

### [pb-dark-mode](/src/pb-dark-mode) 

Contains non-breaking custom dark mode styles for the Process Builder, whereas off-the-shelf dark mode extensions may break usability.

![Illustrate dark mode](/readme_assets/dark_mode.png)

### [pb-control-height](/src/pb-control-height/) 

Has a fix for the "Save" and "Save and Close" buttons being pushed too far down the screen, requiring scrolling to reach even on large monitors.

![Buttons are visibile in the first 100vh units](/readme_assets/buttons.png)

### [pb-save-shortcut](/src/pb-save-shortcut/)

Enables the `ctrl+s` shortcut to save the process


### [pb-restore-search](/src/pb-restore-search/) 
Contains a utility that restores the last search keywords in the search bar after exiting a wizard editor (so the publish button is easily accessible after pressing "Save and Close")

![Illustrate search restore](/readme_assets/search-restore.gif)


### [pb-search-by-id](src/pb-search-by-id/) 

Enables the `ctrl+alt+f` keyboard shortcut in the Process Builder list view. This opens a dialog where a wizard can be automatically opened by matching a case-insensitive regex for its name **or document id**. 

![Illustrate search dialog](/readme_assets/search-id.gif)

If [pb-restore-search](/src/pb-restore-search/) is also enabled, the name of the wizard will also be set as the search for easy acces to the publish button.

![Illustrate search restore after navigation](/readme_assets/search-id-restore.gif)



