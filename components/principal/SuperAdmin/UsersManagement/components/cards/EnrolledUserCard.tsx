import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, UserPlus } from "lucide-react";
import { ConditionBadges } from "@/components/ui/ConditionBadges";
import type { Profile } from "@/Stores/profilesStore";
import type { EnrolledWithProfile } from "../../utils/filters";

interface EnrolledUserCardProps {
  enrolled: EnrolledWithProfile;
  profile: Profile | null;
  periodName: string;
  isStudent?: boolean;
  onAssignParent?: (studentId: string) => void;
}

export const EnrolledUserCard = ({
  enrolled,
  profile,
  periodName,
  isStudent,
  onAssignParent,
}: EnrolledUserCardProps) => {
  const initials =
    profile?.full_name?.charAt(0)?.toUpperCase() ||
    profile?.email?.charAt(0)?.toUpperCase() ||
    "U";

  return (
    <div className="border rounded-xl p-4 space-y-3 hover:shadow-md transition-shadow duration-200">
      {/* Top row: avatar + info + badge */}
      <div className="flex items-start gap-3">
        <Avatar className="w-10 h-10 shrink-0">
          <AvatarImage src={profile?.avatar_url || "/placeholder.svg"} />
          <AvatarFallback className="text-sm font-medium">{initials}</AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm text-foreground truncate">
            {profile?.full_name || "Sin nombre"}
          </p>
          <p className="text-xs text-muted-foreground truncate">
            {profile?.email || "Sin correo"}
          </p>
          {profile?.phone && (
            <p className="text-xs text-muted-foreground">Tel: {profile.phone}</p>
          )}
          <ConditionBadges
            conditions={(profile as any)?.conditions?.map((c: any) => c.learning_condition)}
            className="mt-1"
          />
        </div>

        <Badge
          variant={enrolled.is_active ? "default" : "secondary"}
          className={`shrink-0 text-xs ${enrolled.is_active ? "bg-green-500" : ""}`}
        >
          {enrolled.is_active ? "Activo" : "Inactivo"}
        </Badge>
      </div>

      {/* Bottom row: period info + action */}
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs text-muted-foreground flex items-center gap-1">
          <Calendar className="w-3 h-3 shrink-0" />
          <span className="truncate">
            {periodName} · {new Date(enrolled.enrolled_at).toLocaleDateString()}
          </span>
        </p>

        {isStudent && (
          <Button
            variant="outline"
            size="sm"
            className="shrink-0 h-7 text-xs gap-1"
            onClick={() => onAssignParent?.(enrolled.user_id)}
          >
            <UserPlus className="w-3.5 h-3.5" />
            Asignar Padre
          </Button>
        )}
      </div>
    </div>
  );
};
