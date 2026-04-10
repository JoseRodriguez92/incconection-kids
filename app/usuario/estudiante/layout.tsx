import type React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "./app-sidebar";
import { StudentContextProvider } from "@/components/providers/StudentContextProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Campus Virtual - Perfil Estudiante",
  description: "Plataforma de aprendizaje universitario",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <StudentContextProvider>
      <SidebarProvider defaultOpen={true}>
        <AppSidebar />
        <div className="flex-1 overflow-auto bg-background">{children}</div>
      </SidebarProvider>
    </StudentContextProvider>
  );
}
