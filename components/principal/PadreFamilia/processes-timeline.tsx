"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
    Clock,
    FileText,
    GraduationCap,
    ClipboardCheck,
    Award,
    ArrowRight,
    Play,
    Pause,
    CheckCircle2,
} from "lucide-react"
import { useLayoutEffect, useRef, useState } from "react"
import { gsap } from "gsap"
import { CalendarIcon } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { StudentRegistrationForm } from "./student-registration-form"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"

interface ProcessesTimelineProps {
    language: string
    activeStudent: any
    onProcessSelect: (processId: string) => void
}

// Definición de procesos en orden cronológico
const timelineProcesses = [
    {
        id: "enrollment",
        titleEs: "Inscripción",
        titleEn: "Enrollment",
        descriptionEs: "Formulario con información del estudiante, padre y madre por pasos",
        descriptionEn: "Step-by-step form with student, father and mother information",
        icon: GraduationCap,
        status: "in_progress",
        progress: 60,
        date: "2024-01-15",
        dueDate: "2024-02-15",
        color: "bg-blue-500",
        documents: 0,
        steps: [
            { nameEs: "Datos del estudiante", nameEn: "Student data", completed: true },
            { nameEs: "Información del padre", nameEn: "Father information", completed: true },
            { nameEs: "Información de la madre", nameEn: "Mother information", completed: false },
            { nameEs: "Revisión final", nameEn: "Final review", completed: false },
        ],
    },
    {
        id: "documentation",
        titleEs: "Documentación",
        titleEn: "Documentation",
        descriptionEs: "Subir documentos requeridos: fotografía 3x4, documento de procedencia, certificados",
        descriptionEn: "Upload required documents: 3x4 photo, origin document, certificates",
        icon: FileText,
        status: "pending",
        progress: 25,
        date: "2024-02-16",
        dueDate: "2024-03-01",
        color: "bg-green-500",
        documents: 4,
        steps: [
            { nameEs: "Fotografía 3x4", nameEn: "3x4 Photo", completed: true },
            { nameEs: "Documento de procedencia", nameEn: "Origin document", completed: false },
            { nameEs: "Certificado de notas", nameEn: "Grade certificate", completed: false },
            { nameEs: "Certificado médico", nameEn: "Medical certificate", completed: false },
        ],
    },
    {
        id: "evaluation",
        titleEs: "Evaluación",
        titleEn: "Evaluation",
        descriptionEs: "Calendario para agendar fecha de presentación de la evaluación académica",
        descriptionEn: "Calendar to schedule academic evaluation presentation date",
        icon: ClipboardCheck,
        status: "upcoming",
        progress: 0,
        date: "2024-03-02",
        dueDate: "2024-03-15",
        color: "bg-yellow-500",
        documents: 0,
        steps: [
            { nameEs: "Fecha disponible", nameEn: "Available date", completed: false },
            { nameEs: "Evaluación agendada", nameEn: "Evaluation scheduled", completed: false },
            { nameEs: "Evaluación completada", nameEn: "Evaluation completed", completed: false },
        ],
    },
    {
        id: "interview",
        titleEs: "Entrevista",
        titleEn: "Interview",
        descriptionEs: "Calendario para agendar fecha de presentación de la entrevista familiar",
        descriptionEn: "Calendar to schedule family interview presentation date",
        icon: CalendarIcon,
        status: "upcoming",
        progress: 0,
        date: "2024-03-16",
        dueDate: "2024-03-30",
        color: "bg-purple-500",
        documents: 0,
        steps: [
            { nameEs: "Fecha disponible", nameEn: "Available date", completed: false },
            { nameEs: "Entrevista agendada", nameEn: "Interview scheduled", completed: false },
            { nameEs: "Entrevista completada", nameEn: "Interview completed", completed: false },
        ],
    },
    {
        id: "pre-enrollment",
        titleEs: "Prematrícula",
        titleEn: "Pre-enrollment",
        descriptionEs: "Formulario SIMAT y opción de pago de matrícula para finalizar el proceso",
        descriptionEn: "SIMAT form and tuition payment option to finalize the process",
        icon: Award,
        status: "upcoming",
        progress: 0,
        date: "2024-04-01",
        dueDate: "2024-04-15",
        color: "bg-red-500",
        documents: 1,
        steps: [
            { nameEs: "Formulario SIMAT", nameEn: "SIMAT form", completed: false },
            { nameEs: "Pago de matrícula", nameEn: "Tuition payment", completed: false },
            { nameEs: "Proceso finalizado", nameEn: "Process completed", completed: false },
        ],
    },
]

// Función para obtener configuración de estado
function getStatusConfig(status: string, language: string) {
    const isSpanish = language === "es"

    const configs = {
        completed: {
            variant: "default" as const,
            label: isSpanish ? "Completado" : "Completed",
            icon: CheckCircle2,
            bgColor: "bg-green-50 dark:bg-green-950",
            borderColor: "border-green-200 dark:border-green-800",
            textColor: "text-green-700 dark:text-green-300",
        },
        in_progress: {
            variant: "default" as const,
            label: isSpanish ? "En Progreso" : "In Progress",
            icon: Play,
            bgColor: "bg-blue-50 dark:bg-blue-950",
            borderColor: "border-blue-200 dark:border-blue-800",
            textColor: "text-blue-700 dark:text-blue-300",
        },
        pending: {
            variant: "outline" as const,
            label: isSpanish ? "Pendiente" : "Pending",
            icon: Pause,
            bgColor: "bg-yellow-50 dark:bg-yellow-950",
            borderColor: "border-yellow-200 dark:border-yellow-800",
            textColor: "text-yellow-700 dark:text-yellow-300",
        },
        upcoming: {
            variant: "secondary" as const,
            label: isSpanish ? "Próximo" : "Upcoming",
            icon: Clock,
            bgColor: "bg-gray-50 dark:bg-gray-950",
            borderColor: "border-gray-200 dark:border-gray-800",
            textColor: "text-gray-700 dark:text-gray-300",
        },
    }

    return configs[status as keyof typeof configs] || configs.pending
}

export function ProcessesTimeline({ language, activeStudent, onProcessSelect }: ProcessesTimelineProps) {
    const containerRef = useRef<HTMLDivElement>(null)
    const timelineRef = useRef<HTMLDivElement>(null)

    const isSpanish = language === "es"
    const [selectedProcess, setSelectedProcess] = useState<string | null>(null)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isDocumentModalOpen, setIsDocumentModalOpen] = useState(false)
    const [isEvaluationModalOpen, setIsEvaluationModalOpen] = useState(false)
    const [uploadedFiles, setUploadedFiles] = useState<{ [key: string]: File | null }>({
        photo: null,
        origin: null,
        grades: null,
        medical: null,
    })
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
    const [isCalendarModalOpen, setIsCalendarModalOpen] = useState(false)
    const [selectedProcessForCalendar, setSelectedProcessForCalendar] = useState<any>(null)
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)
    const [selectedProcessForPayment, setSelectedProcessForPayment] = useState<any>(null)

    const handleFileUpload = (fileType: string, file: File) => {
        setUploadedFiles((prev) => ({
            ...prev,
            [fileType]: file,
        }))
    }

    useLayoutEffect(() => {
        const ctx = gsap.context(() => {
            const tl = gsap.timeline()

            // Animación del header
            tl.fromTo(".timeline-header", { opacity: 0, y: -30 }, { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" })

            // Animación de las tarjetas de la timeline
            tl.fromTo(
                ".timeline-item",
                { opacity: 0, x: -50, scale: 0.9 },
                {
                    opacity: 1,
                    x: 0,
                    scale: 1,
                    duration: 0.6,
                    stagger: 0.15,
                    ease: "power2.out",
                },
                "-=0.4",
            )

            // Animación de la línea de conexión
            tl.fromTo(".timeline-line", { scaleY: 0 }, { scaleY: 1, duration: 1, ease: "power2.inOut" }, "-=0.8")
        }, containerRef)

        return () => ctx.revert()
    }, [])

    const handleProcessClick = (processId: string) => {
        const process = timelineProcesses.find((p) => p.id === processId)
        if (processId === "enrollment") {
            setSelectedProcess(processId)
            setIsModalOpen(true)
        } else if (processId === "documentation") {
            setSelectedProcess(processId)
            setIsDocumentModalOpen(true)
        } else if (processId === "pre-enrollment") {
            // Para prematrícula, abrir modal de pago
            setSelectedProcessForPayment(process)
            setIsPaymentModalOpen(true)
        } else {
            // Para todos los demás procesos, abrir el modal de calendario
            setSelectedProcessForCalendar(process)
            setIsCalendarModalOpen(true)
        }
    }

    const handleModalClose = () => {
        setIsModalOpen(false)
        setSelectedProcess(null)
    }

    const handleDocumentModalClose = () => {
        setIsDocumentModalOpen(false)
        setSelectedProcess(null)
    }

    const handleEvaluationModalClose = () => {
        setIsEvaluationModalOpen(false)
        setSelectedProcess(null)
    }

    const handleCalendarModalClose = () => {
        setIsCalendarModalOpen(false)
        setSelectedProcessForCalendar(null)
    }

    const handlePaymentModalClose = () => {
        setIsPaymentModalOpen(false)
        setSelectedProcessForPayment(null)
    }

    const handleFormComplete = (data: any) => {
        console.log("Formulario completado:", data)
        setIsModalOpen(false)
        setSelectedProcess(null)
        // Aquí puedes actualizar el estado del proceso
    }

    return (
        <div className="w-full max-w-full overflow-hidden" ref={containerRef}>
            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6 pt-0 w-full">
                {/* Header */}
                <div className="timeline-header space-y-2">
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
                        {isSpanish ? "Línea de Tiempo de Procesos" : "Processes Timeline"}
                    </h1>
                    <p className="text-muted-foreground text-sm md:text-base">
                        {isSpanish
                            ? `Sigue el progreso de los procesos académicos de ${activeStudent.firstName}`
                            : `Track ${activeStudent.firstName}'s academic processes progress`}
                    </p>
                </div>

                {/* Estadísticas rápidas */}
                <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
                    <Card className="timeline-header">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 md:p-6 md:pb-2">
                            <CardTitle className="text-xs md:text-sm font-medium">
                                {isSpanish ? "Completados" : "Completed"}
                            </CardTitle>
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                        </CardHeader>
                        <CardContent className="p-3 md:p-6 pt-0">
                            <div className="text-xl md:text-2xl font-bold text-green-600">
                                {timelineProcesses.filter((p) => p.status === "completed").length}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="timeline-header">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 md:p-6 md:pb-2">
                            <CardTitle className="text-xs md:text-sm font-medium">
                                {isSpanish ? "En Progreso" : "In Progress"}
                            </CardTitle>
                            <Play className="h-4 w-4 text-blue-500" />
                        </CardHeader>
                        <CardContent className="p-3 md:p-6 pt-0">
                            <div className="text-xl md:text-2xl font-bold text-blue-600">
                                {timelineProcesses.filter((p) => p.status === "in_progress").length}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="timeline-header">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 md:p-6 md:pb-2">
                            <CardTitle className="text-xs md:text-sm font-medium">{isSpanish ? "Pendientes" : "Pending"}</CardTitle>
                            <Pause className="h-4 w-4 text-yellow-500" />
                        </CardHeader>
                        <CardContent className="p-3 md:p-6 pt-0">
                            <div className="text-xl md:text-2xl font-bold text-yellow-600">
                                {timelineProcesses.filter((p) => p.status === "pending").length}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="timeline-header">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 md:p-6 md:pb-2">
                            <CardTitle className="text-xs md:text-sm font-medium">{isSpanish ? "Próximos" : "Upcoming"}</CardTitle>
                            <Clock className="h-4 w-4 text-purple-500" />
                        </CardHeader>
                        <CardContent className="p-3 md:p-6 pt-0">
                            <div className="text-xl md:text-2xl font-bold text-purple-600">
                                {timelineProcesses.filter((p) => p.status === "upcoming").length}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Timeline Circular */}
                <div className="relative" ref={timelineRef}>
                    {/* Contenedor circular */}
                    <div className="flex flex-col lg:flex-row lg:flex-wrap justify-center items-center gap-8 md:gap-12 p-8 w-full mx-auto">
                        {timelineProcesses.map((process, index) => {
                            const statusConfig = getStatusConfig(process.status, language)
                            const StatusIcon = statusConfig.icon
                            const ProcessIcon = process.icon
                            const isActive = process.status === "in_progress"
                            const isCompleted = process.status === "completed"

                            return (
                                <div
                                    key={process.id}
                                    className="timeline-item relative flex flex-col items-center w-full max-w-xs lg:max-w-sm"
                                >
                                    {/* Línea de conexión entre círculos */}
                                    {index < timelineProcesses.length - 1 && (
                                        <>
                                            {/* Línea horizontal para desktop */}
                                            <div className="absolute top-1/2 left-full w-12 md:w-16 h-0.5 bg-border transform -translate-y-1/2 z-0 hidden lg:block" />
                                            {/* Línea vertical para móvil */}
                                            <div className="absolute top-full left-1/2 w-0.5 h-12 bg-border transform -translate-x-1/2 z-0 block lg:hidden" />
                                        </>
                                    )}

                                    {/* Círculo principal */}
                                    <div className="relative z-10">
                                        <div
                                            className={`
      w-24 h-24 md:w-28 md:h-28 rounded-full flex items-center justify-center cursor-pointer
      transition-all duration-300 hover:scale-110 hover:shadow-xl
      ${isCompleted
                                                    ? "bg-green-500 shadow-green-500/30"
                                                    : isActive
                                                        ? "bg-blue-500 shadow-blue-500/30"
                                                        : "bg-gray-600 shadow-gray-500/20"
                                                }
      shadow-lg
    `}
                                            onClick={() => handleProcessClick(process.id)}
                                        >
                                            <ProcessIcon className="h-10 w-10 md:h-12 md:w-12 text-white" />
                                        </div>
                                    </div>

                                    {/* Información del proceso */}
                                    <div className="mt-4 text-center w-full max-w-xs px-2">
                                        <h3 className="font-semibold text-base md:text-lg mb-2 leading-tight">
                                            {isSpanish ? process.titleEs : process.titleEn}
                                        </h3>
                                        <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
                                            {isSpanish
                                                ? process.descriptionEs.substring(0, 80) + "..."
                                                : process.descriptionEn.substring(0, 80) + "..."}
                                        </p>

                                        {/* Fecha */}
                                        <div className="text-xs text-muted-foreground mb-2">
                                            {new Date(process.date).toLocaleDateString()}
                                        </div>

                                        {/* Pasos completados */}
                                        <div className="flex justify-center gap-1 mb-3">
                                            {process.steps.map((step, stepIndex) => (
                                                <div
                                                    key={stepIndex}
                                                    className={`w-2 h-2 rounded-full ${step.completed ? "bg-green-500" : "bg-gray-400"}`}
                                                    title={isSpanish ? step.nameEs : step.nameEn}
                                                />
                                            ))}
                                        </div>

                                        {/* Botón de acción */}
                                        <Button
                                            variant={isActive ? "default" : "outline"}
                                            size="default"
                                            className="text-sm px-4 py-2 w-full max-w-32"
                                            onClick={() => handleProcessClick(process.id)}
                                        >
                                            {isActive ? (
                                                <>
                                                    <Play className="h-3 w-3 mr-1" />
                                                    {isSpanish ? "Continuar" : "Continue"}
                                                </>
                                            ) : isCompleted ? (
                                                <>
                                                    <CheckCircle2 className="h-3 w-3 mr-1" />
                                                    {isSpanish ? "Ver" : "View"}
                                                </>
                                            ) : (
                                                <>
                                                    <ArrowRight className="h-3 w-3 mr-1" />
                                                    {isSpanish ? "Iniciar" : "Start"}
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            )
                        })}
                    </div>

                    {/* Leyenda */}
                    <div className="mt-8 flex justify-center">
                        <div className="flex flex-wrap gap-4 text-sm">
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 rounded-full bg-green-500"></div>
                                <span>{isSpanish ? "Completado" : "Completed"}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 rounded-full bg-blue-500 animate-pulse"></div>
                                <span>{isSpanish ? "En Progreso" : "In Progress"}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 rounded-full bg-gray-600"></div>
                                <span>{isSpanish ? "Pendiente" : "Pending"}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* Modal para formulario de inscripción */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="text-2xl">
                            {isSpanish ? "Formulario de Inscripción" : "Enrollment Form"}
                        </DialogTitle>
                        <DialogDescription>
                            {isSpanish
                                ? "Complete la información del estudiante, padre y madre para continuar con el proceso de inscripción"
                                : "Complete student, father and mother information to continue with the enrollment process"}
                        </DialogDescription>
                    </DialogHeader>
                    <StudentRegistrationForm language={language} onComplete={handleFormComplete} />
                </DialogContent>
            </Dialog>
            {/* Modal para subir documentos */}
            <Dialog open={isDocumentModalOpen} onOpenChange={setIsDocumentModalOpen}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="text-2xl">
                            {isSpanish ? "Subir Documentos Requeridos" : "Upload Required Documents"}
                        </DialogTitle>
                        <DialogDescription>
                            {isSpanish
                                ? "Sube los documentos necesarios para completar el proceso de documentación"
                                : "Upload the necessary documents to complete the documentation process"}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4">
                        {/* Fotografía 3x4 */}
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition-colors">
                            <input
                                type="file"
                                id="photo-upload"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                    const file = e.target.files?.[0]
                                    if (file) handleFileUpload("photo", file)
                                }}
                            />
                            <div className="flex flex-col items-center space-y-2">
                                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                                    <FileText className="h-6 w-6 text-blue-600" />
                                </div>
                                <h3 className="font-semibold">{isSpanish ? "Fotografía 3x4" : "3x4 Photo"}</h3>
                                <p className="text-sm text-muted-foreground">
                                    {isSpanish ? "Sube una fotografía reciente tamaño 3x4" : "Upload a recent 3x4 size photo"}
                                </p>
                                {uploadedFiles.photo ? (
                                    <div className="text-sm text-green-600 font-medium">✓ {uploadedFiles.photo.name}</div>
                                ) : null}
                                <Button variant="outline" size="sm" onClick={() => document.getElementById("photo-upload")?.click()}>
                                    {isSpanish ? "Seleccionar archivo" : "Select file"}
                                </Button>
                            </div>
                        </div>

                        {/* Documento de Procedencia */}
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition-colors">
                            <input
                                type="file"
                                id="origin-upload"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                    const file = e.target.files?.[0]
                                    if (file) handleFileUpload("origin", file)
                                }}
                            />
                            <div className="flex flex-col items-center space-y-2">
                                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                                    <FileText className="h-6 w-6 text-green-600" />
                                </div>
                                <h3 className="font-semibold">{isSpanish ? "Documento de Procedencia" : "Origin Document"}</h3>
                                <p className="text-sm text-muted-foreground">
                                    {isSpanish
                                        ? "Documento que certifica la institución de procedencia"
                                        : "Document certifying the origin institution"}
                                </p>
                                {uploadedFiles.origin ? (
                                    <div className="text-sm text-green-600 font-medium">✓ {uploadedFiles.origin.name}</div>
                                ) : null}
                                <Button variant="outline" size="sm" onClick={() => document.getElementById("origin-upload")?.click()}>
                                    {isSpanish ? "Seleccionar archivo" : "Select file"}
                                </Button>
                            </div>
                        </div>

                        {/* Certificado de Notas */}
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition-colors">
                            <input
                                type="file"
                                id="grades-upload"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                    const file = e.target.files?.[0]
                                    if (file) handleFileUpload("grades", file)
                                }}
                            />
                            <div className="flex flex-col items-center space-y-2">
                                <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                                    <GraduationCap className="h-6 w-6 text-yellow-600" />
                                </div>
                                <h3 className="font-semibold">{isSpanish ? "Certificado de Notas" : "Grade Certificate"}</h3>
                                <p className="text-sm text-muted-foreground">
                                    {isSpanish
                                        ? "Certificado oficial de calificaciones del último año cursado"
                                        : "Official grade certificate from the last academic year"}
                                </p>
                                {uploadedFiles.grades ? (
                                    <div className="text-sm text-green-600 font-medium">✓ {uploadedFiles.grades.name}</div>
                                ) : null}
                                <Button variant="outline" size="sm" onClick={() => document.getElementById("grades-upload")?.click()}>
                                    {isSpanish ? "Seleccionar archivo" : "Select file"}
                                </Button>
                            </div>
                        </div>

                        {/* Certificado Médico */}
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition-colors">
                            <input
                                type="file"
                                id="medical-upload"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                    const file = e.target.files?.[0]
                                    if (file) handleFileUpload("medical", file)
                                }}
                            />
                            <div className="flex flex-col items-center space-y-2">
                                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                                    <ClipboardCheck className="h-6 w-6 text-red-600" />
                                </div>
                                <h3 className="font-semibold">{isSpanish ? "Certificado Médico" : "Medical Certificate"}</h3>
                                <p className="text-sm text-muted-foreground">
                                    {isSpanish
                                        ? "Certificado médico vigente que acredite el estado de salud"
                                        : "Valid medical certificate proving health status"}
                                </p>
                                {uploadedFiles.medical ? (
                                    <div className="text-sm text-green-600 font-medium">✓ {uploadedFiles.medical.name}</div>
                                ) : null}
                                <Button variant="outline" size="sm" onClick={() => document.getElementById("medical-upload")?.click()}>
                                    {isSpanish ? "Seleccionar archivo" : "Select file"}
                                </Button>
                            </div>
                        </div>

                        {/* Botones de acción */}
                        <div className="flex justify-end space-x-4 pt-4 border-t md:col-span-2">
                            <Button variant="outline" onClick={handleDocumentModalClose}>
                                {isSpanish ? "Cancelar" : "Cancel"}
                            </Button>
                            <Button onClick={handleDocumentModalClose}>{isSpanish ? "Guardar Documentos" : "Save Documents"}</Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
            {/* Modal para agendar evaluación */}
            <Dialog open={isEvaluationModalOpen} onOpenChange={setIsEvaluationModalOpen}>
                <DialogContent className="max-w-6xl max-h-[95vh] overflow-y-auto">
                    <DialogHeader className="pb-4 border-b">
                        <DialogTitle className="text-2xl font-bold text-center bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                            {isSpanish ? "Agendar Evaluación Académica" : "Schedule Academic Evaluation"}
                        </DialogTitle>
                        <DialogDescription className="text-center text-base text-gray-600 mt-2">
                            {isSpanish
                                ? "Configura tu cita de evaluación seleccionando fecha, hora y modalidad"
                                : "Set up your evaluation appointment by selecting date, time and modality"}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="p-6 space-y-6">
                        {/* Banner de información importante - más compacto */}
                        <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl p-4 shadow-lg">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                                    <ClipboardCheck className="h-5 w-5" />
                                </div>
                                <h3 className="text-lg font-bold">{isSpanish ? "Información Importante" : "Important Information"}</h3>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                                <div className="flex items-center gap-2">
                                    <Clock className="h-3 w-3" />
                                    <span>{isSpanish ? "Puntualidad esencial" : "Punctuality essential"}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <CalendarIcon className="h-3 w-3" />
                                    <span>{isSpanish ? "Duración: 2 horas" : "Duration: 2 hours"}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <GraduationCap className="h-3 w-3" />
                                    <span>{isSpanish ? "Modalidad flexible" : "Flexible modality"}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <FileText className="h-3 w-3" />
                                    <span>{isSpanish ? "Traer documento ID" : "Bring ID document"}</span>
                                </div>
                            </div>
                        </div>

                        {/* Layout principal mejorado */}
                        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
                            {/* Sección de modalidad - ahora primera */}
                            <div className="xl:col-span-1 order-1">
                                <div className="bg-gray-50 rounded-xl p-4 h-fit">
                                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                        <ClipboardCheck className="h-5 w-5 text-purple-600" />
                                        {isSpanish ? "Modalidad" : "Modality"}
                                    </h3>

                                    <div className="space-y-3">
                                        <label htmlFor="modalidad-select" className="block text-sm font-medium text-gray-700">
                                            {isSpanish ? "Seleccionar tipo" : "Select type"}
                                        </label>
                                        <select
                                            id="modalidad-select"
                                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                                            defaultValue="presencial"
                                        >
                                            <option value="presencial">{isSpanish ? "🏫 Presencial" : "🏫 In-Person"}</option>
                                            <option value="virtual">{isSpanish ? "💻 Virtual" : "💻 Virtual"}</option>
                                        </select>

                                        <div className="text-xs text-gray-500 bg-white p-3 rounded-lg border">
                                            <p className="font-medium mb-1">{isSpanish ? "Modalidad Presencial:" : "In-Person Modality:"}</p>
                                            <p>{isSpanish ? "En las instalaciones del colegio" : "At school facilities"}</p>
                                            <p className="font-medium mb-1 mt-2">{isSpanish ? "Modalidad Virtual:" : "Virtual Modality:"}</p>
                                            <p>{isSpanish ? "Evaluación en línea desde casa" : "Online evaluation from home"}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Calendario - sección principal */}
                            <div className="xl:col-span-2 order-2">
                                <div className="bg-white rounded-xl border shadow-sm p-4">
                                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                        <CalendarIcon className="h-5 w-5 text-blue-600" />
                                        {isSpanish ? "Seleccionar Fecha y Hora" : "Select Date and Time"}
                                    </h3>

                                    <div className="space-y-4">
                                        {/* Calendario */}
                                        <div className="flex justify-center">
                                            <CalendarComponent
                                                mode="single"
                                                selected={selectedDate}
                                                onSelect={(date) => {
                                                    setSelectedDate(date)
                                                    console.log("Fecha seleccionada:", date)
                                                }}
                                                className="rounded-lg border-0 shadow-none"
                                                disabled={(date) => {
                                                    const today = new Date()
                                                    today.setHours(0, 0, 0, 0)
                                                    const dayOfWeek = date.getDay()
                                                    return date < today || dayOfWeek === 0 || dayOfWeek === 6
                                                }}
                                                modifiers={{
                                                    available: [
                                                        new Date(2024, 2, 5),
                                                        new Date(2024, 2, 7),
                                                        new Date(2024, 2, 12),
                                                        new Date(2024, 2, 14),
                                                        new Date(2024, 2, 15),
                                                    ],
                                                }}
                                                modifiersStyles={{
                                                    available: {
                                                        backgroundColor: "#dbeafe",
                                                        color: "#1d4ed8",
                                                        fontWeight: "bold",
                                                    },
                                                }}
                                            />
                                        </div>

                                        {/* Horarios disponibles */}
                                        <div>
                                            <h4 className="font-semibold mb-3 text-center text-sm">
                                                {isSpanish ? "Horarios Disponibles" : "Available Times"}
                                            </h4>
                                            <div className="grid grid-cols-2 gap-2">
                                                {[
                                                    { time: "09:00 AM", available: true },
                                                    { time: "10:30 AM", available: true },
                                                    { time: "02:00 PM", available: false },
                                                    { time: "03:30 PM", available: true },
                                                ].map((slot, index) => (
                                                    <button
                                                        key={index}
                                                        disabled={!slot.available}
                                                        className={`p-2 rounded-lg border text-xs font-medium transition-all ${slot.available
                                                            ? "border-blue-200 hover:border-blue-400 hover:bg-blue-50 text-blue-700"
                                                            : "border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed"
                                                            }`}
                                                    >
                                                        {slot.time}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Panel de detalles - más compacto */}
                            <div className="xl:col-span-1 order-3">
                                <div className="bg-gradient-to-b from-purple-50 to-blue-50 rounded-xl p-4 h-fit">
                                    <h3 className="text-lg font-bold mb-4 text-purple-700">{isSpanish ? "Resumen" : "Summary"}</h3>

                                    <div className="space-y-3">
                                        <div className="bg-white rounded-lg p-3 border-l-4 border-l-green-500">
                                            <div className="flex items-center gap-2 mb-1">
                                                <Clock className="h-4 w-4 text-green-600" />
                                                <h4 className="font-semibold text-sm">{isSpanish ? "Duración" : "Duration"}</h4>
                                            </div>
                                            <p className="text-xs text-gray-600">
                                                {isSpanish ? "2 horas (incluye descanso)" : "2 hours (includes break)"}
                                            </p>
                                        </div>

                                        <div className="bg-white rounded-lg p-3 border-l-4 border-l-yellow-500">
                                            <div className="flex items-center gap-2 mb-1">
                                                <Clock className="h-4 w-4 text-yellow-600" />
                                                <h4 className="font-semibold text-sm text-yellow-800">
                                                    {isSpanish ? "Recordatorio" : "Reminder"}
                                                </h4>
                                            </div>
                                            <p className="text-xs text-yellow-700">
                                                {isSpanish ? "Llegar 15 min antes" : "Arrive 15 min early"}
                                            </p>
                                        </div>

                                        <div className="bg-blue-100 rounded-lg p-3 text-center">
                                            <p className="text-xs text-blue-700 font-medium">
                                                {isSpanish ? "📅 Selecciona fechas marcadas en azul" : "📅 Select dates marked in blue"}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Botones de acción - mejorados */}
                        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4 border-t bg-gray-50 -mx-6 px-6 py-4 rounded-b-xl">
                            <div className="text-sm text-gray-600 flex items-center gap-2">
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                {isSpanish ? "Confirmación automática por email" : "Automatic email confirmation"}
                            </div>
                            <div className="flex gap-3">
                                <Button variant="outline" size="lg" onClick={handleEvaluationModalClose} className="min-w-[100px]">
                                    {isSpanish ? "Cancelar" : "Cancel"}
                                </Button>
                                <Button
                                    size="lg"
                                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 min-w-[140px]"
                                    onClick={handleEvaluationModalClose}
                                >
                                    <CalendarIcon className="h-4 w-4 mr-2" />
                                    {isSpanish ? "Confirmar Cita" : "Confirm"}
                                </Button>
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
            {/* Modal de calendario general */}
            <Dialog open={isCalendarModalOpen} onOpenChange={setIsCalendarModalOpen}>
                <DialogContent className="max-w-6xl max-h-[95vh] overflow-y-auto">
                    <DialogHeader className="pb-4 border-b">
                        <DialogTitle className="text-2xl font-bold text-center bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                            {selectedProcessForCalendar &&
                                (isSpanish ? selectedProcessForCalendar.titleEs : selectedProcessForCalendar.titleEn)}
                        </DialogTitle>
                        <DialogDescription className="text-center text-base text-gray-600 mt-2">
                            {selectedProcessForCalendar &&
                                (isSpanish ? selectedProcessForCalendar.descriptionEs : selectedProcessForCalendar.descriptionEn)}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="p-4 space-y-4">
                        {/* Información del proceso */}
                        <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl p-4 shadow-lg">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                                    {selectedProcessForCalendar && <selectedProcessForCalendar.icon className="h-5 w-5" />}
                                </div>
                                <h3 className="text-lg font-bold">{isSpanish ? "Información del Proceso" : "Process Information"}</h3>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                                <div className="flex items-center gap-2">
                                    <Clock className="h-3 w-3" />
                                    <span>
                                        {isSpanish ? "Fecha límite" : "Due date"}:{" "}
                                        {selectedProcessForCalendar && new Date(selectedProcessForCalendar.dueDate).toLocaleDateString()}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <CalendarIcon className="h-3 w-3" />
                                    <span>
                                        {isSpanish ? "Estado" : "Status"}:{" "}
                                        {selectedProcessForCalendar && getStatusConfig(selectedProcessForCalendar.status, language).label}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <FileText className="h-3 w-3" />
                                    <span>
                                        {isSpanish ? "Documentos" : "Documents"}: {selectedProcessForCalendar?.documents || 0}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Calendario */}
                        <div className="bg-white rounded-xl border shadow-sm p-6">
                            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                <CalendarIcon className="h-5 w-5 text-blue-600" />
                                {isSpanish ? "Seleccionar Fecha" : "Select Date"}
                            </h3>

                            <div className="flex justify-center">
                                <CalendarComponent
                                    mode="single"
                                    selected={selectedDate}
                                    onSelect={(date) => {
                                        setSelectedDate(date)
                                        console.log("Fecha seleccionada:", date)
                                    }}
                                    className="rounded-lg border-0 shadow-none"
                                    disabled={(date) => {
                                        const today = new Date()
                                        today.setHours(0, 0, 0, 0)
                                        const dayOfWeek = date.getDay()
                                        return date < today || dayOfWeek === 0 || dayOfWeek === 6
                                    }}
                                    modifiers={{
                                        available: [
                                            new Date(2024, 2, 5),
                                            new Date(2024, 2, 7),
                                            new Date(2024, 2, 12),
                                            new Date(2024, 2, 14),
                                            new Date(2024, 2, 15),
                                        ],
                                    }}
                                    modifiersStyles={{
                                        available: {
                                            backgroundColor: "#dbeafe",
                                            color: "#1d4ed8",
                                            fontWeight: "bold",
                                        },
                                    }}
                                />
                            </div>

                            {/* Información de fecha seleccionada */}
                            {selectedDate && (
                                <div className="mt-4 p-4 bg-blue-50 rounded-lg text-center">
                                    <p className="text-blue-700 font-medium">
                                        {isSpanish ? "Fecha seleccionada" : "Selected date"}: {selectedDate.toLocaleDateString()}
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Horarios disponibles */}
                        <div className="mt-6">
                            <h4 className="font-semibold mb-3 text-center text-sm">
                                {isSpanish ? "Horarios Disponibles" : "Available Times"}
                            </h4>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                {[
                                    { time: "09:00 AM", available: true },
                                    { time: "10:30 AM", available: true },
                                    { time: "02:00 PM", available: false },
                                    { time: "03:30 PM", available: true },
                                    { time: "04:00 PM", available: true },
                                    { time: "05:30 PM", available: false },
                                ].map((slot, index) => (
                                    <button
                                        key={index}
                                        disabled={!slot.available}
                                        className={`p-2 rounded-lg border text-xs font-medium transition-all ${slot.available
                                            ? "border-blue-200 hover:border-blue-400 hover:bg-blue-50 text-blue-700"
                                            : "border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed"
                                            }`}
                                    >
                                        {slot.time}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Botones de acción */}
                        <div className="flex justify-end gap-3 pt-4 border-t">
                            <Button variant="outline" size="lg" onClick={handleCalendarModalClose}>
                                {isSpanish ? "Cancelar" : "Cancel"}
                            </Button>
                            <Button
                                size="lg"
                                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                                onClick={handleCalendarModalClose}
                            >
                                <CalendarIcon className="h-4 w-4 mr-2" />
                                {isSpanish ? "Confirmar" : "Confirm"}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
            {/* Modal de pago */}
            <Dialog open={isPaymentModalOpen} onOpenChange={setIsPaymentModalOpen}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader className="pb-4 border-b">
                        <DialogTitle className="text-2xl font-bold text-center bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                            {isSpanish ? "Pago de Matrícula" : "Tuition Payment"}
                        </DialogTitle>
                        <DialogDescription className="text-center text-base text-gray-600 mt-2">
                            {isSpanish
                                ? "Complete el pago de matrícula para finalizar el proceso de inscripción"
                                : "Complete tuition payment to finalize the enrollment process"}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="p-6 space-y-6">
                        {/* Información del pago */}
                        <div className="bg-gradient-to-r from-green-500 to-blue-600 text-white rounded-xl p-4 shadow-lg">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                                    <Award className="h-5 w-5" />
                                </div>
                                <h3 className="text-lg font-bold">{isSpanish ? "Detalles del Pago" : "Payment Details"}</h3>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                <div className="bg-white/10 rounded-lg p-3">
                                    <p className="font-semibold">{isSpanish ? "Concepto" : "Concept"}</p>
                                    <p>{isSpanish ? "Matrícula Académica" : "Academic Tuition"}</p>
                                </div>
                                <div className="bg-white/10 rounded-lg p-3">
                                    <p className="font-semibold">{isSpanish ? "Monto" : "Amount"}</p>
                                    <p className="text-xl font-bold">$850.000 COP</p>
                                </div>
                                <div className="bg-white/10 rounded-lg p-3">
                                    <p className="font-semibold">{isSpanish ? "Vencimiento" : "Due Date"}</p>
                                    <p>{new Date(2024, 3, 15).toLocaleDateString()}</p>
                                </div>
                            </div>
                        </div>

                        {/* Métodos de pago */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Pago con tarjeta */}
                            <div className="bg-white border rounded-xl p-6 shadow-sm">
                                <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                    💳 {isSpanish ? "Pago con Tarjeta" : "Card Payment"}
                                </h4>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            {isSpanish ? "Número de Tarjeta" : "Card Number"}
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="1234 5678 9012 3456"
                                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                {isSpanish ? "Vencimiento" : "Expiry"}
                                            </label>
                                            <input
                                                type="text"
                                                placeholder="MM/YY"
                                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">CVV</label>
                                            <input
                                                type="text"
                                                placeholder="123"
                                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            {isSpanish ? "Nombre del Titular" : "Cardholder Name"}
                                        </label>
                                        <input
                                            type="text"
                                            placeholder={isSpanish ? "Nombre completo" : "Full name"}
                                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        />
                                    </div>
                                    <Button className="w-full bg-blue-600 hover:bg-blue-700">
                                        {isSpanish ? "Pagar $850.000" : "Pay $850.000"}
                                    </Button>
                                </div>
                            </div>

                            {/* Transferencia bancaria */}
                            <div className="bg-white border rounded-xl p-6 shadow-sm">
                                <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                    🏦 {isSpanish ? "Transferencia Bancaria" : "Bank Transfer"}
                                </h4>
                                <div className="space-y-4">
                                    <div className="bg-gray-50 rounded-lg p-4">
                                        <h5 className="font-semibold mb-2">{isSpanish ? "Datos Bancarios" : "Bank Details"}</h5>
                                        <div className="text-sm space-y-1">
                                            <p>
                                                <strong>{isSpanish ? "Banco" : "Bank"}:</strong> Banco de Colombia
                                            </p>
                                            <p>
                                                <strong>{isSpanish ? "Cuenta" : "Account"}:</strong> 123-456-789-01
                                            </p>
                                            <p>
                                                <strong>{isSpanish ? "Titular" : "Account Holder"}:</strong> Colegio San José
                                            </p>
                                            <p>
                                                <strong>NIT:</strong> 900.123.456-7
                                            </p>
                                        </div>
                                    </div>
                                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                        <p className="text-sm text-yellow-800">
                                            <strong>{isSpanish ? "Importante:" : "Important:"}</strong>{" "}
                                            {isSpanish
                                                ? "Envía el comprobante de pago a pagos@colegiosanjose.edu.co"
                                                : "Send payment receipt to pagos@colegiosanjose.edu.co"}
                                        </p>
                                    </div>
                                    <Button variant="outline" className="w-full">
                                        {isSpanish ? "Copiar Datos Bancarios" : "Copy Bank Details"}
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {/* Botones de acción */}
                        <div className="flex justify-end gap-3 pt-4 border-t">
                            <Button variant="outline" size="lg" onClick={handlePaymentModalClose}>
                                {isSpanish ? "Cancelar" : "Cancel"}
                            </Button>
                            <Button
                                size="lg"
                                className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
                                onClick={handlePaymentModalClose}
                            >
                                <Award className="h-4 w-4 mr-2" />
                                {isSpanish ? "Confirmar Pago" : "Confirm Payment"}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}
