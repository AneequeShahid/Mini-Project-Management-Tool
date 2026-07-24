import crypto from "crypto";

const ALGORITHM = "aes-256-cbc";
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || "pulse_default_encryption_secret_key_32_bytes"; // Must be 32 bytes
const IV_LENGTH = 16;

export function encrypt(text: string): string {
  // Ensure we have a 32-byte key
  const key = Buffer.concat([Buffer.from(ENCRYPTION_KEY), Buffer.alloc(32)], 32);
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  return iv.toString("hex") + ":" + encrypted;
}

export function decrypt(text: string): string {
  const parts = text.split(":");
  const ivString = parts.shift();
  if (!ivString) return "";
  const iv = Buffer.from(ivString, "hex");
  const encryptedText = Buffer.from(parts.join(":"), "hex");
  const key = Buffer.concat([Buffer.from(ENCRYPTION_KEY), Buffer.alloc(32)], 32);
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  let decrypted = decipher.update(encryptedText.toString("hex"), "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}
