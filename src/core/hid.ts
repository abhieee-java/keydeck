/** USB HID usage IDs. Text uses the host's US keyboard layout. */
export type KeyReport = { modifier: number; keys: number[] };
export const modifiers = { Ctrl: 1, Shift: 2, Alt: 4, Meta: 8 } as const;
export const keys = {
  Enter: 40,
  Escape: 41,
  Backspace: 42,
  Tab: 43,
  Space: 44,
  Delete: 76,
  Home: 74,
  End: 77,
  PageUp: 75,
  PageDown: 78,
  Right: 79,
  Left: 80,
  Down: 81,
  Up: 82,
  F1: 58,
  F2: 59,
  F3: 60,
  F4: 61,
  F5: 62,
  F6: 63,
  F7: 64,
  F8: 65,
  F9: 66,
  F10: 67,
  F11: 68,
  F12: 69,
} as const;
const plain = "1234567890\n\x1b\b\t -=[]\\#;'`,./";
const shifted = '!@#$%^&*()_+{}|~:"<>?';
const shiftedCodes = [
  30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 45, 46, 47, 48, 49, 53, 51, 52, 54,
  55, 56,
];
export function encodeCharacter(char: string): KeyReport {
  if (/^[a-z]$/.test(char))
    return { modifier: 0, keys: [char.charCodeAt(0) - 93] };
  if (/^[A-Z]$/.test(char))
    return { modifier: 2, keys: [char.charCodeAt(0) - 61] };
  const shift = shifted.indexOf(char);
  if (shift >= 0) return { modifier: 2, keys: [shiftedCodes[shift]] };
  const index = plain.indexOf(char);
  if (index >= 0) return { modifier: 0, keys: [30 + index] };
  throw new Error(
    `“${char}” is not supported by the US keyboard layout. Use ASCII text.`,
  );
}
export function encodeText(text: string): KeyReport[] {
  if (text.length > 2000)
    throw new Error("Send up to 2,000 characters at a time.");
  return Array.from(text, encodeCharacter);
}
export function shortcut(names: string[]): KeyReport {
  let modifier = 0;
  const codes: number[] = [];
  for (const name of names) {
    if (name in modifiers)
      modifier |= modifiers[name as keyof typeof modifiers];
    else if (name in keys) codes.push(keys[name as keyof typeof keys]);
    else if (name.length === 1) {
      const r = encodeCharacter(name.toLowerCase());
      codes.push(...r.keys);
      modifier |= r.modifier;
    } else throw new Error(`Unknown key: ${name}`);
  }
  if (codes.length > 6) throw new Error("A shortcut supports up to six keys.");
  return { modifier, keys: codes };
}
export const clampAxis = (n: number) =>
  Math.max(-127, Math.min(127, Math.round(n)));
