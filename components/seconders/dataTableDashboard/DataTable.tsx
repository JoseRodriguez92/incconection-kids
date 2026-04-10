"use client"

import { useMemo, useState } from "react"
import { motion } from "framer-motion"
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationNext,
    PaginationPrevious,
    PaginationLink,
} from "@/components/ui/pagination"
import { Eye, Pencil } from "lucide-react"

type Row = {
    name: string
    role: string
    group: string
    status: "Activo" | "Pendiente" | "Suspendido"
}

export default function DataTable({ rows = [] as Row[] }: { rows?: Row[] }) {
    const pageSize = 5
    const [page, setPage] = useState(1)
    const pageCount = Math.max(1, Math.ceil(rows.length / pageSize))

    const pageRows = useMemo(() => {
        const start = (page - 1) * pageSize
        return rows.slice(start, start + pageSize)
    }, [rows, page])

    return (
        <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: "easeOut" }}
            className="rounded-xl border border-white/20 bg-white/10 backdrop-blur-xl p-2 md:p-3 shadow-xl dark:bg-black/20 dark:border-white/10"
        >
            <Table role="table" aria-label="Tabla de ejemplo">
                <TableCaption>{"Lista de usuarios (datos de ejemplo)"}</TableCaption>
                <TableHeader>
                    <TableRow>
                        <TableHead>{"Nombre"}</TableHead>
                        <TableHead>{"Rol"}</TableHead>
                        <TableHead>{"Grupo"}</TableHead>
                        <TableHead>{"Estado"}</TableHead>
                        <TableHead className="text-right">{"Acciones"}</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {pageRows.map((r, idx) => (
                        <TableRow key={`${r.name}-${idx}`}>
                            <TableCell className="font-medium">{r.name}</TableCell>
                            <TableCell>{r.role}</TableCell>
                            <TableCell>{r.group}</TableCell>
                            <TableCell>
                                <Badge
                                    variant={r.status === "Activo" ? "default" : r.status === "Pendiente" ? "secondary" : "destructive"}
                                >
                                    {r.status}
                                </Badge>
                            </TableCell>
                            <TableCell className="text-right space-x-1">
                                <Button variant="ghost" size="icon" aria-label={`Ver ${r.name}`}>
                                    <Eye className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" aria-label={`Editar ${r.name}`}>
                                    <Pencil className="h-4 w-4" />
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

            {/* Paginación */}
            <div className="mt-2 md:mt-3">
                <Pagination>
                    <PaginationContent>
                        <PaginationItem>
                            <PaginationPrevious
                                href="#"
                                onClick={(e) => {
                                    e.preventDefault()
                                    setPage((p) => Math.max(1, p - 1))
                                }}
                            />
                        </PaginationItem>
                        {Array.from({ length: pageCount }).map((_, i) => {
                            const num = i + 1
                            return (
                                <PaginationItem key={num}>
                                    <PaginationLink
                                        href="#"
                                        isActive={page === num}
                                        onClick={(e) => {
                                            e.preventDefault()
                                            setPage(num)
                                        }}
                                    >
                                        {num}
                                    </PaginationLink>
                                </PaginationItem>
                            )
                        })}
                        <PaginationItem>
                            <PaginationNext
                                href="#"
                                onClick={(e) => {
                                    e.preventDefault()
                                    setPage((p) => Math.min(pageCount, p + 1))
                                }}
                            />
                        </PaginationItem>
                    </PaginationContent>
                </Pagination>
            </div>
        </motion.div>
    )
}
