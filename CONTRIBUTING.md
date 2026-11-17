# Contributing to Keydeck

Thanks for helping make phone-to-computer control more useful. Reproducible device reports, documentation improvements, accessibility testing, and focused pull requests are welcome.

## Set up

Use Node 24 and Java 21. Run `npm ci`, then `npm run web` for preview. For Bluetooth work, install Android tooling and run `npm run android` with a real Android device. Expo Go cannot load the local HID module.

Before opening a pull request:

```sh
npm run lint
npm run typecheck
npm test
npm run build:web
npx playwright install chromium
npm run test:ui
```

Use `npx expo install` for Expo/native packages to keep SDK versions compatible. Routes live in `src/app`; keep controls and service logic outside the routing directory. Native configuration belongs in Expo config/plugins rather than generated Android files.

## Scope and verification

Keep each change focused. Explain the observable behavior and how it was checked. Add meaningful tests for new encoding, connection, or interruption behavior. Avoid tests that merely restate UI styling.

For Bluetooth reports, include phone/Android/host OS versions and distinguish physical-device tests from browser preview tests. Never commit signing keys, credentials, personal command history, generated native directories, or APKs to the source tree. Use release assets for binaries.

## Working together

Be respectful, specific, and patient. Discuss ideas and code, not people's identities or abilities. Maintainers may remove abusive or off-topic content. Security reports should follow [SECURITY.md](SECURITY.md).
