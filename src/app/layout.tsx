import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Siept IT — O seu site, simples e contínuo",
  description:
    "Siept IT é a forma sóbria e moderna de ter presença na web. Escolha, personalize e fique online após a assinatura.",
  openGraph: {
    title: "Siept IT",
    description: "Websites por assinatura. Simples, contínuo, português.",
    locale: "pt_PT",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-PT">
      <body>{children}</body>
    </html>
  );
}
