import type { Metadata } from "next";
import { decodeConfigFromQuery } from "@/lib/site-storage";
import PreviewClient from "../preview/[slug]/PreviewClient";

export const metadata: Metadata = {
  title: "Pré-visualização · Siept IT",
  robots: { index: false, follow: false },
};

type Props = {
  searchParams: Promise<{ c?: string; slug?: string }>;
};

export default async function SitePreviewPage({ searchParams }: Props) {
  const sp = await searchParams;
  const embedded = sp.c ?? null;
  const initialConfig = embedded ? decodeConfigFromQuery(embedded) : null;
  return (
    <PreviewClient
      slug={sp.slug || initialConfig?.slug || "site"}
      embedded={embedded}
      initialConfig={initialConfig}
    />
  );
}
