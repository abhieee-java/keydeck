import { test } from "node:test";
import assert from "node:assert/strict";
import {
  calculateDpadHat,
  DPAD_HAT,
  GAMEPAD_BUTTONS,
  PC_KEYBOARD_MAPPINGS,
} from "../src/core/gamepad";

test("calculateDpadHat returns correct hat switch directions", () => {
  assert.equal(
    calculateDpadHat(false, false, false, false),
    DPAD_HAT.CENTER,
  );
  assert.equal(calculateDpadHat(true, false, false, false), DPAD_HAT.UP);
  assert.equal(calculateDpadHat(false, true, false, false), DPAD_HAT.DOWN);
  assert.equal(calculateDpadHat(false, false, true, false), DPAD_HAT.LEFT);
  assert.equal(calculateDpadHat(false, false, false, true), DPAD_HAT.RIGHT);
  assert.equal(calculateDpadHat(true, false, false, true), DPAD_HAT.UP_RIGHT);
  assert.equal(calculateDpadHat(true, false, true, false), DPAD_HAT.UP_LEFT);
  assert.equal(
    calculateDpadHat(false, true, false, true),
    DPAD_HAT.DOWN_RIGHT,
  );
  assert.equal(calculateDpadHat(false, true, true, false), DPAD_HAT.DOWN_LEFT);
});

test("gamepad button bitmasks are distinct powers of two", () => {
  const values = Object.values(GAMEPAD_BUTTONS);
  const unique = new Set(values);
  assert.equal(unique.size, values.length);
  for (const v of values) {
    assert.equal(v & (v - 1), 0, `${v} is not a power of two`);
  }
});

test("PC keyboard mappings map keys and modifiers cleanly", () => {
  assert.deepEqual(PC_KEYBOARD_MAPPINGS.DPAD_UP, {
    modifier: 0,
    keys: [26],
  });
  assert.deepEqual(PC_KEYBOARD_MAPPINGS.A, { modifier: 0, keys: [44] });
  assert.deepEqual(PC_KEYBOARD_MAPPINGS.B, { modifier: 0, keys: [41] });
});
