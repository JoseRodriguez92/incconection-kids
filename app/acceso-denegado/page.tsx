"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShieldAlert, Home, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

export default function AccesoDenegado() {
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast.success("Sesión cerrada exitosamente");
      router.push("/");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
      toast.error("Error al cerrar sesión");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center p-4 w-full">
      <Card className="w-full max-w-md shadow-xl border-red-200">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
            <ShieldAlert className="w-10 h-10 text-red-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-red-800">
            Acceso Denegado
          </CardTitle>
          <CardDescription className="text-base">
            No tienes los permisos necesarios para acceder a esta página.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="rounded-lg bg-red-50 border border-red-200 p-4">
            <p className="text-sm text-red-800 leading-relaxed">
              Tu cuenta no tiene asignado el rol necesario para acceder a este
              módulo. Si crees que esto es un error, por favor contacta con el
              administrador del sistema.
            </p>
          </div>

          <div className="flex flex-col gap-3 pt-4">
            <Link href="/" className="w-full">
              <Button className="w-full gap-2" variant="default">
                <Home className="w-4 h-4" />
                Volver al inicio
              </Button>
            </Link>

            <Button
              className="w-full gap-2"
              variant="outline"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4" />
              Cerrar sesión
            </Button>
          </div>

          <div className="pt-4 text-center">
            <p className="text-xs text-muted-foreground">
              ¿Necesitas ayuda?{" "}
              <a
                href="mailto:soporte@incconection-kids.com"
                className="text-teal-600 hover:text-teal-700 font-medium hover:underline"
              >
                Contacta con soporte
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
