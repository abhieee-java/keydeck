import { test } from "node:test";
import assert from "node:assert/strict";
import { PointerQueue, PointerReport } from "../src/core/pointer";
function harness(send?: (r: PointerReport) => Promise<void>) {
  let next = 0;
  const timers = new Map<number, () => void>();
  const reports: PointerReport[] = [];
  const errors: unknown[] = [];
  const queue = new PointerQueue(
    send ||
      (async (r) => {
        reports.push(r);
      }),
    (e) => errors.push(e),
    {
      schedule: (callback) => {
        timers.set(++next, callback);
        return next;
      },
      cancel: (id) => {
        timers.delete(id as number);
      },
    },
  );
  const tick = async () => {
    const callbacks = [...timers.values()];
    timers.clear();
    callbacks.forEach((fn) => fn());
    await queue.settled();
  };
  return { queue, timers, reports, errors, tick };
}
test("pointer is idle until input and coalesces a burst into one report", async () => {
  const h = harness();
  assert.equal(h.timers.size, 0);
  for (let i = 0; i < 50; i++) await h.queue.push(1, 1);
  assert.equal(h.timers.size, 1);
  await h.tick();
  assert.deepEqual(h.reports, [{ x: 50, y: 50, buttons: 0, wheel: 0 }]);
  assert.equal(h.timers.size, 0);
});
test("fractional scroll accumulates instead of disappearing", async () => {
  const h = harness();
  for (let i = 0; i < 4; i++) await h.queue.push(0, 0, 0, 0.3);
  await h.tick();
  assert.equal(h.reports[0].wheel, 1);
  assert.equal(h.timers.size, 0);
});
test("click boundaries remain ordered behind earlier movement", async () => {
  const h = harness();
  await h.queue.push(8, 3);
  await h.queue.push(0, 0, 1);
  await h.queue.push(0, 0, 0);
  await h.queue.settled();
  assert.deepEqual(
    h.reports.map((r) => [r.x, r.y, r.buttons]),
    [
      [8, 3, 0],
      [0, 0, 1],
      [0, 0, 0],
    ],
  );
});
test("background cancellation drops queued movement and timers", async () => {
  const h = harness();
  await h.queue.push(20, 20);
  h.queue.cancel();
  await h.tick();
  assert.equal(h.reports.length, 0);
  assert.equal(h.timers.size, 0);
});
test("slow native bridge has only one in-flight movement report", async () => {
  let finish: () => void = () => {};
  let sends = 0;
  const h = harness(async () => {
    sends++;
    await new Promise<void>((resolve) => {
      finish = resolve;
    });
  });
  await h.queue.push(1, 0);
  const ticking = h.tick();
  await Promise.resolve();
  for (let i = 0; i < 20; i++) await h.queue.push(1, 0);
  assert.equal(sends, 1);
  assert.equal(h.timers.size, 0);
  finish();
  await ticking;
  assert.equal(h.timers.size, 1);
  h.queue.cancel();
});
test("native failures cancel residual motion and report recovery", async () => {
  const h = harness(async () => {
    throw new Error("Radio lost");
  });
  await h.queue.push(3, 0);
  await h.tick();
  assert.equal(h.errors.length, 1);
  assert.equal(h.timers.size, 0);
});

test("large pending movement retains its button state before a click", async () => {
  const h = harness();
  await h.queue.push(300, 0);
  await h.queue.push(0, 0, 1);
  await h.queue.settled();
  assert.equal(
    h.reports.filter((r) => r.buttons === 0).reduce((sum, r) => sum + r.x, 0),
    300,
  );
  assert.equal(h.reports.at(-1)?.buttons, 1);
  assert.equal(h.reports.at(-1)?.x, 0);
});
