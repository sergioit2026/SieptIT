import type { SiteConfig } from "@/lib/site-config";
import {
  primaryCtaHref,
  primaryCtaLabel,
  resolvePhotos,
} from "@/lib/render/photos";
import {
  ContactSection,
  ServicesSection,
  SiteFooter,
  type NavItem,
} from "../SiteChrome";
import styles from "../site.module.css";

export default function MinimalCard({
  config,
  nav,
}: {
  config: SiteConfig;
  nav: NavItem[];
}) {
  const photos = resolvePhotos(config.media.photoIds);
  const hero = photos[0];
  const ctaLabel = primaryCtaLabel(config.contact.primaryCta);
  const ctaHref = primaryCtaHref(config.contact.primaryCta, config.contact);

  return (
    <div className={styles.layoutMinimal}>
      <header className={styles.nav}>
        <div className={styles.navInner}>
          <span className={styles.brandName}>{config.identity.name}</span>
          <ul className={styles.navLinks}>
            {nav.map((item) => (
              <li key={item.href}>
                <a href={item.href}>{item.label}</a>
              </li>
            ))}
          </ul>
        </div>
      </header>

      <div className={styles.cardShell} id="inicio">
        <section className={styles.hero}>
          <div className={styles.heroInner}>
            {hero ? (
              <div className={styles.heroMedia}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={hero.url} alt={hero.label} />
              </div>
            ) : config.media.logoUrl ? (
              <div className={styles.heroMedia}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={config.media.logoUrl} alt="" />
              </div>
            ) : null}
            <p className={styles.eyebrow}>Cartão</p>
            <h1 className={styles.heroTitle}>{config.identity.name}</h1>
            {config.identity.slogan ? (
              <p className={styles.heroSlogan}>{config.identity.slogan}</p>
            ) : null}
            {config.identity.about ? (
              <p className={styles.lead}>{config.identity.about}</p>
            ) : null}
            <div className={styles.heroActions}>
              <a className={styles.btnPrimary} href={ctaHref}>
                {ctaLabel}
              </a>
            </div>
          </div>
        </section>
      </div>

      <ServicesSection config={config} />
      <ContactSection config={config} />
      <SiteFooter config={config} />
    </div>
  );
}
