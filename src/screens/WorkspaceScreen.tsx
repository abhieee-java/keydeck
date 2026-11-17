import React from "react";
import { useSession, Tab } from "../hooks/ControllerProvider";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  ArrowUpRight,
  Bluetooth,
  Check,
  ChevronRight,
  CircleHelp,
  Command,
  CornerDownLeft,
  Keyboard,
  Laptop,
  Link2,
  MousePointer2,
  Plus,
  RefreshCw,
  Send,
  Settings2,
  Terminal,
  Unplug,
  X,
} from "lucide-react-native";
import { Button, IconButton, Label, Panel, s } from "../components/ui";
import { Touchpad } from "../components/Touchpad";
import { ShortcutComposer } from "../components/ShortcutComposer";
import { mono, theme as t } from "../theme";

const tabs = [
  { name: "Overview", icon: Command },
  { name: "Touchpad", icon: MousePointer2 },
  { name: "Keyboard", icon: Keyboard },
  { name: "Console", icon: Terminal },
] as const;
export default function WorkspaceScreen() {
  const {
    wide,
    medium,
    tab,
    setTab,
    preview,
    setPreview,
    connection,
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
  } = useSession();
  const nav = (item: { name: Tab; icon: typeof Command }) => (
    <Pressable
      key={item.name}
      accessibilityRole="button"
      accessibilityState={{ selected: tab === item.name }}
      onPress={() => {
        setTab(item.name);
        setShowDevices(false);
      }}
      style={[
        styles.nav,
        !wide && !medium && { flexDirection: "column", gap: 5 },
        tab === item.name && styles.navActive,
        !wide && { flex: 1, paddingHorizontal: 8, justifyContent: "center" },
      ]}
    >
      <item.icon size={19} color={tab === item.name ? t.accent : t.muted} />
      {(wide || medium) && (
        <Text
          style={[styles.navText, tab === item.name && { color: t.accent }]}
        >
          {item.name}
        </Text>
      )}
      {!wide && !medium && (
        <Text
          style={{ fontSize: 9, color: tab === item.name ? t.accent : t.muted }}
        >
          {item.name}
        </Text>
      )}
      {wide && tab === item.name && <View style={styles.smallDot} />}
    </Pressable>
  );
  const touchpad = (
    <Panel style={{ flex: 1 }}>
      <View
        style={[s.row, { justifyContent: "space-between", marginBottom: 22 }]}
      >
        <View style={s.row}>
          <MousePointer2 size={19} color={t.accent} />
          <Text style={styles.panelTitle}>Touchpad</Text>
        </View>
        <View style={styles.tag}>
          <Text style={styles.tagText}>RELATIVE MODE</Text>
        </View>
      </View>
      <Touchpad
        key={`${connected}-${tab}`}
        enabled={connected}
        send={mouse}
        sensitivity={sensitivity}
      />
    </Panel>
  );
  const shortcutsPanel = (
    <Panel>
      <View
        style={[s.row, { justifyContent: "space-between", marginBottom: 20 }]}
      >
        <Text style={styles.panelTitle}>Quick actions</Text>
        <Command size={17} color={t.muted} />
      </View>
      <View style={styles.shortcuts}>
        {shortcuts.map((item) => (
          <Pressable
            key={item.label}
            accessibilityRole="button"
            accessibilityState={{ disabled: !connected }}
            disabled={!connected}
            onPress={() => void key(item.keys)}
            style={({ pressed }) => [
              styles.shortcut,
              { opacity: connected ? (pressed ? 0.65 : 1) : 0.45 },
            ]}
          >
            <item.icon size={19} color={t.text} />
            <Text style={styles.shortcutLabel}>{item.label}</Text>
            <Text style={styles.shortcutKeys}>
              {item.keys.join(" + ").toUpperCase()}
            </Text>
          </Pressable>
        ))}
      </View>
    </Panel>
  );
  return (
    <SafeAreaView style={styles.root}>
      <StatusBar style="light" />
      <View style={styles.shell}>
        {wide && (
          <View style={styles.sidebar}>
            <View style={styles.brand}>
              <View style={styles.logo}>
                <Command size={23} color={t.dark} />
              </View>
              <View>
                <Text style={styles.brandName}>
                  keydeck<Text style={{ color: t.accent }}>.</Text>
                </Text>
                <Text style={styles.brandCaption}>YOUR PHONE. IN CONTROL.</Text>
              </View>
            </View>
            <Label>Workspace</Label>
            <View style={{ gap: 6, marginTop: 15 }}>{tabs.map(nav)}</View>
            <View style={styles.sidebarBottom}>
              <View style={styles.asciiCard}>
                <Text style={styles.ascii}>
                  {
                    "  ┌───────────┐\n  │  >_       │\n  │     ░░░   │\n  └─────┬─────┘\n      ──┴──"
                  }
                </Text>
                <Text style={styles.asciiTitle}>
                  Less hardware.
                  <Text style={{ color: t.accent }}>
                    {"\n"}More possibility.
                  </Text>
                </Text>
                <Text style={s.body}>Your whole desk, in your pocket.</Text>
              </View>
              {nav({ name: "Settings", icon: Settings2 })}
              <View style={styles.version}>
                <View style={styles.smallDot} />
                <Text style={styles.versionText}>KEYDECK</Text>
                <Text style={styles.versionText}>v0.1</Text>
              </View>
            </View>
          </View>
        )}
        <View style={styles.workspace}>
          <View style={[styles.topbar, !medium && { paddingHorizontal: 16 }]}>
            <View style={s.row}>
              {!wide && (
                <View style={styles.logo}>
                  <Command size={20} color={t.dark} />
                </View>
              )}
              {medium && <Text style={styles.breadcrumb}>Workspace</Text>}
              <ChevronRight size={14} color={t.muted} />
              <Text style={{ color: t.text, fontSize: 12 }}>{tab}</Text>
            </View>
            <View style={s.row}>
              <View style={styles.previewBadge}>
                <View
                  style={[
                    styles.smallDot,
                    { backgroundColor: preview ? "#E4C58A" : t.accent },
                  ]}
                />
                <Text
                  style={{
                    color: preview ? "#E4C58A" : t.accent,
                    fontSize: 10,
                    fontFamily: mono,
                  }}
                >
                  {preview ? "PREVIEW MODE" : "BLUETOOTH HID"}
                </Text>
              </View>
              <IconButton
                icon={Settings2}
                label="Settings"
                onPress={() => {
                  setTab("Settings");
                  setShowDevices(false);
                }}
              />
            </View>
          </View>
          <ScrollView
            contentContainerStyle={[styles.content, !medium && { padding: 20 }]}
            keyboardShouldPersistTaps="handled"
          >
            <View
              style={[
                styles.pageHeading,
                !medium && { alignItems: "flex-start" },
              ]}
            >
              <View>
                <View style={s.row}>
                  <Text style={styles.eyebrow}>THE REMOTE, REIMAGINED</Text>
                  <View style={styles.eyebrowLine} />
                </View>
                <Text style={[styles.heading, !medium && { fontSize: 31 }]}>
                  {showDevices
                    ? "Make a connection."
                    : tab === "Overview"
                      ? "Small device. Full control."
                      : tab === "Touchpad"
                        ? "A little room to move."
                        : tab === "Keyboard"
                          ? "Every key. Right here."
                          : tab === "Console"
                            ? "Your next command."
                            : "Make it your own."}
                </Text>
                <Text style={s.body}>
                  {showDevices
                    ? "Pair once. Keep your computer within reach."
                    : tab === "Overview"
                      ? "Your mouse, keyboard, and commands. All in one place."
                      : tab === "Touchpad"
                        ? "Point, click, scroll. Your phone is the surface."
                        : tab === "Keyboard"
                          ? "Type on your phone. Send it to your computer."
                          : tab === "Console"
                            ? "Compose commands for the terminal on your computer."
                            : "A few preferences for the way you work."}
                </Text>
              </View>
              {!showDevices && medium && (
                <Button icon={Plus} onPress={() => void openDevices()}>
                  Connect device
                </Button>
              )}
            </View>
            {!!error && (
              <View accessibilityRole="alert" style={styles.error}>
                <Text style={{ color: t.error, flex: 1, lineHeight: 21 }}>
                  {error}
                </Text>
                <IconButton
                  icon={X}
                  label="Dismiss error"
                  onPress={() => setError("")}
                />
              </View>
            )}
            {!!notice && (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Dismiss notification"
                onPress={() => setNotice("")}
                style={styles.notice}
              >
                <Check color={t.accent} size={17} />
                <Text style={{ color: t.text, flex: 1 }}>{notice}</Text>
                <X size={14} color={t.muted} />
              </Pressable>
            )}
            {showDevices ? (
              <Panel>
                <View style={[s.row, { justifyContent: "space-between" }]}>
                  <Text style={s.title}>Your computers</Text>
                  <IconButton
                    icon={X}
                    label="Close devices"
                    onPress={() => setShowDevices(false)}
                  />
                </View>
                <Text style={[s.body, { marginVertical: 16 }]}>
                  {preview
                    ? "This sample computer lets you test the interface. No input is sent over Bluetooth."
                    : "Make this phone discoverable, then add it in your computer’s Bluetooth settings. Refresh this list after pairing."}
                </Text>
                <View style={[s.row, { flexWrap: "wrap", marginBottom: 20 }]}>
                  <Button
                    icon={Bluetooth}
                    disabled={busy}
                    onPress={() => void run(() => transport.discoverable())}
                  >
                    Make discoverable
                  </Button>
                  <Button
                    icon={RefreshCw}
                    disabled={busy}
                    onPress={() => void openDevices()}
                  >
                    {busy ? "Working…" : "Refresh devices"}
                  </Button>
                </View>
                {devices.map((device) => (
                  <View key={device.id} style={styles.deviceRow}>
                    <Laptop size={25} color={t.accent} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.panelTitle}>{device.name}</Text>
                      <Text style={s.body}>
                        {preview
                          ? "Preview computer"
                          : "Paired Bluetooth device"}
                      </Text>
                    </View>
                    <Button
                      primary
                      disabled={
                        busy || connection.status === "connecting" || connected
                      }
                      onPress={() => void connect(device)}
                    >
                      {connected
                        ? "Connected"
                        : connection.status === "connecting"
                          ? "Connecting…"
                          : "Connect"}
                    </Button>
                  </View>
                ))}
                {!busy && devices.length === 0 && (
                  <Text style={s.body}>
                    No paired devices yet. Pair from your computer, then
                    refresh.
                  </Text>
                )}
                {connected && (
                  <Button
                    primary
                    style={{ marginTop: 20 }}
                    onPress={() => setShowDevices(false)}
                  >
                    Start controlling
                  </Button>
                )}
              </Panel>
            ) : (
              <>
                <View style={styles.connectionBar}>
                  <View style={styles.computerIcon}>
                    <Laptop size={24} color={connected ? t.accent : t.muted} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <View style={[s.row, { gap: 9, flexWrap: "wrap" }]}>
                      <Text style={styles.panelTitle}>
                        {connected
                          ? connection.device?.name || "Your computer"
                          : "No computer connected"}
                      </Text>
                      {connected && (
                        <View style={styles.connectedBadge}>
                          <View style={styles.smallDot} />
                          <Text style={{ color: t.accent, fontSize: 10 }}>
                            {preview ? "Simulated" : "Connected"}
                          </Text>
                        </View>
                      )}
                    </View>
                    <Text style={[s.body, { fontSize: 11 }]}>
                      {connected
                        ? `${preview ? "Preview connection" : "Bluetooth connection"}  ·  ${host}  ·  US keyboard`
                        : "Connect over Bluetooth to start your session"}
                    </Text>
                  </View>
                  {medium && (
                    <View style={styles.transportLabel}>
                      <Bluetooth size={15} color={t.muted} />
                      <Text style={styles.shortcutKeys}>
                        WIRELESS BY DESIGN
                      </Text>
                    </View>
                  )}
                  <IconButton
                    icon={connected ? Unplug : Link2}
                    label={
                      connected ? "Disconnect computer" : "Connect computer"
                    }
                    onPress={() =>
                      connected
                        ? void run(() => transport.disconnect())
                        : void openDevices()
                    }
                  />
                </View>
                {(tab === "Overview" || tab === "Touchpad") && (
                  <View
                    style={[
                      styles.controlGrid,
                      !medium && { flexDirection: "column" },
                    ]}
                  >
                    {touchpad}
                    {tab === "Overview" && (
                      <View
                        style={[
                          styles.rightColumn,
                          !medium && { width: "100%" },
                        ]}
                      >
                        {shortcutsPanel}
                        <Panel>
                          <View
                            style={[
                              s.row,
                              {
                                justifyContent: "space-between",
                                marginBottom: 18,
                              },
                            ]}
                          >
                            <Text style={styles.panelTitle}>Quick type</Text>
                            <Keyboard size={18} color={t.muted} />
                          </View>
                          <TextInput
                            accessibilityLabel="Quick type text"
                            placeholder="Something to say? Type it here…"
                            placeholderTextColor={t.muted}
                            value={draft}
                            onChangeText={setDraft}
                            multiline
                            maxLength={2000}
                            style={[
                              s.input,
                              { minHeight: 90, textAlignVertical: "top" },
                            ]}
                          />
                          <View
                            style={[
                              s.row,
                              {
                                marginTop: 14,
                                justifyContent: "space-between",
                              },
                            ]}
                          >
                            <Text style={styles.shortcutKeys}>
                              {draft.length} / 2000
                            </Text>
                            <Button
                              primary
                              icon={Send}
                              disabled={!connected || !draft || busy}
                              onPress={() => {
                                setBusy(true);
                                void run(async () => {
                                  await transport.text(draft);
                                  setDraft("");
                                  setNotice(
                                    preview
                                      ? "Text previewed. Nothing was sent to a computer."
                                      : "Text sent to the focused app.",
                                  );
                                }).finally(() => setBusy(false));
                              }}
                            >
                              Send text
                            </Button>
                          </View>
                        </Panel>
                      </View>
                    )}
                  </View>
                )}
                {tab === "Overview" && (
                  <View
                    style={[
                      styles.bottomGrid,
                      !medium && { flexDirection: "column" },
                    ]}
                  >
                    <Pressable
                      accessibilityRole="button"
                      onPress={() => setTab("Console")}
                      style={styles.consoleCard}
                    >
                      <View style={styles.terminalIcon}>
                        <Terminal size={23} color={t.accent} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.panelTitle}>A command away.</Text>
                        <Text style={[s.body, { fontSize: 12 }]}>
                          Open your command workspace
                        </Text>
                      </View>
                      <ArrowUpRight size={20} color={t.accent} />
                    </Pressable>
                    <View style={styles.tipCard}>
                      <CircleHelp size={19} color={t.muted} />
                      <View style={{ flex: 1 }}>
                        <Text
                          style={{
                            color: t.text,
                            fontSize: 12,
                            marginBottom: 4,
                          }}
                        >
                          One less thing on your desk.
                        </Text>
                        <Text
                          style={{
                            color: t.muted,
                            fontSize: 11,
                            lineHeight: 17,
                          }}
                        >
                          {preview
                            ? "Explore freely. Preview input stays on this device."
                            : "Keep Keydeck open while controlling your computer."}
                        </Text>
                      </View>
                    </View>
                  </View>
                )}
                {tab === "Keyboard" && (
                  <Panel>
                    <View
                      style={[
                        s.row,
                        { justifyContent: "space-between", marginBottom: 20 },
                      ]}
                    >
                      <Text style={styles.panelTitle}>Text & keys</Text>
                      <Label>US layout</Label>
                    </View>
                    <TextInput
                      accessibilityLabel="Keyboard text"
                      value={draft}
                      onChangeText={setDraft}
                      multiline
                      maxLength={2000}
                      placeholder="Type text to send to the focused app…"
                      placeholderTextColor={t.muted}
                      style={[
                        s.input,
                        { minHeight: 150, textAlignVertical: "top" },
                      ]}
                    />
                    <Button
                      primary
                      disabled={!connected || !draft || busy}
                      style={{ marginVertical: 18 }}
                      onPress={() => {
                        setBusy(true);
                        void run(async () => {
                          await transport.text(draft);
                          setDraft("");
                        }).finally(() => setBusy(false));
                      }}
                    >
                      Send text
                    </Button>
                    <View style={styles.keyGrid}>
                      {[
                        "Escape",
                        "Tab",
                        "Backspace",
                        "Enter",
                        "Space",
                        "Delete",
                        "Home",
                        "End",
                        "PageUp",
                        "PageDown",
                        "Left",
                        "Up",
                        "Down",
                        "Right",
                        ...Array.from({ length: 12 }, (_, i) => `F${i + 1}`),
                      ].map((k) => (
                        <Button
                          key={k}
                          disabled={!connected}
                          onPress={() => void key([k])}
                        >
                          {k}
                        </Button>
                      ))}
                    </View>
                    <ShortcutComposer enabled={connected} send={key} />
                    <View style={{ marginTop: 24 }}>{shortcutsPanel}</View>
                  </Panel>
                )}
                {tab === "Console" && (
                  <Panel>
                    <View
                      style={[
                        s.row,
                        { justifyContent: "space-between", marginBottom: 20 },
                      ]}
                    >
                      <View style={s.row}>
                        <Terminal size={20} color={t.accent} />
                        <Text style={styles.panelTitle}>Command composer</Text>
                      </View>
                      <Label>Input only</Label>
                    </View>
                    <View style={styles.terminal}>
                      <Text
                        style={{
                          fontFamily: mono,
                          color: t.accent,
                          fontSize: 12,
                          lineHeight: 22,
                        }}
                      >
                        {
                          "keydeck / command workspace\n──────────────────────────\n> Your computer is the terminal.\n> Keydeck puts the keys in your hand."
                        }
                      </Text>
                      <Text style={[s.body, { marginTop: 20 }]}>
                        Focus a terminal on your computer first. Send types your
                        command and presses Enter. Bluetooth HID cannot read
                        command output.
                      </Text>
                      {history.map((entry, i) => (
                        <Text
                          key={`${i}-${entry}`}
                          selectable
                          style={{
                            color: t.muted,
                            fontFamily: mono,
                            marginTop: 15,
                            fontSize: 12,
                          }}
                        >
                          {preview ? "preview" : "sent"} $ {entry}
                        </Text>
                      ))}
                    </View>
                    <TextInput
                      accessibilityLabel="Command"
                      value={command}
                      onChangeText={setCommand}
                      autoCapitalize="none"
                      autoCorrect={false}
                      maxLength={2000}
                      placeholder="Type a command…"
                      placeholderTextColor={t.muted}
                      style={[s.input, { marginTop: 16 }]}
                    />
                    <View
                      style={[
                        s.row,
                        {
                          justifyContent: "space-between",
                          marginTop: 16,
                          flexWrap: "wrap",
                        },
                      ]}
                    >
                      <Button
                        disabled={!connected}
                        onPress={() => void key(["Ctrl", "c"])}
                      >
                        Ctrl + C
                      </Button>
                      <Button
                        primary
                        icon={CornerDownLeft}
                        disabled={!connected || !command.trim() || busy}
                        onPress={() => {
                          setBusy(true);
                          void run(async () => {
                            await transport.text(command, true);
                            setHistory((h) => [...h, command].slice(-20));
                            setCommand("");
                          }).finally(() => setBusy(false));
                        }}
                      >
                        {preview ? "Preview + Enter" : "Send + Enter"}
                      </Button>
                    </View>
                    <Text style={[s.body, { marginTop: 20, fontSize: 12 }]}>
                      Live terminal output and remote screen viewing are future
                      companion features.
                    </Text>
                  </Panel>
                )}
                {tab === "Settings" && (
                  <View style={{ gap: 20 }}>
                    <Panel>
                      <Text style={s.title}>Connection mode</Text>
                      <View
                        style={[
                          s.row,
                          {
                            justifyContent: "space-between",
                            marginVertical: 20,
                          },
                        ]}
                      >
                        <View style={{ flex: 1 }}>
                          <Text style={styles.panelTitle}>Preview mode</Text>
                          <Text style={s.body}>
                            Try controls without sending input to a computer.
                          </Text>
                        </View>
                        <Switch
                          accessibilityLabel="Preview mode"
                          value={preview}
                          onValueChange={(value) => {
                            setPreview(value);
                            setError("");
                            setNotice(
                              "Connection mode changed. Reconnect to continue.",
                            );
                          }}
                          trackColor={{ false: t.border, true: "#688343" }}
                          thumbColor={preview ? t.accent : t.muted}
                        />
                      </View>
                      <Text style={s.body}>
                        Bluetooth mode requires Android 9 or later, HID device
                        support, and a custom development build. Keep the app in
                        the foreground.
                      </Text>
                    </Panel>
                    <Panel>
                      <Text style={s.title}>Input preferences</Text>
                      <Text
                        style={[s.body, { marginTop: 20, marginBottom: 10 }]}
                      >
                        Computer operating system
                      </Text>
                      <View style={[s.row, { flexWrap: "wrap" }]}>
                        {(["Windows", "macOS", "Linux"] as const).map((v) => (
                          <Button
                            key={v}
                            primary={host === v}
                            onPress={() => setHost(v)}
                          >
                            {v}
                          </Button>
                        ))}
                      </View>
                      <Text
                        style={[s.body, { marginTop: 24, marginBottom: 10 }]}
                      >
                        Pointer speed
                      </Text>
                      <View style={[s.row, { flexWrap: "wrap" }]}>
                        {[
                          { label: "Precise", value: 0.75 },
                          { label: "Balanced", value: 1.5 },
                          { label: "Fast", value: 2.5 },
                        ].map((v) => (
                          <Button
                            key={v.label}
                            primary={sensitivity === v.value}
                            onPress={() => setSensitivity(v.value)}
                          >
                            {v.label}
                          </Button>
                        ))}
                      </View>
                    </Panel>
                    <Panel>
                      <Text style={s.title}>Session activity</Text>
                      {activity.map((a, i) => (
                        <Text
                          key={`${i}-${a}`}
                          style={[
                            s.body,
                            { fontFamily: mono, fontSize: 11, marginTop: 12 },
                          ]}
                        >
                          › {a}
                        </Text>
                      ))}
                    </Panel>
                  </View>
                )}
              </>
            )}
            <View style={styles.footer}>
              <View style={s.row}>
                <View
                  style={[
                    styles.smallDot,
                    { backgroundColor: connected ? t.accent : t.muted },
                  ]}
                />
                <Text style={styles.footerText}>
                  {connected
                    ? preview
                      ? "Preview session active"
                      : "Bluetooth session active"
                    : "Ready to connect"}
                </Text>
              </View>
              <Text style={styles.footerText}>
                LESS ON YOUR DESK. MORE IN YOUR HAND.
              </Text>
            </View>
          </ScrollView>
          {!wide && <View style={styles.mobileNav}>{tabs.map(nav)}</View>}
        </View>
      </View>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: t.bg },
  shell: { flex: 1, flexDirection: "row" },
  sidebar: {
    width: 235,
    padding: 24,
    borderRightWidth: 1,
    borderColor: t.border,
    backgroundColor: "#141715",
  },
  brand: {
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
    marginTop: 12,
    marginBottom: 55,
  },
  logo: {
    backgroundColor: t.accent,
    width: 39,
    height: 39,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  brandName: {
    color: t.text,
    fontSize: 29,
    fontWeight: "700",
    letterSpacing: -1.5,
  },
  brandCaption: {
    color: t.muted,
    fontSize: 6,
    letterSpacing: 1.3,
    marginTop: 3,
  },
  nav: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderRadius: 10,
    minHeight: 48,
  },
  navActive: { backgroundColor: "#26311E" },
  navText: { fontSize: 13, color: t.muted },
  smallDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: t.accent },
  sidebarBottom: { marginTop: "auto", gap: 20, paddingTop: 60 },
  asciiCard: {
    padding: 15,
    borderWidth: 1,
    borderColor: t.border,
    borderRadius: 12,
    gap: 12,
  },
  ascii: {
    color: "#80916D",
    fontFamily: mono,
    fontSize: 13,
    lineHeight: 17,
    paddingVertical: 8,
  },
  asciiTitle: {
    color: t.text,
    fontSize: 16,
    fontWeight: "500",
    lineHeight: 24,
  },
  version: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: t.border,
    paddingTop: 22,
  },
  versionText: { color: t.muted, fontFamily: mono, fontSize: 8 },
  workspace: { flex: 1 },
  topbar: {
    minHeight: 79,
    borderBottomWidth: 1,
    borderBottomColor: t.border,
    paddingHorizontal: 32,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  breadcrumb: { color: t.muted, fontSize: 12 },
  previewBadge: { flexDirection: "row", alignItems: "center", gap: 7 },
  content: {
    padding: 34,
    gap: 24,
    maxWidth: 1500,
    width: "100%",
    alignSelf: "center",
  },
  pageHeading: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    paddingTop: 9,
    marginBottom: 6,
  },
  eyebrow: {
    fontFamily: mono,
    fontSize: 9,
    letterSpacing: 1.7,
    color: t.accent,
  },
  eyebrowLine: { height: 1, width: 34, backgroundColor: "#556247" },
  heading: {
    fontSize: 36,
    fontWeight: "500",
    color: t.text,
    letterSpacing: -1.4,
    marginTop: 13,
    marginBottom: 10,
  },
  connectionBar: {
    backgroundColor: t.panel,
    borderWidth: 1,
    borderColor: t.border,
    borderRadius: 13,
    padding: 17,
    flexDirection: "row",
    alignItems: "center",
    gap: 15,
  },
  computerIcon: { backgroundColor: t.raised, padding: 12, borderRadius: 12 },
  panelTitle: { color: t.text, fontSize: 14, fontWeight: "600" },
  connectedBadge: {
    flexDirection: "row",
    gap: 5,
    alignItems: "center",
    paddingHorizontal: 7,
    paddingVertical: 4,
    borderRadius: 5,
    backgroundColor: "#29351F",
  },
  transportLabel: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginRight: 12,
  },
  controlGrid: { flexDirection: "row", alignItems: "stretch", gap: 22 },
  rightColumn: { width: 310, gap: 22 },
  tag: {
    borderWidth: 1,
    borderColor: t.border,
    borderRadius: 5,
    paddingVertical: 5,
    paddingHorizontal: 8,
  },
  tagText: { color: t.muted, fontFamily: mono, fontSize: 8, letterSpacing: 1 },
  shortcuts: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  shortcut: {
    width: "47%",
    minHeight: 102,
    backgroundColor: t.raised,
    borderWidth: 1,
    borderColor: t.border,
    borderRadius: 10,
    padding: 13,
    gap: 9,
  },
  shortcutLabel: { color: t.text, fontSize: 12 },
  shortcutKeys: {
    color: t.muted,
    fontFamily: mono,
    fontSize: 9,
    letterSpacing: 0.5,
  },
  bottomGrid: { flexDirection: "row", gap: 22 },
  consoleCard: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#3B4930",
    backgroundColor: "#1D2519",
    borderRadius: 14,
    padding: 22,
    flexDirection: "row",
    alignItems: "center",
    gap: 15,
  },
  terminalIcon: { backgroundColor: "#2B3821", padding: 13, borderRadius: 11 },
  tipCard: {
    width: 310,
    padding: 18,
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: 16,
    paddingVertical: 5,
  },
  footerText: {
    color: "#8F9A91",
    fontSize: 8,
    letterSpacing: 0.7,
    fontFamily: mono,
  },
  error: {
    backgroundColor: "#38251F",
    padding: 16,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 15,
  },
  notice: {
    backgroundColor: "#24321C",
    padding: 16,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  deviceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    borderTopColor: t.border,
    borderTopWidth: 1,
    paddingVertical: 20,
  },
  keyGrid: { flexDirection: "row", flexWrap: "wrap", gap: 9 },
  terminal: {
    backgroundColor: "#0E120D",
    padding: 24,
    borderWidth: 1,
    borderColor: t.border,
    borderRadius: 12,
    minHeight: 220,
  },
  mobileNav: {
    flexDirection: "row",
    padding: 9,
    gap: 3,
    borderTopWidth: 1,
    borderTopColor: t.border,
    backgroundColor: t.panel,
  },
});
