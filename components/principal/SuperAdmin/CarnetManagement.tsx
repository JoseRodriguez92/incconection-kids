"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Upload, Download, Eye, Palette, Users, Search, Save, RotateCcw, GraduationCap, Calendar } from "lucide-react"

// Datos mock para carnets
const carnetTemplates = [
  {
    id: 1,
    nombre: "Plantilla Clásica",
    descripcion: "Diseño tradicional con logo institucional",
    colores: ["#1e40af", "#ffffff", "#f3f4f6"],
    preview: "/placeholder.svg?height=200&width=320",
  },
  {
    id: 2,
    nombre: "Plantilla Moderna",
    descripcion: "Diseño contemporáneo con gradientes",
    colores: ["#7c3aed", "#ec4899", "#ffffff"],
    preview: "/placeholder.svg?height=200&width=320",
  },
  {
    id: 3,
    nombre: "Plantilla Minimalista",
    descripcion: "Diseño limpio y simple",
    colores: ["#374151", "#ffffff", "#e5e7eb"],
    preview: "/placeholder.svg?height=200&width=320",
  },
]

const sampleUsers = [
  {
    id: 1,
    nombre: "Ana García",
    rol: "Estudiante",
    grado: "10°A",
    codigo: "EST001",
    foto: "/ana-abstract-geometric.png",
    ruta: "Ruta Norte - Parada Centro Comercial",
    numeroRuta: "R-01",
    rh: "O+",
  },
  {
    id: 2,
    nombre: "Carlos Mendoza",
    rol: "Profesor",
    materia: "Matemáticas",
    codigo: "DOC001",
    foto: "/portrait-carlos.png",
    rh: "A+",
  },
  {
    id: 3,
    nombre: "María López",
    rol: "Estudiante",
    grado: "11°B",
    codigo: "EST002",
    foto: "/portrait-thoughtful-woman.png",
    ruta: "Ruta Sur - Parada Plaza Principal",
    numeroRuta: "R-03",
    rh: "B-",
  },
]

const backgroundImages = [
  {
    id: 1,
    nombre: "Geométrico Azul",
    url: "/geometric-blue-pattern-background.jpg",
    preview: "/geometric-blue-pattern.jpg",
  },
  {
    id: 2,
    nombre: "Ondas Modernas",
    url: "/modern-waves-gradient-background.jpg",
    preview: "/modern-waves-gradient.jpg",
  },
  {
    id: 3,
    nombre: "Textura Elegante",
    url: "/elegant-texture-pattern-background.jpg",
    preview: "/elegant-texture-pattern.jpg",
  },
  {
    id: 4,
    nombre: "Gradiente Suave",
    url: "/soft-gradient-abstract-background.jpg",
    preview: "/soft-gradient-abstract.jpg",
  },
]

const periodoConfigs = {
  "2023": {
    nombreInstitucion: "Colegio San José",
    colorPrincipal: "#1e40af",
    colorSecundario: "#ffffff",
    colorTexto: "#374151",
    textoAdicional: "Año Lectivo 2023",
    usarImagenFondo: false,
    imagenFondoUrl: "",
  },
  "2024": {
    nombreInstitucion: "Colegio San José",
    colorPrincipal: "#7c3aed",
    colorSecundario: "#ffffff",
    colorTexto: "#374151",
    textoAdicional: "Año Lectivo 2024",
    usarImagenFondo: false,
    imagenFondoUrl: "",
  },
  "2025": {
    nombreInstitucion: "Colegio San José",
    colorPrincipal: "#059669",
    colorSecundario: "#ffffff",
    colorTexto: "#374151",
    textoAdicional: "Año Lectivo 2025",
    usarImagenFondo: true,
    imagenFondoUrl: "/geometric-blue-pattern-background.jpg",
  },
}

export function CarnetManagement() {
  const [selectedPeriodo, setSelectedPeriodo] = useState("2024")
  const [selectedTemplate, setSelectedTemplate] = useState(carnetTemplates[0])
  const [showBackSide, setShowBackSide] = useState(false)
  const [carnetConfig, setCarnetConfig] = useState({
    nombreInstitucion: "Colegio Jaime Quijano",
    logoUrl: "",
    colorPrincipal: "#1e40af",
    colorSecundario: "#ffffff",
    colorTexto: "#374151",
    usarImagenFondo: false,
    imagenFondoUrl: "",
    mostrarCodigo: true,
    mostrarGrado: true,
    mostrarFoto: true,
    textoAdicional: "Año Lectivo 2024",
    fraseValidacion:
      "Este carnet es válido únicamente para el período académico vigente y debe portarse en todo momento dentro de las instalaciones educativas.",
    nombreRector: "Dr. María Elena Rodríguez",
    cargoRector: "Rectora",
    firmaRectorUrl: "",
    telefonoInstitucion: "+57 (1) 234-5678",
    direccionInstitucion: "Calle 123 #45-67, Bogotá D.C.",
    emailInstitucion: "info@colegiosanjose.edu.co",
  })
  const [searchUser, setSearchUser] = useState("")
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState(sampleUsers[0])

  const filteredUsers = sampleUsers.filter(
    (user) =>
      user.nombre.toLowerCase().includes(searchUser.toLowerCase()) ||
      user.codigo.toLowerCase().includes(searchUser.toLowerCase()),
  )

  const handleConfigChange = (field: string, value: string | boolean) => {
    setCarnetConfig((prev) => ({ ...prev, [field]: value }))
  }

  const handleGenerateAllCarnets = () => {
    console.log("Generando carnets para todos los usuarios...")
    // Lógica para generar carnets masivamente
  }

  const handleExportCarnet = (userId: number) => {
    console.log(`Exportando carnet para usuario ${userId}`)
    // Lógica para exportar carnet individual
  }

  const handleSelectBackgroundImage = (imageUrl: string) => {
    setCarnetConfig((prev) => ({
      ...prev,
      usarImagenFondo: true,
      imagenFondoUrl: imageUrl,
    }))
  }

  const getCarnetBackgroundStyle = () => {
    if (carnetConfig.usarImagenFondo && carnetConfig.imagenFondoUrl) {
      return {
        backgroundImage: `url(${carnetConfig.imagenFondoUrl})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }
    }
    return {
      backgroundColor: carnetConfig.colorPrincipal,
    }
  }

  const handlePeriodoChange = (periodo: string) => {
    setSelectedPeriodo(periodo)
    const config = periodoConfigs[periodo as keyof typeof periodoConfigs]
    if (config) {
      setCarnetConfig((prev) => ({
        ...prev,
        ...config,
      }))
    }
  }

  const renderBackSide = () => (
    <div
      className="w-64 h-[32rem] rounded-xl shadow-2xl relative overflow-hidden border-2 border-white/30"
      style={getCarnetBackgroundStyle()}
    >
      {carnetConfig.usarImagenFondo && <div className="absolute inset-0 bg-black/25 rounded-xl"></div>}

      <div className="relative z-10 h-full flex flex-col p-4">
        {/* Header trasero */}
        <div className="text-center mb-4">
          <h3
            className="text-sm font-bold tracking-wider drop-shadow-sm"
            style={{ color: carnetConfig.colorSecundario }}
          >
            CARNET DE IDENTIFICACIÓN
          </h3>
          <div className="w-20 h-0.5 bg-gradient-to-r from-transparent via-white/50 to-transparent mx-auto mt-1"></div>
        </div>

        {/* Frase de validación */}
        <div className="bg-white/15 backdrop-blur-sm rounded-lg p-3 border border-white/20 mb-4">
          <p className="text-xs leading-relaxed text-justify" style={{ color: carnetConfig.colorSecundario }}>
            {carnetConfig.fraseValidacion}
          </p>
        </div>

        {/* Información de contacto */}
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20 mb-4 space-y-2">
          <h4 className="text-xs font-semibold mb-2" style={{ color: carnetConfig.colorSecundario }}>
            INFORMACIÓN DE CONTACTO
          </h4>
          <div className="space-y-1">
            <p className="text-xs" style={{ color: carnetConfig.colorSecundario }}>
              📞 {carnetConfig.telefonoInstitucion}
            </p>
            <p className="text-xs" style={{ color: carnetConfig.colorSecundario }}>
              📧 {carnetConfig.emailInstitucion}
            </p>
            <p className="text-xs" style={{ color: carnetConfig.colorSecundario }}>
              📍 {carnetConfig.direccionInstitucion}
            </p>
          </div>
        </div>

        {/* Firma del rector */}
        <div className="mt-auto">
          <div className="bg-white/15 backdrop-blur-sm rounded-lg p-3 border border-white/20">
            <div className="text-center space-y-2">
              {carnetConfig.firmaRectorUrl ? (
                <div className="h-8 flex items-center justify-center">
                  <img
                    src={carnetConfig.firmaRectorUrl || "/placeholder.svg"}
                    alt="Firma del Rector"
                    className="max-h-8 max-w-full object-contain"
                  />
                </div>
              ) : (
                <div className="h-8 border-b border-white/30 mb-2"></div>
              )}
              <div>
                <p className="text-xs font-semibold" style={{ color: carnetConfig.colorSecundario }}>
                  {carnetConfig.nombreRector}
                </p>
                <p className="text-xs opacity-75" style={{ color: carnetConfig.colorSecundario }}>
                  {carnetConfig.cargoRector}
                </p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Carnetización</h2>
          <p className="text-muted-foreground">Gestiona y personaliza los carnets virtuales de la institución</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <Select value={selectedPeriodo} onValueChange={handlePeriodoChange}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2023">2023</SelectItem>
                <SelectItem value="2024">2024</SelectItem>
                <SelectItem value="2025">2025</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={handleGenerateAllCarnets} className="flex items-center space-x-2">
            <Download className="w-4 h-4" />
            <span>Generar Todos</span>
          </Button>
        </div>
      </div>

      <div className="bg-muted/50 border border-border rounded-lg p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-primary" />
            <span className="font-medium">Período Académico: {selectedPeriodo}</span>
          </div>
          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
            Diseño {selectedPeriodo}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          Visualizando el diseño de carnet correspondiente al año académico {selectedPeriodo}. Cada período puede tener
          colores, fondos y estilos únicos.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Panel de configuración */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Palette className="w-5 h-5" />
                <span>Configuración del Carnet</span>
                <Badge variant="secondary" className="ml-auto text-xs">
                  {selectedPeriodo}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
                <div className="flex items-center space-x-2 mb-2">
                  <Calendar className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium text-primary">Configuración {selectedPeriodo}</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Los cambios se aplicarán al diseño del período académico {selectedPeriodo}. Puedes cambiar de período
                  para comparar diferentes diseños.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="institucion">Nombre de la Institución</Label>
                <Input
                  id="institucion"
                  value={carnetConfig.nombreInstitucion}
                  onChange={(e) => handleConfigChange("nombreInstitucion", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="logo">Logo de la Institución</Label>
                <div className="flex space-x-2">
                  <Input
                    id="logo"
                    placeholder="URL del logo"
                    value={carnetConfig.logoUrl}
                    onChange={(e) => handleConfigChange("logoUrl", e.target.value)}
                  />
                  <Button variant="outline" size="sm">
                    <Upload className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-3">
                <Label>Fondo del Carnet</Label>
                <div className="space-y-2">
                  <Label htmlFor="imagenFondo">URL de Imagen de Fondo</Label>
                  <div className="flex space-x-2">
                    <Input
                      id="imagenFondo"
                      placeholder="URL de la imagen"
                      value={carnetConfig.imagenFondoUrl}
                      onChange={(e) => handleConfigChange("imagenFondoUrl", e.target.value)}
                    />
                    <Button variant="outline" size="sm">
                      <Upload className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Fondos Prediseñados</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {backgroundImages.map((bg) => (
                      <div
                        key={bg.id}
                        onClick={() => handleSelectBackgroundImage(bg.url)}
                        className={`relative cursor-pointer rounded-lg overflow-hidden border-2 transition-colors ${
                          carnetConfig.imagenFondoUrl === bg.url
                            ? "border-primary"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <img
                          src={bg.preview || "/placeholder.svg"}
                          alt={bg.nombre}
                          className="w-full h-12 object-cover"
                        />
                        <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                          <span className="text-white text-xs font-medium text-center px-1">{bg.nombre}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-2">
                    <Label htmlFor="colorTextoImagen">Color de Texto</Label>
                    <Input
                      id="colorTextoImagen"
                      type="color"
                      value={carnetConfig.colorSecundario}
                      onChange={(e) => handleConfigChange("colorSecundario", e.target.value)}
                      className="h-10"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="colorTextoSecundario">Color Secundario</Label>
                    <Input
                      id="colorTextoSecundario"
                      type="color"
                      value={carnetConfig.colorTexto}
                      onChange={(e) => handleConfigChange("colorTexto", e.target.value)}
                      className="h-10"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-between">
                <Button variant="outline" size="sm">
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Restablecer
                </Button>
                <Button size="sm">
                  <Save className="w-4 h-4 mr-2" />
                  Guardar
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <GraduationCap className="w-5 h-5" />
                <span>Configuración Parte Trasera</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fraseValidacion">Frase de Validación</Label>
                <textarea
                  id="fraseValidacion"
                  value={carnetConfig.fraseValidacion}
                  onChange={(e) => handleConfigChange("fraseValidacion", e.target.value)}
                  className="w-full p-2 border border-border rounded-md text-sm resize-none h-20"
                  placeholder="Ingrese la frase de validación del carnet..."
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-2">
                  <Label htmlFor="nombreRector">Nombre del Rector</Label>
                  <Input
                    id="nombreRector"
                    value={carnetConfig.nombreRector}
                    onChange={(e) => handleConfigChange("nombreRector", e.target.value)}
                    placeholder="Dr. Juan Pérez"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cargoRector">Cargo</Label>
                  <Input
                    id="cargoRector"
                    value={carnetConfig.cargoRector}
                    onChange={(e) => handleConfigChange("cargoRector", e.target.value)}
                    placeholder="Rector"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="firmaRector">Firma del Rector</Label>
                <div className="flex space-x-2">
                  <Input
                    id="firmaRector"
                    placeholder="URL de la firma"
                    value={carnetConfig.firmaRectorUrl}
                    onChange={(e) => handleConfigChange("firmaRectorUrl", e.target.value)}
                  />
                  <Button variant="outline" size="sm">
                    <Upload className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="telefonoInstitucion">Teléfono</Label>
                <Input
                  id="telefonoInstitucion"
                  value={carnetConfig.telefonoInstitucion}
                  onChange={(e) => handleConfigChange("telefonoInstitucion", e.target.value)}
                  placeholder="+57 (1) 234-5678"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="emailInstitucion">Email</Label>
                <Input
                  id="emailInstitucion"
                  value={carnetConfig.emailInstitucion}
                  onChange={(e) => handleConfigChange("emailInstitucion", e.target.value)}
                  placeholder="info@colegio.edu.co"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="direccionInstitucion">Dirección</Label>
                <Input
                  id="direccionInstitucion"
                  value={carnetConfig.direccionInstitucion}
                  onChange={(e) => handleConfigChange("direccionInstitucion", e.target.value)}
                  placeholder="Calle 123 #45-67, Ciudad"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Vista previa y lista de usuarios */}
        <div className="lg:col-span-2 space-y-6">
          {/* Vista previa del carnet */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Eye className="w-5 h-5" />
                  <span>Vista Previa del Carnet</span>
                  <div className="flex items-center space-x-1 ml-4">
                    <Button
                      variant={!showBackSide ? "default" : "outline"}
                      size="sm"
                      onClick={() => setShowBackSide(false)}
                    >
                      Frente
                    </Button>
                    <Button
                      variant={showBackSide ? "default" : "outline"}
                      size="sm"
                      onClick={() => setShowBackSide(true)}
                    >
                      Reverso
                    </Button>
                  </div>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="py-8">
              <div className="flex justify-center items-center min-h-fit">
                {showBackSide ? (
                  renderBackSide()
                ) : (
                  <div
                    className="w-64 h-[32rem] rounded-xl shadow-2xl relative overflow-hidden border-2 border-white/30"
                    style={getCarnetBackgroundStyle()}
                  >
                    {carnetConfig.usarImagenFondo && <div className="absolute inset-0 bg-black/25 rounded-xl"></div>}

                    <div className="relative z-10 h-full flex flex-col">
                      <div className="bg-gradient-to-r from-white/15 to-white/10 backdrop-blur-md p-3 border-b border-white/30">
                        <div className="flex items-center justify-center space-x-3">
                          {/* Logo del colegio */}
                          <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center border border-white/30 shadow-sm">
                            <GraduationCap className="w-5 h-5" style={{ color: carnetConfig.colorSecundario }} />
                          </div>

                          {/* Nombre de la institución */}
                          <div className="text-center">
                            <h3
                              className="text-sm font-bold tracking-wider drop-shadow-sm"
                              style={{ color: carnetConfig.colorSecundario }}
                            >
                              {carnetConfig.nombreInstitucion.toUpperCase()}
                            </h3>
                          </div>
                        </div>
                        <div className="w-20 h-0.5 bg-gradient-to-r from-transparent via-white/50 to-transparent mx-auto mt-1.5"></div>
                      </div>

                      {/* Contenido principal mejorado */}
                      <div className="flex-1 p-4 flex flex-col items-center space-y-4">
                        {/* Foto del usuario centrada */}
                        <div className="relative flex-shrink-0 flex items-center justify-center">
                          <div className="absolute -inset-1.5 bg-gradient-to-br from-white/30 to-white/10 rounded-full blur-sm"></div>
                          <div className="absolute -inset-0.5 bg-white/20 rounded-full"></div>
                          <Avatar className="w-20 h-20 relative border-2 border-white/40 shadow-lg">
                            <AvatarImage
                              src={selectedUser.foto || "/placeholder.svg"}
                              className="object-cover object-center"
                            />
                            <AvatarFallback className="bg-white/20 text-white font-bold text-xl flex items-center justify-center">
                              {selectedUser.nombre.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          {/* Indicador de estado */}
                          <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-400 border-2 border-white rounded-full shadow-sm"></div>
                        </div>

                        {/* Información del usuario centrada */}
                        <div className="w-full space-y-3 text-center">
                          {/* Nombre */}
                          <div>
                            <p
                              className="text-lg font-bold leading-tight drop-shadow-sm"
                              style={{ color: carnetConfig.colorSecundario }}
                            >
                              {selectedUser.nombre}
                            </p>
                          </div>

                          {/* Perfil/Rol y Curso/Grupo */}
                          <div className="flex items-center justify-center space-x-2">
                            <div
                              className="px-3 py-1.5 rounded-full text-sm font-semibold bg-white/25 backdrop-blur-sm border border-white/20 shadow-sm"
                              style={{ color: carnetConfig.colorSecundario }}
                            >
                              {selectedUser.rol}
                            </div>
                            {selectedUser.grado && (
                              <div
                                className="px-3 py-1.5 rounded-full text-sm font-semibold bg-white/20 backdrop-blur-sm border border-white/15"
                                style={{ color: carnetConfig.colorSecundario }}
                              >
                                {selectedUser.grado}
                              </div>
                            )}
                          </div>

                          {/* Información adicional en grid vertical */}
                          <div className="space-y-2 mt-4">
                            {/* Ruta - solo código */}
                            {selectedUser.numeroRuta && (
                              <div className="bg-white/15 backdrop-blur-sm rounded-lg p-3 border border-white/20">
                                <p className="text-sm font-semibold" style={{ color: carnetConfig.colorSecundario }}>
                                  {selectedUser.numeroRuta}
                                </p>
                                <p className="text-xs opacity-75" style={{ color: carnetConfig.colorSecundario }}>
                                  Ruta de Transporte
                                </p>
                              </div>
                            )}

                            {/* RH y Código en una fila */}
                            <div className="grid grid-cols-2 gap-2">
                              <div className="bg-white/15 backdrop-blur-sm rounded-lg p-3 border border-white/20 text-center">
                                <p className="text-sm font-semibold" style={{ color: carnetConfig.colorSecundario }}>
                                  {selectedUser.rh}
                                </p>
                                <p className="text-xs opacity-75" style={{ color: carnetConfig.colorSecundario }}>
                                  Tipo de Sangre
                                </p>
                              </div>

                              <div className="bg-white/15 backdrop-blur-sm rounded-lg p-3 border border-white/20 text-center">
                                <p
                                  className="text-sm font-mono font-semibold"
                                  style={{ color: carnetConfig.colorSecundario }}
                                >
                                  {selectedUser.codigo}
                                </p>
                                <p className="text-xs opacity-75" style={{ color: carnetConfig.colorSecundario }}>
                                  Código ID
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Footer del carnet */}
                      <div className="bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-sm p-2 text-center border-t border-white/30">
                        <p className="text-xs font-medium" style={{ color: carnetConfig.colorSecundario }}>
                          {carnetConfig.textoAdicional}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Lista de usuarios */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Users className="w-5 h-5" />
                  <span>Usuarios para Carnetización</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      placeholder="Buscar usuario..."
                      value={searchUser}
                      onChange={(e) => setSearchUser(e.target.value)}
                      className="pl-10 w-64"
                    />
                  </div>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {filteredUsers.map((user) => (
                  <div
                    key={user.id}
                    className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedUser.id === user.id
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    }`}
                    onClick={() => setSelectedUser(user)}
                  >
                    <div className="flex items-center space-x-3">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={user.foto || "/placeholder.svg"} />
                        <AvatarFallback>{user.nombre.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{user.nombre}</p>
                        <div className="flex items-center space-x-2">
                          <Badge variant="secondary" className="text-xs">
                            {user.rol}
                          </Badge>
                          <span className="text-sm text-muted-foreground">{user.codigo}</span>
                          {user.grado && <span className="text-sm text-muted-foreground">• {user.grado}</span>}
                          {user.materia && <span className="text-sm text-muted-foreground">• {user.materia}</span>}
                          {/* Mostrando información de ruta en la lista de usuarios */}
                          {user.ruta && <span className="text-sm text-muted-foreground">• {user.numeroRuta}</span>}
                          {/* Mostrando tipo de sangre RH en la lista de usuarios */}
                          {user.rh && <span className="text-sm text-muted-foreground">• {user.rh}</span>}
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleExportCarnet(user.id)
                        }}
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
