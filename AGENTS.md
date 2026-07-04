# Memo App - Guia para agentes

## Regla obligatoria de Expo

Expo ha cambiado. Antes de escribir codigo en este repo, lee la documentacion exacta versionada de Expo SDK 57:

https://docs.expo.dev/versions/v57.0.0/

El proyecto actual usa Expo `~57.0.2`, React Native `0.86.0`, React `19.2.3` y requiere Node compatible con `22.13.x+`.

## Contexto del producto

Memo App es un asistente de productividad voice-first para reuniones presenciales de equipos de desarrollo. Su objetivo es reducir la carga administrativa de una reunion: capturar audio, transcribir, resumir, estructurar compromisos y convertir informacion hablada en tareas personales y contexto reutilizable.

La experiencia principal gira alrededor de "Alma", un agente interactivo que vive en el home de la app. Alma tiene estados funcionales como apagada, escuchando, pensando y hablando. Su identidad visual final todavia no esta cerrada; por ahora debe tratarse como un concepto funcional con una direccion dark-first, gradientes azules en las esquinas y una sensibilidad visual cercana a una app iOS moderna tipo Gemini.

## Estado actual del repo

Este repo es solo frontend React Native/Expo. No contiene backend propio ni workflows externos.

Estado actual:

- App creada con Expo Router y Expo SDK 57.
- Pantallas iniciales de template en `src/app/index.tsx` y `src/app/explore.tsx`.
- Navegacion por tabs con `expo-router/unstable-native-tabs` en nativo y `expo-router/ui` en web.
- Assets de marca Memo disponibles en `assets/`.
- Paleta de marca inicial en `assets/colors.ts`.
- Tema base en `src/constants/theme.ts`.
- No hay logica de dominio implementada todavia para reuniones, tareas, audio, Supabase ni Alma.

## Stack y arquitectura objetivo

Stack vigente del frontend:

- React Native con Expo.
- Expo Router para navegacion file-based.
- TypeScript.
- Supabase como capa principal de Auth, API, base de datos y Storage.
- ElevenLabs para la capa de voz:
  - Modo escucha con Scribe v2 realtime.
  - Modo conversacional con ElevenLabs.

Arquitectura objetivo:

- La app movil consume Supabase directamente para autenticacion, lectura/escritura de datos y storage de audio.
- La app guarda audios de reuniones en un bucket de Supabase.
- La base de datos guarda transcripcion y resumen como campos persistidos de la reunion.
- Un backend propio podria existir mas adelante solo para exponer Memo a integraciones externas, no como backend principal de la app.

## Reglas de negocio conocidas

- Una reunion puede ser `LIVE` o `POST`.
- Las reuniones pueden incluir participantes invitados que tambien sean usuarios de Memo.
- Un participante invitado puede ver la reunion en la que participo, junto con resumen, audio y transcripcion.
- Las tareas son personales del usuario propietario y no se comparten con participantes de la reunion.
- No existe entidad de contactos en el modelo inicial.

## Fuera de alcance por ahora

No documentes ni implementes funcionamiento de Zavu, n8n, integraciones de calendario ni CRUD de contactos en este repo. Si aparecen en ideas antiguas, tratalas como fuera de alcance hasta que el producto las redefina.

## Documentacion del proyecto

Lee `docs/` antes de hacer cambios de producto o arquitectura:

- `docs/producto.md`: vision, usuarios, modulos y prioridades.
- `docs/arquitectura.md`: arquitectura frontend-first y relacion con Supabase.
- `docs/frontend.md`: estructura actual del frontend y convenciones.
- `docs/diseno.md`: direccion visual y UX.
- `docs/voz-y-alma.md`: modos de voz y comportamiento de Alma.
- `docs/datos-supabase.md`: contrato de datos y SQL base.
- `docs/roadmap.md`: fases, pendientes y limites.

## Convenciones de trabajo

- Mantener la documentacion en espanol.
- Distinguir siempre entre estado actual, objetivo y pendiente.
- No inventar APIs, tablas ni servicios que no esten en docs o codigo.
- Preferir componentes y patrones existentes del repo antes de introducir nuevas abstracciones.
- Si se agregan dependencias Expo, usar versiones compatibles con SDK 57 y verificar en la documentacion versionada.
