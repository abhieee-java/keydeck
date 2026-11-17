import { Platform, PermissionsAndroid } from "react-native";
import { requireOptionalNativeModule } from "expo";
import { createTransportCore, NativeHid } from "./transportCore";
export type { Connection, Device, HidTransport } from "./transportCore";
export const nativeHid =
  Platform.OS === "android"
    ? requireOptionalNativeModule<NativeHid>("BluetoothHid")
    : null;
export function createTransport(
  preview: boolean,
  log: (message: string) => void,
) {
  return createTransportCore(preview, log, nativeHid, async () => {
    if (Number(Platform.Version) < 31) return;
    const result = await PermissionsAndroid.requestMultiple([
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_ADVERTISE,
    ]);
    if (Object.values(result).some((v) => v !== "granted"))
      throw new Error(
        "Allow Nearby devices in Android Settings, then try again.",
      );
  });
}
