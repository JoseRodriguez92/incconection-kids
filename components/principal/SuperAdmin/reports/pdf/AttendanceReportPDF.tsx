import React from "react";
import { Document, Page, Text, View, Image, StyleSheet } from "@react-pdf/renderer";
import type { ReportSignature } from "@/components/principal/SuperAdmin/reports/reportConfig.types";

// ── Types ──────────────────────────────────────────────────────────────────────

export interface AttendanceSummaryRow {
  student_name: string;
  document?: string | null;
  group_name: string;
  course_name: string;
  total: number;
  present: number;
  late: number;
  absent: number;
  percent: number;
}

export interface AttendanceDetailRow {
  session_date: string;
  subject_name: string;
  class_name: string;
  status: string;
  minutes_late?: number | null;
  observation?: string | null;
}

export interface AttendanceReportPDFProps {
  instituteName: string;
  logoDataUrl?: string | null;
  periodName: string;
  mode: "group" | "student";
  // group mode
  courseName?: string;
  groupName?: string;
  rows?: AttendanceSummaryRow[];
  // student mode
  studentName?: string;
  studentDoc?: string;
  details?: AttendanceDetailRow[];
  totalSessions?: number;
  totalPresent?: number;
  totalLate?: number;
  totalAbsent?: number;
  percent?: number;
  generatedAt: string;
  // base config
  showLogo?: boolean;
  headerTitle?: string;
  footerText?: string;
  showPageNumbers?: boolean;
  showWatermark?: boolean;
  watermarkText?: string;
  watermarkImageDataUrl?: string | null;
  sidebarText?: string;
  signatures?: ReportSignature[];
  // attendance-specific
  showPercentage?: boolean;
  alertThreshold?: number;
}

// ── Layout ─────────────────────────────────────────────────────────────────────
const PAGE_W = 841.89;
const PAGE_H = 595.28;
const PAD_H  = 36;
const PAD_R  = 56;
const PAD_T  = 12;
const PAD_B  = 32;

const SIDEBAR_LEFT = 516;
const SIDEBAR_TOP  = (PAGE_H / 2) - 4;

// ── Styles ─────────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    fontSize: 9,
    paddingTop: PAD_T,
    paddingBottom: PAD_B,
    paddingLeft: PAD_H,
    paddingRight: PAD_R,
    color: "#1e293b",
  },
  watermarkImageWrap: { position: "absolute", top: 0, left: 0, width: PAGE_W, height: PAGE_H },
  watermarkImage: { width: PAGE_W, height: PAGE_H, objectFit: "cover", opacity: 0.30 },
  watermarkWrap: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, justifyContent: "center", alignItems: "center" },
  watermarkTextStyle: { fontSize: 96, fontFamily: "Helvetica-Bold", color: "#00000018", transform: "rotate(-45deg)" },
  sidebarDivider: { position: "absolute", top: PAD_T, bottom: PAD_B, right: PAD_R - 4, width: 0.5, backgroundColor: "#e2e8f0" },
  sidebarText: {
    position: "absolute", left: SIDEBAR_LEFT, top: SIDEBAR_TOP,
    width: PAGE_H - 20, fontSize: 5.5, color: "#94a3b8",
    textAlign: "center", transform: "rotate(-90deg)", letterSpacing: 0.3,
  },
  header: {
    flexDirection: "row", alignItems: "center",
    paddingBottom: 6, marginBottom: 8,
    borderBottomWidth: 2, borderBottomColor: "#e2e8f0",
  },
  logo: { width: 96, height: 96, objectFit: "contain", marginRight: 16, flexShrink: 0 },
  headerInfo: { flex: 1, justifyContent: "center" },
  reportTitle: { fontSize: 13, fontFamily: "Helvetica-Bold", color: "#25305D" },
  headerMetaRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 10 },
  metaText: { fontSize: 7.5, color: "#94a3b8" },
  metaTotal: { fontSize: 9, fontFamily: "Helvetica-Bold", color: "#1e293b" },
  filterRow: {
    flexDirection: "row", backgroundColor: "#f8fafc",
    borderWidth: 1, borderColor: "#e2e8f0", borderRadius: 4,
    padding: 6, marginBottom: 8,
  },
  filterItem: { flexDirection: "row", marginRight: 16, alignItems: "center" },
  filterDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: "#25305D", marginRight: 4 },
  filterLabel: { fontFamily: "Helvetica-Bold", fontSize: 7.5, color: "#475569" },
  filterValue: { fontSize: 7.5, color: "#64748b" },
  // Stats bar (student mode)
  statsBar: { flexDirection: "row", marginBottom: 8 },
  statBox: { flex: 1, borderWidth: 1, borderColor: "#e2e8f0", borderRadius: 4, padding: 6, alignItems: "center", marginRight: 4 },
  statValue: { fontSize: 14, fontFamily: "Helvetica-Bold", color: "#25305D" },
  statLabel: { fontSize: 6.5, color: "#94a3b8", marginTop: 2, textAlign: "center" },
  // Table
  tableHeader: { flexDirection: "row", backgroundColor: "#25305D", paddingVertical: 5, paddingHorizontal: 8, borderRadius: 3 },
  tableRow: { flexDirection: "row", paddingVertical: 5, paddingHorizontal: 8, borderBottomWidth: 0.5, borderBottomColor: "#e2e8f0" },
  tableRowAlt: { backgroundColor: "#f8fafc" },
  thCell: { fontFamily: "Helvetica-Bold", fontSize: 7, color: "#ffffff", textTransform: "uppercase", letterSpacing: 0.5 },
  tdCell: { fontSize: 8, color: "#374151" },
  tdMuted: { fontSize: 8, color: "#94a3b8" },
  tdGreen: { fontSize: 8, color: "#16a34a", fontFamily: "Helvetica-Bold" },
  tdAmber: { fontSize: 8, color: "#d97706", fontFamily: "Helvetica-Bold" },
  tdRed:   { fontSize: 8, color: "#dc2626", fontFamily: "Helvetica-Bold" },
  groupSep: {
    flexDirection: "row", alignItems: "center", backgroundColor: "#eef0f7",
    paddingVertical: 4, paddingHorizontal: 8, marginTop: 6,
    borderLeftWidth: 3, borderLeftColor: "#25305D",
  },
  groupSepText: { fontSize: 7.5, fontFamily: "Helvetica-Bold", color: "#25305D", letterSpacing: 0.4 },
  summaryBar: {
    marginTop: 10, flexDirection: "row", alignItems: "center",
    backgroundColor: "#eef0f7", borderLeftWidth: 3, borderLeftColor: "#25305D",
    borderRadius: 3, padding: 6,
  },
  summaryText: { fontSize: 8, color: "#25305D", fontFamily: "Helvetica-Bold" },
  signaturesRow: { flexDirection: "row", justifyContent: "space-around", marginTop: 24, paddingTop: 4 },
  signatureItem: { flex: 1, alignItems: "center", marginHorizontal: 10 },
  signatureImage: { height: 30, marginBottom: 3, objectFit: "contain" as any },
  signatureLine: { width: "75%", height: 0.75, backgroundColor: "#25305D", marginBottom: 5 },
  signatureName: { fontSize: 8, fontFamily: "Helvetica-Bold", color: "#1e293b", textAlign: "center" },
  signatureLabel: { fontSize: 7, color: "#64748b", textAlign: "center", marginTop: 1 },
  footer: {
    position: "absolute", bottom: 16, left: PAD_H, right: PAD_R,
    flexDirection: "row", justifyContent: "space-between",
    paddingTop: 5, borderTopWidth: 0.5, borderTopColor: "#e2e8f0",
  },
  footerText: { fontSize: 7, color: "#94a3b8" },
});

// ── Helpers ────────────────────────────────────────────────────────────────────
const statusLabel = (st: string) =>
  st === "present" ? "Presente" : st === "late" ? "Tardanza" : st === "absent" ? "Ausente" : st;

const percentStyle = (p: number, threshold: number) =>
  p >= threshold ? s.tdGreen : p >= threshold * 0.85 ? s.tdAmber : s.tdRed;

// ── Component ──────────────────────────────────────────────────────────────────

export function AttendanceReportPDF({
  instituteName, logoDataUrl, periodName, mode,
  courseName, groupName,
  rows = [],
  studentName, studentDoc, details = [],
  totalSessions = 0, totalPresent = 0, totalLate = 0, totalAbsent = 0, percent = 0,
  generatedAt,
  showLogo = true,
  headerTitle,
  footerText,
  showPageNumbers = true,
  showWatermark = false,
  watermarkText = "CONFIDENCIAL",
  watermarkImageDataUrl,
  sidebarText,
  signatures = [],
  showPercentage = true,
  alertThreshold = 80,
}: AttendanceReportPDFProps) {

  const title = headerTitle ||
    (mode === "group" ? "Reporte de Asistencia" : `Reporte de Asistencia — ${studentName ?? "Estudiante"}`);
  const footer = footerText || `${instituteName} — Reporte de Asistencia`;

  return (
    <Document title={`Asistencia — ${instituteName}`} author={instituteName}>
      <Page size="A4" orientation="landscape" style={s.page}>

        {/* ── 1. Watermark ── */}
        {showWatermark && watermarkImageDataUrl ? (
          <View style={s.watermarkImageWrap} fixed>
            <Image src={watermarkImageDataUrl} style={s.watermarkImage} />
          </View>
        ) : showWatermark ? (
          <View style={s.watermarkWrap} fixed>
            <Text style={s.watermarkTextStyle}>{watermarkText}</Text>
          </View>
        ) : null}

        {/* ── 2. Sidebar divider ── */}
        {sidebarText ? <View style={s.sidebarDivider} fixed /> : null}

        {/* ── 3. Header ── */}
        <View style={s.header}>
          {showLogo && logoDataUrl ? <Image src={logoDataUrl} style={s.logo} /> : null}
          <View style={s.headerInfo}>
            <Text style={s.reportTitle}>{title}</Text>
            <View style={s.headerMetaRow}>
              <Text style={s.metaText}>Generado: {generatedAt}</Text>
              {mode === "group"
                ? <Text style={s.metaTotal}>{rows.length} estudiante{rows.length !== 1 ? "s" : ""}</Text>
                : studentDoc ? <Text style={s.metaText}>{studentDoc}</Text> : null
              }
            </View>
          </View>
        </View>

        {/* ── 4. Filter chips ── */}
        <View style={s.filterRow}>
          <View style={s.filterItem}>
            <View style={s.filterDot} />
            <Text style={s.filterLabel}>Período: </Text>
            <Text style={s.filterValue}>{periodName}</Text>
          </View>
          {courseName && (
            <View style={s.filterItem}>
              <View style={s.filterDot} />
              <Text style={s.filterLabel}>Curso: </Text>
              <Text style={s.filterValue}>{courseName}</Text>
            </View>
          )}
          {groupName && (
            <View style={s.filterItem}>
              <View style={s.filterDot} />
              <Text style={s.filterLabel}>Grupo: </Text>
              <Text style={s.filterValue}>{groupName}</Text>
            </View>
          )}
          {mode === "student" && studentName && (
            <View style={s.filterItem}>
              <View style={s.filterDot} />
              <Text style={s.filterLabel}>Estudiante: </Text>
              <Text style={s.filterValue}>{studentName}</Text>
            </View>
          )}
        </View>

        {/* ── GROUP MODE ── */}
        {mode === "group" && (
          <View>
            <View style={s.tableHeader}>
              <Text style={[s.thCell, { width: "4%" }]}>#</Text>
              <Text style={[s.thCell, { width: "28%" }]}>Estudiante</Text>
              <Text style={[s.thCell, { width: "18%" }]}>Documento</Text>
              <Text style={[s.thCell, { width: "13%" }]}>Grupo</Text>
              <Text style={[s.thCell, { width: "9%", textAlign: "center" }]}>Total</Text>
              <Text style={[s.thCell, { width: "9%", textAlign: "center" }]}>P</Text>
              <Text style={[s.thCell, { width: "9%", textAlign: "center" }]}>T</Text>
              <Text style={[s.thCell, { width: "9%", textAlign: "center" }]}>A</Text>
              {showPercentage && <Text style={[s.thCell, { width: "11%", textAlign: "right" }]}>% Asist.</Text>}
            </View>

            {(() => {
              const items: React.ReactNode[] = [];
              let lastGroup = "";
              let altIdx = 0;
              rows.forEach((row, i) => {
                if (!groupName && row.group_name !== lastGroup) {
                  lastGroup = row.group_name;
                  altIdx = 0;
                  items.push(
                    <View key={`sep-${i}`} style={s.groupSep} wrap={false}>
                      <Text style={s.groupSepText}>{row.course_name}  —  Grupo {row.group_name}</Text>
                    </View>
                  );
                }
                const isAlt = altIdx % 2 === 1;
                altIdx++;
                const pStyle = percentStyle(row.percent, alertThreshold);
                items.push(
                  <View key={i} style={[s.tableRow, isAlt ? s.tableRowAlt : {}]} wrap={false}>
                    <Text style={[s.tdMuted, { width: "4%" }]}>{i + 1}</Text>
                    <Text style={[s.tdCell, { width: "28%" }]}>{row.student_name}</Text>
                    <Text style={[s.tdCell, { width: "18%" }]}>{row.document ?? "—"}</Text>
                    <Text style={[s.tdCell, { width: "13%" }]}>{row.group_name}</Text>
                    <Text style={[s.tdMuted, { width: "9%",  textAlign: "center" }]}>{row.total}</Text>
                    <Text style={[s.tdGreen, { width: "9%",  textAlign: "center" }]}>{row.present}</Text>
                    <Text style={[s.tdAmber, { width: "9%",  textAlign: "center" }]}>{row.late}</Text>
                    <Text style={[s.tdRed,   { width: "9%",  textAlign: "center" }]}>{row.absent}</Text>
                    {showPercentage && (
                      <Text style={[pStyle, { width: "11%", textAlign: "right" }]}>{row.percent}%</Text>
                    )}
                  </View>
                );
              });
              return items;
            })()}

            <View style={s.summaryBar}>
              <Text style={s.summaryText}>
                {rows.length} estudiante{rows.length !== 1 ? "s" : ""}
                {courseName ? ` · ${courseName}` : ""}
                {groupName  ? ` · Grupo ${groupName}` : ""}
              </Text>
            </View>
          </View>
        )}

        {/* ── STUDENT MODE ── */}
        {mode === "student" && (
          <View>
            <View style={s.statsBar}>
              <View style={[s.statBox, { borderColor: "#e2e8f0", marginRight: 4 }]}>
                <Text style={s.statValue}>{totalSessions}</Text>
                <Text style={s.statLabel}>Clases total</Text>
              </View>
              <View style={[s.statBox, { borderColor: "#bbf7d0", marginRight: 4 }]}>
                <Text style={[s.statValue, { color: "#16a34a" }]}>{totalPresent}</Text>
                <Text style={s.statLabel}>Presentes</Text>
              </View>
              <View style={[s.statBox, { borderColor: "#fde68a", marginRight: 4 }]}>
                <Text style={[s.statValue, { color: "#d97706" }]}>{totalLate}</Text>
                <Text style={s.statLabel}>Tardanzas</Text>
              </View>
              <View style={[s.statBox, { borderColor: "#fecaca", marginRight: 4 }]}>
                <Text style={[s.statValue, { color: "#dc2626" }]}>{totalAbsent}</Text>
                <Text style={s.statLabel}>Ausencias</Text>
              </View>
              {showPercentage && (
                <View style={[s.statBox, { borderColor: "#c7d2fe", marginRight: 0 }]}>
                  <Text style={[s.statValue, percentStyle(percent, alertThreshold)]}>{percent}%</Text>
                  <Text style={s.statLabel}>% Asistencia</Text>
                </View>
              )}
            </View>

            <View style={s.tableHeader}>
              <Text style={[s.thCell, { width: "4%" }]}>#</Text>
              <Text style={[s.thCell, { width: "11%" }]}>Fecha</Text>
              <Text style={[s.thCell, { width: "23%" }]}>Materia</Text>
              <Text style={[s.thCell, { width: "22%" }]}>Clase</Text>
              <Text style={[s.thCell, { width: "13%" }]}>Estado</Text>
              <Text style={[s.thCell, { width: "9%",  textAlign: "center" }]}>Min tard.</Text>
              <Text style={[s.thCell, { width: "18%" }]}>Observación</Text>
            </View>

            {(() => {
              const items: React.ReactNode[] = [];
              let lastSubject = "";
              let altIdx = 0;
              details.forEach((d, i) => {
                if (d.subject_name !== lastSubject) {
                  lastSubject = d.subject_name;
                  altIdx = 0;
                  items.push(
                    <View key={`sep-${i}`} style={s.groupSep} wrap={false}>
                      <Text style={s.groupSepText}>{d.subject_name}</Text>
                    </View>
                  );
                }
                const isAlt = altIdx % 2 === 1;
                altIdx++;
                const stStyle = d.status === "present" ? s.tdGreen : d.status === "late" ? s.tdAmber : s.tdRed;
                items.push(
                  <View key={i} style={[s.tableRow, isAlt ? s.tableRowAlt : {}]} wrap={false}>
                    <Text style={[s.tdMuted, { width: "4%" }]}>{i + 1}</Text>
                    <Text style={[s.tdCell,  { width: "11%" }]}>{d.session_date}</Text>
                    <Text style={[s.tdCell,  { width: "23%" }]}>{d.subject_name}</Text>
                    <Text style={[s.tdCell,  { width: "22%" }]}>{d.class_name}</Text>
                    <Text style={[stStyle,   { width: "13%" }]}>{statusLabel(d.status)}</Text>
                    <Text style={[s.tdMuted, { width: "9%",  textAlign: "center" }]}>
                      {d.minutes_late ? `${d.minutes_late} min` : "—"}
                    </Text>
                    <Text style={[s.tdMuted, { width: "18%" }]}>{d.observation ?? "—"}</Text>
                  </View>
                );
              });
              return items;
            })()}
          </View>
        )}

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

        {/* ── Sidebar text ── */}
        {sidebarText ? <Text style={s.sidebarText} fixed>{sidebarText}</Text> : null}

        {/* ── Footer ── */}
        <View style={s.footer} fixed>
          <Text style={s.footerText}>{footer}</Text>
          {showPageNumbers && (
            <Text
              style={s.footerText}
              render={({ pageNumber, totalPages }) => `Página ${pageNumber} de ${totalPages}`}
            />
          )}
        </View>

      </Page>
    </Document>
  );
}
