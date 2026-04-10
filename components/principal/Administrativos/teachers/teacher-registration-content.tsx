"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Checkbox } from "@/components/ui/checkbox"
import {
  CalendarIcon,
  Upload,
  FileText,
  User,
  GraduationCap,
  Briefcase,
  ChevronRight,
  ChevronLeft,
  Send,
  Check,
} from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"

export function TeacherRegistrationContent() {
  const [currentStep, setCurrentStep] = useState(1)
  const [birthDate, setBirthDate] = useState<Date>()
  const [hireDate, setHireDate] = useState<Date>()
  const [graduationDate, setGraduationDate] = useState<Date>()
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([])

  // Estados para documentos
  const [personalDocuments, setPersonalDocuments] = useState({
    identityDocument: null,
    medicalExam: null,
    resume: null,
  })

  const [academicDocuments, setAcademicDocuments] = useState({
    workCertification: null,
    diplomasCertificates: null,
  })

  const subjects = [
    "Matemáticas",
    "Español",
    "Inglés",
    "Ciencias Naturales",
    "Ciencias Sociales",
    "Educación Física",
    "Artes",
    "Tecnología",
    "Ética",
    "Religión",
    "Filosofía",
    "Química",
    "Física",
    "Biología",
  ]

  const steps = [
    {
      id: 1,
      title: "Información Personal",
      description: "Datos básicos del docente",
      icon: User,
      completed: false,
    },
    {
      id: 2,
      title: "Formación Académica",
      description: "Títulos y certificaciones",
      icon: GraduationCap,
      completed: false,
    },
    {
      id: 3,
      title: "Información Laboral",
      description: "Cargo y asignación académica",
      icon: Briefcase,
      completed: false,
    },
  ]

  const nextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const toggleSubject = (subject: string) => {
    setSelectedSubjects((prev) => (prev.includes(subject) ? prev.filter((s) => s !== subject) : [...prev, subject]))
  }

  const handleFileUpload = (section: string, field: string, file: File | null) => {
    if (section === "personal") {
      setPersonalDocuments((prev) => ({
        ...prev,
        [field]: file,
      }))
    } else if (section === "academic") {
      setAcademicDocuments((prev) => ({
        ...prev,
        [field]: file,
      }))
    }
  }

  const FileUploadCard = ({ title, description, file, onUpload, required = false }: any) => (
    <Card className="border-dashed border-2 hover:border-primary/50 transition-colors">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FileText className="h-8 w-8 text-muted-foreground" />
            <div>
              <h4 className="font-medium">{title}</h4>
              <p className="text-sm text-muted-foreground">{description}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {file ? (
              <Badge variant="default" className="bg-green-100 text-green-800">
                <Check className="h-3 w-3 mr-1" />
                Subido
              </Badge>
            ) : (
              <Badge variant="outline">{required ? "Requerido" : "Opcional"}</Badge>
            )}
            <Button variant="outline" size="sm">
              <Upload className="h-4 w-4 mr-2" />
              {file ? "Cambiar" : "Subir"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold">Registro de Docente</h2>
        <p className="text-muted-foreground mt-2">Complete todos los pasos para registrar un nuevo docente</p>
      </div>

      {/* Stepper Navigation */}
      <div className="flex items-center justify-center">
        <div className="flex items-center space-x-4">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className="flex flex-col items-center">
                <div
                  className={`
                  flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all
                  ${
                    currentStep === step.id
                      ? "border-primary bg-primary text-primary-foreground"
                      : currentStep > step.id
                        ? "border-green-500 bg-green-500 text-white"
                        : "border-muted-foreground/30 bg-background text-muted-foreground"
                  }
                `}
                >
                  {currentStep > step.id ? <Check className="h-6 w-6" /> : <step.icon className="h-6 w-6" />}
                </div>
                <div className="text-center mt-2">
                  <p
                    className={`text-sm font-medium ${currentStep === step.id ? "text-primary" : "text-muted-foreground"}`}
                  >
                    {step.title}
                  </p>
                  <p className="text-xs text-muted-foreground">{step.description}</p>
                </div>
              </div>
              {index < steps.length - 1 && <ChevronRight className="h-5 w-5 text-muted-foreground mx-4 mt-[-2rem]" />}
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <div className="max-w-4xl mx-auto">
        {/* Paso 1: Información Personal */}
        {currentStep === 1 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Información Personal
              </CardTitle>
              <CardDescription>Complete los datos básicos del docente</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Datos Personales */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="firstName">Nombres *</Label>
                  <Input id="firstName" placeholder="Nombres del docente" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Apellidos *</Label>
                  <Input id="lastName" placeholder="Apellidos del docente" />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="documentType">Tipo de Documento *</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CC">Cédula de Ciudadanía</SelectItem>
                      <SelectItem value="CE">Cédula de Extranjería</SelectItem>
                      <SelectItem value="PP">Pasaporte</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="document">Número de Documento *</Label>
                  <Input id="document" placeholder="Número de documento" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gender">Género *</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="M">Masculino</SelectItem>
                      <SelectItem value="F">Femenino</SelectItem>
                      <SelectItem value="O">Otro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Fecha de Nacimiento *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {birthDate ? format(birthDate, "PPP", { locale: es }) : "Seleccionar fecha"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar mode="single" selected={birthDate} onSelect={setBirthDate} initialFocus />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="birthPlace">Lugar de Nacimiento *</Label>
                  <Input id="birthPlace" placeholder="Ciudad, Departamento" />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="phone">Teléfono *</Label>
                  <Input id="phone" placeholder="Número de teléfono" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Correo Electrónico *</Label>
                  <Input id="email" type="email" placeholder="correo@ejemplo.com" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Dirección de Residencia *</Label>
                <Textarea id="address" placeholder="Dirección completa" />
              </div>

              {/* Documentos Personales */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Documentos Requeridos (PDF)</h3>
                <div className="space-y-4">
                  <FileUploadCard
                    title="Documento de Identidad"
                    description="Fotocopia clara del documento de identidad"
                    file={personalDocuments.identityDocument}
                    onUpload={(file: File) => handleFileUpload("personal", "identityDocument", file)}
                    required={true}
                  />
                  <FileUploadCard
                    title="Examen Médico"
                    description="Certificado médico de aptitud laboral"
                    file={personalDocuments.medicalExam}
                    onUpload={(file: File) => handleFileUpload("personal", "medicalExam", file)}
                    required={true}
                  />
                  <FileUploadCard
                    title="Hoja de Vida"
                    description="Currículum vitae actualizado"
                    file={personalDocuments.resume}
                    onUpload={(file: File) => handleFileUpload("personal", "resume", file)}
                    required={true}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Paso 2: Formación Académica */}
        {currentStep === 2 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5" />
                Formación Académica
              </CardTitle>
              <CardDescription>Complete los datos de formación y certificaciones</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="degree">Título Profesional *</Label>
                  <Input id="degree" placeholder="Ej: Licenciatura en Matemáticas" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="university">Universidad *</Label>
                  <Input id="university" placeholder="Institución donde obtuvo el título" />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Fecha de Graduación *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {graduationDate ? format(graduationDate, "PPP", { locale: es }) : "Seleccionar fecha"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar mode="single" selected={graduationDate} onSelect={setGraduationDate} initialFocus />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="professionalCard">Tarjeta Profesional</Label>
                  <Input id="professionalCard" placeholder="Número de tarjeta profesional" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="postgraduate">Estudios de Postgrado</Label>
                <Textarea id="postgraduate" placeholder="Especializaciones, maestrías, doctorados..." />
              </div>

              <div className="space-y-2">
                <Label htmlFor="experience">Experiencia Previa en Educación</Label>
                <Textarea id="experience" placeholder="Experiencia laboral en instituciones educativas..." />
              </div>

              <div className="space-y-2">
                <Label htmlFor="skills">Habilidades y Competencias</Label>
                <Textarea id="skills" placeholder="Habilidades técnicas, idiomas, certificaciones adicionales..." />
              </div>

              {/* Documentos Académicos */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Documentos Académicos (PDF)</h3>
                <div className="space-y-4">
                  <FileUploadCard
                    title="Certificación Laboral"
                    description="Certificados de experiencia laboral previa"
                    file={academicDocuments.workCertification}
                    onUpload={(file: File) => handleFileUpload("academic", "workCertification", file)}
                    required={true}
                  />
                  <FileUploadCard
                    title="Diplomas y Certificados"
                    description="Títulos universitarios y certificaciones adicionales"
                    file={academicDocuments.diplomasCertificates}
                    onUpload={(file: File) => handleFileUpload("academic", "diplomasCertificates", file)}
                    required={true}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Paso 3: Información Laboral */}
        {currentStep === 3 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                Información Laboral
              </CardTitle>
              <CardDescription>Complete los datos del cargo y asignación académica</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="position">Cargo *</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar cargo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="docente">Docente</SelectItem>
                      <SelectItem value="coordinador">Coordinador</SelectItem>
                      <SelectItem value="director_grupo">Director de Grupo</SelectItem>
                      <SelectItem value="jefe_area">Jefe de Área</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contractType">Tipo de Contrato *</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="indefinido">Indefinido</SelectItem>
                      <SelectItem value="fijo">Término Fijo</SelectItem>
                      <SelectItem value="prestacion">Prestación de Servicios</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="workload">Carga Horaria *</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Horas" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="20">20 horas</SelectItem>
                      <SelectItem value="30">30 horas</SelectItem>
                      <SelectItem value="40">40 horas</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Fecha de Ingreso *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {hireDate ? format(hireDate, "PPP", { locale: es }) : "Seleccionar fecha"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar mode="single" selected={hireDate} onSelect={setHireDate} initialFocus />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="salary">Salario Base</Label>
                  <Input id="salary" type="number" placeholder="Salario mensual" />
                </div>
              </div>

              <div className="space-y-3">
                <Label>Materias que Imparte *</Label>
                <div className="grid gap-2 md:grid-cols-3">
                  {subjects.map((subject) => (
                    <div key={subject} className="flex items-center space-x-2">
                      <Checkbox
                        id={subject}
                        checked={selectedSubjects.includes(subject)}
                        onCheckedChange={() => toggleSubject(subject)}
                      />
                      <Label htmlFor={subject} className="text-sm">
                        {subject}
                      </Label>
                    </div>
                  ))}
                </div>
                {selectedSubjects.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {selectedSubjects.map((subject) => (
                      <Badge key={subject} variant="secondary">
                        {subject}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="schedule">Horario de Trabajo</Label>
                <Textarea id="schedule" placeholder="Descripción del horario de trabajo..." />
              </div>

              <div className="space-y-2">
                <Label htmlFor="responsibilities">Responsabilidades Adicionales</Label>
                <Textarea id="responsibilities" placeholder="Comités, proyectos especiales, coordinaciones..." />
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between max-w-4xl mx-auto">
        <Button variant="outline" onClick={prevStep} disabled={currentStep === 1}>
          <ChevronLeft className="h-4 w-4 mr-2" />
          Anterior
        </Button>

        {currentStep < 3 ? (
          <Button onClick={nextStep}>
            Siguiente
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        ) : (
          <Button className="bg-green-600 hover:bg-green-700">
            <Send className="h-4 w-4 mr-2" />
            Registrar Docente
          </Button>
        )}
      </div>
    </div>
  )
}
