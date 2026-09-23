import { readFileSync } from "node:fs";
import { join } from "node:path";
import { markdownToHtml } from "./simple-markdown";

export type LegalDocId = "termos" | "privacidade";

const FILES: Record<LegalDocId, string> = {
  termos: "termos-de-utilizacao.md",
  privacidade: "politica-de-privacidade.md",
};

export const LEGAL_META: Record<
  LegalDocId,
  { title: string; description: string; navLabel: string }
> = {
  termos: {
    title: "Termos de Utilização",
    description:
      "Termos de Utilização da plataforma Siept IT (rascunho — revisão jurídica pendente).",
    navLabel: "Termos",
  },
  privacidade: {
    title: "Política de Privacidade",
    description:
      "Política de Privacidade da plataforma Siept IT (rascunho — revisão jurídica pendente).",
    navLabel: "Privacidade",
  },
};

export function loadLegalHtml(id: LegalDocId): string {
  const file = FILES[id];
  const path = join(process.cwd(), "content", "legal", file);
  const md = readFileSync(path, "utf8");
  return markdownToHtml(md);
}
