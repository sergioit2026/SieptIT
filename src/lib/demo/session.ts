/**
 * Sessão do modo demonstração — APENAS servidor (proxy, páginas, Server Actions).
 * Token assinado com HMAC-SHA256 (`DEMO_SESSION_SECRET`), crypto nativo do Node.
 * Formato: v1.<expira em segundos epoch>.<nonce>.<assinatura base64url>
 */
import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";

export const DEMO_COOKIE = "siept_demo_sessao";
export const DEMO_COOKIE_PATH = "/demonstracao";
export const DEMO_SESSION_SECONDS = 2 * 60 * 60; // 2 h
export const DEMO_LOGIN_PATH = "/demonstracao/entrar";

/**
 * Nonces terminados (logout). Em memória do processo, partilhados via
 * globalThis entre o proxy e as páginas/acções (o Next carrega-os em módulos
 * separados). Complementa a expiração de 2 h.
 */
const REVOKED_KEY = Symbol.for("siept.demo.revoked");
const g = globalThis as unknown as Record<symbol, Map<string, number> | undefined>;
const revoked: Map<string, number> = (g[REVOKED_KEY] ??= new Map<string, number>());

/**
 * Nonce de arranque: gerado uma vez por processo e incluído na assinatura.
 * Ao reiniciar a app, todos os tokens anteriores deixam de ser válidos.
 * Partilhado via globalThis entre o proxy, as páginas e as acções.
 */
const BOOT_KEY = Symbol.for("siept.demo.bootNonce");
const gb = globalThis as unknown as Record<symbol, string | undefined>;
const bootNonce: string = (gb[BOOT_KEY] ??= randomBytes(32).toString("base64url"));

function secret(): string | null {
  const s = process.env.DEMO_SESSION_SECRET ?? "";
  return s.length >= 32 ? s : null;
}

function sign(payload: string, key: string): string {
  return createHmac("sha256", key).update(`${payload}|${bootNonce}`).digest("base64url");
}

export function demoConfigured(): boolean {
  return Boolean(
    secret() &&
      process.env.DEMO_USER &&
      (process.env.DEMO_PASSWORD_HASH || process.env.DEMO_PASSWORD)
  );
}

export function createDemoToken(now = Date.now()): { token: string; expiresAt: number } | null {
  const key = secret();
  if (!key) return null;
  const exp = Math.floor(now / 1000) + DEMO_SESSION_SECONDS;
  const nonce = randomBytes(16).toString("base64url");
  const payload = `v1.${exp}.${nonce}`;
  return { token: `${payload}.${sign(payload, key)}`, expiresAt: exp * 1000 };
}

export type DemoSession = { expiresAt: number; nonce: string };

export function verifyDemoToken(token: string | undefined | null, now = Date.now()): DemoSession | null {
  const key = secret();
  if (!key || !token) return null;
  const parts = token.split(".");
  if (parts.length !== 4 || parts[0] !== "v1") return null;
  const [v, expRaw, nonce, sig] = parts;
  const expected = Buffer.from(sign(`${v}.${expRaw}.${nonce}`, key));
  const given = Buffer.from(sig);
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) return null;
  const exp = Number(expRaw);
  if (!Number.isFinite(exp) || exp * 1000 <= now) return null;
  if (exp * 1000 > now + DEMO_SESSION_SECONDS * 1000 + 60_000) return null;
  if (revoked.has(nonce)) return null;
  return { expiresAt: exp * 1000, nonce };
}

export function revokeDemoToken(token: string | undefined | null): void {
  const s = verifyDemoToken(token);
  if (!s) return;
  revoked.set(s.nonce, s.expiresAt);
  const now = Date.now();
  for (const [n, exp] of revoked) if (exp <= now) revoked.delete(n);
}

export function demoCookieOptions(maxAgeSeconds: number) {
  return {
    httpOnly: true,
    secure: true,
    sameSite: "strict" as const,
    path: DEMO_COOKIE_PATH,
    maxAge: maxAgeSeconds,
    priority: "high" as const,
  };
}

/**
 * Lê e valida a sessão demo a partir dos cookies do pedido actual
 * (Server Components e Server Actions). Inclui tokens terminados.
 */
export async function readDemoSession(): Promise<DemoSession | null> {
  const { cookies } = await import("next/headers");
  return verifyDemoToken((await cookies()).get(DEMO_COOKIE)?.value);
}
