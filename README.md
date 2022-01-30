[![Codacy Badge](https://app.codacy.com/project/badge/Grade/6897046c215944daa78d15189ecaaa82)](https://www.codacy.com/gh/sisoe24/hammerspoon-vscode/dashboard?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=sisoe24/hammerspoon-vscode&amp;utm_campaign=Badge_Grade)
[![Codacy Badge](https://app.codacy.com/project/badge/Coverage/6897046c215944daa78d15189ecaaa82)](https://www.codacy.com/gh/sisoe24/hammerspoon-vscode/dashboard?utm_source=github.com&utm_medium=referral&utm_content=sisoe24/hammerspoon-vscode&utm_campaign=Badge_Coverage)
[![DeepSource](https://deepsource.io/gh/sisoe24/hammerspoon-vscode.svg/?label=active+issues&show_trend=true&token=l76-w7k_5dsHJqrTU2kueH4F)](https://deepsource.io/gh/sisoe24/hammerspoon-vscode/?ref=repository-badge)

[![Last Update](https://img.shields.io/visual-studio-marketplace/last-updated/virgilsisoe.hammerspoon)](https://marketplace.visualstudio.com/items?itemName=virgilsisoe.hammerspoon)

# 1. Hammerspoon-vscode README

Visual Studio Code Hammerspoon extension for autocomplete and more.

- [1. Hammerspoon-vscode README](#1-hammerspoon-vscode-readme)
  - [1.1. Features](#11-features)
  - [1.2. Description](#12-description)
  - [1.3. Available Commands](#13-available-commands)
    - [1.3.1. `hammerspoon.updateDatabase`](#131-hammerspoonupdatedatabase)
    - [1.3.2. `hammerspoon.reloadConfiguration`](#132-hammerspoonreloadconfiguration)
  - [1.4. Known Issues](#14-known-issues)
  - [1.5. TODO](#15-todo)
  - [1.6. Acknowledgement](#16-acknowledgement)
  - [1.7. Screenshot](#17-screenshot)

## 1.1. Features

- Hammerspoon code suggestions.
- Hover information for types and documentation.
- Signature help for functions arguments.
- Reload Hammerspoon configuration command.

## 1.2. Description

A cheap attempt to create an Intellisense environment for the Hammerspoon framework.

This is done by creating a symbol table of the Lua script and by then parsing the Hammerspoon documentation in search for the information. This is far from perfect and it will fail under some circumstances (multi nested method calls, complex scripts, "classes" etc.) but it gets the job done for the most basic ones.

## 1.3. Available Commands

All commands are available by opening the Command Palette (`Command+Shift+P` on macOS and `Ctrl+Shift+P` on Windows/Linux) and typing in one of the following Command Name:

| Command Name                                    | Command ID                        | Description                      | Shortcut |
| ----------------------------------------------- | --------------------------------- | -------------------------------- | -------- |
| `Hammerspoon: Update completion documentation`  | `hammerspoon.updateDatabase`      | Generate new completion data     |          |
| `Hammerspoon: Reload Hammerspoon configuration` | `hammerspoon.reloadConfiguration` | Reload Hammerspoon configuration |          |

By default the extension does not provide any shortcut, but every command can be assigned to one. (see [Key Bindings for Visual Studio Code](https://code.visualstudio.com/docs/getstarted/keybindings) for more information)

### 1.3.1. `hammerspoon.updateDatabase`

If a new Hammerspoon release introduces new methods, the command can be used to update the internal database for the suggestions.

### 1.3.2. `hammerspoon.reloadConfiguration`

This will reload the Hammerspoon internal configuration. **NOTE**: `hs.ipc` must be installed and called at the beginning of your `init.lua` file. ([read more](http://www.hammerspoon.org/docs/hs.ipc.html)).

This command can also be access via a button in the Editor Toolbar.

## 1.4. Known Issues

- If script contains syntax errors, the extension will not work (If you don't use it already, I suggest the [Lua Language Server](https://marketplace.visualstudio.com/items?itemName=sumneko.lua) extension)
- Methods will return only if is an Hammerspoon data type. (eg. `hs.application`, `hs.window` etc.)
- Some methods will return an Hammerspoon data type even if it could potentially be something else.
  Examples:

  ```lua
  local app = hs.application()
  local window = app:mainWindow()
  ```

  Although `mainWindow` could be `nil` or an `hs.window` object, the extension will always assume to be a `hs.window`.

- If a method returns anything other than a valid Hammerspoon data type (eg. `string`, `table`, `bool` etc.), it will only affect the hovering information and no suggestions will be provided.
  Examples:

  ```lua
  local apps = hs.application.runningApplications()
  ```

  Hovering over `apps` will show: `list of hs.application objects` but no suggestions will be provided
  for it. This also happens with returns like `app` or `window`. Those will be treated as simple hover information.

- Although Lua 5.4 is not technically supported, your script can contain the `<const>` and `<close>` new keywords.
- And probably more...

## 1.5. TODO

- [ ] Show error/problems.
- [ ] Declaration on different file.
- [ ] Type annotations.
- [ ] Expand suggestions for non Hammerspoon data type returns.

## 1.6. Acknowledgement

The symbol table is created with [luaparse](https://github.com/fstirlitz/luaparse).

## 1.7. Screenshot

Extension Overview

<img title="ExtensionSample" src="https://raw.githubusercontent.com/sisoe24/hammerspoon-vscode/main/images/sample.gif"/>

Hammerspoon Reload configuration

<img title="HsReload" src="https://raw.githubusercontent.com/sisoe24/hammerspoon-vscode/main/images/hs_reload.gif"/>
