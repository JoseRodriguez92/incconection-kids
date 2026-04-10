import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TerminosYCondiciones() {
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
              Términos y Condiciones
            </CardTitle>

            <p className="text-sm text-muted-foreground text-center leading-relaxed">
              Al acceder y usar esta plataforma (web y/o móvil), aceptas estos
              términos. Si no estás de acuerdo con algún punto, por favor no
              utilices el servicio y contáctanos.
            </p>

            <div className="text-xs text-muted-foreground text-center">
              Última actualización:{" "}
              <span className="font-medium">Febrero 2026</span>
            </div>
          </CardHeader>

          <CardContent className="space-y-8 text-slate-700">
            {/* 1. Términos */}
            <section className="space-y-3">
              <h2 className="text-lg font-semibold text-slate-900">
                1. Términos
              </h2>
              <p className="leading-relaxed">
                Al acceder a la plataforma web y/o aplicación móvil operada por{" "}
                <span className="font-semibold">INCCA</span> y{" "}
                <span className="font-semibold">Incconection-Kids</span> (en
                adelante, la “Plataforma”), registrarte o usar sus
                funcionalidades, declaras que has leído, entiendes y aceptas
                estos Términos y Condiciones, así como la Política de Privacidad
                y Tratamiento de Datos.
              </p>
              <p className="leading-relaxed">
                Estos términos se rigen por la legislación de la{" "}
                <span className="font-medium">República de Colombia</span>,
                incluyendo, entre otras normas aplicables, la Ley 1581 de 2012
                (protección de datos), la Ley 527 de 1999 (comercio
                electrónico), y las normas de propiedad intelectual vigentes.
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Si no estás de acuerdo con estos términos, tienes prohibido el
                acceso y uso de la Plataforma.
              </p>
            </section>

            {/* 2. Licencia de uso */}
            <section className="space-y-3">
              <h2 className="text-lg font-semibold text-slate-900">
                2. Licencia de uso
              </h2>
              <p className="leading-relaxed">
                INCCA / Incconection-Kids otorga una licencia{" "}
                <span className="font-medium">
                  limitada, revocable, no exclusiva y no transferible
                </span>{" "}
                para utilizar la Plataforma únicamente para fines educativos,
                administrativos o institucionales, conforme al alcance
                habilitado.
              </p>

              <div className="rounded-lg border bg-white/60 p-4">
                <p className="text-sm leading-relaxed">
                  <span className="font-semibold">
                    Esta licencia no es una transferencia de propiedad.
                  </span>{" "}
                  La Plataforma, sus componentes, diseño, marca, contenido,
                  interfaces y código fuente pertenecen a INCCA /
                  Incconection-Kids o a sus licenciantes.
                </p>
              </div>
            </section>

            {/* 3. Registro, acceso y responsabilidades */}
            <section className="space-y-3">
              <h2 className="text-lg font-semibold text-slate-900">
                3. Registro, acceso y responsabilidades
              </h2>

              <ul className="list-disc pl-6 space-y-2 leading-relaxed">
                <li>
                  <span className="font-semibold">
                    Responsabilidad por credenciales:
                  </span>{" "}
                  el usuario y/o la institución es responsable de mantener la
                  confidencialidad de usuarios y contraseñas, así como de toda
                  actividad realizada desde su cuenta.
                </li>
                <li>
                  <span className="font-semibold">
                    Notificación de uso no autorizado:
                  </span>{" "}
                  si detectas actividad sospechosa, accesos no autorizados o
                  transacciones que no reconozcas, debes informarnos
                  inmediatamente por los canales de soporte.
                </li>
                <li>
                  <span className="font-semibold">
                    Información y datos cargados:
                  </span>{" "}
                  la institución (si aplica) es responsable de la veracidad de
                  la información que registra y de contar con las autorizaciones
                  necesarias de sus usuarios (incluyendo
                  padres/madres/acudientes cuando corresponda).
                </li>
              </ul>

              <p className="text-sm text-muted-foreground leading-relaxed">
                Recomendamos generar respaldos (backups) periódicos cuando la
                Plataforma disponga de herramientas para exportación o copia de
                seguridad.
              </p>
            </section>

            {/* 4. Uso aceptable */}
            <section className="space-y-3">
              <h2 className="text-lg font-semibold text-slate-900">
                4. Uso aceptable
              </h2>
              <p className="leading-relaxed">
                La institución y los usuarios se comprometen a NO utilizar la
                Plataforma para cargar, publicar o transmitir contenido ilegal o
                dañino.
              </p>

              <div className="rounded-lg border bg-white/60 p-4">
                <p className="font-semibold text-sm mb-2">
                  Está prohibido, entre otros:
                </p>
                <ul className="list-disc pl-6 space-y-1 text-sm leading-relaxed">
                  <li>Contenido sexual, pornografía o pornografía infantil.</li>
                  <li>Matoneo, acoso, discriminación, amenazas o violencia.</li>
                  <li>Terrorismo o promoción de actos delictivos.</li>
                  <li>
                    Contenido que viole derechos de autor, marcas, patentes o
                    secretos comerciales.
                  </li>
                  <li>
                    Uso de herramientas o rutinas que interfieran el
                    funcionamiento del sistema (malware, ataques, congestión
                    deliberada, etc.).
                  </li>
                </ul>
              </div>

              <p className="text-sm text-muted-foreground leading-relaxed">
                En caso de infracciones graves, podremos suspender el acceso y,
                si aplica, reportar a las autoridades competentes.
              </p>
            </section>

            {/* 5. Propiedad intelectual e integridad del sistema */}
            <section className="space-y-3">
              <h2 className="text-lg font-semibold text-slate-900">
                5. Propiedad intelectual e integridad del sistema
              </h2>
              <p className="leading-relaxed">
                La Plataforma y sus elementos (código, diseño, iconografía,
                estructura, pantallas, marca, contenidos, reportes y
                exportables) están protegidos por normas de propiedad
                intelectual. El usuario no podrá modificar, copiar, distribuir o
                explotar comercialmente estos elementos sin autorización.
              </p>
              <p className="leading-relaxed">
                INCCA / Incconection-Kids podrá realizar cambios estéticos, de
                navegación o funcionalidad para mejorar el servicio, mantener
                seguridad y garantizar estabilidad, sin necesidad de
                autorización previa.
              </p>
            </section>

            {/* 6. Ilegalidad y seguridad */}
            <section className="space-y-3">
              <h2 className="text-lg font-semibold text-slate-900">
                6. Ilegalidad, acceso indebido e interferencia
              </h2>
              <p className="leading-relaxed">
                Se prohíbe estrictamente cualquier intento de acceso no
                autorizado, vulneración, sondeo, prueba de seguridad sin
                permiso, interferencia del servicio o actividades que impongan
                carga desproporcionada a la infraestructura.
              </p>
              <ul className="list-disc pl-6 space-y-2 leading-relaxed">
                <li>
                  Intentar descifrar, desmontar, decodificar o realizar
                  ingeniería inversa.
                </li>
                <li>
                  Interrumpir el servicio a otros usuarios (ataques, congestión,
                  abuso de recursos).
                </li>
                <li>
                  Publicar material privado, difamatorio o que genere daño
                  intencional a terceros.
                </li>
              </ul>
            </section>

            {/* 7. Requerimientos técnicos */}
            <section className="space-y-3">
              <h2 className="text-lg font-semibold text-slate-900">
                7. Requerimientos técnicos
              </h2>
              <p className="leading-relaxed">
                La conexión a Internet y los dispositivos necesarios para
                acceder a la Plataforma estarán a cargo del usuario o la
                institución. Recomendamos usar navegadores modernos actualizados
                (Chrome, Edge, Firefox, Safari) y mantener el sistema operativo
                al día para una mejor experiencia.
              </p>
            </section>

            {/* 8. Limitaciones */}
            <section className="space-y-3">
              <h2 className="text-lg font-semibold text-slate-900">
                8. Limitaciones
              </h2>
              <p className="leading-relaxed">
                En ningún caso INCCA / Incconection-Kids será responsable por
                daños indirectos, incidentales o consecuenciales derivados del
                uso o imposibilidad de uso del servicio, incluyendo pérdida de
                datos, lucro cesante o interrupciones.
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Algunas jurisdicciones no permiten limitar ciertas
                responsabilidades. En esos casos, la limitación aplicará hasta
                el máximo permitido por la ley.
              </p>
            </section>

            {/* 9. Revisiones y erratas */}
            <section className="space-y-3">
              <h2 className="text-lg font-semibold text-slate-900">
                9. Revisiones, erratas y mantenimientos
              </h2>
              <p className="leading-relaxed">
                La Plataforma puede presentar errores técnicos, tipográficos o
                de funcionamiento. INCCA / Incconection-Kids se reserva el
                derecho de realizar mantenimientos preventivos o correctivos y
                mejoras, con el fin de optimizar el sistema.
              </p>
              <p className="leading-relaxed">
                Cuando aplique, la gestión de incidentes podrá realizarse a
                través de un sistema de soporte (tickets), donde se informará
                prioridad, seguimiento y tiempos de solución según el caso.
              </p>
            </section>

            {/* 10. Enlaces */}
            <section className="space-y-3">
              <h2 className="text-lg font-semibold text-slate-900">
                10. Enlaces
              </h2>
              <p className="leading-relaxed">
                La Plataforma puede incluir enlaces o integraciones con
                servicios de terceros. INCCA / Incconection-Kids no se hace
                responsable por contenidos externos ni por prácticas de
                privacidad de terceros.
              </p>
            </section>

            {/* 11. Modificaciones */}
            <section className="space-y-3">
              <h2 className="text-lg font-semibold text-slate-900">
                11. Modificaciones a los términos y condiciones
              </h2>
              <p className="leading-relaxed">
                INCCA / Incconection-Kids podrá modificar estos términos en
                cualquier momento. Las actualizaciones se publicarán en esta
                misma página y se entenderán aceptadas con el uso posterior a la
                publicación.
              </p>
            </section>

            {/* 12. Ley aplicable */}
            <section className="space-y-3">
              <h2 className="text-lg font-semibold text-slate-900">
                12. Ley aplicable y jurisdicción
              </h2>
              <p className="leading-relaxed">
                Cualquier reclamación relacionada con estos términos se regirá
                por las leyes de la República de Colombia, sin consideración a
                conflictos de disposiciones legales, y será conocida por las
                autoridades competentes en Colombia, salvo pacto diferente entre
                las partes.
              </p>
            </section>

            {/* 13. Contacto */}
            <section className="space-y-3">
              <h2 className="text-lg font-semibold text-slate-900">
                13. Contáctanos
              </h2>
              <p className="leading-relaxed">
                Para dudas, solicitudes o reclamos relacionados con estos
                Términos y Condiciones, puedes escribirnos a:
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
