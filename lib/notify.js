export function notify(input) {
    if (typeof window === "undefined")
        return "";
    const id = (typeof input === "object" && input.id) ? input.id : `notif_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const item = typeof input === "string"
        ? {
            id,
            tone: "info",
            title: input,
            dismissible: true,
            durationMs: 4500,
        }
        : {
            id,
            tone: input.tone ?? "info",
            title: input.title,
            description: input.description,
            action: input.action,
            successTitle: input.successTitle,
            successDescription: input.successDescription,
            errorTitle: input.errorTitle,
            errorDescription: input.errorDescription,
            status: input.status,
            expectedMs: input.expectedMs,
            collapseOnSuccessMs: input.collapseOnSuccessMs,
            dismissible: input.dismissible ?? true,
            durationMs: input.durationMs ?? (input.action ? 0 : 5000),
            icon: input.icon,
        };
    window.dispatchEvent(new CustomEvent("cilaaa:notify", { detail: item }));
    return id;
}
notify.info = (title, description, durationMs = 5000) => {
    return notify({ tone: "info", title, description, durationMs });
};
notify.success = (title, description, durationMs = 4500) => {
    return notify({ tone: "success", title, description, durationMs });
};
notify.warning = (title, description, durationMs = 6000) => {
    return notify({ tone: "warning", title, description, durationMs });
};
notify.error = (title, description, durationMs = 7000) => {
    return notify({ tone: "destructive", title, description, durationMs });
};
notify.dismiss = (id) => {
    if (typeof window === "undefined")
        return;
    window.dispatchEvent(new CustomEvent("cilaaa:notify-dismiss", { detail: { id } }));
};
export default notify;
