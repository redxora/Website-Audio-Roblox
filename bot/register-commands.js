import { REST, Routes, SlashCommandBuilder } from "discord.js";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

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
const clientId = process.env.DISCORD_CLIENT_ID?.trim();
const guildId = process.env.DISCORD_GUILD_ID?.trim();

if (!token || !clientId || !guildId) {
  console.error("❌ DISCORD_BOT_TOKEN, DISCORD_CLIENT_ID, atau DISCORD_GUILD_ID belum disetting di file .env");
  process.exit(1);
}

export const slashCommands = [
  new SlashCommandBuilder()
    .setName("download")
    .setDescription("Download an asset from Roblox (Audio, Animasi, Decal, Emote, atau Batch)")
    .addStringOption((opt) =>
      opt
        .setName("asset_id")
        .setDescription("ID Asset atau Link Roblox")
        .setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName("spoofer")
    .setDescription("Asset Spoofer & Downloader Roblox")
    .addStringOption((opt) =>
      opt
        .setName("asset_id")
        .setDescription("ID Asset Roblox")
        .setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName("batchdownload")
    .setDescription("Unduh banyak aset Roblox sekaligus")
    .addStringOption((opt) =>
      opt
        .setName("asset_ids")
        .setDescription("Daftar ID Asset")
        .setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName("convert")
    .setDescription("Konversi dan sesuaikan kecepatan/format file audio")
    .addAttachmentOption((opt) =>
      opt
        .setName("file")
        .setDescription("File audio yang ingin diolah")
        .setRequired(true)
    )
    .addNumberOption((opt) =>
      opt
        .setName("speed")
        .setDescription("Kecepatan pemutaran")
        .setRequired(false)
    )
    .addStringOption((opt) =>
      opt
        .setName("format")
        .setDescription("Format output audio")
        .setRequired(false)
        .addChoices(
          { name: "MP3 Audio", value: "mp3" },
          { name: "WAV High Quality", value: "wav" },
          { name: "OGG Vorbis", value: "ogg" }
        )
    ),

  new SlashCommandBuilder()
    .setName("upload-roblox")
    .setDescription("Upload audio otomatis langsung ke akun atau grup Roblox kamu")
    .addAttachmentOption((opt) =>
      opt
        .setName("file")
        .setDescription("File audio yang ingin diunggah ke Roblox")
        .setRequired(true)
    )
    .addStringOption((opt) =>
      opt
        .setName("name")
        .setDescription("Nama aset audio di Roblox (opsional)")
        .setRequired(false)
    )
    .addStringOption((opt) =>
      opt
        .setName("group_id")
        .setDescription("ID Grup Roblox (khusus paket Weekly ke atas)")
        .setRequired(false)
    ),

  new SlashCommandBuilder()
    .setName("plans")
    .setDescription("Lihat rincian paket berlangganan & harga resmi Cilaaa Community"),

  new SlashCommandBuilder()
    .setName("status")
    .setDescription("Cek status langganan, masa aktif, sisa kuota 24 jam, dan role akun kamu"),

  new SlashCommandBuilder()
    .setName("mystats")
    .setDescription("Lihat statistik unduhan dan konversi aset akun kamu"),

  new SlashCommandBuilder()
    .setName("history")
    .setDescription("Lihat riwayat 5 unduhan aset terakhir kamu"),

  new SlashCommandBuilder()
    .setName("queue")
    .setDescription("Cek status antrean pemrosesan server saat ini"),

  new SlashCommandBuilder()
    .setName("help")
    .setDescription("Panduan lengkap perintah dan fitur bot Cilaaa Community"),

  new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Cek latensi dan responsivitas koneksi bot"),

  new SlashCommandBuilder()
    .setName("uptime")
    .setDescription("Cek waktu aktif server dan proses bot"),

  new SlashCommandBuilder()
    .setName("tos")
    .setDescription("Ketentuan Layanan (Terms of Service) & Kebijakan Fair Use"),

  new SlashCommandBuilder()
    .setName("library")
    .setDescription("Katalog pustaka audio populer dari game Roblox")
    .addStringOption((opt) =>
      opt
        .setName("game")
        .setDescription("Nama game Roblox")
        .setRequired(false)
    ),
];

async function main() {
  const rest = new REST({ version: "10" }).setToken(token);
  try {
    console.log(`[Slash Commands] Mendaftarkan ${slashCommands.length} perintah ke Guild: ${guildId}...`);
    const body = slashCommands.map((c) => c.toJSON());

    await rest.put(Routes.applicationGuildCommands(clientId, guildId), { body });
    console.log("✅ Berhasil mendaftarkan semua slash commands ke Discord!");
  } catch (error) {
    console.error("❌ Gagal mendaftarkan slash commands:", error);
    process.exit(1);
  }
}

main();
