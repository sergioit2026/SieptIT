import LoginForm from "./LoginForm";
import { demoConfigured } from "@/lib/demo/session";

export default async function EntrarPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const notice = sp.expirou
    ? "A sessão de demonstração expirou. Todos os dados foram apagados."
    : sp.fim
      ? "Demonstração terminada. Todos os dados foram apagados."
      : null;
  return <LoginForm notice={notice} configured={demoConfigured()} />;
}
