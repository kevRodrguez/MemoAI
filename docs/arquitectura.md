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
  -> n8n webhooks para chat/procesamiento inicial
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

## n8n

n8n se incorpora como contrato explicito y acotado para esta etapa:

- `EXPO_PUBLIC_N8N_CHAT_WEBHOOK_URL`: recibe mensajes enviados desde el composer del home.
- `EXPO_PUBLIC_N8N_TRANSCRIPT_WEBHOOK_URL`: queda preparado para recibir transcripciones al cerrar
  una sesion de escucha.

El frontend envia JSON directamente a esos webhooks. Si una URL no esta configurada, el arranque
de la app debe continuar y el error debe aparecer solamente cuando el usuario intente usar la
accion correspondiente.

Contrato preparado para cierre de escucha:

```json
{
  "transcript": "texto transcrito",
  "meetingType": "LIVE",
  "userId": "uuid-auth-o-null",
  "profileId": "uuid-profile-o-null",
  "endedAt": "ISO-8601"
}
```

Este contrato no reemplaza Supabase como capa principal de datos. El procesamiento definitivo,
persistencia de resumenes y extraccion de tareas siguen pendientes de definicion.

## Backend propio futuro

Un backend propio de Node.js puede existir mas adelante para exponer Memo a integraciones externas. No debe asumirse como backend principal de la app movil en esta etapa.

## Pendiente

Quedan pendientes:

- Politicas RLS de Supabase.
- Contratos TypeScript generados desde Supabase.
- Flujo tecnico exacto de carga de audio.
- Manejo de errores y reintentos de procesamiento.
- Estrategia de cache y offline.
