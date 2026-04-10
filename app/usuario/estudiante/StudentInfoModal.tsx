"use client";

import type * as React from "react";
import {
  Mail,
  Phone,
  FileText,
  User,
  GraduationCap,
  CalendarDays,
  LayersIcon,
  BookOpen,
  Users,
  BadgeCheck,
  Fingerprint,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useStudentContextStore } from "@/Stores/studentContextStore";

interface StudentInfoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function getInitials(name?: string | null) {
  if (!name) return "?";
  return name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();
}

const TAB_CLS =
  "text-xs rounded-none border-b-2 border-transparent data-[state=active]:border-[#343c63] data-[state=active]:text-[#343c63] data-[state=active]:bg-transparent data-[state=active]:shadow-none font-medium";

export function StudentInfoModal({ open, onOpenChange }: StudentInfoModalProps) {
  const { profile, parents, activePeriod, group, course, director } =
    useStudentContextStore();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px] p-0 overflow-hidden max-h-[90vh] flex flex-col gap-0">

        {/* ── Hero ── */}
        <div className="relative bg-gradient-to-br from-[#343c63] to-[#5561a0] px-6 pt-8 pb-5">
          <DialogHeader className="sr-only">
            <DialogTitle>Mi información</DialogTitle>
          </DialogHeader>
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16 ring-4 ring-white/25 shrink-0">
              <AvatarImage src={profile?.avatar_url || ""} alt={profile?.full_name || ""} />
              <AvatarFallback className="text-lg font-bold bg-white/20 text-white">
                {getInitials(profile?.full_name)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="text-white font-bold text-base leading-tight truncate">
                {profile?.full_name ?? "—"}
              </p>
              {(course || group) && (
                <p className="text-white/65 text-xs mt-0.5 truncate">
                  {course?.name}{group?.name ? ` · ${group.name}` : ""}
                </p>
              )}
              <div className="flex flex-wrap gap-1.5 mt-2">
                {activePeriod && (
                  <Chip icon={<CalendarDays className="h-2.5 w-2.5" />} label={activePeriod.name} />
                )}
                {profile?.email && (
                  <Chip icon={<Mail className="h-2.5 w-2.5" />} label={profile.email} />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ── Tabs ── */}
        <Tabs defaultValue="general" className="flex flex-col flex-1 min-h-0">
          <TabsList className="grid grid-cols-4 rounded-none border-b bg-background h-10 shrink-0 px-0">
            <TabsTrigger value="general"   className={TAB_CLS}>General</TabsTrigger>
            <TabsTrigger value="academico" className={TAB_CLS}>Académico</TabsTrigger>
            <TabsTrigger value="padres"    className={TAB_CLS}>Padres</TabsTrigger>
            <TabsTrigger value="director"  className={TAB_CLS}>Director</TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-y-auto bg-muted/20">

            {/* ── General ── */}
            <TabsContent value="general" className="p-4 space-y-3 mt-0">
              {/* Mini tarjeta de identidad */}
              <div className="rounded-2xl overflow-hidden border bg-background">
                <div className="flex items-center gap-4 px-5 py-4 border-b bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30">
                  <Avatar className="h-12 w-12 ring-2 ring-white shadow-sm shrink-0">
                    <AvatarImage src={profile?.avatar_url || ""} alt={profile?.full_name || ""} />
                    <AvatarFallback className="font-bold bg-[#343c63] text-white text-sm">
                      {getInitials(profile?.full_name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="font-semibold text-sm truncate">{profile?.full_name ?? "—"}</p>
                    <p className="text-xs text-muted-foreground truncate">{profile?.email ?? "—"}</p>
                  </div>
                </div>
                <div className="divide-y">
                  <InfoRow icon={<User className="h-3.5 w-3.5" />}        color="bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400"   label="Nombre"              value={profile?.first_name ?? "—"} />
                  <InfoRow icon={<User className="h-3.5 w-3.5" />}        color="bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400"   label="Apellido"            value={profile?.last_name ?? "—"} />
                  <InfoRow icon={<Phone className="h-3.5 w-3.5" />}       color="bg-green-100 text-green-600 dark:bg-green-950 dark:text-green-400" label="Teléfono"            value={profile?.phone ?? "—"} />
                  <InfoRow icon={<Fingerprint className="h-3.5 w-3.5" />} color="bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-400" label="Tipo de documento"   value={profile?.document_type ?? "—"} />
                  <InfoRow icon={<BadgeCheck className="h-3.5 w-3.5" />}  color="bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-400" label="N.° de documento"    value={profile?.document_number ?? "—"} />
                </div>
              </div>
            </TabsContent>

            {/* ── Académico ── */}
            <TabsContent value="academico" className="p-4 space-y-3 mt-0">
              <div className="rounded-2xl overflow-hidden border bg-background">
                {/* Banner académico */}
                <div className="px-5 py-4 border-b bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center shrink-0">
                    <BookOpen className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{course?.name ?? "Sin curso"}</p>
                    <p className="text-xs text-muted-foreground">{group?.name ? `Grupo ${group.name}` : "Sin grupo asignado"}</p>
                  </div>
                </div>
                <div className="divide-y">
                  <InfoRow icon={<CalendarDays className="h-3.5 w-3.5" />} color="bg-purple-100 text-purple-600 dark:bg-purple-950 dark:text-purple-400" label="Periodo activo" value={activePeriod?.name ?? "—"} />
                  <InfoRow icon={<BookOpen className="h-3.5 w-3.5" />}     color="bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400" label="Curso"    value={course?.name ?? "—"} />
                  <InfoRow icon={<LayersIcon className="h-3.5 w-3.5" />}   color="bg-teal-100 text-teal-600 dark:bg-teal-950 dark:text-teal-400"             label="Grupo"    value={group?.name ?? "—"} />
                </div>
              </div>
            </TabsContent>

            {/* ── Padres ── */}
            <TabsContent value="padres" className="p-4 mt-0">
              {parents.length === 0 ? (
                <Empty icon={<Users />} text="No hay padres o acudientes registrados" />
              ) : (
                <div className="space-y-3">
                  {parents.map((parent, i) => {
                    const ini = getInitials(parent.full_name);
                    const colors = [
                      "from-rose-50 to-pink-50 dark:from-rose-950/30 dark:to-pink-950/30",
                      "from-violet-50 to-purple-50 dark:from-violet-950/30 dark:to-purple-950/30",
                    ];
                    const avatarColors = ["bg-rose-500", "bg-violet-500"];
                    return (
                      <div key={parent.id} className="rounded-2xl overflow-hidden border bg-background">
                        <div className={`flex items-center gap-3 px-5 py-4 border-b bg-gradient-to-r ${colors[i % 2]}`}>
                          <Avatar className="h-12 w-12 ring-2 ring-white shadow-sm shrink-0">
                            <AvatarImage src={(parent as any).avatar_url || ""} alt={parent.full_name || ""} />
                            <AvatarFallback className={`font-bold text-sm text-white ${avatarColors[i % 2]}`}>
                              {ini}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <p className="font-semibold text-sm truncate">{parent.full_name ?? "—"}</p>
                            <span className="text-[10px] font-medium text-muted-foreground bg-background/60 px-2 py-0.5 rounded-full">
                              Acudiente
                            </span>
                          </div>
                        </div>
                        <div className="divide-y">
                          <InfoRow icon={<Mail className="h-3.5 w-3.5" />}  color="bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400"   label="Correo"   value={parent.email ?? "—"} />
                          <InfoRow icon={<Phone className="h-3.5 w-3.5" />} color="bg-green-100 text-green-600 dark:bg-green-950 dark:text-green-400" label="Teléfono" value={parent.phone ?? "—"} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </TabsContent>

            {/* ── Director ── */}
            <TabsContent value="director" className="p-4 mt-0">
              {!director ? (
                <Empty icon={<GraduationCap />} text="No hay director asignado al grupo" />
              ) : (
                <div className="space-y-3">
                  <div className="rounded-2xl overflow-hidden border bg-background">
                    <div className="flex items-center gap-4 px-5 py-4 border-b bg-gradient-to-r from-[#343c63]/8 to-[#5561a0]/8 dark:from-[#343c63]/30 dark:to-[#5561a0]/30">
                      <Avatar className="h-14 w-14 ring-2 ring-[#343c63]/20 shadow-sm shrink-0">
                        <AvatarImage src={director.avatar_url || ""} alt={director.full_name || ""} />
                        <AvatarFallback className="font-bold text-sm bg-[#343c63] text-white">
                          {getInitials(director.full_name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="font-semibold text-sm truncate">{director.full_name ?? "—"}</p>
                        <span className="inline-flex items-center gap-1 text-[10px] font-medium text-[#343c63] dark:text-blue-300 bg-[#343c63]/10 px-2 py-0.5 rounded-full mt-1">
                          <GraduationCap className="h-2.5 w-2.5" />
                          Director de grupo
                        </span>
                      </div>
                    </div>
                    <div className="divide-y">
                      <InfoRow icon={<Mail className="h-3.5 w-3.5" />}        color="bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400"     label="Correo"           value={director.email ?? "—"} />
                      <InfoRow icon={<Phone className="h-3.5 w-3.5" />}       color="bg-green-100 text-green-600 dark:bg-green-950 dark:text-green-400"  label="Teléfono"         value={director.phone ?? "—"} />
                      <InfoRow icon={<Fingerprint className="h-3.5 w-3.5" />} color="bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-400"  label="Tipo documento"   value={director.document_type ?? "—"} />
                      <InfoRow icon={<BadgeCheck className="h-3.5 w-3.5" />}  color="bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-400"  label="N.° documento"    value={director.document_number ?? "—"} />
                      <InfoRow icon={<LayersIcon className="h-3.5 w-3.5" />}  color="bg-teal-100 text-teal-600 dark:bg-teal-950 dark:text-teal-400"     label="Grupo"            value={group?.name ?? "—"} />
                      <InfoRow icon={<BookOpen className="h-3.5 w-3.5" />}    color="bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400" label="Curso" value={course?.name ?? "—"} />
                    </div>
                  </div>
                </div>
              )}
            </TabsContent>

          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

/* ── Auxiliares ─────────────────────────────────────────────────── */

function Chip({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/15 text-white/85 text-[10px] font-medium max-w-[160px]">
      {icon}
      <span className="truncate">{label}</span>
    </span>
  );
}

function InfoRow({
  icon,
  color,
  label,
  value,
}: {
  icon: React.ReactNode;
  color: string;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 hover:bg-muted/30 transition-colors">
      <span className={`shrink-0 w-7 h-7 rounded-lg flex items-center justify-center ${color}`}>
        {icon}
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] text-muted-foreground uppercase tracking-wide leading-none mb-0.5">{label}</p>
        <p className="text-sm font-medium truncate">{value}</p>
      </div>
    </div>
  );
}

function Empty({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex flex-col items-center gap-3 py-14 text-muted-foreground">
      <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center [&>svg]:w-7 [&>svg]:h-7 [&>svg]:opacity-40">
        {icon}
      </div>
      <p className="text-sm text-center max-w-[180px] leading-relaxed">{text}</p>
    </div>
  );
}
