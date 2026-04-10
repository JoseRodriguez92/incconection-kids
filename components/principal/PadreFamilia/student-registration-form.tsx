"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import {
    User,
    GraduationCap,
    Users,
    ChevronLeft,
    ChevronRight,
    Send,
    CalendarIcon,
    Upload,
    FileText,
    Check,
    AlertCircle,
} from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { cn } from "@/lib/utils"

interface StudentRegistrationFormProps {
    language: string
    onComplete?: (data: any) => void
}

interface FormData {
    // Paso 1: Información Personal
    firstName: string
    lastName: string
    documentType: string
    documentNumber: string
    gender: string
    birthDate: Date | undefined
    birthPlace: string
    phone: string
    email: string
    address: string
    documents: {
        documentCopy: File | null
        photo: File | null
        medicalCertificate: File | null
    }

    // Paso 2: Información Académica
    grade: string
    group: string
    schedule: string
    enrollmentDate: Date | undefined
    previousSchool: string
    academicObservations: string
    gradesCertificate: File | null

    // Paso 3: Información del Acudiente
    guardianName: string
    relationship: string
    guardianDocument: string
    guardianPhone: string
    guardianEmail: string
    occupation: string
    guardianAddress: string
}

export function StudentRegistrationForm({ language, onComplete }: StudentRegistrationFormProps) {
    const isSpanish = language === "es"
    const [currentStep, setCurrentStep] = useState(1)
    const [formData, setFormData] = useState<FormData>({
        firstName: "",
        lastName: "",
        documentType: "",
        documentNumber: "",
        gender: "",
        birthDate: undefined,
        birthPlace: "",
        phone: "",
        email: "",
        address: "",
        documents: {
            documentCopy: null,
            photo: null,
            medicalCertificate: null,
        },
        grade: "",
        group: "",
        schedule: "",
        enrollmentDate: undefined,
        previousSchool: "",
        academicObservations: "",
        gradesCertificate: null,
        guardianName: "",
        relationship: "",
        guardianDocument: "",
        guardianPhone: "",
        guardianEmail: "",
        occupation: "",
        guardianAddress: "",
    })

    const [errors, setErrors] = useState<Record<string, string>>({})

    const steps = [
        {
            id: 1,
            icon: <User className="h-5 w-5" />,
            titleEs: "Información Personal",
            titleEn: "Personal Information",
            descriptionEs: "Datos básicos del estudiante",
            descriptionEn: "Student basic information",
        },
        {
            id: 2,
            icon: <GraduationCap className="h-5 w-5" />,
            titleEs: "Información Académica",
            titleEn: "Academic Information",
            descriptionEs: "Detalles académicos y matrícula",
            descriptionEn: "Academic details and enrollment",
        },
        {
            id: 3,
            icon: <Users className="h-5 w-5" />,
            titleEs: "Información del Acudiente",
            titleEn: "Guardian Information",
            descriptionEs: "Datos del responsable",
            descriptionEn: "Responsible person details",
        },
    ]

    const documentTypes = [
        { value: "cc", labelEs: "Cédula de Ciudadanía", labelEn: "Citizenship Card" },
        { value: "ti", labelEs: "Tarjeta de Identidad", labelEn: "Identity Card" },
        { value: "rc", labelEs: "Registro Civil", labelEn: "Civil Registry" },
        { value: "ce", labelEs: "Cédula de Extranjería", labelEn: "Foreign ID" },
    ]

    const genders = [
        { value: "m", labelEs: "Masculino", labelEn: "Male" },
        { value: "f", labelEs: "Femenino", labelEn: "Female" },
        { value: "o", labelEs: "Otro", labelEn: "Other" },
    ]

    const grades = [
        { value: "pre", labelEs: "Pre-jardín", labelEn: "Pre-K" },
        { value: "jardin", labelEs: "Jardín", labelEn: "Kindergarten" },
        { value: "transicion", labelEs: "Transición", labelEn: "Transition" },
        { value: "1", labelEs: "1° Grado", labelEn: "1st Grade" },
        { value: "2", labelEs: "2° Grado", labelEn: "2nd Grade" },
        { value: "3", labelEs: "3° Grado", labelEn: "3rd Grade" },
        { value: "4", labelEs: "4° Grado", labelEn: "4th Grade" },
        { value: "5", labelEs: "5° Grado", labelEn: "5th Grade" },
    ]

    const schedules = [
        { value: "morning", labelEs: "Mañana", labelEn: "Morning" },
        { value: "afternoon", labelEs: "Tarde", labelEn: "Afternoon" },
        { value: "full", labelEs: "Completa", labelEn: "Full Day" },
    ]

    const relationships = [
        { value: "father", labelEs: "Padre", labelEn: "Father" },
        { value: "mother", labelEs: "Madre", labelEn: "Mother" },
        { value: "guardian", labelEs: "Tutor/a", labelEn: "Guardian" },
        { value: "grandparent", labelEs: "Abuelo/a", labelEn: "Grandparent" },
        { value: "other", labelEs: "Otro", labelEn: "Other" },
    ]

    const updateFormData = (field: string, value: any) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }))
        // Limpiar error del campo cuando se actualiza
        if (errors[field]) {
            setErrors((prev) => ({
                ...prev,
                [field]: "",
            }))
        }
    }

    const updateDocumentFile = (documentType: keyof FormData["documents"], file: File | null) => {
        setFormData((prev) => ({
            ...prev,
            documents: {
                ...prev.documents,
                [documentType]: file,
            },
        }))
    }

    const validateStep = (step: number): boolean => {
        const newErrors: Record<string, string> = {}

        if (step === 1) {
            if (!formData.firstName) newErrors.firstName = isSpanish ? "Nombres requeridos" : "First name required"
            if (!formData.lastName) newErrors.lastName = isSpanish ? "Apellidos requeridos" : "Last name required"
            if (!formData.documentType)
                newErrors.documentType = isSpanish ? "Tipo de documento requerido" : "Document type required"
            if (!formData.documentNumber)
                newErrors.documentNumber = isSpanish ? "Número de documento requerido" : "Document number required"
            if (!formData.gender) newErrors.gender = isSpanish ? "Género requerido" : "Gender required"
            if (!formData.birthDate) newErrors.birthDate = isSpanish ? "Fecha de nacimiento requerida" : "Birth date required"
            if (!formData.phone) newErrors.phone = isSpanish ? "Teléfono requerido" : "Phone required"
            if (!formData.email) newErrors.email = isSpanish ? "Correo electrónico requerido" : "Email required"
            if (!formData.address) newErrors.address = isSpanish ? "Dirección requerida" : "Address required"
        }

        if (step === 2) {
            if (!formData.grade) newErrors.grade = isSpanish ? "Grado requerido" : "Grade required"
            if (!formData.schedule) newErrors.schedule = isSpanish ? "Jornada requerida" : "Schedule required"
            if (!formData.enrollmentDate)
                newErrors.enrollmentDate = isSpanish ? "Fecha de matrícula requerida" : "Enrollment date required"
        }

        if (step === 3) {
            if (!formData.guardianName)
                newErrors.guardianName = isSpanish ? "Nombre del acudiente requerido" : "Guardian name required"
            if (!formData.relationship) newErrors.relationship = isSpanish ? "Parentesco requerido" : "Relationship required"
            if (!formData.guardianDocument)
                newErrors.guardianDocument = isSpanish ? "Documento del acudiente requerido" : "Guardian document required"
            if (!formData.guardianPhone)
                newErrors.guardianPhone = isSpanish ? "Teléfono del acudiente requerido" : "Guardian phone required"
            if (!formData.guardianEmail)
                newErrors.guardianEmail = isSpanish ? "Correo del acudiente requerido" : "Guardian email required"
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const nextStep = () => {
        if (validateStep(currentStep)) {
            setCurrentStep((prev) => Math.min(prev + 1, 3))
        }
    }

    const prevStep = () => {
        setCurrentStep((prev) => Math.max(prev - 1, 1))
    }

    const handleSubmit = () => {
        if (validateStep(3)) {
            console.log("Formulario completado:", formData)
            onComplete?.(formData)
        }
    }

    const FileUpload = ({
        label,
        accept = ".pdf",
        onChange,
        file,
        required = false,
    }: {
        label: string
        accept?: string
        onChange: (file: File | null) => void
        file: File | null
        required?: boolean
    }) => (
        <div className="space-y-2">
            <Label className="text-sm font-medium">
                {label} {required && <span className="text-red-500">*</span>}
            </Label>
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4 text-center hover:border-muted-foreground/50 transition-colors">
                <input
                    type="file"
                    accept={accept}
                    onChange={(e) => onChange(e.target.files?.[0] || null)}
                    className="hidden"
                    id={`file-${label.replace(/\s+/g, "-").toLowerCase()}`}
                />
                <label
                    htmlFor={`file-${label.replace(/\s+/g, "-").toLowerCase()}`}
                    className="cursor-pointer flex flex-col items-center gap-2"
                >
                    {file ? (
                        <>
                            <FileText className="h-8 w-8 text-green-500" />
                            <span className="text-sm text-green-500">{file.name}</span>
                        </>
                    ) : (
                        <>
                            <Upload className="h-8 w-8 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">
                                {isSpanish ? "Haz clic para subir archivo" : "Click to upload file"}
                            </span>
                        </>
                    )}
                </label>
            </div>
        </div>
    )

    const renderStep1 = () => (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="firstName">
                        {isSpanish ? "Nombres" : "First Names"} <span className="text-red-500">*</span>
                    </Label>
                    <Input
                        id="firstName"
                        value={formData.firstName}
                        onChange={(e) => updateFormData("firstName", e.target.value)}
                        className={errors.firstName ? "border-red-500" : ""}
                    />
                    {errors.firstName && (
                        <p className="text-sm text-red-500 flex items-center gap-1">
                            <AlertCircle className="h-4 w-4" />
                            {errors.firstName}
                        </p>
                    )}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="lastName">
                        {isSpanish ? "Apellidos" : "Last Names"} <span className="text-red-500">*</span>
                    </Label>
                    <Input
                        id="lastName"
                        value={formData.lastName}
                        onChange={(e) => updateFormData("lastName", e.target.value)}
                        className={errors.lastName ? "border-red-500" : ""}
                    />
                    {errors.lastName && (
                        <p className="text-sm text-red-500 flex items-center gap-1">
                            <AlertCircle className="h-4 w-4" />
                            {errors.lastName}
                        </p>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label>
                        {isSpanish ? "Tipo de Documento" : "Document Type"} <span className="text-red-500">*</span>
                    </Label>
                    <Select value={formData.documentType} onValueChange={(value) => updateFormData("documentType", value)}>
                        <SelectTrigger className={errors.documentType ? "border-red-500" : ""}>
                            <SelectValue placeholder={isSpanish ? "Seleccionar tipo" : "Select type"} />
                        </SelectTrigger>
                        <SelectContent>
                            {documentTypes.map((type) => (
                                <SelectItem key={type.value} value={type.value}>
                                    {isSpanish ? type.labelEs : type.labelEn}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {errors.documentType && (
                        <p className="text-sm text-red-500 flex items-center gap-1">
                            <AlertCircle className="h-4 w-4" />
                            {errors.documentType}
                        </p>
                    )}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="documentNumber">
                        {isSpanish ? "Número de Documento" : "Document Number"} <span className="text-red-500">*</span>
                    </Label>
                    <Input
                        id="documentNumber"
                        value={formData.documentNumber}
                        onChange={(e) => updateFormData("documentNumber", e.target.value)}
                        className={errors.documentNumber ? "border-red-500" : ""}
                    />
                    {errors.documentNumber && (
                        <p className="text-sm text-red-500 flex items-center gap-1">
                            <AlertCircle className="h-4 w-4" />
                            {errors.documentNumber}
                        </p>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label>
                        {isSpanish ? "Género" : "Gender"} <span className="text-red-500">*</span>
                    </Label>
                    <Select value={formData.gender} onValueChange={(value) => updateFormData("gender", value)}>
                        <SelectTrigger className={errors.gender ? "border-red-500" : ""}>
                            <SelectValue placeholder={isSpanish ? "Seleccionar género" : "Select gender"} />
                        </SelectTrigger>
                        <SelectContent>
                            {genders.map((gender) => (
                                <SelectItem key={gender.value} value={gender.value}>
                                    {isSpanish ? gender.labelEs : gender.labelEn}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {errors.gender && (
                        <p className="text-sm text-red-500 flex items-center gap-1">
                            <AlertCircle className="h-4 w-4" />
                            {errors.gender}
                        </p>
                    )}
                </div>

                <div className="space-y-2">
                    <Label>
                        {isSpanish ? "Fecha de Nacimiento" : "Birth Date"} <span className="text-red-500">*</span>
                    </Label>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                className={cn(
                                    "w-full justify-start text-left font-normal",
                                    !formData.birthDate && "text-muted-foreground",
                                    errors.birthDate && "border-red-500",
                                )}
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {formData.birthDate ? (
                                    format(formData.birthDate, "PPP", { locale: isSpanish ? es : undefined })
                                ) : (
                                    <span>{isSpanish ? "Seleccionar fecha" : "Pick a date"}</span>
                                )}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                            <Calendar
                                mode="single"
                                selected={formData.birthDate}
                                onSelect={(date) => updateFormData("birthDate", date)}
                                initialFocus
                            />
                        </PopoverContent>
                    </Popover>
                    {errors.birthDate && (
                        <p className="text-sm text-red-500 flex items-center gap-1">
                            <AlertCircle className="h-4 w-4" />
                            {errors.birthDate}
                        </p>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="birthPlace">{isSpanish ? "Lugar de Nacimiento" : "Place of Birth"}</Label>
                    <Input
                        id="birthPlace"
                        value={formData.birthPlace}
                        onChange={(e) => updateFormData("birthPlace", e.target.value)}
                        placeholder={isSpanish ? "Ciudad, Departamento" : "City, State"}
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="phone">
                        {isSpanish ? "Teléfono" : "Phone"} <span className="text-red-500">*</span>
                    </Label>
                    <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => updateFormData("phone", e.target.value)}
                        className={errors.phone ? "border-red-500" : ""}
                    />
                    {errors.phone && (
                        <p className="text-sm text-red-500 flex items-center gap-1">
                            <AlertCircle className="h-4 w-4" />
                            {errors.phone}
                        </p>
                    )}
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="email">
                    {isSpanish ? "Correo Electrónico" : "Email"} <span className="text-red-500">*</span>
                </Label>
                <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => updateFormData("email", e.target.value)}
                    className={errors.email ? "border-red-500" : ""}
                />
                {errors.email && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                        <AlertCircle className="h-4 w-4" />
                        {errors.email}
                    </p>
                )}
            </div>

            <div className="space-y-2">
                <Label htmlFor="address">
                    {isSpanish ? "Dirección de Residencia" : "Home Address"} <span className="text-red-500">*</span>
                </Label>
                <Textarea
                    id="address"
                    value={formData.address}
                    onChange={(e) => updateFormData("address", e.target.value)}
                    className={errors.address ? "border-red-500" : ""}
                    rows={3}
                />
                {errors.address && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                        <AlertCircle className="h-4 w-4" />
                        {errors.address}
                    </p>
                )}
            </div>

            <Separator />

            <div className="space-y-4">
                <h3 className="text-lg font-semibold">{isSpanish ? "Documentos Requeridos" : "Required Documents"}</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FileUpload
                        label={isSpanish ? "Fotocopia del Documento" : "Document Copy"}
                        file={formData.documents.documentCopy}
                        onChange={(file) => updateDocumentFile("documentCopy", file)}
                        required
                    />
                    <FileUpload
                        label={isSpanish ? "Foto 3x4" : "3x4 Photo"}
                        file={formData.documents.photo}
                        onChange={(file) => updateDocumentFile("photo", file)}
                        accept="image/*"
                        required
                    />
                    <FileUpload
                        label={isSpanish ? "Certificado Médico" : "Medical Certificate"}
                        file={formData.documents.medicalCertificate}
                        onChange={(file) => updateDocumentFile("medicalCertificate", file)}
                        required
                    />
                </div>
            </div>
        </div>
    )

    const renderStep2 = () => (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label>
                        {isSpanish ? "Grado a Matricular" : "Grade to Enroll"} <span className="text-red-500">*</span>
                    </Label>
                    <Select value={formData.grade} onValueChange={(value) => updateFormData("grade", value)}>
                        <SelectTrigger className={errors.grade ? "border-red-500" : ""}>
                            <SelectValue placeholder={isSpanish ? "Seleccionar grado" : "Select grade"} />
                        </SelectTrigger>
                        <SelectContent>
                            {grades.map((grade) => (
                                <SelectItem key={grade.value} value={grade.value}>
                                    {isSpanish ? grade.labelEs : grade.labelEn}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {errors.grade && (
                        <p className="text-sm text-red-500 flex items-center gap-1">
                            <AlertCircle className="h-4 w-4" />
                            {errors.grade}
                        </p>
                    )}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="group">{isSpanish ? "Grupo" : "Group"}</Label>
                    <Input
                        id="group"
                        value={formData.group}
                        onChange={(e) => updateFormData("group", e.target.value)}
                        placeholder={isSpanish ? "Ej: A, B, C" : "Ex: A, B, C"}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label>
                        {isSpanish ? "Jornada" : "Schedule"} <span className="text-red-500">*</span>
                    </Label>
                    <Select value={formData.schedule} onValueChange={(value) => updateFormData("schedule", value)}>
                        <SelectTrigger className={errors.schedule ? "border-red-500" : ""}>
                            <SelectValue placeholder={isSpanish ? "Seleccionar jornada" : "Select schedule"} />
                        </SelectTrigger>
                        <SelectContent>
                            {schedules.map((schedule) => (
                                <SelectItem key={schedule.value} value={schedule.value}>
                                    {isSpanish ? schedule.labelEs : schedule.labelEn}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {errors.schedule && (
                        <p className="text-sm text-red-500 flex items-center gap-1">
                            <AlertCircle className="h-4 w-4" />
                            {errors.schedule}
                        </p>
                    )}
                </div>

                <div className="space-y-2">
                    <Label>
                        {isSpanish ? "Fecha de Matrícula" : "Enrollment Date"} <span className="text-red-500">*</span>
                    </Label>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                className={cn(
                                    "w-full justify-start text-left font-normal",
                                    !formData.enrollmentDate && "text-muted-foreground",
                                    errors.enrollmentDate && "border-red-500",
                                )}
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {formData.enrollmentDate ? (
                                    format(formData.enrollmentDate, "PPP", { locale: isSpanish ? es : undefined })
                                ) : (
                                    <span>{isSpanish ? "Seleccionar fecha" : "Pick a date"}</span>
                                )}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                            <Calendar
                                mode="single"
                                selected={formData.enrollmentDate}
                                onSelect={(date) => updateFormData("enrollmentDate", date)}
                                initialFocus
                            />
                        </PopoverContent>
                    </Popover>
                    {errors.enrollmentDate && (
                        <p className="text-sm text-red-500 flex items-center gap-1">
                            <AlertCircle className="h-4 w-4" />
                            {errors.enrollmentDate}
                        </p>
                    )}
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="previousSchool">{isSpanish ? "Institución de Procedencia" : "Previous School"}</Label>
                <Input
                    id="previousSchool"
                    value={formData.previousSchool}
                    onChange={(e) => updateFormData("previousSchool", e.target.value)}
                    placeholder={isSpanish ? "Nombre del colegio anterior" : "Previous school name"}
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="academicObservations">{isSpanish ? "Observaciones Académicas" : "Academic Observations"}</Label>
                <Textarea
                    id="academicObservations"
                    value={formData.academicObservations}
                    onChange={(e) => updateFormData("academicObservations", e.target.value)}
                    placeholder={
                        isSpanish ? "Necesidades especiales, notas adicionales..." : "Special needs, additional notes..."
                    }
                    rows={4}
                />
            </div>

            <Separator />

            <div className="space-y-4">
                <h3 className="text-lg font-semibold">{isSpanish ? "Documento Académico" : "Academic Document"}</h3>
                <FileUpload
                    label={isSpanish ? "Certificado de Notas" : "Grades Certificate"}
                    file={formData.gradesCertificate}
                    onChange={(file) => updateFormData("gradesCertificate", file)}
                    required
                />
            </div>
        </div>
    )

    const renderStep3 = () => (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="guardianName">
                        {isSpanish ? "Nombre Completo" : "Full Name"} <span className="text-red-500">*</span>
                    </Label>
                    <Input
                        id="guardianName"
                        value={formData.guardianName}
                        onChange={(e) => updateFormData("guardianName", e.target.value)}
                        className={errors.guardianName ? "border-red-500" : ""}
                    />
                    {errors.guardianName && (
                        <p className="text-sm text-red-500 flex items-center gap-1">
                            <AlertCircle className="h-4 w-4" />
                            {errors.guardianName}
                        </p>
                    )}
                </div>

                <div className="space-y-2">
                    <Label>
                        {isSpanish ? "Parentesco" : "Relationship"} <span className="text-red-500">*</span>
                    </Label>
                    <Select value={formData.relationship} onValueChange={(value) => updateFormData("relationship", value)}>
                        <SelectTrigger className={errors.relationship ? "border-red-500" : ""}>
                            <SelectValue placeholder={isSpanish ? "Seleccionar parentesco" : "Select relationship"} />
                        </SelectTrigger>
                        <SelectContent>
                            {relationships.map((rel) => (
                                <SelectItem key={rel.value} value={rel.value}>
                                    {isSpanish ? rel.labelEs : rel.labelEn}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {errors.relationship && (
                        <p className="text-sm text-red-500 flex items-center gap-1">
                            <AlertCircle className="h-4 w-4" />
                            {errors.relationship}
                        </p>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="guardianDocument">
                        {isSpanish ? "Documento" : "Document"} <span className="text-red-500">*</span>
                    </Label>
                    <Input
                        id="guardianDocument"
                        value={formData.guardianDocument}
                        onChange={(e) => updateFormData("guardianDocument", e.target.value)}
                        className={errors.guardianDocument ? "border-red-500" : ""}
                    />
                    {errors.guardianDocument && (
                        <p className="text-sm text-red-500 flex items-center gap-1">
                            <AlertCircle className="h-4 w-4" />
                            {errors.guardianDocument}
                        </p>
                    )}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="guardianPhone">
                        {isSpanish ? "Teléfono" : "Phone"} <span className="text-red-500">*</span>
                    </Label>
                    <Input
                        id="guardianPhone"
                        value={formData.guardianPhone}
                        onChange={(e) => updateFormData("guardianPhone", e.target.value)}
                        className={errors.guardianPhone ? "border-red-500" : ""}
                    />
                    {errors.guardianPhone && (
                        <p className="text-sm text-red-500 flex items-center gap-1">
                            <AlertCircle className="h-4 w-4" />
                            {errors.guardianPhone}
                        </p>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="guardianEmail">
                        {isSpanish ? "Correo Electrónico" : "Email"} <span className="text-red-500">*</span>
                    </Label>
                    <Input
                        id="guardianEmail"
                        type="email"
                        value={formData.guardianEmail}
                        onChange={(e) => updateFormData("guardianEmail", e.target.value)}
                        className={errors.guardianEmail ? "border-red-500" : ""}
                    />
                    {errors.guardianEmail && (
                        <p className="text-sm text-red-500 flex items-center gap-1">
                            <AlertCircle className="h-4 w-4" />
                            {errors.guardianEmail}
                        </p>
                    )}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="occupation">{isSpanish ? "Ocupación" : "Occupation"}</Label>
                    <Input
                        id="occupation"
                        value={formData.occupation}
                        onChange={(e) => updateFormData("occupation", e.target.value)}
                    />
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="guardianAddress">{isSpanish ? "Dirección del Acudiente" : "Guardian Address"}</Label>
                <Textarea
                    id="guardianAddress"
                    value={formData.guardianAddress}
                    onChange={(e) => updateFormData("guardianAddress", e.target.value)}
                    rows={3}
                />
            </div>
        </div>
    )

    return (
        <div className="max-w-4xl mx-auto p-6 space-y-8">
            {/* Header con progreso */}
            <div className="space-y-4">
                <div className="text-center">
                    <h1 className="text-3xl font-bold">
                        {isSpanish ? "Registro de Nuevo Estudiante" : "New Student Registration"}
                    </h1>
                    <p className="text-muted-foreground">
                        {isSpanish
                            ? "Complete todos los pasos para registrar al estudiante"
                            : "Complete all steps to register the student"}
                    </p>
                </div>

                {/* Stepper */}
                <div className="flex items-center justify-center space-x-4">
                    {steps.map((step, index) => (
                        <div key={step.id} className="flex items-center">
                            <div
                                className={cn(
                                    "flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors",
                                    currentStep === step.id
                                        ? "bg-primary text-primary-foreground border-primary"
                                        : currentStep > step.id
                                            ? "bg-green-500 text-white border-green-500"
                                            : "border-muted-foreground text-muted-foreground",
                                )}
                            >
                                {currentStep > step.id ? <Check className="h-5 w-5" /> : step.icon}
                            </div>
                            {index < steps.length - 1 && (
                                <div
                                    className={cn(
                                        "w-16 h-0.5 mx-2 transition-colors",
                                        currentStep > step.id ? "bg-green-500" : "bg-muted-foreground/25",
                                    )}
                                />
                            )}
                        </div>
                    ))}
                </div>

                {/* Progress bar */}
                <div className="space-y-2">
                    <div className="flex justify-between text-sm text-muted-foreground">
                        <span>{isSpanish ? "Progreso" : "Progress"}</span>
                        <span>{Math.round((currentStep / 3) * 100)}%</span>
                    </div>
                    <Progress value={(currentStep / 3) * 100} className="h-2" />
                </div>
            </div>

            {/* Contenido del paso actual */}
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10">
                            {steps[currentStep - 1].icon}
                        </div>
                        <div>
                            <CardTitle className="text-xl">
                                {isSpanish ? steps[currentStep - 1].titleEs : steps[currentStep - 1].titleEn}
                            </CardTitle>
                            <CardDescription>
                                {isSpanish ? steps[currentStep - 1].descriptionEs : steps[currentStep - 1].descriptionEn}
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {currentStep === 1 && renderStep1()}
                    {currentStep === 2 && renderStep2()}
                    {currentStep === 3 && renderStep3()}
                </CardContent>
            </Card>

            {/* Botones de navegación */}
            <div className="flex justify-between">
                <Button variant="outline" onClick={prevStep} disabled={currentStep === 1} className="flex items-center gap-2">
                    <ChevronLeft className="h-4 w-4" />
                    {isSpanish ? "Anterior" : "Previous"}
                </Button>

                {currentStep < 3 ? (
                    <Button onClick={nextStep} className="flex items-center gap-2">
                        {isSpanish ? "Siguiente" : "Next"}
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                ) : (
                    <Button onClick={handleSubmit} className="flex items-center gap-2 bg-green-600 hover:bg-green-700">
                        <Send className="h-4 w-4" />
                        {isSpanish ? "Registrar Estudiante" : "Register Student"}
                    </Button>
                )}
            </div>
        </div>
    )
}
