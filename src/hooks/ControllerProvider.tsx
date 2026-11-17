import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { AppState, BackHandler, useWindowDimensions } from "react-native";
import { router, usePathname } from "expo-router";
import {
  Copy,
  ArrowDownLeft,
  ArrowUpRight,
  Monitor,
} from "lucide-react-native";
import {
  Connection,
  createTransport,
  Device,
  nativeHid,
} from "../core/transport";
import { shortcut } from "../core/hid";
import { usePreferences } from "./usePreferences";
export type Tab = "Overview" | "Touchpad" | "Keyboard" | "Console" | "Settings";
const routes = {
  Overview: "/",
  Touchpad: "/touchpad",
  Keyboard: "/keyboard",
  Console: "/console",
  Settings: "/settings",
} as const;
function useController() {
  const { width } = useWindowDimensions();
  const wide = width >= 1000;
  const medium = width >= 720;
  const path = usePathname();
  const tab: Tab =
    path === "/touchpad"
      ? "Touchpad"
      : path === "/keyboard"
        ? "Keyboard"
        : path === "/console"
          ? "Console"
          : path === "/settings"
            ? "Settings"
            : "Overview";
  const setTab = (value: Tab) => router.navigate(routes[value]);
  const [preview, setPreviewValue] = useState(!nativeHid);
  const [connection, setConnection] = useState<Connection>({ status: "idle" });
  const [devices, setDevices] = useState<Device[]>([]);
  const [activity, setActivity] = useState<string[]>([
    "Controller initialized",
  ]);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const [showDevices, setShowDevices] = useState(false);
  const [draft, setDraft] = useState("");
  const [command, setCommand] = useState("");
  const {
    preferences,
    update: updatePreferences,
    warning: preferenceWarning,
  } = usePreferences();
  const { sensitivity, host, pointerRate } = preferences;
  const setSensitivity = (value: number) =>
    updatePreferences({ sensitivity: value });
  const setHost = (value: "Windows" | "macOS" | "Linux") =>
    updatePreferences({ host: value });
  const setPointerRate = (value: 30 | 60) =>
    updatePreferences({ pointerRate: value });
  const [history, setHistory] = useState<string[]>([]);
  const log = useCallback(
    (message: string) => setActivity((a) => [message, ...a].slice(0, 8)),
    [],
  );
  const transport = useMemo(
    () => createTransport(preview, log),
    [preview, log],
  );
  useEffect(() => {
    transport.setPointerRate(pointerRate);
  }, [transport, pointerRate]);
  const connected = connection.status === "connected";
  const setPreview = useCallback((value: boolean) => {
    setConnection({ status: "idle" });
    setDevices([]);
    setPreviewValue(value);
  }, []);
  useEffect(() => {
    const off = transport.subscribe((state) => {
      setConnection(state);
      if (state.message) setError(state.message);
      else if (state.status === "connected") {
        setError("");
        setNotice("");
      }
    });
    return () => {
      off();
      transport.dispose();
    };
  }, [transport]);
  useEffect(() => {
    void transport.release().catch(() => {});
  }, [tab, showDevices, transport]);
  useEffect(() => {
    const sub = AppState.addEventListener("change", (state) => {
      if (state === "active") {
        void transport
          .resume()
          .catch((e) => setError(e instanceof Error ? e.message : String(e)));
      } else if (state === "background") {
        void transport.suspend().catch(() => {});
        setNotice("Input paused while the app is in the background.");
      } else void transport.release().catch(() => {});
    });
    // Recover an already-connected Android HID host after JS mounts/reloads.
    void transport.resume().catch(() => {});
    return () => sub.remove();
  }, [transport]);
  useEffect(() => {
    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      if (showDevices) {
        setShowDevices(false);
        return true;
      }
      if (tab !== "Overview") {
        setTab("Overview");
        return true;
      }
      return false;
    });
    return () => sub.remove();
  }, [showDevices, tab]);
  useEffect(() => {
    if (connection.status !== "connecting") return;
    const timer = setTimeout(() => {
      setError(
        "Connection timed out. Check Bluetooth on the computer and try again.",
      );
      void transport.disconnect().catch(() => {});
    }, 15000);
    return () => clearTimeout(timer);
  }, [connection.status, transport]);
  const run = useCallback(async (action: () => Promise<void>) => {
    setError("");
    try {
      await action();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  }, []);
  async function openDevices() {
    setShowDevices(true);
    setBusy(true);
    await run(async () => {
      await transport.initialize();
      setDevices(await transport.devices());
    });
    setBusy(false);
  }
  async function connect(device: Device) {
    setBusy(true);
    await run(async () => {
      await transport.connect(device.id);
    });
    setBusy(false);
  }
  const key = (names: string[]) => run(() => transport.key(shortcut(names)));
  const mouse = useCallback(
    (x: number, y: number, buttons = 0, wheel = 0) =>
      run(() => transport.mouse(x, y, buttons, wheel)),
    [run, transport],
  );
  const mainModifier = host === "macOS" ? "Meta" : "Ctrl";
  const shortcuts = [
    { label: "Copy", keys: [mainModifier, "c"], icon: Copy },
    { label: "Paste", keys: [mainModifier, "v"], icon: ArrowDownLeft },
    {
      label: "Switch app",
      keys: [host === "macOS" ? "Meta" : "Alt", "Tab"],
      icon: ArrowUpRight,
    },
    {
      label: "Show desktop",
      keys: host === "macOS" ? ["Meta", "F3"] : ["Meta", "d"],
      icon: Monitor,
    },
  ];
  return {
    width,
    wide,
    medium,
    tab,
    setTab,
    preview,
    setPreview,
    connection,
    setConnection,
    devices,
    activity,
    error,
    setError,
    notice,
    setNotice,
    busy,
    setBusy,
    showDevices,
    setShowDevices,
    draft,
    setDraft,
    command,
    setCommand,
    sensitivity,
    setSensitivity,
    pointerRate,
    setPointerRate,
    preferenceWarning,
    host,
    setHost,
    history,
    setHistory,
    transport,
    connected,
    run,
    openDevices,
    connect,
    key,
    mouse,
    shortcuts,
  };
}
const ControllerContext = createContext<ReturnType<
  typeof useController
> | null>(null);
export function ControllerProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const controller = useController();
  return (
    <ControllerContext.Provider value={controller}>
      {children}
    </ControllerContext.Provider>
  );
}
export function useSession() {
  const session = useContext(ControllerContext);
  if (!session) throw new Error("ControllerProvider is required.");
  return session;
}
