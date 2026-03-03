# React GTD

Aplicacion GTD (Getting Things Done) con Next.js + Supabase.

## Stack

- Next.js (App Router)
- React + TypeScript
- Tailwind CSS
- Supabase (Auth + Database)
- Lucide React

## Funcionalidades

### GTD Core

- Captura rapida (entra a Backlog)
- Estados de tarea:
  - `backLog`
  - `nextActions`
  - `waiting`
  - `done`
  - `someday` (Someday/Maybe)
- EditModal para actualizar:
  - titulo
  - due_date
  - status
  - prioridad (urgent)
  - energy (`low|medium|high`)
  - context (`home|work`)
  - project
  - links de archivos (URL por linea)

### Vistas

- Next Actions (filtro por Context + Energy)
- Backlog
- Waiting
- Done
- Someday / Maybe
- Kanban (drag and drop entre columnas)
  - valida que no puedes mover a `nextActions` sin `due_date`
- Calendar
- Notes
- Projects
- Weekly Review (wizard)
- System Health (dashboard)

### Navegacion

- Sidebar: vistas operativas principales
- Header (desktop):
  - Search global en vivo
  - Calendar
  - Kanban
  - Weekly Review
  - System Health
  - Logout
- Sidebar (mobile):
  - quick actions para Calendar/Kanban/Review/Health al final

### Search global

- Busca por `title`, `text` y `file_urls`
- Filtra en vivo en:
  - Next Actions
  - Backlog
  - Waiting
  - Done
  - Someday
  - Kanban
  - Calendar
- Boton `X` para limpiar

### System Health

- KPIs:
  - Backlog sin procesar
  - Waiting estancadas (+7 dias aprox)
  - Atrasadas
  - Proximas 7 dias
  - Proyectos (cantidad)
  - Weekly Review (al dia / pendiente)
- Health Score (0-100) con semaforo

### Weekly Review

- Checklist semanal persistido en Supabase
- Wizard:
  - Prev
  - Next step
  - Done/Undo por paso
  - Reset

### Projects

- Crear proyecto (nombre + color)
- Eliminar proyecto
- Asignar tareas a proyecto
- Resumen por estado dentro del proyecto

### Notes

- Busqueda local
- Pin/unpin
- Modal expandido
- Tarjetas mas grandes

### UX

- Scroll-to-top button (flotante) al bajar
- Anchos unificados entre vistas (`max-w-[1600px]`)

## Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
npm run test
```

## Setup local

1. Instalar dependencias:

```bash
npm install
```

2. Crear `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

3. Ejecutar:

```bash
npm run dev
```

## SQL requerido en Supabase

### 1) Projects + relacion con acciones

```sql
begin;

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  color text not null default '#38bdf8',
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create unique index if not exists projects_user_name_unique
  on public.projects (user_id, lower(name));

create index if not exists projects_user_id_idx
  on public.projects(user_id);

alter table public.gtd_actions
  add column if not exists project_id uuid null
  references public.projects(id) on delete set null;

create index if not exists gtd_actions_project_id_idx
  on public.gtd_actions(project_id);

alter table public.projects enable row level security;

create policy "projects_select_own"
on public.projects for select to authenticated
using (auth.uid() = user_id);

create policy "projects_insert_own"
on public.projects for insert to authenticated
with check (auth.uid() = user_id);

create policy "projects_update_own"
on public.projects for update to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "projects_delete_own"
on public.projects for delete to authenticated
using (auth.uid() = user_id);

commit;
```

### 2) Weekly Review

```sql
begin;

create table if not exists public.weekly_reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  week_start date not null,
  steps jsonb not null default '[]'::jsonb,
  completed boolean not null default false,
  completed_at timestamptz null,
  created_at timestamptz not null default now()
);

create unique index if not exists weekly_reviews_user_week_unique
  on public.weekly_reviews (user_id, week_start);

create index if not exists weekly_reviews_user_idx
  on public.weekly_reviews (user_id);

alter table public.weekly_reviews enable row level security;

create policy "weekly_reviews_select_own"
on public.weekly_reviews for select to authenticated
using (auth.uid() = user_id);

create policy "weekly_reviews_insert_own"
on public.weekly_reviews for insert to authenticated
with check (auth.uid() = user_id);

create policy "weekly_reviews_update_own"
on public.weekly_reviews for update to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "weekly_reviews_delete_own"
on public.weekly_reviews for delete to authenticated
using (auth.uid() = user_id);

commit;
```

### 3) Energy en acciones

```sql
alter table public.gtd_actions
add column if not exists energy text
check (energy in ('low','medium','high'));
```

### 4) Someday/Maybe en status (si tienes CHECK)

Si tu columna `status` tiene `CHECK`, agrega `someday` al constraint.

## Adjuntos sin upload API

La app usa links en textarea (uno por linea).  
Es una estrategia valida para no manejar almacenamiento/servidor de uploads.

Opciones compatibles:

- Google Drive
- Dropbox
- Notion links
- cualquier URL publica

## Estado actual

- Lint: OK
- Tests base: OK (`node:test`)

## Repositorio

- URL: `https://github.com/barrerasaezgonzalo/react-gtd-board` (actualiza con tu repo real)
- Branch principal sugerida: `main`

## Licencia

Proyecto interno / uso personal.

Si deseas publicar open-source, puedes cambiar a una licencia estandar (ej. MIT).
