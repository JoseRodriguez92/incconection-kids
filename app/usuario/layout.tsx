"use client";
// app/super-admin/layout.tsx
import { useEffect, useState, type ReactNode } from "react";
import "./page.module.css"; // o './styles.css'
import BackgroundSuperAdmin from "@/components/seconders/backgroundSuperAdmin/BackgroundSuperAdmin";
import { ManagmentStorage } from "@/components/Services/ManagmentStorage/ManagmentStorage";
import UnicornScene from "unicornstudio-react/next";

export default function LayoutUser({ children }: { children: ReactNode }) {
  return (
    <>
      <BackgroundSuperAdmin />
      {children}
    </>
  );
}
