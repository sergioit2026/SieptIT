import { PHOTOS } from "@/lib/wizard-options";
import { isUserPhotoId, type UserPhotoRef } from "@/lib/site-config";

/** Library photos are served at 800×600 (4:3). */
const LIBRARY_W = 800;
const LIBRARY_H = 600;

export type ResolvedPhoto = {
  id: string;
  alt: string;
  /** null = own photo not available in this browser (or still loading). */
  url: string | null;
  width: number;
  height: number;
  source: "library" | "user";
};

/**
 * Resolve the ordered photo list (library + own photos). Own photos get their
 * URL from `userUrls` (object URLs created from IndexedDB blobs).
 */
export function resolvePhotos(
  photoIds: string[],
  userPhotos: UserPhotoRef[] = [],
  userUrls: Record<string, string> = {}
): ResolvedPhoto[] {
  const out: ResolvedPhoto[] = [];
  for (const id of photoIds) {
    if (isUserPhotoId(id)) {
      const ref = userPhotos.find((p) => p.id === id);
      if (!ref) continue;
      out.push({
        id,
        alt: ref.alt,
        url: userUrls[id] ?? null,
        width: ref.width,
        height: ref.height,
        source: "user",
      });
    } else {
      const lib = PHOTOS.find((p) => p.id === id);
      if (!lib) continue;
      out.push({
        id,
        alt: lib.label,
        url: lib.url,
        width: LIBRARY_W,
        height: LIBRARY_H,
        source: "library",
      });
    }
  }
  return out;
}

export function primaryCtaLabel(cta: "contact" | "call" | "email"): string {
  switch (cta) {
    case "call":
      return "Ligar";
    case "email":
      return "Enviar email";
    case "contact":
    default:
      return "Contactar";
  }
}

export function primaryCtaHref(
  cta: "contact" | "call" | "email",
  contact: { phone: string; email: string }
): string {
  switch (cta) {
    case "call":
      return contact.phone ? `tel:${contact.phone.replace(/\s+/g, "")}` : "#contacto";
    case "email":
      return contact.email ? `mailto:${contact.email}` : "#contacto";
    case "contact":
    default:
      return "#contacto";
  }
}
