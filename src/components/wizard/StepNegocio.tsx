"use client";

import { ABOUT_MAX, SERVICES_MAX } from "@/lib/site-config";
import { SECTORS } from "@/lib/wizard-options";
import { useWizard } from "./WizardContext";
import styles from "./wizard.module.css";

export default function StepNegocio() {
  const {
    state,
    errors,
    setIdentity,
    updateService,
    addService,
    removeService,
  } = useWizard();
  const { identity, services } = state;

  return (
    <div className={styles.panel}>
      <h1 className={styles.panelTitle}>O seu negócio</h1>
      <p className={styles.panelLead}>
        Conte-nos quem é e o que oferece. Estes dados formam a base do site.
      </p>

      <div className={styles.form}>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="biz-name">
            Nome <span className={styles.required}>*</span>
          </label>
          <input
            id="biz-name"
            className={`${styles.input} ${errors.name ? styles.inputError : ""}`}
            value={identity.name}
            onChange={(e) => setIdentity({ name: e.target.value })}
            placeholder="Ex.: Atelier Norte"
            autoComplete="organization"
          />
          {errors.name && <p className={styles.error}>{errors.name}</p>}
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="biz-slogan">
            Slogan
          </label>
          <input
            id="biz-slogan"
            className={styles.input}
            value={identity.slogan}
            onChange={(e) => setIdentity({ slogan: e.target.value })}
            placeholder="Ex.: Design com propósito"
            maxLength={120}
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="biz-sector">
            Sector <span className={styles.required}>*</span>
          </label>
          <select
            id="biz-sector"
            className={`${styles.select} ${
              errors.sector ? styles.inputError : ""
            }`}
            value={identity.sector}
            onChange={(e) =>
              setIdentity({
                sector: e.target.value as typeof identity.sector,
              })
            }
          >
            <option value="">Seleccione…</option>
            {SECTORS.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>
          {errors.sector && <p className={styles.error}>{errors.sector}</p>}
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="biz-about">
            Sobre o negócio
          </label>
          <textarea
            id="biz-about"
            className={`${styles.textarea} ${
              errors.about ? styles.inputError : ""
            }`}
            value={identity.about}
            onChange={(e) => setIdentity({ about: e.target.value.slice(0, ABOUT_MAX) })}
            placeholder="Uma breve descrição do que faz…"
            maxLength={ABOUT_MAX}
          />
          <div className={styles.charCount}>
            {identity.about.length}/{ABOUT_MAX}
          </div>
          {errors.about && <p className={styles.error}>{errors.about}</p>}
        </div>

        <div className={styles.field}>
          <div className={styles.serviceHead}>
            <span className={styles.label}>
              Serviços <span className={styles.required}>*</span>
            </span>
            <span className={styles.hint}>
              {services.filter((s) => s.title.trim()).length}–{SERVICES_MAX}
            </span>
          </div>
          {errors.services && <p className={styles.error}>{errors.services}</p>}

          <div className={styles.services}>
            {services.map((service, i) => (
              <div key={i} className={styles.serviceCard}>
                <div className={styles.serviceHead}>
                  <span className={styles.serviceIndex}>Serviço {i + 1}</span>
                  {services.length > 1 && (
                    <button
                      type="button"
                      className={`${styles.linkBtn} ${styles.linkBtnDanger}`}
                      onClick={() => removeService(i)}
                    >
                      Remover
                    </button>
                  )}
                </div>
                <input
                  className={`${styles.input} ${
                    errors[`service-${i}`] ? styles.inputError : ""
                  }`}
                  value={service.title}
                  onChange={(e) => updateService(i, { title: e.target.value })}
                  placeholder="Título"
                  aria-label={`Título do serviço ${i + 1}`}
                />
                <textarea
                  className={styles.textarea}
                  style={{ minHeight: 72 }}
                  value={service.description}
                  onChange={(e) =>
                    updateService(i, {
                      description: e.target.value.slice(0, 160),
                    })
                  }
                  placeholder="Descrição curta"
                  aria-label={`Descrição do serviço ${i + 1}`}
                  maxLength={160}
                />
                {errors[`service-${i}`] && (
                  <p className={styles.error}>{errors[`service-${i}`]}</p>
                )}
              </div>
            ))}
          </div>

          {services.length < SERVICES_MAX && (
            <button type="button" className={styles.linkBtn} onClick={addService}>
              + Adicionar serviço
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
