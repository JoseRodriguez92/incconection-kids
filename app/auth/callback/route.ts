import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const type = requestUrl.searchParams.get("type");

  if (code) {
    const supabase = await createClient();
    await supabase.auth.exchangeCodeForSession(code);
  }

  // Para flujo de recuperación de contraseña
  if (type === "recovery" || !type) {
    const baseUrl =
      process.env.NEXT_PUBLIC_SITE_URL! ||
      "https://jaimequijano.incconection-kids.com/";
    return NextResponse.redirect(`${baseUrl}/auth/reset-password`);
  }

  // Para otros flujos (OAuth, etc.)
  return NextResponse.redirect(new URL("/autorizacion", request.url));
}
