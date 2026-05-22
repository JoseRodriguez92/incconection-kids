"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, Edit, BookOpen, Users, Eye } from "lucide-react";
import { CoursesStore } from "@/Stores/coursesStore";
import { GroupsStore } from "@/Stores/groupsStore";
import { ProfilesStore } from "@/Stores/profilesStore";
import { PeriodAcademicStore } from "@/Stores/periodAcademicStore";
import { GroupHasStudentsStore } from "@/Stores/groupHasStudentsStore";
import { EstudenteEnrrolledStore } from "@/Stores/studentEnrolledStore";
import { GroupHasParentStore } from "@/Stores/groupHasParentStore";
import { ParentEnrolledStore } from "@/Stores/parentEnrolledStore";
import { ParentHasStudentStore } from "@/Stores/ParentHasStudentStore";
import { CreateCourseModal } from "./Courses/modals/CreateCourseModal";
import { BulkGroupAssignment } from "./UsersManagement/BulkGroupAssignment";
import { EditCourseModal } from "./Courses/modals/EditCourseModal";
import { ViewGroupsModal } from "./Courses/modals/ViewGroupsModal";
import { EditGroupModal } from "./Courses/modals/EditGroupModal";
import { ViewStudentsModal } from "./Courses/modals/ViewStudentsModal";
import { ViewParentsModal } from "./Courses/modals/ViewParentsModal";

export function CoursesManagement() {
  const { courses, fetchCourses } = CoursesStore();
  const { fetchGroups } = GroupsStore();
  const { fetchProfiles } = ProfilesStore();
  const { fetchPeriodos } = PeriodAcademicStore();
  const { fetchGroupHasStudents } = GroupHasStudentsStore();
  const { fetchEnrolled: fetchStudentEnrolled } = EstudenteEnrrolledStore();
  const { fetchGroupHasParents } = GroupHasParentStore();
  const { fetchEnrolled: fetchParentEnrolled } = ParentEnrolledStore();
  const { fetchRelations: fetchParentHasStudent } = ParentHasStudentStore();

  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateCourseOpen, setIsCreateCourseOpen] = useState(false);
  const [isEditCourseOpen, setIsEditCourseOpen] = useState(false);
  const [isViewGroupsOpen, setIsViewGroupsOpen] = useState(false);
  const [isEditGroupOpen, setIsEditGroupOpen] = useState(false);
  const [isViewStudentsOpen, setIsViewStudentsOpen] = useState(false);
  const [isViewParentsOpen, setIsViewParentsOpen] = useState(false);

  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  const [selectedGroup, setSelectedGroup] = useState<any>(null);
  const [selectedGroupForStudents, setSelectedGroupForStudents] =
    useState<any>(null);
  const [selectedGroupForParents, setSelectedGroupForParents] =
    useState<any>(null);

  useEffect(() => {
    fetchCourses();
    fetchGroups();
    fetchProfiles();
    fetchPeriodos();
    fetchGroupHasStudents();
    fetchStudentEnrolled();
    fetchGroupHasParents();
    fetchParentEnrolled();
    fetchParentHasStudent();
  }, []);

  const filteredCourses = courses.filter(
    (course) =>
      course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (course.code &&
        course.code.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (course.education_level &&
        course.education_level
          .toLowerCase()
          .includes(searchTerm.toLowerCase())),
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl font-bold text-foreground leading-tight">
          Gestión de Cursos
        </h2>
        <div className="flex gap-2 flex-wrap sm:shrink-0">
          <BulkGroupAssignment
            periodos={PeriodAcademicStore((s) => s.periodos)}
          />
          <Button
            size="sm"
            className="gap-2 flex-1 sm:flex-none"
            onClick={() => setIsCreateCourseOpen(true)}
          >
            <Plus className="w-4 h-4" />
            Nuevo Curso
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 shrink-0" />
            <span>Lista de Cursos</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Buscador */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Buscar cursos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredCourses.length === 0 ? (
                <div className="col-span-full text-center py-12 text-muted-foreground">
                  <Users className="w-16 h-16 mx-auto mb-4 opacity-40" />
                  <p className="text-sm">No se encontraron cursos</p>
                </div>
              ) : (
                filteredCourses.map((course) => (
                  <Card key={course.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4 space-y-3">
                      {/* Nombre + badge */}
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-semibold text-foreground text-base leading-snug min-w-0 truncate">
                          {course.name}
                        </h3>
                        <Badge
                          variant={course.is_active ? "default" : "secondary"}
                          className="shrink-0 text-xs"
                        >
                          {course.is_active ? "Activo" : "Inactivo"}
                        </Badge>
                      </div>

                      {/* Descripción */}
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {course.description || "Sin descripción"}
                      </p>

                      {/* Metadata chips */}
                      <div className="flex flex-wrap gap-1.5">
                        {course.code && (
                          <span className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                            #{course.code}
                          </span>
                        )}
                        {course.education_level && (
                          <span className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                            {course.education_level}
                          </span>
                        )}
                        {course.grade_number && (
                          <span className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                            Grado {course.grade_number}
                          </span>
                        )}
                      </div>

                      {/* Acciones */}
                      <div className="flex gap-2 pt-1">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 gap-1.5"
                          onClick={() => {
                            setSelectedCourse(course);
                            setIsViewGroupsOpen(true);
                          }}
                        >
                          <Eye className="w-3.5 h-3.5" />
                          Ver Grupos
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 gap-1.5"
                          onClick={() => {
                            setSelectedCourse(course);
                            setIsEditCourseOpen(true);
                          }}
                        >
                          <Edit className="w-3.5 h-3.5" />
                          Editar
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Modales ─────────────────────────────────────────────────── */}

      <CreateCourseModal
        open={isCreateCourseOpen}
        onOpenChange={setIsCreateCourseOpen}
      />

      <EditCourseModal
        open={isEditCourseOpen}
        onOpenChange={setIsEditCourseOpen}
        course={selectedCourse}
        onCourseChange={setSelectedCourse}
      />

      <ViewGroupsModal
        open={isViewGroupsOpen}
        onOpenChange={setIsViewGroupsOpen}
        course={selectedCourse}
        onEditGroup={(group) => {
          setSelectedGroup(group);
          setIsEditGroupOpen(true);
        }}
        onViewStudents={(group) => {
          setSelectedGroupForStudents(group);
          setIsViewStudentsOpen(true);
        }}
        onViewParents={(group) => {
          setSelectedGroupForParents(group);
          setIsViewParentsOpen(true);
        }}
      />

      <EditGroupModal
        open={isEditGroupOpen}
        onOpenChange={setIsEditGroupOpen}
        group={selectedGroup}
        onGroupChange={setSelectedGroup}
      />

      <ViewStudentsModal
        open={isViewStudentsOpen}
        onOpenChange={setIsViewStudentsOpen}
        group={selectedGroupForStudents}
      />

      <ViewParentsModal
        open={isViewParentsOpen}
        onOpenChange={setIsViewParentsOpen}
        group={selectedGroupForParents}
      />
    </div>
  );
}
