<!-- Refer to https://keepachangelog.com/en/1.0.0/ for guidance. -->

# Changelog

## [Unreleased]

## [2.1.0-beta.2] - 2022-12-26

### Changed
- Updated firmware to v3.2.1:

  #### Fixed
  - Fixed `imu.angular_velocity` returning the values of `imu.acceleration`.

  [support#885]: https://github.com/pybricks/support/issues/885

## [2.1.0-beta.1] - 2022-12-23

### Added
- Added audio and visual feedback when typing into terminal while user program is not running.

### Changed
- Changed app display from "fullscreen" to "standalone" ([support#867]).

### Fixed
- Fixed imports in scripts that use `async` or `await` keywords ([support#873]).

[support#867]: https://github.com/pybricks/support/issues/867
[support#873]: https://github.com/pybricks/support/issues/873

## [2.0.1] - 2022-12-21

### Fixed
- Fixed terminal scroll not working ([support#866]).
- Fixed terminal breaks if input is given before hub is connected ([support#865]).

[support#865]: https://github.com/pybricks/support/issues/865
[support#866]: https://github.com/pybricks/support/issues/866

## [2.0.0] - 2022-12-20

### Added
- Added Windows DFU USB driver installation instructions ([support#858]).

### Changed
- Clicking empty area of file list focuses the list ([support#856]).
- Various text, style and accessibility fixes and improvements.
- Updated dependencies.
- Updated firmware to v3.2.0:

  #### Changed
  - Buffered stdout is flushed before ending user program.

  #### Fixed
  - Fixed SPIKE/MINDSTORMS hubs advertising after disconnect while user program
    is still running ([support#849]).
  - Fixed Essential hub hanging on boot when bootloader entered but USB cable
    not connected ([support#821]).
  - Fixed button needs debouncing on City/Technic/Essential hubs ([support#716]).
  - Fixed motor hold drifting away under external input movement ([support#863]).

  [support#716]: https://github.com/pybricks/support/issues/716
  [support#821]: https://github.com/pybricks/support/issues/821
  [support#849]: https://github.com/pybricks/support/issues/849
  [support#863]: https://github.com/pybricks/support/issues/863


[support#856]: https://github.com/pybricks/support/issues/856
[support#858]: https://github.com/pybricks/support/issues/858

## [2.0.0-rc.1] - 2022-12-09

### Added
- Added videos to firmware flash dialogs ([support#728]).

### Changed
- Moved documentation show/hide button from settings to editor area ([support#778]).
- Updated documentation and other dependencies.
- Updated firmware to v3.2.0c1:

  #### Fixed
  - Fixed `motor.control.limits()` not working if acceleration was `None`.
  - Fixed crash on calling methods on uninitialized objects ([support#805]).
  - Fixed crash on calling methods in `__init__(self, ...)` before
    calling `super().__init(...)` on uninitialized objects ([support#777]).
  - Reverted Pybricks Code stop button raises `SystemAbort` instead of
    `SystemExit` ([support#834]).
  - Improved stop message raised on `SystemExit` and `SystemAbort` ([support#836]).
  - Fixed Technic Hub and City Hub sometimes not shutting down when a Bluetooth
    operation is busy ([support#814]).
  - Fixed `hub.system` methods not working ([support#837]).

  #### Changed
  - Changed default XYZ orientation of the Technic Hub and the Essential Hub to
    match the SPIKE Prime Hub and Move Hub ([support#848]).

  [support#777]: https://github.com/pybricks/support/issues/777
  [support#805]: https://github.com/pybricks/support/issues/805
  [support#814]: https://github.com/pybricks/support/issues/814
  [support#826]: https://github.com/pybricks/support/issues/826
  [support#834]: https://github.com/pybricks/support/issues/834
  [support#836]: https://github.com/pybricks/support/issues/836
  [support#837]: https://github.com/pybricks/support/issues/837
  [support#848]: https://github.com/pybricks/support/issues/848


### Fixed
- Fixed first tour item not shown if settings is not open ([support#823]).
- Fixed selected activity tab not controlled independently per window ([support#807]).
- Fixed selected documentation visibility not controlled independently per window ([support#807]).
- Fixed slow firmware flash on Android ([support#438]).

[support#438]: https://github.com/pybricks/support/issues/438
[support#728]: https://github.com/pybricks/support/issues/728
[support#778]: https://github.com/pybricks/support/issues/778
[support#807]: https://github.com/pybricks/support/issues/807
[support#823]: https://github.com/pybricks/support/issues/823

## [2.0.0-beta.12] - 2022-12-02

### Added
- Added in-app LEGO firmware restore for USB/DFU hubs.
- Added Pybricks logo when no files open.

### Changed
- Firmware restore for hubs with USB is now done in-app ([pybricks-code#1104]).
- Moved *Tour* button from toolbar to settings.
- Updated docs, code completion and other dependencies.
- Updated firmware to v3.2.0b6:

  - Added support for `PBIO_PYBRICKS_COMMAND_REBOOT_TO_UPDATE_MODE` Pybricks
    Profile BLE command.
  - Implemented `Motor.load()` which now measures load both during active
    conditions (`run`) and passive conditions (`dc`).

  #### Changed
  - The Pybricks Code stop button will force the program to exit even if the user
    catches the `SystemExit` exception ([pybricks-micropython#117]).
  - Changed `PrimeHub.display.image()` to `PrimeHub.display.icon()` and renamed
    its kwarg from `image` to `icon` ([support#409]).
  - Deprecated `Control.load()`, `Control.stalled()`, and `Control.done()`
    methods ([support#822]).

  #### Fixed
  - Fixed connecting `Remote` on BOOST move hub ([support#793]).

  #### Removed
  - Removed `hub.system.reset()` method.
  - Disabled `micropython` module on Move Hub.

  [pybricks-micropython#117]: https://github.com/pybricks/pybricks-micropython/pull/117
  [support#409]: https://github.com/pybricks/support/issues/409
  [support#793]: https://github.com/pybricks/support/issues/793
  [support#793]: https://github.com/pybricks/support/issues/822


[pybricks-code#1104]: https://github.com/pybricks/pybricks-code/issues/1104

### Fixed
- Fixed missing warning sign icon.
- Fixed error message for program too big for download ([support#810]).

[support#810]: https://github.com/pybricks/support/issues/810

## [2.0.0-beta.11] - 2022-11-11

### Fixed
- Fixed app freezing when checking for updates and update server is unreachable ([pybricks-code#1299]).
- Added delay to try to mitigate errors when flashing firmware on city hubs ([support#792]).

[pybricks-code#1299]: https://github.com/pybricks/pybricks-code/issues/1299
[support#792]: https://github.com/orgs/pybricks/discussions/792

## [2.0.0-beta.10] - 2022-11-11

### Added
- Added feature create new empty file ([pybricks-code#771]).
- Added sponsor button ([support#719]).

### Changed
- Updated documentation.
- Updated other dependencies.
- Update Pybricks firmware to v3.2.0a5:

    #### Added
    - Added `DriveBase.stalled()` for convenient stall detection.
    - Added `DriveBase.done()` for convenient completion detection.
    - Added `Motor.done()` for convenient completion detection.

    #### Fixed
    - Fixed brief hub freeze on `pybricks.common.Logger.save()` when not connected
      to the computer ([support#738]).
    - Fixed drive base stall flags being set while not stalled ([support#767]).
    - Fixed `Motor.run_target` raising exception for short moves ([support#786]).

    [support#738]: https://github.com/pybricks/support/issues/738
    [support#767]: https://github.com/pybricks/support/issues/767
    [support#786]: https://github.com/pybricks/support/issues/786


### Fixed
- Fixed firmware checksum validation when checksum === 0.
- Fixed activity views not scrolling when contents don't fit ([support#782]).

[pybricks-code#771]: https://github.com/pybricks/pybricks-code/issues/771
[support#719]: https://github.com/pybricks/support/issues/719
[support#782]: https://github.com/pybricks/support/issues/782

## [2.0.0-beta.9] - 2022-10-27

### Added
- Added feature to close editor tab on middle click ([support#758]).

### Fixed
- Fixed long time until UI visible on resource-constrained systems.

### Removed
- Removed word-based autocompletion ([support#757]).

[support#757]: https://github.com/pybricks/support/issues/757
[support#758]: https://github.com/pybricks/support/issues/758

## [2.0.0-beta.8] - 2022-10-25

### Fixed
- Fixed crash when user program contains syntax error ([support#755]).

[support#755]: https://github.com/pybricks/support/issues/755

## [2.0.0-beta.7] - 2022-10-24

### Fixed
- Fixed UI temporary freeze when downloading and running programs ([support#750]).

[support#750]: https://github.com/pybricks/support/issues/750

## [2.0.0-beta.6] - 2022-10-21

### Added
- Added feature to install custom firmware from file ([pybricks-code#1020]).
- Added support for multi-file programs ([support#189]).

### Changed
- Updated dependencies.
- Updated documentation.
- Updated APIs for code completions.
- Update hub firmware to v3.2.0b4:

  #### Added
  - Added hub shutdown status light indication.
  - Added boot and shutdown light matrix animations.
  - Added new indication for over-charging battery (blinking green light).
  - Added iterator protocol support to `geometry.Matrix` class.
  - Added support for multi-file projects ([pybricks-micropython#115]).
  - Added new `System.storage()` API ([support#85]).

  #### Changed
  - Battery full indication (green light) comes on earlier ([support#647]).
  - User program is saved to non-volatile memory at shutdown on all hubs.
  - Restored the `Motor.speed()` method and `DriveBase` equivalent to provide
    speed as a numerical derivative of the motor position.
  - Starting REPL automatically imports all modules ([support#741]).
  - Updated Bluetooth to [Pybricks Profile v1.2.0][pp1.2.0].
  - Bluetooth now uses random private address instead of static public address
    ([support#600]).

  #### Fixed
  - Fixed motors going out of sync when starting program ([support#679]).
  - Fixed motor torque signal overflowing under load ([support#729]).
  - Fixed city hub turning back on after shutdown ([support#692]).
  - Fixed IMU I2C bus lockup on SPIKE hubs ([support#232]).
  - Fixed REPL history corrupt after soft reset ([support#699]).
  - Fixed "ValueError: incompatible .mpy file" when pressing the button when
    there is no program yet ([support#599]).

  [pp1.2.0]: https://github.com/pybricks/technical-info/blob/master/pybricks-ble-profile.md#profile-v120
  [pybricks-micropython#115]: https://github.com/pybricks/pybricks-micropython/pull/115
  [support#85]: https://github.com/pybricks/support/issues/85
  [support#232]: https://github.com/pybricks/support/issues/232
  [support#599]: https://github.com/pybricks/support/issues/599
  [support#600]: https://github.com/pybricks/support/issues/600
  [support#647]: https://github.com/pybricks/support/issues/647
  [support#679]: https://github.com/pybricks/support/issues/679
  [support#692]: https://github.com/pybricks/support/issues/692
  [support#699]: https://github.com/pybricks/support/issues/699
  [support#729]: https://github.com/pybricks/support/issues/729
  [support#741]: https://github.com/pybricks/support/issues/741


### Fixed
- Fixed run button enabled when no file open ([support#691]).
- Fixed flash firmware dialog not showing when settings not open ([support#694]).
- Fixed errors not handled while flashing firmware via USB ([pybricks-code#1011]).
- Fixed imports with invalid file name silently ignored ([support#717]).
- Fixed code completion not working when offline ([pybricks-code#932]).

### Removed
- Removed feature to include custom `main.py` when flashing firmware.
- Removed support for file names containing `-`.

[pybricks-code#932]: https://github.com/pybricks/pybricks-code/issues/932
[pybricks-code#1011]: https://github.com/pybricks/pybricks-code/issues/1011
[pybricks-code#1020]: https://github.com/pybricks/pybricks-code/issues/1020
[support#189]: https://github.com/pybricks/support/issues/189
[support#691]: https://github.com/pybricks/support/issues/691
[support#694]: https://github.com/pybricks/support/issues/694
[support#717]: https://github.com/pybricks/support/issues/717

## [2.0.0-beta.5] - 2022-07-28

### Fixed
- Fixed `main.[hash].js` not cached ([support#689]).

[support#689]: https://github.com/pybricks/support/issues/689

## [2.0.0-beta.4] - 2022-07-28

### Added
- Added better error message when no files to backup ([support#681]).
- Added multi-step firmware flashing dialog.
- Added support for flashing firmware via USB DFU ([support#659]).
- Added an interactive introductory tour of the app.
- Added restore official LEGO firmware dialog.

### Changed
- Updated dependencies.
- Updated firmware to Pybricks v3.2.0b3:

  #### Fixed
  - Fix integral control not working properly.

  #### Changed
  - `Motor.run_time` no longer raises an exception for negative time values.

### Fixed
- Fixed deleting files that are not open in the editor.

[support#659]: https://github.com/pybricks/support/issues/659
[support#681]: https://github.com/pybricks/support/issues/681

## [2.0.0-beta.3] - 2022-07-06

### Changed
- Updated dependencies.
- Updated firmware to Pybricks v3.2.0b2:

  #### Added
  - Added `Motor.stalled()` method.

  #### Fixed
  - Fixed motor not stopping at the end of `run_until_stalled` ([support#662]).
  - Fixed incorrect battery current reading on Technic hub ([support#665]).
  - Fixed non-zero speed reported when motor stalled.
  - Fixed I/O devices not syncing at high baud rate.
  - Fixed `ENODEV` error while device connection manager is busy ([support#674]).

  #### Changed
  - Reworked internal motor model that is used to estimate speed.
  - Speed methods now use estimated speed instead of reported speed.
  - Changed drive base default speed to go a little slower.
  - Updated MicroPython to v1.19.

  [support#662]: https://github.com/pybricks/support/issues/662
  [support#665]: https://github.com/pybricks/support/issues/665
  [support#674]: https://github.com/pybricks/support/issues/674

## [2.0.0-beta.2] - 2022-06-24

### Added
- Added basic intellisense to the code editor.

## [2.0.0-beta.1] - 2022-06-03

### Added
- Added multi-file support ([support#418], [support#465]).

### Changed
- Moved settings.
- Accessibility improvements.
- Updated dependencies.
- Updated documentation.
- Updated firmware to v3.2.0b1:
  
  #### Added
  - Added `Stop.NONE` as `then` option for motors.
  - Added `Stop.COAST_SMART` as `then` option for motors.
  - Made motor deceleration configurable separately from acceleration.
  - Enabled `ujson` module.
  - Added ability to use more than one `DriveBase` in the same script.
  - Added support for battery charging on Prime and essential hubs.

  #### Changed
  - Changed how `DriveBases` and `Motor` classes can be used together.
  - Raise asynchronous `OSError` instead of `SystemExit` if motor is disconnected
    while a program is running.
  - Changing settings while a motor is moving no longer raises an exception. Some
    settings will not take effect until a new motor command is given.
  - Disabled `Motor.control` and `Motor.log` on Move Hub to save space.
  - Changed LED color calibration on Prime hub to make yellow less green.
  - Updated to upstream MicroPython v1.18.
  - Changed imu.acceleration() units to mm/s/s ([pybricks-micropython#88]) for
    Move Hub, Technic Hub, and Prime Hub.

  #### Fixed
  - Fixed color calibration on Powered Up remote control ([support#424]).
  - Fixed 3x3 Light Matrix colors with hue > 255 not working correctly ([support#619]).

  [pybricks-micropython#88]: https://github.com/pybricks/pybricks-micropython/issues/88
  [support#424]: https://github.com/pybricks/support/issues/424
  [support#619]: https://github.com/pybricks/support/issues/619


### Fixed
- Fix tooltips not closing when expected ([pybricks-code#275]).

[pybricks-code#275]: https://github.com/pybricks/pybricks-code/issues/275
[support#418]: https://github.com/pybricks/support/issues/418
[support#465]: https://github.com/pybricks/support/issues/465

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

  #### Changed
  - Renamed new `DCMotor.dc_settings()` method to `DCMotor.settings()` ([support#536]).

  #### Fixed
  - Fixed direction for `DriveBase.turn()` and `Drivebase.curve()` for some
    arguments ([support#535]).
  - Fixed `then=Stop.COAST` not working in `DriveBase` methods ([support#535]).

  [support#535]: https://github.com/pybricks/support/issues/535
  [support#536]: https://github.com/pybricks/support/issues/536

- Updated docs:

  #### Added
  - Added maximum voltage setter for `DCMotor` and `Motor`.
  - Documented `DriveBase.curve()` method.

  #### Changed
  - Removed `duty` setting from `Control.limits` method.
  - Removed `integral_range` setting from `Control.pid` method.

## [1.1.0-rc.1] - 2021-11-19

### Added
- Hub name setting for selecting hub name when flashing firmware ([support#52]).

### Changed
- Updated to Pybricks firmware v3.1.0c1:

  #### Added
  - Added `DriveBase.curve()` method to drive an arc segment.
  - Added `then` and `wait` arguments to `DriveBase` methods ([support#57]).

  #### Changed
  - Dropped `integral_range` argument from `Control.pid()`. This setting was
    ineffective and never used. When set incorrectly, the motor could get stuck
    for certain combinations of `kp` and `ki`.
  - Improved motor behavior for cases with low-speed, low-load, but high
    inertia ([support#366]).
  - Changed how the duty cycle limit is set for `Motor` and `DCMotor`. It is now
    set as a voltage limit via a dedicated method, instead of `Motor.control`.

  #### Fixed
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

  #### Added
  - Added `ColorLightMatrix` class.
  - Added `LWP3Device` class.

[support#52]: https://github.com/pybricks/support/issues/52

## [1.1.0-beta.6] - 2021-09-21

### Added
- Show error message if connected hub is running old firmware ([support#482]).

### Changed
- Updated dependencies.
- Updated to Pybricks firmware v3.1.0b1:

  #### Added
  - Support for LEGO Technic Color Light Matrix ([support#440]).
  - Support for LEGO UART devices with a new battery power flag. This is
    required to support the new LEGO Technic Color Light Matrix ([support#440]).
  - Support for the SPIKE Essential hub/Technic Small hub ([support#439]).

  #### Fixed
  - Fixed Ultrasonic Sensor and Color Sensor turning off when a
    user script ends ([support#456]).
  - Hub reset due to watchdog timer when writing data to UART I/O device
    ([support#304]).
  - City/Technic hubs not connecting via Bluetooth on macOS 12 ([support#489]).

  #### Changed:
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

  #### Added
  - Enabled builtin `bytearray` ([pybricks-code#60]).
  - Enabled `ustruct` module ([pybricks-code#60]).
  - Added alpha support for dual boot installation on the SPIKE Prime Hub.
  - Added `pybricks.experimental.hello_world` function to make it easier for
    new contributors to experiment with Pybricks using C code.
  - Added ability to import the `main.mpy` that is embedded in the firmware from
    a download and run program ([support#408]).
  - Added `pybricks.iodevices.LWP3Device` to communicate with a device that supports
    the LEGO Wireless Protocol 3.0.00 ([pybricks-code#68])

  #### Changed
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

  #### Added
  - MicroPython module documentation.
  - Examples for hub system functions including stop button and shutdown.

  #### Changed
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

[v3.0.0]: https://github.com/pybricks/pybricks-micropython/blob/master/CHANGELOG.md#300---2021-06-08

## Prerelease

Prerelease changes are documented at [support#48].

[support#48]: https://github.com/pybricks/support/issues/48

<!-- links for version headings -->

[Unreleased]: https://github.com/pybricks/pybricks-code/compare/v2.1.0-beta.2...HEAD
[2.1.0-beta.2]: https://github.com/pybricks/pybricks-code/compare/v2.1.0-beta.1...v2.1.0-beta.2
[2.1.0-beta.1]: https://github.com/pybricks/pybricks-code/compare/v2.0.1...v2.1.0-beta.1
[2.0.1]: https://github.com/pybricks/pybricks-code/compare/v2.0.0...v2.0.1
[2.0.0]: https://github.com/pybricks/pybricks-code/compare/v2.0.0-rc.1...v2.0.0
[2.0.0-rc.1]: https://github.com/pybricks/pybricks-code/compare/v2.0.0-beta.12...v2.0.0-rc.1
[2.0.0-beta.12]: https://github.com/pybricks/pybricks-code/compare/v2.0.0-beta.11...v2.0.0-beta.12
[2.0.0-beta.11]: https://github.com/pybricks/pybricks-code/compare/v2.0.0-beta.10...v2.0.0-beta.11
[2.0.0-beta.10]: https://github.com/pybricks/pybricks-code/compare/v2.0.0-beta.9...v2.0.0-beta.10
[2.0.0-beta.9]: https://github.com/pybricks/pybricks-code/compare/v2.0.0-beta.8...v2.0.0-beta.9
[2.0.0-beta.8]: https://github.com/pybricks/pybricks-code/compare/v2.0.0-beta.7...v2.0.0-beta.8
[2.0.0-beta.7]: https://github.com/pybricks/pybricks-code/compare/v2.0.0-beta.6...v2.0.0-beta.7
[2.0.0-beta.6]: https://github.com/pybricks/pybricks-code/compare/v2.0.0-beta.5...v2.0.0-beta.6
[2.0.0-beta.5]: https://github.com/pybricks/pybricks-code/compare/v2.0.0-beta.4...v2.0.0-beta.5
[2.0.0-beta.4]: https://github.com/pybricks/pybricks-code/compare/v2.0.0-beta.3...v2.0.0-beta.4
[2.0.0-beta.3]: https://github.com/pybricks/pybricks-code/compare/v2.0.0-beta.2...v2.0.0-beta.3
[2.0.0-beta.2]: https://github.com/pybricks/pybricks-code/compare/v2.0.0-beta.1...v2.0.0-beta.2
[2.0.0-beta.1]: https://github.com/pybricks/pybricks-code/compare/v1.2.0-beta.1...v2.0.0-beta.1
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
