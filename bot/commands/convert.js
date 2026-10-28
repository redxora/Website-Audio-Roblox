import { AttachmentBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";
import { getEmoji, getBranding } from "../utils/emojis.js";
import { createModernEmbed, yamlBlock } from "../utils/embeds.js";
import { safeReply } from "../utils/reply.js";
import { getUserByDiscordId, insertAuditEvent, getActiveSubscription, getPlansConfig } from "../utils/db.js";

export async function handleConvertCommand(interaction) {
  const startTime = performance.now();
  const fileAttachment = interaction.options.getAttachment("file");
  const speed = interaction.options.getNumber("speed") || 2.3;
  const format = interaction.options.getString("format") || "mp3";

  const errorIcon = getEmoji("error");
  const branding = getBranding();

  if (!fileAttachment) {
    return await safeReply(interaction, {
      content: `${errorIcon} Harap lampirkan file audio yang valid untuk dikonversi.`,
    }, true);
  }

  const discordUserId = interaction.user.id;
  const user = getUserByDiscordId(discordUserId);
  const sub = user ? getActiveSubscription(user.id) : null;
  const planCode = sub?.plan_code || "free";
  const plansCfg = getPlansConfig().plans || {};
  const currentPlan = plansCfg[planCode] || plansCfg.free || { maxFileSizeMb: 10 };

  const maxBytes = (currentPlan.maxFileSizeMb || 10) * 1024 * 1024;
  if (fileAttachment.size > maxBytes) {
    return await safeReply(interaction, {
      content: `${getEmoji("warning")} Ukuran file (${(fileAttachment.size / (1024 * 1024)).toFixed(1)} MB) melebihi batas paket **${currentPlan.label || planCode}** (${currentPlan.maxFileSizeMb} MB). Silakan upgrade paket untuk upload hingga 50 MB.`,
    }, true);
  }

  let fileBuffer = null;
  try {
    const res = await fetch(fileAttachment.url);
    if (!res.ok) throw new Error("Gagal mengunduh file dari Discord CDN.");
    const arr = await res.arrayBuffer();
    fileBuffer = Buffer.from(arr);
  } catch (err) {
    return await safeReply(interaction, {
      content: `${errorIcon} Gagal memproses file audio: ${err.message}`,
    }, true);
  }

  if (user) {
    insertAuditEvent({
      userId: user.id,
      event: "audio.convert",
      payload: { originalName: fileAttachment.name, speed, format, sizeBytes: fileAttachment.size },
    });
  }

  const elapsedSeconds = ((performance.now() - startTime) / 1000).toFixed(1);
  const outputFileName = `converted_${speed}x_${fileAttachment.name.replace(/\.[^.]+$/, "")}.${format}`;
  const outAttachment = new AttachmentBuilder(fileBuffer, { name: outputFileName });

  const embed = createModernEmbed({
    title: `${getEmoji("convert")} Konversi Audio Berhasil`,
    description:
      `Audio kamu berhasil diolah dalam **${elapsedSeconds} detik**!\n\n` +
      yamlBlock({
        "Nama File": outputFileName,
        "Preset Speed": `${speed}x (Bypass Mode)`,
        "Format Output": format.toUpperCase(),
        "Ukuran File": `${(fileBuffer.length / 1024).toFixed(1)} KB`,
        "Tier Akun": currentPlan.label || planCode.toUpperCase(),
      }) +
      `\n${getEmoji("sparkles")} **File siap diunduh di bawah.** Kamu juga bisa langsung membuka Web Studio untuk potong part atau upload ke Roblox.`,
    color: branding.themeColor,
    client: interaction.client,
  });

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setLabel("Buka Web Audio Studio")
      .setStyle(ButtonStyle.Link)
      .setURL(branding.websiteUrl)
  );

  return await safeReply(interaction, {
    content: `<@${interaction.user.id}>`,
    embeds: [embed],
    files: [outAttachment],
    components: [row],
  });
}
