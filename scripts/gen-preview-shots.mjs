import { spawnSync } from "node:child_process";
import { writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const outDir = join(process.cwd(), "preview");
mkdirSync(outDir, { recursive: true });

function encode(config) {
  const json = JSON.stringify(config);
  return Buffer.from(json, "utf8")
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

const base = {
  version: 1,
  subscription: { plan: "basic", status: "draft" },
  identity: {
    name: "Atelier Norte",
    slogan: "Design e espaços com alma atlântica",
    sector: "servicos",
    about:
      "Somos uma equipa de Lisboa especializada em projectos residenciais e comerciais, com foco em luz natural e materiais duradouros.",
  },
  contact: {
    phone: "+351 210 000 000",
    email: "ola@ateliernorte.pt",
    address: "Rua do Alecrim 12, Lisboa",
    hours: "Seg–Sex 09:00–18:00",
    social: {
      instagram: "https://instagram.com/ateliernorte",
      facebook: "",
      linkedin: "",
    },
    primaryCta: "contact",
  },
  services: [
    { title: "Consultoria", description: "Diagnóstico e plano de acção." },
    { title: "Projecto", description: "Desenho completo do espaço." },
    { title: "Acompanhamento", description: "Obra com presença em obra." },
  ],
  theme: {
    paletteId: "steel-ice",
    fontId: "clean-sans",
    introAnimation: false,
    introStyle: "fade-name",
  },
  media: {
    photoIds: ["p01", "p03", "p17"],
    logoUrl: null,
    soundId: "coastal-breeze",
    soundAutoplay: false,
  },
  pages: { home: true },
  legal: { privacyUrl: null, termsUrl: null },
};

const layouts = [
  { id: "onepage-hero", file: "gen-onepage-hero.png", palette: "midnight-blue", font: "clean-sans" },
  { id: "classic-four", file: "gen-classic-four.png", palette: "steel-ice", font: "editorial" },
  { id: "services-grid", file: "gen-services-grid.png", palette: "ink-gold", font: "tech-mono-accent" },
  { id: "minimal-card", file: "gen-minimal-card.png", palette: "pure-light", font: "clean-sans" },
];

for (const L of layouts) {
  const config = {
    ...base,
    slug: `atelier-norte-${L.id}`,
    layoutId: L.id,
    theme: {
      ...base.theme,
      paletteId: L.palette,
      fontId: L.font,
    },
  };
  const c = encode(config);
  const url = `http://127.0.0.1:3000/preview/${config.slug}?c=${c}`;
  const out = join(outDir, L.file);
  console.log("Shot", L.id, "->", out);
  const r = spawnSync(
    "google-chrome",
    [
      "--headless=new",
      "--disable-gpu",
      "--no-sandbox",
      "--hide-scrollbars",
      `--screenshot=${out}`,
      "--window-size=1280,900",
      "--virtual-time-budget=5000",
      url,
    ],
    { encoding: "utf8" }
  );
  if (r.status !== 0) {
    console.error(r.stderr || r.stdout);
    process.exit(r.status || 1);
  }
  console.log(r.stderr || r.stdout || "ok");
}

writeFileSync(
  join(outDir, "gen-sample-config.json"),
  JSON.stringify({ ...base, slug: "atelier-norte", layoutId: "onepage-hero" }, null, 2)
);
console.log("Done");
