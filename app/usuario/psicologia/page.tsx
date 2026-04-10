"use client";

import Link from "next/link";
import { Brain, HeartHandshake, Calendar, Newspaper, TicketCheck, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const sections = [
  {
    href: "/usuario/psicologia/casos",
    icon: Brain,
    label: "Casos Psicológicos",
    description: "Gestiona casos, sesiones, seguimientos y reuniones",
    color: "text-purple-600",
    bg: "bg-purple-500/10",
  },
  {
    href: "/usuario/psicologia/condiciones-aprendizaje",
    icon: HeartHandshake,
    label: "Condiciones de Aprendizaje",
    description: "Administra el catálogo de condiciones del colegio",
    color: "text-violet-600",
    bg: "bg-violet-500/10",
  },
  {
    href: "/usuario/psicologia/eventos",
    icon: Calendar,
    label: "Eventos",
    description: "Consulta y gestiona eventos del período académico",
    color: "text-blue-600",
    bg: "bg-blue-500/10",
  },
  {
    href: "/usuario/psicologia/circulares",
    icon: Newspaper,
    label: "Circulares",
    description: "Envía comunicados a padres de familia",
    color: "text-emerald-600",
    bg: "bg-emerald-500/10",
  },
  {
    href: "/usuario/psicologia/tickets",
    icon: TicketCheck,
    label: "Soporte",
    description: "Reporta y gestiona tickets de soporte",
    color: "text-amber-600",
    bg: "bg-amber-500/10",
  },
];

export default function PsicologiaPage() {
  return (
    <div className="min-w-0 w-full bg-transparent">
      {/* Header */}
      <div className="bg-linear-to-r from-primary/10 via-primary/5 to-transparent border-b px-6 py-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-primary/15 rounded-xl">
            <Brain className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Módulo de Psicología
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Bienvenido — selecciona una sección para comenzar
            </p>
          </div>
        </div>
      </div>

      {/* Grid de accesos */}
      <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {sections.map(({ href, icon: Icon, label, description, color, bg }) => (
          <Link key={href} href={href} className="group">
            <Card className="h-full border hover:shadow-md hover:border-primary/30 transition-all duration-200">
              <CardContent className="p-5 flex flex-col gap-3 h-full">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${bg} shrink-0`}>
                  <Icon className={`w-5 h-5 ${color}`} />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground leading-tight">{label}</h3>
                  <p className="text-sm text-muted-foreground mt-1 leading-snug">{description}</p>
                </div>
                <div className={`flex items-center gap-1 text-xs font-medium ${color} opacity-0 group-hover:opacity-100 transition-opacity`}>
                  Ir a la sección
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
