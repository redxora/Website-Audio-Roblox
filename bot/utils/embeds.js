import { EmbedBuilder } from "discord.js";
import { getEmoji, getBranding } from "./emojis.js";

/**
 * @param {string} content
 * @param {string} lang
 */
export function codeBlock(content, lang = "") {
  return `\`\`\`${lang}\n${content}\n\`\`\``;
}

/**
 * @param {Record<string, string | number>} data
 */
export function yamlBlock(data) {
  const lines = Object.entries(data)
    .filter(([_, v]) => v !== undefined && v !== null && v !== "")
    .map(([k, v]) => `${k.padEnd(16)}: ${v}`);
  return `\`\`\`yaml\n${lines.join("\n")}\n\`\`\``;
}

/**
 * @param {object} options
 * @param {string} [options.title]
 * @param {string} [options.description]
 * @param {number} [options.color]
 * @param {boolean} [options.showBanner]
 * @param {string} [options.bannerUrl]
 * @param {string} [options.thumbnailUrl]
 * @param {object} [options.footer]
 * @param {any} [options.client]
 */
export function createModernEmbed(options = {}) {
  const branding = getBranding();
  const embed = new EmbedBuilder();

  embed.setColor(options.color ?? branding.themeColor);

  if (options.title) {
    embed.setTitle(options.title);
  }

  if (options.description) {
    embed.setDescription(options.description);
  }

  if (options.thumbnailUrl) {
    embed.setThumbnail(options.thumbnailUrl);
  }

  const banner = options.bannerUrl || (options.showBanner ? branding.bannerUrl : null);
  if (banner && typeof banner === "string" && banner.startsWith("http")) {
    embed.setImage(banner);
  }

  const timeStr = new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
  embed.setFooter({
    text: options.footer?.text || `${branding.footerText} • Today at ${timeStr}`,
    iconURL: options.footer?.iconURL || options.client?.user?.displayAvatarURL() || undefined,
  });

  return embed;
}

export function createSuccessEmbed(title, description, client) {
  const branding = getBranding();
  const icon = getEmoji("success");
  return createModernEmbed({
    title: `${icon} ${title}`,
    description,
    color: branding.successColor,
    client,
  });
}

export function createErrorEmbed(title, description, client) {
  const branding = getBranding();
  const icon = getEmoji("error");
  return createModernEmbed({
    title: `${icon} ${title}`,
    description,
    color: branding.errorColor,
    client,
  });
}

export function createWarningEmbed(title, description, client) {
  const branding = getBranding();
  const icon = getEmoji("warning");
  return createModernEmbed({
    title: `${icon} ${title}`,
    description,
    color: branding.warningColor,
    client,
  });
}
