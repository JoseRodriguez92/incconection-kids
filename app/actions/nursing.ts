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
          }),
          fromName: params.institute_name,
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
}): string {
  const st = STATUS_LABELS[p.status] ?? { label: p.status, color: "#1e293b", bg: "#f1f5f9" };
  const isUrgent = p.status === "remitido" || p.status === "enviado_a_casa";

  return `<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f0fdf4;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0fdf4;padding:32px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

        <!-- Header -->
        <tr>
          <td style="background:${isUrgent ? "#dc2626" : "#0d9488"};padding:28px 32px;text-align:center;">
            <div style="font-size:36px;margin-bottom:8px;">${isUrgent ? "🚨" : "⚕️"}</div>
            <h1 style="margin:0;color:#fff;font-size:20px;font-weight:700;letter-spacing:0.5px;">
              ${isUrgent ? "ATENCIÓN URGENTE —" : "Notificación de"} Enfermería
            </h1>
            <p style="margin:4px 0 0;color:rgba(255,255,255,0.85);font-size:13px;">
              ${p.instituteName}
            </p>
          </td>
        </tr>

        <!-- Student info -->
        <tr>
          <td style="padding:28px 32px 0;">
            <p style="margin:0 0 4px;font-size:11px;font-weight:600;color:#6b7280;text-transform:uppercase;letter-spacing:1px;">
              Estudiante atendido/a
            </p>
            <h2 style="margin:0 0 4px;font-size:22px;font-weight:700;color:#0f172a;">
              ${p.studentName}
            </h2>
            <p style="margin:0;font-size:12px;color:#6b7280;">${p.visitDate}</p>
          </td>
        </tr>

        <!-- Status badge -->
        <tr>
          <td style="padding:16px 32px 0;">
            <div style="display:inline-block;background:${st.bg};color:${st.color};padding:10px 18px;border-radius:8px;font-size:14px;font-weight:700;border:1.5px solid ${st.color}30;">
              ${st.label}
            </div>
          </td>
        </tr>

        <!-- Details -->
        <tr>
          <td style="padding:24px 32px;">
            <table width="100%" cellpadding="0" cellspacing="0">

              <tr>
                <td style="padding:0 0 16px;">
                  <p style="margin:0 0 4px;font-size:11px;font-weight:600;color:#6b7280;text-transform:uppercase;letter-spacing:1px;">Motivo de consulta</p>
                  <p style="margin:0;font-size:15px;color:#1e293b;font-weight:500;">${p.reason}</p>
                </td>
              </tr>

              ${p.temperature ? `
              <tr>
                <td style="padding:0 0 16px;">
                  <p style="margin:0 0 4px;font-size:11px;font-weight:600;color:#6b7280;text-transform:uppercase;letter-spacing:1px;">Temperatura registrada</p>
                  <p style="margin:0;font-size:15px;color:${p.temperature >= 38 ? "#dc2626" : "#1e293b"};font-weight:600;">
                    ${p.temperature}°C ${p.temperature >= 38 ? "⚠️ Fiebre" : ""}
                  </p>
                </td>
              </tr>` : ""}

              ${p.diagnosis ? `
              <tr>
                <td style="padding:0 0 16px;">
                  <p style="margin:0 0 4px;font-size:11px;font-weight:600;color:#6b7280;text-transform:uppercase;letter-spacing:1px;">Diagnóstico / Observación</p>
                  <p style="margin:0;font-size:14px;color:#334155;">${p.diagnosis}</p>
                </td>
              </tr>` : ""}

              ${p.treatment ? `
              <tr>
                <td style="padding:0 0 16px;">
                  <p style="margin:0 0 4px;font-size:11px;font-weight:600;color:#6b7280;text-transform:uppercase;letter-spacing:1px;">Tratamiento aplicado</p>
                  <p style="margin:0;font-size:14px;color:#334155;">${p.treatment}</p>
                </td>
              </tr>` : ""}

              ${p.notes ? `
              <tr>
                <td style="padding:0 0 16px;">
                  <p style="margin:0 0 4px;font-size:11px;font-weight:600;color:#6b7280;text-transform:uppercase;letter-spacing:1px;">Observaciones adicionales</p>
                  <p style="margin:0;font-size:14px;color:#334155;">${p.notes}</p>
                </td>
              </tr>` : ""}

            </table>

            ${isUrgent ? `
            <div style="background:#fef2f2;border:1.5px solid #fca5a5;border-radius:8px;padding:16px;margin-top:8px;">
              <p style="margin:0;font-size:14px;color:#991b1b;font-weight:600;">
                ⚠️ Por favor comuníquese con la institución o dirígase al colegio para mayor información.
              </p>
            </div>` : ""}
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#f8fafc;border-top:1px solid #e2e8f0;padding:20px 32px;text-align:center;">
            <p style="margin:0;font-size:12px;color:#94a3b8;">
              Este mensaje fue generado automáticamente por el sistema de enfermería de
              <strong>${p.instituteName}</strong>.<br>
              Si tiene alguna duda, comuníquese directamente con la institución.
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}
