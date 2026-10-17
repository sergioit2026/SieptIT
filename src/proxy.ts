import { NextResponse, type NextRequest } from "next/server";
import { DEMO_COOKIE, DEMO_LOGIN_PATH, verifyDemoToken } from "@/lib/demo/session";

/**
 * Protege /demonstracao: sem sessão válida, tudo redirecciona para a entrada.
 * Todas as respostas levam noindex/nofollow e no-store.
 */
function harden(res: NextResponse): NextResponse {
  res.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
  res.headers.set("Cache-Control", "no-store, max-age=0");
  res.headers.set("Referrer-Policy", "no-referrer");
  res.headers.set("X-Frame-Options", "DENY");
  return res;
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const inDemo = pathname === "/demonstracao" || pathname.startsWith("/demonstracao/");

  // As únicas Server Actions da app são as do demo: recusar qualquer invocação
  // fora de /demonstracao (o Next aceita o id da acção em qualquer rota).
  if (!inDemo) {
    if (request.headers.has("next-action")) {
      return harden(new NextResponse("Pedido recusado.", { status: 403 }));
    }
    return NextResponse.next();
  }
  const isLogin = pathname === DEMO_LOGIN_PATH || pathname === `${DEMO_LOGIN_PATH}/`;
  if (isLogin) return harden(NextResponse.next());

  const session = verifyDemoToken(request.cookies.get(DEMO_COOKIE)?.value);
  if (!session) {
    const url = request.nextUrl.clone();
    url.pathname = DEMO_LOGIN_PATH;
    url.search = "";
    const res = NextResponse.redirect(url, 303);
    if (request.cookies.has(DEMO_COOKIE)) res.cookies.delete({ name: DEMO_COOKIE, path: "/demonstracao" });
    return harden(res);
  }
  return harden(NextResponse.next());
}

export const config = {
  matcher: [
    "/demonstracao",
    "/demonstracao/:path*",
    // Qualquer outra rota só quando traz o cabeçalho de Server Action.
    {
      source: "/((?!_next/static|_next/image|favicon.ico).*)",
      has: [{ type: "header", key: "next-action" }],
    },
  ],
};
