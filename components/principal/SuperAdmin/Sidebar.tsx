"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/components/ui/use-toast";
import {
  Home,
  Users,
  Calendar,
  HelpCircle,
  School,
  Clock,
  Route,
  Brain,
  ShoppingCart,
  ChevronLeft,
  User,
  UserPlus,
  UserCheck,
  LogOut,
  Camera,
  Save,
  FileText,
  CreditCard,
  Book,
  BookCheck,
  CalendarCheck,
  Building,
  GraduationCap,
  MessageCircle,
  Megaphone,
  Sparkles,
  Cross,
  Building2,
  DoorOpen,
  ChevronDown,
  CheckCircle2,
  HeartHandshake,
  BarChart2,
} from "lucide-react";
import type { MenuItem } from "./types";
import { ManagmentStorage } from "@/components/Services/ManagmentStorage/ManagmentStorage";
import { goToPath } from "@/components/function/RedirectHomeRoll/GoToPath";
import { createClient } from "@/lib/supabase/client";
import { UserInfoStore } from "@/Stores/UserInfoStore";
import { toast as sonnerToast } from "sonner";

export interface MenuCategory {
  id: string;
  label: string;
  icon: any;
  items?: MenuItem[];
}

const defaultMenuCategories: MenuCategory[] = [
  {
    id: "inicio",
    label: "Inicio",
    icon: Home,
    items: [{ icon: Home, label: "Inicio", href: "/", id: "inicio" }],
  },
  {
    id: "usuarios",
    label: "Usuarios",
    icon: Users,
    items: [
      {
        icon: Users,
        label: "Usuarios totales",
        href: "/usuarios",
        id: "usuarios",
      },
      { icon: User, label: "Roles", href: "/roles", id: "roles" },
      {
        icon: UserPlus,
        label: "Matricular",
        href: "/matricular",
        id: "matricular",
      },
      {
        icon: UserCheck,
        label: "Lista de matriculados",
        href: "/matriculados",
        id: "matriculados",
      },
    ],
  },
  {
    id: "academico",
    label: "Académico",
    icon: GraduationCap,
    items: [
      {
        icon: CalendarCheck,
        label: "Periodo Académico",
        href: "/periodo-academico",
        id: "periodo-academico",
      },
      {
        icon: Building,
        label: "Ciclos",
        href: "/ciclos",
        id: "ciclos",
      },
      { icon: BookCheck, label: "Materias", href: "/materias", id: "materias" },
      { icon: Book, label: "Cursos y grupos", href: "/cursos", id: "cursos" },
      { icon: Clock, label: "Horarios", href: "/horarios", id: "horarios" },
      { icon: BarChart2, label: "Resultados", href: "/resultados", id: "resultados" },
    ],
  },
  {
    id: "comunicacion",
    label: "Comunicación",
    icon: Megaphone,
    items: [
      {
        icon: Calendar,
        label: "Gestión de eventos",
        href: "/eventos",
        id: "eventos",
      },
      {
        icon: HelpCircle,
        label: "Soporte y ayuda",
        href: "/soporte",
        id: "soporte",
      },
      {
        icon: MessageCircle,
        label: "Circulares",
        href: "/circulares",
        id: "circulares",
      },
    ],
  },
  {
    id: "estructura",
    label: "Estructura",
    icon: Building2,
    items: [
      {
        icon: Building2,
        label: "Edificio",
        href: "/edificios",
        id: "edificios",
      },
      { icon: DoorOpen, label: "Aula", href: "/aulas", id: "aulas" },
    ],
  },
  {
    id: "servicios",
    label: "Servicios",
    icon: Sparkles,
    items: [
      { icon: Route, label: "Ruta", href: "/rutas", id: "rutas" },
      {
        icon: Brain,
        label: "Psicología",
        href: "/psicologia",
        id: "psicologia",
      },
      { icon: ShoppingCart, label: "Tienda", href: "/tienda", id: "tienda" },
      {
        icon: CreditCard,
        label: "Carnetización",
        href: "/carnetizacion",
        id: "carnetizacion",
      },
      {
        icon: Cross,
        label: "Enfermería",
        href: "/enfermeria",
        id: "enfermeria",
      },
      {
        icon: HeartHandshake,
        label: "Cond. Aprendizaje",
        href: "/condiciones-aprendizaje",
        id: "condiciones-aprendizaje",
      },
    ],
  },
  {
    id: "reportes",
    label: "Reportes",
    icon: FileText,
    items: [
      { icon: FileText, label: "Reportes", href: "/reportes", id: "reportes" },
    ],
  },
];

const roleConfig: Record<string, { label: string; icon: any; route: string }> =
  {
    "super-admin": {
      label: "Super Administrador",
      icon: Sparkles,
      route: "/usuario/super-admin",
    },
    tienda: { label: "Tienda", icon: ShoppingCart, route: "/usuario/tienda" },
    "padre-familia": {
      label: "Padre de Familia",
      icon: Users,
      route: "/usuario/padre-familia",
    },
    psicologia: {
      label: "Psicología",
      icon: Brain,
      route: "/usuario/psicologia",
    },
    profesor: {
      label: "Profesor",
      icon: GraduationCap,
      route: "/usuario/profesor",
    },
    estudiante: {
      label: "Estudiante",
      icon: Book,
      route: "/usuario/estudiante",
    },
    ruta: { label: "Ruta", icon: Route, route: "/usuario/ruta" },
  };

interface SidebarProps {
  isExpanded: boolean;
  isMobileMenuOpen: boolean;
  activeView: string;
  onMenuItemClick: (itemId: string) => void;
  onToggleExpanded: () => void;
  onCloseMobileMenu: () => void;
  menuCategories?: MenuCategory[];
}

export function Sidebar({
  isExpanded,
  isMobileMenuOpen,
  activeView,
  onMenuItemClick,
  onToggleExpanded,
  onCloseMobileMenu,
  menuCategories,
}: SidebarProps) {
  const { toast } = useToast();
  const roles = UserInfoStore((s) => s.roles);
  const currentRole = UserInfoStore((s) => s.current_role);

  // Filtra items restringidos por rol; si un item no tiene allowedRoles lo muestra siempre
  const rawCategories = menuCategories ?? defaultMenuCategories;
  const categories = rawCategories.map((cat) => ({
    ...cat,
    items: cat.items?.filter(
      (item) =>
        !item.allowedRoles ||
        (currentRole && item.allowedRoles.includes(currentRole as any))
    ),
  }));

  const handleSwitchRole = (role: string) => {
    UserInfoStore.getState().setCurrentRole(role);
    setIsProfileOpen(false);
    const config = roleConfig[role];
    if (config) goToPath(config.route);
  };

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<string[]>([
    "inicio",
  ]);
  const [userId, setUserId] = useState<string | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [showAvatarUrlInput, setShowAvatarUrlInput] = useState(false);
  const [avatarUrlInput, setAvatarUrlInput] = useState("");
  const [userProfile, setUserProfile] = useState({
    nombre: "Juan Carlos",
    apellido: "Rodríguez",
    correo: "admin@colegio.edu.co",
    telefono: "+57 300 123 4567",
    rol: "Super Administrador",
    avatar: "",
  });

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId],
    );
  };

  const handleProfileChange = (field: string, value: string) => {
    setUserProfile((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveProfile = async () => {
    if (!userId) {
      toast({
        title: "Error",
        description: "No se pudo identificar el usuario",
        variant: "destructive",
      });
      return;
    }

    try {
      const supabase = createClient();

      // Construir el full_name
      const fullName = `${userProfile.nombre} ${userProfile.apellido}`.trim();

      // Actualizar el perfil en Supabase (sin email, es solo lectura)
      const { error } = await supabase
        .from("profiles")
        .update({
          first_name: userProfile.nombre,
          last_name: userProfile.apellido,
          full_name: fullName,
          phone: userProfile.telefono,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId);

      if (error) throw error;

      toast({
        title: "Perfil actualizado",
        description: "Tus datos se han guardado correctamente",
      });

      setIsEditing(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "No se pudo guardar el perfil",
        variant: "destructive",
      });
    }
  };

  const handleAvatarChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file || !userId) return;

    // Validar tipo de archivo
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Error",
        description: "Solo se permiten archivos de imagen",
        variant: "destructive",
      });
      return;
    }

    // Validar tamaño (máximo 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "Error",
        description: "La imagen no debe superar los 2MB",
        variant: "destructive",
      });
      return;
    }

    setUploadingAvatar(true);
    const supabase = createClient();

    try {
      // Generar nombre único para el archivo
      const fileExt = file.name.split(".").pop();
      const fileName = `${userId}_${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      // Subir imagen a Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("profiles-avatars")
        .upload(filePath, file, {
          upsert: true,
        });

      if (uploadError) {
        // Mensaje de error más descriptivo
        let errorMessage = uploadError.message;
        if (uploadError.message.includes("Bucket not found")) {
          errorMessage =
            "El bucket 'profiles-avatars' no existe. Por favor, créalo en Supabase Storage o usa la opción de URL.";
        } else if (uploadError.message.includes("new row violates")) {
          errorMessage =
            "No tienes permisos para subir archivos. Verifica las políticas de Storage o usa la opción de URL.";
        }
        throw new Error(errorMessage);
      }

      // Obtener URL pública
      const { data: publicUrlData } = supabase.storage
        .from("profiles-avatars")
        .getPublicUrl(uploadData.path);

      // Actualizar avatar_url en la base de datos
      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          avatar_url: publicUrlData.publicUrl,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId);

      if (updateError) throw updateError;

      // Actualizar el estado local
      setUserProfile((prev) => ({
        ...prev,
        avatar: publicUrlData.publicUrl,
      }));

      toast({
        title: "Foto actualizada",
        description: "Tu foto de perfil se ha actualizado correctamente",
      });
    } catch (error: any) {
      console.error("Error al subir avatar:", error);
      toast({
        title: "Error al subir imagen",
        description: error.message || "No se pudo subir la imagen",
        variant: "destructive",
      });
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleAvatarUrlSave = async () => {
    if (!userId || !avatarUrlInput.trim()) {
      toast({
        title: "Error",
        description: "Por favor ingresa una URL válida",
        variant: "destructive",
      });
      return;
    }

    setUploadingAvatar(true);
    const supabase = createClient();

    try {
      // Actualizar avatar_url en la base de datos
      const { error } = await supabase
        .from("profiles")
        .update({
          avatar_url: avatarUrlInput.trim(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId);

      if (error) throw error;

      // Actualizar el estado local
      setUserProfile((prev) => ({
        ...prev,
        avatar: avatarUrlInput.trim(),
      }));

      toast({
        title: "Foto actualizada",
        description: "Tu foto de perfil se ha actualizado correctamente",
      });

      setShowAvatarUrlInput(false);
      setAvatarUrlInput("");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "No se pudo guardar la URL",
        variant: "destructive",
      });
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleLogout = async () => {
    const supabase = createClient();

    sonnerToast.promise(
      (async () => {
        await supabase.auth.signOut();
        UserInfoStore.getState().clear();
        ManagmentStorage.clear();
      })(),
      {
        loading: "Cerrando sesión...",
        success: "Sesión cerrada correctamente",
        error: "Error al cerrar sesión",
      },
    );

    goToPath("/");
  };

  // Cargar datos del usuario desde Supabase
  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        // Obtener el UUID del usuario desde localStorage
        const userIdFromStorage = ManagmentStorage.getItem<string>("id_User");

        if (!userIdFromStorage) {
          console.log("No se encontró id_User en el storage");
          return;
        }

        setUserId(userIdFromStorage);

        // Crear cliente de Supabase
        const supabase = createClient();

        // Consultar el perfil del usuario con más campos
        const { data, error } = await supabase
          .from("profiles")
          .select("full_name, first_name, last_name, email, phone, avatar_url")
          .eq("id", userIdFromStorage)
          .single();

        if (error) {
          console.error("Error al cargar el perfil:", error);
          return;
        }

        if (data) {
          // Usar first_name y last_name si están disponibles, sino extraer de full_name
          let nombre = data.first_name || "";
          let apellido = data.last_name || "";

          if (!nombre && !apellido && data.full_name) {
            const nameParts = data.full_name.split(" ");
            nombre = nameParts[0] || "Usuario";
            apellido = nameParts.slice(1).join(" ") || "";
          }

          // Actualizar el estado con los datos del usuario
          setUserProfile((prev) => ({
            ...prev,
            nombre,
            apellido,
            correo: data.email || prev.correo,
            telefono: data.phone || prev.telefono,
            avatar: data.avatar_url || "",
          }));
        }
      } catch (error) {
        console.error("Error al cargar el perfil del usuario:", error);
      }
    };

    loadUserProfile();
  }, []);

  return (
    <>
      {/* Sidebar */}
      <aside
        className={cn(
          "bg-[#ffffff33] border-r border-sidebar-border transition-all duration-300 flex flex-col h-full backdrop-blur-lg",
          isExpanded ? "w-64" : "w-16",
          "hidden lg:flex h-dvh",
        )}
      >
        {/* Header del sidebar */}
        <div className="p-4 border-b border-sidebar-border flex items-center justify-between bg-white">
          {isExpanded && (
            <div className="flex items-center space-x-3 ">
              <div className="w-full  bg-primary rounded-lg flex items-center justify-center">
                <img
                  src="/logos/jqc_logo.png"
                  alt="logo Jaime Quijano"
                  className="w-full"
                />
              </div>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleExpanded}
            className="text-sidebar-foreground hover:bg-sidebar-accent"
          >
            <ChevronLeft
              className={cn(
                "w-4 h-4 transition-transform",
                !isExpanded && "rotate-180",
              )}
            />
          </Button>
        </div>

        {/* Navegación */}
        <nav className="flex-1 p-2 overflow-y-auto">
          <ul className="space-y-1">
            {categories.map((category) => (
              <li key={category.id}>
                {/* Categoría principal */}
                {category.items && category.items.length === 1 ? (
                  // Si solo tiene un item, mostrarlo directamente sin acordeón
                  <div
                    onClick={() =>
                      category.items && onMenuItemClick(category.items[0].id)
                    }
                    className={cn(
                      "w-full flex items-center justify-start rounded-md px-3 py-2 text-sm font-medium transition-all duration-200 cursor-pointer",
                      category.items && activeView === category.items[0].id
                        ? "bg-blue-950 text-white border-0"
                        : "text-sidebar-foreground hover:bg-blue-950 hover:text-white hover:border-0",
                    )}
                    style={{
                      background:
                        category.items && activeView === category.items[0].id
                          ? "#172554"
                          : undefined,
                    }}
                    onMouseEnter={(e) => {
                      if (
                        category.items &&
                        activeView !== category.items[0].id
                      ) {
                        e.currentTarget.style.background = "#172554";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (
                        category.items &&
                        activeView !== category.items[0].id
                      ) {
                        e.currentTarget.style.background = "";
                      }
                    }}
                  >
                    <category.icon className="w-4 h-4" />
                    {isExpanded && (
                      <span className="ml-3">{category.label}</span>
                    )}
                  </div>
                ) : (
                  // Si tiene múltiples items, mostrar acordeón
                  <>
                    <div
                      onClick={() => toggleCategory(category.id)}
                      className={cn(
                        "w-full flex items-center justify-between rounded-md px-3 py-2 text-sm font-medium transition-all duration-200 cursor-pointer text-sidebar-foreground hover:bg-blue-900/50",
                      )}
                    >
                      <div className="flex items-center">
                        <category.icon className="w-4 h-4" />
                        {isExpanded && (
                          <span className="ml-3">{category.label}</span>
                        )}
                      </div>
                      {isExpanded && (
                        <ChevronDown
                          className={cn(
                            "w-4 h-4 transition-transform duration-200",
                            expandedCategories.includes(category.id) &&
                              "rotate-180",
                          )}
                        />
                      )}
                    </div>
                    {/* Subitems */}
                    {expandedCategories.includes(category.id) &&
                      isExpanded &&
                      category.items && (
                        <ul className="mt-1 space-y-1 ml-4">
                          {category.items.map((item) => (
                            <li key={item.id}>
                              <div
                                onClick={() => onMenuItemClick(item.id)}
                                className={cn(
                                  "w-full flex items-center justify-start rounded-md px-3 py-2 text-sm transition-all duration-200 cursor-pointer",
                                  activeView === item.id
                                    ? "bg-blue-950 text-white border-0 font-medium"
                                    : "text-sidebar-foreground/80 hover:bg-blue-950 hover:text-white hover:border-0",
                                )}
                                style={{
                                  background:
                                    activeView === item.id
                                      ? "#172554"
                                      : undefined,
                                }}
                                onMouseEnter={(e) => {
                                  if (activeView !== item.id) {
                                    e.currentTarget.style.background =
                                      "#172554";
                                  }
                                }}
                                onMouseLeave={(e) => {
                                  if (activeView !== item.id) {
                                    e.currentTarget.style.background = "";
                                  }
                                }}
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
        </nav>

        {/* Footer del sidebar con información del usuario */}
        <div className="border-t border-sidebar-border mt-auto">
          {isExpanded ? (
            <div className="p-3 space-y-2">
              {/* Información del usuario */}
              <div
                onClick={() => setIsProfileOpen(true)}
                className="flex items-start space-x-3 cursor-pointer hover:bg-sidebar-accent rounded-lg p-2 transition-colors"
              >
                <Avatar className="w-10 h-10">
                  <AvatarImage src={userProfile.avatar || "/placeholder.svg"} />
                  <AvatarFallback className="text-sm">
                    {userProfile.nombre.charAt(0)}
                    {userProfile.apellido.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-sidebar-foreground truncate">
                    {userProfile.nombre} {userProfile.apellido}
                  </div>
                  {/* <div className="text-xs text-sidebar-foreground/70 truncate">
                    {userProfile.correo}
                  </div> */}
                  <div className="text-xs text-sidebar-foreground/60 truncate mt-0.5">
                    {roleConfig[currentRole ?? ""]?.label ?? currentRole ?? "—"}
                  </div>
                </div>
              </div>

              {/* Botón de cerrar sesión */}
              <Button
                variant="ghost"
                onClick={handleLogout}
                className="w-full flex items-center justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                size="sm"
              >
                <LogOut className="w-4 h-4 mr-2" />
                <span>Cerrar sesión</span>
              </Button>
            </div>
          ) : (
            <div className="p-2 space-y-2">
              {/* Avatar cuando está colapsado */}
              <div
                onClick={() => setIsProfileOpen(true)}
                className="flex justify-center cursor-pointer hover:bg-sidebar-accent rounded-lg p-2 transition-colors"
              >
                <Avatar className="w-8 h-8">
                  <AvatarImage src={userProfile.avatar || "/placeholder.svg"} />
                  <AvatarFallback className="text-xs">
                    {userProfile.nombre.charAt(0)}
                    {userProfile.apellido.charAt(0)}
                  </AvatarFallback>
                </Avatar>
              </div>

              {/* Botón cerrar sesión cuando está colapsado */}
              <Button
                variant="ghost"
                onClick={handleLogout}
                className="w-full flex items-center justify-center text-red-600 hover:text-red-700 hover:bg-red-50 px-2"
                size="sm"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      </aside>

      {/* Mobile Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-sidebar border-r border-sidebar-border transition-transform duration-300 flex flex-col lg:hidden",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        {/* Header del sidebar móvil */}
        <div className="p-4 border-b border-sidebar-border flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <School className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-semibold text-sidebar-foreground">
              Colegio Admin
            </span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onCloseMobileMenu}
            className="text-sidebar-foreground hover:bg-sidebar-accent"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
        </div>

        {/* Navegación móvil */}
        <nav className="flex-1 p-2 overflow-y-auto">
          <ul className="space-y-1">
            {categories.map((category) => (
              <li key={category.id}>
                {/* Categoría principal móvil */}
                {category.items && category.items.length === 1 ? (
                  // Si solo tiene un item, mostrarlo directamente
                  <div
                    onClick={() => {
                      if (category.items) {
                        onMenuItemClick(category.items[0].id);
                        onCloseMobileMenu();
                      }
                    }}
                    className={cn(
                      "w-full flex items-center justify-start rounded-md px-3 py-2 text-sm font-medium transition-all duration-200 cursor-pointer",
                      category.items && activeView === category.items[0].id
                        ? "bg-blue-950 text-white border-0"
                        : "text-sidebar-foreground hover:bg-blue-950 hover:text-white hover:border-0",
                    )}
                  >
                    <category.icon className="w-4 h-4" />
                    <span className="ml-3">{category.label}</span>
                  </div>
                ) : (
                  // Si tiene múltiples items, mostrar acordeón
                  <>
                    <div
                      onClick={() => toggleCategory(category.id)}
                      className="w-full flex items-center justify-between rounded-md px-3 py-2 text-sm font-medium transition-all duration-200 cursor-pointer text-sidebar-foreground hover:bg-blue-900/50"
                    >
                      <div className="flex items-center">
                        <category.icon className="w-4 h-4" />
                        <span className="ml-3">{category.label}</span>
                      </div>
                      <ChevronDown
                        className={cn(
                          "w-4 h-4 transition-transform duration-200",
                          expandedCategories.includes(category.id) &&
                            "rotate-180",
                        )}
                      />
                    </div>
                    {/* Subitems móvil */}
                    {expandedCategories.includes(category.id) &&
                      category.items && (
                        <ul className="mt-1 space-y-1 ml-4">
                          {category.items.map((item) => (
                            <li key={item.id}>
                              <div
                                onClick={() => {
                                  onMenuItemClick(item.id);
                                  onCloseMobileMenu();
                                }}
                                className={cn(
                                  "w-full flex items-center justify-start rounded-md px-3 py-2 text-sm transition-all duration-200 cursor-pointer",
                                  activeView === item.id
                                    ? "bg-blue-950 text-white border-0 font-medium"
                                    : "text-sidebar-foreground/80 hover:bg-blue-950 hover:text-white hover:border-0",
                                )}
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
        </nav>

        {/* Footer del sidebar móvil */}
        <div className="p-3 border-t border-sidebar-border space-y-2 mt-auto">
          {/* Información del usuario */}
          <div
            onClick={() => setIsProfileOpen(true)}
            className="flex items-start space-x-3 cursor-pointer hover:bg-sidebar-accent rounded-lg p-2 transition-colors"
          >
            <Avatar className="w-10 h-10">
              <AvatarImage src={userProfile.avatar || "/placeholder.svg"} />
              <AvatarFallback className="text-sm">
                {userProfile.nombre.charAt(0)}
                {userProfile.apellido.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-sidebar-foreground truncate">
                {userProfile.nombre} {userProfile.apellido}
              </div>
              <div className="text-xs text-sidebar-foreground/70 truncate">
                {userProfile.correo}
              </div>
              <div className="text-xs text-sidebar-foreground/60 truncate mt-0.5">
                {roleConfig[currentRole ?? ""]?.label ?? currentRole ?? "—"}
              </div>
            </div>
          </div>

          {/* Botón de cerrar sesión */}
          <Button
            variant="ghost"
            onClick={handleLogout}
            className="w-full flex items-center justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
            size="sm"
          >
            <LogOut className="w-4 h-4 mr-2" />
            <span>Cerrar sesión</span>
          </Button>
        </div>
      </aside>

      {/* Profile Dialog */}
      <Dialog open={isProfileOpen} onOpenChange={setIsProfileOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <User className="w-5 h-5" />
                <span>Perfil de Usuario</span>
              </div>
              <div className="flex space-x-2">
                {!isEditing ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditing(true)}
                  >
                    Editar
                  </Button>
                ) : (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsEditing(false)}
                    >
                      Cancelar
                    </Button>
                    <Button size="sm" onClick={handleSaveProfile}>
                      <Save className="w-4 h-4 mr-2" />
                      Guardar
                    </Button>
                  </>
                )}
              </div>
            </DialogTitle>
            <DialogDescription>
              {isEditing
                ? "Edita tu información personal"
                : "Información de tu perfil"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 overflow-y-auto flex-1 pr-1">
            <div className="flex flex-col items-center space-y-3">
              <Avatar className="w-20 h-20">
                <AvatarImage src={userProfile.avatar || "/placeholder.svg"} />
                <AvatarFallback className="text-lg">
                  {userProfile.nombre.charAt(0)}
                  {userProfile.apellido.charAt(0)}
                </AvatarFallback>
              </Avatar>
              {isEditing && (
                <div className="flex flex-col items-center gap-2 w-full max-w-sm">
                  {!showAvatarUrlInput ? (
                    <>
                      <input
                        type="file"
                        id="avatar-upload"
                        accept="image/*"
                        className="hidden"
                        onChange={handleAvatarChange}
                        disabled={uploadingAvatar}
                      />
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex items-center space-x-2"
                          onClick={() =>
                            document.getElementById("avatar-upload")?.click()
                          }
                          disabled={uploadingAvatar}
                        >
                          <Camera className="w-4 h-4" />
                          <span>
                            {uploadingAvatar ? "Subiendo..." : "Subir foto"}
                          </span>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowAvatarUrlInput(true)}
                          disabled={uploadingAvatar}
                        >
                          Usar URL
                        </Button>
                      </div>
                    </>
                  ) : (
                    <div className="w-full space-y-2">
                      <div className="flex gap-2">
                        <Input
                          placeholder="https://ejemplo.com/foto.jpg"
                          value={avatarUrlInput}
                          onChange={(e) => setAvatarUrlInput(e.target.value)}
                          disabled={uploadingAvatar}
                          className="flex-1"
                        />
                        <Button
                          size="sm"
                          onClick={handleAvatarUrlSave}
                          disabled={uploadingAvatar}
                        >
                          {uploadingAvatar ? "Guardando..." : "Guardar"}
                        </Button>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setShowAvatarUrlInput(false);
                          setAvatarUrlInput("");
                        }}
                        disabled={uploadingAvatar}
                        className="w-full"
                      >
                        Cancelar
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nombre">Nombre</Label>
                <Input
                  id="nombre"
                  value={userProfile.nombre}
                  onChange={(e) =>
                    handleProfileChange("nombre", e.target.value)
                  }
                  disabled={!isEditing}
                  className={!isEditing ? "bg-muted" : ""}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="apellido">Apellido</Label>
                <Input
                  id="apellido"
                  value={userProfile.apellido}
                  onChange={(e) =>
                    handleProfileChange("apellido", e.target.value)
                  }
                  disabled={!isEditing}
                  className={!isEditing ? "bg-muted" : ""}
                />
              </div>
              <div className="space-y-2">
                <Label>Correo electrónico</Label>
                <div className="px-3 py-2 bg-muted rounded-md text-sm text-muted-foreground border border-input">
                  {userProfile.correo}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="telefono">Teléfono</Label>
                <Input
                  id="telefono"
                  value={userProfile.telefono}
                  onChange={(e) =>
                    handleProfileChange("telefono", e.target.value)
                  }
                  disabled={!isEditing}
                  className={!isEditing ? "bg-muted" : ""}
                />
              </div>
              <div className="space-y-2">
                <Label>Perfil activo</Label>
                <div className="px-3 py-2 bg-muted rounded-md text-sm text-muted-foreground border border-input">
                  {roleConfig[currentRole ?? ""]?.label ?? currentRole ?? "—"}
                </div>
              </div>
            </div>

            {/* Cambio de perfil */}
            {roles.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="h-px flex-1 bg-border" />
                  <span className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                    Cambiar perfil
                  </span>
                  <div className="h-px flex-1 bg-border" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {roles.map((role) => {
                    const config = roleConfig[role];
                    if (!config) return null;
                    const isActive = role === currentRole;
                    return (
                      <button
                        key={role}
                        onClick={() => !isActive && handleSwitchRole(role)}
                        disabled={isActive}
                        className={cn(
                          "flex items-center gap-2 px-3 py-2.5 rounded-lg border text-sm font-medium transition-all text-left",
                          isActive
                            ? "bg-blue-950 text-white border-blue-950 cursor-default"
                            : "bg-white text-gray-700 border-gray-200 hover:border-blue-400 hover:bg-blue-50 cursor-pointer",
                        )}
                      >
                        <config.icon className="w-4 h-4 shrink-0" />
                        <span className="truncate flex-1">{config.label}</span>
                        {isActive && (
                          <CheckCircle2 className="w-3.5 h-3.5 shrink-0 opacity-80" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Mobile overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onCloseMobileMenu}
        />
      )}
    </>
  );
}
