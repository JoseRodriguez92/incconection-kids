"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronDown, Filter, Search } from "lucide-react";
import { DIAS_SEMANA } from "./constants";

type PeriodoOption = { id: string; name: string; is_active: boolean | null };

type Props = {
  searchTerm: string;
  setSearchTerm: (v: string) => void;
  selectedProfesor: string;
  setSelectedProfesor: (v: string) => void;
  selectedMateria: string;
  setSelectedMateria: (v: string) => void;
  selectedDia: string;
  setSelectedDia: (v: string) => void;
  selectedCurso: string;
  setSelectedCurso: (v: string) => void;
  selectedGrupo: string;
  setSelectedGrupo: (v: string) => void;
  selectedPeriodo: string;
  setSelectedPeriodo: (v: string) => void;
  profesoresList: string[];
  materias: string[];
  cursos: string[];
  grupos: string[];
  periodosData: PeriodoOption[];
  isLoading: boolean;
  handleFilterClick: () => void;
};

export function SchedulesFilters({
  searchTerm, setSearchTerm,
  selectedProfesor, setSelectedProfesor,
  selectedMateria, setSelectedMateria,
  selectedDia, setSelectedDia,
  selectedCurso, setSelectedCurso,
  selectedGrupo, setSelectedGrupo,
  selectedPeriodo, setSelectedPeriodo,
  profesoresList,
  materias,
  cursos,
  grupos,
  periodosData,
  isLoading,
  handleFilterClick,
}: Props) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(min-width: 1024px)").matches) {
      setIsOpen(true);
    }
  }, []);

  return (
    <Card>
      {/* Header — en mobile actúa como toggle */}
      <CardHeader
        className="cursor-pointer select-none"
        onClick={() => setIsOpen((v) => !v)}
      >
        <CardTitle className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 shrink-0" />
            <span>Filtros</span>
          </div>
          <ChevronDown
            className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
          />
        </CardTitle>
      </CardHeader>

      {/* Contenido — oculto en mobile hasta abrir, siempre visible en desktop */}
      <CardContent className={isOpen ? "block" : "hidden"}>
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-3">
            {/* Búsqueda */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Buscar por profesor, materia, curso o aula..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={selectedProfesor} onValueChange={setSelectedProfesor}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Profesor" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Todos los profesores">Todos los profesores</SelectItem>
                {profesoresList.map((p) => (
                  <SelectItem key={p} value={p}>{p}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedMateria} onValueChange={setSelectedMateria}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Materia" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Todas las materias">Todas las materias</SelectItem>
                {materias.map((m) => (
                  <SelectItem key={m} value={m}>{m}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedCurso} onValueChange={setSelectedCurso}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Curso" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Todos los cursos">Todos los cursos</SelectItem>
                {cursos.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedGrupo} onValueChange={setSelectedGrupo}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Grupo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Todos los grupos">Todos los grupos</SelectItem>
                {grupos.map((g) => (
                  <SelectItem key={g} value={g}>{g}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedPeriodo} onValueChange={setSelectedPeriodo}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Todos los periodos">Todos los periodos</SelectItem>
                {periodosData.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name} {p.is_active && "(Activo)"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedDia} onValueChange={setSelectedDia}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Día" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Todos los días">Todos los días</SelectItem>
                {DIAS_SEMANA.map((dia) => (
                  <SelectItem key={dia} value={dia}>{dia}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button
            onClick={handleFilterClick}
            disabled={isLoading}
            className="w-full gap-2"
          >
            <Filter className="w-4 h-4" />
            {isLoading ? "Cargando..." : "Filtrar"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
