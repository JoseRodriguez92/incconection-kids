"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Switch } from "@/components/ui/switch"
import {
  Send,
  Save,
  Bell,
  Users,
  Eye,
  AlertTriangle,
  Info,
  CheckCircle,
  Zap,
  Target,
  FileText,
  Calendar,
  Upload,
  X,
  Paperclip,
} from "lucide-react"

export function NotificationCreateContent() {
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [notificationType, setNotificationType] = useState("")
  const [priority, setPriority] = useState("")
  const [selectedRecipients, setSelectedRecipients] = useState<string[]>([])
  const [isUrgent, setIsUrgent] = useState(false)
  const [scheduledDate, setScheduledDate] = useState("")
  const [scheduledTime, setScheduledTime] = useState("")
  const [attachedFiles, setAttachedFiles] = useState<File[]>([])

  const [recipientType, setRecipientType] = useState("")
  const [selectedGrade, setSelectedGrade] = useState("")
  const [courseRecipients, setCourseRecipients] = useState<string[]>([])
  const [customDescription, setCustomDescription] = useState("")
  const [customDetails, setCustomDetails] = useState("")

  const recipientGroups = [
    "Todos los estudiantes",
    "Estudiantes de 9°",
    "Estudiantes de 10°",
    "Estudiantes de 11°",
    "Todos los padres",
    "Personal docente",
    "Personal administrativo",
  ]

  const toggleRecipient = (recipient: string) => {
    setSelectedRecipients((prev) =>
      prev.includes(recipient) ? prev.filter((r) => r !== recipient) : [...prev, recipient],
    )
  }

  const handleSend = () => {
    console.log("Enviando notificación:", {
      title,
      content,
      notificationType,
      priority,
      recipientType,
      selectedGrade,
      courseRecipients,
      customDescription,
      customDetails,
      attachedFiles: attachedFiles.map((f) => ({ name: f.name, size: f.size, type: f.type })),
    })
  }

  const handleSaveDraft = () => {
    console.log("Guardando borrador:", {
      title,
      content,
      notificationType,
      priority,
      selectedRecipients,
      attachedFiles: attachedFiles.map((f) => ({ name: f.name, size: f.size, type: f.type })),
    })
  }

  const renderTypeIcon = (type: string) => {
    switch (type) {
      case "info":
        return <Info className="h-4 w-4 text-blue-600" />
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "urgent":
        return <Zap className="h-4 w-4 text-red-600" />
      default:
        return <Info className="h-4 w-4 text-blue-600" />
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "info":
        return "Informativa"
      case "warning":
        return "Advertencia"
      case "success":
        return "Éxito"
      case "urgent":
        return "Urgente"
      default:
        return "Sin definir"
    }
  }

  const getPreviewBgClass = (type: string) => {
    switch (type) {
      case "info":
        return "bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800"
      case "warning":
        return "bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-800"
      case "success":
        return "bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800"
      case "urgent":
        return "bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800"
      default:
        return "bg-muted/50"
    }
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    setAttachedFiles((prev) => [...prev, ...files])
  }

  const removeFile = (index: number) => {
    setAttachedFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split(".").pop()?.toLowerCase()
    switch (extension) {
      case "pdf":
        return <FileText className="h-4 w-4 text-red-500" />
      case "jpg":
      case "jpeg":
      case "png":
      case "gif":
        return <Eye className="h-4 w-4 text-green-500" />
      case "xlsx":
      case "xls":
      case "csv":
        return <FileText className="h-4 w-4 text-green-600" />
      case "doc":
      case "docx":
        return <FileText className="h-4 w-4 text-blue-600" />
      default:
        return <FileText className="h-4 w-4 text-gray-500" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-lg">
        <div className="flex items-center gap-3">
          <Bell className="h-8 w-8" />
          <div>
            <h1 className="text-2xl font-bold">Crear Notificación</h1>
            <p className="text-blue-100">Envía comunicados importantes a la comunidad educativa</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Formulario principal */}
        <div className="lg:col-span-2 space-y-6">
          {/* Configuración básica */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-blue-600" />
                Configuración de la Notificación
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Tipo de Notificación *</Label>
                  <Select value={notificationType} onValueChange={setNotificationType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="info">
                        <div className="flex items-center gap-2">
                          <Info className="h-4 w-4 text-blue-600" />
                          Informativa
                        </div>
                      </SelectItem>
                      <SelectItem value="warning">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4 text-yellow-600" />
                          Advertencia
                        </div>
                      </SelectItem>
                      <SelectItem value="success">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          Éxito
                        </div>
                      </SelectItem>
                      <SelectItem value="urgent">
                        <div className="flex items-center gap-2">
                          <Zap className="h-4 w-4 text-red-600" />
                          Urgente
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="priority">Prioridad *</Label>
                  <Select value={priority} onValueChange={setPriority}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar prioridad" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="baja">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-green-500"></div>
                          Baja
                        </div>
                      </SelectItem>
                      <SelectItem value="media">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                          Media
                        </div>
                      </SelectItem>
                      <SelectItem value="alta">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                          Alta
                        </div>
                      </SelectItem>
                      <SelectItem value="critica">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-red-500"></div>
                          Crítica
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="title">Título de la Notificación *</Label>
                <Input
                  id="title"
                  placeholder="Ej: Reunión de padres de familia"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">Contenido del Mensaje *</Label>
                <Textarea
                  id="content"
                  placeholder="Escribe aquí el contenido completo de la notificación..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="min-h-[120px] resize-none"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="files" className="flex items-center gap-2">
                  <Paperclip className="h-4 w-4" />
                  Adjuntar Archivos (Opcional)
                </Label>
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center hover:border-muted-foreground/50 transition-colors">
                  <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Arrastra archivos aquí o haz clic para seleccionar</p>
                    <p className="text-xs text-muted-foreground">
                      Formatos soportados: PDF, Imágenes, Excel, Word, etc. (Máx. 10MB por archivo)
                    </p>
                    <Input
                      id="files"
                      type="file"
                      multiple
                      accept=".pdf,.jpg,.jpeg,.png,.gif,.xlsx,.xls,.csv,.doc,.docx,.txt,.zip,.rar"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => document.getElementById("files")?.click()}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Seleccionar Archivos
                    </Button>
                  </div>
                </div>

                {attachedFiles.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <Label className="text-sm font-medium">Archivos adjuntos ({attachedFiles.length}):</Label>
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {attachedFiles.map((file, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-2 bg-muted/50 rounded-lg border"
                        >
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            {getFileIcon(file.name)}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{file.name}</p>
                              <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
                            </div>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFile(index)}
                            className="h-8 w-8 p-0 hover:bg-red-100 hover:text-red-600"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center space-x-2 p-4 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg">
                <Switch id="urgent" checked={isUrgent} onCheckedChange={setIsUrgent} />
                <Label htmlFor="urgent" className="flex items-center gap-2 text-sm font-medium">
                  <Zap className="h-4 w-4 text-red-500" />
                  Marcar como urgente (envío inmediato)
                </Label>
              </div>
            </CardContent>
          </Card>

          {/* Destinatarios */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-green-600" />
                Seleccionar Destinatarios
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="recipient-type">Tipo de Destinatario *</Label>
                  <Select value={recipientType} onValueChange={setRecipientType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar tipo de destinatario" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Toda la comunidad educativa</SelectItem>
                      <SelectItem value="estudiantes">Solo estudiantes</SelectItem>
                      <SelectItem value="padres">Solo padres de familia</SelectItem>
                      <SelectItem value="docentes">Solo personal docente</SelectItem>
                      <SelectItem value="administrativos">Solo personal administrativo</SelectItem>
                      <SelectItem value="curso-especifico">Curso específico</SelectItem>
                      <SelectItem value="personalizado">Personalizado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {recipientType === "curso-especifico" && (
                  <div className="space-y-2">
                    <Label htmlFor="grade-select">Seleccionar Curso *</Label>
                    <Select value={selectedGrade} onValueChange={setSelectedGrade}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar curso" />
                      </SelectTrigger>
                      <SelectContent className="max-h-60">
                        <SelectItem value="jardin-a">Jardín A</SelectItem>
                        <SelectItem value="jardin-b">Jardín B</SelectItem>
                        <SelectItem value="transicion-a">Transición A</SelectItem>
                        <SelectItem value="transicion-b">Transición B</SelectItem>
                        <SelectItem value="primero-a">1° A</SelectItem>
                        <SelectItem value="primero-b">1° B</SelectItem>
                        <SelectItem value="segundo-a">2° A</SelectItem>
                        <SelectItem value="segundo-b">2° B</SelectItem>
                        <SelectItem value="tercero-a">3° A</SelectItem>
                        <SelectItem value="tercero-b">3° B</SelectItem>
                        <SelectItem value="cuarto-a">4° A</SelectItem>
                        <SelectItem value="cuarto-b">4° B</SelectItem>
                        <SelectItem value="quinto-a">5° A</SelectItem>
                        <SelectItem value="quinto-b">5° B</SelectItem>
                        <SelectItem value="sexto-a">6° A</SelectItem>
                        <SelectItem value="sexto-b">6° B</SelectItem>
                        <SelectItem value="septimo-a">7° A</SelectItem>
                        <SelectItem value="septimo-b">7° B</SelectItem>
                        <SelectItem value="octavo-a">8° A</SelectItem>
                        <SelectItem value="octavo-b">8° B</SelectItem>
                        <SelectItem value="noveno-a">9° A</SelectItem>
                        <SelectItem value="noveno-b">9° B</SelectItem>
                        <SelectItem value="decimo-a">10° A</SelectItem>
                        <SelectItem value="decimo-b">10° B</SelectItem>
                        <SelectItem value="once-a">11° A</SelectItem>
                        <SelectItem value="once-b">11° B</SelectItem>
                      </SelectContent>
                    </Select>

                    <div className="space-y-2">
                      <Label>¿A quién enviar?</Label>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="estudiantes-curso"
                            checked={courseRecipients.includes("estudiantes")}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setCourseRecipients((prev) => [...prev, "estudiantes"])
                              } else {
                                setCourseRecipients((prev) => prev.filter((r) => r !== "estudiantes"))
                              }
                            }}
                          />
                          <Label htmlFor="estudiantes-curso" className="text-sm">
                            Estudiantes
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="padres-curso"
                            checked={courseRecipients.includes("padres")}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setCourseRecipients((prev) => [...prev, "padres"])
                              } else {
                                setCourseRecipients((prev) => prev.filter((r) => r !== "padres"))
                              }
                            }}
                          />
                          <Label htmlFor="padres-curso" className="text-sm">
                            Padres de familia
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="docente-curso"
                            checked={courseRecipients.includes("docente")}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setCourseRecipients((prev) => [...prev, "docente"])
                              } else {
                                setCourseRecipients((prev) => prev.filter((r) => r !== "docente"))
                              }
                            }}
                          />
                          <Label htmlFor="docente-curso" className="text-sm">
                            Docente titular
                          </Label>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {recipientType === "personalizado" && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="custom-description">Descripción del grupo personalizado *</Label>
                      <Input
                        id="custom-description"
                        placeholder="Ej: Padres del curso de música, Estudiantes del club de ciencias, etc."
                        value={customDescription}
                        onChange={(e) => setCustomDescription(e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="custom-details">Detalles adicionales (Opcional)</Label>
                      <Textarea
                        id="custom-details"
                        placeholder="Especifica cualquier detalle adicional sobre este grupo de destinatarios..."
                        value={customDetails}
                        onChange={(e) => setCustomDetails(e.target.value)}
                        className="min-h-[80px] resize-none"
                      />
                    </div>

                    <div className="p-4 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
                      <div className="flex items-start gap-2">
                        <Info className="h-4 w-4 text-blue-600 mt-0.5" />
                        <div className="text-sm">
                          <p className="font-medium text-blue-800 dark:text-blue-200">Nota importante:</p>
                          <p className="text-blue-700 dark:text-blue-300">
                            Para grupos personalizados, asegúrate de coordinar con el administrador del sistema para
                            verificar que los destinatarios estén correctamente configurados en la base de datos.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Resumen de destinatarios */}
                {recipientType && recipientType !== "personalizado" && (
                  <div className="mt-4 p-4 bg-muted/50 rounded-lg border">
                    <Label className="text-sm font-semibold text-muted-foreground">Resumen de destinatarios:</Label>
                    <div className="mt-2">
                      {recipientType === "todos" && (
                        <Badge variant="secondary" className="text-xs">
                          Toda la comunidad educativa (~500 personas)
                        </Badge>
                      )}
                      {recipientType === "estudiantes" && (
                        <Badge variant="secondary" className="text-xs">
                          Todos los estudiantes (~300 estudiantes)
                        </Badge>
                      )}
                      {recipientType === "padres" && (
                        <Badge variant="secondary" className="text-xs">
                          Todos los padres de familia (~250 padres)
                        </Badge>
                      )}
                      {recipientType === "docentes" && (
                        <Badge variant="secondary" className="text-xs">
                          Personal docente (~25 docentes)
                        </Badge>
                      )}
                      {recipientType === "administrativos" && (
                        <Badge variant="secondary" className="text-xs">
                          Personal administrativo (~15 personas)
                        </Badge>
                      )}
                      {recipientType === "curso-especifico" && selectedGrade && (
                        <div className="space-y-2">
                          <Badge variant="secondary" className="text-xs">
                            Curso: {selectedGrade.replace("-", " ").toUpperCase()}
                          </Badge>
                          <div className="flex flex-wrap gap-1">
                            {courseRecipients.map((recipient) => (
                              <Badge key={recipient} variant="outline" className="text-xs">
                                {recipient === "estudiantes"
                                  ? "Estudiantes"
                                  : recipient === "padres"
                                    ? "Padres"
                                    : "Docente titular"}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {recipientType === "personalizado" && customDescription && (
                  <div className="mt-4 p-4 bg-muted/50 rounded-lg border">
                    <Label className="text-sm font-semibold text-muted-foreground">Grupo personalizado:</Label>
                    <div className="mt-2">
                      <Badge variant="secondary" className="text-xs">
                        {customDescription}
                      </Badge>
                      {customDetails && <p className="text-xs text-muted-foreground mt-2">{customDetails}</p>}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Programación */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-purple-600" />
                Programar Envío (Opcional)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date">Fecha de Envío</Label>
                  <Input
                    id="date"
                    type="date"
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="time">Hora de Envío</Label>
                  <Input
                    id="time"
                    type="time"
                    value={scheduledTime}
                    onChange={(e) => setScheduledTime(e.target.value)}
                  />
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Si no seleccionas fecha y hora, la notificación se enviará inmediatamente.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Panel lateral */}
        <div className="space-y-6">
          {/* Vista previa */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5 text-purple-600" />
                Vista Previa
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`border rounded-lg p-4 ${getPreviewBgClass(notificationType)}`}>
                <div className="flex items-center gap-2 mb-3">
                  {notificationType && renderTypeIcon(notificationType)}
                  <div className="font-semibold text-sm">{title || "Título de la notificación"}</div>
                  {isUrgent && <Zap className="h-3 w-3 text-red-500" />}
                </div>
                <div className="text-xs text-muted-foreground mb-3">
                  <span className="font-medium">Tipo:</span> {getTypeLabel(notificationType)} |
                  <span className="font-medium"> Prioridad:</span> {priority || "Sin definir"}
                </div>
                <div className="text-sm leading-relaxed mb-3">
                  {content || "El contenido de la notificación aparecerá aquí..."}
                </div>
                <div className="flex flex-wrap gap-1">
                  {selectedRecipients.slice(0, 3).map((recipient) => (
                    <Badge key={recipient} variant="outline" className="text-xs">
                      {recipient}
                    </Badge>
                  ))}
                  {selectedRecipients.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{selectedRecipients.length - 3} más
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Estadísticas */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-indigo-600" />
                Alcance Estimado
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Destinatarios:</span>
                <span className="font-semibold">{selectedRecipients.length > 0 ? "~150" : "0"}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Emails:</span>
                <span className="font-semibold">{selectedRecipients.length > 0 ? "~150" : "0"}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Notificaciones Push:</span>
                <span className="font-semibold">{selectedRecipients.length > 0 ? "~120" : "0"}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">SMS:</span>
                <span className="font-semibold">{selectedRecipients.length > 0 ? "~80" : "0"}</span>
              </div>
            </CardContent>
          </Card>

          {/* Plantillas rápidas */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-orange-600" />
                Plantillas Rápidas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" size="sm" className="w-full justify-start text-sm">
                <FileText className="h-3 w-3 mr-2" />
                Reunión de padres
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start text-sm">
                <FileText className="h-3 w-3 mr-2" />
                Suspensión de clases
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start text-sm">
                <FileText className="h-3 w-3 mr-2" />
                Recordatorio de pago
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start text-sm">
                <FileText className="h-3 w-3 mr-2" />
                Evento especial
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Botones de acción */}
      <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t">
        <Button variant="outline" onClick={handleSaveDraft} className="flex-1">
          <Save className="h-4 w-4 mr-2" />
          Guardar como Borrador
        </Button>
        <Button
          onClick={handleSend}
          className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          disabled={!title || !content || !notificationType || selectedRecipients.length === 0}
        >
          <Send className="h-4 w-4 mr-2" />
          {scheduledDate && scheduledTime ? "Programar Envío" : "Enviar Ahora"}
        </Button>
      </div>
    </div>
  )
}
