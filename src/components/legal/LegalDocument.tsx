import Link from "next/link";
import type { LegalDocId } from "@/lib/legal-docs";
import { LEGAL_META, LEGAL_VERSION } from "@/lib/legal-docs";
import styles from "./legal.module.css";

type Props = {
  id: LegalDocId;
  html: string;
};

export default function LegalDocument({ id, html }: Props) {
  const other: LegalDocId = id === "termos" ? "privacidade" : "termos";
  const meta = LEGAL_META[id];
  const otherMeta = LEGAL_META[other];

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <Link href="/" className={styles.logo}>
            Siept IT
          </Link>
          <nav className={styles.nav} aria-label="Documentos legais">
            <Link href="/termos" className={id === "termos" ? styles.navActive : undefined}>
              Termos
            </Link>
            <Link
              href="/privacidade"
              className={id === "privacidade" ? styles.navActive : undefined}
            >
              Privacidade
            </Link>
            <Link href="/" className={styles.navHome}>
              Início
            </Link>
          </nav>
        </div>
      </header>

      <div className={styles.banner} role="status">
        <strong>Rascunho</strong>
        <span>
          Este documento ainda não foi revisto por um advogado. Os campos entre{" "}
          <span className={styles.bannerPh}>[parênteses rectos]</span> estão por
          preencher. Não use como versão jurídica definitiva nem active
          pagamentos até revisão.
        </span>
      </div>

      <main className={styles.main}>
        <p className={styles.eyebrow}>
          Documentação legal · Siept IT · {LEGAL_VERSION.version} (rascunho) ·{" "}
          {LEGAL_VERSION.date}
        </p>
        <article
          className={styles.article}
          aria-label={meta.title}
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </main>

      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <p className={styles.footerCopy}>
            © {new Date().getFullYear()} Siept IT · rascunho {LEGAL_VERSION.version} ·{" "}
            {LEGAL_VERSION.date}
          </p>
          <div className={styles.footerLinks}>
            <Link href={`/${other}`}>{otherMeta.navLabel}</Link>
            <Link href="/">Voltar ao início</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
