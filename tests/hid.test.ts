import { test } from "node:test";
import assert from "node:assert/strict";
import {
  encodeText,
  encodeCharacter,
  shortcut,
  clampAxis,
} from "../src/core/hid";
test("letters, spaces and Enter encode to USB HID usages", () => {
  assert.deepEqual(encodeText("aA \n"), [
    { modifier: 0, keys: [4] },
    { modifier: 2, keys: [4] },
    { modifier: 0, keys: [44] },
    { modifier: 0, keys: [40] },
  ]);
});
test("all printable ASCII characters can be encoded", () => {
  for (let code = 32; code <= 126; code++) {
    const report = encodeCharacter(String.fromCharCode(code));
    assert.ok(report.keys[0] >= 4 && report.keys[0] <= 56);
  }
  assert.deepEqual(encodeText("@_?"), [
    { modifier: 2, keys: [31] },
    { modifier: 2, keys: [45] },
    { modifier: 2, keys: [56] },
  ]);
});
test("rejects unsupported text before any input is transmitted", () => {
  assert.throws(() => encodeText("hello नमस्ते"), /not supported/);
  assert.throws(() => encodeText("x".repeat(2001)), /2,000/);
});
test("chords combine modifiers and preserve special key usages", () => {
  assert.deepEqual(shortcut(["Ctrl", "Alt", "Delete"]), {
    modifier: 5,
    keys: [76],
  });
  assert.deepEqual(shortcut(["Meta", "c"]), { modifier: 8, keys: [6] });
  assert.throws(() => shortcut(["Invalid"]), /Unknown key/);
});
test("mouse deltas fit signed HID bytes", () => {
  assert.equal(clampAxis(200), 127);
  assert.equal(clampAxis(-1000), -127);
  assert.equal(clampAxis(1.6), 2);
});
