"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { FileText, Download, Calendar, Users, TrendingUp, BarChart3, PieChart, Search, Filter } from "lucide-react"

interface Report {
  id: string
  title: string
  description: string
  category: string
  lastGenerated: string
  format: string
  status: "available" | "generating" | "error"
}

const availableReports: Report[] = [
  {
    id: "students-report",
    title: "Reporte de Estudiantes",
    description: "Listado completo de estudiantes con información académica y personal",
    category: "Académico",
    lastGenerated: "2024-01-15",
    format: "PDF/Excel",
    status: "available",
  },
  {
    id: "attendance-report",
    title: "Reporte de Asistencia",
    description: "Estadísticas de asistencia por curso, materia y período",
    category: "Académico",
    lastGenerated: "2024-01-14",
    format: "PDF/Excel",
    status: "available",
  },
  {
    id: "grades-report",
    title: "Reporte de Calificaciones",
    description: "Notas y evaluaciones por estudiante, materia y período académico",
    category: "Académico",
    lastGenerated: "2024-01-13",
    format: "PDF/Excel",
    status: "available",
  },
  {
    id: "financial-report",
    title: "Reporte Financiero",
    description: "Ingresos, egresos y estado financiero de la institución",
    category: "Financiero",
    lastGenerated: "2024-01-12",
    format: "PDF/Excel",
    status: "available",
  },
  {
    id: "teachers-report",
    title: "Reporte de Docentes",
    description: "Información de profesores, materias asignadas y horarios",
    category: "Administrativo",
    lastGenerated: "2024-01-11",
    format: "PDF/Excel",
    status: "available",
  },
  {
    id: "psychology-report",
    title: "Reporte Psicológico",
    description: "Estadísticas de atención psicológica y casos registrados",
    category: "Bienestar",
    lastGenerated: "2024-01-10",
    format: "PDF",
    status: "available",
  },
  {
    id: "transport-report",
    title: "Reporte de Transporte",
    description: "Rutas, estudiantes transportados y estadísticas de movilidad",
    category: "Logístico",
    lastGenerated: "2024-01-09",
    format: "PDF/Excel",
    status: "available",
  },
  {
    id: "events-report",
    title: "Reporte de Eventos",
    description: "Eventos realizados, participación y estadísticas de actividades",
    category: "Administrativo",
    lastGenerated: "2024-01-08",
    format: "PDF",
    status: "available",
  },
]

const categories = ["Todos", "Académico", "Financiero", "Administrativo", "Bienestar", "Logístico"]

export function ReportsManagement() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("Todos")
  const [isGenerateDialogOpen, setIsGenerateDialogOpen] = useState(false)
  const [selectedReport, setSelectedReport] = useState<Report | null>(null)
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")

  const filteredReports = availableReports.filter((report) => {
    const matchesSearch =
      report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "Todos" || report.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const handleGenerateReport = (reportId: string) => {
    const report = availableReports.find((r) => r.id === reportId)
    if (report) {
      setSelectedReport(report)
      setIsGenerateDialogOpen(true)
      const today = new Date()
      const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate())
      setEndDate(today.toISOString().split("T")[0])
      setStartDate(lastMonth.toISOString().split("T")[0])
    }
  }

  const handleDownloadReportWithDates = () => {
    if (selectedReport && startDate && endDate) {
      console.log(`Descargando reporte: ${selectedReport.id} desde ${startDate} hasta ${endDate}`)
      setIsGenerateDialogOpen(false)
      setSelectedReport(null)
      setStartDate("")
      setEndDate("")
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "Académico":
        return <Users className="w-4 h-4" />
      case "Financiero":
        return <TrendingUp className="w-4 h-4" />
      case "Administrativo":
        return <BarChart3 className="w-4 h-4" />
      case "Bienestar":
        return <PieChart className="w-4 h-4" />
      case "Logístico":
        return <Calendar className="w-4 h-4" />
      default:
        return <FileText className="w-4 h-4" />
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Académico":
        return "bg-blue-100 text-blue-800"
      case "Financiero":
        return "bg-green-100 text-green-800"
      case "Administrativo":
        return "bg-purple-100 text-purple-800"
      case "Bienestar":
        return "bg-orange-100 text-orange-800"
      case "Logístico":
        return "bg-cyan-100 text-cyan-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Reportes</h1>
        <p className="text-muted-foreground">Genera y consulta reportes del sistema</p>
      </div>

      {/* Filtros y búsqueda */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Buscar reportes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category)}
              className="flex items-center space-x-1"
            >
              <Filter className="w-3 h-3" />
              <span>{category}</span>
            </Button>
          ))}
        </div>
      </div>

      {/* Lista de reportes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredReports.map((report) => (
          <Card key={report.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {getCategoryIcon(report.category)}
                  <span className="text-lg">{report.title}</span>
                </div>
                <Badge className={getCategoryColor(report.category)}>{report.category}</Badge>
              </CardTitle>
              <CardDescription>{report.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-sm text-muted-foreground">
                  <div className="flex justify-between">
                    <span>Última generación:</span>
                    <span>{report.lastGenerated}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Formato:</span>
                    <span>{report.format}</span>
                  </div>
                </div>

                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => handleGenerateReport(report.id)}
                  className="w-full"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Generar Nuevo
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredReports.length === 0 && (
        <div className="text-center py-12">
          <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">No se encontraron reportes</h3>
          <p className="text-muted-foreground">Intenta cambiar los filtros o el término de búsqueda</p>
        </div>
      )}

      {/* Dialog para generar reporte con fechas */}
      <Dialog open={isGenerateDialogOpen} onOpenChange={setIsGenerateDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <FileText className="w-5 h-5" />
              <span>Generar Reporte</span>
            </DialogTitle>
            <DialogDescription>
              {selectedReport && `Configura las fechas para generar el reporte: ${selectedReport.title}`}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start-date">Fecha de inicio</Label>
                <Input id="start-date" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end-date">Fecha de fin</Label>
                <Input id="end-date" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
              </div>
            </div>

            {selectedReport && (
              <div className="p-3 bg-muted rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  {getCategoryIcon(selectedReport.category)}
                  <span className="font-medium">{selectedReport.title}</span>
                  <Badge className={getCategoryColor(selectedReport.category)}>{selectedReport.category}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">{selectedReport.description}</p>
                <p className="text-sm text-muted-foreground mt-1">Formato: {selectedReport.format}</p>
              </div>
            )}

            <div className="flex space-x-2">
              <Button variant="outline" onClick={() => setIsGenerateDialogOpen(false)} className="flex-1">
                Cancelar
              </Button>
              <Button onClick={handleDownloadReportWithDates} disabled={!startDate || !endDate} className="flex-1">
                <Download className="w-4 h-4 mr-2" />
                Descargar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
