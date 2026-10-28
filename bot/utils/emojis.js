import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const configPath = path.resolve(__dirname, "../emojis.json");

let configCache = null;
let lastMtime = 0;

function loadConfig() {
  try {
    const stats = fs.statSync(configPath);
    if (!configCache || stats.mtimeMs > lastMtime) {
      configCache = JSON.parse(fs.readFileSync(configPath, "utf-8"));
      lastMtime = stats.mtimeMs;
    }
  } catch (err) {
    if (!configCache) {
      configCache = { branding: {}, emojis: {} };
    }
  }
  return configCache;
}


export function getEmoji(name) {
  const cfg = loadConfig();
  const entry = cfg.emojis?.[name];
  if (!entry) return "";

  const id = (entry.id || "").trim();
  if (id) {
    if (id.startsWith("<:") || id.startsWith("<a:")) {
      return id;
    }
    const emojiName = entry.name || name;
    return `<:${emojiName}:${id}>`;
  }

  return entry.fallback || "";
}

export function getBranding() {
  const cfg = loadConfig();
  return {
    botName: cfg.branding?.botName || "Cilaaa Community",
    themeColor: cfg.branding?.themeColor ?? 0xff66b2,
    themeColorHex: cfg.branding?.themeColorHex || "#FF66B2",
    successColor: cfg.branding?.successColor ?? 0x10b981,
    warningColor: cfg.branding?.warningColor ?? 0xf59e0b,
    errorColor: cfg.branding?.errorColor ?? 0xef4444,
    infoColor: cfg.branding?.infoColor ?? 0x06b6d4,
    bannerUrl: cfg.branding?.bannerUrl || null,
    footerText: cfg.branding?.footerText || "Cilaaa Community • Fast, Accurate & Professional",
    websiteUrl: (process.env.NEXTAUTH_URL || cfg.branding?.websiteUrl || "http://localhost:3000").replace(/\/$/, ""),
  };
}
