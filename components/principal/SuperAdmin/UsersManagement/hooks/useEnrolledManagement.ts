import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { EstudenteEnrrolledStore } from "@/Stores/studentEnrolledStore";
import { TeacherEnrrolledStore } from "@/Stores/teacherEnrolledStore";
import { AdminEnrrolledStore, type Enrolled } from "@/Stores/adminEnrolledStore";
import { ParentEnrolledStore } from "@/Stores/parentEnrolledStore";
import { ParentHasStudentStore } from "@/Stores/ParentHasStudentStore";
import { ProfilesStore } from "@/Stores/profilesStore";
import { PeriodAcademicStore } from "@/Stores/periodAcademicStore";
import type { SubTabType } from "../utils/constants";

export const useEnrolledManagement = (activeSubTab: SubTabType) => {
  const supabase = createClient();
  const [academicPeriods, setAcademicPeriods] = useState<any[]>([]);
  const [isCreating, setIsCreating] = useState(false);

  // Zustand stores
  const studentEnrolled = EstudenteEnrrolledStore((state) => state.enrolled);
  const studentLoading = EstudenteEnrrolledStore((state) => state.loading);
  const fetchStudentEnrolled = EstudenteEnrrolledStore(
    (state) => state.fetchEnrolled
  );

  const teacherEnrolled = TeacherEnrrolledStore((state) => state.enrolled);
  const teacherLoading = TeacherEnrrolledStore((state) => state.loading);
  const fetchTeacherEnrolled = TeacherEnrrolledStore(
    (state) => state.fetchEnrolled
  );

  const adminEnrolled = AdminEnrrolledStore((state) => state.enrolled);
  const adminLoading = AdminEnrrolledStore((state) => state.loading);
  const fetchAdminEnrolled = AdminEnrrolledStore(
    (state) => state.fetchEnrolled
  );

  const parentEnrolled = ParentEnrolledStore((state) => state.enrolled);
  const parentLoading = ParentEnrolledStore((state) => state.loading);
  const fetchParentEnrolled = ParentEnrolledStore(
    (state) => state.fetchEnrolled
  );

  const parentStudentRelations = ParentHasStudentStore(
    (state) => state.relations
  );
  const parentStudentLoading = ParentHasStudentStore((state) => state.loading);
  const fetchParentStudentRelations = ParentHasStudentStore(
    (state) => state.fetchRelations
  );

  const profiles = ProfilesStore((state) => state.profiles);
  const fetchProfiles = ProfilesStore((state) => state.fetchProfiles);

  const periodos = PeriodAcademicStore((state) => state.periodos);
  const fetchPeriodos = PeriodAcademicStore((state) => state.fetchPeriodos);

  /**
   * Obtener periodos académicos
   */
  const getAcademicPeriods = async () => {
    try {
      const { data, error } = await supabase
        .from("academic_period")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error al obtener periodos académicos:", error);
        toast.error("Error al obtener periodos académicos");
        return;
      }

      setAcademicPeriods(data || []);
    } catch (err) {
      console.error("Error inesperado:", err);
      toast.error("Error inesperado al obtener periodos académicos");
    }
  };

  /**
   * Crear nuevo registro enrolled
   */
  const createEnrolled = async (
    userId: string,
    academicPeriodId: string,
    subTab: SubTabType
  ) => {
    if (!userId || !academicPeriodId) {
      toast.error("Por favor selecciona un usuario y un periodo académico");
      return false;
    }

    setIsCreating(true);

    try {
      const newEnrolled = {
        id: crypto.randomUUID(),
        user_id: userId,
        academic_period_id: academicPeriodId,
        enrolled_at: new Date().toISOString(),
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      if (subTab === "estudiantes") {
        await EstudenteEnrrolledStore.getState().addEnrolled(newEnrolled);
      } else if (subTab === "profesores") {
        await TeacherEnrrolledStore.getState().addEnrolled(newEnrolled);
      } else if (subTab === "administracion") {
        await AdminEnrrolledStore.getState().addEnrolled(newEnrolled);
      } else if (subTab === "padres") {
        await ParentEnrolledStore.getState().addEnrolled(newEnrolled);
      }

      toast.success("Usuario vinculado correctamente");
      return true;
    } catch (error) {
      console.error("Error al crear enrolled:", error);
      toast.error("Error al vincular usuario");
      return false;
    } finally {
      setIsCreating(false);
    }
  };

  /**
   * Crear relación padre-estudiante
   */
  const createParentStudentRelation = async (
    parentId: string,
    studentId: string
  ) => {
    if (!parentId || !studentId) {
      toast.error("Por favor selecciona un padre y un estudiante");
      return false;
    }

    setIsCreating(true);

    try {
      const newRelation = {
        id: crypto.randomUUID(),
        parent_id: parentId,
        student_id: studentId,
        updated_at: new Date().toISOString(),
      };

      await ParentHasStudentStore.getState().addRelation(newRelation);
      toast.success("Relación padre-estudiante creada correctamente");
      await fetchParentStudentRelations();
      return true;
    } catch (error) {
      console.error("Error al crear relación:", error);
      toast.error("Error al crear relación padre-estudiante");
      return false;
    } finally {
      setIsCreating(false);
    }
  };

  /**
   * Obtener los enrolled actuales según el subtab
   */
  const getCurrentEnrolled = (): {
    enrolled: Enrolled[];
    loading: boolean;
  } => {
    if (activeSubTab === "estudiantes") {
      return { enrolled: studentEnrolled, loading: studentLoading };
    } else if (activeSubTab === "profesores") {
      return { enrolled: teacherEnrolled, loading: teacherLoading };
    } else if (activeSubTab === "administracion") {
      return { enrolled: adminEnrolled, loading: adminLoading };
    } else if (activeSubTab === "padres") {
      return { enrolled: parentEnrolled, loading: parentLoading };
    }
    return { enrolled: [], loading: false };
  };

  /**
   * Cargar enrolled users cuando cambie el subtab
   */
  useEffect(() => {
    if (profiles.length === 0) {
      fetchProfiles();
    }

    if (periodos.length === 0) {
      fetchPeriodos();
    }

    if (activeSubTab === "estudiantes") {
      fetchStudentEnrolled();
    } else if (activeSubTab === "profesores") {
      fetchTeacherEnrolled();
    } else if (activeSubTab === "administracion") {
      fetchAdminEnrolled();
    } else if (activeSubTab === "padres") {
      fetchParentEnrolled();
    } else if (activeSubTab === "familia") {
      fetchParentStudentRelations();
    }
  }, [activeSubTab]);

  return {
    academicPeriods,
    isCreating,
    profiles,
    periodos,
    parentStudentRelations,
    parentStudentLoading,
    getCurrentEnrolled,
    getAcademicPeriods,
    createEnrolled,
    createParentStudentRelation,
    fetchParentStudentRelations,
  };
};
