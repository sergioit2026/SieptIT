"use client";

import { useActionState, useEffect } from "react";
import { clearDemoData, disableDemoMode } from "@/lib/demo/mode";
import { demoLogin, type LoginState } from "../actions";
import styles from "../demo.module.css";

const initial: LoginState = { error: null };

export default function LoginForm({
  notice,
  configured,
}: {
  notice: string | null;
  configured: boolean;
}) {
  const [state, action, pending] = useActionState(demoLogin, initial);

  // Ao carregar a página de entrada: apagar qualquer resto de uma demonstração.
  useEffect(() => {
    clearDemoData();
    disableDemoMode();
  }, []);

  return (
    <main className={styles.page}>
      <div className={styles.card}>
        <p className={styles.brand}>Siept IT</p>
        <h1 className={styles.title}>Área de demonstração</h1>
        <p className={styles.lead}>
          Acesso reservado. A demonstração é feita na presença de um responsável
          da Siept IT; nada do que for criado é publicado nem guardado.
        </p>

        {notice && !state.error && (
          <p className={styles.notice} role="status">
            {notice}
          </p>
        )}
        {!configured && (
          <p className={styles.error} role="alert">
            A demonstração não está configurada neste servidor.
          </p>
        )}

        <form action={action} className={styles.form} autoComplete="off">
          <label className={styles.label}>
            Utilizador
            <input
              name="utilizador"
              type="text"
              required
              autoComplete="username"
              autoCapitalize="none"
              spellCheck={false}
              className={styles.input}
              maxLength={128}
            />
          </label>
          <label className={styles.label}>
            Palavra-passe
            <input
              name="palavra_passe"
              type="password"
              required
              autoComplete="current-password"
              className={styles.input}
              maxLength={256}
            />
          </label>
          {state.error && (
            <p className={styles.error} role="alert">
              {state.error}
            </p>
          )}
          <button type="submit" className={styles.button} disabled={pending || !configured}>
            {pending ? "A verificar…" : "Entrar"}
          </button>
        </form>
      </div>
    </main>
  );
}
