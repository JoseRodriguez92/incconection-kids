import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Middleware de autenticación y control de permisos
 * Verifica la sesión de Supabase y controla el acceso a rutas protegidas por rol
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Crear respuesta inicial UNA SOLA VEZ — no recrear en cada set-cookie
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  // Crear cliente de Supabase usando getAll/setAll para evitar headers duplicados
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          // Escribir cookies solo sobre la respuesta, nunca recrear NextResponse
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    },
  );

  // SEGURIDAD: Usar getUser() en lugar de getSession() para verificar con el servidor
  // getSession() solo lee cookies sin verificar autenticidad
  // getUser() verifica el token con el servidor de Supabase Auth
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  // Log para debugging (solo en desarrollo)
  if (process.env.NODE_ENV === "development") {
    console.log("🔐 Middleware - Ruta:", pathname);
    console.log("🔐 Middleware - Usuario autenticado:", !!user);
    console.log("🔐 Middleware - Usuario ID:", user?.id || "Sin autenticación");
    if (authError) {
      console.error("🔐 Middleware - Error de autenticación:", authError);
    }
  }

  // Definir rutas protegidas por rol
  const protectedRoutes: Record<string, string[]> = {
    "/usuario/super-admin": ["super-admin"],
    "/usuario/profesor": ["profesor"],
    "/usuario/estudiante": ["estudiante"],
    "/usuario/padre-familia": ["padre-familia"],
    "/usuario/tienda": ["tienda"],
    "/usuario/psicologia": ["psicologia"],
    "/usuario/ruta": ["ruta"],
  };

  // Rutas públicas que no requieren autenticación
  const publicRoutes = [
    "/",
    "/politica-privacidad",
    "/terminos-y-condiciones",
    "/recuperar-contrasena",
    "/auth",
    "/autorizacion",
  ];

  // Si es una ruta pública, permitir acceso sin verificación
  if (
    pathname === "/" ||
    publicRoutes.slice(1).some((route) => pathname.startsWith(route))
  ) {
    return response;
  }

  // Redirigir /usuario (raíz) al último rol activo guardado en cookie
  if (pathname === "/usuario" || pathname === "/usuario/") {
    if (!user || authError) {
      return NextResponse.redirect(new URL("/", request.url));
    }
    const currentRole = request.cookies.get("current_role")?.value;
    if (currentRole) {
      return NextResponse.redirect(
        new URL(`/usuario/${currentRole}`, request.url),
      );
    }
    // Sin cookie activa, redirigir al inicio para que haga login
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Verificar si es una ruta protegida
  const protectedRoute = Object.keys(protectedRoutes).find((route) =>
    pathname.startsWith(route),
  );

  if (protectedRoute) {
    // Si no hay usuario autenticado O hay error de autenticación, redirigir al login
    if (!user || authError) {
      if (process.env.NODE_ENV === "development") {
        console.log(
          "🔐 Middleware - Sin autenticación válida, redirigiendo al login",
        );
      }
      const redirectUrl = new URL("/", request.url);
      redirectUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(redirectUrl);
    }

    // Verificar roles del usuario
    try {
      const { data: profileRoles, error: profileError } = await supabase
        .from("profiles_roles")
        .select("role_id")
        .eq("user_id", user.id);

      if (profileError || !profileRoles || profileRoles.length === 0) {
        if (process.env.NODE_ENV === "development") {
          console.error(
            "🔐 Middleware - Error al obtener roles:",
            profileError,
          );
          console.log(
            "🔐 Middleware - Roles encontrados:",
            profileRoles?.length || 0,
          );
        }
        return NextResponse.redirect(new URL("/acceso-denegado", request.url));
      }

      // Obtener nombres de roles
      const roleIds = profileRoles.map((pr) => pr.role_id);
      const { data: roles, error: rolesError } = await supabase
        .from("roles")
        .select("name")
        .in("id", roleIds);

      if (rolesError || !roles || roles.length === 0) {
        if (process.env.NODE_ENV === "development") {
          console.error(
            "🔐 Middleware - Error al obtener nombres de roles:",
            rolesError,
          );
        }
        return NextResponse.redirect(new URL("/acceso-denegado", request.url));
      }

      const roleNames = roles.map((role) => role.name);

      if (process.env.NODE_ENV === "development") {
        console.log("🔐 Middleware - Roles del usuario:", roleNames);
        console.log(
          "🔐 Middleware - Roles requeridos:",
          protectedRoutes[protectedRoute],
        );
      }

      // Verificar si el usuario tiene alguno de los roles requeridos para esta ruta
      const requiredRoles = protectedRoutes[protectedRoute];
      const hasRequiredRole = requiredRoles.some((role) =>
        roleNames.includes(role),
      );

      if (!hasRequiredRole) {
        if (process.env.NODE_ENV === "development") {
          console.log(
            "🔐 Middleware - Usuario sin rol requerido, acceso denegado",
          );
        }
        return NextResponse.redirect(new URL("/acceso-denegado", request.url));
      }

      if (process.env.NODE_ENV === "development") {
        console.log("🔐 Middleware - Acceso permitido");
      }

      return response;
    } catch (error) {
      console.error("🔐 Middleware - Error crítico en validación:", error);
      return NextResponse.redirect(new URL("/acceso-denegado", request.url));
    }
  }

  // Para cualquier otra ruta bajo /usuario/*, verificar que esté autenticado
  if (pathname.startsWith("/usuario/")) {
    if (!user || authError) {
      if (process.env.NODE_ENV === "development") {
        console.log(
          "🔐 Middleware - Ruta /usuario/* sin autenticación, bloqueando acceso",
        );
      }
      const redirectUrl = new URL("/", request.url);
      redirectUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(redirectUrl);
    }
  }

  return response;
}

// Configurar qué rutas deben ser procesadas por este middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc.)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
