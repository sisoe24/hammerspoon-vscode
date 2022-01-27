# Hammerspoon-vscode README

Visual Studio Code Hammerspoon extension for autocomplete and more.

## Features

* Hammerspoon data suggestions.
* Hover information for types and documentation.
* Signature help for functions arguments.

## Description

A cheap attempt to create an Intellisense environment for the Hammerspoon framework.

This is done by creating a symbol table of the Lua script and by then parsing the Hammerspoon documentation in search for the module information. This is far from perfect and it might fail under some circumstances with multi nested definitions and complex scripts, but it gets the job done for the most basic ones.

## Known Issues

* If you script contains syntax errors, will cause the extension to not work (If you don't use it already, I suggest downloading the [Lua Language Server](https://marketplace.visualstudio.com/items?itemName=sumneko.lua) extension)
* Methods will return only if is an Hammerspoon data type. (eg. `hs.application`, `hs.window` etc.)
* Some methods will return an Hammerspoon data type even if it could potentially could be something else:
  Examples:

  ```lua
  local app = hs.application()
  local window = app:mainWindow()
  ```

  Although `mainWindow` could be `nil` or an `hs.window` object, the extension will
  always assume that is going to be a window object, therefore aiding to suggest
  methods for the `hs.window` object.

* If a method returns anything other than a valid Hammerspoon data type (eg. `string`, `table`, `bool` etc.), it will only affect the hovering information and no suggestions will be provided.
  Examples:

  ```lua
  local apps = hs.application.runningApplications()
  ```

  Hovering over `apps` will show: `list of hs.application objects` but no suggestions will be provided
  for it.

* Although Lua 5.4 is not technically supported, you can use the `<const>` and `<close>` new keywords.

## Roadmap

* [ ] Show error/problems.
* [ ] Find/Go To declaration.
* [ ] Declaration on different file.
* [ ] Type annotations.
* [ ] Enable/Disable hovering description **returns**.
* [ ] Expand suggestions for non hammerspoon data type returns.

## Screenshot