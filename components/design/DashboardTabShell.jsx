"use client";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import ConvertLink from "@/components/design/ConvertLink";
import ConvertUpload from "@/components/design/ConvertUpload";
import ConvertChrome from "@/components/dashboard/ConvertChrome";
import AudioStudio from "@/components/design/AudioStudio";
import Spoofer from "@/components/design/Spoofer";
import AccountPersonal from "@/components/design/AccountPersonal";
import Billing from "@/components/design/Billing";
import History from "@/components/design/History";
import { DASH_GUEST_TABS, DASH_TAB_KEY, DASH_TABS, TAB_EVENT, readStoredTab, storeTab, } from "@/lib/tab-nav";
function isDashTab(value) {
    return value != null && DASH_TABS.includes(value);
}
function initialDashTab() {
    const stored = readStoredTab(DASH_TAB_KEY);
    return isDashTab(stored) ? stored : "convert";
}
export default function DashboardTabShell({ viewer, robloxAccount, quota, quotaSnapshot, subscription, orders, planLabel, }) {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState("convert");
    const [mountedTabs, setMountedTabs] = useState(["convert"]);
    useEffect(() => {
        const stored = readStoredTab(DASH_TAB_KEY);
        if (isDashTab(stored) && stored !== "convert") {
            setActiveTab(stored);
            setMountedTabs((prev) => (prev.includes(stored) ? prev : [...prev, stored]));
        }
        const onTab = (event) => {
            const detail = event.detail;
            const next = detail?.tab;
            if (isDashTab(next)) {
                setActiveTab(next);
                storeTab(DASH_TAB_KEY, next);
                setMountedTabs((prev) => (prev.includes(next) ? prev : [...prev, next]));
            }
        };
        window.addEventListener(TAB_EVENT, onTab);
        document.documentElement.setAttribute("data-shell-ready", "dashboard");
        return () => window.removeEventListener(TAB_EVENT, onTab);
    }, []);
    useEffect(() => {
        if (!viewer.isAuthenticated && !DASH_GUEST_TABS.includes(activeTab)) {
            router.replace(`/${viewer.locale}`);
        }
    }, [activeTab, router, viewer.isAuthenticated, viewer.locale]);
    const v = viewer;
    const canShow = (t) => v.isAuthenticated || DASH_GUEST_TABS.includes(t);
    const panels = useMemo(() => ({
        convert: (<ConvertChrome locale={v.locale} userName={v.userName} avatarUrl={v.avatarUrl} nameplateUrl={v.nameplateUrl} nameplateVideoUrl={v.nameplateVideoUrl} planName={v.plan?.name}>
            <div id="convert-tab-link" className="tab-pane-active">
                <ConvertLink locale={v.locale} userName={v.userName} avatarUrl={v.avatarUrl} nameplateUrl={v.nameplateUrl} nameplateVideoUrl={v.nameplateVideoUrl} robloxAccount={robloxAccount} plan={v.plan} roleName={v.roleName} quota={quota} />
            </div>
            <div id="convert-tab-upload" className="tab-pane-inactive">
                <ConvertUpload locale={v.locale} userName={v.userName} avatarUrl={v.avatarUrl} nameplateUrl={v.nameplateUrl} nameplateVideoUrl={v.nameplateVideoUrl} robloxAccount={robloxAccount} plan={v.plan} roleName={v.roleName} quota={quota} />
            </div>
        </ConvertChrome>),
        studio: (<AudioStudio locale={v.locale} userName={v.userName} avatarUrl={v.avatarUrl} roleName={v.roleName} roleColor={v.roleColor} plan={v.plan} isAuthenticated={v.isAuthenticated} isMember={v.isMember} robloxAccount={robloxAccount} quota={quota} />),
        spoofer: (<Spoofer locale={v.locale} userName={v.userName} avatarUrl={v.avatarUrl} nameplateUrl={v.nameplateUrl} nameplateVideoUrl={v.nameplateVideoUrl} userPlan={v.plan} quota={quotaSnapshot} />),
        account: (<AccountPersonal locale={v.locale} initialTab="personal" userName={v.userName} globalName={v.globalName} status={v.status} avatarUrl={v.avatarUrl} avatarDecorationUrl={v.avatarDecorationUrl} nameplateUrl={v.nameplateUrl} nameplateVideoUrl={v.nameplateVideoUrl} nameplateLabel={v.nameplateLabel} profileEffectUrl={v.profileEffectUrl} profileEffectVideoUrl={v.profileEffectVideoUrl} bannerUrl={v.bannerUrl} bannerColor={v.bannerColor} accentColor={v.accentColor} clanTag={v.clanTag} clanBadge={v.clanBadge} bio={v.bio} roleName={v.roleName} roleColor={v.roleColor} plan={v.plan} robloxAccount={robloxAccount} />),
        billing: (<Billing locale={v.locale} userName={v.userName} avatarUrl={v.avatarUrl} nameplateUrl={v.bannerUrl} subscription={subscription} orders={orders} planLabel={planLabel} roleName={v.roleName} />),
        history: (<History locale={v.locale} userName={v.userName} avatarUrl={v.avatarUrl} />),
    }), [v, robloxAccount, quota, quotaSnapshot, subscription, orders, planLabel]);
    return (<div className="tab-pane-container">
        {DASH_TABS.filter(canShow).map((tab) => mountedTabs.includes(tab) ? (<div key={tab} data-tab-pane={tab} style={{ display: activeTab === tab ? "block" : "none" }} aria-hidden={activeTab !== tab}>
            {panels[tab]}
        </div>) : null)}
    </div>);
}
