import fs from "node:fs";
import fsp from "node:fs/promises";
import path from "node:path";
export const STORAGE_DIR = process.env.AUDIO_STORAGE_DIR
    ? path.resolve(process.env.AUDIO_STORAGE_DIR)
    : path.join(process.cwd(), "data", "audio-files");
function normalize(p) {
    return path.normalize(p).replace(/\\/g, "/");
}
export function resolveStoragePath(userPrefix, relativePath) {
    if (!relativePath.startsWith(`${userPrefix}/`))
        return null;
    const normalized = normalize(relativePath);
    if (normalized.split("/").some((seg) => seg === ".." || seg === ".")) {
        return null;
    }
    if (!normalized.startsWith(`${userPrefix}/`))
        return null;
    const abs = path.join(STORAGE_DIR, normalized);
    const base = path.join(STORAGE_DIR, userPrefix);
    if (abs !== base && !abs.startsWith(base + path.sep))
        return null;
    return abs;
}
function isInsideStorage(abs) {
    const resolved = path.resolve(abs);
    return resolved === STORAGE_DIR || resolved.startsWith(STORAGE_DIR + path.sep);
}
export function ensureStorageDir() {
    if (!fs.existsSync(STORAGE_DIR))
        fs.mkdirSync(STORAGE_DIR, { recursive: true });
}
export async function writeFileSafe(userPrefix, relativePath, data) {
    const abs = resolveStoragePath(userPrefix, relativePath);
    if (!abs)
        throw new Error("Invalid storage path");
    await fsp.mkdir(path.dirname(abs), { recursive: true });
    await fsp.writeFile(abs, data);
    return relativePath;
}
export function readFileSafe(relativePath, userPrefix) {
    if (relativePath.includes("..") || relativePath.includes("\0")) {
        return null;
    }
    let abs = null;
    if (userPrefix) {
        abs = resolveStoragePath(userPrefix, relativePath);
    }
    else {
        const candidate = path.join(STORAGE_DIR, relativePath);
        if (isInsideStorage(candidate))
            abs = candidate;
    }
    if (!abs)
        return null;
    try {
        return fs.readFileSync(abs);
    }
    catch {
        return null;
    }
}
export function fileExists(relativePath) {
    if (relativePath.includes("..") || relativePath.includes("\0")) {
        return false;
    }
    const abs = path.join(STORAGE_DIR, relativePath);
    if (!isInsideStorage(abs))
        return false;
    return fs.existsSync(abs);
}
export async function deleteFileSafe(relativePath, userPrefix) {
    if (relativePath.includes("..") || relativePath.includes("\0")) {
        return false;
    }
    let abs = null;
    if (userPrefix) {
        abs = resolveStoragePath(userPrefix, relativePath);
    }
    else {
        const candidate = path.join(STORAGE_DIR, relativePath);
        if (isInsideStorage(candidate))
            abs = candidate;
    }
    if (!abs)
        return false;
    try {
        await fsp.unlink(abs);
        return true;
    }
    catch {
        return false;
    }
}
