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
  Stethoscope,
  ClipboardList,
  UserCircle,
  Bell,
  Menu,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const enfermeriaMenu: MenuCategory[] = [
  {
    id: "inicio",
    label: "Inicio",
    icon: Home,
    items: [
      { id: "inicio", label: "Inicio", icon: Home, href: "/usuario/enfermeria" },
    ],
  },
  {
    id: "nueva-atencion",
    label: "Nueva Atención",
    icon: Stethoscope,
    items: [
      {
        id: "nueva-atencion",
        label: "Nueva Atención",
        icon: Stethoscope,
        href: "/usuario/enfermeria/nueva-atencion",
      },
    ],
  },
  {
    id: "historial",
    label: "Historial",
    icon: ClipboardList,
    items: [
      {
        id: "historial",
        label: "Historial",
        icon: ClipboardList,
        href: "/usuario/enfermeria/historial",
      },
    ],
  },
  {
    id: "perfiles",
    label: "Perfiles de salud",
    icon: UserCircle,
    items: [
      {
        id: "perfiles",
        label: "Perfiles de salud",
        icon: UserCircle,
        href: "/usuario/enfermeria/perfiles",
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
        href: "/usuario/enfermeria/notificaciones",
      },
    ],
  },
];

export default function EnfermeriaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isExpanded, setIsExpanded] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const activeView =
    enfermeriaMenu
      .flatMap((c) => c.items ?? [])
      .filter(
        (item) =>
          pathname === item.href || pathname.startsWith(item.href + "/"),
      )
      .sort((a, b) => b.href.length - a.href.length)[0]?.id ?? "inicio";

  const handleMenuItemClick = (id: string) => {
    const item = enfermeriaMenu
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
        menuCategories={enfermeriaMenu}
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
