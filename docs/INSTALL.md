# Install Keydeck

## Download the app, not the source

Open [GitHub Releases](https://github.com/abhieee-java/keydeck/releases) on your Android phone. Choose a release with a **`keydeck-vX.Y.Z.apk`** asset. `Source code (zip)` and `Source code (tar.gz)` are for developers and cannot be installed as apps. If there is no APK attachment yet, an installable release has not been published.

1. Download the APK and open it from your browser or Downloads.
2. Android may ask to allow your browser or file manager to **install unknown apps**. Enable this permission for that app, then return to the installer. You can turn it off afterward.
3. Install and open **Keydeck**. You do not need Expo Go, Node.js, an account, or a computer development server.
4. Read the release notes for the minimum Android version and known limitations.

Release assets include `SHA256SUMS.txt` for integrity checking and `SIGNING-CERTIFICATE.txt` for the signing certificate fingerprint. Advanced users can run `sha256sum -c SHA256SUMS.txt` alongside the downloaded APK.

## Pair with your computer

1. Turn on Bluetooth on both devices.
2. Open Keydeck and disable **Preview mode** if it is enabled.
3. Choose **Connect**, allow **Nearby devices**, then tap **Make discoverable**. Accept Android's system prompt.
4. On the computer, open Bluetooth settings and add the phone. Confirm any pairing prompts on both devices. The phone's system Bluetooth name may be shown rather than “Keydeck.”
5. Return to Keydeck. Refresh the list, select the paired computer, and tap **Connect**.
6. Focus the app you want to control on your computer. Keep Keydeck in the foreground.

Initial pairing is not hands-free: you need access to the computer's Bluetooth settings. After pairing, reconnect from Keydeck when supported by the host.

## Use the controls

- **Touchpad:** one finger moves the pointer, a short tap clicks, two fingers scroll. Dedicated buttons provide alternatives to gestures.
- **Drag:** enable the drag button to hold the left mouse button; tap it again to release.
- **Keyboard:** type a draft and tap Send, or choose a function/navigation key. Custom shortcuts combine modifiers with a key name.
- **Console:** focus a terminal on the computer first. Send + Enter types and submits your command. The history records sent input, not command success or output.

## Updates and uninstalling

Install a newer release APK over the existing app. The package ID and signing certificate must match, and the new version code must increase. Uninstalling removes app data; the current foundation stores drafts only in memory. Remove the phone from the computer's paired Bluetooth devices if you no longer use Keydeck.

## Troubleshooting

| Symptom | Try this |
| --- | --- |
| No APK in a release | That release is source-only or still being prepared. Do not rename a ZIP file to APK. |
| “App not installed” | Check Android 9+, free storage, and that the complete APK downloaded. A conflicting signing certificate may require uninstalling an older unofficial build. |
| Nearby devices denied | Allow it in Android Settings → Apps → Keydeck → Permissions, then retry. |
| No paired devices | Pair from the computer's Bluetooth settings, return to Keydeck, then refresh. |
| HID registration unavailable | Close other Bluetooth controller apps. Your phone's firmware may not support the HID device role. |
| Connection stops after switching apps | Keydeck pauses connected sessions in the background. Keep Keydeck open, then reconnect. |
| Wrong punctuation | Set the computer's keyboard layout to US. Current text encoding supports ASCII only. |
| Part of a draft was typed | A radio interruption can stop a send halfway. Check the computer before retrying; text delivery is not atomic. |
| No terminal output on the phone | Expected: Bluetooth HID sends input only. A future companion is needed for output and screen viewing. |

Still stuck? [File a bug report](https://github.com/abhieee-java/keydeck/issues/new?template=bug.yml). Do not include passwords, private command text, or Bluetooth device addresses.
