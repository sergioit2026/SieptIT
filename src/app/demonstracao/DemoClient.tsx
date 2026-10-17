"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { WizardProvider } from "@/components/wizard/WizardContext";
import WizardShell from "@/components/wizard/WizardShell";
import IntroSplash from "@/components/IntroSplash";
import { clearDemoData, disableDemoMode, enableDemoMode } from "@/lib/demo/mode";
import { demoLogout } from "./actions";

export default function DemoClient({
  expiresAt,
  showIntro = false,
}: {
  expiresAt: number;
  /** true só logo após o login (`?entrada=1`): pré-loader da landing uma vez. */
  showIntro?: boolean;
}) {
  const [introDone, setIntroDone] = useState(!showIntro);
  // Activar o modo demo antes de o assistente ler/escrever qualquer coisa.
  useState(() => {
    enableDemoMode();
    clearDemoData();
    return true;
  });
  const [ending, startEnding] = useTransition();
  const endedRef = useRef(false);

  const end = useCallback((reason: "fim" | "expirou") => {
    if (endedRef.current) return;
    endedRef.current = true;
    clearDemoData();
    if (reason === "expirou") {
      // O cookie já expirou no browser: ir directamente para a entrada.
      window.location.replace("/demonstracao/entrar?expirou=1");
      return;
    }
    startEnding(async () => {
      try {
        await demoLogout("fim");
      } finally {
        // Recurso caso o redireccionamento da Server Action não aconteça.
        window.setTimeout(() => window.location.replace("/demonstracao/entrar?fim=1"), 3000);
      }
    });
  }, []);

  useEffect(() => {
    enableDemoMode();
    const onHide = () => clearDemoData();
    window.addEventListener("pagehide", onHide);
    // Guarda global: nenhum link sai da página da demonstração (clique normal,
    // clique do meio/Ctrl/Cmd, arrastar) e nenhum formulário é submetido.
    const blockLink = (e: Event) => {
      const a = (e.target as Element | null)?.closest?.("a[href]");
      if (!a) return;
      const href = a.getAttribute("href") ?? "";
      const plain = e.type === "click" && !(e as MouseEvent).ctrlKey && !(e as MouseEvent).metaKey && !(e as MouseEvent).shiftKey;
      if (href.startsWith("#") && plain) return; // âncora na própria página
      e.preventDefault();
      e.stopPropagation();
    };
    const blockSubmit = (e: Event) => {
      const form = e.target as HTMLFormElement | null;
      if (form && !form.closest("[data-demo-allow-submit]")) e.preventDefault();
    };
    document.addEventListener("click", blockLink, true);
    document.addEventListener("auxclick", blockLink, true);
    document.addEventListener("dragstart", blockLink, true);
    document.addEventListener("submit", blockSubmit, true);
    const ms = Math.max(0, expiresAt - Date.now());
    const timer = window.setTimeout(() => end("expirou"), ms);
    return () => {
      window.removeEventListener("pagehide", onHide);
      document.removeEventListener("click", blockLink, true);
      document.removeEventListener("auxclick", blockLink, true);
      document.removeEventListener("dragstart", blockLink, true);
      document.removeEventListener("submit", blockSubmit, true);
      window.clearTimeout(timer);
      clearDemoData();
      disableDemoMode();
    };
  }, [expiresAt, end]);

  const handleIntroComplete = useCallback(() => {
    // Retirar `entrada=1` do URL sem navegar: recarregar não repete o pré-loader.
    window.history.replaceState(null, "", "/demonstracao");
    setIntroDone(true);
  }, []);

  if (!introDone) return <IntroSplash onComplete={handleIntroComplete} />;

  return (
    <WizardProvider demo>
      <WizardShell onEndDemo={() => end("fim")} endingDemo={ending} />
    </WizardProvider>
  );
}
