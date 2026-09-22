"use client";

import { useCallback, useMemo, useState } from "react";
import type { SiteConfig } from "@/lib/site-config";
import { styleFromVars, themeVarsFromConfig } from "@/lib/theme-tokens";
import IntroOverlay from "./IntroOverlay";
import SiteChrome, { type NavItem } from "./SiteChrome";
import ClassicFour from "./layouts/ClassicFour";
import MinimalCard from "./layouts/MinimalCard";
import OnepageHero from "./layouts/OnepageHero";
import ServicesGrid from "./layouts/ServicesGrid";

type Props = {
  config: SiteConfig;
  showPreviewBanner?: boolean;
};

function buildNav(config: SiteConfig): NavItem[] {
  const items: NavItem[] = [{ href: "#inicio", label: "Início" }];
  if (config.services.length > 0) {
    items.push({ href: "#servicos", label: "Serviços" });
  }
  if (config.identity.about.trim() && config.layoutId !== "minimal-card") {
    items.push({ href: "#sobre", label: "Sobre" });
  }
  if (
    config.media.photoIds.length > 0 &&
    config.layoutId !== "minimal-card"
  ) {
    items.push({ href: "#galeria", label: "Galeria" });
  }
  items.push({ href: "#contacto", label: "Contactos" });
  return items;
}

export default function SiteRenderer({
  config,
  showPreviewBanner = true,
}: Props) {
  const vars = useMemo(() => themeVarsFromConfig(config), [config]);
  const nav = useMemo(() => buildNav(config), [config]);
  const [introDone, setIntroDone] = useState(!config.theme.introAnimation);

  const onIntroDone = useCallback(() => setIntroDone(true), []);

  let body;
  switch (config.layoutId) {
    case "classic-four":
      body = <ClassicFour config={config} nav={nav} />;
      break;
    case "services-grid":
      body = <ServicesGrid config={config} nav={nav} />;
      break;
    case "minimal-card":
      body = <MinimalCard config={config} nav={nav} />;
      break;
    case "onepage-hero":
    default:
      body = <OnepageHero config={config} nav={nav} />;
      break;
  }

  return (
    <div style={styleFromVars(vars)}>
      {config.theme.introAnimation ? (
        <IntroOverlay
          name={config.identity.name}
          slogan={config.identity.slogan}
          introStyle={config.theme.introStyle}
          enabled={!introDone}
          onDone={onIntroDone}
        />
      ) : null}
      <SiteChrome
        config={config}
        nav={nav}
        showPreviewBanner={showPreviewBanner}
      >
        {body}
      </SiteChrome>
    </div>
  );
}
