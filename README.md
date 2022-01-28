# 1. Hammerspoon-vscode README

Visual Studio Code Hammerspoon extension for autocomplete and more.

- [1. Hammerspoon-vscode README](#1-hammerspoon-vscode-readme)
  - [1.1. Features](#11-features)
  - [1.2. Description](#12-description)
  - [1.3. Available Commands](#13-available-commands)
    - [1.3.1. `hammerspoon.updateDocs`](#131-hammerspoonupdatedocs)
    - [1.3.2. `hammerspoon.reloadConfiguration`](#132-hammerspoonreloadconfiguration)
  - [1.4. Known Issues](#14-known-issues)
  - [1.5. TODO](#15-todo)
  - [1.6. Screenshot](#16-screenshot)

## 1.1. Features

- Hammerspoon data suggestions.
- Hover information for types and documentation.
- Signature help for functions arguments.

## 1.2. Description

A cheap attempt to create an Intellisense environment for the Hammerspoon framework.

This is done by creating a symbol table of the Lua script and by then parsing the Hammerspoon documentation in search for the information. This is far from perfect and it will fail under some circumstances (multi nested definitions, complex scripts, "classes" etc.) but it gets the job done for the most basic ones.

## 1.3. Available Commands

All commands are available by opening the Command Palette (`Command+Shift+P` on macOS and `Ctrl+Shift+P` on Windows/Linux) and typing in one of the following Command Name:

| Command Name                                    | Command ID                        | Description                      | Shortcut |
| ----------------------------------------------- | --------------------------------- | -------------------------------- | -------- |
| `Hammerspoon: Update completion documentation`  | `hammerspoon.updateDocs`          | Generate new completion data     |          |
| `Hammerspoon: Reload Hammerspoon configuration` | `hammerspoon.reloadConfiguration` | Reload Hammerspoon configuration |          |

By default the extension does not provide any shortcut, but every command can be assigned to one. (see [Key Bindings for Visual Studio Code](https://code.visualstudio.com/docs/getstarted/keybindings) for more information)

### 1.3.1. `hammerspoon.updateDocs`

This will update the internal files of which the extension will use for the suggestions. The update its made by parsing the `docs.json` inside the Hammerspoon application path.

### 1.3.2. `hammerspoon.reloadConfiguration`

This will reload the Hammerspoon internal configuration. **NOTE**: `hs.ipc` must be installed and called at the beginning of your `init.lua` file. ([read more](http://www.hammerspoon.org/docs/hs.ipc.html))

## 1.4. Known Issues

- If script contains syntax errors, will cause the extension to not work (If you don't use it already, I suggest downloading the [Lua Language Server](https://marketplace.visualstudio.com/items?itemName=sumneko.lua) extension)
- Methods will return only if is an Hammerspoon data type. (eg. `hs.application`, `hs.window` etc.)
- Some methods will return an Hammerspoon data type even if it could potentially could be something else:
  Examples:

  ```lua
  local app = hs.application()
  local window = app:mainWindow()
  ```

  Although `mainWindow` could be `nil` or an `hs.window` object, the extension will
  always assume that is going to be a window object, therefore aiding to suggest
  methods for the `hs.window` object.

- If a method returns anything other than a valid Hammerspoon data type (eg. `string`, `table`, `bool` etc.), it will only affect the hovering information and no suggestions will be provided.
  Examples:

  ```lua
  local apps = hs.application.runningApplications()
  ```

  Hovering over `apps` will show: `list of hs.application objects` but no suggestions will be provided
  for it. This also happens when something returns `app` or `window`. Those will be treated as simple hover information.

- Although Lua 5.4 is not technically supported, your script could contain the `<const>` and `<close>` new keywords.

## 1.5. TODO

- [ ] Show error/problems.
- [ ] Declaration on different file.
- [ ] Type annotations.
- [ ] Expand suggestions for non Hammerspoon data type returns.

## 1.6. Screenshot