/**
 * Redirects the browser to the given path in the current tab (_self).
 * @param path The URL or path to redirect to.
 */
export function goToPath(path: string) {
    if (typeof window !== "undefined") {
        window.open(path, "_self");
    }
}