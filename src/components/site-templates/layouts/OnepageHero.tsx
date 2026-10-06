import type { SiteConfig } from "@/lib/site-config";
import {
  primaryCtaHref,
  primaryCtaLabel,
  type ResolvedPhoto,
} from "@/lib/render/photos";
import {
  AboutSection,
  ContactSection,
  Gallery,
  ServicesSection,
  SiteFooter,
  SitePhoto,
  SiteNav,
  type NavItem,
} from "../SiteChrome";
import styles from "../site.module.css";

export default function OnepageHero({
  config,
  nav,
  photos,
}: {
  config: SiteConfig;
  nav: NavItem[];
  photos: ResolvedPhoto[];
}) {
  const hero = photos[0];
  const rest = photos.slice(1);
  const ctaLabel = primaryCtaLabel(config.contact.primaryCta);
  const ctaHref = primaryCtaHref(config.contact.primaryCta, config.contact);

  return (
    <div className={styles.layoutOnepage}>
      <SiteNav config={config} nav={nav} />
      <section id="inicio" className={styles.hero}>
        <div className={styles.heroInner}>
          <div>
            <p className={styles.eyebrow}>Início</p>
            <h1 className={styles.heroTitle}>{config.identity.name}</h1>
            {config.identity.slogan ? (
              <p className={styles.heroSlogan}>{config.identity.slogan}</p>
            ) : null}
            <div className={styles.heroActions}>
              <a className={styles.btnPrimary} href={ctaHref}>
                {ctaLabel}
              </a>
              <a className={styles.btnGhost} href="#servicos">
                Ver serviços
              </a>
            </div>
          </div>
          {hero ? (
            <div className={styles.heroMedia}>
              <SitePhoto photo={hero} priority />
            </div>
          ) : (
            <div
              className={styles.heroMedia}
              style={{
                background:
                  "linear-gradient(135deg, var(--site-surface), var(--site-glow))",
              }}
              aria-hidden
            />
          )}
        </div>
      </section>
      <ServicesSection config={config} />
      <AboutSection config={config} />
      <Gallery photos={rest} />
      <ContactSection config={config} />
      <SiteFooter config={config} />
    </div>
  );
}
