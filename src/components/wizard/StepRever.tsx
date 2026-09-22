"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FONTS,
  getLayout,
  getPalette,
  getSectorLabel,
  SOUNDS,
} from "@/lib/wizard-options";
import { buildSiteConfig } from "@/lib/site-config";
import { previewPath, saveSiteConfig } from "@/lib/site-storage";
import { useWizard } from "./WizardContext";
import styles from "./wizard.module.css";

export default function StepRever() {
  const { state, finished, siteConfig } = useWizard();
  const [copied, setCopied] = useState(false);
  const router = useRouter();

  const palette = getPalette(state.theme.paletteId);
  const layout = getLayout(state.layoutId);
  const font = FONTS.find((f) => f.id === state.theme.fontId);
  const soundLabel =
    state.media.soundId === null
      ? "Sem som"
      : SOUNDS.find((s) => s.id === state.media.soundId)?.label ?? "—";

  const services = state.services.filter((s) => s.title.trim());

  const jsonText = siteConfig
    ? JSON.stringify(siteConfig, null, 2)
    : "";

  const handleCopy = useCallback(async () => {
    if (!jsonText) return;
    try {
      await navigator.clipboard.writeText(jsonText);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      setCopied(false);
    }
  }, [jsonText]);

  const handleDownload = useCallback(() => {
    if (!siteConfig) return;
    const blob = new Blob([jsonText], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${siteConfig.slug || "site"}-config.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [jsonText, siteConfig]);

  const openPreviewFromDraft = useCallback(() => {
    const config = buildSiteConfig(state);
    saveSiteConfig(config);
    router.push(previewPath(config.slug));
  }, [router, state]);

  if (finished && siteConfig) {
    const href = previewPath(siteConfig.slug);
    return (
      <div className={styles.panel}>
        <div className={styles.success}>
          <div className={styles.successIcon} aria-hidden="true">
            ✓
          </div>
          <h2>Pré-inscrição pronta — pagamentos em breve</h2>
          <p>
            Guardámos a configuração do seu site (plano Básico, estado rascunho).
            Pode pré-visualizar o site gerado, ou descarregar / copiar o JSON.
          </p>
          <div className={styles.successActions}>
            <Link href={href} className={styles.btn}>
              Pré-visualizar site
            </Link>
            <button type="button" className={`${styles.btn} ${styles.btnSecondary}`} onClick={handleDownload}>
              Descarregar JSON
            </button>
            <button
              type="button"
              className={`${styles.btn} ${styles.btnSecondary}`}
              onClick={handleCopy}
            >
              Copiar JSON
            </button>
            <Link href="/" className={`${styles.btn} ${styles.btnGhost}`}>
              Voltar ao início
            </Link>
          </div>
          {copied && (
            <p className={styles.copyToast} role="status">
              Copiado para a área de transferência.
            </p>
          )}
          <div className={styles.jsonBox}>
            <pre>{jsonText}</pre>
          </div>
        </div>
      </div>
    );
  }

  const preview = palette.preview;
  const isDark =
    state.theme.paletteId === "midnight-blue" ||
    state.theme.paletteId === "ink-gold";

  return (
    <div className={styles.panel}>
      <h1 className={styles.panelTitle}>Rever</h1>
      <p className={styles.panelLead}>
        Confirme as escolhas. Pode pré-visualizar o site gerado a qualquer
        momento, ou continuar para finalizar a pré-inscrição.
      </p>

      <div className={styles.reviewGrid}>
        <div className={styles.summary}>
          <div className={styles.summaryBlock}>
            <h3>Negócio</h3>
            <dl>
              <dt>Nome</dt>
              <dd>{state.identity.name || "—"}</dd>
              <dt>Slogan</dt>
              <dd>{state.identity.slogan || "—"}</dd>
              <dt>Sector</dt>
              <dd>{getSectorLabel(state.identity.sector)}</dd>
            </dl>
          </div>

          <div className={styles.summaryBlock}>
            <h3>Contactos</h3>
            <dl>
              <dt>Telefone</dt>
              <dd>{state.contact.phone || "—"}</dd>
              <dt>Email</dt>
              <dd>{state.contact.email || "—"}</dd>
              <dt>CTA</dt>
              <dd>
                {state.contact.primaryCta === "call"
                  ? "Ligar"
                  : state.contact.primaryCta === "email"
                    ? "Email"
                    : "Contactar"}
              </dd>
            </dl>
          </div>

          <div className={styles.summaryBlock}>
            <h3>Visual & media</h3>
            <dl>
              <dt>Estrutura</dt>
              <dd>{layout?.label ?? "—"}</dd>
              <dt>Paleta</dt>
              <dd>{palette.label}</dd>
              <dt>Tipografia</dt>
              <dd>{font?.label ?? "—"}</dd>
              <dt>Fotos</dt>
              <dd>{state.media.photoIds.length} seleccionadas</dd>
              <dt>Som</dt>
              <dd>{soundLabel}</dd>
            </dl>
          </div>

          <div className={styles.summaryBlock}>
            <h3>Serviços</h3>
            <ul className={styles.summaryList}>
              {services.length === 0 && <li>—</li>}
              {services.map((s, i) => (
                <li key={i}>
                  <strong>{s.title}</strong>
                  {s.description ? ` — ${s.description}` : ""}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div
          className={styles.previewCard}
          style={{
            background: preview.bg,
            color: preview.text,
            fontFamily:
              state.theme.fontId === "editorial"
                ? 'Georgia, "Times New Roman", serif'
                : state.theme.fontId === "tech-mono-accent"
                  ? "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace"
                  : "inherit",
          }}
          aria-label="Pré-visualização estilizada"
        >
          <div
            className={styles.previewHero}
            style={{ background: preview.surface }}
          >
            <p className={styles.previewEyebrow} style={{ color: preview.accent }}>
              Siept IT · pré-visualização
            </p>
            <h2 className={styles.previewName}>
              {state.identity.name || "O seu negócio"}
            </h2>
            <p className={styles.previewSlogan}>
              {state.identity.slogan ||
                "Slogan e identidade aparecerão aqui."}
            </p>
            <span
              className={styles.previewLayout}
              style={{
                color: preview.text,
                borderColor: isDark
                  ? "rgba(255,255,255,0.2)"
                  : "rgba(30,64,110,0.15)",
                background: isDark
                  ? "rgba(255,255,255,0.08)"
                  : "rgba(61,122,184,0.1)",
              }}
            >
              {layout?.label ?? "Layout"}
            </span>
          </div>
          <ul
            className={styles.previewServices}
            style={{
              borderColor: isDark
                ? "rgba(255,255,255,0.12)"
                : "rgba(30,64,110,0.1)",
              background: preview.bg,
            }}
          >
            {services.slice(0, 4).map((s, i) => (
              <li key={i}>
                <strong style={{ color: preview.accent }}>{s.title}</strong>
                {s.description ? ` — ${s.description}` : ""}
              </li>
            ))}
            {services.length === 0 && (
              <li style={{ opacity: 0.7 }}>Os serviços aparecerão aqui.</li>
            )}
          </ul>
        </div>
      </div>

      <div className={styles.successActions} style={{ marginTop: "1.5rem", justifyContent: "flex-start" }}>
        <button
          type="button"
          className={`${styles.btn} ${styles.btnSecondary}`}
          onClick={openPreviewFromDraft}
        >
          Pré-visualizar site
        </button>
      </div>
    </div>
  );
}
