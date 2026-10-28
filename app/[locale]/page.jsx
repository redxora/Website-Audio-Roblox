import InteractiveDesign from "@/components/InteractiveDesign";
import PublicTabShell from "@/components/design/PublicTabShell";
import { getViewer } from "@/lib/viewer";
import { getTeamMembers } from "@/lib/team";
export default async function HomePage({ params, }) {
    const viewer = await getViewer((await params).locale, false);
    let team = [];
    try {
        team = await getTeamMembers();
    }
    catch {
        team = [];
    }
    return (<InteractiveDesign locale={viewer.locale} pageKind="home" userName={viewer.userName} avatarUrl={viewer.avatarUrl} avatarDecorationUrl={viewer.avatarDecorationUrl} bannerUrl={viewer.bannerUrl} bannerColor={viewer.bannerColor} accentColor={viewer.accentColor} clanTag={viewer.clanTag} clanBadge={viewer.clanBadge} roleName={viewer.roleName} isAuthenticated={viewer.isAuthenticated}>
      <PublicTabShell locale={viewer.locale} isAuthenticated={viewer.isAuthenticated} userName={viewer.userName} avatarUrl={viewer.avatarUrl} roleName={viewer.roleName} team={team}/>
    </InteractiveDesign>);
}
