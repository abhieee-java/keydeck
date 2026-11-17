import React, { useCallback, useRef, useState } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  Vibration,
  View,
} from "react-native";
import {
  Gamepad2,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Zap,
  Bluetooth,
  CheckCircle2,
} from "lucide-react-native";
import { theme as t, mono } from "../theme";
import { useSession } from "../hooks/ControllerProvider";
import {
  calculateDpadHat,
  GAMEPAD_BUTTONS,
  PC_KEYBOARD_MAPPINGS,
  RETRO_KEYBOARD_MAPPINGS,
} from "../core/gamepad";

type ControllerMode = "gamepad" | "pc_wasd" | "pc_arrows";

export function GamingConsole() {
  const { transport, connected, preview, connection, openDevices } = useSession();
  const [mode, setMode] = useState<ControllerMode>("gamepad");
  const [activeButtons, setActiveButtons] = useState<number>(0);
  const [dpadState, setDpadState] = useState({
    up: false,
    down: false,
    left: false,
    right: false,
  });

  const activeRef = useRef({
    buttons: 0,
    up: false,
    down: false,
    left: false,
    right: false,
  });

  // Sets of currently held keys and modifiers for continuous keyboard input
  const heldKeysRef = useRef<Set<number>>(new Set());
  const heldModifiersRef = useRef<number>(0);

  const vibrateTactile = () => {
    try {
      Vibration.vibrate(8);
    } catch {}
  };

  const sendGamepadState = useCallback(
    (buttons: number, up: boolean, down: boolean, left: boolean, right: boolean) => {
      if (!connected && !preview) return;
      const dpad = calculateDpadHat(up, down, left, right);
      void transport
        .gamepad({
          buttons,
          dpad,
          leftX: left ? -127 : right ? 127 : 0,
          leftY: up ? -127 : down ? 127 : 0,
        })
        .catch(() => {});
    },
    [transport, connected, preview],
  );

  const syncKeyboardReport = useCallback(() => {
    if (!connected && !preview) return;
    const keysArray = Array.from(heldKeysRef.current);
    void transport
      .keyboardReport(heldModifiersRef.current, keysArray)
      .catch(() => {});
  }, [transport, connected, preview]);

  const handleButtonPressIn = (btnKey: keyof typeof GAMEPAD_BUTTONS) => {
    vibrateTactile();
    const mask = GAMEPAD_BUTTONS[btnKey];
    activeRef.current.buttons |= mask;
    setActiveButtons(activeRef.current.buttons);

    if (mode === "gamepad") {
      sendGamepadState(
        activeRef.current.buttons,
        activeRef.current.up,
        activeRef.current.down,
        activeRef.current.left,
        activeRef.current.right,
      );
    } else {
      // Keyboard mapping (WASD or Retro Arrows)
      const mappingTable =
        mode === "pc_wasd" ? PC_KEYBOARD_MAPPINGS : RETRO_KEYBOARD_MAPPINGS;
      const mapping =
        mappingTable[btnKey as keyof typeof mappingTable];
      if (mapping) {
        if (mapping.modifier) heldModifiersRef.current |= mapping.modifier;
        for (const code of mapping.keys) heldKeysRef.current.add(code);
        syncKeyboardReport();
      }
    }
  };

  const handleButtonPressOut = (btnKey: keyof typeof GAMEPAD_BUTTONS) => {
    const mask = GAMEPAD_BUTTONS[btnKey];
    activeRef.current.buttons &= ~mask;
    setActiveButtons(activeRef.current.buttons);

    if (mode === "gamepad") {
      sendGamepadState(
        activeRef.current.buttons,
        activeRef.current.up,
        activeRef.current.down,
        activeRef.current.left,
        activeRef.current.right,
      );
    } else {
      const mappingTable =
        mode === "pc_wasd" ? PC_KEYBOARD_MAPPINGS : RETRO_KEYBOARD_MAPPINGS;
      const mapping =
        mappingTable[btnKey as keyof typeof mappingTable];
      if (mapping) {
        if (mapping.modifier) heldModifiersRef.current &= ~mapping.modifier;
        for (const code of mapping.keys) heldKeysRef.current.delete(code);
        syncKeyboardReport();
      }
    }
  };

  const handleDpadPressIn = (dir: "up" | "down" | "left" | "right") => {
    vibrateTactile();
    activeRef.current[dir] = true;
    setDpadState((prev) => ({ ...prev, [dir]: true }));

    if (mode === "gamepad") {
      sendGamepadState(
        activeRef.current.buttons,
        activeRef.current.up,
        activeRef.current.down,
        activeRef.current.left,
        activeRef.current.right,
      );
    } else {
      const mappingTable =
        mode === "pc_wasd" ? PC_KEYBOARD_MAPPINGS : RETRO_KEYBOARD_MAPPINGS;
      const mapKey = `DPAD_${dir.toUpperCase()}` as keyof typeof mappingTable;
      const mapping = mappingTable[mapKey];
      if (mapping) {
        for (const code of mapping.keys) heldKeysRef.current.add(code);
        syncKeyboardReport();
      }
    }
  };

  const handleDpadPressOut = (dir: "up" | "down" | "left" | "right") => {
    activeRef.current[dir] = false;
    setDpadState((prev) => ({ ...prev, [dir]: false }));

    if (mode === "gamepad") {
      sendGamepadState(
        activeRef.current.buttons,
        activeRef.current.up,
        activeRef.current.down,
        activeRef.current.left,
        activeRef.current.right,
      );
    } else {
      const mappingTable =
        mode === "pc_wasd" ? PC_KEYBOARD_MAPPINGS : RETRO_KEYBOARD_MAPPINGS;
      const mapKey = `DPAD_${dir.toUpperCase()}` as keyof typeof mappingTable;
      const mapping = mappingTable[mapKey];
      if (mapping) {
        for (const code of mapping.keys) heldKeysRef.current.delete(code);
        syncKeyboardReport();
      }
    }
  };

  const resetAll = () => {
    activeRef.current = {
      buttons: 0,
      up: false,
      down: false,
      left: false,
      right: false,
    };
    setActiveButtons(0);
    setDpadState({ up: false, down: false, left: false, right: false });
    heldKeysRef.current.clear();
    heldModifiersRef.current = 0;
    void transport.release();
  };

  const isBtnActive = (key: keyof typeof GAMEPAD_BUTTONS) =>
    (activeButtons & GAMEPAD_BUTTONS[key]) !== 0;

  return (
    <View style={styles.container}>
      {/* HUD Header Card */}
      <View style={styles.hudCard}>
        <View style={styles.hudTopRow}>
          <View style={styles.hudBrand}>
            <View style={styles.hudIconBadge}>
              <Gamepad2 size={18} color={t.accent} />
            </View>
            <View>
              <Text style={styles.hudTitle}>Console Deck</Text>
              <Text style={styles.hudSubtitle}>
                {mode === "gamepad"
                  ? "HID Gamepad · DirectInput / Steam"
                  : mode === "pc_wasd"
                    ? "PC Keys · WASD + Space"
                    : "Retro Keys · Arrows + Z/X"}
              </Text>
            </View>
          </View>

          {/* Quick Connect / Status Pill */}
          {connected ? (
            <View style={styles.connectedBadge}>
              <CheckCircle2 size={14} color={t.success} />
              <Text style={styles.connectedText} numberOfLines={1}>
                {connection.device?.name || "Connected"}
              </Text>
            </View>
          ) : (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Connect Bluetooth Host"
              onPress={() => void openDevices()}
              style={styles.connectPill}
            >
              <Bluetooth size={14} color={t.accent} />
              <Text style={styles.connectPillText}>Connect</Text>
            </Pressable>
          )}
        </View>

        {/* Mode Selector Switcher */}
        <View style={styles.modePills}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Switch to Gamepad HID Mode"
            onPress={() => {
              resetAll();
              setMode("gamepad");
            }}
            style={[
              styles.modePill,
              mode === "gamepad" && styles.modePillActive,
            ]}
          >
            <Text
              style={[
                styles.modePillText,
                mode === "gamepad" && styles.modePillTextActive,
              ]}
            >
              HID Pad
            </Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Switch to PC WASD Mode"
            onPress={() => {
              resetAll();
              setMode("pc_wasd");
            }}
            style={[
              styles.modePill,
              mode === "pc_wasd" && styles.modePillActive,
            ]}
          >
            <Text
              style={[
                styles.modePillText,
                mode === "pc_wasd" && styles.modePillTextActive,
              ]}
            >
              WASD
            </Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Switch to Retro Arrows Mode"
            onPress={() => {
              resetAll();
              setMode("pc_arrows");
            }}
            style={[
              styles.modePill,
              mode === "pc_arrows" && styles.modePillActive,
            ]}
          >
            <Text
              style={[
                styles.modePillText,
                mode === "pc_arrows" && styles.modePillTextActive,
              ]}
            >
              Arrows
            </Text>
          </Pressable>
        </View>
      </View>

      {/* Shoulder Triggers / Bumpers Bar */}
      <View style={styles.shoulderRow}>
        {/* Left Shoulder: L2 & L1 */}
        <View style={styles.shoulderGroup}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Left Trigger L2"
            onPressIn={() => handleButtonPressIn("L2")}
            onPressOut={() => handleButtonPressOut("L2")}
            style={[
              styles.triggerBtn,
              isBtnActive("L2") && styles.triggerBtnActive,
            ]}
          >
            <Text style={styles.shoulderText}>L2</Text>
            <Text style={styles.triggerSubtext}>
              {mode === "gamepad" ? "TRIG" : "SHIFT"}
            </Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Left Bumper L1"
            onPressIn={() => handleButtonPressIn("L1")}
            onPressOut={() => handleButtonPressOut("L1")}
            style={[
              styles.bumperBtn,
              isBtnActive("L1") && styles.bumperBtnActive,
            ]}
          >
            <Text style={styles.shoulderText}>L1</Text>
            <Text style={styles.triggerSubtext}>
              {mode === "gamepad" ? "BUMP" : "Q"}
            </Text>
          </Pressable>
        </View>

        {/* Center System Buttons */}
        <View style={styles.centerGroup}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Select button"
            onPressIn={() => handleButtonPressIn("SELECT")}
            onPressOut={() => handleButtonPressOut("SELECT")}
            style={[
              styles.sysBtn,
              isBtnActive("SELECT") && styles.sysBtnActive,
            ]}
          >
            <Text style={styles.sysText}>SELECT</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Start button"
            onPressIn={() => handleButtonPressIn("START")}
            onPressOut={() => handleButtonPressOut("START")}
            style={[
              styles.sysBtn,
              isBtnActive("START") && styles.sysBtnActive,
            ]}
          >
            <Text style={styles.sysText}>START</Text>
          </Pressable>
        </View>

        {/* Right Shoulder: R1 & R2 */}
        <View style={styles.shoulderGroup}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Right Bumper R1"
            onPressIn={() => handleButtonPressIn("R1")}
            onPressOut={() => handleButtonPressOut("R1")}
            style={[
              styles.bumperBtn,
              isBtnActive("R1") && styles.bumperBtnActive,
            ]}
          >
            <Text style={styles.shoulderText}>R1</Text>
            <Text style={styles.triggerSubtext}>
              {mode === "gamepad" ? "BUMP" : "E"}
            </Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Right Trigger R2"
            onPressIn={() => handleButtonPressIn("R2")}
            onPressOut={() => handleButtonPressOut("R2")}
            style={[
              styles.triggerBtn,
              isBtnActive("R2") && styles.triggerBtnActive,
            ]}
          >
            <Text style={styles.shoulderText}>R2</Text>
            <Text style={styles.triggerSubtext}>
              {mode === "gamepad" ? "TRIG" : "CTRL"}
            </Text>
          </Pressable>
        </View>
      </View>

      {/* Main Controls Deck: D-Pad (Left) and ABXY Diamond (Right) */}
      <View style={styles.deckRow}>
        {/* D-Pad Section */}
        <View style={styles.dpadDeck}>
          <View style={styles.dpadCross}>
            {/* UP */}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="D-Pad Up"
              onPressIn={() => handleDpadPressIn("up")}
              onPressOut={() => handleDpadPressOut("up")}
              style={[
                styles.dpadBtn,
                styles.dpadUp,
                dpadState.up && styles.dpadBtnActive,
              ]}
            >
              <ChevronUp size={24} color={dpadState.up ? t.accent : t.text} />
            </Pressable>

            {/* LEFT */}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="D-Pad Left"
              onPressIn={() => handleDpadPressIn("left")}
              onPressOut={() => handleDpadPressOut("left")}
              style={[
                styles.dpadBtn,
                styles.dpadLeft,
                dpadState.left && styles.dpadBtnActive,
              ]}
            >
              <ChevronLeft size={24} color={dpadState.left ? t.accent : t.text} />
            </Pressable>

            {/* D-Pad Center Pivot */}
            <View style={styles.dpadCenter}>
              <View style={styles.dpadPivotCircle} />
            </View>

            {/* RIGHT */}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="D-Pad Right"
              onPressIn={() => handleDpadPressIn("right")}
              onPressOut={() => handleDpadPressOut("right")}
              style={[
                styles.dpadBtn,
                styles.dpadRight,
                dpadState.right && styles.dpadBtnActive,
              ]}
            >
              <ChevronRight size={24} color={dpadState.right ? t.accent : t.text} />
            </Pressable>

            {/* DOWN */}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="D-Pad Down"
              onPressIn={() => handleDpadPressIn("down")}
              onPressOut={() => handleDpadPressOut("down")}
              style={[
                styles.dpadBtn,
                styles.dpadDown,
                dpadState.down && styles.dpadBtnActive,
              ]}
            >
              <ChevronDown size={24} color={dpadState.down ? t.accent : t.text} />
            </Pressable>
          </View>
          <Text style={styles.deckLabel}>DIRECTIONAL PAD</Text>
        </View>

        {/* Action Buttons Diamond Section (Y, X, B, A) */}
        <View style={styles.actionDeck}>
          <View style={styles.actionDiamond}>
            {/* Y Button (Top) */}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Button Y"
              onPressIn={() => handleButtonPressIn("Y")}
              onPressOut={() => handleButtonPressOut("Y")}
              style={[
                styles.actionBtn,
                styles.actionY,
                isBtnActive("Y") && styles.actionBtnActive,
              ]}
            >
              <Text style={[styles.actionLetter, { color: "#FBBF24" }]}>Y</Text>
            </Pressable>

            {/* X Button (Left) */}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Button X"
              onPressIn={() => handleButtonPressIn("X")}
              onPressOut={() => handleButtonPressOut("X")}
              style={[
                styles.actionBtn,
                styles.actionX,
                isBtnActive("X") && styles.actionBtnActive,
              ]}
            >
              <Text style={[styles.actionLetter, { color: "#60A5FA" }]}>X</Text>
            </Pressable>

            {/* B Button (Right) */}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Button B"
              onPressIn={() => handleButtonPressIn("B")}
              onPressOut={() => handleButtonPressOut("B")}
              style={[
                styles.actionBtn,
                styles.actionB,
                isBtnActive("B") && styles.actionBtnActive,
              ]}
            >
              <Text style={[styles.actionLetter, { color: "#F87171" }]}>B</Text>
            </Pressable>

            {/* A Button (Bottom) */}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Button A"
              onPressIn={() => handleButtonPressIn("A")}
              onPressOut={() => handleButtonPressOut("A")}
              style={[
                styles.actionBtn,
                styles.actionA,
                isBtnActive("A") && styles.actionBtnActive,
              ]}
            >
              <Text style={[styles.actionLetter, { color: "#34D399" }]}>A</Text>
            </Pressable>
          </View>
          <Text style={styles.deckLabel}>ACTION BUTTONS</Text>
        </View>
      </View>

      {/* Thumbstick Stick-Click Bar (L3 / R3) */}
      <View style={styles.stickRow}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Left Stick Click L3"
          onPressIn={() => handleButtonPressIn("L3")}
          onPressOut={() => handleButtonPressOut("L3")}
          style={[styles.stickBtn, isBtnActive("L3") && styles.stickBtnActive]}
        >
          <View style={styles.stickDot} />
          <Text style={styles.stickText}>L3 (Stick)</Text>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Right Stick Click R3"
          onPressIn={() => handleButtonPressIn("R3")}
          onPressOut={() => handleButtonPressOut("R3")}
          style={[styles.stickBtn, isBtnActive("R3") && styles.stickBtnActive]}
        >
          <View style={styles.stickDot} />
          <Text style={styles.stickText}>R3 (Stick)</Text>
        </Pressable>
      </View>

      {/* Bottom Auxiliary Controls */}
      <View style={styles.bottomBar}>
        <View style={styles.auxPill}>
          <Zap size={13} color={t.accent} />
          <Text style={styles.auxPillText}>Low Latency Bluetooth HID</Text>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Reset controller inputs"
          onPress={resetAll}
          style={styles.resetBtn}
        >
          <RotateCcw size={13} color={t.muted} />
          <Text style={styles.resetBtnText}>Release all</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
    paddingBottom: 16,
  },
  hudCard: {
    backgroundColor: t.panel,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: t.border,
    padding: 14,
    gap: 12,
  },
  hudTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  hudBrand: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  hudIconBadge: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: t.raised,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: t.border,
  },
  hudTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: t.text,
    letterSpacing: -0.2,
  },
  hudSubtitle: {
    fontSize: 11,
    color: t.muted,
    marginTop: 1,
  },
  connectedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "rgba(16, 185, 129, 0.12)",
    borderWidth: 1,
    borderColor: "rgba(16, 185, 129, 0.3)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    maxWidth: 120,
  },
  connectedText: {
    fontSize: 11,
    color: t.success,
    fontWeight: "600",
  },
  connectPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: t.raised,
    borderWidth: 1,
    borderColor: t.border,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
  },
  connectPillText: {
    fontSize: 12,
    color: t.accent,
    fontWeight: "600",
  },
  modePills: {
    flexDirection: "row",
    backgroundColor: t.raised,
    borderRadius: 12,
    padding: 3,
    borderWidth: 1,
    borderColor: t.border,
  },
  modePill: {
    flex: 1,
    paddingVertical: 6,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
  },
  modePillActive: {
    backgroundColor: t.dark,
    borderWidth: 1,
    borderColor: t.accent,
  },
  modePillText: {
    fontSize: 12,
    fontWeight: "600",
    color: t.muted,
  },
  modePillTextActive: {
    color: t.accent,
  },
  shoulderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 8,
  },
  shoulderGroup: {
    flexDirection: "row",
    gap: 6,
    flex: 1,
  },
  centerGroup: {
    flexDirection: "row",
    gap: 4,
    justifyContent: "center",
  },
  triggerBtn: {
    flex: 1,
    backgroundColor: t.panel,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#303A4C",
    paddingVertical: 8,
    paddingHorizontal: 4,
    alignItems: "center",
    justifyContent: "center",
  },
  triggerBtnActive: {
    backgroundColor: t.dark,
    borderColor: t.accent,
    transform: [{ scale: 0.95 }],
  },
  bumperBtn: {
    flex: 1,
    backgroundColor: t.raised,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: t.border,
    paddingVertical: 8,
    paddingHorizontal: 4,
    alignItems: "center",
    justifyContent: "center",
  },
  bumperBtnActive: {
    backgroundColor: t.dark,
    borderColor: t.accent,
    transform: [{ scale: 0.95 }],
  },
  shoulderText: {
    fontSize: 13,
    fontWeight: "800",
    color: t.text,
  },
  triggerSubtext: {
    fontSize: 9,
    fontFamily: mono,
    color: t.muted,
    marginTop: 2,
    fontWeight: "600",
  },
  sysBtn: {
    backgroundColor: t.raised,
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: t.border,
    alignItems: "center",
    justifyContent: "center",
  },
  sysBtnActive: {
    backgroundColor: t.dark,
    borderColor: t.accent,
    transform: [{ scale: 0.95 }],
  },
  sysText: {
    fontSize: 9,
    fontWeight: "700",
    color: t.muted,
    letterSpacing: 0.5,
  },
  deckRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  dpadDeck: {
    flex: 1,
    backgroundColor: t.panel,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: t.border,
    padding: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  actionDeck: {
    flex: 1,
    backgroundColor: t.panel,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: t.border,
    padding: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  deckLabel: {
    fontSize: 9,
    fontFamily: mono,
    color: t.muted,
    marginTop: 10,
    letterSpacing: 0.8,
    fontWeight: "600",
  },
  dpadCross: {
    width: 132,
    height: 132,
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  dpadBtn: {
    position: "absolute",
    backgroundColor: "#18202C",
    borderWidth: 1.5,
    borderColor: "#334155",
    alignItems: "center",
    justifyContent: "center",
  },
  dpadBtnActive: {
    backgroundColor: "#1E293B",
    borderColor: t.accent,
    transform: [{ scale: 0.96 }],
  },
  dpadUp: {
    top: 0,
    width: 44,
    height: 48,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  dpadDown: {
    bottom: 0,
    width: 44,
    height: 48,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
  },
  dpadLeft: {
    left: 0,
    width: 48,
    height: 44,
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10,
  },
  dpadRight: {
    right: 0,
    width: 48,
    height: 44,
    borderTopRightRadius: 10,
    borderBottomRightRadius: 10,
  },
  dpadCenter: {
    width: 44,
    height: 44,
    backgroundColor: "#18202C",
    alignItems: "center",
    justifyContent: "center",
  },
  dpadPivotCircle: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#0F172A",
    borderWidth: 1,
    borderColor: "#334155",
  },
  actionDiamond: {
    width: 132,
    height: 132,
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  actionBtn: {
    position: "absolute",
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#18202C",
    borderWidth: 1.5,
    borderColor: "#334155",
    alignItems: "center",
    justifyContent: "center",
    elevation: 2,
  },
  actionBtnActive: {
    backgroundColor: "#1E293B",
    borderColor: t.accent,
    transform: [{ scale: 0.92 }],
  },
  actionY: {
    top: 4,
  },
  actionA: {
    bottom: 4,
  },
  actionX: {
    left: 4,
  },
  actionB: {
    right: 4,
  },
  actionLetter: {
    fontSize: 18,
    fontWeight: "900",
  },
  stickRow: {
    flexDirection: "row",
    gap: 12,
  },
  stickBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: t.panel,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: t.border,
    paddingVertical: 10,
  },
  stickBtnActive: {
    backgroundColor: t.raised,
    borderColor: t.accent,
    transform: [{ scale: 0.96 }],
  },
  stickDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: t.accent,
  },
  stickText: {
    fontSize: 12,
    fontWeight: "700",
    color: t.text,
  },
  bottomBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 4,
  },
  auxPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: t.panel,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: t.border,
  },
  auxPillText: {
    fontSize: 10,
    color: t.muted,
    fontFamily: mono,
  },
  resetBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  resetBtnText: {
    fontSize: 11,
    color: t.muted,
  },
});
