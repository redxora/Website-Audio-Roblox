import Database from "better-sqlite3";
import { randomUUID } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
let _db = null;
function resolveDbPath() {
    return process.env.SQLITE_DB_PATH || path.join(process.cwd(), "data", "app.db");
}
function initSchema(db) {
    db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      discord_user_id TEXT UNIQUE,
      email TEXT,
      display_name TEXT,
      avatar_url TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS sessions (
      token_hash TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      expires_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS sessions_user_idx ON sessions(user_id, expires_at);

    CREATE TABLE IF NOT EXISTS conversions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      original_name TEXT NOT NULL,
      output_name TEXT NOT NULL,
      output_file_path TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'prepared' CHECK (status IN ('prepared','uploaded','roblox_processing','failed')),
      duration_seconds REAL NOT NULL CHECK (duration_seconds > 0 AND duration_seconds <= 1800),
      bytes INTEGER NOT NULL CHECK (bytes > 0 AND bytes <= 52428800),
      speed REAL NOT NULL DEFAULT 2.3 CHECK (speed >= 0.25 AND speed <= 4),
      roblox_asset_id TEXT,
      roblox_operation_path TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS conversions_user_created_idx ON conversions(user_id, created_at DESC);

    CREATE TABLE IF NOT EXISTS roblox_accounts (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      mode TEXT NOT NULL CHECK (mode IN ('personal','group')),
      roblox_user_id TEXT,
      group_id TEXT,
      universe_id TEXT,
      api_key_encrypted TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE(user_id, mode)
    );

    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      plan_code TEXT NOT NULL CHECK (plan_code IN ('daily','weekly','Weekly','monthly','lifetime','custom')),
      amount_idr INTEGER NOT NULL CHECK (amount_idr >= 0),
      status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','paid','failed','cancelled','refunded')),
      provider TEXT DEFAULT 'tako',
      provider_reference TEXT,
      provider_transaction_id TEXT,
      payment_method TEXT DEFAULT 'qris',
      payment_url TEXT,
      metadata TEXT DEFAULT '{}',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      paid_at TEXT
    );
    CREATE INDEX IF NOT EXISTS orders_user_created_idx ON orders(user_id, created_at DESC);
    CREATE INDEX IF NOT EXISTS orders_provider_ref_idx ON orders(provider_reference);
    CREATE INDEX IF NOT EXISTS orders_provider_tx_idx ON orders(provider_transaction_id);

    CREATE TABLE IF NOT EXISTS subscriptions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE UNIQUE,
      plan_code TEXT NOT NULL CHECK (plan_code IN ('free','daily','weekly','Weekly','monthly','lifetime','custom')),
      status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','expired','cancelled')),
      starts_at TEXT NOT NULL,
      expires_at TEXT,
      last_order_id TEXT REFERENCES orders(id) ON DELETE SET NULL,
      discord_role_synced INTEGER NOT NULL DEFAULT 0,
      discord_role_sync_error TEXT,
      custom_config TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS subscriptions_user_status_idx ON subscriptions(user_id, status);
    CREATE INDEX IF NOT EXISTS subscriptions_expires_idx ON subscriptions(expires_at);

    CREATE TABLE IF NOT EXISTS audit_logs (
      id TEXT PRIMARY KEY,
      user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
      event TEXT NOT NULL,
      payload TEXT NOT NULL DEFAULT '{}',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS audit_logs_user_created_idx ON audit_logs(user_id, created_at DESC);
  `);
    try {
        db.exec("ALTER TABLE subscriptions ADD COLUMN custom_config TEXT");
    }
    catch { }
    try {
        const orderRow = db.prepare("SELECT sql FROM sqlite_master WHERE type='table' AND name='orders'").get();
        if (orderRow?.sql && (!orderRow.sql.includes("'daily'") || !orderRow.sql.includes("'weekly'") || !orderRow.sql.includes("'custom'"))) {
            db.pragma("foreign_keys = OFF");
            db.exec(`
        CREATE TABLE IF NOT EXISTS orders_migrated (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          plan_code TEXT NOT NULL CHECK (plan_code IN ('daily','weekly','Weekly','monthly','lifetime','custom')),
          amount_idr INTEGER NOT NULL CHECK (amount_idr >= 0),
          status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','paid','failed','cancelled','refunded')),
          provider TEXT DEFAULT 'tako',
          provider_reference TEXT,
          provider_transaction_id TEXT,
          payment_method TEXT DEFAULT 'qris',
          payment_url TEXT,
          metadata TEXT DEFAULT '{}',
          created_at TEXT NOT NULL DEFAULT (datetime('now')),
          paid_at TEXT
        );
        INSERT OR IGNORE INTO orders_migrated SELECT * FROM orders;
        DROP TABLE orders;
        ALTER TABLE orders_migrated RENAME TO orders;
        CREATE INDEX IF NOT EXISTS orders_user_created_idx ON orders(user_id, created_at DESC);
        CREATE INDEX IF NOT EXISTS orders_provider_ref_idx ON orders(provider_reference);
        CREATE INDEX IF NOT EXISTS orders_provider_tx_idx ON orders(provider_transaction_id);
      `);
            db.pragma("foreign_keys = ON");
        }
    }
    catch (err) {
        console.warn("[Orders Migration] Note:", err);
    }
    try {
        const subRow = db.prepare("SELECT sql FROM sqlite_master WHERE type='table' AND name='subscriptions'").get();
        if (subRow?.sql && (!subRow.sql.includes("'daily'") || !subRow.sql.includes("'weekly'") || !subRow.sql.includes("'custom'"))) {
            db.pragma("foreign_keys = OFF");
            db.exec(`
        CREATE TABLE IF NOT EXISTS subscriptions_migrated (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE UNIQUE,
          plan_code TEXT NOT NULL CHECK (plan_code IN ('free','daily','weekly','Weekly','monthly','lifetime','custom')),
          status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','expired','cancelled')),
          starts_at TEXT NOT NULL,
          expires_at TEXT,
          last_order_id TEXT REFERENCES orders(id) ON DELETE SET NULL,
          discord_role_synced INTEGER NOT NULL DEFAULT 0,
          discord_role_sync_error TEXT,
          custom_config TEXT,
          created_at TEXT NOT NULL DEFAULT (datetime('now')),
          updated_at TEXT NOT NULL DEFAULT (datetime('now'))
        );
        INSERT OR IGNORE INTO subscriptions_migrated SELECT * FROM subscriptions;
        DROP TABLE subscriptions;
        ALTER TABLE subscriptions_migrated RENAME TO subscriptions;
        CREATE INDEX IF NOT EXISTS subscriptions_user_status_idx ON subscriptions(user_id, status);
        CREATE INDEX IF NOT EXISTS subscriptions_expires_idx ON subscriptions(expires_at);
      `);
            db.pragma("foreign_keys = ON");
        }
    }
    catch (err) {
        console.warn("[Subscriptions Migration] Note:", err);
    }
    try {
        const row = db.prepare("SELECT sql FROM sqlite_master WHERE type='table' AND name='conversions'").get();
        if (row?.sql && (row.sql.includes("20971520") || row.sql.includes("420"))) {
            db.exec(`
        CREATE TABLE IF NOT EXISTS conversions_migrated (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          original_name TEXT NOT NULL,
          output_name TEXT NOT NULL,
          output_file_path TEXT NOT NULL,
          status TEXT NOT NULL DEFAULT 'prepared' CHECK (status IN ('prepared','uploaded','roblox_processing','failed')),
          duration_seconds REAL NOT NULL CHECK (duration_seconds > 0 AND duration_seconds <= 1800),
          bytes INTEGER NOT NULL CHECK (bytes > 0 AND bytes <= 52428800),
          speed REAL NOT NULL DEFAULT 2.3 CHECK (speed >= 0.25 AND speed <= 4),
          roblox_asset_id TEXT,
          roblox_operation_path TEXT,
          created_at TEXT NOT NULL DEFAULT (datetime('now'))
        );
        INSERT OR IGNORE INTO conversions_migrated SELECT * FROM conversions;
        DROP TABLE conversions;
        ALTER TABLE conversions_migrated RENAME TO conversions;
        CREATE INDEX IF NOT EXISTS conversions_user_created_idx ON conversions(user_id, created_at DESC);
      `);
        }
    }
    catch (err) {
        console.warn("[DB Migration] Note:", err);
    }
}
export function getDb() {
    if (_db)
        return _db;
    const dbPath = resolveDbPath();
    const dir = path.dirname(dbPath);
    if (!fs.existsSync(dir))
        fs.mkdirSync(dir, { recursive: true });
    const db = new Database(dbPath);
    db.pragma("journal_mode = WAL");
    db.pragma("busy_timeout = 5000");
    db.pragma("synchronous = NORMAL");
    db.pragma("cache_size = -64000");
    db.pragma("temp_store = MEMORY");
    db.pragma("foreign_keys = ON");
    initSchema(db);
    _db = db;
    return db;
}
export function closeDb() {
    if (_db) {
        _db.close();
        _db = null;
    }
}
export function getUserById(id) {
    return getDb()
        .prepare("SELECT * FROM users WHERE id = ?")
        .get(id) ?? null;
}
export function getUserByDiscordId(discordUserId) {
    return getDb()
        .prepare("SELECT * FROM users WHERE discord_user_id = ?")
        .get(discordUserId) ?? null;
}
export function upsertUserFromDiscord(data) {
    const db = getDb();
    const existing = getUserByDiscordId(data.discordUserId);
    const email = data.email ?? null;
    const displayName = data.displayName ?? data.discordUsername ?? null;
    const avatarUrl = data.avatarUrl ?? null;
    if (existing) {
        db.prepare("UPDATE users SET email = ?, display_name = ?, avatar_url = ?, updated_at = datetime('now') WHERE id = ?").run(email, displayName, avatarUrl, existing.id);
        return getUserById(existing.id);
    }
    const id = randomUUID();
    db.prepare("INSERT INTO users (id, discord_user_id, email, display_name, avatar_url, created_at, updated_at) VALUES (?, ?, ?, ?, ?, datetime('now'), datetime('now'))").run(id, data.discordUserId, email, displayName, avatarUrl);
    return getUserById(id);
}
export function createSession(userId, tokenHash, expiresAt) {
    getDb()
        .prepare("INSERT INTO sessions (token_hash, user_id, expires_at) VALUES (?, ?, ?)")
        .run(tokenHash, userId, expiresAt);
}
export function getSession(tokenHash) {
    return (getDb()
        .prepare("SELECT * FROM sessions WHERE token_hash = ? AND expires_at > datetime('now')")
        .get(tokenHash) ?? null);
}
export function deleteSession(tokenHash) {
    getDb().prepare("DELETE FROM sessions WHERE token_hash = ?").run(tokenHash);
}
export function deleteExpiredSessions() {
    getDb()
        .prepare("DELETE FROM sessions WHERE expires_at <= datetime('now')")
        .run();
}
export function getActiveSubscription(userId) {
    const db = getDb();
    const sub = db
        .prepare("SELECT * FROM subscriptions WHERE user_id = ? AND status = 'active'")
        .get(userId);
    if (!sub)
        return null;
    if (sub.expires_at && new Date(sub.expires_at).getTime() <= Date.now()) {
        db.prepare("UPDATE subscriptions SET status = 'expired', updated_at = datetime('now') WHERE id = ?").run(sub.id);
        return null;
    }
    return sub;
}
export function upsertSubscription(data) {
    const updatedAt = data.updatedAt ?? new Date().toISOString();
    getDb()
        .prepare(`INSERT INTO subscriptions (id, user_id, plan_code, status, starts_at, expires_at, last_order_id, custom_config, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(user_id) DO UPDATE SET
         plan_code = excluded.plan_code,
         status = excluded.status,
         starts_at = excluded.starts_at,
         expires_at = excluded.expires_at,
         last_order_id = excluded.last_order_id,
         custom_config = COALESCE(excluded.custom_config, subscriptions.custom_config),
         updated_at = excluded.updated_at`)
        .run(randomUUID(), data.userId, data.planCode, data.status, data.startsAt, data.expiresAt, data.lastOrderId ?? null, data.custom_config ?? null, updatedAt);
}
export function updateSubscriptionSync(userId, synced, error) {
    getDb()
        .prepare("UPDATE subscriptions SET discord_role_synced = ?, discord_role_sync_error = ?, updated_at = datetime('now') WHERE user_id = ?")
        .run(synced ? 1 : 0, error, userId);
}
export function createOrder(data) {
    const id = randomUUID();
    getDb()
        .prepare("INSERT INTO orders (id, user_id, plan_code, amount_idr, status, provider, payment_method, metadata, created_at) VALUES (?, ?, ?, ?, 'pending', 'tako', ?, ?, datetime('now'))")
        .run(id, data.userId, data.planCode, data.amountIdr, data.paymentMethod, JSON.stringify(data.metadata ?? {}));
    return id;
}
export function getOrderById(id) {
    return (getDb().prepare("SELECT * FROM orders WHERE id = ?").get(id) ?? null);
}
export function getOrderByProviderRef(ref) {
    return (getDb()
        .prepare("SELECT * FROM orders WHERE provider_reference = ?")
        .get(ref) ?? null);
}
export function getOrderByTransactionId(txId) {
    return (getDb()
        .prepare("SELECT * FROM orders WHERE provider_transaction_id = ?")
        .get(txId) ?? null);
}
export function getSubscriptionByUserId(userId) {
    return (getDb()
        .prepare("SELECT * FROM subscriptions WHERE user_id = ?")
        .get(userId) ?? null);
}
export function updateOrderProviderInfo(orderId, providerReference, transactionId, paymentUrl) {
    getDb()
        .prepare("UPDATE orders SET provider_reference = COALESCE(?, provider_reference), provider_transaction_id = COALESCE(?, provider_transaction_id), payment_url = COALESCE(?, payment_url) WHERE id = ?")
        .run(providerReference, transactionId, paymentUrl, orderId);
}
export function markOrderPaid(orderId, paidAt, transactionId, providerReference) {
    getDb()
        .prepare("UPDATE orders SET status = 'paid', paid_at = ?, provider_transaction_id = COALESCE(?, provider_transaction_id), provider_reference = COALESCE(?, provider_reference) WHERE id = ?")
        .run(paidAt, transactionId, providerReference, orderId);
}
export function setOrderFailed(orderId, error) {
    getDb()
        .prepare("UPDATE orders SET status = 'failed', metadata = json_set(metadata, '$.error', ?) WHERE id = ?")
        .run(String(error ?? "unknown"), orderId);
}
export function setOrderRefunded(orderId) {
    getDb().prepare("UPDATE orders SET status = 'refunded' WHERE id = ?").run(orderId);
}
export function cancelOrder(orderId, userId) {
    if (userId) {
        const res = getDb()
            .prepare("UPDATE orders SET status = 'cancelled' WHERE id = ? AND user_id = ? AND status = 'pending'")
            .run(orderId, userId);
        return res.changes > 0;
    }
    const res = getDb()
        .prepare("UPDATE orders SET status = 'cancelled' WHERE id = ? AND status = 'pending'")
        .run(orderId);
    return res.changes > 0;
}
export function expireStalePendingOrders(cutoffMinutes = 5) {
    const cutoffIso = new Date(Date.now() - cutoffMinutes * 60 * 1000).toISOString();
    const normalizedCutoff = toSqliteDatetime(cutoffIso);
    const res = getDb()
        .prepare("UPDATE orders SET status = 'cancelled', metadata = json_set(metadata, '$.cancel_reason', 'expired_unpaid') WHERE status = 'pending' AND created_at < ?")
        .run(normalizedCutoff);
    return res.changes;
}
export function insertConversion(data) {
    const id = randomUUID();
    getDb()
        .prepare("INSERT INTO conversions (id, user_id, original_name, output_name, output_file_path, bytes, duration_seconds, speed, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)")
        .run(id, data.userId, data.originalName, data.outputName, data.outputFilePath, data.bytes, data.durationSeconds, data.speed, data.status ?? "prepared");
    return id;
}
export function listConversions(userId, limit = 100) {
    return getDb()
        .prepare("SELECT * FROM conversions WHERE user_id = ? ORDER BY created_at DESC LIMIT ?")
        .all(userId, limit);
}
export function getConversion(id, userId) {
    return (getDb()
        .prepare("SELECT * FROM conversions WHERE id = ? AND user_id = ?")
        .get(id, userId) ?? null);
}
export function deleteConversion(id, userId) {
    const res = getDb()
        .prepare("DELETE FROM conversions WHERE id = ? AND user_id = ?")
        .run(id, userId);
    return res.changes > 0;
}
export function updateConversionStatus(id, userId, status, patch) {
    const db = getDb();
    if (patch) {
        db.prepare("UPDATE conversions SET status = ?, roblox_asset_id = ?, roblox_operation_path = ? WHERE id = ? AND user_id = ?").run(status, patch.robloxAssetId ?? null, patch.robloxOperationPath ?? null, id, userId);
    }
    else {
        db.prepare("UPDATE conversions SET status = ? WHERE id = ? AND user_id = ?").run(status, id, userId);
    }
}
export function toSqliteDatetime(iso) {
    if (!iso)
        return iso;
    return iso.replace("T", " ").replace(/\..*$/, "").replace(/Z$/, "");
}
export function countConversionsSince(userId, sinceIso, status = "neq:failed") {
    const db = getDb();
    const normalizedSince = toSqliteDatetime(sinceIso);
    if (status === "neq:failed") {
        const r = db
            .prepare("SELECT COUNT(*) AS c FROM conversions WHERE user_id = ? AND created_at >= ? AND status != 'failed'")
            .get(userId, normalizedSince);
        return r.c;
    }
    const r = db
        .prepare("SELECT COUNT(*) AS c FROM conversions WHERE user_id = ? AND created_at >= ? AND status = ?")
        .get(userId, normalizedSince, status);
    return r.c;
}
export function getExpiredConversions(cutoffIso, limit) {
    const normalizedCutoff = toSqliteDatetime(cutoffIso);
    return getDb()
        .prepare("SELECT * FROM conversions WHERE created_at < ? LIMIT ?")
        .all(normalizedCutoff, limit);
}
export function insertAuditLog(params) {
    getDb()
        .prepare("INSERT INTO audit_logs (id, user_id, event, payload, created_at) VALUES (?, ?, ?, ?, datetime('now'))")
        .run(randomUUID(), params.userId, params.event, JSON.stringify(params.payload ?? {}));
}
export const insertAuditEvent = insertAuditLog;
export function countAuditEventSince(userId, event, sinceIso) {
    const normalizedSince = toSqliteDatetime(sinceIso);
    const r = getDb()
        .prepare("SELECT COUNT(*) AS c FROM audit_logs WHERE user_id = ? AND event = ? AND created_at >= ?")
        .get(userId, event, normalizedSince);
    return r.c;
}
export function getOldAuditLogs(cutoffIso, limit) {
    return getDb()
        .prepare("SELECT id FROM audit_logs WHERE created_at < ? LIMIT ?")
        .all(cutoffIso, limit);
}
export function deleteAuditLog(id) {
    const res = getDb().prepare("DELETE FROM audit_logs WHERE id = ?").run(id);
    return res.changes > 0;
}
export function getRecentOrders(userId, limit = 5) {
    return getDb()
        .prepare("SELECT id, plan_code, amount_idr, status, payment_method, provider_transaction_id, created_at, paid_at FROM orders WHERE user_id = ? ORDER BY created_at DESC LIMIT ?")
        .all(userId, limit);
}
export function listLocalSubscriberUsers() {
    const rows = getDb()
        .prepare(`SELECT u.id, u.display_name, u.avatar_url FROM users u
       JOIN subscriptions s ON s.user_id = u.id
       WHERE s.status = 'active' AND s.plan_code != 'free'`)
        .all();
    return rows.map((r) => ({
        id: r.id,
        name: r.display_name || "Subscriber",
        avatar: r.avatar_url || "",
    }));
}
export function upsertRobloxAccount(params) {
    getDb()
        .prepare(`INSERT INTO roblox_accounts (id, user_id, mode, roblox_user_id, group_id, universe_id, api_key_encrypted, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
       ON CONFLICT(user_id, mode) DO UPDATE SET
         roblox_user_id = excluded.roblox_user_id,
         group_id = excluded.group_id,
         universe_id = excluded.universe_id,
         api_key_encrypted = excluded.api_key_encrypted,
         updated_at = datetime('now')`)
        .run(randomUUID(), params.userId, params.mode, params.robloxUserId ?? null, params.groupId ?? null, params.universeId ?? null, params.apiKeyEncrypted);
}
export function getRobloxAccount(userId, mode) {
    return (getDb()
        .prepare("SELECT * FROM roblox_accounts WHERE user_id = ? AND mode = ?")
        .get(userId, mode) ?? null);
}
export function getRobloxAccounts(userId) {
    return getDb()
        .prepare("SELECT * FROM roblox_accounts WHERE user_id = ? ORDER BY updated_at DESC")
        .all(userId);
}
export function getLatestRobloxAccount(userId) {
    return (getDb()
        .prepare("SELECT * FROM roblox_accounts WHERE user_id = ? ORDER BY updated_at DESC LIMIT 1")
        .get(userId) ?? null);
}
export function claimConversion(id, userId) {
    const res = getDb()
        .prepare("UPDATE conversions SET status = 'roblox_processing' WHERE id = ? AND user_id = ? AND status = 'prepared'")
        .run(id, userId);
    return res.changes > 0;
}
