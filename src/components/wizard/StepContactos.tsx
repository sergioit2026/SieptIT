"use client";

import type { PrimaryCta } from "@/lib/site-config";
import { useWizard } from "./WizardContext";
import styles from "./wizard.module.css";

const CTA_OPTIONS: { id: PrimaryCta; label: string }[] = [
  { id: "contact", label: "Contactar" },
  { id: "call", label: "Ligar" },
  { id: "email", label: "Email" },
];

export default function StepContactos() {
  const { state, errors, setContact, setSocial } = useWizard();
  const { contact } = state;

  return (
    <div className={styles.panel}>
      <h1 className={styles.panelTitle}>Contactos</h1>
      <p className={styles.panelLead}>
        Como quer que os clientes o encontrem? Telefone e email são
        obrigatórios; o resto é opcional.
      </p>

      <div className={styles.form}>
        <div className={styles.fieldRow}>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="phone">
              Telefone <span className={styles.required}>*</span>
            </label>
            <input
              id="phone"
              className={`${styles.input} ${
                errors.phone ? styles.inputError : ""
              }`}
              value={contact.phone}
              onChange={(e) => setContact({ phone: e.target.value })}
              placeholder="+351 900 000 000"
              autoComplete="tel"
              inputMode="tel"
            />
            {errors.phone && <p className={styles.error}>{errors.phone}</p>}
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="email">
              Email <span className={styles.required}>*</span>
            </label>
            <input
              id="email"
              type="email"
              className={`${styles.input} ${
                errors.email ? styles.inputError : ""
              }`}
              value={contact.email}
              onChange={(e) => setContact({ email: e.target.value })}
              placeholder="ola@exemplo.pt"
              autoComplete="email"
            />
            {errors.email && <p className={styles.error}>{errors.email}</p>}
          </div>
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="address">
            Morada <span className={styles.hint}>(opcional)</span>
          </label>
          <input
            id="address"
            className={styles.input}
            value={contact.address}
            onChange={(e) => setContact({ address: e.target.value })}
            placeholder="Rua, código postal, cidade"
            autoComplete="street-address"
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="hours">
            Horário <span className={styles.hint}>(opcional)</span>
          </label>
          <input
            id="hours"
            className={styles.input}
            value={contact.hours}
            onChange={(e) => setContact({ hours: e.target.value })}
            placeholder="Seg–Sex 9h–18h"
          />
        </div>

        <div className={styles.field}>
          <span className={styles.label}>
            Redes sociais <span className={styles.hint}>(opcional)</span>
          </span>
          <div className={styles.fieldRow}>
            <input
              className={styles.input}
              value={contact.social.instagram}
              onChange={(e) => setSocial({ instagram: e.target.value })}
              placeholder="Instagram URL ou @"
              aria-label="Instagram"
            />
            <input
              className={styles.input}
              value={contact.social.facebook}
              onChange={(e) => setSocial({ facebook: e.target.value })}
              placeholder="Facebook URL"
              aria-label="Facebook"
            />
          </div>
          <input
            className={styles.input}
            value={contact.social.linkedin}
            onChange={(e) => setSocial({ linkedin: e.target.value })}
            placeholder="LinkedIn URL"
            aria-label="LinkedIn"
            style={{ marginTop: "0.65rem" }}
          />
        </div>

        <div className={styles.field}>
          <span className={styles.label}>
            Botão principal <span className={styles.required}>*</span>
          </span>
          <div className={styles.radioGroup} role="radiogroup" aria-label="CTA principal">
            {CTA_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                type="button"
                role="radio"
                aria-checked={contact.primaryCta === opt.id}
                className={`${styles.radioChip} ${
                  contact.primaryCta === opt.id ? styles.radioChipSelected : ""
                }`}
                onClick={() => setContact({ primaryCta: opt.id })}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
