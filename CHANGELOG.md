# Changelog

## [Unreleased]

## [0.9.16] - 2018-3-25
### Fixed
- Extension doesn't work (#27)

## [0.9.15] - 2018-3-24
### Added
- Made maps inspectable (#27)

## [0.9.14] - 2018-3-20
### Fixed
- Older MobX support (#26)

## [0.9.13] - 2018-3-18
### Added
- MobX@4 support

### Fixed
- Fixed background page errors that prevented connecting to frontend

### Changed
- MST tab now displays snapshots instead of patches

## [0.9.12] - 2018-1-13
### Added
- Actions' names in changes log (#15)

## [0.9.11] - 2017-12-6
### Fixed
- Fixed problems in firefox (#14)

## [0.9.10] - 2017-11-27
### Added
- Standalone app.

### Fixed
- Handle groupStart & groupEnd mismatch (#10)

## [0.9.9] - 2017-11-20
### Fixed
- Ability to use the extension inside electron environment

## [0.9.8] - 2017-10-30
### Fixed
- Fixed mobx-devtools-mst error in node.js environment (#8)

## [0.9.7] - 2017-10-27
### Added
- mobx-state-tree support.

### Fixed
- Displaying deep log items
- Handling serializing exceptions

## [0.9.6] - 2017-10-25
### Fixed
- Displaying deep log items

## [0.9.5] - 2017-10-23
### Fixed
- Displaying diff details for top-level changes

## [0.9.4] - 2017-10-23
### Fixed
Fail gracefully if using unsupported mobx versions.

## [0.9.3] - 2017-10-21
### Fixed
- Reloading on navigation.

## [0.9.2] - 2017-10-20
### Fixed
- Removed unsafe-eval from manifest.json for addons.mozilla.org.

## [0.9.1] - 2017-10-20
### Fixed
- Fixed main layout problems in Firefox.

## [v0.9.0] - 2017-10-20
### Added
- mobx-react observervers tree viewer.
- complex objects viewer.

### Fixed
- Performance issues on heavy logging events.

### Changed
- Complete redesign.

## [0.0.23] - 2017-09-26
### Fixed
- Communication between backend and frontend (#2).

### Changed
- Different devtool instances are not being synchronized anymore.
