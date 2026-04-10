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
  Briefcase,
  ChevronRight,
  ChevronLeft,
  Send,
  Check,
} from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"

export function AdministrativeRegistrationContent() {
  const [currentStep, setCurrentStep] = useState(1)
  const [birthDate, setBirthDate] = useState<Date>()
  const [hireDate, setHireDate] = useState<Date>()

  // Estados para documentos
  const [personalDocuments, setPersonalDocuments] = useState({
    identityDocument: null,
    medicalExam: null,
    resume: null,
  })

  const [academicDocuments, setAcademicDocuments] = useState({
    workCertification: null,
    educationCertificates: null,
  })

  const steps = [
    {
      id: 1,
      title: "Información Personal",
      description: "Datos básicos del empleado",
      icon: User,
      completed: false,
    },
    {
      id: 2,
      title: "Información Académica",
      description: "Formación y estudios",
      icon: GraduationCap,
      completed: false,
    },
    {
      id: 3,
      title: "Información Laboral",
      description: "Cargo y funciones",
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
        <h2 className="text-3xl font-bold">Registro de Personal Administrativo</h2>
        <p className="text-muted-foreground mt-2">
          Complete todos los pasos para registrar un nuevo empleado administrativo
        </p>
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
              <CardDescription>Complete los datos básicos del empleado</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Datos Personales */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="firstName">Nombres *</Label>
                  <Input id="firstName" placeholder="Nombres del empleado" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Apellidos *</Label>
                  <Input id="lastName" placeholder="Apellidos del empleado" />
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

        {/* Paso 2: Información Académica */}
        {currentStep === 2 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5" />
                Información Académica
              </CardTitle>
              <CardDescription>Complete los datos de formación y certificaciones</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="education">Nivel Educativo *</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bachiller">Bachiller</SelectItem>
                      <SelectItem value="tecnico">Técnico</SelectItem>
                      <SelectItem value="tecnologo">Tecnólogo</SelectItem>
                      <SelectItem value="profesional">Profesional</SelectItem>
                      <SelectItem value="especialista">Especialista</SelectItem>
                      <SelectItem value="maestria">Maestría</SelectItem>
                      <SelectItem value="doctorado">Doctorado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="title">Título Obtenido *</Label>
                  <Input id="title" placeholder="Ej: Administrador de Empresas" />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="institution">Institución Educativa *</Label>
                  <Input id="institution" placeholder="Nombre de la institución" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="graduationYear">Año de Graduación *</Label>
                  <Input id="graduationYear" type="number" placeholder="2020" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="additionalStudies">Estudios Adicionales</Label>
                <Textarea id="additionalStudies" placeholder="Cursos, diplomados, certificaciones..." />
              </div>

              <div className="space-y-2">
                <Label htmlFor="experience">Experiencia Laboral Previa</Label>
                <Textarea id="experience" placeholder="Experiencia laboral relevante..." />
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
                    title="Certificados de Estudio"
                    description="Títulos académicos y certificaciones adicionales"
                    file={academicDocuments.educationCertificates}
                    onUpload={(file: File) => handleFileUpload("academic", "educationCertificates", file)}
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
              <CardDescription>Complete los datos del cargo y funciones</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="department">Departamento *</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar departamento" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="rectoría">Rectoría</SelectItem>
                      <SelectItem value="secretaria">Secretaría Académica</SelectItem>
                      <SelectItem value="tesoreria">Tesorería</SelectItem>
                      <SelectItem value="sistemas">Sistemas</SelectItem>
                      <SelectItem value="mantenimiento">Mantenimiento</SelectItem>
                      <SelectItem value="biblioteca">Biblioteca</SelectItem>
                      <SelectItem value="psicologia">Psicología</SelectItem>
                      <SelectItem value="enfermeria">Enfermería</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="position">Cargo *</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar cargo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="rector">Rector</SelectItem>
                      <SelectItem value="secretario">Secretario Académico</SelectItem>
                      <SelectItem value="tesorero">Tesorero</SelectItem>
                      <SelectItem value="auxiliar_administrativo">Auxiliar Administrativo</SelectItem>
                      <SelectItem value="recepcionista">Recepcionista</SelectItem>
                      <SelectItem value="bibliotecario">Bibliotecario</SelectItem>
                      <SelectItem value="psicologo">Psicólogo</SelectItem>
                      <SelectItem value="enfermero">Enfermero</SelectItem>
                      <SelectItem value="sistemas">Técnico en Sistemas</SelectItem>
                      <SelectItem value="mantenimiento">Personal de Mantenimiento</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
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
                  <Label htmlFor="workload">Jornada Laboral *</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Jornada" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="completa">Tiempo Completo</SelectItem>
                      <SelectItem value="medio">Medio Tiempo</SelectItem>
                      <SelectItem value="parcial">Tiempo Parcial</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="schedule">Horario *</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Horario" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="6-14">6:00 AM - 2:00 PM</SelectItem>
                      <SelectItem value="7-15">7:00 AM - 3:00 PM</SelectItem>
                      <SelectItem value="8-16">8:00 AM - 4:00 PM</SelectItem>
                      <SelectItem value="14-22">2:00 PM - 10:00 PM</SelectItem>
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

              <div className="space-y-2">
                <Label htmlFor="responsibilities">Funciones y Responsabilidades</Label>
                <Textarea id="responsibilities" placeholder="Describe las principales funciones del cargo..." />
              </div>

              <div className="space-y-2">
                <Label htmlFor="supervisor">Supervisor Directo</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar supervisor" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="rector">Rector</SelectItem>
                    <SelectItem value="secretario">Secretario Académico</SelectItem>
                    <SelectItem value="coordinador">Coordinador</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="emergencyContact">Contacto de Emergencia</Label>
                <Input id="emergencyContact" placeholder="Nombre y teléfono" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="observations">Observaciones</Label>
                <Textarea id="observations" placeholder="Información adicional relevante..." />
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
            Registrar Empleado
          </Button>
        )}
      </div>
    </div>
  )
}
