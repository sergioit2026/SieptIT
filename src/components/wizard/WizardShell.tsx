"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useWizard, WIZARD_STEPS } from "./WizardContext";
import StepNegocio from "./StepNegocio";
import StepContactos from "./StepContactos";
import StepEstrutura from "./StepEstrutura";
import StepVisual from "./StepVisual";
import StepMedia from "./StepMedia";
import StepRever from "./StepRever";
import styles from "./wizard.module.css";

export default function WizardShell() {
  const router = useRouter();
  const { stepIndex, stepId, finished, goNext, goBack, goTo, finish } = useWizard();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [stepIndex, finished]);

  function handleBack() {
    if (stepIndex === 0) {
      router.push("/");
      return;
    }
    goBack();
  }

  const progress = ((stepIndex + 1) / WIZARD_STEPS.length) * 100;
  const isLast = stepId === "rever";
  const showNav = !(finished && isLast);

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <Link href="/" className={styles.logo}>
            Siept IT
          </Link>
          <span className={styles.headerMeta}>Criar o meu site</span>
        </div>
      </header>

      <main className={styles.main}>
        <div className={styles.progressWrap}>
          <div className={styles.progressLabel}>
            <p className={styles.progressTitle}>
              {finished ? "Concluído" : WIZARD_STEPS[stepIndex].label}
            </p>
            <span className={styles.progressCount}>
              Passo {Math.min(stepIndex + 1, WIZARD_STEPS.length)} de{" "}
              {WIZARD_STEPS.length}
            </span>
          </div>
          <div
            className={styles.progressTrack}
            role="progressbar"
            aria-valuenow={finished ? 100 : Math.round(progress)}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Progresso do assistente"
          >
            <div
              className={styles.progressBar}
              style={{ width: finished ? "100%" : `${progress}%` }}
            />
          </div>
          <ol className={styles.stepsNav}>
            {WIZARD_STEPS.map((step, i) => {
              const done = i < stepIndex || finished;
              const active = i === stepIndex && !finished;
              return (
                <li key={step.id}>
                  <button
                    type="button"
                    className={`${styles.stepChip} ${
                      done ? styles.stepChipDone : ""
                    } ${active ? styles.stepChipActive : ""}`}
                    onClick={() => goTo(i)}
                    disabled={i > stepIndex && !finished}
                    aria-current={active ? "step" : undefined}
                  >
                    {step.label}
                  </button>
                </li>
              );
            })}
          </ol>
        </div>

        {stepId === "negocio" && <StepNegocio />}
        {stepId === "contactos" && <StepContactos />}
        {stepId === "estrutura" && <StepEstrutura />}
        {stepId === "visual" && <StepVisual />}
        {stepId === "media" && <StepMedia />}
        {stepId === "rever" && <StepRever />}

        {showNav && !isLast && (
          <div className={styles.footerNav}>
            <button
              type="button"
              className={`${styles.btn} ${styles.btnGhost}`}
              onClick={handleBack}
            >
              Voltar
            </button>
            <button type="button" className={styles.btn} onClick={() => goNext()}>
              Seguinte
            </button>
          </div>
        )}

        {showNav && isLast && !finished && (
          <div className={styles.footerNav}>
            <button
              type="button"
              className={`${styles.btn} ${styles.btnGhost}`}
              onClick={handleBack}
            >
              Voltar
            </button>
            <button
              type="button"
              className={styles.btn}
              onClick={() => {
                finish();
              }}
            >
              Continuar
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
