import { cn } from "@/lib/utils";

interface ActiveBadgeProps {
  active: boolean;
  className?: string;
  labelActive?: string;
  labelInactive?: string;
}

export function ActiveBadge({
  active,
  className,
  labelActive = "Activo",
  labelInactive = "Inactivo",
}: ActiveBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-semibold select-none",
        active
          ? "bg-green-100 text-green-700 dark:bg-green-950/60 dark:text-green-400"
          : "bg-red-100 text-red-600 dark:bg-red-950/60 dark:text-red-400",
        className,
      )}
    >
      <span className="relative flex h-2 w-2 shrink-0">
        {active && (
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75" />
        )}
        <span
          className={cn(
            "relative inline-flex rounded-full h-2 w-2",
            active ? "bg-green-500" : "bg-red-500",
          )}
        />
      </span>
      {active ? labelActive : labelInactive}
    </span>
  );
}
