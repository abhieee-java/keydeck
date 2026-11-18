import { encodeText, KeyReport } from "./hid";
import { PointerQueue } from "./pointer";

export type Device = { id: string; name: string; isComputer?: boolean };
export type Connection = {
  status: "idle" | "ready" | "connecting" | "connected" | "paused" | "error";
  revision?: number;
  device?: Device;
  message?: string;
};
export type GamepadReport = {
  buttons: number;
  leftX?: number;
  leftY?: number;
  rightX?: number;
  rightY?: number;
  dpad?: number;
};
export type HidTransport = {
  initialize(): Promise<void>;
  devices(): Promise<Device[]>;
  connect(id: string): Promise<void>;
  disconnect(forget?: boolean): Promise<void>;
  discoverable(): Promise<void>;
  key(report: KeyReport): Promise<void>;
  keyboardReport(modifier: number, keys: number[]): Promise<void>;
  text(value: string, enter?: boolean): Promise<void>;
  mouse(x: number, y: number, buttons?: number, wheel?: number): Promise<void>;
  gamepad(report: GamepadReport): Promise<void>;
  release(): Promise<void>;
  suspend(): Promise<void>;
  resume(): Promise<void>;
  setPointerRate(rate: 30 | 60): void;
  subscribe(fn: (state: Connection) => void): () => void;
  dispose(): void;
};
export type NativeHid = {
  initialize(): Promise<Connection>;
  getConnectionState(): Promise<Connection>;
  getDevices(): Promise<Device[]>;
  connect(id: string): Promise<Connection>;
  disconnect(forget: boolean): Promise<Connection>;
  makeDiscoverable(): Promise<void>;
  release(): Promise<void>;
  suspendSession(): Promise<void>;
  sendKey(modifier: number, keys: number[]): Promise<void>;
  sendKeyboardReport(modifier: number, keys: number[]): Promise<void>;
  sendText(reports: KeyReport[]): Promise<void>;
  sendMouse(
    x: number,
    y: number,
    buttons: number,
    wheel: number,
  ): Promise<void>;
  sendGamepad(
    buttons: number,
    leftX: number,
    leftY: number,
    rightX: number,
    rightY: number,
    dpad: number,
  ): Promise<void>;
  addListener(
    name: string,
    listener: (s: Connection) => void,
  ): { remove(): void };
};
export function createTransportCore(
  preview: boolean,
  log: (message: string) => void,
  nativeHid: NativeHid | null,
  requestPermissions: () => Promise<void>,
  hasPermissions: () => Promise<boolean> = async () => true,
): HidTransport {
  let listener: (s: Connection) => void = () => {};
  let connected = false;
  let paused = false;
  let revision = -1;
  let current: Connection = { status: "idle" };
  let initializing: Promise<void> | undefined;
  let cancelled = false;
  let generation = 0;
  let subscription: { remove(): void } | undefined;
  let queue = Promise.resolve();
  const accept = (state: Connection) => {
    if (
      cancelled ||
      (state.revision !== undefined && state.revision < revision)
    )
      return;
    if (state.revision !== undefined) revision = state.revision;
    current = state;
    connected = !paused && state.status === "connected";
    if (!connected) {
      generation++;
      pointer.cancel();
    }
    listener(paused ? { ...state, status: "paused" } : state);
  };
  const listen = () => {
    if (!preview && nativeHid && !subscription)
      subscription = nativeHid.addListener("onConnection", accept);
  };
  const demand = () => {
    if (!connected) throw new Error("Connect a computer before sending input.");
  };
  const enqueue = (action: () => Promise<void>) => {
    const current = generation;
    const result = queue.then(() => {
      if (current !== generation)
        throw new Error("Input interrupted. Please retry.");
      if (cancelled) throw new Error("Controller has closed.");
      demand();
      return action();
    });
    queue = result.catch(() => {});
    return result;
  };
  const pointer = new PointerQueue(
    async (report) => {
      demand();
      if (!preview)
        await nativeHid!.sendMouse(
          report.x,
          report.y,
          report.buttons,
          report.wheel,
        );
    },
    (error) => {
      connected = false;
      generation++;
      if (!preview && nativeHid) nativeHid.suspendSession().catch(() => {});
      accept({
        status: "error",
        message:
          error instanceof Error
            ? error.message
            : "Pointer input stopped. Reconnect to continue.",
      });
    },
  );
  const api: HidTransport = {
    async initialize() {
      if (preview) {
        if (current.status !== "connected") accept({ status: "ready" });
        return;
      }
      if (!nativeHid)
        throw new Error(
          "Bluetooth needs a custom Android build. Use preview mode to explore the controls.",
        );
      if (!initializing) {
        initializing = (async () => {
          await requestPermissions();
          listen();
          accept(await nativeHid.initialize());
        })()
          .catch((error) => {
            accept({
              status: "error",
              message: error instanceof Error ? error.message : String(error),
            });
            throw error;
          })
          .finally(() => {
            initializing = undefined;
          });
      }
      return initializing;
    },
    async devices() {
      return preview
        ? [{ id: "preview", name: "Studio computer" }]
        : (nativeHid?.getDevices() ?? []);
    },
    async discoverable() {
      if (preview) {
        log("Preview device is ready to connect.");
        return;
      }
      if (!nativeHid)
        throw new Error("Bluetooth needs a custom Android build.");
      await nativeHid.makeDiscoverable();
    },
    async connect(id) {
      paused = false;
      await api.initialize();
      if (preview) {
        accept({
          status: "connected",
          device: { id, name: "Studio computer" },
        });
        log("Preview connected · input stays on this device");
      } else if (nativeHid) {
        try {
          accept(await nativeHid.connect(id));
        } catch (error) {
          // A failed/duplicate connect must not fabricate a disconnected state.
          accept(await nativeHid.getConnectionState());
          throw error;
        }
      }
    },
    async disconnect(forget = true) {
      generation++;
      pointer.cancel();
      await pointer.settled();
      paused = false;
      if (!preview && nativeHid) accept(await nativeHid.disconnect(forget));
      else accept({ status: "ready" });
    },
    key(report) {
      return enqueue(async () => {
        if (!preview) await nativeHid!.sendKey(report.modifier, report.keys);
        log(`Key report · ${report.keys.join(", ")}`);
      });
    },
    keyboardReport(modifier, keys) {
      const validKeys = (keys ?? []).filter((code) => code > 0).slice(0, 6);
      return enqueue(async () => {
        if (!preview) await nativeHid!.sendKeyboardReport(modifier, validKeys);
        log(`KeyReport · mod: ${modifier} keys: [${validKeys.join(", ")}]`);
      });
    },
    text(value, enter = false) {
      // Validate the entire message before sending any part of it.
      const reports = encodeText(value);
      if (enter) reports.push({ modifier: 0, keys: [40] });
      return enqueue(async () => {
        if (!preview) await nativeHid!.sendText(reports);
        log(
          `${preview ? "Previewed" : "Sent"} ${value.length} characters${enter ? " + Enter" : ""}`,
        );
      });
    },
    async mouse(x, y, buttons = 0, wheel = 0) {
      demand();
      await pointer.push(x, y, buttons, wheel);
    },
    gamepad(report) {
      const buttons = report.buttons ?? 0;
      const leftX = report.leftX ?? 0;
      const leftY = report.leftY ?? 0;
      const rightX = report.rightX ?? 0;
      const rightY = report.rightY ?? 0;
      const dpad = report.dpad ?? 0;
      return enqueue(async () => {
        if (!preview) {
          await nativeHid!.sendGamepad(
            buttons,
            leftX,
            leftY,
            rightX,
            rightY,
            dpad,
          );
        }
        log(`Gamepad · buttons: 0x${buttons.toString(16)} dpad: ${dpad}`);
      });
    },
    setPointerRate(rate) {
      pointer.setRate(rate);
    },
    async release() {
      generation++;
      pointer.cancel();
      await pointer.settled();
      if (connected && !preview && nativeHid) await nativeHid.release();
    },
    async suspend() {
      paused = true;
      generation++;
      pointer.cancel();
      connected = false;
      listener({ ...current, status: "paused" });
      await pointer.settled();
      if (!preview && nativeHid) await nativeHid.release();
    },
    async resume() {
      paused = false;
      listen();
      if (preview) {
        accept(current);
        return;
      }
      if (!nativeHid) return;
      // A new native module has no HID proxy until initialize opens the service.
      // Do not show permission dialogs automatically on first launch or denial.
      if (await hasPermissions()) await api.initialize();
      else accept({ status: "idle" });
    },
    subscribe(fn) {
      cancelled = false;
      listener = fn;
      listen();
      listener(paused ? { ...current, status: "paused" } : current);
      return () => {
        listener = () => {};
      };
    },
    dispose() {
      pointer.cancel();
      cancelled = true;
      connected = false;
      subscription?.remove();
      if (!preview && nativeHid)
        pointer
          .settled()
          .then(() => nativeHid.suspendSession())
          .catch(() => {});
    },
  };
  return api;
}
