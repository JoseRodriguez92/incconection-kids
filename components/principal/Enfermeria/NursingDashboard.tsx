"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Stethoscope, ClipboardList, Home, Search, Plus, X, Trash2,
  AlertTriangle, Thermometer, Heart, User, Phone, Shield,
  Pill, CheckCircle2, Eye, Building, Send, Loader2,
  ChevronRight, Clock, Bell, RefreshCw,
} from "lucide-react";
import { createNurseVisit, upsertHealthProfile } from "@/app/actions/nursing";
import { InstituteStore } from "@/Stores/InstituteStore";

// ── Local types (replace with Database types once generated) ──────────────────

interface StudentResult {
  enrolledId: string;
  userId: string;
  fullName: string;
  documentNumber: string;
  groupName: string;
  courseName: string;
}

interface HealthProfile {
  blood_type: string | null;
  allergies: string[];
  chronic_conditions: string | null;
  insurance_provider: string | null;
  insurance_number: string | null;
  emergency_contact_name: string | null;
  emergency_contact_phone: string | null;
  notes: string | null;
}

interface RegularMed {
  id: string;
  medication_name: string;
  dosage: string;
  frequency: string;
  prescribed_by: string | null;
}

interface VisitRow {
  id: string;
  visit_date: string;
  reason: string;
  status: string;
  parent_notified: boolean;
  diagnosis: string | null;
  student_name: string;
  document_number: string;
}

// ── Constants ─────────────────────────────────────────────────────────────────

const COMMON_REASONS = [
  "Fiebre",
  "Dolor de cabeza",
  "Dolor de estómago / abdomen",
  "Herida / Golpe / Caída",
  "Mareo / Desmayo",
  "Vómito / Náusea",
  "Reacción alérgica",
  "Control de medicamento",
  "Malestar general",
  "Otro",
];

const STATUS_OPTIONS = [
  { value: "atendido",       label: "✅ Atendido — regresa a clases",       color: "text-emerald-600" },
  { value: "en_observacion", label: "👁️ En observación",                    color: "text-amber-600" },
  { value: "remitido",       label: "🏥 Remitido a médico / clínica",        color: "text-red-600" },
  { value: "enviado_a_casa", label: "🏠 Enviado a casa",                     color: "text-violet-600" },
];

const STATUS_BADGE: Record<string, string> = {
  atendido:       "bg-emerald-100 text-emerald-700 border-emerald-200",
  en_observacion: "bg-amber-100 text-amber-700 border-amber-200",
  remitido:       "bg-red-100 text-red-700 border-red-200",
  enviado_a_casa: "bg-violet-100 text-violet-700 border-violet-200",
};

const EMPTY_FORM = {
  reason: "",
  customReason: "",
  symptoms: "",
  diagnosis: "",
  treatment: "",
  temperature: "",
  blood_pressure: "",
  heart_rate: "",
  weight_kg: "",
  status: "atendido" as const,
  notes: "",
  notify_parent: true,
};

// ── Component ─────────────────────────────────────────────────────────────────

export function NursingDashboard() {
  const institute = InstituteStore((s) => s.institute);
  const [activeTab, setActiveTab] = useState<"hoy" | "nueva" | "historial">("hoy");
  const [activePeriodId, setActivePeriodId] = useState<string>("");

  // Hoy
  const [todayVisits, setTodayVisits] = useState<VisitRow[]>([]);
  const [loadingToday, setLoadingToday] = useState(true);

  // Nueva atención — student search
  const [studentSearch, setStudentSearch] = useState("");
  const [searchResults, setSearchResults] = useState<StudentResult[]>([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searching, setSearching] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<StudentResult | null>(null);
  const [healthProfile, setHealthProfile] = useState<HealthProfile | null>(null);
  const [regularMeds, setRegularMeds] = useState<RegularMed[]>([]);
  const [loadingProfile, setLoadingProfile] = useState(false);

  // Form
  const [form, setForm] = useState(EMPTY_FORM);
  const [medications, setMedications] = useState<{ name: string; dosage: string; route: string }[]>([]);
  const [saving, setSaving] = useState(false);

  // Historial
  const [historialVisits, setHistorialVisits] = useState<VisitRow[]>([]);
  const [historialSearch, setHistorialSearch] = useState("");
  const [historialStatus, setHistorialStatus] = useState("all");
  const [loadingHistorial, setLoadingHistorial] = useState(false);

  const searchRef = useRef<HTMLDivElement>(null);

  // ── Load active period ──────────────────────────────────────────────────────
  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("academic_period")
      .select("id")
      .eq("is_active", true)
      .single()
      .then(({ data }) => {
        if (data) setActivePeriodId(data.id);
      });
  }, []);

  // ── Load today's visits ─────────────────────────────────────────────────────
  const loadToday = useCallback(async () => {
    setLoadingToday(true);
    const supabase = createClient();
    const today = new Date().toISOString().split("T")[0];

    const { data } = await supabase
      .from("nurse_visit")
      .select(`
        id, visit_date, reason, status, parent_notified, diagnosis,
        student_enrolled (
          user_id,
          profiles:user_id ( full_name, document_number )
        )
      `)
      .gte("visit_date", `${today}T00:00:00`)
      .lte("visit_date", `${today}T23:59:59`)
      .order("visit_date", { ascending: false });

    const mapped: VisitRow[] = (data ?? []).map((v: any) => ({
      id: v.id,
      visit_date: v.visit_date,
      reason: v.reason,
      status: v.status,
      parent_notified: v.parent_notified,
      diagnosis: v.diagnosis,
      student_name: v.student_enrolled?.profiles?.full_name ?? "—",
      document_number: v.student_enrolled?.profiles?.document_number ?? "—",
    }));

    setTodayVisits(mapped);
    setLoadingToday(false);
  }, []);

  useEffect(() => {
    loadToday();
  }, [loadToday]);

  // ── Student search (debounced) ──────────────────────────────────────────────
  useEffect(() => {
    if (studentSearch.length < 2) {
      setSearchResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      if (!activePeriodId) return;
      setSearching(true);
      const supabase = createClient();

      // Search profiles matching name/doc
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name, document_number")
        .or(`full_name.ilike.%${studentSearch}%,document_number.ilike.%${studentSearch}%`)
        .limit(20);

      if (!profiles || profiles.length === 0) {
        setSearchResults([]);
        setSearching(false);
        return;
      }

      const userIds = profiles.map((p: any) => p.id);

      // Match with enrolled students in active period
      const { data: enrolled } = await supabase
        .from("student_enrolled")
        .select("id, user_id")
        .eq("academic_period_id", activePeriodId)
        .in("user_id", userIds);

      if (!enrolled || enrolled.length === 0) {
        setSearchResults([]);
        setSearching(false);
        return;
      }

      const enrolledIds = enrolled.map((e: any) => e.id);

      // Get group info
      const { data: ghs } = await supabase
        .from("group_has_students")
        .select(`
          student_enrolled_id,
          groups!grupo_tiene_estudiante_group_id_fkey ( name, courses ( name ) )
        `)
        .in("student_enrolled_id", enrolledIds);

      const ghsMap: Record<string, { groupName: string; courseName: string }> = {};
      for (const g of ghs ?? []) {
        ghsMap[(g as any).student_enrolled_id] = {
          groupName: (g as any).groups?.name ?? "—",
          courseName: (g as any).groups?.courses?.name ?? "—",
        };
      }

      const results: StudentResult[] = enrolled.map((e: any) => {
        const profile = profiles.find((p: any) => p.id === e.user_id);
        const gInfo = ghsMap[e.id] ?? { groupName: "—", courseName: "—" };
        return {
          enrolledId: e.id,
          userId: e.user_id,
          fullName: profile?.full_name ?? "—",
          documentNumber: profile?.document_number ?? "—",
          groupName: gInfo.groupName,
          courseName: gInfo.courseName,
        };
      });

      setSearchResults(results);
      setSearching(false);
    }, 350);

    return () => clearTimeout(timer);
  }, [studentSearch, activePeriodId]);

  // ── Load health profile ─────────────────────────────────────────────────────
  const loadHealthProfile = async (enrolledId: string) => {
    setLoadingProfile(true);
    const supabase = createClient();

    const [{ data: hp }, { data: meds }] = await Promise.all([
      supabase
        .from("student_health_profile")
        .select("*")
        .eq("student_enrolled_id", enrolledId)
        .maybeSingle(),
      supabase
        .from("student_regular_medication")
        .select("id, medication_name, dosage, frequency, prescribed_by")
        .eq("student_enrolled_id", enrolledId)
        .eq("is_active", true),
    ]);

    setHealthProfile(
      hp
        ? {
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
    );
    setRegularMeds(meds ?? []);
    setLoadingProfile(false);
  };

  // ── Select student ──────────────────────────────────────────────────────────
  const selectStudent = (s: StudentResult) => {
    setSelectedStudent(s);
    setStudentSearch(s.fullName);
    setSearchOpen(false);
    setSearchResults([]);
    loadHealthProfile(s.enrolledId);
  };

  // ── Save visit ──────────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!selectedStudent || !activePeriodId) return;
    const reason = form.reason === "Otro" ? form.customReason : form.reason;
    if (!reason.trim()) {
      toast.error("Ingresa el motivo de consulta");
      return;
    }

    setSaving(true);
    const result = await createNurseVisit({
      student_enrolled_id: selectedStudent.enrolledId,
      student_user_id: selectedStudent.userId,
      student_name: selectedStudent.fullName,
      academic_period_id: activePeriodId,
      reason,
      symptoms: form.symptoms || undefined,
      diagnosis: form.diagnosis || undefined,
      treatment: form.treatment || undefined,
      temperature: form.temperature ? Number(form.temperature) : undefined,
      blood_pressure: form.blood_pressure || undefined,
      heart_rate: form.heart_rate ? Number(form.heart_rate) : undefined,
      weight_kg: form.weight_kg ? Number(form.weight_kg) : undefined,
      status: form.status,
      notes: form.notes || undefined,
      medications: medications.filter((m) => m.name.trim()),
      notify_parent: form.notify_parent,
      institute_name: institute?.name ?? "La institución",
    });

    setSaving(false);

    if (!result.success) {
      toast.error(result.error);
      return;
    }

    toast.success(`Atención registrada correctamente`, {
      description: result.notified
        ? `Notificación enviada a ${result.parentEmails.length} padre(s) de familia`
        : form.notify_parent
          ? "No se encontraron correos de padres"
          : "Sin notificación al padre",
    });

    // Reset
    setSelectedStudent(null);
    setStudentSearch("");
    setHealthProfile(null);
    setRegularMeds([]);
    setForm(EMPTY_FORM);
    setMedications([]);
    setActiveTab("hoy");
    loadToday();
  };

  // ── Load historial ──────────────────────────────────────────────────────────
  const loadHistorial = useCallback(async () => {
    if (!activePeriodId) return;
    setLoadingHistorial(true);
    const supabase = createClient();

    const { data } = await supabase
      .from("nurse_visit")
      .select(`
        id, visit_date, reason, status, parent_notified, diagnosis,
        student_enrolled (
          user_id,
          profiles:user_id ( full_name, document_number )
        )
      `)
      .eq("academic_period_id", activePeriodId)
      .order("visit_date", { ascending: false })
      .limit(100);

    const mapped: VisitRow[] = (data ?? []).map((v: any) => ({
      id: v.id,
      visit_date: v.visit_date,
      reason: v.reason,
      status: v.status,
      parent_notified: v.parent_notified,
      diagnosis: v.diagnosis,
      student_name: v.student_enrolled?.profiles?.full_name ?? "—",
      document_number: v.student_enrolled?.profiles?.document_number ?? "—",
    }));

    setHistorialVisits(mapped);
    setLoadingHistorial(false);
  }, [activePeriodId]);

  useEffect(() => {
    if (activeTab === "historial") loadHistorial();
  }, [activeTab, loadHistorial]);

  // ── Helpers ─────────────────────────────────────────────────────────────────
  const setF = (key: keyof typeof EMPTY_FORM, val: any) =>
    setForm((p) => ({ ...p, [key]: val }));

  const addMedication = () =>
    setMedications((p) => [...p, { name: "", dosage: "", route: "oral" }]);

  const updateMed = (i: number, key: string, val: string) =>
    setMedications((p) => p.map((m, idx) => (idx === i ? { ...m, [key]: val } : m)));

  const removeMed = (i: number) =>
    setMedications((p) => p.filter((_, idx) => idx !== i));

  const filteredHistorial = historialVisits.filter((v) => {
    const matchSearch =
      historialSearch === "" ||
      v.student_name.toLowerCase().includes(historialSearch.toLowerCase()) ||
      v.document_number.includes(historialSearch) ||
      v.reason.toLowerCase().includes(historialSearch.toLowerCase());
    const matchStatus = historialStatus === "all" || v.status === historialStatus;
    return matchSearch && matchStatus;
  });

  // ── Today stats ─────────────────────────────────────────────────────────────
  const todayStats = {
    total:        todayVisits.length,
    atendido:     todayVisits.filter((v) => v.status === "atendido").length,
    observacion:  todayVisits.filter((v) => v.status === "en_observacion").length,
    urgente:      todayVisits.filter((v) => v.status === "remitido" || v.status === "enviado_a_casa").length,
  };

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-full">

      {/* ── Top bar ── */}
      <div className="px-6 py-4 border-b bg-background/80 backdrop-blur-sm flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
            <Stethoscope className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="font-bold text-base leading-tight">Enfermería</h1>
            <p className="text-[11px] text-muted-foreground">
              {new Date().toLocaleDateString("es-CO", { weekday: "long", day: "numeric", month: "long" })}
            </p>
          </div>
        </div>

        {/* Tab nav */}
        <nav className="flex items-center gap-1 bg-muted/60 rounded-xl p-1">
          {[
            { id: "hoy",      label: "Hoy",           icon: Home },
            { id: "nueva",    label: "Nueva atención", icon: Stethoscope },
            { id: "historial",label: "Historial",      icon: ClipboardList },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as any)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
                activeTab === id
                  ? "bg-background shadow-sm text-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
            </button>
          ))}
        </nav>
      </div>

      {/* ── Content ── */}
      <div className="flex-1 overflow-auto p-6">

        {/* ════════════════════════════════════════
            HOY
            ════════════════════════════════════════ */}
        {activeTab === "hoy" && (
          <div className="max-w-4xl mx-auto space-y-6">

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: "Atenciones hoy", value: todayStats.total,       icon: Stethoscope, color: "text-primary bg-primary/10" },
                { label: "Atendidos",       value: todayStats.atendido,    icon: CheckCircle2, color: "text-emerald-600 bg-emerald-50" },
                { label: "En observación",  value: todayStats.observacion, icon: Eye,          color: "text-amber-600 bg-amber-50" },
                { label: "Urgentes",        value: todayStats.urgente,     icon: AlertTriangle, color: "text-red-600 bg-red-50" },
              ].map(({ label, value, icon: Icon, color }) => (
                <div key={label} className="bg-card border rounded-xl p-4">
                  <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center mb-3", color)}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <p className="text-2xl font-bold">{value}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
                </div>
              ))}
            </div>

            {/* List */}
            <div className="bg-card border rounded-xl overflow-hidden">
              <div className="flex items-center justify-between px-5 py-3 border-b bg-muted/30">
                <p className="text-sm font-semibold">Atenciones del día</p>
                <Button size="sm" variant="ghost" onClick={loadToday} className="h-7 w-7 p-0">
                  <RefreshCw className="w-3.5 h-3.5" />
                </Button>
              </div>

              {loadingToday ? (
                <div className="flex items-center justify-center py-12 gap-2 text-muted-foreground">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm">Cargando...</span>
                </div>
              ) : todayVisits.length === 0 ? (
                <div className="flex flex-col items-center py-12 text-center text-muted-foreground">
                  <Stethoscope className="w-8 h-8 mb-2 opacity-30" />
                  <p className="text-sm">Sin atenciones registradas hoy</p>
                  <Button
                    size="sm"
                    className="mt-3"
                    onClick={() => setActiveTab("nueva")}
                  >
                    <Plus className="w-4 h-4 mr-1.5" /> Registrar atención
                  </Button>
                </div>
              ) : (
                <div className="divide-y">
                  {todayVisits.map((v) => (
                    <div key={v.id} className="flex items-center gap-4 px-5 py-3 hover:bg-muted/30 transition-colors">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <User className="w-4 h-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{v.student_name}</p>
                        <p className="text-xs text-muted-foreground truncate">{v.reason}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Badge variant="outline" className={cn("text-[10px] font-medium border", STATUS_BADGE[v.status])}>
                          {STATUS_OPTIONS.find((s) => s.value === v.status)?.label.split("—")[0].trim()}
                        </Badge>
                        {v.parent_notified && (
                          <Bell className="w-3.5 h-3.5 text-primary" title="Padre notificado" />
                        )}
                        <span className="text-[10px] text-muted-foreground">
                          {new Date(v.visit_date).toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Button
              className="w-full"
              onClick={() => setActiveTab("nueva")}
            >
              <Plus className="w-4 h-4 mr-2" />
              Registrar nueva atención
            </Button>
          </div>
        )}

        {/* ════════════════════════════════════════
            NUEVA ATENCIÓN
            ════════════════════════════════════════ */}
        {activeTab === "nueva" && (
          <div className="max-w-3xl mx-auto space-y-5">

            <div>
              <h2 className="text-base font-bold">Nueva atención</h2>
              <p className="text-xs text-muted-foreground">Busca al estudiante, completa el formulario y guarda la atención.</p>
            </div>

            {/* Student search */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Estudiante
              </Label>
              <div className="relative" ref={searchRef}>
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                <Input
                  value={studentSearch}
                  onChange={(e) => {
                    setStudentSearch(e.target.value);
                    setSearchOpen(true);
                    if (selectedStudent && e.target.value !== selectedStudent.fullName) {
                      setSelectedStudent(null);
                      setHealthProfile(null);
                      setRegularMeds([]);
                    }
                  }}
                  onFocus={() => setSearchOpen(true)}
                  placeholder="Buscar por nombre o número de documento..."
                  className="pl-9"
                />
                {searching && (
                  <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 animate-spin text-muted-foreground" />
                )}

                {/* Search dropdown */}
                {searchOpen && searchResults.length > 0 && !selectedStudent && (
                  <div className="absolute z-20 top-full mt-1 w-full bg-background border rounded-xl shadow-lg overflow-hidden">
                    {searchResults.map((s) => (
                      <button
                        key={s.enrolledId}
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => selectStudent(s)}
                        className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-muted/60 transition-colors text-left"
                      >
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                          <User className="w-4 h-4 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{s.fullName}</p>
                          <p className="text-xs text-muted-foreground">{s.courseName} · Grupo {s.groupName} · {s.documentNumber}</p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-muted-foreground" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Health profile card */}
            {selectedStudent && (
              <div className="rounded-xl border-2 border-primary/20 bg-primary/5 overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 bg-primary/10">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-primary" />
                    <span className="text-sm font-semibold">{selectedStudent.fullName}</span>
                    <span className="text-xs text-muted-foreground">· {selectedStudent.courseName} Gr.{selectedStudent.groupName}</span>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedStudent(null);
                      setStudentSearch("");
                      setHealthProfile(null);
                      setRegularMeds([]);
                    }}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {loadingProfile ? (
                  <div className="flex items-center gap-2 px-4 py-3 text-muted-foreground text-sm">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" /> Cargando perfil de salud...
                  </div>
                ) : (
                  <div className="p-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    {/* Blood type */}
                    <div className="flex items-center gap-2">
                      <Heart className="w-3.5 h-3.5 text-red-500 shrink-0" />
                      <div>
                        <p className="text-muted-foreground">Sangre</p>
                        <p className="font-semibold">{healthProfile?.blood_type ?? "—"}</p>
                      </div>
                    </div>
                    {/* EPS */}
                    <div className="flex items-center gap-2">
                      <Shield className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                      <div>
                        <p className="text-muted-foreground">EPS</p>
                        <p className="font-semibold">{healthProfile?.insurance_provider ?? "—"}</p>
                      </div>
                    </div>
                    {/* Emergency */}
                    <div className="flex items-center gap-2 col-span-2">
                      <Phone className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <div>
                        <p className="text-muted-foreground">Contacto emergencia</p>
                        <p className="font-semibold">
                          {healthProfile?.emergency_contact_name ?? "—"}
                          {healthProfile?.emergency_contact_phone ? ` · ${healthProfile.emergency_contact_phone}` : ""}
                        </p>
                      </div>
                    </div>

                    {/* Allergies */}
                    {(healthProfile?.allergies ?? []).length > 0 && (
                      <div className="col-span-2 sm:col-span-4 flex items-start gap-2 bg-red-50 rounded-lg p-2.5 border border-red-200">
                        <AlertTriangle className="w-3.5 h-3.5 text-red-500 mt-0.5 shrink-0" />
                        <div>
                          <p className="text-red-700 font-semibold">Alergias:</p>
                          <p className="text-red-600">{healthProfile!.allergies.join(", ")}</p>
                        </div>
                      </div>
                    )}

                    {/* Regular meds */}
                    {regularMeds.length > 0 && (
                      <div className="col-span-2 sm:col-span-4 flex items-start gap-2 bg-amber-50 rounded-lg p-2.5 border border-amber-200">
                        <Pill className="w-3.5 h-3.5 text-amber-600 mt-0.5 shrink-0" />
                        <div>
                          <p className="text-amber-700 font-semibold">Medicamentos regulares:</p>
                          {regularMeds.map((m) => (
                            <p key={m.id} className="text-amber-600">
                              {m.medication_name} {m.dosage} — {m.frequency}
                            </p>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Chronic conditions */}
                    {healthProfile?.chronic_conditions && (
                      <div className="col-span-2 sm:col-span-4 text-muted-foreground">
                        <span className="font-medium">Condiciones crónicas: </span>
                        {healthProfile.chronic_conditions}
                      </div>
                    )}

                    {!healthProfile && (
                      <p className="col-span-2 sm:col-span-4 text-muted-foreground italic">
                        Sin perfil de salud registrado. Puedes crearlo en "Perfiles de salud".
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Visit form — only shown after student selected */}
            {selectedStudent && (
              <div className="space-y-5">
                <Separator />

                {/* Motivo */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Motivo de consulta *
                  </Label>
                  <Select value={form.reason} onValueChange={(v) => setF("reason", v)}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecciona el motivo" />
                    </SelectTrigger>
                    <SelectContent>
                      {COMMON_REASONS.map((r) => (
                        <SelectItem key={r} value={r}>{r}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {form.reason === "Otro" && (
                    <Input
                      value={form.customReason}
                      onChange={(e) => setF("customReason", e.target.value)}
                      placeholder="Describe el motivo..."
                      className="mt-2"
                    />
                  )}
                </div>

                {/* Síntomas */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Síntomas
                  </Label>
                  <Textarea
                    value={form.symptoms}
                    onChange={(e) => setF("symptoms", e.target.value)}
                    placeholder="Describe los síntomas relatados por el estudiante..."
                    rows={2}
                    className="resize-none"
                  />
                </div>

                {/* Signos vitales */}
                <div className="space-y-2">
                  <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground flex items-center gap-1.5">
                    <Thermometer className="w-3.5 h-3.5" /> Signos vitales
                  </Label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                      { key: "temperature",   label: "Temperatura (°C)", placeholder: "37.0" },
                      { key: "blood_pressure",label: "Presión arterial",  placeholder: "120/80" },
                      { key: "heart_rate",    label: "Frec. cardíaca",    placeholder: "80" },
                      { key: "weight_kg",     label: "Peso (kg)",         placeholder: "45.0" },
                    ].map(({ key, label, placeholder }) => (
                      <div key={key} className="space-y-1">
                        <Label className="text-[10px] text-muted-foreground">{label}</Label>
                        <Input
                          value={(form as any)[key]}
                          onChange={(e) => setF(key as any, e.target.value)}
                          placeholder={placeholder}
                          className="h-8 text-sm"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Diagnóstico */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Diagnóstico / Observación
                  </Label>
                  <Textarea
                    value={form.diagnosis}
                    onChange={(e) => setF("diagnosis", e.target.value)}
                    placeholder="Diagnóstico o evaluación del enfermero/a..."
                    rows={2}
                    className="resize-none"
                  />
                </div>

                {/* Tratamiento */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Tratamiento aplicado
                  </Label>
                  <Textarea
                    value={form.treatment}
                    onChange={(e) => setF("treatment", e.target.value)}
                    placeholder="Describe el tratamiento realizado en enfermería..."
                    rows={2}
                    className="resize-none"
                  />
                </div>

                {/* Medicamentos aplicados */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground flex items-center gap-1.5">
                      <Pill className="w-3.5 h-3.5" /> Medicamentos aplicados
                    </Label>
                    <Button size="sm" variant="outline" className="h-7 text-xs" onClick={addMedication}>
                      <Plus className="w-3 h-3 mr-1" /> Agregar
                    </Button>
                  </div>
                  {medications.map((m, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <Input
                        value={m.name}
                        onChange={(e) => updateMed(i, "name", e.target.value)}
                        placeholder="Medicamento"
                        className="flex-1 h-8 text-sm"
                      />
                      <Input
                        value={m.dosage}
                        onChange={(e) => updateMed(i, "dosage", e.target.value)}
                        placeholder="Dosis"
                        className="w-24 h-8 text-sm"
                      />
                      <Select value={m.route} onValueChange={(v) => updateMed(i, "route", v)}>
                        <SelectTrigger className="w-28 h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="oral">Oral</SelectItem>
                          <SelectItem value="topico">Tópico</SelectItem>
                          <SelectItem value="inhalado">Inhalado</SelectItem>
                          <SelectItem value="inyectable">Inyectable</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive" onClick={() => removeMed(i)}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  ))}
                </div>

                {/* Estado */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Estado del estudiante *
                  </Label>
                  <div className="grid grid-cols-2 gap-2">
                    {STATUS_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => setF("status", opt.value)}
                        className={cn(
                          "flex items-center gap-2 px-3 py-2.5 rounded-xl border-2 text-xs font-medium transition-all text-left",
                          form.status === opt.value
                            ? "border-primary bg-primary/5 text-foreground shadow-sm"
                            : "border-border/60 bg-muted/30 text-muted-foreground hover:border-border",
                        )}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Notas */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Observaciones adicionales
                  </Label>
                  <Textarea
                    value={form.notes}
                    onChange={(e) => setF("notes", e.target.value)}
                    placeholder="Notas adicionales..."
                    rows={2}
                    className="resize-none"
                  />
                </div>

                {/* Notify parent toggle */}
                <div className={cn(
                  "flex items-start gap-3 p-4 rounded-xl border-2 transition-all",
                  form.notify_parent
                    ? "border-primary/30 bg-primary/5"
                    : "border-border/60 bg-muted/20",
                )}>
                  <Checkbox
                    id="notify"
                    checked={form.notify_parent}
                    onCheckedChange={(v) => setF("notify_parent", !!v)}
                    className="mt-0.5"
                  />
                  <div>
                    <label htmlFor="notify" className="text-sm font-semibold cursor-pointer flex items-center gap-1.5">
                      <Send className="w-3.5 h-3.5 text-primary" />
                      Notificar al padre / madre de familia ahora
                    </label>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Se enviará un correo inmediatamente con el resumen de la atención.
                      {(form.status === "remitido" || form.status === "enviado_a_casa") &&
                        " ⚠️ Se marcará como alerta urgente."}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      setSelectedStudent(null);
                      setStudentSearch("");
                      setHealthProfile(null);
                      setRegularMeds([]);
                      setForm(EMPTY_FORM);
                      setMedications([]);
                    }}
                  >
                    Cancelar
                  </Button>
                  <Button
                    className="flex-1"
                    disabled={saving || !form.reason}
                    onClick={handleSave}
                  >
                    {saving ? (
                      <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Guardando...</>
                    ) : (
                      <><CheckCircle2 className="w-4 h-4 mr-2" /> Guardar atención</>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ════════════════════════════════════════
            HISTORIAL
            ════════════════════════════════════════ */}
        {activeTab === "historial" && (
          <div className="max-w-4xl mx-auto space-y-4">
            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                <Input
                  value={historialSearch}
                  onChange={(e) => setHistorialSearch(e.target.value)}
                  placeholder="Buscar por nombre, documento o motivo..."
                  className="pl-9"
                />
              </div>
              <Select value={historialStatus} onValueChange={setHistorialStatus}>
                <SelectTrigger className="w-44">
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados</SelectItem>
                  {STATUS_OPTIONS.map((s) => (
                    <SelectItem key={s.value} value={s.value}>{s.label.split("—")[0].trim()}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button size="sm" variant="outline" className="h-9 w-9 p-0" onClick={loadHistorial}>
                <RefreshCw className={cn("w-4 h-4", loadingHistorial && "animate-spin")} />
              </Button>
            </div>

            <div className="bg-card border rounded-xl overflow-hidden">
              {loadingHistorial ? (
                <div className="flex items-center justify-center py-12 gap-2 text-muted-foreground">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm">Cargando historial...</span>
                </div>
              ) : filteredHistorial.length === 0 ? (
                <div className="flex flex-col items-center py-12 text-muted-foreground">
                  <ClipboardList className="w-8 h-8 mb-2 opacity-30" />
                  <p className="text-sm">Sin registros encontrados</p>
                </div>
              ) : (
                <div className="divide-y">
                  {filteredHistorial.map((v) => (
                    <div key={v.id} className="flex items-center gap-4 px-5 py-3 hover:bg-muted/30 transition-colors">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <User className="w-4 h-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{v.student_name}</p>
                        <p className="text-xs text-muted-foreground truncate">{v.reason}</p>
                        {v.diagnosis && (
                          <p className="text-xs text-muted-foreground/70 truncate">{v.diagnosis}</p>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <Badge variant="outline" className={cn("text-[10px] font-medium border", STATUS_BADGE[v.status])}>
                          {STATUS_OPTIONS.find((s) => s.value === v.status)?.label.split("—")[0].trim()}
                        </Badge>
                        <div className="flex items-center gap-1.5">
                          {v.parent_notified && <Bell className="w-3 h-3 text-primary" />}
                          <span className="text-[10px] text-muted-foreground">
                            {new Date(v.visit_date).toLocaleDateString("es-CO", {
                              day: "2-digit", month: "short",
                            })}{" "}
                            {new Date(v.visit_date).toLocaleTimeString("es-CO", {
                              hour: "2-digit", minute: "2-digit",
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
