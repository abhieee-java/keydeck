# Release validation

## Automated coverage

The repository checks TypeScript, lint, HID encoding, pointer scheduling and button ordering, preference validation, browser interaction flows, and standalone Android compilation. Browser tests cover connection simulation, unsupported text, unavailable native Bluetooth, route state, saved preferences, and background session suspension.

These checks do not prove physical Bluetooth compatibility or power consumption.

## Physical-device release gate

Before calling a release production-validated, record phone model, Android build, host OS, app version, and results for:

- First installation, permission denial/retry, initial pairing, reconnect, Bluetooth disabled, out-of-range recovery, and another HID app running.
- Typing, held modifiers, shortcuts, rapid clicks, dragging, scrolling, long text cancellation, and backgrounding while a key/button is active. No keys or buttons should remain held.
- Android navigation, screen lock, rotation, large font, TalkBack, display cutouts, and low-memory process restart.
- Installation without Metro, update with the same signing key, and offline launch.

## Battery protocol

Use a physical phone with fixed brightness, refresh rate, battery saver settings, temperature, and network state. Compare equal-duration runs with the screen on: baseline, Keydeck open and idle, connected and idle, and active pointer/text input. Repeat both 30 Hz and 60 Hz modes. Reset Android battery statistics before each run and collect `adb shell dumpsys batterystats` afterward. Use Android Studio Power Profiler where supported. Record elapsed time and charge/energy measurements, repeat runs, and publish the device-specific differences rather than a universal battery claim.

Implementation currently avoids idle polling, perpetual animation, wake locks, and a background service. Pointer reports are scheduled only while there is input; the queue bounds pending movement and preserves button transitions. Backgrounding a connected session releases input and unregisters HID. Screen and Bluetooth activity still consume energy.

## Current qualification

Physical-device Bluetooth, accessibility, and battery results have not yet been recorded. Releases remain previews until this gate is completed.
