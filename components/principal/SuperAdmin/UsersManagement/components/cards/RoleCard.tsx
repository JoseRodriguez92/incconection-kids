import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Settings, Users, Edit } from "lucide-react";

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

export const RoleCard = ({ role, onAssignUsers, onEdit }: RoleCardProps) => {
  const userCount = parseInt(role.users_count[0].count);
  const hasUsers = userCount > 0;

  return (
    <div className="flex items-center justify-between p-4 border rounded-lg hover:shadow-md transition-shadow duration-200">
      <div className="flex items-center space-x-4">
        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
          <Settings className="w-5 h-5 text-primary" />
        </div>
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-1">
            <h3 className="font-semibold text-foreground">{role.name}</h3>
            <Badge variant="secondary" className="text-xs">
              Rol del Sistema
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">{role.slug}</p>
        </div>
      </div>
      <div className="flex items-center space-x-4">
        <div className="flex space-x-3">
          <div className="text-center">
            <div
              className={`text-sm font-semibold ${
                hasUsers ? "text-green-600" : "text-red-500"
              }`}
            >
              {userCount}
            </div>
            <div
              className={`text-xs ${
                hasUsers ? "text-green-600" : "text-red-500"
              }`}
            >
              Usuarios
            </div>
          </div>
        </div>
        <div className="flex space-x-2">
          {onAssignUsers && (
            <Button
              variant="outline"
              size="sm"
              className="bg-transparent hover:bg-primary hover:text-primary-foreground"
              onClick={() => onAssignUsers(role)}
            >
              <Users className="w-4 h-4 mr-2" />
              Asignar
            </Button>
          )}
          {onEdit && (
            <Button
              variant="ghost"
              size="sm"
              className="hover:bg-muted"
              onClick={() => onEdit(role.id)}
            >
              <Edit className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
