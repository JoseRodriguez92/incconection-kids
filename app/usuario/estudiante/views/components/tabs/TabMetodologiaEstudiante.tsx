"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/src/types/database.types";
import {
  BookMarked,
  Download,
  Eye,
  FileText,
  Lightbulb,
  Loader2,
  StickyNote,
  Tag,
  Video,
} from "lucide-react";

type Methodology =
  Database["public"]["Tables"]["group_class_has_methodology"]["Row"];

interface SkillWithCategory {
  id: string;
  name: string;
  description: string | null;
  category: { id: string; name: string; description: string | null } | null;
}

interface SkillByCategory {
  category: { id: string; name: string; description: string | null };
  skills: SkillWithCategory[];
}

interface TabMetodologiaEstudianteProps {
  metodologia: Methodology | null;
  loading: boolean;
}

function formatFileSize(bytes: number | null) {
  if (!bytes) return null;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
}

function getPublicUrl(bucket: string, path: string) {
  const supabase = createClient();
  return supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl;
}

// Paleta de colores por índice de categoría
const CATEGORY_COLORS = [
  { bg: "bg-blue-50 dark:bg-blue-950/40", border: "border-blue-200 dark:border-blue-800", text: "text-blue-700 dark:text-blue-300", badge: "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300" },
  { bg: "bg-violet-50 dark:bg-violet-950/40", border: "border-violet-200 dark:border-violet-800", text: "text-violet-700 dark:text-violet-300", badge: "bg-violet-100 dark:bg-violet-900 text-violet-700 dark:text-violet-300" },
  { bg: "bg-emerald-50 dark:bg-emerald-950/40", border: "border-emerald-200 dark:border-emerald-800", text: "text-emerald-700 dark:text-emerald-300", badge: "bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300" },
  { bg: "bg-amber-50 dark:bg-amber-950/40", border: "border-amber-200 dark:border-amber-800", text: "text-amber-700 dark:text-amber-300", badge: "bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300" },
  { bg: "bg-rose-50 dark:bg-rose-950/40", border: "border-rose-200 dark:border-rose-800", text: "text-rose-700 dark:text-rose-300", badge: "bg-rose-100 dark:bg-rose-900 text-rose-700 dark:text-rose-300" },
];

export function TabMetodologiaEstudiante({
  metodologia,
  loading,
}: TabMetodologiaEstudianteProps) {
  const [skillsByCategory, setSkillsByCategory] = useState<SkillByCategory[]>([]);
  const [loadingSkills, setLoadingSkills] = useState(false);

  useEffect(() => {
    if (!metodologia?.id) {
      setSkillsByCategory([]);
      return;
    }

    const fetchSkills = async () => {
      setLoadingSkills(true);
      try {
        const supabase = createClient();
        const { data } = await supabase
          .from("group_class_methodology_skill")
          .select(`skill:skill_id ( id, name, description, category:category_id ( id, name, description ) )`)
          .eq("methodology_id", metodologia.id);

        if (!data || data.length === 0) { setSkillsByCategory([]); return; }

        const skillsFlat: SkillWithCategory[] = (data as any[])
          .map((row) => row.skill)
          .filter(Boolean);

        const byCategoryMap = new Map<string, SkillByCategory>();
        for (const skill of skillsFlat) {
          if (!skill.category) continue;
          const catId = skill.category.id;
          if (!byCategoryMap.has(catId)) {
            byCategoryMap.set(catId, { category: skill.category, skills: [] });
          }
          byCategoryMap.get(catId)!.skills.push(skill);
        }
        setSkillsByCategory(Array.from(byCategoryMap.values()));
      } finally {
        setLoadingSkills(false);
      }
    };

    fetchSkills();
  }, [metodologia?.id]);

  if (loading) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12 space-y-3">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-muted-foreground text-sm">Cargando metodología...</p>
        </CardContent>
      </Card>
    );
  }

  const hasContent =
    metodologia?.notes ||
    metodologia?.syllabus_path ||
    metodologia?.welcome_video_url ||
    metodologia?.welcome_video_path ||
    skillsByCategory.length > 0;

  if (!metodologia || (!hasContent && !loadingSkills)) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16 space-y-4">
          <div className="rounded-full bg-muted p-6">
            <BookMarked className="h-14 w-14 text-muted-foreground" />
          </div>
          <div className="text-center space-y-1">
            <h3 className="font-semibold text-lg">Sin metodología registrada</h3>
            <p className="text-muted-foreground text-sm max-w-sm">
              El docente aún no ha configurado la metodología de esta clase.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">

      {/* ── Fila: Notas + Video lado a lado (si existen ambos) ── */}
      <div className={`grid gap-4 ${(metodologia.notes && (metodologia.welcome_video_url || metodologia.welcome_video_path)) ? "md:grid-cols-2" : "grid-cols-1"}`}>

        {/* Descripción de la dinámica */}
        {metodologia.notes && (
          <Card className="border-l-4 border-l-primary">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                <StickyNote className="h-4 w-4 text-primary" />
                Dinámica de la clase
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
                {metodologia.notes}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Video de bienvenida — contenido LATERAL o completo */}
        {(metodologia.welcome_video_url || metodologia.welcome_video_path) && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                <Video className="h-4 w-4 text-primary" />
                Video de bienvenida
              </CardTitle>
            </CardHeader>
            <CardContent>
              {metodologia.welcome_video_url ? (
                <div className="aspect-video rounded-lg overflow-hidden border bg-black max-w-md mx-auto">
                  <iframe
                    src={metodologia.welcome_video_url}
                    className="w-full h-full"
                    allowFullScreen
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  />
                </div>
              ) : metodologia.welcome_video_path && metodologia.welcome_video_bucket ? (
                <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/30">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-purple-100 dark:bg-purple-950 flex items-center justify-center shrink-0">
                      <Video className="h-5 w-5 text-purple-600 dark:text-purple-300" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">
                        {metodologia.welcome_video_original_name ?? "Video"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {metodologia.welcome_video_mime_type ?? "Video"}
                        {metodologia.welcome_video_file_size && (
                          <> · {formatFileSize(metodologia.welcome_video_file_size)}</>
                        )}
                      </p>
                    </div>
                  </div>
                  <Button size="sm" variant="outline" asChild>
                    <a
                      href={getPublicUrl(metodologia.welcome_video_bucket, metodologia.welcome_video_path)}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Eye className="h-4 w-4 mr-1.5" />
                      Ver
                    </a>
                  </Button>
                </div>
              ) : null}
            </CardContent>
          </Card>
        )}
      </div>

      {/* ── Syllabus ── */}
      {metodologia.syllabus_path && metodologia.syllabus_bucket && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold">
              <FileText className="h-4 w-4 text-primary" />
              Programa del curso
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-4 border rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-blue-100 dark:bg-blue-950 flex items-center justify-center shrink-0">
                  <FileText className="h-5 w-5 text-blue-600 dark:text-blue-300" />
                </div>
                <div>
                  <p className="font-medium text-sm">
                    {metodologia.syllabus_original_name ?? "Programa del curso"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {metodologia.syllabus_mime_type ?? "Documento"}
                    {metodologia.syllabus_file_size && (
                      <> · {formatFileSize(metodologia.syllabus_file_size)}</>
                    )}
                  </p>
                </div>
              </div>
              <div className="flex gap-2 shrink-0">
                <Button size="sm" variant="outline" asChild>
                  <a
                    href={getPublicUrl(metodologia.syllabus_bucket, metodologia.syllabus_path)}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Eye className="h-4 w-4" />
                    <span className="sr-only">Ver</span>
                  </a>
                </Button>
                <Button size="sm" variant="outline" asChild>
                  <a
                    href={getPublicUrl(metodologia.syllabus_bucket, metodologia.syllabus_path)}
                    download={metodologia.syllabus_original_name ?? "syllabus"}
                  >
                    <Download className="h-4 w-4" />
                    <span className="sr-only">Descargar</span>
                  </a>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Habilidades por categoría ── */}
      {(loadingSkills || skillsByCategory.length > 0) && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold">
              <Lightbulb className="h-4 w-4 text-primary" />
              Habilidades que desarrollarás
            </CardTitle>
            <CardDescription>
              Competencias y destrezas trabajadas en esta clase
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loadingSkills ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground py-4">
                <Loader2 className="h-4 w-4 animate-spin" />
                Cargando habilidades...
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {skillsByCategory.map(({ category, skills }, catIndex) => {
                  const colors = CATEGORY_COLORS[catIndex % CATEGORY_COLORS.length];
                  return (
                    <div
                      key={category.id}
                      className={`rounded-xl border p-4 space-y-3 ${colors.bg} ${colors.border}`}
                    >
                      {/* Encabezado de categoría */}
                      <div className="flex items-center gap-2">
                        <Tag className={`h-3.5 w-3.5 ${colors.text}`} />
                        <h4 className={`text-xs font-bold uppercase tracking-wide ${colors.text}`}>
                          {category.name}
                        </h4>
                        <span className={`ml-auto text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${colors.badge}`}>
                          {skills.length}
                        </span>
                      </div>

                      {/* Skills */}
                      <div className="space-y-2">
                        {skills.map((skill) => (
                          <div
                            key={skill.id}
                            className="flex items-start gap-2 bg-background/60 rounded-lg px-3 py-2 border border-white/40 dark:border-white/10"
                          >
                            <Lightbulb className={`h-3.5 w-3.5 mt-0.5 shrink-0 ${colors.text}`} />
                            <div className="min-w-0">
                              <p className="text-xs font-semibold text-foreground leading-snug">
                                {skill.name}
                              </p>
                              {skill.description && (
                                <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">
                                  {skill.description}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
