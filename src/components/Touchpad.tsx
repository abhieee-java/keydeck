import React, { useCallback, useMemo, useRef, useState } from "react";
import {
  PanResponder,
  StyleSheet,
  Text,
  View,
  PanResponderGestureState,
  GestureResponderEvent,
} from "react-native";
import {
  MousePointer2,
  Move,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  GripVertical,
} from "lucide-react-native";
import { theme as t, mono } from "../theme";
import { Button, IconButton, s } from "./ui";
export function Touchpad({
  enabled,
  send,
  sensitivity,
}: {
  enabled: boolean;
  send: (
    x: number,
    y: number,
    buttons?: number,
    wheel?: number,
  ) => Promise<void>;
  sensitivity: number;
}) {
  const [dragging, setDragging] = useState(false);
  const [position, setPosition] = useState({ x: 50, y: 50 });
  const previous = useRef({ x: 0, y: 0, time: 0, distance: 0 });
  const click = async (button: number) => {
    if (!enabled) return;
    await send(0, 0, button);
    await send(0, 0, 0);
  };
  const onGrant = useCallback(() => {
    previous.current = { x: 0, y: 0, time: Date.now(), distance: 0 };
  }, []);
  const onMove = useCallback(
    (_event: GestureResponderEvent, gesture: PanResponderGestureState) => {
      const dx = gesture.dx - previous.current.x;
      const dy = gesture.dy - previous.current.y;
      previous.current.x = gesture.dx;
      previous.current.y = gesture.dy;
      previous.current.distance += Math.abs(dx) + Math.abs(dy);
      if (gesture.numberActiveTouches > 1)
        void send(0, 0, dragging ? 1 : 0, -dy / 6);
      else {
        void send(dx * sensitivity, dy * sensitivity, dragging ? 1 : 0);
        setPosition((p) => ({
          x: Math.max(8, Math.min(92, p.x + dx / 5)),
          y: Math.max(8, Math.min(92, p.y + dy / 4)),
        }));
      }
    },
    [send, sensitivity, dragging],
  );
  const onRelease = useCallback(() => {
    if (
      previous.current.distance < 8 &&
      Date.now() - previous.current.time < 300 &&
      !dragging
    ) {
      void send(0, 0, 1).then(() => send(0, 0, 0));
    } else if (!dragging) void send(0, 0, 0);
  }, [send, dragging]);
  const onTerminate = useCallback(() => {
    setDragging(false);
    void send(0, 0, 0);
  }, [send]);
  const responder = useMemo(
    () =>
      // PanResponder only registers these callbacks; ref reads occur on input events.
      // eslint-disable-next-line react-hooks/refs
      PanResponder.create({
        onStartShouldSetPanResponder: () => enabled,
        onMoveShouldSetPanResponder: () => enabled,
        onPanResponderGrant: onGrant,
        onPanResponderMove: onMove,
        onPanResponderRelease: onRelease,
        onPanResponderTerminate: onTerminate,
      }),
    [enabled, onGrant, onMove, onRelease, onTerminate],
  );
  return (
    <View style={{ gap: 16 }}>
      <View
        {...responder.panHandlers}
        accessibilityLabel="Touchpad. Drag to move, tap to click, two fingers to scroll. Direction buttons are below."
        style={[styles.pad, !enabled && { opacity: 0.55 }]}
      >
        <View pointerEvents="none" style={styles.grid}>
          {Array.from({ length: 12 }, (_, row) => (
            <View key={row} style={styles.dotRow}>
              {Array.from({ length: 24 }, (_, col) => (
                <View key={col} style={styles.dot} />
              ))}
            </View>
          ))}
        </View>
        <View pointerEvents="none" style={styles.padTop}>
          <Text style={styles.padLabel}>TOUCH SURFACE</Text>
          <Move color={t.muted} size={14} />
        </View>
        <View pointerEvents="none" style={styles.center}>
          <View style={styles.pointerHalo}>
            <MousePointer2 size={29} color={t.accent} strokeWidth={1.5} />
          </View>
          <Text style={styles.padTitle}>
            {enabled ? "Your desk. Anywhere." : "Ready when you are."}
          </Text>
          <Text style={s.body}>
            {enabled
              ? "Move a finger to take control"
              : "Connect a device to start controlling"}
          </Text>
        </View>
        <View
          pointerEvents="none"
          style={[
            styles.cross,
            { left: `${position.x}%`, top: `${position.y}%` },
          ]}
        >
          <Text style={{ color: "#a9c57d" }}>+</Text>
        </View>
        <View pointerEvents="none" style={styles.padBottom}>
          <View style={styles.liveDot} />
          <Text style={styles.padLabel}>
            {enabled ? "INPUT READY" : "WAITING FOR CONNECTION"}
          </Text>
        </View>
      </View>
      <View style={{ flexDirection: "row", gap: 10 }}>
        <Button
          disabled={!enabled}
          onPress={() => void click(1)}
          style={{ flex: 1 }}
        >
          Left click
        </Button>
        <Button
          disabled={!enabled}
          onPress={() => void click(2)}
          style={{ flex: 1 }}
        >
          Right click
        </Button>
        <IconButton
          icon={GripVertical}
          label={dragging ? "Release drag" : "Hold left mouse button to drag"}
          disabled={!enabled}
          active={dragging && enabled}
          onPress={() => {
            setDragging(!dragging);
            void send(0, 0, dragging ? 0 : 1);
          }}
        />
      </View>
      <View style={styles.hints}>
        <Text style={styles.hint}>↖ One finger to move</Text>
        <Text style={styles.hint}>↕ Two fingers to scroll</Text>
        <Text style={styles.hint}>· Tap to click</Text>
      </View>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "center",
          flexWrap: "wrap",
          gap: 6,
        }}
      >
        {(
          [
            [ArrowLeft, -20, 0, "Move left"],
            [ArrowUp, 0, -20, "Move up"],
            [ArrowDown, 0, 20, "Move down"],
            [ArrowRight, 20, 0, "Move right"],
          ] as const
        ).map(([Icon, x, y, label]) => (
          <IconButton
            key={label}
            icon={Icon}
            label={label}
            disabled={!enabled}
            onPress={() => void send(x, y)}
          />
        ))}
        <Button disabled={!enabled} onPress={() => void send(0, 0, 0, 3)}>
          Scroll ↑
        </Button>
        <Button disabled={!enabled} onPress={() => void send(0, 0, 0, -3)}>
          Scroll ↓
        </Button>
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  pad: {
    minHeight: 310,
    backgroundColor: "#131713",
    borderWidth: 1,
    borderColor: "#394334",
    borderRadius: 14,
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
    touchAction: "none",
  } as any,
  grid: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    padding: 14,
    justifyContent: "space-between",
  },
  dotRow: { flexDirection: "row", justifyContent: "space-between" },
  dot: { height: 2, width: 2, borderRadius: 1, backgroundColor: "#333D30" },
  padTop: {
    position: "absolute",
    top: 18,
    left: 18,
    right: 18,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  padLabel: {
    fontFamily: mono,
    fontSize: 9,
    letterSpacing: 1.3,
    color: "#8D9B85",
  },
  center: { alignItems: "center", gap: 9 },
  pointerHalo: {
    backgroundColor: "#232E1D",
    padding: 17,
    borderRadius: 22,
    marginBottom: 7,
  },
  padTitle: {
    color: t.text,
    fontSize: 18,
    fontWeight: "500",
    letterSpacing: -0.4,
  },
  cross: { position: "absolute", opacity: 0.5 },
  padBottom: {
    position: "absolute",
    bottom: 18,
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },
  liveDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: t.accent },
  hints: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 16,
  },
  hint: { color: t.muted, fontSize: 11 },
});
