"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Users, Edit, Mail, Trash2, ChevronLeft, ChevronRight, Loader2,
  Phone, CreditCard,
} from "lucide-react";
import { ConditionBadges } from "@/components/ui/ConditionBadges";
import { getRoleBadgeColor } from "../types";

interface UserTableProps {
  users: any[];
  total: number;
  loading: boolean;
  currentPage: number;
  totalPages: number;
  pageSize: number;
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

function getPaginationPages(current: number, total: number): (number | "…")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages: (number | "…")[] = [1];
  if (current > 3) pages.push("…");
  for (let p = Math.max(2, current - 1); p <= Math.min(total - 1, current + 1); p++) {
    pages.push(p);
  }
  if (current < total - 2) pages.push("…");
  pages.push(total);
  return pages;
}

// ── Vista móvil: tarjetas ──────────────────────────────────────────────────────

function UserCard({ usuario, onEdit, onDelete, onEmailChange }: {
  usuario: any;
  onEdit: (id: string) => void;
  onDelete: (u: { id: string; name: string; email: string }) => void;
  onEmailChange: (u: { id: string; email: string; name: string }) => void;
}) {
  return (
    <div className="bg-background border rounded-xl p-4 space-y-3">
      {/* Header: avatar + nombre + acciones */}
      <div className="flex items-start gap-3">
        <Avatar className="w-11 h-11 shrink-0">
          <AvatarImage src={usuario.avatar_url || "/placeholder.svg"} alt={usuario.full_name || "Usuario"} />
          <AvatarFallback className="text-sm font-medium">{getInitials(usuario.full_name)}</AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm text-foreground truncate">
            {usuario.full_name || "Sin nombre"}
          </p>
          <p className="text-xs text-muted-foreground truncate">{usuario.email}</p>
          <ConditionBadges
            conditions={(usuario as any).conditions?.map((c: any) => c.learning_condition)}
          />
        </div>

        {/* Acciones compactas */}
        <div className="flex gap-0.5 shrink-0">
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" title="Cambiar correo"
            onClick={() => onEmailChange({ id: usuario.id, email: usuario.email || "", name: usuario.full_name || "Usuario" })}>
            <Mail className="w-3.5 h-3.5" />
          </Button>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" title="Editar"
            onClick={() => onEdit(usuario.id)}>
            <Edit className="w-3.5 h-3.5" />
          </Button>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50"
            title="Eliminar"
            onClick={() => onDelete({ id: usuario.id, name: usuario.full_name || "Usuario", email: usuario.email || "" })}>
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      {/* Info secundaria */}
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
        {usuario.phone && (
          <span className="flex items-center gap-1">
            <Phone className="w-3 h-3" />
            {usuario.phone}
          </span>
        )}
        {usuario.document_number && (
          <span className="flex items-center gap-1">
            <CreditCard className="w-3 h-3" />
            {usuario.document_type} {usuario.document_number}
          </span>
        )}
      </div>

      {/* Roles */}
      {usuario.roles?.length > 0 ? (
        <div className="flex flex-wrap gap-1">
          {usuario.roles.map((role: any) => (
            <Badge key={role.id} variant="outline" className={`text-xs ${getRoleBadgeColor(role.name)}`}>
              {role.name}
            </Badge>
          ))}
        </div>
      ) : (
        <Badge variant="outline" className="text-xs bg-gray-50 text-gray-400">Sin rol</Badge>
      )}
    </div>
  );
}

// ── Paginación compartida ──────────────────────────────────────────────────────

function Pagination({ currentPage, totalPages, total, pageSize, onPageChange }: {
  currentPage: number;
  totalPages: number;
  total: number;
  pageSize: number;
  onPageChange: (p: number) => void;
}) {
  if (totalPages <= 1) return null;
  const start = (currentPage - 1) * pageSize + 1;
  const end   = Math.min(currentPage * pageSize, total);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-2 px-1 pt-1">
      <p className="text-xs text-muted-foreground order-2 sm:order-1">
        Mostrando <strong>{start}–{end}</strong> de <strong>{total}</strong> usuarios
      </p>

      <div className="flex items-center gap-1 order-1 sm:order-2">
        <Button variant="outline" size="sm" className="h-8 px-2"
          onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1}>
          <ChevronLeft className="w-4 h-4" />
        </Button>

        {getPaginationPages(currentPage, totalPages).map((p, i) =>
          p === "…" ? (
            <span key={`e${i}`} className="px-1.5 text-xs text-muted-foreground select-none">…</span>
          ) : (
            <Button
              key={p}
              variant={currentPage === p ? "default" : "outline"}
              size="sm"
              className="h-8 w-8 p-0 text-xs"
              onClick={() => onPageChange(p as number)}
            >
              {p}
            </Button>
          ),
        )}

        <Button variant="outline" size="sm" className="h-8 px-2"
          onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages}>
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

// ── Componente principal ───────────────────────────────────────────────────────

export function UserTable({
  users, total, loading, currentPage, totalPages, pageSize,
  onPageChange, onEdit, onDelete, onEmailChange,
}: UserTableProps) {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3 text-muted-foreground">
        <Loader2 className="w-8 h-8 animate-spin" />
        <p className="text-sm">Cargando usuarios...</p>
      </div>
    );
  }

  if (total === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <Users className="w-12 h-12 mx-auto mb-2 opacity-40" />
        <p className="text-sm">No se encontraron usuarios</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* ── Mobile: tarjetas ── */}
      <div className="flex flex-col gap-3 md:hidden">
        {users.map((usuario) => (
          <UserCard
            key={usuario.id}
            usuario={usuario}
            onEdit={onEdit}
            onDelete={onDelete}
            onEmailChange={onEmailChange}
          />
        ))}
      </div>

      {/* ── Desktop: tabla ── */}
      <div className="hidden md:block rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-14">Foto</TableHead>
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
                  <Avatar className="w-9 h-9">
                    <AvatarImage src={usuario.avatar_url || "/placeholder.svg"} alt={usuario.full_name || "Usuario"} />
                    <AvatarFallback className="text-xs">{getInitials(usuario.full_name)}</AvatarFallback>
                  </Avatar>
                </TableCell>
                <TableCell className="font-medium">
                  <div className="space-y-1">
                    <span>{usuario.full_name || "Sin nombre"}</span>
                    <ConditionBadges
                      conditions={(usuario as any).conditions?.map((c: any) => c.learning_condition)}
                    />
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">{usuario.email}</TableCell>
                <TableCell className="text-muted-foreground text-sm">{usuario.phone || "—"}</TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {usuario.document_type && usuario.document_number
                    ? `${usuario.document_type} ${usuario.document_number}`
                    : "—"}
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {usuario.roles?.length > 0 ? (
                      usuario.roles.map((role: any) => (
                        <Badge key={role.id} variant="outline" className={`text-xs ${getRoleBadgeColor(role.name)}`}>
                          {role.name}
                        </Badge>
                      ))
                    ) : (
                      <Badge variant="outline" className="text-xs bg-gray-50 text-gray-400">Sin rol</Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm" title="Cambiar correo"
                    onClick={() => onEmailChange({ id: usuario.id, email: usuario.email || "", name: usuario.full_name || usuario.email || "Usuario" })}>
                    <Mail className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" title="Editar usuario" onClick={() => onEdit(usuario.id)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" title="Eliminar usuario"
                    className="text-red-500 hover:text-red-600 hover:bg-red-50"
                    onClick={() => onDelete({ id: usuario.id, name: usuario.full_name || usuario.email || "Usuario", email: usuario.email || "" })}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Paginación (compartida) */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        total={total}
        pageSize={pageSize}
        onPageChange={onPageChange}
      />
    </div>
  );
}
