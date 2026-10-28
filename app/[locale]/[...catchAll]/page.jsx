import NotFound3 from "@/components/ui/NotFound3";
export default async function CatchAllNotFound({ params, }) {
    const resolved = await params;
    const locale = resolved?.locale === "en" ? "en" : "id";
    return <NotFound3 locale={locale}/>;
}
