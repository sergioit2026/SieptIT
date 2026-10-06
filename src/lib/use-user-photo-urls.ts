"use client";

import { useEffect, useState } from "react";
import { getPhoto } from "./photo-store";

/**
 * Load own photos from IndexedDB and expose them as object URLs.
 * `done` becomes true once every id was looked up (missing ids stay absent).
 */
export function useUserPhotoUrls(ids: string[]): {
  urls: Record<string, string>;
  done: boolean;
} {
  const key = ids.join("|");
  const [state, setState] = useState<{ key: string; urls: Record<string, string> }>(
    { key: "", urls: {} }
  );

  useEffect(() => {
    let cancelled = false;
    const created: string[] = [];
    const list = key ? key.split("|") : [];
    (async () => {
      const urls: Record<string, string> = {};
      for (const id of list) {
        const rec = await getPhoto(id);
        if (rec?.blob) {
          const u = URL.createObjectURL(rec.blob);
          created.push(u);
          urls[id] = u;
        }
      }
      if (!cancelled) setState({ key, urls });
    })();
    return () => {
      cancelled = true;
      for (const u of created) URL.revokeObjectURL(u);
    };
  }, [key]);

  return { urls: state.key === key ? state.urls : {}, done: state.key === key };
}
