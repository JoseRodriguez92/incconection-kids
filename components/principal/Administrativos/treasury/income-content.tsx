"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import {
  Plus,
  Search,
  Download,
  Eye,
  Edit,
  Trash2,
  CalendarIcon,
  DollarSign,
  X,
  CheckCircle,
  Clock,
  AlertCircle,
} from "lucide-react"

interface Income {
  id: string
  concept: string
  category: string
  amount: number
  student: string
  paymentMethod: string
  status: string
  date: Date
  dueDate?: Date
  description?: string
  receipt: string
}

const mockIncomes: Income[] = [
  {
    id: "ING-001",
    concept: "Matrícula 2024",
    category: "matricula",
    amount: 850000,
    student: "Juan Pérez Gómez",
    paymentMethod: "transferencia",
    status: "pagado",
    date: new Date("2024-01-15"),
    description: "Matrícula grado 11°",
    receipt: "REC-001",
  },
  {
    id: "ING-002",
    concept: "Pensión Enero",
    category: "pension",
    amount: 450000,
    student: "María García López",
    paymentMethod: "efectivo",
    status: "pagado",
    date: new Date("2024-01-05"),
    description: "Pensión mensual grado 9°",
    receipt: "REC-002",
  },
  {
    id: "ING-003",
    concept: "Certificado Bachiller",
    category: "certificado",
    amount: 25000,
    student: "Carlos Rodríguez",
    paymentMethod: "tarjeta",
    status: "pendiente",
    date: new Date("2024-01-20"),
    dueDate: new Date("2024-02-20"),
    description: "Certificado de bachiller académico",
    receipt: "REC-003",
  },
  {
    id: "ING-004",
    concept: "Uniforme Escolar",
    category: "uniforme",
    amount: 180000,
    student: "Ana Martínez Silva",
    paymentMethod: "transferencia",
    status: "vencido",
    date: new Date("2024-01-10"),
    dueDate: new Date("2024-01-25"),
    description: "Uniforme completo grado 8°",
    receipt: "REC-004",
  },
]

const categories = [
  { value: "matricula", label: "Matrícula", color: "bg-blue-500" },
  { value: "pension", label: "Pensión", color: "bg-green-500" },
  { value: "certificado", label: "Certificados", color: "bg-purple-500" },
  { value: "uniforme", label: "Uniformes", color: "bg-orange-500" },
  { value: "transporte", label: "Transporte", color: "bg-yellow-500" },
  { value: "alimentacion", label: "Alimentación", color: "bg-red-500" },
  { value: "otros", label: "Otros", color: "bg-gray-500" },
]

const paymentMethods = [
  { value: "efectivo", label: "Efectivo" },
  { value: "transferencia", label: "Transferencia" },
  { value: "tarjeta", label: "Tarjeta" },
  { value: "cheque", label: "Cheque" },
]

const statusConfig = {
  pagado: { label: "Pagado", color: "bg-green-100 text-green-800", icon: CheckCircle },
  pendiente: { label: "Pendiente", color: "bg-yellow-100 text-yellow-800", icon: Clock },
  vencido: { label: "Vencido", color: "bg-red-100 text-red-800", icon: AlertCircle },
}

export function IncomeContent() {
  const [incomes, setIncomes] = useState<Income[]>(mockIncomes)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [selectedIncome, setSelectedIncome] = useState<Income | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [dateFilter, setDateFilter] = useState<Date>()

  // Formulario para nuevo ingreso
  const [formData, setFormData] = useState({
    concept: "",
    category: "",
    amount: "",
    student: "",
    paymentMethod: "",
    status: "pendiente",
    date: new Date(),
    dueDate: undefined as Date | undefined,
    description: "",
  })

  const filteredIncomes = incomes.filter((income) => {
    const matchesSearch =
      income.concept.toLowerCase().includes(searchTerm.toLowerCase()) ||
      income.student.toLowerCase().includes(searchTerm.toLowerCase()) ||
      income.receipt.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesCategory = categoryFilter === "all" || income.category === categoryFilter
    const matchesStatus = statusFilter === "all" || income.status === statusFilter
    const matchesDate = !dateFilter || format(income.date, "yyyy-MM-dd") === format(dateFilter, "yyyy-MM-dd")

    return matchesSearch && matchesCategory && matchesStatus && matchesDate
  })

  const totalAmount = filteredIncomes.reduce((sum, income) => sum + income.amount, 0)
  const paidAmount = filteredIncomes
    .filter((i) => i.status === "pagado")
    .reduce((sum, income) => sum + income.amount, 0)
  const pendingAmount = filteredIncomes
    .filter((i) => i.status === "pendiente")
    .reduce((sum, income) => sum + income.amount, 0)
  const overdueAmount = filteredIncomes
    .filter((i) => i.status === "vencido")
    .reduce((sum, income) => sum + income.amount, 0)

  const handleCreateIncome = () => {
    const newIncome: Income = {
      id: `ING-${String(incomes.length + 1).padStart(3, "0")}`,
      concept: formData.concept,
      category: formData.category,
      amount: Number.parseFloat(formData.amount),
      student: formData.student,
      paymentMethod: formData.paymentMethod,
      status: formData.status,
      date: formData.date,
      dueDate: formData.dueDate,
      description: formData.description,
      receipt: `REC-${String(incomes.length + 1).padStart(3, "0")}`,
    }

    setIncomes([...incomes, newIncome])
    setIsCreateModalOpen(false)
    setFormData({
      concept: "",
      category: "",
      amount: "",
      student: "",
      paymentMethod: "",
      status: "pendiente",
      date: new Date(),
      dueDate: undefined,
      description: "",
    })
  }

  const clearFilters = () => {
    setSearchTerm("")
    setCategoryFilter("all")
    setStatusFilter("all")
    setDateFilter(undefined)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Gestión de Ingresos</h1>
          <p className="text-muted-foreground">Administra todos los ingresos de la institución</p>
        </div>
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button className="w-full sm:w-auto">
              <Plus className="mr-2 h-4 w-4" />
              Registrar Ingreso
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Registrar Nuevo Ingreso</DialogTitle>
              <DialogDescription>Completa la información del ingreso a registrar</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="concept">Concepto *</Label>
                  <Input
                    id="concept"
                    value={formData.concept}
                    onChange={(e) => setFormData({ ...formData, concept: e.target.value })}
                    placeholder="Ej: Matrícula 2024"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Categoría *</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.value} value={category.value}>
                          {category.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">Monto *</Label>
                  <Input
                    id="amount"
                    type="number"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    placeholder="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="student">Estudiante *</Label>
                  <Input
                    id="student"
                    value={formData.student}
                    onChange={(e) => setFormData({ ...formData, student: e.target.value })}
                    placeholder="Nombre del estudiante"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="paymentMethod">Método de Pago *</Label>
                  <Select
                    value={formData.paymentMethod}
                    onValueChange={(value) => setFormData({ ...formData, paymentMethod: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar método" />
                    </SelectTrigger>
                    <SelectContent>
                      {paymentMethods.map((method) => (
                        <SelectItem key={method.value} value={method.value}>
                          {method.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Estado *</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => setFormData({ ...formData, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pendiente">Pendiente</SelectItem>
                      <SelectItem value="pagado">Pagado</SelectItem>
                      <SelectItem value="vencido">Vencido</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Fecha de Registro *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.date ? format(formData.date, "PPP", { locale: es }) : "Seleccionar fecha"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={formData.date}
                        onSelect={(date) => setFormData({ ...formData, date: date || new Date() })}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-2">
                  <Label>Fecha de Vencimiento</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.dueDate ? format(formData.dueDate, "PPP", { locale: es }) : "Opcional"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={formData.dueDate}
                        onSelect={(date) => setFormData({ ...formData, dueDate: date })}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Información adicional sobre el ingreso"
                  rows={3}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleCreateIncome}>Registrar Ingreso</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Estadísticas */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Ingresos</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalAmount)}</div>
            <p className="text-xs text-muted-foreground">{filteredIncomes.length} registros</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pagados</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(paidAmount)}</div>
            <p className="text-xs text-muted-foreground">
              {filteredIncomes.filter((i) => i.status === "pagado").length} pagos
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendientes</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{formatCurrency(pendingAmount)}</div>
            <p className="text-xs text-muted-foreground">
              {filteredIncomes.filter((i) => i.status === "pendiente").length} pendientes
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vencidos</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{formatCurrency(overdueAmount)}</div>
            <p className="text-xs text-muted-foreground">
              {filteredIncomes.filter((i) => i.status === "vencido").length} vencidos
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filtros de Búsqueda</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            <div className="space-y-2">
              <Label htmlFor="search">Buscar</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Concepto, estudiante, recibo..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="category-filter">Categoría</Label>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las categorías</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="status-filter">Estado</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados</SelectItem>
                  <SelectItem value="pagado">Pagado</SelectItem>
                  <SelectItem value="pendiente">Pendiente</SelectItem>
                  <SelectItem value="vencido">Vencido</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Fecha</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateFilter ? format(dateFilter, "PPP", { locale: es }) : "Todas las fechas"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar mode="single" selected={dateFilter} onSelect={setDateFilter} initialFocus />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label>&nbsp;</Label>
              <div className="flex gap-2">
                <Button variant="outline" onClick={clearFilters} className="flex-1">
                  <X className="mr-2 h-4 w-4" />
                  Limpiar
                </Button>
                <Button variant="outline" size="icon">
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabla de Ingresos */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Ingresos</CardTitle>
          <CardDescription>
            Mostrando {filteredIncomes.length} de {incomes.length} ingresos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Concepto</TableHead>
                  <TableHead>Estudiante</TableHead>
                  <TableHead>Categoría</TableHead>
                  <TableHead>Monto</TableHead>
                  <TableHead>Método</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredIncomes.map((income) => {
                  const category = categories.find((c) => c.value === income.category)
                  const status = statusConfig[income.status as keyof typeof statusConfig]
                  const StatusIcon = status.icon

                  return (
                    <TableRow key={income.id}>
                      <TableCell className="font-medium">{income.id}</TableCell>
                      <TableCell>{income.concept}</TableCell>
                      <TableCell>{income.student}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className={`${category?.color} text-white`}>
                          {category?.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">{formatCurrency(income.amount)}</TableCell>
                      <TableCell className="capitalize">{income.paymentMethod}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className={status.color}>
                          <StatusIcon className="mr-1 h-3 w-3" />
                          {status.label}
                        </Badge>
                      </TableCell>
                      <TableCell>{format(income.date, "dd/MM/yyyy")}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setSelectedIncome(income)
                              setIsViewModalOpen(true)
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Modal de Vista Detallada */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalle del Ingreso</DialogTitle>
            <DialogDescription>Información completa del ingreso {selectedIncome?.id}</DialogDescription>
          </DialogHeader>
          {selectedIncome && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">ID</Label>
                  <p className="text-sm">{selectedIncome.id}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Recibo</Label>
                  <p className="text-sm">{selectedIncome.receipt}</p>
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Concepto</Label>
                <p className="text-sm">{selectedIncome.concept}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Estudiante</Label>
                  <p className="text-sm">{selectedIncome.student}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Monto</Label>
                  <p className="text-sm font-bold">{formatCurrency(selectedIncome.amount)}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Categoría</Label>
                  <p className="text-sm">{categories.find((c) => c.value === selectedIncome.category)?.label}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Método de Pago</Label>
                  <p className="text-sm capitalize">{selectedIncome.paymentMethod}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Fecha de Registro</Label>
                  <p className="text-sm">{format(selectedIncome.date, "PPP", { locale: es })}</p>
                </div>
                {selectedIncome.dueDate && (
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Fecha de Vencimiento</Label>
                    <p className="text-sm">{format(selectedIncome.dueDate, "PPP", { locale: es })}</p>
                  </div>
                )}
              </div>
              {selectedIncome.description && (
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Descripción</Label>
                  <p className="text-sm">{selectedIncome.description}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
