# Datos y Supabase

## Estado actual

El repo no contiene cliente Supabase ni migraciones aplicadas. Este documento registra el contrato base de datos objetivo para orientar futuras implementaciones.

## Supabase en Memo

Supabase sera la fuente principal para:

- Auth de usuarios.
- API de lectura y escritura.
- Postgres para datos estructurados.
- Storage para audio de reuniones.

El audio de cada reunion se guarda en un bucket de Supabase. La tabla `meetings` conserva la ruta del audio en `audio_path`, la transcripcion en `transcription` y el resumen generado en `ai_summary`.

## Reglas de acceso y negocio

- Las tareas pertenecen a un perfil y son personales.
- Una tarea puede estar asociada opcionalmente a una reunion mediante `tasks.meeting_id`.
- Las reuniones pertenecen a un perfil propietario.
- Una reunion puede tener participantes invitados mediante `meeting_participants`.
- Un participante puede ver resumen, audio y transcripcion de reuniones en las que participo.
- Las tareas no se comparten con participantes de una reunion.
- No existe entidad de contactos en el modelo inicial.

## SQL base

```sql
-- Habilitar la extension pgcrypto si usas una version anterior a PostgreSQL 13 (opcional, gen_random_uuid ya viene nativo en las mas recientes)
-- CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1. Crear el ENUM para el tipo de reunion
CREATE TYPE meeting_type_enum AS ENUM ('LIVE', 'POST');

-- 2. Tabla: profiles
CREATE TABLE profiles (
    profile_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_users_id UUID, -- Asumiendo que 'auth.users' es de Supabase o un esquema externo
    name TEXT,
    user_name TEXT,
    email TEXT,
    avatar_url TEXT
);

-- 3. Tabla: meetings
CREATE TABLE meetings (
    meeting_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID REFERENCES profiles(profile_id) ON DELETE CASCADE,
    title TEXT,
    date_time TIMESTAMPTZ, -- Usando TIMESTAMPTZ para manejar zonas horarias (recomendado)
    duration INTEGER,
    audio_path TEXT,
    transcription TEXT,
    ai_summary TEXT,
    status TEXT,
    meeting_type meeting_type_enum
);

-- 4. Tabla: tasks
CREATE TABLE tasks (
    task_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID REFERENCES profiles(profile_id) ON DELETE CASCADE,
    meeting_id UUID REFERENCES meetings(meeting_id) ON DELETE SET NULL,
    title TEXT,
    description TEXT,
    priority_level TEXT,
    status TEXT,
    deadline DATE
);

-- 5. Tabla: meeting_participants
CREATE TABLE meeting_participants (
    meeting_participant_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID REFERENCES profiles(profile_id) ON DELETE CASCADE,
    meeting_id UUID REFERENCES meetings(meeting_id) ON DELETE CASCADE,
    accepted BOOLEAN DEFAULT FALSE
);
```

## Pendiente

- Definir politicas RLS para propietarios y participantes.
- Definir bucket, rutas y reglas de Storage.
- Definir estados permitidos para `tasks.status`, `tasks.priority_level` y `meetings.status`.
- Relacionar `profiles.auth_users_id` con `auth.users.id`.
- Generar tipos TypeScript desde Supabase.
- Definir migraciones versionadas.
