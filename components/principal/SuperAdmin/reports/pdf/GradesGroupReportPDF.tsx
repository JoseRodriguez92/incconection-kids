import React from "react";
import { Document, Page, Text, View, Image, StyleSheet } from "@react-pdf/renderer";
import type { ReportSignature } from "@/components/principal/SuperAdmin/reports/reportConfig.types";

// ── Types ──────────────────────────────────────────────────────────────────────

export interface GroupGradeRow {
  studentName: string;
  documentNumber?: string | null;
  grades: Record<string, number>; // subjectName → grade
  photoDataUrl?: string | null;
}

export interface GradesGroupReportPDFProps {
  rows: GroupGradeRow[];
  subjects: string[];
  maxGrades: Record<string, number>; // subjectName → maxGrade (default 120)
  instituteName: string;
  instituteSubtitle?: string;
  periodName: string;
  groupName: string;
  courseName?: string;
  cycleName?: string;
  reportType: "parcial" | "completo";
  generatedAt: string;
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
  disclaimer?: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function perfLevel(grade: number, max: number, passing: number): string {
  const n = max > 0 ? (grade / max) * 120 : grade;
  if (n < passing) return "REP";
  if (n < 84) return "BAJO";
  if (n < 95) return "BÁS";
  if (n < 107) return "ALT";
  return "SUP";
}

function levelColor(lv: string): string {
  switch (lv) {
    case "SUP":  return "#15803d";
    case "ALT":  return "#1d4ed8";
    case "BÁS":  return "#78350f";
    case "BAJO": return "#b45309";
    default:     return "#b91c1c";
  }
}

// ── Layout constants ──────────────────────────────────────────────────────────

const PAGE_W   = 841.89; // A4 landscape width in pt
const PAGE_H   = 595.28; // A4 landscape height in pt
const PAD_H    = 22;     // horizontal padding (left/right)
const PAD_T    = 18;     // top padding
const PAD_B    = 30;     // bottom padding (space for footer)
const PAD_R    = 34;     // right padding — extra strip for sidebar

const NAME_COL   = 150;
const DOC_COL    = 42;
const ROW_H      = 26;
const PHOTO_SIZE = 18; // profile photo diameter in each row
const HDR_H      = 80; // height of header row = visual length of rotated subject names
const HDR_FONT   = 6;  // font size for rotated header text

// Sidebar: rotated text centered in right strip — same math as StudentsReportPDF
const SIDEBAR_LEFT = PAGE_W - PAD_R / 2 - (PAGE_H - 20) / 2; // ≈ 523
const SIDEBAR_TOP  = PAGE_H / 2 - 4;                          // ≈ 293

const USABLE_W = PAGE_W - PAD_H - PAD_R; // space for table content

// ── Static styles ─────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    fontSize: 9,
    color: "#1e293b",
    paddingTop:    PAD_T,
    paddingBottom: PAD_B,
    paddingLeft:   PAD_H,
    paddingRight:  PAD_R,
  },

  // Watermark
  watermarkImgWrap: { position: "absolute", top: 0, left: 0, width: PAGE_W, height: PAGE_H },
  watermarkImg:     { width: PAGE_W, height: PAGE_H, objectFit: "cover" as any, opacity: 0.35 },
  watermarkTxtWrap: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, justifyContent: "center", alignItems: "center" },
  watermarkTxt:     { fontSize: 72, fontFamily: "Helvetica-Bold", color: "#00000060", transform: "rotate(-25deg)" },

  // Sidebar divider + text (same pattern as StudentsReportPDF)
  sidebarDivider: { position: "absolute", top: PAD_T, bottom: PAD_B, right: PAD_R - 4, width: 0.5, backgroundColor: "#e2e8f0" },
  sidebarTxt: {
    position: "absolute",
    left: SIDEBAR_LEFT,
    top: SIDEBAR_TOP,
    width: PAGE_H - 20,
    fontSize: 5.5,
    color: "#94a3b8",
    textAlign: "center",
    transform: "rotate(-90deg)",
    letterSpacing: 0.3,
  },

  // Header — columna centrada, logo prominente
  header:          { flexDirection: "column", alignItems: "center", marginBottom: 8 },
  logoImg:         { width: 380, height: 72, objectFit: "contain" as any, marginBottom: 4 },
  logoPlaceholder: { width: 380, height: 72, backgroundColor: "#f1f5f9", borderRadius: 4, marginBottom: 4 },
  instName:        { fontSize: 13, fontFamily: "Helvetica-Bold", color: "#25305D", textAlign: "center", textTransform: "uppercase", letterSpacing: 0.8 },
  instSub:         { fontSize: 7, color: "#64748b", textAlign: "center", marginTop: 1 },

  divider: { height: 0.75, backgroundColor: "#25305D", marginBottom: 5 },

  // Disclaimer box
  disclaimerBox: { flexDirection: "row", backgroundColor: "#fffbeb", borderWidth: 0.5, borderColor: "#f59e0b", borderRadius: 3, paddingHorizontal: 8, paddingVertical: 4, marginBottom: 6 },
  disclaimerTxt: { fontSize: 6, color: "#92400e", flex: 1, lineHeight: 1.5 },

  // Meta row
  metaRow:   { flexDirection: "row", justifyContent: "space-between", marginBottom: 6 },
  metaGroup: { flexDirection: "row", gap: 12 },
  metaItem:  { flexDirection: "row", alignItems: "center", gap: 3 },
  metaLabel: { fontSize: 6.5, color: "#64748b", fontFamily: "Helvetica-Bold", textTransform: "uppercase" },
  metaVal:   { fontSize: 7, color: "#1e293b" },

  // Table
  tableHdr:    { flexDirection: "row", backgroundColor: "#25305D", height: HDR_H, alignItems: "center" },
  tableHdrTxt: { fontSize: 7, fontFamily: "Helvetica-Bold", color: "#fff", textTransform: "uppercase", textAlign: "center" },
  row:         { flexDirection: "row", height: ROW_H, alignItems: "center", borderBottomWidth: 0.3, borderBottomColor: "#e2e8f0" },
  rowAlt:      { backgroundColor: "#f8fafc" },
  cellName:    { paddingHorizontal: 3, fontSize: 6.5, color: "#1e293b" },
  cellDoc:     { paddingHorizontal: 2, fontSize: 6, color: "#64748b", textAlign: "center" },
  cellGrade:   { textAlign: "center", fontSize: 6.5, color: "#1e293b" },
  cellLevel:   { textAlign: "center", fontSize: 5, fontFamily: "Helvetica-Bold" },

  // Signatures — absolute, justo encima del footer
  signaturesRow: { position: "absolute", bottom: 22, left: PAD_H, right: PAD_R, flexDirection: "row", justifyContent: "space-around" },
  sigItem:       { flex: 1, alignItems: "center", marginHorizontal: 6 },
  sigImg:        { height: 60, width: 150, marginBottom: 2, objectFit: "contain" as any },
  sigLine:       { width: "40%", height: 0.4, backgroundColor: "#94a3b8", marginBottom: 3 },
  sigName:       { fontSize: 7, fontFamily: "Helvetica-Bold", color: "#1e293b", textAlign: "center" },
  sigLabel:      { fontSize: 6, color: "#94a3b8", textAlign: "center" },

  // Footer — absolute, pegado al fondo de la página
  footerWrap: { position: "absolute", bottom: 10, left: PAD_H, right: PAD_R, flexDirection: "row", justifyContent: "space-between", borderTopWidth: 0.75, borderTopColor: "#25305D", paddingTop: 4 },
  footerTxt:  { fontSize: 7, color: "#25305D", fontFamily: "Helvetica-Bold" },
});

// ── Component ─────────────────────────────────────────────────────────────────

export function GradesGroupReportPDF({
  rows, subjects, maxGrades,
  instituteName, periodName, groupName, courseName, cycleName, reportType,
  generatedAt,
  showLogo = true, logoDataUrl,
  headerTitle, footerText, showPageNumbers = true,
  showWatermark = false, watermarkText = "CONFIDENCIAL", watermarkImageDataUrl,
  sidebarText, signatures = [],
  showPerformanceLevel = true, passingGrade = 60,
  disclaimer,
}: GradesGroupReportPDFProps) {

  const subjectColW = Math.max(32, Math.floor((USABLE_W - NAME_COL - DOC_COL) / subjects.length));
  const title = headerTitle
    || (reportType === "parcial"
      ? `Boletín Parcial${cycleName ? ` — Ciclo ${cycleName}` : ""}`
      : "Boletín Final de Notas");
  const footer = footerText || `${instituteName} — ${title}`;

  return (
    <Document title={title} author={instituteName}>
      <Page size="A4" orientation="landscape" style={s.page}>

        {/* ── Watermark ── */}
        {showWatermark && watermarkImageDataUrl ? (
          <View style={s.watermarkImgWrap} fixed>
            <Image src={watermarkImageDataUrl} style={s.watermarkImg} />
          </View>
        ) : showWatermark ? (
          <View style={s.watermarkTxtWrap} fixed>
            <Text style={s.watermarkTxt}>{watermarkText}</Text>
          </View>
        ) : null}

        {/* ── Sidebar ── */}
        {sidebarText ? <View style={s.sidebarDivider} fixed /> : null}
        {sidebarText ? <Text style={s.sidebarTxt} fixed>{sidebarText}</Text> : null}

        {/* ── Header — solo logo centrado ── */}
        <View style={s.header}>
          {showLogo && (
            logoDataUrl
              ? <Image src={logoDataUrl} style={s.logoImg} />
              : <View style={s.logoPlaceholder} />
          )}
        </View>

        <View style={s.divider} />

        {/* ── Disclaimer informativo ── */}
        {disclaimer ? (
          <View style={s.disclaimerBox}>
            <Text style={s.disclaimerTxt}>{disclaimer}</Text>
          </View>
        ) : null}

        {/* ── Meta row ── */}
        <View style={s.metaRow}>
          <View style={s.metaGroup}>
            <View style={s.metaItem}>
              <Text style={s.metaLabel}>Período: </Text>
              <Text style={s.metaVal}>{periodName}</Text>
            </View>
            {cycleName ? (
              <View style={s.metaItem}>
                <Text style={s.metaLabel}>Ciclo: </Text>
                <Text style={s.metaVal}>{cycleName}</Text>
              </View>
            ) : null}
            {courseName ? (
              <View style={s.metaItem}>
                <Text style={s.metaLabel}>Curso: </Text>
                <Text style={s.metaVal}>{courseName}</Text>
              </View>
            ) : null}
            <View style={s.metaItem}>
              <Text style={s.metaLabel}>Grupo: </Text>
              <Text style={s.metaVal}>{groupName}</Text>
            </View>
            <View style={s.metaItem}>
              <Text style={s.metaLabel}>Estudiantes: </Text>
              <Text style={s.metaVal}>{rows.length}</Text>
            </View>
          </View>
          <View style={{ alignItems: "flex-end", gap: 2 }}>
            <Text style={[s.metaLabel, { color: "#25305D" }]}>{title}</Text>
            <Text style={s.metaVal}>{generatedAt}</Text>
          </View>
        </View>

        {/* ── Table header ── */}
        <View style={s.tableHdr}>
          <Text style={[s.tableHdrTxt, { width: NAME_COL, paddingHorizontal: 3, borderRightWidth: 0.5, borderRightColor: "#4a5b8a" }]}>Estudiante</Text>
          <Text style={[s.tableHdrTxt, { width: DOC_COL, borderRightWidth: 0.5, borderRightColor: "#4a5b8a" }]}>Doc.</Text>
          {subjects.map((subj, idx) => (
            <View key={subj} style={{
              width: subjectColW,
              height: HDR_H,
              overflow: "hidden",
              borderRightWidth: idx < subjects.length - 1 ? 0.5 : 0,
              borderRightColor: "#4a5b8a",
            }}>
              <Text style={{
                position: "absolute",
                left:  (subjectColW - HDR_H) / 2,
                top:   (HDR_H - HDR_FONT) / 2,
                width: HDR_H,
                fontSize: HDR_FONT,
                fontFamily: "Helvetica-Bold",
                color: "#fff",
                textAlign: "center",
                transform: "rotate(-90deg)",
                letterSpacing: 0.3,
              }}>
                {subj}
              </Text>
            </View>
          ))}
        </View>

        {/* ── Data rows ── */}
        {rows.map((row, i) => (
          <View key={i} style={[s.row, i % 2 === 1 ? s.rowAlt : {}]}>
            <View style={{ width: NAME_COL, height: ROW_H, flexDirection: "row", alignItems: "center", paddingHorizontal: 3, borderRightWidth: 0.5, borderRightColor: "#e2e8f0" }}>
              {row.photoDataUrl ? (
                <Image src={row.photoDataUrl} style={{ width: PHOTO_SIZE, height: PHOTO_SIZE, borderRadius: PHOTO_SIZE / 2, marginRight: 3, flexShrink: 0 }} />
              ) : (
                <View style={{ width: PHOTO_SIZE, height: PHOTO_SIZE, borderRadius: PHOTO_SIZE / 2, backgroundColor: "#cbd5e1", marginRight: 3, flexShrink: 0 }} />
              )}
              <Text style={[s.cellName, { flex: 1, paddingHorizontal: 0 }]}>{row.studentName}</Text>
            </View>
            <Text style={[s.cellDoc, { width: DOC_COL, borderRightWidth: 0.5, borderRightColor: "#e2e8f0" }]}>
              {row.documentNumber ?? "—"}
            </Text>
            {subjects.map((subj, idx) => {
              const grade    = row.grades[subj];
              const maxGr    = maxGrades[subj] ?? 120;
              const hasGrade = grade !== undefined;
              const level    = hasGrade ? perfLevel(grade, maxGr, passingGrade) : null;
              return (
                <View key={subj} style={{
                  width: subjectColW,
                  alignItems: "center",
                  justifyContent: "center",
                  borderRightWidth: idx < subjects.length - 1 ? 0.5 : 0,
                  borderRightColor: "#e2e8f0",
                  height: ROW_H,
                }}>
                  <Text style={[s.cellGrade, !hasGrade ? { color: "#94a3b8" } : {}]}>
                    {hasGrade ? grade : "—"}
                  </Text>
                  {showPerformanceLevel && level ? (
                    <Text style={[s.cellLevel, { color: levelColor(level) }]}>{level}</Text>
                  ) : null}
                </View>
              );
            })}
          </View>
        ))}

        {/* ── Convenciones de desempeño ── */}
        {showPerformanceLevel ? (
          <View style={{ flexDirection: "row", alignItems: "center", marginTop: 6, gap: 2 }}>
            <Text style={{ fontSize: 5.5, color: "#64748b", fontFamily: "Helvetica-Bold", marginRight: 6, textTransform: "uppercase", letterSpacing: 0.3 }}>
              Convenciones:
            </Text>
            {([
              { code: "SUP",  label: "Superior",  range: "107–120", color: "#15803d" },
              { code: "ALT",  label: "Alto",      range: "95–106",  color: "#1d4ed8" },
              { code: "BÁS",  label: "Básico",    range: "84–94",   color: "#78350f" },
              { code: "BAJO", label: "Bajo",      range: "60–83",   color: "#b45309" },
              { code: "REP",  label: "Reprobado", range: "< 60",    color: "#b91c1c" },
            ] as const).map((lv) => (
              <View key={lv.code} style={{ flexDirection: "row", alignItems: "center", marginRight: 10 }}>
                <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: lv.color, marginRight: 3 }} />
                <Text style={{ fontSize: 5.5, fontFamily: "Helvetica-Bold", color: lv.color }}>{lv.code}</Text>
                <Text style={{ fontSize: 5.5, color: "#64748b", marginLeft: 2 }}>{lv.label}</Text>
                <Text style={{ fontSize: 5, color: "#94a3b8", marginLeft: 2 }}>({lv.range})</Text>
              </View>
            ))}
          </View>
        ) : null}

        {/* ── Signatures ── */}
        {signatures.length > 0 ? (
          <View style={s.signaturesRow}>
            {signatures.map((sig) => (
              <View key={sig.id} style={s.sigItem}>
                {sig.signatureImageUrl ? (
                  <Image src={sig.signatureImageUrl} style={s.sigImg} />
                ) : null}
                {sig.showLine ? <View style={s.sigLine} /> : null}
                <Text style={s.sigName}>{sig.name}</Text>
                <Text style={s.sigLabel}>{sig.label}</Text>
              </View>
            ))}
          </View>
        ) : null}

        {/* ── Footer — in normal flow ── */}
        <View style={s.footerWrap}>
          <Text style={s.footerTxt}>{footer}</Text>
          {showPageNumbers ? <Text style={s.footerTxt}>{generatedAt}</Text> : null}
        </View>

      </Page>
    </Document>
  );
}
