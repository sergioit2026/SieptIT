"use client";

import type { FontId, IntroStyle, PaletteId } from "@/lib/site-config";
import { FONTS, PALETTES } from "@/lib/wizard-options";
import { useWizard } from "./WizardContext";
import styles from "./wizard.module.css";

const INTRO_STYLES: { id: IntroStyle; label: string }[] = [
  { id: "fade-name", label: "Nome em fade" },
  { id: "rise-name", label: "Nome a subir" },
];

export default function StepVisual() {
  const { state, errors, setTheme } = useWizard();
  const { theme } = state;

  return (
    <div className={styles.panel}>
      <h1 className={styles.panelTitle}>Visual</h1>
      <p className={styles.panelLead}>
        Paleta, tipografia e animação de entrada — o tom da sua presença
        digital.
      </p>

      <div className={styles.form}>
        <div className={styles.field}>
          <span className={styles.label}>
            Paleta <span className={styles.required}>*</span>
          </span>
          {errors.paletteId && (
            <p className={styles.error}>{errors.paletteId}</p>
          )}
          <div
            className={styles.choiceGrid}
            role="radiogroup"
            aria-label="Paletas"
          >
            {PALETTES.map((palette) => {
              const selected = theme.paletteId === palette.id;
              return (
                <button
                  key={palette.id}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  className={`${styles.choiceCard} ${
                    selected ? styles.choiceCardSelected : ""
                  }`}
                  onClick={() =>
                    setTheme({ paletteId: palette.id as PaletteId })
                  }
                >
                  <div className={styles.swatches} aria-hidden="true">
                    {palette.swatches.map((c) => (
                      <span
                        key={c}
                        className={styles.swatch}
                        style={{ background: c }}
                      />
                    ))}
                  </div>
                  <span className={styles.choiceLabel}>{palette.label}</span>
                  <span className={styles.choiceDesc}>
                    {palette.description}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className={styles.field}>
          <span className={styles.label}>
            Tipografia <span className={styles.required}>*</span>
          </span>
          {errors.fontId && <p className={styles.error}>{errors.fontId}</p>}
          <div
            className={styles.choiceGrid}
            role="radiogroup"
            aria-label="Tipografias"
          >
            {FONTS.map((font) => {
              const selected = theme.fontId === font.id;
              const sampleClass =
                font.id === "editorial"
                  ? styles.fontEditorial
                  : font.id === "tech-mono-accent"
                    ? styles.fontMono
                    : "";
              return (
                <button
                  key={font.id}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  className={`${styles.choiceCard} ${
                    selected ? styles.choiceCardSelected : ""
                  }`}
                  onClick={() => setTheme({ fontId: font.id as FontId })}
                >
                  <div className={`${styles.fontSample} ${sampleClass}`}>
                    {font.sample}
                  </div>
                  <span className={styles.choiceLabel}>{font.label}</span>
                  <span className={styles.choiceDesc}>{font.description}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className={styles.toggleRow}>
          <div>
            <span className={styles.toggleLabel}>Animação de introdução</span>
            <span className={styles.toggleHint}>
              Respeita preferências de movimento reduzido no dispositivo.
            </span>
          </div>
          <label className={styles.switch}>
            <input
              type="checkbox"
              checked={theme.introAnimation}
              onChange={(e) => setTheme({ introAnimation: e.target.checked })}
              aria-label="Activar animação de introdução"
            />
            <span className={styles.switchSlider} />
          </label>
        </div>

        {theme.introAnimation && (
          <div className={styles.field}>
            <span className={styles.label}>Estilo da introdução</span>
            <div className={styles.radioGroup} role="radiogroup">
              {INTRO_STYLES.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  role="radio"
                  aria-checked={theme.introStyle === opt.id}
                  className={`${styles.radioChip} ${
                    theme.introStyle === opt.id ? styles.radioChipSelected : ""
                  }`}
                  onClick={() => setTheme({ introStyle: opt.id })}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
