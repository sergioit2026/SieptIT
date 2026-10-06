"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  PHOTO_ALT_MAX,
  PHOTOS_MAX,
  isUserPhotoId,
} from "@/lib/site-config";
import { PHOTOS, USER_UPLOADS_ENABLED } from "@/lib/wizard-options";
import {
  ACCEPT_ATTR,
  checkResolution,
  decodeImage,
  exportCrop,
  validateFile,
  type CropRect,
  type DecodedImage,
  type PhotoSlot,
} from "@/lib/image-processing";
import { newUserPhotoId, putPhoto } from "@/lib/photo-store";
import { resolvePhotos } from "@/lib/render/photos";
import { useUserPhotoUrls } from "@/lib/use-user-photo-urls";
import PhotoCropper from "./PhotoCropper";
import { useWizard } from "./WizardContext";
import styles from "./wizard.module.css";

type Pending = { image: DecodedImage; slot: PhotoSlot };

export default function PhotoPicker() {
  const {
    state,
    errors,
    togglePhoto,
    addUserPhoto,
    updateUserPhotoAlt,
    movePhoto,
    removePhoto,
  } = useWizard();
  const { media } = state;
  const count = media.photoIds.length;
  const full = count >= PHOTOS_MAX;

  const fileRef = useRef<HTMLInputElement>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [pending, setPending] = useState<Pending | null>(null);
  const [busy, setBusy] = useState(false);
  const [focusId, setFocusId] = useState<string | null>(null);

  const userIds = media.photoIds.filter(isUserPhotoId);
  const { urls } = useUserPhotoUrls(userIds);
  const selected = resolvePhotos(media.photoIds, media.userPhotos, urls);

  // Release decoded bitmap when the cropper closes / component unmounts.
  useEffect(() => {
    if (!pending) return;
    return () => pending.image.close();
  }, [pending]);

  useEffect(() => {
    if (!focusId) return;
    const el = document.getElementById(`alt-${focusId}`);
    if (el) {
      el.focus();
      setFocusId(null);
    }
  }, [focusId, selected.length]);

  const onFile = useCallback(
    async (file: File | undefined) => {
      setUploadError(null);
      if (!file) return;
      if (count >= PHOTOS_MAX) {
        setUploadError(`Já tem ${PHOTOS_MAX} fotos. Remova uma para adicionar outra.`);
        return;
      }
      const invalid = validateFile(file);
      if (invalid) {
        setUploadError(invalid);
        return;
      }
      setLoading(true);
      try {
        const image = await decodeImage(file);
        const slot: PhotoSlot = count === 0 ? "principal" : "galeria";
        // Equivalent to checking the largest 4:3 area of the image.
        const { error } = checkResolution(image.width, image.height, slot);
        if (error) {
          image.close();
          setUploadError(error);
          return;
        }
        setPending({ image, slot });
      } catch (e) {
        setUploadError(e instanceof Error ? e.message : "Não foi possível abrir esta foto.");
      } finally {
        setLoading(false);
        if (fileRef.current) fileRef.current.value = "";
      }
    },
    [count]
  );

  const onConfirmCrop = useCallback(
    async (rect: CropRect) => {
      if (!pending) return;
      setBusy(true);
      try {
        const out = await exportCrop(pending.image, rect, pending.slot);
        const id = newUserPhotoId();
        await putPhoto({
          id,
          blob: out.blob,
          width: out.width,
          height: out.height,
          mime: out.mime,
          createdAt: Date.now(),
        });
        addUserPhoto({
          id,
          alt: "",
          width: out.width,
          height: out.height,
          mime: out.mime,
          bytes: out.blob.size,
        });
        setFocusId(id);
        setPending(null);
      } catch (e) {
        setUploadError(
          e instanceof Error ? e.message : "Não foi possível processar a foto."
        );
        setPending(null);
      } finally {
        setBusy(false);
      }
    },
    [pending, addUserPhoto]
  );

  return (
    <div className={styles.field}>
      <div className={styles.serviceHead}>
        <span className={styles.label}>Fotos</span>
        <span className={styles.hint}>
          {count}/{PHOTOS_MAX} · 1 principal + 2 galeria
        </span>
      </div>
      <p className={styles.photoNote} role="note">
        As fotos são analisadas antes de aparecerem no site publicado.
      </p>
      {errors.photos && <p className={styles.error}>{errors.photos}</p>}

      {selected.length > 0 && (
        <ol className={styles.photoList} aria-label="Fotos escolhidas (a primeira é a principal)">
          {selected.map((p, i) => {
            const altErr = errors[`alt-${p.id}`];
            const ref = media.userPhotos.find((u) => u.id === p.id);
            return (
              <li key={p.id} className={styles.photoItem}>
                <div className={styles.photoThumb}>
                  {p.url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.url} alt="" width={p.width} height={p.height} />
                  ) : (
                    <span className={styles.photoThumbEmpty} aria-hidden="true" />
                  )}
                  <span
                    className={`${styles.photoBadge} ${
                      i === 0 ? styles.photoBadgePrincipal : ""
                    }`}
                  >
                    {i === 0 ? "Principal" : "Galeria"}
                  </span>
                </div>
                <div className={styles.photoMeta}>
                  <span className={styles.hint}>
                    {p.source === "user"
                      ? `Foto sua · ${p.width}×${p.height} px · ${ref?.mime === "image/jpeg" ? "JPEG" : "WebP"} · ${Math.round((ref?.bytes ?? 0) / 1024)} KB`
                      : `Biblioteca · ${p.alt}`}
                  </span>
                  {p.source === "user" && ref ? (
                    <>
                      <label className={styles.label} htmlFor={`alt-${p.id}`}>
                        Texto alternativo <span className={styles.required}>*</span>
                      </label>
                      <input
                        id={`alt-${p.id}`}
                        className={`${styles.input} ${altErr ? styles.inputError : ""}`}
                        value={ref.alt}
                        maxLength={PHOTO_ALT_MAX}
                        onChange={(e) => updateUserPhotoAlt(p.id, e.target.value)}
                        placeholder="Descreva a foto (ex.: Fachada da loja na Rua do Alecrim)"
                        aria-invalid={Boolean(altErr)}
                        aria-describedby={altErr ? `alt-err-${p.id}` : undefined}
                        required
                      />
                      <div className={styles.photoAltFoot}>
                        {altErr ? (
                          <p className={styles.error} id={`alt-err-${p.id}`}>
                            {altErr}
                          </p>
                        ) : (
                          <span />
                        )}
                        <span className={styles.charCount}>
                          {ref.alt.length}/{PHOTO_ALT_MAX}
                        </span>
                      </div>
                    </>
                  ) : null}
                  <div className={styles.photoActions}>
                    {(() => {
                      const principalBlocked =
                        i === 1 &&
                        p.source === "user" &&
                        checkResolution(p.width, p.height, "principal").error !== null;
                      return (
                        <>
                          <button
                            type="button"
                            className={styles.linkBtn}
                            onClick={() => movePhoto(i, -1)}
                            disabled={i === 0 || principalBlocked}
                            title={
                              principalBlocked
                                ? "Esta foto não pode ser a principal: precisa de pelo menos 1200×900 px."
                                : undefined
                            }
                            aria-label={
                              principalBlocked
                                ? `Subir foto ${i + 1} (bloqueado: mínimo 1200×900 px)`
                                : `Subir foto ${i + 1}`
                            }
                          >
                            ↑ Subir
                          </button>
                          {principalBlocked && (
                            <span className={styles.actionHelp} role="status">
                              Não pode ser principal: mínimo 1200×900 px.
                            </span>
                          )}
                        </>
                      );
                    })()}
                    <button
                      type="button"
                      className={styles.linkBtn}
                      onClick={() => movePhoto(i, 1)}
                      disabled={i === selected.length - 1}
                      aria-label={`Descer foto ${i + 1}`}
                    >
                      ↓ Descer
                    </button>
                    <button
                      type="button"
                      className={`${styles.linkBtn} ${styles.linkBtnDanger}`}
                      onClick={() => removePhoto(p.id)}
                      aria-label={`Remover foto ${i + 1}`}
                    >
                      Remover
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      )}

      <div className={styles.uploadBox}>
        {USER_UPLOADS_ENABLED ? (
          <>
            <input
              ref={fileRef}
              id="photo-file"
              type="file"
              accept={ACCEPT_ATTR}
              className={styles.visuallyHidden}
              onChange={(e) => void onFile(e.target.files?.[0])}
              disabled={full || loading}
            />
            <label
              htmlFor="photo-file"
              className={`${styles.btn} ${styles.btnSecondary} ${
                full || loading ? styles.btnDisabled : ""
              }`}
              aria-disabled={full || loading}
            >
              {loading ? "A abrir a foto…" : "Carregar uma foto sua"}
            </label>
            <span className={styles.hint}>
              JPEG, PNG, WebP ou HEIC · até 15 MB · mínimo 1200×900 px
              (principal) ou 1024×768 px (galeria).
              {full ? " Já tem 3 fotos: remova uma para adicionar outra." : ""}
            </span>
            <span className={styles.hint}>
              Só pode carregar fotos suas ou para as quais tenha autorização.
              Não são permitidas fotos com conteúdo impróprio.
            </span>
          </>
        ) : (
          <p className={styles.hint}>
            O carregamento de fotos próprias está temporariamente indisponível.
            Escolha fotos da biblioteca abaixo.
          </p>
        )}
        {uploadError && (
          <p className={styles.error} role="alert">
            {uploadError}
          </p>
        )}
      </div>

      <details className={styles.libraryBox} open>
        <summary className={styles.label}>Biblioteca de fotos de exemplo</summary>
        <div className={styles.photoGrid}>
          {PHOTOS.map((photo) => {
            const isSel = media.photoIds.includes(photo.id);
            const disabled = !isSel && full;
            return (
              <button
                key={photo.id}
                type="button"
                className={`${styles.photoBtn} ${isSel ? styles.photoBtnSelected : ""}`}
                onClick={() => togglePhoto(photo.id)}
                aria-pressed={isSel}
                aria-label={photo.label}
                disabled={disabled}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={photo.url} alt="" loading="lazy" width={800} height={600} />
                <span className={styles.photoCheck} aria-hidden="true">
                  ✓
                </span>
                <span className={styles.photoCaption}>{photo.label}</span>
              </button>
            );
          })}
        </div>
      </details>

      {pending && (
        <PhotoCropper
          image={pending.image}
          slot={pending.slot}
          circleGuide={state.layoutId === "minimal-card" && pending.slot === "principal"}
          busy={busy}
          onCancel={() => setPending(null)}
          onConfirm={(r) => void onConfirmCrop(r)}
        />
      )}
    </div>
  );
}
