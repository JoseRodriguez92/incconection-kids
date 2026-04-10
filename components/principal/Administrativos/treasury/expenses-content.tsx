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
  TrendingDown,
  Users,
  FileText,
  X,
  CheckCircle,
  Clock,
  AlertCircle,
  Building,
  Zap,
  Car,
  BookOpen,
  Utensils,
  Wrench,
} from "lucide-react"

interface Expense {
  id: string
  concept: string
  category: string
  amount: number
  supplier: string
  paymentMethod: string
  status: string
  date: Date
  dueDate?: Date
  description?: string
  invoice: string
  approvedBy?: string
}

const mockExpenses: Expense[] = [
  {
    id: "EGR-001",
    concept: "Salario Docentes Enero",
    category: "salarios",
    amount: 15000000,
    supplier: "Nómina Docentes",
    paymentMethod: "transferencia",
    status: "pagado",
    date: new Date("2024-01-31"),
    description: "Pago de salarios docentes mes de enero",
    invoice: "FAC-001",
    approvedBy: "Director Administrativo",
  },
  {
    id: "EGR-002",
    concept: "Factura Energía Eléctrica",
    category: "servicios",
    amount: 850000,
    supplier: "Empresa de Energía",
    paymentMethod: "transferencia",
    status: "pendiente",
    date: new Date("2024-01-15"),
    dueDate: new Date("2024-02-15"),
    description: "Consumo energía eléctrica enero 2024",
    invoice: "FAC-002",
  },
  {
    id: "EGR-003",
    concept: "Materiales de Laboratorio",
    category: "materiales",
    amount: 450000,
    supplier: "Distribuidora Científica",
    paymentMethod: "cheque",
    status: "aprobado",
    date: new Date("2024-01-20"),
    description: "Reactivos y material de laboratorio química",
    invoice: "FAC-003",
    approvedBy: "Coordinador Académico",
  },
  {
    id: "EGR-004",
    concept: "Mantenimiento Equipos",
    category: "mantenimiento",
    amount: 320000,
    supplier: "Técnicos Especializados",
    paymentMethod: "efectivo",
    status: "vencido",
    date: new Date("2024-01-10"),
    dueDate: new Date("2024-01-25"),
    description: "Mantenimiento preventivo equipos audiovisuales",
    invoice: "FAC-004",
  },
]

const categories = [
  { value: "salarios", label: "Salarios", color: "bg-blue-500", icon: Users },
  { value: "servicios", label: "Servicios Públicos", color: "bg-yellow-500", icon: Zap },
  { value: "materiales", label: "Materiales", color: "bg-green-500", icon: BookOpen },
  { value: "mantenimiento", label: "Mantenimiento", color: "bg-orange-500", icon: Wrench },
  { value: "transporte", label: "Transporte", color: "bg-purple-500", icon: Car },
  { value: "alimentacion", label: "Alimentación", color: "bg-red-500", icon: Utensils },
  { value: "infraestructura", label: "Infraestructura", color: "bg-gray-500", icon: Building },
  { value: "otros", label: "Otros", color: "bg-slate-500", icon: FileText },
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
  aprobado: { label: "Aprobado", color: "bg-blue-100 text-blue-800", icon: CheckCircle },
  vencido: { label: "Vencido", color: "bg-red-100 text-red-800", icon: AlertCircle },
}

export function ExpensesContent() {
  const [expenses, setExpenses] = useState<Expense[]>(mockExpenses)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [dateFilter, setDateFilter] = useState<Date>()

  // Formulario para nuevo egreso
  const [formData, setFormData] = useState({
    concept: "",
    category: "",
    amount: "",
    supplier: "",
    paymentMethod: "",
    status: "pendiente",
    date: new Date(),
    dueDate: undefined as Date | undefined,
    description: "",
    approvedBy: "",
  })

  const filteredExpenses = expenses.filter((expense) => {
    const matchesSearch =
      expense.concept.toLowerCase().includes(searchTerm.toLowerCase()) ||
      expense.supplier.toLowerCase().includes(searchTerm.toLowerCase()) ||
      expense.invoice.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesCategory = categoryFilter === "all" || expense.category === categoryFilter
    const matchesStatus = statusFilter === "all" || expense.status === statusFilter
    const matchesDate = !dateFilter || format(expense.date, "yyyy-MM-dd") === format(dateFilter, "yyyy-MM-dd")

    return matchesSearch && matchesCategory && matchesStatus && matchesDate
  })

  const totalAmount = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0)
  const paidAmount = filteredExpenses
    .filter((e) => e.status === "pagado")
    .reduce((sum, expense) => sum + expense.amount, 0)
  const pendingAmount = filteredExpenses
    .filter((e) => e.status === "pendiente")
    .reduce((sum, expense) => sum + expense.amount, 0)
  const approvedAmount = filteredExpenses
    .filter((e) => e.status === "aprobado")
    .reduce((sum, expense) => sum + expense.amount, 0)

  const handleCreateExpense = () => {
    const newExpense: Expense = {
      id: `EGR-${String(expenses.length + 1).padStart(3, "0")}`,
      concept: formData.concept,
      category: formData.category,
      amount: Number.parseFloat(formData.amount),
      supplier: formData.supplier,
      paymentMethod: formData.paymentMethod,
      status: formData.status,
      date: formData.date,
      dueDate: formData.dueDate,
      description: formData.description,
      invoice: `FAC-${String(expenses.length + 1).padStart(3, "0")}`,
      approvedBy: formData.approvedBy,
    }

    setExpenses([...expenses, newExpense])
    setIsCreateModalOpen(false)
    setFormData({
      concept: "",
      category: "",
      amount: "",
      supplier: "",
      paymentMethod: "",
      status: "pendiente",
      date: new Date(),
      dueDate: undefined,
      description: "",
      approvedBy: "",
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
          <h1 className="text-3xl font-bold">Gestión de Egresos</h1>
          <p className="text-muted-foreground">Administra todos los gastos de la institución</p>
        </div>
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button className="w-full sm:w-auto">
              <Plus className="mr-2 h-4 w-4" />
              Registrar Egreso
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Registrar Nuevo Egreso</DialogTitle>
              <DialogDescription>Completa la información del gasto a registrar</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="concept">Concepto *</Label>
                  <Input
                    id="concept"
                    value={formData.concept}
                    onChange={(e) => setFormData({ ...formData, concept: e.target.value })}
                    placeholder="Ej: Factura Energía Eléctrica"
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
                          <div className="flex items-center gap-2">
                            <category.icon className="h-4 w-4" />
                            {category.label}
                          </div>
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
                  <Label htmlFor="supplier">Proveedor *</Label>
                  <Input
                    id="supplier"
                    value={formData.supplier}
                    onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                    placeholder="Nombre del proveedor"
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
                      <SelectItem value="aprobado">Aprobado</SelectItem>
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
                <Label htmlFor="approvedBy">Aprobado por</Label>
                <Input
                  id="approvedBy"
                  value={formData.approvedBy}
                  onChange={(e) => setFormData({ ...formData, approvedBy: e.target.value })}
                  placeholder="Nombre de quien aprueba el gasto"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Información adicional sobre el egreso"
                  rows={3}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleCreateExpense}>Registrar Egreso</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Estadísticas */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Egresos</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{formatCurrency(totalAmount)}</div>
            <p className="text-xs text-muted-foreground">{filteredExpenses.length} registros</p>
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
              {filteredExpenses.filter((e) => e.status === "pagado").length} pagos
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
              {filteredExpenses.filter((e) => e.status === "pendiente").length} pendientes
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aprobados</CardTitle>
            <CheckCircle className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{formatCurrency(approvedAmount)}</div>
            <p className="text-xs text-muted-foreground">
              {filteredExpenses.filter((e) => e.status === "aprobado").length} aprobados
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
                  placeholder="Concepto, proveedor, factura..."
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
                      <div className="flex items-center gap-2">
                        <category.icon className="h-4 w-4" />
                        {category.label}
                      </div>
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
                  <SelectItem value="aprobado">Aprobado</SelectItem>
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

      {/* Tabla de Egresos */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Egresos</CardTitle>
          <CardDescription>
            Mostrando {filteredExpenses.length} de {expenses.length} egresos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Concepto</TableHead>
                  <TableHead>Proveedor</TableHead>
                  <TableHead>Categoría</TableHead>
                  <TableHead>Monto</TableHead>
                  <TableHead>Método</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredExpenses.map((expense) => {
                  const category = categories.find((c) => c.value === expense.category)
                  const status = statusConfig[expense.status as keyof typeof statusConfig]
                  const StatusIcon = status.icon
                  const CategoryIcon = category?.icon || FileText

                  return (
                    <TableRow key={expense.id}>
                      <TableCell className="font-medium">{expense.id}</TableCell>
                      <TableCell>{expense.concept}</TableCell>
                      <TableCell>{expense.supplier}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className={`${category?.color} text-white`}>
                          <CategoryIcon className="mr-1 h-3 w-3" />
                          {category?.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium text-red-600">{formatCurrency(expense.amount)}</TableCell>
                      <TableCell className="capitalize">{expense.paymentMethod}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className={status.color}>
                          <StatusIcon className="mr-1 h-3 w-3" />
                          {status.label}
                        </Badge>
                      </TableCell>
                      <TableCell>{format(expense.date, "dd/MM/yyyy")}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setSelectedExpense(expense)
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
            <DialogTitle>Detalle del Egreso</DialogTitle>
            <DialogDescription>Información completa del egreso {selectedExpense?.id}</DialogDescription>
          </DialogHeader>
          {selectedExpense && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">ID</Label>
                  <p className="text-sm">{selectedExpense.id}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Factura</Label>
                  <p className="text-sm">{selectedExpense.invoice}</p>
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Concepto</Label>
                <p className="text-sm">{selectedExpense.concept}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Proveedor</Label>
                  <p className="text-sm">{selectedExpense.supplier}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Monto</Label>
                  <p className="text-sm font-bold text-red-600">{formatCurrency(selectedExpense.amount)}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Categoría</Label>
                  <p className="text-sm">{categories.find((c) => c.value === selectedExpense.category)?.label}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Método de Pago</Label>
                  <p className="text-sm capitalize">{selectedExpense.paymentMethod}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Fecha de Registro</Label>
                  <p className="text-sm">{format(selectedExpense.date, "PPP", { locale: es })}</p>
                </div>
                {selectedExpense.dueDate && (
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Fecha de Vencimiento</Label>
                    <p className="text-sm">{format(selectedExpense.dueDate, "PPP", { locale: es })}</p>
                  </div>
                )}
              </div>
              {selectedExpense.approvedBy && (
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Aprobado por</Label>
                  <p className="text-sm">{selectedExpense.approvedBy}</p>
                </div>
              )}
              {selectedExpense.description && (
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Descripción</Label>
                  <p className="text-sm">{selectedExpense.description}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
