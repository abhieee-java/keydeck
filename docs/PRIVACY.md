# Privacy and permissions

Keydeck has no implemented account service, analytics SDK, advertising SDK, or application backend. Its Bluetooth HID mode sends keyboard and mouse reports to the paired computer. The browser preview simulates a connection and does not transmit Bluetooth input.

## Android permissions

- **Nearby devices / BLUETOOTH_CONNECT:** inspect paired devices and connect as a keyboard/mouse.
- **BLUETOOTH_ADVERTISE:** request temporary discoverability for pairing.
- **Legacy Bluetooth permissions:** support Android versions before the Nearby devices permission model.

The app does not request contacts, microphone, camera, or location for this flow. Unused template storage and overlay permissions are explicitly removed from the Android package. Framework-generated builds may include Internet permission; this foundation has no remote application API.

Host operating system, pointer sensitivity, pointer rate, and the last successfully connected computer’s Bluetooth address are saved locally. The address is used only to restore your connection; explicit Disconnect clears it and stops automatic reconnect. Drafts, activity, and command history are held in memory and are not persisted across process restarts. Activity logs record input counts/key IDs rather than typed drafts; the command composer displays session command text. The receiving computer will receive what you send and may store it according to the app you are controlling.

Do not put sensitive text or device addresses in public issue reports. Pair only with a computer you intend to control, review the currently focused application before sending, and disconnect when finished.
