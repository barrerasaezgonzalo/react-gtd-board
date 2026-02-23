# GTD Board & Action Tracker

Un dashboard de alto rendimiento basado en la metodología **Getting Things Done (GTD)**, construido con **Next.js App Router**. Esta aplicación se centra en la velocidad, una interfaz reactiva y una gestión de tareas fluida utilizando patrones de estado centralizado.

## 🚀 Stack Tecnológico

- **Framework:** [Next.js 15 (App Router)](https://nextjs.org/)
- **Lenguaje:** [TypeScript](https://www.typescriptlang.org/)
- **Estilos:** [Tailwind CSS](https://tailwindcss.com/)
- **Backend & Base de Datos:** [Supabase](https://supabase.com/)
- **Iconos:** [Lucide React](https://lucide.dev/)
- **Despliegue:** [Vercel](https://vercel.com/)

## 🏗️ Arquitectura y Características Clave

### 1. Contexto de Acciones Centralizado

La aplicación utiliza un `ActionContext` personalizado para gestionar el estado global de las tareas. Esto permite:

- **Contadores en Tiempo Real:** Actualización automática de los totales en el Sidebar para _Next Actions, Backlog, Waiting_ y _Done_.
- **Reactividad Cruzada:** Mover tareas entre estados se refleja instantáneamente en toda la UI sin recargas de página.

### 2. Sistema de Captura Inteligente

- **Validación:** Validación inline (mínimo 5 caracteres) para asegurar la calidad de las entradas.
- **Flujo Optimizado:** Captura rápida directamente al `backLog` para no interrumpir el enfoque en la vista actual.
- **Feedback de UI:** Mensajes de éxito no intrusivos y cambios visuales según el estado de validación.

### 3. Motor de Modales Dinámicos

- **Edición Reutilizable:** Un `EditModal` único que maneja objetos complejos, incluyendo textareas de altura automática y toggles booleanos para el estado `urgent`.
- **Validación Estricta:** Campos obligatorios (Título, Fecha de vencimiento, Estado) validados a nivel de componente.

## 🔐 Seguridad y Autenticación

- **Google Auth:** Integración completa con Supabase Auth para un inicio de sesión seguro y rápido.
- **Protección de Datos:** Reglas de seguridad RLS (Row Level Security) para asegurar que cada usuario acceda solo a sus propias acciones.

## 📋 Flujo de Trabajo GTD Incluido

- **Next Actions:** Tareas inmediatas en las que enfocarse.
- **Backlog:** El "Buzón" para ideas y tareas futuras.
- **Waiting:** Elementos pendientes de factores externos.
- **Done:** Archivo de logros completados con seguimiento de progreso.

## 🛠️ Instalación y Configuración

1.  **Clonar el repositorio:**
    ```bash
    git clone [https://github.com/tuusuario/gtd-board.git](https://github.com/tuusuario/gtd-board.git)
    ```
2.  **Instalar dependencias:**
    ```bash
    npm install
    ```
3.  **Variables de Entorno:**
    Crea un archivo `.env.local` con tus credenciales de Supabase:
    ```env
    NEXT_PUBLIC_SUPABASE_URL=tu_url
    NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_key
    ```
4.  **Ejecutar el servidor de desarrollo:**
    ```bash
    npm run dev
    ```

## 📅 Próximas Mejoras (Upcoming)

- [ ] Optimización para dispositivos móviles (Responsive Design).

## 🎞️ ScreenShot

### Anexo

## Second Feature -- Notes Sistem

Implementación de un sistema de notas utilizando:

- React (Clienta Component)
- Custom Hook (`useNotes`)
- Supabase como backend
- Animación tipo FLIP
- Optimistic UI updates
- Pinned notes
- Textarea auto-resizable
- Modal responsive (desktop + mobile)

## 🚀 Arquitectura

### 📁 Estructura

    /hooks
      useNotes.ts

    /components
      Notes.tsx

    /types
      index.ts

    /lib
      supabase.ts

## 🧠 Principios de diseño

### 1. Separación de responsabilidades

- `Notes.tsx` → UI + animación + eventos
- `useNotes.ts` → Estado + comunicación con Supabase
- Supabase → Persistencia

### 2. Optimistic Updates

Las actualizaciones se aplican primero en el estado local:

```ts
setNotes((prev) => prev.map((n) => (n.id === id ? { ...n, content } : n)));
```

Luego se persisten en la base de datos.

### 3. Animación FLIP

Se captura la posición original de la nota con:

```ts
getBoundingClientRect();
```

Luego se anima el modal desde esa posición hacia el centro usando:

- `position: fixed`
- `transition`
- `requestAnimationFrame`

La animación también es reversible al cerrar.

## 📌 Funcionalidades

### ✅ Crear nota

- Se crea localmente
- Se abre automáticamente
- Persistencia controlada

### ✅ Editar nota

- Actualización optimista
- Persistencia asincrónica
- Textarea controlado

### ✅ Eliminar nota

- Eliminación optimista
- Eliminación en Supabase

### ✅ Pinned notes

- Toggle visual
- Orden automático:
  - Pinned primero
  - Luego por fecha

### ✅ Modal responsive

- Desktop → centrado
- Mobile → fullscreen
- Escape para cerrar
- Click en backdrop
- Botón X visible

### ✅ UX avanzada

- Scroll oscuro
- Textarea auto-resizable
- Respeto de saltos de línea
- Prevención de notas vacías (opcional)

## 🔄 Hook: `useNotes`

Expone:

```ts
{
  (notes, loading, editNote, deleteNote, addNote, togglePinned);
}
```

El hook es la única fuente de verdad para:

- Estado
- Mutaciones
- Comunicación con Supabase

## 🗄 Supabase Schema

Tabla: `gtd_notes`

Campos mínimos requeridos:

    id           uuid (PK)
    content      text
    pinned       boolean
    created_at   timestamp

## ⚙️ Mejoras futuras

- Autosave con debounce
- Rollback en caso de error
- localStorage fallback
- Separador visual "Pinned / Others"
- Animaciones con Framer Motion
- Sincronización en tiempo real (Supabase Realtime)
- Virtualización si escala

## 🏁 Estado actual

✔ Arquitectura limpia\
✔ UI fluida\
✔ Sin refetch innecesario\
✔ Separación correcta UI / lógica\
✔ Lista para escalar

## 🎞️ ScreenShot

### Anexo

## Tertiary Feature -- Vista de Calendario

implementación de la vista de calendario
integrada dentro del sistema de productividad (GTD).

La vista permite:

- Visualizar tareas o notas asociadas a fechas específicas
- Navegar por meses
- Identificar elementos pendientes
- Integrarse con Supabase como fuente de datos

---

## 🎯 Objetivo

Proveer una representación temporal de los elementos del sistema,
permitiendo planificación y revisión semanal/mensual.

## 🏗 Arquitectura

### Componentes principales

    /components
      CalendarView.tsx
      CalendarGrid.tsx
      CalendarDayCell.tsx

    /hooks
      useCalendar.ts

## 🧠 Principios de diseño

### 1. Separación de responsabilidades

- `CalendarView` → Contenedor principal
- `CalendarGrid` → Renderizado de la matriz mensual
- `CalendarDayCell` → Día individual
- `useCalendar` → Lógica de fechas y fetch de datos

## 📅 Modelo de datos esperado

Tabla ejemplo: `gtd_events`

Campos mínimos:

    id           uuid (PK)
    title        text
    date         date
    completed    boolean
    created_at   timestamp

## 🔄 Hook: useCalendar

Responsabilidades:

- Calcular días del mes actual
- Manejar navegación entre meses
- Obtener eventos por rango de fecha
- Agrupar eventos por día

Ejemplo simplificado:

```ts
function useCalendar() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [events, setEvents] = useState([]);

  function nextMonth() {
    const next = new Date(currentMonth);
    next.setMonth(next.getMonth() + 1);
    setCurrentMonth(next);
  }

  function prevMonth() {
    const prev = new Date(currentMonth);
    prev.setMonth(prev.getMonth() - 1);
    setCurrentMonth(prev);
  }

  return {
    currentMonth,
    nextMonth,
    prevMonth,
    events,
  };
}
```

## 🧮 Renderizado del calendario

La grilla mensual se genera:

1.  Calculando el primer día del mes
2.  Determinando el offset según el día de la semana
3.  Generando matriz 7x5 (o 7x6 si es necesario)

## 🎨 UX Considerations

- Día actual destacado
- Indicador visual si existen eventos
- Hover states claros
- Navegación accesible (botones + teclado opcional)
- Responsive (colapsar a vista vertical en mobile)

## ⚙️ Integración con Supabase

Ejemplo de fetch por rango:

```ts
const { data } = await supabase
  .from("gtd_events")
  .select("*")
  .gte("date", startOfMonth)
  .lte("date", endOfMonth);
```

Buenas prácticas:

- No refetch en cada render
- Cachear por mes si es necesario
- Actualizaciones optimistas al marcar completado

## 🚀 Mejoras futuras

- Drag & Drop entre días
- Vista semanal
- Filtros por tipo
- Realtime updates
- Soporte para eventos recurrentes
- Integración con recordatorios

## 🏁 Estado

Vista funcional con:

✔ Navegación mensual\
✔ Integración con backend\
✔ Separación clara de lógica y UI\
✔ Preparada para escalar

## 📎 Relación con módulo Notes

El calendario puede:

- Mostrar notas con fecha asociada
- Convertir notas en eventos
- Servir como vista alternativa de planificación

## 🎞️ ScreenShot

## 📄 Licencia

Proyecto interno / experimental.
