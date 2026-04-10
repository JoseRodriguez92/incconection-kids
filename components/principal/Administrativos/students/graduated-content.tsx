"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Download, FileText, Award, Calendar, GraduationCap, Star } from "lucide-react"

export function GraduatedContent() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedYear, setSelectedYear] = useState("all")
  const [selectedHonors, setSelectedHonors] = useState("all")

  const graduatedStudents = [
    {
      id: 1,
      name: "Ana García Pérez",
      document: "1234567890",
      graduationYear: "2023",
      finalGrade: 9.2,
      honors: "Magna Cum Laude",
      graduationDate: "2023-11-15",
      currentStatus: "Universidad",
      institution: "Universidad Nacional",
      career: "Ingeniería de Sistemas",
      phone: "300-123-4567",
      email: "ana.garcia@email.com",
    },
    {
      id: 2,
      name: "Carlos Rodríguez López",
      document: "0987654321",
      graduationYear: "2023",
      finalGrade: 8.8,
      honors: "Cum Laude",
      graduationDate: "2023-11-15",
      currentStatus: "Trabajando",
      institution: "Empresa ABC",
      career: "Técnico en Sistemas",
      phone: "301-234-5678",
      email: "carlos.rodriguez@email.com",
    },
    {
      id: 3,
      name: "María López Martínez",
      document: "1122334455",
      graduationYear: "2022",
      finalGrade: 9.5,
      honors: "Summa Cum Laude",
      graduationDate: "2022-11-20",
      currentStatus: "Universidad",
      institution: "Universidad de los Andes",
      career: "Medicina",
      phone: "302-345-6789",
      email: "maria.lopez@email.com",
    },
    {
      id: 4,
      name: "Juan Martínez Silva",
      document: "5544332211",
      graduationYear: "2022",
      finalGrade: 8.5,
      honors: "Sin distinción",
      graduationDate: "2022-11-20",
      currentStatus: "Estudiando",
      institution: "SENA",
      career: "Técnico en Programación",
      phone: "303-456-7890",
      email: "juan.martinez@email.com",
    },
  ]

  const filteredStudents = graduatedStudents.filter((student) => {
    const matchesSearch =
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.document.includes(searchTerm) ||
      student.institution.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesYear = selectedYear === "all" || student.graduationYear === selectedYear
    const matchesHonors = selectedHonors === "all" || student.honors === selectedHonors

    return matchesSearch && matchesYear && matchesHonors
  })

  const getHonorsColor = (honors: string) => {
    switch (honors) {
      case "Summa Cum Laude":
        return "default"
      case "Magna Cum Laude":
        return "secondary"
      case "Cum Laude":
        return "outline"
      default:
        return "outline"
    }
  }

  const getGradeColor = (grade: number) => {
    if (grade >= 9.0) return "text-green-600"
    if (grade >= 8.0) return "text-blue-600"
    if (grade >= 7.0) return "text-yellow-600"
    return "text-gray-600"
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold">Estudiantes Graduados</h2>
          <p className="text-muted-foreground">Registro histórico de estudiantes graduados y su seguimiento</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exportar Lista
          </Button>
          <Button variant="outline" size="sm">
            <FileText className="h-4 w-4 mr-2" />
            Generar Reporte
          </Button>
          <Button size="sm">
            <Award className="h-4 w-4 mr-2" />
            Ceremonia de Grado
          </Button>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">{graduatedStudents.length}</div>
            <div className="text-sm text-muted-foreground">Total Graduados</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">
              {graduatedStudents.filter((s) => s.currentStatus === "Universidad").length}
            </div>
            <div className="text-sm text-muted-foreground">En Universidad</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-purple-600">
              {graduatedStudents.filter((s) => s.honors !== "Sin distinción").length}
            </div>
            <div className="text-sm text-muted-foreground">Con Honores</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-orange-600">
              {(graduatedStudents.reduce((sum, s) => sum + s.finalGrade, 0) / graduatedStudents.length).toFixed(1)}
            </div>
            <div className="text-sm text-muted-foreground">Promedio General</div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filtros de Búsqueda</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4 md:items-end">
            <div className="md:col-span-2">
              <label className="text-sm font-medium mb-2 block">Buscar</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nombre, documento o institución..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Año de Graduación</label>
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger>
                  <SelectValue placeholder="Año" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="2023">2023</SelectItem>
                  <SelectItem value="2022">2022</SelectItem>
                  <SelectItem value="2021">2021</SelectItem>
                  <SelectItem value="2020">2020</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Honores</label>
              <Select value={selectedHonors} onValueChange={setSelectedHonors}>
                <SelectTrigger>
                  <SelectValue placeholder="Honores" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="Summa Cum Laude">Summa Cum Laude</SelectItem>
                  <SelectItem value="Magna Cum Laude">Magna Cum Laude</SelectItem>
                  <SelectItem value="Cum Laude">Cum Laude</SelectItem>
                  <SelectItem value="Sin distinción">Sin distinción</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabla de graduados */}
      <Card>
        <CardHeader>
          <CardTitle>Estudiantes Graduados</CardTitle>
          <CardDescription>{filteredStudents.length} graduado(s) encontrado(s)</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Graduado</TableHead>
                <TableHead>Documento</TableHead>
                <TableHead>Año Graduación</TableHead>
                <TableHead>Nota Final</TableHead>
                <TableHead>Honores</TableHead>
                <TableHead>Estado Actual</TableHead>
                <TableHead>Institución/Empresa</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStudents.map((student) => (
                <TableRow key={student.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium flex items-center gap-2">
                        <GraduationCap className="h-4 w-4 text-blue-600" />
                        {student.name}
                      </div>
                      <div className="text-sm text-muted-foreground flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(student.graduationDate).toLocaleDateString("es-ES")}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{student.document}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{student.graduationYear}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className={`font-bold ${getGradeColor(student.finalGrade)}`}>{student.finalGrade}</span>
                      {student.finalGrade >= 9.0 && <Star className="h-4 w-4 text-yellow-500" />}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getHonorsColor(student.honors)}>{student.honors}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={student.currentStatus === "Universidad" ? "default" : "secondary"}>
                      {student.currentStatus}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{student.institution}</div>
                      <div className="text-sm text-muted-foreground">{student.career}</div>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
