# Release procedures

Users install a standalone signed APK from GitHub Releases. They must not need Expo Go, a development server, or an Expo account.

## Build paths

- **Android build** compiles a release APK without signing and uploads `keydeck-unsigned-apk` as an Actions artifact. It is for compile verification and maintainer signing, not user installation.
- **Signed Android release** builds with repository signing secrets, verifies the signature, attaches APK/checksum/certificate assets, and creates a **draft** release for verification.
- `eas.json` remains available for Expo cloud builds when maintainers have an Expo account configured. Use the same signing identity if distributing updates to existing users.

## Configure signing once

Generate an Android release keystore and keep an offline encrypted backup. **Do not generate a new key for each release.** Android updates require the same package ID and signing certificate. Never commit the keystore, password, or credentials.

Add these repository Actions secrets using an account allowed to manage secrets:

| Secret | Value |
| --- | --- |
| `ANDROID_KEYSTORE_BASE64` | Base64 of the existing release keystore |
| `ANDROID_STORE_PASSWORD` | Keystore password |
| `ANDROID_KEY_ALIAS` | Alias inside that keystore |
| `ANDROID_KEY_PASSWORD` | Password for that key |

The workflow decodes the keystore into the runner's temporary directory and removes it after the build. Fork PR builds do not receive signing secrets. Use trusted release tags only.

## Create a release

1. Run quality checks and inspect the Android build. Complete the device checklist below; report any pending checks in release notes.
2. Increment `expo.version` and `android.versionCode` in `app.json`, plus `package.json` and its lockfile version. Never reuse or lower a published version code.
3. Update `docs/RELEASE_NOTES.md` with the exact filename and current verification evidence.
4. Commit, create a matching `vX.Y.Z` tag, and push it. The signing workflow fails clearly if secrets are missing. It never silently substitutes a debug certificate.
5. Inspect the draft release and install the APK on a real phone. Ensure it launches with the development server stopped.
6. Mark unverified first builds as prereleases. Publish only with accurate compatibility notes, and update the README status/download link.

## Device checklist

- Fresh installation, launch without Metro, permission grant/denial/retry
- Pairing, connect, disconnect, reconnect after radio loss
- Mouse move, left/right click, drag/release, two-finger and button scroll
- Text, punctuation on a US host layout, modifiers, function/navigation keys
- Background interruption releases held inputs
- Command input history does not claim command execution success
- Existing installation can upgrade with the same certificate
- Android Back, TalkBack, large text, and narrow screens

The signing identity, APK signature, and checksums must be verified before upload. Do not overwrite a published asset with different bytes under the same version.

## First preview publication

v0.1.0 was compiled from `e3f47b12b6ffd1aa323e5f72fa3c534100c7b953` in [Android build 44064240304](https://github.com/abhieee-java/keydeck/actions/runs/44064240304), signed privately, and uploaded through [publication run 44110622475](https://github.com/abhieee-java/keydeck/actions/runs/44110622475). The publication job verified the APK checksum and certificate before upload. Its temporary branch was removed after publication so the prepared binary was not added to main. The private signing key was never uploaded. Future automated signing still requires the four repository secrets above.
