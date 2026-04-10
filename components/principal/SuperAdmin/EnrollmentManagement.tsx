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
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <UserPlus className="w-5 h-5" />
              <span>Usuarios Disponibles</span>
            </div>
            <span className="text-sm font-normal text-muted-foreground">
              Total: {profiles.length}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Campo de Búsqueda */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Buscar por nombre, email o teléfono..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            {searchTerm && (
              <p className="text-sm text-muted-foreground mt-2">
                Mostrando {filteredProfiles.length} de {profiles.length}{" "}
                usuarios
              </p>
            )}
          </div>

          {/* Loading State */}
          {loadingProfiles && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <span className="ml-3 text-muted-foreground">
                Cargando usuarios...
              </span>
            </div>
          )}

          {/* Error State */}
          {errorProfiles && (
            <div className="flex items-center justify-center py-12 text-destructive">
              <AlertCircle className="w-8 h-8 mr-3" />
              <div>
                <p className="font-semibold">Error al cargar datos</p>
                <p className="text-sm">{errorProfiles}</p>
              </div>
            </div>
          )}

          {/* Data Display */}
          {!loadingProfiles && !errorProfiles && (
            <div className="space-y-4">
              {filteredProfiles.length > 0 ? (
                <>
                  <div className="border rounded-lg overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-muted">
                        <tr>
                          <th className="px-4 py-3 text-left text-sm font-semibold">
                            Avatar
                          </th>
                          <th className="px-4 py-3 text-left text-sm font-semibold">
                            Nombre Completo
                          </th>
                          <th className="px-4 py-3 text-left text-sm font-semibold">
                            Email
                          </th>
                          <th className="px-4 py-3 text-left text-sm font-semibold">
                            Teléfono
                          </th>
                          <th className="px-4 py-3 text-left text-sm font-semibold">
                            Acciones
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {currentProfiles.map((profile) => (
                          <tr
                            key={profile.id}
                            className="border-t hover:bg-muted/50 transition-colors"
                          >
                            <td className="px-4 py-3">
                              {profile.avatar_url ? (
                                <img
                                  src={profile.avatar_url}
                                  alt={profile.full_name || "Usuario"}
                                  className="w-10 h-10 rounded-full object-cover"
                                />
                              ) : (
                                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                                  <User className="w-5 h-5 text-muted-foreground" />
                                </div>
                              )}
                            </td>
                            <td className="px-4 py-3 text-sm font-medium">
                              {profile.full_name || "Sin nombre"}
                            </td>
                            <td className="px-4 py-3 text-sm text-muted-foreground">
                              {profile.email || "Sin email"}
                            </td>
                            <td className="px-4 py-3 text-sm text-muted-foreground">
                              {profile.phone || "Sin teléfono"}
                            </td>
                            <td className="px-4 py-3">
                              <Button
                                size="sm"
                                variant="default"
                                onClick={() => handleEnroll(profile)}
                                className="flex items-center gap-2"
                              >
                                <UserPlus className="w-4 h-4" />
                                Matricular
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Controles de Paginación */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-between px-2">
                      <div className="text-sm text-muted-foreground">
                        Mostrando {startIndex + 1} a{" "}
                        {Math.min(endIndex, filteredProfiles.length)} de{" "}
                        {filteredProfiles.length} usuarios
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={goToPreviousPage}
                          disabled={currentPage === 1}
                        >
                          <ChevronLeft className="w-4 h-4" />
                          Anterior
                        </Button>

                        <div className="flex items-center gap-1">
                          {Array.from(
                            { length: totalPages },
                            (_, i) => i + 1,
                          ).map((page) => {
                            // Mostrar solo algunas páginas
                            if (
                              page === 1 ||
                              page === totalPages ||
                              (page >= currentPage - 1 &&
                                page <= currentPage + 1)
                            ) {
                              return (
                                <Button
                                  key={page}
                                  variant={
                                    currentPage === page ? "default" : "outline"
                                  }
                                  size="sm"
                                  onClick={() => goToPage(page)}
                                  className="min-w-[2.5rem]"
                                >
                                  {page}
                                </Button>
                              );
                            } else if (
                              page === currentPage - 2 ||
                              page === currentPage + 2
                            ) {
                              return (
                                <span
                                  key={page}
                                  className="px-2 text-muted-foreground"
                                >
                                  ...
                                </span>
                              );
                            }
                            return null;
                          })}
                        </div>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={goToNextPage}
                          disabled={currentPage === totalPages}
                        >
                          Siguiente
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <User className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  {searchTerm ? (
                    <>
                      <p className="text-lg">No se encontraron resultados</p>
                      <p className="text-sm mt-2">
                        No hay usuarios que coincidan con "{searchTerm}"
                      </p>
                      <Button
                        variant="link"
                        onClick={() => setSearchTerm("")}
                        className="mt-3"
                      >
                        Limpiar búsqueda
                      </Button>
                    </>
                  ) : (
                    <>
                      <p className="text-lg">No hay usuarios disponibles</p>
                      <p className="text-sm mt-2">
                        Los usuarios registrados aparecerán aquí
                      </p>
                    </>
                  )}
                </div>
              )}
            </div>
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
