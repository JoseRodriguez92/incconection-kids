-- ============================================================
-- report_config
-- Configuración persistente por reporte por institución.
-- Una fila por (institute_id, report_id).
-- ============================================================

CREATE TABLE IF NOT EXISTS public.report_config (
  id            UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  institute_id  UUID        NOT NULL REFERENCES public.institute(id) ON DELETE CASCADE,
  report_id     TEXT        NOT NULL,   -- "students-report" | "attendance-report" | etc.
  config        JSONB       NOT NULL DEFAULT '{}',
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT report_config_unique UNIQUE (institute_id, report_id)
);

-- ── Índice para búsquedas por instituto ──────────────────────
CREATE INDEX IF NOT EXISTS idx_report_config_institute
  ON public.report_config (institute_id);

-- ── Trigger: actualiza updated_at automáticamente ───────────
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_report_config_updated_at ON public.report_config;
CREATE TRIGGER trg_report_config_updated_at
  BEFORE UPDATE ON public.report_config
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ── RLS ─────────────────────────────────────────────────────
ALTER TABLE public.report_config ENABLE ROW LEVEL SECURITY;

-- Solo usuarios autenticados pueden leer/escribir configs de su propio instituto.
-- Ajusta según tu modelo de permisos (actualmente el proyecto usa institute_id del store).
CREATE POLICY "report_config_select" ON public.report_config
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "report_config_insert" ON public.report_config
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "report_config_update" ON public.report_config
  FOR UPDATE USING (auth.role() = 'authenticated');

-- ── Seed: configs vacías para los 6 reportes ────────────────
-- (Opcional: corre esto después de crear tu primer instituto)
-- INSERT INTO public.report_config (institute_id, report_id, config)
-- VALUES
--   ('<institute_id>', 'students-report',    '{}'),
--   ('<institute_id>', 'attendance-report',  '{}'),
--   ('<institute_id>', 'grades-report',      '{}'),
--   ('<institute_id>', 'teachers-report',    '{}'),
--   ('<institute_id>', 'psychology-report',  '{}'),
--   ('<institute_id>', 'events-report',      '{}');
