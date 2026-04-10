# CLAUDE.md — Incconection Kids

---

## WHY — ¿Por qué existe este software?

Los colegios manejaban sus procesos en **Excel, matrices manuales y hojas de cálculo**. Eso generaba:

- **Errores humanos frecuentes** en cálculos de notas, pagos y matrículas
- **Procesos repetitivos** que consumían tiempo del personal administrativo y docente
- **Información dispersa**: comunicaciones por WhatsApp, pagos en caja, notas en papel
- **Cero visibilidad** para padres de familia sobre el estado académico de sus hijos

La solución: identificar cada proceso molesto y repetitivo, digitalizarlo, construirle un algoritmo y hacerlo funcionar dentro de un solo sistema.

**Tres pilares del valor:**
1. **Reducción de tiempo** — lo que tomaba horas ahora toma segundos
2. **Centralización** — un solo lugar para toda la información del colegio
3. **Comunicación** — colegio, profesores, estudiantes y familias conectados en tiempo real

### Modelo de despliegue: una instancia por colegio

Este sistema **no es multi-tenant**. Cada colegio tiene su propia instancia independiente. Decisión deliberada:

> Si cae un colegio, no caen todos.

Es más costoso de mantener, pero garantiza aislamiento total, estabilidad y facilidad de diagnóstico por cliente. El objetivo es vender el sistema a múltiples colegios, cada uno con su propio entorno.

---

## WHAT — ¿Qué hace el sistema?

Una plataforma SaaS de gestión institucional educativa con **7 roles de usuario**, cada uno con su propio dashboard y funcionalidades.

### Módulos implementados

| Módulo | Descripción |
|--------|-------------|
| **Matrículas** | Inscripción y gestión de estudiantes, padres y docentes por período académico |
| **Académico** | Grupos, horarios, materias, metodologías, habilidades por asignatura |
| **Notas y Asistencia** | Registro de notas, seguimiento de actividades, control de asistencia |
| **Pagos** | Gestión de pagos, codeudores y tesorería |
| **Comunicaciones** | Circulares digitales con editor enriquecido (TipTap), enviadas por email |
| **Psicología** | Módulo de seguimiento psicológico de estudiantes |
| **Rutas escolares** | Gestión de rutas de transporte |
| **Biblioteca** | Recursos y materiales de clase para estudiantes |
| **Calendario** | Eventos académicos e institucionales (integración Google Calendar) |
| **Soporte / Tickets** | Sistema de soporte interno |
| **Carnet digital** | Carnet estudiantil digital |
| **Vista Padre de Familia** | Dashboard propio para padres: notas, asistencia, circulares, pagos de sus hijos |
| **Pensum** | Estructura curricular del colegio |

### Roles del sistema

| Rol | Acceso |
|-----|--------|
| `super-admin` | Control total del sistema |
| `administrativo` | Gestión institucional, matrículas, pagos, comunicaciones |
| `profesor` | Clases, horarios, notas, asistencia, grupos |
| `estudiante` | Sus cursos, notas, calendario, pagos, biblioteca |
| `padre-familia` | Vista de sus hijos: académico, pagos, comunicaciones |
| `estudiante-aspirante` | Proceso de inscripción |
| `padre-aspirante` | Acompañamiento en proceso de inscripción |
| `tienda` | *(definido, pendiente de implementar)* |
| `psicologia` | *(definido, pendiente de implementar)* |
| `ruta` | *(definido, pendiente de implementar)* |
| `transito` | *(definido, pendiente de implementar)* |
| `Lectores` | *(definido, pendiente de implementar)* |
| `Coordinadora` | Puede asignar notas por trimestre en la vista de Resultados |
| `Rector` | *(definido, pendiente de implementar)* |

---

## HOW — ¿Cómo está construido?

### Stack Tecnológico

| Categoría | Tecnología |
|-----------|-----------|
| Framework | Next.js 15.4.6 (App Router) |
| UI | React 19.1.0 + TypeScript 5 |
| Componentes | Shadcn/UI + Radix UI (estilo New York) |
| Estilos | Tailwind CSS v4 |
| Estado Global | Zustand v5 con persistencia localStorage |
| Base de Datos | Supabase (PostgreSQL + Auth) |
| Email | Nodemailer v8 con Gmail SMTP |
| Editor de Texto | TipTap v3 |
| Animaciones | Framer Motion 12 + GSAP 3 |
| Gráficos | Recharts 3 |
| Íconos | Lucide React + React Icons 5 |
| Fechas | date-fns 4 |

### Comandos Esenciales

```bash
npm run dev              # Servidor de desarrollo en puerto 3010 (Turbopack)
npm run build            # Build de producción (modo standalone)
npm run start            # Servidor de producción
npm run lint             # Linting con ESLint 9
npm run types:supabase   # Genera src/types/database.types.ts desde Supabase
```

**Puerto de desarrollo**: `3010`
**Backend local**: Puerto `3842` (conectado vía `RequestHTTP.js`)

---

### Arquitectura y Estructura de Carpetas

```
app/
├── acceso-denegado/          # Página de acceso denegado
├── actions/                  # Server Actions:
│   ├── send-email.ts         #   Envío general de emails
│   ├── send-recovery-email.ts#   Recuperación de contraseña (token seguro)
│   ├── update-user-email.ts  #   Actualización de email de usuario
│   └── delete-user.ts        #   Eliminación de usuario
├── api/calendarGoogle/       # API: Google Calendar (list-events/route.ts)
├── auth/
│   ├── callback/route.ts     # OAuth redirect callback
│   └── reset-password/       # Restablecimiento de contraseña con token
├── autorizacion/             # Callback de asignación de roles
│   ├── utils/getInfoInstitute.ts
│   ├── utils/getUserAuth.ts
│   └── utils/getUserRoles.ts
├── politica-privacidad/      # Página legal
├── terminos-y-condiciones/   # Página legal
├── recuperar-contrasena/     # Solicitud de recuperación de contraseña
├── usuario/                  # Dashboards por rol
│   ├── super-admin/
│   ├── administrativo/       # layout.tsx + page.tsx
│   ├── profesor/             # 10 rutas (ver detalle abajo)
│   ├── estudiante/           # 13+ subrutas (ver detalle abajo)
│   ├── estudiante-aspirante/
│   ├── padre-familia/
│   └── padre-aspirante/
├── layout.tsx                # Root layout (fonts, toast providers, modal root)
└── page.tsx                  # Home / Login

components/
├── principal/
│   ├── Login/                # Login.tsx, index.css
│   ├── Administrativos/      # academic/, administrative/, students/, family/,
│   │                         # codebtors/, communications/, notifications/,
│   │                         # reports/, support/, teachers/, treasury/
│   ├── Profesor/             # 10 componentes (animated-page, StudentGradesDialog, etc.)
│   ├── PadreFamilia/         # 18 componentes + hooks/
│   └── SuperAdmin/           # 57+ componentes
│       ├── Sidebar.tsx       # Sidebar compartido (profesor, padre-familia, admin)
│       ├── Courses/modals/   # 9 modales
│       ├── UsersManagement/  # 20+ componentes (cards, dialogs, fields, modals, hooks)
│       ├── components/       # RichTextEditor, CycleSelector, psychology/
│       └── hooks/            # usePeriodForm, usePeriodEdit, usePsychology
├── seconders/                # topbar, aside-nav, DataTable, StatCard, modals, backgrounds
├── ui/                       # 54 componentes Shadcn/Radix + ActiveBadge, ConditionBadges
├── Services/
│   ├── HTTP/RequestHTTP.js   # Cliente HTTP para backend local (port 3842)
│   └── ManagmentStorage/     # ManagmentStorage.ts — Wrapper de localStorage
├── function/
│   ├── RoleGuard/            # RoleGuard, CanSee
│   └── RedirectHomeRoll/     # CloseSession, GoToPath, RedirectHomeRoll
└── providers/
    └── StudentContextProvider.tsx

Stores/                       # 29 stores Zustand (ver sección abajo)
src/types/database.types.ts   # Tipos Supabase auto-generados (64KB) — SIEMPRE usar este
lib/
├── supabase/client.ts        # Cliente browser
├── supabase/server.ts        # Cliente servidor (SSR, cookies)
├── formatDate.ts
├── data.ts
└── utils.ts
hooks/
├── useCurrentUser.ts
└── use-mobile.ts
HTML/emails/                  # Templates HTML para emails (circularTemplate)
middleware.ts                 # RBAC middleware centralizado (221 líneas)
```

---

### Rutas del Estudiante

| Ruta | Descripción |
|------|-------------|
| `/usuario/estudiante` | Dashboard principal |
| `/usuario/estudiante/biblioteca` | Biblioteca de recursos |
| `/usuario/estudiante/calendario` | Calendario académico |
| `/usuario/estudiante/carnet` | Carnet digital |
| `/usuario/estudiante/comunicaciones` | Comunicaciones |
| `/usuario/estudiante/crep` | CREP |
| `/usuario/estudiante/cursos` | Cursos |
| `/usuario/estudiante/grupos-interes` | Grupos de interés |
| `/usuario/estudiante/inscripcion` | Inscripción |
| `/usuario/estudiante/notificaciones` | Notificaciones |
| `/usuario/estudiante/pagos` | Pagos |
| `/usuario/estudiante/pensum` | Pensum académico |
| `/usuario/estudiante/perfil` | Perfil |
| `/usuario/estudiante/registro-notas` | Registro de notas |

Las vistas se organizan en `app/usuario/estudiante/views/` con hooks propios (`useClasesEstudiante`, `useActividadesEstudiante`).

---

### Rutas del Profesor — Layout y Navegación

**Layout**: `app/usuario/profesor/layout.tsx`
- Usa `Sidebar` de `@/components/principal/SuperAdmin/Sidebar` (compartido entre roles)
- `activeView` se calcula desde `usePathname()` — match más específico (href más largo)
- `handleMenuItemClick` usa `router.push(item.href)` para navegar
- Estructura: `<div h-dvh> → <Sidebar /> + <div flex-1 overflow-hidden> → <main overflow-auto>`
- **No incluir `<html>` ni `<body>`** — solo el root layout puede tenerlos

| Ruta | ID |
|------|----|
| `/usuario/profesor` | `inicio` |
| `/usuario/profesor/clases` | `clases` |
| `/usuario/profesor/horario` | `horario` |
| `/usuario/profesor/grupos-escolares` | `grupos-escolares` |
| `/usuario/profesor/director-grupo` | `director-grupo` |
| `/usuario/profesor/separar-aulas` | `separar-aulas` |
| `/usuario/profesor/eventos` | `eventos` |
| `/usuario/profesor/notificaciones` | `notificaciones` |
| `/usuario/profesor/mi-perfil` | `mi-perfil` |
| `/usuario/profesor/tickets` | `tickets` |

La ruta `/usuario/profesor/clases` es la más compleja: 21 archivos con modales y tabs propios.

**Tipo MenuCategory** (de `SuperAdmin/Sidebar.tsx`):
```ts
interface MenuCategory {
  id: string;
  label: string;
  icon: LucideIcon;
  items?: { id: string; label: string; icon: LucideIcon; href: string }[];
}
```

---

### Sistema de Autenticación y RBAC

El archivo **`middleware.ts`** intercepta todas las rutas y es el núcleo de seguridad:

- Valida sesión con `supabase.auth.getUser()` (verificado en servidor, no `getSession()`)
- Aplica control de acceso basado en roles (cookie `current_role`)
- Redirige automáticamente desde `/usuario` al dashboard del rol guardado
- Rutas públicas: `/`, `/politica-privacidad`, `/terminos-y-condiciones`, `/recuperar-contrasena`, `/auth/*`, `/autorizacion`

**Prioridad de redirección por rol:**
`super-admin` › `tienda` › `padre-familia` › `psicologia` › `profesor` › `estudiante` › `ruta`

**Cookie `current_role`**: TTL 7 días, gestionada por `UserInfoStore`

---

### Sistema de Recuperación de Contraseña

Flujo de dos pasos, diseñado para que scanners de email no invaliden el token:

1. **`/recuperar-contrasena`** — el usuario ingresa su email, se genera un token con Supabase Admin API (`generateLink type: "recovery"`) y se envía por email
2. **`/auth/reset-password`** — recibe `token_hash` por URL, lo verifica en el cliente con `supabase.auth.verifyOtp()`, y permite cambiar la contraseña (mínimo 6 caracteres). Tokens expiran en 1 hora.

---

### Estado Global — 29 Stores Zustand

Cada store maneja un dominio específico con persistencia en `localStorage`.

**Autenticación / Usuario**: `UserInfoStore`, `profilesStore`

**Académico**: `periodAcademicStore` (15KB, el más grande), `cycleStore`, `coursesStore`, `materiasStore`, `ClassroomsStore`, `InstituteStore`

**Matrícula**: `studentEnrolledStore`, `teacherEnrolledStore`, `adminEnrolledStore`, `parentEnrolledStore`

**Grupos y Clases**: `groupsStore`, `GroupHasClassStore`, `groupHasStudentsStore`, `groupHasParentStore`, `groupClassSessionStore`, `GroupClassScheduleStore`

**Contenido Académico**: `groupHasMaterialStore`, `groupHasActivityStore`, `groupClassMethodologyStore`, `groupClassMethodologySkillStore`, `methodologySkillStore`, `methodologySkillCategoryStore`

**Otros**: `eventStore`, `studentContextStore` (contexto completo del estudiante), `studentAttendanceStore`, `studentViewStore`

---

### Tipos de Base de Datos

```ts
// CORRECTO — siempre usar este path
import type { Database } from "@/src/types/database.types";
type Profile = Database["public"]["Tables"]["profiles"]["Row"];

// INCORRECTO — este path no existe
import type { Database } from "@/src/types/supabase"; // ❌
```

Regenerar tipos: `npm run types:supabase`

---

### Reglas de Consultas Supabase

- **`.maybeSingle()`** — cuando puede haber 0 filas → retorna `null` sin error
- **`.single()`** — solo cuando se garantiza exactamente 1 fila → lanza `PGRST116` si hay 0 filas

```ts
const { data } = await supabase.from("tabla").select("*").eq("id", id).maybeSingle();
const { data } = await supabase.from("tabla").select("*").eq("id", id).single();
```

---

### Variables de Entorno (`.env.local`)

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SERVICE_ROLE_KEY=        # Solo servidor, nunca exponer al cliente
SMTP_USER=
SMTP_PASS=
SMTP_FROM_NAME=
NEXT_PUBLIC_SITE_URL=             # Para OAuth redirect
```

---

### Sistema de Email

- **`send-email.ts`** — Envío general (BCC, adjuntos en base64, remitente personalizado)
- **`send-recovery-email.ts`** — Recuperación de contraseña con token seguro
- SMTP: Gmail. Templates HTML en `HTML/emails/`

---

### Convenciones de Código

- **TypeScript estricto** — `strict: true` en tsconfig
- **Path alias**: `@/*` apunta a la raíz del proyecto
- **Shadcn/UI**: estilo "New York", íconos Lucide, CSS variables para colores
- **ESLint 9** con configuración de Next.js
- **Build standalone** — Optimizado para Docker/producción
- Los errores de TypeScript y ESLint están **desactivados en build** (`ignoreBuildErrors: true`)
- **Layouts anidados**: nunca incluir `<html>` ni `<body>` en layouts que no sean el root
- **CSS en páginas**: usar `min-w-0` junto con `w-full` dentro de contenedores flex para evitar overflow

---

### Patrones Arquitectónicos Clave

1. **RBAC en Middleware** — Control de acceso centralizado antes de renderizar páginas
2. **Sidebar compartido** — `SuperAdmin/Sidebar.tsx` usado por profesor, padre-familia y admin
3. **Navegación por pathname** — `activeView` derivado de `usePathname()`, match por href más largo
4. **Server Actions** — Para operaciones sensibles (email, actualización de email, eliminación de usuario)
5. **Zustand con persistencia** — Estado granular por dominio con caché en localStorage
6. **Componentes por Rol** — Carpetas separadas en `components/principal/` por cada rol
7. **Supabase SSR** — Clientes diferenciados para browser (`client.ts`) y servidor (`server.ts`)
8. **StudentContextProvider** — Carga automática de contexto completo del estudiante al montar
9. **Token en cliente** — Recuperación de contraseña verificada en browser para evitar invalidación por scanners de email

---

### Reglas de Negocio

#### Escala de calificaciones
- La escala va de **0 a 120** (no de 0 a 100).
- Umbrales de desempeño:

| Rango | Nivel |
|-------|-------|
| < 60 | Reprobado |
| 60 – 83 | Bajo |
| 84 – 94 | Básico |
| 95 – 106 | Alto |
| 107 – 120 | Superior |

- La nota final (`N.F.`) de una materia es el promedio de las notas de cada ciclo/trimestre.
- Nunca usar 70 como umbral de reprobación — el umbral correcto es **60**.

#### Horario por días numerados (no por día de la semana)
- Las clases **no tienen un día de semana fijo** (lunes, martes, etc.).
- En cambio, se asignan **días del 1 al 5** en secuencia continua.
- Si un día de calendario es festivo, ese día se salta y la secuencia continúa al día siguiente hábil.
  - Ejemplo: si el lunes es festivo, el martes se cursa el **Día 1** (no el Día 2, que sería el martes habitual en un colegio tradicional).
- Esto afecta la lógica de generación de horarios, asistencia y sesiones de clase: **siempre operar con el número de día, no con el nombre del día de la semana**.

---

### Integraciones Externas

| Servicio | Propósito |
|----------|-----------|
| Supabase | PostgreSQL + Auth + tiempo real |
| Google Calendar API | Integración de eventos (`api/calendarGoogle/`) |
| Gmail SMTP | Notificaciones y circulares por email |
| UnicornStudio | Animaciones de fondo (`unicornstudio-react`) |
