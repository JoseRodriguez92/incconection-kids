import { ManagmentStorage } from "@/components/Services/ManagmentStorage/ManagmentStorage"
import { goToPath } from "./GoToPath";

export const CloseSession = () => {
    // Limpiar el storage
    ManagmentStorage.clear();

    // Limpiar todas las cookies
    document.cookie.split(";").forEach((cookie) => {
        const name = cookie.split("=")[0].trim();
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    });

    // Redirigir a la página principal
    goToPath('/')
}

