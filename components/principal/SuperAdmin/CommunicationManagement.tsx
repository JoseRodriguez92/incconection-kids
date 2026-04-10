"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { MessageCircle, Search, Send, Plus, Circle } from "lucide-react"
import { conversacionesList, usuariosDisponibles } from "./data"

export default function CommunicationManagement() {
  const [conversacionSeleccionada, setConversacionSeleccionada] = useState(conversacionesList[0])
  const [nuevoMensaje, setNuevoMensaje] = useState("")
  const [busquedaConversacion, setBusquedaConversacion] = useState("")
  const [busquedaUsuario, setBusquedaUsuario] = useState("")
  const [isNewConversationOpen, setIsNewConversationOpen] = useState(false)

  const conversacionesFiltradas = conversacionesList.filter(
    (conv) =>
      conv.usuario.nombre.toLowerCase().includes(busquedaConversacion.toLowerCase()) ||
      conv.usuario.correo.toLowerCase().includes(busquedaConversacion.toLowerCase()),
  )

  const usuariosFiltrados = usuariosDisponibles.filter(
    (usuario) =>
      usuario.nombre.toLowerCase().includes(busquedaUsuario.toLowerCase()) ||
      usuario.correo.toLowerCase().includes(busquedaUsuario.toLowerCase()),
  )

  const handleEnviarMensaje = () => {
    if (nuevoMensaje.trim()) {
      // Aquí iría la lógica para enviar el mensaje
      console.log("[v0] Enviando mensaje:", nuevoMensaje)
      setNuevoMensaje("")
    }
  }

  const handleIniciarConversacion = (usuario: any) => {
    // Aquí iría la lógica para iniciar una nueva conversación
    console.log("[v0] Iniciando conversación con:", usuario.nombre)
    setIsNewConversationOpen(false)
  }

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case "en línea":
        return "bg-green-500"
      case "ausente":
        return "bg-yellow-500"
      case "ocupado":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">Comunicación</h2>
        <Dialog open={isNewConversationOpen} onOpenChange={setIsNewConversationOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center space-x-2">
              <Plus className="w-4 h-4" />
              <span>Nueva Conversación</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Iniciar Nueva Conversación</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Buscar usuario por nombre o correo..."
                  value={busquedaUsuario}
                  onChange={(e) => setBusquedaUsuario(e.target.value)}
                  className="pl-10"
                />
              </div>
              <ScrollArea className="h-64">
                <div className="space-y-2">
                  {usuariosFiltrados.map((usuario) => (
                    <div
                      key={usuario.id}
                      className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-muted cursor-pointer"
                      onClick={() => handleIniciarConversacion(usuario)}
                    >
                      <div className="relative">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={usuario.avatar || "/placeholder.svg"} />
                          <AvatarFallback>
                            {usuario.nombre
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <Circle
                          className={`absolute -bottom-1 -right-1 w-4 h-4 ${getEstadoColor(usuario.estado)} rounded-full border-2 border-background`}
                        />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{usuario.nombre}</p>
                        <p className="text-sm text-muted-foreground">{usuario.correo}</p>
                        <Badge variant="outline" className="text-xs">
                          {usuario.rol}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
        {/* Lista de conversaciones */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MessageCircle className="w-5 h-5" />
              <span>Conversaciones</span>
            </CardTitle>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Buscar conversaciones..."
                value={busquedaConversacion}
                onChange={(e) => setBusquedaConversacion(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[calc(100vh-350px)]">
              <div className="space-y-1 p-4">
                {conversacionesFiltradas.map((conversacion) => (
                  <div
                    key={conversacion.id}
                    className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-colors ${
                      conversacionSeleccionada.id === conversacion.id ? "bg-muted" : "hover:bg-muted/50"
                    }`}
                    onClick={() => setConversacionSeleccionada(conversacion)}
                  >
                    <div className="relative">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={conversacion.usuario.avatar || "/placeholder.svg"} />
                        <AvatarFallback>
                          {conversacion.usuario.nombre
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <Circle
                        className={`absolute -bottom-1 -right-1 w-4 h-4 ${getEstadoColor(conversacion.usuario.estado)} rounded-full border-2 border-background`}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="font-medium truncate">{conversacion.usuario.nombre}</p>
                        {conversacion.mensajesNoLeidos > 0 && (
                          <Badge variant="destructive" className="text-xs">
                            {conversacion.mensajesNoLeidos}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground truncate">{conversacion.ultimoMensaje}</p>
                      <p className="text-xs text-muted-foreground">{conversacion.usuario.ultimaConexion}</p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Área de chat */}
        <Card className="lg:col-span-2 flex flex-col">
          <CardHeader className="flex-shrink-0">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Avatar className="w-10 h-10">
                  <AvatarImage src={conversacionSeleccionada.usuario.avatar || "/placeholder.svg"} />
                  <AvatarFallback>
                    {conversacionSeleccionada.usuario.nombre
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <Circle
                  className={`absolute -bottom-1 -right-1 w-4 h-4 ${getEstadoColor(conversacionSeleccionada.usuario.estado)} rounded-full border-2 border-background`}
                />
              </div>
              <div>
                <h3 className="font-semibold">{conversacionSeleccionada.usuario.nombre}</h3>
                <p className="text-sm text-muted-foreground">{conversacionSeleccionada.usuario.ultimaConexion}</p>
              </div>
            </div>
          </CardHeader>

          <Separator />

          <CardContent className="flex-1 flex flex-col p-0">
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {conversacionSeleccionada.mensajes.map((mensaje) => (
                  <div
                    key={mensaje.id}
                    className={`flex ${mensaje.autor === "Admin" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[70%] p-3 rounded-lg ${
                        mensaje.autor === "Admin" ? "bg-primary text-primary-foreground" : "bg-muted"
                      }`}
                    >
                      <p className="text-sm">{mensaje.mensaje}</p>
                      <p
                        className={`text-xs mt-1 ${
                          mensaje.autor === "Admin" ? "text-primary-foreground/70" : "text-muted-foreground"
                        }`}
                      >
                        {mensaje.fecha}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            <Separator />

            <div className="p-4">
              <div className="flex space-x-2">
                <Input
                  placeholder="Escribe tu mensaje..."
                  value={nuevoMensaje}
                  onChange={(e) => setNuevoMensaje(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleEnviarMensaje()}
                  className="flex-1"
                />
                <Button onClick={handleEnviarMensaje} disabled={!nuevoMensaje.trim()}>
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
