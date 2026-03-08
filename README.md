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

### Navegacion

- Sidebar: vistas operativas principales
- Header (desktop):
  - Search global en vivo
  - Calendar
  - Kanban
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

### 2) Energy en acciones

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

- URL: `https://github.com/barrerasaezgonzalo/react-gtd-board`
- Branch principal sugerida: `main`
- Prueba la aplicación directamente en [React GTD([https://react-prompt-improver.vercel.app](https://react-gtd-board.vercel.app/)/).

## 📸 Capturas de pantalla

<img width="1891" height="867" alt="Captura de pantalla 2026-03-08 012502" src="https://github.com/user-attachments/assets/b9def530-6cd5-4193-a6ee-ad82bf9cdd4a" />
<img width="1854" height="893" alt="Captura de pantalla 2026-03-08 012453" src="https://github.com/user-attachments/assets/bd7a57b5-9ea2-489b-83e5-7337f75ef732" />
<img width="1898" height="877" alt="Captura de pantalla 2026-03-08 012438" src="https://github.com/user-attachments/assets/4d9ec7b3-d63c-4356-ab28-4af68d2a7400" />
<img width="1903" height="905" alt="Captura de pantalla 2026-03-08 012342" src="https://github.com/user-attachments/assets/19ebc6f2-d060-4b7e-91e4-d13202ebb801" />
<img width="1871" height="894" alt="Captura de pantalla 2026-03-08 012244" src="https://github.com/user-attachments/assets/b47e82e3-2370-43b0-b7bf-df454ae440f0" />


## Licencia

Proyecto interno / uso personal.

Si deseas publicar open-source, puedes cambiar a una licencia estandar (ej. MIT).
