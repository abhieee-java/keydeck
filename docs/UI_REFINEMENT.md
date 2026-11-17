# UI refinement

Built on commit `78beaf0` and its Bluetooth protocol, held-key, gaming, and expanded touchpad additions. Native Bluetooth code is unchanged in this refinement.

## Interaction decisions

- **Clear next action:** the disconnected home explains what to do and puts Connect before the touch surface. Shorter headings and spacing keep the main controls higher on a phone.
- **Recognition over recall:** Gamepad is named for its function. Each mode explains its intended use; selected mode is both visually distinct and exposed to assistive technology.
- **Progressive disclosure:** paired-device selection comes first; new pairing instructions appear when needed. Preview does not offer irrelevant Bluetooth discovery. Terminal commands remain reachable under Keyboard.
- **Prevent mistakes:** disconnected game controls cannot accept input or suggest successful interaction. Mode switching retains the existing input-release behavior. Release all stays available during a session.
- **Comfortable targets:** game controls and mode selectors use at least 48-unit targets. Narrow displays wrap shoulder controls and stack the two gamepad sections instead of overflowing.
- **Consistent visual hierarchy:** restrained dark surfaces, one accent, system typography, and concise copy. Redundant promotional blocks are removed. No looping animation or new dependency was added.
- **Visible recovery:** pairing errors remain in the sheet; drafts survive failed sends; connection access remains reachable from the expanded touchpad.

These are design principles applied to the interface, not claims from a user study.

## Verification

- Lint, TypeScript, 27 core tests, and 9 browser interaction tests pass.
- Production web export succeeds. Restored the web/export/UI-test scripts required by the existing CI workflow.
- Visually inspected 320px and 390px phone layouts and a 1440px desktop layout.
- Tested connection simulation, failed input recovery, saved preferences, route/draft retention, background restoration, gamepad input gating, selected mode semantics, and expanded touchpad navigation.
- Real Android font scaling, TalkBack, Bluetooth hardware, and game-controller compatibility still need device testing. Browser preview is not a physical Bluetooth test.
