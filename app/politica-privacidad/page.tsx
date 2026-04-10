import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function PoliticaPrivacidad() {
  return (
    <div className="min-h-screen h-screen overflow-y-auto bg-gradient-to-br from-teal-50 via-white to-blue-50 p-4 sm:p-6 lg:p-8">
      <div className="w-full mx-auto">
        <div className="mb-6 -wmax-content">
          <Link href="/">
            <Button variant="ghost" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Volver al inicio
            </Button>
          </Link>
        </div>

        <Card className="shadow-xl">
          <CardHeader className="space-y-4 pb-6">
            <CardTitle className="text-3xl font-bold text-teal-700 text-center">
              Política de Privacidad
            </CardTitle>

            <p className="text-sm text-muted-foreground text-center leading-relaxed ">
              Esta política describe cómo recopilamos, usamos, almacenamos y
              protegemos los datos personales en nuestras soluciones y
              plataformas. Si no estás de acuerdo con algún punto, por favor
              abstente de usar el servicio o contáctanos.
            </p>

            <div className="text-xs text-muted-foreground text-center">
              Última actualización:{" "}
              <span className="font-medium">Febrero 2026</span>
            </div>
          </CardHeader>

          <CardContent className="space-y-8 text-slate-700">
            {/* 1. Identificación */}
            <section className="space-y-3">
              <h2 className="text-lg font-semibold text-slate-900">
                1. Identificación del Responsable / Encargado
              </h2>
              <p className="leading-relaxed">
                Este servicio es operado por el equipo de{" "}
                <span className="font-semibold">INCCA</span>. Cuando el sistema
                o parte de sus módulos es desarrollado o provisto por un
                tercero, se indicará en la documentación contractual o técnica
                correspondiente. En todo caso, INCCA actúa como
                responsable/encargado del tratamiento según aplique al alcance
                del servicio.
              </p>
            </section>

            {/* 2. Marco legal */}
            <section className="space-y-3">
              <h2 className="text-lg font-semibold text-slate-900">
                2. Marco legal aplicable
              </h2>
              <p className="leading-relaxed">
                Tratamos los datos personales conforme a la legislación
                colombiana vigente, incluyendo la{" "}
                <span className="font-medium">
                  Ley Estatutaria 1581 de 2012
                </span>{" "}
                y sus normas reglamentarias, aplicando principios y garantías
                para la protección de la información.
              </p>
            </section>

            {/* 3. Alcance */}
            <section className="space-y-3">
              <h2 className="text-lg font-semibold text-slate-900">
                3. Alcance
              </h2>
              <p className="leading-relaxed">
                Esta política aplica a la información asociada a los clientes
                (por ejemplo: instituciones educativas y/o empresas
                comerciales), a las bases de datos cargadas o digitadas en la
                plataforma, y a los registros capturados durante el uso del
                sistema (web y/o móvil).
              </p>
            </section>

            {/* 4. Principios */}
            <section className="space-y-3">
              <h2 className="text-lg font-semibold text-slate-900">
                4. Principios para el tratamiento de datos personales
              </h2>

              <ul className="list-disc pl-6 space-y-2 leading-relaxed">
                <li>
                  <span className="font-semibold">Legalidad:</span> el
                  tratamiento se realiza conforme a las disposiciones vigentes y
                  derechos fundamentales aplicables.
                </li>
                <li>
                  <span className="font-semibold">Libertad:</span> los datos se
                  recolectan y tratan con autorización previa, expresa o
                  equivalente, salvo excepciones legales.
                </li>
                <li>
                  <span className="font-semibold">Transparencia:</span> el
                  titular puede solicitar información sobre la existencia, uso y
                  tratamiento de sus datos en cualquier momento.
                </li>
                <li>
                  <span className="font-semibold">
                    Acceso y circulación restringida:
                  </span>{" "}
                  el acceso a los datos se limita a titulares y autorizados,
                  evitando divulgación no permitida.
                </li>
                <li>
                  <span className="font-semibold">Confidencialidad:</span>{" "}
                  quienes acceden o administran la información deben conservarla
                  de forma estrictamente confidencial.
                </li>
              </ul>
            </section>

            {/* 5. Datos que recopilamos */}
            <section className="space-y-3">
              <h2 className="text-lg font-semibold text-slate-900">
                5. Recolección de información
              </h2>
              <p className="leading-relaxed">
                Podemos recopilar datos para prestar, mejorar y optimizar el
                servicio, tales como: datos de identificación y contacto (p. ej.
                nombres, apellidos, correo electrónico), información de
                navegación (p. ej. IP, tipo/versión de navegador), datos
                técnicos y diagnósticos del dispositivo, y registros de uso
                necesarios para la operación del sistema.
              </p>

              <div className="rounded-lg border bg-white/60 p-4">
                <p className="text-sm leading-relaxed">
                  <span className="font-semibold">
                    Ejemplos de datos solicitados:
                  </span>{" "}
                  correo electrónico, nombres y apellidos, cookies y datos
                  técnicos asociados al acceso (web o móvil), entre otros
                  necesarios para soporte, seguridad, notificaciones o
                  continuidad del servicio.
                </p>
              </div>
            </section>

            {/* 6. Ubicación / Transporte (si aplica) */}
            <section className="space-y-3">
              <h2 className="text-lg font-semibold text-slate-900">
                6. Ubicación en segundo plano y monitoreo (si el módulo aplica)
              </h2>
              <p className="leading-relaxed">
                Si tu implementación incluye módulos de transporte/seguimiento,
                el sistema puede permitir el{" "}
                <span className="font-medium">monitoreo en tiempo real</span> de
                vehículos y pasajeros, registrando ubicación incluso en segundo
                plano,{" "}
                <span className="font-medium">
                  solo si el usuario lo autoriza
                </span>
                .
              </p>

              <ul className="list-disc pl-6 space-y-2 leading-relaxed">
                <li>
                  <span className="font-semibold">
                    Usuarios institucionales:
                  </span>{" "}
                  si autorizan el permiso, se usa la ubicación para estimar
                  distancia/tiempos y enviar notificaciones sobre la ruta.
                </li>
                <li>
                  <span className="font-semibold">Monitores o auxiliares:</span>{" "}
                  pueden reportar estado de ruta y ubicación cuando el GPS del
                  vehículo no funciona o no existe hardware instalado, siempre
                  bajo activación del permiso correspondiente.
                </li>
              </ul>

              <p className="text-sm text-muted-foreground leading-relaxed">
                Importante: el uso de ubicación depende de la configuración del
                dispositivo y del consentimiento del usuario. Puedes desactivar
                permisos desde la configuración del sistema operativo.
              </p>
            </section>

            {/* 7. Cookies y tecnologías de seguimiento */}
            <section className="space-y-3">
              <h2 className="text-lg font-semibold text-slate-900">
                7. Datos de seguimiento y cookies
              </h2>

              <p className="leading-relaxed">
                Usamos tecnologías de seguimiento (cookies, etiquetas, scripts)
                para operar el servicio, recordar preferencias, aportar
                seguridad y obtener analítica de uso. Puedes configurar tu
                navegador para rechazar cookies; sin embargo, algunas funciones
                podrían no funcionar correctamente.
              </p>

              <div className="rounded-lg border bg-white/60 p-4">
                <p className="font-semibold text-sm mb-2">
                  Ejemplos de cookies
                </p>
                <ul className="list-disc pl-6 space-y-1 text-sm leading-relaxed">
                  <li>Cookies de inicio de sesión.</li>
                  <li>Cookies de preferencias (recordar ajustes).</li>
                  <li>
                    Cookies de seguridad (protección y prevención de riesgos).
                  </li>
                </ul>
              </div>
            </section>

            {/* 8. Finalidades */}
            <section className="space-y-3">
              <h2 className="text-lg font-semibold text-slate-900">
                8. Uso de los datos
              </h2>
              <ul className="list-disc pl-6 space-y-2 leading-relaxed">
                <li>Proporcionar y mantener el servicio.</li>
                <li>Notificar cambios, eventos o incidencias relevantes.</li>
                <li>Habilitar funciones dinámicas e interactivas.</li>
                <li>
                  Atención al cliente y soporte (incluyendo notificaciones).
                </li>
                <li>
                  Análisis y mejora del servicio (rendimiento, calidad,
                  experiencia).
                </li>
                <li>
                  Monitoreo del uso y prevención/solución de problemas técnicos.
                </li>
                <li>Seguridad, prevención de fraude y cumplimiento legal.</li>
              </ul>
            </section>

            {/* 9. Transferencia */}
            <section className="space-y-3">
              <h2 className="text-lg font-semibold text-slate-900">
                9. Transferencia y almacenamiento de datos
              </h2>
              <p className="leading-relaxed">
                La información puede ser alojada o procesada en infraestructura
                dentro o fuera de Colombia, donde las leyes de protección de
                datos pueden variar. Al usar el servicio, el usuario acepta esta
                transferencia, siempre que existan controles adecuados para
                garantizar seguridad y cumplimiento.
              </p>
            </section>

            {/* 10. Divulgación */}
            <section className="space-y-3">
              <h2 className="text-lg font-semibold text-slate-900">
                10. Divulgación por requerimientos legales
              </h2>
              <p className="leading-relaxed">
                Podemos divulgar datos cuando, de buena fe, consideremos
                necesario para:
              </p>
              <ul className="list-disc pl-6 space-y-2 leading-relaxed">
                <li>
                  Cumplir una obligación legal o requerimiento de autoridad
                  competente.
                </li>
                <li>
                  Proteger derechos o propiedad del responsable del servicio.
                </li>
                <li>
                  Prevenir o investigar irregularidades relacionadas con el
                  servicio.
                </li>
                <li>Proteger la seguridad de usuarios o del público.</li>
                <li>Mitigar responsabilidad legal.</li>
              </ul>
            </section>

            {/* 11. Seguridad */}
            <section className="space-y-3">
              <h2 className="text-lg font-semibold text-slate-900">
                11. Seguridad de la información
              </h2>
              <p className="leading-relaxed">
                Aplicamos medidas técnicas y organizacionales razonables para
                proteger la información. Sin embargo, ningún método de
                transmisión o almacenamiento es 100% seguro, por lo que no
                podemos garantizar seguridad absoluta.
              </p>
            </section>

            {/* 12. Proveedores */}
            <section className="space-y-3">
              <h2 className="text-lg font-semibold text-slate-900">
                12. Proveedores de servicio (terceros)
              </h2>
              <p className="leading-relaxed">
                Podemos emplear terceros para operar infraestructura, analítica
                o funcionalidades relacionadas con el servicio. Estos
                proveedores solo accederán a los datos para cumplir tareas
                asignadas y están obligados a no usarlos para otros fines.
              </p>
            </section>

            {/* 13. Privacidad de menores */}
            <section className="space-y-3">
              <h2 className="text-lg font-semibold text-slate-900">
                13. Privacidad para niños y adolescentes
              </h2>
              <p className="leading-relaxed">
                Cuando el sistema sea usado por instituciones educativas, el
                tratamiento de datos de menores se realiza bajo autorización del
                padre/madre/acudiente o según el marco aplicable y la naturaleza
                del servicio contratado por la institución. Si detectamos datos
                recolectados sin la autorización requerida, tomaremos medidas
                para eliminarlos o restringir su uso.
              </p>
            </section>

            {/* 14. Anti-spam */}
            <section className="space-y-3">
              <h2 className="text-lg font-semibold text-slate-900">
                14. Política contra el uso de mensajes no solicitados (spam)
              </h2>
              <p className="leading-relaxed">
                Prohibimos el uso de mensajes no solicitados para promocionar el
                servicio o abusar del módulo de mensajería. El incumplimiento
                puede implicar suspensión o terminación del acceso.
              </p>
            </section>

            {/* 15. Cambios */}
            <section className="space-y-3">
              <h2 className="text-lg font-semibold text-slate-900">
                15. Cambios en esta política
              </h2>
              <p className="leading-relaxed">
                Esta política puede actualizarse. Notificaremos cambios
                publicando la versión actualizada en esta página y, cuando sea
                pertinente, por correo o aviso dentro del sistema antes de que
                entre en vigencia. Recomendamos revisarla periódicamente.
              </p>
            </section>

            {/* 16. Contacto */}
            <section className="space-y-3">
              <h2 className="text-lg font-semibold text-slate-900">
                16. Contáctanos
              </h2>
              <p className="leading-relaxed">
                Para dudas, solicitudes o reclamos relacionados con esta
                política, puedes escribirnos a:
              </p>

              <div className="rounded-lg border bg-white/60 p-4">
                <p className="text-sm">
                  Correo:{" "}
                  <a
                    href="mailto:soporte@incconection-kids.com"
                    className="font-semibold text-teal-700 hover:underline"
                  >
                    soporte@incconection-kids.com
                  </a>
                </p>
              </div>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
