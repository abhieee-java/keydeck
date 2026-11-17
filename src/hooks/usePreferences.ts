import { useCallback, useEffect, useRef, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { defaults, parsePreferences, Preferences } from "../core/preferences";
const STORAGE_KEY = "keydeck.preferences.v1";
export function usePreferences() {
  const [preferences, setPreferences] = useState<Preferences>(defaults);
  const [warning, setWarning] = useState("");
  const revision = useRef(0);
  const writes = useRef(Promise.resolve());
  const latest = useRef<Preferences>(defaults);
  useEffect(() => {
    let mounted = true;
    void AsyncStorage.getItem(STORAGE_KEY)
      .then((value) => {
        if (!mounted || revision.current !== 0) return;
        latest.current = parsePreferences(value);
        setPreferences(latest.current);
      })
      .catch(() => {
        if (mounted)
          setWarning(
            "Preferences could not be loaded. Default settings are active.",
          );
      });
    return () => {
      mounted = false;
    };
  }, []);
  const update = useCallback((patch: Partial<Preferences>) => {
    revision.current++;
    latest.current = { ...latest.current, ...patch };
    const next = latest.current;
    setPreferences(next);
    setWarning("");
    writes.current = writes.current
      .then(() => AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)))
      .catch(() =>
        setWarning(
          "Preferences could not be saved. They will reset when the app closes.",
        ),
      );
  }, []);
  return { preferences, update, warning };
}
