/**
 * IndexedDB storage for the client's own photos (front-end only MVP).
 * Only the final processed variant is stored (F-5: no master/original).
 * `SiteConfig.media.userPhotos[].id` references the record key.
 */

import { demoMemory, isDemoMode } from "./demo/mode";

const DB_NAME = "siept-photos";
const DB_VERSION = 1;
const STORE = "photos";

export type StoredPhoto = {
  id: string;
  blob: Blob;
  width: number;
  height: number;
  mime: string;
  createdAt: number;
};

let dbPromise: Promise<IDBDatabase> | null = null;

function openDb(): Promise<IDBDatabase> {
  if (typeof indexedDB === "undefined") {
    return Promise.reject(new Error("IndexedDB indisponível"));
  }
  if (!dbPromise) {
    dbPromise = new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, DB_VERSION);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains(STORE)) {
          db.createObjectStore(STORE, { keyPath: "id" });
        }
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => {
        dbPromise = null;
        reject(req.error ?? new Error("Falha ao abrir IndexedDB"));
      };
    });
  }
  return dbPromise;
}

function tx<T>(
  mode: IDBTransactionMode,
  run: (store: IDBObjectStore) => IDBRequest<T> | void
): Promise<T | undefined> {
  return openDb().then(
    (db) =>
      new Promise<T | undefined>((resolve, reject) => {
        const t = db.transaction(STORE, mode);
        const store = t.objectStore(STORE);
        const req = run(store);
        let result: T | undefined;
        if (req) req.onsuccess = () => (result = req.result);
        t.oncomplete = () => resolve(result);
        t.onerror = () => reject(t.error ?? new Error("Erro IndexedDB"));
        t.onabort = () => reject(t.error ?? new Error("Transação abortada"));
      })
  );
}

export function newUserPhotoId(): string {
  const rand =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID().replace(/-/g, "").slice(0, 16)
      : Math.random().toString(36).slice(2, 18);
  return `up_${rand}`;
}

export async function putPhoto(photo: StoredPhoto): Promise<void> {
  // Modo demonstração: só memória, nunca o IndexedDB normal.
  if (isDemoMode()) {
    demoMemory.photos.set(photo.id, photo);
    return;
  }
  await tx("readwrite", (s) => s.put(photo));
}

export async function getPhoto(id: string): Promise<StoredPhoto | undefined> {
  if (isDemoMode()) {
    return demoMemory.photos.get(id) as StoredPhoto | undefined;
  }
  try {
    return await tx<StoredPhoto>("readonly", (s) => s.get(id));
  } catch {
    return undefined;
  }
}

export async function deletePhoto(id: string): Promise<void> {
  if (isDemoMode()) {
    demoMemory.photos.delete(id);
    return;
  }
  try {
    await tx("readwrite", (s) => s.delete(id));
  } catch {
    /* ignore */
  }
}

/** Delete every stored photo whose id is not in `keep`. */
export async function prunePhotos(keep: string[]): Promise<void> {
  if (isDemoMode()) {
    for (const k of [...demoMemory.photos.keys()]) {
      if (!keep.includes(k)) demoMemory.photos.delete(k);
    }
    return;
  }
  try {
    const keys = (await tx<IDBValidKey[]>("readonly", (s) => s.getAllKeys())) ?? [];
    const stale = keys.filter((k) => typeof k === "string" && !keep.includes(k));
    if (stale.length === 0) return;
    await tx("readwrite", (s) => {
      for (const k of stale) s.delete(k);
    });
  } catch {
    /* ignore */
  }
}
