import { notFound } from "next/navigation";
import { isLocale } from "@/lib/i18n";
export default async function LocaleLayout({ children, params, }) {
    const { locale } = await params;
    if (!isLocale(locale)) {
        notFound();
    }
    return <>{children}</>;
}
