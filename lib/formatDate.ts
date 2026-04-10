
export function formatDate(iso: string) {
    try {
        return new Date(iso).toLocaleDateString("es-CO", { year: "numeric", month: "short", day: "2-digit" })
    } catch {
        return iso
    }
}