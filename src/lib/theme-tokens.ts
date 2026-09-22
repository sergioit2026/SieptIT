import type { CSSProperties } from "react";
import type { FontId, PaletteId, SiteConfig } from "./site-config";
import { getPalette } from "./wizard-options";

export type ThemeCssVars = Record<`--${string}`, string>;

const DARK_PALETTES: PaletteId[] = ["midnight-blue", "ink-gold"];

export function isDarkPalette(id: PaletteId): boolean {
  return DARK_PALETTES.includes(id);
}

export function fontFamilyFor(id: FontId): string {
  switch (id) {
    case "editorial":
      return 'Georgia, "Times New Roman", "Liberation Serif", serif';
    case "tech-mono-accent":
      return 'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif';
    case "clean-sans":
    default:
      return 'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';
  }
}

export function accentFontFamily(id: FontId): string {
  if (id === "tech-mono-accent") {
    return 'ui-monospace, SFMono-Regular, Menlo, Consolas, "Liberation Mono", monospace';
  }
  return fontFamilyFor(id);
}

export function themeVarsFromConfig(config: SiteConfig): ThemeCssVars {
  const palette = getPalette(config.theme.paletteId);
  const dark = isDarkPalette(config.theme.paletteId);
  const { bg, surface, text, accent } = palette.preview;

  return {
    "--site-bg": bg,
    "--site-surface": surface,
    "--site-text": text,
    "--site-accent": accent,
    "--site-muted": dark ? "rgba(232, 240, 248, 0.72)" : "rgba(26, 43, 61, 0.72)",
    "--site-dim": dark ? "rgba(232, 240, 248, 0.5)" : "rgba(26, 43, 61, 0.5)",
    "--site-border": dark ? "rgba(255, 255, 255, 0.12)" : "rgba(30, 64, 110, 0.12)",
    "--site-border-strong": dark
      ? "rgba(255, 255, 255, 0.22)"
      : "rgba(30, 64, 110, 0.2)",
    "--site-glow": dark ? `${accent}33` : `${accent}28`,
    "--site-font": fontFamilyFor(config.theme.fontId),
    "--site-font-accent": accentFontFamily(config.theme.fontId),
    "--site-radius": "14px",
    "--site-radius-lg": "22px",
    "--site-max": "1100px",
    "--site-ease": "cubic-bezier(0.22, 1, 0.36, 1)",
  };
}

export function styleFromVars(vars: ThemeCssVars): CSSProperties {
  return vars as CSSProperties;
}
