import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  Image,
  StyleSheet,
} from "@react-pdf/renderer";
import type { ReportSignature } from "@/components/principal/SuperAdmin/reports/reportConfig.types";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface StudentRow {
  full_name: string;
  document_type: string | null;
  document_number: string | null;
  phone: string | null;
  course_name: string;
  group_name: string;
  conditions?: string[];
  parent_name?: string | null;
  parent_phone?: string | null;
}

export interface StudentsReportPDFProps {
  instituteName: string;
  logoDataUrl?: string | null;
  periodName: string;
  courseName?: string;
  groupName?: string;
  students: StudentRow[];
  generatedAt: string;
  showLogo?: boolean;
  headerTitle?: string;
  footerText?: string;
  showPageNumbers?: boolean;
  showWatermark?: boolean;
  watermarkText?: string;
  watermarkImageDataUrl?: string | null;
  sidebarText?: string;
  showDocumentNumber?: boolean;
  showPhone?: boolean;
  groupBy?: "group" | "course" | "none";
  showConditions?: boolean;
  showParentInfo?: boolean;
  signatures?: ReportSignature[];
}

// ── Layout constants ───────────────────────────────────────────────────────────
// A4 landscape: 841.89 × 595.28 pt
const PAGE_W = 841.89;
const PAGE_H = 595.28;
const PAD_H  = 36;   // left padding
const PAD_R  = 56;   // right padding — extra space reserved for sidebar
const PAD_T  = 12;
const PAD_B  = 32;

// Sidebar: centered in the right reserved strip
// Visual center x = PAGE_W - PAD_R/2 = 841.89 - 28 = 813.89
// For rotate(-90deg) the center stays → left = 813.89 - PAGE_H/2 = 813.89 - 297.64 = 516.25
const SIDEBAR_LEFT = 516;
const SIDEBAR_TOP  = (PAGE_H / 2) - 4; // vertically center (4 ≈ half of text line height)

// ── Styles ────────────────────────────────────────────────────────────────────

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

  // ── Watermark ──────────────────────────────────────────────────────────────
  watermarkImageWrap: {
    position: "absolute",
    top: 0,
    left: 0,
    width: PAGE_W,
    height: PAGE_H,
  },
  watermarkImage: {
    width: PAGE_W,
    height: PAGE_H,
    objectFit: "cover",
    opacity: 0.30,
  },
  watermarkWrap: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
  },
  watermarkTextStyle: {
    fontSize: 96,
    fontFamily: "Helvetica-Bold",
    color: "#00000018",
    transform: "rotate(-45deg)",
  },

  // ── Vertical separator (content | sidebar) ─────────────────────────────────
  sidebarDivider: {
    position: "absolute",
    top: PAD_T,
    bottom: PAD_B,
    right: PAD_R - 4,
    width: 0.5,
    backgroundColor: "#e2e8f0",
  },

  // ── Sidebar text ────────────────────────────────────────────────────────────
  sidebarText: {
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

  // ── Header ─────────────────────────────────────────────────────────────────
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingBottom: 6,
    marginBottom: 8,
    borderBottomWidth: 2,
    borderBottomColor: "#e2e8f0",
  },
  logo: {
    width: 96,
    height: 96,
    objectFit: "contain",
    marginRight: 16,
    flexShrink: 0,
  },
  headerInfo: {
    flex: 1,
    justifyContent: "center",
  },
  reportTitle: {
    fontSize: 13,
    fontFamily: "Helvetica-Bold",
    color: "#25305D",
  },
  headerMetaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
  },
  metaText: {
    fontSize: 7.5,
    color: "#94a3b8",
  },
  metaTotal: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: "#1e293b",
  },

  // ── Filter chips ────────────────────────────────────────────────────────────
  filterRow: {
    flexDirection: "row",
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 4,
    padding: 6,
    marginBottom: 8,
  },
  filterItem: {
    flexDirection: "row",
    marginRight: 16,
    alignItems: "center",
  },
  filterDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#25305D",
    marginRight: 4,
  },
  filterLabel: {
    fontFamily: "Helvetica-Bold",
    fontSize: 7.5,
    color: "#475569",
  },
  filterValue: {
    fontSize: 7.5,
    color: "#64748b",
  },

  // ── Table ───────────────────────────────────────────────────────────────────
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#25305D",
    paddingVertical: 5,
    paddingHorizontal: 8,
    borderRadius: 3,
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 5,
    paddingHorizontal: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: "#e2e8f0",
  },
  tableRowAlt: {
    backgroundColor: "#f8fafc",
  },
  thCell: {
    fontFamily: "Helvetica-Bold",
    fontSize: 7,
    color: "#ffffff",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  tdCell: {
    fontSize: 8,
    color: "#374151",
  },
  tdCellMuted: {
    fontSize: 8,
    color: "#94a3b8",
  },

  // ── Sub-row (conditions / parent info) ─────────────────────────────────────
  subRow: {
    flexDirection: "row",
    paddingVertical: 2,
    paddingHorizontal: 8,
    paddingLeft: 20,
    borderBottomWidth: 0.5,
    borderBottomColor: "#e2e8f0",
    alignItems: "center",
  },
  subLabel: {
    fontSize: 6.5,
    fontFamily: "Helvetica-Bold",
    color: "#94a3b8",
    marginRight: 3,
  },
  subValue: {
    fontSize: 6.5,
    color: "#64748b",
    flex: 1,
  },

  // ── Group separator ─────────────────────────────────────────────────────────
  groupSeparator: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#eef0f7",
    paddingVertical: 4,
    paddingHorizontal: 8,
    marginTop: 6,
    borderLeftWidth: 3,
    borderLeftColor: "#25305D",
  },
  groupSeparatorText: {
    fontSize: 7.5,
    fontFamily: "Helvetica-Bold",
    color: "#25305D",
    letterSpacing: 0.4,
  },

  // ── Summary ─────────────────────────────────────────────────────────────────
  summaryBar: {
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#eef0f7",
    borderLeftWidth: 3,
    borderLeftColor: "#25305D",
    borderRadius: 3,
    padding: 6,
  },
  summaryText: {
    fontSize: 8,
    color: "#25305D",
    fontFamily: "Helvetica-Bold",
  },

  // ── Signatures ──────────────────────────────────────────────────────────────
  signaturesRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 24,
    paddingTop: 4,
  },
  signatureItem: {
    flex: 1,
    alignItems: "center",
    marginHorizontal: 10,
  },
  signatureImage: {
    height: 30,
    marginBottom: 3,
    objectFit: "contain" as any,
  },
  signatureLine: {
    width: "75%",
    height: 0.75,
    backgroundColor: "#25305D",
    marginBottom: 5,
  },
  signatureName: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: "#1e293b",
    textAlign: "center",
  },
  signatureLabel: {
    fontSize: 7,
    color: "#64748b",
    textAlign: "center",
    marginTop: 1,
  },

  // ── Footer ──────────────────────────────────────────────────────────────────
  footer: {
    position: "absolute",
    bottom: 16,
    left: PAD_H,
    right: PAD_R,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 5,
    borderTopWidth: 0.5,
    borderTopColor: "#e2e8f0",
  },
  footerText: {
    fontSize: 7,
    color: "#94a3b8",
  },
});

// ── Component ─────────────────────────────────────────────────────────────────

export function StudentsReportPDF({
  instituteName,
  logoDataUrl,
  periodName,
  courseName,
  groupName,
  students,
  generatedAt,
  showLogo = true,
  headerTitle,
  footerText,
  showPageNumbers = true,
  showWatermark = false,
  watermarkText = "CONFIDENCIAL",
  watermarkImageDataUrl,
  sidebarText,
  showDocumentNumber = true,
  showPhone = true,
  groupBy = "group",
  showConditions = false,
  showParentInfo = false,
  signatures = [],
}: StudentsReportPDFProps) {
  const reportTitle = headerTitle || "Reporte de Estudiantes Matriculados";
  const footer = footerText || `${instituteName} — Reporte de Estudiantes`;

  // ── Column widths based on visible columns ──────────────────────────────────
  const cW = (() => {
    if (showDocumentNumber && showPhone)
      return { N:"4%", Name:"30%", Doc:"18%", Course:"20%", Group:"13%", Phone:"15%" };
    if (showDocumentNumber && !showPhone)
      return { N:"4%", Name:"37%", Doc:"20%", Course:"22%", Group:"17%", Phone:"0%" };
    if (!showDocumentNumber && showPhone)
      return { N:"4%", Name:"37%", Doc:"0%",  Course:"24%", Group:"17%", Phone:"18%" };
    return   { N:"4%", Name:"46%", Doc:"0%",  Course:"28%", Group:"22%", Phone:"0%"  };
  })();

  return (
    <Document
      title={`Reporte Estudiantes — ${instituteName}`}
      author={instituteName}
    >
      <Page size="A4" orientation="landscape" style={s.page}>

        {/* ── 1. Watermark (detrás de todo) ──────────────────────── */}
        {showWatermark && watermarkImageDataUrl ? (
          <View style={s.watermarkImageWrap} fixed>
            <Image src={watermarkImageDataUrl} style={s.watermarkImage} />
          </View>
        ) : showWatermark ? (
          <View style={s.watermarkWrap} fixed>
            <Text style={s.watermarkTextStyle}>{watermarkText}</Text>
          </View>
        ) : null}

        {/* ── 2. Separador vertical | sidebar ────────────────────── */}
        {sidebarText ? <View style={s.sidebarDivider} fixed /> : null}

        {/* ── 3. Header ──────────────────────────────────────────── */}
        <View style={s.header}>
          {showLogo && logoDataUrl ? (
            <Image src={logoDataUrl} style={s.logo} />
          ) : null}
          <View style={s.headerInfo}>
            <Text style={s.reportTitle}>{reportTitle}</Text>
            <View style={s.headerMetaRow}>
              <Text style={s.metaText}>Generado: {generatedAt}</Text>
              <Text style={s.metaTotal}>
                {students.length} estudiante{students.length !== 1 ? "s" : ""}
              </Text>
            </View>
          </View>
        </View>

        {/* ── 4. Filtros aplicados ────────────────────────────────── */}
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
        </View>

        {/* ── 5. Tabla ────────────────────────────────────────────── */}
        <View>
          <View style={s.tableHeader}>
            <Text style={[s.thCell, { width: cW.N }]}>#</Text>
            <Text style={[s.thCell, { width: cW.Name }]}>Nombre completo</Text>
            {showDocumentNumber && <Text style={[s.thCell, { width: cW.Doc }]}>Documento</Text>}
            <Text style={[s.thCell, { width: cW.Course }]}>Curso</Text>
            <Text style={[s.thCell, { width: cW.Group }]}>Grupo</Text>
            {showPhone && <Text style={[s.thCell, { width: cW.Phone }]}>Teléfono</Text>}
          </View>

          {(() => {
            const items: React.ReactNode[] = [];
            let lastKey = "";
            let altIdx = 0;

            students.forEach((student, i) => {
              const sectionKey =
                groupBy === "group"  ? student.group_name  :
                groupBy === "course" ? student.course_name :
                null;

              if (sectionKey !== null && sectionKey !== lastKey) {
                lastKey = sectionKey;
                altIdx = 0;
                items.push(
                  <View key={`sep-${i}`} style={s.groupSeparator} wrap={false}>
                    <Text style={s.groupSeparatorText}>
                      {groupBy === "group" ? "Grupo: " : "Curso: "}{sectionKey}
                    </Text>
                  </View>
                );
              }

              const isAlt = altIdx % 2 === 1;
              altIdx++;
              const rowBg = isAlt ? [s.tableRow, s.tableRowAlt] : s.tableRow;
              const hasConditions = showConditions && (student.conditions?.length ?? 0) > 0;
              const hasParent    = showParentInfo && !!student.parent_name;

              items.push(
                <View key={i} wrap={false}>
                  <View style={rowBg}>
                    <Text style={[s.tdCellMuted, { width: cW.N }]}>{i + 1}</Text>
                    <Text style={[s.tdCell, { width: cW.Name }]}>{student.full_name}</Text>
                    {showDocumentNumber && (
                      <Text style={[s.tdCell, { width: cW.Doc }]}>
                        {student.document_type
                          ? `${student.document_type}: ${student.document_number ?? "—"}`
                          : (student.document_number ?? "—")}
                      </Text>
                    )}
                    <Text style={[s.tdCell, { width: cW.Course }]}>{student.course_name}</Text>
                    <Text style={[s.tdCell, { width: cW.Group }]}>{student.group_name}</Text>
                    {showPhone && (
                      <Text style={[s.tdCell, { width: cW.Phone }]}>{student.phone ?? "—"}</Text>
                    )}
                  </View>

                  {hasConditions && (
                    <View style={[s.subRow, isAlt ? s.tableRowAlt : {}]}>
                      <Text style={s.subLabel}>Condiciones: </Text>
                      <Text style={s.subValue}>{student.conditions!.join("  ·  ")}</Text>
                    </View>
                  )}
                  {hasParent && (
                    <View style={[s.subRow, isAlt ? s.tableRowAlt : {}]}>
                      <Text style={s.subLabel}>Acudiente: </Text>
                      <Text style={s.subValue}>
                        {student.parent_name}
                        {student.parent_phone ? `  ·  ${student.parent_phone}` : ""}
                      </Text>
                    </View>
                  )}
                </View>
              );
            });

            return items;
          })()}
        </View>

        {/* ── 6. Resumen ──────────────────────────────────────────── */}
        <View style={s.summaryBar}>
          <Text style={s.summaryText}>
            {students.length} estudiante{students.length !== 1 ? "s" : ""} encontrado
            {students.length !== 1 ? "s" : ""}
            {courseName ? ` en ${courseName}` : ""}
            {groupName ? ` — Grupo ${groupName}` : ""}
          </Text>
        </View>

        {/* ── 7. Firmas ────────────────────────────────────────────── */}
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

        {/* ── 9. Texto lateral (acreditación) ────────────────────── */}
        {sidebarText ? (
          <Text style={s.sidebarText} fixed>{sidebarText}</Text>
        ) : null}

        {/* ── 10. Footer ──────────────────────────────────────────── */}
        <View style={s.footer} fixed>
          <Text style={s.footerText}>{footer}</Text>
          {showPageNumbers && (
            <Text
              style={s.footerText}
              render={({ pageNumber, totalPages }) =>
                `Página ${pageNumber} de ${totalPages}`
              }
            />
          )}
        </View>

      </Page>
    </Document>
  );
}
