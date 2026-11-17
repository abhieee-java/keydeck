# Changelog

## 0.1.1 — Bluetooth connection recovery

- Preserve connected state when Android registration callbacks arrive late.
- Reconcile the actual HID host on startup, refresh, and foreground return.
- Release input during pairing dialogs without forcibly unregistering Bluetooth.
- Wait for registration before connecting; ignore stale connection snapshots.
- Use actual connection status in the header and label only the active device as connected.
- Keep the original package/signing identity and increase Android version code to 2 for in-place updates.

## 0.1.0 — initial preview

[Signed APK and release notes](https://github.com/abhieee-java/keydeck/releases/tag/v0.1.0)

- Android Bluetooth HID keyboard and mouse module
- Touchpad, text input, keyboard shortcuts, and command composer
- Expo Router workspace with shared connection and draft state
- Local browser preview mode and automated tests
- GitHub build checks, APK release signing workflow, installation and contributor documentation

- Refined dark mobile interface, pairing sheet, launcher identity, and accessible alternative pointer controls
- Demand-driven 30/60 Hz pointer batching, ordered button transitions, cancellable text, and background suspension
- Locally persisted host and pointer preferences without persisting drafts

Hardware compatibility and battery measurements remain pending. Bidirectional console support requires a future companion.
