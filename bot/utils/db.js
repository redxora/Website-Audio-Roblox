import Database from "better-sqlite3";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "../../");

let _db = null;

export function getDb() {
  if (_db) return _db;
  const dbPath = process.env.SQLITE_DB_PATH || path.join(rootDir, "data", "app.db");
  const dataDir = path.dirname(dbPath);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  _db = new Database(dbPath);
  _db.pragma("journal_mode = WAL");
  _db.pragma("busy_timeout = 5000");
  return _db;
}

export function getUserByDiscordId(discordUserId) {
  if (!discordUserId) return null;
  const db = getDb();
  return db.prepare("SELECT * FROM users WHERE discord_user_id = ? LIMIT 1").get(discordUserId) || null;
}

export function getUserById(userId) {
  if (!userId) return null;
  const db = getDb();
  return db.prepare("SELECT * FROM users WHERE id = ? LIMIT 1").get(userId) || null;
}

export function insertAuditEvent({ userId = null, event, payload = {} }) {
  try {
    const db = getDb();
    const id = (typeof crypto !== "undefined" && crypto.randomUUID) ? crypto.randomUUID() : Math.random().toString(36).substring(2);
    db.prepare(`
      INSERT INTO audit_logs (id, user_id, event, payload, created_at)
      VALUES (?, ?, ?, ?, datetime('now'))
    `).run(id, userId, event, JSON.stringify(payload));
  } catch (err) {
    console.warn("[Audit Log] Gagal mencatat event:", err.message);
  }
}

export function getLatestRobloxAccount(userId) {
  if (!userId) return null;
  const db = getDb();
  return db.prepare(`
    SELECT * FROM roblox_accounts
    WHERE user_id = ?
    ORDER BY datetime(created_at) DESC
    LIMIT 1
  `).get(userId) || null;
}

export function getActiveSubscription(userId) {
  if (!userId) return null;
  const db = getDb();
  const nowIso = new Date().toISOString();
  return db.prepare(`
    SELECT * FROM subscriptions
    WHERE user_id = ?
      AND status = 'active'
      AND (expires_at IS NULL OR expires_at > ?)
    ORDER BY datetime(created_at) DESC
    LIMIT 1
  `).get(userId, nowIso) || null;
}

export function expireStalePendingOrders(maxAgeMinutes = 5) {
  try {
    const db = getDb();
    const cutoffDate = new Date(Date.now() - maxAgeMinutes * 60 * 1000).toISOString();
    const info = db.prepare(`
      UPDATE orders
      SET status = 'cancelled'
      WHERE status = 'pending'
        AND datetime(created_at) < datetime(?)
    `).run(cutoffDate);
    return info.changes || 0;
  } catch {
    return 0;
  }
}

export function getRecentHistory(userId, limit = 5) {
  if (!userId) return [];
  const db = getDb();
  return db.prepare(`
    SELECT event, payload, created_at
    FROM audit_logs
    WHERE user_id = ? AND event LIKE 'spoofer.%'
    ORDER BY datetime(created_at) DESC
    LIMIT ?
  `).all(userId, limit);
}

export function getUserStats(userId) {
  if (!userId) {
    return { totalDownloads: 0, todayDownloads: 0, audioCount: 0, otherCount: 0 };
  }
  const db = getDb();
  const total = db.prepare(`
    SELECT COUNT(*) as cnt FROM audit_logs
    WHERE user_id = ? AND event LIKE 'spoofer.%'
  `).get(userId)?.cnt || 0;

  const today = db.prepare(`
    SELECT COUNT(*) as cnt FROM audit_logs
    WHERE user_id = ?
      AND event LIKE 'spoofer.%'
      AND datetime(created_at) >= datetime('now', '-24 hours')
  `).get(userId)?.cnt || 0;

  return {
    totalDownloads: total,
    todayDownloads: today,
  };
}

export function getQueueCount() {
  try {
    const db = getDb();
    const row = db.prepare(`
      SELECT COUNT(*) as cnt FROM conversions
      WHERE status IN ('prepared', 'roblox_processing')
    `).get();
    return row?.cnt || 0;
  } catch {
    return 0;
  }
}

let cachedPlans = null;
export function getPlansConfig() {
  if (cachedPlans) return cachedPlans;
  try {
    const p = path.resolve(rootDir, "plans.config.json");
    if (fs.existsSync(p)) {
      cachedPlans = JSON.parse(fs.readFileSync(p, "utf-8"));
      return cachedPlans;
    }
  } catch { }
  return { plans: {} };
}
