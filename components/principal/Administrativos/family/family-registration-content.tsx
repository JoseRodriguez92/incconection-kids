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
import { CalendarIcon, Check, User, Heart, Users, Upload, FileText, Camera, FileCheck } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"

// Componente para subir archivos
function FileUploadCard({
  title,
  description,
  icon: Icon,
  uploaded = false,
}: {
  title: string
  description: string
  icon: any
  uploaded?: boolean
}) {
  return (
    <div
      className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors ${uploaded ? "border-green-300 bg-green-50" : "border-gray-300 hover:border-gray-400"
        }`}
    >
      <Icon className={`mx-auto h-8 w-8 mb-2 ${uploaded ? "text-green-600" : "text-gray-400"}`} />
      <h4 className="font-medium text-sm mb-1">{title}</h4>
      <p className="text-xs text-muted-foreground mb-3">{description}</p>
      <Button variant="outline" size="sm" className="w-full">
        <Upload className="h-3 w-3 mr-2" />
        {uploaded ? "Cambiar archivo" : "Subir PDF"}
      </Button>
      {uploaded && (
        <Badge variant="secondary" className="mt-2">
          Subido
        </Badge>
      )}
    </div>
  )
}

export function FamilyRegistrationContent() {
  const [currentStep, setCurrentStep] = useState(1)
  const [birthDate, setBirthDate] = useState<Date>()

  const steps = [
    { number: 1, title: "Información Personal", icon: User },
    { number: 2, title: "Relación Familiar", icon: Heart },
    { number: 3, title: "Información Socioeconómica", icon: Users },
  ]

  const nextStep = () => {
    if (currentStep < 3) setCurrentStep(currentStep + 1)
  }

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1)
  }

  const handleSubmit = () => {
    console.log("Enviando registro de familiar...")
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Registro de Familiar</h1>
        <p className="text-muted-foreground">Registra un familiar de estudiante en el sistema</p>
      </div>

      {/* Stepper */}
      <div className="flex items-center justify-center space-x-8">
        {steps.map((step, index) => (
          <div key={step.number} className="flex items-center">
            <div className="flex flex-col items-center space-y-2">
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-colors ${currentStep > step.number
                    ? "bg-green-500 border-green-500 text-white"
                    : currentStep === step.number
                      ? "bg-blue-500 border-blue-500 text-white"
                      : "bg-gray-100 border-gray-300 text-gray-400"
                  }`}
              >
                {currentStep > step.number ? <Check className="h-6 w-6" /> : <step.icon className="h-6 w-6" />}
              </div>
              <div className="text-center">
                <div
                  className={`text-sm font-medium ${currentStep >= step.number ? "text-gray-900" : "text-gray-400"}`}
                >
                  {step.title}
                </div>
              </div>
            </div>
            {index < steps.length - 1 && (
              <div className={`w-16 h-0.5 mx-4 ${currentStep > step.number ? "bg-green-500" : "bg-gray-300"}`} />
            )}
          </div>
        ))}
      </div>

      {/* Contenido del paso actual */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {/** @ts-ignore */}
            {steps[currentStep - 1].icon && <User className="h-5 w-5" />}
            {steps[currentStep - 1].title}
          </CardTitle>
          <CardDescription>
            {currentStep === 1 && "Datos básicos del familiar"}
            {currentStep === 2 && "Información sobre la relación con el estudiante"}
            {currentStep === 3 && "Datos laborales y socioeconómicos"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Paso 1: Información Personal */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="firstName">Nombres *</Label>
                  <Input id="firstName" placeholder="Nombres del familiar" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Apellidos *</Label>
                  <Input id="lastName" placeholder="Apellidos del familiar" />
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
                  <Label htmlFor="birthPlace">Lugar de Nacimiento</Label>
                  <Input id="birthPlace" placeholder="Ciudad, Departamento" />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="phone">Teléfono *</Label>
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

              {/* Documentos Paso 1 */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Documentos Requeridos</h3>
                <div className="grid gap-4 md:grid-cols-3">
                  <FileUploadCard
                    title="Documento de Identidad"
                    description="Fotocopia del documento de identidad"
                    icon={FileText}
                  />
                  <FileUploadCard title="Foto 3x4" description="Fotografía reciente tamaño 3x4" icon={Camera} />
                  <FileUploadCard
                    title="Autorización de Datos"
                    description="Autorización para el tratamiento de datos"
                    icon={FileCheck}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Paso 2: Relación Familiar */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="student">Estudiante Relacionado *</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar estudiante" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Ana García Pérez - 10°A</SelectItem>
                      <SelectItem value="2">Carlos Rodríguez López - 11°B</SelectItem>
                      <SelectItem value="3">María López Martínez - 9°C</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="relationship">Parentesco *</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar parentesco" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="padre">Padre</SelectItem>
                      <SelectItem value="madre">Madre</SelectItem>
                      <SelectItem value="abuelo">Abuelo</SelectItem>
                      <SelectItem value="abuela">Abuela</SelectItem>
                      <SelectItem value="tio">Tío</SelectItem>
                      <SelectItem value="tia">Tía</SelectItem>
                      <SelectItem value="hermano">Hermano</SelectItem>
                      <SelectItem value="hermana">Hermana</SelectItem>
                      <SelectItem value="otro">Otro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="isGuardian">¿Es acudiente autorizado? *</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="si">Sí</SelectItem>
                      <SelectItem value="no">No</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="emergencyContact">¿Contacto de emergencia? *</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="si">Sí</SelectItem>
                      <SelectItem value="no">No</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="observations">Observaciones</Label>
                <Textarea id="observations" placeholder="Información adicional sobre la relación familiar..." />
              </div>

              {/* Documentos Paso 2 */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Documentos de Relación</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <FileUploadCard
                    title="Certificado Laboral"
                    description="Certificado laboral del familiar"
                    icon={FileText}
                  />
                  <FileUploadCard
                    title="Autorización de Acudiente"
                    description="Documento de autorización como acudiente"
                    icon={FileCheck}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Paso 3: Información Socioeconómica */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="occupation">Ocupación</Label>
                  <Input id="occupation" placeholder="Profesión u ocupación" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company">Empresa/Lugar de Trabajo</Label>
                  <Input id="company" placeholder="Nombre de la empresa" />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="workPhone">Teléfono Laboral</Label>
                  <Input id="workPhone" placeholder="Teléfono del trabajo" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="income">Ingresos Mensuales</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Rango de ingresos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Menos de 1 SMMLV</SelectItem>
                      <SelectItem value="2">1 - 2 SMMLV</SelectItem>
                      <SelectItem value="3">2 - 3 SMMLV</SelectItem>
                      <SelectItem value="4">3 - 5 SMMLV</SelectItem>
                      <SelectItem value="5">Más de 5 SMMLV</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="education">Nivel Educativo</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="primaria">Primaria</SelectItem>
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
                  <Label htmlFor="maritalStatus">Estado Civil</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="soltero">Soltero(a)</SelectItem>
                      <SelectItem value="casado">Casado(a)</SelectItem>
                      <SelectItem value="union_libre">Unión Libre</SelectItem>
                      <SelectItem value="divorciado">Divorciado(a)</SelectItem>
                      <SelectItem value="viudo">Viudo(a)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navegación */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={prevStep} disabled={currentStep === 1}>
          Anterior
        </Button>

        {currentStep < 3 ? (
          <Button onClick={nextStep}>Siguiente</Button>
        ) : (
          <Button onClick={handleSubmit}>Registrar Familiar</Button>
        )}
      </div>
    </div>
  )
}
