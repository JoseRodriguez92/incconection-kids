import type { Profile } from "@/Stores/profilesStore";
import type { AdminEnrolled } from "@/Stores/adminEnrolledStore";

export interface EnrolledWithProfile extends AdminEnrolled {
  profile: Profile | null;
}

/**
 * Filtra usuarios por nombre o email
 */
export const filterUsersBySearch = (
  users: any[],
  searchTerm: string
): any[] => {
  if (!searchTerm) return users;

  const searchLower = searchTerm.toLowerCase();
  return users.filter(
    (user) =>
      user.full_name?.toLowerCase().includes(searchLower) ||
      user.email?.toLowerCase().includes(searchLower)
  );
};

/**
 * Filtra usuarios enrolled por búsqueda y periodo académico
 */
export const filterEnrolledUsers = (
  enrolled: EnrolledWithProfile[],
  searchTerm: string,
  periodId: string
): EnrolledWithProfile[] => {
  return enrolled.filter((item) => {
    // Filtro de búsqueda por texto
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      item.profile?.full_name?.toLowerCase().includes(searchLower) ||
      item.profile?.email?.toLowerCase().includes(searchLower) ||
      item.user_id?.toLowerCase().includes(searchLower);

    // Filtro por periodo académico
    const matchesPeriod =
      periodId === "todos" || item.academic_period_id === periodId;

    return matchesSearch && matchesPeriod;
  });
};

/**
 * Obtiene usuarios disponibles (no asignados a un rol)
 */
export const getAvailableUsers = (
  allUsers: Profile[],
  assignedUsers: Profile[]
): Profile[] => {
  return allUsers.filter(
    (profile) => !assignedUsers.some((assigned) => assigned.id === profile.id)
  );
};

/**
 * Enriquece enrolled con información de profiles
 */
export const enrichEnrolledWithProfiles = (
  enrolled: AdminEnrolled[],
  profiles: Profile[]
): EnrolledWithProfile[] => {
  return enrolled.map((item) => {
    const profile = profiles.find((p) => p.id === item.user_id);
    return {
      ...item,
      profile: profile || null,
    };
  });
};
