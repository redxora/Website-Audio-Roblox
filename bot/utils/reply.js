import { MessageFlags } from "discord.js";

/**
 * @param {import("discord.js").ChatInputCommandInteraction | import("discord.js").ButtonInteraction} interaction
 * @param {import("discord.js").InteractionReplyOptions} payload
 * @param {boolean} [ephemeral=false]
 */
export async function safeReply(interaction, payload, ephemeral = false) {
  try {
    if (ephemeral) {
      payload.flags = MessageFlags.Ephemeral;
    }

    if (interaction.deferred) {
      return await interaction.editReply(payload);
    }

    if (interaction.replied) {
      return await interaction.followUp(payload);
    }

    return await interaction.reply(payload);
  } catch (error) {
    if (error?.code === 10062 || error?.code === 40060) {
      console.warn(`[Discord Bot Reply] Interaksi kedaluwarsa atau sudah dibalas: ${error.message}`);
      return null;
    }
    console.error("[Discord Bot Reply] Gagal mengirim balasan:", error);
    return null;
  }
}
