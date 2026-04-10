import { ManagmentStorage } from "@/components/Services/ManagmentStorage/ManagmentStorage";
import { goToPath } from "./GoToPath";

export function readRoles(): string[] {
  const raw = ManagmentStorage.getItem("rollsName"); // puede ser null, string JSON o csv
  if (!raw) return [];

  // 1) Si viene como JSON: '["SuperAdmin","Docente"]'
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed.map(String);
  } catch (_) {}

  // 2) Si viene como CSV: 'SuperAdmin,Docente'
  return String(raw)
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export const RedirectHomeRoll = () => {
  const roles = readRoles();
  const firstRole = roles[0] || "";
  console.log("RedirectHomeRoll - firstRole:", firstRole);
  switch (firstRole) {
    case "SuperAdmin":
      goToPath("/usuario/super-admin");
      break;
    case "Acudiente/Padre":
      goToPath("/usuario/padre-familia");
      break;
    case "padreAspirante":
      goToPath("/usuario/padre-aspirante");
      break;
    case "Docente":
      goToPath("/usuario/profesor");
      break;
    case "Administrativo":
      goToPath("/usuario/administrativo");
      break;
    case "Estudiante":
      goToPath("/usuario/estudiante");
      break;
    // agrega otros casos si quieres
    default:
      break;
  }
};
