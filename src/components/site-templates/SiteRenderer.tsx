"use client";

import { useCallback, useMemo, useState } from "react";
import { isUserPhotoId, type SiteConfig } from "@/lib/site-config";
import { resolvePhotos, type ResolvedPhoto } from "@/lib/render/photos";
import { useUserPhotoUrls } from "@/lib/use-user-photo-urls";
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
  const photoCount = config.media.photoIds.length;
  const galleryCount =
    config.layoutId === "onepage-hero" ? photoCount - 1 : photoCount;
  if (galleryCount > 0 && config.layoutId !== "minimal-card") {
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
  const userIds = useMemo(
    () => config.media.photoIds.filter(isUserPhotoId),
    [config.media.photoIds]
  );
  const { urls, done } = useUserPhotoUrls(userIds);
  const photos = useMemo<ResolvedPhoto[]>(() => {
    const list = resolvePhotos(
      config.media.photoIds,
      config.media.userPhotos ?? [],
      urls
    );
    // F-4: if the principal is unavailable (here: own photo not stored in
    // this browser; with backend: pending moderation), the next available
    // photo moves up. Unavailable ones keep their 4:3 placeholder at the end.
    if (!done) return list;
    return [...list.filter((p) => p.url), ...list.filter((p) => !p.url)];
  }, [config.media.photoIds, config.media.userPhotos, urls, done]);
  const [introDone, setIntroDone] = useState(!config.theme.introAnimation);

  const onIntroDone = useCallback(() => setIntroDone(true), []);

  let body;
  switch (config.layoutId) {
    case "classic-four":
      body = <ClassicFour config={config} nav={nav} photos={photos} />;
      break;
    case "services-grid":
      body = <ServicesGrid config={config} nav={nav} photos={photos} />;
      break;
    case "minimal-card":
      body = <MinimalCard config={config} nav={nav} photos={photos} />;
      break;
    case "onepage-hero":
    default:
      body = <OnepageHero config={config} nav={nav} photos={photos} />;
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
