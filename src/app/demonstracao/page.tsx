import { redirect } from "next/navigation";
import { DEMO_LOGIN_PATH, readDemoSession } from "@/lib/demo/session";
import DemoClient from "./DemoClient";

export default async function DemonstracaoPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  // Defesa em profundidade: o proxy já redirecciona sem sessão válida.
  const session = await readDemoSession();
  if (!session) redirect(DEMO_LOGIN_PATH);
  const { entrada } = await searchParams;
  return <DemoClient expiresAt={session.expiresAt} showIntro={entrada === "1"} />;
}
