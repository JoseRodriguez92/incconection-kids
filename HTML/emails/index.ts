// ── Template principal para circulares del colegio ───────────────────────────
// Uso: circularTemplate({ content: htmlDelEditor, schoolName: "...", logoUrl: "..." })
// El `content` es el HTML generado por el editor rich-text del formulario.

export type CircularTemplateParams = {
  /** HTML del cuerpo del mensaje (desde el editor rich-text) */
  content: string;
  /** Nombre del colegio. Por defecto usa el de .env o "Colegio" */
  schoolName?: string;
  /** URL pública del logo del colegio. Si no se pasa, se muestra solo el nombre. */
  logoUrl?: string;
};

export function circularTemplate({
  content,
  schoolName = "Colegio",
}: CircularTemplateParams): string {
  const logoHtml = `<img src="https://jaimequijano.incconection-kids.com/logos/jqc_logo.png" alt="${schoolName}" width="250" height="85"
           style="display:block; margin:0 auto 12px; object-fit:cover;" />`;

  // Paleta del escudo del colegio: azul marino (#1a2f6e) + dorado (#C9A227)
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${schoolName}</title>
</head>
<body style="margin:0; padding:0; background-color:#eef0f5; font-family:Arial,Helvetica,sans-serif;">

  <table width="100%" cellpadding="0" cellspacing="0" role="presentation"
         style="background-color:#eef0f5; padding:32px 16px;">
    <tr>
      <td align="center">

        <!-- Tarjeta principal (máx 600px) -->
        <table width="600" cellpadding="0" cellspacing="0" role="presentation"
               style="max-width:600px; width:100%; background-color:#ffffff;
                      border-radius:12px; overflow:hidden;
                      box-shadow:0 4px 20px rgba(26,47,110,0.15);">

          <!-- ── Franja dorada superior (acento) ──────────────────────── -->
          <tr>
            <td style="background-color:#C9A227; height:5px; font-size:0; line-height:0;">
              &nbsp;
            </td>
          </tr>

          <!-- ── Cabecera azul marino ───────────────────────────────────── -->
          <tr>
            <td align="center"
                style="background: linear-gradient(160deg, #1a2f6e 0%, #243d8a 100%);
                       padding:30px 32px 26px;">
              ${logoHtml}
              <h1 style="margin:0; color:#ffffff; font-size:20px; font-weight:700;
                         letter-spacing:0.4px; line-height:1.3;">
                ${schoolName}
              </h1>
              <p style="margin:8px 0 0; color:#C9A227; font-size:11px;
                        text-transform:uppercase; letter-spacing:2px; font-weight:600;">
                ✦ Comunicado Oficial ✦
              </p>
            </td>
          </tr>

          <!-- ── Separador dorado ───────────────────────────────────────── -->
          <tr>
            <td style="background: linear-gradient(90deg, #1a2f6e, #C9A227, #1a2f6e);
                       height:3px; font-size:0; line-height:0;">
              &nbsp;
            </td>
          </tr>

          <!-- ── Contenido del mensaje ──────────────────────────────────── -->
          <tr>
            <td style="padding:36px 40px 32px;">
              <div style="color:#1f2937; font-size:15px; line-height:1.8;">
                ${content}
              </div>
            </td>
          </tr>

          <!-- ── Separador fino ─────────────────────────────────────────── -->
          <tr>
            <td style="padding:0 40px;">
              <hr style="border:none; border-top:1px solid #dde1ee; margin:0;" />
            </td>
          </tr>

          <!-- ── Pie de página ──────────────────────────────────────────── -->
          <tr>
            <td align="center"
                style="background-color:#f4f6fb; padding:22px 32px 26px;">
              <p style="margin:0; color:#1a2f6e; font-size:13px; font-weight:700;
                        letter-spacing:0.3px;">
                ${schoolName}
              </p>
              <p style="margin:6px 0 0; color:#8892b0; font-size:11px; line-height:1.6;">
                Este mensaje fue enviado a través del sistema institucional.<br />
                Por favor no responda directamente a este correo.
              </p>
              <!-- Franja dorada inferior -->
              <div style="margin-top:16px; height:2px;
                          background: linear-gradient(90deg, transparent, #C9A227, transparent);">
              </div>
            </td>
          </tr>

        </table>
        <!-- fin tarjeta -->

      </td>
    </tr>
  </table>

</body>
</html>`;
}
