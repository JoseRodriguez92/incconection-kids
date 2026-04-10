"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Checkbox } from "@/components/ui/checkbox"
import { CalendarIcon, Save, Send, Upload, X, MessageSquare, Users, Eye, FileText } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"

export function CommunicationCreateContent() {
  const [publishDate, setPublishDate] = useState<Date>()
  const [expirationDate, setExpirationDate] = useState<Date>()
  const [selectedRecipients, setSelectedRecipients] = useState<string[]>([])

  const recipientGroups = [
    "Todos los estudiantes",
    "Estudiantes de 9°",
    "Estudiantes de 10°",
    "Estudiantes de 11°",
    "Todos los padres de familia",
    "Padres de 9°",
    "Padres de 10°",
    "Padres de 11°",
    "Personal docente",
    "Personal administrativo",
    "Directivos",
  ]

  const toggleRecipient = (recipient: string) => {
    setSelectedRecipients((prev) =>
      prev.includes(recipient) ? prev.filter((r) => r !== recipient) : [...prev, recipient],
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold">Crear Comunicado</h2>
          <p className="text-muted-foreground">Crea y envía comunicados a la comunidad educativa</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <X className="h-4 w-4 mr-2" />
            Cancelar
          </Button>
          <Button variant="outline" size="sm">
            <Save className="h-4 w-4 mr-2" />
            Guardar Borrador
          </Button>
          <Button size="sm">
            <Send className="h-4 w-4 mr-2" />
            Publicar
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Contenido del comunicado */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Contenido del Comunicado
              </CardTitle>
              <CardDescription>Información principal del comunicado</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Título del Comunicado *</Label>
                <Input id="title" placeholder="Título descriptivo del comunicado" />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="category">Categoría *</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="academico">Académico</SelectItem>
                      <SelectItem value="administrativo">Administrativo</SelectItem>
                      <SelectItem value="eventos">Eventos</SelectItem>
                      <SelectItem value="urgente">Urgente</SelectItem>
                      <SelectItem value="general">General</SelectItem>
                      <SelectItem value="financiero">Financiero</SelectItem>
                      <SelectItem value="disciplinario">Disciplinario</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="priority">Prioridad *</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar prioridad" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="baja">Baja</SelectItem>
                      <SelectItem value="media">Media</SelectItem>
                      <SelectItem value="alta">Alta</SelectItem>
                      <SelectItem value="urgente">Urgente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="summary">Resumen Ejecutivo</Label>
                <Textarea
                  id="summary"
                  placeholder="Breve resumen del comunicado (máximo 200 caracteres)"
                  maxLength={200}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">Contenido del Comunicado *</Label>
                <Textarea
                  id="content"
                  placeholder="Escribe aquí el contenido completo del comunicado..."
                  className="min-h-[200px]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="attachments">Archivos Adjuntos</Label>
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4 text-center">
                  <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">Arrastra archivos aquí o haz clic para seleccionar</p>
                  <Button variant="outline" size="sm" className="mt-2">
                    <Upload className="h-4 w-4 mr-2" />
                    Seleccionar Archivos
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Destinatarios */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Destinatarios
              </CardTitle>
              <CardDescription>Selecciona quién recibirá este comunicado</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 md:grid-cols-2">
                {recipientGroups.map((group) => (
                  <div key={group} className="flex items-center space-x-2">
                    <Checkbox
                      id={group}
                      checked={selectedRecipients.includes(group)}
                      onCheckedChange={() => toggleRecipient(group)}
                    />
                    <Label htmlFor={group} className="text-sm">
                      {group}
                    </Label>
                  </div>
                ))}
              </div>

              {selectedRecipients.length > 0 && (
                <div className="mt-4">
                  <Label className="text-sm font-medium">Destinatarios seleccionados:</Label>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {selectedRecipients.map((recipient) => (
                      <Badge key={recipient} variant="secondary" className="text-xs">
                        {recipient}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="customRecipients">Destinatarios Específicos (Opcional)</Label>
                <Textarea
                  id="customRecipients"
                  placeholder="Ingresa correos electrónicos separados por comas para destinatarios específicos..."
                />
              </div>
            </CardContent>
          </Card>

          {/* Configuración de envío */}
          <Card>
            <CardHeader>
              <CardTitle>Configuración de Envío</CardTitle>
              <CardDescription>Programa cuándo y cómo se enviará el comunicado</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="sendType">Tipo de Envío *</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="inmediato">Envío Inmediato</SelectItem>
                      <SelectItem value="programado">Envío Programado</SelectItem>
                      <SelectItem value="borrador">Guardar como Borrador</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="channel">Canal de Envío *</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar canal" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="plataforma">Solo Plataforma</SelectItem>
                      <SelectItem value="email">Solo Email</SelectItem>
                      <SelectItem value="ambos">Plataforma + Email</SelectItem>
                      <SelectItem value="sms">SMS (Urgente)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Fecha de Publicación</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {publishDate ? format(publishDate, "PPP", { locale: es }) : "Seleccionar fecha"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar mode="single" selected={publishDate} onSelect={setPublishDate} initialFocus />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-2">
                  <Label>Fecha de Expiración (Opcional)</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {expirationDate ? format(expirationDate, "PPP", { locale: es }) : "Seleccionar fecha"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar mode="single" selected={expirationDate} onSelect={setExpirationDate} initialFocus />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <div className="space-y-3">
                <Label>Opciones Adicionales</Label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="requireConfirmation" />
                    <Label htmlFor="requireConfirmation" className="text-sm">
                      Requerir confirmación de lectura
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="allowComments" />
                    <Label htmlFor="allowComments" className="text-sm">
                      Permitir comentarios
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="pinToTop" />
                    <Label htmlFor="pinToTop" className="text-sm">
                      Fijar en la parte superior
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="sendNotification" />
                    <Label htmlFor="sendNotification" className="text-sm">
                      Enviar notificación push
                    </Label>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Panel lateral */}
        <div className="space-y-6">
          {/* Vista previa */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Vista Previa</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border rounded-lg p-4 bg-muted/50">
                <div className="font-medium text-sm mb-2">Título del Comunicado</div>
                <div className="text-xs text-muted-foreground mb-2">Categoría: Académico | Prioridad: Media</div>
                <div className="text-sm">Contenido del comunicado aparecerá aquí...</div>
                <div className="flex gap-2 mt-3">
                  <Badge variant="outline" className="text-xs">
                    Estudiantes
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    Padres
                  </Badge>
                </div>
              </div>
              <Button variant="outline" size="sm" className="w-full">
                <Eye className="h-4 w-4 mr-2" />
                Vista Previa Completa
              </Button>
            </CardContent>
          </Card>

          {/* Estadísticas estimadas */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Alcance Estimado</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span>Destinatarios:</span>
                <span className="font-medium">0</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Emails a enviar:</span>
                <span className="font-medium">0</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Notificaciones push:</span>
                <span className="font-medium">0</span>
              </div>
              <Separator />
              <div className="text-xs text-muted-foreground">
                Las estadísticas se actualizarán al seleccionar destinatarios
              </div>
            </CardContent>
          </Card>

          {/* Plantillas */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Plantillas</CardTitle>
              <CardDescription>Usa plantillas predefinidas</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" size="sm" className="w-full justify-start">
                <FileText className="h-4 w-4 mr-2" />
                Reunión de padres
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start">
                <FileText className="h-4 w-4 mr-2" />
                Suspensión de clases
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start">
                <FileText className="h-4 w-4 mr-2" />
                Evento académico
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start">
                <FileText className="h-4 w-4 mr-2" />
                Recordatorio de pago
              </Button>
            </CardContent>
          </Card>

          {/* Historial reciente */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Comunicados Recientes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-sm">
                <div className="font-medium">Reunión de padres 10°</div>
                <div className="text-xs text-muted-foreground">Hace 2 días • 45 destinatarios</div>
              </div>
              <div className="text-sm">
                <div className="font-medium">Suspensión de clases</div>
                <div className="text-xs text-muted-foreground">Hace 1 semana • 120 destinatarios</div>
              </div>
              <div className="text-sm">
                <div className="font-medium">Recordatorio de pago</div>
                <div className="text-xs text-muted-foreground">Hace 2 semanas • 89 destinatarios</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
