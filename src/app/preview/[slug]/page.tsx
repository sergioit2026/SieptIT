import type { Metadata } from "next";
import { decodeConfigFromQuery } from "@/lib/site-storage";
import PreviewClient from "./PreviewClient";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ c?: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  return {
    title: `Pré-visualização · ${slug} · Siept IT`,
    robots: { index: false, follow: false },
  };
}

export default async function PreviewPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const sp = await searchParams;
  const embedded = sp.c ?? null;
  const initialConfig = embedded ? decodeConfigFromQuery(embedded) : null;
  return (
    <PreviewClient
      slug={slug}
      embedded={embedded}
      initialConfig={initialConfig}
    />
  );
}
