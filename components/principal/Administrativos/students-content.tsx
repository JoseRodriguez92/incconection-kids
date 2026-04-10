"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Search,
  Filter,
  Plus,
  MoreHorizontal,
  Download,
  Upload,
} from "lucide-react";

export function StudentsContent() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGrade, setSelectedGrade] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");

  const students = [
    {
      id: 1,
      name: "Ana García Pérez",
      document: "1234567890",
      grade: "10°A",
      status: "Activo",
      paymentStatus: "Al día",
      phone: "300-123-4567",
      email: "ana.garcia@email.com",
    },
    {
      id: 2,
      name: "Carlos Rodríguez López",
      document: "0987654321",
      grade: "11°B",
      status: "Activo",
      paymentStatus: "Pendiente",
      phone: "301-234-5678",
      email: "carlos.rodriguez@email.com",
    },
    {
      id: 3,
      name: "María López Martínez",
      document: "1122334455",
      grade: "9°C",
      status: "Activo",
      paymentStatus: "Al día",
      phone: "302-345-6789",
      email: "maria.lopez@email.com",
    },
    {
      id: 4,
      name: "Juan Martínez Silva",
      document: "5544332211",
      grade: "10°B",
      status: "Inactivo",
      paymentStatus: "Vencido",
      phone: "303-456-7890",
      email: "juan.martinez@email.com",
    },
  ];

  const filteredStudents = students.filter((student) => {
    const matchesSearch =
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.document.includes(searchTerm);
    const matchesGrade =
      selectedGrade === "all" || student.grade === selectedGrade;
    const matchesStatus =
      selectedStatus === "all" || student.status === selectedStatus;

    return matchesSearch && matchesGrade && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header con acciones */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold">Gestión de Estudiantes</h2>
          <p className="text-muted-foreground">
            Administra la información de todos los estudiantes
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Upload className="h-4 w-4 mr-2" />
            Importar CSV
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Estudiante
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filtros de Búsqueda</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 md:flex-row md:items-end">
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Buscar</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nombre o documento..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-full md:w-48">
              <label className="text-sm font-medium mb-2 block">Grado</label>
              <Select value={selectedGrade} onValueChange={setSelectedGrade}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar grado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los grados</SelectItem>
                  <SelectItem value="9°A">9°A</SelectItem>
                  <SelectItem value="9°B">9°B</SelectItem>
                  <SelectItem value="9°C">9°C</SelectItem>
                  <SelectItem value="10°A">10°A</SelectItem>
                  <SelectItem value="10°B">10°B</SelectItem>
                  <SelectItem value="11°A">11°A</SelectItem>
                  <SelectItem value="11°B">11°B</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-full md:w-48">
              <label className="text-sm font-medium mb-2 block">Estado</label>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="Activo">Activo</SelectItem>
                  <SelectItem value="Inactivo">Inactivo</SelectItem>
                  <SelectItem value="Graduado">Graduado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Limpiar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabla de estudiantes */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Estudiantes</CardTitle>
          <CardDescription>
            {filteredStudents.length} estudiante(s) encontrado(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Documento</TableHead>
                <TableHead>Grado</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Estado de Pago</TableHead>
                <TableHead>Contacto</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStudents.map((student) => (
                <TableRow key={student.id}>
                  <TableCell className="font-medium">{student.name}</TableCell>
                  <TableCell>{student.document}</TableCell>
                  <TableCell>{student.grade}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        student.status === "Activo" ? "default" : "secondary"
                      }
                    >
                      {student.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        student.paymentStatus === "Al día"
                          ? "default"
                          : student.paymentStatus === "Pendiente"
                            ? "secondary"
                            : "destructive"
                      }
                    >
                      {student.paymentStatus}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>{student.phone}</div>
                      <div className="text-muted-foreground">
                        {student.email}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>Ver perfil</DropdownMenuItem>
                        <DropdownMenuItem>Editar</DropdownMenuItem>
                        <DropdownMenuItem>Ver pagos</DropdownMenuItem>
                        <DropdownMenuItem>Generar certificado</DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600">
                          Desactivar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
