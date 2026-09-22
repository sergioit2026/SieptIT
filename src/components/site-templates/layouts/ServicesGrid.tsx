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

export default function ServicesGrid({
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
    <div className={styles.layoutServices}>
      <SiteNav config={config} nav={nav} />
      <section id="inicio" className={styles.hero}>
        <div className={styles.heroInner}>
          <div>
            <p className={styles.eyebrow}>Catálogo</p>
            <h1 className={styles.heroTitle}>{config.identity.name}</h1>
            {config.identity.slogan ? (
              <p className={styles.heroSlogan}>{config.identity.slogan}</p>
            ) : (
              <p className={styles.heroSlogan}>
                Serviços em destaque — escolha o que precisa.
              </p>
            )}
            <div className={styles.heroActions}>
              <a className={styles.btnPrimary} href="#servicos">
                Explorar serviços
              </a>
              <a className={styles.btnGhost} href={ctaHref}>
                {ctaLabel}
              </a>
            </div>
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
