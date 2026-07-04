# Arquitectura

## Estado actual

Este repo contiene solo el frontend movil/web de Memo construido con Expo. No existe backend propio, esquema Supabase aplicado en codigo ni integracion de voz implementada.

La app actual incluye:

- Expo SDK 57.
- React Native 0.86.
- React 19.2.
- Expo Router como entrypoint.
- Tabs base para Home y Explore.
- Assets de marca Memo.

## Arquitectura objetivo

La arquitectura objetivo es frontend-first:

```text
React Native / Expo app
  -> Supabase Auth
  -> Supabase API / Postgres
  -> Supabase Storage para audio
  -> ElevenLabs para voz realtime y conversacional
```

Supabase es la capa principal para autenticacion, persistencia y storage. La app debe poder leer y escribir datos de producto directamente contra Supabase, respetando las politicas de acceso que se definan en la base de datos.

## Responsabilidades del frontend

El frontend debe encargarse de:

- Gestionar sesion de usuario con Supabase Auth.
- Capturar o seleccionar audio desde el dispositivo cuando el flujo lo requiera.
- Mostrar estado de captura, procesamiento y resultados.
- Renderizar reuniones, resumenes, transcripciones y tareas personales.
- Mostrar Memo como interfaz de agente con estados claros.
- Enviar y consultar informacion de Supabase usando contratos tipados.

## Supabase

Supabase sera usado para:

- Auth de usuarios.
- API de lectura y escritura de datos.
- Postgres para reuniones, tareas, perfiles y participantes.
- Storage para archivos de audio de reuniones.

El audio crudo se guarda en bucket de Supabase. En la tabla de reuniones se persisten `audio_path`, `transcription` y `ai_summary`.

## Voz e IA

La capa de voz objetivo usa ElevenLabs:

- Modo escucha: Scribe v2 realtime para capturar/transcribir reuniones.
- Modo conversacional: ElevenLabs para interaccion directa con Memo.

La documentacion actual no define prompts, herramientas, agentes externos ni workflows operativos.

## Backend propio futuro

Un backend propio de Node.js puede existir mas adelante para exponer Memo a integraciones externas. No debe asumirse como backend principal de la app movil en esta etapa.

## Pendiente

Quedan pendientes:

- Politicas RLS de Supabase.
- Contratos TypeScript generados desde Supabase.
- Flujo tecnico exacto de carga de audio.
- Manejo de errores y reintentos de procesamiento.
- Estrategia de cache y offline.
