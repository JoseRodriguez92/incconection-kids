"use client";

import { useEffect, useState } from "react";
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
import { Search, Users, Settings, UserCheck } from "lucide-react";

// Hooks
import { useUserManagement } from "./UsersManagement/hooks/useUserManagement";
import { useRoleManagement } from "./UsersManagement/hooks/useRoleManagement";
import { useEnrolledManagement } from "./UsersManagement/hooks/useEnrolledManagement";

// Components
import { UserCard } from "./UsersManagement/components/cards/UserCard";
import { RoleCard } from "./UsersManagement/components/cards/RoleCard";
import { EnrolledUserCard } from "./UsersManagement/components/cards/EnrolledUserCard";

// Utils
import {
  filterUsersBySearch,
  enrichEnrolledWithProfiles,
  filterEnrolledUsers,
  type EnrolledWithProfile,
} from "./UsersManagement/utils/filters";
import {
  TAB_TYPES,
  SUBTAB_TYPES,
  type TabType,
  type SubTabType,
} from "./UsersManagement/utils/constants";

export function UsersManagement() {
  // Estado de navegación
  const [activeTab, setActiveTab] = useState<TabType>("usuarios");
  const [activeSubTab, setActiveSubTab] = useState<SubTabType>("estudiantes");

  // Estados de búsqueda
  const [searchUsuarios, setSearchUsuarios] = useState("");
  const [searchRoles, setSearchRoles] = useState("");
  const [searchActivos, setSearchActivos] = useState("");
  const [filterPeriodId, setFilterPeriodId] = useState<string>("todos");

  // Custom hooks
  const { profilesList, loading: usersLoading } = useUserManagement();
  const { rolesList, loading: rolesLoading } = useRoleManagement();
  const { getCurrentEnrolled, periodos } = useEnrolledManagement(activeSubTab);

  const { enrolled, loading: enrolledLoading } = getCurrentEnrolled();

  // Filtrar datos
  const filteredUsuarios = filterUsersBySearch(profilesList, searchUsuarios);
  const filteredRoles = rolesList.filter(
    (role) =>
      role.name.toLowerCase().includes(searchRoles.toLowerCase()) ||
      role.slug.toLowerCase().includes(searchRoles.toLowerCase()),
  );

  const enrichedEnrolled: EnrolledWithProfile[] = enrichEnrolledWithProfiles(
    enrolled,
    profilesList,
  );
  const filteredEnrolled: EnrolledWithProfile[] = filterEnrolledUsers(
    enrichedEnrolled,
    searchActivos,
    filterPeriodId,
  );

  // Helper para obtener nombre del periodo
  const getPeriodName = (periodId: string): string => {
    const period = periodos.find((p) => p.id === periodId);
    return period?.name || periodId;
  };

  useEffect(() => {
    console.log(filteredEnrolled);
  }, [filteredEnrolled]);

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">
          Gestión de Usuarios
        </h2>
      </div>

      {/* Navegación de pestañas principales */}
      <div className="flex space-x-1 bg-muted p-1 rounded-lg w-fit">
        <Button
          variant={activeTab === TAB_TYPES.USERS ? "default" : "ghost"}
          size="sm"
          onClick={() => setActiveTab(TAB_TYPES.USERS)}
        >
          <Users className="w-4 h-4 mr-2" />
          Usuarios
        </Button>
        <Button
          variant={activeTab === TAB_TYPES.ROLES ? "default" : "ghost"}
          size="sm"
          onClick={() => setActiveTab(TAB_TYPES.ROLES)}
        >
          <Settings className="w-4 h-4 mr-2" />
          Roles
        </Button>
        <Button
          variant={activeTab === TAB_TYPES.ACTIVE ? "default" : "ghost"}
          size="sm"
          onClick={() => setActiveTab(TAB_TYPES.ACTIVE)}
        >
          <UserCheck className="w-4 h-4 mr-2" />
          Usuarios Activos
        </Button>
      </div>

      {/* Vista de Usuarios */}
      {activeTab === TAB_TYPES.USERS && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5" />
                <span>Lista de Usuarios</span>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Buscar usuarios..."
                  value={searchUsuarios}
                  onChange={(e) => setSearchUsuarios(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="space-y-3">
                {usersLoading ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>Cargando usuarios...</p>
                  </div>
                ) : filteredUsuarios.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>No se encontraron usuarios</p>
                  </div>
                ) : (
                  filteredUsuarios.map((usuario) => (
                    <UserCard key={usuario.id} user={usuario} />
                  ))
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Vista de Roles */}
      {activeTab === TAB_TYPES.ROLES && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Settings className="w-5 h-5" />
                <span>Gestión de Roles</span>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Buscar roles..."
                  value={searchRoles}
                  onChange={(e) => setSearchRoles(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="space-y-3">
                {rolesLoading ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>Cargando roles...</p>
                  </div>
                ) : filteredRoles.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No hay roles disponibles</p>
                  </div>
                ) : (
                  filteredRoles.map((rol) => (
                    <RoleCard key={rol.id} role={rol} />
                  ))
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Vista de Usuarios Activos */}
      {activeTab === TAB_TYPES.ACTIVE && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <UserCheck className="w-5 h-5" />
                <span>Usuarios Activos Vinculados</span>
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
                  onClick={() => setActiveSubTab(SUBTAB_TYPES.STUDENTS)}
                >
                  Estudiantes
                </Button>
                <Button
                  variant={
                    activeSubTab === SUBTAB_TYPES.TEACHERS ? "default" : "ghost"
                  }
                  size="sm"
                  onClick={() => setActiveSubTab(SUBTAB_TYPES.TEACHERS)}
                >
                  Profesores
                </Button>
                <Button
                  variant={
                    activeSubTab === SUBTAB_TYPES.ADMIN ? "default" : "ghost"
                  }
                  size="sm"
                  onClick={() => setActiveSubTab(SUBTAB_TYPES.ADMIN)}
                >
                  Administración
                </Button>
              </div>

              {/* Búsqueda y Filtros */}
              <div className="flex gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Buscar usuarios activos..."
                    value={searchActivos}
                    onChange={(e) => setSearchActivos(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select
                  value={filterPeriodId}
                  onValueChange={setFilterPeriodId}
                >
                  <SelectTrigger className="w-[250px]">
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

              {/* Lista de usuarios activos */}
              <div className="space-y-3">
                {enrolledLoading ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>Cargando usuarios...</p>
                  </div>
                ) : filteredEnrolled.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <UserCheck className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>No se encontraron usuarios activos</p>
                  </div>
                ) : (
                  filteredEnrolled.map((item) => (
                    <EnrolledUserCard
                      key={item.id}
                      enrolled={item}
                      profile={item.profile}
                      periodName={getPeriodName(item.academic_period_id)}
                    />
                  ))
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
