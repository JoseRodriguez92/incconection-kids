"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { Toaster } from "@/components/ui/sonner"
import {
    Users,
    CalendarIcon,
    Upload,
    CheckCircle,
    GraduationCap,
    BookOpen,
    Award,
    TrendingUp,
    Menu,
    X,
    ChevronLeft,
    ChevronRight,
    FileText,
    Clock,
    Globe,
    CreditCard,
} from "lucide-react"
import { CloseSession } from "@/components/function/RedirectHomeRoll/CloseSession"

export default function AdmissionsDashboard() {
    const [activeSection, setActiveSection] = useState<"processes" | "info" | "payments">("processes")
    const [currentStep, setCurrentStep] = useState(1)
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
    const [completedSteps, setCompletedSteps] = useState<number[]>([])
    // Removed invalid useToast hook, toast is now imported directly from "sonner"

    const steps = [
        { id: 1, title: "Preinscripción", icon: Users },
        { id: 2, title: "Asignación de Citas", icon: CalendarIcon },
        { id: 3, title: "Documentos", icon: Upload },
        { id: 4, title: "Estado del Proceso", icon: CheckCircle },
    ]

    const documents = [
        "Certificado de nacimiento",
        "Último boletín de calificaciones",
        "Fotocopia de la cédula del acudiente",
        "Certificado médico",
        "Foto tipo documento del estudiante",
        "Paz y salvo del colegio anterior",
    ]

    const renderProcessStep = () => {
        switch (currentStep) {
            case 1:
                return (
                    <div className="space-y-6 z-[1] ">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-gray-800">Datos del Estudiante</h3>
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="student-name">Nombres y Apellidos</Label>
                                        <Input id="student-name" placeholder="Ingrese nombres completos" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="course">Curso de Interés</Label>
                                        <Select>
                                            <SelectTrigger
                                                id="course"
                                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                            >
                                                <SelectValue placeholder="Selecciona un grado" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="jardin">Jardín</SelectItem>
                                                <SelectItem value="transicion">Transición</SelectItem>
                                                <SelectItem value="primero">Primero</SelectItem>
                                                <SelectItem value="segundo">Segundo</SelectItem>
                                                <SelectItem value="tercero">Tercero</SelectItem>
                                                <SelectItem value="cuarto">Cuarto</SelectItem>
                                                <SelectItem value="quinto">Quinto</SelectItem>
                                                <SelectItem value="sexto">Sexto</SelectItem>
                                                <SelectItem value="septimo">Séptimo</SelectItem>
                                                <SelectItem value="octavo">Octavo</SelectItem>
                                                <SelectItem value="noveno">Noveno</SelectItem>
                                                <SelectItem value="decimo">Décimo</SelectItem>
                                                <SelectItem value="once">Once</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-gray-800">Datos del Acudiente</h3>
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="guardian-name">Nombres y Apellidos</Label>
                                        <Input id="guardian-name" placeholder="Ingrese nombres completos" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="phone">Teléfono</Label>
                                        <Input id="phone" placeholder="Número de contacto" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="email">Correo Electrónico</Label>
                                        <Input id="email" type="email" placeholder="correo@ejemplo.com" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="last-report">Último Boletín (PDF)</Label>
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                                <p className="mt-2 text-sm text-gray-600">Arrastra el archivo aquí o haz clic para seleccionar</p>
                                <Input type="file" accept=".pdf" className="hidden" />
                            </div>
                        </div>
                    </div>
                )

            case 2:
                return (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <Card className="bg-white/70 backdrop-blur-sm border-white/20">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Users className="h-5 w-5" />
                                        Cita con Secretaría
                                    </CardTitle>
                                    <CardDescription>Selecciona fecha y hora para la entrevista inicial</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="mb-4 space-y-2">
                                        <Label htmlFor="secretary-date">Fecha</Label>
                                        <Input id="secretary-date" type="date" />
                                    </div>
                                    <div className="mb-4 space-y-2">
                                        <Label htmlFor="secretary-time">Hora</Label>
                                        <Select>
                                            <SelectTrigger
                                                id="secretary-time"
                                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                            >
                                                <SelectValue placeholder="Selecciona una hora" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="9:00 AM">9:00 AM</SelectItem>
                                                <SelectItem value="10:00 AM">10:00 AM</SelectItem>
                                                <SelectItem value="2:00 PM">2:00 PM</SelectItem>
                                                <SelectItem value="3:00 PM">3:00 PM</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="bg-white/70 backdrop-blur-sm border-white/20">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <GraduationCap className="h-5 w-5" />
                                        Cita con Psicología
                                    </CardTitle>
                                    <CardDescription>Evaluación psicológica del estudiante</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="mb-4 space-y-2">
                                        <Label htmlFor="psychology-date">Fecha</Label>
                                        <Input id="psychology-date" type="date" />
                                    </div>
                                    <div className="mb-4 space-y-2">
                                        <Label htmlFor="psychology-time">Hora</Label>
                                        <Select>
                                            <SelectTrigger
                                                id="psychology-time"
                                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                            >
                                                <SelectValue placeholder="Selecciona una hora" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="8:00 AM">8:00 AM</SelectItem>
                                                <SelectItem value="11:00 AM">11:00 AM</SelectItem>
                                                <SelectItem value="1:00 PM">1:00 PM</SelectItem>
                                                <SelectItem value="4:00 PM">4:00 PM</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                )

            case 3:
                return (
                    <div className="space-y-6">
                        <h3 className="text-lg font-semibold text-gray-800">Documentos Requeridos</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {documents.map((doc, index) => (
                                <div key={index} className="space-y-3">
                                    <Label htmlFor={`file-${index}`} className="text-sm font-semibold text-gray-800 block">
                                        {doc}
                                    </Label>
                                    <div className="relative">
                                        <div
                                            className="
                      w-full h-24 
                      border-2 border-dashed border-gray-300
                      rounded-xl
                      bg-gray-50/80 backdrop-blur-sm
                      hover:border-blue-400 hover:bg-blue-50/80
                      transition-all duration-300
                      flex flex-col items-center justify-center
                      cursor-pointer
                      relative
                      group
                    "
                                        >
                                            <Input
                                                id={`file-${index}`}
                                                type="file"
                                                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                            />
                                            <Upload className="h-6 w-6 text-gray-400 group-hover:text-blue-500 transition-colors duration-200 mb-1" />
                                            <span className="text-sm text-gray-500 group-hover:text-blue-600 transition-colors duration-200">
                                                Haz clic o arrastra el archivo aquí
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )

            case 4:
                return (
                    <div className="space-y-6">
                        <div className="text-center">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                                <Clock className="h-8 w-8 text-blue-600" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-800 mb-2">Estado del Proceso</h3>
                            <Badge variant="secondary" className="text-sm">
                                En Revisión
                            </Badge>
                        </div>

                        <div className="space-y-4">
                            <Card className="bg-white/70 backdrop-blur-sm border-white/20">
                                <CardContent className="p-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium">Formulario de preinscripción</span>
                                        <CheckCircle className="h-5 w-5 text-green-500" />
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="bg-white/70 backdrop-blur-sm border-white/20">
                                <CardContent className="p-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium">Citas programadas</span>
                                        <CheckCircle className="h-5 w-5 text-green-500" />
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="bg-white/70 backdrop-blur-sm border-white/20">
                                <CardContent className="p-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium">Documentos</span>
                                        <Clock className="h-5 w-5 text-yellow-500" />
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="bg-white/70 backdrop-blur-sm border-white/20">
                                <CardContent className="p-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium">Revisión final</span>
                                        <Clock className="h-5 w-5 text-gray-400" />
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                )

            default:
                return null
        }
    }

    const renderInfoSection = () => (
        <div className="space-y-6 mt-16 lg:mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card className="bg-white/70 backdrop-blur-sm border-white/20 hover:bg-white/80 transition-all">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <GraduationCap className="h-5 w-5 text-blue-600" />
                            Información de Matrículas
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-gray-600 mb-4">
                            Conoce todo sobre nuestro proceso de matrícula, fechas importantes y requisitos.
                        </p>
                        <Button variant="outline" size="sm">
                            Ver más <Globe className="h-4 w-4 ml-1" />
                        </Button>
                    </CardContent>
                </Card>

                <Card className="bg-white/70 backdrop-blur-sm border-white/20 hover:bg-white/80 transition-all">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <BookOpen className="h-5 w-5 text-red-600" />
                            Videos Open House
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-gray-600 mb-4">
                            Recorridos virtuales por nuestras instalaciones y programas académicos.
                        </p>
                        <Button variant="outline" size="sm">
                            Ver videos <Globe className="h-4 w-4 ml-1" />
                        </Button>
                    </CardContent>
                </Card>

                <Card className="bg-white/70 backdrop-blur-sm border-white/20 hover:bg-white/80 transition-all">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Award className="h-5 w-5 text-pink-600" />
                            ¿Por qué elegirnos?
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-gray-600 mb-4">
                            Descubre las razones que nos hacen la mejor opción educativa para tu hijo.
                        </p>
                        <Button variant="outline" size="sm">
                            Conocer más <Globe className="h-4 w-4 ml-1" />
                        </Button>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="bg-white/70 backdrop-blur-sm border-white/20">
                    <CardHeader>
                        <CardTitle>Enlaces Útiles</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {["Manual del Estudiante", "Calendario Académico", "Plataforma Virtual", "Contacto Directo"].map(
                            (link, index) => (
                                <div
                                    key={index}
                                    className="flex items-center justify-between p-2 rounded-lg hover:bg-white/50 transition-colors"
                                >
                                    <span className="text-sm font-medium">{link}</span>
                                    <Globe className="h-4 w-4 text-gray-400" />
                                </div>
                            ),
                        )}
                    </CardContent>
                </Card>

                <Card className="bg-white/70 backdrop-blur-sm border-white/20">
                    <CardHeader>
                        <CardTitle>Testimonios</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="p-3 rounded-lg bg-white/50">
                            <div className="flex items-center gap-1 mb-2">
                                {[...Array(5)].map((_, i) => (
                                    <TrendingUp key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                ))}
                            </div>
                            <p className="text-sm text-gray-600 italic">
                                "Excelente institución, mi hijo ha crecido mucho académica y personalmente."
                            </p>
                            <p className="text-xs text-gray-500 mt-2">- María González</p>
                        </div>
                        <div className="p-3 rounded-lg bg-white/50">
                            <div className="flex items-center gap-1 mb-2">
                                {[...Array(5)].map((_, i) => (
                                    <TrendingUp key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                ))}
                            </div>
                            <p className="text-sm text-gray-600 italic">
                                "Los profesores son muy dedicados y el ambiente es muy familiar."
                            </p>
                            <p className="text-xs text-gray-500 mt-2">- Carlos Rodríguez</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )

    const renderPaymentsSection = () => (
        <div className="space-y-6 mt-16 lg:mt-0">
            <div className="max-w-2xl mx-auto">
                <Card className="bg-white/70 backdrop-blur-sm border-white/20 shadow-xl">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-xl">
                            <CreditCard className="h-6 w-6 text-blue-600" />
                            Realizar Pago
                        </CardTitle>
                        <CardDescription>Complete los datos para procesar su pago</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Detalle del Pago */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-800">Detalle del Pago</h3>
                            <div className="bg-white/30 backdrop-blur-sm rounded-lg p-2 sm:p-4 border border-white/20 overflow-x-auto">
                                <div className="min-w-[300px]">
                                    {/* Header de la tabla */}
                                    <div className="grid grid-cols-3 gap-2 sm:gap-4 py-2 border-b-2 border-blue-200 font-semibold text-gray-800 text-sm sm:text-base">
                                        <span>Concepto</span>
                                        <span className="text-center">Cantidad</span>
                                        <span className="text-right">Valor x Unidad</span>
                                    </div>

                                    {/* Fila Inscripción */}
                                    <div className="grid grid-cols-3 gap-2 sm:gap-4 py-2 border-b border-white/20 text-sm sm:text-base">
                                        <span className="text-gray-700">Inscripción</span>
                                        <span className="text-center text-gray-700">1</span>
                                        <span className="text-right font-semibold text-gray-800">$100,000</span>
                                    </div>

                                    {/* Fila Matrícula */}
                                    <div className="grid grid-cols-3 gap-2 sm:gap-4 py-2 border-b border-white/20 text-sm sm:text-base">
                                        <span className="text-gray-700">Matrícula</span>
                                        <span className="text-center text-gray-700">1</span>
                                        <span className="text-right font-semibold text-gray-800">$1,500,000</span>
                                    </div>

                                    {/* Total */}
                                    <div className="grid grid-cols-3 gap-2 sm:gap-4 pt-3 border-t-2 border-blue-200">
                                        <span className="text-base sm:text-lg font-bold text-gray-800">Total:</span>
                                        <span></span>
                                        <span className="text-right text-lg sm:text-xl font-bold text-blue-600">$1,600,000</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Medios de Pago */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-800">Medio de Pago</h3>
                            <div className="space-y-2">
                                <Label htmlFor="metodoPago">Selecciona el método de pago</Label>
                                <select
                                    id="metodoPago"
                                    name="metodoPago"
                                    className="w-full p-3 bg-white/50 backdrop-blur-sm border border-white/30 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="">Seleccionar método de pago</option>
                                    <option value="tarjeta">Tarjeta de Crédito/Débito</option>
                                    <option value="pse">PSE</option>
                                    <option value="nequi">Nequi</option>
                                    <option value="daviplata">Daviplata</option>
                                    <option value="bancolombia">Bancolombia</option>
                                    <option value="efecty">Efecty</option>
                                </select>
                            </div>
                        </div>

                        {/* Información del Pagador */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-800">Información del Pagador</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="nombrePagador">Nombre Completo</Label>
                                    <Input
                                        id="nombrePagador"
                                        placeholder="Nombre del pagador"
                                        className="bg-white/50 backdrop-blur-sm border-white/30"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="documentoPagador">Documento</Label>
                                    <Input
                                        id="documentoPagador"
                                        placeholder="Número de documento"
                                        className="bg-white/50 backdrop-blur-sm border-white/30"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="emailPagador">Email</Label>
                                    <Input
                                        id="emailPagador"
                                        type="email"
                                        placeholder="correo@ejemplo.com"
                                        className="bg-white/50 backdrop-blur-sm border-white/30"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="telefonoPagador">Teléfono</Label>
                                    <Input
                                        id="telefonoPagador"
                                        placeholder="Número de teléfono"
                                        className="bg-white/50 backdrop-blur-sm border-white/30"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Botones de Acción */}
                        <div className="flex gap-4 pt-4">
                            <Button variant="outline" className="flex-1 bg-transparent">
                                Cancelar
                            </Button>
                            <Button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white">Procesar Pago</Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )

    const saveStepData = (stepId: number) => {
        const formData = new FormData()
        const form = document.querySelector("form")
        if (form) {
            const inputs = form.querySelectorAll('input:not([type="file"]), select, textarea')
            const stepData: Record<string, string> = {}

            inputs.forEach((input) => {
                const element = input as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
                if (element.id && element.value) {
                    stepData[element.id] = element.value
                }
            })

            localStorage.setItem(`admissions_step_${stepId}`, JSON.stringify(stepData))
        }
    }


    const handleNextStep = () => {
        if (currentStep < steps.length) {
            saveStepData(currentStep)
            setCompletedSteps((prev) => [...prev, currentStep])
            toast(
                `Información registrada: Los datos del paso ${currentStep} han sido guardados exitosamente.`,
                { duration: 3000 }
            )
            setCurrentStep(currentStep + 1)
        }
    }

    return (
        <div className="min-h-screen bg-[#ffffff] z-[1] relative w-full flex overflow-auto max-h-[100dvh]">
            <div className="lg:hidden fixed top-4 left-4 z-50">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="bg-white/80 backdrop-blur-sm border-white/20"
                >
                    {sidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
                </Button>
            </div>

            <div
                className={`fixed inset-y-0 left-0 z-40 w-80 bg-white/20 backdrop-blur-xl border-r border-white/20 transform transition-transform duration-300 ease-in-out ${sidebarOpen ? "translate-x-0" : "-translate-x-full"
                    } lg:translate-x-0`}
            >
                <div className="p-6">

                    <h1 className="text-2xl font-bold text-gray-800 mb-8 mt-16 lg:mt-0">
                        Admisiones
                        <span className="block text-sm font-normal text-gray-600">Estudiantes Nuevos</span>
                    </h1>

                    <nav className="space-y-4">
                        <Button
                            variant={activeSection === "processes" ? "default" : "ghost"}
                            className={`w-full justify-start text-left h-auto p-4 ${activeSection === "processes"
                                ? "bg-[#111d58] text-white shadow-lg"
                                : "bg-white/30 hover:bg-white/50 text-gray-700"
                                }`}
                            onClick={() => {
                                setActiveSection("processes")
                                setSidebarOpen(false)
                            }}
                        >
                            <FileText className="h-5 w-5 mr-3" />
                            <div>
                                <div className="font-medium">Procesos</div>
                                <div className="text-xs opacity-80">Flujo de admisión</div>
                            </div>
                        </Button>

                        <Button
                            variant={activeSection === "info" ? "default" : "ghost"}
                            className={`w-full justify-start text-left h-auto p-4 ${activeSection === "info"
                                ? "bg-[#111d58] text-white shadow-lg"
                                : "bg-white/30 hover:bg-white/50 text-gray-700"
                                }`}
                            onClick={() => {
                                setActiveSection("info")
                                setSidebarOpen(false)
                            }}
                        >
                            <GraduationCap className="h-5 w-5 mr-3" />
                            <div>
                                <div className="font-medium">Información Valiosa</div>
                                <div className="text-xs opacity-80">Recursos y contenido</div>
                            </div>
                        </Button>

                        <Button
                            variant={activeSection === "payments" ? "default" : "ghost"}
                            className={`w-full justify-start text-left h-auto p-4 ${activeSection === "payments"
                                ? "bg-[#111d58] text-white shadow-lg"
                                : "bg-white/30 hover:bg-white/50 text-gray-700"
                                }`}
                            onClick={() => {
                                setActiveSection("payments")
                                setSidebarOpen(false)
                            }}
                        >
                            <CreditCard className="h-5 w-5 mr-3" />
                            <div>
                                <div className="font-medium">Pagos</div>
                                <div className="text-xs opacity-80">Gestión de pagos</div>
                            </div>
                        </Button>

                        <Button
                            // variant={activeSection === "payments" ? "default" : "ghost"}
                            className={`w-full justify-start text-left h-auto p-4 ${activeSection === "payments"
                                ? "bg-[#111d58] text-white shadow-lg"
                                : "bg-white/30 hover:bg-white/50 text-gray-700"
                                }`}
                            onClick={() => {
                                CloseSession();
                            }}
                        >

                            <div>
                                <div className="font-medium">Cerrar Sesión</div>
                                <div className="text-xs opacity-80">Los datos quedaran cargados</div>
                            </div>
                        </Button>
                    </nav>
                    <img
                        src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTLpK3lgpIB-dL_wjjIpeVJuZc3VCRGPB30eA&s"
                        alt="Logo"
                        className="h-45 w-45 rounded-md shrink-0 m-auto absolute bottom-10 right-[50px]"
                    />
                </div>
            </div>

            <div className="min-h-screen w-full">
                <div className="p-6 lg:p-8 ">
                    {activeSection === "processes" && (
                        <div className="max-w-[50%] mx-auto">
                            <div className="mb-8 mt-16 lg:mt-0">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-3xl font-bold text-gray-800">Proceso de Admisión</h2>
                                    <Badge variant="outline" className="bg-white/50 backdrop-blur-sm">
                                        Paso {currentStep} de {steps.length}
                                    </Badge>
                                </div>

                                <div className="bg-white/30 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                                    <div className="hidden md:flex items-center justify-between">
                                        {steps.map((step, index) => (
                                            <div key={step.id} className="flex items-center">
                                                <div
                                                    className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${completedSteps.includes(step.id)
                                                        ? "bg-green-600 border-green-600 text-white"
                                                        : currentStep >= step.id
                                                            ? "bg-blue-600 border-blue-600 text-white"
                                                            : "bg-white/50 border-gray-300 text-gray-500"
                                                        }`}
                                                >
                                                    {completedSteps.includes(step.id) ? (
                                                        <CheckCircle className="h-5 w-5" />
                                                    ) : (
                                                        <step.icon className="h-5 w-5" />
                                                    )}
                                                </div>
                                                <div className="ml-3">
                                                    <p
                                                        className={`text-sm font-medium ${completedSteps.includes(step.id)
                                                            ? "text-green-600"
                                                            : currentStep >= step.id
                                                                ? "text-blue-600"
                                                                : "text-gray-500"
                                                            }`}
                                                    >
                                                        {step.title}
                                                    </p>
                                                </div>
                                                {index < steps.length - 1 && (
                                                    <div
                                                        className={`w-8 h-0.5 mx-4 ${completedSteps.includes(step.id)
                                                            ? "bg-green-600"
                                                            : currentStep > step.id
                                                                ? "bg-blue-600"
                                                                : "bg-gray-300"
                                                            }`}
                                                    />
                                                )}
                                            </div>
                                        ))}
                                    </div>

                                    <div className="md:hidden">
                                        <div className="flex items-center justify-center space-x-4">
                                            {/* Botón anterior */}
                                            <button
                                                onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
                                                disabled={currentStep === 1}
                                                className={`p-2 rounded-full transition-all duration-200 ${currentStep === 1 ? "text-gray-400 cursor-not-allowed" : "text-gray-600 hover:bg-white/20"
                                                    }`}
                                            >
                                                <ChevronLeft className="h-5 w-5" />
                                            </button>

                                            {/* Paso actual */}
                                            <div className="flex flex-col items-center space-y-2">
                                                <div
                                                    className={`flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all duration-300 ${completedSteps.includes(currentStep)
                                                        ? "bg-green-600 border-green-600 text-white"
                                                        : "bg-blue-600 border-blue-600 text-white"
                                                        }`}
                                                >
                                                    {completedSteps.includes(currentStep) ? (
                                                        <CheckCircle className="h-6 w-6" />
                                                    ) : (
                                                        (() => {
                                                            const CurrentIcon = steps.find((s) => s.id === currentStep)?.icon
                                                            return CurrentIcon ? <CurrentIcon className="h-6 w-6" /> : null
                                                        })()
                                                    )}
                                                </div>
                                                <p
                                                    className={`text-sm font-medium text-center ${completedSteps.includes(currentStep) ? "text-green-600" : "text-blue-600"
                                                        }`}
                                                >
                                                    {steps.find((s) => s.id === currentStep)?.title}
                                                </p>
                                            </div>

                                            {/* Botón siguiente */}
                                            <button
                                                onClick={() => setCurrentStep(Math.min(steps.length, currentStep + 1))}
                                                disabled={currentStep === steps.length}
                                                className={`p-2 rounded-full transition-all duration-200 ${currentStep === steps.length
                                                    ? "text-gray-400 cursor-not-allowed"
                                                    : "text-gray-600 hover:bg-white/20"
                                                    }`}
                                            >
                                                <ChevronRight className="h-5 w-5" />
                                            </button>
                                        </div>

                                        {/* Indicadores de progreso */}
                                        <div className="flex justify-center space-x-2 mt-3">
                                            {steps.map((step) => (
                                                <div
                                                    key={step.id}
                                                    className={`w-2 h-2 rounded-full transition-all duration-200 ${completedSteps.includes(step.id)
                                                        ? "bg-green-600"
                                                        : currentStep >= step.id
                                                            ? "bg-blue-600"
                                                            : "bg-gray-300"
                                                        }`}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <Card className="bg-white/40 backdrop-blur-sm border-white/20 shadow-xl">
                                <CardHeader className="pb-3">
                                    <CardTitle className="flex items-center gap-2 text-lg">
                                        {(() => {
                                            const currentStepData = steps.find((s) => s.id === currentStep)
                                            const IconComponent = currentStepData?.icon
                                            return IconComponent ? <IconComponent className="h-5 w-5" /> : null
                                        })()}
                                        {steps.find((s) => s.id === currentStep)?.title}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-4 pt-0">{renderProcessStep()}</CardContent>
                            </Card>

                            <div className="flex justify-between mt-6">
                                <Button
                                    variant="outline"
                                    onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
                                    disabled={currentStep === 1}
                                    className="bg-white/50 backdrop-blur-sm border-white/20"
                                >
                                    <ChevronLeft className="h-4 w-4 mr-1" />
                                    Anterior
                                </Button>
                                <Button
                                    onClick={handleNextStep}
                                    disabled={currentStep === steps.length}
                                    className="bg-blue-600 hover:bg-blue-700 text-white"
                                >
                                    Siguiente
                                    <ChevronRight className="h-4 w-4 ml-1" />
                                </Button>
                            </div>
                        </div>
                    )}

                    {activeSection === "info" && (
                        <div className="max-w-6xl mx-auto">
                            <div className="mb-8">
                                <h2 className="text-3xl font-bold text-gray-800 mb-2">Información Valiosa</h2>
                                <p className="text-gray-600">Recursos y contenido útil para el proceso de admisión</p>
                            </div>
                            {renderInfoSection()}
                        </div>
                    )}

                    {activeSection === "payments" && (
                        <div className="max-w-6xl mx-auto">
                            <div className="mb-8">
                                <h2 className="text-3xl font-bold text-gray-800 mb-2">Pagos</h2>
                                <p className="text-gray-600">Gestión de pagos para el proceso de admisión</p>
                            </div>
                            {renderPaymentsSection()}
                        </div>
                    )}
                </div>
            </div>

            <Toaster />
        </div>
    )
}
