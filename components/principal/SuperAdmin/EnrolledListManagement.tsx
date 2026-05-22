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
import { ChevronLeft, ChevronRight, Loader2, Search, UserCheck } from "lucide-react";

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
          <CardTitle className="flex items-center gap-2">
            <UserCheck className="w-5 h-5 shrink-0" />
            <span>Usuarios Matriculados Vinculados</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Subtabs — full width on mobile */}
            <div className="flex bg-muted p-1 rounded-lg">
              <Button
                variant={activeSubTab === SUBTAB_TYPES.STUDENTS ? "default" : "ghost"}
                size="sm"
                className="flex-1 text-xs sm:text-sm"
                onClick={() => handleTabChange(SUBTAB_TYPES.STUDENTS)}
              >
                Estudiantes
              </Button>
              <Button
                variant={activeSubTab === SUBTAB_TYPES.TEACHERS ? "default" : "ghost"}
                size="sm"
                className="flex-1 text-xs sm:text-sm"
                onClick={() => handleTabChange(SUBTAB_TYPES.TEACHERS)}
              >
                Profesores
              </Button>
              <Button
                variant={activeSubTab === SUBTAB_TYPES.ADMIN ? "default" : "ghost"}
                size="sm"
                className="flex-1 text-xs sm:text-sm"
                onClick={() => handleTabChange(SUBTAB_TYPES.ADMIN)}
              >
                Admin
              </Button>
            </div>

            {/* Búsqueda y Filtros — stack on mobile */}
            <div className="flex flex-col gap-2 sm:flex-row sm:gap-3">
              <div className="relative flex-1 bg-white dark:bg-black rounded-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Buscar usuarios matriculados..."
                  value={searchActivos}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={filterPeriodId} onValueChange={handleFilterChange}>
                <SelectTrigger className="w-full sm:w-[220px] bg-white dark:bg-black">
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

            {/* Paginación superior */}
            {!enrolledLoading && filteredEnrolled.length > 0 && (
              <div className="flex flex-col items-center gap-2 pb-2 border-b sm:flex-row sm:justify-between">
                <p className="text-xs text-muted-foreground order-2 sm:order-1">
                  Mostrando{" "}
                  <strong>{(currentPage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, filteredEnrolled.length)}</strong>
                  {" "}de <strong>{filteredEnrolled.length}</strong>
                </p>
                <div className="flex items-center gap-1 order-1 sm:order-2">
                  <Button variant="outline" size="sm" className="h-8 w-8 p-0"
                    onClick={() => setCurrentPage((p) => p - 1)} disabled={currentPage === 1}>
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <span className="text-xs text-muted-foreground px-2">
                    {currentPage} / {totalPages}
                  </span>
                  <Button variant="outline" size="sm" className="h-8 w-8 p-0"
                    onClick={() => setCurrentPage((p) => p + 1)} disabled={currentPage === totalPages}>
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* Lista de usuarios matriculados */}
            <div className="space-y-3">
              {enrolledLoading ? (
                <div className="flex flex-col items-center justify-center py-12 gap-3 text-muted-foreground">
                  <Loader2 className="w-8 h-8 animate-spin" />
                  <p className="text-sm">Cargando usuarios...</p>
                </div>
              ) : filteredEnrolled.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <UserCheck className="w-12 h-12 mx-auto mb-2 opacity-40" />
                  <p className="text-sm">No se encontraron usuarios matriculados</p>
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

            {/* Paginación inferior */}
            {!enrolledLoading && filteredEnrolled.length > 0 && (
              <div className="flex flex-col items-center gap-2 pt-2 border-t sm:flex-row sm:justify-between">
                <p className="text-xs text-muted-foreground order-2 sm:order-1">
                  Mostrando{" "}
                  <strong>{(currentPage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, filteredEnrolled.length)}</strong>
                  {" "}de <strong>{filteredEnrolled.length}</strong>
                </p>
                <div className="flex items-center gap-1 order-1 sm:order-2">
                  <Button variant="outline" size="sm" className="h-8 w-8 p-0"
                    onClick={() => setCurrentPage((p) => p - 1)} disabled={currentPage === 1}>
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <span className="text-xs text-muted-foreground px-2">
                    {currentPage} / {totalPages}
                  </span>
                  <Button variant="outline" size="sm" className="h-8 w-8 p-0"
                    onClick={() => setCurrentPage((p) => p + 1)} disabled={currentPage === totalPages}>
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
