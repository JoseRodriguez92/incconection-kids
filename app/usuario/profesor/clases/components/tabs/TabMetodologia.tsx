"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Video,
  FileText,
  Download,
  Eye,
  Lightbulb,
  Target,
  Edit,
  Upload,
  Plus,
  Loader2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";
import { GroupClassMethodologyStore } from "@/Stores/groupClassMethodologyStore";
import { GroupClassMethodologySkillStore } from "@/Stores/groupClassMethodologySkillStore";
import { MethodologySkillCategoryStore } from "@/Stores/methodologySkillCategoryStore";
import { MethodologySkillStore } from "@/Stores/methodologySkillStore";
import { useToast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

interface TabMetodologiaProps {
  grupoId: string;
}

interface SkillsByCategory {
  category: any;
  skills: any[];
}

export function TabMetodologia({ grupoId }: TabMetodologiaProps) {
  const { toast } = useToast();
  const [methodology, setMethodology] = useState<any>(null);
  const [skillsByCategory, setSkillsByCategory] = useState<SkillsByCategory[]>(
    [],
  );
  const [loading, setLoading] = useState(false);
  const [modalEditNotesOpen, setModalEditNotesOpen] = useState(false);
  const [modalVideoOpen, setModalVideoOpen] = useState(false);
  const [modalSyllabusOpen, setModalSyllabusOpen] = useState(false);
  const [modalSyllabusViewOpen, setModalSyllabusViewOpen] = useState(false);
  const [modalSkillsOpen, setModalSkillsOpen] = useState(false);
  const [notes, setNotes] = useState("");
  const [selectedSkillIds, setSelectedSkillIds] = useState<string[]>([]);
  const [allSkills, setAllSkills] = useState<any[]>([]);
  const [allCategories, setAllCategories] = useState<any[]>([]);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [uploadingSyllabus, setUploadingSyllabus] = useState(false);

  // Estados para gestión de categorías y habilidades
  const [modalCategoryOpen, setModalCategoryOpen] = useState(false);
  const [modalSkillFormOpen, setModalSkillFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [editingSkill, setEditingSkill] = useState<any>(null);
  const [categoryForm, setCategoryForm] = useState({
    name: "",
    description: "",
  });
  const [skillForm, setSkillForm] = useState({
    name: "",
    description: "",
    category_id: "",
  });
  const [savingForm, setSavingForm] = useState(false);

  const { fetchMethodologyByGroupClassId, addMethodology, updateMethodology } =
    GroupClassMethodologyStore();
  const { fetchSkillsByMethodologyId, updateMethodologySkills } =
    GroupClassMethodologySkillStore();
  const { fetchActiveCategories, addCategory, updateCategory, deleteCategory } =
    MethodologySkillCategoryStore();
  const { fetchSkillsByCategory, addSkill, updateSkill, deleteSkill } =
    MethodologySkillStore();

  useEffect(() => {
    if (!grupoId) return;
    loadMethodologyData();
  }, [grupoId]);

  const loadMethodologyData = async () => {
    setLoading(true);
    try {
      // 1. Obtener o crear metodología
      let methodologyData = await fetchMethodologyByGroupClassId(grupoId);

      if (!methodologyData) {
        // Si no existe, crear una nueva
        methodologyData = await addMethodology({
          group_has_class_id: grupoId,
          is_active: true,
        });
      }

      setMethodology(methodologyData);
      setNotes(methodologyData?.notes || "");

      if (methodologyData) {
        // 2. Obtener habilidades asignadas a esta metodología
        const assignedSkills = await fetchSkillsByMethodologyId(
          methodologyData.id,
        );
        const assignedSkillIds = assignedSkills.map((s) => s.skill_id);
        setSelectedSkillIds(assignedSkillIds);

        // 3. Obtener categorías activas
        const categories = await fetchActiveCategories();

        // 4. Obtener habilidades por categoría
        const skillsByCat: SkillsByCategory[] = await Promise.all(
          categories.map(async (category) => {
            const skills = await fetchSkillsByCategory(category.id);
            return {
              category,
              skills: skills.filter((s) => assignedSkillIds.includes(s.id)),
            };
          }),
        );

        setSkillsByCategory(skillsByCat.filter((sc) => sc.skills.length > 0));
      }
    } catch (error: any) {
      console.error("Error cargando metodología:", error);
      toast({
        title: "Error",
        description: "No se pudo cargar la metodología",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const openSkillsModal = async () => {
    try {
      // Cargar todas las habilidades disponibles organizadas por categoría
      const categories = await fetchActiveCategories();
      const allSkillsData = await Promise.all(
        categories.map(async (category) => {
          const skills = await fetchSkillsByCategory(category.id);
          return skills.map((skill) => ({ ...skill, category }));
        }),
      );
      setAllSkills(allSkillsData.flat());
      setAllCategories(categories);
      setModalSkillsOpen(true);
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron cargar las habilidades",
        variant: "destructive",
      });
    }
  };

  const reloadSkillsData = async () => {
    try {
      const categories = await fetchActiveCategories();
      const allSkillsData = await Promise.all(
        categories.map(async (category) => {
          const skills = await fetchSkillsByCategory(category.id);
          return skills.map((skill) => ({ ...skill, category }));
        }),
      );
      setAllSkills(allSkillsData.flat());

      // También guardamos las categorías para mostrar las vacías
      setAllCategories(categories);
    } catch (error) {
      console.error("Error recargando habilidades:", error);
    }
  };

  // Funciones para gestionar categorías
  const openCategoryForm = (category?: any) => {
    if (category) {
      setEditingCategory(category);
      setCategoryForm({
        name: category.name,
        description: category.description || "",
      });
    } else {
      setEditingCategory(null);
      setCategoryForm({ name: "", description: "" });
    }
    setModalCategoryOpen(true);
  };

  const handleSaveCategory = async () => {
    if (!categoryForm.name.trim()) {
      toast({
        title: "Error",
        description: "El nombre de la categoría es requerido",
        variant: "destructive",
      });
      return;
    }

    setSavingForm(true);
    try {
      if (editingCategory) {
        await updateCategory(editingCategory.id, categoryForm);
        toast({
          title: "Éxito",
          description: "Categoría actualizada correctamente",
        });
      } else {
        await addCategory({ ...categoryForm, is_active: true });
        toast({
          title: "Éxito",
          description: "Categoría creada correctamente",
        });
      }
      setModalCategoryOpen(false);
      await reloadSkillsData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "No se pudo guardar la categoría",
        variant: "destructive",
      });
    } finally {
      setSavingForm(false);
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    if (
      !confirm(
        "¿Estás seguro de eliminar esta categoría? Se eliminarán también todas las habilidades asociadas.",
      )
    ) {
      return;
    }

    try {
      await deleteCategory(categoryId);
      toast({
        title: "Éxito",
        description: "Categoría eliminada correctamente",
      });
      await reloadSkillsData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "No se pudo eliminar la categoría",
        variant: "destructive",
      });
    }
  };

  // Funciones para gestionar habilidades
  const openSkillForm = (categoryId: string, skill?: any) => {
    if (skill) {
      setEditingSkill(skill);
      setSkillForm({
        name: skill.name,
        description: skill.description || "",
        category_id: skill.category_id,
      });
    } else {
      setEditingSkill(null);
      setSkillForm({ name: "", description: "", category_id: categoryId });
    }
    setModalSkillFormOpen(true);
  };

  const handleSaveSkill = async () => {
    if (!skillForm.name.trim()) {
      toast({
        title: "Error",
        description: "El nombre de la habilidad es requerido",
        variant: "destructive",
      });
      return;
    }

    setSavingForm(true);
    try {
      if (editingSkill) {
        await updateSkill(editingSkill.id, skillForm);
        toast({
          title: "Éxito",
          description: "Habilidad actualizada correctamente",
        });
      } else {
        await addSkill({ ...skillForm, is_active: true });
        toast({
          title: "Éxito",
          description: "Habilidad creada correctamente",
        });
      }
      setModalSkillFormOpen(false);
      await reloadSkillsData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "No se pudo guardar la habilidad",
        variant: "destructive",
      });
    } finally {
      setSavingForm(false);
    }
  };

  const handleDeleteSkill = async (skillId: string) => {
    if (!confirm("¿Estás seguro de eliminar esta habilidad?")) {
      return;
    }

    try {
      await deleteSkill(skillId);
      toast({
        title: "Éxito",
        description: "Habilidad eliminada correctamente",
      });
      // Remover de la lista de seleccionados si estaba
      setSelectedSkillIds((prev) => prev.filter((id) => id !== skillId));
      await reloadSkillsData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "No se pudo eliminar la habilidad",
        variant: "destructive",
      });
    }
  };

  const handleSaveSkills = async () => {
    if (!methodology) return;

    setLoading(true);
    try {
      await updateMethodologySkills(methodology.id, selectedSkillIds);
      toast({
        title: "Éxito",
        description: "Habilidades actualizadas correctamente",
      });
      setModalSkillsOpen(false);
      await loadMethodologyData();
    } catch (error: any) {
      toast({
        title: "Error",
        description:
          error.message || "No se pudieron actualizar las habilidades",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveNotes = async () => {
    if (!methodology) return;

    setLoading(true);
    try {
      await updateMethodology(methodology.id, { notes });
      toast({
        title: "Éxito",
        description: "Notas actualizadas correctamente",
      });
      setModalEditNotesOpen(false);
      await loadMethodologyData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "No se pudieron actualizar las notas",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUploadVideo = async (file: File) => {
    if (!methodology || !file) return;

    setUploadingVideo(true);
    try {
      // 1. Subir video a Supabase Storage
      const fileExt = file.name.split(".").pop();
      const fileName = `${methodology.id}_${Date.now()}.${fileExt}`;
      const filePath = `methodology-videos/${fileName}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("methodology-videos")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: true,
        });

      if (uploadError) throw uploadError;

      // 2. Obtener URL pública
      const {
        data: { publicUrl },
      } = supabase.storage.from("methodology-videos").getPublicUrl(filePath);

      // 3. Actualizar metodología con la info del video
      await updateMethodology(methodology.id, {
        welcome_video_url: publicUrl,
        welcome_video_path: filePath,
        welcome_video_bucket: "methodology-videos",
        welcome_video_original_name: file.name,
        welcome_video_file_size: file.size,
        welcome_video_mime_type: file.type,
      });

      toast({
        title: "Éxito",
        description: "Video subido correctamente",
      });
      setModalVideoOpen(false);
      await loadMethodologyData();
    } catch (error: any) {
      console.error("Error subiendo video:", error);
      toast({
        title: "Error",
        description: error.message || "No se pudo subir el video",
        variant: "destructive",
      });
    } finally {
      setUploadingVideo(false);
    }
  };

  const handleDeleteVideo = async () => {
    if (!methodology || !methodology.welcome_video_path) return;

    setUploadingVideo(true);
    try {
      // 1. Eliminar archivo de storage
      const { error: deleteError } = await supabase.storage
        .from(methodology.welcome_video_bucket || "methodology-videos")
        .remove([methodology.welcome_video_path]);

      if (deleteError) throw deleteError;

      // 2. Actualizar metodología quitando referencias al video
      await updateMethodology(methodology.id, {
        welcome_video_url: null,
        welcome_video_path: null,
        welcome_video_bucket: null,
        welcome_video_original_name: null,
        welcome_video_file_size: null,
        welcome_video_mime_type: null,
      });

      toast({
        title: "Éxito",
        description: "Video eliminado correctamente",
      });
      await loadMethodologyData();
    } catch (error: any) {
      console.error("Error eliminando video:", error);
      toast({
        title: "Error",
        description: error.message || "No se pudo eliminar el video",
        variant: "destructive",
      });
    } finally {
      setUploadingVideo(false);
    }
  };

  const handleUploadSyllabus = async (file: File) => {
    if (!methodology || !file) return;

    setUploadingSyllabus(true);
    try {
      // 1. Subir PDF a Supabase Storage
      const fileExt = file.name.split(".").pop();
      const fileName = `${methodology.id}_${Date.now()}.${fileExt}`;
      const filePath = `methodology-syllabus/${fileName}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("methodology-syllabus")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: true,
        });

      if (uploadError) throw uploadError;

      // 2. Actualizar metodología con la info del silabus
      await updateMethodology(methodology.id, {
        syllabus_path: filePath,
        syllabus_bucket: "methodology-syllabus",
        syllabus_original_name: file.name,
        syllabus_file_size: file.size,
        syllabus_mime_type: file.type,
      });

      toast({
        title: "Éxito",
        description: "Silabus subido correctamente",
      });
      setModalSyllabusOpen(false);
      await loadMethodologyData();
    } catch (error: any) {
      console.error("Error subiendo silabus:", error);
      toast({
        title: "Error",
        description: error.message || "No se pudo subir el silabus",
        variant: "destructive",
      });
    } finally {
      setUploadingSyllabus(false);
    }
  };

  const getSyllabusUrl = () => {
    if (!methodology?.syllabus_path) return null;
    const { data } = supabase.storage
      .from(methodology.syllabus_bucket || "methodology-syllabus")
      .getPublicUrl(methodology.syllabus_path);
    return data.publicUrl;
  };

  const toggleSkill = (skillId: string) => {
    setSelectedSkillIds((prev) =>
      prev.includes(skillId)
        ? prev.filter((id) => id !== skillId)
        : [...prev, skillId],
    );
  };

  const getCategoryColor = (index: number) => {
    const colors = [
      "purple",
      "blue",
      "green",
      "orange",
      "pink",
      "indigo",
      "teal",
    ];
    return colors[index % colors.length];
  };

  if (loading && !methodology) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Video de Metodología */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Video className="h-5 w-5 text-primary" />
              <CardTitle>Video de Metodología</CardTitle>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setModalVideoOpen(true)}
              >
                <Upload className="h-4 w-4 mr-2" />
                {methodology?.welcome_video_url
                  ? "Cambiar Video"
                  : "Subir Video"}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setModalEditNotesOpen(true)}
              >
                <Edit className="h-4 w-4 mr-2" />
                Editar Notas
              </Button>
            </div>
          </div>
          <CardDescription>
            Conoce el enfoque pedagógico y la metodología del curso
          </CardDescription>
        </CardHeader>
        <CardContent>
          {methodology?.welcome_video_url ? (
            <div className="w-full flex justify-center rounded-lg overflow-hidden bg-black">
              <video
                src={methodology.welcome_video_url}
                controls
                className="h-[400px] md:h-[500px] w-auto max-w-full object-contain"
              />
            </div>
          ) : (
            <div className="w-full h-[400px] md:h-[500px] bg-muted rounded-lg flex items-center justify-center border-2 border-dashed">
              <div className="text-center space-y-3">
                <Video className="h-16 w-16 text-muted-foreground mx-auto" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    No hay video de metodología
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Sube un video para presentar tu metodología
                  </p>
                </div>
              </div>
            </div>
          )}
          {methodology?.notes && (
            <div className="mt-4 p-4 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground">
                <strong>Notas:</strong> {methodology.notes}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Habilidades a Desarrollar */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              <CardTitle>Habilidades a Desarrollar</CardTitle>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={openSkillsModal}
              disabled={!methodology}
            >
              <Edit className="h-4 w-4 mr-2" />
              Gestionar Habilidades
            </Button>
          </div>
          <CardDescription>
            Competencias y destrezas que los estudiantes desarrollarán durante
            el curso
          </CardDescription>
        </CardHeader>
        <CardContent>
          {skillsByCategory.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Target className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">No hay habilidades asignadas aún</p>
              <p className="text-xs mt-1">
                Haz clic en "Gestionar Habilidades" para agregar
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {skillsByCategory.map((item, index) => {
                const color = getCategoryColor(index);
                return (
                  <div key={item.category.id}>
                    <div className="flex items-center gap-2 mb-3">
                      <Lightbulb className={`h-4 w-4 text-${color}-600`} />
                      <h4 className="font-semibold text-sm">
                        {item.category.name}
                      </h4>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {item.skills.map((skill) => (
                        <Badge
                          key={skill.id}
                          variant="outline"
                          className={`bg-${color}-50 border-${color}-200 text-${color}-700 dark:bg-${color}-950/30 dark:border-${color}-800 dark:text-${color}-300`}
                        >
                          {skill.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Documentos - Silabus */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              <CardTitle>Silabus y Documentos</CardTitle>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setModalSyllabusOpen(true)}
            >
              <Upload className="h-4 w-4 mr-2" />
              {methodology?.syllabus_path ? "Cambiar Silabus" : "Subir Silabus"}
            </Button>
          </div>
          <CardDescription>
            Documentos con los temas, contenidos y planificación del curso
          </CardDescription>
        </CardHeader>
        <CardContent>
          {methodology?.syllabus_path ? (
            <div className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  <FileText className="h-10 w-10 text-blue-500 mt-1" />
                  <div className="flex-1">
                    <p className="font-medium">
                      {methodology.syllabus_original_name ||
                        "Silabus del Curso"}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Documento completo con todos los temas y planificación
                    </p>
                    <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                      <span>{methodology.syllabus_mime_type || "PDF"}</span>
                      <span>•</span>
                      <span>
                        {methodology.syllabus_file_size
                          ? `${(methodology.syllabus_file_size / 1024).toFixed(1)} KB`
                          : ""}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 ml-4">
                  <Button
                    size="sm"
                    variant="outline"
                    title="Ver documento"
                    onClick={() => setModalSyllabusViewOpen(true)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 border-2 border-dashed rounded-lg">
              <FileText className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-50" />
              <p className="text-sm text-muted-foreground">
                No hay silabus cargado
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Sube el documento PDF del silabus
              </p>
            </div>
          )}

          {/* Mensaje informativo */}
          <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg">
            <p className="text-sm text-blue-900 dark:text-blue-200">
              <strong>Información para padres:</strong> Aquí pueden consultar la
              metodología del curso, los temas que se abordarán durante el
              período académico y los objetivos de aprendizaje.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Modal Subir/Editar Video */}
      <Dialog open={modalVideoOpen} onOpenChange={setModalVideoOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500">
                <Video className="h-6 w-6 text-white" />
              </div>
              <div>
                <DialogTitle className="text-xl">
                  {methodology?.welcome_video_url ? "Cambiar" : "Subir"} Video
                  de Metodología
                </DialogTitle>
                <DialogDescription className="mt-1">
                  Presenta tu metodología con un video atractivo para los
                  estudiantes
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-6">
            {/* Video Actual */}
            {methodology?.welcome_video_url && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold flex items-center gap-2">
                    <Video className="h-4 w-4 text-purple-600" />
                    Video Actual
                  </h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleDeleteVideo}
                    disabled={uploadingVideo}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    {uploadingVideo ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <X className="h-4 w-4 mr-2" />
                    )}
                    Eliminar
                  </Button>
                </div>
                <div className="w-full flex justify-center rounded-xl overflow-hidden border-2 border-gray-200 dark:border-gray-700 shadow-lg bg-black">
                  <video
                    src={methodology.welcome_video_url}
                    controls
                    className="h-[250px] sm:h-[300px] md:h-[350px] w-auto max-w-full object-contain"
                  />
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 rounded-md font-medium">
                    {methodology.welcome_video_original_name}
                  </span>
                  {methodology.welcome_video_file_size && (
                    <>
                      <span>•</span>
                      <span>
                        {(
                          methodology.welcome_video_file_size /
                          (1024 * 1024)
                        ).toFixed(2)}{" "}
                        MB
                      </span>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Upload Area */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold flex items-center gap-2">
                <Upload className="h-4 w-4 text-blue-600" />
                {methodology?.welcome_video_url
                  ? "Reemplazar con nuevo video"
                  : "Subir video"}
              </h4>
              <label
                htmlFor="video-upload"
                className={`
                  relative flex flex-col items-center justify-center
                  border-2 border-dashed rounded-xl p-8 cursor-pointer
                  transition-all duration-200
                  ${
                    uploadingVideo
                      ? "border-purple-300 bg-purple-50 dark:bg-purple-950/20"
                      : "border-gray-300 hover:border-purple-500 hover:bg-purple-50/50 dark:border-gray-600 dark:hover:border-purple-500 dark:hover:bg-purple-950/20"
                  }
                `}
              >
                <input
                  id="video-upload"
                  type="file"
                  accept="video/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleUploadVideo(file);
                  }}
                  className="hidden"
                  disabled={uploadingVideo}
                />
                {uploadingVideo ? (
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 className="h-12 w-12 text-purple-600 animate-spin" />
                    <div className="text-center">
                      <p className="text-sm font-medium text-purple-900 dark:text-purple-200">
                        Subiendo video...
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Por favor espera mientras procesamos tu archivo
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-3">
                    <div className="p-4 rounded-full bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30">
                      <Upload className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        Haz clic para seleccionar un video
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        o arrastra y suelta aquí
                      </p>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mt-2">
                      <div className="flex items-center gap-1">
                        <Video className="h-3.5 w-3.5" />
                        <span>MP4, WebM, MOV</span>
                      </div>
                      <span>•</span>
                      <span>Máx. 100MB</span>
                    </div>
                  </div>
                )}
              </label>
            </div>

            {/* Info adicional */}
            <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg">
              <Lightbulb className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-900 dark:text-blue-200">
                <p className="font-medium mb-1">Tips para un buen video:</p>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li>Duración recomendada: 3-5 minutos</li>
                  <li>Explica claramente los objetivos del curso</li>
                  <li>Muestra tu enfoque pedagógico y metodología</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => setModalVideoOpen(false)}
              disabled={uploadingVideo}
            >
              Cerrar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal Editar Notas */}
      <Dialog open={modalEditNotesOpen} onOpenChange={setModalEditNotesOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500">
                <Edit className="h-6 w-6 text-white" />
              </div>
              <div>
                <DialogTitle className="text-xl">
                  Editar Notas de Metodología
                </DialogTitle>
                <DialogDescription className="mt-1">
                  Describe el enfoque pedagógico y objetivos del curso
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <FileText className="h-4 w-4 text-green-600" />
                Notas de Metodología
              </label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Describe tu metodología, enfoque pedagógico, objetivos de aprendizaje, estrategias didácticas..."
                rows={8}
                className="resize-none border-2 focus:border-green-500 focus:ring-green-500"
              />
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Lightbulb className="h-3 w-3" />
                Estas notas ayudarán a estudiantes y padres a entender tu forma
                de enseñar
              </p>
            </div>

            {/* Tips */}
            <div className="p-4 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg">
              <p className="text-sm font-medium text-green-900 dark:text-green-200 mb-2">
                💡 Sugerencias de contenido:
              </p>
              <ul className="list-disc list-inside space-y-1 text-xs text-green-800 dark:text-green-300">
                <li>
                  Enfoque pedagógico principal (constructivista, colaborativo,
                  etc.)
                </li>
                <li>Objetivos de aprendizaje que los estudiantes alcanzarán</li>
                <li>Estrategias y dinámicas que utilizarás en clase</li>
                <li>Cómo se evaluará el progreso de los estudiantes</li>
                <li>Expectativas y recomendaciones para los estudiantes</li>
              </ul>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => setModalEditNotesOpen(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSaveNotes}
              disabled={loading}
              className="bg-green-600 hover:bg-green-700"
            >
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Guardar Notas
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal Subir Silabus */}
      <Dialog open={modalSyllabusOpen} onOpenChange={setModalSyllabusOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <div>
                <DialogTitle className="text-xl">
                  {methodology?.syllabus_path ? "Cambiar" : "Subir"} Silabus
                </DialogTitle>
                <DialogDescription className="mt-1">
                  Comparte el documento PDF con el programa del curso
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-6">
            {/* Documento Actual */}
            {methodology?.syllabus_path && (
              <div className="space-y-3">
                <h4 className="text-sm font-semibold flex items-center gap-2">
                  <FileText className="h-4 w-4 text-blue-600" />
                  Documento Actual
                </h4>
                <div className="flex items-center gap-3 p-4 border-2 border-blue-200 dark:border-blue-800 rounded-xl bg-blue-50 dark:bg-blue-950/30">
                  <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900/50">
                    <FileText className="h-8 w-8 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">
                      {methodology.syllabus_original_name}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                      <span>PDF</span>
                      {methodology.syllabus_file_size && (
                        <>
                          <span>•</span>
                          <span>
                            {(methodology.syllabus_file_size / 1024).toFixed(1)}{" "}
                            KB
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      title="Ver documento"
                      onClick={() => setModalSyllabusViewOpen(true)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Upload Area */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold flex items-center gap-2">
                <Upload className="h-4 w-4 text-blue-600" />
                {methodology?.syllabus_path
                  ? "Reemplazar con nuevo documento"
                  : "Subir documento"}
              </h4>
              <label
                htmlFor="syllabus-upload"
                className={`
                  relative flex flex-col items-center justify-center
                  border-2 border-dashed rounded-xl p-8 cursor-pointer
                  transition-all duration-200
                  ${
                    uploadingSyllabus
                      ? "border-blue-300 bg-blue-50 dark:bg-blue-950/20"
                      : "border-gray-300 hover:border-blue-500 hover:bg-blue-50/50 dark:border-gray-600 dark:hover:border-blue-500 dark:hover:bg-blue-950/20"
                  }
                `}
              >
                <input
                  id="syllabus-upload"
                  type="file"
                  accept=".pdf,application/pdf"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleUploadSyllabus(file);
                  }}
                  className="hidden"
                  disabled={uploadingSyllabus}
                />
                {uploadingSyllabus ? (
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 className="h-12 w-12 text-blue-600 animate-spin" />
                    <div className="text-center">
                      <p className="text-sm font-medium text-blue-900 dark:text-blue-200">
                        Subiendo documento...
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Por favor espera mientras procesamos tu archivo
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-3">
                    <div className="p-4 rounded-full bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-blue-900/30 dark:to-cyan-900/30">
                      <FileText className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        Haz clic para seleccionar un PDF
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        o arrastra y suelta aquí
                      </p>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mt-2">
                      <div className="flex items-center gap-1">
                        <FileText className="h-3.5 w-3.5" />
                        <span>Solo PDF</span>
                      </div>
                      <span>•</span>
                      <span>Máx. 10MB</span>
                    </div>
                  </div>
                )}
              </label>
            </div>

            {/* Info adicional */}
            <div className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg">
              <Lightbulb className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-amber-900 dark:text-amber-200">
                <p className="font-medium mb-1">Contenido recomendado:</p>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li>Objetivos de aprendizaje del curso</li>
                  <li>Temario detallado por unidades</li>
                  <li>Metodología de evaluación y criterios</li>
                  <li>Calendario de actividades y entregas</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => setModalSyllabusOpen(false)}
              disabled={uploadingSyllabus}
            >
              Cerrar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal Gestionar Habilidades */}
      <Dialog open={modalSkillsOpen} onOpenChange={setModalSkillsOpen}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-gradient-to-br from-orange-500 to-red-500">
                  <Target className="h-6 w-6 text-white" />
                </div>
                <div>
                  <DialogTitle className="text-xl">
                    Gestionar Habilidades
                  </DialogTitle>
                  <DialogDescription className="mt-1">
                    Selecciona las competencias que desarrollarán tus
                    estudiantes
                  </DialogDescription>
                </div>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => openCategoryForm()}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Nueva Categoría
              </Button>
            </div>
          </DialogHeader>

          {/* Contador de seleccionados */}
          <div className="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800 rounded-lg">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-orange-600" />
              <span className="text-sm font-medium text-orange-900 dark:text-orange-200">
                {selectedSkillIds.length} habilidad
                {selectedSkillIds.length !== 1 ? "es" : ""} seleccionada
                {selectedSkillIds.length !== 1 ? "s" : ""}
              </span>
            </div>
            {selectedSkillIds.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedSkillIds([])}
                className="h-7 text-orange-600 hover:text-orange-700 hover:bg-orange-100"
              >
                Limpiar selección
              </Button>
            )}
          </div>

          <div className="space-y-5">
            {allCategories.map((category, index) => {
              const color = getCategoryColor(index);
              const categorySkills = allSkills.filter(
                (s) => s.category_id === category.id,
              );
              const selectedInCategory = categorySkills.filter((s) =>
                selectedSkillIds.includes(s.id),
              ).length;

              return (
                <div
                  key={category.id}
                  className="p-4 rounded-xl border-2 transition-all hover:border-gray-300 dark:hover:border-gray-600"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div
                        className={`p-2 rounded-lg bg-${color}-100 dark:bg-${color}-900/30`}
                      >
                        <Lightbulb className={`h-4 w-4 text-${color}-600`} />
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm">
                          {category.name}
                        </h4>
                        <p className="text-xs text-muted-foreground">
                          {selectedInCategory} de {categorySkills.length}{" "}
                          seleccionadas
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openSkillForm(category.id)}
                        className="h-7 text-xs"
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        Habilidad
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openCategoryForm(category)}
                        className="h-7 text-xs"
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteCategory(category.id)}
                        className="h-7 text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                      {categorySkills.length > 0 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            const allCategoryIds = categorySkills.map(
                              (s) => s.id,
                            );
                            const allSelected = allCategoryIds.every((id) =>
                              selectedSkillIds.includes(id),
                            );
                            if (allSelected) {
                              setSelectedSkillIds((prev) =>
                                prev.filter(
                                  (id) => !allCategoryIds.includes(id),
                                ),
                              );
                            } else {
                              setSelectedSkillIds((prev) => [
                                ...new Set([...prev, ...allCategoryIds]),
                              ]);
                            }
                          }}
                          className="h-7 text-xs"
                        >
                          {categorySkills.every((s) =>
                            selectedSkillIds.includes(s.id),
                          )
                            ? "Deseleccionar"
                            : "Seleccionar todo"}
                        </Button>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2">
                    {categorySkills.length === 0 ? (
                      <div className="text-center py-6 text-muted-foreground bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                        <p className="text-sm">
                          No hay habilidades en esta categoría
                        </p>
                        <p className="text-xs mt-1">
                          Haz clic en "+ Habilidad" para agregar
                        </p>
                      </div>
                    ) : (
                      categorySkills.map((skill: any) => (
                        <div
                          key={skill.id}
                          className="flex items-start gap-3 p-3 rounded-lg transition-all hover:bg-gray-50 dark:hover:bg-gray-800/50 group"
                        >
                          <Checkbox
                            id={skill.id}
                            checked={selectedSkillIds.includes(skill.id)}
                            onCheckedChange={() => toggleSkill(skill.id)}
                            className="mt-0.5"
                          />
                          <label
                            htmlFor={skill.id}
                            className="flex-1 cursor-pointer"
                          >
                            <p className="text-sm font-medium group-hover:text-primary transition-colors">
                              {skill.name}
                            </p>
                            {skill.description && (
                              <p className="text-xs text-muted-foreground mt-0.5">
                                {skill.description}
                              </p>
                            )}
                          </label>
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                openSkillForm(skill.category_id, skill)
                              }
                              className="h-6 w-6 p-0"
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteSkill(skill.id)}
                              className="h-6 w-6 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {allCategories.length === 0 && (
            <div className="text-center py-8">
              <Target className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-50" />
              <p className="text-sm text-muted-foreground">
                No hay categorías disponibles
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Haz clic en "+ Nueva Categoría" para comenzar
              </p>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4 border-t sticky bottom-0 bg-background">
            <Button
              variant="outline"
              onClick={() => setModalSkillsOpen(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSaveSkills}
              disabled={loading}
              className="bg-orange-600 hover:bg-orange-700"
            >
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Guardar {selectedSkillIds.length} Habilidad
              {selectedSkillIds.length !== 1 ? "es" : ""}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal Crear/Editar Categoría */}
      <Dialog open={modalCategoryOpen} onOpenChange={setModalCategoryOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500">
                <Lightbulb className="h-6 w-6 text-white" />
              </div>
              <div>
                <DialogTitle className="text-xl">
                  {editingCategory ? "Editar" : "Nueva"} Categoría
                </DialogTitle>
                <DialogDescription className="mt-1">
                  {editingCategory ? "Modifica" : "Crea"} una categoría de
                  habilidades
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="category-name">Nombre *</Label>
              <Input
                id="category-name"
                value={categoryForm.name}
                onChange={(e) =>
                  setCategoryForm({ ...categoryForm, name: e.target.value })
                }
                placeholder="Ej: Pensamiento Lógico, Creatividad..."
                className="border-2"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category-description">Descripción</Label>
              <Textarea
                id="category-description"
                value={categoryForm.description}
                onChange={(e) =>
                  setCategoryForm({
                    ...categoryForm,
                    description: e.target.value,
                  })
                }
                placeholder="Breve descripción de la categoría..."
                rows={3}
                className="border-2 resize-none"
              />
            </div>

            <div className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg">
              <Lightbulb className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-blue-900 dark:text-blue-200">
                Las categorías te ayudan a organizar las habilidades por áreas
                de competencia
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => setModalCategoryOpen(false)}
              disabled={savingForm}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSaveCategory}
              disabled={savingForm}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {savingForm && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {editingCategory ? "Actualizar" : "Crear"} Categoría
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal Crear/Editar Habilidad */}
      <Dialog open={modalSkillFormOpen} onOpenChange={setModalSkillFormOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-gradient-to-br from-green-500 to-teal-500">
                <Target className="h-6 w-6 text-white" />
              </div>
              <div>
                <DialogTitle className="text-xl">
                  {editingSkill ? "Editar" : "Nueva"} Habilidad
                </DialogTitle>
                <DialogDescription className="mt-1">
                  {editingSkill ? "Modifica" : "Crea"} una habilidad específica
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="skill-name">Nombre *</Label>
              <Input
                id="skill-name"
                value={skillForm.name}
                onChange={(e) =>
                  setSkillForm({ ...skillForm, name: e.target.value })
                }
                placeholder="Ej: Resolución de problemas, Trabajo en equipo..."
                className="border-2"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="skill-description">Descripción</Label>
              <Textarea
                id="skill-description"
                value={skillForm.description}
                onChange={(e) =>
                  setSkillForm({ ...skillForm, description: e.target.value })
                }
                placeholder="Describe qué implica esta habilidad..."
                rows={3}
                className="border-2 resize-none"
              />
            </div>

            <div className="flex items-start gap-2 p-3 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg">
              <Target className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-green-900 dark:text-green-200">
                Las habilidades representan competencias específicas que los
                estudiantes desarrollarán
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => setModalSkillFormOpen(false)}
              disabled={savingForm}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSaveSkill}
              disabled={savingForm}
              className="bg-green-600 hover:bg-green-700"
            >
              {savingForm && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {editingSkill ? "Actualizar" : "Crear"} Habilidad
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal Ver Silabus */}
      <Dialog open={modalSyllabusViewOpen} onOpenChange={setModalSyllabusViewOpen}>
        <DialogContent className="max-w-5xl h-[90vh] flex flex-col">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <DialogTitle className="text-xl">
                  {methodology?.syllabus_original_name || "Silabus del Curso"}
                </DialogTitle>
                <DialogDescription className="mt-1">
                  Vista previa del documento
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="flex-1 min-h-0">
            {getSyllabusUrl() ? (
              <iframe
                src={getSyllabusUrl()!}
                className="w-full h-full border-0 rounded-lg"
                title="Vista previa del silabus"
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <FileText className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <p className="text-sm text-muted-foreground">
                    No se pudo cargar el documento
                  </p>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
