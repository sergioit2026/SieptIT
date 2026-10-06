"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  OUTPUT_MAX_WIDTH,
  RECOMMENDED,
  maxCropSize,
  type CropRect,
  type DecodedImage,
  type PhotoSlot,
} from "@/lib/image-processing";
import styles from "./wizard.module.css";

type Props = {
  image: DecodedImage;
  slot: PhotoSlot;
  /** Show the circular guide (layout "Cartão minimal", principal photo). */
  circleGuide: boolean;
  busy: boolean;
  onCancel: () => void;
  onConfirm: (rect: CropRect) => void;
};

/**
 * Fixed 4:3 crop frame. Drag (mouse/touch/pen) to position, slider or
 * +/− keys to zoom, arrow keys to move. Zoom is capped so the cropped area
 * never drops below the minimum width for the selected slot.
 */
export default function PhotoCropper({
  image,
  slot,
  circleGuide,
  busy,
  onCancel,
  onConfirm,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const base = maxCropSize(image.width, image.height);
  const rec = RECOMMENDED[slot];
  const maxZoom = Math.max(1, Math.min(4, base.width / rec.width));
  const [zoom, setZoom] = useState(1);
  const [center, setCenter] = useState({ x: image.width / 2, y: image.height / 2 });
  const drag = useRef<{ id: number; x: number; y: number } | null>(null);

  const cropW = base.width / zoom;
  const cropH = base.height / zoom;

  const clampCenter = useCallback(
    (c: { x: number; y: number }, z: number) => {
      const w = base.width / z;
      const h = base.height / z;
      return {
        x: Math.min(image.width - w / 2, Math.max(w / 2, c.x)),
        y: Math.min(image.height - h / 2, Math.max(h / 2, c.y)),
      };
    },
    [base.width, base.height, image.width, image.height]
  );

  const rect: CropRect = {
    sx: center.x - cropW / 2,
    sy: center.y - cropH / 2,
    sw: cropW,
    sh: cropH,
  };

  // Draw
  useEffect(() => {
    const canvas = canvasRef.current;
    const frame = frameRef.current;
    if (!canvas || !frame) return;
    const draw = () => {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const w = Math.max(1, Math.round(frame.clientWidth * dpr));
      const h = Math.round((w * 3) / 4);
      if (canvas.width !== w) canvas.width = w;
      if (canvas.height !== h) canvas.height = h;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.imageSmoothingQuality = "high";
      ctx.clearRect(0, 0, w, h);
      ctx.drawImage(image.source, rect.sx, rect.sy, rect.sw, rect.sh, 0, 0, w, h);
      // Rule of thirds
      ctx.strokeStyle = "rgba(255,255,255,0.45)";
      ctx.lineWidth = Math.max(1, dpr);
      ctx.beginPath();
      for (let i = 1; i < 3; i++) {
        ctx.moveTo((w * i) / 3, 0);
        ctx.lineTo((w * i) / 3, h);
        ctx.moveTo(0, (h * i) / 3);
        ctx.lineTo(w, (h * i) / 3);
      }
      ctx.stroke();
      if (circleGuide) {
        ctx.save();
        ctx.fillStyle = "rgba(10,20,35,0.45)";
        ctx.beginPath();
        ctx.rect(0, 0, w, h);
        ctx.arc(w / 2, h / 2, h / 2, 0, Math.PI * 2, true);
        ctx.fill("evenodd");
        ctx.strokeStyle = "rgba(255,255,255,0.9)";
        ctx.lineWidth = 2 * dpr;
        ctx.beginPath();
        ctx.arc(w / 2, h / 2, h / 2 - dpr, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }
    };
    draw();
    const ro = new ResizeObserver(draw);
    ro.observe(frame);
    return () => ro.disconnect();
  }, [image, rect.sx, rect.sy, rect.sw, rect.sh, circleGuide]);

  const moveBy = useCallback(
    (dxCss: number, dyCss: number) => {
      const frame = frameRef.current;
      if (!frame) return;
      const scale = cropW / frame.clientWidth;
      setCenter((c) => clampCenter({ x: c.x - dxCss * scale, y: c.y - dyCss * scale }, zoom));
    },
    [cropW, clampCenter, zoom]
  );

  const applyZoom = useCallback(
    (z: number) => {
      const nz = Math.min(maxZoom, Math.max(1, z));
      setZoom(nz);
      setCenter((c) => clampCenter(c, nz));
    },
    [maxZoom, clampCenter]
  );

  const onPointerDown = (e: React.PointerEvent) => {
    if (drag.current) return;
    drag.current = { id: e.pointerId, x: e.clientX, y: e.clientY };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    moveBy(e.clientX - d.x, e.clientY - d.y);
    d.x = e.clientX;
    d.y = e.clientY;
  };
  const onPointerUp = (e: React.PointerEvent) => {
    if (drag.current?.id === e.pointerId) drag.current = null;
  };
  const onKeyDown = (e: React.KeyboardEvent) => {
    const step = 12;
    switch (e.key) {
      case "ArrowLeft":
        moveBy(step, 0);
        break;
      case "ArrowRight":
        moveBy(-step, 0);
        break;
      case "ArrowUp":
        moveBy(0, step);
        break;
      case "ArrowDown":
        moveBy(0, -step);
        break;
      case "+":
      case "=":
        applyZoom(zoom + 0.1);
        break;
      case "-":
        applyZoom(zoom - 0.1);
        break;
      default:
        return;
    }
    e.preventDefault();
  };

  const outW = Math.min(OUTPUT_MAX_WIDTH, Math.round(cropW));
  const outH = Math.round((outW * 3) / 4);

  return (
    <div
      className={styles.cropOverlay}
      role="dialog"
      aria-modal="true"
      aria-labelledby="crop-title"
      onKeyDown={(e) => {
        if (e.key === "Escape" && !busy) onCancel();
      }}
    >
      <div className={styles.cropDialog}>
        <h2 id="crop-title" className={styles.cropTitle}>
          Ajustar a foto {slot === "principal" ? "principal" : "da galeria"}
        </h2>
        <p className={styles.hint}>
          Arraste a foto para a posicionar dentro da moldura 4:3 e use o zoom
          para aproximar. No teclado: setas para mover, + e − para o zoom.
          {circleGuide ? " O círculo mostra o recorte usado no «Cartão minimal»." : ""}
        </p>
        <div
          ref={frameRef}
          className={styles.cropFrame}
          tabIndex={0}
          role="application"
          aria-label="Área de recorte. Use as setas para mover e + ou − para o zoom."
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          onKeyDown={onKeyDown}
        >
          <canvas ref={canvasRef} className={styles.cropCanvas} />
        </div>
        <div className={styles.cropControls}>
          <label className={styles.label} htmlFor="crop-zoom">
            Zoom
          </label>
          <input
            id="crop-zoom"
            type="range"
            min={1}
            max={maxZoom}
            step={0.01}
            value={zoom}
            disabled={maxZoom <= 1}
            onChange={(e) => applyZoom(Number(e.target.value))}
            className={styles.cropRange}
          />
        </div>
        <p className={styles.hint}>
          Resultado: {outW}×{outH} px
        </p>
        <div className={styles.cropActions}>
          <button
            type="button"
            className={`${styles.btn} ${styles.btnGhost}`}
            onClick={onCancel}
            disabled={busy}
          >
            Cancelar
          </button>
          <button
            type="button"
            className={styles.btn}
            onClick={() => onConfirm(rect)}
            disabled={busy}
          >
            {busy ? "A processar…" : "Aprovar recorte"}
          </button>
        </div>
      </div>
    </div>
  );
}
