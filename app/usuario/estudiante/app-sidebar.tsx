"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import type * as React from "react";
import {
  BookOpen,
  Calendar,
  Home,
  BarChart3,
  Users,
  Award as IdCard,
  LogOut,
  HeartHandshake,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useStudentContextStore } from "@/Stores/studentContextStore";
import {
  useStudentViewStore,
  type StudentView,
} from "@/Stores/studentViewStore";
import { createClient } from "@/lib/supabase/client";
import { StudentInfoModal } from "./StudentInfoModal";

const navMain: { title: string; view: StudentView; icon: React.ElementType }[] =
  [
    { title: "Panel Principal", view: "dashboard", icon: Home },
    { title: "Mis Clases", view: "cursos", icon: BookOpen },
    { title: "Calendario", view: "calendario", icon: Calendar },
    { title: "Registro Notas", view: "registro-notas", icon: BarChart3 },
    { title: "Grupos de Interés", view: "grupos-interes", icon: Users },
    { title: "Carnet estudiantil", view: "carnet", icon: IdCard },
  ];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { profile, group, course, clear } = useStudentContextStore();
  const { currentView, setView } = useStudentViewStore();
  const [open, setOpen] = useState(false);
  const [conditions, setConditions] = useState<
    Array<{ id: string; name: string; color: string | null }>
  >([]);
  const router = useRouter();

  useEffect(() => {
    if (!profile?.id) return;
    const supabase = createClient();
    supabase
      .from("profile_has_learning_condition")
      .select("learning_condition:learning_condition_id(id, name, color)")
      .eq("profile_id", profile.id)
      .then(({ data }) => {
        if (data) {
          setConditions(
            data
              .map((r: any) => r.learning_condition)
              .filter(Boolean),
          );
        }
      });
  }, [profile?.id]);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    clear();
    router.push("/");
  };

  const initials = profile?.full_name
    ? profile.full_name
        .split(" ")
        .slice(0, 2)
        .map((w) => w[0])
        .join("")
        .toUpperCase()
    : "?";

  return (
    <>
      <Sidebar variant="sidebar" {...props}>
        <SidebarHeader className="bg-white">
          <div className="flex items-center space-x-3">
            <div className="w-full bg-primary rounded-lg flex items-center justify-center">
              <img
                src="/logos/jqc_logo.png"
                alt="logo Jaime Quijano"
                className="w-full"
              />
            </div>
          </div>
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Navegación</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {navMain.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      isActive={currentView === item.view}
                      className="data-[active=true]:bg-[#343c63] data-[active=true]:text-white data-[active=true]:[&_svg]:text-white cursor-pointer"
                      onClick={() => setView(item.view)}
                    >
                      <item.icon />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter className="p-0">
          <div className="mx-2 mb-2 rounded-xl border bg-muted/40 overflow-hidden">

            {/* Sección condición */}
            {conditions.length > 0 && (
              <div className="px-3 pt-3 pb-2 border-b">
                <p className="text-[9px] font-semibold uppercase tracking-widest text-muted-foreground mb-1.5">
                  Condición de aprendizaje
                </p>
                <div className="flex flex-wrap gap-1">
                  {conditions.map((c) => (
                    <span
                      key={c.id}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold"
                      style={{
                        backgroundColor: c.color ? `${c.color}20` : "#8b5cf615",
                        color: c.color ?? "#8b5cf6",
                        border: `1px solid ${c.color ?? "#8b5cf6"}35`,
                      }}
                    >
                      <HeartHandshake className="h-2.5 w-2.5 shrink-0" />
                      <span className="truncate">{c.name}</span>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Perfil + logout */}
            <div className="flex items-center gap-1 px-2 py-2">
              <button
                onClick={() => setOpen(true)}
                className="flex items-center gap-2.5 flex-1 min-w-0 rounded-lg hover:bg-muted/60 transition-colors px-1.5 py-1.5 text-left"
              >
                <Avatar className="h-8 w-8 rounded-lg shrink-0">
                  <AvatarImage
                    src={profile?.avatar_url || ""}
                    alt={profile?.full_name || ""}
                  />
                  <AvatarFallback className="rounded-lg text-xs font-bold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-semibold leading-tight">
                    {profile?.full_name ?? "—"}
                  </p>
                  <p className="truncate text-[11px] text-muted-foreground leading-tight mt-0.5">
                    {course?.name
                      ? `${course.name}${group?.name ? ` · ${group.name}` : ""}`
                      : (profile?.email ?? "—")}
                  </p>
                </div>
              </button>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleLogout}
                title="Cerrar sesión"
                className="shrink-0 h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>

          </div>
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>

      <StudentInfoModal open={open} onOpenChange={setOpen} />
    </>
  );
}
