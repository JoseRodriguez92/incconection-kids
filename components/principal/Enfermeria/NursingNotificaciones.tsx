"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Bell,
  BellOff,
  Search,
  CheckCircle2,
  Loader2,
  RefreshCw,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface VisitNotif {
  id: string;
  visit_date: string;
  reason: string;
  status: string;
  parent_notified: boolean;
  parent_notified_at: string | null;
  student_name: string;
  document_number: string;
}

const STATUS_BADGE: Record<string, string> = {
  atendido:       "bg-emerald-100 text-emerald-700",
  en_observacion: "bg-amber-100 text-amber-700",
  remitido:       "bg-red-100 text-red-700",
  enviado_a_casa: "bg-violet-100 text-violet-700",
};

const STATUS_LABELS: Record<string, string> = {
  atendido:       "Atendido",
  en_observacion: "En Observación",
  remitido:       "Remitido",
  enviado_a_casa: "Enviado a casa",
};

export function NursingNotificaciones() {
  const [visits, setVisits] = useState<VisitNotif[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "pending" | "notified">("all");
  const [markingId, setMarkingId] = useState<string | null>(null);
  const [periodId, setPeriodId] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from("academic_period")
        .select("id")
        .eq("is_active", true)
        .maybeSingle();
      if (data) setPeriodId(data.id);
    })();
  }, []);

  const loadVisits = useCallback(async () => {
    if (!periodId) return;
    setLoading(true);
    const supabase = createClient();

    const { data } = await supabase
      .from("nurse_visit")
      .select(`
        id, visit_date, reason, status, parent_notified, parent_notified_at,
        student_enrolled (
          user_id,
          profiles:user_id (full_name, document_number)
        )
      `)
      .eq("academic_period_id", periodId)
      .order("visit_date", { ascending: false })
      .limit(200);

    const mapped: VisitNotif[] = (data ?? []).map((v: any) => ({
      id: v.id,
      visit_date: v.visit_date,
      reason: v.reason,
      status: v.status,
      parent_notified: v.parent_notified,
      parent_notified_at: v.parent_notified_at,
      student_name: v.student_enrolled?.profiles?.full_name ?? "—",
      document_number: v.student_enrolled?.profiles?.document_number ?? "—",
    }));

    setVisits(mapped);
    setLoading(false);
  }, [periodId]);

  useEffect(() => { loadVisits(); }, [loadVisits]);

  const markAsNotified = async (visitId: string) => {
    setMarkingId(visitId);
    const supabase = createClient();
    const { error } = await supabase
      .from("nurse_visit")
      .update({ parent_notified: true, parent_notified_at: new Date().toISOString() })
      .eq("id", visitId);
    setMarkingId(null);
    if (error) { toast.error("Error al actualizar"); return; }
    toast.success("Marcado como notificado");
    setVisits((prev) => prev.map((v) => v.id === visitId ? { ...v, parent_notified: true, parent_notified_at: new Date().toISOString() } : v));
  };

  const filtered = visits.filter((v) => {
    const matchSearch =
      !search ||
      v.student_name.toLowerCase().includes(search.toLowerCase()) ||
      v.document_number.includes(search) ||
      v.reason.toLowerCase().includes(search.toLowerCase());
    const matchFilter =
      filter === "all" ||
      (filter === "pending" && !v.parent_notified) ||
      (filter === "notified" && v.parent_notified);
    return matchSearch && matchFilter;
  });

  const pending = visits.filter((v) => !v.parent_notified).length;
  const notified = visits.filter((v) => v.parent_notified).length;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 sm:px-6 py-3 sm:py-4 border-b bg-background/80 backdrop-blur-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-orange-100 flex items-center justify-center shrink-0">
              <Bell className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <h1 className="font-bold text-base leading-tight">Notificaciones a Padres</h1>
              <p className="text-[11px] text-muted-foreground">
                <span className="text-orange-600 font-semibold">{pending}</span> pendientes ·{" "}
                <span className="text-green-600 font-semibold">{notified}</span> notificados
              </p>
            </div>
          </div>
          <Button size="sm" variant="outline" className="gap-1.5 self-start sm:self-auto" onClick={loadVisits}>
            <RefreshCw className={cn("w-3.5 h-3.5", loading && "animate-spin")} />
            Actualizar
          </Button>
        </div>

        <div className="flex flex-col gap-2 mt-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nombre, documento o motivo..."
              className="pl-9"
            />
          </div>
          <div className="flex gap-1 bg-muted/60 rounded-xl p-1 self-start sm:self-auto">
            {([
              { id: "pending", label: "Pendientes", icon: BellOff },
              { id: "notified", label: "Notificados", icon: CheckCircle2 },
              { id: "all", label: "Todos" },
            ] as const).map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setFilter(id)}
                className={cn(
                  "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all",
                  filter === id
                    ? "bg-background shadow-sm text-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {Icon && <Icon className="w-3.5 h-3.5 shrink-0" />}
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-auto p-4 sm:p-6">
        {loading ? (
          <div className="flex justify-center items-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <Bell className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm">
              {filter === "pending"
                ? "No hay notificaciones pendientes"
                : filter === "notified"
                  ? "No hay padres notificados aún"
                  : "No hay atenciones registradas"}
            </p>
          </div>
        ) : (
          <div className="space-y-2 max-w-3xl mx-auto">
            {filtered.map((v) => (
              <div
                key={v.id}
                className={cn(
                  "flex flex-col gap-3 sm:flex-row sm:items-center p-4 rounded-xl border transition-colors",
                  v.parent_notified
                    ? "bg-green-50/50 border-green-200"
                    : "bg-orange-50/50 border-orange-200",
                )}
              >
                {/* Student */}
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className={cn(
                    "w-9 h-9 rounded-full flex items-center justify-center shrink-0",
                    v.parent_notified ? "bg-green-100" : "bg-orange-100",
                  )}>
                    <User className={cn("w-4 h-4", v.parent_notified ? "text-green-600" : "text-orange-600")} />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-sm truncate">{v.student_name}</p>
                    <p className="text-xs text-muted-foreground truncate">{v.reason}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] text-muted-foreground">
                        {new Date(v.visit_date).toLocaleDateString("es-CO", { day: "2-digit", month: "short" })}{" "}
                        {new Date(v.visit_date).toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" })}
                      </span>
                      <Badge className={cn("text-[10px] px-1.5 py-0", STATUS_BADGE[v.status] ?? "bg-gray-100 text-gray-700")}>
                        {STATUS_LABELS[v.status] ?? v.status}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Action */}
                <div className="flex items-center gap-2 sm:shrink-0">
                  {v.parent_notified ? (
                    <div className="flex items-center gap-1.5 text-green-700 text-xs">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>
                        Notificado
                        {v.parent_notified_at && (
                          <span className="text-muted-foreground ml-1">
                            {new Date(v.parent_notified_at).toLocaleDateString("es-CO", { day: "2-digit", month: "short" })}
                          </span>
                        )}
                      </span>
                    </div>
                  ) : (
                    <Button
                      size="sm"
                      className="gap-1.5 w-full sm:w-auto"
                      onClick={() => markAsNotified(v.id)}
                      disabled={markingId === v.id}
                    >
                      {markingId === v.id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Bell className="w-3.5 h-3.5" />
                      )}
                      Marcar notificado
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
