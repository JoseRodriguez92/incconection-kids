import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  GraduationCap,
  BookOpen,
  Heart,
  ShieldCheck,
  Briefcase,
  Brain,
  Bus,
  ShoppingBag,
  Award,
  Settings,
  Users,
  Edit,
  type LucideIcon,
} from "lucide-react";

interface RoleCardProps {
  role: {
    id: number;
    name: string;
    slug: string;
    users_count: Array<{ count: string }>;
  };
  onAssignUsers?: (role: any) => void;
  onEdit?: (roleId: number) => void;
}

type RoleConfig = {
  icon: LucideIcon;
  colorText: string;
  colorBg: string;
  borderColor: string;
  label: string;
};

const roleConfigMap: Record<string, RoleConfig> = {
  "super-admin": {
    icon: ShieldCheck,
    colorText: "text-rose-600",
    colorBg: "bg-rose-50 dark:bg-rose-950/30",
    borderColor: "border-l-rose-500",
    label: "Administración total",
  },
  administrativo: {
    icon: Briefcase,
    colorText: "text-indigo-600",
    colorBg: "bg-indigo-50 dark:bg-indigo-950/30",
    borderColor: "border-l-indigo-500",
    label: "Gestión institucional",
  },
  profesor: {
    icon: GraduationCap,
    colorText: "text-blue-600",
    colorBg: "bg-blue-50 dark:bg-blue-950/30",
    borderColor: "border-l-blue-500",
    label: "Docente",
  },
  estudiante: {
    icon: BookOpen,
    colorText: "text-emerald-600",
    colorBg: "bg-emerald-50 dark:bg-emerald-950/30",
    borderColor: "border-l-emerald-500",
    label: "Académico",
  },
  "padre-familia": {
    icon: Heart,
    colorText: "text-purple-600",
    colorBg: "bg-purple-50 dark:bg-purple-950/30",
    borderColor: "border-l-purple-500",
    label: "Familia",
  },
  psicologia: {
    icon: Brain,
    colorText: "text-teal-600",
    colorBg: "bg-teal-50 dark:bg-teal-950/30",
    borderColor: "border-l-teal-500",
    label: "Bienestar estudiantil",
  },
  ruta: {
    icon: Bus,
    colorText: "text-amber-600",
    colorBg: "bg-amber-50 dark:bg-amber-950/30",
    borderColor: "border-l-amber-500",
    label: "Transporte escolar",
  },
  tienda: {
    icon: ShoppingBag,
    colorText: "text-orange-600",
    colorBg: "bg-orange-50 dark:bg-orange-950/30",
    borderColor: "border-l-orange-500",
    label: "Tienda",
  },
  coordinadora: {
    icon: Award,
    colorText: "text-pink-600",
    colorBg: "bg-pink-50 dark:bg-pink-950/30",
    borderColor: "border-l-pink-500",
    label: "Coordinación académica",
  },
};

const defaultConfig: RoleConfig = {
  icon: Settings,
  colorText: "text-slate-500",
  colorBg: "bg-slate-50 dark:bg-slate-800/30",
  borderColor: "border-l-slate-400",
  label: "Rol del sistema",
};

export const RoleCard = ({ role, onAssignUsers, onEdit }: RoleCardProps) => {
  const userCount = parseInt(role.users_count[0]?.count ?? "0");
  const config = roleConfigMap[role.slug.toLowerCase()] ?? defaultConfig;
  const Icon = config.icon;

  return (
    <Card
      className={`border-l-4 ${config.borderColor} hover:shadow-md transition-all duration-200 group`}
    >
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          {/* Icon */}
          <div
            className={`shrink-0 w-11 h-11 rounded-xl ${config.colorBg} flex items-center justify-center`}
          >
            <Icon className={`w-5 h-5 ${config.colorText}`} />
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm text-foreground leading-tight">
              {role.name}
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              {config.label}{" "}
              <span className="font-mono opacity-60">· {role.slug}</span>
            </p>
          </div>

          {/* User count */}
          <div className="shrink-0 flex flex-col items-center min-w-[3rem]">
            <span
              className={`text-xl font-bold leading-none tabular-nums ${
                userCount > 0 ? config.colorText : "text-muted-foreground/40"
              }`}
            >
              {userCount}
            </span>
            <span className="text-[10px] text-muted-foreground mt-0.5 uppercase tracking-wide">
              {userCount === 1 ? "usuario" : "usuarios"}
            </span>
          </div>

          {/* Actions */}
          {(onAssignUsers || onEdit) && (
            <div className="shrink-0 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
              {onAssignUsers && (
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 gap-1.5 text-xs"
                  onClick={() => onAssignUsers(role)}
                >
                  <Users className="w-3.5 h-3.5" />
                  Asignar
                </Button>
              )}
              {onEdit && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => onEdit(role.id)}
                >
                  <Edit className="w-3.5 h-3.5" />
                </Button>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
