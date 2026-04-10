// @ts-nocheck
/* eslint-disable */
import Login from "@/components/principal/Login/Login";

export default function Home() {
  return (
    <main className="min-h-screen w-full flex flex-col lg:flex-row items-center">
      {/* Sección del Login - Izquierda en desktop */}
      <div className="w-full h-screen lg:w-1/2 flex items-center justify-center p-4 lg:p-8 bg-gradient-to-br from-teal-50/50 via-cyan-50/30 to-emerald-50/40">
        <Login />
      </div>

      {/* Sección de la Imagen - Derecha en desktop (oculta en móvil) */}
      <div className="hidden lg:flex w-1/2 items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="w-full">
          <img
            src="/inccalion/inccalion2.png"
            alt="Incconection Kids"
            className="w-full h-auto object-cover"
          />
        </div>
      </div>
    </main>
  );
}
