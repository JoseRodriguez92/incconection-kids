// ── Tipos para report_config ──────────────────────────────────────────────────
// Estos tipos describen el JSON guardado en report_config.config (columna JSONB).
// Cada reporte tiene su propio shape específico + hereda el base.

// ── Firma ────────────────────────────────────────────────────────────────────
export interface ReportSignature {
  id: string;
  label: string;          // "Rector", "Coordinador", etc.
  name: string;           // nombre de la persona
  required: boolean;
  showLine: boolean;
  profileId?: string;           // ID del profile vinculado
  signatureImageUrl?: string;   // URL de la imagen de firma del profile
}

// ── Config base — compartida por todos los reportes ───────────────────────────
export interface BaseReportConfig {
  // Encabezado
  showLogo: boolean;
  headerTitle: string;      // título personalizado del reporte (vacío = usar el default)

  // Pie de página
  footerText: string;
  showPageNumbers: boolean;

  // Firmas
  signatures: ReportSignature[];

  // Marca de agua
  showWatermark: boolean;
  watermarkText: string;
  watermarkImageUrl: string;  // URL de imagen de fondo (vacío = usar texto)

  // Texto lateral (acreditación oficial — aparece rotado en el margen derecho)
  sidebarText: string;
}

// ── Configs específicas por reporte ──────────────────────────────────────────

export interface StudentsReportConfig extends BaseReportConfig {
  showPhoto: boolean;
  showDocumentNumber: boolean;
  showPhone: boolean;
  showAddress: boolean;
  showConditions: boolean;       // condiciones de aprendizaje
  showParentInfo: boolean;
  groupBy: "group" | "course" | "none";
}

export interface AttendanceReportConfig extends BaseReportConfig {
  showPercentage: boolean;
  alertThreshold: number;        // % mínimo de asistencia (default 80)
  showAbsenceReasons: boolean;
}

export interface GradesReportConfig extends BaseReportConfig {
  showFailedOnly: boolean;
  showAbsences: boolean;
  scaleMin: number;              // default 0
  scaleMax: number;              // default 120
  passingGrade: number;          // default 60
  showPerformanceLevel: boolean; // Bajo / Básico / Alto / Superior
}

export interface TeachersReportConfig extends BaseReportConfig {
  showSchedule: boolean;
  showGroups: boolean;
  showSubjects: boolean;
  showEnrollmentDate: boolean;
}

export interface PsychologyReportConfig extends BaseReportConfig {
  anonymizeNames: boolean;       // ocultar nombres reales
  showRiskLevel: boolean;
  showSessions: boolean;
  showFollowups: boolean;
  confidentialityNotice: string; // texto legal de confidencialidad
}

export interface EventsReportConfig extends BaseReportConfig {
  showAttendance: boolean;
  groupByCategory: boolean;
  showImages: boolean;
}

// ── Mapa: report_id → tipo de config ────────────────────────────────────────
export type ReportConfigMap = {
  "students-report":   StudentsReportConfig;
  "attendance-report": AttendanceReportConfig;
  "grades-report":     GradesReportConfig;
  "teachers-report":   TeachersReportConfig;
  "psychology-report": PsychologyReportConfig;
  "events-report":     EventsReportConfig;
};

export type ReportId = keyof ReportConfigMap;
export type AnyReportConfig = ReportConfigMap[ReportId];

// ── Defaults por reporte ────────────────────────────────────────────────────
const BASE_DEFAULTS: BaseReportConfig = {
  showLogo: true,
  headerTitle: "",
  footerText: "",
  showPageNumbers: true,
  signatures: [],
  showWatermark: false,
  watermarkText: "CONFIDENCIAL",
  watermarkImageUrl: "",
  sidebarText: "",
};

export const REPORT_CONFIG_DEFAULTS: ReportConfigMap = {
  "students-report": {
    ...BASE_DEFAULTS,
    showPhoto: true,
    showDocumentNumber: true,
    showPhone: false,
    showAddress: false,
    showConditions: true,
    showParentInfo: false,
    groupBy: "group",
  },
  "attendance-report": {
    ...BASE_DEFAULTS,
    showPercentage: true,
    alertThreshold: 80,
    showAbsenceReasons: false,
  },
  "grades-report": {
    ...BASE_DEFAULTS,
    showWatermark: true,
    showFailedOnly: false,
    showAbsences: true,
    scaleMin: 0,
    scaleMax: 120,
    passingGrade: 60,
    showPerformanceLevel: true,
  },
  "teachers-report": {
    ...BASE_DEFAULTS,
    showSchedule: true,
    showGroups: true,
    showSubjects: true,
    showEnrollmentDate: false,
  },
  "psychology-report": {
    ...BASE_DEFAULTS,
    showWatermark: true,
    watermarkText: "CONFIDENCIAL",
    anonymizeNames: false,
    showRiskLevel: true,
    showSessions: true,
    showFollowups: true,
    confidentialityNotice:
      "Este documento contiene información confidencial de salud mental. Su divulgación no autorizada está prohibida.",
  },
  "events-report": {
    ...BASE_DEFAULTS,
    showAttendance: false,
    groupByCategory: true,
    showImages: false,
  },
};
