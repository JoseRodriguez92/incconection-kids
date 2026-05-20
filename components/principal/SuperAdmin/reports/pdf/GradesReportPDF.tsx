import React from "react";
import { Document, Page, Text, View, Image, StyleSheet } from "@react-pdf/renderer";
import type { ReportSignature } from "@/components/principal/SuperAdmin/reports/reportConfig.types";

// ── Types ──────────────────────────────────────────────────────────────────────

export interface GradeRow {
  subjectName: string;
  grade: number;
  maxGrade: number;
  cycleName?: string;
}

export interface GradesReportPDFProps {
  // Student
  studentName: string;
  documentType?: string;
  documentNumber?: string;
  courseName?: string;
  gradeLevel?: string;
  cycleName?: string;
  grades: GradeRow[];
  // Institute
  instituteName: string;
  instituteSubtitle?: string;
  // Config
  showLogo?: boolean;
  logoDataUrl?: string;
  headerTitle?: string;
  footerText?: string;
  showPageNumbers?: boolean;
  showWatermark?: boolean;
  watermarkText?: string;
  watermarkImageDataUrl?: string;
  sidebarText?: string;
  signatures?: ReportSignature[];
  showPerformanceLevel?: boolean;
  passingGrade?: number;
  // Date
  reportDate?: string;
  city?: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function performanceLevel(grade: number, max: number, passing: number): string {
  const norm = max > 0 ? (grade / max) * 120 : grade;
  if (norm < passing) return "REPROBADO";
  if (norm < 84) return "BAJO";
  if (norm < 95) return "BÁSICO";
  if (norm < 107) return "ALTO";
  return "SUPERIOR";
}

function levelColor(level: string): string {
  switch (level) {
    case "SUPERIOR": return "#15803d";
    case "ALTO":     return "#1d4ed8";
    case "BÁSICO":   return "#92400e";
    case "BAJO":     return "#b45309";
    default:         return "#b91c1c";
  }
}

function numberToWords(n: number): string {
  const units = ["", "uno", "dos", "tres", "cuatro", "cinco", "seis", "siete", "ocho", "nueve",
    "diez", "once", "doce", "trece", "catorce", "quince", "dieciséis", "diecisiete", "dieciocho", "diecinueve",
    "veinte", "veintiuno", "veintidós", "veintitrés", "veinticuatro", "veinticinco", "veintiséis", "veintisiete", "veintiocho", "veintinueve"];
  if (n < 30) return units[n] ?? String(n);
  if (n < 40) return `treinta y ${units[n - 30]}`.trim();
  return String(n);
}

const MONTHS_ES = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
];

// ── Styles ────────────────────────────────────────────────────────────────────

const PAD = 56;
const PAD_R = 56;

const s = StyleSheet.create({
  page: { backgroundColor: "#fff", paddingTop: 40, paddingBottom: 60, paddingLeft: PAD, paddingRight: PAD_R, position: "relative" },

  // Watermark
  watermarkImg: { position: "absolute", top: "25%", left: "10%", width: "80%", opacity: 0.06 },
  watermarkText: { position: "absolute", top: "42%", left: 0, right: 0, textAlign: "center", fontSize: 60, opacity: 0.04, fontFamily: "Helvetica-Bold", color: "#25305D", transform: "rotate(-30deg)" },

  // Sidebar
  sidebar: { position: "absolute", right: 10, top: 100, bottom: 80, width: 14, flexDirection: "column", alignItems: "center", justifyContent: "center" },
  sidebarLine: { flex: 1, width: 0.5, backgroundColor: "#cbd5e1" },
  sidebarText: { fontSize: 5.5, color: "#94a3b8", transform: "rotate(90deg)", whiteSpace: "nowrap", marginVertical: 3 },

  // Header
  header: { flexDirection: "row", alignItems: "center", marginBottom: 14 },
  logoBox: { width: 54, height: 54, marginRight: 12 },
  logoImg: { width: 54, height: 54, objectFit: "contain" as any },
  logoPlaceholder: { width: 54, height: 54, backgroundColor: "#f1f5f9", borderRadius: 4 },
  headerTexts: { flex: 1, alignItems: "center" },
  instituteName: { fontSize: 13, fontFamily: "Helvetica-Bold", color: "#25305D", textAlign: "center", textTransform: "uppercase", letterSpacing: 1 },
  instituteSubtitle: { fontSize: 8, color: "#64748b", textAlign: "center", marginTop: 2, letterSpacing: 0.5 },

  divider: { height: 0.75, backgroundColor: "#25305D", marginBottom: 18 },
  dividerThin: { height: 0.4, backgroundColor: "#e2e8f0", marginVertical: 10 },

  // Certificate title
  certTitle: { textAlign: "center", fontSize: 9, fontFamily: "Helvetica-Bold", color: "#1e293b", textTransform: "uppercase", lineHeight: 1.6, marginBottom: 14 },
  certifies: { textAlign: "center", fontSize: 10, fontFamily: "Helvetica-Bold", color: "#25305D", textTransform: "uppercase", letterSpacing: 2, marginBottom: 16 },

  // Body
  bodyText: { fontSize: 9.5, color: "#334155", lineHeight: 1.7, textAlign: "justify", marginBottom: 14 },
  bold: { fontFamily: "Helvetica-Bold" },

  // Table
  tableHeader: { flexDirection: "row", backgroundColor: "#25305D", paddingHorizontal: 8, paddingVertical: 5, marginBottom: 1 },
  tableHeaderCell: { fontSize: 7.5, fontFamily: "Helvetica-Bold", color: "#fff", textTransform: "uppercase", letterSpacing: 0.5 },
  tableRow: { flexDirection: "row", paddingHorizontal: 8, paddingVertical: 4.5, borderBottomWidth: 0.4, borderBottomColor: "#e2e8f0" },
  tableRowAlt: { backgroundColor: "#f8fafc" },
  cellSubject: { flex: 1, fontSize: 8.5, color: "#1e293b" },
  cellGrade: { width: 60, fontSize: 8.5, color: "#1e293b", textAlign: "right" },
  cellLevel: { width: 80, fontSize: 8, fontFamily: "Helvetica-Bold", textAlign: "right" },

  // Closing
  closingText: { fontSize: 9, color: "#334155", lineHeight: 1.7, marginTop: 16, textAlign: "justify" },

  // Signatures
  signaturesRow: { flexDirection: "row", justifyContent: "space-around", marginTop: 36, paddingTop: 4 },
  signatureItem: { flex: 1, alignItems: "center", marginHorizontal: 10 },
  signatureImage: { height: 30, marginBottom: 3, objectFit: "contain" as any },
  signatureLine: { width: "75%", height: 0.75, backgroundColor: "#25305D", marginBottom: 5 },
  signatureName: { fontSize: 8, fontFamily: "Helvetica-Bold", color: "#1e293b", textAlign: "center" },
  signatureLabel: { fontSize: 7, color: "#64748b", textAlign: "center", marginTop: 1 },

  // Footer
  footer: { position: "absolute", bottom: 16, left: PAD, right: PAD_R, flexDirection: "row", justifyContent: "space-between", paddingTop: 5, borderTopWidth: 0.5, borderTopColor: "#e2e8f0" },
  footerText: { fontSize: 7, color: "#94a3b8" },
  footerPage: { fontSize: 7, color: "#94a3b8" },
});

// ── Component ─────────────────────────────────────────────────────────────────

export function GradesReportPDF({
  studentName,
  documentType = "CC",
  documentNumber = "",
  courseName = "",
  gradeLevel = "",
  cycleName,
  grades = [],
  instituteName,
  instituteSubtitle,
  showLogo = true,
  logoDataUrl,
  headerTitle,
  footerText,
  showPageNumbers = true,
  showWatermark = false,
  watermarkText = "CONFIDENCIAL",
  watermarkImageDataUrl,
  sidebarText,
  signatures = [],
  showPerformanceLevel = true,
  passingGrade = 60,
  reportDate,
  city = "Bogotá, D.C.",
}: GradesReportPDFProps) {
  const date = reportDate ? new Date(reportDate) : new Date();
  const day = date.getDate();
  const month = MONTHS_ES[date.getMonth()] ?? "";
  const year = date.getFullYear();
  const yearWords = year === 2026 ? "dos mil veintiséis"
    : year === 2025 ? "dos mil veinticinco"
    : year === 2027 ? "dos mil veintisiete"
    : String(year);

  const certTitle = headerTitle || `EL SUSCRITO RECTOR DEL COLEGIO ${instituteName.toUpperCase()}`;
  const footer = footerText || `${instituteName} — Reporte de Calificaciones`;

  const docTypeLabel: Record<string, string> = {
    CC: "Cédula de Ciudadanía", TI: "Tarjeta de Identidad",
    CE: "Cédula de Extranjería", PA: "Pasaporte",
  };
  const docTypeStr = docTypeLabel[documentType] ?? documentType;

  const cycleStr = cycleName ? `el ${cycleName}` : "el período";

  return (
    <Document>
      <Page size="A4" style={s.page}>
        {/* ── Watermark ── */}
        {showWatermark && watermarkImageDataUrl && (
          <Image src={watermarkImageDataUrl} style={s.watermarkImg} />
        )}
        {showWatermark && !watermarkImageDataUrl && (
          <Text style={s.watermarkText}>{watermarkText}</Text>
        )}

        {/* ── Sidebar ── */}
        {sidebarText && (
          <View style={s.sidebar}>
            <View style={s.sidebarLine} />
            <Text style={s.sidebarText}>{sidebarText}</Text>
            <View style={s.sidebarLine} />
          </View>
        )}

        {/* ── Header ── */}
        <View style={s.header}>
          {showLogo && (
            <View style={s.logoBox}>
              {logoDataUrl
                ? <Image src={logoDataUrl} style={s.logoImg} />
                : <View style={s.logoPlaceholder} />}
            </View>
          )}
          <View style={s.headerTexts}>
            <Text style={s.instituteName}>{instituteName}</Text>
            {instituteSubtitle && <Text style={s.instituteSubtitle}>{instituteSubtitle}</Text>}
          </View>
          {showLogo && <View style={s.logoBox} />}
        </View>

        <View style={s.divider} />

        {/* ── Certificate title ── */}
        <Text style={s.certTitle}>{certTitle}</Text>
        <Text style={s.certifies}>C E R T I F I C A :</Text>

        {/* ── Body ── */}
        <Text style={s.bodyText}>
          {"    "}Que el(la) estudiante{" "}
          <Text style={s.bold}>{studentName.toUpperCase()}</Text>
          {", identificado(a) con "}
          <Text style={s.bold}>{docTypeStr} N°{documentNumber}</Text>
          {", cursó "}
          {cycleName ? "de manera parcial hasta " : ""}
          {cycleStr}
          {courseName ? ` del grado ${courseName.toUpperCase()}` : ""}
          {gradeLevel ? ` de ${gradeLevel}` : ""}
          {", hasta el día "}
          <Text style={s.bold}>{numberToWords(day).toUpperCase()} ({day})</Text>
          {" del mes de "}
          <Text style={s.bold}>{month}</Text>
          {" del año "}
          <Text style={s.bold}>{year}</Text>
          {", así:"}
        </Text>

        {/* ── Grades table ── */}
        <View style={s.tableHeader}>
          <Text style={[s.tableHeaderCell, { flex: 1 }]}>Asignatura</Text>
          <Text style={[s.tableHeaderCell, { width: 60, textAlign: "right" }]}>Valoración</Text>
          {showPerformanceLevel && (
            <Text style={[s.tableHeaderCell, { width: 80, textAlign: "right" }]}>Desempeño</Text>
          )}
        </View>
        {grades.map((row, i) => {
          const level = performanceLevel(row.grade, row.maxGrade, passingGrade);
          return (
            <View key={i} style={[s.tableRow, i % 2 === 1 ? s.tableRowAlt : {}]}>
              <Text style={s.cellSubject}>{row.subjectName}</Text>
              <Text style={s.cellGrade}>{row.grade}/{row.maxGrade}</Text>
              {showPerformanceLevel && (
                <Text style={[s.cellLevel, { color: levelColor(level) }]}>{level}</Text>
              )}
            </View>
          );
        })}

        {/* ── Closing text ── */}
        <Text style={s.closingText}>
          {"    "}La presente se expide a solicitud del interesado en {city}, a los{" "}
          <Text style={s.bold}>{numberToWords(day).toUpperCase()} ({day})</Text>
          {" días del mes de "}
          <Text style={s.bold}>{month}</Text>
          {" del año "}
          <Text style={s.bold}>{yearWords}</Text>
          {"."}
        </Text>

        {/* ── Signatures ── */}
        {signatures.length > 0 && (
          <View style={s.signaturesRow}>
            {signatures.map((sig) => (
              <View key={sig.id} style={s.signatureItem}>
                {sig.signatureImageUrl && (
                  <Image src={sig.signatureImageUrl} style={s.signatureImage} />
                )}
                {sig.showLine && <View style={s.signatureLine} />}
                <Text style={s.signatureName}>{sig.name}</Text>
                <Text style={s.signatureLabel}>{sig.label}</Text>
              </View>
            ))}
          </View>
        )}

        {/* ── Footer ── */}
        <View style={s.footer}>
          <Text style={s.footerText}>{footer}</Text>
          {showPageNumbers && <Text style={s.footerPage}>Pág. 1</Text>}
        </View>
      </Page>
    </Document>
  );
}
