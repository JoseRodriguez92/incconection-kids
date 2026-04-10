"use client";

import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { createClient } from "@/lib/supabase/client";
import {
  usePsychCases,
  usePsychSessions,
  usePsychAlerts,
  usePsychFollowups,
  usePsychParentMeetings,
  usePsychFiles,
  usePsychCaseTypes,
  usePsychRiskLevels,
} from "../../hooks/usePsychology";

const CASE_FORM_DEFAULT = {
  student_enrolled_id: "",
  status: "open",
  summary: "",
  case_type_id: "",
  risk_level_id: "",
  confidentiality_level: "medium",
  opened_at: new Date().toISOString().split("T")[0],
};

const SESSION_FORM_DEFAULT = {
  session_at: new Date().toISOString().split("T")[0],
  reason: "",
  assessment: "",
  intervention: "",
  plan: "",
  observations: "",
  modality: "",
  is_internal: true,
  professional_id: "",
};

const FOLLOWUP_FORM_DEFAULT = {
  action: "",
  status: "pending",
  due_at: "",
  responsible: "",
  completion_notes: "",
};

const MEETING_FORM_DEFAULT = {
  meeting_at: new Date().toISOString().split("T")[0],
  attendees: "",
  notes: "",
  agreements: "",
  url_link: "",
};

export function usePsychologyState() {
  const { toast } = useToast();

  // ── Institute / user ──────────────────────────────────────────────────────
  const [instituteId, setInstituteId] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<{ id: string; name: string } | null>(null);
  const [activePeriodName, setActivePeriodName] = useState<string | null>(null);

  // ── Dialog open states ────────────────────────────────────────────────────
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isCaseDetailsOpen, setIsCaseDetailsOpen] = useState(false);
  const [isSessionDialogOpen, setIsSessionDialogOpen] = useState(false);
  const [isFollowupDialogOpen, setIsFollowupDialogOpen] = useState(false);
  const [isMeetingDialogOpen, setIsMeetingDialogOpen] = useState(false);
  const [isFileDialogOpen, setIsFileDialogOpen] = useState(false);
  const [isPreviewDialogOpen, setIsPreviewDialogOpen] = useState(false);
  const [isTypeDialogOpen, setIsTypeDialogOpen] = useState(false);
  const [isRiskDialogOpen, setIsRiskDialogOpen] = useState(false);

  // ── Selected / editing items ──────────────────────────────────────────────
  const [selectedCase, setSelectedCase] = useState<any>(null);
  const [editingCase, setEditingCase] = useState<any>(null);
  const [editingSession, setEditingSession] = useState<any>(null);
  const [editingFollowup, setEditingFollowup] = useState<any>(null);
  const [editingMeeting, setEditingMeeting] = useState<any>(null);
  const [editingType, setEditingType] = useState<any>(null);
  const [editingRisk, setEditingRisk] = useState<any>(null);
  const [deleteTypeId, setDeleteTypeId] = useState<string | null>(null);
  const [deleteRiskId, setDeleteRiskId] = useState<string | null>(null);

  // ── Form states ───────────────────────────────────────────────────────────
  const [caseForm, setCaseForm] = useState(CASE_FORM_DEFAULT);
  const [sessionForm, setSessionForm] = useState(SESSION_FORM_DEFAULT);
  const [followupForm, setFollowupForm] = useState(FOLLOWUP_FORM_DEFAULT);
  const [meetingForm, setMeetingForm] = useState(MEETING_FORM_DEFAULT);
  const [fileForm, setFileForm] = useState({ title: "", academic_period_has_cycle_id: "" });
  const [typeForm, setTypeForm] = useState({ name: "", description: "" });
  const [riskForm, setRiskForm] = useState({ name: "", description: "", sort_order: 1 });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [previewFile, setPreviewFile] = useState<any>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");

  // ── Form data ─────────────────────────────────────────────────────────────
  const [searchTerm, setSearchTerm] = useState("");
  const [students, setStudents] = useState<any[]>([]);
  const [academicPeriods, setAcademicPeriods] = useState<any[]>([]);
  const [academicCycles, setAcademicCycles] = useState<any[]>([]);
  const [loadingCycles, setLoadingCycles] = useState(false);
  const [currentPeriod, setCurrentPeriod] = useState<{ id: string; name: string } | null>(null);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [loadingPeriods, setLoadingPeriods] = useState(false);

  // ── Supabase hooks ────────────────────────────────────────────────────────
  const { cases, loading: casesLoading, createCase, updateCase, deleteCase } = usePsychCases();
  const { sessions, loading: sessionsLoading, createSession, updateSession, deleteSession } = usePsychSessions();
  const { alerts, loading: alertsLoading } = usePsychAlerts();
  const { followups, loading: followupsLoading, createFollowup, updateFollowup, deleteFollowup } = usePsychFollowups();
  const { meetings, loading: meetingsLoading, createMeeting, updateMeeting, deleteMeeting } = usePsychParentMeetings();
  const { files, loading: filesLoading, createFile, deleteFile } = usePsychFiles();
  const { caseTypes, loading: caseTypesLoading, createCaseType, updateCaseType, deleteCaseType } = usePsychCaseTypes();
  const { riskLevels, loading: riskLevelsLoading, createRiskLevel, updateRiskLevel, deleteRiskLevel } = usePsychRiskLevels();

  const filteredCases = cases.filter(
    (c) =>
      c.student_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.case_type_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.status?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  // ── Effects ───────────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchInstituteId = async () => {
      const supabase = createClient();
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("id, full_name")
            .eq("id", user.id)
            .single();

          if (profile) {
            setCurrentUser({ id: profile.id, name: profile.full_name || "Usuario" });
            const { data: adminEnrolled } = await supabase
              .from("admin_enrolled")
              .select("academic_period_id, academic_period!inner(institute_id)")
              .eq("user_id", user.id)
              .eq("is_active", true)
              .limit(1)
              .single();

            if (adminEnrolled && adminEnrolled.academic_period) {
              setInstituteId((adminEnrolled.academic_period as any).institute_id);
              return;
            }
          }
        }

        const { data: activePeriod } = await supabase
          .from("academic_period")
          .select("name")
          .eq("is_active", true)
          .maybeSingle()
        setActivePeriodName(activePeriod?.name ?? null)

        const { data: institutes } = await supabase.from("institute").select("id").limit(1).single();
        if (institutes) {
          setInstituteId(institutes.id);
        } else {
          toast({ variant: "destructive", title: "Error", description: "No se encontró ningún instituto en la base de datos" });
        }
      } catch {
        toast({ variant: "destructive", title: "Error al obtener el instituto", description: "Revisa la consola para más detalles." });
      }
    };
    fetchInstituteId();
  }, []);

  useEffect(() => {
    if (!isCreateDialogOpen || !instituteId) return;
    const fetchFormData = async () => {
      const supabase = createClient();
      setLoadingStudents(true);
      setLoadingPeriods(true);
      try {
        const { data: studentsData, error: studentsError } = await supabase
          .from("student_enrolled")
          .select(`id, user_id, profiles!student_enrolled_user_id_fkey(full_name), group_has_students!grupo_tiene_estudiante_student_enrolled_id_fkey(groups!grupo_tiene_estudiante_group_id_fkey(name))`)
          .eq("is_active", true);

        if (studentsError) throw studentsError;
        setStudents(
          studentsData?.map((s: any) => ({
            id: s.id,
            name: s.profiles?.full_name || "Sin nombre",
            grade: s.group_has_students?.[0]?.groups?.name || "Sin grado",
          })) || [],
        );
        setLoadingStudents(false);

        const { data: periodsData, error: periodsError } = await supabase
          .from("academic_period")
          .select("id, name, start_date, end_date")
          .eq("institute_id", instituteId)
          .eq("is_active", true)
          .order("start_date", { ascending: false });

        if (periodsError) throw periodsError;
        setAcademicPeriods(periodsData || []);

        const current = periodsData?.[0];
        if (current) {
          setCurrentPeriod({ id: current.id, name: current.name });
          // academic_period_id no existe en psych_case — solo se usa como informativo en el form
        }
        setLoadingPeriods(false);
      } catch (error: any) {
        toast({ variant: "destructive", title: "Error al cargar datos del formulario", description: error.message || "Error desconocido" });
        setLoadingStudents(false);
        setLoadingPeriods(false);
      }
    };
    fetchFormData();
  }, [isCreateDialogOpen, instituteId]);

  // ── Case Type handlers ────────────────────────────────────────────────────
  const handleCreateType = async () => {
    if (!typeForm.name.trim()) {
      toast({ variant: "destructive", title: "Campo requerido", description: "Por favor ingresa un nombre para el tipo de caso" });
      return;
    }
    if (!instituteId) {
      toast({ variant: "destructive", title: "Error", description: "No se ha cargado el instituto. Recarga la página e intenta de nuevo." });
      return;
    }
    try {
      await createCaseType({ name: typeForm.name, description: typeForm.description || null, institute_id: instituteId, is_active: true });
      setTypeForm({ name: "", description: "" });
      setIsTypeDialogOpen(false);
      toast({ title: "Tipo de caso creado", description: `El tipo "${typeForm.name}" se creó exitosamente` });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error al crear tipo de caso", description: error.message || "Error desconocido" });
    }
  };

  const handleEditType = (type: any) => {
    setEditingType(type);
    setTypeForm({ name: type.name, description: type.description || "" });
    setIsTypeDialogOpen(true);
  };

  const handleUpdateType = async () => {
    if (!editingType || !typeForm.name.trim()) {
      toast({ variant: "destructive", title: "Campo requerido", description: "Por favor ingresa un nombre para el tipo de caso" });
      return;
    }
    try {
      await updateCaseType(editingType.id, { name: typeForm.name, description: typeForm.description || null });
      setTypeForm({ name: "", description: "" });
      setEditingType(null);
      setIsTypeDialogOpen(false);
      toast({ title: "Tipo de caso actualizado", description: `El tipo "${typeForm.name}" se actualizó exitosamente` });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error al actualizar tipo de caso", description: error.message || "Error desconocido" });
    }
  };

  const handleDeleteType = async () => {
    if (!deleteTypeId) return;
    try {
      await deleteCaseType(deleteTypeId);
      setDeleteTypeId(null);
      toast({ title: "Tipo de caso eliminado", description: "El tipo se eliminó exitosamente" });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error al eliminar tipo de caso", description: error.message || "Error desconocido" });
    }
  };

  const handleCloseTypeDialog = () => {
    setIsTypeDialogOpen(false);
    setEditingType(null);
    setTypeForm({ name: "", description: "" });
  };

  // ── Risk Level handlers ───────────────────────────────────────────────────
  const handleCreateRisk = async () => {
    if (!riskForm.name.trim()) {
      toast({ variant: "destructive", title: "Campo requerido", description: "Por favor ingresa un nombre para el nivel de riesgo" });
      return;
    }
    if (!instituteId) {
      toast({ variant: "destructive", title: "Error", description: "No se ha cargado el instituto. Recarga la página e intenta de nuevo." });
      return;
    }
    try {
      await createRiskLevel({ name: riskForm.name, description: riskForm.description || null, sort_order: riskForm.sort_order, institute_id: instituteId, is_active: true });
      setRiskForm({ name: "", description: "", sort_order: 1 });
      setIsRiskDialogOpen(false);
      toast({ title: "Nivel de riesgo creado", description: `El nivel "${riskForm.name}" se creó exitosamente` });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error al crear nivel de riesgo", description: error.message || "Error desconocido" });
    }
  };

  const handleEditRisk = (risk: any) => {
    setEditingRisk(risk);
    setRiskForm({ name: risk.name, description: risk.description || "", sort_order: risk.sort_order || 1 });
    setIsRiskDialogOpen(true);
  };

  const handleUpdateRisk = async () => {
    if (!editingRisk || !riskForm.name.trim()) {
      toast({ variant: "destructive", title: "Campo requerido", description: "Por favor ingresa un nombre para el nivel de riesgo" });
      return;
    }
    try {
      await updateRiskLevel(editingRisk.id, { name: riskForm.name, description: riskForm.description || null, sort_order: riskForm.sort_order });
      setRiskForm({ name: "", description: "", sort_order: 1 });
      setEditingRisk(null);
      setIsRiskDialogOpen(false);
      toast({ title: "Nivel de riesgo actualizado", description: `El nivel "${riskForm.name}" se actualizó exitosamente` });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error al actualizar nivel de riesgo", description: error.message || "Error desconocido" });
    }
  };

  const handleDeleteRisk = async () => {
    if (!deleteRiskId) return;
    try {
      await deleteRiskLevel(deleteRiskId);
      setDeleteRiskId(null);
      toast({ title: "Nivel de riesgo eliminado", description: "El nivel se eliminó exitosamente" });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error al eliminar nivel de riesgo", description: error.message || "Error desconocido" });
    }
  };

  const handleCloseRiskDialog = () => {
    setIsRiskDialogOpen(false);
    setEditingRisk(null);
    setRiskForm({ name: "", description: "", sort_order: 1 });
  };

  // ── Case handlers ─────────────────────────────────────────────────────────
  const handleCreateCase = async () => {
    if (!caseForm.student_enrolled_id) {
      toast({ variant: "destructive", title: "Campo requerido", description: "Por favor selecciona un estudiante" });
      return;
    }
    if (!caseForm.case_type_id) {
      toast({ variant: "destructive", title: "Campo requerido", description: "Por favor selecciona un tipo de caso" });
      return;
    }
    if (!caseForm.risk_level_id) {
      toast({ variant: "destructive", title: "Campo requerido", description: "Por favor selecciona un nivel de riesgo" });
      return;
    }
    if (!caseForm.summary.trim()) {
      toast({ variant: "destructive", title: "Campo requerido", description: "Por favor ingresa un resumen del caso" });
      return;
    }

    try {
      if (editingCase) {
        await updateCase(editingCase.id, {
          student_enrolled_id: caseForm.student_enrolled_id,
          case_type_id: caseForm.case_type_id,
          risk_level_id: caseForm.risk_level_id,
          status: caseForm.status,
          summary: caseForm.summary,
          confidentiality_level: caseForm.confidentiality_level,
          opened_at: caseForm.opened_at,
        });
        toast({ title: "Caso actualizado", description: "El caso psicológico se actualizó correctamente" });
      } else {
        await createCase({
          student_enrolled_id: caseForm.student_enrolled_id,
          case_type_id: caseForm.case_type_id,
          risk_level_id: caseForm.risk_level_id,
          status: caseForm.status,
          summary: caseForm.summary,
          confidentiality_level: caseForm.confidentiality_level,
          opened_at: caseForm.opened_at,
        });
        toast({ title: "Caso creado exitosamente", description: "El caso psicológico se ha creado correctamente" });
      }
      setCaseForm(CASE_FORM_DEFAULT);
      setEditingCase(null);
      setIsCreateDialogOpen(false);
    } catch (error: any) {
      toast({ variant: "destructive", title: editingCase ? "Error al actualizar el caso" : "Error al crear el caso", description: error.message || "Error desconocido" });
    }
  };

  const handleCloseCaseDialog = () => {
    setIsCreateDialogOpen(false);
    setEditingCase(null);
    setCaseForm(CASE_FORM_DEFAULT);
  };

  const handleOpenEditCaseDialog = (caseItem: any) => {
    setEditingCase(caseItem);
    setCaseForm({
      student_enrolled_id: caseItem.student_enrolled_id || "",
      status: caseItem.status || "open",
      summary: caseItem.summary || "",
      case_type_id: caseItem.case_type_id || "",
      risk_level_id: caseItem.risk_level_id || "",
      confidentiality_level: caseItem.confidentiality_level || "medium",
      opened_at: caseItem.opened_at?.split("T")[0] || new Date().toISOString().split("T")[0],
    });
    setIsCreateDialogOpen(true);
  };

  const handleDeleteCase = async (caseId: string) => {
    if (!confirm("¿Estás seguro de que deseas eliminar este caso? Esta acción no se puede deshacer.")) return;
    try {
      await deleteCase(caseId);
      toast({ title: "Caso eliminado", description: "El caso psicológico se eliminó correctamente" });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error al eliminar el caso", description: error.message || "Error desconocido" });
    }
  };

  // ── Session handlers ──────────────────────────────────────────────────────
  const handleOpenSessionDialog = (session?: any) => {
    if (session) {
      setEditingSession(session);
      setSessionForm({
        session_at: session.session_at?.split("T")[0] || new Date().toISOString().split("T")[0],
        reason: session.reason || "",
        assessment: session.assessment || "",
        intervention: session.intervention || "",
        plan: session.plan || "",
        observations: session.observations || "",
        modality: session.modality || "",
        is_internal: session.is_internal ?? true,
        professional_id: session.professional_id || "",
      });
    } else {
      setEditingSession(null);
      setSessionForm({ ...SESSION_FORM_DEFAULT, professional_id: currentUser?.id || "" });
    }
    setIsSessionDialogOpen(true);
  };

  const handleSaveSession = async () => {
    try {
      if (editingSession) {
        await updateSession(editingSession.id, sessionForm);
        toast({ title: "Sesión actualizada", description: "La sesión se actualizó correctamente" });
      } else {
        await createSession({ ...sessionForm, psych_case_id: selectedCase.id });
        toast({ title: "Sesión creada", description: "La sesión se creó correctamente" });
      }
      setIsSessionDialogOpen(false);
      setEditingSession(null);
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Ocurrió un error al guardar la sesión", variant: "destructive" });
    }
  };

  const handleDeleteSession = async (sessionId: string) => {
    if (!confirm("¿Estás seguro de que deseas eliminar esta sesión?")) return;
    try {
      await deleteSession(sessionId);
      toast({ title: "Sesión eliminada", description: "La sesión se eliminó correctamente" });
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Ocurrió un error al eliminar la sesión", variant: "destructive" });
    }
  };

  // ── Followup handlers ─────────────────────────────────────────────────────
  const handleOpenFollowupDialog = (followup?: any) => {
    if (followup) {
      setEditingFollowup(followup);
      setFollowupForm({
        action: followup.action || "",
        status: followup.status || "pending",
        due_at: followup.due_at?.split("T")[0] || "",
        responsible: followup.responsible || "",
        completion_notes: followup.completion_notes || "",
      });
    } else {
      setEditingFollowup(null);
      setFollowupForm(FOLLOWUP_FORM_DEFAULT);
    }
    setIsFollowupDialogOpen(true);
  };

  const handleSaveFollowup = async () => {
    if (!followupForm.action.trim()) {
      toast({ title: "Campo requerido", description: "Por favor ingresa la acción de seguimiento", variant: "destructive" });
      return;
    }
    try {
      const formattedDueAt = followupForm.due_at ? `${followupForm.due_at}T12:00:00` : null;
      if (editingFollowup) {
        await updateFollowup(editingFollowup.id, { ...followupForm, due_at: formattedDueAt });
        toast({ title: "Seguimiento actualizado", description: "El seguimiento se actualizó correctamente" });
      } else {
        await createFollowup({ ...followupForm, due_at: formattedDueAt, psych_case_id: selectedCase.id });
        toast({ title: "Seguimiento creado", description: "El seguimiento se creó correctamente" });
      }
      setIsFollowupDialogOpen(false);
      setEditingFollowup(null);
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Ocurrió un error al guardar el seguimiento", variant: "destructive" });
    }
  };

  const handleDeleteFollowup = async (followupId: string) => {
    if (!confirm("¿Estás seguro de que deseas eliminar este seguimiento?")) return;
    try {
      await deleteFollowup(followupId);
      toast({ title: "Seguimiento eliminado", description: "El seguimiento se eliminó correctamente" });
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Ocurrió un error al eliminar el seguimiento", variant: "destructive" });
    }
  };

  // ── Meeting handlers ──────────────────────────────────────────────────────
  const handleOpenMeetingDialog = (meeting?: any) => {
    if (meeting) {
      setEditingMeeting(meeting);
      setMeetingForm({
        meeting_at: meeting.meeting_at?.split("T")[0] || new Date().toISOString().split("T")[0],
        attendees: meeting.attendees || "",
        notes: meeting.notes || "",
        agreements: meeting.agreements || "",
        url_link: meeting.url_link || "",
      });
    } else {
      setEditingMeeting(null);
      setMeetingForm(MEETING_FORM_DEFAULT);
    }
    setIsMeetingDialogOpen(true);
  };

  const handleSaveMeeting = async () => {
    try {
      const formattedMeetingAt = `${meetingForm.meeting_at}T12:00:00`;
      if (editingMeeting) {
        await updateMeeting(editingMeeting.id, { ...meetingForm, meeting_at: formattedMeetingAt });
        toast({ title: "Reunión actualizada", description: "La reunión se actualizó correctamente" });
      } else {
        await createMeeting({ ...meetingForm, psych_case_id: selectedCase.id, meeting_at: formattedMeetingAt });
        toast({ title: "Reunión creada", description: "La reunión se creó correctamente" });
      }
      setIsMeetingDialogOpen(false);
      setEditingMeeting(null);
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Ocurrió un error al guardar la reunión", variant: "destructive" });
    }
  };

  const handleDeleteMeeting = async (meetingId: string) => {
    if (!confirm("¿Estás seguro de que deseas eliminar esta reunión?")) return;
    try {
      await deleteMeeting(meetingId);
      toast({ title: "Reunión eliminada", description: "La reunión se eliminó correctamente" });
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Ocurrió un error al eliminar la reunión", variant: "destructive" });
    }
  };

  // ── File handlers ─────────────────────────────────────────────────────────
  const handleOpenFileDialog = async () => {
    setFileForm({ title: "", academic_period_has_cycle_id: "" });
    setSelectedFile(null);
    setIsFileDialogOpen(true);

    // Cargar ciclos activos del periodo académico activo
    setLoadingCycles(true);
    try {
      const supabase = createClient();

      // Obtener el periodo académico activo primero
      const { data: activePeriod } = await supabase
        .from("academic_period")
        .select("id")
        .eq("is_active", true)
        .maybeSingle();

      if (!activePeriod) {
        setAcademicCycles([]);
        return;
      }

      const { data } = await supabase
        .from("academic_period_has_cycle")
        .select(`
          id,
          is_active,
          academic_period:academic_period_id(name),
          cycle:cycle_id(name)
        `)
        .eq("academic_period_id", activePeriod.id)
        .eq("is_active", true)
        .order("created_at", { ascending: true });

      setAcademicCycles(data || []);
    } catch {
      // no bloquear el flujo
    } finally {
      setLoadingCycles(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) setSelectedFile(e.target.files[0]);
  };

  const handleUploadFile = async () => {
    if (!selectedFile || !selectedCase) {
      toast({ title: "Error", description: "Por favor selecciona un archivo", variant: "destructive" });
      return;
    }
    setUploadingFile(true);
    const supabase = createClient();
    try {
      const fileExt = selectedFile.name.split(".").pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `psychology/${selectedCase.id}/${fileName}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("psychology-files")
        .upload(filePath, selectedFile);

      if (uploadError) throw uploadError;

      await createFile({
        psych_case_id: selectedCase.id,
        title: fileForm.title || selectedFile.name,
        original_name: selectedFile.name,
        storage_path: uploadData.path,
        bucket: "psychology-files",
        mime_type: selectedFile.type,
        file_size: selectedFile.size,
        created_by: currentUser?.id || null,
        academic_period_has_cycle_id: fileForm.academic_period_has_cycle_id || null,
      });

      toast({ title: "Archivo subido", description: "El archivo se subió correctamente" });
      setIsFileDialogOpen(false);
      setSelectedFile(null);
      setFileForm({ title: "" });
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Ocurrió un error al subir el archivo", variant: "destructive" });
    } finally {
      setUploadingFile(false);
    }
  };

  const handleDownloadFile = async (file: any) => {
    const supabase = createClient();
    try {
      const { data, error } = await supabase.storage.from(file.bucket || "psychology-files").download(file.storage_path);
      if (error) throw error;
      const url = window.URL.createObjectURL(data);
      const a = document.createElement("a");
      a.href = url;
      a.download = file.original_name || "archivo";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast({ title: "Descarga iniciada", description: "El archivo se está descargando" });
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Ocurrió un error al descargar el archivo", variant: "destructive" });
    }
  };

  const handleDeleteFile = async (fileId: string, storagePath: string, bucket: string) => {
    if (!confirm("¿Estás seguro de que deseas eliminar este archivo?")) return;
    const supabase = createClient();
    try {
      const { error: storageError } = await supabase.storage.from(bucket || "psychology-files").remove([storagePath]);
      if (storageError) throw storageError;
      await deleteFile(fileId);
      toast({ title: "Archivo eliminado", description: "El archivo se eliminó correctamente" });
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Ocurrió un error al eliminar el archivo", variant: "destructive" });
    }
  };

  const handlePreviewFile = async (file: any) => {
    const supabase = createClient();
    try {
      const { data } = supabase.storage.from(file.bucket || "psychology-files").getPublicUrl(file.storage_path || "");
      if (data?.publicUrl) {
        setPreviewFile(file);
        setPreviewUrl(data.publicUrl);
        setIsPreviewDialogOpen(true);
      } else {
        toast({ title: "Error", description: "No se pudo obtener la URL del archivo", variant: "destructive" });
      }
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Ocurrió un error al cargar la vista previa", variant: "destructive" });
    }
  };

  return {
    // Institute / user
    instituteId,
    currentUser,
    activePeriodName,
    // Dialog open states
    isCreateDialogOpen, setIsCreateDialogOpen,
    isCaseDetailsOpen, setIsCaseDetailsOpen,
    isSessionDialogOpen, setIsSessionDialogOpen,
    isFollowupDialogOpen, setIsFollowupDialogOpen,
    isMeetingDialogOpen, setIsMeetingDialogOpen,
    isFileDialogOpen, setIsFileDialogOpen,
    isPreviewDialogOpen, setIsPreviewDialogOpen,
    isTypeDialogOpen, setIsTypeDialogOpen,
    isRiskDialogOpen, setIsRiskDialogOpen,
    // Selected / editing
    selectedCase, setSelectedCase,
    editingCase,
    editingSession,
    editingFollowup,
    editingMeeting,
    editingType,
    editingRisk,
    deleteTypeId, setDeleteTypeId,
    deleteRiskId, setDeleteRiskId,
    // Forms
    caseForm, setCaseForm,
    sessionForm, setSessionForm,
    followupForm, setFollowupForm,
    meetingForm, setMeetingForm,
    fileForm, setFileForm,
    typeForm, setTypeForm,
    riskForm, setRiskForm,
    selectedFile,
    uploadingFile,
    previewFile,
    previewUrl,
    // Form data
    searchTerm, setSearchTerm,
    students,
    academicPeriods,
    currentPeriod,
    loadingStudents,
    loadingPeriods,
    academicCycles,
    loadingCycles,
    // Data from hooks
    cases, casesLoading,
    sessions, sessionsLoading,
    alerts, alertsLoading,
    followups, followupsLoading,
    meetings, meetingsLoading,
    files, filesLoading,
    caseTypes, caseTypesLoading,
    riskLevels, riskLevelsLoading,
    filteredCases,
    // Handlers
    handleCreateCase,
    handleCloseCaseDialog,
    handleOpenEditCaseDialog,
    handleDeleteCase,
    handleCreateType,
    handleEditType,
    handleUpdateType,
    handleDeleteType,
    handleCloseTypeDialog,
    handleCreateRisk,
    handleEditRisk,
    handleUpdateRisk,
    handleDeleteRisk,
    handleCloseRiskDialog,
    handleOpenSessionDialog,
    handleSaveSession,
    handleDeleteSession,
    handleOpenFollowupDialog,
    handleSaveFollowup,
    handleDeleteFollowup,
    handleOpenMeetingDialog,
    handleSaveMeeting,
    handleDeleteMeeting,
    handleOpenFileDialog,
    handleFileChange,
    handleUploadFile,
    handleDownloadFile,
    handleDeleteFile,
    handlePreviewFile,
  };
}
