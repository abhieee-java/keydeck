/** Demand-driven pointer batching. No interval, polling, or work while idle. */
export type PointerReport = {
  x: number;
  y: number;
  wheel: number;
  buttons: number;
};
type Clock = {
  schedule: (callback: () => void, ms: number) => unknown;
  cancel: (id: unknown) => void;
};
const realClock: Clock = {
  schedule: (callback, ms) => setTimeout(callback, ms),
  cancel: (id) => clearTimeout(id as ReturnType<typeof setTimeout>),
};
const axis = (n: number) => Math.max(-127, Math.min(127, Math.trunc(n)));
export class PointerQueue {
  private x = 0;
  private y = 0;
  private wheel = 0;
  private buttons = 0;
  private timer: unknown = null;
  private epoch = 0;
  private pending = 0;
  private chain = Promise.resolve();
  private interval = 34;
  constructor(
    private send: (report: PointerReport) => Promise<void>,
    private onError: (error: unknown) => void,
    private clock: Clock = realClock,
  ) {}
  setRate(rate: 30 | 60) {
    this.interval = Math.ceil(1000 / rate);
    this.clearTimer();
    this.schedule();
  }
  private hasMovement() {
    return (
      Math.abs(this.x) >= 1 ||
      Math.abs(this.y) >= 1 ||
      Math.abs(this.wheel) >= 1
    );
  }
  private clearTimer() {
    if (this.timer !== null) this.clock.cancel(this.timer);
    this.timer = null;
  }
  private schedule() {
    if (this.timer !== null || this.pending || !this.hasMovement()) return;
    this.timer = this.clock.schedule(() => {
      this.timer = null;
      void this.flush().catch(() => {});
    }, this.interval);
  }
  private take(): PointerReport {
    const report = {
      x: axis(this.x),
      y: axis(this.y),
      wheel: axis(this.wheel),
      buttons: this.buttons,
    };
    this.x -= report.x;
    this.y -= report.y;
    this.wheel -= report.wheel;
    return report;
  }
  private enqueue(report: PointerReport) {
    if (this.pending >= 32) {
      this.cancel();
      return Promise.reject(
        new Error("Input queue is busy. Reconnect and try again."),
      );
    }
    const epoch = this.epoch;
    this.pending++;
    const result = this.chain
      .then(async () => {
        if (epoch === this.epoch) await this.send(report);
      })
      .finally(() => {
        this.pending--;
        this.schedule();
      });
    this.chain = result.catch((error) => {
      this.cancel();
      this.onError(error);
    });
    return result;
  }
  private flush(): Promise<void> {
    this.clearTimer();
    if (!this.hasMovement()) return Promise.resolve();
    return this.enqueue(this.take());
  }
  push(x: number, y: number, buttons = 0, wheel = 0): Promise<void> {
    if (![x, y, wheel, buttons].every(Number.isFinite))
      return Promise.reject(new Error("Invalid pointer input."));
    if (buttons !== this.buttons) {
      // Preserve motion before a button boundary and never coalesce press/release.
      this.clearTimer();
      while (this.hasMovement()) void this.enqueue(this.take()).catch(() => {});
      this.buttons = buttons & 7;
      this.x += x;
      this.y += y;
      this.wheel += wheel;
      return this.enqueue(this.take());
    }
    // Bound retained motion to avoid stale movement after a stalled connection.
    this.x = Math.max(-1024, Math.min(1024, this.x + x));
    this.y = Math.max(-1024, Math.min(1024, this.y + y));
    this.wheel = Math.max(-127, Math.min(127, this.wheel + wheel));
    this.schedule();
    return Promise.resolve();
  }
  cancel() {
    this.epoch++;
    this.clearTimer();
    this.x = this.y = this.wheel = this.buttons = 0;
  }
  settled() {
    return this.chain;
  }
}
