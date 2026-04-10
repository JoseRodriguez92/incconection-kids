"use client";

import { CreditCard, Wrench } from "lucide-react";

interface PaymentsContentProps {
  language: string;
  activeStudent: any;
}

export function PaymentsContent({ language: _language, activeStudent: _activeStudent }: PaymentsContentProps) {
  return (
    <div className="flex flex-1 items-center justify-center h-full p-8">
      <div className="flex flex-col items-center gap-5 text-center max-w-sm">
        {/* Icono animado */}
        <div className="relative w-20 h-20">
          <div className="absolute inset-0 rounded-2xl bg-amber-100 dark:bg-amber-950/40 animate-pulse" />
          <div className="relative w-20 h-20 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 flex items-center justify-center">
            <CreditCard className="w-8 h-8 text-amber-500" />
            <span className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-amber-500 flex items-center justify-center">
              <Wrench className="w-3 h-3 text-white" />
            </span>
          </div>
        </div>

        {/* Texto */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-500 opacity-75" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-amber-500" />
              </span>
              Próximamente
            </span>
          </div>
          <h2 className="text-lg font-bold">Módulo de Pagos</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Estamos trabajando en esta sección. Pronto podrás consultar el
            estado de pagos, historial y obligaciones desde aquí.
          </p>
        </div>
      </div>
    </div>
  );
}
