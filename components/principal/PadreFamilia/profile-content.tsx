"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  User,
  Calendar,
  Edit,
  Save,
  Camera,
  School,
  Users,
  Award,
} from "lucide-react";
import { useState } from "react";

interface ProfileContentProps {
  language: string;
  activeStudent: any;
}

export function ProfileContent({
  language,
  activeStudent,
}: ProfileContentProps) {
  const [isEditing, setIsEditing] = useState(false);
  const isSpanish = language === "es";

  const studentInfo = {
    personalInfo: {
      fullName: `${activeStudent.firstName} ${activeStudent.lastName}`,
      studentId: activeStudent.id,
      grade: activeStudent.grade,
      section: activeStudent.section,
      birthDate: "15/03/2010",
      age: "13 años",
      bloodType: "O+",
      address: "Calle 123 #45-67, Bogotá",
      phone: "+57 300 123 4567",
      email: "sofia.gonzalez@estudiante.edu.co",
    },
    academicInfo: {
      enrollmentDate: "01/02/2020",
      currentYear: "2024",
      academicStatus: "Activo",
      gpa: "4.2",
      attendance: "95%",
      behavior: "Excelente",
    },
    parentInfo: {
      father: {
        name: "Carlos González",
        phone: "+57 310 123 4567",
        email: "carlos.gonzalez@email.com",
        occupation: "Ingeniero",
      },
      mother: {
        name: "María López",
        phone: "+57 320 123 4567",
        email: "maria.lopez@email.com",
        occupation: "Doctora",
      },
    },
    emergencyContact: {
      name: "Ana González",
      relationship: "Tía",
      phone: "+57 315 123 4567",
    },
  };

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-6 pt-0">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            {isSpanish ? "Perfil del Estudiante" : "Student Profile"}
          </h1>
          <p className="text-muted-foreground">
            {isSpanish
              ? "Información personal y académica"
              : "Personal and academic information"}
          </p>
        </div>
        <Button
          onClick={() => setIsEditing(!isEditing)}
          variant={isEditing ? "default" : "outline"}
        >
          {isEditing ? (
            <>
              <Save className="mr-2 h-4 w-4" />
              {isSpanish ? "Guardar" : "Save"}
            </>
          ) : (
            <>
              <Edit className="mr-2 h-4 w-4" />
              {isSpanish ? "Editar" : "Edit"}
            </>
          )}
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Profile Card */}
        <Card className="md:col-span-1">
          <CardHeader className="text-center">
            <div className="relative mx-auto">
              <Avatar className="h-24 w-24 mx-auto">
                <AvatarImage src={activeStudent.photo || "/placeholder.svg"} />
                <AvatarFallback className="text-lg">
                  {activeStudent.firstName[0]}
                  {activeStudent.lastName[0]}
                </AvatarFallback>
              </Avatar>
              {isEditing && (
                <Button
                  size="sm"
                  variant="secondary"
                  className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0"
                >
                  <Camera className="h-4 w-4" />
                </Button>
              )}
            </div>
            <div className="space-y-2">
              <CardTitle className="text-xl">
                {studentInfo.personalInfo.fullName}
              </CardTitle>
              <div className="flex flex-col gap-1">
                <Badge variant="secondary" className="w-fit mx-auto">
                  {studentInfo.personalInfo.studentId}
                </Badge>
                <p className="text-sm text-muted-foreground">
                  {studentInfo.personalInfo.grade} -{" "}
                  {isSpanish ? "Sección" : "Section"}{" "}
                  {studentInfo.personalInfo.section}
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-primary">
                  {studentInfo.academicInfo.gpa}
                </div>
                <div className="text-xs text-muted-foreground">
                  {isSpanish ? "Promedio" : "GPA"}
                </div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {studentInfo.academicInfo.attendance}
                </div>
                <div className="text-xs text-muted-foreground">
                  {isSpanish ? "Asistencia" : "Attendance"}
                </div>
              </div>
            </div>
            <Separator />
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>
                  {isSpanish ? "Edad:" : "Age:"} {studentInfo.personalInfo.age}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Award className="h-4 w-4 text-muted-foreground" />
                <span>
                  {isSpanish ? "Comportamiento:" : "Behavior:"}{" "}
                  {studentInfo.academicInfo.behavior}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Information Cards */}
        <div className="md:col-span-2 space-y-6">
          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                {isSpanish ? "Información Personal" : "Personal Information"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">
                    {isSpanish ? "Nombre Completo" : "Full Name"}
                  </Label>
                  <Input
                    id="fullName"
                    value={studentInfo.personalInfo.fullName}
                    disabled={!isEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="birthDate">
                    {isSpanish ? "Fecha de Nacimiento" : "Birth Date"}
                  </Label>
                  <Input
                    id="birthDate"
                    value={studentInfo.personalInfo.birthDate}
                    disabled={!isEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bloodType">
                    {isSpanish ? "Tipo de Sangre" : "Blood Type"}
                  </Label>
                  <Input
                    id="bloodType"
                    value={studentInfo.personalInfo.bloodType}
                    disabled={!isEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">
                    {isSpanish ? "Teléfono" : "Phone"}
                  </Label>
                  <Input
                    id="phone"
                    value={studentInfo.personalInfo.phone}
                    disabled={!isEditing}
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="address">
                    {isSpanish ? "Dirección" : "Address"}
                  </Label>
                  <Input
                    id="address"
                    value={studentInfo.personalInfo.address}
                    disabled={!isEditing}
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="email">
                    {isSpanish ? "Correo Electrónico" : "Email"}
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={studentInfo.personalInfo.email}
                    disabled={!isEditing}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Academic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <School className="h-5 w-5" />
                {isSpanish ? "Información Académica" : "Academic Information"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>
                    {isSpanish ? "Fecha de Matrícula" : "Enrollment Date"}
                  </Label>
                  <Input
                    value={studentInfo.academicInfo.enrollmentDate}
                    disabled
                  />
                </div>
                <div className="space-y-2">
                  <Label>{isSpanish ? "Año Actual" : "Current Year"}</Label>
                  <Input
                    value={studentInfo.academicInfo.currentYear}
                    disabled
                  />
                </div>
                <div className="space-y-2">
                  <Label>
                    {isSpanish ? "Estado Académico" : "Academic Status"}
                  </Label>
                  <Input
                    value={studentInfo.academicInfo.academicStatus}
                    disabled
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Parent Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                {isSpanish ? "Información de Padres" : "Parent Information"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Father */}
              <div>
                <h4 className="font-semibold mb-3">
                  {isSpanish ? "Padre" : "Father"}
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{isSpanish ? "Nombre" : "Name"}</Label>
                    <Input
                      value={studentInfo.parentInfo.father.name}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{isSpanish ? "Ocupación" : "Occupation"}</Label>
                    <Input
                      value={studentInfo.parentInfo.father.occupation}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{isSpanish ? "Teléfono" : "Phone"}</Label>
                    <Input
                      value={studentInfo.parentInfo.father.phone}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{isSpanish ? "Email" : "Email"}</Label>
                    <Input
                      value={studentInfo.parentInfo.father.email}
                      disabled={!isEditing}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Mother */}
              <div>
                <h4 className="font-semibold mb-3">
                  {isSpanish ? "Madre" : "Mother"}
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{isSpanish ? "Nombre" : "Name"}</Label>
                    <Input
                      value={studentInfo.parentInfo.mother.name}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{isSpanish ? "Ocupación" : "Occupation"}</Label>
                    <Input
                      value={studentInfo.parentInfo.mother.occupation}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{isSpanish ? "Teléfono" : "Phone"}</Label>
                    <Input
                      value={studentInfo.parentInfo.mother.phone}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{isSpanish ? "Email" : "Email"}</Label>
                    <Input
                      value={studentInfo.parentInfo.mother.email}
                      disabled={!isEditing}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Emergency Contact */}
              <div>
                <h4 className="font-semibold mb-3">
                  {isSpanish ? "Contacto de Emergencia" : "Emergency Contact"}
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>{isSpanish ? "Nombre" : "Name"}</Label>
                    <Input
                      value={studentInfo.emergencyContact.name}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{isSpanish ? "Parentesco" : "Relationship"}</Label>
                    <Input
                      value={studentInfo.emergencyContact.relationship}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{isSpanish ? "Teléfono" : "Phone"}</Label>
                    <Input
                      value={studentInfo.emergencyContact.phone}
                      disabled={!isEditing}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
