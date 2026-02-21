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
