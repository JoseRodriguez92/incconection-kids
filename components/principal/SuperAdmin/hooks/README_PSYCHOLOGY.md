# Hooks de Psicología - Documentación

Este archivo contiene la documentación de los hooks personalizados creados para gestionar todas las tablas relacionadas con psicología en Supabase.

## 📋 Tabla de Contenidos

1. [Hooks Disponibles](#hooks-disponibles)
2. [Estructura de Datos](#estructura-de-datos)
3. [Uso de los Hooks](#uso-de-los-hooks)
4. [Ejemplos](#ejemplos)

## 🎯 Hooks Disponibles

### 1. `usePsychCases` - Casos Psicológicos

Gestiona los casos psicológicos de los estudiantes.

**Funciones disponibles:**
- `fetchCases()` - Obtiene todos los casos
- `createCase(caseData)` - Crea un nuevo caso
- `updateCase(id, caseData)` - Actualiza un caso existente
- `deleteCase(id)` - Elimina un caso

**Estados:**
- `cases` - Array con todos los casos
- `loading` - Estado de carga
- `error` - Mensajes de error

### 2. `usePsychSessions` - Sesiones Psicológicas

Gestiona las sesiones de psicología con estudiantes.

**Funciones disponibles:**
- `fetchSessions()` - Obtiene todas las sesiones
- `createSession(sessionData)` - Crea una nueva sesión
- `updateSession(id, sessionData)` - Actualiza una sesión
- `deleteSession(id)` - Elimina una sesión

### 3. `usePsychAlerts` - Alertas Psicológicas

Gestiona las alertas relacionadas con casos psicológicos.

**Funciones disponibles:**
- `fetchAlerts()` - Obtiene todas las alertas
- `createAlert(alertData)` - Crea una nueva alerta
- `updateAlert(id, alertData)` - Actualiza una alerta
- `deleteAlert(id)` - Elimina una alerta

### 4. `usePsychFollowups` - Seguimientos

Gestiona los seguimientos de casos psicológicos.

**Funciones disponibles:**
- `fetchFollowups()` - Obtiene todos los seguimientos
- `createFollowup(followupData)` - Crea un nuevo seguimiento
- `updateFollowup(id, followupData)` - Actualiza un seguimiento
- `deleteFollowup(id)` - Elimina un seguimiento

### 5. `usePsychParentMeetings` - Reuniones con Padres

Gestiona las reuniones con padres de familia.

**Funciones disponibles:**
- `fetchMeetings()` - Obtiene todas las reuniones
- `createMeeting(meetingData)` - Crea una nueva reunión
- `updateMeeting(id, meetingData)` - Actualiza una reunión
- `deleteMeeting(id)` - Elimina una reunión

### 6. `usePsychFiles` - Archivos Adjuntos

Gestiona los archivos adjuntos a casos psicológicos.

**Funciones disponibles:**
- `fetchFiles()` - Obtiene todos los archivos
- `createFile(fileData)` - Registra un nuevo archivo
- `deleteFile(id)` - Elimina un archivo

### 7. `usePsychCaseTypes` - Tipos de Casos

Gestiona la configuración de tipos de casos psicológicos.

**Funciones disponibles:**
- `fetchCaseTypes()` - Obtiene todos los tipos de casos
- `createCaseType(caseTypeData)` - Crea un nuevo tipo
- `updateCaseType(id, caseTypeData)` - Actualiza un tipo
- `deleteCaseType(id)` - Elimina un tipo

### 8. `usePsychRiskLevels` - Niveles de Riesgo

Gestiona la configuración de niveles de riesgo.

**Funciones disponibles:**
- `fetchRiskLevels()` - Obtiene todos los niveles
- `createRiskLevel(riskLevelData)` - Crea un nuevo nivel
- `updateRiskLevel(id, riskLevelData)` - Actualiza un nivel
- `deleteRiskLevel(id)` - Elimina un nivel

## 📦 Estructura de Datos

### PsychCase (Caso Psicológico)
```typescript
{
  id: string
  student_enrolled_id: string
  status: string
  summary: string | null
  case_type_id: string | null
  academic_period_id: string | null
  risk_level_id: string | null
  is_active: boolean | null
  confidentiality_level: string | null
  opened_at: string | null
  closed_at: string | null
  created_by: string | null
  created_at: string | null
  updated_at: string | null
  // Campos calculados
  student_name?: string
  grade?: string
  case_type_name?: string
  risk_level_name?: string
}
```

### PsychSession (Sesión Psicológica)
```typescript
{
  id: string
  psych_case_id: string
  session_at: string
  assessment: string | null
  intervention: string | null
  plan: string | null
  reason: string | null
  modality: string | null
  observations: string | null
  is_internal: boolean | null
  professional_id: string | null
  created_at: string | null
  updated_at: string | null
  // Campos calculados
  student_name?: string
  professional_name?: string
}
```

## 💻 Uso de los Hooks

### Ejemplo Básico

```typescript
import { usePsychCases } from "./hooks/usePsychology"

function MiComponente() {
  const { cases, loading, error, createCase, updateCase } = usePsychCases()

  // Los datos se cargan automáticamente al montar el componente

  if (loading) return <div>Cargando...</div>
  if (error) return <div>Error: {error}</div>

  return (
    <div>
      {cases.map(caseItem => (
        <div key={caseItem.id}>
          <h3>{caseItem.student_name}</h3>
          <p>{caseItem.case_type_name}</p>
        </div>
      ))}
    </div>
  )
}
```

### Crear un Nuevo Caso

```typescript
const { createCase } = usePsychCases()

const handleCreate = async () => {
  try {
    await createCase({
      student_enrolled_id: "uuid-del-estudiante",
      status: "activo",
      summary: "Resumen del caso",
      case_type_id: "uuid-del-tipo",
      opened_at: new Date().toISOString(),
    })
    console.log("Caso creado exitosamente")
  } catch (error) {
    console.error("Error al crear caso:", error)
  }
}
```

### Actualizar un Caso

```typescript
const { updateCase } = usePsychCases()

const handleUpdate = async (caseId: string) => {
  try {
    await updateCase(caseId, {
      status: "cerrado",
      closed_at: new Date().toISOString(),
    })
    console.log("Caso actualizado exitosamente")
  } catch (error) {
    console.error("Error al actualizar caso:", error)
  }
}
```

## 🔍 Consultas con Relaciones

Los hooks automáticamente obtienen datos relacionados:

- **usePsychCases**: Incluye información del estudiante, tipo de caso y nivel de riesgo
- **usePsychSessions**: Incluye información del estudiante y profesional
- **usePsychAlerts**: Incluye información del estudiante y nivel de riesgo
- **usePsychFollowups**: Incluye información del estudiante
- **usePsychParentMeetings**: Incluye información del estudiante

## 🎨 Integración con la UI

El componente `PsychologyManagement.tsx` ya está completamente integrado con estos hooks y muestra:

- Métricas en tiempo real
- 8 pestañas con información de cada tabla
- Estados de carga
- Manejo de errores
- Búsqueda y filtrado

## 🔄 Actualización Automática

Todas las funciones de creación, actualización y eliminación automáticamente vuelven a cargar los datos después de ejecutarse, manteniendo la UI sincronizada con la base de datos.

## ⚠️ Consideraciones

1. Los hooks realizan la carga inicial automáticamente usando `useEffect`
2. Todos los hooks manejan estados de carga y error
3. Las consultas incluyen joins automáticos para obtener datos relacionados
4. Se requiere autenticación válida en Supabase para que funcionen
