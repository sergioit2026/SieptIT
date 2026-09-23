import type { Metadata } from "next";
import LegalDocument from "@/components/legal/LegalDocument";
import { LEGAL_META, loadLegalHtml } from "@/lib/legal-docs";

export const metadata: Metadata = {
  title: `${LEGAL_META.termos.title} — Siept IT`,
  description: LEGAL_META.termos.description,
};

export default function TermosPage() {
  const html = loadLegalHtml("termos");
  return <LegalDocument id="termos" html={html} />;
}
