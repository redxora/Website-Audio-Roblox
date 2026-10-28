
import { FREE_CONVERSIONS_PER_24H } from "./plans";
export const APP_CONFIG = {

    siteUrl: process.env.NEXT_PUBLIC_SITE_URL || "",
    discordInviteUrl: process.env.NEXT_PUBLIC_DISCORD_INVITE_URL || "",

    database: {
        sqlitePath: process.env.SQLITE_DB_PATH || "",
        audioStorageDir: process.env.AUDIO_STORAGE_DIR || "",
    },

    discord: {
        clientId: process.env.DISCORD_CLIENT_ID || "",
        clientSecret: process.env.DISCORD_CLIENT_SECRET || "",
        botToken: process.env.DISCORD_BOT_TOKEN || "",
        guildId: process.env.DISCORD_GUILD_ID || "",
        redirectUri: process.env.DISCORD_REDIRECT_URI || "",
    },

    limits: {
        freeConversionsPer24h: FREE_CONVERSIONS_PER_24H,
        maxAudioDurationSeconds: Math.max(0, Number.parseInt(process.env.MAX_AUDIO_DURATION_SECONDS || "600", 10) || 600),
        maxUploadSizeMb: Math.max(0, Number.parseInt(process.env.MAX_UPLOAD_SIZE_MB || "50", 10) || 50),
    },
};
