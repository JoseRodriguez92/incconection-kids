"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Search, Menu, Plus, Download, ChevronsLeft, ChevronsRight } from "lucide-react"

export default function Topbar({
    onOpenMobileNav,
    collapsed = false,
    onToggleCollapsed,
}: {
    onOpenMobileNav?: () => void
    collapsed?: boolean
    onToggleCollapsed?: () => void
}) {
    return (
        <header className="flex flex-col gap-3 md:gap-4" role="banner" aria-label="Barra superior">
            {/* Primera fila: izquierda breadcrumb, derecha acciones */}
            <div className="flex items-center justify-between gap-3">

                <div className="flex items-center gap-2">
                    {/* Botón hamburguesa móvil */}
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="md:hidden"
                        aria-label="Abrir navegación"
                        onClick={onOpenMobileNav}
                    >
                        <Menu className="h-5 w-5" />
                    </Button>

                    <Breadcrumb>
                        <BreadcrumbList>
                            <BreadcrumbItem>
                                <BreadcrumbPage>{"Usuario"}</BreadcrumbPage>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator />
                            <BreadcrumbItem>
                                <BreadcrumbPage>{"Super Admin"}</BreadcrumbPage>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>
                </div>

                <div className="flex items-center gap-2">

                </div>
            </div>

        </header>
    )
}
