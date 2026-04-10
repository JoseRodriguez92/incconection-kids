"use client"

import type React from "react"

import { useEffect, useMemo, useState } from "react"
import { CalendarDays, X, Plus, PencilLine, Trash2, CalendarCheck2, ChevronDown, AlertTriangle } from "lucide-react"

const USE_API = true
const API_PATH = "/api/periodos?institute_id=1"

type Periodo = {
    id: string
    nombre: string
    fechaInicio: string // YYYY-MM-DD
    fechaFin: string // YYYY-MM-DD
}

export default function CreateAcademicPeriod() {
    const [open, setOpen] = useState(true)

    // Datos
    const [periodos, setPeriodos] = useState<Periodo[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const mockPeriodos = useMemo<Periodo[]>(() => {
        const startYear = 2025
        const endYear = 2018
        const arr: Periodo[] = []
        for (let y = startYear; y >= endYear; y--) {
            arr.push({
                id: `p-${y}`,
                nombre: String(y),
                fechaInicio: `${y}-01-01`,
                fechaFin: `${y}-12-31`,
            })
        }
        return arr
    }, [])

    async function fetchPeriodos() {
        // try {
        //     setLoading(true)
        //     setError(null)
        //     const res = await fetch(API_PATH, { cache: "no-store" })
        //     if (!res.ok) {
        //         throw new Error("No se pudo obtener la lista de periodos")
        //     }
        //     const data = (await res.json()) as Periodo[]
        //     setPeriodos(data)
        // } catch (err: any) {
        //     setError(err?.message ?? "Error desconocido")
        //     // Fallback al mock si falla el endpoint
        //     setPeriodos(mockPeriodos)
        // } finally {
        //     setLoading(false)
        // }
    }

    useEffect(() => {
        if (USE_API) {
            fetchPeriodos()
        } else {
            setPeriodos(mockPeriodos)
        }
    }, [mockPeriodos])



    // Crear
    const [creatingOpen, setCreatingOpen] = useState(false)
    const [createNombre, setCreateNombre] = useState("")
    const [createFechaInicio, setCreateFechaInicio] = useState("")
    const [createFechaFin, setCreateFechaFin] = useState("")

    function resetCreateForm() {
        setCreateNombre("")
        setCreateFechaInicio("")
        setCreateFechaFin("")
    }

    function handleCrear() {
        if (!createNombre || !createFechaInicio || !createFechaFin) return
        const id = typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `p-${Date.now()}`
        const nuevo: Periodo = { id, nombre: createNombre, fechaInicio: createFechaInicio, fechaFin: createFechaFin }
        setPeriodos((prev) => [nuevo, ...prev])
        setCreatingOpen(false)
        resetCreateForm()
        // showToast("Periodo creado correctamente", "success")
    }

    // Editar (sub-modal)
    const [editing, setEditing] = useState<{ open: boolean; data: Periodo | null }>({
        open: false,
        data: null,
    })

    function openEdit(p: Periodo) {
        setEditing({ open: true, data: { ...p } })
    }

    function closeEdit() {
        setEditing({ open: false, data: null })
    }

    function updateEdit<K extends keyof Periodo>(key: K, value: Periodo[K]) {
        setEditing((prev) => (prev.data ? { ...prev, data: { ...prev.data, [key]: value } } : prev))
    }

    function saveEdit() {
        if (!editing.open || !editing.data) return
        const { id, nombre, fechaInicio, fechaFin } = editing.data
        if (!nombre || !fechaInicio || !fechaFin) return
        setPeriodos((prev) => prev.map((p) => (p.id === id ? { ...p, nombre, fechaInicio, fechaFin } : p)))
        closeEdit()
        // showToast("Periodo actualizado correctamente", "success")
    }

    // Borrar
    function handleBorrar(id: string) {
        const ok = window.confirm("¿Seguro que deseas borrar este periodo?")
        if (!ok) return
        setPeriodos((prev) => prev.filter((p) => p.id !== id))
        // showToast("Periodo eliminado correctamente", "success")
    }

    // Accesibilidad: cerrar con Escape
    useEffect(() => {
        if (!open) return
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") setOpen(false)
        }
        window.addEventListener("keydown", onKeyDown)
        return () => window.removeEventListener("keydown", onKeyDown)
    }, [open])

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-white">
            {!open && (
                <button
                    onClick={() => setOpen(true)}
                    className="rounded-md border border-neutral-300 bg-white px-4 py-2 text-sm font-medium shadow-sm hover:bg-neutral-50 text-neutral-900"
                >
                    Abrir modal
                </button>
            )}

            {open && (
                <div
                    className="fixed inset-0 bg-black/80 flex items-center justify-center"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="modal-title"
                >
                    <div className="relative w-[92vw] h-[88vh] overflow-hidden" aria-describedby="modal-description">
                        {/* Contenedor principal blanco, sin efectos de color */}
                        <div className="relative w-full h-full bg-white text-neutral-900 border border-neutral-200 rounded-2xl shadow-2xl">
                            {/* Layout interior con header sticky y contenido scrollable */}
                            <div className="flex h-full flex-col">
                                {/* Header claro */}
                                <header className="sticky top-0 z-10 rounded-t-2xl border-b border-neutral-200 bg-white px-6 py-4">
                                    <div className="flex items-center justify-between gap-4">
                                        <div className="flex items-center gap-3">
                                            <div className="flex size-10 items-center justify-center rounded-xl border border-neutral-200 bg-neutral-50">
                                                <CalendarDays className="size-5 text-neutral-700" />
                                            </div>
                                            <div>
                                                <h2 id="modal-title" className="text-base sm:text-lg font-semibold">
                                                    Administrar periodos académicos
                                                </h2>
                                                <p id="modal-description" className="text-xs sm:text-sm text-neutral-500">
                                                    Gestiona la creación, edición y eliminación de periodos.
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => setCreatingOpen((s) => !s)}
                                                className="inline-flex items-center gap-2 rounded-md bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-700"
                                                aria-expanded={creatingOpen}
                                            >
                                                <Plus className="size-4" />
                                                <span className="hidden sm:inline">Crear periodo</span>
                                            </button>
                                            <button
                                                onClick={() => setOpen(false)}
                                                aria-label="Cerrar"
                                                className="rounded-md border border-neutral-300 bg-white p-2 hover:bg-neutral-50"
                                                title="Cerrar"
                                            >
                                                <X className="size-4 text-neutral-700" />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Formulario de creación colapsable (claro) */}
                                    <div className="mt-3">
                                        <div
                                            className={`grid overflow-hidden transition-all ${creatingOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                                                }`}
                                        >
                                            <div className="min-h-0">
                                                <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4">
                                                    <div className="grid gap-3 md:grid-cols-3">
                                                        <Field label="Nombre" htmlFor="crear-nombre">
                                                            <input
                                                                id="crear-nombre"
                                                                type="text"
                                                                value={createNombre}
                                                                onChange={(e) => setCreateNombre(e.target.value)}
                                                                placeholder="Ej. 2026 - I"
                                                                className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 outline-none placeholder:text-neutral-400 focus:border-neutral-400 focus:ring-2 focus:ring-emerald-500/50"
                                                            />
                                                        </Field>
                                                        <Field
                                                            label="Fecha de inicio"
                                                            htmlFor="crear-inicio"
                                                            icon={<CalendarCheck2 className="size-4 text-neutral-500" />}
                                                        >
                                                            <input
                                                                id="crear-inicio"
                                                                type="date"
                                                                value={createFechaInicio}
                                                                onChange={(e) => setCreateFechaInicio(e.target.value)}
                                                                className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 outline-none focus:border-neutral-400 focus:ring-2 focus:ring-emerald-500/50"
                                                            />
                                                        </Field>
                                                        <Field
                                                            label="Fecha de fin"
                                                            htmlFor="crear-fin"
                                                            icon={<CalendarCheck2 className="size-4 text-neutral-500" />}
                                                        >
                                                            <input
                                                                id="crear-fin"
                                                                type="date"
                                                                value={createFechaFin}
                                                                onChange={(e) => setCreateFechaFin(e.target.value)}
                                                                className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 outline-none focus:border-neutral-400 focus:ring-2 focus:ring-emerald-500/50"
                                                            />
                                                        </Field>
                                                    </div>
                                                    <div className="mt-3 flex items-center gap-2">
                                                        <button
                                                            onClick={handleCrear}
                                                            className="inline-flex items-center gap-2 rounded-md bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-700"
                                                        >
                                                            <Plus className="size-4" />
                                                            Guardar
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                setCreatingOpen(false)
                                                                resetCreateForm()
                                                            }}
                                                            className="inline-flex items-center gap-2 rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm font-medium hover:bg-neutral-50"
                                                        >
                                                            <X className="size-4 text-neutral-700" />
                                                            Cancelar
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </header>

                                {/* Contenido scrollable */}
                                <div className="flex-1 overflow-auto px-6 pb-6 pt-4">
                                    {loading && (
                                        <div className="mb-3 rounded-md border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm text-neutral-700">
                                            Cargando periodos...
                                        </div>
                                    )}
                                    {error && (
                                        <div className="mb-3 flex items-center justify-between rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800">
                                            <span>Error: {error}</span>
                                            <button
                                                onClick={fetchPeriodos}
                                                className="rounded-md bg-rose-600 px-3 py-1 text-white hover:bg-rose-700"
                                            >
                                                Reintentar
                                            </button>
                                        </div>
                                    )}
                                    <div className="rounded-xl border border-neutral-200 bg-white">
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-sm">
                                                <thead className="sticky top-0 z-[1] bg-white">
                                                    <tr className="text-left text-neutral-600 border-b border-neutral-200">
                                                        <Th>
                                                            <HeaderWithIcon
                                                                icon={<CalendarDays className="size-4 text-neutral-600" />}
                                                                text="Nombre"
                                                            />
                                                        </Th>
                                                        <Th>
                                                            <HeaderWithIcon
                                                                icon={<CalendarCheck2 className="size-4 text-neutral-600" />}
                                                                text="Fecha de inicio"
                                                            />
                                                        </Th>
                                                        <Th>
                                                            <HeaderWithIcon
                                                                icon={<CalendarCheck2 className="size-4 text-neutral-600" />}
                                                                text="Fecha de fin"
                                                            />
                                                        </Th>
                                                        <Th>
                                                            <HeaderWithIcon
                                                                icon={<CalendarCheck2 className="size-4 text-neutral-600" />}
                                                                text="Bimestres"
                                                            />
                                                        </Th>
                                                        <Th>
                                                            <HeaderWithIcon
                                                                icon={<ChevronDown className="size-4 rotate-90 text-neutral-600" />}
                                                                text="Acciones"
                                                            />
                                                        </Th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {periodos.map((p) => (
                                                        <tr key={p.id} className="group hover:bg-neutral-50 transition-colors">
                                                            <td className="py-3 pl-4 pr-3 align-middle">
                                                                <div className="flex items-center gap-2">
                                                                    <div className="hidden sm:flex size-6 items-center justify-center rounded-md border border-neutral-200 bg-neutral-50">
                                                                        <CalendarDays className="size-3.5 text-neutral-700" />
                                                                    </div>
                                                                    <span className="font-medium text-neutral-900">{p.nombre}</span>
                                                                </div>
                                                            </td>
                                                            <td className="py-3 px-3 align-middle text-neutral-800">{p.fechaInicio}</td>
                                                            <td className="py-3 px-3 align-middle text-neutral-800">{p.fechaFin}</td>
                                                            <td className="py-3 px-3 align-middle text-neutral-800">4</td>
                                                            <td className="py-3 pl-3 pr-4 align-middle">
                                                                <div className="flex items-center gap-2">
                                                                    <IconButton
                                                                        label="Editar"
                                                                        onClick={() => openEdit(p)}
                                                                        className="border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100"
                                                                    >
                                                                        <PencilLine className="size-4" />
                                                                    </IconButton>
                                                                    <IconButton
                                                                        label="Borrar"
                                                                        onClick={() => handleBorrar(p.id)}
                                                                        className="border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100"
                                                                    >
                                                                        <Trash2 className="size-4" />
                                                                    </IconButton>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ))}

                                                    {periodos.length === 0 && (
                                                        <tr>
                                                            <td className="py-16 text-center text-neutral-600" colSpan={5}>
                                                                <div className="mx-auto flex max-w-md flex-col items-center gap-3">
                                                                    <div className="flex size-12 items-center justify-center rounded-2xl border border-neutral-200 bg-neutral-50">
                                                                        <AlertTriangle className="size-6 text-neutral-600" />
                                                                    </div>
                                                                    <div className="text-sm">
                                                                        No hay periodos académicos. Crea uno nuevo para comenzar.
                                                                    </div>
                                                                    <button
                                                                        onClick={() => setCreatingOpen(true)}
                                                                        className="inline-flex items-center gap-2 rounded-md bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-700"
                                                                    >
                                                                        <Plus className="size-4" />
                                                                        Crear periodo
                                                                    </button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Borde sutil */}
                            <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset ring-neutral-200/70" />
                        </div>

                        {/* Sub-modal de edición dentro del overlay */}
                        {editing.open && editing.data && (
                            <div
                                className="absolute inset-0 z-20 flex items-center justify-center bg-black/30 p-4"
                                aria-labelledby="edit-title"
                                role="dialog"
                                aria-modal="true"
                            >
                                <div className="w-full max-w-xl rounded-2xl border border-neutral-200 bg-white p-5 text-neutral-900 shadow-2xl">
                                    <div className="mb-4 flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="flex size-9 items-center justify-center rounded-lg border border-neutral-200 bg-neutral-50">
                                                <PencilLine className="size-4 text-neutral-700" />
                                            </div>
                                            <h3 id="edit-title" className="text-base font-semibold">
                                                Editar periodo
                                            </h3>
                                        </div>
                                        <button
                                            onClick={closeEdit}
                                            aria-label="Cerrar edición"
                                            className="rounded-md border border-neutral-300 bg-white p-2 hover:bg-neutral-50"
                                        >
                                            <X className="size-4 text-neutral-700" />
                                        </button>
                                    </div>

                                    <div className="grid gap-3 md:grid-cols-3">
                                        <Field label="Nombre" htmlFor="edit-nombre">
                                            <input
                                                id="edit-nombre"
                                                type="text"
                                                value={editing.data.nombre}
                                                onChange={(e) => updateEdit("nombre", e.target.value)}
                                                className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 outline-none placeholder:text-neutral-400 focus:border-neutral-400 focus:ring-2 focus:ring-emerald-500/50"
                                                placeholder="Ej. 2026 - I"
                                            />
                                        </Field>
                                        <Field
                                            label="Fecha de inicio"
                                            htmlFor="edit-inicio"
                                            icon={<CalendarCheck2 className="size-4 text-neutral-500" />}
                                        >
                                            <input
                                                id="edit-inicio"
                                                type="date"
                                                value={editing.data.fechaInicio}
                                                onChange={(e) => updateEdit("fechaInicio", e.target.value)}
                                                className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 outline-none focus:border-neutral-400 focus:ring-2 focus:ring-emerald-500/50"
                                            />
                                        </Field>
                                        <Field
                                            label="Fecha de fin"
                                            htmlFor="edit-fin"
                                            icon={<CalendarCheck2 className="size-4 text-neutral-500" />}
                                        >
                                            <input
                                                id="edit-fin"
                                                type="date"
                                                value={editing.data.fechaFin}
                                                onChange={(e) => updateEdit("fechaFin", e.target.value)}
                                                className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 outline-none focus:border-neutral-400 focus:ring-2 focus:ring-emerald-500/50"
                                            />
                                        </Field>
                                    </div>

                                    <div className="mt-4 flex items-center justify-end gap-2">
                                        <button
                                            onClick={saveEdit}
                                            className="inline-flex items-center gap-2 rounded-md bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-700"
                                        >
                                            <PencilLine className="size-4" />
                                            Guardar cambios
                                        </button>
                                        <button
                                            onClick={closeEdit}
                                            className="inline-flex items-center gap-2 rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm font-medium hover:bg-neutral-50"
                                        >
                                            <X className="size-4 text-neutral-700" />
                                            Cancelar
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                    </div>
                </div>
            )}
        </div>
    )
}

function Th({ children }: { children: React.ReactNode }) {
    return <th className="py-3 px-3 text-xs uppercase tracking-wide">{children}</th>
}

function HeaderWithIcon({ icon, text }: { icon: React.ReactNode; text: string }) {
    return (
        <div className="flex items-center gap-2">
            <span>{icon}</span>
            <span>{text}</span>
        </div>
    )
}

function IconButton({
    children,
    onClick,
    label,
    className = "",
}: {
    children: React.ReactNode
    onClick?: () => void
    label: string
    className?: string
}) {
    return (
        <button
            onClick={onClick}
            className={`inline-flex items-center justify-center gap-2 rounded-md border px-3 py-2 text-sm font-medium transition-colors ${className}`}
            title={label}
            aria-label={label}
        >
            {children}
            <span className="sr-only">{label}</span>
        </button>
    )
}

function Field({
    label,
    htmlFor,
    icon,
    children,
}: {
    label: string
    htmlFor: string
    icon?: React.ReactNode
    children: React.ReactNode
}) {
    return (
        <div className="grid gap-1">
            <label htmlFor={htmlFor} className="flex items-center gap-2 text-xs text-neutral-700">
                {icon && <span>{icon}</span>}
                <span>{label}</span>
            </label>
            {children}
        </div>
    )
}
