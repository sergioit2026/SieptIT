import type { Metadata } from "next";
import LegalDocument from "@/components/legal/LegalDocument";
import { LEGAL_META, loadLegalHtml } from "@/lib/legal-docs";

export const metadata: Metadata = {
  title: `${LEGAL_META.privacidade.title} — Siept IT`,
  description: LEGAL_META.privacidade.description,
};

export default function PrivacidadePage() {
  const html = loadLegalHtml("privacidade");
  return <LegalDocument id="privacidade" html={html} />;
}
