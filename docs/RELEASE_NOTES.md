## Keydeck Android preview

A React Native Android preview for a Bluetooth mouse, keyboard, shortcuts, and command input from Android.

### Install

Download the attached `keydeck-vX.Y.Z.apk` on an Android 9+ phone. Open it and follow Android's installer. No Expo Go or development server is needed. See the [installation guide](https://github.com/abhieee-java/keydeck/blob/main/docs/INSTALL.md) for pairing.

### Included

- Touchpad movement, clicks, drag toggle, scroll, and direction buttons
- ASCII typing, function/navigation keys, preset and custom shortcuts
- Command composer that sends text + Enter to a focused terminal
- Refined dark interface, pairing sheet, and locally saved preferences
- Demand-driven pointer batching and foreground-only sessions
- Local preview mode and connection recovery messages

### Preview limitations

Physical Bluetooth behavior, TalkBack, and battery consumption have not yet been verified across physical devices. Some Android firmware does not support HID device mode. Keep the app in the foreground. US-layout ASCII only. Command output, remote screen viewing, and a desktop companion are not included.

`SHA256SUMS.txt` verifies the APK bytes. `SIGNING-CERTIFICATE.txt` identifies the signing certificate. Source ZIP/TAR downloads are not installable applications.
