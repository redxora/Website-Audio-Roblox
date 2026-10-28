import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";
import { getEmoji, getBranding } from "../utils/emojis.js";
import { createModernEmbed, yamlBlock } from "../utils/embeds.js";
import { safeReply } from "../utils/reply.js";
import { getPlansConfig } from "../utils/db.js";

export async function handlePlansCommand(interaction) {
  const branding = getBranding();
  const cfg = getPlansConfig();
  const plans = cfg.plans || {};

  const diamondIcon = getEmoji("diamond") || "💎";
  const vipIcon = getEmoji("vip") || "👑";
  const proIcon = getEmoji("pro") || "🔥";
  const starterIcon = getEmoji("starter") || "⭐";
  const sparklesIcon = getEmoji("sparkles") || "✨";

  const free = plans.free || {};
  const daily = plans.daily || {};
  const weekly = plans.weekly || {};
  const monthly = plans.monthly || {};
  const lifetime = plans.lifetime || {};

  const embed = createModernEmbed({
    title: `${vipIcon} Paket Layanan & Langganan Cilaaa Community`,
    description:
      `Semua konfigurasi harga dan kuota diambil langsung secara tersinkronisasi dari sistem terpusat.\n\n` +
      `**${starterIcon} FREE PLAN (GRATIS)**\n` +
      yamlBlock({
        "Harga": "Rp 0 / Selamanya",
        "Konversi Audio": `${free.conversions24h || 5}x per 24 jam`,
        "Roblox Upload": `${free.autoUploads24h || 5}x per 24 jam`,
        "Maksimal File": `${free.maxFileSizeMb || 10} MB`,
        "Batas Durasi": `${Math.floor((free.maxDurationSeconds || 600) / 60)} Menit`,
      }) +
      `\n**${starterIcon} 1 DAY (24 JAM)**\n` +
      yamlBlock({
        "Harga": `Rp ${(daily.priceIdr || 15000).toLocaleString("id-ID")}`,
        "Konversi Audio": "Tanpa Batas (Fair-use)",
        "Audio Splitter": "Otomatis (Multi Part)",
        "Roblox Upload": "Kredensial Langsung",
        "Maksimal File": `${daily.maxFileSizeMb || 20} MB`,
      }) +
      `\n**${proIcon} 7 DAYS (MINGGUAN) · POPULER**\n` +
      yamlBlock({
        "Harga": `Rp ${(weekly.priceIdr || 70000).toLocaleString("id-ID")}`,
        "Akses": "Semua Fitur 1 Day",
        "Batch Konversi": `${weekly.maxBatch || 10}x Sekaligus`,
        "Roblox Group": "Mendukung Group Universe",
        "Maksimal File": `${weekly.maxFileSizeMb || 30} MB`,
      }) +
      `\n**${proIcon} 30 DAYS (BULANAN) · PALING HEMAT**\n` +
      yamlBlock({
        "Harga": `Rp ${(monthly.priceIdr || 140000).toLocaleString("id-ID")}`,
        "Akses": "Semua Fitur 7 Days",
        "Batch Konversi": `${monthly.maxBatch || 50}x Sekaligus`,
        "Roblox Upload": "Tanpa Batas (Unlimited)",
        "Dedicated Queue": "Jalur Cepat Prioritas Tinggi",
        "Maksimal File": `${monthly.maxFileSizeMb || 50} MB`,
      }) +
      `\n**${vipIcon} LIFETIME VIP (PERMANEN)**\n` +
      yamlBlock({
        "Harga": `Rp ${(lifetime.priceIdr || 1000000).toLocaleString("id-ID")} (Sekali Bayar)`,
        "Masa Aktif": "Seumur Hidup Tanpa Kedaluwarsa",
        "Prioritas": "Antrean Paling Tinggi (Top Priority)",
        "Discord Role": "Role Eksklusif Lifetime VIP",
        "Developer Channel": "Akses Channel Private",
      }),
    color: branding.themeColor,
    client: interaction.client,
  });

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setLabel("Beli / Upgrade Paket di Website")
      .setStyle(ButtonStyle.Link)
      .setURL(`${branding.websiteUrl}#pricing`),
    new ButtonBuilder()
      .setLabel("Buka Web Dashboard")
      .setStyle(ButtonStyle.Link)
      .setURL(branding.websiteUrl)
  );

  return await safeReply(interaction, {
    embeds: [embed],
    components: [row],
  }, true);
}
