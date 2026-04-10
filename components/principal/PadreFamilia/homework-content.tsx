"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BookOpen, Clock, CheckCircle2, AlertTriangle, FileText, Download, Eye, Upload } from "lucide-react"
import { useState } from "react"

interface HomeworkContentProps {
    language: string
    activeStudent: any
}

const homeworkData = [
    {
        id: 1,
        title: "Ensayo sobre la Independencia",
        subject: "Historia",
        teacher: "Prof. Rodríguez",
        dueDate: "2024-03-28",
        assignedDate: "2024-03-20",
        status: "pending",
        priority: "high",
        description: "Escribir un ensayo de 500 palabras sobre los eventos que llevaron a la independencia de Colombia",
        attachments: ["rubrica_ensayo.pdf"],
        submissions: [],
        maxScore: 100,
        estimatedTime: "2 horas",
    },
    {
        id: 2,
        title: "Ejercicios de Álgebra - Capítulo 5",
        subject: "Matemáticas",
        teacher: "Prof. García",
        dueDate: "2024-03-26",
        assignedDate: "2024-03-22",
        status: "in_progress",
        priority: "normal",
        description: "Resolver los ejercicios 1-20 del capítulo 5 sobre ecuaciones lineales",
        attachments: ["ejercicios_cap5.pdf"],
        submissions: ["ejercicios_1-10.pdf"],
        maxScore: 50,
        estimatedTime: "1.5 horas",
    },
    {
        id: 3,
        title: "Proyecto del Sistema Solar",
        subject: "Ciencias Naturales",
        teacher: "Prof. López",
        dueDate: "2024-04-05",
        assignedDate: "2024-03-15",
        status: "completed",
        priority: "normal",
        description: "Crear una maqueta del sistema solar con información de cada planeta",
        attachments: ["instrucciones_proyecto.pdf", "plantilla_info.docx"],
        submissions: ["proyecto_sistema_solar.pdf", "fotos_maqueta.zip"],
        maxScore: 100,
        estimatedTime: "4 horas",
        grade: 4.5,
        feedback: "Excelente trabajo. La maqueta está muy bien elaborada y la información es precisa.",
    },
    {
        id: 4,
        title: "Reading Comprehension - Unit 3",
        subject: "Inglés",
        teacher: "Prof. Smith",
        dueDate: "2024-03-25",
        assignedDate: "2024-03-18",
        status: "overdue",
        priority: "high",
        description: "Complete the reading comprehension exercises from Unit 3",
        attachments: ["unit3_reading.pdf"],
        submissions: [],
        maxScore: 25,
        estimatedTime: "45 minutos",
    },
    {
        id: 5,
        title: "Análisis de Poema",
        subject: "Español",
        teacher: "Prof. Martínez",
        dueDate: "2024-04-02",
        assignedDate: "2024-03-25",
        status: "pending",
        priority: "normal",
        description: "Analizar el poema 'Nocturno' de José Asunción Silva",
        attachments: ["poema_nocturno.pdf", "guia_analisis.pdf"],
        submissions: [],
        maxScore: 75,
        estimatedTime: "2 horas",
    },
]

export function HomeworkContent({ language, activeStudent }: HomeworkContentProps) {
    const [selectedTab, setSelectedTab] = useState("pending")
    const isSpanish = language === "es"

    const getStatusConfig = (status: string) => {
        const configs = {
            pending: {
                label: isSpanish ? "Pendiente" : "Pending",
                variant: "outline" as const,
                color: "text-yellow-600",
                bgColor: "bg-yellow-50 dark:bg-yellow-950/20",
            },
            in_progress: {
                label: isSpanish ? "En Progreso" : "In Progress",
                variant: "default" as const,
                color: "text-blue-600",
                bgColor: "bg-blue-50 dark:bg-blue-950/20",
            },
            completed: {
                label: isSpanish ? "Completada" : "Completed",
                variant: "default" as const,
                color: "text-green-600",
                bgColor: "bg-green-50 dark:bg-green-950/20",
            },
            overdue: {
                label: isSpanish ? "Vencida" : "Overdue",
                variant: "destructive" as const,
                color: "text-red-600",
                bgColor: "bg-red-50 dark:bg-red-950/20",
            },
        }
        return configs[status as keyof typeof configs] || configs.pending
    }

    const getPriorityIcon = (priority: string) => {
        return priority === "high" ? AlertTriangle : Clock
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("es-CO", {
            year: "numeric",
            month: "long",
            day: "numeric",
        })
    }

    const getDaysUntilDue = (dueDate: string) => {
        const due = new Date(dueDate)
        const today = new Date()
        const diffTime = due.getTime() - today.getTime()
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
        return diffDays
    }

    const filteredHomework = homeworkData.filter((hw) => {
        if (selectedTab === "all") return true
        return hw.status === selectedTab
    })

    const stats = {
        total: homeworkData.length,
        pending: homeworkData.filter((hw) => hw.status === "pending").length,
        inProgress: homeworkData.filter((hw) => hw.status === "in_progress").length,
        completed: homeworkData.filter((hw) => hw.status === "completed").length,
        overdue: homeworkData.filter((hw) => hw.status === "overdue").length,
    }

    return (
        <div className="flex flex-1 flex-col gap-4 p-4 md:p-6 pt-0">
            {/* Header */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
                        {isSpanish ? "Tareas y Trabajos" : "Homework & Assignments"}
                    </h1>
                    <p className="text-muted-foreground">
                        {isSpanish
                            ? `Gestiona las tareas de ${activeStudent.firstName}`
                            : `Manage ${activeStudent.firstName}'s assignments`}
                    </p>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{isSpanish ? "Total" : "Total"}</CardTitle>
                        <BookOpen className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.total}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{isSpanish ? "Pendientes" : "Pending"}</CardTitle>
                        <Clock className="h-4 w-4 text-yellow-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{isSpanish ? "En Progreso" : "In Progress"}</CardTitle>
                        <FileText className="h-4 w-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-600">{stats.inProgress}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{isSpanish ? "Completadas" : "Completed"}</CardTitle>
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{isSpanish ? "Vencidas" : "Overdue"}</CardTitle>
                        <AlertTriangle className="h-4 w-4 text-red-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">{stats.overdue}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Homework List */}
            <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-4">
                <TabsList className="grid w-full grid-cols-5">
                    <TabsTrigger value="all">{isSpanish ? "Todas" : "All"}</TabsTrigger>
                    <TabsTrigger value="pending">{isSpanish ? "Pendientes" : "Pending"}</TabsTrigger>
                    <TabsTrigger value="in_progress">{isSpanish ? "En Progreso" : "In Progress"}</TabsTrigger>
                    <TabsTrigger value="completed">{isSpanish ? "Completadas" : "Completed"}</TabsTrigger>
                    <TabsTrigger value="overdue">{isSpanish ? "Vencidas" : "Overdue"}</TabsTrigger>
                </TabsList>

                <TabsContent value={selectedTab} className="space-y-4">
                    {filteredHomework.map((homework) => {
                        const statusConfig = getStatusConfig(homework.status)
                        const PriorityIcon = getPriorityIcon(homework.priority)
                        const daysUntilDue = getDaysUntilDue(homework.dueDate)

                        return (
                            <Card
                                key={homework.id}
                                className={`border-l-4 ${homework.status === "overdue"
                                        ? "border-l-red-500"
                                        : homework.status === "completed"
                                            ? "border-l-green-500"
                                            : homework.status === "in_progress"
                                                ? "border-l-blue-500"
                                                : "border-l-yellow-500"
                                    }`}
                            >
                                <CardHeader>
                                    <div className="flex items-start justify-between">
                                        <div className="space-y-1">
                                            <CardTitle className="text-lg">{homework.title}</CardTitle>
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <span>{homework.subject}</span>
                                                <span>•</span>
                                                <span>{homework.teacher}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Badge variant={statusConfig.variant}>{statusConfig.label}</Badge>
                                            {homework.priority === "high" && <PriorityIcon className="h-4 w-4 text-red-500" />}
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <p className="text-sm text-muted-foreground">{homework.description}</p>

                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                        <div>
                                            <span className="font-medium">{isSpanish ? "Fecha límite:" : "Due date:"}</span>
                                            <p className="text-muted-foreground">{formatDate(homework.dueDate)}</p>
                                        </div>
                                        <div>
                                            <span className="font-medium">{isSpanish ? "Tiempo estimado:" : "Estimated time:"}</span>
                                            <p className="text-muted-foreground">{homework.estimatedTime}</p>
                                        </div>
                                        <div>
                                            <span className="font-medium">{isSpanish ? "Puntuación máxima:" : "Max score:"}</span>
                                            <p className="text-muted-foreground">
                                                {homework.maxScore} {isSpanish ? "puntos" : "points"}
                                            </p>
                                        </div>
                                        <div>
                                            <span className="font-medium">{isSpanish ? "Días restantes:" : "Days remaining:"}</span>
                                            <p
                                                className={`${daysUntilDue < 0 ? "text-red-600" : daysUntilDue <= 2 ? "text-yellow-600" : "text-green-600"}`}
                                            >
                                                {daysUntilDue < 0
                                                    ? `${Math.abs(daysUntilDue)} ${isSpanish ? "días de retraso" : "days overdue"}`
                                                    : `${daysUntilDue} ${isSpanish ? "días" : "days"}`}
                                            </p>
                                        </div>
                                    </div>

                                    {homework.attachments.length > 0 && (
                                        <div>
                                            <h4 className="font-medium mb-2">{isSpanish ? "Archivos adjuntos:" : "Attachments:"}</h4>
                                            <div className="flex flex-wrap gap-2">
                                                {homework.attachments.map((file, index) => (
                                                    <Button key={index} variant="outline" size="sm">
                                                        <Download className="h-4 w-4 mr-2" />
                                                        {file}
                                                    </Button>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {homework.submissions.length > 0 && (
                                        <div>
                                            <h4 className="font-medium mb-2">{isSpanish ? "Entregas:" : "Submissions:"}</h4>
                                            <div className="flex flex-wrap gap-2">
                                                {homework.submissions.map((file, index) => (
                                                    <Button key={index} variant="outline" size="sm">
                                                        <Eye className="h-4 w-4 mr-2" />
                                                        {file}
                                                    </Button>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {homework.grade && (
                                        <div className="p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="font-medium text-green-800 dark:text-green-200">
                                                    {isSpanish ? "Calificación:" : "Grade:"}
                                                </span>
                                                <Badge variant="default" className="bg-green-600">
                                                    {homework.grade}/5.0
                                                </Badge>
                                            </div>
                                            {homework.feedback && (
                                                <p className="text-sm text-green-700 dark:text-green-300">{homework.feedback}</p>
                                            )}
                                        </div>
                                    )}

                                    <div className="flex justify-between items-center pt-2 border-t">
                                        <div className="text-xs text-muted-foreground">
                                            {isSpanish ? "Asignado:" : "Assigned:"} {formatDate(homework.assignedDate)}
                                        </div>
                                        <div className="flex gap-2">
                                            {homework.status !== "completed" && (
                                                <Button size="sm">
                                                    <Upload className="h-4 w-4 mr-2" />
                                                    {isSpanish ? "Entregar" : "Submit"}
                                                </Button>
                                            )}
                                            <Button variant="outline" size="sm">
                                                <Eye className="h-4 w-4 mr-2" />
                                                {isSpanish ? "Ver detalles" : "View details"}
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )
                    })}
                </TabsContent>
            </Tabs>
        </div>
    )
}
