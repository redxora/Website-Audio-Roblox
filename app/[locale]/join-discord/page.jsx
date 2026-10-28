import { redirect } from "next/navigation";
import InteractiveDesign from "@/components/InteractiveDesign";
import JoinDiscord from "@/components/design/JoinDiscord";
import { getViewer } from "@/lib/viewer";
export default async function JoinDiscordPage({ params, }) {
    const viewer = await getViewer((await params).locale, false);
    if (viewer.isAuthenticated && viewer.isMember && viewer.hasRole) {
        redirect(`/${viewer.locale}/dashboard`);
    }
    const View = JoinDiscord;
    return (<InteractiveDesign locale={viewer.locale} pageKind="join-discord" userName={viewer.userName} avatarUrl={viewer.avatarUrl} avatarDecorationUrl={viewer.avatarDecorationUrl} bannerUrl={viewer.bannerUrl} bannerColor={viewer.bannerColor} accentColor={viewer.accentColor} clanTag={viewer.clanTag} clanBadge={viewer.clanBadge} roleName={viewer.roleName} isAuthenticated={viewer.isAuthenticated}>
      <View locale={viewer.locale} userName={viewer.userName} avatarUrl={viewer.avatarUrl} avatarDecorationUrl={viewer.avatarDecorationUrl} status={viewer.status} roleName={viewer.roleName} isMember={viewer.isMember} hasRole={viewer.hasRole}/>
    </InteractiveDesign>);
}
