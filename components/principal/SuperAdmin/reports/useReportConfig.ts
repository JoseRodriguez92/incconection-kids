"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { InstituteStore } from "@/Stores/InstituteStore";
import {
  type ReportId,
  type ReportConfigMap,
  REPORT_CONFIG_DEFAULTS,
} from "./reportConfig.types";

// ── Hook ─────────────────────────────────────────────────────────────────────

export function useReportConfig<T extends ReportId>(reportId: T) {
  type Config = ReportConfigMap[T];

  const supabase = createClient();
  const institute_id = InstituteStore((s) => s.institute?.id ?? "");

  const [config, setConfig] = useState<Config>(
    REPORT_CONFIG_DEFAULTS[reportId] as Config,
  );
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // ── Cargar config desde Supabase ─────────────────────────────────────────
  const load = useCallback(async () => {
    if (!institute_id) return;
    setLoading(true);

    const { data, error } = await supabase
      .from("report_config")
      .select("config")
      .eq("institute_id", institute_id)
      .eq("report_id", reportId)
      .maybeSingle();

    if (error) {
      console.error("Error cargando config del reporte:", error);
    } else if (data?.config) {
      // Merge con defaults para que campos nuevos siempre tengan valor
      setConfig({
        ...(REPORT_CONFIG_DEFAULTS[reportId] as Config),
        ...(data.config as Partial<Config>),
      });
    }

    setLoading(false);
  }, [institute_id, reportId]);

  useEffect(() => {
    load();
  }, [load]);

  // ── Guardar config en Supabase (upsert) ──────────────────────────────────
  const save = async (updates: Partial<Config>) => {
    if (!institute_id) return false;
    setSaving(true);

    const merged = { ...config, ...updates };

    const { error } = await supabase
      .from("report_config")
      .upsert(
        {
          institute_id,
          report_id: reportId,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          config: merged as any,
        },
        { onConflict: "institute_id,report_id" },
      );

    if (error) {
      console.error("Error guardando config:", error);
      toast.error("No se pudo guardar la configuración");
      setSaving(false);
      return false;
    }

    setConfig(merged);
    toast.success("Configuración guardada");
    setSaving(false);
    return true;
  };

  // ── Restablecer defaults ─────────────────────────────────────────────────
  const reset = async () => {
    return save(REPORT_CONFIG_DEFAULTS[reportId] as Partial<Config>);
  };

  return { config, loading, saving, save, reset, reload: load };
}
