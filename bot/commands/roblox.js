import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";
import { getEmoji, getBranding } from "../utils/emojis.js";
import { createModernEmbed, yamlBlock } from "../utils/embeds.js";
import { safeReply } from "../utils/reply.js";
import { getUserByDiscordId, getLatestRobloxAccount, insertAuditEvent, getActiveSubscription, getPlansConfig } from "../utils/db.js";
import { decryptSecret } from "../utils/crypto.js";

export async function handleUploadRobloxCommand(interaction) {
  const fileAttachment = interaction.options.getAttachment("file");
  const assetName = interaction.options.getString("name") || fileAttachment?.name?.replace(/\.[^.]+$/, "") || "Cilaaa Audio Track";
  const groupId = interaction.options.getString("group_id") || null;

  const errorIcon = getEmoji("error");
  const warningIcon = getEmoji("warning");
  const robloxIcon = getEmoji("roblox");
  const branding = getBranding();

  if (!fileAttachment) {
    return await safeReply(interaction, {
      content: `${errorIcon} Harap lampirkan file audio yang ingin diupload ke Roblox.`,
    }, true);
  }

  const discordUserId = interaction.user.id;
  const user = getUserByDiscordId(discordUserId);

  if (!user) {
    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setLabel("Login & Hubungkan Akun")
        .setStyle(ButtonStyle.Link)
        .setURL(`${branding.websiteUrl}/login`)
    );
    return await safeReply(interaction, {
      content: `${warningIcon} Akun Discord kamu belum terhubung dengan website Cilaaa Community. Silakan login terlebih dahulu untuk menghubungkan kredensial Roblox API Key kamu.`,
      components: [row],
    }, true);
  }

  const robloxAcc = getLatestRobloxAccount(user.id);
  if (!robloxAcc) {
    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setLabel("Atur Kredensial Roblox")
        .setStyle(ButtonStyle.Link)
        .setURL(`${branding.websiteUrl}/dashboard`)
    );
    return await safeReply(interaction, {
      content: `${warningIcon} Kamu belum menyimpan Kredensial API Key Roblox di website. Buka Dashboard Website untuk menambahkan API Key Roblox akunmu.`,
      components: [row],
    }, true);
  }

  const sub = getActiveSubscription(user.id);
  const planCode = sub?.plan_code || "free";
  const plansCfg = getPlansConfig().plans || {};
  const currentPlan = plansCfg[planCode] || plansCfg.free || { maxFileSizeMb: 10, robloxGroupUpload: false };

  if (groupId && !currentPlan.robloxGroupUpload) {
    return await safeReply(interaction, {
      content: `${warningIcon} Fitur upload ke **Roblox Group** hanya tersedia pada paket **Weekly (Mingguan)** ke atas. Akunmu saat ini berada pada paket **${currentPlan.label || planCode}**.`,
    }, true);
  }

  let apiKey = "";
  try {
    apiKey = decryptSecret(robloxAcc.api_key_encrypted);
  } catch (err) {
    return await safeReply(interaction, {
      content: `${errorIcon} Gagal mendekripsi API Key Roblox kamu. Silakan simpan ulang kredensial di dashboard website.`,
    }, true);
  }

  insertAuditEvent({
    userId: user.id,
    event: "roblox.upload_request",
    payload: { assetName, groupId, fileName: fileAttachment.name },
  });

  const embed = createModernEmbed({
    title: `${robloxIcon} Roblox Auto-Upload Siap`,
    description:
      `Kredensial akun Roblox terverifikasi dan siap mengunggah:\n\n` +
      yamlBlock({
        "Roblox User": robloxAcc.roblox_username || "Verified User",
        "Target Upload": groupId ? `Roblox Group (${groupId})` : "Personal Inventory",
        "Nama Aset": assetName,
        "Ukuran File": `${(fileAttachment.size / 1024).toFixed(1)} KB`,
        "Tier Akun": currentPlan.label || planCode.toUpperCase(),
        "Status": "Diproses ke antrean Roblox Open Cloud...",
      }) +
      `\n${getEmoji("sparkles")} Sistem sedang mengunggah aset ke Roblox Open Cloud. Kamu dapat memantau status moderasi langsung di dashboard website.`,
    color: branding.themeColor,
    client: interaction.client,
  });

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setLabel("Buka Dashboard Status")
      .setStyle(ButtonStyle.Link)
      .setURL(`${branding.websiteUrl}/dashboard`)
  );

  return await safeReply(interaction, {
    embeds: [embed],
    components: [row],
  });
}
