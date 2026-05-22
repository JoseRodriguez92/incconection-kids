"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import {
  Camera, Save, LogOut, Users, GraduationCap, Book,
  CheckCircle2, Sparkles, ShoppingCart, Brain, Route, Stethoscope, MoreVertical,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AddressMapPicker } from "./AddressMapPicker";
import { createClient } from "@/lib/supabase/client";
import { ManagmentStorage } from "@/components/Services/ManagmentStorage/ManagmentStorage";
import { goToPath } from "@/components/function/RedirectHomeRoll/GoToPath";
import { UserInfoStore } from "@/Stores/UserInfoStore";
import { toast as sonnerToast } from "sonner";

// ── Role config ───────────────────────────────────────────────────────────────
export const roleConfig: Record<string, { label: string; icon: any; route: string }> = {
  "super-admin": { label: "Super Administrador", icon: Sparkles,      route: "/usuario/super-admin"   },
  tienda:        { label: "Tienda",               icon: ShoppingCart,  route: "/usuario/tienda"        },
  "padre-familia":{ label: "Padre de Familia",   icon: Users,         route: "/usuario/padre-familia" },
  psicologia:    { label: "Psicología",           icon: Brain,         route: "/usuario/psicologia"    },
  enfermeria:    { label: "Enfermería",           icon: Stethoscope,   route: "/usuario/enfermeria"    },
  profesor:      { label: "Profesor",             icon: GraduationCap, route: "/usuario/profesor"      },
  estudiante:    { label: "Estudiante",           icon: Book,          route: "/usuario/estudiante"    },
  ruta:          { label: "Ruta",                 icon: Route,         route: "/usuario/ruta"          },
};

// ── Types ─────────────────────────────────────────────────────────────────────
type ProfileTab = "personal" | "familia" | "docente" | "estudiantil";

export interface ProfileDialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  /** Called after a successful profile save so the Sidebar footer can update */
  onProfileSaved?: (fullName: string, avatar: string) => void;
}

// ── Helper: shared field class ────────────────────────────────────────────────
const fieldCls = (editing: boolean) =>
  cn("h-9 text-sm", !editing && "bg-muted/60 border-transparent");

// ── Component ─────────────────────────────────────────────────────────────────
export function ProfileDialog({ open, onOpenChange, onProfileSaved }: ProfileDialogProps) {
  const { toast } = useToast();
  const roles       = UserInfoStore((s) => s.roles);
  const currentRole = UserInfoStore((s) => s.current_role);

  // ── Core state ──────────────────────────────────────────────────────────────
  const [userId,         setUserId]         = useState<string | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [showAvatarUrl,  setShowAvatarUrl]  = useState(false);
  const [avatarUrlInput, setAvatarUrlInput] = useState("");
  const [isEditing,      setIsEditing]      = useState(false);
  const [activeTab,      setActiveTab]      = useState<ProfileTab>("personal");

  const [userProfile, setUserProfile] = useState({
    nombre: "", apellido: "", correo: "", telefono: "",
    avatar: "", direccion: "", ciudad: "", nacionalidad: "",
    fechaNacimiento: "", genero: "",
    latitude:  null as number | null,
    longitude: null as number | null,
  });

  // ── Family state ─────────────────────────────────────────────────────────────
  const [familyStudents,  setFamilyStudents]  = useState<{ id: string; full_name: string; email: string | null; avatar_url: string | null }[]>([]);
  const [loadingFamily,   setLoadingFamily]   = useState(false);

  // ── Parent details state ──────────────────────────────────────────────────────
  const [parentDetails,         setParentDetails]         = useState({ occupation: "", employer: "", work_phone: "", education_level: "", relationship_to_student: "" });
  const [editingParentDetails,  setEditingParentDetails]  = useState(false);
  const [loadingParentDetails,  setLoadingParentDetails]  = useState(false);

  // ── Teacher details state ─────────────────────────────────────────────────────
  const [teacherDetails,        setTeacherDetails]        = useState({ professional_title: "", specialization: "", hire_date: "", contract_type: "", resolution_number: "", teaching_license: "" });
  const [editingTeacherDetails, setEditingTeacherDetails] = useState(false);
  const [loadingTeacherDetails, setLoadingTeacherDetails] = useState(false);

  // ── Student details state ─────────────────────────────────────────────────────
  const [studentDetails,        setStudentDetails]        = useState({
    blood_type: "", eps: "", socioeconomic_stratum: "", ethnicity: "",
    disability_type: "", lives_with: "", siblings_count: "", transport_type: "",
    lunch_at_school: false, emergency_contact_name: "", emergency_contact_phone: "",
    emergency_contact_relationship: "", birth_city: "", entry_year: "", previous_school: "",
  });
  const [editingStudentDetails, setEditingStudentDetails] = useState(false);
  const [loadingStudentDetails, setLoadingStudentDetails] = useState(false);

  // ── Refresh roles from Supabase whenever the dialog opens ────────────────────
  useEffect(() => {
    if (!open) return;
    (async () => {
      const id = ManagmentStorage.getItem<string>("id_User");
      if (!id) return;
      const supabase = createClient();
      const { data: prRows } = await supabase
        .from("profiles_roles")
        .select("role_id")
        .eq("user_id", id);
      if (!prRows || prRows.length === 0) return;
      const roleIds = prRows.map((r: any) => r.role_id);
      const { data: rolesData } = await supabase
        .from("roles")
        .select("name")
        .in("id", roleIds);
      if (rolesData && rolesData.length > 0) {
        const freshRoles = rolesData.map((r: any) => r.name);
        UserInfoStore.getState().setRoles(freshRoles);
      }
    })();
  }, [open]);

  // ── Load base profile ─────────────────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      const id = ManagmentStorage.getItem<string>("id_User");
      if (!id) return;
      setUserId(id);
      const supabase = createClient();
      const { data } = await supabase
        .from("profiles")
        .select("full_name, first_name, last_name, email, phone, avatar_url, address, city, nationality, birth_date, gender, latitude, longitude")
        .eq("id", id)
        .single();
      if (!data) return;
      let nombre  = data.first_name || "";
      let apellido = data.last_name  || "";
      if (!nombre && !apellido && data.full_name) {
        const p = data.full_name.split(" ");
        nombre   = p[0] || "Usuario";
        apellido = p.slice(1).join(" ") || "";
      }
      setUserProfile({
        nombre, apellido,
        correo:          data.email        || "",
        telefono:        data.phone        || "",
        avatar:          data.avatar_url   || "",
        direccion:       data.address      || "",
        ciudad:          data.city         || "",
        nacionalidad:    data.nationality  || "",
        fechaNacimiento: data.birth_date   || "",
        genero:          data.gender       || "",
        latitude:        (data as any).latitude  ?? null,
        longitude:       (data as any).longitude ?? null,
      });
    })();
  }, []);

  // ── Handlers: personal ────────────────────────────────────────────────────────
  const handleProfileChange = (field: string, value: string) =>
    setUserProfile((p) => ({ ...p, [field]: value }));

  const handleSaveProfile = async () => {
    if (!userId) return;
    const supabase  = createClient();
    const fullName  = `${userProfile.nombre} ${userProfile.apellido}`.trim();
    const { error } = await supabase
      .from("profiles")
      .update({
        first_name: userProfile.nombre,
        last_name:  userProfile.apellido,
        full_name:  fullName,
        phone:      userProfile.telefono      || null,
        address:    userProfile.direccion     || null,
        city:       userProfile.ciudad        || null,
        nationality: userProfile.nacionalidad || null,
        birth_date: userProfile.fechaNacimiento || null,
        gender:     userProfile.genero        || null,
        latitude:   userProfile.latitude,
        longitude:  userProfile.longitude,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Perfil actualizado" });
      setIsEditing(false);
      onProfileSaved?.(fullName, userProfile.avatar);
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !userId) return;
    if (!file.type.startsWith("image/")) {
      toast({ title: "Error", description: "Solo se permiten imágenes", variant: "destructive" });
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast({ title: "Error", description: "La imagen no debe superar 2 MB", variant: "destructive" });
      return;
    }
    setUploadingAvatar(true);
    const supabase = createClient();
    try {
      const ext      = file.name.split(".").pop();
      const filePath = `avatars/${userId}_${Date.now()}.${ext}`;
      const { data: up, error: upErr } = await supabase.storage
        .from("profiles-avatars").upload(filePath, file, { upsert: true });
      if (upErr) throw upErr;
      const { data: pub } = supabase.storage.from("profiles-avatars").getPublicUrl(up.path);
      await supabase.from("profiles").update({ avatar_url: pub.publicUrl, updated_at: new Date().toISOString() }).eq("id", userId);
      setUserProfile((p) => ({ ...p, avatar: pub.publicUrl }));
      onProfileSaved?.(`${userProfile.nombre} ${userProfile.apellido}`, pub.publicUrl);
      toast({ title: "Foto actualizada" });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleAvatarUrlSave = async () => {
    if (!userId || !avatarUrlInput.trim()) return;
    setUploadingAvatar(true);
    const supabase  = createClient();
    const { error } = await supabase.from("profiles")
      .update({ avatar_url: avatarUrlInput.trim(), updated_at: new Date().toISOString() })
      .eq("id", userId);
    if (!error) {
      setUserProfile((p) => ({ ...p, avatar: avatarUrlInput.trim() }));
      onProfileSaved?.(`${userProfile.nombre} ${userProfile.apellido}`, avatarUrlInput.trim());
      toast({ title: "Foto actualizada" });
      setShowAvatarUrl(false);
      setAvatarUrlInput("");
    } else {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
    setUploadingAvatar(false);
  };

  const handleSwitchRole = (role: string) => {
    UserInfoStore.getState().setCurrentRole(role);
    onOpenChange(false);
    const cfg = roleConfig[role];
    if (cfg) goToPath(cfg.route);
  };

  const handleLogout = () => {
    const supabase = createClient();
    sonnerToast.promise(
      (async () => {
        await supabase.auth.signOut();
        UserInfoStore.getState().clear();
        ManagmentStorage.clear();
      })(),
      { loading: "Cerrando sesión...", success: "Sesión cerrada", error: "Error al cerrar sesión" },
    );
    goToPath("/");
  };

  // ── Handlers: family ─────────────────────────────────────────────────────────
  const loadFamilyData = async () => {
    if (!userId || loadingFamily) return;
    setLoadingFamily(true);
    const supabase  = createClient();
    const { data }  = await supabase
      .from("parent_has_student")
      .select("profiles!parent_has_student_student_id_fkey(id, full_name, email, avatar_url)")
      .eq("parent_id", userId);
    if (data) setFamilyStudents((data as any[]).map((d) => d.profiles).filter(Boolean));
    setLoadingFamily(false);
  };

  // ── Handlers: parent_details ──────────────────────────────────────────────────
  const loadParentDetails = async () => {
    if (!userId || loadingParentDetails) return;
    setLoadingParentDetails(true);
    const { data } = await createClient()
      .from("parent_details")
      .select("occupation, employer, work_phone, education_level, relationship_to_student")
      .eq("profile_id", userId).maybeSingle();
    if (data) setParentDetails({
      occupation: data.occupation ?? "", employer: data.employer ?? "",
      work_phone: data.work_phone ?? "", education_level: data.education_level ?? "",
      relationship_to_student: data.relationship_to_student ?? "",
    });
    setLoadingParentDetails(false);
  };

  const saveParentDetails = async () => {
    if (!userId) return;
    const { error } = await createClient().from("parent_details").upsert({
      profile_id: userId,
      occupation: parentDetails.occupation || null, employer: parentDetails.employer || null,
      work_phone: parentDetails.work_phone || null, education_level: parentDetails.education_level || null,
      relationship_to_student: parentDetails.relationship_to_student || null,
      updated_at: new Date().toISOString(),
    }, { onConflict: "profile_id" });
    if (!error) { setEditingParentDetails(false); toast({ title: "Perfil guardado" }); }
    else toast({ title: "Error", description: error.message, variant: "destructive" });
  };

  // ── Handlers: teacher_details ─────────────────────────────────────────────────
  const loadTeacherDetails = async () => {
    if (!userId || loadingTeacherDetails) return;
    setLoadingTeacherDetails(true);
    const { data } = await createClient()
      .from("teacher_details")
      .select("professional_title, specialization, hire_date, contract_type, resolution_number, teaching_license")
      .eq("profile_id", userId).maybeSingle();
    if (data) setTeacherDetails({
      professional_title: data.professional_title ?? "", specialization: data.specialization ?? "",
      hire_date: data.hire_date ?? "", contract_type: data.contract_type ?? "",
      resolution_number: data.resolution_number ?? "", teaching_license: data.teaching_license ?? "",
    });
    setLoadingTeacherDetails(false);
  };

  const saveTeacherDetails = async () => {
    if (!userId) return;
    const { error } = await createClient().from("teacher_details").upsert({
      profile_id: userId,
      professional_title: teacherDetails.professional_title || null,
      specialization: teacherDetails.specialization || null,
      hire_date: teacherDetails.hire_date || null,
      contract_type: teacherDetails.contract_type || null,
      resolution_number: teacherDetails.resolution_number || null,
      teaching_license: teacherDetails.teaching_license || null,
      updated_at: new Date().toISOString(),
    }, { onConflict: "profile_id" });
    if (!error) { setEditingTeacherDetails(false); toast({ title: "Perfil guardado" }); }
    else toast({ title: "Error", description: error.message, variant: "destructive" });
  };

  // ── Handlers: student_details ─────────────────────────────────────────────────
  const loadStudentDetails = async () => {
    if (!userId || loadingStudentDetails) return;
    setLoadingStudentDetails(true);
    const { data } = await createClient()
      .from("student_details")
      .select("blood_type, eps, socioeconomic_stratum, ethnicity, disability_type, lives_with, siblings_count, transport_type, lunch_at_school, emergency_contact_name, emergency_contact_phone, emergency_contact_relationship, birth_city, entry_year, previous_school")
      .eq("profile_id", userId).maybeSingle();
    if (data) setStudentDetails({
      blood_type: data.blood_type ?? "", eps: data.eps ?? "",
      socioeconomic_stratum: data.socioeconomic_stratum?.toString() ?? "",
      ethnicity: data.ethnicity ?? "", disability_type: data.disability_type ?? "",
      lives_with: data.lives_with ?? "", siblings_count: data.siblings_count?.toString() ?? "",
      transport_type: data.transport_type ?? "", lunch_at_school: data.lunch_at_school ?? false,
      emergency_contact_name: data.emergency_contact_name ?? "",
      emergency_contact_phone: data.emergency_contact_phone ?? "",
      emergency_contact_relationship: data.emergency_contact_relationship ?? "",
      birth_city: data.birth_city ?? "", entry_year: data.entry_year?.toString() ?? "",
      previous_school: data.previous_school ?? "",
    });
    setLoadingStudentDetails(false);
  };

  const saveStudentDetails = async () => {
    if (!userId) return;
    const { error } = await createClient().from("student_details").upsert({
      profile_id: userId,
      blood_type: studentDetails.blood_type || null,
      eps: studentDetails.eps || null,
      socioeconomic_stratum: studentDetails.socioeconomic_stratum ? parseInt(studentDetails.socioeconomic_stratum) : null,
      ethnicity: studentDetails.ethnicity || null,
      disability_type: studentDetails.disability_type || null,
      lives_with: studentDetails.lives_with || null,
      siblings_count: studentDetails.siblings_count ? parseInt(studentDetails.siblings_count) : null,
      transport_type: studentDetails.transport_type || null,
      lunch_at_school: studentDetails.lunch_at_school,
      emergency_contact_name: studentDetails.emergency_contact_name || null,
      emergency_contact_phone: studentDetails.emergency_contact_phone || null,
      emergency_contact_relationship: studentDetails.emergency_contact_relationship || null,
      birth_city: studentDetails.birth_city || null,
      entry_year: studentDetails.entry_year ? parseInt(studentDetails.entry_year) : null,
      previous_school: studentDetails.previous_school || null,
      updated_at: new Date().toISOString(),
    }, { onConflict: "profile_id" });
    if (!error) { setEditingStudentDetails(false); toast({ title: "Perfil guardado" }); }
    else toast({ title: "Error", description: error.message, variant: "destructive" });
  };

  const handleTabChange = (tab: ProfileTab) => {
    setActiveTab(tab);
    if (tab === "familia")    { loadFamilyData(); loadParentDetails(); }
    if (tab === "docente")      loadTeacherDetails();
    if (tab === "estudiantil")  loadStudentDetails();
  };

  // ── Tab list ──────────────────────────────────────────────────────────────────
  const tabs: { id: ProfileTab; label: string }[] = [
    { id: "personal",     label: "Personal"     },
    ...(roles.includes("padre-familia") ? [{ id: "familia"     as ProfileTab, label: "Familia"     }] : []),
    ...(roles.includes("profesor")      ? [{ id: "docente"     as ProfileTab, label: "Docente"     }] : []),
    ...(roles.includes("estudiante")    ? [{ id: "estudiantil" as ProfileTab, label: "Estudiantil" }] : []),
  ];

  // ── Sub-component helpers ─────────────────────────────────────────────────────
  const SectionHeader = ({
    label, editing, onEdit, onCancel, onSave,
  }: {
    label: string; editing: boolean;
    onEdit: () => void; onCancel: () => void; onSave: () => void;
  }) => (
    <div className="flex items-center justify-between mb-3">
      <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">{label}</p>
      {!editing ? (
        <Button variant="outline" size="sm" className="h-7 text-xs px-3" onClick={onEdit}>Editar</Button>
      ) : (
        <div className="flex gap-1.5">
          <Button variant="outline" size="sm" className="h-7 text-xs px-3" onClick={onCancel}>Cancelar</Button>
          <Button size="sm" className="h-7 text-xs px-3 bg-[#25305D] hover:bg-[#1e2649] gap-1" onClick={onSave}>
            <Save className="w-3 h-3" /> Guardar
          </Button>
        </div>
      )}
    </div>
  );

  // ── JSX ───────────────────────────────────────────────────────────────────────
  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        onOpenChange(v);
        if (!v) { setIsEditing(false); setActiveTab("personal"); }
      }}
    >
      <DialogContent className="w-[calc(100%-1rem)] max-w-[calc(100%-1rem)] h-[90dvh] p-0 overflow-hidden gap-0 flex flex-col sm:w-[80dvw] sm:max-w-[80dvw] sm:h-[80dvh]">
        <DialogTitle className="sr-only">Perfil de Usuario</DialogTitle>

        <div className="flex flex-col sm:flex-row flex-1 min-h-0">

          {/* ── Left panel ── */}
          <div className="bg-[#25305D] shrink-0 flex flex-row items-center gap-3 px-4 py-3 sm:w-52 sm:flex-col sm:items-center sm:px-4 sm:py-7 sm:gap-4">
            {/* Avatar */}
            <div className="relative shrink-0">
              <Avatar className="w-12 h-12 sm:w-24 sm:h-24 ring-2 sm:ring-4 ring-white/20 shadow-xl">
                <AvatarImage src={userProfile.avatar || "/placeholder.svg"} />
                <AvatarFallback className="text-base sm:text-2xl bg-white/10 text-white font-bold">
                  {userProfile.nombre.charAt(0)}{userProfile.apellido.charAt(0)}
                </AvatarFallback>
              </Avatar>
              {isEditing && (
                <>
                  <input type="file" id="avatar-upload" accept="image/*"
                    className="hidden" onChange={handleAvatarChange} disabled={uploadingAvatar} />
                  <button
                    onClick={() => document.getElementById("avatar-upload")?.click()}
                    disabled={uploadingAvatar}
                    className="absolute -bottom-1 -right-1 w-7 h-7 bg-white rounded-full flex items-center justify-center shadow-md hover:bg-gray-50 transition-colors disabled:opacity-50"
                  >
                    <Camera className="w-3.5 h-3.5 text-[#25305D]" />
                  </button>
                </>
              )}
            </div>

            {/* Name + role */}
            <div className="flex-1 sm:flex-none sm:text-center min-w-0">
              <p className="text-white font-semibold text-sm leading-snug truncate">
                {userProfile.nombre} {userProfile.apellido}
              </p>
              <p className="text-white/50 text-xs mt-0.5 sm:mt-1 truncate">
                {roleConfig[currentRole ?? ""]?.label ?? currentRole ?? "—"}
              </p>
            </div>

            {/* Avatar URL input (desktop + editing only) */}
            {isEditing && (
              <div className="hidden sm:block w-full">
                {showAvatarUrl ? (
                  <div className="space-y-1.5">
                    <Input placeholder="https://..." value={avatarUrlInput}
                      onChange={(e) => setAvatarUrlInput(e.target.value)} disabled={uploadingAvatar}
                      className="h-8 text-xs bg-white/10 border-white/20 text-white placeholder:text-white/30" />
                    <div className="flex gap-1.5">
                      <Button size="sm" className="flex-1 h-7 text-xs bg-white text-[#25305D] hover:bg-white/90"
                        onClick={handleAvatarUrlSave} disabled={uploadingAvatar}>
                        {uploadingAvatar ? "..." : "Guardar"}
                      </Button>
                      <Button variant="ghost" size="sm" className="h-7 text-xs text-white/60 hover:text-white hover:bg-white/10"
                        onClick={() => { setShowAvatarUrl(false); setAvatarUrlInput(""); }}>✕</Button>
                    </div>
                  </div>
                ) : (
                  <button className="text-[11px] text-white/40 hover:text-white/70 transition-colors"
                    onClick={() => setShowAvatarUrl(true)}>
                    Cambiar foto con URL
                  </button>
                )}
              </div>
            )}

            <div className="hidden sm:block flex-1" />

            {/* Role switcher (desktop only) */}
            {roles.length > 1 && (
              <div className="hidden sm:block w-full space-y-2">
                <p className="text-[9px] font-semibold text-white/30 uppercase tracking-widest text-center">
                  Cambiar perfil
                </p>
                <div className="space-y-1">
                  {roles.map((role) => {
                    const cfg      = roleConfig[role];
                    if (!cfg) return null;
                    const isActive = role === currentRole;
                    return (
                      <button key={role}
                        onClick={() => !isActive && handleSwitchRole(role)}
                        disabled={isActive}
                        className={cn(
                          "w-full flex items-center gap-2 px-2.5 py-2 rounded-md text-left transition-all",
                          isActive ? "bg-white/15 text-white cursor-default" : "text-white/60 hover:text-white hover:bg-white/10 cursor-pointer",
                        )}
                      >
                        <cfg.icon className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate text-xs">{cfg.label}</span>
                        {isActive && <CheckCircle2 className="w-3 h-3 shrink-0 ml-auto opacity-70" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Mobile: kebab menu (roles + logout) — mr-8 to clear the dialog X button */}
            <div className="sm:hidden shrink-0 mr-8">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="p-1.5 rounded-md text-white/60 hover:text-white hover:bg-white/10 transition-colors">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="min-w-[180px]">
                  {roles.length > 1 && (
                    <>
                      <p className="px-2 py-1.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">
                        Cambiar perfil
                      </p>
                      {roles.map((role) => {
                        const cfg = roleConfig[role];
                        if (!cfg) return null;
                        const isActive = role === currentRole;
                        return (
                          <DropdownMenuItem
                            key={role}
                            onClick={() => !isActive && handleSwitchRole(role)}
                            disabled={isActive}
                            className="gap-2"
                          >
                            <cfg.icon className="w-4 h-4 shrink-0" />
                            <span className="truncate">{cfg.label}</span>
                            {isActive && <CheckCircle2 className="w-3 h-3 shrink-0 ml-auto" />}
                          </DropdownMenuItem>
                        );
                      })}
                      <DropdownMenuSeparator />
                    </>
                  )}
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="gap-2 text-red-500 focus:text-red-500 focus:bg-red-50"
                  >
                    <LogOut className="w-4 h-4 shrink-0" />
                    Cerrar sesión
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Desktop: logout button */}
            <button onClick={handleLogout}
              className="hidden sm:flex w-full items-center justify-center gap-2 py-2 rounded-md border border-red-400/30 text-red-300 text-xs font-medium hover:bg-red-400/10 transition-colors">
              <LogOut className="w-3.5 h-3.5" />
              Cerrar sesión
            </button>
          </div>

          {/* ── Right panel ── */}
          <div className="flex-1 flex flex-col min-w-0 min-h-0 overflow-hidden">
            {/* Tab bar + edit button */}
            <div className="flex items-center justify-between px-5 pr-12 py-3 border-b shrink-0">
              <div className="flex items-center gap-1">
                {tabs.map((tab) => (
                  <button key={tab.id} onClick={() => handleTabChange(tab.id)}
                    className={cn(
                      "px-3 py-1 text-xs rounded-md font-medium transition-colors",
                      activeTab === tab.id
                        ? "bg-[#25305D] text-white"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted",
                    )}>
                    {tab.label}
                  </button>
                ))}
              </div>
              {activeTab === "personal" && (
                !isEditing ? (
                  <Button variant="outline" size="sm" className="h-7 text-xs px-3" onClick={() => setIsEditing(true)}>
                    Editar
                  </Button>
                ) : (
                  <div className="flex gap-1.5">
                    <Button variant="outline" size="sm" className="h-7 text-xs px-3" onClick={() => setIsEditing(false)}>
                      Cancelar
                    </Button>
                    <Button size="sm" className="h-7 text-xs px-3 bg-[#25305D] hover:bg-[#1e2649] gap-1" onClick={handleSaveProfile}>
                      <Save className="w-3 h-3" /> Guardar
                    </Button>
                  </div>
                )
              )}
            </div>

            {/* ── Tab: Personal ── */}
            {activeTab === "personal" && (
              <div className="overflow-y-auto flex-1 px-5 py-4">
                <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Nombre</Label>
                    <Input value={userProfile.nombre} onChange={(e) => handleProfileChange("nombre", e.target.value)}
                      disabled={!isEditing} className={fieldCls(isEditing)} />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Apellido</Label>
                    <Input value={userProfile.apellido} onChange={(e) => handleProfileChange("apellido", e.target.value)}
                      disabled={!isEditing} className={fieldCls(isEditing)} />
                  </div>
                  <div className="space-y-1.5 col-span-2">
                    <Label className="text-xs text-muted-foreground">Correo electrónico</Label>
                    <div className="h-9 px-3 flex items-center rounded-md text-sm text-muted-foreground bg-muted/60 border border-transparent">
                      {userProfile.correo}
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Teléfono</Label>
                    <Input value={userProfile.telefono} onChange={(e) => handleProfileChange("telefono", e.target.value)}
                      disabled={!isEditing} className={fieldCls(isEditing)} />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Fecha de nacimiento</Label>
                    <Input type={isEditing ? "date" : "text"} value={userProfile.fechaNacimiento}
                      onChange={(e) => handleProfileChange("fechaNacimiento", e.target.value)}
                      disabled={!isEditing} className={fieldCls(isEditing)} />
                  </div>
                  <div className="space-y-1.5 col-span-2">
                    <Label className="text-xs text-muted-foreground">Dirección y ubicación</Label>
                    <AddressMapPicker
                      address={userProfile.direccion}
                      latitude={userProfile.latitude}
                      longitude={userProfile.longitude}
                      editing={isEditing}
                      onChange={(addr, lat, lng) =>
                        setUserProfile((p) => ({ ...p, direccion: addr, latitude: lat, longitude: lng }))
                      }
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Ciudad</Label>
                    <Input value={userProfile.ciudad} onChange={(e) => handleProfileChange("ciudad", e.target.value)}
                      disabled={!isEditing} placeholder="Bogotá..." className={fieldCls(isEditing)} />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Nacionalidad</Label>
                    <Input value={userProfile.nacionalidad} onChange={(e) => handleProfileChange("nacionalidad", e.target.value)}
                      disabled={!isEditing} placeholder="Colombiana..." className={fieldCls(isEditing)} />
                  </div>
                  <div className="space-y-1.5 col-span-2">
                    <Label className="text-xs text-muted-foreground">Género</Label>
                    {isEditing ? (
                      <select value={userProfile.genero} onChange={(e) => handleProfileChange("genero", e.target.value)}
                        className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring">
                        <option value="">Sin especificar</option>
                        <option value="M">Masculino</option>
                        <option value="F">Femenino</option>
                        <option value="Otro">Otro</option>
                      </select>
                    ) : (
                      <div className={cn("h-9 px-3 flex items-center rounded-md text-sm bg-muted/60 border border-transparent", !userProfile.genero && "text-muted-foreground")}>
                        {userProfile.genero === "M" ? "Masculino" : userProfile.genero === "F" ? "Femenino" : userProfile.genero || "—"}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* ── Tab: Familia ── */}
            {activeTab === "familia" && (
              <div className="overflow-y-auto flex-1 px-5 py-4 space-y-6">
                {/* Parent details */}
                <div>
                  <SectionHeader
                    label="Datos del padre / tutor"
                    editing={editingParentDetails}
                    onEdit={() => setEditingParentDetails(true)}
                    onCancel={() => setEditingParentDetails(false)}
                    onSave={saveParentDetails}
                  />
                  {loadingParentDetails ? (
                    <p className="text-sm text-muted-foreground text-center py-4">Cargando...</p>
                  ) : (
                    <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                      <div className="space-y-1.5">
                        <Label className="text-xs text-muted-foreground">Ocupación</Label>
                        <Input value={parentDetails.occupation} onChange={(e) => setParentDetails(p => ({ ...p, occupation: e.target.value }))}
                          disabled={!editingParentDetails} placeholder="Docente, Ingeniero..." className={fieldCls(editingParentDetails)} />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs text-muted-foreground">Empresa / Empleador</Label>
                        <Input value={parentDetails.employer} onChange={(e) => setParentDetails(p => ({ ...p, employer: e.target.value }))}
                          disabled={!editingParentDetails} className={fieldCls(editingParentDetails)} />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs text-muted-foreground">Teléfono trabajo</Label>
                        <Input value={parentDetails.work_phone} onChange={(e) => setParentDetails(p => ({ ...p, work_phone: e.target.value }))}
                          disabled={!editingParentDetails} className={fieldCls(editingParentDetails)} />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs text-muted-foreground">Nivel educativo</Label>
                        {editingParentDetails ? (
                          <select value={parentDetails.education_level} onChange={(e) => setParentDetails(p => ({ ...p, education_level: e.target.value }))}
                            className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring">
                            <option value="">Sin especificar</option>
                            <option value="primaria">Primaria</option>
                            <option value="secundaria">Secundaria</option>
                            <option value="tecnico">Técnico</option>
                            <option value="tecnologo">Tecnólogo</option>
                            <option value="universitario">Universitario</option>
                            <option value="posgrado">Posgrado</option>
                          </select>
                        ) : (
                          <div className={cn("h-9 px-3 flex items-center rounded-md text-sm bg-muted/60 border border-transparent", !parentDetails.education_level && "text-muted-foreground")}>
                            {parentDetails.education_level || "—"}
                          </div>
                        )}
                      </div>
                      <div className="space-y-1.5 col-span-2">
                        <Label className="text-xs text-muted-foreground">Parentesco con el estudiante</Label>
                        <Input value={parentDetails.relationship_to_student} onChange={(e) => setParentDetails(p => ({ ...p, relationship_to_student: e.target.value }))}
                          disabled={!editingParentDetails} placeholder="Padre, Madre, Abuelo..." className={fieldCls(editingParentDetails)} />
                      </div>
                    </div>
                  )}
                </div>

                {/* Linked students */}
                <div>
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-3">
                    Estudiantes vinculados{familyStudents.length > 0 && ` (${familyStudents.length})`}
                  </p>
                  {loadingFamily ? (
                    <p className="text-sm text-muted-foreground text-center py-4">Cargando...</p>
                  ) : familyStudents.length === 0 ? (
                    <div className="flex flex-col items-center gap-2 text-muted-foreground py-4">
                      <Users className="w-7 h-7 opacity-25" />
                      <p className="text-sm">No hay estudiantes vinculados</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {familyStudents.map((s) => (
                        <div key={s.id} className="flex items-center gap-3 p-3 rounded-lg border bg-muted/30">
                          <Avatar className="w-9 h-9">
                            <AvatarImage src={s.avatar_url || "/placeholder.svg"} />
                            <AvatarFallback className="text-xs bg-[#25305D]/10 text-[#25305D] font-semibold">{s.full_name?.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium">{s.full_name}</p>
                            {s.email && <p className="text-xs text-muted-foreground">{s.email}</p>}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ── Tab: Docente ── */}
            {activeTab === "docente" && (
              <div className="overflow-y-auto flex-1 px-5 py-4">
                <SectionHeader
                  label="Información docente"
                  editing={editingTeacherDetails}
                  onEdit={() => setEditingTeacherDetails(true)}
                  onCancel={() => setEditingTeacherDetails(false)}
                  onSave={saveTeacherDetails}
                />
                {loadingTeacherDetails ? (
                  <p className="text-sm text-muted-foreground text-center py-8">Cargando...</p>
                ) : (
                  <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground">Título profesional</Label>
                      <Input value={teacherDetails.professional_title} onChange={(e) => setTeacherDetails(t => ({ ...t, professional_title: e.target.value }))}
                        disabled={!editingTeacherDetails} placeholder="Lic. en Matemáticas..." className={fieldCls(editingTeacherDetails)} />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground">Especialización</Label>
                      <Input value={teacherDetails.specialization} onChange={(e) => setTeacherDetails(t => ({ ...t, specialization: e.target.value }))}
                        disabled={!editingTeacherDetails} className={fieldCls(editingTeacherDetails)} />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground">Fecha de vinculación</Label>
                      <Input type={editingTeacherDetails ? "date" : "text"} value={teacherDetails.hire_date}
                        onChange={(e) => setTeacherDetails(t => ({ ...t, hire_date: e.target.value }))}
                        disabled={!editingTeacherDetails} className={fieldCls(editingTeacherDetails)} />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground">Tipo de contrato</Label>
                      {editingTeacherDetails ? (
                        <select value={teacherDetails.contract_type} onChange={(e) => setTeacherDetails(t => ({ ...t, contract_type: e.target.value }))}
                          className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring">
                          <option value="">Sin especificar</option>
                          <option value="planta">Planta</option>
                          <option value="provisional">Provisional</option>
                          <option value="hora-catedra">Hora cátedra</option>
                          <option value="contrato">Contrato</option>
                        </select>
                      ) : (
                        <div className={cn("h-9 px-3 flex items-center rounded-md text-sm bg-muted/60 border border-transparent", !teacherDetails.contract_type && "text-muted-foreground")}>
                          {teacherDetails.contract_type || "—"}
                        </div>
                      )}
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground">N.° de resolución</Label>
                      <Input value={teacherDetails.resolution_number} onChange={(e) => setTeacherDetails(t => ({ ...t, resolution_number: e.target.value }))}
                        disabled={!editingTeacherDetails} className={fieldCls(editingTeacherDetails)} />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground">Licencia docente</Label>
                      <Input value={teacherDetails.teaching_license} onChange={(e) => setTeacherDetails(t => ({ ...t, teaching_license: e.target.value }))}
                        disabled={!editingTeacherDetails} className={fieldCls(editingTeacherDetails)} />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ── Tab: Estudiantil ── */}
            {activeTab === "estudiantil" && (
              <div className="overflow-y-auto flex-1 px-5 py-4">
                <SectionHeader
                  label="Información estudiantil"
                  editing={editingStudentDetails}
                  onEdit={() => setEditingStudentDetails(true)}
                  onCancel={() => setEditingStudentDetails(false)}
                  onSave={saveStudentDetails}
                />
                {loadingStudentDetails ? (
                  <p className="text-sm text-muted-foreground text-center py-8">Cargando...</p>
                ) : (
                  <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground">Tipo de sangre</Label>
                      <Input value={studentDetails.blood_type} onChange={(e) => setStudentDetails(s => ({ ...s, blood_type: e.target.value }))}
                        disabled={!editingStudentDetails} placeholder="A+, O-, AB+..." className={fieldCls(editingStudentDetails)} />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground">EPS</Label>
                      <Input value={studentDetails.eps} onChange={(e) => setStudentDetails(s => ({ ...s, eps: e.target.value }))}
                        disabled={!editingStudentDetails} className={fieldCls(editingStudentDetails)} />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground">Estrato socioeconómico</Label>
                      {editingStudentDetails ? (
                        <select value={studentDetails.socioeconomic_stratum} onChange={(e) => setStudentDetails(s => ({ ...s, socioeconomic_stratum: e.target.value }))}
                          className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring">
                          <option value="">Sin especificar</option>
                          {[1,2,3,4,5,6].map(n => <option key={n} value={n}>{n}</option>)}
                        </select>
                      ) : (
                        <div className={cn("h-9 px-3 flex items-center rounded-md text-sm bg-muted/60 border border-transparent", !studentDetails.socioeconomic_stratum && "text-muted-foreground")}>
                          {studentDetails.socioeconomic_stratum || "—"}
                        </div>
                      )}
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground">Ciudad de nacimiento</Label>
                      <Input value={studentDetails.birth_city} onChange={(e) => setStudentDetails(s => ({ ...s, birth_city: e.target.value }))}
                        disabled={!editingStudentDetails} className={fieldCls(editingStudentDetails)} />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground">Etnia</Label>
                      <Input value={studentDetails.ethnicity} onChange={(e) => setStudentDetails(s => ({ ...s, ethnicity: e.target.value }))}
                        disabled={!editingStudentDetails} className={fieldCls(editingStudentDetails)} />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground">Tipo de discapacidad</Label>
                      <Input value={studentDetails.disability_type} onChange={(e) => setStudentDetails(s => ({ ...s, disability_type: e.target.value }))}
                        disabled={!editingStudentDetails} placeholder="Ninguna..." className={fieldCls(editingStudentDetails)} />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground">Vive con</Label>
                      <Input value={studentDetails.lives_with} onChange={(e) => setStudentDetails(s => ({ ...s, lives_with: e.target.value }))}
                        disabled={!editingStudentDetails} placeholder="Padres, Madre, Abuelos..." className={fieldCls(editingStudentDetails)} />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground">N.° de hermanos</Label>
                      <Input type={editingStudentDetails ? "number" : "text"} value={studentDetails.siblings_count}
                        onChange={(e) => setStudentDetails(s => ({ ...s, siblings_count: e.target.value }))}
                        disabled={!editingStudentDetails} min={0} className={fieldCls(editingStudentDetails)} />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground">Transporte</Label>
                      <Input value={studentDetails.transport_type} onChange={(e) => setStudentDetails(s => ({ ...s, transport_type: e.target.value }))}
                        disabled={!editingStudentDetails} placeholder="Ruta, Particular..." className={fieldCls(editingStudentDetails)} />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground">Año de ingreso</Label>
                      <Input type={editingStudentDetails ? "number" : "text"} value={studentDetails.entry_year}
                        onChange={(e) => setStudentDetails(s => ({ ...s, entry_year: e.target.value }))}
                        disabled={!editingStudentDetails} placeholder="2020..." className={fieldCls(editingStudentDetails)} />
                    </div>
                    <div className="space-y-1.5 col-span-2">
                      <Label className="text-xs text-muted-foreground">Colegio anterior</Label>
                      <Input value={studentDetails.previous_school} onChange={(e) => setStudentDetails(s => ({ ...s, previous_school: e.target.value }))}
                        disabled={!editingStudentDetails} className={fieldCls(editingStudentDetails)} />
                    </div>
                    <div className="col-span-2">
                      <div className={cn("flex items-center justify-between h-9 px-3 rounded-md border", editingStudentDetails ? "border-input bg-background" : "bg-muted/60 border-transparent")}>
                        <Label className="text-xs text-muted-foreground">Almuerza en el colegio</Label>
                        <input type="checkbox" checked={studentDetails.lunch_at_school}
                          onChange={(e) => setStudentDetails(s => ({ ...s, lunch_at_school: e.target.checked }))}
                          disabled={!editingStudentDetails} className="w-4 h-4 accent-[#25305D]" />
                      </div>
                    </div>
                    <div className="col-span-2 pt-2 border-t">
                      <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-3">
                        Contacto de emergencia
                      </p>
                      <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                        <div className="space-y-1.5">
                          <Label className="text-xs text-muted-foreground">Nombre</Label>
                          <Input value={studentDetails.emergency_contact_name}
                            onChange={(e) => setStudentDetails(s => ({ ...s, emergency_contact_name: e.target.value }))}
                            disabled={!editingStudentDetails} className={fieldCls(editingStudentDetails)} />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs text-muted-foreground">Teléfono</Label>
                          <Input value={studentDetails.emergency_contact_phone}
                            onChange={(e) => setStudentDetails(s => ({ ...s, emergency_contact_phone: e.target.value }))}
                            disabled={!editingStudentDetails} className={fieldCls(editingStudentDetails)} />
                        </div>
                        <div className="space-y-1.5 col-span-2">
                          <Label className="text-xs text-muted-foreground">Parentesco</Label>
                          <Input value={studentDetails.emergency_contact_relationship}
                            onChange={(e) => setStudentDetails(s => ({ ...s, emergency_contact_relationship: e.target.value }))}
                            disabled={!editingStudentDetails} placeholder="Madre, Padre, Tío..." className={fieldCls(editingStudentDetails)} />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
