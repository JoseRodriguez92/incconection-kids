export interface UserFormData {
  email: string;
  password: string;
  role_id: string;
  first_name: string;
  last_name: string;
  phone: string;
  document_type: string;
  document_number: string;
}

export interface RoleItem {
  id: string;
  name: string;
}

export interface ConditionItem {
  id: string;
  name: string;
  color: string | null;
}

export const EMPTY_FORM: UserFormData = {
  email: "",
  password: "",
  role_id: "",
  first_name: "",
  last_name: "",
  phone: "",
  document_type: "",
  document_number: "",
};

export const getRoleBadgeColor = (roleName: string): string => {
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
