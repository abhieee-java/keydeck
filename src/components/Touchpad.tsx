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
  const [moreControls, setMoreControls] = useState(false);
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
    <View style={{ gap: 12 }}>
      <View
        {...responder.panHandlers}
        accessibilityLabel="Touchpad. Drag to move, tap to click, two fingers to scroll. Extra controls provide button alternatives."
        style={styles.pad}
      >
        <View pointerEvents="none" style={styles.padTop}>
          <Text style={styles.padLabel}>TOUCH SURFACE</Text>
          <Move size={15} color={t.muted} />
        </View>
        <View pointerEvents="none" style={styles.center}>
          <View style={styles.pointerHalo}>
            <MousePointer2 size={30} color={t.accent} strokeWidth={1.5} />
          </View>
          <Text style={styles.padTitle}>
            {enabled ? "Make your move." : "A little space to move."}
          </Text>
          <Text style={[s.body, { textAlign: "center", fontSize: 12 }]}>
            {enabled
              ? "One finger to move. Two to scroll."
              : "Connect your computer to begin."}
          </Text>
        </View>
        <View pointerEvents="none" style={styles.padBottom}>
          <View
            style={[
              styles.liveDot,
              { backgroundColor: enabled ? t.success : t.muted },
            ]}
          />
          <Text style={styles.padLabel}>
            {enabled ? "READY FOR INPUT" : "NOT CONNECTED"}
          </Text>
        </View>
      </View>
      <View style={{ flexDirection: "row", gap: 8 }}>
        <Button
          style={{ flex: 1 }}
          disabled={!enabled}
          onPress={() => void click(1)}
        >
          Left click
        </Button>
        <Button
          style={{ flex: 1 }}
          disabled={!enabled}
          onPress={() => void click(2)}
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
      <Button onPress={() => setMoreControls(!moreControls)}>
        {moreControls ? "Hide extra controls" : "More controls"}
      </Button>
      {moreControls && (
        <View
          style={{
            flexDirection: "row",
            flexWrap: "wrap",
            gap: 8,
            justifyContent: "center",
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
      )}
    </View>
  );
}
const styles = StyleSheet.create({
  pad: {
    minHeight: 250,
    backgroundColor: "#101722",
    borderWidth: 1,
    borderColor: "#2B3A52",
    borderRadius: 22,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    touchAction: "none",
  } as any,
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
    letterSpacing: 1.4,
    color: "#A1AEC3",
  },
  center: { alignItems: "center", gap: 10, padding: 20 },
  pointerHalo: {
    backgroundColor: "#24324E",
    padding: 16,
    borderRadius: 23,
    marginBottom: 2,
  },
  padTitle: {
    color: t.text,
    fontSize: 20,
    fontWeight: "500",
    letterSpacing: -0.5,
  },
  padBottom: {
    position: "absolute",
    bottom: 18,
    flexDirection: "row",
    gap: 7,
    alignItems: "center",
  },
  liveDot: { height: 5, width: 5, borderRadius: 3 },
});
