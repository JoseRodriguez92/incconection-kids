import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit } from "lucide-react";
import { ConditionBadges } from "@/components/ui/ConditionBadges";

interface UserCardProps {
  user: {
    id: string;
    full_name?: string | null;
    email?: string | null;
    avatar_url?: string | null;
    conditions?: Array<{ learning_condition: { id: string; name: string; color: string | null } }>;
    roles?: Array<{ id: string; name: string }>;
  };
  onEdit?: (userId: string) => void;
}

const getRoleBadgeColor = (roleName: string) => {
  const colors: Record<string, string> = {
    "super-admin": "bg-red-100 text-red-700 border-red-300",
    profesor: "bg-blue-100 text-blue-700 border-blue-300",
    estudiante: "bg-green-100 text-green-700 border-green-300",
    "padre-familia": "bg-purple-100 text-purple-700 border-purple-300",
    tienda: "bg-orange-100 text-orange-700 border-orange-300",
    psicologia: "bg-pink-100 text-pink-700 border-pink-300",
    ruta: "bg-yellow-100 text-yellow-700 border-yellow-300",
  };
  return colors[roleName] || "bg-gray-100 text-gray-700 border-gray-300";
};

export const UserCard = ({ user, onEdit }: UserCardProps) => {
  return (
    <div className="flex items-center justify-between p-4 border rounded-lg hover:shadow-md transition-shadow duration-200">
      <div className="flex items-center space-x-3 flex-1">
        <Avatar>
          <AvatarImage src={user.avatar_url || "/placeholder.svg"} />
          <AvatarFallback>
            {user.full_name?.charAt(0)?.toUpperCase() ||
              user.email?.charAt(0)?.toUpperCase() ||
              "U"}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="font-medium">{user.full_name || "Sin nombre"}</div>
          <div className="text-sm text-muted-foreground truncate">
            {user.email}
          </div>
          {user.roles && user.roles.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {user.roles.map((role) => (
                <Badge
                  key={role.id}
                  variant="outline"
                  className={`text-xs ${getRoleBadgeColor(role.name)}`}
                >
                  {role.name}
                </Badge>
              ))}
            </div>
          )}
          {(!user.roles || user.roles.length === 0) && (
            <Badge variant="outline" className="text-xs mt-2 bg-gray-50 text-gray-500">
              Sin rol asignado
            </Badge>
          )}
          <ConditionBadges
            conditions={user.conditions?.map((c) => c.learning_condition)}
            className="mt-1"
          />
        </div>
      </div>
      {onEdit && (
        <div className="flex items-center space-x-3">
          <Button variant="ghost" size="sm" onClick={() => onEdit(user.id)}>
            <Edit className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  );
};
