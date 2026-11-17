/** Standard HID Gamepad constants, bitmasks and keyboard fallback mappings. */

export type GamepadState = {
  buttons: number; // 16-bit bitmask
  dpad: number; // 0=neutral, 1=up, 2=up-right, 3=right, 4=down-right, 5=down, 6=down-left, 7=left, 8=up-left
  leftX: number; // -127 to 127
  leftY: number; // -127 to 127
  rightX: number; // -127 to 127
  rightY: number; // -127 to 127
};

export const GAMEPAD_BUTTONS = {
  A: 1 << 0, // Cross / Action primary
  B: 1 << 1, // Circle / Cancel / Action secondary
  X: 1 << 2, // Square / Action 3
  Y: 1 << 3, // Triangle / Action 4
  L1: 1 << 4, // Left Bumper
  R1: 1 << 5, // Right Bumper
  L2: 1 << 6, // Left Trigger
  R2: 1 << 7, // Right Trigger
  SELECT: 1 << 8, // Select / Back / View
  START: 1 << 9, // Start / Menu / Options
  L3: 1 << 10, // Left Thumbstick Click
  R3: 1 << 11, // Right Thumbstick Click
  HOME: 1 << 12, // Guide / Home
} as const;

export const DPAD_HAT = {
  CENTER: 0,
  UP: 1,
  UP_RIGHT: 2,
  RIGHT: 3,
  DOWN_RIGHT: 4,
  DOWN: 5,
  DOWN_LEFT: 6,
  LEFT: 7,
  UP_LEFT: 8,
} as const;

export function calculateDpadHat(
  up: boolean,
  down: boolean,
  left: boolean,
  right: boolean,
): number {
  if (up && right) return DPAD_HAT.UP_RIGHT;
  if (up && left) return DPAD_HAT.UP_LEFT;
  if (down && right) return DPAD_HAT.DOWN_RIGHT;
  if (down && left) return DPAD_HAT.DOWN_LEFT;
  if (up) return DPAD_HAT.UP;
  if (down) return DPAD_HAT.DOWN;
  if (left) return DPAD_HAT.LEFT;
  if (right) return DPAD_HAT.RIGHT;
  return DPAD_HAT.CENTER;
}

/** PC keyboard mapping for games without native Bluetooth gamepad support. */
export const PC_KEYBOARD_MAPPINGS = {
  DPAD_UP: { modifier: 0, keys: [26] }, // 'W' (26)
  DPAD_DOWN: { modifier: 0, keys: [22] }, // 'S' (22)
  DPAD_LEFT: { modifier: 0, keys: [4] }, // 'A' (4)
  DPAD_RIGHT: { modifier: 0, keys: [7] }, // 'D' (7)
  A: { modifier: 0, keys: [44] }, // Spacebar (44)
  B: { modifier: 0, keys: [41] }, // Escape (41)
  X: { modifier: 0, keys: [29] }, // 'Z' (29)
  Y: { modifier: 0, keys: [27] }, // 'X' (27)
  L1: { modifier: 0, keys: [20] }, // 'Q' (20)
  R1: { modifier: 0, keys: [8] }, // 'E' (8)
  L2: { modifier: 2, keys: [] }, // Left Shift
  R2: { modifier: 1, keys: [] }, // Left Ctrl
  SELECT: { modifier: 0, keys: [43] }, // Tab (43)
  START: { modifier: 0, keys: [40] }, // Enter (40)
  L3: { modifier: 0, keys: [6] }, // 'C' (crouch)
  R3: { modifier: 0, keys: [25] }, // 'V' (melee)
} as const;

export const RETRO_KEYBOARD_MAPPINGS = {
  DPAD_UP: { modifier: 0, keys: [82] }, // Up Arrow (82)
  DPAD_DOWN: { modifier: 0, keys: [81] }, // Down Arrow (81)
  DPAD_LEFT: { modifier: 0, keys: [80] }, // Left Arrow (80)
  DPAD_RIGHT: { modifier: 0, keys: [79] }, // Right Arrow (79)
  A: { modifier: 0, keys: [29] }, // 'Z'
  B: { modifier: 0, keys: [27] }, // 'X'
  X: { modifier: 0, keys: [4] }, // 'A'
  Y: { modifier: 0, keys: [22] }, // 'S'
  L1: { modifier: 0, keys: [20] }, // 'Q'
  R1: { modifier: 0, keys: [8] }, // 'E'
  L2: { modifier: 2, keys: [] }, // Left Shift
  R2: { modifier: 1, keys: [] }, // Left Ctrl
  SELECT: { modifier: 0, keys: [42] }, // Backspace (42)
  START: { modifier: 0, keys: [40] }, // Enter (40)
  L3: { modifier: 0, keys: [] },
  R3: { modifier: 0, keys: [] },
} as const;
