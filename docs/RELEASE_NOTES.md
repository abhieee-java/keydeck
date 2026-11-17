## Install Keydeck

Download **keydeck-v0.1.0.apk** below on an Android 9+ phone, open it, and allow your browser to install apps when Android asks. This is a standalone signed APK: no Expo Go, account, or development server required.

[Installation and pairing guide](https://github.com/abhieee-java/keydeck/blob/main/docs/INSTALL.md)

### Included

- Bluetooth touchpad, left/right click, drag, scrolling, and alternative direction controls
- ASCII keyboard input, navigation/function keys, and custom shortcuts
- Command composer for typing into a focused computer terminal
- Refined dark mobile interface and dedicated pairing sheet
- Local host/sensitivity preferences, demand-driven 30/60 Hz pointer scheduling, and background session suspension

### Verification

Source: `e3f47b12b6ffd1aa323e5f72fa3c534100c7b953`.

Lint, TypeScript, 15 core tests, 7 browser interaction tests, web export, and the standalone Android build passed. APK signing, package identity, bundled JavaScript, and alignment were checked. `SHA256SUMS.txt` checks the downloaded APK; `SIGNING-CERTIFICATE.txt` records the signing certificate.

### Preview status

Physical-phone Bluetooth, TalkBack, installation, and battery measurements are still pending. Some Android firmware disables HID device mode. Keep Keydeck in the foreground; reconnect after backgrounding. Screen and Bluetooth activity consume power—no zero-battery-impact claim is made.

The computer needs Bluetooth keyboard/mouse support, and initial pairing requires access to its Bluetooth settings. Text encoding uses US-layout ASCII. The console sends input only: terminal output and remote screen viewing are not included. This does not replace input in BIOS or every protected operating-system dialog.

The dependency audit has a moderate advisory in Expo's build-time fingerprint dependency; no high or critical findings were reported. See [validation details](https://github.com/abhieee-java/keydeck/blob/main/docs/VALIDATION.md).

GitHub's source ZIP/TAR archives are for developers and cannot be installed as Android apps.
