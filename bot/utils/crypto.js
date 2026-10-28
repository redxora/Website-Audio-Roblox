import { createDecipheriv } from "node:crypto";

function getKey() {
  const raw = process.env.APP_ENCRYPTION_KEY;
  if (!raw || !/^[a-fA-F0-9]{64}$/.test(raw)) {
    throw new Error("APP_ENCRYPTION_KEY harus berupa 64 karakter hex.");
  }
  return Buffer.from(raw, "hex");
}

export function decryptSecret(value) {
  if (!value) return "";
  const [ivHex, tagHex, cipherHex, ...extra] = value.split(".");
  if (!ivHex || !tagHex || !cipherHex || extra.length) {
    throw new Error("Format kredensial terenkripsi tidak valid.");
  }

  const decipher = createDecipheriv(
    "aes-256-gcm",
    getKey(),
    Buffer.from(ivHex, "hex")
  );
  decipher.setAuthTag(Buffer.from(tagHex, "hex"));

  return Buffer.concat([
    decipher.update(Buffer.from(cipherHex, "hex")),
    decipher.final(),
  ]).toString("utf8");
}
