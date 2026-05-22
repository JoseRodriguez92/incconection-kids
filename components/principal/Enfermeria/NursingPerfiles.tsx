"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Users,
  Search,
  Heart,
  Shield,
  Phone,
  AlertTriangle,
  Plus,
  Edit,
  Loader2,
  X,
} from "lucide-react";
import { upsertHealthProfile } from "@/app/actions/nursing";

interface StudentWithProfile {
  enrolledId: string;
  userId: string;
  fullName: string;
  documentNumber: string;
  profile: {
    id?: string;
    blood_type: string | null;
    allergies: string[];
    chronic_conditions: string | null;
    insurance_provider: string | null;
    insurance_number: string | null;
    emergency_contact_name: string | null;
    emergency_contact_phone: string | null;
    notes: string | null;
  } | null;
}

const BLOOD_TYPES = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

const EMPTY_PROFILE = {
  blood_type: "",
  allergies: "",
  chronic_conditions: "",
  insurance_provider: "",
  insurance_number: "",
  emergency_contact_name: "",
  emergency_contact_phone: "",
  notes: "",
};

export function NursingPerfiles() {
  const [students, setStudents] = useState<StudentWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [periodId, setPeriodId] = useState<string | null>(null);
  const [selected, setSelected] = useState<StudentWithProfile | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_PROFILE);
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState<"all" | "with" | "without">("all");

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from("academic_period")
        .select("id")
        .eq("is_active", true)
        .maybeSingle();
      if (data) setPeriodId(data.id);
    })();
  }, []);

  const loadStudents = useCallback(async () => {
    if (!periodId) return;
    setLoading(true);
    const supabase = createClient();

    const { data: enrolled } = await supabase
      .from("student_enrolled")
      .select("id, user_id, profiles:user_id(full_name, document_number)")
      .eq("academic_period_id", periodId)
      .eq("is_active", true);

    if (!enrolled) { setLoading(false); return; }

    const enrolledIds = enrolled.map((e: any) => e.id);

    const { data: profiles } = await supabase
      .from("student_health_profile")
      .select("*")
      .in("student_enrolled_id", enrolledIds);

    const profileMap: Record<string, any> = {};
    for (const p of profiles ?? []) profileMap[p.student_enrolled_id] = p;

    const mapped: StudentWithProfile[] = enrolled.map((e: any) => {
      const hp = profileMap[e.id] ?? null;
      return {
        enrolledId: e.id,
        userId: e.user_id,
        fullName: e.profiles?.full_name ?? "—",
        documentNumber: e.profiles?.document_number ?? "—",
        profile: hp
          ? {
              id: hp.id,
              blood_type: hp.blood_type,
              allergies: hp.allergies ?? [],
              chronic_conditions: hp.chronic_conditions,
              insurance_provider: hp.insurance_provider,
              insurance_number: hp.insurance_number,
              emergency_contact_name: hp.emergency_contact_name,
              emergency_contact_phone: hp.emergency_contact_phone,
              notes: hp.notes,
            }
          : null,
      };
    });

    setStudents(mapped.sort((a, b) => a.fullName.localeCompare(b.fullName)));
    setLoading(false);
  }, [periodId]);

  useEffect(() => { loadStudents(); }, [loadStudents]);

  const openDialog = (student: StudentWithProfile) => {
    setSelected(student);
    const p = student.profile;
    setForm({
      blood_type: p?.blood_type ?? "",
      allergies: (p?.allergies ?? []).join(", "),
      chronic_conditions: p?.chronic_conditions ?? "",
      insurance_provider: p?.insurance_provider ?? "",
      insurance_number: p?.insurance_number ?? "",
      emergency_contact_name: p?.emergency_contact_name ?? "",
      emergency_contact_phone: p?.emergency_contact_phone ?? "",
      notes: p?.notes ?? "",
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!selected) return;
    setSaving(true);
    const result = await upsertHealthProfile({
      student_enrolled_id: selected.enrolledId,
      blood_type: form.blood_type || undefined,
      allergies: form.allergies ? form.allergies.split(",").map((a) => a.trim()).filter(Boolean) : [],
      chronic_conditions: form.chronic_conditions || undefined,
      insurance_provider: form.insurance_provider || undefined,
      insurance_number: form.insurance_number || undefined,
      emergency_contact_name: form.emergency_contact_name || undefined,
      emergency_contact_phone: form.emergency_contact_phone || undefined,
      notes: form.notes || undefined,
    });
    setSaving(false);
    if (!result.success) { toast.error("Error al guardar perfil"); return; }
    toast.success("Perfil de salud guardado");
    setDialogOpen(false);
    loadStudents();
  };

  const filtered = students.filter((s) => {
    const matchSearch =
      !search ||
      s.fullName.toLowerCase().includes(search.toLowerCase()) ||
      s.documentNumber.includes(search);
    const matchFilter =
      filter === "all" ||
      (filter === "with" && s.profile !== null) ||
      (filter === "without" && s.profile === null);
    return matchSearch && matchFilter;
  });

  const withProfile = students.filter((s) => s.profile !== null).length;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 sm:px-6 py-3 sm:py-4 border-b bg-background/80 backdrop-blur-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-100 flex items-center justify-center shrink-0">
              <Users className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h1 className="font-bold text-base leading-tight">Perfiles de Salud</h1>
              <p className="text-[11px] text-muted-foreground">
                {withProfile} de {students.length} estudiantes con perfil registrado
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            {(["all", "with", "without"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                  filter === f
                    ? "bg-purple-600 text-white"
                    : "bg-muted text-muted-foreground hover:text-foreground"
                }`}
              >
                {f === "all" ? "Todos" : f === "with" ? "Con perfil" : "Sin perfil"}
              </button>
            ))}
          </div>
        </div>
        <div className="relative mt-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre o documento..."
            className="pl-9"
          />
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-auto p-4 sm:p-6">
        {loading ? (
          <div className="flex justify-center items-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <Users className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm">No se encontraron estudiantes</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {filtered.map((student) => (
              <Card key={student.enrolledId} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="min-w-0">
                      <p className="font-semibold text-sm truncate">{student.fullName}</p>
                      <p className="text-xs text-muted-foreground">{student.documentNumber}</p>
                    </div>
                    {student.profile ? (
                      <Badge className="bg-green-100 text-green-700 text-xs shrink-0">Con perfil</Badge>
                    ) : (
                      <Badge variant="outline" className="text-xs shrink-0 text-muted-foreground">Sin perfil</Badge>
                    )}
                  </div>

                  {student.profile ? (
                    <div className="space-y-1.5 text-xs text-muted-foreground mb-3">
                      {student.profile.blood_type && (
                        <div className="flex items-center gap-1.5">
                          <Heart className="w-3.5 h-3.5 text-red-500 shrink-0" />
                          <span>Tipo de sangre: <strong className="text-foreground">{student.profile.blood_type}</strong></span>
                        </div>
                      )}
                      {(student.profile.allergies ?? []).length > 0 && (
                        <div className="flex items-start gap-1.5">
                          <AlertTriangle className="w-3.5 h-3.5 text-orange-500 shrink-0 mt-0.5" />
                          <span className="line-clamp-1">Alergias: <strong className="text-foreground">{student.profile.allergies.join(", ")}</strong></span>
                        </div>
                      )}
                      {student.profile.insurance_provider && (
                        <div className="flex items-center gap-1.5">
                          <Shield className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                          <span className="truncate">{student.profile.insurance_provider}</span>
                        </div>
                      )}
                      {student.profile.emergency_contact_name && (
                        <div className="flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-green-500 shrink-0" />
                          <span className="truncate">{student.profile.emergency_contact_name}</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground mb-3 italic">Sin información de salud registrada.</p>
                  )}

                  <Button
                    size="sm"
                    variant={student.profile ? "outline" : "default"}
                    className="w-full gap-1.5"
                    onClick={() => openDialog(student)}
                  >
                    {student.profile ? (
                      <><Edit className="w-3.5 h-3.5" /> Editar perfil</>
                    ) : (
                      <><Plus className="w-3.5 h-3.5" /> Crear perfil</>
                    )}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="w-[calc(100%-2rem)] sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="w-4 h-4 text-purple-600" />
              Perfil de Salud — {selected?.fullName}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Tipo de Sangre</Label>
                <Select value={form.blood_type} onValueChange={(v) => setForm((p) => ({ ...p, blood_type: v }))}>
                  <SelectTrigger><SelectValue placeholder="Selecciona..." /></SelectTrigger>
                  <SelectContent>
                    {BLOOD_TYPES.map((bt) => <SelectItem key={bt} value={bt}>{bt}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label>EPS / Aseguradora</Label>
                <Input
                  value={form.insurance_provider}
                  onChange={(e) => setForm((p) => ({ ...p, insurance_provider: e.target.value }))}
                  placeholder="Ej: Sura, Sanitas..."
                />
              </div>

              <div className="space-y-1.5">
                <Label>N° de Póliza / Afiliación</Label>
                <Input
                  value={form.insurance_number}
                  onChange={(e) => setForm((p) => ({ ...p, insurance_number: e.target.value }))}
                  placeholder="Número de afiliación"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-orange-500" />
                Alergias (separadas por coma)
              </Label>
              <Input
                value={form.allergies}
                onChange={(e) => setForm((p) => ({ ...p, allergies: e.target.value }))}
                placeholder="Ej: Penicilina, Polen, Mariscos"
              />
            </div>

            <div className="space-y-1.5">
              <Label>Condiciones Crónicas</Label>
              <Textarea
                value={form.chronic_conditions}
                onChange={(e) => setForm((p) => ({ ...p, chronic_conditions: e.target.value }))}
                placeholder="Diabetes, asma, epilepsia..."
                rows={2}
                className="resize-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-green-500" />
                  Contacto de Emergencia
                </Label>
                <Input
                  value={form.emergency_contact_name}
                  onChange={(e) => setForm((p) => ({ ...p, emergency_contact_name: e.target.value }))}
                  placeholder="Nombre del contacto"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Teléfono de Emergencia</Label>
                <Input
                  value={form.emergency_contact_phone}
                  onChange={(e) => setForm((p) => ({ ...p, emergency_contact_phone: e.target.value }))}
                  placeholder="300 000 0000"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Notas adicionales</Label>
              <Textarea
                value={form.notes}
                onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
                placeholder="Observaciones generales de salud..."
                rows={2}
                className="resize-none"
              />
            </div>

            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end pt-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                <X className="w-4 h-4 mr-1.5" /> Cancelar
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? <><Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> Guardando...</> : "Guardar Perfil"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
