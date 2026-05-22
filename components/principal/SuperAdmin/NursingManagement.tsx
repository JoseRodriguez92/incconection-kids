"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Stethoscope, ClipboardList, Users, Bell } from "lucide-react";
import { NursingDashboard } from "@/components/principal/Enfermeria/NursingDashboard";
import { NursingPerfiles } from "@/components/principal/Enfermeria/NursingPerfiles";
import { NursingNotificaciones } from "@/components/principal/Enfermeria/NursingNotificaciones";

export default function NursingManagement() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-teal-100 flex items-center justify-center shrink-0">
          <Stethoscope className="w-6 h-6 text-teal-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-foreground">Gestión de Enfermería</h2>
          <p className="text-sm text-muted-foreground">Atenciones, perfiles de salud y notificaciones a padres</p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="atenciones" className="w-full">
        <TabsList className="grid w-full grid-cols-3 sm:w-auto sm:inline-flex">
          <TabsTrigger value="atenciones" className="gap-1.5 text-xs sm:text-sm px-3">
            <ClipboardList className="w-4 h-4 shrink-0" />
            <span className="sm:hidden">Atenciones</span>
            <span className="hidden sm:inline">Atenciones</span>
          </TabsTrigger>
          <TabsTrigger value="perfiles" className="gap-1.5 text-xs sm:text-sm px-3">
            <Users className="w-4 h-4 shrink-0" />
            <span className="sm:hidden">Perfiles</span>
            <span className="hidden sm:inline">Perfiles de Salud</span>
          </TabsTrigger>
          <TabsTrigger value="notificaciones" className="gap-1.5 text-xs sm:text-sm px-3">
            <Bell className="w-4 h-4 shrink-0" />
            <span className="sm:hidden">Notif.</span>
            <span className="hidden sm:inline">Notificaciones</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="atenciones" className="mt-4">
          <div className="rounded-xl border bg-card overflow-hidden" style={{ height: "calc(100vh - 220px)" }}>
            <NursingDashboard />
          </div>
        </TabsContent>

        <TabsContent value="perfiles" className="mt-4">
          <div className="rounded-xl border bg-card overflow-hidden" style={{ height: "calc(100vh - 220px)" }}>
            <NursingPerfiles />
          </div>
        </TabsContent>

        <TabsContent value="notificaciones" className="mt-4">
          <div className="rounded-xl border bg-card overflow-hidden" style={{ height: "calc(100vh - 220px)" }}>
            <NursingNotificaciones />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
