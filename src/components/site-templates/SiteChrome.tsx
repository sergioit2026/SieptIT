"use client";

import type { ReactNode } from "react";
import type { SiteConfig } from "@/lib/site-config";
import {
  primaryCtaHref,
  primaryCtaLabel,
  type ResolvedPhoto,
} from "@/lib/render/photos";
import ContactForm from "./ContactForm";
import SoundControl from "./SoundControl";
import styles from "./site.module.css";

export type NavItem = { href: string; label: string };

type Props = {
  config: SiteConfig;
  nav: NavItem[];
  showPreviewBanner?: boolean;
  children: ReactNode;
};

export function SiteNav({
  config,
  nav,
}: {
  config: SiteConfig;
  nav: NavItem[];
}) {
  const ctaLabel = primaryCtaLabel(config.contact.primaryCta);
  const ctaHref = primaryCtaHref(config.contact.primaryCta, config.contact);

  return (
    <header className={styles.nav}>
      <div className={styles.navInner}>
        <a href="#inicio" className={styles.brand}>
          {config.media.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={config.media.logoUrl}
              alt=""
              className={styles.brandLogo}
              width={36}
              height={36}
            />
          ) : null}
          <span className={styles.brandName}>{config.identity.name}</span>
        </a>
        <ul className={styles.navLinks}>
          {nav.map((item) => (
            <li key={item.href}>
              <a href={item.href}>{item.label}</a>
            </li>
          ))}
        </ul>
        <a className={styles.navCta} href={ctaHref}>
          {ctaLabel}
        </a>
      </div>
    </header>
  );
}

export function SiteFooter({ config }: { config: SiteConfig }) {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerInner}>
        <div>
          <strong>{config.identity.name}</strong>
          <p style={{ margin: "0.35rem 0 0" }}>
            © {new Date().getFullYear()} · Rascunho Siept IT
          </p>
          <p className={styles.sieptCredit} style={{ margin: "0.65rem 0 0" }}>
            Powered by Siept IT
          </p>
        </div>
        <div className={styles.footerLegal}>
          {config.legal.privacyUrl ? (
            <a href={config.legal.privacyUrl}>Privacidade</a>
          ) : (
            <span aria-disabled="true">Privacidade</span>
          )}
          {config.legal.termsUrl ? (
            <a href={config.legal.termsUrl}>Termos</a>
          ) : (
            <span aria-disabled="true">Termos</span>
          )}
          <a href="#contacto">Contactos</a>
        </div>
      </div>
    </footer>
  );
}

export function ContactSection({ config }: { config: SiteConfig }) {
  const { contact } = config;
  const social = [
    { key: "instagram", label: "Instagram", href: contact.social.instagram },
    { key: "facebook", label: "Facebook", href: contact.social.facebook },
    { key: "linkedin", label: "LinkedIn", href: contact.social.linkedin },
  ].filter((s) => s.href.trim());

  return (
    <section id="contacto" className={styles.section}>
      <p className={styles.eyebrow}>Contactos</p>
      <h2 className={styles.sectionTitle}>Fale connosco</h2>
      <p className={styles.lead}>
        Prefere telefone ou email? Estamos disponíveis para o ajudar.
      </p>
      <div className={styles.contactGrid}>
        <dl className={styles.contactInfo}>
          {contact.phone ? (
            <div className={styles.contactRow}>
              <dt>Telefone</dt>
              <dd>
                <a href={`tel:${contact.phone.replace(/\s+/g, "")}`}>
                  {contact.phone}
                </a>
              </dd>
            </div>
          ) : null}
          {contact.email ? (
            <div className={styles.contactRow}>
              <dt>Email</dt>
              <dd>
                <a href={`mailto:${contact.email}`}>{contact.email}</a>
              </dd>
            </div>
          ) : null}
          {contact.address ? (
            <div className={styles.contactRow}>
              <dt>Morada</dt>
              <dd>{contact.address}</dd>
            </div>
          ) : null}
          {contact.hours ? (
            <div className={styles.contactRow}>
              <dt>Horário</dt>
              <dd>{contact.hours}</dd>
            </div>
          ) : null}
          {social.length > 0 ? (
            <div className={styles.socialLinks}>
              {social.map((s) => (
                <a
                  key={s.key}
                  href={s.href.startsWith("http") ? s.href : `https://${s.href}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {s.label}
                </a>
              ))}
            </div>
          ) : null}
        </dl>
        <ContactForm />
      </div>
    </section>
  );
}

/**
 * One 4:3 photo with intrinsic width/height (no layout shift).
 * `priority` = principal photo (eager + fetchpriority high); otherwise lazy.
 * Own photos not available in this browser render a neutral placeholder.
 */
export function SitePhoto({
  photo,
  priority = false,
  eager = false,
}: {
  photo: ResolvedPhoto;
  priority?: boolean;
  eager?: boolean;
}) {
  if (!photo.url) {
    return (
      <span
        className={styles.photoPlaceholder}
        role="img"
        aria-label={photo.alt || "Foto"}
      >
        <svg viewBox="0 0 24 24" width="28" height="28" aria-hidden="true">
          <path
            fill="currentColor"
            d="M4 5h16a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Zm1 2v8.6l3.3-3.3a1 1 0 0 1 1.4 0l2.3 2.3 3.3-3.3a1 1 0 0 1 1.4 0L19 13.6V7H5Zm4 3.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Z"
          />
        </svg>
      </span>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={photo.url}
      alt={photo.alt}
      width={photo.width}
      height={photo.height}
      loading={priority || eager ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : undefined}
      decoding={priority ? "auto" : "async"}
    />
  );
}

export function Gallery({
  photos,
  firstEager = false,
}: {
  photos: ResolvedPhoto[];
  /** Layouts without a hero photo: the principal is the first gallery item. */
  firstEager?: boolean;
}) {
  if (photos.length === 0) return null;
  return (
    <section id="galeria" className={styles.section}>
      <p className={styles.eyebrow}>Galeria</p>
      <h2 className={styles.sectionTitle}>O nosso espaço</h2>
      <div className={styles.gallery}>
        {photos.map((p, i) => (
          <figure key={p.id}>
            <SitePhoto photo={p} eager={firstEager && i === 0} />
          </figure>
        ))}
      </div>
    </section>
  );
}

export function AboutSection({ config }: { config: SiteConfig }) {
  if (!config.identity.about.trim()) return null;
  return (
    <section id="sobre" className={styles.section}>
      <div className={styles.aboutBlock}>
        <p className={styles.eyebrow}>Sobre</p>
        <h2 className={styles.sectionTitle}>Quem somos</h2>
        <p className={styles.lead}>{config.identity.about}</p>
      </div>
    </section>
  );
}

export function ServicesSection({
  config,
  emphasize = false,
}: {
  config: SiteConfig;
  emphasize?: boolean;
}) {
  if (config.services.length === 0) return null;
  return (
    <section
      id="servicos"
      className={`${styles.section} ${emphasize ? styles.sectionBand : ""}`.trim()}
    >
      <p className={styles.eyebrow}>Serviços</p>
      <h2 className={styles.sectionTitle}>O que fazemos</h2>
      <ul className={styles.servicesGrid}>
        {config.services.map((s, i) => (
          <li key={`${s.title}-${i}`} className={styles.serviceCard}>
            <span className={styles.serviceIndex}>
              {String(i + 1).padStart(2, "0")}
            </span>
            <h3>{s.title}</h3>
            {s.description ? <p>{s.description}</p> : null}
          </li>
        ))}
      </ul>
    </section>
  );
}

export default function SiteChrome({
  config,
  nav,
  showPreviewBanner,
  children,
}: Props) {
  return (
    <div className={styles.root} data-preview={showPreviewBanner ? "true" : undefined}>
      {showPreviewBanner ? (
        <div className={styles.previewBanner}>
          <span>
            <strong>Pré-visualização</strong> · rascunho · {config.identity.name}
          </span>
          <div className={styles.previewBannerActions}>
            <a href="/criar">Voltar ao assistente</a>
            <a href="/">Siept IT</a>
          </div>
        </div>
      ) : null}
      {children}
      {config.media.soundId ? (
        <SoundControl soundId={config.media.soundId} />
      ) : null}
    </div>
  );
}
