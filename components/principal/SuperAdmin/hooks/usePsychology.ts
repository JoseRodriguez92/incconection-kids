"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import type { Database } from "@/src/types/database.types"

const supabase = createClient()

// Tipos de las tablas de psicología
export type PsychCase = Database["public"]["Tables"]["psych_case"]["Row"]
export type PsychCaseInsert = Database["public"]["Tables"]["psych_case"]["Insert"]
export type PsychCaseUpdate = Database["public"]["Tables"]["psych_case"]["Update"]

export type PsychSession = Database["public"]["Tables"]["psych_session"]["Row"]
export type PsychSessionInsert = Database["public"]["Tables"]["psych_session"]["Insert"]
export type PsychSessionUpdate = Database["public"]["Tables"]["psych_session"]["Update"]

export type PsychAlert = Database["public"]["Tables"]["psych_alert"]["Row"]
export type PsychAlertInsert = Database["public"]["Tables"]["psych_alert"]["Insert"]
export type PsychAlertUpdate = Database["public"]["Tables"]["psych_alert"]["Update"]

export type PsychFollowup = Database["public"]["Tables"]["psych_followup"]["Row"]
export type PsychFollowupInsert = Database["public"]["Tables"]["psych_followup"]["Insert"]
export type PsychFollowupUpdate = Database["public"]["Tables"]["psych_followup"]["Update"]

export type PsychParentMeeting = Database["public"]["Tables"]["psych_parent_meeting"]["Row"]
export type PsychParentMeetingInsert = Database["public"]["Tables"]["psych_parent_meeting"]["Insert"]
export type PsychParentMeetingUpdate = Database["public"]["Tables"]["psych_parent_meeting"]["Update"]

export type PsychFile = Database["public"]["Tables"]["psych_file"]["Row"]
export type PsychFileInsert = Database["public"]["Tables"]["psych_file"]["Insert"]
export type PsychFileUpdate = Database["public"]["Tables"]["psych_file"]["Update"]

export type PsychCaseType = Database["public"]["Tables"]["psych_case_type"]["Row"]
export type PsychCaseTypeInsert = Database["public"]["Tables"]["psych_case_type"]["Insert"]
export type PsychCaseTypeUpdate = Database["public"]["Tables"]["psych_case_type"]["Update"]

export type PsychRiskLevel = Database["public"]["Tables"]["psych_risk_level"]["Row"]
export type PsychRiskLevelInsert = Database["public"]["Tables"]["psych_risk_level"]["Insert"]
export type PsychRiskLevelUpdate = Database["public"]["Tables"]["psych_risk_level"]["Update"]

// Tipos extendidos con relaciones
export type PsychCaseWithRelations = PsychCase & {
  student_name?: string
  grade?: string
  case_type_name?: string
  risk_level_name?: string
  conditions?: { id: string; name: string; color: string | null }[]
}

export type PsychSessionWithRelations = PsychSession & {
  student_name?: string
  professional_name?: string
}

export type PsychAlertWithRelations = PsychAlert & {
  student_name?: string
  risk_level_name?: string
}

export type PsychFollowupWithRelations = PsychFollowup & {
  student_name?: string
}

export type PsychParentMeetingWithRelations = PsychParentMeeting & {
  student_name?: string
}

// Hook para Casos Psicológicos
export const usePsychCases = () => {
  const [cases, setCases] = useState<PsychCaseWithRelations[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchCases = async () => {
    setLoading(true)
    setError(null)
    try {
      const { data: activePeriod } = await supabase
        .from("academic_period")
        .select("id")
        .eq("is_active", true)
        .maybeSingle()

      const query = supabase
        .from("psych_case")
        .select(`
          *,
          student_enrolled!inner(
            user_id,
            academic_period_id,
            profiles!student_enrolled_user_id_fkey(
              full_name,
              profile_has_learning_condition(
                learning_condition:learning_condition_id(id, name, color)
              )
            ),
            group_has_students!grupo_tiene_estudiante_student_enrolled_id_fkey(
              groups!grupo_tiene_estudiante_group_id_fkey(name)
            )
          ),
          psych_case_type!psych_case_case_type_id_fkey(name),
          psych_risk_level!psych_case_risk_level_id_fkey(name)
        `)
        .order("created_at", { ascending: false })

      if (activePeriod?.id) {
        query.eq("student_enrolled.academic_period_id", activePeriod.id)
      }

      const { data, error } = await query

      if (error) throw error

      const formattedCases = data?.map((item: any) => ({
        ...item,
        student_name: item.student_enrolled?.profiles?.full_name || "N/A",
        grade: item.student_enrolled?.group_has_students?.[0]?.groups?.name || "N/A",
        case_type_name: item.psych_case_type?.name || "N/A",
        risk_level_name: item.psych_risk_level?.name || "N/A",
        conditions: (item.student_enrolled?.profiles?.profile_has_learning_condition || [])
          .map((row: any) => row.learning_condition)
          .filter(Boolean),
      }))

      setCases(formattedCases || [])
    } catch (err: any) {
      setError(err.message)
      console.error("Error fetching psych cases:", err)
    } finally {
      setLoading(false)
    }
  }

  const createCase = async (caseData: PsychCaseInsert) => {
    try {
      const { data, error } = await supabase.from("psych_case").insert(caseData).select().single()

      if (error) throw error
      await fetchCases()
      return data
    } catch (err: any) {
      setError(err.message)
      throw err
    }
  }

  const updateCase = async (id: string, caseData: PsychCaseUpdate) => {
    try {
      const { data, error } = await supabase.from("psych_case").update(caseData).eq("id", id).select().single()

      if (error) throw error
      await fetchCases()
      return data
    } catch (err: any) {
      setError(err.message)
      throw err
    }
  }

  const deleteCase = async (id: string) => {
    try {
      const { error } = await supabase.from("psych_case").delete().eq("id", id)

      if (error) throw error
      await fetchCases()
    } catch (err: any) {
      setError(err.message)
      throw err
    }
  }

  useEffect(() => {
    fetchCases()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return { cases, loading, error, fetchCases, createCase, updateCase, deleteCase }
}

// Hook para Sesiones Psicológicas
export const usePsychSessions = () => {
  const [sessions, setSessions] = useState<PsychSessionWithRelations[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchSessions = async () => {
    setLoading(true)
    setError(null)
    try {
      const { data, error } = await supabase
        .from("psych_session")
        .select(`
          *,
          psych_case!psych_session_psych_case_id_fkey(
            student_enrolled!psych_case_student_enrolled_id_fkey(
              profiles!student_enrolled_user_id_fkey(full_name)
            )
          )
        `)
        .order("session_at", { ascending: false })

      if (error) throw error

      // Obtener nombres de profesionales si existen IDs
      const professionalIds = data?.map(s => s.professional_id).filter(Boolean) || []
      let professionalsMap: Record<string, string> = {}

      if (professionalIds.length > 0) {
        const { data: professionals } = await supabase
          .from("profiles")
          .select("id, full_name")
          .in("id", professionalIds)

        professionalsMap = professionals?.reduce((acc, prof) => ({
          ...acc,
          [prof.id]: prof.full_name
        }), {}) || {}
      }

      const formattedSessions = data?.map((item: any) => ({
        ...item,
        student_name: item.psych_case?.student_enrolled?.profiles?.full_name || "N/A",
        professional_name: item.professional_id ? professionalsMap[item.professional_id] || "N/A" : "N/A",
      }))

      setSessions(formattedSessions || [])
    } catch (err: any) {
      setError(err.message)
      console.error("Error fetching psych sessions:", err)
    } finally {
      setLoading(false)
    }
  }

  const createSession = async (sessionData: PsychSessionInsert) => {
    try {
      const { data, error } = await supabase.from("psych_session").insert(sessionData).select().single()

      if (error) throw error
      await fetchSessions()
      return data
    } catch (err: any) {
      setError(err.message)
      throw err
    }
  }

  const updateSession = async (id: string, sessionData: PsychSessionUpdate) => {
    try {
      const { data, error } = await supabase.from("psych_session").update(sessionData).eq("id", id).select().single()

      if (error) throw error
      await fetchSessions()
      return data
    } catch (err: any) {
      setError(err.message)
      throw err
    }
  }

  const deleteSession = async (id: string) => {
    try {
      const { error } = await supabase.from("psych_session").delete().eq("id", id)

      if (error) throw error
      await fetchSessions()
    } catch (err: any) {
      setError(err.message)
      throw err
    }
  }

  useEffect(() => {
    fetchSessions()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return { sessions, loading, error, fetchSessions, createSession, updateSession, deleteSession }
}

// Hook para Alertas
export const usePsychAlerts = () => {
  const [alerts, setAlerts] = useState<PsychAlertWithRelations[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchAlerts = async () => {
    setLoading(true)
    setError(null)
    try {
      const { data, error } = await supabase
        .from("psych_alert")
        .select(`
          *,
          psych_case!psych_alert_psych_case_id_fkey(
            student_enrolled!psych_case_student_enrolled_id_fkey(
              profiles!student_enrolled_user_id_fkey(full_name)
            )
          ),
          psych_risk_level!psych_alert_risk_level_id_fkey(name)
        `)
        .order("created_at", { ascending: false })

      if (error) throw error

      const formattedAlerts = data?.map((item: any) => ({
        ...item,
        student_name: item.psych_case?.student_enrolled?.profiles?.full_name || "N/A",
        risk_level_name: item.psych_risk_level?.name || "N/A",
      }))

      setAlerts(formattedAlerts || [])
    } catch (err: any) {
      setError(err.message)
      console.error("Error fetching psych alerts:", err)
    } finally {
      setLoading(false)
    }
  }

  const createAlert = async (alertData: PsychAlertInsert) => {
    try {
      const { data, error } = await supabase.from("psych_alert").insert(alertData).select().single()

      if (error) throw error
      await fetchAlerts()
      return data
    } catch (err: any) {
      setError(err.message)
      throw err
    }
  }

  const updateAlert = async (id: string, alertData: PsychAlertUpdate) => {
    try {
      const { data, error } = await supabase.from("psych_alert").update(alertData).eq("id", id).select().single()

      if (error) throw error
      await fetchAlerts()
      return data
    } catch (err: any) {
      setError(err.message)
      throw err
    }
  }

  const deleteAlert = async (id: string) => {
    try {
      const { error } = await supabase.from("psych_alert").delete().eq("id", id)

      if (error) throw error
      await fetchAlerts()
    } catch (err: any) {
      setError(err.message)
      throw err
    }
  }

  useEffect(() => {
    fetchAlerts()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return { alerts, loading, error, fetchAlerts, createAlert, updateAlert, deleteAlert }
}

// Hook para Seguimientos
export const usePsychFollowups = () => {
  const [followups, setFollowups] = useState<PsychFollowupWithRelations[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchFollowups = async () => {
    setLoading(true)
    setError(null)
    try {
      const { data, error } = await supabase
        .from("psych_followup")
        .select(`
          *,
          psych_case!psych_followup_psych_case_id_fkey(
            student_enrolled!psych_case_student_enrolled_id_fkey(
              profiles!student_enrolled_user_id_fkey(full_name)
            )
          )
        `)
        .order("created_at", { ascending: false })

      if (error) throw error

      const formattedFollowups = data?.map((item: any) => ({
        ...item,
        student_name: item.psych_case?.student_enrolled?.profiles?.full_name || "N/A",
      }))

      setFollowups(formattedFollowups || [])
    } catch (err: any) {
      setError(err.message)
      console.error("Error fetching psych followups:", err)
    } finally {
      setLoading(false)
    }
  }

  const createFollowup = async (followupData: PsychFollowupInsert) => {
    try {
      const { data, error } = await supabase.from("psych_followup").insert(followupData).select().single()

      if (error) throw error
      await fetchFollowups()
      return data
    } catch (err: any) {
      setError(err.message)
      throw err
    }
  }

  const updateFollowup = async (id: string, followupData: PsychFollowupUpdate) => {
    try {
      const { data, error } = await supabase.from("psych_followup").update(followupData).eq("id", id).select().single()

      if (error) throw error
      await fetchFollowups()
      return data
    } catch (err: any) {
      setError(err.message)
      throw err
    }
  }

  const deleteFollowup = async (id: string) => {
    try {
      const { error } = await supabase.from("psych_followup").delete().eq("id", id)

      if (error) throw error
      await fetchFollowups()
    } catch (err: any) {
      setError(err.message)
      throw err
    }
  }

  useEffect(() => {
    fetchFollowups()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return { followups, loading, error, fetchFollowups, createFollowup, updateFollowup, deleteFollowup }
}

// Hook para Reuniones con Padres
export const usePsychParentMeetings = () => {
  const [meetings, setMeetings] = useState<PsychParentMeetingWithRelations[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchMeetings = async () => {
    setLoading(true)
    setError(null)
    try {
      const { data, error } = await supabase
        .from("psych_parent_meeting")
        .select(`
          *,
          psych_case!psych_parent_meeting_psych_case_id_fkey(
            student_enrolled!psych_case_student_enrolled_id_fkey(
              profiles!student_enrolled_user_id_fkey(full_name)
            )
          )
        `)
        .order("meeting_at", { ascending: false })

      if (error) throw error

      const formattedMeetings = data?.map((item: any) => ({
        ...item,
        student_name: item.psych_case?.student_enrolled?.profiles?.full_name || "N/A",
      }))

      setMeetings(formattedMeetings || [])
    } catch (err: any) {
      setError(err.message)
      console.error("Error fetching psych meetings:", err)
    } finally {
      setLoading(false)
    }
  }

  const createMeeting = async (meetingData: PsychParentMeetingInsert) => {
    try {
      const { data, error } = await supabase.from("psych_parent_meeting").insert(meetingData).select().single()

      if (error) throw error
      await fetchMeetings()
      return data
    } catch (err: any) {
      setError(err.message)
      throw err
    }
  }

  const updateMeeting = async (id: string, meetingData: PsychParentMeetingUpdate) => {
    try {
      const { data, error } = await supabase
        .from("psych_parent_meeting")
        .update(meetingData)
        .eq("id", id)
        .select()
        .single()

      if (error) throw error
      await fetchMeetings()
      return data
    } catch (err: any) {
      setError(err.message)
      throw err
    }
  }

  const deleteMeeting = async (id: string) => {
    try {
      const { error } = await supabase.from("psych_parent_meeting").delete().eq("id", id)

      if (error) throw error
      await fetchMeetings()
    } catch (err: any) {
      setError(err.message)
      throw err
    }
  }

  useEffect(() => {
    fetchMeetings()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return { meetings, loading, error, fetchMeetings, createMeeting, updateMeeting, deleteMeeting }
}

// Tipo extendido para archivos con relaciones
export type PsychFileWithRelations = PsychFile & {
  student_name?: string
  period_name?: string
  cycle_name?: string
  period_cycle_label?: string
}

// Hook para Archivos
export const usePsychFiles = () => {
  const [files, setFiles] = useState<PsychFileWithRelations[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchFiles = async () => {
    setLoading(true)
    setError(null)
    try {
      const { data, error } = await supabase
        .from("psych_file")
        .select(`
          *,
          psych_case!psych_file_psych_case_id_fkey(
            student_enrolled!psych_case_student_enrolled_id_fkey(
              profiles!student_enrolled_user_id_fkey(full_name)
            )
          ),
          academic_period_has_cycle!psych_file_academic_period_has_cycle_id_fkey(
            id,
            academic_period:academic_period_id(name),
            cycle:cycle_id(name)
          )
        `)
        .order("created_at", { ascending: false })

      if (error) throw error

      const formattedFiles = data?.map((item: any) => {
        const periodName = item.academic_period_has_cycle?.academic_period?.name || null
        const cycleName = item.academic_period_has_cycle?.cycle?.name || null
        return {
          ...item,
          student_name: item.psych_case?.student_enrolled?.profiles?.full_name || "N/A",
          period_name: periodName,
          cycle_name: cycleName,
          period_cycle_label: periodName && cycleName ? `${periodName} · ${cycleName}` : periodName || cycleName || null,
        }
      })

      setFiles(formattedFiles || [])
    } catch (err: any) {
      setError(err.message)
      console.error("Error fetching psych files:", err)
    } finally {
      setLoading(false)
    }
  }

  const createFile = async (fileData: PsychFileInsert) => {
    try {
      const { data, error } = await supabase.from("psych_file").insert(fileData).select().single()

      if (error) throw error
      await fetchFiles()
      return data
    } catch (err: any) {
      setError(err.message)
      throw err
    }
  }

  const deleteFile = async (id: string) => {
    try {
      const { error } = await supabase.from("psych_file").delete().eq("id", id)

      if (error) throw error
      await fetchFiles()
    } catch (err: any) {
      setError(err.message)
      throw err
    }
  }

  useEffect(() => {
    fetchFiles()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return { files, loading, error, fetchFiles, createFile, deleteFile }
}

// Hook para Tipos de Caso
export const usePsychCaseTypes = () => {
  const [caseTypes, setCaseTypes] = useState<PsychCaseType[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchCaseTypes = async () => {
    setLoading(true)
    setError(null)
    try {
      const { data, error } = await supabase
        .from("psych_case_type")
        .select("*")
        .eq("is_active", true)
        .order("name", { ascending: true })

      if (error) throw error
      setCaseTypes(data || [])
    } catch (err: any) {
      setError(err.message)
      console.error("Error fetching psych case types:", err)
    } finally {
      setLoading(false)
    }
  }

  const createCaseType = async (caseTypeData: PsychCaseTypeInsert) => {
    try {
      const { data, error } = await supabase.from("psych_case_type").insert(caseTypeData).select().single()

      if (error) throw error
      await fetchCaseTypes()
      return data
    } catch (err: any) {
      setError(err.message)
      throw err
    }
  }

  const updateCaseType = async (id: string, caseTypeData: PsychCaseTypeUpdate) => {
    try {
      const { data, error } = await supabase.from("psych_case_type").update(caseTypeData).eq("id", id).select().single()

      if (error) throw error
      await fetchCaseTypes()
      return data
    } catch (err: any) {
      setError(err.message)
      throw err
    }
  }

  const deleteCaseType = async (id: string) => {
    try {
      const { error } = await supabase.from("psych_case_type").delete().eq("id", id)

      if (error) throw error
      await fetchCaseTypes()
    } catch (err: any) {
      setError(err.message)
      throw err
    }
  }

  useEffect(() => {
    fetchCaseTypes()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return { caseTypes, loading, error, fetchCaseTypes, createCaseType, updateCaseType, deleteCaseType }
}

// Hook para Niveles de Riesgo
export const usePsychRiskLevels = () => {
  const [riskLevels, setRiskLevels] = useState<PsychRiskLevel[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchRiskLevels = async () => {
    setLoading(true)
    setError(null)
    try {
      const { data, error } = await supabase
        .from("psych_risk_level")
        .select("*")
        .eq("is_active", true)
        .order("sort_order", { ascending: true })

      if (error) throw error
      setRiskLevels(data || [])
    } catch (err: any) {
      setError(err.message)
      console.error("Error fetching psych risk levels:", err)
    } finally {
      setLoading(false)
    }
  }

  const createRiskLevel = async (riskLevelData: PsychRiskLevelInsert) => {
    try {
      const { data, error } = await supabase.from("psych_risk_level").insert(riskLevelData).select().single()

      if (error) throw error
      await fetchRiskLevels()
      return data
    } catch (err: any) {
      setError(err.message)
      throw err
    }
  }

  const updateRiskLevel = async (id: string, riskLevelData: PsychRiskLevelUpdate) => {
    try {
      const { data, error } = await supabase.from("psych_risk_level").update(riskLevelData).eq("id", id).select().single()

      if (error) throw error
      await fetchRiskLevels()
      return data
    } catch (err: any) {
      setError(err.message)
      throw err
    }
  }

  const deleteRiskLevel = async (id: string) => {
    try {
      const { error } = await supabase.from("psych_risk_level").delete().eq("id", id)

      if (error) throw error
      await fetchRiskLevels()
    } catch (err: any) {
      setError(err.message)
      throw err
    }
  }

  useEffect(() => {
    fetchRiskLevels()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return { riskLevels, loading, error, fetchRiskLevels, createRiskLevel, updateRiskLevel, deleteRiskLevel }
}
