import { redirect } from "next/navigation";
import { DEMO_LOGIN_PATH, readDemoSession } from "@/lib/demo/session";

/**
 * Qualquer /demonstracao/<outra coisa>: sem sessão válida (incluindo tokens
 * terminados) vai para o login; com sessão, volta à demonstração. Nunca 404.
 */
export default async function DemonstracaoQualquer() {
  const session = await readDemoSession();
  redirect(session ? "/demonstracao" : DEMO_LOGIN_PATH);
}
