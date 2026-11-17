import { test } from "node:test";
import assert from "node:assert/strict";
import {
  createTransportCore,
  Connection,
  NativeHid,
} from "../src/core/transportCore";
function harness() {
  let state: Connection = { status: "ready", revision: 1 };
  let callback: (s: Connection) => void = () => {};
  const events: Connection[] = [];
  let releases = 0,
    closes = 0,
    sent = 0;
  const native: NativeHid = {
    initialize: async () => state,
    getConnectionState: async () => state,
    getDevices: async () => [],
    connect: async (id) => ({
      status: "connecting",
      device: { id, name: "PC" },
      revision: 2,
    }),
    disconnect: async () => ({ status: "ready", revision: 10 }),
    makeDiscoverable: async () => {},
    release: async () => {
      releases++;
    },
    suspendSession: async () => {
      closes++;
    },
    sendKey: async () => {
      sent++;
    },
    sendText: async () => {
      sent++;
    },
    sendMouse: async () => {
      sent++;
    },
    addListener: (_, fn) => {
      callback = fn;
      return { remove() {} };
    },
  };
  const transport = createTransportCore(
    false,
    () => {},
    native,
    async () => {},
  );
  transport.subscribe((s) => events.push(s));
  return {
    transport,
    native,
    events,
    set: (s: Connection) => {
      state = s;
    },
    emit: (s: Connection) => {
      state = s;
      callback(s);
    },
    counts: () => ({ releases, closes, sent }),
  };
}
const active: Connection = {
  status: "connected",
  device: { id: "pc", name: "PC" },
  revision: 5,
};
test("recovers a host connected before the JS listener mounted", async () => {
  const h = harness();
  h.set(active);
  await h.transport.resume();
  await h.transport.key({ modifier: 0, keys: [4] });
  assert.equal(h.events.at(-1)?.status, "connected");
  assert.equal(h.counts().sent, 1);
});
test("a late initialization snapshot cannot overwrite a newer connected event", async () => {
  const h = harness();
  h.native.initialize = async () => {
    h.emit(active);
    return { status: "ready", revision: 3 };
  };
  await h.transport.initialize();
  assert.equal(h.events.at(-1)?.status, "connected");
  await h.transport.text("a");
  assert.equal(h.counts().sent, 1);
});
test("backgrounding releases input without tearing down pairing and resumes actual connection", async () => {
  const h = harness();
  h.emit(active);
  await h.transport.suspend();
  assert.equal(h.events.at(-1)?.status, "paused");
  await assert.rejects(h.transport.text("a"), /Connect a computer/);
  assert.deepEqual(h.counts(), { releases: 1, closes: 0, sent: 0 });
  await h.transport.resume();
  await h.transport.text("a");
  assert.equal(h.events.at(-1)?.status, "connected");
});
test("foreground refresh clears a stale connected host after radio loss", async () => {
  const h = harness();
  h.emit(active);
  h.set({ status: "idle", revision: 6 });
  await h.transport.resume();
  assert.equal(h.events.at(-1)?.status, "idle");
  await assert.rejects(h.transport.text("a"), /Connect a computer/);
});
test("failed duplicate connect retains a confirmed host instead of inventing ready", async () => {
  const h = harness();
  h.emit(active);
  h.native.connect = async () => {
    throw new Error("already connected");
  };
  await assert.rejects(h.transport.connect("pc"), /already connected/);
  assert.equal(h.events.at(-1)?.status, "connected");
});
test("registration failure disables input and permits a later retry", async () => {
  const h = harness();
  h.emit(active);
  h.native.initialize = async () => {
    throw new Error("Bluetooth disabled");
  };
  await assert.rejects(h.transport.initialize(), /Bluetooth disabled/);
  assert.equal(h.events.at(-1)?.status, "error");
  await assert.rejects(h.transport.text("a"), /Connect a computer/);
  h.native.initialize = async () => ({ status: "ready", revision: 6 });
  await h.transport.initialize();
  assert.equal(h.events.at(-1)?.status, "ready");
});
test("connect waits for registration and stays connecting until Android confirms", async () => {
  const h = harness();
  let ready!: () => void;
  h.native.initialize = () =>
    new Promise((resolve) => {
      ready = () => resolve({ status: "ready", revision: 1 });
    });
  const pending = h.transport.connect("pc");
  await Promise.resolve();
  assert.equal(h.events.at(-1)?.status, "idle");
  ready();
  await pending;
  assert.equal(h.events.at(-1)?.status, "connecting");
  await assert.rejects(h.transport.text("a"), /Connect a computer/);
  h.emit(active);
  await h.transport.text("a");
});
