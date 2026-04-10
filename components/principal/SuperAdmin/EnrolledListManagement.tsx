"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronLeft, ChevronRight, Search, UserCheck } from "lucide-react";

// Hooks
import { useUserManagement } from "./UsersManagement/hooks/useUserManagement";
import { useEnrolledManagement } from "./UsersManagement/hooks/useEnrolledManagement";

// Components
import { EnrolledUserCard } from "./UsersManagement/components/cards/EnrolledUserCard";
import { AssignParentModal } from "./UsersManagement/components/modals/AssignParentModal";

// Utils
import {
  enrichEnrolledWithProfiles,
  filterEnrolledUsers,
} from "./UsersManagement/utils/filters";
import {
  SUBTAB_TYPES,
  type SubTabType,
} from "./UsersManagement/utils/constants";

const ITEMS_PER_PAGE = 10;

export function EnrolledListManagement() {
  const [activeSubTab, setActiveSubTab] = useState<SubTabType>("estudiantes");
  const [searchActivos, setSearchActivos] = useState("");
  const [filterPeriodId, setFilterPeriodId] = useState<string>("todos");
  const [currentPage, setCurrentPage] = useState(1);
  const [assignParent, setAssignParent] = useState<{
    studentId: string;
    studentName: string;
  } | null>(null);

  const { profilesList } = useUserManagement();
  const { getCurrentEnrolled, periodos } = useEnrolledManagement(activeSubTab);
  const { enrolled, loading: enrolledLoading } = getCurrentEnrolled();

  const enrichedEnrolled = enrichEnrolledWithProfiles(enrolled, profilesList);
  const filteredEnrolled = filterEnrolledUsers(
    enrichedEnrolled,
    searchActivos,
    filterPeriodId,
  );

  const totalPages = Math.ceil(filteredEnrolled.length / ITEMS_PER_PAGE);
  const paginatedEnrolled = filteredEnrolled.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  const handleSearchChange = (value: string) => {
    setSearchActivos(value);
    setCurrentPage(1);
  };

  const handleFilterChange = (value: string) => {
    setFilterPeriodId(value);
    setCurrentPage(1);
  };

  const handleTabChange = (tab: SubTabType) => {
    setActiveSubTab(tab);
    setCurrentPage(1);
  };

  const getPeriodName = (periodId: string): string => {
    const period = periodos.find((p) => p.id === periodId);
    return period?.name || periodId;
  };

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">
          Lista de Matriculados
        </h2>
      </div>

      {/* Vista de Usuarios Matriculados */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <UserCheck className="w-5 h-5" />
              <span>Usuarios Matriculados Vinculados</span>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Subtabs */}
            <div className="flex space-x-2 bg-muted p-1 rounded-lg w-fit">
              <Button
                variant={
                  activeSubTab === SUBTAB_TYPES.STUDENTS ? "default" : "ghost"
                }
                size="sm"
                onClick={() => handleTabChange(SUBTAB_TYPES.STUDENTS)}
              >
                Estudiantes
              </Button>
              <Button
                variant={
                  activeSubTab === SUBTAB_TYPES.TEACHERS ? "default" : "ghost"
                }
                size="sm"
                onClick={() => handleTabChange(SUBTAB_TYPES.TEACHERS)}
              >
                Profesores
              </Button>
              <Button
                variant={
                  activeSubTab === SUBTAB_TYPES.ADMIN ? "default" : "ghost"
                }
                size="sm"
                onClick={() => handleTabChange(SUBTAB_TYPES.ADMIN)}
              >
                Administración
              </Button>
            </div>

            {/* Búsqueda y Filtros */}
            <div className="flex gap-3">
              <div className="relative flex-1 bg-white dark:bg-black rounded-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Buscar usuarios matriculados..."
                  value={searchActivos}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={filterPeriodId} onValueChange={handleFilterChange}>
                <SelectTrigger className="w-[250px] bg-white dark:bg-black">
                  <SelectValue placeholder="Filtrar por periodo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos los periodos</SelectItem>
                  {periodos.map((period) => (
                    <SelectItem key={period.id} value={period.id}>
                      {period.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Paginación */}
            {!enrolledLoading && filteredEnrolled.length > 0 && (
              <div className="flex items-center justify-between pb-2 border-b">
                <p className="text-sm text-muted-foreground">
                  Mostrando{" "}
                  <span className="font-medium">
                    {(currentPage - 1) * ITEMS_PER_PAGE + 1}–
                    {Math.min(
                      currentPage * ITEMS_PER_PAGE,
                      filteredEnrolled.length,
                    )}
                  </span>{" "}
                  de{" "}
                  <span className="font-medium">{filteredEnrolled.length}</span>
                </p>
                <div className="flex items-center gap-2 relative  ">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => p - 1)}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Anterior
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    Página {currentPage} de {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => p + 1)}
                    disabled={currentPage === totalPages}
                  >
                    Siguiente
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* Lista de usuarios matriculados */}
            <div className="space-y-3">
              {enrolledLoading ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>Cargando usuarios...</p>
                </div>
              ) : filteredEnrolled.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <UserCheck className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No se encontraron usuarios matriculados</p>
                </div>
              ) : (
                paginatedEnrolled.map((item) => (
                  <EnrolledUserCard
                    key={item.id}
                    enrolled={item}
                    profile={item.profile}
                    periodName={getPeriodName(item.academic_period_id)}
                    isStudent={activeSubTab === SUBTAB_TYPES.STUDENTS}
                    onAssignParent={(studentId) => {
                      const profile = item.profile;
                      setAssignParent({
                        studentId,
                        studentName: profile?.full_name || profile?.email || studentId,
                      });
                    }}
                  />
                ))
              )}
            </div>

            {/* Paginación */}
            {!enrolledLoading && filteredEnrolled.length > 0 && (
              <div className="flex items-center justify-between pb-2 border-b">
                <p className="text-sm text-muted-foreground">
                  Mostrando{" "}
                  <span className="font-medium">
                    {(currentPage - 1) * ITEMS_PER_PAGE + 1}–
                    {Math.min(
                      currentPage * ITEMS_PER_PAGE,
                      filteredEnrolled.length,
                    )}
                  </span>{" "}
                  de{" "}
                  <span className="font-medium">{filteredEnrolled.length}</span>
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => p - 1)}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Anterior
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    Página {currentPage} de {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => p + 1)}
                    disabled={currentPage === totalPages}
                  >
                    Siguiente
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {assignParent && (
        <AssignParentModal
          open={!!assignParent}
          onClose={() => setAssignParent(null)}
          studentId={assignParent.studentId}
          studentName={assignParent.studentName}
        />
      )}
    </div>
  );
}
