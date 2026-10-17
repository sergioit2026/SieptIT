"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import {
  checkDemoCredentials,
  lockedMinutes,
  registerFailure,
  registerSuccess,
} from "@/lib/demo/credentials";
import {
  DEMO_COOKIE,
  DEMO_LOGIN_PATH,
  DEMO_SESSION_SECONDS,
  createDemoToken,
  demoConfigured,
  demoCookieOptions,
  readDemoSession,
  revokeDemoToken,
} from "@/lib/demo/session";

export type LoginState = { error: string | null };

async function clientKey(): Promise<string> {
  const h = await headers();
  // Último IP de X-Forwarded-For = o acrescentado pelo proxy do alojamento
  // (os primeiros podem ser forjados pelo cliente).
  const fwd = h.get("x-forwarded-for")?.split(",").pop()?.trim();
  return fwd || h.get("x-real-ip") || "desconhecido";
}

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function demoLogin(_prev: LoginState, formData: FormData): Promise<LoginState> {
  if (!demoConfigured()) {
    return { error: "A demonstração não está configurada neste servidor." };
  }
  const key = await clientKey();
  const locked = lockedMinutes(key);
  if (locked > 0) {
    return {
      error: `Demasiadas tentativas falhadas. Tente novamente dentro de ${locked} min.`,
    };
  }

  const user = String(formData.get("utilizador") ?? "").slice(0, 128);
  const password = String(formData.get("palavra_passe") ?? "").slice(0, 256);

  if (!user || !password || !checkDemoCredentials(user, password)) {
    const lockedNow = registerFailure(key);
    await wait(600);
    if (lockedNow > 0) {
      return {
        error: `Demasiadas tentativas falhadas. Tente novamente dentro de ${lockedNow} min.`,
      };
    }
    return { error: "Utilizador ou palavra-passe incorrectos." };
  }

  registerSuccess(key);
  const session = createDemoToken();
  if (!session) return { error: "A demonstração não está configurada neste servidor." };
  const jar = await cookies();
  jar.set(DEMO_COOKIE, session.token, demoCookieOptions(DEMO_SESSION_SECONDS));
  // `entrada=1` faz correr o pré-loader uma única vez por login.
  redirect("/demonstracao?entrada=1");
}

export async function demoLogout(reason?: "fim" | "expirou"): Promise<void> {
  const jar = await cookies();
  // Sem sessão válida (ausente, forjada, expirada ou terminada) a acção não faz
  // nada além de apagar o cookie e mandar para o login.
  const session = await readDemoSession();
  if (session) revokeDemoToken(jar.get(DEMO_COOKIE)?.value);
  jar.set(DEMO_COOKIE, "", demoCookieOptions(0));
  if (!session) redirect(DEMO_LOGIN_PATH);
  redirect(`${DEMO_LOGIN_PATH}?${reason === "expirou" ? "expirou" : "fim"}=1`);
}
