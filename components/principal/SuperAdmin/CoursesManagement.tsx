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
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">
          Gestión de Cursos
        </h2>
        <div className="flex gap-2">
          <BulkGroupAssignment
            periodos={PeriodAcademicStore((s) => s.periodos)}
          />
          <Button
            size="sm"
            className="flex items-center space-x-2"
            onClick={() => setIsCreateCourseOpen(true)}
          >
            <Plus className="w-4 h-4" />
            <span>Nuevo Curso</span>
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BookOpen className="w-5 h-5" />
            <span>Lista de Cursos</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
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
                  <p>No se encontraron cursos</p>
                </div>
              ) : (
                filteredCourses.map((course) => (
                  <Card key={course.id}>
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-foreground">
                          {course.name}
                        </h3>
                        <Badge
                          variant={course.is_active ? "default" : "secondary"}
                        >
                          {course.is_active ? "Activo" : "Inactivo"}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {course.description || "Sin descripción"}
                      </p>
                      <div className="text-xs text-muted-foreground space-y-1">
                        <p>
                          <strong>Código:</strong> {course.code || "N/A"}
                        </p>
                        <p>
                          <strong>Nivel:</strong>{" "}
                          {course.education_level || "N/A"}
                        </p>
                        <p>
                          <strong>Grado:</strong> {course.grade_number || "N/A"}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => {
                            setSelectedCourse(course);
                            setIsViewGroupsOpen(true);
                          }}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          Ver Grupos
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => {
                            setSelectedCourse(course);
                            setIsEditCourseOpen(true);
                          }}
                        >
                          <Edit className="w-4 h-4 mr-2" />
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
