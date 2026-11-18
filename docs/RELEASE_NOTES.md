## Install the update

Download **keydeck-v0.1.2.apk** below and install it over your existing Keydeck app. The package ID and signing certificate are unchanged; Android versionCode is now 5. No uninstall or development server is needed.

### Included

- Rich-black theme across the touchpad, keyboard, gamepad, and navigation.
- Refined pairing flow, larger accessible gamepad controls, and narrow-screen layouts.
- Automatically open Android's HID service on app launch/foreground when Nearby devices permission is already granted.
- Recognize an existing HID connection without tapping Connect.
- Remember the last successfully connected PC and attempt to reconnect it after app restart. Explicit Disconnect clears that remembered PC and stops automatic reconnection.
- Native HID protocol and gamepad improvements from the latest repository changes.

### How automatic connection works

Pair and connect once, allowing Android's Nearby devices permission. On later launches, Keydeck checks the actual HID connection and enables controls only after Android confirms it. If the link was dropped, it attempts to reconnect the remembered paired PC. It does not choose an arbitrary paired device.

Keep Keydeck visible while controlling the PC. Android can unregister background HID apps; this release does not add a background service or promise control while the app is closed. A generic Bluetooth pairing or another profile's connection is not necessarily an active keyboard/mouse HID connection.

The remembered Bluetooth address stays locally on the phone. Disconnect clears it. Typed drafts and command history are not persisted.

### Verification

Source: `b38091d7ee5738962d4e40eb69325c1c9a5eb2f0`.

30 core tests, 9 interaction tests, lint, TypeScript, and Android compilation passed. The APK signature, alignment, package/version, bundled JavaScript, and original signing certificate were verified. Check `SHA256SUMS.txt` and `SIGNING-CERTIFICATE.txt` for download integrity and signing identity.

This remains a preview pending physical-device Bluetooth and battery validation. Compatibility depends on Android firmware and host HID support. Text uses US-layout ASCII; terminal output is not included.
