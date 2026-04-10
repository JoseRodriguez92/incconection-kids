"use server";

import { createClient } from "@supabase/supabase-js";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendRecoveryEmail(
  email: string,
): Promise<{ success: true } | { success: false; error: string }> {
  try {
    // 1. Cliente admin con service role (solo servidor)
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } },
    );

    // 2. Verificar que el email existe en profiles
    const { data: profile, error: profileErr } = await supabaseAdmin
      .from("profiles")
      .select("email")
      .eq("email", email)
      .maybeSingle();

    if (profileErr || !profile) {
      return {
        success: false,
        error:
          "No encontramos una cuenta asociada a este correo. Verifica que sea correcto.",
      };
    }

    // 3. Generar el link de recuperación con la API admin de Supabase
    // Apunta directo a la página de reset — recibe los tokens en el hash #access_token=...
    const redirectTo =
      process.env.NODE_ENV === "development"
        ? "http://localhost:3002/auth/reset-password"
        : "https://jaimequijano.incconection-kids.com/auth/reset-password";

    const { data: linkData, error: linkErr } =
      await supabaseAdmin.auth.admin.generateLink({
        type: "recovery",
        email,
        options: { redirectTo },
      });

    if (linkErr || !linkData?.properties?.hashed_token) {
      console.error("[sendRecoveryEmail] generateLink error:", linkErr);
      return {
        success: false,
        error: "No se pudo generar el enlace de recuperación.",
      };
    }

    // Construimos el link apuntando a NUESTRA página (no al endpoint de Supabase).
    // Así los email scanners (Gmail, Outlook, etc.) solo cargan HTML estático y
    // NO consumen el token. El token se consume únicamente cuando el usuario
    // llega y el JS llama a verifyOtp().
    const recoveryLink = `${redirectTo}?token_hash=${linkData.properties.hashed_token}&type=recovery`;
    const schoolName = process.env.SMTP_FROM_NAME ?? "Incconection Kids";
    const from = `"${schoolName}" <${process.env.SMTP_USER}>`;

    // 4. Enviar con Nodemailer
    await transporter.sendMail({
      from,
      to: email,
      subject: "Recuperación de contraseña — Incconection Kids",
      html: `
<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background-color:#0f1020;font-family:Arial,Helvetica,sans-serif;">

  <!-- Wrapper -->
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0f1020;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="520" cellpadding="0" cellspacing="0" style="max-width:520px;width:100%;">

          <!-- Header con degradado verde -->
          <tr>
            <td style="background:linear-gradient(135deg,#1b1c3a 0%,#2d4a1a 60%,#3d6b0f 100%);border-radius:16px 16px 0 0;padding:36px 32px 28px;text-align:center;">
              <img
                src="https://jaimequijano.incconection-kids.com/logos/jqc_logo.png"
                alt="${schoolName}"
                width="90"
                style="display:block;margin:0 auto 20px;border-radius:12px;box-shadow:0 4px 20px rgba(0,0,0,0.4);"
              />
              <h1 style="margin:0 0 6px;font-size:22px;font-weight:700;color:#ffffff;letter-spacing:-0.3px;">
                Recuperación de contraseña
              </h1>
              <p style="margin:0;font-size:13px;color:#a8c490;">
                ${schoolName}
              </p>
            </td>
          </tr>

          <!-- Cuerpo blanco -->
          <tr>
            <td style="background:#ffffff;padding:32px;">

              <!-- Icono candado -->
              <div style="text-align:center;margin-bottom:24px;">
                <div style="display:inline-block;background:#f0f7e8;border:2px solid #c6e5a0;border-radius:50%;width:60px;height:60px;line-height:60px;font-size:28px;">
                  🔒
                </div>
              </div>

              <p style="margin:0 0 10px;font-size:16px;font-weight:700;color:#1b1c3a;text-align:center;">
                ¿Olvidaste tu contraseña?
              </p>
              <p style="margin:0 0 24px;font-size:14px;color:#6b7280;text-align:center;line-height:1.6;">
                Recibimos una solicitud para restablecer la contraseña de tu cuenta.<br/>
                Haz clic en el botón de abajo para crear una nueva.
              </p>

              <!-- Botón CTA -->
              <div style="text-align:center;margin-bottom:28px;">
                <a href="${recoveryLink}"
                   style="display:inline-block;background:linear-gradient(135deg,#559c0d,#3d6b0f);color:#ffffff;text-decoration:none;font-weight:700;font-size:15px;padding:15px 40px;border-radius:10px;box-shadow:0 4px 14px rgba(85,156,13,0.4);letter-spacing:0.2px;">
                  Restablecer contraseña
                </a>
              </div>

              <!-- Aviso de expiración -->
              <div style="background:#fefce8;border:1px solid #fde68a;border-radius:8px;padding:12px 16px;text-align:center;margin-bottom:0;">
                <p style="margin:0;font-size:13px;color:#92400e;">
                  ⏱ Este enlace expira en <strong>1 hora</strong>
                </p>
              </div>
            </td>
          </tr>

          <!-- Divisor verde -->
          <tr>
            <td style="height:4px;background:linear-gradient(90deg,#559c0d,#3d6b0f,#1b1c3a);"></td>
          </tr>

          <!-- Footer oscuro -->
          <tr>
            <td style="background:#1b1c3a;border-radius:0 0 16px 16px;padding:20px 32px;text-align:center;">
              <p style="margin:0 0 6px;font-size:12px;color:#9ca3af;line-height:1.6;">
                Si no solicitaste este cambio, puedes ignorar este correo.<br/>Tu contraseña no será modificada.
              </p>
              <p style="margin:0;font-size:12px;color:#6b7280;">
                © ${new Date().getFullYear()} <strong style="color:#a8c490;">${schoolName}</strong>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

</body>
</html>
      `,
    });

    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error desconocido";
    console.error("[sendRecoveryEmail]", message);
    return { success: false, error: message };
  }
}
