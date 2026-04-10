"use client";

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
import { Filter, Search } from "lucide-react";
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
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Filter className="w-5 h-5" />
          <span>Filtros</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4">
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
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por profesor" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Todos los profesores">Todos los profesores</SelectItem>
                {profesoresList.map((p) => (
                  <SelectItem key={p} value={p}>{p}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedMateria} onValueChange={setSelectedMateria}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por materia" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Todas las materias">Todas las materias</SelectItem>
                {materias.map((m) => (
                  <SelectItem key={m} value={m}>{m}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedCurso} onValueChange={setSelectedCurso}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por curso" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Todos los cursos">Todos los cursos</SelectItem>
                {cursos.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedGrupo} onValueChange={setSelectedGrupo}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por grupo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Todos los grupos">Todos los grupos</SelectItem>
                {grupos.map((g) => (
                  <SelectItem key={g} value={g}>{g}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedPeriodo} onValueChange={setSelectedPeriodo}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por periodo" />
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
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por día" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Todos los días">Todos los días</SelectItem>
                {DIAS_SEMANA.map((dia) => (
                  <SelectItem key={dia} value={dia}>{dia}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end">
            <Button onClick={handleFilterClick} disabled={isLoading} className="px-6">
              {isLoading ? (
                <span>Cargando...</span>
              ) : (
                <>
                  <Filter className="w-4 h-4 mr-2" />
                  Filtrar
                </>
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
