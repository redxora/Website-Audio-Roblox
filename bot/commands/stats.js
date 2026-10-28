import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";
import { getEmoji, getBranding } from "../utils/emojis.js";
import { createModernEmbed, yamlBlock } from "../utils/embeds.js";
import { safeReply } from "../utils/reply.js";
import {
  getUserByDiscordId,
  getActiveSubscription,
  getUserStats,
  getRecentHistory,
  getQueueCount,
  getPlansConfig,
} from "../utils/db.js";

export async function handleStatusCommand(interaction) {
  const discordUserId = interaction.user.id;
  const user = getUserByDiscordId(discordUserId);
  const branding = getBranding();

  const sub = user ? getActiveSubscription(user.id) : null;
  const planCode = sub?.plan_code || "free";
  const plansCfg = getPlansConfig().plans || {};
  const currentPlan = plansCfg[planCode] || plansCfg.free || {
    label: "Free Plan",
    conversions24h: 5,
    autoUploads24h: 5,
    maxFileSizeMb: 10,
    maxDurationSeconds: 600,
    robloxGroupUpload: false,
  };

  let expiresText = "Permanen / Selamanya";
  if (sub?.expires_at) {
    const expDate = new Date(sub.expires_at);
    expiresText = expDate.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  const embed = createModernEmbed({
    title: `${getEmoji("stats")} Status Akun & Kuota Langganan`,
    description:
      `Informasi hak akses dan status kuota akun Discord kamu:\n\n` +
      yamlBlock({
        "Discord User": `<@${discordUserId}>`,
        "Tier Langganan": currentPlan.label || planCode.toUpperCase(),
        "Masa Aktif": expiresText,
        "Kuota Konversi": currentPlan.conversions24h === null ? "Tanpa Batas (Fair-use)" : `${currentPlan.conversions24h}x / 24 Jam`,
        "Roblox Upload": currentPlan.autoUploads24h === null ? "Tanpa Batas" : `${currentPlan.autoUploads24h}x / 24 Jam`,
        "Maksimal File": `${currentPlan.maxFileSizeMb || 10} MB`,
        "Batas Durasi": `${Math.floor((currentPlan.maxDurationSeconds || 600) / 60)} Menit`,
        "Upload Group": currentPlan.robloxGroupUpload ? "Tersedia (Aktif)" : "Tidak Tersedia",
        "Role Synced": sub?.discord_role_synced ? "Tersinkronisasi" : "Otomatis",
      }) +
      `\n${getEmoji("sparkles")} Kuota harian ter-reset otomatis setiap 24 jam.`,
    color: sub ? branding.themeColor : branding.infoColor,
    client: interaction.client,
  });

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setLabel("Perpanjang / Upgrade Paket")
      .setStyle(ButtonStyle.Link)
      .setURL(`${branding.websiteUrl}#pricing`),
    new ButtonBuilder()
      .setLabel("Web Dashboard")
      .setStyle(ButtonStyle.Link)
      .setURL(branding.websiteUrl)
  );

  return await safeReply(interaction, {
    embeds: [embed],
    components: [row],
  }, true);
}

export async function handleMyStatsCommand(interaction) {
  const discordUserId = interaction.user.id;
  const user = getUserByDiscordId(discordUserId);
  const branding = getBranding();

  const stats = user ? getUserStats(user.id) : { totalDownloads: 0, todayDownloads: 0 };

  const embed = createModernEmbed({
    title: `${getEmoji("stats")} Statistik Penggunaan Kamu`,
    description:
      `Ringkasan aktivitas penggunaan bot dan studio aset Roblox:\n\n` +
      yamlBlock({
        "Total Unduhan": `${stats.totalDownloads} Aset`,
        "Unduhan 24 Jam": `${stats.todayDownloads} Aset`,
        "Status Akun": user ? "Terhubung ke Website" : "Pengguna Discord Bebas",
        "Platform": "Cilaaa Audio & Roblox Spoofer",
      }),
    color: branding.infoColor,
    client: interaction.client,
  });

  return await safeReply(interaction, { embeds: [embed] }, true);
}

export async function handleQueueCommand(interaction) {
  const branding = getBranding();
  const queueCount = getQueueCount();

  const embed = createModernEmbed({
    title: `${getEmoji("server")} Status Antrean Server`,
    description:
      `Kondisi lalu lintas pemrosesan audio & upload Roblox saat ini:\n\n` +
      yamlBlock({
        "Antrean Aktif": `${queueCount} Item`,
        "Beban Server": queueCount > 5 ? "Sedang Padat" : "Lancar (Optimal)",
        "Estimasi Waktu": queueCount > 0 ? `± ${queueCount * 2} detik` : "Instan (0 detik)",
        "Status Node": "Online & Siap Melayani",
      }),
    color: queueCount > 10 ? branding.warningColor : branding.successColor,
    client: interaction.client,
  });

  return await safeReply(interaction, { embeds: [embed] }, true);
}

export async function handleHistoryCommand(interaction) {
  const discordUserId = interaction.user.id;
  const user = getUserByDiscordId(discordUserId);
  const branding = getBranding();

  if (!user) {
    return await safeReply(interaction, {
      content: `${getEmoji("warning")} Kamu belum login di website. Masuk ke website untuk menyimpan riwayat unduhan secara permanen.`,
    }, true);
  }

  const history = getRecentHistory(user.id, 5);
  if (history.length === 0) {
    return await safeReply(interaction, {
      content: `${getEmoji("history")} Belum ada riwayat aktivitas unduhan aset pada akunmu.`,
    }, true);
  }

  const lines = history.map((h, i) => {
    let p = {};
    try { p = JSON.parse(h.payload); } catch {}
    const timeStr = new Date(h.created_at).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
    return `**${i + 1}. ${p.name || p.type || "Asset"}** (\`${p.assetId || "-"}\`)\n   └ Waktu: \`${timeStr}\` • Jenis: \`${p.type || "Audio"}\``;
  });

  const embed = createModernEmbed({
    title: `${getEmoji("history")} Riwayat 5 Unduhan Terakhir`,
    description: lines.join("\n\n"),
    color: branding.themeColor,
    client: interaction.client,
  });

  return await safeReply(interaction, { embeds: [embed] }, true);
}
