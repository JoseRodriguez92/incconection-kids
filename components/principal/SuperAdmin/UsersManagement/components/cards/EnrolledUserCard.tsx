import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";
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
  return (
    <div className="flex items-center justify-between p-4 border rounded-lg hover:shadow-md transition-shadow duration-200">
      <div className="flex items-center space-x-3">
        <Avatar>
          <AvatarImage src={profile?.avatar_url || "/placeholder.svg"} />
          <AvatarFallback>
            {profile?.full_name?.charAt(0)?.toUpperCase() ||
              profile?.email?.charAt(0)?.toUpperCase() ||
              "U"}
          </AvatarFallback>
        </Avatar>
        <div>
          <div className="font-medium">
            {profile?.full_name || "Sin nombre"}
          </div>
          <div className="text-sm text-muted-foreground">
            {profile?.email || "Sin correo"}
          </div>
          {profile?.phone && (
            <div className="text-xs text-muted-foreground">
              Tel: {profile.phone}
            </div>
          )}
          <div className="text-xs text-muted-foreground mt-1">
            Periodo: {periodName} • Matriculado:{" "}
            {new Date(enrolled.enrolled_at).toLocaleDateString()}
          </div>
          <ConditionBadges
            conditions={(profile as any)?.conditions?.map((c: any) => c.learning_condition)}
            className="mt-1"
          />
        </div>
      </div>
      <div className="flex items-center space-x-3">
        {isStudent && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onAssignParent?.(enrolled.user_id)}
          >
            <UserPlus className="w-4 h-4 mr-1" />
            Asignar Padre
          </Button>
        )}
        <Badge
          variant={enrolled.is_active ? "default" : "secondary"}
          className={enrolled.is_active ? "bg-green-500" : ""}
        >
          {enrolled.is_active ? "Activo" : "Inactivo"}
        </Badge>
      </div>
    </div>
  );
};
