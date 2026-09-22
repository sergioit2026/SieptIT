import type {
  FontId,
  LayoutId,
  PaletteId,
  SectorId,
} from "./site-config";

export const SECTORS: { id: SectorId; label: string }[] = [
  { id: "servicos", label: "Serviços" },
  { id: "comercio", label: "Comércio" },
  { id: "restauracao", label: "Restauração" },
  { id: "saude", label: "Saúde" },
  { id: "tecnologia", label: "Tecnologia" },
  { id: "construcao", label: "Construção" },
  { id: "beleza", label: "Beleza" },
  { id: "outro", label: "Outro" },
];

export const LAYOUTS: {
  id: LayoutId;
  label: string;
  description: string;
}[] = [
  {
    id: "onepage-hero",
    label: "Hero único",
    description:
      "Uma página com destaque grande no topo, ideal para marcas claras e directas.",
  },
  {
    id: "classic-four",
    label: "Clássico em quatro",
    description:
      "Secções bem definidas: início, serviços, sobre e contactos — estrutura familiar.",
  },
  {
    id: "services-grid",
    label: "Grelha de serviços",
    description:
      "Os serviços em primeiro plano, organizados em cartões — perfeito para catálogo.",
  },
  {
    id: "minimal-card",
    label: "Cartão minimal",
    description:
      "Layout limpo e compacto, com foco no essencial e tipografia generosa.",
  },
];

export type PaletteOption = {
  id: PaletteId;
  label: string;
  description: string;
  swatches: [string, string, string, string];
  preview: {
    bg: string;
    surface: string;
    text: string;
    accent: string;
  };
};

export const PALETTES: PaletteOption[] = [
  {
    id: "midnight-blue",
    label: "Azul meia-noite",
    description: "Fundo escuro elegante com acentos azul-prata.",
    swatches: ["#0f1c2e", "#1a3a5c", "#5b9fd4", "#e8f0f8"],
    preview: {
      bg: "#0f1c2e",
      surface: "#162636",
      text: "#e8f0f8",
      accent: "#5b9fd4",
    },
  },
  {
    id: "steel-ice",
    label: "Aço gelo",
    description: "Azul claro premium — o look Siept IT por defeito.",
    swatches: ["#f4f8fc", "#dce8f4", "#3d7ab8", "#1a2b3d"],
    preview: {
      bg: "#f4f8fc",
      surface: "#ffffff",
      text: "#1a2b3d",
      accent: "#3d7ab8",
    },
  },
  {
    id: "ink-gold",
    label: "Tinta e ouro",
    description: "Contraste sóbrio com toque dourado discreto.",
    swatches: ["#1a1a18", "#2a2924", "#c4a35a", "#f5f2ea"],
    preview: {
      bg: "#1a1a18",
      surface: "#24231f",
      text: "#f5f2ea",
      accent: "#c4a35a",
    },
  },
  {
    id: "pure-light",
    label: "Luz pura",
    description: "Branco limpo com cinza-ardósia e azul suave.",
    swatches: ["#ffffff", "#f0f4f8", "#4a6074", "#2c5f8f"],
    preview: {
      bg: "#ffffff",
      surface: "#f7fafc",
      text: "#1a2b3d",
      accent: "#2c5f8f",
    },
  },
];

export const FONTS: {
  id: FontId;
  label: string;
  description: string;
  sample: string;
}[] = [
  {
    id: "clean-sans",
    label: "Sans limpo",
    description: "Tipografia moderna e neutra — legível em qualquer ecrã.",
    sample: "Aa Bb Cc · 123",
  },
  {
    id: "editorial",
    label: "Editorial",
    description: "Serifa elegante para marcas com tom editorial ou boutique.",
    sample: "Aa Bb Cc · 123",
  },
  {
    id: "tech-mono-accent",
    label: "Tech mono",
    description: "Sans com acentos monoespaciais — ar tecnológico.",
    sample: "Aa Bb Cc · 123",
  },
];

export const SOUNDS: { id: string; label: string }[] = [
  { id: "soft-rain", label: "Chuva suave" },
  { id: "coastal-breeze", label: "Brisa costeira" },
  { id: "quiet-cafe", label: "Café silencioso" },
  { id: "forest-dawn", label: "Amanhecer na floresta" },
  { id: "city-hum", label: "Zumbido da cidade" },
  { id: "studio-pads", label: "Pads de estúdio" },
  { id: "vinyl-warmth", label: "Calor de vinil" },
  { id: "crystal-chime", label: "Carrilhão cristalino" },
];

/** Curated placeholder photos (picsum fixed IDs). */
export const PHOTOS: { id: string; label: string; url: string }[] = [
  { id: "p01", label: "Escritório claro", url: "https://picsum.photos/id/1015/800/600" },
  { id: "p02", label: "Mesa de trabalho", url: "https://picsum.photos/id/180/800/600" },
  { id: "p03", label: "Arquitectura", url: "https://picsum.photos/id/1018/800/600" },
  { id: "p04", label: "Café e conversa", url: "https://picsum.photos/id/42/800/600" },
  { id: "p05", label: "Detalhe industrial", url: "https://picsum.photos/id/201/800/600" },
  { id: "p06", label: "Natureza urbana", url: "https://picsum.photos/id/28/800/600" },
  { id: "p07", label: "Espaço comercial", url: "https://picsum.photos/id/1060/800/600" },
  { id: "p08", label: "Textura madeira", url: "https://picsum.photos/id/103/800/600" },
  { id: "p09", label: "Cozinha profissional", url: "https://picsum.photos/id/292/800/600" },
  { id: "p10", label: "Consultório", url: "https://picsum.photos/id/367/800/600" },
  { id: "p11", label: "Tecnologia", url: "https://picsum.photos/id/0/800/600" },
  { id: "p12", label: "Obra e projeto", url: "https://picsum.photos/id/164/800/600" },
  { id: "p13", label: "Beleza e cuidado", url: "https://picsum.photos/id/338/800/600" },
  { id: "p14", label: "Equipa", url: "https://picsum.photos/id/1011/800/600" },
  { id: "p15", label: "Produto em destaque", url: "https://picsum.photos/id/225/800/600" },
  { id: "p16", label: "Vista panorâmica", url: "https://picsum.photos/id/1016/800/600" },
  { id: "p17", label: "Interior minimal", url: "https://picsum.photos/id/1068/800/600" },
  { id: "p18", label: "Luz natural", url: "https://picsum.photos/id/238/800/600" },
];

export function getPalette(id: PaletteId) {
  return PALETTES.find((p) => p.id === id) ?? PALETTES[1];
}

export function getLayout(id: LayoutId | "") {
  return LAYOUTS.find((l) => l.id === id);
}

export function getSectorLabel(id: SectorId | "") {
  return SECTORS.find((s) => s.id === id)?.label ?? "—";
}
