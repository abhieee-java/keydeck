import React from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Bluetooth, Check, Laptop, RefreshCw, X } from "lucide-react-native";
import { useSession } from "../hooks/ControllerProvider";
import { Button, IconButton, s } from "./ui";
import { theme as t } from "../theme";
export function ConnectionSheet() {
  const {
    showDevices,
    setShowDevices,
    preview,
    devices,
    connected,
    connection,
    busy,
    openDevices,
    connect,
    transport,
    run,
    error,
    setError,
  } = useSession();
  return (
    <Modal
      visible={showDevices}
      transparent
      animationType="none"
      onRequestClose={() => setShowDevices(false)}
    >
      <View style={styles.backdrop}>
        <Pressable
          style={StyleSheet.absoluteFill}
          accessibilityRole="button"
          accessibilityLabel="Close connection sheet"
          onPress={() => setShowDevices(false)}
        />
        <View accessibilityViewIsModal style={styles.sheet}>
          <View style={styles.handle} />
          <View style={[s.row, { justifyContent: "space-between" }]}>
            <Text accessibilityRole="header" style={styles.title}>
              Connect your computer
            </Text>
            <IconButton
              icon={X}
              label="Close devices"
              onPress={() => setShowDevices(false)}
            />
          </View>
          <ScrollView
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ gap: 20, paddingBottom: 20 }}
          >
            <Text style={s.body}>
              {preview
                ? "Explore with a sample computer. Preview input stays on this device."
                : "Pair once. Then your computer is always within reach."}
            </Text>
            {!preview && (
              <View style={styles.steps}>
                {[
                  "Enable Bluetooth on your computer.",
                  "Make this phone discoverable below.",
                  "Add the phone on your computer, then refresh.",
                ].map((step, i) => (
                  <View key={step} style={s.row}>
                    <View style={styles.number}>
                      <Text style={{ color: t.accent, fontWeight: "600" }}>
                        {i + 1}
                      </Text>
                    </View>
                    <Text style={[s.body, { flex: 1 }]}>{step}</Text>
                  </View>
                ))}
              </View>
            )}
            {!!error && (
              <View accessibilityRole="alert" style={styles.error}>
                <Text style={{ color: t.error, lineHeight: 22, flex: 1 }}>
                  {error}
                </Text>
                <IconButton
                  icon={X}
                  label="Dismiss connection error"
                  onPress={() => setError("")}
                />
              </View>
            )}
            <View style={[s.row, { flexWrap: "wrap" }]}>
              <Button
                primary
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
                Refresh
              </Button>
            </View>
            <Text style={styles.label}>
              {preview ? "PREVIEW DEVICE" : "PAIRED DEVICES"}
            </Text>
            {busy && (
              <ActivityIndicator
                accessibilityLabel="Preparing Bluetooth"
                color={t.accent}
              />
            )}
            {devices.map((device) => (
              <View key={device.id} style={styles.device}>
                <View style={styles.laptop}>
                  <Laptop color={t.accent} size={23} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.name}>{device.name}</Text>
                  <Text style={[s.body, { fontSize: 12 }]}>
                    {preview ? "Sample computer" : "Paired over Bluetooth"}
                  </Text>
                </View>
                <Button
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
            {!busy && !devices.length && (
              <View style={styles.empty}>
                <Laptop size={30} color={t.muted} />
                <Text style={styles.name}>No paired computers yet</Text>
                <Text style={[s.body, { textAlign: "center" }]}>
                  Pair from your computer’s Bluetooth settings, then tap
                  Refresh.
                </Text>
              </View>
            )}
            {connected && (
              <Button
                primary
                icon={Check}
                onPress={() => setShowDevices(false)}
              >
                Start controlling
              </Button>
            )}
            <Text style={[s.body, { fontSize: 12 }]}>
              Initial pairing needs access to your computer’s Bluetooth
              settings.
            </Text>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,.72)",
    justifyContent: "flex-end",
    alignItems: "center",
  },
  sheet: {
    width: "100%",
    maxWidth: 600,
    maxHeight: "92%",
    backgroundColor: t.panel,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    borderWidth: 1,
    borderColor: t.border,
    padding: 24,
    gap: 18,
  },
  handle: {
    width: 38,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#4D5666",
    alignSelf: "center",
    marginBottom: 4,
  },
  title: {
    fontSize: 23,
    fontWeight: "600",
    color: t.text,
    letterSpacing: -0.7,
    flex: 1,
  },
  steps: { gap: 14, paddingVertical: 6 },
  number: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#24304A",
    alignItems: "center",
    justifyContent: "center",
  },
  label: { color: t.muted, fontSize: 11, letterSpacing: 1.4 },
  device: {
    padding: 15,
    backgroundColor: t.bg,
    borderRadius: 19,
    borderWidth: 1,
    borderColor: t.border,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flexWrap: "wrap",
  },
  laptop: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "#202D43",
    alignItems: "center",
    justifyContent: "center",
  },
  name: { color: t.text, fontWeight: "600", fontSize: 15 },
  empty: { padding: 24, alignItems: "center", gap: 12 },
  error: {
    padding: 14,
    backgroundColor: "#302125",
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
});
