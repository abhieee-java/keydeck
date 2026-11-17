import React from "react";
import { Pressable, StyleSheet, Text, View, ViewStyle } from "react-native";
import { theme as t, mono } from "../theme";
import type { LucideIcon } from "lucide-react-native";
export function IconButton({
  icon: Icon,
  label,
  onPress,
  active,
  disabled,
}: {
  icon: LucideIcon;
  label: string;
  onPress: () => void;
  active?: boolean;
  disabled?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: !!disabled, selected: !!active }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        s.iconButton,
        active && { backgroundColor: t.accent },
        { opacity: disabled ? 0.35 : pressed ? 0.65 : 1 },
      ]}
    >
      <Icon size={20} color={active ? t.dark : t.text} />
    </Pressable>
  );
}
export function Button({
  children,
  onPress,
  primary,
  disabled,
  icon: Icon,
  style,
}: {
  children: React.ReactNode;
  onPress: () => void;
  primary?: boolean;
  disabled?: boolean;
  icon?: LucideIcon;
  style?: ViewStyle;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !!disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        s.button,
        primary && { backgroundColor: t.accent, borderColor: t.accent },
        style,
        { opacity: disabled ? 0.35 : pressed ? 0.7 : 1 },
      ]}
    >
      {Icon && <Icon size={17} color={primary ? t.dark : t.text} />}
      <Text style={[s.buttonText, primary && { color: t.dark }]}>
        {children}
      </Text>
    </Pressable>
  );
}
export function Label({ children }: { children: React.ReactNode }) {
  return <Text style={s.label}>{children}</Text>;
}
export function Panel({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: ViewStyle;
}) {
  return <View style={[s.panel, style]}>{children}</View>;
}
export const s = StyleSheet.create({
  panel: {
    backgroundColor: t.panel,
    borderColor: t.border,
    borderWidth: 1,
    borderRadius: 18,
    padding: 22,
  },
  label: {
    color: t.muted,
    fontSize: 10,
    fontFamily: mono,
    letterSpacing: 1.7,
    textTransform: "uppercase",
  },
  button: {
    minHeight: 46,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: t.border,
    backgroundColor: t.raised,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
  },
  buttonText: { color: t.text, fontSize: 13, fontWeight: "600" },
  iconButton: {
    width: 46,
    height: 46,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: t.raised,
  },
  title: {
    color: t.text,
    fontSize: 22,
    fontWeight: "600",
    letterSpacing: -0.6,
  },
  body: { color: t.muted, fontSize: 13, lineHeight: 21 },
  row: { flexDirection: "row", alignItems: "center", gap: 12 },
  input: {
    backgroundColor: t.bg,
    color: t.text,
    borderColor: t.border,
    borderWidth: 1,
    borderRadius: 10,
    padding: 16,
    fontFamily: mono,
    fontSize: 13,
    minHeight: 52,
  },
});
