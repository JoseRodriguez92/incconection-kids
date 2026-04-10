// components/ui/ModalPortal.tsx
"use client"
import { useEffect, useState } from "react"
import { createPortal } from "react-dom"

export function ModalPortal({ children }: { children: React.ReactNode }) {
    const [mounted, setMounted] = useState(false)
    const [el, setEl] = useState<HTMLElement | null>(null)

    useEffect(() => {
        setMounted(true)
        let target = document.getElementById("portal-root")
        if (!target) {
            target = document.createElement("div")
            target.id = "portal-root"
            document.body.appendChild(target)
        }
        setEl(target)
    }, [])

    if (!mounted || !el) return null
    return createPortal(children, el)
}