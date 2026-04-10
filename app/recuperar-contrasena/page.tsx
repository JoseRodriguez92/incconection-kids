"use client";

import { useState } from "react";
import { sendRecoveryEmail } from "@/app/actions/send-recovery-email";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, ArrowLeft, CheckCircle, AlertCircle } from "lucide-react";
import Link from "next/link";

export default function RecuperarContraseñaPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleRecovery = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      const result = await sendRecoveryEmail(email);
      if (!result.success) {
        setError(result.error);
      } else {
        setSuccess(true);
      }
    } catch (err) {
      setError("Ocurrió un error inesperado. Por favor intenta nuevamente.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-[#0f0f24] via-[#1b1c3a] to-[#2d4a1a] relative overflow-hidden w-full">
      {/* Efectos de fondo animados */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#559c0d]/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/3 right-1/3 w-96 h-96 bg-[#1b1c3a]/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-[#3d6b0f]/10 rounded-full blur-3xl animate-pulse delay-700"></div>
      </div>

      {/* Columna izquierda - Imagen/Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative z-10 flex-col justify-center items-center p-12 text-white">
        <div className="max-w-lg space-y-8">
          {/* Logo/Icono grande */}
          <div className="flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-[#559c0d] to-[#3d6b0f] rounded-full blur-2xl opacity-40 animate-pulse"></div>
              <div className="relative bg-white/10 backdrop-blur-xl rounded-full p-8 border border-white/20">
                <Mail className="w-24 h-24 text-[#559c0d]" />
              </div>
            </div>
          </div>

          {/* Texto informativo */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-[#559c0d] bg-clip-text text-transparent">
              Recuperación de Contraseña
            </h1>
            <p className="text-xl text-white/80">
              Estamos aquí para ayudarte a recuperar el acceso a tu cuenta
            </p>
          </div>

          {/* Características */}
          <div className="space-y-4">
            <div className="flex items-start space-x-3 bg-white/5 backdrop-blur-sm p-4 rounded-lg border border-white/10">
              <div className="bg-[#559c0d]/20 rounded-full p-2">
                <svg
                  className="w-6 h-6 text-[#559c0d]"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-white">Proceso Seguro</h3>
                <p className="text-sm text-white/70">
                  Protegemos tu información en cada paso
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3 bg-white/5 backdrop-blur-sm p-4 rounded-lg border border-white/10">
              <div className="bg-[#559c0d]/20 rounded-full p-2">
                <svg
                  className="w-6 h-6 text-[#559c0d]"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-white">Rápido y Fácil</h3>
                <p className="text-sm text-white/70">
                  Recupera tu acceso en minutos
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3 bg-white/5 backdrop-blur-sm p-4 rounded-lg border border-white/10">
              <div className="bg-[#559c0d]/20 rounded-full p-2">
                <svg
                  className="w-6 h-6 text-[#559c0d]"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path>
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-white">Soporte 24/7</h3>
                <p className="text-sm text-white/70">
                  Estamos aquí para ayudarte
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Columna derecha - Formulario */}
      <div className="w-full lg:w-1/2 relative z-10 flex items-center justify-center p-4 lg:p-12">
        <Card className="w-full max-w-md border-0 shadow-2xl bg-white/95 backdrop-blur-xl">
          <CardHeader className="space-y-3 pb-6">
            <div className="flex justify-center mb-4">
              <div className="bg-gradient-to-br from-[#559c0d] to-[#3d6b0f] rounded-full p-3">
                <Mail className="w-8 h-8 text-white" />
              </div>
            </div>
            <CardTitle className="text-3xl font-bold text-center bg-gradient-to-r from-[#1b1c3a] to-[#559c0d] bg-clip-text text-transparent">
              Recuperar Contraseña
            </CardTitle>
            <p className="text-center text-muted-foreground text-sm">
              Ingresa tu correo para restablecer tu acceso
            </p>
          </CardHeader>

          <CardContent className="pb-8">
            {!success ? (
              <form onSubmit={handleRecovery} className="space-y-6">
                <div className="space-y-3">
                  <Label
                    htmlFor="email"
                    className="text-sm font-semibold text-gray-700"
                  >
                    Correo electrónico
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="correo@ejemplo.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={loading}
                      className="pl-10 h-12 text-base border-2 focus:border-[#559c0d] focus-visible:ring-[#559c0d] transition-all duration-200"
                    />
                  </div>
                  <div className="flex items-start space-x-2 bg-[#559c0d]/10 p-3 rounded-lg border border-[#559c0d]/30">
                    <div className="mt-0.5">
                      <svg
                        className="w-5 h-5 text-[#559c0d] flex-shrink-0"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                    </div>
                    <p className="text-sm text-[#1b1c3a]">
                      Ingresa tu correo y recibirás un enlace seguro para
                      restablecer tu contraseña
                    </p>
                  </div>
                </div>

                {error && (
                  <div className="flex items-start space-x-3 text-red-700 bg-red-50 p-4 rounded-lg border border-red-200">
                    <AlertCircle className="w-6 h-6 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-sm">Error</p>
                      <p className="text-sm mt-0.5">{error}</p>
                    </div>
                  </div>
                )}

                <div className="space-y-3 pt-2">
                  <Button
                    type="submit"
                    className="w-full h-12 text-base font-semibold bg-gradient-to-r from-[#559c0d] to-[#3d6b0f] hover:from-[#6bb10f] hover:to-[#4a7f11] shadow-lg hover:shadow-xl transition-all duration-200 text-white"
                    disabled={loading}
                  >
                    {loading ? (
                      <span className="flex items-center justify-center">
                        <svg
                          className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
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
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Enviando...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center">
                        <Mail className="w-5 h-5 mr-2" />
                        Enviar enlace de recuperación
                      </span>
                    )}
                  </Button>

                  <Link href="/" className="block">
                    <Button
                      type="button"
                      variant="ghost"
                      className="w-full h-12 text-base hover:bg-gray-100 transition-all duration-200"
                      disabled={loading}
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Volver al inicio de sesión
                    </Button>
                  </Link>
                </div>
              </form>
            ) : (
              <div className="space-y-6">
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="relative">
                    <div className="absolute inset-0 bg-[#559c0d]/20 rounded-full blur-2xl animate-pulse"></div>
                    <div className="relative bg-[#559c0d]/10 rounded-full p-6 border-2 border-[#559c0d]/30">
                      <CheckCircle className="w-20 h-20 text-[#559c0d]" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-2xl font-bold text-[#1b1c3a]">
                      ¡Correo enviado exitosamente!
                    </h3>
                    <p className="text-base text-gray-600">
                      Hemos enviado un enlace de recuperación a
                    </p>
                    <p className="text-lg font-semibold text-[#559c0d] bg-[#559c0d]/10 px-4 py-2 rounded-lg inline-block border border-[#559c0d]/30">
                      {email}
                    </p>
                  </div>

                  <div className="bg-[#1b1c3a]/5 border border-[#1b1c3a]/20 rounded-lg p-4 space-y-2 w-full">
                    <div className="flex items-center justify-center space-x-2 text-[#1b1c3a]">
                      <svg
                        className="w-5 h-5 flex-shrink-0"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                      </svg>
                      <p className="font-semibold text-sm">Importante</p>
                    </div>
                    <p className="text-sm text-[#1b1c3a]/80">
                      Revisa tu bandeja de entrada y también la carpeta de spam.
                      El enlace expirará en 1 hora.
                    </p>
                  </div>
                </div>

                <Link href="/" className="block">
                  <Button
                    variant="outline"
                    className="w-full h-12 text-base border-2 hover:bg-gray-50 transition-all duration-200"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Volver al inicio de sesión
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Texto de ayuda adicional - solo visible en móvil */}
        <p className="text-center text-white/80 text-sm mt-6 lg:hidden">
          ¿Necesitas más ayuda?{" "}
          <a
            href="#"
            className="text-[#559c0d] font-semibold hover:underline hover:text-[#6bb10f] transition-colors"
          >
            Contáctanos
          </a>
        </p>
      </div>
    </div>
  );
}
