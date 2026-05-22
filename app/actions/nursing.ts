"use server";

import { createClient } from "@/lib/supabase/server";
import { sendEmail } from "./send-email";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface NursingMedication {
  medication_name: string;
  dosage: string;
  route: string;
}

export interface CreateVisitParams {
  student_enrolled_id: string;
  student_user_id: string;   // profiles.id del estudiante
  student_name: string;
  academic_period_id: string;
  reason: string;
  symptoms?: string;
  diagnosis?: string;
  treatment?: string;
  temperature?: number;
  blood_pressure?: string;
  heart_rate?: number;
  weight_kg?: number;
  status: "atendido" | "en_observacion" | "remitido" | "enviado_a_casa";
  notes?: string;
  medications?: NursingMedication[];
  notify_parent: boolean;
  institute_name: string;
  institute_phone?: string | null;
  institute_address?: string | null;
  institute_city?: string | null;
}

export type CreateVisitResult =
  | { success: true; visitId: string; notified: boolean; parentEmails: string[] }
  | { success: false; error: string };

// ── Crear visita + notificar ──────────────────────────────────────────────────

export async function createNurseVisit(
  params: CreateVisitParams,
): Promise<CreateVisitResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "No autenticado" };

  // 1. Insertar visita
  const { data: visit, error: visitErr } = await supabase
    .from("nurse_visit")
    .insert({
      student_enrolled_id: params.student_enrolled_id,
      nurse_id: user.id,
      academic_period_id: params.academic_period_id,
      visit_date: new Date().toISOString(),
      reason: params.reason,
      symptoms: params.symptoms || null,
      diagnosis: params.diagnosis || null,
      treatment: params.treatment || null,
      temperature: params.temperature || null,
      blood_pressure: params.blood_pressure || null,
      heart_rate: params.heart_rate || null,
      weight_kg: params.weight_kg || null,
      status: params.status,
      notes: params.notes || null,
      parent_notified: false,
    })
    .select("id")
    .single();

  if (visitErr) return { success: false, error: visitErr.message };

  // 2. Insertar medicamentos aplicados
  if (params.medications && params.medications.length > 0) {
    await supabase.from("nurse_visit_medication").insert(
      params.medications.map((m) => ({
        visit_id: visit.id,
        medication_name: m.medication_name,
        dosage: m.dosage,
        route: m.route,
        administered_at: new Date().toISOString(),
      })),
    );
  }

  // 3. Notificar al padre si se solicitó
  let notified = false;
  let parentEmails: string[] = [];

  if (params.notify_parent) {
    const { data: parentRows } = await supabase
      .from("parent_has_student")
      .select("parent_id")
      .eq("student_id", params.student_user_id);

    const parentIds = (parentRows ?? [])
      .map((r: any) => r.parent_id)
      .filter(Boolean);

    if (parentIds.length > 0) {
      const { data: profiles } = await supabase
        .from("profiles")
        .select("email, full_name")
        .in("id", parentIds);

      parentEmails = (profiles ?? [])
        .map((p: any) => p.email)
        .filter(Boolean);

      if (parentEmails.length > 0) {
        const now = new Date().toLocaleString("es-CO", {
          day: "2-digit",
          month: "long",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });

        const result = await sendEmail({
          bcc: parentEmails,
          subject: `⚕️ Atención en enfermería — ${params.student_name}`,
          html: buildNursingEmail({
            studentName: params.student_name,
            instituteName: params.institute_name,
            visitDate: now,
            reason: params.reason,
            diagnosis: params.diagnosis,
            treatment: params.treatment,
            status: params.status,
            temperature: params.temperature,
            notes: params.notes,
            institutePhone: params.institute_phone,
            instituteAddress: params.institute_address,
            instituteCity: params.institute_city,
          }),
          fromName: params.institute_name,
          skipTemplate: true,
        });

        if (result.success) {
          notified = true;
          await supabase
            .from("nurse_visit")
            .update({
              parent_notified: true,
              parent_notified_at: new Date().toISOString(),
            })
            .eq("id", visit.id);
        }
      }
    }
  }

  return { success: true, visitId: visit.id, notified, parentEmails };
}

// ── Guardar / actualizar perfil de salud ──────────────────────────────────────

export async function upsertHealthProfile(data: {
  student_enrolled_id: string;
  blood_type?: string;
  allergies?: string[];
  chronic_conditions?: string;
  insurance_provider?: string;
  insurance_number?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  notes?: string;
}) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("student_health_profile")
    .upsert(data, { onConflict: "student_enrolled_id" });
  if (error) return { success: false, error: error.message };
  return { success: true };
}

// ── Email HTML ────────────────────────────────────────────────────────────────

const STATUS_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  atendido:       { label: "✅ Atendido — regresa a clases", color: "#15803d", bg: "#dcfce7" },
  en_observacion: { label: "👁️ En observación en enfermería", color: "#92400e", bg: "#fef3c7" },
  remitido:       { label: "🏥 Remitido a médico / clínica", color: "#b91c1c", bg: "#fee2e2" },
  enviado_a_casa: { label: "🏠 Enviado a casa", color: "#7c3aed", bg: "#ede9fe" },
};

function buildNursingEmail(p: {
  studentName: string;
  instituteName: string;
  visitDate: string;
  reason: string;
  diagnosis?: string;
  treatment?: string;
  status: string;
  temperature?: number;
  notes?: string;
  institutePhone?: string | null;
  instituteAddress?: string | null;
  instituteCity?: string | null;
}): string {
  const st = STATUS_LABELS[p.status] ?? { label: p.status, color: "#1e293b", bg: "#f1f5f9" };
  const isUrgent = p.status === "remitido" || p.status === "enviado_a_casa";

  const contactLine = p.institutePhone ?? "";
  const addressLine = [p.instituteAddress, p.instituteCity].filter(Boolean).join(", ");

  return `<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:28px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

        <!-- Franja de acento superior -->
        <tr>
          <td style="background:${isUrgent ? "#dc2626" : "#0d9488"};height:6px;font-size:0;line-height:0;">&nbsp;</td>
        </tr>

        <!-- Header limpio -->
        <tr>
          <td style="padding:28px 32px 20px;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td>
                  <p style="margin:0;font-size:11px;font-weight:700;color:${isUrgent ? "#dc2626" : "#0d9488"};text-transform:uppercase;letter-spacing:1.5px;">
                    ${isUrgent ? "🚨 Alerta Urgente" : "⚕️ Enfermería"}
                  </p>
                  <h1 style="margin:4px 0 0;font-size:22px;font-weight:800;color:#0f172a;line-height:1.2;">
                    ${isUrgent ? "Tu hijo/a necesita atención" : "Resumen de atención médica"}
                  </h1>
                  <p style="margin:6px 0 0;font-size:13px;color:#64748b;">${p.instituteName} · ${p.visitDate}</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Separador -->
        <tr><td style="padding:0 32px;"><div style="height:1px;background:#e2e8f0;"></div></td></tr>

        <!-- Estudiante + estado -->
        <tr>
          <td style="padding:20px 32px;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border-radius:10px;overflow:hidden;">
              <tr>
                <td style="padding:16px 20px;">
                  <p style="margin:0 0 2px;font-size:11px;font-weight:600;color:#94a3b8;text-transform:uppercase;letter-spacing:1px;">Estudiante atendido/a</p>
                  <p style="margin:0;font-size:19px;font-weight:700;color:#0f172a;">${p.studentName}</p>
                </td>
                <td style="padding:16px 20px;text-align:right;vertical-align:middle;">
                  <div style="display:inline-block;background:${st.bg};color:${st.color};padding:7px 14px;border-radius:20px;font-size:12px;font-weight:700;white-space:nowrap;">
                    ${st.label}
                  </div>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Detalles de la atención -->
        <tr>
          <td style="padding:0 32px 20px;">
            <table width="100%" cellpadding="0" cellspacing="0">

              <tr>
                <td style="padding:0 0 14px;">
                  <p style="margin:0 0 3px;font-size:10px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:1px;">Motivo de consulta</p>
                  <p style="margin:0;font-size:14px;color:#1e293b;font-weight:500;">${p.reason}</p>
                </td>
              </tr>

              ${p.temperature ? `
              <tr>
                <td style="padding:0 0 14px;">
                  <p style="margin:0 0 3px;font-size:10px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:1px;">Temperatura</p>
                  <p style="margin:0;font-size:14px;color:${p.temperature >= 38 ? "#dc2626" : "#1e293b"};font-weight:600;">
                    ${p.temperature}°C${p.temperature >= 38 ? " — ⚠️ Fiebre detectada" : ""}
                  </p>
                </td>
              </tr>` : ""}

              ${p.diagnosis ? `
              <tr>
                <td style="padding:0 0 14px;">
                  <p style="margin:0 0 3px;font-size:10px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:1px;">Diagnóstico / Observación</p>
                  <p style="margin:0;font-size:14px;color:#334155;">${p.diagnosis}</p>
                </td>
              </tr>` : ""}

              ${p.treatment ? `
              <tr>
                <td style="padding:0 0 14px;">
                  <p style="margin:0 0 3px;font-size:10px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:1px;">Tratamiento aplicado</p>
                  <p style="margin:0;font-size:14px;color:#334155;">${p.treatment}</p>
                </td>
              </tr>` : ""}

              ${p.notes ? `
              <tr>
                <td style="padding:0 0 14px;">
                  <p style="margin:0 0 3px;font-size:10px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:1px;">Observaciones adicionales</p>
                  <p style="margin:0;font-size:14px;color:#334155;">${p.notes}</p>
                </td>
              </tr>` : ""}

            </table>
          </td>
        </tr>

        ${isUrgent ? `
        <!-- Alerta urgente -->
        <tr>
          <td style="padding:0 32px 20px;">
            <div style="background:#fef2f2;border-left:4px solid #dc2626;border-radius:0 8px 8px 0;padding:14px 18px;">
              <p style="margin:0;font-size:13px;color:#991b1b;font-weight:700;">
                ⚠️ Acción requerida
              </p>
              <p style="margin:6px 0 0;font-size:13px;color:#991b1b;line-height:1.5;">
                Por favor comuníquese con la institución o acérquese al colegio a la mayor brevedad posible.
                ${contactLine ? `Puede llamarnos al <strong>${contactLine}</strong>.` : ""}
              </p>
            </div>
          </td>
        </tr>` : ""}

        <!-- Separador -->
        <tr><td style="padding:0 32px;"><div style="height:1px;background:#e2e8f0;"></div></td></tr>

        <!-- Contacto institucional -->
        <tr>
          <td style="padding:20px 32px;">
            <p style="margin:0 0 8px;font-size:11px;font-weight:700;color:#475569;text-transform:uppercase;letter-spacing:1px;">
              ¿Tiene dudas? Contáctenos
            </p>
            <table width="100%" cellpadding="0" cellspacing="0">
              ${contactLine ? `
              <tr>
                <td style="padding:0 0 4px;">
                  <p style="margin:0;font-size:13px;color:#1e293b;">
                    📞 <strong>${contactLine}</strong>
                  </p>
                </td>
              </tr>` : ""}
              ${addressLine ? `
              <tr>
                <td style="padding:0 0 4px;">
                  <p style="margin:0;font-size:13px;color:#64748b;">
                    📍 ${addressLine}
                  </p>
                </td>
              </tr>` : ""}
              <tr>
                <td>
                  <p style="margin:4px 0 0;font-size:12px;color:#64748b;">
                    Puede comunicarse directamente con la dirección o coordinación académica del colegio.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#f8fafc;border-top:1px solid #e2e8f0;padding:16px 32px;text-align:center;">
            <p style="margin:0;font-size:11px;color:#94a3b8;line-height:1.6;">
              Mensaje generado automáticamente por el sistema de enfermería de <strong>${p.instituteName}</strong>.<br>
              Por favor no responda directamente a este correo.
            </p>
          </td>
        </tr>

        <!-- Franja inferior -->
        <tr>
          <td style="background:${isUrgent ? "#dc2626" : "#0d9488"};height:4px;font-size:0;line-height:0;">&nbsp;</td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}
