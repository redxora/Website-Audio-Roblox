import { AttachmentBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";
import { fetchRobloxAsset, extractRobloxAssetIds } from "../utils/roblox.js";
import { getEmoji, getBranding } from "../utils/emojis.js";
import { createModernEmbed, yamlBlock } from "../utils/embeds.js";
import { safeReply } from "../utils/reply.js";
import { getUserByDiscordId, insertAuditEvent, getActiveSubscription, getPlansConfig } from "../utils/db.js";

export async function handleDownloadCommand(interaction) {
  const startTime = performance.now();
  const rawInput =
    interaction.options.getString("asset_id") ||
    interaction.options.getString("asset_ids") ||
    "";

  const ids = extractRobloxAssetIds(rawInput);
  const errorIcon = getEmoji("error");
  const warningIcon = getEmoji("warning");
  const branding = getBranding();

  if (ids.length === 0) {
    return await safeReply(interaction, {
      content: `${errorIcon} Masukkan minimal satu Asset ID atau link Roblox yang valid.`,
    }, true);
  }

  const discordUserId = interaction.user.id;
  const user = getUserByDiscordId(discordUserId);
  const sub = user ? getActiveSubscription(user.id) : null;
  const planCode = sub?.plan_code || "free";
  const plansCfg = getPlansConfig().plans || {};
  const currentPlan = plansCfg[planCode] || plansCfg.free || { maxBatch: 1, spooferDownloads24h: 20 };

  const batchLimit = currentPlan.maxBatch || 1;
  if (ids.length > batchLimit) {
    return await safeReply(interaction, {
      content: `${warningIcon} Paket **${currentPlan.label || planCode}** kamu memiliki batas maksimal **${batchLimit} aset** per batch download. Silakan kurangi jumlah ID atau upgrade paket.`,
    }, true);
  }

  if (ids.length === 1) {
    const cleanId = ids[0];
    const asset = await fetchRobloxAsset(cleanId);
    if (!asset) {
      return await safeReply(interaction, {
        content: `${errorIcon} Asset ID \`${cleanId}\` tidak ditemukan atau bersifat private di Roblox.`,
      }, true);
    }

    if (asset.fileBuffer && asset.fileBuffer.length > 24 * 1024 * 1024) {
      return await safeReply(interaction, {
        content: `${warningIcon} Ukuran file aset (\`${asset.fileSizeFormatted}\`) melebihi batas upload Discord (25 MB). Silakan unduh melalui dashboard website: ${branding.websiteUrl}`,
      }, true);
    }

    if (user) {
      insertAuditEvent({
        userId: user.id,
        event: "spoofer.download",
        payload: { assetId: cleanId, type: asset.typeName, name: asset.title, source: "discord-bot" },
      });
    }

    const elapsedSeconds = Math.max(0.3, (performance.now() - startTime) / 1000).toFixed(1);
    const attachment = new AttachmentBuilder(asset.fileBuffer, { name: asset.fileName });

    const row = new ActionRowBuilder();
    if (asset.typeName === "Audio" || asset.typeName === "Animation") {
      row.addComponents(
        new ButtonBuilder()
          .setCustomId(`auto_upload_${cleanId}`)
          .setLabel("Upload Otomatis ke Roblox")
          .setEmoji(getEmoji("diamond") || "💎")
          .setStyle(ButtonStyle.Primary)
      );
    }
    row.addComponents(
      new ButtonBuilder()
        .setLabel("Roblox Library")
        .setStyle(ButtonStyle.Link)
        .setURL(`https://www.roblox.com/library/${cleanId}`),
      new ButtonBuilder()
        .setLabel("Web Studio")
        .setStyle(ButtonStyle.Link)
        .setURL(branding.websiteUrl)
    );

    const typeEmoji = getEmoji(asset.typeName.toLowerCase()) || getEmoji("audio") || "🎵";
    const downloadEmoji = getEmoji("download") || "📥";

    const embed = createModernEmbed({
      title: `${typeEmoji} ${asset.typeName} Download Selesai`,
      description:
        `Selesai diproses dalam **${elapsedSeconds} detik**!\n\n` +
        yamlBlock({
          "Asset Name": asset.title,
          "Asset Type": asset.typeName,
          "Asset ID": cleanId,
          "Creator": asset.creatorName,
          "File Size": asset.fileSizeFormatted,
        }) +
        `\n${downloadEmoji} **File terlampir di bawah.** Kamu bisa langsung mengunduh atau menyimpannya.`,
      color: asset.typeName === "Audio" ? branding.themeColor : branding.infoColor,
      client: interaction.client,
    });

    return await safeReply(interaction, {
      content: `<@${interaction.user.id}>`,
      embeds: [embed],
      files: [attachment],
      components: [row],
    });
  }

  const attachments = [];
  const processedNames = [];

  for (const cid of ids) {
    const a = await fetchRobloxAsset(cid);
    if (a && a.fileBuffer && a.fileBuffer.length <= 15 * 1024 * 1024) {
      attachments.push(new AttachmentBuilder(a.fileBuffer, { name: a.fileName }));
      processedNames.push(`• **${a.title}** (\`${cid}\`)`);
      if (user) {
        insertAuditEvent({
          userId: user.id,
          event: "spoofer.batch_download",
          payload: { assetId: cid, type: a.typeName, source: "discord-bot" },
        });
      }
    }
  }

  const elapsed = ((performance.now() - startTime) / 1000).toFixed(1);
  const embed = createModernEmbed({
    title: `${getEmoji("sparkles")} Batch Download Ready (${attachments.length}/${ids.length} Aset)`,
    description:
      `Diproses dalam **${elapsed} detik**.\n\n` +
      `**Daftar Aset:**\n${processedNames.join("\n") || "Tidak ada file yang dapat diunduh."}`,
    color: branding.successColor,
    client: interaction.client,
  });

  return await safeReply(interaction, {
    content: `<@${interaction.user.id}>`,
    embeds: [embed],
    files: attachments,
  });
}
