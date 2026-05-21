import React from "react";
import { Document, Page, Text, View, Image, StyleSheet } from "@react-pdf/renderer";
import type { ReportSignature } from "@/components/principal/SuperAdmin/reports/reportConfig.types";

// ── Types ──────────────────────────────────────────────────────────────────────

export interface CompleteGradeRow {
  subjectName: string;
  cycleGrades: (number | null)[];  // one entry per cycle, in order
  finalGrade: number | null;
}

export interface CompleteStudentReportPDFProps {
  studentName: string;
  gender?: string;
  documentNumber?: string;
  courseName?: string;
  cycles: { id: string; name: string }[];
  rows: CompleteGradeRow[];
  instituteName: string;
  instituteSubtitle?: string;
  showLogo?: boolean;
  logoDataUrl?: string;
  headerTitle?: string;
  footerText?: string;
  showPageNumbers?: boolean;
  showWatermark?: boolean;
  watermarkText?: string;
  watermarkImageDataUrl?: string;
  signatures?: ReportSignature[];
  passingGrade?: number;
  reportDate?: string;
  city?: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function performanceLevel(grade: number, passing: number): string {
  if (grade < passing) return "REPROBADO";
  if (grade < 84)      return "BAJO";
  if (grade < 95)      return "BÁSICO";
  if (grade < 107)     return "ALTO";
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

const GRADE_NUMS: Record<string, string> = {
  PRIMERO: "1", SEGUNDO: "2", TERCERO: "3", CUARTO: "4", QUINTO: "5",
  SEXTO: "6", "SÉPTIMO": "7", SEPTIMO: "7", OCTAVO: "8", NOVENO: "9",
  "DÉCIMO": "10", DECIMO: "10", "UNDÉCIMO": "11", UNDECIMO: "11", ONCE: "11",
};

// Shorten cycle name for compact column header
function shortCycleName(name: string): string {
  const m = name.match(/\d+/);
  if (m) return `T${m[0]}`;
  const words = name.trim().split(/\s+/);
  return words.length === 1 ? name.slice(0, 4) : words[0].slice(0, 3) + ".";
}

// ── Layout constants ──────────────────────────────────────────────────────────

const PAD_L = 56;
const PAD_R = 56;
const PAD_T = 36;
const PAD_B = 110;

const COL_CYCLE = 46;   // width of each cycle grade column
const COL_NF    = 52;   // final grade column
const COL_DESEMP = 72;  // performance level column

// ── Styles ────────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  page: {
    backgroundColor: "#fff",
    paddingTop: PAD_T, paddingBottom: PAD_B,
    paddingLeft: PAD_L, paddingRight: PAD_R,
  },
  contentWrapper: { position: "relative", flex: 1 },
  watermarkImg:  { position: "absolute", top: -PAD_T, left: -PAD_L, width: 595, height: 842, objectFit: "contain" as any, opacity: 0.5 },
  watermarkText: {
    position: "absolute", top: "38%", left: 0, right: 0,
    textAlign: "center", fontSize: 72, fontFamily: "Helvetica-Bold",
    color: "#25305D", opacity: 0.5, transform: "rotate(-30deg)",
  },

  header:            { alignItems: "center", marginBottom: 4 },
  logoImg:           { width: 150, marginBottom: 2 },
  logoPlaceholder:   { width: 150, height: 90, backgroundColor: "#f1f5f9", borderRadius: 4, marginBottom: 2 },
  instituteName:     { fontSize: 13, fontFamily: "Helvetica-Bold", color: "#25305D", textAlign: "center", textTransform: "uppercase", letterSpacing: 1 },
  instituteSubtitle: { fontSize: 8, color: "#64748b", textAlign: "center", marginTop: 1, letterSpacing: 0.3 },

  dividerThin: { height: 0.4, backgroundColor: "#e2e8f0", marginVertical: 6 },

  certLabel:  { textAlign: "center", fontSize: 7.5, color: "#64748b", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 2 },
  certTitle:  { textAlign: "center", fontSize: 9, fontFamily: "Helvetica-Bold", color: "#1e293b", textTransform: "uppercase", lineHeight: 1.5, marginBottom: 6 },
  certifies:  { textAlign: "center", fontSize: 10, fontFamily: "Helvetica-Bold", color: "#25305D", textTransform: "uppercase", letterSpacing: 2, marginBottom: 10 },

  bodyText: { fontSize: 9.5, color: "#334155", lineHeight: 1.65, textAlign: "justify", marginBottom: 8 },
  bold:     { fontFamily: "Helvetica-Bold" },

  // ── Table ──
  tableWrap: { marginBottom: 4, borderWidth: 0.4, borderColor: "#e2e8f0", borderRadius: 2 },

  // Two header rows: cycle group header + Nota label per cycle
  tableGroupHeader: { flexDirection: "row", backgroundColor: "#25305D", paddingHorizontal: 10, paddingVertical: 4, borderBottomWidth: 0.4, borderBottomColor: "#3d4f7a" },
  tableSubHeader:   { flexDirection: "row", backgroundColor: "#1e3a5f", paddingHorizontal: 10, paddingVertical: 3 },

  thText:       { fontSize: 7, fontFamily: "Helvetica-Bold", color: "#fff", textTransform: "uppercase", letterSpacing: 0.3, textAlign: "center" },
  thSubText:    { fontSize: 6.5, color: "#cbd5e1", textAlign: "center" },
  thSubjectCell:{ flex: 1, fontSize: 7, fontFamily: "Helvetica-Bold", color: "#fff", textTransform: "uppercase", letterSpacing: 0.3 },

  tableRow:    { flexDirection: "row", paddingHorizontal: 10, paddingVertical: 5, borderBottomWidth: 0.4, borderBottomColor: "#f1f5f9" },
  tableRowAlt: { backgroundColor: "#f8fafc" },

  cellSubject: { flex: 1, fontSize: 8.5, color: "#1e293b" },
  cellCycle:   { width: COL_CYCLE, fontSize: 8.5, color: "#1e293b", textAlign: "center" },
  cellNF:      { width: COL_NF, fontSize: 8.5, fontFamily: "Helvetica-Bold", color: "#1e293b", textAlign: "center" },
  cellDesemp:  { width: COL_DESEMP, fontSize: 7.5, fontFamily: "Helvetica-Bold", textAlign: "center" },

  closingText: { fontSize: 9, color: "#334155", lineHeight: 1.65, marginTop: 8, textAlign: "justify" },

  signaturesRow:  { position: "absolute", bottom: 32, left: PAD_L, right: PAD_R, flexDirection: "row", justifyContent: "space-around" },
  signatureItem:  { flex: 1, alignItems: "center", marginHorizontal: 10 },
  signatureImage: { height: 60, width: 150, marginBottom: 3, objectFit: "contain" as any },
  signatureLine:  { width: "40%", height: 0.4, backgroundColor: "#94a3b8", marginBottom: 4 },
  signatureName:  { fontSize: 8, fontFamily: "Helvetica-Bold", color: "#1e293b", textAlign: "center" },
  signatureLabel: { fontSize: 7, color: "#64748b", textAlign: "center", marginTop: 1 },

  footer:     { position: "absolute", bottom: 14, left: PAD_L, right: PAD_R, flexDirection: "row", justifyContent: "space-between", paddingTop: 5, borderTopWidth: 0.5, borderTopColor: "#e2e8f0" },
  footerText: { fontSize: 6.5, color: "#94a3b8" },
  footerPage: { fontSize: 6.5, color: "#94a3b8" },
});

// ── Component ─────────────────────────────────────────────────────────────────

export function CompleteStudentReportPDF({
  studentName,
  gender = "M",
  documentNumber = "",
  courseName = "",
  cycles = [],
  rows = [],
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
  signatures = [],
  passingGrade = 60,
  reportDate,
  city = "Bogotá, D.C.",
}: CompleteStudentReportPDFProps) {
  const date  = reportDate ? new Date(reportDate) : new Date();
  const day   = date.getDate();
  const month = MONTHS_ES[date.getMonth()] ?? "";
  const year  = date.getFullYear();
  const yearWords = year === 2026 ? "dos mil veintiséis"
    : year === 2025 ? "dos mil veinticinco"
    : year === 2027 ? "dos mil veintisiete"
    : String(year);

  const certTitle = headerTitle || `EL SUSCRITO RECTOR DEL ${instituteName.toUpperCase()}`;
  const footer    = footerText  || `${instituteName} — Boletín de Calificaciones`;

  const isFem    = gender === "F" || gender === "femenino" || gender === "Femenino";
  const artEst   = isFem ? "la" : "el";
  const pronIden = isFem ? "identificada" : "identificado";
  const artInt   = isFem ? "de la interesada" : "del interesado";

  const gradeNum = courseName ? (GRADE_NUMS[courseName.toUpperCase()] ?? "") : "";

  return (
    <Document>
      <Page size="A4" style={s.page}>
        <View style={s.contentWrapper}>

          {/* Watermark */}
          {showWatermark && watermarkImageDataUrl
            ? <Image src={watermarkImageDataUrl} style={s.watermarkImg} />
            : null}
          {showWatermark && !watermarkImageDataUrl
            ? <Text style={s.watermarkText}>{watermarkText}</Text>
            : null}

          {/* Header */}
          <View style={s.header}>
            {showLogo && logoDataUrl
              ? <Image src={logoDataUrl} style={s.logoImg} />
              : showLogo
                ? <View style={s.logoPlaceholder} />
                : null}
            {(!showLogo || !logoDataUrl)
              ? <Text style={s.instituteName}>{instituteName}</Text>
              : null}
            {(!showLogo || !logoDataUrl) && instituteSubtitle
              ? <Text style={s.instituteSubtitle}>{instituteSubtitle}</Text>
              : null}
          </View>

          {/* Certificate header */}
          <Text style={s.certLabel}>Boletín de Calificaciones</Text>
          <Text style={s.certTitle}>{certTitle}</Text>
          <Text style={s.certifies}>C E R T I F I C A :</Text>

          {/* Body */}
          <Text style={s.bodyText}>
            {"    "}{"Que "}{artEst}{" estudiante "}
            <Text style={s.bold}>{studentName}</Text>
            {", "}{pronIden}{" con el documento N°"}
            <Text style={s.bold}>{documentNumber || "—"}</Text>
            {courseName ? `, cursó el período académico ${year} en el grado ${courseName.toUpperCase()}` : `, cursó el período académico ${year}`}
            {gradeNum ? ` (${gradeNum}°)` : ""}
            {", hasta el día "}
            <Text style={s.bold}>{day} de {month} del {year}</Text>
            {", obteniendo las siguientes valoraciones:"}
          </Text>

          {/* Grades table */}
          <View style={s.tableWrap}>
            {/* Row 1: Group headers — Asignatura | cycles | N.F. | Desempeño */}
            <View style={s.tableGroupHeader}>
              <Text style={[s.thSubjectCell]}>Asignatura</Text>
              {cycles.map((c) => (
                <Text key={c.id} style={[s.thText, { width: COL_CYCLE }]}>
                  {shortCycleName(c.name)}
                </Text>
              ))}
              <Text style={[s.thText, { width: COL_NF }]}>N.F.</Text>
              <Text style={[s.thText, { width: COL_DESEMP }]}>Desempeño</Text>
            </View>

            {/* Data rows */}
            {rows.map((row, i) => {
              const hasNF    = row.finalGrade !== null;
              const level    = hasNF ? performanceLevel(row.finalGrade as number, passingGrade) : "—";
              const desempColor = hasNF ? levelColor(level) : "#94a3b8";
              return (
                <View key={i} style={[s.tableRow, i % 2 === 1 ? s.tableRowAlt : {}]}>
                  <Text style={s.cellSubject}>{row.subjectName}</Text>
                  {row.cycleGrades.map((g, ci) => (
                    <Text key={ci} style={[s.cellCycle, { color: g === null ? "#94a3b8" : "#1e293b" }]}>
                      {g === null ? "—" : String(g)}
                    </Text>
                  ))}
                  <Text style={[s.cellNF, { color: hasNF ? "#1e293b" : "#94a3b8" }]}>
                    {hasNF ? String(row.finalGrade) : "—"}
                  </Text>
                  <Text style={[s.cellDesemp, { color: desempColor }]}>{level}</Text>
                </View>
              );
            })}
          </View>

          <View style={s.dividerThin} />

          {/* Closing text */}
          <Text style={s.closingText}>
            {"    "}{"La presente se expide a solicitud "}{artInt}{" en "}{city}{", a los "}
            <Text style={s.bold}>{day === 1 ? `un (1) día` : `${numberToWords(day)} (${day}) días`}</Text>
            {" del mes de "}
            <Text style={s.bold}>{month}</Text>
            {" del año "}
            <Text style={s.bold}>{yearWords} ({year})</Text>
            {"."}
          </Text>

        </View>

        {/* Signatures */}
        {signatures.length > 0 ? (
          <View style={s.signaturesRow}>
            {signatures.map((sig) => (
              <View key={sig.id} style={s.signatureItem}>
                {sig.signatureImageUrl
                  ? <Image src={sig.signatureImageUrl} style={s.signatureImage} />
                  : null}
                {sig.showLine ? <View style={s.signatureLine} /> : null}
                <Text style={s.signatureName}>{sig.name}</Text>
                <Text style={s.signatureLabel}>{sig.label}</Text>
              </View>
            ))}
          </View>
        ) : null}

        {/* Footer */}
        <View style={s.footer}>
          <Text style={s.footerText}>{footer}</Text>
          {showPageNumbers ? <Text style={s.footerPage}>Pág. 1</Text> : null}
        </View>
      </Page>
    </Document>
  );
}
