import { cookies } from "next/headers";
import { createHash, randomBytes } from "node:crypto";
import { createSession, deleteSession, getSession as getSessionRow, getUserById, } from "@/lib/db";
export const SESSION_COOKIE = "cilaaa_session";
const SESSION_TTL_DAYS = 30;
function hashToken(token) {
    return createHash("sha256").update(token).digest("hex");
}
export async function createUserSession(userId) {
    const token = randomBytes(32).toString("hex");
    const tokenHash = hashToken(token);
    const expiresAt = new Date(Date.now() + SESSION_TTL_DAYS * 24 * 60 * 60 * 1000).toISOString();
    createSession(userId, tokenHash, expiresAt);
    const store = await cookies();
    store.set(SESSION_COOKIE, token, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        expires: new Date(expiresAt),
    });
}
export async function getSessionUser() {
    const store = await cookies();
    const token = store.get(SESSION_COOKIE)?.value;
    if (!token)
        return null;
    const row = getSessionRow(hashToken(token));
    if (!row) {
        return null;
    }
    const user = getUserById(row.user_id);
    if (!user) {
        return null;
    }
    return { ...user, isAuthenticated: true };
}
export async function destroyUserSession() {
    const store = await cookies();
    const token = store.get(SESSION_COOKIE)?.value;
    if (token) {
        deleteSession(hashToken(token));
    }
    store.delete(SESSION_COOKIE);
}
