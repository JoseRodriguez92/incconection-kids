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
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  BookOpen,
  Plus,
  Search,
  Users,
  Clock,
  Edit,
  Trash2,
  Eye,
  UserCheck,
  MapPin,
  GraduationCap,
  Filter,
  Download,
} from "lucide-react";

interface Course {
  id: string;
  code: string;
  name: string;
  description: string;
  grade: string;
  teacher: string;
  teacherId: string;
  schedule: string;
  classroom: string;
  capacity: number;
  enrolled: number;
  status: "active" | "inactive" | "completed";
  credits: number;
  category: string;
  startDate: string;
  endDate: string;
}

interface Teacher {
  id: string;
  name: string;
  specialization: string;
  email: string;
}

const mockTeachers: Teacher[] = [
  {
    id: "T001",
    name: "Prof. María González",
    specialization: "Matemáticas",
    email: "maria.gonzalez@shift.edu.co",
  },
  {
    id: "T002",
    name: "Prof. Carlos Rodríguez",
    specialization: "Ciencias Naturales",
    email: "carlos.rodriguez@shift.edu.co",
  },
  {
    id: "T003",
    name: "Prof. Ana Martínez",
    specialization: "Español y Literatura",
    email: "ana.martinez@shift.edu.co",
  },
  {
    id: "T004",
    name: "Prof. Luis Fernández",
    specialization: "Inglés",
    email: "luis.fernandez@shift.edu.co",
  },
  {
    id: "T005",
    name: "Prof. Carmen López",
    specialization: "Historia",
    email: "carmen.lopez@shift.edu.co",
  },
  {
    id: "T006",
    name: "Prof. Roberto Silva",
    specialization: "Educación Física",
    email: "roberto.silva@shift.edu.co",
  },
];

const mockCourses: Course[] = [
  {
    id: "C001",
    code: "MAT-10A",
    name: "Matemáticas Básicas",
    description: "Fundamentos de álgebra y geometría para décimo grado",
    grade: "10°",
    teacher: "Prof. María González",
    teacherId: "T001",
    schedule: "Lunes, Miércoles, Viernes 8:00-9:30 AM",
    classroom: "Aula 101",
    capacity: 30,
    enrolled: 28,
    status: "active",
    credits: 4,
    category: "Matemáticas",
    startDate: "2024-02-01",
    endDate: "2024-06-30",
  },
  {
    id: "C002",
    code: "CIE-10A",
    name: "Ciencias Naturales",
    description: "Introducción a la física, química y biología",
    grade: "10°",
    teacher: "Prof. Carlos Rodríguez",
    teacherId: "T002",
    schedule: "Martes, Jueves 10:00-11:30 AM",
    classroom: "Laboratorio 1",
    capacity: 25,
    enrolled: 23,
    status: "active",
    credits: 3,
    category: "Ciencias",
    startDate: "2024-02-01",
    endDate: "2024-06-30",
  },
  {
    id: "C003",
    code: "ESP-11A",
    name: "Literatura Española",
    description: "Análisis de obras clásicas de la literatura española",
    grade: "11°",
    teacher: "Prof. Ana Martínez",
    teacherId: "T003",
    schedule: "Lunes, Miércoles 2:00-3:30 PM",
    classroom: "Aula 205",
    capacity: 35,
    enrolled: 32,
    status: "active",
    credits: 3,
    category: "Humanidades",
    startDate: "2024-02-01",
    endDate: "2024-06-30",
  },
  {
    id: "C004",
    code: "ING-09B",
    name: "Inglés Intermedio",
    description: "Desarrollo de habilidades comunicativas en inglés",
    grade: "9°",
    teacher: "Prof. Luis Fernández",
    teacherId: "T004",
    schedule: "Martes, Jueves 1:00-2:30 PM",
    classroom: "Aula 103",
    capacity: 28,
    enrolled: 25,
    status: "active",
    credits: 3,
    category: "Idiomas",
    startDate: "2024-02-01",
    endDate: "2024-06-30",
  },
  {
    id: "C005",
    code: "HIS-11B",
    name: "Historia Universal",
    description: "Estudio de las civilizaciones y eventos históricos",
    grade: "11°",
    teacher: "Sin asignar",
    teacherId: "",
    schedule: "Por definir",
    classroom: "Por asignar",
    capacity: 30,
    enrolled: 0,
    status: "inactive",
    credits: 2,
    category: "Humanidades",
    startDate: "2024-02-01",
    endDate: "2024-06-30",
  },
];

const categories = [
  "Matemáticas",
  "Ciencias",
  "Humanidades",
  "Idiomas",
  "Artes",
  "Educación Física",
  "Tecnología",
];
const grades = ["6°", "7°", "8°", "9°", "10°", "11°"];

export function CoursesContent() {
  const [courses, setCourses] = useState<Course[]>(mockCourses);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGrade, setSelectedGrade] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [viewingCourse, setViewingCourse] = useState<Course | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

  const [newCourse, setNewCourse] = useState({
    code: "",
    name: "",
    description: "",
    grade: "",
    teacherId: "",
    schedule: "",
    classroom: "",
    capacity: "",
    credits: "",
    category: "",
    startDate: "",
    endDate: "",
    status: "active",
  });

  const filteredCourses = courses.filter((course) => {
    const matchesSearch =
      course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.teacher.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGrade = !selectedGrade || course.grade === selectedGrade;
    const matchesCategory =
      !selectedCategory || course.category === selectedCategory;
    const matchesStatus = !selectedStatus || course.status === selectedStatus;

    return matchesSearch && matchesGrade && matchesCategory && matchesStatus;
  });

  const resetForm = () => {
    setNewCourse({
      code: "",
      name: "",
      description: "",
      grade: "",
      teacherId: "",
      schedule: "",
      classroom: "",
      capacity: "",
      credits: "",
      category: "",
      startDate: "",
      endDate: "",
      status: "active",
    });
    setEditingCourse(null);
  };

  const handleCreateCourse = () => {
    if (newCourse.code && newCourse.name && newCourse.teacherId) {
      const teacher = mockTeachers.find((t) => t.id === newCourse.teacherId);
      const course: Course = {
        id: Date.now().toString(),
        code: newCourse.code,
        name: newCourse.name,
        description: newCourse.description,
        grade: newCourse.grade,
        teacher: teacher?.name || "",
        teacherId: newCourse.teacherId,
        schedule: newCourse.schedule,
        classroom: newCourse.classroom,
        capacity: Number.parseInt(newCourse.capacity) || 30,
        enrolled: 0,
        status: "active",
        credits: Number.parseInt(newCourse.credits) || 3,
        category: newCourse.category,
        startDate: newCourse.startDate,
        endDate: newCourse.endDate,
      };

      setCourses([...courses, course]);
      resetForm();
      setIsCreateDialogOpen(false);
    }
  };

  const handleEditCourse = (course: Course) => {
    setEditingCourse(course);
    setNewCourse({
      code: course.code,
      name: course.name,
      description: course.description,
      grade: course.grade,
      teacherId: course.teacherId,
      schedule: course.schedule,
      classroom: course.classroom,
      capacity: course.capacity.toString(),
      credits: course.credits.toString(),
      category: course.category,
      startDate: course.startDate,
      endDate: course.endDate,
      status: course.status,
    });
    setIsCreateDialogOpen(true);
  };

  const handleUpdateCourse = () => {
    if (
      editingCourse &&
      newCourse.code &&
      newCourse.name &&
      newCourse.teacherId
    ) {
      const teacher = mockTeachers.find((t) => t.id === newCourse.teacherId);
      const updatedCourse: Course = {
        ...editingCourse,
        code: newCourse.code,
        name: newCourse.name,
        description: newCourse.description,
        grade: newCourse.grade,
        teacher: teacher?.name || "",
        teacherId: newCourse.teacherId,
        schedule: newCourse.schedule,
        classroom: newCourse.classroom,
        capacity: Number.parseInt(newCourse.capacity) || 30,
        credits: Number.parseInt(newCourse.credits) || 3,
        category: newCourse.category,
        startDate: newCourse.startDate,
        endDate: newCourse.endDate,
        status: newCourse.status as "active" | "inactive" | "completed",
      };

      setCourses(
        courses.map((c) => (c.id === editingCourse.id ? updatedCourse : c)),
      );
      resetForm();
      setIsCreateDialogOpen(false);
    }
  };

  const handleDeleteCourse = (courseId: string) => {
    setCourses(courses.filter((c) => c.id !== courseId));
  };

  const handleViewCourse = (course: Course) => {
    setViewingCourse(course);
    setIsViewDialogOpen(true);
  };

  const getOccupancyRate = (course: Course) => {
    return Math.round((course.enrolled / course.capacity) * 100);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
            Activo
          </Badge>
        );
      case "inactive":
        return <Badge variant="secondary">Inactivo</Badge>;
      case "completed":
        return (
          <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
            Completado
          </Badge>
        );
      default:
        return <Badge variant="outline">Desconocido</Badge>;
    }
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedGrade("");
    setSelectedCategory("");
    setSelectedStatus("");
  };

  const stats = {
    total: courses.length,
    active: courses.filter((c) => c.status === "active").length,
    totalEnrolled: courses.reduce((sum, c) => sum + c.enrolled, 0),
    totalCapacity: courses.reduce((sum, c) => sum + c.capacity, 0),
    averageOccupancy:
      courses.length > 0
        ? Math.round(
            courses.reduce((sum, c) => sum + getOccupancyRate(c), 0) /
              courses.length,
          )
        : 0,
    activeTeachers: new Set(
      courses.filter((c) => c.teacherId).map((c) => c.teacherId),
    ).size,
  };

  return (
    <div className="flex-1 space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Gestión de Cursos
          </h1>
          <p className="text-muted-foreground">
            Administra los cursos y materias del instituto
          </p>
        </div>
        <div className="flex flex-col space-y-2 md:flex-row md:space-y-0 md:space-x-2">
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Exportar
          </Button>
          <Dialog
            open={isCreateDialogOpen}
            onOpenChange={setIsCreateDialogOpen}
          >
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="mr-2 h-4 w-4" />
                Nuevo Curso
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingCourse ? "Editar Curso" : "Crear Nuevo Curso"}
                </DialogTitle>
                <DialogDescription>
                  {editingCourse
                    ? "Modifica la información del curso seleccionado"
                    : "Completa la información para crear un nuevo curso"}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-6 py-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="code">Código del Curso *</Label>
                    <Input
                      id="code"
                      value={newCourse.code}
                      onChange={(e) =>
                        setNewCourse({ ...newCourse, code: e.target.value })
                      }
                      placeholder="Ej: MAT-10A"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="name">Nombre del Curso *</Label>
                    <Input
                      id="name"
                      value={newCourse.name}
                      onChange={(e) =>
                        setNewCourse({ ...newCourse, name: e.target.value })
                      }
                      placeholder="Ej: Matemáticas Básicas"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Descripción</Label>
                  <Textarea
                    id="description"
                    value={newCourse.description}
                    onChange={(e) =>
                      setNewCourse({
                        ...newCourse,
                        description: e.target.value,
                      })
                    }
                    placeholder="Descripción del curso y objetivos"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="grade">Grado *</Label>
                    <Select
                      value={newCourse.grade}
                      onValueChange={(value) =>
                        setNewCourse({ ...newCourse, grade: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar grado" />
                      </SelectTrigger>
                      <SelectContent>
                        {grades.map((grade) => (
                          <SelectItem key={grade} value={grade}>
                            {grade}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category">Categoría *</Label>
                    <Select
                      value={newCourse.category}
                      onValueChange={(value) =>
                        setNewCourse({ ...newCourse, category: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar categoría" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="credits">Créditos *</Label>
                    <Input
                      id="credits"
                      type="number"
                      min="1"
                      max="6"
                      value={newCourse.credits}
                      onChange={(e) =>
                        setNewCourse({ ...newCourse, credits: e.target.value })
                      }
                      placeholder="3"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="status">Estado *</Label>
                    <Select
                      value={newCourse.status || "active"}
                      onValueChange={(value) =>
                        setNewCourse({ ...newCourse, status: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar estado" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Activo</SelectItem>
                        <SelectItem value="inactive">Inactivo</SelectItem>
                        <SelectItem value="completed">Completado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="teacher">Docente Asignado *</Label>
                  <Select
                    value={newCourse.teacherId}
                    onValueChange={(value) =>
                      setNewCourse({ ...newCourse, teacherId: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar docente" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockTeachers.map((teacher) => (
                        <SelectItem key={teacher.id} value={teacher.id}>
                          {teacher.name} - {teacher.specialization}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="schedule">Horario</Label>
                    <Input
                      id="schedule"
                      value={newCourse.schedule}
                      onChange={(e) =>
                        setNewCourse({ ...newCourse, schedule: e.target.value })
                      }
                      placeholder="Lunes, Miércoles 8:00-9:30 AM"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="classroom">Aula</Label>
                    <Input
                      id="classroom"
                      value={newCourse.classroom}
                      onChange={(e) =>
                        setNewCourse({
                          ...newCourse,
                          classroom: e.target.value,
                        })
                      }
                      placeholder="Aula 101"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="capacity">Capacidad Máxima</Label>
                    <Input
                      id="capacity"
                      type="number"
                      min="1"
                      value={newCourse.capacity}
                      onChange={(e) =>
                        setNewCourse({ ...newCourse, capacity: e.target.value })
                      }
                      placeholder="30"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="startDate">Fecha de Inicio</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={newCourse.startDate}
                      onChange={(e) =>
                        setNewCourse({
                          ...newCourse,
                          startDate: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="endDate">Fecha de Fin</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={newCourse.endDate}
                      onChange={(e) =>
                        setNewCourse({ ...newCourse, endDate: e.target.value })
                      }
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsCreateDialogOpen(false)}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={
                    editingCourse ? handleUpdateCourse : handleCreateCourse
                  }
                >
                  {editingCourse ? "Actualizar" : "Crear"} Curso
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Cursos</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              {stats.active} activos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Estudiantes Inscritos
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalEnrolled}</div>
            <p className="text-xs text-muted-foreground">
              De {stats.totalCapacity} cupos totales
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Ocupación Promedio
            </CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.averageOccupancy}%</div>
            <p className="text-xs text-muted-foreground">Tasa de ocupación</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Docentes Activos
            </CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeTeachers}</div>
            <p className="text-xs text-muted-foreground">
              Profesores asignados
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros de Búsqueda
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            <div className="space-y-2">
              <Label htmlFor="search">Buscar Curso</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Nombre, código o docente..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="gradeFilter">Grado</Label>
              <Select value={selectedGrade} onValueChange={setSelectedGrade}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos los grados" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los grados</SelectItem>
                  {grades.map((grade) => (
                    <SelectItem key={grade} value={grade}>
                      {grade}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="categoryFilter">Categoría</Label>
              <Select
                value={selectedCategory}
                onValueChange={setSelectedCategory}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todas las categorías" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las categorías</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="statusFilter">Estado</Label>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos los estados" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados</SelectItem>
                  <SelectItem value="active">Activos</SelectItem>
                  <SelectItem value="inactive">Inactivos</SelectItem>
                  <SelectItem value="completed">Completados</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end space-x-2">
              <Button
                variant="outline"
                onClick={clearFilters}
                className="flex-1"
              >
                Limpiar
              </Button>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Mostrando {filteredCourses.length} de {courses.length} cursos
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Tabla de Cursos */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Cursos</CardTitle>
          <CardDescription>
            Gestiona todos los cursos disponibles en la institución
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Código</TableHead>
                  <TableHead>Curso</TableHead>
                  <TableHead>Grado</TableHead>
                  <TableHead>Docente</TableHead>
                  <TableHead>Horario</TableHead>
                  <TableHead>Aula</TableHead>
                  <TableHead>Ocupación</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCourses.map((course) => (
                  <TableRow key={course.id}>
                    <TableCell className="font-mono font-medium">
                      {course.code}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{course.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {course.category}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{course.grade}</Badge>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">
                          {course.teacher || "Sin asignar"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {course.credits} créditos
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Clock className="mr-1 h-3 w-3" />
                        <span className="text-sm">
                          {course.schedule || "Por definir"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <MapPin className="mr-1 h-3 w-3" />
                        <span className="text-sm">
                          {course.classroom || "Por asignar"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm">
                          {course.enrolled}/{course.capacity}
                        </span>
                        <Badge
                          variant={
                            getOccupancyRate(course) > 90
                              ? "destructive"
                              : getOccupancyRate(course) > 70
                                ? "secondary"
                                : "default"
                          }
                        >
                          {getOccupancyRate(course)}%
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(course.status)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewCourse(course)}
                        >
                          <Eye className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditCourse(course)}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteCourse(course.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Modal de Vista de Curso - Rediseñado */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
                {viewingCourse?.code.charAt(0)}
              </div>
              <div>
                <h3 className="text-xl font-bold">{viewingCourse?.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {viewingCourse?.code}
                </p>
              </div>
            </DialogTitle>
            <DialogDescription>
              Información completa del curso seleccionado
            </DialogDescription>
          </DialogHeader>

          {viewingCourse && (
            <div className="space-y-6">
              {/* Información Básica */}
              <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 border-blue-200 dark:border-blue-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
                    <BookOpen className="h-5 w-5" />
                    Información Básica
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div>
                        <Label className="text-sm font-medium text-blue-600 dark:text-blue-400">
                          Nombre del Curso
                        </Label>
                        <p className="text-sm font-semibold">
                          {viewingCourse.name}
                        </p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-blue-600 dark:text-blue-400">
                          Descripción
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          {viewingCourse.description}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="text-sm font-medium text-blue-600 dark:text-blue-400">
                            Grado
                          </Label>
                          <p className="text-sm font-semibold">
                            {viewingCourse.grade}
                          </p>
                        </div>
                        <Badge
                          variant="outline"
                          className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                        >
                          {viewingCourse.grade}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="text-sm font-medium text-blue-600 dark:text-blue-400">
                            Categoría
                          </Label>
                          <p className="text-sm font-semibold">
                            {viewingCourse.category}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <GraduationCap className="h-4 w-4 text-blue-500" />
                          <span className="text-sm font-medium">
                            {viewingCourse.credits} créditos
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Información del Docente */}
              <Card className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 border-green-200 dark:border-green-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-300">
                    <UserCheck className="h-5 w-5" />
                    Docente Asignado
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white font-bold text-xl">
                      {viewingCourse.teacher
                        ? viewingCourse.teacher
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                        : "SA"}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-lg">
                        {viewingCourse.teacher || "Sin asignar"}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {viewingCourse.teacher
                          ? "Docente titular del curso"
                          : "Pendiente de asignación"}
                      </p>
                    </div>
                    {viewingCourse.teacher && (
                      <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                        Asignado
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Horario y Ubicación */}
              <Card className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950 border-purple-200 dark:border-purple-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-purple-700 dark:text-purple-300">
                    <Clock className="h-5 w-5" />
                    Horario y Ubicación
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <Clock className="h-5 w-5 text-purple-500" />
                        <div>
                          <Label className="text-sm font-medium text-purple-600 dark:text-purple-400">
                            Horario
                          </Label>
                          <p className="text-sm font-semibold">
                            {viewingCourse.schedule || "Por definir"}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <MapPin className="h-5 w-5 text-purple-500" />
                        <div>
                          <Label className="text-sm font-medium text-purple-600 dark:text-purple-400">
                            Aula
                          </Label>
                          <p className="text-sm font-semibold">
                            {viewingCourse.classroom || "Por asignar"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Estadísticas del Curso */}
              <Card className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-950 dark:to-red-950 border-orange-200 dark:border-orange-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-orange-700 dark:text-orange-300">
                    <Users className="h-5 w-5" />
                    Estadísticas de Inscripción
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg border">
                      <div className="text-2xl font-bold text-orange-600">
                        {viewingCourse.capacity}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Capacidad Total
                      </p>
                    </div>
                    <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg border">
                      <div className="text-2xl font-bold text-green-600">
                        {viewingCourse.enrolled}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Estudiantes Inscritos
                      </p>
                    </div>
                    <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg border">
                      <div className="text-2xl font-bold text-blue-600">
                        {getOccupancyRate(viewingCourse)}%
                      </div>
                      <p className="text-sm text-muted-foreground">Ocupación</p>
                    </div>
                  </div>

                  {/* Barra de progreso */}
                  <div className="mt-4">
                    <div className="flex justify-between text-sm mb-2">
                      <span>Ocupación del curso</span>
                      <span>{getOccupancyRate(viewingCourse)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${getOccupancyRate(viewingCourse)}%` }}
                      ></div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Fechas y Estado */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-950 dark:to-amber-950 border-yellow-200 dark:border-yellow-800">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-yellow-700 dark:text-yellow-300 text-lg">
                      📅 Período Académico
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <Label className="text-sm font-medium text-yellow-600 dark:text-yellow-400">
                          Fecha de Inicio
                        </Label>
                        <p className="text-sm font-semibold">
                          {viewingCourse.startDate
                            ? new Date(
                                viewingCourse.startDate,
                              ).toLocaleDateString("es-ES", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              })
                            : "No definida"}
                        </p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-yellow-600 dark:text-yellow-400">
                          Fecha de Fin
                        </Label>
                        <p className="text-sm font-semibold">
                          {viewingCourse.endDate
                            ? new Date(
                                viewingCourse.endDate,
                              ).toLocaleDateString("es-ES", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              })
                            : "No definida"}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-950 dark:to-slate-950 border-gray-200 dark:border-gray-800">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-gray-700 dark:text-gray-300 text-lg">
                      🎯 Estado del Curso
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-center h-20">
                      <div className="text-center">
                        {getStatusBadge(viewingCourse.status)}
                        <p className="text-sm text-muted-foreground mt-2">
                          Estado actual
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsViewDialogOpen(false)}
            >
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
