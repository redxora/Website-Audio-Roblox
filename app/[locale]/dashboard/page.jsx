import InteractiveDesign from "@/components/InteractiveDesign";
import DashboardTabShell from "@/components/design/DashboardTabShell";
import { getViewer } from "@/lib/viewer";
import { getSessionUser } from "@/lib/auth/session";
import { getQuotaSnapshot } from "@/lib/entitlement";
import { getPlanConfig } from "@/lib/plans";
import { getLatestRobloxAccount, getSubscriptionByUserId, getRecentOrders, } from "@/lib/db";
export default async function DashboardPage({ params, }) {
    const viewer = await getViewer((await params).locale, false);
    let robloxAccount = null;
    let quota = null;
    let quotaSnapshot = null;
    let subscription = null;
    let orders = [];
    if (viewer.isAuthenticated) {
        try {
            const user = await getSessionUser();
            if (user) {
                const account = getLatestRobloxAccount(user.id);
                if (account) {
                    robloxAccount = {
                        mode: account.mode,
                        roblox_user_id: account.roblox_user_id,
                        group_id: account.group_id,
                    };
                }
                const snapshot = await getQuotaSnapshot(user);
                quota = snapshot.conversions;
                quotaSnapshot = snapshot;
                const sub = getSubscriptionByUserId(user.id);
                if (sub) {
                    subscription = {
                        plan_code: sub.plan_code,
                        status: sub.status,
                        starts_at: sub.starts_at,
                        expires_at: sub.expires_at,
                    };
                }
                orders = getRecentOrders(user.id, 50).map((o) => ({
                    id: o.id,
                    plan_code: o.plan_code,
                    amount_idr: o.amount_idr,
                    status: o.status,
                    payment_method: o.payment_method,
                    provider_transaction_id: o.provider_transaction_id,
                    created_at: o.created_at,
                    paid_at: o.paid_at,
                }));
            }
        }
        catch (err) {
            console.error("Gagal memuat data dashboard:", err);
        }
    }
    const planLabel = subscription ? getPlanConfig(subscription.plan_code).label : "Free";
    return (<InteractiveDesign locale={viewer.locale} pageKind="convert" userName={viewer.userName} avatarUrl={viewer.avatarUrl} avatarDecorationUrl={viewer.avatarDecorationUrl} bannerUrl={viewer.bannerUrl} bannerColor={viewer.bannerColor} accentColor={viewer.accentColor} clanTag={viewer.clanTag} clanBadge={viewer.clanBadge} roleName={viewer.roleName} isAuthenticated={viewer.isAuthenticated}>
      <DashboardTabShell viewer={viewer} robloxAccount={robloxAccount} quota={quota} quotaSnapshot={quotaSnapshot} subscription={subscription} orders={orders} planLabel={planLabel}/>
    </InteractiveDesign>);
}
