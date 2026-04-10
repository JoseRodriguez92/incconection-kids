// components/ui/Modal.tsx
"use client"
import { ModalPortal } from "./ModalPortal"

export function Modal({
    open,
    onClose,
    title,
    children,
}: {
    open: boolean
    onClose: () => void
    title?: string
    children: React.ReactNode
}) {
    if (!open) return null
    return (
        <ModalPortal>
            <div
                className="fixed inset-0 z-[1000] flex items-center justify-center"
                aria-modal="true"
                role="dialog"
            >
                {/* Backdrop */}
                <button
                    aria-label="Cerrar modal"
                    onClick={onClose}
                    className="absolute inset-0 bg-black/40"
                />
                {/* Card glass */}
                <div className="relative mx-4 w-full max-w-lg rounded-2xl border border-white/20 bg-white/10 p-6 backdrop-blur-xl shadow-2xl">
                    <div className="mb-4 flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-white">{title}</h3>
                        <button
                            onClick={onClose}
                            className="rounded-full border border-white/30 px-3 py-1 text-sm text-white/90 hover:bg-white/10"
                        >
                            Cerrar
                        </button>
                    </div>
                    <div className="text-white/90">{children}</div>
                </div>
            </div>
        </ModalPortal>
    )
}


