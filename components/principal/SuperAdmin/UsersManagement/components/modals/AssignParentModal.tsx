"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, UserPlus, UserX, Users } from "lucide-react";
import { toast } from "sonner";

import {
  ParentHasStudentStore,
  type ParentHasStudent,
} from "@/Stores/ParentHasStudentStore";
import { ProfilesStore, type Profile } from "@/Stores/profilesStore";

interface AssignParentModalProps {
  open: boolean;
  onClose: () => void;
  studentId: string;
  studentName: string;
}

interface AssignedItem {
  relation: ParentHasStudent;
  profile: Profile;
}

export function AssignParentModal({
  open,
  onClose,
  studentId,
  studentName,
}: AssignParentModalProps) {
  const [search, setSearch] = useState("");
  const [assigning, setAssigning] = useState<string | null>(null);
  const [removing, setRemoving] = useState<string | null>(null);

  const relations = ParentHasStudentStore((s) => s.relations);
  const relationsLoading = ParentHasStudentStore((s) => s.loading);
  const fetchRelations = ParentHasStudentStore((s) => s.fetchRelations);
  const addRelation = ParentHasStudentStore((s) => s.addRelation);
  const deleteRelation = ParentHasStudentStore((s) => s.deleteRelation);

  const profiles = ProfilesStore((s) => s.profiles);
  const profilesLoading = ProfilesStore((s) => s.loading);
  const fetchProfiles = ProfilesStore((s) => s.fetchProfiles);

  useEffect(() => {
    if (!open) return;
    fetchRelations();
    fetchProfiles();
    setSearch("");
  }, [open]);

  // relaciones de este estudiante
  const assignedRelations = useMemo(
    () => relations.filter((r) => r.student_id === studentId),
    [relations, studentId]
  );

  const assignedParentIds = useMemo(
    () =>
      new Set(
        assignedRelations
          .map((r) => r.parent_id)
          .filter(Boolean) as string[]
      ),
    [assignedRelations]
  );

  // usuarios disponibles (no asignados aún), filtrados por búsqueda
  const availableParents = useMemo(() => {
    const q = search.toLowerCase();
    return profiles.filter(
      (p) =>
        p.id !== studentId &&
        !assignedParentIds.has(p.id) &&
        (p.full_name?.toLowerCase().includes(q) ||
          p.email?.toLowerCase().includes(q))
    );
  }, [profiles, assignedParentIds, studentId, search]);

  // padres ya asignados con su perfil
  const assignedParents = useMemo<AssignedItem[]>(
    () =>
      assignedRelations
        .map((r) => ({
          relation: r,
          profile: profiles.find((p) => p.id === r.parent_id),
        }))
        .filter((item): item is AssignedItem => !!item.profile),
    [assignedRelations, profiles]
  );

  const handleAssign = async (parentId: string) => {
    setAssigning(parentId);
    try {
      await addRelation({
        id: crypto.randomUUID(),
        parent_id: parentId,
        student_id: studentId,
        updated_at: new Date().toISOString(),
      });
      toast.success("Padre asignado correctamente");
    } catch {
      toast.error("Error al asignar padre");
    } finally {
      setAssigning(null);
    }
  };

  const handleRemove = async (relationId: string) => {
    setRemoving(relationId);
    try {
      await deleteRelation(relationId);
      toast.success("Padre desvinculado");
    } catch {
      toast.error("Error al desvincular padre");
    } finally {
      setRemoving(null);
    }
  };

  const isLoading = profilesLoading || relationsLoading;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-3xl w-full p-0 overflow-hidden gap-0">
        {/* Header */}
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <DialogTitle className="flex items-center gap-2 text-base">
            <Users className="w-5 h-5 text-primary shrink-0" />
            <span>Asignar Padres —</span>
            <span className="text-primary font-bold truncate">
              {studentName}
            </span>
          </DialogTitle>
        </DialogHeader>

        {/* Mobile: tabs */}
        <div className="block sm:hidden">
          <Tabs defaultValue="available" className="w-full">
            <TabsList className="w-full rounded-none border-b h-10">
              <TabsTrigger value="available" className="flex-1 text-sm">
                Disponibles
              </TabsTrigger>
              <TabsTrigger value="assigned" className="flex-1 text-sm">
                Asignados
                {assignedParents.length > 0 && (
                  <span className="ml-1.5 bg-primary text-primary-foreground rounded-full text-xs px-1.5 py-0.5 leading-none">
                    {assignedParents.length}
                  </span>
                )}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="available" className="m-0 p-4">
              <AvailableList
                parents={availableParents}
                search={search}
                onSearchChange={setSearch}
                onAssign={handleAssign}
                assigning={assigning}
                loading={isLoading}
              />
            </TabsContent>

            <TabsContent value="assigned" className="m-0 p-4">
              <AssignedList
                parents={assignedParents}
                onRemove={handleRemove}
                removing={removing}
                loading={isLoading}
              />
            </TabsContent>
          </Tabs>
        </div>

        {/* Desktop: two columns */}
        <div className="hidden sm:grid sm:grid-cols-2 divide-x min-h-[380px]">
          <div className="p-5 flex flex-col gap-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Padres disponibles
            </p>
            <AvailableList
              parents={availableParents}
              search={search}
              onSearchChange={setSearch}
              onAssign={handleAssign}
              assigning={assigning}
              loading={isLoading}
            />
          </div>

          <div className="p-5 flex flex-col gap-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
              Padres asignados
              {assignedParents.length > 0 && (
                <span className="bg-primary text-primary-foreground rounded-full text-xs px-1.5 py-0.5 leading-none font-normal">
                  {assignedParents.length}
                </span>
              )}
            </p>
            <AssignedList
              parents={assignedParents}
              onRemove={handleRemove}
              removing={removing}
              loading={isLoading}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t flex justify-end">
          <Button variant="outline" size="sm" onClick={onClose}>
            Cerrar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* ── Sub-componente: lista de padres disponibles ── */

interface AvailableListProps {
  parents: Profile[];
  search: string;
  onSearchChange: (v: string) => void;
  onAssign: (parentId: string) => void;
  assigning: string | null;
  loading: boolean;
}

function AvailableList({
  parents,
  search,
  onSearchChange,
  onAssign,
  assigning,
  loading,
}: AvailableListProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
        <Input
          placeholder="Buscar por nombre o correo..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9"
        />
      </div>

      <ScrollArea className="h-64">
        {loading ? (
          <LoadingSkeletons count={4} />
        ) : parents.length === 0 ? (
          <EmptyState
            icon={<Search className="w-7 h-7 opacity-30" />}
            title={search ? "Sin resultados" : "Sin padres disponibles"}
            description={
              search
                ? "Intenta con otro nombre o correo"
                : "Todos los padres ya están asignados"
            }
          />
        ) : (
          <div className="space-y-1.5 pr-2">
            {parents.map((p) => (
              <div
                key={p.id}
                className="flex items-center gap-3 p-2 rounded-lg border hover:bg-muted/50 transition-colors"
              >
                <Avatar className="w-9 h-9 shrink-0">
                  <AvatarImage src={p.avatar_url || "/placeholder.svg"} />
                  <AvatarFallback>
                    {p.full_name?.charAt(0)?.toUpperCase() || "P"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {p.full_name || "Sin nombre"}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {p.email}
                  </p>
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  className="shrink-0 h-8 w-8 hover:text-primary hover:bg-primary/10"
                  onClick={() => onAssign(p.id)}
                  disabled={assigning === p.id}
                  title="Asignar padre"
                >
                  {assigning === p.id ? (
                    <Spinner />
                  ) : (
                    <UserPlus className="w-4 h-4" />
                  )}
                </Button>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}

/* ── Sub-componente: lista de padres asignados ── */

interface AssignedListProps {
  parents: AssignedItem[];
  onRemove: (relationId: string) => void;
  removing: string | null;
  loading: boolean;
}

function AssignedList({
  parents,
  onRemove,
  removing,
  loading,
}: AssignedListProps) {
  if (loading) {
    return <LoadingSkeletons count={3} />;
  }

  if (parents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-muted-foreground gap-3">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
          <Users className="w-8 h-8 opacity-30" />
        </div>
        <div className="text-center space-y-1">
          <p className="text-sm font-medium">Sin padres asignados</p>
          <p className="text-xs opacity-60">
            Selecciona un padre desde la lista
          </p>
        </div>
      </div>
    );
  }

  return (
    <ScrollArea className="h-64">
      <div className="space-y-1.5 pr-2">
        {parents.map(({ relation, profile }) => (
          <div
            key={relation.id}
            className="flex items-center gap-3 p-2 rounded-lg border border-primary/20 bg-primary/5"
          >
            <Avatar className="w-9 h-9 shrink-0">
              <AvatarImage src={profile.avatar_url || "/placeholder.svg"} />
              <AvatarFallback>
                {profile.full_name?.charAt(0)?.toUpperCase() || "P"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {profile.full_name || "Sin nombre"}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {profile.email}
              </p>
            </div>
            <Button
              size="icon"
              variant="ghost"
              className="shrink-0 h-8 w-8 hover:text-destructive hover:bg-destructive/10"
              onClick={() => onRemove(relation.id)}
              disabled={removing === relation.id}
              title="Desvincular padre"
            >
              {removing === relation.id ? (
                <Spinner className="border-destructive" />
              ) : (
                <UserX className="w-4 h-4" />
              )}
            </Button>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}

/* ── Helpers ── */

function LoadingSkeletons({ count }: { count: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} className="h-[52px] rounded-lg" />
      ))}
    </div>
  );
}

function EmptyState({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center h-48 text-muted-foreground gap-2">
      {icon}
      <p className="text-sm font-medium">{title}</p>
      <p className="text-xs opacity-60">{description}</p>
    </div>
  );
}

function Spinner({ className = "" }: { className?: string }) {
  return (
    <span
      className={`block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin ${className}`}
    />
  );
}
