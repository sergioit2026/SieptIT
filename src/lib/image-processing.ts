/**
 * Client-side photo pipeline (no dependencies):
 * validate → decode (EXIF orientation applied) → user crop (4:3) →
 * resize (max 2400 px wide) → re-encode WebP (JPEG fallback) via canvas.
 * Re-encoding through canvas drops all metadata (EXIF, GPS, camera model).
 */

export const SOURCE_MAX_BYTES = 15 * 1024 * 1024;
export const OUTPUT_MAX_BYTES = 1.5 * 1024 * 1024;
export const OUTPUT_MAX_WIDTH = 2400;
export const RECOMMENDED = {
  principal: { width: 1200, height: 900 },
  galeria: { width: 1024, height: 768 },
} as const;
export const WEBP_QUALITY = 0.82;
export const JPEG_QUALITY = 0.85;
export const ACCEPT_ATTR =
  "image/jpeg,image/png,image/webp,image/heic,image/heif,.heic,.heif";

export type PhotoSlot = keyof typeof RECOMMENDED;

export type DecodedImage = {
  source: CanvasImageSource;
  width: number;
  height: number;
  close: () => void;
};

export type CropRect = { sx: number; sy: number; sw: number; sh: number };

export type ProcessedPhoto = {
  blob: Blob;
  width: number;
  height: number;
  mime: "image/webp" | "image/jpeg";
};

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
];

export function isHeic(file: File): boolean {
  return /heic|heif/i.test(file.type) || /\.(heic|heif)$/i.test(file.name);
}

export function formatMb(bytes: number): string {
  return (bytes / (1024 * 1024)).toLocaleString("pt-PT", {
    maximumFractionDigits: 1,
  });
}

/** Returns an error message (PT-PT) or null when the file can be tried. */
export function validateFile(file: File): string | null {
  const typeOk =
    ALLOWED_TYPES.includes(file.type) ||
    (!file.type && /\.(jpe?g|png|webp|heic|heif)$/i.test(file.name));
  if (!typeOk) {
    return "Formato não suportado. Use uma foto JPEG, PNG, WebP ou HEIC.";
  }
  if (file.size > SOURCE_MAX_BYTES) {
    return `A foto tem ${formatMb(file.size)} MB. O máximo é 15 MB.`;
  }
  return null;
}

/** Largest 4:3 area available in an image of the given size. */
export function maxCropSize(width: number, height: number) {
  const cw = Math.min(width, (height * 4) / 3);
  return { width: cw, height: (cw * 3) / 4 };
}

export function checkResolution(
  width: number,
  height: number,
  slot: PhotoSlot
): { error: string | null } {
  const dims = `${width}×${height} px`;
  const rec = RECOMMENDED[slot];
  const crop = maxCropSize(width, height);
  const slotLabel = slot === "principal" ? "a foto principal" : "a galeria";

  // The 4:3 crop, rather than the uncropped source dimensions, determines
  // whether the final image can meet the slot's minimum size.
  if (crop.width < rec.width || crop.height < rec.height) {
    return {
      error: `A foto tem ${dims}. Para ${slotLabel} o mínimo é ${rec.width}×${rec.height} px.`
    };
  }
  return { error: null };
}

function loadViaImgElement(file: File): Promise<DecodedImage> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.decoding = "async";
    img.onload = () =>
      resolve({
        source: img,
        width: img.naturalWidth,
        height: img.naturalHeight,
        close: () => URL.revokeObjectURL(url),
      });
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("decode"));
    };
    img.src = url;
  });
}

/** Decode with EXIF orientation applied. Throws a PT-PT message on failure. */
export async function decodeImage(file: File): Promise<DecodedImage> {
  try {
    if (typeof createImageBitmap === "function") {
      const bmp = await createImageBitmap(file, {
        imageOrientation: "from-image",
      });
      return {
        source: bmp,
        width: bmp.width,
        height: bmp.height,
        close: () => bmp.close(),
      };
    }
  } catch {
    /* fall through to <img> */
  }
  try {
    return await loadViaImgElement(file);
  } catch {
    throw new Error(
      isHeic(file)
        ? "Este formato não é suportado neste navegador. Exporte a foto em JPEG e tente novamente."
        : "Não foi possível abrir esta foto. Experimente outro ficheiro."
    );
  }
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  type: string,
  quality: number
): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob(resolve, type, quality));
}

let webpSupport: boolean | null = null;

async function encode(
  canvas: HTMLCanvasElement,
  quality: number
): Promise<{ blob: Blob; mime: "image/webp" | "image/jpeg" }> {
  if (webpSupport !== false) {
    const b = await canvasToBlob(canvas, "image/webp", quality);
    if (b && b.type === "image/webp") {
      webpSupport = true;
      return { blob: b, mime: "image/webp" };
    }
    webpSupport = false;
  }
  // JPEG fallback (e.g. older Safari cannot encode WebP).
  const jpegQ = Math.min(0.95, quality + (JPEG_QUALITY - WEBP_QUALITY));
  const b = await canvasToBlob(canvas, "image/jpeg", jpegQ);
  if (!b) throw new Error("Não foi possível processar a foto.");
  return { blob: b, mime: "image/jpeg" };
}

/**
 * Crop + resize + re-encode. Output is 4:3, ≤ 2400 px wide, ≤ 1.5 MB when
 * possible (quality 0.82 → 0.76 → 0.70, then dimensions ×0.85, never below the slot minimum).
 */
export async function exportCrop(
  img: DecodedImage,
  rect: CropRect,
  slot: PhotoSlot
): Promise<ProcessedPhoto> {
  const minOutputWidth = RECOMMENDED[slot].width;
  let outW = Math.max(
    minOutputWidth,
    Math.min(OUTPUT_MAX_WIDTH, Math.round(rect.sw))
  );
  const canvas = document.createElement("canvas");
  const qualities = [WEBP_QUALITY, 0.76, 0.7];

  for (let attempt = 0; attempt < 8; attempt++) {
    const outH = Math.round((outW * 3) / 4);
    canvas.width = outW;
    canvas.height = outH;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas indisponível.");
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(img.source, rect.sx, rect.sy, rect.sw, rect.sh, 0, 0, outW, outH);

    for (const q of qualities) {
      const { blob, mime } = await encode(canvas, q);
      if (blob.size <= OUTPUT_MAX_BYTES) {
        return { blob, width: outW, height: outH, mime };
      }
    }
    if (outW <= minOutputWidth) break;
    outW = Math.max(minOutputWidth, Math.round(outW * 0.85));
  }
  throw new Error(
    "Não foi possível reduzir a foto para 1,5 MB. Experimente outra foto."
  );
}
