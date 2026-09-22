import { PHOTOS } from "@/lib/wizard-options";

export function resolvePhotos(photoIds: string[]) {
  return photoIds
    .map((id) => PHOTOS.find((p) => p.id === id))
    .filter((p): p is (typeof PHOTOS)[number] => Boolean(p));
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
