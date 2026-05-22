"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
import { Label } from "@/components/ui/label";
import {
  UserPlus,
  Loader2,
  AlertCircle,
  User,
  ChevronLeft,
  ChevronRight,
  Search,
} from "lucide-react";
import { ProfilesStore, type Profile } from "@/Stores/profilesStore";
import { PeriodAcademicStore } from "@/Stores/periodAcademicStore";
import { useRoleManagement } from "./UsersManagement/hooks/useRoleManagement";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { BulkEnrollAndAssign } from "./UsersManagement/BulkEnrollAndAssign";

export function EnrollmentManagement() {
  const supabase = createClient();

  const {
    profiles,
    loading: loadingProfiles,
    error: errorProfiles,
    fetchProfiles,
  } = ProfilesStore();

  const { periodos, fetchPeriodos } = PeriodAcademicStore();
  const { rolesList, getCurrentRoles } = useRoleManagement();

  // Estados de paginación
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Estado de búsqueda
  const [searchTerm, setSearchTerm] = useState("");

  // Estados del modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null);
  const [selectedPeriodId, setSelectedPeriodId] = useState<string>("");
  const [selectedRoleId, setSelectedRoleId] = useState<string>("");
  const [isEnrolling, setIsEnrolling] = useState(false);

  // Filtrar profiles basándose en el término de búsqueda
  const filteredProfiles = profiles.filter((profile) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      profile.full_name?.toLowerCase().includes(searchLower) ||
      profile.email?.toLowerCase().includes(searchLower) ||
      profile.phone?.toLowerCase().includes(searchLower)
    );
  });

  // Calcular datos de paginación con profiles filtrados
  const totalPages = Math.ceil(filteredProfiles.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentProfiles = filteredProfiles.slice(startIndex, endIndex);

  useEffect(() => {
    fetchProfiles();
    fetchPeriodos();
    getCurrentRoles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Resetear a página 1 cuando cambien los profiles o el término de búsqueda
  useEffect(() => {
    setCurrentPage(1);
  }, [profiles.length, searchTerm]);

  const handleEnroll = (profile: Profile) => {
    setSelectedUser(profile);
    setSelectedPeriodId("");
    setSelectedRoleId("");
    setIsModalOpen(true);
  };

  const handleConfirmEnroll = async () => {
    if (!selectedUser || !selectedPeriodId || !selectedRoleId) return;

    setIsEnrolling(true);
    try {
      // Encontrar el rol seleccionado para obtener su slug
      const selectedRole = rolesList.find((role) => role.id === selectedRoleId);
      if (!selectedRole) {
        throw new Error("Rol no encontrado");
      }

      // Determinar la tabla según el slug del rol
      let tableName = "";
      const roleSlug = selectedRole.name?.toLowerCase() || "";

      if (roleSlug.includes("student") || roleSlug.includes("estudiante")) {
        tableName = "student_enrolled";
      } else if (
        roleSlug.includes("teacher") ||
        roleSlug.includes("profesor") ||
        roleSlug.includes("docente")
      ) {
        tableName = "teacher_enrolled";
      } else if (
        roleSlug.includes("acceso completo") ||
        roleSlug.includes("administrador")
      ) {
        tableName = "admin_enrolled";
      } else {
        throw new Error(
          `No se puede determinar la tabla para el rol: ${selectedRole.name}`,
        );
      }

      // Verificar si el usuario ya está matriculado en este periodo
      const { data: existingEnrollment, error: checkError } = await supabase
        .from(tableName as any)
        .select("id")
        .eq("user_id", selectedUser.id)
        .eq("academic_period_id", selectedPeriodId)
        .maybeSingle();

      if (checkError) throw checkError;

      if (existingEnrollment) {
        toast.warning("Usuario ya matriculado", {
          description: `${selectedUser.full_name || "Este usuario"} ya está matriculado en este periodo como ${selectedRole.name}`,
        });
        setIsEnrolling(false);
        return;
      }

      // Insertar en la tabla correspondiente
      const enrollmentData = {
        id: crypto.randomUUID(),
        user_id: selectedUser.id,
        academic_period_id: selectedPeriodId,
        enrolled_at: new Date().toISOString(),
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      console.log("Insertando en tabla:", tableName);
      console.log("Datos a insertar:", enrollmentData);

      const { data, error } = await supabase
        .from(tableName as any)
        .insert(enrollmentData)
        .select();

      console.log("Resultado de inserción:", { data, error });

      if (error) {
        console.error("Error detallado de Supabase:", {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
        });
        throw error;
      }

      // Cerrar modal y resetear
      setIsModalOpen(false);
      setSelectedUser(null);
      setSelectedPeriodId("");
      setSelectedRoleId("");

      toast.success("Matrícula exitosa", {
        description: `${selectedUser.full_name || "Usuario"} fue matriculado exitosamente como ${selectedRole.name}`,
      });
    } catch (error: any) {
      console.error("Error al matricular:", error);

      // Extraer mensaje de error útil
      let errorMessage = "No se pudo completar la matrícula";

      if (error?.message) {
        errorMessage = error.message;
      } else if (error?.error_description) {
        errorMessage = error.error_description;
      } else if (error?.hint) {
        errorMessage = error.hint;
      } else if (typeof error === "string") {
        errorMessage = error;
      } else if (error) {
        errorMessage = JSON.stringify(error);
      }

      toast.error("Error al matricular", {
        description: errorMessage,
        duration: 5000,
      });
    } finally {
      setIsEnrolling(false);
    }
  };

  const goToPage = (page: number) => {
    setCurrentPage(page);
  };

  const goToPreviousPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const goToNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">
          Matricular Usuario
        </h2>
        <BulkEnrollAndAssign periodos={periodos} />
      </div>

      {/* Lista de Usuarios para Matricular */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <UserPlus className="w-5 h-5" />
              <span>Usuarios Disponibles</span>
            </div>
            <span className="text-sm font-normal text-muted-foreground">
              {profiles.length} {profiles.length === 1 ? "usuario" : "usuarios"}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">

          {/* Búsqueda */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Buscar por nombre, email o teléfono..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Loading */}
          {loadingProfiles && (
            <div className="flex items-center justify-center py-12 gap-3 text-muted-foreground">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
              <span className="text-sm">Cargando usuarios...</span>
            </div>
          )}

          {/* Error */}
          {errorProfiles && (
            <div className="flex items-center justify-center py-10 gap-3 text-destructive">
              <AlertCircle className="w-6 h-6 shrink-0" />
              <div>
                <p className="font-semibold text-sm">Error al cargar datos</p>
                <p className="text-xs">{errorProfiles}</p>
              </div>
            </div>
          )}

          {/* Datos */}
          {!loadingProfiles && !errorProfiles && (
            filteredProfiles.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <User className="w-12 h-12 mx-auto mb-3 opacity-40" />
                {searchTerm ? (
                  <>
                    <p className="text-sm font-medium">Sin resultados para "{searchTerm}"</p>
                    <Button variant="link" size="sm" onClick={() => setSearchTerm("")} className="mt-1">
                      Limpiar búsqueda
                    </Button>
                  </>
                ) : (
                  <p className="text-sm">No hay usuarios disponibles</p>
                )}
              </div>
            ) : (
              <>
                {/* ── Mobile: tarjetas ── */}
                <div className="flex flex-col gap-2 sm:hidden">
                  {currentProfiles.map((profile) => (
                    <div key={profile.id} className="flex items-center gap-3 p-3 rounded-xl border bg-background">
                      {profile.avatar_url ? (
                        <img src={profile.avatar_url} alt={profile.full_name || "Usuario"}
                          className="w-10 h-10 rounded-full object-cover shrink-0" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center shrink-0">
                          <User className="w-4 h-4 text-muted-foreground" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{profile.full_name || "Sin nombre"}</p>
                        <p className="text-xs text-muted-foreground truncate">{profile.email || "Sin email"}</p>
                      </div>
                      <Button size="sm" variant="default" onClick={() => handleEnroll(profile)}
                        className="shrink-0 h-8 px-3 gap-1.5">
                        <UserPlus className="w-3.5 h-3.5" />
                        <span className="text-xs">Matricular</span>
                      </Button>
                    </div>
                  ))}
                </div>

                {/* ── Desktop: tabla ── */}
                <div className="hidden sm:block border rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-muted">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-semibold">Avatar</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold">Nombre</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold">Email</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold">Teléfono</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentProfiles.map((profile) => (
                        <tr key={profile.id} className="border-t hover:bg-muted/50 transition-colors">
                          <td className="px-4 py-3">
                            {profile.avatar_url ? (
                              <img src={profile.avatar_url} alt={profile.full_name || "Usuario"}
                                className="w-9 h-9 rounded-full object-cover" />
                            ) : (
                              <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center">
                                <User className="w-4 h-4 text-muted-foreground" />
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-3 text-sm font-medium">{profile.full_name || "Sin nombre"}</td>
                          <td className="px-4 py-3 text-sm text-muted-foreground">{profile.email || "—"}</td>
                          <td className="px-4 py-3 text-sm text-muted-foreground">{profile.phone || "—"}</td>
                          <td className="px-4 py-3">
                            <Button size="sm" onClick={() => handleEnroll(profile)} className="gap-1.5">
                              <UserPlus className="w-4 h-4" />
                              Matricular
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Paginación */}
                {totalPages > 1 && (
                  <div className="flex flex-col items-center gap-2 pt-1 sm:flex-row sm:justify-between">
                    <p className="text-xs text-muted-foreground order-2 sm:order-1">
                      Mostrando <strong>{startIndex + 1}–{Math.min(endIndex, filteredProfiles.length)}</strong> de <strong>{filteredProfiles.length}</strong> usuarios
                    </p>
                    <div className="flex items-center gap-1 order-1 sm:order-2">
                      <Button variant="outline" size="sm" className="h-8 w-8 p-0"
                        onClick={goToPreviousPage} disabled={currentPage === 1}>
                        <ChevronLeft className="w-4 h-4" />
                      </Button>
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                        const near = page === 1 || page === totalPages || (page >= currentPage - 1 && page <= currentPage + 1);
                        const ellipsis = page === currentPage - 2 || page === currentPage + 2;
                        if (near) return (
                          <Button key={page} variant={currentPage === page ? "default" : "outline"}
                            size="sm" className="h-8 w-8 p-0 text-xs" onClick={() => goToPage(page)}>
                            {page}
                          </Button>
                        );
                        if (ellipsis) return <span key={page} className="text-xs text-muted-foreground px-0.5">…</span>;
                        return null;
                      })}
                      <Button variant="outline" size="sm" className="h-8 w-8 p-0"
                        onClick={goToNextPage} disabled={currentPage === totalPages}>
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )
          )}
        </CardContent>
      </Card>

      {/* Modal de Matriculación */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Matricular Usuario</DialogTitle>
            <DialogDescription>
              Selecciona el periodo académico para matricular al usuario
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Información del Usuario */}
            {selectedUser && (
              <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
                {selectedUser.avatar_url ? (
                  <img
                    src={selectedUser.avatar_url}
                    alt={selectedUser.full_name || "Usuario"}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-background flex items-center justify-center">
                    <User className="w-6 h-6 text-muted-foreground" />
                  </div>
                )}
                <div className="flex-1">
                  <p className="font-semibold">
                    {selectedUser.full_name || "Sin nombre"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {selectedUser.email || "Sin email"}
                  </p>
                </div>
              </div>
            )}

            {/* Selector de Rol */}
            <div className="space-y-2">
              <Label htmlFor="role">Rol del Usuario</Label>
              <Select value={selectedRoleId} onValueChange={setSelectedRoleId}>
                <SelectTrigger id="role">
                  <SelectValue placeholder="Selecciona un rol" />
                </SelectTrigger>
                <SelectContent>
                  {rolesList.map((role) => (
                    <SelectItem key={role.id} value={role.id}>
                      <div className="flex flex-col">
                        <span className="font-medium">{role.name}</span>
                        {role.slug && (
                          <span className="text-xs text-muted-foreground">
                            {role.slug}
                          </span>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Selector de Periodo Académico */}
            <div className="space-y-2">
              <Label htmlFor="period">Periodo Académico</Label>
              <Select
                value={selectedPeriodId}
                onValueChange={setSelectedPeriodId}
              >
                <SelectTrigger id="period">
                  <SelectValue placeholder="Selecciona un periodo académico" />
                </SelectTrigger>
                <SelectContent>
                  {periodos.map((periodo) => (
                    <SelectItem key={periodo.id} value={periodo.id}>
                      <div className="flex flex-col">
                        <span className="font-medium">{periodo.name}</span>
                        {periodo.start_date && periodo.end_date && (
                          <span className="text-xs text-muted-foreground">
                            {new Date(periodo.start_date).toLocaleDateString()}{" "}
                            - {new Date(periodo.end_date).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsModalOpen(false)}
              disabled={isEnrolling}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleConfirmEnroll}
              disabled={!selectedRoleId || !selectedPeriodId || isEnrolling}
            >
              {isEnrolling ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Matriculando...
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4 mr-2" />
                  Matricular
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
