import React from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import {
  ArrowUpRight,
  Battery,
  Bluetooth,
  Check,
  ChevronRight,
  Command,
  CornerDownLeft,
  Keyboard,
  Laptop,
  Leaf,
  Maximize2,
  MousePointer2,
  Send,
  Settings2,
  ShieldCheck,
  Square,
  Terminal,
  Unplug,
  X,
} from "lucide-react-native";
import { Tab, useSession } from "../hooks/ControllerProvider";
import { Button, IconButton, Label, Panel, s } from "../components/ui";
import { Touchpad } from "../components/Touchpad";
import { ShortcutComposer } from "../components/ShortcutComposer";
import { ConnectionSheet } from "../components/ConnectionSheet";
import { theme as t, mono } from "../theme";
const destinations = [
  { name: "Overview", label: "Control", icon: MousePointer2 },
  { name: "Keyboard", label: "Keyboard", icon: Keyboard },
  { name: "Console", label: "Console", icon: Terminal },
  { name: "Settings", label: "Settings", icon: Settings2 },
] as const;

function SessionCard() {
  const { connected, connection, preview, host, transport, run, openDevices } =
    useSession();
  return (
    <View style={styles.session}>
      <View style={styles.deviceIcon}>
        <Laptop size={24} color={connected ? t.accent : t.muted} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.deviceName}>
          {connected
            ? connection.device?.name || "Your computer"
            : "Your computer"}
        </Text>
        <View
          style={{
            flexDirection: "row",
            gap: 6,
            alignItems: "center",
            marginTop: 5,
          }}
        >
          <View
            style={[
              styles.dot,
              { backgroundColor: connected ? t.success : t.muted },
            ]}
          />
          <Text style={styles.caption}>
            {connected
              ? `${preview ? "Simulated" : "Connected"} · ${host}`
              : "Not connected"}
          </Text>
        </View>
      </View>
      {connected ? (
        <IconButton
          icon={Unplug}
          label="Disconnect computer"
          onPress={() => void run(() => transport.disconnect())}
        />
      ) : (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Connect computer"
          onPress={() => void openDevices()}
          style={styles.connectButton}
        >
          <Text style={styles.connectText}>Connect</Text>
          <Bluetooth size={15} color={t.dark} />
        </Pressable>
      )}
    </View>
  );
}
function QuickActions() {
  const { shortcuts, connected, key } = useSession();
  return (
    <View style={styles.quickGrid}>
      {shortcuts.map((action) => (
        <Pressable
          key={action.label}
          accessibilityRole="button"
          accessibilityLabel={`${action.label}, ${action.keys.join(" plus ")}`}
          accessibilityState={{ disabled: !connected }}
          disabled={!connected}
          onPress={() => void key(action.keys)}
          style={({ pressed }) => [
            styles.quickAction,
            { opacity: connected ? (pressed ? 0.65 : 1) : 0.42 },
          ]}
        >
          <action.icon size={21} color={t.accent} />
          <Text style={styles.quickLabel}>{action.label}</Text>
        </Pressable>
      ))}
    </View>
  );
}
function TextComposer({ compact = false }: { compact?: boolean }) {
  const {
    draft,
    setDraft,
    connected,
    transport,
    run,
    busy,
    setBusy,
    preview,
    setNotice,
  } = useSession();
  const send = () => {
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
  };
  return (
    <View style={{ gap: 14 }}>
      <TextInput
        accessibilityLabel={compact ? "Quick type text" : "Keyboard text"}
        value={draft}
        onChangeText={setDraft}
        maxLength={2000}
        multiline
        placeholder="Write something. Send it anywhere."
        placeholderTextColor={t.muted}
        style={[
          s.input,
          {
            minHeight: compact ? 110 : 160,
            textAlignVertical: "top",
            fontFamily: undefined,
          },
        ]}
      />
      <View style={[s.row, { justifyContent: "space-between" }]}>
        <Text style={styles.caption}>
          {draft.length.toLocaleString()} / 2,000
        </Text>
        <Button
          primary
          icon={Send}
          disabled={!connected || !draft || busy}
          onPress={send}
        >
          {busy ? "Sending…" : "Send text"}
        </Button>
      </View>
      {busy && (
        <Button
          icon={Square}
          onPress={() => void run(() => transport.release())}
        >
          Stop sending
        </Button>
      )}
    </View>
  );
}
function ControlScreen() {
  const { connected, mouse, sensitivity, tab, setTab, medium, pointerRate } =
    useSession();
  return (
    <View style={[styles.columns, !medium && { flexDirection: "column" }]}>
      <Panel style={{ flex: 1 }}>
        <View
          style={[s.row, { justifyContent: "space-between", marginBottom: 16 }]}
        >
          <View>
            <Text style={styles.sectionTitle}>Touchpad</Text>
            <Text style={[styles.caption, { marginTop: 5 }]}>
              A natural extension of your hand.
            </Text>
          </View>
          <IconButton
            icon={Maximize2}
            label="Open full touchpad"
            onPress={() => setTab(tab === "Touchpad" ? "Overview" : "Touchpad")}
          />
        </View>
        <Touchpad
          key={`${connected}-${tab}`}
          enabled={connected}
          send={mouse}
          sensitivity={sensitivity}
        />
      </Panel>
      {tab === "Overview" && (
        <View style={[{ width: medium ? 320 : "100%", gap: 20 }]}>
          <Panel>
            <View
              style={[
                s.row,
                { justifyContent: "space-between", marginBottom: 20 },
              ]}
            >
              <Text style={styles.sectionTitle}>Everyday shortcuts</Text>
              <Command size={18} color={t.muted} />
            </View>
            <QuickActions />
          </Panel>
          <Panel>
            <View
              style={[
                s.row,
                { justifyContent: "space-between", marginBottom: 18 },
              ]}
            >
              <Text style={styles.sectionTitle}>Quick type</Text>
              <Keyboard size={19} color={t.muted} />
            </View>
            <TextComposer compact />
          </Panel>
          <View style={styles.energyNote}>
            <Leaf size={17} color={t.success} />
            <Text style={[styles.caption, { flex: 1, lineHeight: 19 }]}>
              {pointerRate === 30
                ? "Efficient input. No background polling."
                : "Smooth input. Active only when you move."}
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}
function KeyboardScreen() {
  const { connected, key } = useSession();
  return (
    <View style={{ gap: 20 }}>
      <Panel>
        <View
          style={[s.row, { justifyContent: "space-between", marginBottom: 20 }]}
        >
          <Text style={styles.sectionTitle}>Compose on your phone</Text>
          <Label>US layout</Label>
        </View>
        <TextComposer />
      </Panel>
      <Panel>
        <Text style={[styles.sectionTitle, { marginBottom: 20 }]}>
          The keys you need
        </Text>
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
            <Button key={k} disabled={!connected} onPress={() => void key([k])}>
              {k}
            </Button>
          ))}
        </View>
        <ShortcutComposer enabled={connected} send={key} />
      </Panel>
      <Panel>
        <Text style={[styles.sectionTitle, { marginBottom: 20 }]}>
          Everyday shortcuts
        </Text>
        <QuickActions />
      </Panel>
    </View>
  );
}
function ConsoleScreen() {
  const {
    command,
    setCommand,
    history,
    setHistory,
    preview,
    connected,
    busy,
    setBusy,
    transport,
    run,
    key,
  } = useSession();
  const send = () => {
    setBusy(true);
    void run(async () => {
      await transport.text(command, true);
      setHistory((h) => [...h, command].slice(-20));
      setCommand("");
    }).finally(() => setBusy(false));
  };
  return (
    <View style={{ gap: 20 }}>
      <Panel>
        <View
          style={[s.row, { justifyContent: "space-between", marginBottom: 20 }]}
        >
          <View style={s.row}>
            <Terminal size={21} color={t.accent} />
            <Text style={styles.sectionTitle}>Command workspace</Text>
          </View>
          <View style={styles.smallPill}>
            <Text style={styles.pillText}>Input only</Text>
          </View>
        </View>
        <View style={styles.terminal}>
          <Text style={styles.terminalHeading}>
            {"keydeck ~\nReady for your next command."}
          </Text>
          <Text style={[s.body, { marginTop: 16 }]}>
            Focus a terminal on your computer. Send + Enter types and submits
            your command.
          </Text>
          <View style={styles.terminalRule} />
          {history.length ? (
            history.map((entry, i) => (
              <Text
                key={`${i}-${entry}`}
                selectable
                style={styles.commandHistory}
              >
                {preview ? "preview" : "sent"} $ {entry}
              </Text>
            ))
          ) : (
            <Text style={styles.commandHistory}>$ _</Text>
          )}
        </View>
        <TextInput
          accessibilityLabel="Command"
          value={command}
          onChangeText={setCommand}
          maxLength={2000}
          autoCapitalize="none"
          autoCorrect={false}
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
          <Button disabled={!connected} onPress={() => void key(["Ctrl", "c"])}>
            Ctrl + C
          </Button>
          <Button
            primary
            icon={CornerDownLeft}
            disabled={!connected || !command.trim() || busy}
            onPress={send}
          >
            {busy ? "Sending…" : preview ? "Preview + Enter" : "Send + Enter"}
          </Button>
        </View>
        {busy && (
          <Button
            style={{ marginTop: 14 }}
            icon={Square}
            onPress={() => void run(() => transport.release())}
          >
            Stop sending
          </Button>
        )}
      </Panel>
      <View style={styles.explanation}>
        <ShieldCheck size={20} color={t.muted} />
        <Text style={[s.body, { flex: 1 }]}>
          This sends input, not terminal output. Live output and screen viewing
          need a future desktop companion.
        </Text>
      </View>
      {history.length > 0 && (
        <Button onPress={() => setHistory([])}>Clear session history</Button>
      )}
    </View>
  );
}
function SettingsScreen() {
  const {
    preview,
    setPreview,
    setError,
    setNotice,
    host,
    setHost,
    sensitivity,
    setSensitivity,
    pointerRate,
    setPointerRate,
    activity,
    preferenceWarning,
  } = useSession();
  return (
    <View style={{ gap: 20 }}>
      <Panel>
        <View style={[s.row, { justifyContent: "space-between" }]}>
          <View style={{ flex: 1, paddingRight: 15 }}>
            <Text style={styles.sectionTitle}>Preview mode</Text>
            <Text style={[s.body, { marginTop: 6 }]}>
              Explore without sending input.
            </Text>
          </View>
          <Switch
            accessibilityLabel="Preview mode"
            value={preview}
            onValueChange={(value) => {
              setPreview(value);
              setError("");
              setNotice("Connection mode changed. Reconnect to continue.");
            }}
            trackColor={{ false: t.border, true: "#526AAB" }}
            thumbColor={preview ? t.accent : t.muted}
          />
        </View>
      </Panel>
      <Panel>
        <View style={[s.row, { marginBottom: 20 }]}>
          <Laptop size={20} color={t.accent} />
          <Text style={styles.sectionTitle}>Your computer</Text>
        </View>
        <Text style={[s.body, { marginBottom: 12 }]}>Shortcut layout</Text>
        <View style={[s.row, { flexWrap: "wrap" }]}>
          {(["Windows", "macOS", "Linux"] as const).map((value) => (
            <Button
              key={value}
              primary={host === value}
              selected={host === value}
              onPress={() => setHost(value)}
            >
              {value}
            </Button>
          ))}
        </View>
        <Text style={[s.body, { marginTop: 24, marginBottom: 12 }]}>
          Pointer speed
        </Text>
        <View style={[s.row, { flexWrap: "wrap" }]}>
          {[
            { label: "Precise", value: 0.75 },
            { label: "Balanced", value: 1.5 },
            { label: "Fast", value: 2.5 },
          ].map((value) => (
            <Button
              key={value.label}
              primary={sensitivity === value.value}
              selected={sensitivity === value.value}
              onPress={() => setSensitivity(value.value)}
            >
              {value.label}
            </Button>
          ))}
        </View>
      </Panel>
      <Panel>
        <View style={[s.row, { marginBottom: 14 }]}>
          <Battery size={21} color={t.success} />
          <Text style={styles.sectionTitle}>Thoughtful about energy</Text>
        </View>
        <Text style={[s.body, { marginBottom: 18 }]}>
          Choose how often pointer movement is sent while you interact.
        </Text>
        <View style={[s.row, { flexWrap: "wrap" }]}>
          <Button
            primary={pointerRate === 30}
            selected={pointerRate === 30}
            onPress={() => setPointerRate(30)}
          >
            Efficient · 30 Hz
          </Button>
          <Button
            primary={pointerRate === 60}
            selected={pointerRate === 60}
            onPress={() => setPointerRate(60)}
          >
            Smooth · 60 Hz
          </Button>
        </View>
        <View style={styles.settingsRule} />
        {[
          "No background polling or continuous scanning",
          "Session pauses when the app goes into the background",
          "No wake lock or always-on screen requirement",
        ].map((value) => (
          <View
            key={value}
            style={[s.row, { alignItems: "flex-start", marginTop: 14 }]}
          >
            <Check size={16} color={t.success} />
            <Text style={[s.body, { flex: 1 }]}>{value}</Text>
          </View>
        ))}
        <Text style={[s.body, { marginTop: 18, fontSize: 12 }]}>
          Bluetooth and screen use still consume power. Battery impact varies by
          phone and has not yet been measured on hardware.
        </Text>
      </Panel>
      {!!preferenceWarning && (
        <Text
          accessibilityRole="alert"
          style={{ color: t.error, lineHeight: 22 }}
        >
          {preferenceWarning}
        </Text>
      )}
      <Panel>
        <Text style={[styles.sectionTitle, { marginBottom: 8 }]}>
          Private by default
        </Text>
        <Text style={s.body}>
          Input preferences stay on this phone. Text drafts and command history
          are only kept for this session. No account or analytics.
        </Text>
      </Panel>
      <Panel>
        <Text style={[styles.sectionTitle, { marginBottom: 12 }]}>
          Session activity
        </Text>
        {activity.map((value, i) => (
          <Text
            key={`${i}-${value}`}
            style={[styles.commandHistory, { marginTop: 12 }]}
          >
            {"› "}
            {value}
          </Text>
        ))}
      </Panel>
      <Text style={[styles.caption, { textAlign: "center", lineHeight: 20 }]}>
        Keydeck · 0.1.0 preview{"\n"}Made for a lighter desk.
      </Text>
    </View>
  );
}
export default function WorkspaceScreen() {
  const {
    wide,
    medium,
    tab,
    setTab,
    preview,
    connected,
    error,
    setError,
    notice,
    setNotice,
    setShowDevices,
    showDevices,
  } = useSession();
  const active = tab === "Touchpad" ? "Overview" : tab;
  const nav = (item: (typeof destinations)[number]) => (
    <Pressable
      key={item.name}
      accessibilityRole="button"
      accessibilityLabel={item.label}
      accessibilityState={{ selected: active === item.name }}
      onPress={() => {
        setTab(item.name as Tab);
        setShowDevices(false);
      }}
      style={({ pressed }) => [
        styles.nav,
        wide ? styles.navDesktop : styles.navMobile,
        active === item.name && styles.navActive,
        { opacity: pressed ? 0.7 : 1 },
      ]}
    >
      <item.icon
        size={21}
        color={active === item.name ? t.accent : t.muted}
        strokeWidth={active === item.name ? 2 : 1.7}
      />
      <Text
        style={[
          styles.navText,
          !wide && { fontSize: 11 },
          active === item.name && { color: t.accent },
        ]}
      >
        {item.label}
      </Text>
    </Pressable>
  );
  const titles: Record<Tab, string> = {
    Overview: connected
      ? "Everything, within reach."
      : "Your desk. Within reach.",
    Touchpad: "Make room to move.",
    Keyboard: "Every word, every key.",
    Console: "A command away.",
    Settings: "Make yourself at home.",
  };
  const subtitles: Record<Tab, string> = {
    Overview: "A little less hardware. A lot more freedom.",
    Touchpad: "A touch surface that goes wherever you do.",
    Keyboard: "Compose here. Send to the app on your computer.",
    Console: "Your computer’s terminal, with input from your phone.",
    Settings: "Small adjustments. A more natural connection.",
  };
  return (
    <SafeAreaView style={styles.root}>
      <StatusBar style="light" />
      <View style={styles.shell}>
        {wide && (
          <View style={styles.sidebar}>
            <View style={styles.brand}>
              <View style={styles.logo}>
                <Command size={23} color={t.accent} />
              </View>
              <Text style={styles.brandName}>
                keydeck<Text style={{ color: t.accent }}>.</Text>
              </Text>
            </View>
            <Text style={styles.sidebarLabel}>YOUR WORKSPACE</Text>
            <View style={{ gap: 8 }}>{destinations.map(nav)}</View>
            <View style={{ marginTop: "auto", gap: 14 }}>
              <View style={styles.sidebarArt}>
                <Text style={styles.ascii}>
                  {"┌────────────┐\n│  >_        │\n└──────┬─────┘\n     ──┴──"}
                </Text>
                <Text style={styles.sectionTitle}>Less on your desk.</Text>
                <Text style={s.body}>More in your hand.</Text>
              </View>
              <View style={s.row}>
                <Leaf color={t.success} size={15} />
                <Text style={styles.caption}>Quiet when you are.</Text>
              </View>
            </View>
          </View>
        )}
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <View style={[styles.topbar, wide && { paddingHorizontal: 36 }]}>
            {wide ? (
              <View style={s.row}>
                <Text style={styles.caption}>Workspace</Text>
                <ChevronRight size={13} color={t.muted} />
                <Text style={[styles.caption, { color: t.text }]}>
                  {active === "Overview" ? "Control" : active}
                </Text>
              </View>
            ) : (
              <View style={styles.brand}>
                <View style={styles.logo}>
                  <Command size={21} color={t.accent} />
                </View>
                <Text style={[styles.brandName, { fontSize: 23 }]}>
                  keydeck<Text style={{ color: t.accent }}>.</Text>
                </Text>
              </View>
            )}
            <View style={styles.modePill}>
              <View
                style={[
                  styles.dot,
                  { backgroundColor: preview ? "#D7BF8D" : t.success },
                ]}
              />
              <Text
                style={[
                  styles.pillText,
                  { color: preview ? "#E8CFA0" : t.success },
                ]}
              >
                {preview ? "Preview" : "Bluetooth"}
              </Text>
            </View>
          </View>
          <ScrollView
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={[
              styles.content,
              !medium && { padding: 20, gap: 20 },
            ]}
          >
            <View style={styles.headingBlock}>
              <Text
                accessibilityRole="header"
                style={[
                  styles.heading,
                  !medium && { fontSize: 30, lineHeight: 37 },
                ]}
              >
                {titles[tab]}
              </Text>
              <Text style={[s.body, { marginTop: 9 }]}>{subtitles[tab]}</Text>
            </View>
            {!!error && !showDevices && (
              <View accessibilityRole="alert" style={styles.error}>
                <Text style={{ color: t.error, lineHeight: 22, flex: 1 }}>
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
              <View accessibilityLiveRegion="polite" style={styles.notice}>
                <Check size={18} color={t.success} />
                <Text style={[s.body, { flex: 1, color: t.text }]}>
                  {notice}
                </Text>
                <IconButton
                  icon={X}
                  label="Dismiss notification"
                  onPress={() => setNotice("")}
                />
              </View>
            )}
            <SessionCard />
            {(tab === "Overview" || tab === "Touchpad") && <ControlScreen />}
            {tab === "Keyboard" && <KeyboardScreen />}
            {tab === "Console" && <ConsoleScreen />}
            {tab === "Settings" && <SettingsScreen />}
            {tab === "Overview" && (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Open command workspace"
                onPress={() => setTab("Console")}
                style={styles.consoleLink}
              >
                <View style={styles.consoleIcon}>
                  <Terminal size={22} color={t.accent} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.sectionTitle}>A command away.</Text>
                  <Text style={[styles.caption, { marginTop: 6 }]}>
                    Open your command workspace
                  </Text>
                </View>
                <ArrowUpRight size={21} color={t.accent} />
              </Pressable>
            )}
            <View style={styles.footer}>
              <Text style={styles.caption}>
                {connected
                  ? "Your session is ready."
                  : "Connect once. Make yourself comfortable."}
              </Text>
              <Text style={[styles.caption, { fontSize: 11 }]}>
                KEYDECK / ANDROID
              </Text>
            </View>
          </ScrollView>
          {!wide && (
            <View style={styles.bottomNav}>{destinations.map(nav)}</View>
          )}
        </KeyboardAvoidingView>
      </View>
      <ConnectionSheet />
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: t.bg },
  shell: { flex: 1, flexDirection: "row" },
  sidebar: {
    width: 234,
    padding: 26,
    borderRightWidth: 1,
    borderColor: "#202630",
    backgroundColor: "#0E1117",
    gap: 16,
  },
  brand: { flexDirection: "row", gap: 10, alignItems: "center" },
  logo: {
    height: 39,
    width: 39,
    borderRadius: 13,
    backgroundColor: "#222F4B",
    alignItems: "center",
    justifyContent: "center",
  },
  brandName: {
    fontSize: 27,
    fontWeight: "600",
    color: t.text,
    letterSpacing: -1.3,
  },
  sidebarLabel: {
    fontSize: 10,
    letterSpacing: 1.5,
    color: t.muted,
    marginTop: 44,
    marginBottom: 7,
  },
  nav: { alignItems: "center", gap: 12, borderRadius: 16, minHeight: 54 },
  navDesktop: { flexDirection: "row", padding: 16 },
  navMobile: { flex: 1, paddingVertical: 10, gap: 6 },
  navActive: { backgroundColor: "#1E2A42" },
  navText: { color: t.muted, fontSize: 14, fontWeight: "500" },
  sidebarArt: {
    backgroundColor: t.panel,
    borderWidth: 1,
    borderColor: t.border,
    borderRadius: 20,
    padding: 18,
    gap: 9,
    marginBottom: 12,
  },
  ascii: {
    fontFamily: mono,
    color: "#7F95BD",
    fontSize: 15,
    lineHeight: 21,
    marginBottom: 12,
  },
  topbar: {
    height: 77,
    paddingHorizontal: 22,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderColor: "#202630",
  },
  modePill: {
    flexDirection: "row",
    gap: 7,
    alignItems: "center",
    backgroundColor: t.panel,
    borderWidth: 1,
    borderColor: t.border,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  pillText: { fontSize: 11, color: t.muted, fontWeight: "500" },
  dot: { width: 5, height: 5, borderRadius: 3, backgroundColor: t.muted },
  content: {
    padding: 36,
    gap: 24,
    maxWidth: 1280,
    width: "100%",
    alignSelf: "center",
  },
  headingBlock: { paddingTop: 5, paddingBottom: 3 },
  heading: {
    fontSize: 38,
    lineHeight: 46,
    color: t.text,
    fontWeight: "500",
    letterSpacing: -1.4,
  },
  caption: { fontSize: 12, color: t.muted },
  sectionTitle: {
    color: t.text,
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: -0.25,
  },
  session: {
    flexDirection: "row",
    alignItems: "center",
    gap: 13,
    padding: 16,
    backgroundColor: t.panel,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: t.border,
  },
  deviceIcon: {
    height: 46,
    width: 46,
    borderRadius: 15,
    backgroundColor: t.raised,
    alignItems: "center",
    justifyContent: "center",
  },
  deviceName: { color: t.text, fontSize: 15, fontWeight: "600" },
  connectButton: {
    minHeight: 46,
    borderRadius: 14,
    backgroundColor: t.accent,
    paddingHorizontal: 15,
    flexDirection: "row",
    gap: 7,
    alignItems: "center",
  },
  connectText: { color: t.dark, fontSize: 13, fontWeight: "600" },
  columns: { flexDirection: "row", gap: 22, alignItems: "stretch" },
  quickGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  quickAction: {
    width: "47%",
    minHeight: 92,
    borderRadius: 17,
    padding: 15,
    backgroundColor: t.raised,
    gap: 12,
  },
  quickLabel: { color: t.text, fontSize: 13 },
  energyNote: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 10,
    alignItems: "center",
  },
  keyGrid: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
  smallPill: {
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: t.border,
    borderRadius: 8,
  },
  terminal: {
    minHeight: 220,
    padding: 22,
    borderRadius: 19,
    borderWidth: 1,
    borderColor: "#2A374D",
    backgroundColor: "#0B111B",
  },
  terminalHeading: {
    color: t.accent,
    fontSize: 14,
    fontFamily: mono,
    lineHeight: 25,
  },
  terminalRule: { height: 1, backgroundColor: t.border, marginVertical: 22 },
  commandHistory: {
    color: t.muted,
    fontFamily: mono,
    fontSize: 12,
    lineHeight: 21,
    marginTop: 7,
  },
  explanation: { flexDirection: "row", gap: 12, paddingHorizontal: 12 },
  settingsRule: { height: 1, backgroundColor: t.border, marginTop: 23 },
  consoleLink: {
    padding: 22,
    flexDirection: "row",
    gap: 16,
    alignItems: "center",
    backgroundColor: "#172238",
    borderWidth: 1,
    borderColor: "#304364",
    borderRadius: 23,
  },
  consoleIcon: {
    height: 46,
    width: 46,
    borderRadius: 15,
    backgroundColor: "#243653",
    alignItems: "center",
    justifyContent: "center",
  },
  footer: {
    paddingVertical: 4,
    gap: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    flexWrap: "wrap",
  },
  bottomNav: {
    flexDirection: "row",
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#11161F",
    borderTopWidth: 1,
    borderColor: t.border,
    gap: 5,
  },
  error: {
    padding: 14,
    backgroundColor: "#302125",
    borderRadius: 18,
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
  },
  notice: {
    padding: 14,
    backgroundColor: "#182C28",
    borderRadius: 18,
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
  },
});
