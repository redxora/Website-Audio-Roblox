import { getDb, expireStalePendingOrders } from "./utils/db.js";

async function revokeDiscordRole(guildId, botToken, discordUserId, roleId) {
  if (!guildId || !botToken || !discordUserId || !roleId) return false;
  try {
    const res = await fetch(
      `https://discord.com/api/v10/guilds/${encodeURIComponent(guildId)}/members/${encodeURIComponent(discordUserId)}/roles/${encodeURIComponent(roleId)}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bot ${botToken}`,
          "X-Audit-Log-Reason": "Cilaaa Subscription Expired",
        },
      }
    );
    return res.ok;
  } catch (err) {
    console.error(`[Cron] Gagal mencabut role ${roleId} dari ${discordUserId}:`, err.message);
    return false;
  }
}

export async function checkExpiredSubscriptions() {
  const db = getDb();
  const nowIso = new Date().toISOString();
  const botToken = process.env.DISCORD_BOT_TOKEN?.trim();
  const guildId = process.env.DISCORD_GUILD_ID?.trim();

  const expiredRows = db
    .prepare(
      `SELECT s.*, u.discord_user_id, u.display_name
       FROM subscriptions s
       JOIN users u ON u.id = s.user_id
       WHERE s.status = 'active'
         AND s.expires_at IS NOT NULL
         AND s.expires_at <= ?`
    )
    .all(nowIso);

  if (expiredRows.length === 0) {
    return { expiredCount: 0, revokedUsers: [] };
  }

  const revokedUsers = [];

  for (const sub of expiredRows) {
    try {
      db.prepare(
        `UPDATE subscriptions
         SET status = 'expired', updated_at = datetime('now')
         WHERE id = ?`
      ).run(sub.id);

      if (sub.discord_user_id && botToken && guildId) {
        let roleId = null;
        if (sub.plan_code === "daily") roleId = process.env.DISCORD_ROLE_DAILY;
        else if (sub.plan_code === "weekly" || sub.plan_code === "Weekly") roleId = process.env.DISCORD_ROLE_WEEKLY;
        else if (sub.plan_code === "monthly") roleId = process.env.DISCORD_ROLE_MONTHLY;
        else if (sub.plan_code === "lifetime") roleId = process.env.DISCORD_ROLE_LIFETIME;

        if (roleId) {
          const ok = await revokeDiscordRole(guildId, botToken, sub.discord_user_id, roleId.trim());
          if (ok) revokedUsers.push(sub.discord_user_id);
        }
      }
    } catch (err) {
      console.error(`[Cron] Gagal memproses expired sub ${sub.id}:`, err.message);
    }
  }

  return {
    expiredCount: expiredRows.length,
    revokedUsers,
  };
}

export function startSubscriptionExpirationCron(intervalMs = 60000) {
  console.log(`[Subscription Cron] Daemon aktif: cek kedaluwarsa & pembersih order pending 5 menit (interval: ${intervalMs / 1000}s)`);

  checkExpiredSubscriptions().catch(() => { });
  try {
    expireStalePendingOrders(5);
  } catch { }

  return setInterval(async () => {
    try {
      const res = await checkExpiredSubscriptions();
      if (res.expiredCount > 0) {
        console.log(
          `[Subscription Cron] ${res.expiredCount} langganan kedaluwarsa diproses. Role dicabut dari: ${res.revokedUsers.join(", ") || "-"}`
        );
      }

      const expiredOrders = expireStalePendingOrders(5);
      if (expiredOrders > 0) {
        console.log(`[Subscription Cron] ${expiredOrders} order pending kadaluwarsa (>5 menit) otomatis dibatalkan.`);
      }
    } catch (err) {
      console.error("[Subscription Cron] Error checking subscriptions:", err.message);
    }
  }, intervalMs);
}
