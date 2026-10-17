/**
 * Validação das credenciais do demo — APENAS servidor.
 * DEMO_PASSWORD_HASH formato: scrypt:<sal base64url>:<hash base64url>
 * (gerar com `node scripts/demo-password-hash.mjs`). DEMO_PASSWORD (texto)
 * só é aceite se não houver hash — usar apenas em testes locais.
 */
import { createHash, scryptSync, timingSafeEqual } from "node:crypto";

const SCRYPT_KEYLEN = 64;

function sameString(a: string, b: string): boolean {
  const ha = createHash("sha256").update(a).digest();
  const hb = createHash("sha256").update(b).digest();
  return timingSafeEqual(ha, hb);
}

function checkPassword(password: string): boolean {
  const hash = process.env.DEMO_PASSWORD_HASH;
  if (hash) {
    const [algo, saltB64, keyB64] = hash.split(":");
    if (algo !== "scrypt" || !saltB64 || !keyB64) return false;
    const expected = Buffer.from(keyB64, "base64url");
    if (expected.length !== SCRYPT_KEYLEN) return false;
    const derived = scryptSync(password, Buffer.from(saltB64, "base64url"), SCRYPT_KEYLEN);
    return timingSafeEqual(derived, expected);
  }
  const plain = process.env.DEMO_PASSWORD;
  if (plain) return sameString(password, plain);
  return false;
}

export function checkDemoCredentials(user: string, password: string): boolean {
  const expectedUser = process.env.DEMO_USER;
  if (!expectedUser) return false;
  // Avaliar ambos sempre (sem atalho) para não revelar qual falhou.
  const userOk = sameString(user, expectedUser);
  const passOk = checkPassword(password);
  return userOk && passOk;
}

/* ---------- Limite de tentativas (simples, em memória do processo) ---------- */

const MAX_FAILS = 5;
const WINDOW_MS = 15 * 60 * 1000;
const LOCK_MS = 15 * 60 * 1000;

type Attempt = { fails: number; firstAt: number; lockedUntil: number };
const attempts = new Map<string, Attempt>();

function sweep(now: number) {
  if (attempts.size < 500) return;
  for (const [k, a] of attempts) {
    if (a.lockedUntil < now && now - a.firstAt > WINDOW_MS) attempts.delete(k);
  }
}

/** Devolve os minutos de bloqueio restantes, ou 0 se pode tentar. */
export function lockedMinutes(key: string, now = Date.now()): number {
  const a = attempts.get(key);
  if (!a || a.lockedUntil <= now) return 0;
  return Math.ceil((a.lockedUntil - now) / 60000);
}

export function registerFailure(key: string, now = Date.now()): number {
  sweep(now);
  let a = attempts.get(key);
  if (!a || now - a.firstAt > WINDOW_MS) {
    a = { fails: 0, firstAt: now, lockedUntil: 0 };
  }
  a.fails += 1;
  if (a.fails >= MAX_FAILS) {
    a.lockedUntil = now + LOCK_MS;
    a.fails = 0;
    a.firstAt = now;
  }
  attempts.set(key, a);
  return lockedMinutes(key, now);
}

export function registerSuccess(key: string): void {
  attempts.delete(key);
}
