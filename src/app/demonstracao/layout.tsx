import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Demonstração — Siept IT",
  description: "Área reservada a demonstrações presenciais.",
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: { index: false, follow: false, noimageindex: true },
  },
  referrer: "no-referrer",
};

export const dynamic = "force-dynamic";

export default function DemonstracaoLayout({ children }: { children: React.ReactNode }) {
  return children;
}
