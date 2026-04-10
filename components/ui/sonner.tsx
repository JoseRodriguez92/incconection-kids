"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner, ToasterProps } from "sonner"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      toastOptions={{
        unstyled: false,
        classNames: {
          toast: "group toast group-[.toaster]:bg-white/90 group-[.toaster]:backdrop-blur-xl group-[.toaster]:border group-[.toaster]:border-white/30 group-[.toaster]:shadow-2xl group-[.toaster]:rounded-2xl group-[.toaster]:p-5",
          description: "group-[.toast]:text-sm group-[.toast]:mt-1.5 group-[.toast]:opacity-90",
          title: "group-[.toast]:text-base group-[.toast]:font-semibold group-[.toast]:tracking-tight",
          error: "!bg-gradient-to-br !from-red-50 !to-rose-50 !border !border-red-200 !text-red-800 [&_[data-description]]:!text-red-700",
          success: "!bg-gradient-to-br !from-emerald-50 !to-green-50 !border !border-emerald-200 !text-emerald-800 [&_[data-description]]:!text-emerald-700",
          warning: "!bg-gradient-to-br !from-amber-50 !to-yellow-50 !border !border-amber-200 !text-amber-800 [&_[data-description]]:!text-amber-700",
          info: "!bg-gradient-to-br !from-sky-50 !to-blue-50 !border !border-sky-200 !text-sky-800 [&_[data-description]]:!text-sky-700",
        },
      }}
      position="top-right"
      expand={true}
      richColors={false}
      {...props}
    />
  )
}

export { Toaster }
