import type { Metadata } from "next";
import { WizardProvider } from "@/components/wizard/WizardContext";
import WizardShell from "@/components/wizard/WizardShell";

export const metadata: Metadata = {
  title: "Criar o meu site — Siept IT",
  description:
    "Assistente Siept IT: configure o seu website passo a passo — negócio, contactos, estrutura e visual.",
};

export default function CriarPage() {
  return (
    <WizardProvider>
      <WizardShell />
    </WizardProvider>
  );
}
