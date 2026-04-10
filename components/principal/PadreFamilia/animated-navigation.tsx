"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronRight, Home, BookOpen, Calendar, Bell, User, FileText, CreditCard, Clock, LogOut } from "lucide-react"
import { CloseSession } from "@/components/function/RedirectHomeRoll/CloseSession"

interface AnimatedNavigationProps {
    activeSection: string
    onNavigationChange: (section: string) => void
    language: string
}

const navigationItems = [
    { id: "dashboard", icon: Home, labelEs: "Inicio", labelEn: "Dashboard" },
    { id: "grades", icon: BookOpen, labelEs: "Calificaciones", labelEn: "Grades" },
    { id: "homework", icon: Clock, labelEs: "Tareas", labelEn: "Homework" },
    { id: "schedule", icon: Calendar, labelEs: "Horarios", labelEn: "Schedule" },
    { id: "calendar", icon: Calendar, labelEs: "Calendario", labelEn: "Calendar" },
    { id: "payments", icon: CreditCard, labelEs: "Pagos", labelEn: "Payments" },
    { id: "notifications", icon: Bell, labelEs: "Notificaciones", labelEn: "Notifications" },
    { id: "documents", icon: FileText, labelEs: "Documentos", labelEn: "Documents" },
    { id: "profile", icon: User, labelEs: "Perfil", labelEn: "Profile" },
    { id: "signout", icon: LogOut, labelEs: "Cerrar Sesión", labelEn: "Sign Out" },
]



export function AnimatedNavigation({ activeSection, onNavigationChange, language }: AnimatedNavigationProps) {
    const [hoveredItem, setHoveredItem] = useState<string | null>(null)
    const isSpanish = language === "es"

    return (
        <nav className="space-y-2 p-4">
            {navigationItems.map((item) => {
                const Icon = item.icon
                const isActive = activeSection === item.id
                const isHovered = hoveredItem === item.id

                return (
                    <motion.div
                        key={item.id}
                        className="relative"
                        onHoverStart={() => setHoveredItem(item.id)}
                        onHoverEnd={() => setHoveredItem(null)}
                        onClick={() => {
                            if (item.id == 'signout') { CloseSession() }
                        }}
                    >
                        <motion.button
                            onClick={() => onNavigationChange(item.id)}
                            className={`
                w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-all duration-200
                ${isActive
                                    ? "bg-primary text-primary-foreground shadow-md"
                                    : "hover:bg-accent hover:text-accent-foreground"
                                }
              `}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <motion.div
                                animate={{
                                    rotate: isActive ? 360 : 0,
                                    scale: isActive ? 1.1 : 1,
                                }}
                                transition={{ duration: 0.3 }}
                            >
                                <Icon className="h-5 w-5" />
                            </motion.div>

                            <span className="font-medium">{isSpanish ? item.labelEs : item.labelEn}</span>

                            <AnimatePresence>
                                {(isActive || isHovered) && (
                                    <motion.div
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -10 }}
                                        transition={{ duration: 0.2 }}
                                        className="ml-auto"
                                    >
                                        <ChevronRight className="h-4 w-4" />
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.button>

                        {/* Active indicator */}
                        <AnimatePresence>
                            {isActive && (
                                <motion.div
                                    initial={{ scaleY: 0 }}
                                    animate={{ scaleY: 1 }}
                                    exit={{ scaleY: 0 }}
                                    className="absolute left-0 top-0 w-1 h-full bg-primary rounded-r-full"
                                    style={{ originY: 0.5 }}
                                />
                            )}
                        </AnimatePresence>
                    </motion.div>
                )
            })}
        </nav>
    )
}
