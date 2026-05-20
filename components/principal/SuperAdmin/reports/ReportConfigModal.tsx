"use client";

import { useState, useEffect } from "react";
import {
  Dialog, DialogContent, DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Popover, PopoverContent, PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList,
} from "@/components/ui/command";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Loader2, Plus, Trash2, GripVertical,
  Image, PenLine, Stamp, Settings2, LinkIcon,
  type LucideIcon,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useReportConfig } from "./useReportConfig";
import {
  type ReportId, type ReportSignature,
  type StudentsReportConfig, type GradesReportConfig,
  type AttendanceReportConfig, type PsychologyReportConfig,
  type TeachersReportConfig, type EventsReportConfig,
} from "./reportConfig.types";

// ── Tipos ─────────────────────────────────────────────────────────────────────

interface ReportInfo {
  id: ReportId;
  title: string;
  colorBg: string;
  colorText: string;
  colorBorder: string;
  icon: LucideIcon;
}

interface Props {
  report: ReportInfo | null;
  open: boolean;
  onClose: () => void;
}

// ── Sub-componente: fila de firma ─────────────────────────────────────────────

interface ProfileOption {
  id: string;
  full_name: string | null;
  signature_url: string | null;
}

function SignatureRow({
  sig,
  profiles,
  onChange,
  onRemove,
}: {
  sig: ReportSignature;
  profiles: ProfileOption[];
  onChange: (updated: ReportSignature) => void;
  onRemove: () => void;
}) {
  const [open, setOpen] = useState(false);
  const linked = profiles.find((p) => p.id === sig.profileId);

  const sorted = [...profiles].sort((a, b) =>
    (a.full_name ?? "").localeCompare(b.full_name ?? "", "es"),
  );

  const handleLinkProfile = (profileId: string) => {
    setOpen(false);
    if (profileId === "__none__") {
      onChange({ ...sig, profileId: undefined, signatureImageUrl: undefined });
      return;
    }
    const profile = profiles.find((p) => p.id === profileId);
    if (!profile) return;
    onChange({
      ...sig,
      profileId: profile.id,
      name: profile.full_name ?? sig.name,
      signatureImageUrl: profile.signature_url ?? undefined,
    });
  };

  return (
    <div className="flex items-start gap-2 p-3 rounded-lg border bg-muted/20 group">
      <GripVertical className="w-4 h-4 text-muted-foreground/40 mt-2 shrink-0" />
      <div className="flex-1 space-y-2">
        {/* Vincular usuario */}
        <div className="space-y-1">
          <p className="text-[10px] text-muted-foreground flex items-center gap-1">
            <LinkIcon className="w-3 h-3" /> Vincular usuario
          </p>
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={open}
                className="w-full h-8 text-xs justify-between font-normal"
              >
                <span className="truncate">
                  {linked ? linked.full_name ?? "Sin nombre" : "Sin vincular..."}
                </span>
                <ChevronsUpDown className="ml-2 h-3 w-3 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-0" align="start">
              <Command>
                <CommandInput placeholder="Buscar usuario..." className="h-8 text-xs" />
                <CommandList>
                  <CommandEmpty className="text-xs py-3 text-center text-muted-foreground">
                    Sin resultados
                  </CommandEmpty>
                  <CommandGroup>
                    <CommandItem
                      value="__none__"
                      onSelect={() => handleLinkProfile("__none__")}
                      className="text-xs text-muted-foreground"
                    >
                      <Check className={cn("mr-2 h-3 w-3", !sig.profileId ? "opacity-100" : "opacity-0")} />
                      Sin vincular
                    </CommandItem>
                    {sorted.map((p) => (
                      <CommandItem
                        key={p.id}
                        value={p.full_name ?? p.id}
                        onSelect={() => handleLinkProfile(p.id)}
                        className="text-xs"
                      >
                        <Check className={cn("mr-2 h-3 w-3", sig.profileId === p.id ? "opacity-100" : "opacity-0")} />
                        <span className="flex-1 truncate">{p.full_name ?? "Sin nombre"}</span>
                        {p.signature_url && (
                          <span className="ml-1 text-[10px] text-emerald-600 font-medium shrink-0">✓</span>
                        )}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>

        {/* Preview firma vinculada */}
        {linked?.signature_url && (
          <div className="rounded border bg-white flex items-center justify-center px-3 py-1.5" style={{ minHeight: 48 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={linked.signature_url} alt="firma" className="max-h-10 object-contain" />
          </div>
        )}

        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <p className="text-[10px] text-muted-foreground">Cargo / Título</p>
            <Input
              value={sig.label}
              onChange={(e) => onChange({ ...sig, label: e.target.value })}
              placeholder="Ej: Rector"
              className="h-8 text-xs"
            />
          </div>
          <div className="space-y-1">
            <p className="text-[10px] text-muted-foreground">Nombre</p>
            <Input
              value={sig.name}
              onChange={(e) => onChange({ ...sig, name: e.target.value })}
              placeholder="Nombre completo"
              className="h-8 text-xs"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Switch
            id={`req-${sig.id}`}
            checked={sig.required}
            onCheckedChange={(v) => onChange({ ...sig, required: v })}
            className="scale-75"
          />
          <Label htmlFor={`req-${sig.id}`} className="text-xs text-muted-foreground">
            Requerida
          </Label>
          <Switch
            id={`line-${sig.id}`}
            checked={sig.showLine}
            onCheckedChange={(v) => onChange({ ...sig, showLine: v })}
            className="scale-75 ml-3"
          />
          <Label htmlFor={`line-${sig.id}`} className="text-xs text-muted-foreground">
            Mostrar línea
          </Label>
        </div>
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity hover:text-destructive shrink-0 mt-1"
        onClick={onRemove}
      >
        <Trash2 className="w-3.5 h-3.5" />
      </Button>
    </div>
  );
}

// ── Sub-componente: fila toggle ───────────────────────────────────────────────

function ToggleRow({
  id, label, description, checked, onCheckedChange,
}: {
  id: string; label: string; description?: string;
  checked: boolean; onCheckedChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-2">
      <div className="min-w-0">
        <Label htmlFor={id} className="text-sm font-medium cursor-pointer">{label}</Label>
        {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
      </div>
      <Switch id={id} checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  );
}

// ── Tab: Encabezado ───────────────────────────────────────────────────────────

function TabHeader({ config, onChange }: { config: any; onChange: (p: any) => void }) {
  return (
    <div className="space-y-5">
      <ToggleRow
        id="showLogo"
        label="Mostrar logo del colegio"
        description="El logo se toma de la configuración del instituto."
        checked={config.showLogo}
        onCheckedChange={(v) => onChange({ showLogo: v })}
      />

      <div className="space-y-2">
        <Label className="text-sm">Título personalizado</Label>
        <Input
          value={config.headerTitle}
          onChange={(e) => onChange({ headerTitle: e.target.value })}
          placeholder="Dejar vacío para usar el nombre del reporte"
          className="h-9"
        />
      </div>

    </div>
  );
}

// ── Tab: Pie de página y marca de agua ────────────────────────────────────────

function TabFooter({ config, onChange }: { config: any; onChange: (p: any) => void }) {
  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <Label className="text-sm">Texto del pie de página</Label>
        <Input
          value={config.footerText}
          onChange={(e) => onChange({ footerText: e.target.value })}
          placeholder="Ej: Documento oficial de la institución"
          className="h-9"
        />
      </div>

      <ToggleRow
        id="showPageNumbers"
        label="Mostrar número de página"
        checked={config.showPageNumbers}
        onCheckedChange={(v) => onChange({ showPageNumbers: v })}
      />

      <div className="border-t pt-4 space-y-3">
        <ToggleRow
          id="showWatermark"
          label="Marca de agua"
          description="Imagen o texto semitransparente de fondo en cada página."
          checked={config.showWatermark}
          onCheckedChange={(v) => onChange({ showWatermark: v })}
        />
        {config.showWatermark && (
          <div className="space-y-3 pl-1">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">
                URL de imagen de fondo
                <span className="text-muted-foreground/60 ml-1">(opcional — se muestra centrada con baja opacidad)</span>
              </Label>
              <Input
                value={config.watermarkImageUrl ?? ""}
                onChange={(e) => onChange({ watermarkImageUrl: e.target.value })}
                placeholder="https://... (deja vacío para usar texto)"
                className="h-9 text-xs"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">
                Texto alternativo
                <span className="text-muted-foreground/60 ml-1">(se usa si no hay imagen)</span>
              </Label>
              <Input
                value={config.watermarkText}
                onChange={(e) => onChange({ watermarkText: e.target.value })}
                placeholder="Ej: CONFIDENCIAL"
                className="h-9 font-mono uppercase"
              />
            </div>
          </div>
        )}
      </div>

      <div className="border-t pt-4 space-y-2">
        <Label className="text-sm">Texto lateral (acreditación oficial)</Label>
        <p className="text-xs text-muted-foreground">
          Aparece rotado en el margen derecho de cada página — resolución, NIT, DANE, etc.
        </p>
        <textarea
          value={config.sidebarText ?? ""}
          onChange={(e) => onChange({ sidebarText: e.target.value })}
          placeholder="Ej: Aprobación oficial No. 053 de 2005... NIT 860011285-1. DANE: 311001004064. Vigilado MinEducación"
          className="w-full min-h-[72px] rounded-md border border-input bg-background px-3 py-2 text-xs shadow-sm resize-none focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        />
      </div>
    </div>
  );
}

// ── Tab: Firmas ───────────────────────────────────────────────────────────────

function TabSignatures({ config, onChange }: { config: any; onChange: (p: any) => void }) {
  const supabase = createClient();
  const [profiles, setProfiles] = useState<ProfileOption[]>([]);

  useEffect(() => {
    supabase
      .from("profiles")
      .select("id, full_name, signature_url")
      .then(({ data }) => setProfiles((data ?? []) as unknown as ProfileOption[]));
  }, []);  // eslint-disable-line react-hooks/exhaustive-deps

  const addSignature = () => {
    const newSig: ReportSignature = {
      id: crypto.randomUUID(),
      label: "",
      name: "",
      required: false,
      showLine: true,
    };
    onChange({ signatures: [...(config.signatures ?? []), newSig] });
  };

  const updateSig = (id: string, updated: ReportSignature) => {
    onChange({
      signatures: config.signatures.map((s: ReportSignature) =>
        s.id === id ? updated : s,
      ),
    });
  };

  const removeSig = (id: string) => {
    onChange({
      signatures: config.signatures.filter((s: ReportSignature) => s.id !== id),
    });
  };

  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground">
        Las firmas aparecen al pie del documento en el orden listado.
      </p>

      {(config.signatures ?? []).length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 border border-dashed rounded-lg text-center">
          <PenLine className="w-8 h-8 text-muted-foreground/30 mb-2" />
          <p className="text-sm text-muted-foreground">Sin firmas configuradas</p>
          <p className="text-xs text-muted-foreground/60 mt-0.5">
            Agrega al menos una para que aparezca en el reporte.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {config.signatures.map((sig: ReportSignature) => (
            <SignatureRow
              key={sig.id}
              sig={sig}
              profiles={profiles}
              onChange={(updated) => updateSig(sig.id, updated)}
              onRemove={() => removeSig(sig.id)}
            />
          ))}
        </div>
      )}

      <Button variant="outline" size="sm" className="w-full gap-2" onClick={addSignature}>
        <Plus className="w-3.5 h-3.5" />
        Agregar firma
      </Button>
    </div>
  );
}

// ── Tab: Opciones específicas por reporte ─────────────────────────────────────

function TabSpecific({ reportId, config, onChange }: {
  reportId: ReportId; config: any; onChange: (p: any) => void;
}) {
  if (reportId === "students-report") {
    const c = config as StudentsReportConfig;
    return (
      <div className="space-y-1 divide-y">
        <ToggleRow id="showDoc"    label="Mostrar número de documento"           checked={c.showDocumentNumber} onCheckedChange={(v) => onChange({ showDocumentNumber: v })} />
        <ToggleRow id="showPhone"  label="Mostrar teléfono"                       checked={c.showPhone}          onCheckedChange={(v) => onChange({ showPhone: v })} />
        <ToggleRow id="showCond"   label="Mostrar condiciones de aprendizaje"     checked={c.showConditions}     onCheckedChange={(v) => onChange({ showConditions: v })} />
        <ToggleRow id="showParent" label="Mostrar información del padre/acudiente" checked={c.showParentInfo}    onCheckedChange={(v) => onChange({ showParentInfo: v })} />
        <div className="py-2 space-y-1.5">
          <Label className="text-sm">Agrupar por</Label>
          <Select value={c.groupBy} onValueChange={(v: any) => onChange({ groupBy: v })}>
            <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="group">Grupo</SelectItem>
              <SelectItem value="course">Curso</SelectItem>
              <SelectItem value="none">Sin agrupación</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    );
  }

  if (reportId === "grades-report") {
    const c = config as GradesReportConfig;
    return (
      <div className="space-y-1 divide-y">
        <ToggleRow id="perfLevel" label="Mostrar nivel de desempeño" checked={c.showPerformanceLevel} onCheckedChange={(v) => onChange({ showPerformanceLevel: v })} />
        <div className="py-2 grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className="text-xs">Nota mínima para aprobar</Label>
            <Input type="number" value={c.passingGrade} onChange={(e) => onChange({ passingGrade: +e.target.value })} className="h-9" />
          </div>
        </div>
      </div>
    );
  }

  if (reportId === "attendance-report") {
    const c = config as AttendanceReportConfig;
    return (
      <div className="space-y-1 divide-y">
        <ToggleRow id="showPct"    label="Mostrar porcentaje de asistencia" checked={c.showPercentage}     onCheckedChange={(v) => onChange({ showPercentage: v })} />
        <ToggleRow id="showReason" label="Mostrar motivo de ausencias"      checked={c.showAbsenceReasons} onCheckedChange={(v) => onChange({ showAbsenceReasons: v })} />
        <div className="py-2 space-y-1.5">
          <Label className="text-sm">Umbral de alerta (%)</Label>
          <p className="text-xs text-muted-foreground">Resaltar estudiantes con asistencia por debajo de este valor.</p>
          <Input type="number" min={0} max={100} value={c.alertThreshold}
            onChange={(e) => onChange({ alertThreshold: +e.target.value })} className="h-9 w-28" />
        </div>
      </div>
    );
  }

  if (reportId === "teachers-report") {
    const c = config as TeachersReportConfig;
    return (
      <div className="space-y-1 divide-y">
        <ToggleRow id="showSched"  label="Mostrar horario"           checked={c.showSchedule}      onCheckedChange={(v) => onChange({ showSchedule: v })} />
        <ToggleRow id="showGroups" label="Mostrar grupos a cargo"    checked={c.showGroups}        onCheckedChange={(v) => onChange({ showGroups: v })} />
        <ToggleRow id="showSubj"   label="Mostrar materias"          checked={c.showSubjects}      onCheckedChange={(v) => onChange({ showSubjects: v })} />
        <ToggleRow id="showEnroll" label="Mostrar fecha de matrícula" checked={c.showEnrollmentDate} onCheckedChange={(v) => onChange({ showEnrollmentDate: v })} />
      </div>
    );
  }

  if (reportId === "psychology-report") {
    const c = config as PsychologyReportConfig;
    return (
      <div className="space-y-1 divide-y">
        <ToggleRow id="anon"       label="Anonimizar nombres"         description="Reemplaza nombres por iniciales en el reporte." checked={c.anonymizeNames}  onCheckedChange={(v) => onChange({ anonymizeNames: v })} />
        <ToggleRow id="riskLevel"  label="Mostrar nivel de riesgo"    checked={c.showRiskLevel}   onCheckedChange={(v) => onChange({ showRiskLevel: v })} />
        <ToggleRow id="sessions"   label="Mostrar sesiones"           checked={c.showSessions}    onCheckedChange={(v) => onChange({ showSessions: v })} />
        <ToggleRow id="followups"  label="Mostrar seguimientos"       checked={c.showFollowups}   onCheckedChange={(v) => onChange({ showFollowups: v })} />
        <div className="py-2 space-y-1.5">
          <Label className="text-sm">Aviso de confidencialidad</Label>
          <textarea
            value={c.confidentialityNotice}
            onChange={(e) => onChange({ confidentialityNotice: e.target.value })}
            rows={3}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-xs resize-none focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
      </div>
    );
  }

  if (reportId === "events-report") {
    const c = config as EventsReportConfig;
    return (
      <div className="space-y-1 divide-y">
        <ToggleRow id="showAtt"   label="Mostrar asistencia a eventos" checked={c.showAttendance}  onCheckedChange={(v) => onChange({ showAttendance: v })} />
        <ToggleRow id="groupCat"  label="Agrupar por categoría"        checked={c.groupByCategory} onCheckedChange={(v) => onChange({ groupByCategory: v })} />
        <ToggleRow id="showImgs"  label="Mostrar imágenes"             checked={c.showImages}      onCheckedChange={(v) => onChange({ showImages: v })} />
      </div>
    );
  }

  return <p className="text-sm text-muted-foreground py-4 text-center">Sin opciones específicas para este reporte.</p>;
}

// ── Componente principal ──────────────────────────────────────────────────────

export function ReportConfigModal({ report, open, onClose }: Props) {
  const { config, loading, saving, save, reset } = useReportConfig(
    report?.id ?? "students-report",
  );

  // Copia local para editar sin guardar en cada keystroke
  const [draft, setDraft] = useState(config);
  useEffect(() => { setDraft(config); }, [config]);

  const patch = (partial: any) => setDraft((prev: any) => ({ ...prev, ...partial }));

  const handleSave = async () => {
    const ok = await save(draft);
    if (ok) onClose();
  };

  const handleReset = async () => {
    if (!confirm("¿Restablecer todos los valores por defecto de este reporte?")) return;
    await reset();
  };

  if (!report) return null;
  const Icon = report.icon;

  const tabs = [
    { value: "header",     label: "Encabezado",  icon: Image },
    { value: "footer",     label: "Pie / Marca",  icon: Stamp },
    { value: "signatures", label: "Firmas",       icon: PenLine },
    { value: "specific",   label: "Específico",   icon: Settings2 },
  ];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg p-0 overflow-hidden gap-0">
        <DialogTitle className="sr-only">
          Configurar reporte de {report.title}
        </DialogTitle>

        {/* Header */}
        <div className={`relative px-6 pt-5 pb-4 ${report.colorBg} border-b`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-background/70 shadow-sm flex items-center justify-center shrink-0">
              <Icon className={`w-5 h-5 ${report.colorText}`} />
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
                Configuración
              </p>
              <h2 className="font-bold text-foreground leading-tight">
                Reporte de {report.title}
              </h2>
            </div>
          </div>
        </div>

        {/* Tabs */}
        {loading ? (
          <div className="p-6 space-y-4">
            {[0, 1, 2].map((i) => (
              <div key={i} className="flex items-center justify-between">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-5 w-10 rounded-full" />
              </div>
            ))}
          </div>
        ) : (
          <Tabs defaultValue="header" className="flex flex-col">
            <TabsList className="mx-6 mt-4 grid grid-cols-4 h-9">
              {tabs.map((t) => (
                <TabsTrigger key={t.value} value={t.value} className="gap-1.5 text-xs">
                  <t.icon className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{t.label}</span>
                </TabsTrigger>
              ))}
            </TabsList>

            <div className="px-6 py-4 min-h-[260px] max-h-[380px] overflow-y-auto">
              <TabsContent value="header"     className="mt-0"><TabHeader     config={draft} onChange={patch} /></TabsContent>
              <TabsContent value="footer"     className="mt-0"><TabFooter     config={draft} onChange={patch} /></TabsContent>
              <TabsContent value="signatures" className="mt-0"><TabSignatures config={draft} onChange={patch} /></TabsContent>
              <TabsContent value="specific"   className="mt-0"><TabSpecific   reportId={report.id} config={draft} onChange={patch} /></TabsContent>
            </div>
          </Tabs>
        )}

        {/* Footer */}
        <div className="px-6 pb-5 pt-3 border-t bg-muted/20 flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-destructive text-xs"
            onClick={handleReset}
            disabled={saving}
          >
            Restablecer
          </Button>
          <div className="flex-1" />
          <Button variant="outline" onClick={onClose} disabled={saving}>Cancelar</Button>
          <Button onClick={handleSave} disabled={saving || loading} className="gap-2">
            {saving ? <><Loader2 className="w-4 h-4 animate-spin" />Guardando...</> : "Guardar"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
