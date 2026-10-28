export const TAB_EVENT = "cilaaa:tab";
export const HOME_TAB_KEY = "cilaaa:home-tab";
export const DASH_TAB_KEY = "cilaaa:dash-tab";
export const PUBLIC_TABS = ["home", "features", "pricing", "about", "privacy", "terms"];
export const DASH_TABS = ["convert", "studio", "spoofer", "account", "billing", "history"];
export const DASH_GUEST_TABS = ["convert", "studio"];
export function requestTab(tab) {
    if (typeof window === "undefined")
        return;
    window.dispatchEvent(new CustomEvent(TAB_EVENT, { detail: { tab } }));
}
export function readStoredTab(key) {
    if (typeof window === "undefined")
        return null;
    try {
        return window.sessionStorage.getItem(key);
    }
    catch {
        return null;
    }
}
export function storeTab(key, tab) {
    if (typeof window === "undefined")
        return;
    try {
        window.sessionStorage.setItem(key, tab);
    }
    catch {
    }
}
