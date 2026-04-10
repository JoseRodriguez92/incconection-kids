"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Lock, CheckCircle, AlertCircle, Eye, EyeOff } from "lucide-react";

// ── Inner component (needs useSearchParams → must be inside Suspense) ─────────
function ResetPasswordInner() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type");

  // null = verificando, true = ok, false = error/expirado
  const [verified, setVerified] = useState<boolean | null>(null);
  const [verifyError, setVerifyError] = useState<string | null>(null);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formError, setFormError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [countdown, setCountdown] = useState(10);

  // ── 1. Verificar el token al montar ──────────────────────────────────────────
  // Usamos verifyOtp con token_hash (NO action_link) para que los email scanners
  // (Gmail, Outlook…) no consuman el token al hacer prefetch del correo.
  // Los scanners hacen GET del URL pero no ejecutan JS → token intacto.
  useEffect(() => {
    if (!tokenHash || type !== "recovery") {
      setVerified(false);
      setVerifyError("El enlace de recuperación es inválido o está incompleto.");
      return;
    }

    const supabase = createClient();
    supabase.auth
      .verifyOtp({ token_hash: tokenHash, type: "recovery" })
      .then(({ error }) => {
        if (error) {
          setVerified(false);
          setVerifyError(
            error.message.toLowerCase().includes("expired") ||
              error.message.toLowerCase().includes("invalid")
              ? "El enlace ha expirado o ya fue utilizado. Solicita uno nuevo."
              : error.message,
          );
        } else {
          setVerified(true);
        }
      });
  }, [tokenHash, type]);

  // ── 2. Contador regresivo cuando hay error ────────────────────────────────────
  useEffect(() => {
    if (verified !== false) return;
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          router.push("/");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [verified, router]);

  // ── 3. Cambiar contraseña ─────────────────────────────────────────────────────
  const handleResetPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError("");

    if (password.length < 6) {
      setFormError("La contraseña debe tener al menos 6 caracteres");
      return;
    }
    if (password !== confirmPassword) {
      setFormError("Las contraseñas no coinciden");
      return;
    }

    setLoading(true);
    try {
      const supabase = createClient();
      const { error: updateError } = await supabase.auth.updateUser({
        password,
      });

      if (updateError) {
        setFormError(updateError.message);
      } else {
        setSuccess(true);
        setTimeout(async () => {
          await supabase.auth.signOut();
          router.push("/");
        }, 3000);
      }
    } catch {
      setFormError("Ocurrió un error inesperado. Por favor intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-[#0f0f24] via-[#1b1c3a] to-[#2d4a1a] relative overflow-hidden p-4 w-full">
      {/* Fondo animado */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#559c0d]/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/3 right-1/3 w-96 h-96 bg-[#1b1c3a]/30 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-[#3d6b0f]/10 rounded-full blur-3xl animate-pulse delay-700" />
      </div>

      <Card className="w-full max-w-md border-0 shadow-2xl bg-white/95 backdrop-blur-xl relative z-10">
        <CardHeader className="space-y-3 pb-6">
          <div className="flex justify-center mb-4">
            <div className="relative">
              <div className="absolute inset-0 bg-linear-to-r from-[#559c0d] to-[#3d6b0f] rounded-full blur-2xl opacity-40 animate-pulse" />
              <div className="relative bg-linear-to-br from-[#559c0d] to-[#3d6b0f] rounded-full p-3 border border-white/20">
                <Lock className="w-8 h-8 text-white" />
              </div>
            </div>
          </div>
          <CardTitle className="text-3xl font-bold text-center bg-linear-to-r from-[#1b1c3a] to-[#559c0d] bg-clip-text text-transparent">
            Nueva Contraseña
          </CardTitle>
          <p className="text-center text-muted-foreground text-sm">
            Crea una contraseña segura para tu cuenta
          </p>
        </CardHeader>

        <CardContent className="pb-8">
          {/* ── Verificando ── */}
          {verified === null && (
            <div className="flex flex-col items-center justify-center py-14 gap-4">
              <svg
                className="w-10 h-10 animate-spin text-[#559c0d]"
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
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              <p className="text-sm text-muted-foreground">
                Verificando enlace...
              </p>
            </div>
          )}

          {/* ── Expirado / inválido ── */}
          {verified === false && (
            <div className="space-y-6">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-red-500/20 rounded-full blur-2xl animate-pulse" />
                  <div className="relative bg-red-50 rounded-full p-6 border-2 border-red-200">
                    <AlertCircle className="w-20 h-20 text-red-600" />
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-2xl font-bold text-[#1b1c3a]">
                    ¡Enlace inválido!
                  </h3>
                  <p className="text-base text-gray-600">
                    {verifyError ??
                      "El enlace de recuperación ha expirado o ya fue utilizado."}
                  </p>
                </div>

                <div className="bg-red-50 border border-red-200 rounded-lg p-4 w-full">
                  <div className="flex items-start space-x-2 text-red-700">
                    <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-semibold">Por favor intenta de nuevo</p>
                      <p className="mt-1">
                        Solicita un nuevo enlace desde la página de inicio de
                        sesión.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-[#1b1c3a]/5 border border-[#1b1c3a]/20 rounded-lg p-4 w-full">
                  <div className="flex items-center justify-center space-x-2 text-[#1b1c3a]">
                    <svg
                      className="w-5 h-5 shrink-0 animate-spin"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    <p className="font-semibold text-sm">
                      Redirigiendo en {countdown} segundos...
                    </p>
                  </div>
                  <p className="text-sm text-[#1b1c3a]/80 text-center mt-1">
                    Serás redirigido automáticamente al inicio de sesión
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ── Formulario ── */}
          {verified === true && !success && (
            <form onSubmit={handleResetPassword} className="space-y-6">
              <div className="space-y-3">
                <Label
                  htmlFor="password"
                  className="text-sm font-semibold text-gray-700"
                >
                  Nueva contraseña
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 z-10" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Ingresa tu nueva contraseña"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading}
                    minLength={6}
                    className="pl-10 pr-10 h-12 text-base border-2 focus:border-[#559c0d] focus-visible:ring-[#559c0d] transition-all duration-200"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors z-10"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
                <div className="flex items-start space-x-2 bg-[#559c0d]/10 p-3 rounded-lg border border-[#559c0d]/30">
                  <svg
                    className="w-5 h-5 text-[#559c0d] shrink-0 mt-0.5"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-sm text-[#1b1c3a]">
                    La contraseña debe tener al menos 6 caracteres
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <Label
                  htmlFor="confirmPassword"
                  className="text-sm font-semibold text-gray-700"
                >
                  Confirmar contraseña
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 z-10" />
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirma tu nueva contraseña"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    disabled={loading}
                    minLength={6}
                    className="pl-10 pr-10 h-12 text-base border-2 focus:border-[#559c0d] focus-visible:ring-[#559c0d] transition-all duration-200"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors z-10"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              {formError && (
                <div className="flex items-start space-x-3 text-red-700 bg-red-50 p-4 rounded-lg border border-red-200">
                  <AlertCircle className="w-6 h-6 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-sm">Error</p>
                    <p className="text-sm mt-0.5">{formError}</p>
                  </div>
                </div>
              )}

              <div className="pt-2">
                <Button
                  type="submit"
                  className="w-full h-12 text-base font-semibold bg-linear-to-r from-[#559c0d] to-[#3d6b0f] hover:from-[#6bb10f] hover:to-[#4a7f11] shadow-lg hover:shadow-xl transition-all duration-200 text-white"
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
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Actualizando contraseña...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center">
                      <Lock className="w-5 h-5 mr-2" />
                      Restablecer contraseña
                    </span>
                  )}
                </Button>
              </div>
            </form>
          )}

          {/* ── Éxito ── */}
          {success && (
            <div className="space-y-6">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-[#559c0d]/20 rounded-full blur-2xl animate-pulse" />
                  <div className="relative bg-[#559c0d]/10 rounded-full p-6 border-2 border-[#559c0d]/30">
                    <CheckCircle className="w-20 h-20 text-[#559c0d]" />
                  </div>
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold text-[#1b1c3a]">
                    ¡Contraseña actualizada!
                  </h3>
                  <p className="text-base text-gray-600">
                    Tu contraseña ha sido restablecida exitosamente
                  </p>
                </div>
                <div className="bg-[#1b1c3a]/5 border border-[#1b1c3a]/20 rounded-lg p-4 w-full">
                  <p className="font-semibold text-sm text-[#1b1c3a] text-center">
                    Redirigiendo al inicio de sesión...
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ── Default export envuelto en Suspense (requerido por useSearchParams) ────────
export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-[#0f0f24] via-[#1b1c3a] to-[#2d4a1a]">
          <div className="w-10 h-10 border-4 border-white/20 border-t-white rounded-full animate-spin" />
        </div>
      }
    >
      <ResetPasswordInner />
    </Suspense>
  );
}
