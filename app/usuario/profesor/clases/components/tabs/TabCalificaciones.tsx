"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ConditionBadges } from "@/components/ui/ConditionBadges";
import type { Estudiante } from "../../types";
import type { CycleWithRelation } from "@/Stores/cycleStore";

interface TabCalificacionesProps {
  estudiantes: Estudiante[];
  ciclos?: CycleWithRelation[];
}

export function TabCalificaciones({
  estudiantes,
  ciclos = [],
}: TabCalificacionesProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Tabla de Calificaciones</CardTitle>
        <CardDescription>
          {ciclos.length > 0
            ? "Calificaciones por ciclo y estudiante"
            : "No hay ciclos disponibles para el periodo académico actual"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {ciclos.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No se encontraron ciclos para mostrar calificaciones.</p>
            <p className="text-sm mt-2">
              Por favor, configure los ciclos del periodo académico.
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="sticky left-0 bg-background z-10">
                      Estudiante
                    </TableHead>
                    {ciclos.map((ciclo) => (
                      <TableHead
                        key={ciclo.id}
                        className="text-center min-w-[100px]"
                      >
                        {ciclo.name}
                      </TableHead>
                    ))}
                    <TableHead className="text-center font-bold bg-primary/5 min-w-[100px]">
                      Nota Final
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {estudiantes.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={ciclos.length + 2}
                        className="text-center py-8 text-muted-foreground"
                      >
                        No hay estudiantes inscritos en este curso
                      </TableCell>
                    </TableRow>
                  ) : (
                    estudiantes.map((estudiante) => (
                      <TableRow key={estudiante.id}>
                        <TableCell className="sticky left-0 bg-background z-10">
                          <p className="font-medium text-sm">{estudiante.nombre || estudiante.full_name}</p>
                          <ConditionBadges conditions={estudiante.conditions} className="mt-0.5" />
                        </TableCell>
                        {ciclos.map((ciclo) => (
                          <TableCell key={ciclo.id} className="text-center">
                            <Input
                              className="w-20 text-center mx-auto"
                              type="number"
                              min="0"
                              max="10"
                              step="0.1"
                              defaultValue="0.0"
                              placeholder="0.0"
                            />
                          </TableCell>
                        ))}
                        <TableCell className="text-center bg-primary/5">
                          <Badge variant="outline" className="font-semibold">
                            0.0
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
            <div className="mt-4 flex justify-between items-center">
              <p className="text-sm text-muted-foreground">
                Total de estudiantes: <strong>{estudiantes.length}</strong>
              </p>
              <Button disabled={estudiantes.length === 0}>
                Generar nota final
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
