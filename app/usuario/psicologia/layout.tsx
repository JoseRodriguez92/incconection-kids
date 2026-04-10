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
  Brain,
  HeartHandshake,
  Calendar,
  Newspaper,
  TicketCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";

const psicologiaMenu: MenuCategory[] = [
  {
    id: "inicio",
    label: "Inicio",
    icon: Home,
    items: [
      { id: "inicio", label: "Inicio", icon: Home, href: "/usuario/psicologia" },
    ],
  },
  {
    id: "casos",
    label: "Casos Psicológicos",
    icon: Brain,
    items: [
      {
        id: "casos",
        label: "Casos Psicológicos",
        icon: Brain,
        href: "/usuario/psicologia/casos",
      },
    ],
  },
  {
    id: "condiciones-aprendizaje",
    label: "Condiciones de Aprendizaje",
    icon: HeartHandshake,
    items: [
      {
        id: "condiciones-aprendizaje",
        label: "Condiciones de Aprendizaje",
        icon: HeartHandshake,
        href: "/usuario/psicologia/condiciones-aprendizaje",
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
        href: "/usuario/psicologia/eventos",
      },
    ],
  },
  {
    id: "circulares",
    label: "Circulares",
    icon: Newspaper,
    items: [
      {
        id: "circulares",
        label: "Circulares",
        icon: Newspaper,
        href: "/usuario/psicologia/circulares",
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
        href: "/usuario/psicologia/tickets",
      },
    ],
  },
];

export default function PsicologiaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isExpanded, setIsExpanded] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const activeView =
    psicologiaMenu
      .flatMap((c) => c.items ?? [])
      .filter(
        (item) =>
          pathname === item.href || pathname.startsWith(item.href + "/"),
      )
      .sort((a, b) => b.href.length - a.href.length)[0]?.id ?? "inicio";

  const handleMenuItemClick = (id: string) => {
    const item = psicologiaMenu
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
        menuCategories={psicologiaMenu}
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
