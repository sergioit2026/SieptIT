"use client";

import { PHOTOS_MAX } from "@/lib/site-config";
import { SOUNDS } from "@/lib/wizard-options";
import PhotoPicker from "./PhotoPicker";
import { useWizard } from "./WizardContext";
import styles from "./wizard.module.css";

export default function StepMedia() {
  const { state, errors, setMedia } = useWizard();
  const { media } = state;

  return (
    <div className={styles.panel}>
      <h1 className={styles.panelTitle}>Media</h1>
      <p className={styles.panelLead}>
        Adicione até {PHOTOS_MAX} fotos (suas ou da biblioteca de exemplo), um
        logótipo opcional e um ambiente sonoro — por defeito, silencioso.
      </p>

      <div className={styles.form}>
        <PhotoPicker />

        <div className={styles.field}>
          <label className={styles.label} htmlFor="logo-url">
            URL do logótipo <span className={styles.hint}>(opcional)</span>
          </label>
          <input
            id="logo-url"
            className={`${styles.input} ${
              errors.logoUrl ? styles.inputError : ""
            }`}
            value={media.logoUrl ?? ""}
            onChange={(e) =>
              setMedia({ logoUrl: e.target.value.trim() ? e.target.value : null })
            }
            placeholder="https://… ou deixe em branco"
            inputMode="url"
          />
          {errors.logoUrl && <p className={styles.error}>{errors.logoUrl}</p>}
        </div>

        <div className={styles.field}>
          <span className={styles.label}>Som ambiente</span>
          <span className={styles.hint}>
            Por defeito: sem som. O autoplay fica desligado.
          </span>
          <div className={styles.soundGrid} role="radiogroup" aria-label="Sons">
            <button
              type="button"
              role="radio"
              aria-checked={media.soundId === null}
              className={`${styles.radioChip} ${
                media.soundId === null ? styles.radioChipSelected : ""
              }`}
              onClick={() => setMedia({ soundId: null, soundAutoplay: false })}
            >
              Sem som (recomendado)
            </button>
            {SOUNDS.map((sound) => (
              <button
                key={sound.id}
                type="button"
                role="radio"
                aria-checked={media.soundId === sound.id}
                className={`${styles.radioChip} ${
                  media.soundId === sound.id ? styles.radioChipSelected : ""
                }`}
                onClick={() =>
                  setMedia({ soundId: sound.id, soundAutoplay: false })
                }
              >
                {sound.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
