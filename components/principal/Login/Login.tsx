"use client";

import "./index.css";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

import { toast } from "sonner";
import { ManagmentStorage } from "@/components/Services/ManagmentStorage/ManagmentStorage";
import { createClient } from "@/lib/supabase/client";
import { FcGoogle } from "react-icons/fc";
import { Eye, EyeOff } from "lucide-react";
import { UserInfoStore, getStoredRoleCookie } from "@/Stores/UserInfoStore";

export default function Login() {
  const supabase = createClient();

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  /** Función para obtener roles del usuario y redirigir según el rol */
  const getRolesAndRedirect = async (userId: string) => {
    try {
      // Obtener los roles del usuario desde la base de datos
      const { data: profileRoles, error: profileError } = await supabase
        .from("profiles_roles")
        .select("role_id")
        .eq("user_id", userId);

      if (profileError) {
        console.error("Error al obtener roles:", profileError);
        toast.error("Acceso denegado", {
          description:
            "No se pudo verificar los permisos de tu cuenta. Por favor, contacta con el administrador.",
          duration: 5000,
        });
        await supabase.auth.signOut();
        return;
      }

      // Si no tiene roles asignados
      if (!profileRoles || profileRoles.length === 0) {
        console.error("Error al obtener roles , no tiene asignado");
        toast.error("Acceso denegado", {
          description:
            "Tu cuenta no tiene roles asignados. Por favor, contacta con el administrador para obtener los permisos necesarios.",
          duration: 6000,
        });
        await supabase.auth.signOut();
        return;
      }

      // Obtener información detallada de los roles
      const roleIds = profileRoles.map((pr) => pr.role_id);
      const { data: roles, error: rolesError } = await supabase
        .from("roles")
        .select("name")
        .in("id", roleIds);

      if (rolesError) {
        console.error("Error al obtener nombres de roles:", rolesError);
        toast.error("Acceso denegado", {
          description:
            "No se pudo cargar la información de tus permisos. Por favor, intenta nuevamente más tarde.",
          duration: 5000,
        });
        await supabase.auth.signOut();
        return;
      }

      // Verificar que roles no sea null
      if (!roles || roles.length === 0) {
        console.error("No se encontraron roles para el usuario");
        toast.error("Acceso denegado", {
          description:
            "No se encontró información de tus permisos. Por favor, contacta con el administrador.",
          duration: 5000,
        });
        await supabase.auth.signOut();
        return;
      }

      // Guardar roles en el store
      const roleNames = roles.map((role) => role.name);
      UserInfoStore.getState().setRoles(roleNames as any);

      // Determinar rol activo: respetar el último guardado en cookie si sigue siendo válido,
      // si no, tomar el primero disponible según prioridad
      const rolePriority = [
        "super-admin",
        "tienda",
        "padre-familia",
        "psicologia",
        "profesor",
        "estudiante",
        "ruta",
      ];

      const savedRole = getStoredRoleCookie();
      const userRole =
        savedRole && roleNames.includes(savedRole)
          ? savedRole
          : rolePriority.find((role) => roleNames.includes(role));

      // Persistir rol activo en Zustand + cookie
      UserInfoStore.getState().setCurrentRole(userRole ?? null);

      switch (userRole) {
        case "super-admin":
          router.push("/usuario/super-admin");
          break;
        case "tienda":
          router.push("/usuario/tienda");
          break;
        case "padre-familia":
          router.push("/usuario/padre-familia");
          break;
        case "psicologia":
          router.push("/usuario/psicologia");
          break;
        case "profesor":
          router.push("/usuario/profesor");
          break;
        case "estudiante":
          router.push("/usuario/estudiante");
          break;
        case "ruta":
          router.push("/usuario/ruta");
          break;
        default:
          router.push("/"); // Ruta por defecto
          break;
      }
    } catch (error) {
      console.error("Error en getRolesAndRedirect:", error);
      toast.error("Error al iniciar sesión", {
        description:
          "Ocurrió un problema al procesar tu información. Por favor, intenta nuevamente.",
        duration: 5000,
      });
      await supabase.auth.signOut();
      router.push("/");
    }
  };

  /** Si tuviesemos que verificar label inputs con correo y contraseña */
  const verifyUsersLogin = async (e: React.FormEvent | React.MouseEvent) => {
    e.preventDefault();
    setLoading(true);

    const emailInput =
      (document.getElementById("email") as HTMLInputElement)?.value ?? "";
    const passwordInput =
      (document.getElementById("password") as HTMLInputElement)?.value ?? "";

    const email = emailInput.trim().toLowerCase();
    const password = passwordInput.trim();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Correo inválido", {
        description:
          "Por favor ingresa una dirección de correo electrónico válida.",
        duration: 4000,
      });
      setLoading(false);
      return;
    }
    if (password.length < 8) {
      toast.error("Contraseña muy corta", {
        description: "La contraseña debe tener al menos 8 caracteres.",
        duration: 4000,
      });
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast.error("Credenciales incorrectas", {
          description:
            "El correo o la contraseña no son válidos. Verifica tus datos e intenta nuevamente.",
          duration: 5000,
        });
        console.error(error);
        setLoading(false);
        return;
      }

      if (data?.user) {
        // Guardar en ManagementStorage (legacy)
        ManagmentStorage.setItem("id_User", data.user.id);
        ManagmentStorage.setItem("email", data.user.email);

        // Guardar usuario en UserInfoStore
        UserInfoStore.getState().setUser(data.user);

        // Obtener roles del usuario y redirigir
        await getRolesAndRedirect(data.user.id);
      }
    } catch (err) {
      console.error(err);
      toast.error("Error inesperado", {
        description:
          "Ocurrió un problema al iniciar sesión. Por favor intenta nuevamente.",
        duration: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  /** Si queremos autenticar al usuario con Google */
  const signInAuth = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/autorizacion`,
          scopes: "https://www.googleapis.com/auth/calendar.events",
          queryParams: {
            // Fuerza el selector SIEMPRE
            prompt: "consent select_account",

            // para refresh_token
            access_type: "offline",

            // (Opcional) restringe/sugiere tu dominio educativo:
            // hd: "colegiojaimequijano.edu.co",
          },
        },
      });
      if (error) throw error;
    } catch (err) {
      setLoading(false);
      console.error(err);
      // aquí podrías mostrar un toast/alert
    }
  };

  /** Verificar si ya hay una sesión activa al cargar el componente */
  useEffect(() => {
    const checkSession = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        // Si hay sesión activa, redirigir según el rol
        if (session?.user) {
          setLoading(true);
          await getRolesAndRedirect(session.user.id);
        }
      } catch (error) {
        console.error("Error al verificar sesión:", error);
      }
    };

    checkSession();
  }, [supabase]);

  return (
    <section
      aria-label="Acceso a la plataforma educativa Incconection Kids"
      className="w-full max-w-md mx-auto animate-[fadeInSlide_1.5s_ease-out]"
    >
      <Card className="border-0 shadow-2xl bg-white/95 backdrop-blur-sm">
        <CardHeader className="space-y-4 pb-6">
          <div className="flex justify-center">
            <img
              src="/logos/logoIncconectionKids.png"
              alt="Logo de la institución"
              className="logoIncconection w-28 h-auto drop-shadow-md"
            />
            <span className="sr-only">{"Logo de la institución"}</span>
          </div>
          <div className="text-center space-y-2">
            <CardTitle className="text-2xl sm:text-3xl font-bold tracking-tight text-teal-700">
              {"Accede a tu cuenta"} :=
            </CardTitle>
            <CardDescription className="text-sm sm:text-base text-teal-600 font-medium">
              {"Bienvenido a tu plataforma educativa"}
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent>
          <form
            className="space-y-5"
            aria-describedby="form-ayuda"
            onSubmit={verifyUsersLogin}
          >
            {/* Campos de correo y contraseña */}
            <div className="space-y-2">
              <Label
                htmlFor="email"
                className="text-gray-700 text-sm font-semibold"
              >
                Correo electrónico
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="tucorreo@ejemplo.com"
                className="bg-white border-gray-300 focus:border-teal-500 focus:ring-teal-500/20 h-11"
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="password"
                className="text-gray-700 text-sm font-semibold"
              >
                Contraseña
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="bg-white border-gray-300 focus:border-teal-500 focus:ring-teal-500/20 pr-10 h-11"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-teal-600 hover:text-teal-700 transition-colors focus:outline-none disabled:opacity-50"
                  disabled={loading}
                  aria-label={
                    showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
                  }
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Botón de iniciar sesión con correo y contraseña */}
            <Button
              type="submit"
              aria-label="Iniciar sesión con correo y contraseña"
              className={cn(
                "w-full h-11 mt-2",
                "bg-gradient-to-r from-teal-600 to-teal-700 text-white font-semibold",
                "border-0 shadow-lg shadow-teal-500/30",
                "rounded-lg",
                "hover:from-teal-700 hover:to-teal-800 hover:shadow-xl hover:shadow-teal-500/40",
                "active:scale-[0.98]",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2",
                "transition-all duration-200 ease-out cursor-pointer",
                "disabled:opacity-70 disabled:cursor-not-allowed",
              )}
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                    ></path>
                  </svg>
                  <span className="ml-2">Iniciando sesión…</span>
                </span>
              ) : (
                "Iniciar sesión"
              )}
            </Button>

            {/* Separador */}
            {/* <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-3 text-gray-500 font-medium">
                  O continúa con
                </span>
              </div>
            </div> */}

            {/* Botón de Google */}
            {/* <Button
              type="button"
              aria-label="Ingresar con tu cuenta educativa Google"
              className={cn(
                "w-full h-11 font-semibold",
                "bg-white text-gray-700",
                "border-2 border-gray-300 shadow-md",
                "rounded-lg",
                "hover:bg-gray-50 hover:border-gray-400 hover:shadow-lg",
                "active:scale-[0.98]",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2",
                "transition-all duration-200 ease-out cursor-pointer",
                "disabled:opacity-70 disabled:cursor-not-allowed",
              )}
              onClick={signInAuth}
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="animate-spin h-5 w-5 text-gray-700"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                    ></path>
                  </svg>
                  <span className="ml-2">Conectando con Google…</span>
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <FcGoogle className="h-6 w-6" />
                  Iniciar con cuenta de la institución
                </span>
              )}
            </Button> */}
          </form>

          <div className="mt-6 space-y-3">
            <p id="form-ayuda" className="text-center text-sm">
              <Link
                href="/recuperar-contrasena"
                className="text-teal-600 hover:text-teal-700 font-medium transition-colors underline-offset-2 hover:underline"
              >
                {"Olvidé mi contraseña de incconection Kids"}
              </Link>
            </p>

            <div className="flex flex-col sm:flex-row gap-2 justify-center text-xs text-gray-600">
              <Link
                href="/politica-privacidad"
                className="text-teal-600 hover:text-teal-700 font-medium transition-colors underline-offset-2 hover:underline text-center"
              >
                Ver Política de Privacidad
              </Link>
              <span className="hidden sm:inline text-gray-400">|</span>
              <Link
                href="/terminos-y-condiciones"
                className="text-teal-600 hover:text-teal-700 font-medium transition-colors underline-offset-2 hover:underline text-center"
              >
                Ver Términos y Condiciones hajajajja
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
