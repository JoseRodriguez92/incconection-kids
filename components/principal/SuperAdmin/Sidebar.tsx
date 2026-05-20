"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Home, Users, Calendar, HelpCircle, School, Clock, Route, Brain,
  ShoppingCart, ChevronLeft, User, UserPlus, UserCheck, LogOut,
  FileText, CreditCard, Book, BookCheck, CalendarCheck, Building,
  GraduationCap, MessageCircle, Megaphone, Sparkles, Cross,
  Building2, DoorOpen, ChevronDown, HeartHandshake, BarChart2,
} from "lucide-react";
import type { MenuItem } from "./types";
import { ManagmentStorage } from "@/components/Services/ManagmentStorage/ManagmentStorage";
import { goToPath } from "@/components/function/RedirectHomeRoll/GoToPath";
import { createClient } from "@/lib/supabase/client";
import { UserInfoStore } from "@/Stores/UserInfoStore";
import { toast as sonnerToast } from "sonner";
import { ProfileDialog, roleConfig } from "./ProfileDialog";
import { InstituteSettingsDialog } from "./InstituteSettingsDialog";
import { InstituteStore } from "@/Stores/InstituteStore";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface MenuCategory {
  id: string;
  label: string;
  icon: any;
  items?: MenuItem[];
}

// ── Default nav categories ────────────────────────────────────────────────────

const defaultMenuCategories: MenuCategory[] = [
  {
    id: "inicio", label: "Inicio", icon: Home,
    items: [{ icon: Home, label: "Inicio", href: "/", id: "inicio" }],
  },
  {
    id: "usuarios", label: "Usuarios", icon: Users,
    items: [
      { icon: Users,     label: "Usuarios totales",    href: "/usuarios",    id: "usuarios"    },
      { icon: User,      label: "Roles",                href: "/roles",       id: "roles"       },
      { icon: UserPlus,  label: "Matricular",           href: "/matricular",  id: "matricular"  },
      { icon: UserCheck, label: "Lista de matriculados", href: "/matriculados", id: "matriculados" },
    ],
  },
  {
    id: "academico", label: "Académico", icon: GraduationCap,
    items: [
      { icon: CalendarCheck, label: "Periodo Académico", href: "/periodo-academico", id: "periodo-academico" },
      { icon: Building,      label: "Ciclos",            href: "/ciclos",            id: "ciclos"            },
      { icon: BookCheck,     label: "Materias",          href: "/materias",          id: "materias"          },
      { icon: Book,          label: "Cursos y grupos",   href: "/cursos",            id: "cursos"            },
      { icon: Clock,         label: "Horarios",          href: "/horarios",          id: "horarios"          },
      { icon: BarChart2,     label: "Resultados",        href: "/resultados",        id: "resultados"        },
    ],
  },
  {
    id: "comunicacion", label: "Comunicación", icon: Megaphone,
    items: [
      { icon: Calendar,    label: "Gestión de eventos", href: "/eventos",    id: "eventos"    },
      { icon: HelpCircle,  label: "Soporte y ayuda",    href: "/soporte",    id: "soporte"    },
      { icon: MessageCircle, label: "Circulares",       href: "/circulares", id: "circulares" },
    ],
  },
  {
    id: "estructura", label: "Estructura", icon: Building2,
    items: [
      { icon: Building2, label: "Edificio", href: "/edificios", id: "edificios" },
      { icon: DoorOpen,  label: "Aula",     href: "/aulas",     id: "aulas"     },
    ],
  },
  {
    id: "servicios", label: "Servicios", icon: Sparkles,
    items: [
      { icon: Route,         label: "Ruta",               href: "/rutas",                    id: "rutas"                    },
      { icon: Brain,         label: "Psicología",         href: "/psicologia",               id: "psicologia"               },
      { icon: Cross,         label: "Enfermería",         href: "/enfermeria",               id: "enfermeria"               },
      { icon: HeartHandshake, label: "Cond. Aprendizaje", href: "/condiciones-aprendizaje",  id: "condiciones-aprendizaje"  },
    ],
  },
  {
    id: "reportes", label: "Reportes", icon: FileText,
    items: [{ icon: FileText, label: "Reportes", href: "/reportes", id: "reportes" }],
  },
];

// ── Props ─────────────────────────────────────────────────────────────────────

interface SidebarProps {
  isExpanded: boolean;
  isMobileMenuOpen: boolean;
  activeView: string;
  onMenuItemClick: (itemId: string) => void;
  onToggleExpanded: () => void;
  onCloseMobileMenu: () => void;
  menuCategories?: MenuCategory[];
}

// ── Component ─────────────────────────────────────────────────────────────────

export function Sidebar({
  isExpanded,
  isMobileMenuOpen,
  activeView,
  onMenuItemClick,
  onToggleExpanded,
  onCloseMobileMenu,
  menuCategories,
}: SidebarProps) {
  const currentRole = UserInfoStore((s) => s.current_role);

  const rawCategories = menuCategories ?? defaultMenuCategories;
  const categories = rawCategories.map((cat) => ({
    ...cat,
    items: cat.items?.filter(
      (item) => !item.allowedRoles || (currentRole && item.allowedRoles.includes(currentRole as any)),
    ),
  }));

  const [isProfileOpen,    setIsProfileOpen]    = useState(false);
  const [isInstituteOpen,  setIsInstituteOpen]  = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<string[]>(["inicio"]);
  const [userDisplay, setUserDisplay] = useState({ nombre: "", apellido: "", avatar: "" });

  const instituteLogo = InstituteStore((s) => (s.institute as any)?.logo_url ?? "/logos/jqc_logo.png");
  const isSuperAdmin  = currentRole === "super-admin";

  const toggleCategory = (id: string) =>
    setExpandedCategories((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );

  const handleLogout = () => {
    const supabase = createClient();
    sonnerToast.promise(
      (async () => {
        await supabase.auth.signOut();
        UserInfoStore.getState().clear();
        ManagmentStorage.clear();
      })(),
      { loading: "Cerrando sesión...", success: "Sesión cerrada correctamente", error: "Error al cerrar sesión" },
    );
    goToPath("/");
  };

  // Load just the display data needed for the sidebar footer
  useEffect(() => {
    (async () => {
      const id = ManagmentStorage.getItem<string>("id_User");
      if (!id) return;
      const { data } = await createClient()
        .from("profiles")
        .select("first_name, last_name, full_name, avatar_url")
        .eq("id", id)
        .single();
      if (!data) return;
      let nombre  = data.first_name || "";
      let apellido = data.last_name  || "";
      if (!nombre && !apellido && data.full_name) {
        const p = data.full_name.split(" ");
        nombre   = p[0] || "Usuario";
        apellido = p.slice(1).join(" ") || "";
      }
      setUserDisplay({ nombre, apellido, avatar: data.avatar_url || "" });
    })();
  }, []);

  // ── Nav item shared styles ────────────────────────────────────────────────
  const activeStyle = { background: "#172554" };
  const navItemCls = (active: boolean) =>
    cn(
      "w-full flex items-center justify-start rounded-md px-3 py-2 text-sm font-medium transition-all duration-200 cursor-pointer",
      active ? "bg-blue-950 text-white" : "text-sidebar-foreground hover:bg-blue-950 hover:text-white",
    );

  const subItemCls = (active: boolean) =>
    cn(
      "w-full flex items-center justify-start rounded-md px-3 py-2 text-sm transition-all duration-200 cursor-pointer",
      active ? "bg-blue-950 text-white font-medium" : "text-sidebar-foreground/80 hover:bg-blue-950 hover:text-white",
    );

  // ── Footer ────────────────────────────────────────────────────────────────
  const FooterExpanded = () => (
    <div className="p-3 space-y-2">
      <div
        onClick={() => setIsProfileOpen(true)}
        className="flex items-start space-x-3 cursor-pointer hover:bg-sidebar-accent rounded-lg p-2 transition-colors"
      >
        <Avatar className="w-10 h-10">
          <AvatarImage src={userDisplay.avatar || "/placeholder.svg"} />
          <AvatarFallback className="text-sm">
            {userDisplay.nombre.charAt(0)}{userDisplay.apellido.charAt(0)}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold text-sidebar-foreground truncate">
            {userDisplay.nombre} {userDisplay.apellido}
          </div>
          <div className="text-xs text-sidebar-foreground/60 truncate mt-0.5">
            {roleConfig[currentRole ?? ""]?.label ?? currentRole ?? "—"}
          </div>
        </div>
      </div>
      <Button variant="ghost" onClick={handleLogout} size="sm"
        className="w-full flex items-center justify-start text-red-600 hover:text-red-700 hover:bg-red-50">
        <LogOut className="w-4 h-4 mr-2" />
        <span>Cerrar sesión</span>
      </Button>
    </div>
  );

  const FooterCollapsed = () => (
    <div className="p-2 space-y-2">
      <div onClick={() => setIsProfileOpen(true)}
        className="flex justify-center cursor-pointer hover:bg-sidebar-accent rounded-lg p-2 transition-colors">
        <Avatar className="w-8 h-8">
          <AvatarImage src={userDisplay.avatar || "/placeholder.svg"} />
          <AvatarFallback className="text-xs">
            {userDisplay.nombre.charAt(0)}{userDisplay.apellido.charAt(0)}
          </AvatarFallback>
        </Avatar>
      </div>
      <Button variant="ghost" onClick={handleLogout} size="sm"
        className="w-full flex items-center justify-center text-red-600 hover:text-red-700 hover:bg-red-50 px-2">
        <LogOut className="w-4 h-4" />
      </Button>
    </div>
  );

  // ── Nav list (reused for desktop + mobile) ────────────────────────────────
  const NavList = ({ mobile = false }) => (
    <ul className="space-y-1">
      {categories.map((category) => (
        <li key={category.id}>
          {category.items && category.items.length === 1 ? (
            <div
              onClick={() => { category.items && onMenuItemClick(category.items[0].id); if (mobile) onCloseMobileMenu(); }}
              className={navItemCls(!!category.items && activeView === category.items[0].id)}
              style={!!category.items && activeView === category.items[0].id ? activeStyle : undefined}
              onMouseEnter={(e) => { if (!!category.items && activeView !== category.items[0].id) e.currentTarget.style.background = "#172554"; }}
              onMouseLeave={(e) => { if (!!category.items && activeView !== category.items[0].id) e.currentTarget.style.background = ""; }}
            >
              <category.icon className="w-4 h-4" />
              {(isExpanded || mobile) && <span className="ml-3">{category.label}</span>}
            </div>
          ) : (
            <>
              <div
                onClick={() => toggleCategory(category.id)}
                className="w-full flex items-center justify-between rounded-md px-3 py-2 text-sm font-medium transition-all duration-200 cursor-pointer text-sidebar-foreground hover:bg-blue-900/50"
              >
                <div className="flex items-center">
                  <category.icon className="w-4 h-4" />
                  {(isExpanded || mobile) && <span className="ml-3">{category.label}</span>}
                </div>
                {(isExpanded || mobile) && (
                  <ChevronDown className={cn("w-4 h-4 transition-transform duration-200", expandedCategories.includes(category.id) && "rotate-180")} />
                )}
              </div>
              {expandedCategories.includes(category.id) && (isExpanded || mobile) && category.items && (
                <ul className="mt-1 space-y-1 ml-4">
                  {category.items.map((item) => (
                    <li key={item.id}>
                      <div
                        onClick={() => { onMenuItemClick(item.id); if (mobile) onCloseMobileMenu(); }}
                        className={subItemCls(activeView === item.id)}
                        style={activeView === item.id ? activeStyle : undefined}
                        onMouseEnter={(e) => { if (activeView !== item.id) e.currentTarget.style.background = "#172554"; }}
                        onMouseLeave={(e) => { if (activeView !== item.id) e.currentTarget.style.background = ""; }}
                      >
                        <item.icon className="w-3.5 h-3.5" />
                        <span className="ml-3">{item.label}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}
        </li>
      ))}
    </ul>
  );

  // ── JSX ───────────────────────────────────────────────────────────────────
  return (
    <>
      {/* Desktop Sidebar */}
      <aside className={cn(
        "bg-[#ffffff33] border-r border-sidebar-border transition-all duration-300 flex-col backdrop-blur-lg hidden lg:flex h-dvh",
        isExpanded ? "w-64" : "w-16",
      )}>
        {/* Header */}
        <div className="p-4 border-b border-sidebar-border flex items-center justify-between bg-white">
          {isExpanded && (
            <div
              className={cn("flex items-center space-x-3 w-full", isSuperAdmin && "cursor-pointer group")}
              onClick={() => isSuperAdmin && setIsInstituteOpen(true)}
              title={isSuperAdmin ? "Editar configuración del instituto" : undefined}
            >
              <div className="w-full rounded-lg flex items-center justify-center relative overflow-hidden">
                <img src={instituteLogo} alt="logo instituto" className="w-full" />
                {isSuperAdmin && (
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded-lg">
                    <span className="text-white text-[10px] font-medium">Editar</span>
                  </div>
                )}
              </div>
            </div>
          )}
          <Button variant="ghost" size="sm" onClick={onToggleExpanded}
            className="text-sidebar-foreground hover:bg-sidebar-accent">
            <ChevronLeft className={cn("w-4 h-4 transition-transform", !isExpanded && "rotate-180")} />
          </Button>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-2 overflow-y-auto">
          <NavList />
        </nav>

        {/* Footer */}
        <div className="border-t border-sidebar-border mt-auto">
          {isExpanded ? <FooterExpanded /> : <FooterCollapsed />}
        </div>
      </aside>

      {/* Mobile Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-sidebar border-r border-sidebar-border transition-transform duration-300 flex flex-col lg:hidden",
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full",
      )}>
        <div className="p-4 border-b border-sidebar-border flex items-center justify-between">
          <div
            className={cn("flex items-center space-x-3 w-full h-13", isSuperAdmin && "cursor-pointer")}
            onClick={() => isSuperAdmin && setIsInstituteOpen(true)}
          >
            <div className="w-full rounded-lg h-full flex items-center justify-center">
              <img src={instituteLogo} alt="Logo" className="w-auto h-full bg-transparent" />
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onCloseMobileMenu}
            className="text-sidebar-foreground hover:bg-sidebar-accent">
            <ChevronLeft className="w-4 h-4" />
          </Button>
        </div>

        <nav className="flex-1 p-2 overflow-y-auto">
          <NavList mobile />
        </nav>

        <div className="p-3 border-t border-sidebar-border mt-auto">
          <div onClick={() => setIsProfileOpen(true)}
            className="flex items-start space-x-3 cursor-pointer hover:bg-sidebar-accent rounded-lg p-2 transition-colors mb-2">
            <Avatar className="w-10 h-10">
              <AvatarImage src={userDisplay.avatar || "/placeholder.svg"} />
              <AvatarFallback className="text-sm">
                {userDisplay.nombre.charAt(0)}{userDisplay.apellido.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-sidebar-foreground truncate">
                {userDisplay.nombre} {userDisplay.apellido}
              </div>
              <div className="text-xs text-sidebar-foreground/60 truncate mt-0.5">
                {roleConfig[currentRole ?? ""]?.label ?? currentRole ?? "—"}
              </div>
            </div>
          </div>
          <Button variant="ghost" onClick={handleLogout} size="sm"
            className="w-full flex items-center justify-start text-red-600 hover:text-red-700 hover:bg-red-50">
            <LogOut className="w-4 h-4 mr-2" />
            <span>Cerrar sesión</span>
          </Button>
        </div>
      </aside>

      {/* Institute Settings Dialog */}
      <InstituteSettingsDialog
        open={isInstituteOpen}
        onOpenChange={setIsInstituteOpen}
        onSaved={(logoUrl) => InstituteStore.getState().setInstitute({ ...InstituteStore.getState().institute!, logo_url: logoUrl } as any)}
      />

      {/* Profile Dialog */}
      <ProfileDialog
        open={isProfileOpen}
        onOpenChange={setIsProfileOpen}
        onProfileSaved={(name, avatar) => {
          const parts = name.split(" ");
          setUserDisplay({ nombre: parts[0] ?? "", apellido: parts.slice(1).join(" "), avatar });
        }}
      />

      {/* Mobile overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={onCloseMobileMenu} />
      )}
    </>
  );
}
