"use client";

import type React from "react";
import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import "./globals.css";
import {
  Sidebar,
  type MenuCategory,
} from "@/components/principal/SuperAdmin/Sidebar";
import {
  Home,
  BookOpen,
  Calendar,
  Users,
  Bell,
  User,
  Clock,
  DoorOpen,
  TicketCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";

const profesorMenu: MenuCategory[] = [
  {
    id: "inicio",
    label: "Inicio",
    icon: Home,
    items: [
      { id: "inicio", label: "Inicio", icon: Home, href: "/usuario/profesor" },
    ],
  },
  {
    id: "clases",
    label: "Clases",
    icon: BookOpen,
    items: [
      {
        id: "clases",
        label: "Clases",
        icon: BookOpen,
        href: "/usuario/profesor/clases",
      },
    ],
  },
  {
    id: "horario",
    label: "Horario",
    icon: Clock,
    items: [
      {
        id: "horario",
        label: "Horario",
        icon: Clock,
        href: "/usuario/profesor/horario",
      },
    ],
  },
  {
    id: "grupos-escolares",
    label: "Grupos Escolares",
    icon: Users,
    items: [
      {
        id: "grupos-escolares",
        label: "Grupos Escolares",
        icon: Users,
        href: "/usuario/profesor/grupos-escolares",
      },
    ],
  },
  {
    id: "director-grupo",
    label: "Director de Grupo",
    icon: DoorOpen,
    items: [
      {
        id: "director-grupo",
        label: "Director de Grupo",
        icon: DoorOpen,
        href: "/usuario/profesor/director-grupo",
      },
    ],
  },
  {
    id: "separar-aulas",
    label: "Separar Aulas",
    icon: DoorOpen,
    items: [
      {
        id: "separar-aulas",
        label: "Separar Aulas",
        icon: DoorOpen,
        href: "/usuario/profesor/separar-aulas",
      },
    ],
  },
  {
    id: "eventos",
    label: "Eventos",
    icon: Calendar,
    items: [
      {
        id: "eventos",
        label: "Eventos",
        icon: Calendar,
        href: "/usuario/profesor/eventos",
      },
    ],
  },
  {
    id: "notificaciones",
    label: "Notificaciones",
    icon: Bell,
    items: [
      {
        id: "notificaciones",
        label: "Notificaciones",
        icon: Bell,
        href: "/usuario/profesor/notificaciones",
      },
    ],
  },
  {
    id: "tickets",
    label: "Soporte",
    icon: TicketCheck,
    items: [
      {
        id: "tickets",
        label: "Soporte",
        icon: TicketCheck,
        href: "/usuario/profesor/tickets",
      },
    ],
  },
];

export default function ProfesorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isExpanded, setIsExpanded] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const activeView =
    profesorMenu
      .flatMap((c) => c.items ?? [])
      .filter(
        (item) =>
          pathname === item.href || pathname.startsWith(item.href + "/"),
      )
      .sort((a, b) => b.href.length - a.href.length)[0]?.id ?? "inicio";

  const handleMenuItemClick = (id: string) => {
    const item = profesorMenu
      .flatMap((c) => c.items ?? [])
      .find((i) => i.id === id);
    if (item?.href) router.push(item.href);
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="flex h-dvh w-full overflow-hidden">
      <Sidebar
        isExpanded={isExpanded}
        isMobileMenuOpen={isMobileMenuOpen}
        activeView={activeView}
        onMenuItemClick={handleMenuItemClick}
        onToggleExpanded={() => setIsExpanded((v) => !v)}
        onCloseMobileMenu={() => setIsMobileMenuOpen(false)}
        menuCategories={profesorMenu}
      />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-transparent">
        <header className="p-4 border-b border-border/40 bg-background/60 backdrop-blur-sm lg:hidden">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <Menu className="w-5 h-5" />
          </Button>
        </header>
        <main className="flex-1 overflow-auto w-full bg-transparent">
          {children}
        </main>
      </div>
    </div>
  );
}
