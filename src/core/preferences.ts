export type Preferences = {
  host: "Windows" | "macOS" | "Linux";
  sensitivity: number;
  pointerRate: 30 | 60;
};
export const defaults: Preferences = {
  host: "Windows",
  sensitivity: 1.5,
  pointerRate: 30,
};
export function parsePreferences(value: string | null): Preferences {
  try {
    const parsed = JSON.parse(value || "{}");
    return {
      host: ["Windows", "macOS", "Linux"].includes(parsed?.host)
        ? parsed.host
        : defaults.host,
      sensitivity: [0.75, 1.5, 2.5].includes(parsed?.sensitivity)
        ? parsed.sensitivity
        : defaults.sensitivity,
      pointerRate: parsed?.pointerRate === 60 ? 60 : 30,
    };
  } catch {
    return { ...defaults };
  }
}
