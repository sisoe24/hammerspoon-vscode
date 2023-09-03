# Change Log

## [0.5.0] -

### Added

- New command to add the EmmyLua.spoon stubs.
- New commands to execute Hammerspoon code from the editor.

### Changed

- The previous suggestions providers have been replaced with the EmmyLua stubs. The old providers are now considered legacy and might be removed in the future.

### Removed

- Removed the update suggestions database command. This is part of the legacy providers and is no longer needed.

## [0.4.1] - 2023-01-26

### Changed

- Shorten the status bar socket connection text.

### Fixed

- Remove duplicate suggestions.

## [0.4.0] - 2022-10-23

### Added

- TCP socket connection to allow command execution from Hammerspoon.

## [0.3.4] - 2022-03-15

### Fixed

- Fixed potential catastrophic backtracking regex for hs base modules.

## [0.3.3] - 2022-03-13

### Fixed

- Fixed hammerspoon not showing when no filter were provided.

## [0.3.2] - 2022-03-14

### Fixed

- Popup info box now shows properly when creating a spoon documentation.

## [0.3.1] - 2022-03-14

### Fixed

- Fixed Show Console command not working.
- Show more descriptive error for some `hs.ipc` commands when they fail.

## [0.3.0] - 2022-03-14

### Added

- New command to show Hammerspoon console.

### Fixed

- Fixed bug where editor would not recognize `init.lua` as valid file
when generating documentation for the Spoon.

## [0.2.0] - 2022-03-10

### Added

- Receive Hammerspoon console output to vscode output window.
- Filter output based on regex patterns from extension settings.

## [0.1.1] - 2022-03-08

### Fixed

- Fix a bug when hovering over a variable inside a call statement that showed the function documentation.

## [0.1.0] - 2022-03-07

### Added

- Create Spoon command.
- Create Spoon documentation command.
- New setting for default Spoon directory location.
- New setting for generating extra documentation (HTML/Markdown) for the Spoon.
- New provider for string completion (currently only works for `hs.loadSpoon()`)

## [0.0.1] - 2022-01-30

- Initial release.
