import { Platform, PermissionsAndroid } from "react-native";
import { requireOptionalNativeModule } from "expo";
import { createTransportCore, NativeHid } from "./transportCore";
export type {
  Connection,
  Device,
  HidTransport,
  GamepadReport,
} from "./transportCore";

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
    const permissions: (keyof typeof PermissionsAndroid.PERMISSIONS)[] = [
      "BLUETOOTH_CONNECT" as keyof typeof PermissionsAndroid.PERMISSIONS,
      "BLUETOOTH_ADVERTISE" as keyof typeof PermissionsAndroid.PERMISSIONS,
    ];
    if (PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN) {
      permissions.push(
        "BLUETOOTH_SCAN" as keyof typeof PermissionsAndroid.PERMISSIONS,
      );
    }
    const result = await PermissionsAndroid.requestMultiple(
      permissions.map((p) => PermissionsAndroid.PERMISSIONS[p]),
    );
    if (
      result[PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT] !== "granted"
    ) {
      throw new Error(
        "Allow Nearby devices (Bluetooth) in Android Settings, then try again.",
      );
    }
  });
}
