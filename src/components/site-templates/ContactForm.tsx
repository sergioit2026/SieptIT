"use client";

import { useState, type FormEvent } from "react";
import styles from "./site.module.css";

export default function ContactForm() {
  const [toast, setToast] = useState(false);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    setToast(true);
    window.setTimeout(() => setToast(false), 2600);
  };

  return (
    <>
      <form className={styles.form} onSubmit={onSubmit} noValidate>
        <label>
          Nome
          <input name="name" type="text" autoComplete="name" placeholder="O seu nome" />
        </label>
        <label>
          Email
          <input
            name="email"
            type="email"
            autoComplete="email"
            placeholder="nome@email.com"
            required
          />
        </label>
        <label>
          Mensagem
          <textarea name="message" rows={4} placeholder="Como podemos ajudar?" required />
        </label>
        <p className={styles.formNote}>
          O envio de mensagens chega em breve — por agora este formulário é apenas
          pré-visualização.
        </p>
        <button type="submit" className={styles.btnPrimary}>
          Enviar
        </button>
      </form>
      {toast ? (
        <div className={styles.toast} role="status">
          Em breve
        </div>
      ) : null}
    </>
  );
}
