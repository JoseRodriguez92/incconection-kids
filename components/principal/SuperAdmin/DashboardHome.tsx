"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Calendar,
  AlertTriangle,
  BookOpen,
  Settings,
} from "lucide-react";
import { ChartConfig, ChartContainer } from "@/components/ui/chart";
import { TrendingUp } from "lucide-react";
import { Label, Pie, PieChart } from "recharts";
import { useMemo, useState, useEffect } from "react";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
import { createClient } from "@/lib/supabase/client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { AcademicPeriod } from "@/Stores/periodAcademicStore";
import { PeriodAcademicStore } from "@/Stores/periodAcademicStore";
import { EventStore, type Event } from "@/Stores/eventStore";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

/** Data Estudiantes  */
const chartConfigStudent = {
  visitors: {
    label: "Visitors",
  },
  primaria: {
    label: "Primaria",
  },
  bachillerato: {
    label: "Bachillerato",
  },
  pre_escolar: {
    label: "Pre-escolar",
  },
} satisfies ChartConfig;

/** Data Profesores */
const chartConfigTeachers = {
  visitors: {
    label: "Visitors",
  },
  total: {
    label: "Primaria",
  },
} satisfies ChartConfig;

/** Data Employes  */
const chartConfigEmployes = {
  visitors: {
    label: "Visitors",
  },
  primaria: {
    label: "Primaria",
  },
  bachillerato: {
    label: "Bachillerato",
  },
  pre_escolar: {
    label: "Pre-escolar",
  },
} satisfies ChartConfig;

export function DashboardHome() {
  const [totalStudents, setTotalStudents] = useState(0);
  const [totalParents, setTotalParents] = useState(0);
  const [totalAdmins, setTotalAdmins] = useState(0);
  const [totalTeachers, setTotalTeachers] = useState(0);
  const [loading, setLoading] = useState(true);
  const [academicPeriods, setAcademicPeriods] = useState<AcademicPeriod[]>([]);
  const [selectedPeriodId, setSelectedPeriodId] = useState<string>("");
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);

  const supabase = createClient();
  const { fetchActivePeriodo } = PeriodAcademicStore();
  const { fetchEventsByPeriod } = EventStore();

  // Función para cargar los periodos académicos
  const fetchAcademicPeriods = async () => {
    try {
      const { data: periods, error } = await supabase
        .from("academic_period")
        .select("*")
        .order("is_active", { ascending: false })
        .order("start_date", { ascending: false });

      if (error) {
        console.error("Error fetching academic periods:", error);
        return;
      }

      if (periods && periods.length > 0) {
        setAcademicPeriods(periods);

        // Seleccionar el periodo activo por defecto
        const activePeriod = periods.find((p) => p.is_active);
        if (activePeriod) {
          setSelectedPeriodId(activePeriod.id);
        } else {
          setSelectedPeriodId(periods[0].id);
        }
      }
    } catch (error) {
      console.error("Error in fetchAcademicPeriods:", error);
    }
  };

  // Función para obtener datos reales de estudiantes y padres
  const fetchDashboardData = async (periodId: string) => {
    try {
      setLoading(true);

      // IMPORTANTE: Resetear valores antes de cargar nuevos datos
      setTotalStudents(0);
      setTotalParents(0);
      setTotalAdmins(0);
      setTotalTeachers(0);

      if (!periodId) {
        setLoading(false);
        return;
      }

      // Query para obtener estudiantes del periodo seleccionado
      const { data: studentsData, error: studentsError } = await supabase
        .from("student_enrolled")
        .select("user_id")
        .eq("academic_period_id", periodId)
        .eq("is_active", true);

      if (studentsError) {
        console.error("❌ Error fetching students:", studentsError);
        setTotalStudents(0);
        setTotalParents(0);
        setTotalAdmins(0);
        setTotalTeachers(0);
      } else {
        const uniqueStudents = new Set(
          studentsData?.map((s) => s.user_id) || [],
        );
        setTotalStudents(uniqueStudents.size);

        const periodoNombre =
          academicPeriods.find((p) => p.id === periodId)?.name || periodId;
        console.log("\n🔄 ========================================");
        console.log(`📊 PERIODO: ${periodoNombre}`);
        console.log(`📊 Total estudiantes únicos: ${uniqueStudents.size}`);

        if (uniqueStudents.size > 0) {
          console.log(
            "👥 Primeros 5 student IDs:",
            Array.from(uniqueStudents).slice(0, 5),
          );
        } else {
          console.log("⚠️ No hay estudiantes inscritos en este periodo");
        }

        // Obtener padres relacionados con estos estudiantes
        if (uniqueStudents.size > 0) {
          const { data: parentsData, error: parentsError } = await supabase
            .from("parent_has_student")
            .select("parent_id, student_id")
            .in("student_id", Array.from(uniqueStudents));

          console.log(
            `👨‍👩‍👧 Total registros parent_has_student encontrados: ${parentsData?.length || 0}`,
          );

          if (parentsData && parentsData.length > 0) {
            console.log("👨‍👩‍👧 Primeros 5 registros:", parentsData.slice(0, 5));
          }

          if (parentsError) {
            console.error("❌ Error fetching parents:", parentsError);
            setTotalParents(0);
          } else {
            const uniqueParents = new Set(
              parentsData?.map((p) => p.parent_id).filter(Boolean) || [],
            );
            setTotalParents(uniqueParents.size);
            console.log(`✅ Total padres únicos: ${uniqueParents.size}`);
          }
        } else {
          console.log(
            "⚠️ No hay estudiantes en este periodo, no se buscan padres",
          );
          setTotalParents(0);
        }

        // Obtener administradores del periodo seleccionado
        const { data: adminsData, error: adminsError } = await supabase
          .from("admin_enrolled")
          .select("user_id")
          .eq("academic_period_id", periodId)
          .eq("is_active", true);

        if (adminsError) {
          console.error("❌ Error fetching admins:", adminsError);
          setTotalAdmins(0);
        } else {
          const uniqueAdmins = new Set(adminsData?.map((a) => a.user_id) || []);
          setTotalAdmins(uniqueAdmins.size);
          console.log(`👔 Total administradores únicos: ${uniqueAdmins.size}`);
        }

        // Obtener profesores del periodo seleccionado
        const { data: teachersData, error: teachersError } = await supabase
          .from("teacher_enrolled")
          .select("user_id")
          .eq("academic_period_id", periodId)
          .eq("is_active", true);

        if (teachersError) {
          console.error("❌ Error fetching teachers:", teachersError);
          setTotalTeachers(0);
        } else {
          const uniqueTeachers = new Set(
            teachersData?.map((t) => t.user_id) || [],
          );
          setTotalTeachers(uniqueTeachers.size);
          console.log(`👨‍🏫 Total profesores únicos: ${uniqueTeachers.size}`);
        }

        console.log("========================================\n");
      }
    } catch (error) {
      console.error("Error in fetchDashboardData:", error);
    } finally {
      setLoading(false);
    }
  };

  // Cargar periodos académicos al montar el componente
  useEffect(() => {
    fetchAcademicPeriods();
  }, []);

  // Cargar datos cuando cambie el periodo seleccionado
  useEffect(() => {
    if (selectedPeriodId) {
      fetchDashboardData(selectedPeriodId);
    }
  }, [selectedPeriodId]);

  // Función para cargar eventos del periodo académico
  const loadUpcomingEvents = async (periodId: string) => {
    try {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("academic_period_id", periodId)
        .gte("start_at", new Date().toISOString())
        .order("start_at", { ascending: true })
        .limit(5);

      if (error) {
        console.error("Error fetching events:", error);
        setUpcomingEvents([]);
      } else {
        setUpcomingEvents(data || []);
      }
    } catch (error) {
      console.error("Error loading events:", error);
      setUpcomingEvents([]);
    }
  };

  // Cargar eventos cuando cambie el periodo seleccionado
  useEffect(() => {
    if (selectedPeriodId) {
      loadUpcomingEvents(selectedPeriodId);
    }
  }, [selectedPeriodId]);

  const totalStudent = useMemo(() => {
    return totalStudents; // Siempre mostrar datos reales, incluso si es 0
  }, [totalStudents]);

  // Datos para las gráficas (solo un segmento con el total)
  const studentsChartData = useMemo(
    () => [{ name: "total", value: totalStudents, fill: "#009834" }],
    [totalStudents],
  );

  const parentsChartData = useMemo(
    () => [{ name: "total", value: totalParents, fill: "#009834" }],
    [totalParents],
  );

  const adminsChartData = useMemo(
    () => [{ name: "total", value: totalAdmins, fill: "#009834" }],
    [totalAdmins],
  );

  const teachersChartData = useMemo(
    () => [{ name: "total", value: totalTeachers, fill: "#009834" }],
    [totalTeachers],
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Panel de Administración
          </h1>
          <p className="text-muted-foreground">
            Bienvenido al sistema de gestión escolar
          </p>
        </div>

        {/* Filtro de periodo académico */}
        <div className="flex items-center gap-3">
          <label className="text-sm font-medium text-muted-foreground">
            Periodo Académico:
          </label>
          <Select
            value={selectedPeriodId}
            onValueChange={setSelectedPeriodId}
            disabled={academicPeriods.length === 0}
          >
            <SelectTrigger className="w-[280px]">
              <SelectValue placeholder="Selecciona un periodo" />
            </SelectTrigger>
            <SelectContent>
              {academicPeriods.map((period) => (
                <SelectItem key={period.id} value={period.id}>
                  <div className="flex items-center gap-2">
                    <span>{period.name}</span>
                    {period.is_active && (
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                        Activo
                      </span>
                    )}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Separator />

      {/* Carousel de estadísticas */}
      <div className="px-12">
        <Carousel
          opts={{
            align: "start",
            loop: true,
          }}
          className="w-full"
        >
          <CarouselContent>
            {/** Card de estudiantes  */}
            <CarouselItem className="md:basis-1/2 lg:basis-1/3">
              <Card>
                <CardHeader className="items-center pb-0">
                  <CardTitle>Estudiantes</CardTitle>
                  <CardDescription>
                    Total de estudiantes registradps
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1 pb-0">
                  <ChartContainer
                    config={chartConfigStudent}
                    className="mx-auto aspect-square max-h-[250px]"
                  >
                    <PieChart>
                      <Pie
                        data={studentsChartData}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={60}
                        strokeWidth={5}
                      >
                        <Label
                          content={({ viewBox }) => {
                            if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                              return (
                                <text
                                  x={viewBox.cx}
                                  y={viewBox.cy}
                                  textAnchor="middle"
                                  dominantBaseline="middle"
                                >
                                  <tspan
                                    x={viewBox.cx}
                                    y={viewBox.cy}
                                    className="fill-foreground text-3xl font-bold"
                                  >
                                    {totalStudent.toLocaleString()}
                                  </tspan>
                                  <tspan
                                    x={viewBox.cx}
                                    y={(viewBox.cy || 0) + 24}
                                    className="fill-muted-foreground"
                                  >
                                    Estudiantes
                                  </tspan>
                                </text>
                              );
                            }
                          }}
                        />
                      </Pie>
                    </PieChart>
                  </ChartContainer>
                </CardContent>
                <CardFooter className="flex-col gap-2 text-sm">
                  <div className="flex items-center gap-2 leading-none font-medium">
                    {loading
                      ? "Cargando datos..."
                      : "Gráfica que representa la cantidad de estudiantes"}
                  </div>
                  <div className="text-muted-foreground leading-none">
                    {academicPeriods.find((p) => p.id === selectedPeriodId)
                      ?.name || "Periodo seleccionado"}
                  </div>
                </CardFooter>
              </Card>
            </CarouselItem>

            {/** Card de padres */}
            <CarouselItem className="md:basis-1/2 lg:basis-1/3">
              <Card>
                <CardHeader className="items-center pb-0">
                  <CardTitle>Padres</CardTitle>
                  <CardDescription>Perfiles de padres activos</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 pb-0">
                  <ChartContainer
                    config={chartConfigTeachers}
                    className="mx-auto aspect-square max-h-[250px]"
                  >
                    <PieChart>
                      <Pie
                        data={parentsChartData}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={60}
                        strokeWidth={5}
                      >
                        <Label
                          content={({ viewBox }) => {
                            if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                              return (
                                <text
                                  x={viewBox.cx}
                                  y={viewBox.cy}
                                  textAnchor="middle"
                                  dominantBaseline="middle"
                                >
                                  <tspan
                                    x={viewBox.cx}
                                    y={viewBox.cy}
                                    className="fill-foreground text-3xl font-bold"
                                  >
                                    {totalParents.toLocaleString()}
                                  </tspan>
                                  <tspan
                                    x={viewBox.cx}
                                    y={(viewBox.cy || 0) + 24}
                                    className="fill-muted-foreground"
                                  >
                                    Padres
                                  </tspan>
                                </text>
                              );
                            }
                          }}
                        />
                      </Pie>
                    </PieChart>
                  </ChartContainer>
                </CardContent>
                <CardFooter className="flex-col gap-2 text-sm">
                  <div className="flex items-center gap-2 leading-none font-medium">
                    {loading
                      ? "Cargando datos..."
                      : "Gráfica que representa la cantidad de padres"}
                  </div>
                  <div className="text-muted-foreground leading-none">
                    {academicPeriods.find((p) => p.id === selectedPeriodId)
                      ?.name || "Periodo seleccionado"}
                  </div>
                </CardFooter>
              </Card>
            </CarouselItem>

            {/** Card de administradores */}
            <CarouselItem className="md:basis-1/2 lg:basis-1/3">
              <Card>
                <CardHeader className="items-center pb-0">
                  <CardTitle>Administradores</CardTitle>
                  <CardDescription>
                    Personal administrativo activo
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1 pb-0">
                  <ChartContainer
                    config={chartConfigTeachers}
                    className="mx-auto aspect-square max-h-[250px]"
                  >
                    <PieChart>
                      <Pie
                        data={adminsChartData}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={60}
                        strokeWidth={5}
                      >
                        <Label
                          content={({ viewBox }) => {
                            if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                              return (
                                <text
                                  x={viewBox.cx}
                                  y={viewBox.cy}
                                  textAnchor="middle"
                                  dominantBaseline="middle"
                                >
                                  <tspan
                                    x={viewBox.cx}
                                    y={viewBox.cy}
                                    className="fill-foreground text-3xl font-bold"
                                  >
                                    {totalAdmins.toLocaleString()}
                                  </tspan>
                                  <tspan
                                    x={viewBox.cx}
                                    y={(viewBox.cy || 0) + 24}
                                    className="fill-muted-foreground"
                                  >
                                    Administradores
                                  </tspan>
                                </text>
                              );
                            }
                          }}
                        />
                      </Pie>
                    </PieChart>
                  </ChartContainer>
                </CardContent>
                <CardFooter className="flex-col gap-2 text-sm">
                  <div className="flex items-center gap-2 leading-none font-medium">
                    {loading
                      ? "Cargando datos..."
                      : "Gráfica que representa la cantidad de administradores"}
                  </div>
                  <div className="text-muted-foreground leading-none">
                    {academicPeriods.find((p) => p.id === selectedPeriodId)
                      ?.name || "Periodo seleccionado"}
                  </div>
                </CardFooter>
              </Card>
            </CarouselItem>

            {/** Card de profesores */}
            <CarouselItem className="md:basis-1/2 lg:basis-1/3">
              <Card>
                <CardHeader className="items-center pb-0">
                  <CardTitle>Profesores</CardTitle>
                  <CardDescription>Docentes activos</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 pb-0">
                  <ChartContainer
                    config={chartConfigTeachers}
                    className="mx-auto aspect-square max-h-[250px]"
                  >
                    <PieChart>
                      <Pie
                        data={teachersChartData}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={60}
                        strokeWidth={5}
                      >
                        <Label
                          content={({ viewBox }) => {
                            if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                              return (
                                <text
                                  x={viewBox.cx}
                                  y={viewBox.cy}
                                  textAnchor="middle"
                                  dominantBaseline="middle"
                                >
                                  <tspan
                                    x={viewBox.cx}
                                    y={viewBox.cy}
                                    className="fill-foreground text-3xl font-bold"
                                  >
                                    {totalTeachers.toLocaleString()}
                                  </tspan>
                                  <tspan
                                    x={viewBox.cx}
                                    y={(viewBox.cy || 0) + 24}
                                    className="fill-muted-foreground"
                                  >
                                    Profesores
                                  </tspan>
                                </text>
                              );
                            }
                          }}
                        />
                      </Pie>
                    </PieChart>
                  </ChartContainer>
                </CardContent>
                <CardFooter className="flex-col gap-2 text-sm">
                  <div className="flex items-center gap-2 leading-none font-medium">
                    {loading
                      ? "Cargando datos..."
                      : "Gráfica que representa la cantidad de profesores"}
                  </div>
                  <div className="text-muted-foreground leading-none">
                    {academicPeriods.find((p) => p.id === selectedPeriodId)
                      ?.name || "Periodo seleccionado"}
                  </div>
                </CardFooter>
              </Card>
            </CarouselItem>
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      </div>

      {/* Otras tarjetas en grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BookOpen className="w-5 h-5" />
              <span>Grupos de Interés</span>
            </CardTitle>
            <CardDescription>Actividades extracurriculares</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col h-full">
            <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
              <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-full">
                <Settings className="w-12 h-12 text-gray-400" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                  Contenido no configurado
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Los grupos de interés se mostrarán aquí una vez configurados
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="w-5 h-5" />
              <span>Eventos Próximos</span>
            </CardTitle>
            <CardDescription>Próximas actividades programadas</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col h-full">
            <div className="flex-1 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
              <div className="space-y-3">
                {upcomingEvents.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Calendar className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>No hay eventos próximos</p>
                  </div>
                ) : (
                  upcomingEvents.map((event, index) => {
                    const colors = [
                      "bg-blue-500",
                      "bg-green-500",
                      "bg-orange-500",
                      "bg-purple-500",
                      "bg-red-500",
                    ];
                    const colorClass = colors[index % colors.length];

                    const formatEventDate = (dateString: string) => {
                      const date = new Date(dateString);
                      const day = date.getDate();
                      const month = date.toLocaleDateString("es-ES", {
                        month: "long",
                      });
                      const time = date.toLocaleTimeString("es-ES", {
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: true,
                      });
                      return `${day} de ${month.charAt(0).toUpperCase() + month.slice(1)} - ${time}`;
                    };

                    return (
                      <div
                        key={event.id}
                        className="flex items-center space-x-3 p-3 border border-border rounded-lg"
                      >
                        <div
                          className={`w-2 h-2 ${colorClass} rounded-full`}
                        ></div>
                        <div className="flex-1">
                          <div className="font-medium">{event.title}</div>
                          <div className="text-sm text-muted-foreground">
                            {formatEventDate(event.start_at)}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5" />
              <span>Alertas Importantes</span>
            </CardTitle>
            <CardDescription>
              Notificaciones que requieren atención
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col h-full">
            <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
              <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-full">
                <Settings className="w-12 h-12 text-gray-400" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                  Contenido no configurado
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Las alertas se mostrarán aquí una vez configuradas
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
