# Period Academic Management - Arquitectura Modular

## 📁 Estructura del Proyecto

```
SuperAdmin/
├── PeriodAcademicManagement.tsx       # Componente principal refactorizado
├── PeriodAcademicManagement.tsx.backup # Backup del componente original
├── hooks/
│   ├── index.ts                        # Exportaciones de hooks
│   ├── usePeriodForm.ts               # Hook para lógica de creación
│   └── usePeriodEdit.ts               # Hook para lógica de edición
└── components/
    ├── index.ts                        # Exportaciones de componentes
    ├── CycleSelector.tsx              # Selector de ciclos reutilizable
    ├── ExistingCycles.tsx             # Lista de ciclos existentes
    ├── CreatePeriodModal.tsx          # Modal de creación
    └── EditPeriodModal.tsx            # Modal de edición
```

## 🎯 Componentes

### 1. **PeriodAcademicManagement.tsx**
- Componente principal orquestador
- Maneja el estado global de la vista
- Renderiza la lista de períodos académicos
- Coordina los modales de crear/editar

### 2. **CreatePeriodModal.tsx**
- Modal para crear nuevos períodos
- Formulario con validaciones
- Integra `CycleSelector` para selección de ciclos

### 3. **EditPeriodModal.tsx**
- Modal para editar períodos existentes
- Muestra ciclos actuales con `ExistingCycles`
- Permite agregar nuevos ciclos con `CycleSelector`

### 4. **CycleSelector.tsx**
- Componente reutilizable para seleccionar ciclos
- Formulario expandible con fechas y estado
- Soporta dos colores de acento (azul/verde)
- Props configurables para diferentes contextos

### 5. **ExistingCycles.tsx**
- Muestra ciclos ya asignados al período
- Permite editar fechas y estado de cada ciclo
- UI optimizada para edición rápida

## 🪝 Hooks Personalizados

### **usePeriodForm**
Maneja toda la lógica de creación de períodos:
- ✅ Estado del formulario (`newPeriodo`)
- ✅ Selección de ciclos (`selectedCyclesData`)
- ✅ Validaciones
- ✅ Llamadas a la API
- ✅ Reset del formulario

**Exports:**
```typescript
{
  newPeriodo,
  setNewPeriodo,
  selectedCyclesData,
  handleToggleCycleSelection,
  isCycleSelected,
  updateCycleData,
  handleCreatePeriodo,
  resetForm
}
```

### **usePeriodEdit**
Maneja toda la lógica de edición de períodos:
- ✅ Estado del período seleccionado
- ✅ Nuevos ciclos a agregar
- ✅ Actualización de ciclos existentes
- ✅ Llamadas a la API
- ✅ Reset del estado

**Exports:**
```typescript
{
  selectedPeriodo,
  setSelectedPeriodo,
  newCyclesToAdd,
  handleToggleNewCycleSelection,
  isNewCycleSelected,
  updateNewCycleData,
  handleUpdatePeriodo,
  resetEdit
}
```

## 🔄 Flujo de Datos

### Creación de Período
```
Usuario → CreatePeriodModal → usePeriodForm → PeriodAcademicStore → Supabase
```

### Edición de Período
```
Usuario → EditPeriodModal → usePeriodEdit → PeriodAcademicStore → Supabase
```

## 🔗 Conexiones con Supabase

Todas las consultas mantienen su funcionalidad intacta:

1. **Crear Período**: `addPeriodo()`
2. **Agregar Ciclo**: `addCycleToPeriod()`
3. **Actualizar Período**: `updatePeriodo()`
4. **Actualizar Relación Ciclo**: `updateCycleRelation()`
5. **Obtener Períodos**: `fetchPeriodos()`
6. **Obtener Ciclos**: `fetchCycles()`

## ✅ Ventajas de la Refactorización

1. **Separación de Responsabilidades**
   - Lógica separada en hooks
   - UI separada en componentes
   - Store independiente

2. **Reutilización**
   - `CycleSelector` se usa en crear y editar
   - Hooks pueden extenderse para otros módulos

3. **Mantenibilidad**
   - Código más legible
   - Fácil de testear
   - Cambios localizados

4. **Escalabilidad**
   - Agregar nuevas funciones es más simple
   - Estructura clara para nuevos desarrolladores

5. **Performance**
   - Sin cambios en la performance
   - Mismas optimizaciones

## 🚀 Uso

```typescript
import PeriodAcademicManagement from "./SuperAdmin/PeriodAcademicManagement";

// El componente funciona exactamente igual que antes
<PeriodAcademicManagement />
```

## 📝 Notas

- El archivo backup (`PeriodAcademicManagement.tsx.backup`) se puede eliminar una vez verificado que todo funciona
- Todas las conexiones a Supabase permanecen intactas
- No hay cambios en la funcionalidad, solo en la estructura
