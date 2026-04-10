"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

interface Subject {
    id: string
    name: string
    teacher: string
    grade: number
    progress: number
    color: string
    nextClass: string
    assignments: number
}

interface AnimatedSubjectCardProps {
    subject: Subject
    index: number
    onClick: () => void
}

export function AnimatedSubjectCard({ subject, index, onClick }: AnimatedSubjectCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            whileHover={{ scale: 1.02, y: -5 }}
            whileTap={{ scale: 0.98 }}
        >
            <Card
                className="cursor-pointer hover:shadow-lg transition-all duration-300 border-l-4"
                style={{ borderLeftColor: subject.color }}
                onClick={onClick}
            >
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-lg font-semibold">{subject.name}</CardTitle>
                        <Badge
                            variant="secondary"
                            className="text-xs"
                            style={{ backgroundColor: `${subject.color}20`, color: subject.color }}
                        >
                            {subject.grade.toFixed(1)}
                        </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{subject.teacher}</p>
                </CardHeader>

                <CardContent className="space-y-3">
                    <div>
                        <div className="flex justify-between text-sm mb-1">
                            <span>Progreso</span>
                            <span>{subject.progress}%</span>
                        </div>
                        <Progress value={subject.progress} className="h-2" />
                    </div>

                    <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">Próxima clase:</span>
                        <span className="font-medium">{subject.nextClass}</span>
                    </div>

                    {subject.assignments > 0 && (
                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
                            <span className="text-sm text-orange-600">
                                {subject.assignments} tarea{subject.assignments > 1 ? "s" : ""} pendiente
                                {subject.assignments > 1 ? "s" : ""}
                            </span>
                        </motion.div>
                    )}
                </CardContent>
            </Card>
        </motion.div>
    )
}
