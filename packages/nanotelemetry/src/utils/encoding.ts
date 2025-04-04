export function getRandomHexLowercase(bytes = 16): string {
  const array = new Uint8Array(bytes);
  crypto.getRandomValues(array);

  let hex = "";
  for (const byte of array) {
    hex += byte.toString(16).padStart(2, "0");
  }

  return hex;
}