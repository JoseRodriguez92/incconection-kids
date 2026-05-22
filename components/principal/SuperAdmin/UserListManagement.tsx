"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, Users, UserPlus } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { deleteUser } from "@/app/actions/delete-user";

import {
  useUserManagement,
  PAGE_SIZE,
} from "./UsersManagement/hooks/useUserManagement";
import { useRoleManagement } from "./UsersManagement/hooks/useRoleManagement";
import { BulkCreateUsers } from "./UsersManagement/BulkCreateUsers";
import type { ConditionItem } from "./UsersManagement/types";

import { UserTable } from "./UsersManagement/components/UserTable";
import { DeleteUserDialog } from "./UsersManagement/components/modals/DeleteUserDialog";
import { ChangeEmailDialog } from "./UsersManagement/components/modals/ChangeEmailDialog";
import { CreateUserModal } from "./UsersManagement/components/modals/CreateUserModal";
import { EditUserModal } from "./UsersManagement/components/modals/EditUserModal";

export function UserListManagement() {
  const supabase = createClient();
  const {
    profilesList,
    total,
    loading: usersLoading,
    getAllProfiles,
  } = useUserManagement();
  const { rolesList, loading: rolesLoading } = useRoleManagement();

  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editUser, setEditUser] = useState<any>(null);
  const [deleteTarget, setDeleteTarget] = useState<{
    id: string;
    name: string;
    email: string;
  } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [emailChangeUser, setEmailChangeUser] = useState<{
    id: string;
    email: string;
    name: string;
  } | null>(null);
  const [conditionsCatalog, setConditionsCatalog] = useState<ConditionItem[]>(
    [],
  );

  useEffect(() => {
    supabase
      .from("learning_condition")
      .select("id, name, color")
      .then(({ data }) => {
        if (data) setConditionsCatalog(data);
      });
  }, []);

  // Refetch cuando cambia página o búsqueda
  useEffect(() => {
    getAllProfiles(currentPage, search);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, search]);

  const refresh = useCallback(
    () => getAllProfiles(currentPage, search),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [currentPage, search],
  );

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setCurrentPage(1);
  };

  const totalPages = Math.ceil(total / PAGE_SIZE);

  const handleDeleteUser = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      const result = await deleteUser(deleteTarget.id);
      if (!result.success) throw new Error(result.error);
      toast.success(`Usuario "${deleteTarget.name}" eliminado correctamente`);
      setDeleteTarget(null);
      await refresh();
    } catch (err: unknown) {
      toast.error(
        err instanceof Error ? err.message : "Error al eliminar el usuario",
      );
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl font-bold text-foreground leading-tight">
          Lista de Usuarios
        </h2>
        <div className="flex gap-2 shrink-0">
          <BulkCreateUsers rolesList={rolesList} onFinish={refresh} />
          <Button onClick={() => setIsCreateOpen(true)} className="gap-2">
            <UserPlus className="w-4 h-4" />
            <span className="hidden sm:inline">Crear Usuario</span>
            <span className="sm:hidden">Crear</span>
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              <span>Usuarios Totales</span>
            </div>
            {!usersLoading && (
              <span className="text-sm font-normal text-muted-foreground">
                {total} {total === 1 ? "usuario" : "usuarios"}
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Buscar por nombre o email..."
                value={search}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-10"
              />
            </div>

            <UserTable
              users={profilesList}
              total={total}
              loading={usersLoading}
              currentPage={currentPage}
              totalPages={totalPages}
              pageSize={PAGE_SIZE}
              onPageChange={setCurrentPage}
              onEdit={(id) => {
                const user = profilesList.find((u) => u.id === id);
                if (user) setEditUser(user);
              }}
              onDelete={setDeleteTarget}
              onEmailChange={setEmailChangeUser}
            />
          </div>
        </CardContent>
      </Card>

      <DeleteUserDialog
        target={deleteTarget}
        isDeleting={isDeleting}
        onConfirm={handleDeleteUser}
        onCancel={() => setDeleteTarget(null)}
      />

      <ChangeEmailDialog
        user={emailChangeUser}
        onClose={() => setEmailChangeUser(null)}
        onSuccess={refresh}
      />

      <CreateUserModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSuccess={refresh}
        rolesList={rolesList}
        rolesLoading={rolesLoading}
        conditionsCatalog={conditionsCatalog}
      />

      <EditUserModal
        user={editUser}
        isOpen={!!editUser}
        onClose={() => setEditUser(null)}
        onSuccess={refresh}
        rolesList={rolesList}
        rolesLoading={rolesLoading}
        conditionsCatalog={conditionsCatalog}
      />
    </div>
  );
}
