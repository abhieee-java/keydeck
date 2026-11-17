import { test } from "node:test";
import assert from "node:assert/strict";
import { defaults, parsePreferences } from "../src/core/preferences";
test("invalid or missing stored preferences fall back safely", () => {
  assert.deepEqual(parsePreferences(null), defaults);
  assert.deepEqual(parsePreferences("broken"), defaults);
  assert.deepEqual(
    parsePreferences('{"host":"unknown","sensitivity":999,"pointerRate":1000}'),
    defaults,
  );
});
test("only supported preferences are restored", () => {
  assert.deepEqual(
    parsePreferences(
      '{"host":"macOS","sensitivity":0.75,"pointerRate":60,"command":"private"}',
    ),
    { host: "macOS", sensitivity: 0.75, pointerRate: 60 },
  );
});
