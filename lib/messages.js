import idMessages from "@/locales/id.json";
import enMessages from "@/locales/en.json";
export function getMessages(locale) {
    return locale === "en" ? enMessages : idMessages;
}
