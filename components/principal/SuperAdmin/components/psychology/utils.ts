export const getStatusBadgeColor = (status: string) => {
  switch (status?.toLowerCase()) {
    case "activo":
    case "active":
    case "open":
      return "bg-blue-100 text-blue-800";
    case "en seguimiento":
    case "seguimiento":
    case "in_followup":
      return "bg-yellow-100 text-yellow-800";
    case "cerrado":
    case "closed":
      return "bg-green-100 text-green-800";
    case "pendiente":
    case "pending":
      return "bg-orange-100 text-orange-800";
    case "archived":
      return "bg-gray-100 text-gray-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

export const getRiskLevelColor = (level: string) => {
  switch (level?.toLowerCase()) {
    case "alto":
    case "high":
      return "bg-red-100 text-red-800";
    case "medio":
    case "medium":
      return "bg-yellow-100 text-yellow-800";
    case "bajo":
    case "low":
      return "bg-green-100 text-green-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

export const getConfidentialityColor = (level: string) => {
  switch (level?.toLowerCase()) {
    case "high":
    case "alto":
      return "bg-purple-100 text-purple-800";
    case "medium":
    case "normal":
      return "bg-blue-100 text-blue-800";
    case "low":
    case "bajo":
      return "bg-slate-100 text-slate-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

export const translateStatus = (status: string) => {
  switch (status?.toLowerCase()) {
    case "open":
      return "Abierto";
    case "in_followup":
      return "En Seguimiento";
    case "closed":
      return "Cerrado";
    case "archived":
      return "Archivado";
    default:
      return status || "N/A";
  }
};

export const translateConfidentiality = (level: string) => {
  switch (level?.toLowerCase()) {
    case "high":
      return "Alta";
    case "medium":
      return "Normal";
    case "low":
      return "Baja";
    default:
      return level || "N/A";
  }
};

export const formatDate = (dateString: string | null | undefined): string => {
  if (!dateString) return "N/A";
  const dateOnly = dateString.split("T")[0];
  const [year, month, day] = dateOnly.split("-");
  return `${day}/${month}/${year}`;
};
