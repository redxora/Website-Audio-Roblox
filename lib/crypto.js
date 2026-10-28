import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";
function getKey() {
    const raw = process.env.APP_ENCRYPTION_KEY;
    if (!raw || !/^[a-fA-F0-9]{64}$/.test(raw)) {
        throw new Error("APP_ENCRYPTION_KEY harus berupa 64 karakter hex. Buat: openssl rand -hex 32");
    }
    return Buffer.from(raw, "hex");
}
export function encryptSecret(value) {
    const iv = randomBytes(12);
    const cipher = createCipheriv("aes-256-gcm", getKey(), iv);
    const encrypted = Buffer.concat([
        cipher.update(value, "utf8"),
        cipher.final(),
    ]);
    return `${iv.toString("hex")}.${cipher.getAuthTag().toString("hex")}.${encrypted.toString("hex")}`;
}
export function decryptSecret(value) {
    const [ivHex, tagHex, cipherHex, ...extra] = value.split(".");
    if (!ivHex || !tagHex || !cipherHex || extra.length) {
        throw new Error("Invalid encrypted credentials format.");
    }
    const decipher = createDecipheriv("aes-256-gcm", getKey(), Buffer.from(ivHex, "hex"));
    decipher.setAuthTag(Buffer.from(tagHex, "hex"));
    return Buffer.concat([
        decipher.update(Buffer.from(cipherHex, "hex")),
        decipher.final(),
    ]).toString("utf8");
}
