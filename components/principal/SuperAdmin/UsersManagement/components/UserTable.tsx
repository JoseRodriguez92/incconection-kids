"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Users, Edit, Mail, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { ConditionBadges } from "@/components/ui/ConditionBadges";
import { getRoleBadgeColor } from "../types";

interface UserTableProps {
  users: any[];
  filteredCount: number;
  loading: boolean;
  currentPage: number;
  totalPages: number;
  startIndex: number;
  endIndex: number;
  onPageChange: (page: number) => void;
  onEdit: (id: string) => void;
  onDelete: (user: { id: string; name: string; email: string }) => void;
  onEmailChange: (user: { id: string; email: string; name: string }) => void;
}

function getInitials(name: string) {
  if (!name) return "?";
  const parts = name.split(" ");
  return parts.length >= 2
    ? parts[0].charAt(0) + parts[1].charAt(0)
    : name.charAt(0);
}

export function UserTable({
  users,
  filteredCount,
  loading,
  currentPage,
  totalPages,
  startIndex,
  endIndex,
  onPageChange,
  onEdit,
  onDelete,
  onEmailChange,
}: UserTableProps) {
  if (loading) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>Cargando usuarios...</p>
      </div>
    );
  }

  if (filteredCount === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
        <p>No se encontraron usuarios</p>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">Foto</TableHead>
              <TableHead>Usuario</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Teléfono</TableHead>
              <TableHead>Documento</TableHead>
              <TableHead>Roles</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((usuario: any) => (
              <TableRow key={usuario.id}>
                <TableCell>
                  <Avatar className="w-10 h-10">
                    <AvatarImage
                      src={usuario.avatar_url || "/placeholder.svg"}
                      alt={usuario.full_name || "Usuario"}
                    />
                    <AvatarFallback className="text-xs">
                      {getInitials(usuario.full_name)}
                    </AvatarFallback>
                  </Avatar>
                </TableCell>
                <TableCell className="font-medium">
                  <div className="space-y-1">
                    <span>{usuario.full_name || "Sin nombre"}</span>
                    <ConditionBadges
                      conditions={(usuario as any).conditions?.map(
                        (c: any) => c.learning_condition,
                      )}
                    />
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">{usuario.email}</TableCell>
                <TableCell className="text-muted-foreground">
                  {usuario.phone || "-"}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {usuario.document_type && usuario.document_number
                    ? `${usuario.document_type} ${usuario.document_number}`
                    : "-"}
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {usuario.roles && usuario.roles.length > 0 ? (
                      usuario.roles.map((role: any) => (
                        <Badge
                          key={role.id}
                          variant="outline"
                          className={`text-xs ${getRoleBadgeColor(role.name)}`}
                        >
                          {role.name}
                        </Badge>
                      ))
                    ) : (
                      <Badge variant="outline" className="text-xs bg-gray-50 text-gray-500">
                        Sin rol
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    title="Cambiar correo"
                    onClick={() =>
                      onEmailChange({
                        id: usuario.id,
                        email: usuario.email || "",
                        name: usuario.full_name || usuario.email || "Usuario",
                      })
                    }
                  >
                    <Mail className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    title="Editar usuario"
                    onClick={() => onEdit(usuario.id)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    title="Eliminar usuario"
                    className="text-red-500 hover:text-red-600 hover:bg-red-50"
                    onClick={() =>
                      onDelete({
                        id: usuario.id,
                        name: usuario.full_name || usuario.email || "Usuario",
                        email: usuario.email || "",
                      })
                    }
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between px-2">
          <div className="text-sm text-muted-foreground">
            Mostrando {startIndex + 1} a {Math.min(endIndex, filteredCount)} de{" "}
            {filteredCount} usuarios
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="w-4 h-4" />
              Anterior
            </Button>
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <Button
                  key={page}
                  variant={currentPage === page ? "default" : "outline"}
                  size="sm"
                  onClick={() => onPageChange(page)}
                  className="w-8 h-8 p-0"
                >
                  {page}
                </Button>
              ))}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
            >
              Siguiente
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
