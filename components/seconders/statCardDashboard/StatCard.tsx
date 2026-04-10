"use client"

import { motion } from "framer-motion"
import { type LucideIcon, GraduationCap, UserCog, Users, CreditCard } from "lucide-react"
import { cn } from "@/lib/utils"

const ICONS: Record<string, LucideIcon> = {
    GraduationCap,
    UserCog,
    Users,
    CreditCard,
}

export default function StatCard({
    title = "Título",
    value = 0,
    icon = "Users",
    index = 0,
}: {
    title?: string
    value?: number
    icon?: keyof typeof ICONS | string
    index?: number
}) {
    const Icon = ICONS[icon as keyof typeof ICONS] ?? Users

    return (
        <motion.div
            role="status"
            aria-label={`${title}: ${value}`}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.05 * index, ease: "easeOut" }}
            className={cn(
                "rounded-xl border border-white/20 bg-white/10 backdrop-blur-xl p-4 shadow-xl",
                "dark:bg-black/20 dark:border-white/10",
                "hover:shadow-2xl hover:-translate-y-[2px] transition",
            )}
        >
            <div className="flex items-center justify-between gap-3">
                <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">{title}</p>
                    <p className="text-2xl font-bold tracking-tight">{value}</p>
                </div>
                <div className="rounded-lg border border-white/20 bg-white/10 p-2 dark:border-white/10 dark:bg-white/5">
                    <Icon className="h-5 w-5" />
                </div>
            </div>
        </motion.div>
    )
}
