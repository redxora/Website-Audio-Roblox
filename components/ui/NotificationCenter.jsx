"use client";
import * as React from "react";
import { ResolvingAlertBanner } from "@/components/ui/resolving-alert-banner";
export function NotificationCenter() {
    const [items, setItems] = React.useState([]);
    React.useEffect(() => {
        const handleNotify = (event) => {
            const customEvent = event;
            if (!customEvent.detail)
                return;
            const newItem = customEvent.detail;
            setItems((prev) => {
                const exists = prev.some((item) => item.id === newItem.id);
                if (exists) {
                    return prev.map((item) => (item.id === newItem.id ? newItem : item));
                }
                return [newItem, ...prev].slice(0, 5);
            });
        };
        const handleDismiss = (event) => {
            const customEvent = event;
            if (!customEvent.detail?.id)
                return;
            setItems((prev) => prev.filter((item) => item.id !== customEvent.detail.id));
        };
        window.addEventListener("cilaaa:notify", handleNotify);
        window.addEventListener("cilaaa:notify-dismiss", handleDismiss);
        return () => {
            window.removeEventListener("cilaaa:notify", handleNotify);
            window.removeEventListener("cilaaa:notify-dismiss", handleDismiss);
        };
    }, []);
    const removeItem = React.useCallback((id) => {
        setItems((prev) => prev.filter((item) => item.id !== id));
    }, []);
    if (items.length === 0)
        return null;
    return (<aside aria-live="polite" aria-label="Notifications" style={{ zIndex: 99999999, maxWidth: "380px" }} className="fixed top-5 right-5 pointer-events-none flex w-full flex-col gap-2.5 px-3 sm:px-0">
        {items.map((item) => (<NotificationItem key={item.id} item={item} onDismiss={() => removeItem(item.id)} />))}
    </aside>);
}
function NotificationItem({ item, onDismiss, }) {
    const [status, setStatus] = React.useState(item.status ?? "idle");
    React.useEffect(() => {
        if (!item.durationMs || item.durationMs <= 0 || item.action)
            return;
        if (status === "pending")
            return;
        const timer = window.setTimeout(() => {
            onDismiss();
        }, item.durationMs);
        return () => window.clearTimeout(timer);
    }, [item.durationMs, item.action, status, onDismiss]);
    return (<div className="pointer-events-auto w-full notification-slide-in shadow-2xl">
        <ResolvingAlertBanner tone={item.tone} title={item.title} description={item.description} action={item.action} successTitle={item.successTitle} successDescription={item.successDescription} errorTitle={item.errorTitle} errorDescription={item.errorDescription} status={status} onStatusChange={setStatus} expectedMs={item.expectedMs} collapseOnSuccessMs={item.collapseOnSuccessMs} dismissible={item.dismissible} onDismiss={onDismiss} onCollapse={onDismiss} icon={item.icon} />
    </div>);
}
export default NotificationCenter;
