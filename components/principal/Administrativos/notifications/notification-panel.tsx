"use client"

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
import { ScrollArea } from "@/components/ui/scroll-area"
import { X, Send, Save, Bell, Users, Eye, AlertTriangle, Info, CheckCircle, Zap, Target } from "lucide-react"

interface NotificationPanelProps {
  isOpen: boolean
  onClose: () => void
  isIntegrated?: boolean
}

export function NotificationPanel({ isOpen, onClose, isIntegrated = false }: NotificationPanelProps) {
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [notificationType, setNotificationType] = useState("")
  const [priority, setPriority] = useState("")
  const [selectedRecipients, setSelectedRecipients] = useState<string[]>([])
  const [isUrgent, setIsUrgent] = useState(false)

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
    console.log("Enviando notificación:", { title, content, notificationType, priority, selectedRecipients })
    onClose()
  }

  const handleSaveDraft = () => {
    console.log("Guardando borrador:", { title, content, notificationType, priority, selectedRecipients })
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

  if (!isOpen) return null

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          <h3 className="font-semibold">Crear Notificación</h3>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 text-white hover:bg-white/20">
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          {/* Configuración básica */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Bell className="h-4 w-4 text-blue-600" />
                Configuración
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Tipo *</Label>
                  <Select value={notificationType} onValueChange={setNotificationType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="info">
                        <div className="flex items-center gap-2">
                          <Info className="h-4 w-4" />
                          Informativa
                        </div>
                      </SelectItem>
                      <SelectItem value="warning">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4" />
                          Advertencia
                        </div>
                      </SelectItem>
                      <SelectItem value="success">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4" />
                          Éxito
                        </div>
                      </SelectItem>
                      <SelectItem value="urgent">
                        <div className="flex items-center gap-2">
                          <Zap className="h-4 w-4" />
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
                      <SelectValue placeholder="Seleccionar" />
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
                <Label htmlFor="title">Título *</Label>
                <Input
                  id="title"
                  placeholder="Título de la notificación"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">Contenido *</Label>
                <Textarea
                  id="content"
                  placeholder="Escribe el contenido de la notificación..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="min-h-[100px] resize-none"
                />
              </div>

              <div className="flex items-center space-x-2 p-3 bg-muted/50 rounded-lg">
                <Switch id="urgent" checked={isUrgent} onCheckedChange={setIsUrgent} />
                <Label htmlFor="urgent" className="flex items-center gap-2 text-sm">
                  <Zap className="h-4 w-4 text-red-500" />
                  Urgente (envío inmediato)
                </Label>
              </div>
            </CardContent>
          </Card>

          {/* Destinatarios */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="h-4 w-4 text-green-600" />
                Destinatarios
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid gap-2">
                {recipientGroups.map((group) => (
                  <div
                    key={group}
                    className="flex items-center space-x-2 p-2 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <Checkbox
                      id={group}
                      checked={selectedRecipients.includes(group)}
                      onCheckedChange={() => toggleRecipient(group)}
                    />
                    <Label htmlFor={group} className="text-sm cursor-pointer">
                      {group}
                    </Label>
                  </div>
                ))}
              </div>

              {selectedRecipients.length > 0 && (
                <div className="mt-3 p-3 bg-muted/50 rounded-lg">
                  <Label className="text-sm font-medium">Seleccionados:</Label>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {selectedRecipients.map((recipient) => (
                      <Badge key={recipient} variant="secondary" className="text-xs">
                        {recipient}
                        <button onClick={() => toggleRecipient(recipient)} className="ml-1 hover:text-red-500">
                          ×
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Vista previa */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Eye className="h-4 w-4 text-purple-600" />
                Vista Previa
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`border rounded-lg p-4 ${getPreviewBgClass(notificationType)}`}>
                <div className="flex items-center gap-2 mb-2">
                  {notificationType && renderTypeIcon(notificationType)}
                  <div className="font-medium text-sm">{title || "Título de la notificación"}</div>
                  {isUrgent && <Zap className="h-3 w-3 text-red-500" />}
                </div>
                <div className="text-xs text-muted-foreground mb-2">
                  Tipo: {getTypeLabel(notificationType)} | Prioridad: {priority || "Sin definir"}
                </div>
                <div className="text-sm">{content || "El contenido de la notificación aparecerá aquí..."}</div>
                <div className="flex gap-1 mt-3">
                  {selectedRecipients.slice(0, 2).map((recipient) => (
                    <Badge key={recipient} variant="outline" className="text-xs">
                      {recipient}
                    </Badge>
                  ))}
                  {selectedRecipients.length > 2 && (
                    <Badge variant="outline" className="text-xs">
                      +{selectedRecipients.length - 2}
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Estadísticas */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Target className="h-4 w-4 text-indigo-600" />
                Alcance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Destinatarios:</span>
                <span className="font-medium">{selectedRecipients.length > 0 ? "~150" : "0"}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Emails:</span>
                <span className="font-medium">{selectedRecipients.length > 0 ? "~150" : "0"}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Push:</span>
                <span className="font-medium">{selectedRecipients.length > 0 ? "~120" : "0"}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="border-t p-4 bg-muted/30">
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleSaveDraft} className="flex-1">
            <Save className="h-4 w-4 mr-2" />
            Guardar
          </Button>
          <Button
            size="sm"
            onClick={handleSend}
            className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            disabled={!title || !content || !notificationType || selectedRecipients.length === 0}
          >
            <Send className="h-4 w-4 mr-2" />
            Enviar
          </Button>
        </div>
      </div>
    </div>
  )
}
