import { normalizePlanCode } from "./plans";
function getPlanRoleId(plan) {
    if (plan === "daily") {
        return process.env.DISCORD_ROLE_DAILY?.trim() || process.env.DISCORD_ROLE_WEEKLY?.trim() || null;
    }
    if (plan === "Weekly") {
        return process.env.DISCORD_ROLE_WEEKLY?.trim() || null;
    }
    if (plan === "monthly") {
        return process.env.DISCORD_ROLE_MONTHLY?.trim() || null;
    }
    if (plan === "lifetime") {
        return process.env.DISCORD_ROLE_LIFETIME?.trim() || null;
    }
    return null;
}
function getAllSubscriptionRoleIds() {
    const ids = [
        process.env.DISCORD_ROLE_DAILY?.trim(),
        process.env.DISCORD_ROLE_WEEKLY?.trim(),
        process.env.DISCORD_ROLE_MONTHLY?.trim(),
        process.env.DISCORD_ROLE_LIFETIME?.trim(),
    ].filter(Boolean);
    return Array.from(new Set(ids));
}
export async function syncUserDiscordSubscriptionRole(discordUserId, newPlanCode) {
    const botToken = process.env.DISCORD_BOT_TOKEN?.trim();
    const guildId = process.env.DISCORD_GUILD_ID?.trim();
    const baseMemberRole = process.env.DISCORD_ROLE_MEMBER?.trim();
    if (!botToken || !guildId || !discordUserId) {
        return {
            success: false,
            error: "Missing DISCORD_BOT_TOKEN, DISCORD_GUILD_ID, or discordUserId.",
        };
    }
    const normalized = normalizePlanCode(newPlanCode);
    const targetRoleId = getPlanRoleId(normalized);
    const subRoleIds = getAllSubscriptionRoleIds();
    try {
        const memberRes = await fetch(`https://discord.com/api/v10/guilds/${encodeURIComponent(guildId)}/members/${encodeURIComponent(discordUserId)}`, {
            headers: { Authorization: `Bot ${botToken}` },
            cache: "no-store",
        });
        if (memberRes.status === 404) {
            return {
                success: false,
                error: `User ${discordUserId} is not a member of guild ${guildId}. They must join the server first.`,
            };
        }
        if (!memberRes.ok) {
            const errText = await memberRes.text().catch(() => "");
            return {
                success: false,
                error: `Discord API error (${memberRes.status}): ${errText}`,
            };
        }
        const memberData = (await memberRes.json());
        const currentRoles = memberData.roles || [];
        const removedRoles = [];
        for (const oldRoleId of subRoleIds) {
            if (oldRoleId !== targetRoleId && currentRoles.includes(oldRoleId) && oldRoleId !== baseMemberRole) {
                const removeRes = await fetch(`https://discord.com/api/v10/guilds/${encodeURIComponent(guildId)}/members/${encodeURIComponent(discordUserId)}/roles/${encodeURIComponent(oldRoleId)}`, {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bot ${botToken}`,
                        "X-Audit-Log-Reason": `Cilaaa Subscription change to ${normalized}`,
                    },
                });
                if (removeRes.ok || removeRes.status === 404) {
                    removedRoles.push(oldRoleId);
                }
            }
        }
        if (targetRoleId) {
            const addRes = await fetch(`https://discord.com/api/v10/guilds/${encodeURIComponent(guildId)}/members/${encodeURIComponent(discordUserId)}/roles/${encodeURIComponent(targetRoleId)}`, {
                method: "PUT",
                headers: {
                    Authorization: `Bot ${botToken}`,
                    "X-Audit-Log-Reason": `Cilaaa Subscription activation: ${normalized}`,
                },
            });
            if (!addRes.ok && addRes.status !== 204) {
                const addErr = await addRes.text().catch(() => "");
                return {
                    success: false,
                    roleGranted: null,
                    rolesRemoved: removedRoles,
                    error: `Failed to grant role ${targetRoleId} (HTTP ${addRes.status}): ${addErr}`,
                };
            }
        }
        if (baseMemberRole && !currentRoles.includes(baseMemberRole)) {
            await fetch(`https://discord.com/api/v10/guilds/${encodeURIComponent(guildId)}/members/${encodeURIComponent(discordUserId)}/roles/${encodeURIComponent(baseMemberRole)}`, {
                method: "PUT",
                headers: {
                    Authorization: `Bot ${botToken}`,
                    "X-Audit-Log-Reason": "Cilaaa Base Member verification",
                },
            }).catch(() => { });
        }
        return {
            success: true,
            roleGranted: targetRoleId,
            rolesRemoved: removedRoles,
        };
    }
    catch (err) {
        return {
            success: false,
            error: err instanceof Error ? err.message : "Network error syncing Discord role",
        };
    }
}
export async function revokeExpiredDiscordSubscriptionRole(discordUserId) {
    const botToken = process.env.DISCORD_BOT_TOKEN?.trim();
    const guildId = process.env.DISCORD_GUILD_ID?.trim();
    const baseMemberRole = process.env.DISCORD_ROLE_MEMBER?.trim();
    if (!botToken || !guildId || !discordUserId) {
        return { success: false, error: "Missing Discord bot configuration" };
    }
    const subRoleIds = getAllSubscriptionRoleIds();
    const removed = [];
    try {
        for (const roleId of subRoleIds) {
            if (roleId === baseMemberRole)
                continue;
            const res = await fetch(`https://discord.com/api/v10/guilds/${encodeURIComponent(guildId)}/members/${encodeURIComponent(discordUserId)}/roles/${encodeURIComponent(roleId)}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bot ${botToken}`,
                    "X-Audit-Log-Reason": "Cilaaa Subscription expired",
                },
            });
            if (res.ok || res.status === 204) {
                removed.push(roleId);
            }
        }
        return { success: true, rolesRemoved: removed };
    }
    catch (err) {
        return {
            success: false,
            error: err instanceof Error ? err.message : "Error revoking expired Discord roles",
        };
    }
}
export async function sendDiscordPurchaseEmbed(data) {
    const webhookUrl = process.env.DISCORD_PURCHASE_WEBHOOK_URL?.trim();
    if (!webhookUrl)
        return false;
    let color = 0x3b82f6;
    let title = "Payment Received";
    if (data.event === "payment_success" || data.event === "subscription_activated") {
        color = data.planCode === "lifetime" ? 0xf59e0b : data.planCode === "monthly" ? 0xa855f7 : 0x10b981;
        title = "Subscription Activated — Verified";
    }
    else if (data.event === "subscription_renewed") {
        color = 0x06b6d4;
        title = "Subscription Renewed";
    }
    else if (data.event === "subscription_expired") {
        color = 0xef4444;
        title = "Subscription Expired";
    }
    else if (data.event === "role_sync_failed") {
        color = 0xf59e0b;
        title = "Discord Role Sync Notice";
    }
    const fields = [
        {
            name: "User",
            value: `${data.userName || "User"} (${data.discordUserId ? `<@${data.discordUserId}>` : "No Discord ID"})`,
            inline: true,
        },
        {
            name: "Plan",
            value: `**${data.planLabel}** (\`${data.planCode}\`)`,
            inline: true,
        },
        {
            name: "Amount",
            value: `**Rp ${data.amountIdr.toLocaleString("id-ID")}**`,
            inline: true,
        },
    ];
    if (data.orderId) {
        fields.push({
            name: "Order ID",
            value: `\`${data.orderId}\``,
            inline: true,
        });
    }
    if (data.takoTransactionId || data.takoGiftId) {
        fields.push({
            name: "Tako Reference",
            value: `\`${data.takoTransactionId || data.takoGiftId}\``,
            inline: true,
        });
    }
    if (data.expiresAt) {
        const expDate = new Date(data.expiresAt);
        fields.push({
            name: "Active Until",
            value: `<t:${Math.floor(expDate.getTime() / 1000)}:F> (<t:${Math.floor(expDate.getTime() / 1000)}:R>)`,
            inline: false,
        });
    }
    else if (data.planCode === "lifetime") {
        fields.push({
            name: "Active Until",
            value: "**Lifetime Access (Permanent)**",
            inline: false,
        });
    }
    fields.push({
        name: "Discord Role Status",
        value: data.roleSyncStatus === "success"
            ? "Synced successfully"
            : data.roleSyncStatus === "skipped_no_discord_id"
                ? "Skipped (Discord account not linked)"
                : `Error: ${data.errorMessage || "Unknown issue"}`,
        inline: false,
    });
    const payload = {
        username: "CILAAA Payment Bot",
        avatar_url: "https://cilaaa.com/asset/image/logo/logo.png",
        embeds: [
            {
                title,
                color,
                fields,
                footer: {
                    text: "Cilaaa Community • Official Payment Audit Trail",
                    icon_url: "https://cilaaa.com/asset/image/logo/logo.png",
                },
                timestamp: new Date().toISOString(),
            },
        ],
    };
    try {
        const res = await fetch(webhookUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });
        return res.ok;
    }
    catch {
        return false;
    }
}
