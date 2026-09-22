"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { SiteConfig } from "@/lib/site-config";
import {
  decodeConfigFromQuery,
  loadSiteConfig,
  saveSiteConfig,
} from "@/lib/site-storage";
import { SiteRenderer } from "@/components/site-templates";
import styles from "@/components/site-templates/site.module.css";

type Props = {
  slug: string;
  embedded?: string | null;
  initialConfig?: SiteConfig | null;
};

export default function PreviewClient({
  slug,
  embedded,
  initialConfig = null,
}: Props) {
  const [config, setConfig] = useState<SiteConfig | null>(initialConfig);
  const [ready, setReady] = useState(Boolean(initialConfig));

  useEffect(() => {
    if (initialConfig) {
      saveSiteConfig(initialConfig);
      setConfig(initialConfig);
      setReady(true);
      return;
    }

    let resolved: SiteConfig | null = null;

    if (embedded) {
      resolved = decodeConfigFromQuery(embedded);
      if (resolved) saveSiteConfig(resolved);
    }

    if (!resolved) {
      resolved = loadSiteConfig();
    }

    void slug; // slug used for URL identity; storage is single-key for MVP
    setConfig(resolved);
    setReady(true);
  }, [slug, embedded, initialConfig]);

  if (!ready) {
    return (
      <div className={styles.emptyState}>
        <p>A carregar pré-visualização…</p>
      </div>
    );
  }

  if (!config) {
    return (
      <div className={styles.emptyState}>
        <h1>Sem configuração</h1>
        <p>
          Não encontrámos um site-config guardado. Complete o assistente em{" "}
          <Link href="/criar">/criar</Link> e escolha «Pré-visualizar site».
        </p>
      </div>
    );
  }

  return <SiteRenderer config={config} showPreviewBanner />;
}
