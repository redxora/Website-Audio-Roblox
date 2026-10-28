import dns from "node:dns";
try {
  dns.setDefaultResultOrder("ipv4first");
} catch { }

import { Client, GatewayIntentBits, MessageFlags } from "discord.js";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { handleDownloadCommand } from "./commands/download.js";
import { handleConvertCommand } from "./commands/convert.js";
import { handleUploadRobloxCommand } from "./commands/roblox.js";
import { handlePlansCommand } from "./commands/plans.js";
import {
  handleStatusCommand,
  handleMyStatsCommand,
  handleQueueCommand,
  handleHistoryCommand,
} from "./commands/stats.js";
import {
  handleHelpCommand,
  handlePingCommand,
  handleUptimeCommand,
  handleTosCommand,
  handleLibraryCommand,
} from "./commands/general.js";

import { startSubscriptionExpirationCron } from "./cron.js";
import { safeReply } from "./utils/reply.js";
import { getEmoji, getBranding } from "./utils/emojis.js";
import { createModernEmbed, yamlBlock } from "./utils/embeds.js";
import { getUserByDiscordId, getLatestRobloxAccount } from "./utils/db.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "../");

try {
  const envPath = path.resolve(rootDir, ".env");
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, "utf-8").split("\n");
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eqIdx = trimmed.indexOf("=");
      if (eqIdx > 0) {
        const k = trimmed.slice(0, eqIdx).trim();
        const v = trimmed.slice(eqIdx + 1).trim();
        if (!process.env[k]) process.env[k] = v;
      }
    }
  }
} catch { }

const token = process.env.DISCORD_BOT_TOKEN?.trim();
const botStartTime = Date.now();

if (!token) {
  console.error("❌ [Cilaaa Bot] DISCORD_BOT_TOKEN tidak ditemukan di file .env!");
  process.exit(1);
}

export const client = new Client({
  intents: [GatewayIntentBits.Guilds],
  rest: {
    timeout: 30000,
    retries: 5,
  },
});

client.once("clientReady", async () => {
  console.log(`[Cilaaa Discord Bot] Berhasil online sebagai ${client.user?.tag}!`);
  console.log("[Runtime] Pure Node.js & JavaScript (Lightweight VPS optimized)");

  startSubscriptionExpirationCron(60000);
});

client.on("error", (error) => {
  console.error("[Cilaaa Bot] Client error:", error);
});

client.on("shardError", (error, shardId) => {
  console.error(`[Cilaaa Bot] Shard ${shardId} error:`, error);
});

client.on("shardDisconnect", (event, shardId) => {
  console.warn(`[Cilaaa Bot] Shard ${shardId} terputus:`, event);
});

client.on("shardReconnecting", (shardId) => {
  console.log(`[Cilaaa Bot] Shard ${shardId} menghubungkan ulang...`);
});

process.on("unhandledRejection", (reason) => {
  console.error("[Cilaaa Bot] Unhandled Rejection:", reason);
});

process.on("uncaughtException", (error) => {
  console.error("[Cilaaa Bot] Uncaught Exception:", error);
});

client.on("interactionCreate", async (interaction) => {
  if (interaction.isChatInputCommand()) {
    const isEphemeral = [
      "status",
      "mystats",
      "history",
      "plans",
      "tos",
      "ping",
      "uptime",
      "queue",
    ].includes(interaction.commandName);

    try {
      await interaction.deferReply({
        flags: isEphemeral ? MessageFlags.Ephemeral : undefined,
      });
    } catch (deferErr) {
      if (deferErr?.code === 10062 || deferErr?.code === 40060) {
        console.warn(`[Cilaaa Bot] Defer notice for /${interaction.commandName}: ${deferErr.message}`);
      } else {
        console.error(`[Cilaaa Bot] Gagal deferReply untuk /${interaction.commandName}:`, deferErr);
      }
      return;
    }

    try {
      switch (interaction.commandName) {
        case "download":
        case "spoofer":
        case "batchdownload":
          await handleDownloadCommand(interaction);
          break;

        case "convert":
          await handleConvertCommand(interaction);
          break;

        case "upload-roblox":
          await handleUploadRobloxCommand(interaction);
          break;

        case "plans":
          await handlePlansCommand(interaction);
          break;

        case "status":
          await handleStatusCommand(interaction);
          break;

        case "mystats":
          await handleMyStatsCommand(interaction);
          break;

        case "queue":
          await handleQueueCommand(interaction);
          break;

        case "history":
          await handleHistoryCommand(interaction);
          break;

        case "help":
          await handleHelpCommand(interaction);
          break;

        case "ping":
          await handlePingCommand(interaction);
          break;

        case "uptime":
          await handleUptimeCommand(interaction, botStartTime);
          break;

        case "tos":
          await handleTosCommand(interaction);
          break;

        case "library":
          await handleLibraryCommand(interaction);
          break;

        default:
          await safeReply(interaction, { content: "Perintah tidak dikenali." }, true);
      }
    } catch (error) {
      console.error(`[Command Error] /${interaction.commandName}:`, error);
      await safeReply(
        interaction,
        {
          content: `${getEmoji("error")} Terjadi kesalahan saat memproses perintah: ${error instanceof Error ? error.message : "Internal error"}`,
        },
        true
      );
    }
    return;
  }

  if (interaction.isButton()) {
    try {
      if (interaction.customId.startsWith("auto_upload_")) {
        const assetId = interaction.customId.replace("auto_upload_", "");
        const user = getUserByDiscordId(interaction.user.id);
        const branding = getBranding();

        if (!user) {
          return await safeReply(interaction, {
            content: `${getEmoji("warning")} Hubungkan akun Discord kamu ke website Cilaaa Community terlebih dahulu untuk mengaktifkan fitur Auto-Upload Roblox!`,
          }, true);
        }

        const robloxAcc = getLatestRobloxAccount(user.id);
        if (!robloxAcc) {
          return await safeReply(interaction, {
            content: `${getEmoji("warning")} Kamu belum mendaftarkan API Key Roblox di website. Buka Dashboard untuk menambahkan API Key kamu.`,
          }, true);
        }

        const embed = createModernEmbed({
          title: `${getEmoji("roblox")} Auto-Upload Roblox Dijadwalkan`,
          description:
            `Permintaan upload aset **${assetId}** telah diterima!\n\n` +
            yamlBlock({
              "Asset ID": assetId,
              "Akun Target": robloxAcc.roblox_username || "Verified Account",
              "Status": "Mengirim ke worker antrean Roblox...",
            }) +
            `\n${getEmoji("sparkles")} Cek status moderasi langsung di dashboard website: ${branding.websiteUrl}`,
          client,
        });

        return await safeReply(interaction, { embeds: [embed] }, true);
      }
    } catch (btnErr) {
      console.error("[Button Error]:", btnErr);
    }
  }
});

client.login(token);
