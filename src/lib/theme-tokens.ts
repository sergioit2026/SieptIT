import type { CSSProperties } from "react";
import type { FontId, PaletteId, SiteConfig } from "./site-config";
import { getPalette } from "./wizard-options";

export type ThemeCssVars = Record<`--${string}`, string>;

export function isDarkPalette(id: PaletteId): boolean {
  return getPalette(id).dark === true;
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
  const dark = palette.dark === true;
  const { bg, surface, text, accent } = palette.preview;
  // Tons secundários: base da paleta (ink) quando definida; senão neutros.
  const ink = palette.ink;

  return {
    "--site-bg": bg,
    "--site-surface": surface,
    "--site-text": text,
    "--site-accent": accent,
    "--site-muted": ink
      ? `rgba(${ink}, 0.72)`
      : dark
        ? "rgba(232, 240, 248, 0.72)"
        : "rgba(26, 43, 61, 0.72)",
    "--site-dim": ink
      ? `rgba(${ink}, 0.5)`
      : dark
        ? "rgba(232, 240, 248, 0.5)"
        : "rgba(26, 43, 61, 0.5)",
    "--site-border": ink
      ? `rgba(${ink}, 0.12)`
      : dark
        ? "rgba(255, 255, 255, 0.12)"
        : "rgba(30, 64, 110, 0.12)",
    "--site-border-strong": ink
      ? `rgba(${ink}, 0.2)`
      : dark
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
