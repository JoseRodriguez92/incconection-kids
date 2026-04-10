"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
    BookOpen,
    Calendar,
    Clock,
    TrendingUp,
    Award,
    AlertCircle,
    CheckCircle2,
    Users,
    Target,
    BarChart3,
} from "lucide-react"
import { AnimatedSubjectCard } from "./animated_subject-card"

interface DashboardContentProps {
    language: string
    activeStudent: any
}

const subjectsData = [
    {
        id: "math",
        name: "Matemáticas",
        teacher: "Prof. García",
        grade: 4.5,
        progress: 85,
        color: "#3b82f6",
        nextClass: "Lun 8:00 AM",
        assignments: 2,
    },
    {
        id: "spanish",
        name: "Español",
        teacher: "Prof. Martínez",
        grade: 4.2,
        progress: 78,
        color: "#10b981",
        nextClass: "Mar 9:00 AM",
        assignments: 1,
    },
    {
        id: "science",
        name: "Ciencias",
        teacher: "Prof. López",
        grade: 4.8,
        progress: 92,
        color: "#8b5cf6",
        nextClass: "Mié 10:00 AM",
        assignments: 0,
    },
    {
        id: "english",
        name: "Inglés",
        teacher: "Prof. Smith",
        grade: 4.0,
        progress: 70,
        color: "#ef4444",
        nextClass: "Jue 11:00 AM",
        assignments: 3,
    },
]

const recentActivities = [
    {
        id: 1,
        type: "grade",
        subject: "Matemáticas",
        description: "Examen de álgebra calificado",
        grade: 4.5,
        date: "Hace 2 horas",
        icon: Award,
    },
    {
        id: 2,
        type: "assignment",
        subject: "Español",
        description: "Ensayo sobre literatura colombiana",
        dueDate: "Mañana",
        date: "Hace 1 día",
        icon: BookOpen,
    },
    {
        id: 3,
        type: "event",
        subject: "General",
        description: "Reunión de padres de familia",
        date: "En 3 días",
        icon: Users,
    },
]

export function DashboardContent({ language, activeStudent }: DashboardContentProps) {
    const isSpanish = language === "es"

    const handleSubjectClick = (subjectId: string) => {
        console.log(`Navigating to subject: ${subjectId}`)
        // Aquí podrías navegar a la vista detallada de la materia
    }

    return (
        <div className="flex flex-1 flex-col gap-4 p-4 md:p-6 pt-0">
            {/* Welcome Section */}
            <div className="flex flex-col gap-2">
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
                    {isSpanish ? `¡Bienvenido al  perfil de ${activeStudent.firstName}!` : `Welcome to ${activeStudent.firstName} profile!`}
                </h1>
                <p className="text-muted-foreground">
                    {isSpanish
                        ? "Aquí tienes un resumen del progreso académico de tu hij@"
                        : "Here's an overview of your son academic progress"}
                </p>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{isSpanish ? "Promedio General" : "Overall Average"}</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">4.4</div>
                        <p className="text-xs text-muted-foreground">
                            +0.2 {isSpanish ? "desde el mes pasado" : "from last month"}
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{isSpanish ? "Asistencia" : "Attendance"}</CardTitle>
                        <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">95%</div>
                        <p className="text-xs text-muted-foreground">
                            {isSpanish ? "Excelente asistencia" : "Excellent attendance"}
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{isSpanish ? "Tareas Pendientes" : "Pending Tasks"}</CardTitle>
                        <AlertCircle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">6</div>
                        <p className="text-xs text-muted-foreground">{isSpanish ? "2 vencen mañana" : "2 due tomorrow"}</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{isSpanish ? "Próxima Clase" : "Next Class"}</CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">8:00</div>
                        <p className="text-xs text-muted-foreground">
                            {isSpanish ? "Matemáticas - Aula 201" : "Mathematics - Room 201"}
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Main Content Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {/* Subjects Overview */}
                <div className="lg:col-span-2">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <BookOpen className="h-5 w-5" />
                                {isSpanish ? "Materias" : "Subjects"}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-4 md:grid-cols-2">
                                {subjectsData.map((subject, index) => (
                                    <AnimatedSubjectCard
                                        key={subject.id}
                                        subject={subject}
                                        index={index}
                                        onClick={() => handleSubjectClick(subject.id)}
                                    />
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Recent Activity */}
                <div>
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <BarChart3 className="h-5 w-5" />
                                {isSpanish ? "Actividad Reciente" : "Recent Activity"}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {recentActivities.map((activity) => {
                                    const Icon = activity.icon
                                    return (
                                        <div key={activity.id} className="flex items-start gap-3">
                                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                                                <Icon className="h-4 w-4 text-primary" />
                                            </div>
                                            <div className="flex-1 space-y-1">
                                                <p className="text-sm font-medium">{activity.subject}</p>
                                                <p className="text-xs text-muted-foreground">{activity.description}</p>
                                                <div className="flex items-center gap-2">
                                                    {activity.grade && (
                                                        <Badge variant="secondary" className="text-xs">
                                                            {activity.grade}
                                                        </Badge>
                                                    )}
                                                    <span className="text-xs text-muted-foreground">{activity.date}</span>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Quick Actions */}
                    <Card className="mt-4">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Target className="h-5 w-5" />
                                {isSpanish ? "Acciones Rápidas" : "Quick Actions"}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <Button
                                variant="outline"
                                className="w-full justify-start bg-transparent"
                                onClick={() => {
                                    const event = new CustomEvent("navigate-to-section", { detail: "homework" })
                                    window.dispatchEvent(event)
                                }}
                            >
                                <BookOpen className="mr-2 h-4 w-4" />
                                {isSpanish ? "Ver Tareas" : "View Homework"}
                            </Button>
                            <Button
                                variant="outline"
                                className="w-full justify-start bg-transparent"
                                onClick={() => {
                                    const event = new CustomEvent("navigate-to-section", { detail: "grades" })
                                    window.dispatchEvent(event)
                                }}
                            >
                                <Award className="mr-2 h-4 w-4" />
                                {isSpanish ? "Ver Calificaciones" : "View Grades"}
                            </Button>
                            <Button
                                variant="outline"
                                className="w-full justify-start bg-transparent"
                                onClick={() => {
                                    const event = new CustomEvent("navigate-to-section", { detail: "schedule" })
                                    window.dispatchEvent(event)
                                }}
                            >
                                <Calendar className="mr-2 h-4 w-4" />
                                {isSpanish ? "Ver Horario" : "View Schedule"}
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
