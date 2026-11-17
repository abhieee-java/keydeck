# Architecture

```text
Expo Router screens
       │
ControllerProvider ── session, draft, permissions, recovery
       │
HidTransport
  ├── Preview adapter (local only)
  └── Kotlin Expo module
            │
     Android BluetoothHidDevice
            │
     Computer keyboard + mouse input
```

- `src/app/`: real navigation routes and shared root provider.
- `src/hooks/ControllerProvider.tsx`: connection state and actions across screens.
- `src/components/`: replaceable controls, including touchpad and shortcut composer.
- `src/core/hid.ts`: pure USB HID usage mapping and ASCII validation.
- `src/core/pointer.ts`: demand-driven pointer scheduler with bounded movement and ordered button transitions.
- `src/hooks/usePreferences.ts`: validated local preferences; typed content is never persisted.
- `src/core/transport.ts`: preview/native boundary, serialized text/key input, cancellation generation.
- `modules/bluetooth-hid/`: local Kotlin Expo module, composite keyboard/mouse descriptor, lifecycle cleanup.
- `src/core/console.ts`: contract for a future authenticated bidirectional companion. No companion is implemented.
- `plugins/withReleaseSigning.js`: native signing configuration generated through Expo prebuild.

Connection state comes from Android callbacks, not optimistic connect-button success. The native module releases keys/buttons when interrupted; Android may unregister the HID app in the background. Text is validated before sending, but transmission itself can be interrupted. Do not automatically replay a partly sent command.

The repository excludes generated `android/` and `ios/` projects. Recreate Android with `npx expo prebuild --platform android --no-install`; local module sources remain tracked. Do not hand-edit generated native files for lasting changes.
