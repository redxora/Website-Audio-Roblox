"use client";
import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { DASH_TAB_KEY, HOME_TAB_KEY, storeTab } from "@/lib/tab-nav";
export default function TabRedirect({ tab, scope, }) {
    const params = useParams();
    const router = useRouter();
    const locale = params?.locale || "en";
    useEffect(() => {
        storeTab(scope === "dashboard" ? DASH_TAB_KEY : HOME_TAB_KEY, tab);
        router.replace(scope === "dashboard" ? `/${locale}/dashboard` : `/${locale}`);
    }, [locale, router, scope, tab]);
    return null;
}
