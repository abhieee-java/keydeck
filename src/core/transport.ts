import { Platform, PermissionsAndroid } from "react-native";
import { requireOptionalNativeModule } from "expo";
import { encodeText, KeyReport } from "./hid";
import { PointerQueue } from "./pointer";

export type Device = { id: string; name: string };
export type Connection = {
  status: "idle" | "ready" | "connecting" | "connected" | "error";
  device?: Device;
  message?: string;
};
export type HidTransport = {
  initialize(): Promise<void>;
  devices(): Promise<Device[]>;
  connect(id: string): Promise<void>;
  disconnect(): Promise<void>;
  discoverable(): Promise<void>;
  key(report: KeyReport): Promise<void>;
  text(value: string, enter?: boolean): Promise<void>;
  mouse(x: number, y: number, buttons?: number, wheel?: number): Promise<void>;
  release(): Promise<void>;
  suspend(): Promise<void>;
  setPointerRate(rate: 30 | 60): void;
  subscribe(fn: (state: Connection) => void): () => void;
  dispose(): void;
};
export const nativeHid =
  Platform.OS === "android"
    ? requireOptionalNativeModule("BluetoothHid")
    : null;
export function createTransport(
  preview: boolean,
  log: (message: string) => void,
): HidTransport {
  let listener: (s: Connection) => void = () => {};
  let connected = false;
  let cancelled = false;
  let generation = 0;
  let subscription: { remove(): void } | undefined;
  let queue = Promise.resolve();
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
        await nativeHid.sendMouse(
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
      listener({
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
        listener({ status: "ready" });
        return;
      }
      if (!nativeHid)
        throw new Error(
          "Bluetooth needs a custom Android build. Use preview mode to explore the controls.",
        );
      if (Number(Platform.Version) >= 31) {
        const result = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_ADVERTISE,
        ]);
        if (Object.values(result).some((v) => v !== "granted"))
          throw new Error(
            "Allow Nearby devices in Android Settings, then try again.",
          );
      }
      subscription?.remove();
      subscription = nativeHid.addListener("onConnection", (s: Connection) => {
        if (s.status !== "connected") {
          generation++;
          pointer.cancel();
        }
        connected = s.status === "connected";
        listener(s);
      });
      await nativeHid.initialize();
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
      listener({ status: "connecting" });
      if (preview) {
        connected = true;
        listener({
          status: "connected",
          device: { id, name: "Studio computer" },
        });
        log("Preview connected · input stays on this device");
      } else {
        try {
          await nativeHid.connect(id);
        } catch (error) {
          listener({ status: "ready" });
          throw error;
        }
      }
    },
    async disconnect() {
      generation++;
      pointer.cancel();
      await pointer.settled();
      connected = false;
      if (!preview && nativeHid) await nativeHid.disconnect();
      listener({ status: "ready" });
    },
    key(report) {
      return enqueue(async () => {
        if (!preview) await nativeHid.sendKey(report.modifier, report.keys);
        log(`Key report · ${report.keys.join(", ")}`);
      });
    },
    text(value, enter = false) {
      // Validate the entire message before sending any part of it.
      const reports = encodeText(value);
      if (enter) reports.push({ modifier: 0, keys: [40] });
      return enqueue(async () => {
        if (!preview) await nativeHid.sendText(reports);
        log(
          `${preview ? "Previewed" : "Sent"} ${value.length} characters${enter ? " + Enter" : ""}`,
        );
      });
    },
    async mouse(x, y, buttons = 0, wheel = 0) {
      demand();
      await pointer.push(x, y, buttons, wheel);
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
      generation++;
      pointer.cancel();
      await pointer.settled();
      connected = false;
      if (!preview && nativeHid) await nativeHid.suspendSession();
      listener({ status: "idle" });
    },
    subscribe(fn) {
      cancelled = false;
      listener = fn;
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
