/**
 * Modo demonstração (/demonstracao) — lado do cliente.
 *
 * Em modo demo, o assistente nunca escreve em localStorage nem no IndexedDB
 * normal (`siept-photos`): a configuração e as fotos ficam apenas em memória
 * (Maps neste módulo), com chaves próprias. Fechar o separador, recarregar,
 * terminar ou expirar a sessão apaga tudo.
 */

export const DEMO_KEY_PREFIX = "siept-demo-";
export const DEMO_CONFIG_KEY = `${DEMO_KEY_PREFIX}site-config`;
/** Nome reservado; o demo não cria esta base, apenas a apaga por precaução. */
export const DEMO_IDB_NAME = `${DEMO_KEY_PREFIX}photos`;

let demoMode = false;

/** Armazenamento em memória do demo (config + fotos). */
export const demoMemory = {
  config: new Map<string, string>(),
  photos: new Map<string, unknown>(),
};

export function isDemoMode(): boolean {
  return demoMode;
}

export function enableDemoMode(): void {
  if (typeof window === "undefined") return; // nunca no servidor
  demoMode = true;
}

export function disableDemoMode(): void {
  demoMode = false;
}

/** Apaga todos os dados do demo neste browser. Seguro de chamar várias vezes. */
export function clearDemoData(): void {
  demoMemory.config.clear();
  demoMemory.photos.clear();
  if (typeof window === "undefined") return;
  for (const store of [window.sessionStorage, window.localStorage]) {
    try {
      const keys: string[] = [];
      for (let i = 0; i < store.length; i++) {
        const k = store.key(i);
        if (k && k.startsWith(DEMO_KEY_PREFIX)) keys.push(k);
      }
      keys.forEach((k) => store.removeItem(k));
    } catch {
      /* ignorar */
    }
  }
  try {
    if (typeof indexedDB !== "undefined") indexedDB.deleteDatabase(DEMO_IDB_NAME);
  } catch {
    /* ignorar */
  }
}
