import { Platform } from "react-native";

let inMemoryDeviceId = null;

export async function getDeviceId() {
  if (inMemoryDeviceId) return inMemoryDeviceId;

  // Generates persistent pseudo-unique ID for testing/production
  inMemoryDeviceId =
    "octave_" + Platform.OS + "_" + Math.random().toString(36).substring(2, 12);
  return inMemoryDeviceId;
}
