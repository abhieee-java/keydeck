import React, { useState } from "react";
import { Text, TextInput, View } from "react-native";
import { Button, s } from "./ui";
import { modifiers } from "../core/hid";
import { theme as t } from "../theme";

/** Emits a chord through the same input boundary as preset shortcuts. */
export function ShortcutComposer({
  enabled,
  send,
}: {
  enabled: boolean;
  send: (names: string[]) => Promise<void>;
}) {
  const [selected, setSelected] = useState<string[]>([]);
  const [key, setKey] = useState("");
  const [sending, setSending] = useState(false);
  return (
    <View style={{ gap: 12, marginTop: 24 }}>
      <Text style={{ color: t.text, fontSize: 14, fontWeight: "600" }}>
        Custom shortcut
      </Text>
      <Text style={s.body}>
        Choose modifiers and a letter or key name, such as A, Enter, or F5. Meta
        is the Windows or Command key.
      </Text>
      <View style={[s.row, { flexWrap: "wrap" }]}>
        {Object.keys(modifiers).map((name) => (
          <Button
            key={name}
            primary={selected.includes(name)}
            onPress={() =>
              setSelected((values) =>
                values.includes(name)
                  ? values.filter((v) => v !== name)
                  : [...values, name],
              )
            }
          >
            {name}
          </Button>
        ))}
      </View>
      <TextInput
        accessibilityLabel="Shortcut key"
        value={key}
        onChangeText={setKey}
        placeholder="Key name, e.g. a or Tab"
        placeholderTextColor={t.muted}
        autoCapitalize="none"
        autoCorrect={false}
        style={s.input}
      />
      <Button
        disabled={!enabled || !key.trim() || sending}
        onPress={() => {
          setSending(true);
          void send([...selected, key.trim()]).finally(() => setSending(false));
        }}
      >
        {sending
          ? "Sending…"
          : `Send ${[...selected, key.trim()].filter(Boolean).join(" + ") || "shortcut"}`}
      </Button>
    </View>
  );
}
