"use client"

import type React from "react"

import { useState } from "react"
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CreditCard, DollarSign, Calendar, Download, Eye, AlertCircle, CheckCircle, Clock } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Upload, FileText } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

// Datos simulados
const estadoPagos = {
  saldoPendiente: 2850000,
  proximoVencimiento: "2024-02-15",
  pagosPendientes: 3,
  pagosRealizados: 12,
}

const financiamientos = [
  {
    id: "FIN001",
    entidad: "ICETEX",
    tipo: "Crédito Educativo",
    montoTotal: 8500000,
    montoDesembolsado: 3500000,
    estado: "Activo",
    numeroCredito: "ICX-2023-789456",
  },
]

const historialPagos = [
  {
    id: "PAG001",
    concepto: "Matrícula Semestre 2024-1",
    monto: 1500000,
    fecha: "2024-01-15",
    estado: "Pagado",
    metodoPago: "Tarjeta de Crédito",
    referencia: "TXN123456789",
  },
  {
    id: "PAG002",
    concepto: "Laboratorios de Programación",
    monto: 350000,
    fecha: "2024-01-20",
    estado: "Pagado",
    metodoPago: "Transferencia Bancaria",
    referencia: "TXN987654321",
  },
  {
    id: "PAG003",
    concepto: "Matrícula Semestre 2024-2",
    monto: 1500000,
    fecha: "2024-02-15",
    estado: "Pendiente",
    metodoPago: "-",
    referencia: "-",
  },
  {
    id: "PAG004",
    concepto: "Seguro Estudiantil",
    monto: 150000,
    fecha: "2024-02-20",
    estado: "Pendiente",
    metodoPago: "-",
    referencia: "-",
  },
]

export default function PagosPage() {
  const [selectedPayment, setSelectedPayment] = useState(null)
  const [showAddPaymentMethod, setShowAddPaymentMethod] = useState(false)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [showSuccessAlert, setShowSuccessAlert] = useState(false)
  const [dragActive, setDragActive] = useState(false)

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case "Pagado":
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
            <CheckCircle className="h-3 w-3 mr-1" />
            Pagado
          </Badge>
        )
      case "Pendiente":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
            <Clock className="h-3 w-3 mr-1" />
            Pendiente
          </Badge>
        )
      case "Vencido":
        return (
          <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
            <AlertCircle className="h-3 w-3 mr-1" />
            Vencido
          </Badge>
        )
      default:
        return <Badge variant="secondary">{estado}</Badge>
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0])
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0])
    }
  }

  const handleSubmitComprobante = () => {
    if (selectedFile) {
      setShowUploadModal(false)
      setShowSuccessAlert(true)
      setSelectedFile(null)
      // Ocultar alert después de 5 segundos
      setTimeout(() => setShowSuccessAlert(false), 5000)
    }
  }

  return (
    <SidebarInset>
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem className="hidden md:block">
              <BreadcrumbLink href="/">Panel Principal</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="hidden md:block" />
            <BreadcrumbItem>
              <BreadcrumbPage>Gestión de Pagos</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </header>

      <div className="flex flex-1 flex-col gap-4 p-4">
        {/* Header con estadísticas */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="bg-gradient-to-r from-red-500 to-red-600 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Saldo Pendiente</CardTitle>
              <DollarSign className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(estadoPagos.saldoPendiente)}</div>
              <p className="text-xs text-red-100">{estadoPagos.pagosPendientes} pagos pendientes</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Próximo Vencimiento</CardTitle>
              <Calendar className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Feb 15</div>
              <p className="text-xs text-orange-100">Matrícula Semestre 2024-2</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pagos Realizados</CardTitle>
              <CheckCircle className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{estadoPagos.pagosRealizados}</div>
              <p className="text-xs text-green-100">Este año académico</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Financiamientos</CardTitle>
              <CreditCard className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1</div>
              <p className="text-xs text-blue-100">Crédito Activo</p>
            </CardContent>
          </Card>
        </div>

        {showSuccessAlert && (
          <Alert className="mb-4 border-green-200 bg-green-50">
            <FileText className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              Comprobante enviado exitosamente. La legalización tomará un tiempo máximo de 2 días hábiles.
            </AlertDescription>
          </Alert>
        )}

        {/* Contenido principal con tabs */}
        <Tabs defaultValue="historial" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="historial">Historial de Pagos</TabsTrigger>
            <TabsTrigger value="pendientes">Pagos Pendientes</TabsTrigger>
            <TabsTrigger value="financiamientos">Financiamientos</TabsTrigger>
          </TabsList>

          <TabsContent value="historial" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Historial de Pagos</CardTitle>
                <CardDescription>Registro completo de todos tus pagos realizados</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {historialPagos.map((pago) => (
                    <div
                      key={pago.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-full">
                          <DollarSign className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-medium">{pago.concepto}</h4>
                          <p className="text-sm text-gray-500">
                            {pago.fecha} • {pago.metodoPago}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="font-semibold">{formatCurrency(pago.monto)}</p>
                          {getEstadoBadge(pago.estado)}
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          {pago.estado === "Pagado" && (
                            <Button variant="outline" size="sm">
                              <Download className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pendientes" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-orange-500" />
                  Pagos Pendientes
                </CardTitle>
                <CardDescription>Pagos que requieren tu atención inmediata</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {historialPagos
                    .filter((pago) => pago.estado === "Pendiente")
                    .map((pago) => (
                      <div
                        key={pago.id}
                        className="relative overflow-hidden rounded-xl border-2 border-orange-200 bg-gradient-to-r from-orange-50 to-yellow-50 p-6 shadow-sm hover:shadow-md transition-all duration-200"
                      >
                        {/* Decorative element */}
                        <div className="absolute top-0 right-0 w-20 h-20 bg-orange-100 rounded-full -mr-10 -mt-10 opacity-50"></div>

                        <div className="relative">
                          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                            {/* Left section - Payment info */}
                            <div className="flex items-start gap-4">
                              <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-500 rounded-xl shadow-sm">
                                <Clock className="h-6 w-6 text-white" />
                              </div>
                              <div className="flex-1">
                                <h4 className="font-semibold text-lg text-gray-900 mb-1">{pago.concepto}</h4>
                                <div className="flex items-center gap-3 text-sm text-gray-600 mb-2">
                                  <span className="flex items-center gap-1">
                                    <Calendar className="h-4 w-4" />
                                    Vence: {pago.fecha}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  {getEstadoBadge(pago.estado)}
                                  <span className="text-xs text-gray-500">ID: {pago.id}</span>
                                </div>
                              </div>
                            </div>

                            {/* Right section - Amount and actions */}
                            <div className="flex flex-col gap-4 min-w-fit">
                              {/* Amount display */}
                              <div className="text-center">
                                <p className="text-2xl font-bold text-gray-900 mb-1">{formatCurrency(pago.monto)}</p>
                                <p className="text-xs text-gray-500">Monto a pagar</p>
                              </div>

                              {/* Action buttons */}
                              <div className="flex flex-col gap-3 min-w-fit">
                                <Dialog open={showUploadModal} onOpenChange={setShowUploadModal}>
                                  <DialogTrigger asChild>
                                    <Button
                                      variant="outline"
                                      className="bg-white hover:bg-gray-50 border-gray-300 shadow-sm transition-all duration-200 hover:shadow-md"
                                    >
                                      <Upload className="h-4 w-4 mr-2" />
                                      Subir Comprobante
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent className="sm:max-w-md">
                                    <DialogHeader>
                                      <DialogTitle>Subir Comprobante de Pago</DialogTitle>
                                      <DialogDescription>
                                        Sube el comprobante de pago para {pago.concepto}
                                      </DialogDescription>
                                    </DialogHeader>
                                    <div className="space-y-4">
                                      <div
                                        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                                          dragActive
                                            ? "border-blue-400 bg-blue-50"
                                            : "border-gray-300 hover:border-gray-400"
                                        }`}
                                        onDragEnter={handleDrag}
                                        onDragLeave={handleDrag}
                                        onDragOver={handleDrag}
                                        onDrop={handleDrop}
                                      >
                                        <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                                        <div className="space-y-2">
                                          <p className="text-sm font-medium">
                                            Arrastra tu archivo aquí o haz click para seleccionar
                                          </p>
                                          <p className="text-xs text-gray-500">
                                            Formatos soportados: PDF, JPG, PNG (máx. 10MB)
                                          </p>
                                        </div>
                                        <Input
                                          type="file"
                                          accept=".pdf,.jpg,.jpeg,.png"
                                          onChange={handleFileChange}
                                          className="hidden"
                                          id="file-upload"
                                        />
                                        <Label
                                          htmlFor="file-upload"
                                          className="cursor-pointer inline-block mt-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                                        >
                                          Seleccionar Archivo
                                        </Label>
                                      </div>

                                      {selectedFile && (
                                        <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                                          <FileText className="h-4 w-4 text-gray-600" />
                                          <span className="text-sm font-medium">{selectedFile.name}</span>
                                          <span className="text-xs text-gray-500">
                                            ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                                          </span>
                                        </div>
                                      )}

                                      <div className="flex justify-end gap-2">
                                        <Button
                                          variant="outline"
                                          onClick={() => {
                                            setShowUploadModal(false)
                                            setSelectedFile(null)
                                          }}
                                        >
                                          Cancelar
                                        </Button>
                                        <Button
                                          onClick={handleSubmitComprobante}
                                          disabled={!selectedFile}
                                          className="bg-green-600 hover:bg-green-700"
                                        >
                                          Guardar y Enviar
                                        </Button>
                                      </div>
                                    </div>
                                  </DialogContent>
                                </Dialog>

                                <Button className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-sm hover:shadow-md transition-all duration-200 font-medium">
                                  <DollarSign className="h-4 w-4 mr-2" />
                                  Pagar Ahora
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="financiamientos" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Financiamientos Estudiantiles</CardTitle>
                    <CardDescription>Estado de tus financiamientos y historial de cartera</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* Conceptos Financiados */}
                <div className="mb-6">
                  <h4 className="font-semibold mb-3">Conceptos Financiados</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">Matrícula Académica</p>
                        <p className="text-sm text-gray-600">Semestres 1-8</p>
                      </div>
                      <p className="font-semibold">{formatCurrency(6000000)}</p>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">Sostenimiento</p>
                        <p className="text-sm text-gray-600">Gastos de manutención</p>
                      </div>
                      <p className="font-semibold">{formatCurrency(2000000)}</p>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">Materiales y Equipos</p>
                        <p className="text-sm text-gray-600">Implementos deportivos</p>
                      </div>
                      <p className="font-semibold">{formatCurrency(500000)}</p>
                    </div>
                  </div>
                </div>

                {/* Historial de Cartera */}
                <div>
                  <h4 className="font-semibold mb-3">Historial de Cartera</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-8 h-8 bg-green-100 rounded-full">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        </div>
                        <div>
                          <p className="font-medium">Desembolso Semestre 2024-1</p>
                          <p className="text-sm text-gray-600">15 de Enero, 2024</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-green-600">{formatCurrency(1750000)}</p>
                        <Badge className="bg-green-100 text-green-800">Aplicado</Badge>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-8 h-8 bg-green-100 rounded-full">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        </div>
                        <div>
                          <p className="font-medium">Desembolso Semestre 2023-2</p>
                          <p className="text-sm text-gray-600">15 de Agosto, 2023</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-green-600">{formatCurrency(1750000)}</p>
                        <Badge className="bg-green-100 text-green-800">Aplicado</Badge>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-3 border rounded-lg bg-yellow-50">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-8 h-8 bg-yellow-100 rounded-full">
                          <Clock className="h-4 w-4 text-yellow-600" />
                        </div>
                        <div>
                          <p className="font-medium">Próximo Desembolso</p>
                          <p className="text-sm text-gray-600">Estimado: 15 de Febrero, 2024</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-yellow-600">{formatCurrency(1750000)}</p>
                        <Badge className="bg-yellow-100 text-yellow-800">Pendiente</Badge>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Información Adicional */}
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <h5 className="font-medium mb-2">Información del Financiamiento</h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Entidad Financiera:</p>
                      <p className="font-medium">CENDA</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Número de Crédito:</p>
                      <p className="font-medium">ICX-2023-789456</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Tasa de Interés:</p>
                      <p className="font-medium">0% (Subsidio Total)</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Período de Gracia:</p>
                      <p className="font-medium">2 años post-grado</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </SidebarInset>
  )
}
