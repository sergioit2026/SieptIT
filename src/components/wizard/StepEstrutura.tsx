"use client";

import type { LayoutId } from "@/lib/site-config";
import { LAYOUTS } from "@/lib/wizard-options";
import { useWizard } from "./WizardContext";
import styles from "./wizard.module.css";

const VISUAL_CLASS: Record<LayoutId, string> = {
  "onepage-hero": styles.layoutVisualOnepage,
  "classic-four": styles.layoutVisualClassic,
  "services-grid": styles.layoutVisualGrid,
  "minimal-card": styles.layoutVisualMinimal,
};

export default function StepEstrutura() {
  const { state, errors, setLayoutId } = useWizard();

  return (
    <div className={styles.panel}>
      <h1 className={styles.panelTitle}>Estrutura</h1>
      <p className={styles.panelLead}>
        Escolha o layout base do site. Pode afinar conteúdos depois — a
        estrutura define a hierarquia.
      </p>

      {errors.layoutId && (
        <p className={styles.error} style={{ marginTop: "1rem" }}>
          {errors.layoutId}
        </p>
      )}

      <div className={styles.form}>
        <div className={styles.choiceGrid} role="radiogroup" aria-label="Layouts">
          {LAYOUTS.map((layout) => {
            const selected = state.layoutId === layout.id;
            return (
              <button
                key={layout.id}
                type="button"
                role="radio"
                aria-checked={selected}
                className={`${styles.choiceCard} ${
                  selected ? styles.choiceCardSelected : ""
                }`}
                onClick={() => setLayoutId(layout.id)}
              >
                <div
                  className={`${styles.layoutVisual} ${VISUAL_CLASS[layout.id]}`}
                  aria-hidden="true"
                >
                  {layout.id === "classic-four" && (
                    <>
                      <span />
                      <span />
                      <span />
                      <span />
                    </>
                  )}
                  {layout.id === "services-grid" && (
                    <>
                      <span />
                      <span />
                      <span />
                    </>
                  )}
                  {layout.id === "minimal-card" && <span />}
                </div>
                <span className={styles.choiceLabel}>{layout.label}</span>
                <span className={styles.choiceDesc}>{layout.description}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
