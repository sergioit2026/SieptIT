/** Site config contract produced by the wizard (MVP). */

export type SectorId =
  | "servicos"
  | "comercio"
  | "restauracao"
  | "saude"
  | "tecnologia"
  | "construcao"
  | "beleza"
  | "outro";

export type LayoutId =
  | "onepage-hero"
  | "classic-four"
  | "services-grid"
  | "minimal-card";

export type PaletteId =
  | "midnight-blue"
  | "steel-ice"
  | "ink-gold"
  | "pure-light";

export type FontId = "clean-sans" | "editorial" | "tech-mono-accent";

export type IntroStyle = "fade-name" | "rise-name";

export type PrimaryCta = "contact" | "call" | "email";

export type ServiceItem = {
  title: string;
  description: string;
};

export type Identity = {
  name: string;
  slogan: string;
  sector: SectorId | "";
  about: string;
};

export type Contact = {
  phone: string;
  email: string;
  address: string;
  hours: string;
  social: {
    instagram: string;
    facebook: string;
    linkedin: string;
  };
  primaryCta: PrimaryCta;
};

export type Theme = {
  paletteId: PaletteId;
  fontId: FontId;
  introAnimation: boolean;
  introStyle: IntroStyle;
};

export type Media = {
  photoIds: string[];
  logoUrl: string | null;
  soundId: string | null;
  soundAutoplay: boolean;
};

export type SiteConfig = {
  version: 1;
  slug: string;
  subscription: {
    plan: "basic";
    status: "draft";
  };
  identity: Identity;
  contact: Contact;
  services: ServiceItem[];
  layoutId: LayoutId;
  theme: Theme;
  media: Media;
  pages: { home: true };
  legal: {
    privacyUrl: null;
    termsUrl: null;
  };
};

export type WizardState = {
  identity: Identity;
  contact: Contact;
  services: ServiceItem[];
  layoutId: LayoutId | "";
  theme: Theme;
  media: Media;
};

export const ABOUT_MAX = 400;
export const SERVICES_MIN = 1;
export const SERVICES_MAX = 6;
export const PHOTOS_MAX = 6;

export function createInitialWizardState(): WizardState {
  return {
    identity: {
      name: "",
      slogan: "",
      sector: "",
      about: "",
    },
    contact: {
      phone: "",
      email: "",
      address: "",
      hours: "",
      social: {
        instagram: "",
        facebook: "",
        linkedin: "",
      },
      primaryCta: "contact",
    },
    services: [{ title: "", description: "" }],
    layoutId: "",
    theme: {
      paletteId: "steel-ice",
      fontId: "clean-sans",
      introAnimation: true,
      introStyle: "fade-name",
    },
    media: {
      photoIds: [],
      logoUrl: null,
      soundId: null,
      soundAutoplay: false,
    },
  };
}

/** Sanitize Portuguese business name → kebab-case ASCII slug. */
export function slugifyName(name: string): string {
  const map: Record<string, string> = {
    á: "a",
    à: "a",
    â: "a",
    ã: "a",
    ä: "a",
    é: "e",
    è: "e",
    ê: "e",
    ë: "e",
    í: "i",
    ì: "i",
    î: "i",
    ï: "i",
    ó: "o",
    ò: "o",
    ô: "o",
    õ: "o",
    ö: "o",
    ú: "u",
    ù: "u",
    û: "u",
    ü: "u",
    ç: "c",
    ñ: "n",
  };

  const lower = name.trim().toLowerCase();
  let out = "";
  for (const ch of lower) {
    out += map[ch] ?? ch;
  }
  return out
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-")
    .slice(0, 64) || "site";
}

export function buildSiteConfig(state: WizardState): SiteConfig {
  const services = state.services
    .map((s) => ({
      title: s.title.trim(),
      description: s.description.trim(),
    }))
    .filter((s) => s.title.length > 0);

  return {
    version: 1,
    slug: slugifyName(state.identity.name),
    subscription: {
      plan: "basic",
      status: "draft",
    },
    identity: {
      name: state.identity.name.trim(),
      slogan: state.identity.slogan.trim(),
      sector: state.identity.sector || "outro",
      about: state.identity.about.trim(),
    },
    contact: {
      phone: state.contact.phone.trim(),
      email: state.contact.email.trim(),
      address: state.contact.address.trim(),
      hours: state.contact.hours.trim(),
      social: {
        instagram: state.contact.social.instagram.trim(),
        facebook: state.contact.social.facebook.trim(),
        linkedin: state.contact.social.linkedin.trim(),
      },
      primaryCta: state.contact.primaryCta,
    },
    services,
    layoutId: (state.layoutId || "onepage-hero") as LayoutId,
    theme: { ...state.theme },
    media: {
      photoIds: [...state.media.photoIds],
      logoUrl: state.media.logoUrl?.trim() || null,
      soundId: state.media.soundId,
      soundAutoplay: false,
    },
    pages: { home: true },
    legal: {
      privacyUrl: null,
      termsUrl: null,
    },
  };
}
