"use server";

import fs from "fs";
import path from "path";
import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { renderToBuffer } from "@react-pdf/renderer";
import React from "react";
import {
  StudentsReportPDF,
  type StudentRow,
} from "@/components/principal/SuperAdmin/reports/pdf/StudentsReportPDF";
import {
  AttendanceReportPDF,
  type AttendanceSummaryRow,
  type AttendanceDetailRow,
} from "@/components/principal/SuperAdmin/reports/pdf/AttendanceReportPDF";
import {
  GradesReportPDF,
  type GradeRow,
} from "@/components/principal/SuperAdmin/reports/pdf/GradesReportPDF";
import {
  GradesGroupReportPDF,
  type GroupGradeRow,
} from "@/components/principal/SuperAdmin/reports/pdf/GradesGroupReportPDF";
import {
  REPORT_CONFIG_DEFAULTS,
  type StudentsReportConfig,
  type AttendanceReportConfig,
  type GradesReportConfig,
} from "@/components/principal/SuperAdmin/reports/reportConfig.types";

// ── Params & Result types ────────────────────────────────────────────────────

export interface GenerateReportParams {
  reportId: string;
  instituteId: string;
  periodId: string;
  courseId?: string;
  groupId?: string;
  cycleId?: string;
  studentId?: string;
  attendanceMode?: "group" | "student";
  gradesType?: "parcial" | "completo";
  gradesScope?: "grupo" | "estudiante";
}

export type GenerateReportResult =
  | { base64: string; filename: string; mimeType: string }
  | { error: string };

// ── Shared image fetcher ──────────────────────────────────────────────────────

const MIME_EXT: Record<string, string> = {
  ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg",
  ".gif": "image/gif", ".webp": "image/webp", ".svg": "image/svg+xml",
};

function parseSupabaseStorageUrl(url: string): { bucket: string; filePath: string } | null {
  try {
    const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (!base || !url.startsWith(base)) return null;
    const match = new URL(url).pathname.match(
      /\/storage\/v1\/object\/(?:public|sign|authenticated)\/([^/]+)\/(.+)/,
    );
    return match ? { bucket: match[1], filePath: decodeURIComponent(match[2]) } : null;
  } catch {
    return null;
  }
}

async function fetchAsBase64(url: string): Promise<string | undefined> {
  if (!url) return undefined;
  try {
    // Local filesystem
    const isLocal =
      url.startsWith("/") ||
      url.startsWith("http://localhost") ||
      url.startsWith("https://localhost");
    if (isLocal) {
      const pathname = url.startsWith("/") ? url : new URL(url).pathname;
      const filePath = path.join(process.cwd(), "public", pathname);
      const buf = fs.readFileSync(filePath);
      const ext = path.extname(filePath).toLowerCase();
      return `data:${MIME_EXT[ext] ?? "image/png"};base64,${buf.toString("base64")}`;
    }

    // Supabase Storage URL → use service-role client to bypass bucket privacy
    const stored = parseSupabaseStorageUrl(url);
    if (stored) {
      const admin = createAdminClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        { auth: { persistSession: false } },
      );
      const { data, error } = await admin.storage
        .from(stored.bucket)
        .download(stored.filePath);
      if (error || !data) return undefined;
      const buf = Buffer.from(await data.arrayBuffer());
      return `data:${data.type || "image/png"};base64,${buf.toString("base64")}`;
    }

    // Generic remote URL
    const res = await fetch(url);
    if (!res.ok) return undefined;
    const buf = Buffer.from(await res.arrayBuffer());
    return `data:${res.headers.get("content-type") ?? "image/png"};base64,${buf.toString("base64")}`;
  } catch {
    return undefined;
  }
}

// ── Signature resolver — always re-fetches signature_url from profile ────────
// Prevents stale cached URLs when users update their signature image.

async function resolveSignatures(sigs: any[]): Promise<any[]> {
  // Use admin client to bypass RLS when reading signature_url from profiles
  const admin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  );

  return Promise.all(
    sigs.map(async (sig) => {
      let url: string | undefined = sig.signatureImageUrl;

      if (sig.profileId) {
        const { data, error } = await admin
          .from("profiles")
          .select("signature_url")
          .eq("id", sig.profileId)
          .maybeSingle();

        console.log("[resolveSignatures] profileId:", sig.profileId, "→ signature_url:", (data as any)?.signature_url, "error:", error?.message);

        const fresh = (data as any)?.signature_url;
        if (fresh) url = fresh;
      }

      if (url) {
        const dataUrl = await fetchAsBase64(url).catch((e) => {
          console.error("[resolveSignatures] fetchAsBase64 failed for:", url, e);
          return undefined;
        });
        return { ...sig, signatureImageUrl: dataUrl };
      }
      return sig;
    }),
  );
}

// ── Entry point ───────────────────────────────────────────────────────────────

export async function generateReport(
  params: GenerateReportParams,
): Promise<GenerateReportResult> {
  switch (params.reportId) {
    case "students-report":
      return generateStudentsReport(params);
    case "attendance-report":
      return generateAttendanceReport(params);
    case "grades-report":
      return generateGradesReport(params);
    default:
      return { error: `Reporte "${params.reportId}" aún no está implementado.` };
  }
}

// ── Students report ────────────────────────────────────────────────────────────

async function generateStudentsReport(
  params: GenerateReportParams,
): Promise<GenerateReportResult> {
  const supabase = await createClient();

  // Fetch institute, period, course, group names and saved config in parallel
  const [instituteRes, periodRes, courseRes, groupRes, configRes] = await Promise.all([
    supabase
      .from("institute")
      .select("name, logo_url")
      .eq("id", params.instituteId)
      .maybeSingle(),

    supabase
      .from("academic_period")
      .select("name")
      .eq("id", params.periodId)
      .maybeSingle(),

    params.courseId && params.courseId !== "all"
      ? supabase
          .from("courses")
          .select("name")
          .eq("id", params.courseId)
          .maybeSingle()
      : Promise.resolve({ data: null, error: null }),

    params.groupId && params.groupId !== "all"
      ? supabase
          .from("groups")
          .select("name")
          .eq("id", params.groupId)
          .maybeSingle()
      : Promise.resolve({ data: null, error: null }),

    supabase
      .from("report_config")
      .select("config")
      .eq("institute_id", params.instituteId)
      .eq("report_id", params.reportId)
      .maybeSingle(),
  ]);

  const instituteName = instituteRes.data?.name ?? "Institución";
  const periodName = periodRes.data?.name ?? "Período";
  const courseName: string | undefined = courseRes.data?.name ?? undefined;
  const groupName: string | undefined = groupRes.data?.name ?? undefined;

  // Merge saved config with defaults
  const config: StudentsReportConfig = {
    ...REPORT_CONFIG_DEFAULTS["students-report"],
    ...(configRes.data?.config as Partial<StudentsReportConfig> ?? {}),
  };

  // Download logo as base64 if showLogo is enabled
  let logoDataUrl: string | undefined;
  const logoUrl = instituteRes.data?.logo_url;
  if (config.showLogo && logoUrl) {
    logoDataUrl = await fetchAsBase64(logoUrl);
  }

  // Watermark image
  let watermarkImageDataUrl: string | undefined;
  if (config.showWatermark && config.watermarkImageUrl) {
    watermarkImageDataUrl = await fetchAsBase64(config.watermarkImageUrl);
  } else if (config.showWatermark && logoDataUrl) {
    watermarkImageDataUrl = logoDataUrl;
  }

  // Signature images — always re-fetched from profile if profileId is set
  const signatures = await resolveSignatures(config.signatures ?? []);

  // Query students enrolled in the period, with group + course info
  const { data: enrolled, error } = await supabase
    .from("student_enrolled")
    .select(
      `
      id,
      profiles:user_id(
        full_name, document_number, document_type, phone,
        profile_has_learning_condition(
          learning_condition:learning_condition_id(name)
        ),
        parent_has_student!parent_has_student_student_id_fkey(
          parent_profile:parent_id(full_name, phone)
        )
      ),
      group_has_students(
        group_id,
        groups:group_id(id, name, courses:course_id(id, name))
      )
    `,
    )
    .eq("academic_period_id", params.periodId)
    .eq("is_active", true)
    .order("created_at", { ascending: true });

  if (error) return { error: error.message };

  // Transform + filter
  type GroupInfo = { id: string; name: string; course_id?: string; courses?: { id: string; name: string } | null };
  type EnrolledRow = {
    id: string;
    profiles: {
      full_name: string;
      document_number: string | null;
      document_type: string | null;
      phone: string | null;
      profile_has_learning_condition: { learning_condition: { name: string } | null }[];
      parent_has_student: { parent_profile: { full_name: string; phone: string | null } | null }[];
    } | null;
    group_has_students: { group_id: string; groups: GroupInfo | null }[];
  };

  const rows: (StudentRow & { _groupId: string; _courseId: string })[] = (
    enrolled as unknown as EnrolledRow[]
  ).flatMap((e) => {
    const profile = e.profiles;
    if (!profile) return [];

    const assignments = e.group_has_students ?? [];

    const conditions = (profile.profile_has_learning_condition ?? [])
      .map((c) => c.learning_condition?.name)
      .filter((n): n is string => !!n);
    const parentEntry = (profile.parent_has_student ?? [])[0]?.parent_profile ?? null;

    const base = {
      full_name: profile.full_name,
      document_type: profile.document_type,
      document_number: profile.document_number,
      phone: profile.phone,
      conditions,
      parent_name: parentEntry?.full_name ?? null,
      parent_phone: parentEntry?.phone ?? null,
    };

    if (assignments.length === 0) {
      return [{ ...base, course_name: "Sin asignar", group_name: "Sin asignar", _groupId: "", _courseId: "" }];
    }

    return assignments.flatMap((a) => {
      const g = a.groups;
      if (!g) return [];
      return [{ ...base, course_name: g.courses?.name ?? "—", group_name: g.name, _groupId: g.id, _courseId: g.courses?.id ?? "" }];
    });
  });

  // Apply course / group filters
  const filtered = rows.filter((r) => {
    if (params.courseId && params.courseId !== "all" && r._courseId !== params.courseId)
      return false;
    if (params.groupId && params.groupId !== "all" && r._groupId !== params.groupId)
      return false;
    return true;
  });

  // Sort based on groupBy
  filtered.sort((a, b) => {
    if (config.groupBy === "course") {
      const course = a.course_name.localeCompare(b.course_name);
      if (course !== 0) return course;
      const grp = a.group_name.localeCompare(b.group_name);
      return grp !== 0 ? grp : a.full_name.localeCompare(b.full_name);
    }
    if (config.groupBy === "none") {
      return a.full_name.localeCompare(b.full_name);
    }
    // "group" (default)
    const grp = a.group_name.localeCompare(b.group_name);
    return grp !== 0 ? grp : a.full_name.localeCompare(b.full_name);
  });

  const students: StudentRow[] = filtered.map(
    ({ full_name, document_type, document_number, phone, course_name, group_name, conditions, parent_name, parent_phone }) => ({
      full_name, document_type, document_number, phone, course_name, group_name, conditions, parent_name, parent_phone,
    }),
  );

  // Generate PDF buffer
  const generatedAt = new Date().toLocaleDateString("es-CO", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  const element = React.createElement(StudentsReportPDF, {
    instituteName,
    logoDataUrl,
    periodName,
    courseName,
    groupName,
    students,
    generatedAt,
    showLogo: config.showLogo,
    headerTitle: config.headerTitle || undefined,
    footerText: config.footerText || undefined,
    showPageNumbers: config.showPageNumbers,
    showWatermark: config.showWatermark,
    watermarkText: config.watermarkText || "CONFIDENCIAL",
    watermarkImageDataUrl,
    sidebarText: config.sidebarText || undefined,
    showDocumentNumber: config.showDocumentNumber,
    showPhone: config.showPhone,
    groupBy: config.groupBy,
    showConditions: config.showConditions,
    showParentInfo: config.showParentInfo,
    signatures,
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const buffer = await renderToBuffer(element as any);

  // Build filename
  const slug = (s: string) => s.replace(/\s+/g, "-").toLowerCase();
  const parts = ["estudiantes", slug(periodName)];
  if (courseName) parts.push(slug(courseName));
  if (groupName) parts.push(slug(groupName));
  const filename = `${parts.join("_")}.pdf`;

  return {
    base64: buffer.toString("base64"),
    filename,
    mimeType: "application/pdf",
  };
}

// ── Attendance report ──────────────────────────────────────────────────────────

async function generateAttendanceReport(
  params: GenerateReportParams,
): Promise<GenerateReportResult> {
  const supabase = await createClient();

  const [instituteRes, periodRes, configRes] = await Promise.all([
    supabase.from("institute").select("name, logo_url").eq("id", params.instituteId).maybeSingle(),
    supabase.from("academic_period").select("name").eq("id", params.periodId).maybeSingle(),
    supabase
      .from("report_config")
      .select("config")
      .eq("institute_id", params.instituteId)
      .eq("report_id", "attendance-report")
      .maybeSingle(),
  ]);

  const instituteName = instituteRes.data?.name ?? "Institución";
  const periodName    = periodRes.data?.name    ?? "Período";

  const config: AttendanceReportConfig = {
    ...REPORT_CONFIG_DEFAULTS["attendance-report"],
    ...(configRes.data?.config as Partial<AttendanceReportConfig> ?? {}),
  };

  const generatedAt = new Date().toLocaleDateString("es-CO", {
    day: "2-digit", month: "long", year: "numeric",
  });

  // Logo
  let logoDataUrl: string | undefined;
  const logoUrl = instituteRes.data?.logo_url;
  if (config.showLogo && logoUrl) {
    logoDataUrl = await fetchAsBase64(logoUrl);
  }

  // Watermark
  let watermarkImageDataUrl: string | undefined;
  if (config.showWatermark && config.watermarkImageUrl) {
    watermarkImageDataUrl = await fetchAsBase64(config.watermarkImageUrl);
  } else if (config.showWatermark && logoDataUrl) {
    watermarkImageDataUrl = logoDataUrl;
  }

  // Signature images — always re-fetched from profile if profileId is set
  const signatures = await resolveSignatures(config.signatures ?? []);

  const slug = (s: string) => s.replace(/\s+/g, "-").toLowerCase();

  // ── Por alumno ────────────────────────────────────────────────────────────────
  if (params.attendanceMode === "student" && params.studentId) {
    const { data, error } = await supabase
      .from("student_enrolled")
      .select(`
        profiles:user_id(full_name, document_number, document_type),
        group_has_students(
          id,
          student_attendance(
            status, minutes_late, observation,
            group_class_has_session:class_session_id(
              session_date,
              group_has_class:group_has_class_id(
                name,
                materias:subject_id(name)
              )
            )
          )
        )
      `)
      .eq("academic_period_id", params.periodId)
      .eq("user_id", params.studentId)
      .maybeSingle();

    if (error) return { error: error.message };
    if (!data)  return { error: "Estudiante no encontrado en el período seleccionado." };

    const profile = (data as any).profiles;
    const memberships: any[] = (data as any).group_has_students ?? [];

    const details: AttendanceDetailRow[] = memberships.flatMap((ghs) =>
      (ghs.student_attendance ?? []).flatMap((a: any) => {
        const session = a.group_class_has_session;
        if (!session) return [];
        const cls = session.group_has_class;
        return [{
          session_date: session.session_date,
          subject_name: cls?.materias?.name ?? "—",
          class_name:   cls?.name          ?? "—",
          status:       a.status,
          minutes_late: a.minutes_late,
          observation:  a.observation,
        }];
      })
    ).sort((a, b) => {
      const s = a.subject_name.localeCompare(b.subject_name);
      return s !== 0 ? s : a.session_date.localeCompare(b.session_date);
    });

    const totalSessions = details.length;
    const totalPresent  = details.filter((d) => d.status === "present").length;
    const totalLate     = details.filter((d) => d.status === "late").length;
    const totalAbsent   = details.filter((d) => d.status === "absent").length;
    const percent = totalSessions > 0 ? Math.round((totalPresent + totalLate) / totalSessions * 100) : 0;

    const studentName = profile?.full_name ?? "Estudiante";
    const studentDoc  = profile?.document_type
      ? `${profile.document_type}: ${profile.document_number ?? "—"}`
      : (profile?.document_number ?? undefined);

    const element = React.createElement(AttendanceReportPDF, {
      instituteName, logoDataUrl, periodName,
      mode: "student", studentName, studentDoc,
      details, totalSessions, totalPresent, totalLate, totalAbsent, percent,
      generatedAt,
      showLogo:              config.showLogo,
      headerTitle:           config.headerTitle  || undefined,
      footerText:            config.footerText   || undefined,
      showPageNumbers:       config.showPageNumbers,
      showWatermark:         config.showWatermark,
      watermarkText:         config.watermarkText || "CONFIDENCIAL",
      watermarkImageDataUrl,
      sidebarText:           config.sidebarText  || undefined,
      signatures,
      showPercentage:        config.showPercentage,
      alertThreshold:        config.alertThreshold,
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const buffer = await renderToBuffer(element as any);
    const filename = `asistencia_${slug(studentName)}_${slug(periodName)}.pdf`;
    return { base64: buffer.toString("base64"), filename, mimeType: "application/pdf" };
  }

  // ── Por grupo ─────────────────────────────────────────────────────────────────
  type GroupRow = { id: string; name: string; courses: { id: string; name: string } | null };

  let groupsQuery = supabase
    .from("groups")
    .select("id, name, courses:course_id(id, name)")
    .eq("year", params.periodId);
  if (params.courseId && params.courseId !== "all") groupsQuery = groupsQuery.eq("course_id", params.courseId);
  if (params.groupId  && params.groupId  !== "all") groupsQuery = groupsQuery.eq("id", params.groupId);

  const { data: groupsData, error: groupsError } = await groupsQuery;
  if (groupsError) return { error: groupsError.message };

  const groups   = (groupsData ?? []) as unknown as GroupRow[];
  const groupIds = groups.map((g) => g.id);
  if (groupIds.length === 0)
    return { error: "No se encontraron grupos para los filtros seleccionados." };

  const { data: membersData, error: membersError } = await supabase
    .from("group_has_students")
    .select(`
      id, group_id,
      groups:group_id(name, courses:course_id(name)),
      enrollment:student_enrolled_id(
        profiles:user_id(full_name, document_number, document_type)
      ),
      student_attendance(status)
    `)
    .in("group_id", groupIds);

  if (membersError) return { error: membersError.message };

  const rows: AttendanceSummaryRow[] = ((membersData ?? []) as any[]).map((m) => {
    const profile    = m.enrollment?.profiles;
    const attendance = (m.student_attendance ?? []) as { status: string }[];
    const total   = attendance.length;
    const present = attendance.filter((a) => a.status === "present").length;
    const late    = attendance.filter((a) => a.status === "late").length;
    const absent  = attendance.filter((a) => a.status === "absent").length;
    const percent = total > 0 ? Math.round((present + late) / total * 100) : 0;
    const docType = profile?.document_type;
    return {
      student_name: profile?.full_name       ?? "—",
      document:     docType ? `${docType}: ${profile?.document_number ?? "—"}` : (profile?.document_number ?? null),
      group_name:   m.groups?.name           ?? "—",
      course_name:  m.groups?.courses?.name  ?? "—",
      total, present, late, absent, percent,
    };
  }).sort((a: AttendanceSummaryRow, b: AttendanceSummaryRow) => {
    const byGroup = a.group_name.localeCompare(b.group_name);
    return byGroup !== 0 ? byGroup : a.student_name.localeCompare(b.student_name);
  });

  const courseName = params.courseId && params.courseId !== "all" ? groups[0]?.courses?.name : undefined;
  const groupName  = params.groupId  && params.groupId  !== "all" ? groups[0]?.name          : undefined;

  const element = React.createElement(AttendanceReportPDF, {
    instituteName, logoDataUrl, periodName,
    mode: "group", courseName, groupName, rows,
    generatedAt,
    showLogo:              config.showLogo,
    headerTitle:           config.headerTitle  || undefined,
    footerText:            config.footerText   || undefined,
    showPageNumbers:       config.showPageNumbers,
    showWatermark:         config.showWatermark,
    watermarkText:         config.watermarkText || "CONFIDENCIAL",
    watermarkImageDataUrl,
    sidebarText:           config.sidebarText  || undefined,
    signatures:            config.signatures   ?? [],
    showPercentage:        config.showPercentage,
    alertThreshold:        config.alertThreshold,
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const buffer   = await renderToBuffer(element as any);
  const parts    = ["asistencia", slug(periodName)];
  if (courseName) parts.push(slug(courseName));
  if (groupName)  parts.push(slug(groupName));
  const filename = `${parts.join("_")}.pdf`;

  return { base64: buffer.toString("base64"), filename, mimeType: "application/pdf" };
}

// ── generateGradesReport ──────────────────────────────────────────────────────

async function generateGradesReport(params: GenerateReportParams): Promise<GenerateReportResult> {
  const { instituteId, periodId, groupId, studentId, cycleId, gradesType = "parcial", gradesScope = "grupo" } = params;

  if (!groupId)  return { error: "Selecciona un grupo." };
  if (!periodId) return { error: "Selecciona un período académico." };

  const supabase = await createClient();
  const slug = (s: string) => s.replace(/\s+/g, "-").toLowerCase();

  // ── Shared data ──────────────────────────────────────────────────────────────
  const [instituteRes, periodRes, configRes, groupRes] = await Promise.all([
    supabase.from("institute").select("name, slogan, logo_url").eq("id", instituteId).maybeSingle(),
    supabase.from("academic_period").select("name").eq("id", periodId).maybeSingle(),
    supabase.from("report_config").select("config").eq("institute_id", instituteId).eq("report_id", "grades-report").maybeSingle(),
    supabase.from("groups").select("name, courses:course_id(name)").eq("id", groupId).maybeSingle(),
  ]);

  const instituteName     = (instituteRes.data as any)?.name   ?? "Institución";
  const instituteSubtitle = (instituteRes.data as any)?.slogan ?? undefined;
  const periodName        = (periodRes.data as any)?.name      ?? "Período";
  const groupName         = (groupRes.data as any)?.name       ?? "";
  const courseName        = (groupRes.data as any)?.courses?.name ?? undefined;

  const config: GradesReportConfig = {
    ...REPORT_CONFIG_DEFAULTS["grades-report"],
    ...(configRes.data?.config as Partial<GradesReportConfig> ?? {}),
  };

  // Logo & watermark
  let logoDataUrl: string | undefined;
  const logoUrl = (instituteRes.data as any)?.logo_url;
  if (config.showLogo && logoUrl) logoDataUrl = await fetchAsBase64(logoUrl);

  let watermarkImageDataUrl: string | undefined;
  if (config.showWatermark && config.watermarkImageUrl) {
    watermarkImageDataUrl = await fetchAsBase64(config.watermarkImageUrl);
  } else if (config.showWatermark && logoDataUrl) {
    watermarkImageDataUrl = logoDataUrl;
  }

  // Signature images — always re-fetched from profile if profileId is set
  const signatures = await resolveSignatures(config.signatures ?? []);

  // Cycle name (cycleId = academic_period_has_cycle.id)
  let cycleName: string | undefined;
  if (cycleId) {
    const { data } = await supabase
      .from("academic_period_has_cycle")
      .select("cycles:cycle_id(name)")
      .eq("id", cycleId)
      .maybeSingle();
    cycleName = (data as any)?.cycles?.name ?? undefined;
  }

  // Classes in this group
  const { data: classesData, error: classesError } = await supabase
    .from("group_has_class")
    .select("id, name, materias:subject_id(name)")
    .eq("group_id", groupId);

  if (classesError) return { error: classesError.message };

  const classes: { id: string; subjectName: string }[] = (classesData ?? []).map((c: any) => ({
    id: c.id,
    subjectName: c.materias?.name ?? c.name,
  }));
  const classIds = classes.map((c) => c.id);
  if (classIds.length === 0) return { error: "El grupo no tiene materias asignadas." };

  const generatedAt = new Date().toLocaleDateString("es-CO", { day: "2-digit", month: "long", year: "numeric" });

  // ── Shared PDF config ────────────────────────────────────────────────────────
  const disclaimer =
    `Este documento fue generado automáticamente el ${generatedAt} y tiene únicamente fines informativos internos. ` +
    `No constituye un certificado oficial ni tiene validez ante instancias legales, académicas certificadoras o entidades externas.`;

  const pdfCommon = {
    instituteName, instituteSubtitle, periodName, groupName, courseName, cycleName,
    generatedAt, showLogo: config.showLogo, logoDataUrl,
    headerTitle: config.headerTitle || undefined,
    footerText: config.footerText || undefined,
    showPageNumbers: config.showPageNumbers,
    showWatermark: config.showWatermark,
    watermarkText: config.watermarkText || "CONFIDENCIAL",
    watermarkImageDataUrl,
    disclaimer,
    sidebarText: config.sidebarText || undefined,
    signatures,
    showPerformanceLevel: config.showPerformanceLevel,
    passingGrade: config.passingGrade,
  };

  // ════════════════════════════════════════════════════════════════════════════
  // PARCIAL + ESTUDIANTE — student_cycle_grade por ciclo y clase
  // ════════════════════════════════════════════════════════════════════════════
  if (gradesType === "parcial" && gradesScope === "estudiante") {
    if (!studentId) return { error: "Selecciona un estudiante." };
    if (!cycleId)   return { error: "Selecciona un ciclo/trimestre." };

    // Student profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name, document_type, document_number")
      .eq("id", studentId)
      .maybeSingle();

    // Student enrolled ID
    const { data: enrolled } = await supabase
      .from("student_enrolled")
      .select("id")
      .eq("user_id", studentId)
      .eq("academic_period_id", periodId)
      .maybeSingle();

    if (!enrolled) return { error: "El estudiante no está matriculado en este período." };

    // Cycle grades for this student in this group's classes
    const { data: gradesData } = await supabase
      .from("student_cycle_grade")
      .select("grade, group_has_class_id, academic_period_has_cycle:academic_period_has_cycle_id(cycle_id)")
      .eq("student_enrolled_id", enrolled.id)
      .eq("academic_period_has_cycle_id", cycleId)
      .in("group_has_class_id", classIds);

    // Max per class: sum of activity grade_percentages
    const cycleIdForActivities = (gradesData?.[0] as any)?.academic_period_has_cycle?.cycle_id;
    const { data: activitiesData } = cycleIdForActivities
      ? await supabase
          .from("group_has_activity")
          .select("group_has_class_id, grade_percentage")
          .in("group_has_class_id", classIds)
          .eq("cycle_id", cycleIdForActivities)
      : { data: [] };

    const maxMap: Record<string, number> = {};
    for (const act of (activitiesData ?? [])) {
      maxMap[act.group_has_class_id] = (maxMap[act.group_has_class_id] ?? 0) + (act.grade_percentage ?? 0);
    }

    const gradeRows: GradeRow[] = (gradesData ?? []).map((g: any) => {
      const cls = classes.find((c) => c.id === g.group_has_class_id);
      return {
        subjectName: cls?.subjectName ?? "—",
        grade: g.grade,
        maxGrade: maxMap[g.group_has_class_id] || 120,
        cycleName,
      };
    }).sort((a, b) => a.subjectName.localeCompare(b.subjectName, "es"));

    const studentName    = (profile as any)?.full_name       ?? "Estudiante";
    const documentType   = (profile as any)?.document_type   ?? "CC";
    const documentNumber = (profile as any)?.document_number ?? "";

    // Grade level from group
    const gradeLevel = courseName ?? "";

    const element = React.createElement(GradesReportPDF, {
      ...pdfCommon,
      studentName, documentType, documentNumber,
      courseName, gradeLevel, grades: gradeRows,
      reportDate: new Date().toISOString(),
    });

    let buffer: Buffer;
    try { buffer = await renderToBuffer(element as any); }
    catch (err) { return { error: `Error al generar PDF: ${err instanceof Error ? err.message : "desconocido"}` }; }

    return {
      base64: buffer.toString("base64"),
      filename: `calificaciones_parcial_${slug(studentName)}_${cycleName ? slug(cycleName) + "_" : ""}${slug(periodName)}.pdf`,
      mimeType: "application/pdf",
    };
  }

  // ════════════════════════════════════════════════════════════════════════════
  // PARCIAL + GRUPO — student_cycle_grade para todos los estudiantes del grupo
  // ════════════════════════════════════════════════════════════════════════════
  if (gradesType === "parcial" && gradesScope === "grupo") {
    if (!cycleId) return { error: "Selecciona un ciclo/trimestre." };

    // All students in this group via group_has_students → student_enrolled → profiles
    const { data: membersData, error: membersError } = await supabase
      .from("group_has_students")
      .select("student_enrolled_id, enrollment:student_enrolled_id(user_id, profiles:user_id(full_name, document_number, avatar_url))")
      .eq("group_id", groupId);

    if (membersError) return { error: membersError.message };

    const enrolledIds = (membersData ?? []).map((m: any) => m.student_enrolled_id);
    if (enrolledIds.length === 0) return { error: "El grupo no tiene estudiantes asignados." };

    // All cycle grades for these students in this cycle
    const { data: gradesData, error: gradesError } = await supabase
      .from("student_cycle_grade")
      .select("grade, group_has_class_id, student_enrolled_id, academic_period_has_cycle:academic_period_has_cycle_id(cycle_id)")
      .eq("academic_period_has_cycle_id", cycleId)
      .in("student_enrolled_id", enrolledIds)
      .in("group_has_class_id", classIds);

    if (gradesError) return { error: gradesError.message };

    // Max grades per class
    const cycleIdForActivities = (gradesData?.[0] as any)?.academic_period_has_cycle?.cycle_id;
    const { data: activitiesData } = cycleIdForActivities
      ? await supabase
          .from("group_has_activity")
          .select("group_has_class_id, grade_percentage")
          .in("group_has_class_id", classIds)
          .eq("cycle_id", cycleIdForActivities)
      : { data: [] };

    const maxMap: Record<string, number> = {};
    for (const act of (activitiesData ?? [])) {
      maxMap[act.group_has_class_id] = (maxMap[act.group_has_class_id] ?? 0) + (act.grade_percentage ?? 0);
    }

    // Fetch profile photos in parallel
    const photoMap: Record<string, string | undefined> = {};
    await Promise.all(
      (membersData ?? []).map(async (m: any) => {
        const avatarUrl = m.enrollment?.profiles?.avatar_url;
        if (avatarUrl) {
          photoMap[m.student_enrolled_id] = await fetchAsBase64(avatarUrl).catch(() => undefined);
        }
      }),
    );

    // Build rows: one per student
    const subjects = [...classes].sort((a, b) => a.subjectName.localeCompare(b.subjectName, "es")).map((c) => c.subjectName);
    const maxGrades: Record<string, number> = {};
    for (const cls of classes) {
      maxGrades[cls.subjectName] = maxMap[cls.id] || 120;
    }

    const rows: GroupGradeRow[] = (membersData ?? []).map((m: any) => {
      const profile = m.enrollment?.profiles;
      const studentEnrolledId = m.student_enrolled_id;
      const studentGrades: Record<string, number> = {};
      for (const g of (gradesData ?? [])) {
        if (g.student_enrolled_id !== studentEnrolledId) continue;
        const cls = classes.find((c) => c.id === g.group_has_class_id);
        if (cls) studentGrades[cls.subjectName] = g.grade;
      }
      return {
        studentName: profile?.full_name ?? "—",
        documentNumber: profile?.document_number ?? null,
        grades: studentGrades,
        photoDataUrl: photoMap[studentEnrolledId] ?? null,
      };
    }).sort((a, b) => a.studentName.localeCompare(b.studentName, "es"));

    const element = React.createElement(GradesGroupReportPDF, {
      ...pdfCommon,
      rows, subjects, maxGrades,
      reportType: "parcial",
    });

    let buffer: Buffer;
    try { buffer = await renderToBuffer(element as any); }
    catch (err) { return { error: `Error al generar PDF: ${err instanceof Error ? err.message : "desconocido"}` }; }

    return {
      base64: buffer.toString("base64"),
      filename: `calificaciones_parcial_grupo_${slug(groupName)}_${cycleName ? slug(cycleName) + "_" : ""}${slug(periodName)}.pdf`,
      mimeType: "application/pdf",
    };
  }

  // ════════════════════════════════════════════════════════════════════════════
  // COMPLETO + ESTUDIANTE — student_final_grade del año
  // ════════════════════════════════════════════════════════════════════════════
  if (gradesType === "completo" && gradesScope === "estudiante") {
    if (!studentId) return { error: "Selecciona un estudiante." };

    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name, document_type, document_number")
      .eq("id", studentId)
      .maybeSingle();

    const { data: enrolled } = await supabase
      .from("student_enrolled")
      .select("id")
      .eq("user_id", studentId)
      .eq("academic_period_id", periodId)
      .maybeSingle();

    if (!enrolled) return { error: "El estudiante no está matriculado en este período." };

    const { data: finalGrades, error: fgError } = await supabase
      .from("student_final_grade")
      .select("final_grade, group_has_class_id")
      .eq("student_enrolled_id", enrolled.id)
      .eq("academic_period_id", periodId)
      .in("group_has_class_id", classIds);

    if (fgError) return { error: fgError.message };

    const gradeRows: GradeRow[] = (finalGrades ?? []).map((g: any) => {
      const cls = classes.find((c) => c.id === g.group_has_class_id);
      return {
        subjectName: cls?.subjectName ?? "—",
        grade: g.final_grade,
        maxGrade: 120,
      };
    }).sort((a, b) => a.subjectName.localeCompare(b.subjectName, "es"));

    const studentName    = (profile as any)?.full_name       ?? "Estudiante";
    const documentType   = (profile as any)?.document_type   ?? "CC";
    const documentNumber = (profile as any)?.document_number ?? "";

    const element = React.createElement(GradesReportPDF, {
      ...pdfCommon,
      cycleName: undefined,
      studentName, documentType, documentNumber,
      courseName, gradeLevel: courseName ?? "",
      grades: gradeRows,
      reportDate: new Date().toISOString(),
    });

    let buffer: Buffer;
    try { buffer = await renderToBuffer(element as any); }
    catch (err) { return { error: `Error al generar PDF: ${err instanceof Error ? err.message : "desconocido"}` }; }

    return {
      base64: buffer.toString("base64"),
      filename: `calificaciones_final_${slug(studentName)}_${slug(periodName)}.pdf`,
      mimeType: "application/pdf",
    };
  }

  // ════════════════════════════════════════════════════════════════════════════
  // COMPLETO + GRUPO — student_final_grade para todos los estudiantes del grupo
  // ════════════════════════════════════════════════════════════════════════════
  const { data: membersData, error: membersError } = await supabase
    .from("group_has_students")
    .select("student_enrolled_id, enrollment:student_enrolled_id(user_id, profiles:user_id(full_name, document_number, avatar_url))")
    .eq("group_id", groupId);

  if (membersError) return { error: membersError.message };

  const enrolledIds = (membersData ?? []).map((m: any) => m.student_enrolled_id);
  if (enrolledIds.length === 0) return { error: "El grupo no tiene estudiantes asignados." };

  const { data: finalGrades, error: fgError } = await supabase
    .from("student_final_grade")
    .select("final_grade, group_has_class_id, student_enrolled_id")
    .eq("academic_period_id", periodId)
    .in("student_enrolled_id", enrolledIds)
    .in("group_has_class_id", classIds);

  if (fgError) return { error: fgError.message };

  // Fetch profile photos in parallel
  const photoMap: Record<string, string | undefined> = {};
  await Promise.all(
    (membersData ?? []).map(async (m: any) => {
      const avatarUrl = m.enrollment?.profiles?.avatar_url;
      if (avatarUrl) {
        photoMap[m.student_enrolled_id] = await fetchAsBase64(avatarUrl).catch(() => undefined);
      }
    }),
  );

  const subjects = [...classes].sort((a, b) => a.subjectName.localeCompare(b.subjectName, "es")).map((c) => c.subjectName);
  const maxGrades: Record<string, number> = {};
  for (const subj of subjects) maxGrades[subj] = 120;

  const rows: GroupGradeRow[] = (membersData ?? []).map((m: any) => {
    const profile = m.enrollment?.profiles;
    const studentGrades: Record<string, number> = {};
    for (const g of (finalGrades ?? [])) {
      if (g.student_enrolled_id !== m.student_enrolled_id) continue;
      const cls = classes.find((c) => c.id === g.group_has_class_id);
      if (cls) studentGrades[cls.subjectName] = g.final_grade;
    }
    return {
      studentName: profile?.full_name ?? "—",
      documentNumber: profile?.document_number ?? null,
      grades: studentGrades,
      photoDataUrl: photoMap[m.student_enrolled_id] ?? null,
    };
  }).sort((a, b) => a.studentName.localeCompare(b.studentName, "es"));

  const element = React.createElement(GradesGroupReportPDF, {
    ...pdfCommon,
    cycleName: undefined,
    rows, subjects, maxGrades,
    reportType: "completo",
  });

  let buffer: Buffer;
  try { buffer = await renderToBuffer(element as any); }
  catch (err) { return { error: `Error al generar PDF: ${err instanceof Error ? err.message : "desconocido"}` }; }

  return {
    base64: buffer.toString("base64"),
    filename: `calificaciones_final_grupo_${slug(groupName)}_${slug(periodName)}.pdf`,
    mimeType: "application/pdf",
  };
}
