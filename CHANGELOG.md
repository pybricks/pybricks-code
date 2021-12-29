<!-- Refer to https://keepachangelog.com/en/1.0.0/ for guidance. -->

# Changelog

## [Unreleased]

### Fixed
- Fix tooltips not closing when expected ([pybricks-code#275]).

[pybricks-code#275]: https://github.com/pybricks/pybricks-code/issues/275

## [1.2.0-beta.1] - 2021-12-27

### Added
- Status bar indicator for connected hub.
- Basic battery OK/low indicator ([support#559]).

### Changed
- Saving file now uses proper save dialog in Chromium browser ([support#84]).
- Toolbar buttons now scale with screen size ([support#300]).

### Fixed
- Fixed buttons wrong size while image is downloading ([support#369]).

[support#84]: https://github.com/pybricks/support/issues/84
[support#300]: https://github.com/pybricks/support/issues/300
[support#369]: https://github.com/pybricks/support/issues/369
[support#559]: https://github.com/pybricks/support/issues/559

## [1.1.0] - 2021-12-16

### Changed
- Updated dependencies.
- Updated to Pybricks Firmware v3.1.0:

  ### Changed
  - Renamed new `DCMotor.dc_settings()` method to `DCMotor.settings()` ([support#536]).

  ### Fixed
  - Fixed direction for `DriveBase.turn()` and `Drivebase.curve()` for some
    arguments ([support#535]).
  - Fixed `then=Stop.COAST` not working in `DriveBase` methods ([support#535]).

  [support#535]: https://github.com/pybricks/support/issues/535
  [support#536]: https://github.com/pybricks/support/issues/536

- Updated docs:

  ### Added
  - Added maximum voltage setter for `DCMotor` and `Motor`.
  - Documented `DriveBase.curve()` method.

  ### Changed
  - Removed `duty` setting from `Control.limits` method.
  - Removed `integral_range` setting from `Control.pid` method.

## [1.1.0-rc.1] - 2021-11-19

### Added
- Hub name setting for selecting hub name when flashing firmware ([support#52]).

### Changed
- Updated to Pybricks firmware v3.1.0c1:

  ### Added
  - Added `DriveBase.curve()` method to drive an arc segment.
  - Added `then` and `wait` arguments to `DriveBase` methods ([support#57]).

  ### Changed
  - Dropped `integral_range` argument from `Control.pid()`. This setting was
    ineffective and never used. When set incorrectly, the motor could get stuck
    for certain combinations of `kp` and `ki`.
  - Improved motor behavior for cases with low-speed, low-load, but high
    inertia ([support#366]).
  - Changed how the duty cycle limit is set for `Motor` and `DCMotor`. It is now
    set as a voltage limit via a dedicated method, instead of `Motor.control`.

  ### Fixed
  - Fixed `then=Stop.COAST` being ignored in most motor commands.
  - Fixed `brake()`/`light.off()` not working on Move hub I/O port C ([support#501]).
  - Fixed `Remote()` failing to connect when hub is connected to 2019 or newer
    MacBooks ([support#397]).
  - Fixed intermittent improper detection of hot-plugged I/O devices ([support#500]).
  - A program now stops when a `Motor` is unplugged while it is running, instead
    of getting in a bad state.

  [support#57]: https://github.com/pybricks/support/issues/57
  [support#366]: https://github.com/pybricks/support/issues/366
  [support#397]: https://github.com/pybricks/support/issues/397
  [support#500]: https://github.com/pybricks/support/issues/500
  [support#501]: https://github.com/pybricks/support/issues/501

- Updated docs:

  ### Added
  - Added `ColorLightMatrix` class.
  - Added `LWP3Device` class.

[support#52]: https://github.com/pybricks/support/issues/52

## [1.1.0-beta.6] - 2021-09-21

### Added
- Show error message if connected hub is running old firmware ([support#482]).

### Changed
- Updated dependencies.
- Updated to Pybricks firmware v3.1.0b1:

  ### Added
  - Support for LEGO Technic Color Light Matrix ([support#440]).
  - Support for LEGO UART devices with a new battery power flag. This is
    required to support the new LEGO Technic Color Light Matrix ([support#440]).
  - Support for the SPIKE Essential hub/Technic Small hub ([support#439]).

  ### Fixed
  - Fixed Ultrasonic Sensor and Color Sensor turning off when a
    user script ends ([support#456]).
  - Hub reset due to watchdog timer when writing data to UART I/O device
    ([support#304]).
  - City/Technic hubs not connecting via Bluetooth on macOS 12 ([support#489]).

  ### Changed:
  - Updated to MicroPython v1.17.

  [support#304]: https://github.com/pybricks/support/issues/304
  [support#439]: https://github.com/pybricks/support/issues/439
  [support#440]: https://github.com/pybricks/support/issues/440
  [support#456]: https://github.com/pybricks/support/issues/456
  [support#489]: https://github.com/pybricks/support/issues/489

[support#482]: https://github.com/pybricks/support/issues/482

## [1.1.0-beta.5] - 2021-08-30

### Changed
- Updated to Pybricks firmware v3.1.0a4:

  ### Added
  - Enabled builtin `bytearray` ([pybricks-code#60]).
  - Enabled `ustruct` module ([pybricks-code#60]).
  - Added alpha support for dual boot installation on the SPIKE Prime Hub.
  - Added `pybricks.experimental.hello_world` function to make it easier for
    new contributors to experiment with Pybricks using C code.
  - Added ability to import the `main.mpy` that is embedded in the firmware from
    a download and run program ([support#408]).
  - Added `pybricks.iodevices.LWP3Device` to communicate with a device that supports
    the LEGO Wireless Protocol 3.0.00 ([pybricks-code#68])

  ### Changed
  - Move Hub Bluetooth optimizations to reduce firmware size ([pybricks-code#49]).
  - Disabled `pybricks.iodevices` module on Move Hub to reduce firmware size.
  - Improvements to `pybricks.pupdevices.Remote`:
    - Check if a remote is already connected before attempting to create a new
      connection.
    - Rename first argument from `address` to `name` to match documentation.
    - Implement connecting by name.
    - Add `name()` method.
    - Add `light` attribute.

  [pybricks-code#49]: https://github.com/pybricks/pybricks-micropython/issues/49
  [pybricks-code#60]: https://github.com/pybricks/pybricks-micropython/pull/60
  [pybricks-code#68]: https://github.com/pybricks/pybricks-micropython/pull/68
  [support#408]: https://github.com/pybricks/support/issues/408

- Updated documentation:

  ### Added
  - MicroPython module documentation.
  - Examples for hub system functions including stop button and shutdown.

  ### Changed
  - Build IDE docs as main docs with minor changes, instead of a completely
    separate build.
  - Moved motor control documentation to the motor page.

## [1.1.0-beta.4] - 2021-08-13

### Fixed
- Fixed flashing firmware on Android [support#403].

### Changed
- Checksum is now validated as firmware flash progresses instead of just at the
  end [support#433].
- About menu now shows firmware version as main version [support#412].

[support#403]: https://github.com/pybricks/support/issues/403
[support#412]: https://github.com/pybricks/support/issues/412
[support#433]: https://github.com/pybricks/support/issues/433

## [1.1.0-beta.3] - 2021-07-20

### Changed
- Changed snippet (autocomplete) content and behavior [pybricks-code#471].
- Changed gutter background color [pybricks-code#472].
- Added *BETA* badge to application icon [support#375].
- Updated hub firmware to [v3.1.0a3].

### Fixed
- Fixed auto-indent not working [pybricks-code#470].

[support#375]: https://github.com/pybricks/support/issues/375
[pybricks-code#470]: https://github.com/pybricks/pybricks-code/issues/470
[pybricks-code#471]: https://github.com/pybricks/pybricks-code/issues/471
[pybricks-code#472]: https://github.com/pybricks/pybricks-code/issues/472
[v3.1.0a3]: https://github.com/pybricks/pybricks-micropython/blob/master/CHANGELOG.md#310a3---2021-07-19

## [1.1.0-beta.2] - 2021-07-06

## Changed
- Changed from Ace editor to Monaco editor.
- Updated hub firmware to [v3.1.0a2].

### Fixed
- Fixed run button still enabled after hub disconnects during download [support#378].

[support#378]: https://github.com/pybricks/support/issues/378
[v3.1.0a2]: https://github.com/pybricks/pybricks-micropython/blob/master/CHANGELOG.md#310a2---2021-07-06

## [1.1.0-beta.1] - 2021-06-23

### Changed
- Updated projects URL.
- Updated hub firmware to [v3.1.0a1].
- Updated docs.
-
[v3.1.0a1]: https://github.com/pybricks/pybricks-micropython/blob/master/CHANGELOG.md#310a1---2021-06-23

## [1.0.0] - 2021-06-08

### Added
- Added changelog link to about dialog.

### Changed
- Updated hub firmware to [v3.0.0].
- Updated documentation.

## Prerelease

Prerelease changes are documented at [support#48].

[support#48]: https://github.com/pybricks/support/issues/48
[v3.0.0]: https://github.com/pybricks/pybricks-micropython/blob/master/CHANGELOG.md#300---2021-06-08

<!-- links for version headings -->

[Unreleased]: https://github.com/pybricks/pybricks-code/compare/v1.2.0-beta.1...HEAD
[1.2.0-beta.1]: https://github.com/pybricks/pybricks-code/compare/v1.1.0...v1.2.0-beta.1
[1.1.0]: https://github.com/pybricks/pybricks-code/compare/v1.1.0-rc.1...v1.1.0
[1.1.0-rc.1]: https://github.com/pybricks/pybricks-code/compare/v1.1.0-beta.6...v1.1.0-rc.1
[1.1.0-beta.6]: https://github.com/pybricks/pybricks-code/compare/v1.1.0-beta.5...v1.1.0-beta.6
[1.1.0-beta.5]: https://github.com/pybricks/pybricks-code/compare/v1.1.0-beta.4...v1.1.0-beta.5
[1.1.0-beta.4]: https://github.com/pybricks/pybricks-code/compare/v1.1.0-beta.3...v1.1.0-beta.4
[1.1.0-beta.3]: https://github.com/pybricks/pybricks-code/compare/v1.1.0-beta.2...v1.1.0-beta.3
[1.1.0-beta.2]: https://github.com/pybricks/pybricks-code/compare/v1.1.0-beta.1...v1.1.0-beta.2
[1.1.0-beta.1]: https://github.com/pybricks/pybricks-code/compare/v1.0.0...v1.1.0-beta.1
[1.0.0]: https://github.com/pybricks/pybricks-code/compare/v1.0.0-rc.2...v1.0.0
