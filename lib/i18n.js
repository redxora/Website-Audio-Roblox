export function isLocale(value) {
    return value === "id" || value === "en";
}
export function localizedHref(path, locale) {
    const normalized = path.startsWith("/") ? path : `/${path}`;
    return `/${locale}${normalized === "/" ? "" : normalized}`;
}
export function safeNextPath(value, locale) {
    if (!value || !value.startsWith("/") || value.startsWith("//")) {
        return localizedHref("/dashboard", locale);
    }
    const path = value.split("?")[0].split("#")[0];
    return /^\/(id|en)(\/|$)/.test(path)
        ? value
        : localizedHref("/dashboard", locale);
}
