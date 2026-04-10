export const metrics = {
    students: 420,
    teachers: 28,
    groups: 12,
    paymentsPending: 9,
}

export const rows = [
    { name: "Juan López", role: "Estudiante", group: "G1", status: "Activo" },
    { name: "Ana Gómez", role: "Docente", group: "G2", status: "Pendiente" },
    { name: "Luis Fernández", role: "Estudiante", group: "G3", status: "Activo" },
    { name: "María Pérez", role: "Admin", group: "G1", status: "Activo" },
    { name: "Carlos Díaz", role: "Estudiante", group: "G2", status: "Suspendido" },
    { name: "Sofía Cruz", role: "Estudiante", group: "G4", status: "Activo" },
    { name: "Elena Ruiz", role: "Docente", group: "G1", status: "Pendiente" },
    { name: "Andrés Ríos", role: "Estudiante", group: "G3", status: "Activo" },
    { name: "Lucía Mora", role: "Estudiante", group: "G2", status: "Activo" },
    { name: "Diego Silva", role: "Docente", group: "G4", status: "Suspendido" },
] as { name: string; role: string; group: string; status: "Activo" | "Pendiente" | "Suspendido" }[]