import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";
import { getEmoji, getBranding } from "../utils/emojis.js";
import { createModernEmbed, yamlBlock } from "../utils/embeds.js";
import { safeReply } from "../utils/reply.js";

const POPULAR_AUDIOS = [
  { game: "General / SFX", name: "Boom Headshot", id: "130762057" },
  { game: "Doors", name: "Elevator Jam", id: "6821107054" },
  { game: "Murder Mystery 2", name: "Revolver Shot SFX", id: "142376088" },
  { game: "Brookhaven", name: "Car Engine Rev", id: "9043887012" },
  { game: "Meme / Viral", name: "Tada Fanfare", id: "9114223180" },
];

export async function handleHelpCommand(interaction) {
  const branding = getBranding();
  const avatarUrl = interaction.client.user?.displayAvatarURL();

  const embed = createModernEmbed({
    title: `${getEmoji("cilaaa")} Panduan Lengkap Bot Cilaaa Community`,
    description:
      `Selamat datang di bot resmi **Cilaaa Community**! Platform nomor 1 untuk konversi audio, spoofing aset, dan auto-upload Roblox developer.\n\n` +
      `Gunakan perintah-perintah di bawah ini langsung di server Discord:`,
    color: branding.themeColor,
    client: interaction.client,
  });

  embed.addFields(
    {
      name: `${getEmoji("download")} Download & Asset Spoofer`,
      value:
        "`/download <asset_id>` — Download Audio (.mp3), Animasi (.rbxm), Decal (.png), Emote (.rbxm), atau Batch (dipisah koma)\n" +
        "`/library [game]` — Jelajahi katalog ID lagu populer di Roblox",
      inline: false,
    },
    {
      name: `${getEmoji("convert")} Audio Converter & Roblox Tools`,
      value:
        "`/convert <file> [speed] [format]` — Konversi audio instan (preset 2.3x Roblox bypass)\n" +
        "`/upload-roblox <file> [name] [group_id]` — Upload audio langsung ke profil atau grup Roblox kamu",
      inline: false,
    },
    {
      name: `${getEmoji("stats")} Akun, Status & Paket`,
      value:
        "`/status` — Cek sisa kuota 24 jam, masa aktif langganan, dan role Discord aktif\n" +
        "`/plans` — Rincian harga paket terpusat (Free, Daily, Weekly, Monthly, Lifetime)\n" +
        "`/history` — Riwayat 5 unduhan aset terakhir kamu\n" +
        "`/mystats` — Statistik total unduhan akun kamu",
      inline: false,
    },
    {
      name: `${getEmoji("gear")} Utilitas & Sistem`,
      value:
        "`/ping` — Cek latensi dan kecepatan respons bot\n" +
        "`/queue` — Cek antrean pemrosesan server saat ini\n" +
        "`/uptime` — Cek durasi aktif server bot\n" +
        "`/tos` — Ketentuan Layanan (Terms of Service) & Kebijakan Fair Use",
      inline: false,
    }
  );

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setLabel("Buka Web Dashboard")
      .setStyle(ButtonStyle.Link)
      .setURL(branding.websiteUrl),
    new ButtonBuilder()
      .setLabel("Lihat Harga Paket")
      .setStyle(ButtonStyle.Link)
      .setURL(`${branding.websiteUrl}#pricing`)
  );

  return await safeReply(interaction, {
    embeds: [embed],
    components: [row],
  }, true);
}

export async function handlePingCommand(interaction) {
  const branding = getBranding();
  const ping = interaction.client.ws.ping;
  const latency = Math.abs(Date.now() - interaction.createdTimestamp);

  const embed = createModernEmbed({
    title: `${getEmoji("server")} Bot Latency & Connection`,
    description: yamlBlock({
      "Websocket Ping": `${ping} ms`,
      "Roundtrip Latency": `${latency} ms`,
      "Koneksi Gateway": ping < 150 ? "Sangat Cepat (Optimal)" : "Stabil",
      "Status Engine": "Node.js Pure Runtime",
    }),
    color: ping < 200 ? branding.successColor : branding.warningColor,
    client: interaction.client,
  });

  return await safeReply(interaction, { embeds: [embed] }, true);
}

export async function handleUptimeCommand(interaction, botStartTime) {
  const branding = getBranding();
  const totalSeconds = Math.floor((Date.now() - botStartTime) / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const uptimeStr = `${days}h ${hours}j ${minutes}m ${seconds}d`;

  const embed = createModernEmbed({
    title: `${getEmoji("clock")} Uptime Server Bot`,
    description: yamlBlock({
      "Waktu Aktif": uptimeStr,
      "Runtime Engine": "Node.js (Lightweight VPS Process)",
      "Memory Footprint": "Low Memory (Anti-Bocor)",
      "Database": "SQLite WAL Mode (Fast & Durable)",
    }),
    color: branding.infoColor,
    client: interaction.client,
  });

  return await safeReply(interaction, { embeds: [embed] }, true);
}

export async function handleTosCommand(interaction) {
  const branding = getBranding();

  const embed = createModernEmbed({
    title: `${getEmoji("shield")} Ketentuan Layanan & Fair Use Policy`,
    description:
      `**Kebijakan Penggunaan Cilaaa Community:**\n\n` +
      `**1. Kredensial & Keamanan:**\n` +
      `API Key Roblox dan data pengguna dienkripsi dengan standar **AES-256-GCM** tingkat perbankan. Bot tidak pernah menyimpan password atau cookie roblosecurity plaintext.\n\n` +
      `**2. Hak Cipta & Konten Roblox:**\n` +
      `Semua aset audio dan file yang diunggah harus mematuhi Pedoman Komunitas Roblox. Pengguna bertanggung jawab penuh atas materi yang diunggah ke akun masing-masing.\n\n` +
      `**3. Kebijakan Kuota Adil (Fair Use):**\n` +
      `Setiap tier paket memiliki kuota harian yang disegarkan otomatis setiap 24 jam untuk menjaga stabilitas server VPS agar tidak overload.`,
    color: branding.themeColor,
    client: interaction.client,
  });

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setLabel("Baca Ketentuan di Website")
      .setStyle(ButtonStyle.Link)
      .setURL(`${branding.websiteUrl}`)
  );

  return await safeReply(interaction, { embeds: [embed], components: [row] }, true);
}

export async function handleLibraryCommand(interaction) {
  const filterGame = (interaction.options.getString("game") || "").toLowerCase().trim();
  const branding = getBranding();

  let list = POPULAR_AUDIOS;
  if (filterGame) {
    list = POPULAR_AUDIOS.filter((a) => a.game.toLowerCase().includes(filterGame) || a.name.toLowerCase().includes(filterGame));
  }

  const lines = list.map((a) => `• **${a.name}** (\`${a.id}\`) — *${a.game}*`);

  const embed = createModernEmbed({
    title: `${getEmoji("audio")} Pustaka Audio Populer Roblox`,
    description:
      `Gunakan ID di bawah dengan perintah \`/download <asset_id>\` untuk mengunduh:\n\n` +
      (lines.join("\n") || "Tidak ditemukan lagu untuk kategori yang dicari."),
    color: branding.themeColor,
    client: interaction.client,
  });

  return await safeReply(interaction, { embeds: [embed] }, true);
}
