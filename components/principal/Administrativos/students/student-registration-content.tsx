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
import {
  CalendarIcon,
  Upload,
  FileText,
  User,
  GraduationCap,
  Users,
  ChevronRight,
  ChevronLeft,
  Send,
  Check,
} from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"

export function StudentRegistrationContent() {
  const [currentStep, setCurrentStep] = useState(1)
  const [birthDate, setBirthDate] = useState<Date>()
  const [enrollmentDate, setEnrollmentDate] = useState<Date>()

  // Estados para documentos
  const [personalDocuments, setPersonalDocuments] = useState({
    documentCopy: null,
    photo3x4: null,
    medicalCertificate: null,
  })

  const [academicDocuments, setAcademicDocuments] = useState({
    grades: null,
  })

  const steps = [
    {
      id: 1,
      title: "Información Personal",
      description: "Datos básicos del estudiante",
      icon: User,
      completed: false,
    },
    {
      id: 2,
      title: "Información Académica",
      description: "Datos de matrícula y estudios",
      icon: GraduationCap,
      completed: false,
    },
    {
      id: 3,
      title: "Información del Acudiente",
      description: "Datos del responsable",
      icon: Users,
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
        <h2 className="text-3xl font-bold">Registro Individual de Estudiante</h2>
        <p className="text-muted-foreground mt-2">Complete todos los pasos para registrar un nuevo estudiante</p>
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
              <CardDescription>Complete los datos básicos del estudiante</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Datos Personales */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="firstName">Nombres *</Label>
                  <Input id="firstName" placeholder="Nombres del estudiante" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Apellidos *</Label>
                  <Input id="lastName" placeholder="Apellidos del estudiante" />
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
                      <SelectItem value="TI">Tarjeta de Identidad</SelectItem>
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
                  <Label htmlFor="phone">Teléfono</Label>
                  <Input id="phone" placeholder="Número de teléfono" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Correo Electrónico</Label>
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
                    title="Fotocopia del Documento"
                    description="Fotocopia clara del documento de identidad"
                    file={personalDocuments.documentCopy}
                    onUpload={(file: File) => handleFileUpload("personal", "documentCopy", file)}
                    required={true}
                  />
                  <FileUploadCard
                    title="Foto 3x4"
                    description="Fotografía reciente tamaño 3x4 cm"
                    file={personalDocuments.photo3x4}
                    onUpload={(file: File) => handleFileUpload("personal", "photo3x4", file)}
                    required={true}
                  />
                  <FileUploadCard
                    title="Certificado Médico"
                    description="Certificado médico de aptitud física"
                    file={personalDocuments.medicalCertificate}
                    onUpload={(file: File) => handleFileUpload("personal", "medicalCertificate", file)}
                    required={true}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Paso 2: Información Académica */}
        {currentStep === 2 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5" />
                Información Académica
              </CardTitle>
              <CardDescription>Complete los datos relacionados con la matrícula y estudios</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="grade">Grado a Matricular *</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar grado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="6">Sexto (6°)</SelectItem>
                      <SelectItem value="7">Séptimo (7°)</SelectItem>
                      <SelectItem value="8">Octavo (8°)</SelectItem>
                      <SelectItem value="9">Noveno (9°)</SelectItem>
                      <SelectItem value="10">Décimo (10°)</SelectItem>
                      <SelectItem value="11">Once (11°)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="group">Grupo</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar grupo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="A">A</SelectItem>
                      <SelectItem value="B">B</SelectItem>
                      <SelectItem value="C">C</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="shift">Jornada *</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar jornada" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="morning">Mañana</SelectItem>
                      <SelectItem value="afternoon">Tarde</SelectItem>
                      <SelectItem value="night">Nocturna</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Fecha de Matrícula *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {enrollmentDate ? format(enrollmentDate, "PPP", { locale: es }) : "Seleccionar fecha"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar mode="single" selected={enrollmentDate} onSelect={setEnrollmentDate} initialFocus />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="previousSchool">Institución de Procedencia</Label>
                  <Input id="previousSchool" placeholder="Nombre de la institución anterior" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="observations">Observaciones Académicas</Label>
                <Textarea id="observations" placeholder="Observaciones especiales, necesidades educativas, etc." />
              </div>

              {/* Documentos Académicos */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Documentos Académicos (PDF)</h3>
                <FileUploadCard
                  title="Certificado de Notas"
                  description="Certificado de notas de la institución anterior"
                  file={academicDocuments.grades}
                  onUpload={(file: File) => handleFileUpload("academic", "grades", file)}
                  required={true}
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Paso 3: Información del Acudiente */}
        {currentStep === 3 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Información del Acudiente
              </CardTitle>
              <CardDescription>Complete los datos del responsable del estudiante</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="guardianName">Nombre Completo *</Label>
                  <Input id="guardianName" placeholder="Nombre del acudiente" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="guardianRelation">Parentesco *</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="padre">Padre</SelectItem>
                      <SelectItem value="madre">Madre</SelectItem>
                      <SelectItem value="abuelo">Abuelo/a</SelectItem>
                      <SelectItem value="tio">Tío/a</SelectItem>
                      <SelectItem value="hermano">Hermano/a</SelectItem>
                      <SelectItem value="otro">Otro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="guardianDocument">Documento *</Label>
                  <Input id="guardianDocument" placeholder="Número de documento" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="guardianPhone">Teléfono *</Label>
                  <Input id="guardianPhone" placeholder="Número de contacto" />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="guardianEmail">Correo Electrónico</Label>
                  <Input id="guardianEmail" type="email" placeholder="correo@ejemplo.com" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="guardianOccupation">Ocupación</Label>
                  <Input id="guardianOccupation" placeholder="Ocupación del acudiente" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="guardianAddress">Dirección del Acudiente</Label>
                <Textarea id="guardianAddress" placeholder="Dirección completa del acudiente" />
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
            Registrar Estudiante
          </Button>
        )}
      </div>
    </div>
  )
}
