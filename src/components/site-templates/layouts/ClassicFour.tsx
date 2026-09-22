import type { SiteConfig } from "@/lib/site-config";
import {
  primaryCtaHref,
  primaryCtaLabel,
  resolvePhotos,
} from "@/lib/render/photos";
import {
  AboutSection,
  ContactSection,
  Gallery,
  ServicesSection,
  SiteFooter,
  SiteNav,
  type NavItem,
} from "../SiteChrome";
import styles from "../site.module.css";

export default function ClassicFour({
  config,
  nav,
}: {
  config: SiteConfig;
  nav: NavItem[];
}) {
  const photos = resolvePhotos(config.media.photoIds);
  const ctaLabel = primaryCtaLabel(config.contact.primaryCta);
  const ctaHref = primaryCtaHref(config.contact.primaryCta, config.contact);

  return (
    <div className={styles.layoutClassic}>
      <SiteNav config={config} nav={nav} />
      <section id="inicio" className={styles.hero}>
        <div className={styles.heroInner}>
          <p className={styles.eyebrow}>Início</p>
          <h1 className={styles.heroTitle}>{config.identity.name}</h1>
          {config.identity.slogan ? (
            <p className={styles.heroSlogan}>{config.identity.slogan}</p>
          ) : null}
          <div className={styles.heroActions}>
            <a className={styles.btnPrimary} href={ctaHref}>
              {ctaLabel}
            </a>
            <a className={styles.btnGhost} href="#sobre">
              Sobre nós
            </a>
          </div>
        </div>
      </section>
      <ServicesSection config={config} emphasize />
      <AboutSection config={config} />
      <Gallery photos={photos} />
      <ContactSection config={config} />
      <SiteFooter config={config} />
    </div>
  );
}
