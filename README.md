[![Codacy Badge](https://app.codacy.com/project/badge/Grade/6897046c215944daa78d15189ecaaa82)](https://www.codacy.com/gh/sisoe24/hammerspoon-vscode/dashboard?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=sisoe24/hammerspoon-vscode&amp;utm_campaign=Badge_Grade)
[![Codacy Badge](https://app.codacy.com/project/badge/Coverage/6897046c215944daa78d15189ecaaa82)](https://www.codacy.com/gh/sisoe24/hammerspoon-vscode/dashboard?utm_source=github.com&utm_medium=referral&utm_content=sisoe24/hammerspoon-vscode&utm_campaign=Badge_Coverage)
[![DeepSource](https://deepsource.io/gh/sisoe24/hammerspoon-vscode.svg/?label=active+issues&show_trend=true&token=l76-w7k_5dsHJqrTU2kueH4F)](https://deepsource.io/gh/sisoe24/hammerspoon-vscode/?ref=repository-badge)

[![Download](https://img.shields.io/badge/Marketplace-Download-blue)](https://marketplace.visualstudio.com/items?itemName=virgilsisoe.hammerspoon)
[![Version](https://img.shields.io/visual-studio-marketplace/v/virgilsisoe.hammerspoon)](https://marketplace.visualstudio.com/items?itemName=virgilsisoe.hammerspoon&ssr=false#version-history)
[![Installs](https://img.shields.io/visual-studio-marketplace/i/virgilsisoe.hammerspoon)](https://marketplace.visualstudio.com/items?itemName=virgilsisoe.hammerspoon)
[![Ratings](https://img.shields.io/visual-studio-marketplace/r/virgilsisoe.hammerspoon)](https://marketplace.visualstudio.com/items?itemName=virgilsisoe.hammerspoon&ssr=false#review-details)
[![Last Update](https://img.shields.io/visual-studio-marketplace/last-updated/virgilsisoe.hammerspoon)](https://marketplace.visualstudio.com/items?itemName=virgilsisoe.hammerspoon)

# 1. Hammerspoon-vscode README

Visual Studio Code Hammerspoon extension for autocomplete and more.

![Overview](images/overview.gif)

- [1. Hammerspoon-vscode README](#1-hammerspoon-vscode-readme)
  - [1.1. Features](#11-features)
  - [1.2. Description](#12-description)
  - [1.3. Available Commands](#13-available-commands)
  - [1.4. Extension settings](#14-extension-settings)
  - [1.5. Known Issues](#15-known-issues)
  - [1.6. Requirements](#16-requirements)
  - [1.7. TODO](#17-todo)
  - [1.8. Acknowledgement](#18-acknowledgement)

## 1.1. Features

- Hammerspoon code suggestions.
- Hover information for types and documentation.
- Signature help for functions arguments.
- Reload Hammerspoon configuration command.
- Spoon utilities.

## 1.2. Description

A cheap and dirty attempt to create an Intellisense environment for the Hammerspoon framework.

This is done by creating a symbol table of the Lua script and by then parsing the
Hammerspoon documentation in search for the data. This is far from perfect
and it will fail under some circumstances (multi nested method calls, complex scripts,
"classes" etc.) but it gets the job done for the most basic ones.

## 1.3. Available Commands

By default the extension does not provide any shortcut, but every command can be assigned to one.
(see [Key Bindings for Visual Studio Code](https://code.visualstudio.com/docs/getstarted/keybindings) for more information).

All commands are available by opening the Command Palette `Command+Shift+P` and
typing in one of the following Command Name:

| Command Name                                    | Command ID                        | Description                            |
| ----------------------------------------------- | --------------------------------- | -------------------------------------- |
| `Hammerspoon: Reload Hammerspoon configuration` | `hammerspoon.reloadConfiguration` | Reload Hammerspoon configuration       |
| `Hammerspoon: Create Spoon`                     | `hammerspoon.createSpoon`         | Quick Spoon startup template           |
| `Hammerspoon: Generate Spoon Documentation`     | `hammerspoon.generateSpoonDoc`    | Generate `docs.json` for current spoon |
| `Hammerspoon: Update completion documentation`  | `hammerspoon.updateDatabase`      | Generate new completion data           |

- `Reload Hammerspoon configuration`

  Reload the Hammerspoon internal configuration. It can also be accessed via a
  button in the Editor Toolbar. (Requires `hs.ipc`. See [Requirements](#16-requirements))

  ![HsReload](images/hsReload.gif)

- `Create Spoon`

  Create a Spoon template in the Spoons directory. If the Spoon directory is not present
  in workspace root, will show an error.

- `Generate Spoon Documentation`

  Generate documentation for the `init.lua` spoon file. (Requires `hs.ipc`. See [Requirements](#16-requirements))

- `Update completion documentation`

  Update the internal database for code suggestions.

## 1.4. Extension settings

- `Hammerspoon: Spoons Extra Documentation` - `hammerspoon.spoon.extraDocumentation`

  In order to generate the extra documentation (HTML/Markdown), you need to have access
  to the Hammerspoon source code repository with its python dependency.

  From Hammerspoon official [documentation](https://github.com/Hammerspoon/hammerspoon/blob/master/SPOONS.md#generating):

  > - Clone <https://github.com/Hamerspoon/hammerspoon>
  > - Install the required Python dependencies (e.g. `pip install --user -r requirements.txt` in the Hammerspoon repo)

  With that done, the settings takes two options:
  - `repository-path`: The Hammerspoon source code repository path.
  - `interpreter-path`: The Hammerspoon source code repository Python interpreter path.

  Example:

  ```json
  "hammerspoon.spoons.extraDocumentation": {
      "repository-path": "/Users/virgil/Developer/SourceCode/hammerspoon",
      "interpreter-path": "/Users/virgil/Developer/SourceCode/hammerspoon/.venv/bin/python"
  }
  ```

- `Hammerspoon: Spoons Path` - `hammerspoon.spoons.path`

  Path where to create the Spoons. Defaults to `~/.hammerspoon/Spoons`. If a custom path is specified, remember to add it to your `init.lua`.

  From Hammerspoon official [documentation](https://github.com/Hammerspoon/hammerspoon/blob/master/SPOONS.md#loading-a-spoon):

  >Note that `hs.loadSpoon()` uses package.path to find Spoons. Hence you can have it look for Spoons in other paths by adding those paths to package.path as follows:
  >
  > ```lua
  > -- Look for Spoons in ~/.hammerspoon/MySpoons as well
  > package.path = package.path .. ";" ..  hs.configdir .. "/MySpoons/?.spoon/init.lua"
  > ```

## 1.5. Known Issues

- If script contains syntax errors, the extension will not work (If you don't use it
  already, I suggest the [Lua Language Server](https://marketplace.visualstudio.com/items?itemName=sumneko.lua) extension)
- Methods will return only if is an Hammerspoon data type. (eg. `hs.application`, `hs.window` etc.)
- Some methods will return an Hammerspoon data type even if it could potentially be something else:

  ![returnType1](/images/return_type1.jpg)

  Although `mainWindow` could be `hs.window` or `nil`, the extension will always
  assume to be a `hs.window`.

- If a method returns anything other than a valid Hammerspoon data type
  (eg. `string`, `table`, `bool` etc.), it will only affect the hovering
  information and no suggestions will be provided:

  ![returnType2](/images/return_type2.jpg)

  Hovering over `windows` will show: `list of hs.window objects` but no suggestions
  will be provided for it. Those will be treated as simple hover information.

- Although Lua 5.4 is not technically supported, your script can contain the `<const>` and `<close>` new keywords.
- And probably more...

## 1.6. Requirements

- Some commands depend on the `hs.ipc` module. To install it, execute `hs.ipc.cliInstall()`
 in your Hammerspoon environment and call it at the beginning of your `init.lua`
 with `require('hs.ipc')` ([read module documentation](http://www.hammerspoon.org/docs/hs.ipc.html)).
 If you are on an Apple silicon Mac, you might need to follow
 [those instructions](https://github.com/Hammerspoon/hammerspoon/issues/2930#issuecomment-899092002) to properly install the module.
  
## 1.7. TODO

- [ ] Show error/problems.
- [ ] Declaration on different file.
- [ ] Type annotations.
- [ ] Expand suggestions for non Hammerspoon data type returns.

## 1.8. Acknowledgement

The symbol table is created with [luaparse](https://github.com/fstirlitz/luaparse).
