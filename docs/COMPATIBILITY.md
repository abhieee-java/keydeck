# Compatibility and verification

Keydeck targets Android 9/API 28 or newer with the Bluetooth HID **device** role. Android version alone does not guarantee firmware support. Computers must support Bluetooth HID keyboards and mice.

| Area | Status |
| --- | --- |
| HID text encoding and shortcut logic | Automated unit tests |
| Browser preview: connect, text, console, disconnect, error recovery | Automated Playwright tests |
| Route/session continuity and narrow browser viewport | Automated Playwright tests |
| Android native module compilation | See the Android build workflow for current evidence |
| Real Android phone → Windows | Not yet device-verified |
| Real Android phone → macOS | Not yet device-verified |
| Real Android phone → Linux | Not yet device-verified |
| TalkBack, native multitouch, enlarged system fonts | Pending physical-device checks |

A successful build is not a Bluetooth compatibility certification. Device reports should include the Keydeck release, phone model, Android version, host OS/version, pairing result, and results for movement, clicks, dragging, wheel, shortcuts, and background/reconnect.

Not currently supported: remote screen viewing, terminal output, boot/BIOS control, guaranteed wake-from-off, Unicode typing, or non-US layout mapping.
