"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { loadSiteConfig, saveSiteConfig } from "@/lib/site-storage";
import { checkResolution } from "@/lib/image-processing";
import { deletePhoto, prunePhotos } from "@/lib/photo-store";
import {
  ABOUT_MAX,
  PHOTO_ALT_MAX,
  PHOTOS_MAX,
  SERVICES_MAX,
  SERVICES_MIN,
  buildSiteConfig,
  createInitialWizardState,
  type Contact,
  type Identity,
  type LayoutId,
  type Media,
  type ServiceItem,
  type SiteConfig,
  type Theme,
  type UserPhotoRef,
  type WizardState,
  isUserPhotoId,
} from "@/lib/site-config";

export const WIZARD_STEPS = [
  { id: "negocio", label: "Negócio" },
  { id: "contactos", label: "Contactos" },
  { id: "estrutura", label: "Estrutura" },
  { id: "visual", label: "Visual" },
  { id: "media", label: "Media" },
  { id: "rever", label: "Rever" },
] as const;

export type WizardStepId = (typeof WIZARD_STEPS)[number]["id"];

type WizardContextValue = {
  stepIndex: number;
  stepId: WizardStepId;
  state: WizardState;
  finished: boolean;
  siteConfig: SiteConfig | null;
  errors: Record<string, string>;
  setIdentity: (patch: Partial<Identity>) => void;
  setContact: (patch: Partial<Contact>) => void;
  setSocial: (patch: Partial<Contact["social"]>) => void;
  setServices: (services: ServiceItem[]) => void;
  updateService: (index: number, patch: Partial<ServiceItem>) => void;
  addService: () => void;
  removeService: (index: number) => void;
  setLayoutId: (id: LayoutId) => void;
  setTheme: (patch: Partial<Theme>) => void;
  setMedia: (patch: Partial<Media>) => void;
  togglePhoto: (photoId: string) => void;
  addUserPhoto: (ref: UserPhotoRef) => void;
  updateUserPhotoAlt: (id: string, alt: string) => void;
  movePhoto: (index: number, delta: -1 | 1) => void;
  removePhoto: (id: string) => void;
  goNext: () => boolean;
  goBack: () => void;
  goTo: (index: number) => void;
  finish: () => SiteConfig;
  resetFinished: () => void;
};

const WizardContext = createContext<WizardContextValue | null>(null);

function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

function validateStep(
  stepIndex: number,
  state: WizardState
): Record<string, string> {
  const errors: Record<string, string> = {};

  if (stepIndex === 0) {
    if (!state.identity.name.trim()) {
      errors.name = "Indique o nome do negócio.";
    }
    if (!state.identity.sector) {
      errors.sector = "Escolha um sector.";
    }
    if (state.identity.about.length > ABOUT_MAX) {
      errors.about = `Máximo de ${ABOUT_MAX} caracteres.`;
    }
    const filled = state.services.filter((s) => s.title.trim());
    if (filled.length < SERVICES_MIN) {
      errors.services = "Adicione pelo menos um serviço com título.";
    }
    if (state.services.length > SERVICES_MAX) {
      errors.services = `Máximo de ${SERVICES_MAX} serviços.`;
    }
    state.services.forEach((s, i) => {
      if (s.description.trim() && !s.title.trim()) {
        errors[`service-${i}`] = "O serviço precisa de um título.";
      }
    });
  }

  if (stepIndex === 1) {
    if (!state.contact.phone.trim()) {
      errors.phone = "Indique um telefone.";
    }
    if (!state.contact.email.trim()) {
      errors.email = "Indique um email.";
    } else if (!validateEmail(state.contact.email)) {
      errors.email = "Email inválido.";
    }
  }

  if (stepIndex === 2) {
    if (!state.layoutId) {
      errors.layoutId = "Escolha uma estrutura.";
    }
  }

  if (stepIndex === 3) {
    if (!state.theme.paletteId) {
      errors.paletteId = "Escolha uma paleta.";
    }
    if (!state.theme.fontId) {
      errors.fontId = "Escolha uma tipografia.";
    }
  }

  if (stepIndex === 4) {
    if (state.media.photoIds.length > PHOTOS_MAX) {
      errors.photos = `Seleccione no máximo ${PHOTOS_MAX} fotos.`;
    }
    for (const ref of state.media.userPhotos) {
      if (!state.media.photoIds.includes(ref.id)) continue;
      const alt = ref.alt.trim();
      if (!alt) {
        errors[`alt-${ref.id}`] = "Descreva a foto (texto alternativo obrigatório).";
      } else if (alt.length > PHOTO_ALT_MAX) {
        errors[`alt-${ref.id}`] = `Máximo de ${PHOTO_ALT_MAX} caracteres.`;
      }
    }
    if (Object.keys(errors).some((k) => k.startsWith("alt-")) && !errors.photos) {
      errors.photos = "Todas as suas fotos precisam de texto alternativo.";
    }
    if (state.media.logoUrl) {
      try {
        // eslint-disable-next-line no-new
        new URL(state.media.logoUrl);
      } catch {
        errors.logoUrl = "URL do logótipo inválida.";
      }
    }
  }

  return errors;
}

export function WizardProvider({ children }: { children: ReactNode }) {
  const [stepIndex, setStepIndex] = useState(0);
  const [state, setState] = useState<WizardState>(createInitialWizardState);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [finished, setFinished] = useState(false);
  const [siteConfig, setSiteConfig] = useState<SiteConfig | null>(null);

  const stepId = WIZARD_STEPS[stepIndex].id;

  const setIdentity = useCallback((patch: Partial<Identity>) => {
    setState((prev) => ({
      ...prev,
      identity: { ...prev.identity, ...patch },
    }));
  }, []);

  const setContact = useCallback((patch: Partial<Contact>) => {
    setState((prev) => ({
      ...prev,
      contact: { ...prev.contact, ...patch },
    }));
  }, []);

  const setSocial = useCallback((patch: Partial<Contact["social"]>) => {
    setState((prev) => ({
      ...prev,
      contact: {
        ...prev.contact,
        social: { ...prev.contact.social, ...patch },
      },
    }));
  }, []);

  const setServices = useCallback((services: ServiceItem[]) => {
    setState((prev) => ({ ...prev, services }));
  }, []);

  const updateService = useCallback(
    (index: number, patch: Partial<ServiceItem>) => {
      setState((prev) => {
        const services = prev.services.map((s, i) =>
          i === index ? { ...s, ...patch } : s
        );
        return { ...prev, services };
      });
    },
    []
  );

  const addService = useCallback(() => {
    setState((prev) => {
      if (prev.services.length >= SERVICES_MAX) return prev;
      return {
        ...prev,
        services: [...prev.services, { title: "", description: "" }],
      };
    });
  }, []);

  const removeService = useCallback((index: number) => {
    setState((prev) => {
      if (prev.services.length <= 1) {
        return {
          ...prev,
          services: [{ title: "", description: "" }],
        };
      }
      return {
        ...prev,
        services: prev.services.filter((_, i) => i !== index),
      };
    });
  }, []);

  const setLayoutId = useCallback((id: LayoutId) => {
    setState((prev) => ({ ...prev, layoutId: id }));
  }, []);

  const setTheme = useCallback((patch: Partial<Theme>) => {
    setState((prev) => ({
      ...prev,
      theme: { ...prev.theme, ...patch },
    }));
  }, []);

  const setMedia = useCallback((patch: Partial<Media>) => {
    setState((prev) => ({
      ...prev,
      media: { ...prev.media, ...patch },
    }));
  }, []);

  const togglePhoto = useCallback((photoId: string) => {
    setState((prev) => {
      const has = prev.media.photoIds.includes(photoId);
      let photoIds: string[];
      if (has) {
        photoIds = prev.media.photoIds.filter((id) => id !== photoId);
      } else if (prev.media.photoIds.length >= PHOTOS_MAX) {
        return prev;
      } else {
        photoIds = [...prev.media.photoIds, photoId];
      }
      return { ...prev, media: { ...prev.media, photoIds } };
    });
  }, []);

  const addUserPhoto = useCallback((ref: UserPhotoRef) => {
    setState((prev) => {
      if (prev.media.photoIds.length >= PHOTOS_MAX) return prev;
      return {
        ...prev,
        media: {
          ...prev.media,
          photoIds: [...prev.media.photoIds, ref.id],
          userPhotos: [...prev.media.userPhotos, ref],
        },
      };
    });
  }, []);

  const updateUserPhotoAlt = useCallback((id: string, alt: string) => {
    setState((prev) => ({
      ...prev,
      media: {
        ...prev.media,
        userPhotos: prev.media.userPhotos.map((p) =>
          p.id === id ? { ...p, alt: alt.slice(0, PHOTO_ALT_MAX) } : p
        ),
      },
    }));
    // Clear the stale validation message once the field is filled in.
    if (alt.trim()) {
      setErrors((prev) => {
        if (!(`alt-${id}` in prev)) return prev;
        const next = { ...prev };
        delete next[`alt-${id}`];
        if (!Object.keys(next).some((k) => k.startsWith("alt-"))) {
          delete next.photos;
        }
        return next;
      });
    }
  }, []);

  const movePhoto = useCallback((index: number, delta: -1 | 1) => {
    setState((prev) => {
      const ids = [...prev.media.photoIds];
      const to = index + delta;
      if (index < 0 || to < 0 || index >= ids.length || to >= ids.length) {
        return prev;
      }
      // A user photo that only meets the gallery minimum cannot become the
      // principal photo. Keep this guard here as well as in the UI so the
      // ordering rule cannot be bypassed by another caller.
      if (to === 0 && isUserPhotoId(ids[index])) {
        const ref = prev.media.userPhotos.find((photo) => photo.id === ids[index]);
        if (ref && checkResolution(ref.width, ref.height, "principal").error) {
          return prev;
        }
      }
      [ids[index], ids[to]] = [ids[to], ids[index]];
      return { ...prev, media: { ...prev.media, photoIds: ids } };
    });
  }, []);

  const removePhoto = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      media: {
        ...prev.media,
        photoIds: prev.media.photoIds.filter((x) => x !== id),
        userPhotos: prev.media.userPhotos.filter((p) => p.id !== id),
      },
    }));
    setErrors((prev) => {
      if (!(`alt-${id}` in prev)) return prev;
      const next = { ...prev };
      delete next[`alt-${id}`];
      if (!Object.keys(next).some((k) => k.startsWith("alt-"))) delete next.photos;
      return next;
    });
    if (isUserPhotoId(id)) {
      // Keep the blob if the last saved config (preview) still uses it.
      const saved = loadSiteConfig();
      if (!saved?.media.photoIds.includes(id)) void deletePhoto(id);
    }
  }, []);

  // Housekeeping: the wizard state is not persisted, so drop stored photos
  // that are not referenced by the last saved site config.
  useEffect(() => {
    const saved = loadSiteConfig();
    void prunePhotos((saved?.media.photoIds ?? []).filter(isUserPhotoId));
  }, []);

  const goNext = useCallback(() => {
    const nextErrors = validateStep(stepIndex, state);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return false;
    setStepIndex((i) => Math.min(i + 1, WIZARD_STEPS.length - 1));
    return true;
  }, [stepIndex, state]);

  const goBack = useCallback(() => {
    setErrors({});
    setFinished(false);
    setStepIndex((i) => Math.max(i - 1, 0));
  }, []);

  const goTo = useCallback(
    (index: number) => {
      if (index < 0 || index >= WIZARD_STEPS.length) return;
      if (index > stepIndex) return;
      setErrors({});
      setFinished(false);
      setStepIndex(index);
    },
    [stepIndex]
  );

  const finish = useCallback(() => {
    const config = buildSiteConfig(state);
    setSiteConfig(config);
    setFinished(true);
    saveSiteConfig(config);
    return config;
  }, [state]);

  const resetFinished = useCallback(() => {
    setFinished(false);
  }, []);

  const value = useMemo<WizardContextValue>(
    () => ({
      stepIndex,
      stepId,
      state,
      finished,
      siteConfig,
      errors,
      setIdentity,
      setContact,
      setSocial,
      setServices,
      updateService,
      addService,
      removeService,
      setLayoutId,
      setTheme,
      setMedia,
      togglePhoto,
      addUserPhoto,
      updateUserPhotoAlt,
      movePhoto,
      removePhoto,
      goNext,
      goBack,
      goTo,
      finish,
      resetFinished,
    }),
    [
      stepIndex,
      stepId,
      state,
      finished,
      siteConfig,
      errors,
      setIdentity,
      setContact,
      setSocial,
      setServices,
      updateService,
      addService,
      removeService,
      setLayoutId,
      setTheme,
      setMedia,
      togglePhoto,
      addUserPhoto,
      updateUserPhotoAlt,
      movePhoto,
      removePhoto,
      goNext,
      goBack,
      goTo,
      finish,
      resetFinished,
    ]
  );

  return (
    <WizardContext.Provider value={value}>{children}</WizardContext.Provider>
  );
}

export function useWizard() {
  const ctx = useContext(WizardContext);
  if (!ctx) {
    throw new Error("useWizard must be used within WizardProvider");
  }
  return ctx;
}
