"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DollarSign, TrendingUp, TrendingDown, BarChart3, Download, Filter, CreditCard, Target } from "lucide-react"

// Datos simulados para reportes financieros
const financialData = {
  overview: {
    totalIncome: 125000000,
    totalExpenses: 98500000,
    netProfit: 26500000,
    profitMargin: 21.2,
  },
  monthlyData: [
    { month: "Enero", income: 12500000, expenses: 9800000, profit: 2700000 },
    { month: "Febrero", income: 11800000, expenses: 9200000, profit: 2600000 },
    { month: "Marzo", income: 13200000, expenses: 10100000, profit: 3100000 },
    { month: "Abril", income: 12900000, expenses: 9900000, profit: 3000000 },
    { month: "Mayo", income: 13500000, expenses: 10200000, profit: 3300000 },
    { month: "Junio", income: 14100000, expenses: 10500000, profit: 3600000 },
  ],
  incomeByCategory: [
    { category: "Matrículas", amount: 45000000, percentage: 36, color: "bg-blue-500" },
    { category: "Pensiones", amount: 52000000, percentage: 41.6, color: "bg-green-500" },
    { category: "Certificados", amount: 8500000, percentage: 6.8, color: "bg-yellow-500" },
    { category: "Uniformes", amount: 12000000, percentage: 9.6, color: "bg-purple-500" },
    { category: "Transporte", amount: 5200000, percentage: 4.2, color: "bg-orange-500" },
    { category: "Otros", amount: 2300000, percentage: 1.8, color: "bg-gray-500" },
  ],
  expensesByCategory: [
    { category: "Salarios", amount: 48000000, percentage: 48.7, color: "bg-red-500" },
    { category: "Servicios Públicos", amount: 12500000, percentage: 12.7, color: "bg-blue-500" },
    { category: "Materiales", amount: 15200000, percentage: 15.4, color: "bg-green-500" },
    { category: "Mantenimiento", amount: 8900000, percentage: 9.0, color: "bg-yellow-500" },
    { category: "Transporte", amount: 6800000, percentage: 6.9, color: "bg-purple-500" },
    { category: "Otros", amount: 7100000, percentage: 7.2, color: "bg-gray-500" },
  ],
  paymentMethods: [
    { method: "Transferencia", amount: 67500000, percentage: 54, transactions: 1250 },
    { method: "Efectivo", amount: 32500000, percentage: 26, transactions: 890 },
    { method: "Tarjeta", amount: 20000000, percentage: 16, transactions: 456 },
    { method: "Cheque", amount: 5000000, percentage: 4, transactions: 78 },
  ],
}

export function FinancialReportsContent() {
  const [selectedPeriod, setSelectedPeriod] = useState("2024")
  const [selectedType, setSelectedType] = useState("all")

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
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reportes Financieros</h1>
          <p className="text-muted-foreground">Análisis detallado de ingresos, egresos y rentabilidad institucional</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Exportar PDF
          </Button>
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Exportar Excel
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros de Reporte
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="space-y-2">
              <Label htmlFor="period">Período</Label>
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar período" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2024">2024 - Año Completo</SelectItem>
                  <SelectItem value="2024-1">2024 - Primer Semestre</SelectItem>
                  <SelectItem value="2024-2">2024 - Segundo Semestre</SelectItem>
                  <SelectItem value="2023">2023 - Año Completo</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Tipo de Reporte</Label>
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos los tipos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="income">Solo Ingresos</SelectItem>
                  <SelectItem value="expenses">Solo Egresos</SelectItem>
                  <SelectItem value="profit">Rentabilidad</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="format">Formato</Label>
              <Select defaultValue="summary">
                <SelectTrigger>
                  <SelectValue placeholder="Formato de reporte" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="summary">Resumen</SelectItem>
                  <SelectItem value="detailed">Detallado</SelectItem>
                  <SelectItem value="comparative">Comparativo</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button className="w-full">
                <BarChart3 className="mr-2 h-4 w-4" />
                Generar Reporte
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Estadísticas Generales */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ingresos Totales</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(financialData.overview.totalIncome)}
            </div>
            <p className="text-xs text-muted-foreground">+12.5% respecto al período anterior</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Egresos Totales</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(financialData.overview.totalExpenses)}
            </div>
            <p className="text-xs text-muted-foreground">+8.3% respecto al período anterior</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Utilidad Neta</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{formatCurrency(financialData.overview.netProfit)}</div>
            <p className="text-xs text-muted-foreground">+18.7% respecto al período anterior</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Margen de Utilidad</CardTitle>
            <Target className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{financialData.overview.profitMargin}%</div>
            <p className="text-xs text-muted-foreground">+2.1% respecto al período anterior</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs de Reportes */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Resumen General</TabsTrigger>
          <TabsTrigger value="income">Análisis de Ingresos</TabsTrigger>
          <TabsTrigger value="expenses">Análisis de Egresos</TabsTrigger>
          <TabsTrigger value="payments">Métodos de Pago</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Evolución Mensual</CardTitle>
              <CardDescription>Comparativo de ingresos, egresos y utilidad por mes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {financialData.monthlyData.map((month, index) => (
                  <div key={index} className="grid grid-cols-4 gap-4 p-4 border rounded-lg">
                    <div>
                      <h3 className="font-medium">{month.month}</h3>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-muted-foreground">Ingresos</div>
                      <div className="font-medium text-green-600">{formatCurrency(month.income)}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-muted-foreground">Egresos</div>
                      <div className="font-medium text-red-600">{formatCurrency(month.expenses)}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-muted-foreground">Utilidad</div>
                      <div className="font-medium text-blue-600">{formatCurrency(month.profit)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="income" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Ingresos por Categoría</CardTitle>
              <CardDescription>Distribución de ingresos por tipo de concepto</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {financialData.incomeByCategory.map((category, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className={`w-4 h-4 rounded ${category.color}`}></div>
                      <div>
                        <h3 className="font-medium">{category.category}</h3>
                        <p className="text-sm text-muted-foreground">{category.percentage}% del total</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-green-600">{formatCurrency(category.amount)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="expenses" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Egresos por Categoría</CardTitle>
              <CardDescription>Distribución de gastos por tipo de concepto</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {financialData.expensesByCategory.map((category, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className={`w-4 h-4 rounded ${category.color}`}></div>
                      <div>
                        <h3 className="font-medium">{category.category}</h3>
                        <p className="text-sm text-muted-foreground">{category.percentage}% del total</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-red-600">{formatCurrency(category.amount)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Métodos de Pago</CardTitle>
              <CardDescription>Análisis de preferencias de pago de los usuarios</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {financialData.paymentMethods.map((method, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <CreditCard className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <h3 className="font-medium">{method.method}</h3>
                        <p className="text-sm text-muted-foreground">{method.transactions} transacciones</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="font-medium">{formatCurrency(method.amount)}</div>
                        <div className="text-sm text-muted-foreground">{method.percentage}% del total</div>
                      </div>
                      <Badge variant="outline">{method.percentage}%</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
