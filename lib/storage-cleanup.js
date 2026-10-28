import { getExpiredConversions, getOldAuditLogs, deleteAuditLog, insertAuditLog, deleteConversion, } from "./db";
import { deleteFileSafe } from "./storage";
const RETENTION_HOURS = Math.max(1, Number.parseInt(process.env.FILE_RETENTION_HOURS || "24", 10) || 24);
const AUDIT_LOG_DAYS = 90;
const BATCH = 100;
function cutoffIso(hours) {
    return new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();
}
export async function runStorageCleanup() {
    const cutoff = cutoffIso(RETENTION_HOURS);
    const auditCutoff = cutoffIso(AUDIT_LOG_DAYS * 24);
    let filesRemoved = 0;
    let rowsRemoved = 0;
    const abandoned = getExpiredConversions(cutoff, BATCH).filter((row) => row.status === "prepared");
    for (const row of abandoned) {
        if (await deleteFileSafe(row.output_file_path))
            filesRemoved++;
        if (deleteConversion(row.id, row.user_id))
            rowsRemoved++;
    }
    const expiredFiles = getExpiredConversions(cutoff, BATCH).filter((row) => row.status !== "prepared");
    for (const row of expiredFiles) {
        if (await deleteFileSafe(row.output_file_path))
            filesRemoved++;
    }
    const oldLogs = getOldAuditLogs(auditCutoff, BATCH);
    let logsRemoved = 0;
    for (const log of oldLogs) {
        if (deleteAuditLog(log.id))
            logsRemoved++;
    }
    if (filesRemoved > 0 || rowsRemoved > 0) {
        insertAuditLog({
            userId: null,
            event: "cleanup.storage",
            payload: { filesRemoved, rowsRemoved, logsRemoved, retentionHours: RETENTION_HOURS },
        });
    }
    return { filesRemoved, rowsRemoved, logsRemoved, retentionHours: RETENTION_HOURS };
}
