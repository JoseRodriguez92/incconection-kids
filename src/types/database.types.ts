export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      academic_period: {
        Row: {
          created_at: string
          description: string | null
          end_date: string
          id: string
          institute_id: string
          is_active: boolean
          name: string
          start_date: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          end_date: string
          id?: string
          institute_id: string
          is_active?: boolean
          name: string
          start_date: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          end_date?: string
          id?: string
          institute_id?: string
          is_active?: boolean
          name?: string
          start_date?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "periodo_academico_institute_id_fkey"
            columns: ["institute_id"]
            isOneToOne: false
            referencedRelation: "institute"
            referencedColumns: ["id"]
          },
        ]
      }
      academic_period_has_cycle: {
        Row: {
          academic_period_id: string
          created_at: string
          cycle_id: string
          end_date: string | null
          id: string
          is_active: boolean
          start_date: string | null
          updated_at: string
        }
        Insert: {
          academic_period_id: string
          created_at?: string
          cycle_id: string
          end_date?: string | null
          id?: string
          is_active?: boolean
          start_date?: string | null
          updated_at?: string
        }
        Update: {
          academic_period_id?: string
          created_at?: string
          cycle_id?: string
          end_date?: string | null
          id?: string
          is_active?: boolean
          start_date?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ap_has_cycle_fk_cycle"
            columns: ["cycle_id"]
            isOneToOne: false
            referencedRelation: "cycles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ap_has_cycle_fk_period"
            columns: ["academic_period_id"]
            isOneToOne: false
            referencedRelation: "academic_period"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_enrolled: {
        Row: {
          academic_period_id: string
          created_at: string
          enrolled_at: string
          id: string
          is_active: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          academic_period_id: string
          created_at?: string
          enrolled_at?: string
          id?: string
          is_active?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          academic_period_id?: string
          created_at?: string
          enrolled_at?: string
          id?: string
          is_active?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "admin_enrolled_academic_period_id_fkey"
            columns: ["academic_period_id"]
            isOneToOne: false
            referencedRelation: "academic_period"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "admin_enrolled_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      announcements: {
        Row: {
          academic_period_id: string | null
          attachments: Json
          created_at: string
          created_by: string
          from_email: string | null
          from_name: string | null
          html: string
          id: string
          institute_id: string
          subject: string
          to_emails: string[]
          updated_at: string
        }
        Insert: {
          academic_period_id?: string | null
          attachments?: Json
          created_at?: string
          created_by: string
          from_email?: string | null
          from_name?: string | null
          html: string
          id?: string
          institute_id: string
          subject: string
          to_emails?: string[]
          updated_at?: string
        }
        Update: {
          academic_period_id?: string | null
          attachments?: Json
          created_at?: string
          created_by?: string
          from_email?: string | null
          from_name?: string | null
          html?: string
          id?: string
          institute_id?: string
          subject?: string
          to_emails?: string[]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "announcements_academic_period_id_fkey"
            columns: ["academic_period_id"]
            isOneToOne: false
            referencedRelation: "academic_period"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "announcements_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "announcements_institute_id_fkey"
            columns: ["institute_id"]
            isOneToOne: false
            referencedRelation: "institute"
            referencedColumns: ["id"]
          },
        ]
      }
      classrooms: {
        Row: {
          capacity: number
          created_at: string
          equipment: string[] | null
          id: string
          institute_id: string
          location: string | null
          name: string
          room_type: string | null
          status: string
          updated_at: string
        }
        Insert: {
          capacity: number
          created_at?: string
          equipment?: string[] | null
          id?: string
          institute_id: string
          location?: string | null
          name: string
          room_type?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          capacity?: number
          created_at?: string
          equipment?: string[] | null
          id?: string
          institute_id?: string
          location?: string | null
          name?: string
          room_type?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "classrooms_institute_id_fkey"
            columns: ["institute_id"]
            isOneToOne: false
            referencedRelation: "institute"
            referencedColumns: ["id"]
          },
        ]
      }
      courses: {
        Row: {
          code: string | null
          created_at: string
          description: string | null
          education_level: string | null
          grade_number: number | null
          id: string
          institute_id: string
          is_active: boolean
          max_students: number
          name: string
          updated_at: string
        }
        Insert: {
          code?: string | null
          created_at?: string
          description?: string | null
          education_level?: string | null
          grade_number?: number | null
          id?: string
          institute_id: string
          is_active?: boolean
          max_students?: number
          name: string
          updated_at?: string
        }
        Update: {
          code?: string | null
          created_at?: string
          description?: string | null
          education_level?: string | null
          grade_number?: number | null
          id?: string
          institute_id?: string
          is_active?: boolean
          max_students?: number
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "courses_institute_id_fkey"
            columns: ["institute_id"]
            isOneToOne: false
            referencedRelation: "institute"
            referencedColumns: ["id"]
          },
        ]
      }
      cycles: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      events: {
        Row: {
          academic_period_id: string | null
          category: string | null
          classroom_id: string | null
          created_at: string
          description: string | null
          end_at: string
          id: string
          image_url: string | null
          institute_id: string
          is_all_day: boolean
          start_at: string
          title: string
          updated_at: string
        }
        Insert: {
          academic_period_id?: string | null
          category?: string | null
          classroom_id?: string | null
          created_at?: string
          description?: string | null
          end_at: string
          id?: string
          image_url?: string | null
          institute_id: string
          is_all_day?: boolean
          start_at: string
          title: string
          updated_at?: string
        }
        Update: {
          academic_period_id?: string | null
          category?: string | null
          classroom_id?: string | null
          created_at?: string
          description?: string | null
          end_at?: string
          id?: string
          image_url?: string | null
          institute_id?: string
          is_all_day?: boolean
          start_at?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "events_academic_period_id_fkey"
            columns: ["academic_period_id"]
            isOneToOne: false
            referencedRelation: "academic_period"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_classroom_id_fkey"
            columns: ["classroom_id"]
            isOneToOne: false
            referencedRelation: "classrooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_institute_id_fkey"
            columns: ["institute_id"]
            isOneToOne: false
            referencedRelation: "institute"
            referencedColumns: ["id"]
          },
        ]
      }
      group_class_has_methodology: {
        Row: {
          created_at: string | null
          group_has_class_id: string
          id: string
          is_active: boolean | null
          notes: string | null
          syllabus_bucket: string | null
          syllabus_file_size: number | null
          syllabus_mime_type: string | null
          syllabus_original_name: string | null
          syllabus_path: string | null
          updated_at: string | null
          welcome_video_bucket: string | null
          welcome_video_file_size: number | null
          welcome_video_mime_type: string | null
          welcome_video_original_name: string | null
          welcome_video_path: string | null
          welcome_video_url: string | null
        }
        Insert: {
          created_at?: string | null
          group_has_class_id: string
          id?: string
          is_active?: boolean | null
          notes?: string | null
          syllabus_bucket?: string | null
          syllabus_file_size?: number | null
          syllabus_mime_type?: string | null
          syllabus_original_name?: string | null
          syllabus_path?: string | null
          updated_at?: string | null
          welcome_video_bucket?: string | null
          welcome_video_file_size?: number | null
          welcome_video_mime_type?: string | null
          welcome_video_original_name?: string | null
          welcome_video_path?: string | null
          welcome_video_url?: string | null
        }
        Update: {
          created_at?: string | null
          group_has_class_id?: string
          id?: string
          is_active?: boolean | null
          notes?: string | null
          syllabus_bucket?: string | null
          syllabus_file_size?: number | null
          syllabus_mime_type?: string | null
          syllabus_original_name?: string | null
          syllabus_path?: string | null
          updated_at?: string | null
          welcome_video_bucket?: string | null
          welcome_video_file_size?: number | null
          welcome_video_mime_type?: string | null
          welcome_video_original_name?: string | null
          welcome_video_path?: string | null
          welcome_video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "group_class_has_methodology_group_has_class_id_fkey"
            columns: ["group_has_class_id"]
            isOneToOne: true
            referencedRelation: "group_has_class"
            referencedColumns: ["id"]
          },
        ]
      }
      group_class_has_session: {
        Row: {
          academic_period_has_cycle_id: string | null
          created_at: string | null
          group_has_class_id: string
          id: string
          notes: string | null
          session_date: string
          status: string
          updated_at: string | null
        }
        Insert: {
          academic_period_has_cycle_id?: string | null
          created_at?: string | null
          group_has_class_id: string
          id?: string
          notes?: string | null
          session_date: string
          status: string
          updated_at?: string | null
        }
        Update: {
          academic_period_has_cycle_id?: string | null
          created_at?: string | null
          group_has_class_id?: string
          id?: string
          notes?: string | null
          session_date?: string
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "class_session_academic_period_has_cycle_id_fkey"
            columns: ["academic_period_has_cycle_id"]
            isOneToOne: false
            referencedRelation: "academic_period_has_cycle"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "class_session_group_has_class_id_fkey"
            columns: ["group_has_class_id"]
            isOneToOne: false
            referencedRelation: "group_has_class"
            referencedColumns: ["id"]
          },
        ]
      }
      group_class_methodology_skill: {
        Row: {
          created_at: string | null
          id: string
          methodology_id: string
          skill_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          methodology_id: string
          skill_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          methodology_id?: string
          skill_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "group_class_methodology_skill_methodology_id_fkey"
            columns: ["methodology_id"]
            isOneToOne: false
            referencedRelation: "group_class_has_methodology"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "group_class_methodology_skill_skill_id_fkey"
            columns: ["skill_id"]
            isOneToOne: false
            referencedRelation: "methodology_skill"
            referencedColumns: ["id"]
          },
        ]
      }
      group_class_schedule: {
        Row: {
          classroom_id: string | null
          created_at: string
          day_of_week: number
          end_time: string
          group_class_id: string
          id: string
          start_time: string
          updated_at: string
        }
        Insert: {
          classroom_id?: string | null
          created_at?: string
          day_of_week: number
          end_time: string
          group_class_id: string
          id?: string
          start_time: string
          updated_at?: string
        }
        Update: {
          classroom_id?: string | null
          created_at?: string
          day_of_week?: number
          end_time?: string
          group_class_id?: string
          id?: string
          start_time?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "group_class_schedule_classroom_id_fkey"
            columns: ["classroom_id"]
            isOneToOne: false
            referencedRelation: "classrooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "group_class_schedule_group_class_id_fkey"
            columns: ["group_class_id"]
            isOneToOne: false
            referencedRelation: "group_has_class"
            referencedColumns: ["id"]
          },
        ]
      }
      group_has_activity: {
        Row: {
          bucket: string | null
          created_at: string | null
          cycle_id: string
          description: string | null
          file_size: number | null
          grade_percentage: number | null
          group_has_class_id: string
          id: string
          is_active: boolean | null
          limit_date: string | null
          mime_type: string | null
          original_name: string | null
          storage_path: string | null
          target_condition_id: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          bucket?: string | null
          created_at?: string | null
          cycle_id: string
          description?: string | null
          file_size?: number | null
          grade_percentage?: number | null
          group_has_class_id: string
          id?: string
          is_active?: boolean | null
          limit_date?: string | null
          mime_type?: string | null
          original_name?: string | null
          storage_path?: string | null
          target_condition_id?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          bucket?: string | null
          created_at?: string | null
          cycle_id?: string
          description?: string | null
          file_size?: number | null
          grade_percentage?: number | null
          group_has_class_id?: string
          id?: string
          is_active?: boolean | null
          limit_date?: string | null
          mime_type?: string | null
          original_name?: string | null
          storage_path?: string | null
          target_condition_id?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "group_has_activity_cycle_id_fkey"
            columns: ["cycle_id"]
            isOneToOne: false
            referencedRelation: "cycles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "group_has_activity_group_has_class_id_fkey"
            columns: ["group_has_class_id"]
            isOneToOne: false
            referencedRelation: "group_has_class"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "group_has_activity_target_condition_id_fkey"
            columns: ["target_condition_id"]
            isOneToOne: false
            referencedRelation: "learning_condition"
            referencedColumns: ["id"]
          },
        ]
      }
      group_has_class: {
        Row: {
          classroom_id: string
          created_at: string
          group_id: string
          id: string
          is_active: boolean
          name: string
          subject_id: string
          teacher_enrolled_id: string
          updated_at: string
        }
        Insert: {
          classroom_id: string
          created_at?: string
          group_id: string
          id?: string
          is_active?: boolean
          name: string
          subject_id: string
          teacher_enrolled_id: string
          updated_at?: string
        }
        Update: {
          classroom_id?: string
          created_at?: string
          group_id?: string
          id?: string
          is_active?: boolean
          name?: string
          subject_id?: string
          teacher_enrolled_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "group_has_class_classroom_id_fkey"
            columns: ["classroom_id"]
            isOneToOne: false
            referencedRelation: "classrooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "group_has_class_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "group_has_class_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "materias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "group_has_class_teacher_enrolled_id_fkey"
            columns: ["teacher_enrolled_id"]
            isOneToOne: false
            referencedRelation: "teacher_enrolled"
            referencedColumns: ["id"]
          },
        ]
      }
      group_has_material: {
        Row: {
          bucket: string
          created_at: string
          cycle_id: string
          description: string | null
          file_size: number | null
          group_has_class_id: string
          id: string
          is_active: boolean
          mime_type: string | null
          original_name: string | null
          storage_path: string
          target_condition_id: string | null
          title: string
          updated_at: string
        }
        Insert: {
          bucket?: string
          created_at?: string
          cycle_id: string
          description?: string | null
          file_size?: number | null
          group_has_class_id: string
          id?: string
          is_active?: boolean
          mime_type?: string | null
          original_name?: string | null
          storage_path: string
          target_condition_id?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          bucket?: string
          created_at?: string
          cycle_id?: string
          description?: string | null
          file_size?: number | null
          group_has_class_id?: string
          id?: string
          is_active?: boolean
          mime_type?: string | null
          original_name?: string | null
          storage_path?: string
          target_condition_id?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "group_has_material_academic_period_id_fkey"
            columns: ["cycle_id"]
            isOneToOne: false
            referencedRelation: "cycles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "group_has_material_target_condition_id_fkey"
            columns: ["target_condition_id"]
            isOneToOne: false
            referencedRelation: "learning_condition"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "grupo_has_material_group_has_class_id_fkey"
            columns: ["group_has_class_id"]
            isOneToOne: false
            referencedRelation: "group_has_class"
            referencedColumns: ["id"]
          },
        ]
      }
      group_has_students: {
        Row: {
          created_at: string
          group_id: string
          id: string
          student_enrolled_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          group_id: string
          id?: string
          student_enrolled_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          group_id?: string
          id?: string
          student_enrolled_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "grupo_tiene_estudiante_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "grupo_tiene_estudiante_student_enrolled_id_fkey"
            columns: ["student_enrolled_id"]
            isOneToOne: false
            referencedRelation: "student_enrolled"
            referencedColumns: ["id"]
          },
        ]
      }
      groups: {
        Row: {
          course_id: string
          created_at: string
          director_id: string | null
          id: string
          max_students: number | null
          name: string
          updated_at: string
          year: string | null
        }
        Insert: {
          course_id: string
          created_at?: string
          director_id?: string | null
          id?: string
          max_students?: number | null
          name: string
          updated_at?: string
          year?: string | null
        }
        Update: {
          course_id?: string
          created_at?: string
          director_id?: string | null
          id?: string
          max_students?: number | null
          name?: string
          updated_at?: string
          year?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_groups_director"
            columns: ["director_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "groups_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "groups_year_fkey"
            columns: ["year"]
            isOneToOne: false
            referencedRelation: "academic_period"
            referencedColumns: ["id"]
          },
        ]
      }
      institute: {
        Row: {
          address: string | null
          city: string | null
          country: string | null
          created_at: string
          dane_code: string | null
          education_level: string | null
          education_mode: string | null
          email: string | null
          id: string
          latitude: string | null
          logo_url: string | null
          longitude: string | null
          mobile_phone: string | null
          name: string
          phone: string | null
          schedule_kind: string | null
          slogan: string | null
          status: string | null
          type_calendar: string | null
          updated_at: string
          website: string | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          dane_code?: string | null
          education_level?: string | null
          education_mode?: string | null
          email?: string | null
          id?: string
          latitude?: string | null
          logo_url?: string | null
          longitude?: string | null
          mobile_phone?: string | null
          name: string
          phone?: string | null
          schedule_kind?: string | null
          slogan?: string | null
          status?: string | null
          type_calendar?: string | null
          updated_at?: string
          website?: string | null
        }
        Update: {
          address?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          dane_code?: string | null
          education_level?: string | null
          education_mode?: string | null
          email?: string | null
          id?: string
          latitude?: string | null
          logo_url?: string | null
          longitude?: string | null
          mobile_phone?: string | null
          name?: string
          phone?: string | null
          schedule_kind?: string | null
          slogan?: string | null
          status?: string | null
          type_calendar?: string | null
          updated_at?: string
          website?: string | null
        }
        Relationships: []
      }
      knowledge_areas: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
        }
        Relationships: []
      }
      learning_condition: {
        Row: {
          color: string | null
          created_at: string
          description: string | null
          id: string
          name: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name: string
        }
        Update: {
          color?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      materias: {
        Row: {
          code: string | null
          created_at: string
          description: string | null
          id: string
          institute_id: string
          is_active: boolean
          name: string
          updated_at: string
        }
        Insert: {
          code?: string | null
          created_at?: string
          description?: string | null
          id?: string
          institute_id: string
          is_active?: boolean
          name: string
          updated_at?: string
        }
        Update: {
          code?: string | null
          created_at?: string
          description?: string | null
          id?: string
          institute_id?: string
          is_active?: boolean
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "materias_code_fkey"
            columns: ["code"]
            isOneToOne: false
            referencedRelation: "knowledge_areas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "materias_institute_id_fkey"
            columns: ["institute_id"]
            isOneToOne: false
            referencedRelation: "institute"
            referencedColumns: ["id"]
          },
        ]
      }
      methodology_skill: {
        Row: {
          category_id: string
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          updated_at: string | null
        }
        Insert: {
          category_id: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          updated_at?: string | null
        }
        Update: {
          category_id?: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "methodology_skill_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "methodology_skill_category"
            referencedColumns: ["id"]
          },
        ]
      }
      methodology_skill_category: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      parent_has_student: {
        Row: {
          id: string
          parent_id: string | null
          student_id: string | null
          updated_at: string
        }
        Insert: {
          id?: string
          parent_id?: string | null
          student_id?: string | null
          updated_at?: string
        }
        Update: {
          id?: string
          parent_id?: string | null
          student_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "parent_has_student_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "parent_has_student_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profile_has_learning_condition: {
        Row: {
          created_at: string
          diagnosed_at: string | null
          id: string
          learning_condition_id: string
          notes: string | null
          profile_id: string
          severity: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          diagnosed_at?: string | null
          id?: string
          learning_condition_id: string
          notes?: string | null
          profile_id: string
          severity?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          diagnosed_at?: string | null
          id?: string
          learning_condition_id?: string
          notes?: string | null
          profile_id?: string
          severity?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "phlc_learning_condition_id_fkey"
            columns: ["learning_condition_id"]
            isOneToOne: false
            referencedRelation: "learning_condition"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "phlc_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          address: string | null
          avatar_url: string | null
          created_at: string | null
          document_number: string | null
          document_type: string | null
          email: string
          first_name: string | null
          full_name: string
          id: string
          last_name: string | null
          latitude: number | null
          longitude: number | null
          phone: string | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          avatar_url?: string | null
          created_at?: string | null
          document_number?: string | null
          document_type?: string | null
          email?: string
          first_name?: string | null
          full_name?: string
          id: string
          last_name?: string | null
          latitude?: number | null
          longitude?: number | null
          phone?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          avatar_url?: string | null
          created_at?: string | null
          document_number?: string | null
          document_type?: string | null
          email?: string
          first_name?: string | null
          full_name?: string
          id?: string
          last_name?: string | null
          latitude?: number | null
          longitude?: number | null
          phone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      profiles_roles: {
        Row: {
          created_at: string | null
          role_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          role_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          role_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_roles_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_roles_user_id_fkey1"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      psych_alert: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          psych_case_id: string
          risk_level_id: string | null
          status: string
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          psych_case_id: string
          risk_level_id?: string | null
          status?: string
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          psych_case_id?: string
          risk_level_id?: string | null
          status?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "psych_alert_psych_case_id_fkey"
            columns: ["psych_case_id"]
            isOneToOne: false
            referencedRelation: "psych_case"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "psych_alert_risk_level_id_fkey"
            columns: ["risk_level_id"]
            isOneToOne: false
            referencedRelation: "psych_risk_level"
            referencedColumns: ["id"]
          },
        ]
      }
      psych_case: {
        Row: {
          case_type_id: string | null
          closed_at: string | null
          confidentiality_level: string | null
          created_at: string | null
          created_by: string | null
          id: string
          is_active: boolean | null
          opened_at: string | null
          risk_level_id: string | null
          status: string
          student_enrolled_id: string
          summary: string | null
          updated_at: string | null
        }
        Insert: {
          case_type_id?: string | null
          closed_at?: string | null
          confidentiality_level?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          opened_at?: string | null
          risk_level_id?: string | null
          status?: string
          student_enrolled_id: string
          summary?: string | null
          updated_at?: string | null
        }
        Update: {
          case_type_id?: string | null
          closed_at?: string | null
          confidentiality_level?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          opened_at?: string | null
          risk_level_id?: string | null
          status?: string
          student_enrolled_id?: string
          summary?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "psych_case_case_type_id_fkey"
            columns: ["case_type_id"]
            isOneToOne: false
            referencedRelation: "psych_case_type"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "psych_case_created_by_fkey2"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "psych_case_risk_level_id_fkey"
            columns: ["risk_level_id"]
            isOneToOne: false
            referencedRelation: "psych_risk_level"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "psych_case_student_enrolled_id_fkey"
            columns: ["student_enrolled_id"]
            isOneToOne: false
            referencedRelation: "student_enrolled"
            referencedColumns: ["id"]
          },
        ]
      }
      psych_case_type: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          institute_id: string
          is_active: boolean | null
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          institute_id: string
          is_active?: boolean | null
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          institute_id?: string
          is_active?: boolean | null
          name?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "psych_case_type_institute_id_fkey"
            columns: ["institute_id"]
            isOneToOne: false
            referencedRelation: "institute"
            referencedColumns: ["id"]
          },
        ]
      }
      psych_file: {
        Row: {
          academic_period_has_cycle_id: string | null
          bucket: string | null
          created_at: string | null
          created_by: string | null
          file_size: number | null
          id: string
          mime_type: string | null
          original_name: string | null
          psych_case_id: string
          storage_path: string | null
          title: string | null
        }
        Insert: {
          academic_period_has_cycle_id?: string | null
          bucket?: string | null
          created_at?: string | null
          created_by?: string | null
          file_size?: number | null
          id?: string
          mime_type?: string | null
          original_name?: string | null
          psych_case_id: string
          storage_path?: string | null
          title?: string | null
        }
        Update: {
          academic_period_has_cycle_id?: string | null
          bucket?: string | null
          created_at?: string | null
          created_by?: string | null
          file_size?: number | null
          id?: string
          mime_type?: string | null
          original_name?: string | null
          psych_case_id?: string
          storage_path?: string | null
          title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "psych_file_academic_period_has_cycle_id_fkey"
            columns: ["academic_period_has_cycle_id"]
            isOneToOne: false
            referencedRelation: "academic_period_has_cycle"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "psych_file_created_by_fkey1"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "psych_file_psych_case_id_fkey"
            columns: ["psych_case_id"]
            isOneToOne: false
            referencedRelation: "psych_case"
            referencedColumns: ["id"]
          },
        ]
      }
      psych_followup: {
        Row: {
          action: string
          completion_notes: string | null
          created_at: string | null
          created_by: string | null
          due_at: string | null
          id: string
          psych_case_id: string
          responsible: string | null
          status: string
          updated_at: string | null
        }
        Insert: {
          action: string
          completion_notes?: string | null
          created_at?: string | null
          created_by?: string | null
          due_at?: string | null
          id?: string
          psych_case_id: string
          responsible?: string | null
          status?: string
          updated_at?: string | null
        }
        Update: {
          action?: string
          completion_notes?: string | null
          created_at?: string | null
          created_by?: string | null
          due_at?: string | null
          id?: string
          psych_case_id?: string
          responsible?: string | null
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "psych_followup_created_by_fkey1"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "psych_followup_psych_case_id_fkey"
            columns: ["psych_case_id"]
            isOneToOne: false
            referencedRelation: "psych_case"
            referencedColumns: ["id"]
          },
        ]
      }
      psych_parent_meeting: {
        Row: {
          agreements: string | null
          attendees: string | null
          created_at: string | null
          created_by: string | null
          id: string
          meeting_at: string
          notes: string | null
          psych_case_id: string
          updated_at: string | null
          url_link: string | null
        }
        Insert: {
          agreements?: string | null
          attendees?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          meeting_at?: string
          notes?: string | null
          psych_case_id: string
          updated_at?: string | null
          url_link?: string | null
        }
        Update: {
          agreements?: string | null
          attendees?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          meeting_at?: string
          notes?: string | null
          psych_case_id?: string
          updated_at?: string | null
          url_link?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "psych_parent_meeting_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "psych_parent_meeting_psych_case_id_fkey"
            columns: ["psych_case_id"]
            isOneToOne: false
            referencedRelation: "psych_case"
            referencedColumns: ["id"]
          },
        ]
      }
      psych_risk_level: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          institute_id: string
          is_active: boolean | null
          name: string
          sort_order: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          institute_id: string
          is_active?: boolean | null
          name: string
          sort_order?: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          institute_id?: string
          is_active?: boolean | null
          name?: string
          sort_order?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "psych_risk_level_institute_id_fkey"
            columns: ["institute_id"]
            isOneToOne: false
            referencedRelation: "institute"
            referencedColumns: ["id"]
          },
        ]
      }
      psych_session: {
        Row: {
          assessment: string | null
          created_at: string | null
          id: string
          intervention: string | null
          is_internal: boolean | null
          modality: string | null
          observations: string | null
          plan: string | null
          professional_id: string | null
          psych_case_id: string
          reason: string | null
          session_at: string
          updated_at: string | null
        }
        Insert: {
          assessment?: string | null
          created_at?: string | null
          id?: string
          intervention?: string | null
          is_internal?: boolean | null
          modality?: string | null
          observations?: string | null
          plan?: string | null
          professional_id?: string | null
          psych_case_id: string
          reason?: string | null
          session_at?: string
          updated_at?: string | null
        }
        Update: {
          assessment?: string | null
          created_at?: string | null
          id?: string
          intervention?: string | null
          is_internal?: boolean | null
          modality?: string | null
          observations?: string | null
          plan?: string | null
          professional_id?: string | null
          psych_case_id?: string
          reason?: string | null
          session_at?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "psych_session_professional_id_fkey1"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "psych_session_psych_case_id_fkey"
            columns: ["psych_case_id"]
            isOneToOne: false
            referencedRelation: "psych_case"
            referencedColumns: ["id"]
          },
        ]
      }
      roles: {
        Row: {
          id: string
          institute_id: string
          name: string | null
          slug: string | null
        }
        Insert: {
          id?: string
          institute_id: string
          name?: string | null
          slug?: string | null
        }
        Update: {
          id?: string
          institute_id?: string
          name?: string | null
          slug?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "roles_institute_id_fkey"
            columns: ["institute_id"]
            isOneToOne: false
            referencedRelation: "institute"
            referencedColumns: ["id"]
          },
        ]
      }
      student_activity_submission: {
        Row: {
          attempt_number: number
          bucket: string
          created_at: string
          description: string | null
          file_size: number | null
          grade: number | null
          graded_at: string | null
          group_has_activity_id: string
          id: string
          mime_type: string | null
          original_name: string | null
          status: string
          storage_path: string
          student_enrolled_id: string
          submitted_at: string
          title: string | null
          updated_at: string
        }
        Insert: {
          attempt_number?: number
          bucket?: string
          created_at?: string
          description?: string | null
          file_size?: number | null
          grade?: number | null
          graded_at?: string | null
          group_has_activity_id: string
          id?: string
          mime_type?: string | null
          original_name?: string | null
          status?: string
          storage_path: string
          student_enrolled_id: string
          submitted_at?: string
          title?: string | null
          updated_at?: string
        }
        Update: {
          attempt_number?: number
          bucket?: string
          created_at?: string
          description?: string | null
          file_size?: number | null
          grade?: number | null
          graded_at?: string | null
          group_has_activity_id?: string
          id?: string
          mime_type?: string | null
          original_name?: string | null
          status?: string
          storage_path?: string
          student_enrolled_id?: string
          submitted_at?: string
          title?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_activity_submission_group_has_activity_id_fkey"
            columns: ["group_has_activity_id"]
            isOneToOne: false
            referencedRelation: "group_has_activity"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_activity_submission_student_enrolled_id_fkey"
            columns: ["student_enrolled_id"]
            isOneToOne: false
            referencedRelation: "group_has_students"
            referencedColumns: ["id"]
          },
        ]
      }
      student_activity_submission_comment: {
        Row: {
          author_type: string | null
          comment: string
          created_at: string | null
          id: string
          parent_comment_id: string | null
          profile_id: string
          submission_id: string
          updated_at: string | null
        }
        Insert: {
          author_type?: string | null
          comment: string
          created_at?: string | null
          id?: string
          parent_comment_id?: string | null
          profile_id: string
          submission_id: string
          updated_at?: string | null
        }
        Update: {
          author_type?: string | null
          comment?: string
          created_at?: string | null
          id?: string
          parent_comment_id?: string | null
          profile_id?: string
          submission_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "student_activity_submission_comment_parent_comment_id_fkey"
            columns: ["parent_comment_id"]
            isOneToOne: false
            referencedRelation: "student_activity_submission_comment"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_activity_submission_comment_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_activity_submission_comment_submission_id_fkey"
            columns: ["submission_id"]
            isOneToOne: false
            referencedRelation: "student_activity_submission"
            referencedColumns: ["id"]
          },
        ]
      }
      student_attendance: {
        Row: {
          class_session_id: string
          created_at: string | null
          id: string
          minutes_late: number | null
          observation: string | null
          status: string
          student_enrolled_id: string
          updated_at: string | null
        }
        Insert: {
          class_session_id: string
          created_at?: string | null
          id?: string
          minutes_late?: number | null
          observation?: string | null
          status?: string
          student_enrolled_id: string
          updated_at?: string | null
        }
        Update: {
          class_session_id?: string
          created_at?: string | null
          id?: string
          minutes_late?: number | null
          observation?: string | null
          status?: string
          student_enrolled_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "student_attendance_class_session_id_fkey"
            columns: ["class_session_id"]
            isOneToOne: false
            referencedRelation: "group_class_has_session"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_attendance_student_enrolled_id_fkey"
            columns: ["student_enrolled_id"]
            isOneToOne: false
            referencedRelation: "group_has_students"
            referencedColumns: ["id"]
          },
        ]
      }
      student_cycle_grade: {
        Row: {
          academic_period_has_cycle_id: string
          created_at: string | null
          grade: number
          group_has_class_id: string
          id: string
          is_active: boolean | null
          observation: string | null
          student_enrolled_id: string
          updated_at: string | null
        }
        Insert: {
          academic_period_has_cycle_id: string
          created_at?: string | null
          grade: number
          group_has_class_id: string
          id?: string
          is_active?: boolean | null
          observation?: string | null
          student_enrolled_id: string
          updated_at?: string | null
        }
        Update: {
          academic_period_has_cycle_id?: string
          created_at?: string | null
          grade?: number
          group_has_class_id?: string
          id?: string
          is_active?: boolean | null
          observation?: string | null
          student_enrolled_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "student_cycle_grade_academic_period_has_cycle_id_fkey"
            columns: ["academic_period_has_cycle_id"]
            isOneToOne: false
            referencedRelation: "academic_period_has_cycle"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_cycle_grade_group_has_class_id_fkey"
            columns: ["group_has_class_id"]
            isOneToOne: false
            referencedRelation: "group_has_class"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_cycle_grade_student_enrolled_id_fkey"
            columns: ["student_enrolled_id"]
            isOneToOne: false
            referencedRelation: "student_enrolled"
            referencedColumns: ["id"]
          },
        ]
      }
      student_enrolled: {
        Row: {
          academic_period_id: string
          created_at: string
          enrolled_at: string
          id: string
          is_active: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          academic_period_id: string
          created_at?: string
          enrolled_at?: string
          id?: string
          is_active?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          academic_period_id?: string
          created_at?: string
          enrolled_at?: string
          id?: string
          is_active?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_enrolled_academic_period_id_fkey"
            columns: ["academic_period_id"]
            isOneToOne: false
            referencedRelation: "academic_period"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_enrolled_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      student_final_grade: {
        Row: {
          academic_period_id: string
          created_at: string | null
          final_grade: number
          group_has_class_id: string
          id: string
          is_active: boolean | null
          is_locked: boolean | null
          observation: string | null
          student_enrolled_id: string
          updated_at: string | null
        }
        Insert: {
          academic_period_id: string
          created_at?: string | null
          final_grade: number
          group_has_class_id: string
          id?: string
          is_active?: boolean | null
          is_locked?: boolean | null
          observation?: string | null
          student_enrolled_id: string
          updated_at?: string | null
        }
        Update: {
          academic_period_id?: string
          created_at?: string | null
          final_grade?: number
          group_has_class_id?: string
          id?: string
          is_active?: boolean | null
          is_locked?: boolean | null
          observation?: string | null
          student_enrolled_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "student_final_grade_academic_period_id_fkey"
            columns: ["academic_period_id"]
            isOneToOne: false
            referencedRelation: "academic_period"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_final_grade_group_has_class_id_fkey"
            columns: ["group_has_class_id"]
            isOneToOne: false
            referencedRelation: "group_has_class"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_final_grade_student_enrolled_id_fkey"
            columns: ["student_enrolled_id"]
            isOneToOne: false
            referencedRelation: "student_enrolled"
            referencedColumns: ["id"]
          },
        ]
      }
      teacher_enrolled: {
        Row: {
          academic_period_id: string
          created_at: string
          enrolled_at: string
          id: string
          is_active: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          academic_period_id: string
          created_at?: string
          enrolled_at?: string
          id?: string
          is_active?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          academic_period_id?: string
          created_at?: string
          enrolled_at?: string
          id?: string
          is_active?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "teachers_enrolled_academic_period_id_fkey"
            columns: ["academic_period_id"]
            isOneToOne: false
            referencedRelation: "academic_period"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "teachers_enrolled_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      ticket: {
        Row: {
          assigned_to: string | null
          category_id: string | null
          closed_at: string | null
          code: string
          created_at: string
          description: string | null
          due_date: string | null
          id: string
          institute_id: string
          module: string | null
          priority_id: string
          reported_by: string
          source: string | null
          status_id: string
          title: string
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          category_id?: string | null
          closed_at?: string | null
          code: string
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          institute_id: string
          module?: string | null
          priority_id: string
          reported_by: string
          source?: string | null
          status_id: string
          title: string
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          category_id?: string | null
          closed_at?: string | null
          code?: string
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          institute_id?: string
          module?: string | null
          priority_id?: string
          reported_by?: string
          source?: string | null
          status_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ticket_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ticket_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "ticket_category"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ticket_institute_id_fkey"
            columns: ["institute_id"]
            isOneToOne: false
            referencedRelation: "institute"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ticket_priority_id_fkey"
            columns: ["priority_id"]
            isOneToOne: false
            referencedRelation: "ticket_priority"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ticket_reported_by_fkey"
            columns: ["reported_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ticket_status_id_fkey"
            columns: ["status_id"]
            isOneToOne: false
            referencedRelation: "ticket_status"
            referencedColumns: ["id"]
          },
        ]
      }
      ticket_attachment: {
        Row: {
          created_at: string
          file_name: string
          file_size: number | null
          file_url: string
          id: string
          mime_type: string | null
          ticket_id: string
          uploaded_by: string
        }
        Insert: {
          created_at?: string
          file_name: string
          file_size?: number | null
          file_url: string
          id?: string
          mime_type?: string | null
          ticket_id: string
          uploaded_by: string
        }
        Update: {
          created_at?: string
          file_name?: string
          file_size?: number | null
          file_url?: string
          id?: string
          mime_type?: string | null
          ticket_id?: string
          uploaded_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "ticket_attachment_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "ticket"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ticket_attachment_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      ticket_category: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      ticket_comment: {
        Row: {
          author_id: string
          comment: string
          created_at: string
          id: string
          is_internal: boolean
          ticket_id: string
          updated_at: string
        }
        Insert: {
          author_id: string
          comment: string
          created_at?: string
          id?: string
          is_internal?: boolean
          ticket_id: string
          updated_at?: string
        }
        Update: {
          author_id?: string
          comment?: string
          created_at?: string
          id?: string
          is_internal?: boolean
          ticket_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ticket_comment_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ticket_comment_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "ticket"
            referencedColumns: ["id"]
          },
        ]
      }
      ticket_history: {
        Row: {
          changed_by: string
          comment: string | null
          created_at: string
          field_name: string
          id: string
          new_value: string | null
          old_value: string | null
          ticket_id: string
        }
        Insert: {
          changed_by: string
          comment?: string | null
          created_at?: string
          field_name: string
          id?: string
          new_value?: string | null
          old_value?: string | null
          ticket_id: string
        }
        Update: {
          changed_by?: string
          comment?: string | null
          created_at?: string
          field_name?: string
          id?: string
          new_value?: string | null
          old_value?: string | null
          ticket_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ticket_history_changed_by_fkey"
            columns: ["changed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ticket_history_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "ticket"
            referencedColumns: ["id"]
          },
        ]
      }
      ticket_priority: {
        Row: {
          color: string | null
          created_at: string
          id: string
          name: string
          sort_order: number
        }
        Insert: {
          color?: string | null
          created_at?: string
          id?: string
          name: string
          sort_order?: number
        }
        Update: {
          color?: string | null
          created_at?: string
          id?: string
          name?: string
          sort_order?: number
        }
        Relationships: []
      }
      ticket_status: {
        Row: {
          color: string | null
          created_at: string
          id: string
          is_closed: boolean
          name: string
          sort_order: number
        }
        Insert: {
          color?: string | null
          created_at?: string
          id?: string
          is_closed?: boolean
          name: string
          sort_order?: number
        }
        Update: {
          color?: string | null
          created_at?: string
          id?: string
          is_closed?: boolean
          name?: string
          sort_order?: number
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
