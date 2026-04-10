"use client"

import type React from "react"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
    LayoutDashboard,
    GraduationCap,
    UserCog,
    Users,
    BookOpen,
    CreditCard,
    BookMarked,
    Settings,
    ChevronsLeft,
    ChevronsRight,
    LogOut,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { ManagmentStorage } from "@/components/Services/ManagmentStorage/ManagmentStorage"
import { CloseSession } from "@/components/function/RedirectHomeRoll/CloseSession"
import { useEffect, useState } from "react"
import RenderContentPrincipal from "@/components/principal/DashboardShell/config/RenderContentPrincipal"

export type NavKey =
    | "Institute"
    | "Academic"
    | "Finance"
    | "Reports"
    | "subjects"
    | "payments"
    | "library"
    | "settings"

export default function AsideNav({
    collapsed = false,
    onToggleCollapsed,
    activeKey = "Institute",
    onNavigate,
    NAV_ITEMS,
}: {
    collapsed?: boolean
    onToggleCollapsed?: () => void
    activeKey?: NavKey
    onNavigate?: (key: NavKey) => void
    NAV_ITEMS: {
        key: NavKey
        label: string
        href: string
        icon: React.ComponentType<{ className?: string }>
    }[]
}) {
    const [name, setName] = useState<string>("")
    const [rollsName, setRollsName] = useState<string>("")
    const [widthScreen, setWidthScreen] = useState<number>(0)


    // Detecta móvil para colapsar automáticamente en < md
    const [isMobile, setIsMobile] = useState(false)
    useEffect(() => {
        if (typeof window === "undefined") return
        const mq = window.matchMedia("(max-width: 767px)")

        const apply = (m: MediaQueryList | MediaQueryListEvent) =>
            setIsMobile("matches" in m ? m.matches : (m as MediaQueryList).matches)

        apply(mq)
        // Safari < 14 fallback
        // @ts-ignore
        mq.addEventListener?.("change", apply) || mq.addListener?.(apply)
        return () => {
            // @ts-ignore
            mq.removeEventListener?.("change", apply) || mq.removeListener?.(apply)
        }
    }, [])

    const computedCollapsed = collapsed || isMobile

    useEffect(() => {
        setName(ManagmentStorage.getItem("name") ?? "")
        setRollsName(ManagmentStorage.getItem("rollsName") ?? "")
        setWidthScreen(window.innerWidth)

        window.addEventListener('resize', () => setWidthScreen(window.innerWidth))
    }, [])



    return (
        <nav
            role="navigation"
            aria-label="Navegación lateral"
            className="flex h-full flex-col w-full max-w-full min-w-0  overscroll-contain"
        >
            {/* Header */}
            <div className="relative p-4 md:p-6 pb-3 md:pb-4">
                <div className="flex items-center justify-between gap-2">
                    {/* Logo */}
                    <div className={cn("flex items-center gap-3", computedCollapsed && "justify-center w-full")}>
                        <img
                            src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTLpK3lgpIB-dL_wjjIpeVJuZc3VCRGPB30eA&s"
                            alt="Logo"
                            className="h-8 w-8 rounded-md shrink-0"
                        />
                    </div>

                    {/* botón de colapsar también visible en móvil */}
                    {
                        widthScreen > 980 && <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            className="inline-flex bg-transparent hover:bg-transparent focus:bg-transparent active:bg-transparent"
                            aria-label={computedCollapsed ? "Expandir menú" : "Colapsar menú"}
                            onClick={onToggleCollapsed}
                        >
                            {computedCollapsed ? <ChevronsRight className="h-4 w-4" /> : <ChevronsLeft className="h-4 w-4" />}
                        </Button>
                    }

                </div>
            </div>

            {/* Nombre del colegio (oculto en móvil) */}
            <div className={cn("px-4 md:px-6 pb-3 hidden md:block", computedCollapsed && "md:hidden")}>
                <p className="text-sm font-medium text-foreground/90 truncate">Colegio Jaime Quijano Caballero</p>
            </div>

            {/* Badge corto cuando está colapsado (solo md+) */}
            {computedCollapsed && (
                <div className="hidden md:flex items-center justify-center px-2 pb-3">
                    <span className="text-[11px] uppercase tracking-wide text-foreground/70 bg-white/10 border border-white/20 rounded-md px-1.5 py-0.5 backdrop-blur">
                        CJQ
                    </span>
                </div>
            )}

            {/* Lista de navegación */}
            <ul className="flex-1 space-y-1 px-2 md:px-4 min-w-0" role="list">
                {NAV_ITEMS.length > 0 && NAV_ITEMS.map((item) => {
                    const Icon = item.icon
                    const isActive = item.key === activeKey
                    return (
                        <li key={item.key} className="min-w-0">
                            <Link
                                href={item.href}
                                aria-current={isActive ? "page" : undefined}
                                aria-label={computedCollapsed || isMobile ? item.label : undefined}
                                onClick={e => {
                                    if (onNavigate) {
                                        e.preventDefault();
                                        onNavigate(item.key);
                                    }
                                    RenderContentPrincipal({ option: item.key, roll: rollsName });
                                }}
                                className={cn(
                                    "group flex items-center gap-3 rounded-lg px-2.5 py-2 text-sm outline-none transition",
                                    "hover:bg-[#050566] hover:text-white focus-visible:ring-2 focus-visible:ring-ring",
                                    "border-l-2 border-transparent",

                                )}
                            >
                                <Icon className="h-4 w-4 shrink-0" />
                                {/* En móvil oculto; en md+ depende de colapso */}
                                {
                                    widthScreen > 980
                                        ? <span className={cn("truncate hidden md:inline", computedCollapsed && "md:hidden")}>
                                            {item.label}
                                        </span>
                                        : <span style={{ color: 'white' }}>
                                            {item.label}
                                        </span>
                                }

                            </Link>
                        </li>
                    )
                })}
            </ul>

            {/* Footer del aside */}
            <div className={cn("px-2 md:px-4 pb-4 md:pb-6 pt-2", computedCollapsed && "px-2 pb-3")}>
                <div
                    className={cn(
                        "flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 p-2 backdrop-blur-xl dark:border-white/10 dark:bg-white/5",
                        computedCollapsed ? "justify-center" : "justify-between",
                        "min-w-0"
                    )}
                >
                    <div className="flex items-center gap-2 min-w-0">
                        <Avatar className="h-8 w-8">
                            <AvatarImage src="/placeholder.svg?height=32&width=32" alt="Foto de perfil" />
                            <AvatarFallback>
                                {(name || "?")
                                    .split(" ")
                                    .filter(Boolean)
                                    .map(word => word[0])
                                    .join("")
                                    .toUpperCase()
                                    .slice(0, 2)}
                            </AvatarFallback>
                        </Avatar>

                        {/* En móvil, siempre oculto el texto; en md+ depende del colapso */}
                        {!computedCollapsed && (
                            <div className="leading-none hidden md:block min-w-0">
                                <p className="text-sm font-medium truncate">{name}</p>
                                <p className="text-xs text-muted-foreground truncate">{rollsName}</p>
                            </div>
                        )}
                    </div>

                    {!computedCollapsed && (
                        <Button variant="ghost" size="icon" aria-label="Cerrar sesión" onClick={CloseSession}>
                            <LogOut className="h-4 w-4" />
                        </Button>
                    )}
                </div>
            </div>
        </nav>
    )
}
