import { HeartHandshake } from "lucide-react";

interface Condition {
  id: string;
  name: string;
  color?: string | null;
}

interface ConditionBadgesProps {
  conditions?: Condition[] | null;
  className?: string;
}

export function ConditionBadges({ conditions, className }: ConditionBadgesProps) {
  if (!conditions || conditions.length === 0) return null;

  return (
    <div className={`flex flex-wrap gap-1 ${className ?? ""}`}>
      {conditions.map((c) => (
        <span
          key={c.id}
          className={`inline-flex items-center gap-1 text-xs font-medium rounded-full px-2 py-0.5 border ${
            !c.color ? "bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-950 dark:text-violet-300 dark:border-violet-800" : ""
          }`}
          style={
            c.color
              ? { backgroundColor: `${c.color}18`, color: c.color, borderColor: `${c.color}55` }
              : undefined
          }
        >
          <HeartHandshake className="w-3 h-3 shrink-0" />
          {c.name}
        </span>
      ))}
    </div>
  );
}
