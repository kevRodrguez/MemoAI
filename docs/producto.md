# Producto

## Vision

Memo App es un asistente de productividad voice-first para reuniones presenciales de equipos de desarrollo. La app escucha, estructura y convierte conversaciones fisicas en informacion accionable: resumen ejecutivo, transcripcion, tareas personales y contexto de reunion.

El objetivo no es ser solo una grabadora. Memo debe actuar como un asistente ejecutivo para reducir trabajo administrativo antes, durante y despues de una reunion.

## Usuario objetivo

Memo esta pensado para profesionales y equipos de desarrollo que hacen reuniones presenciales y necesitan mantener el flujo de trabajo sin detenerse a escribir minutas, asignaciones o notas manuales.

Usuarios principales:

- Desarrolladores que participan en discusiones tecnicas.
- Lideres tecnicos que necesitan capturar decisiones y compromisos.
- Product owners o responsables de seguimiento que necesitan resumen claro y tareas posteriores.

## Estado actual

El repo actual es una app Expo/React Native recien iniciada. Contiene estructura de frontend, navegacion base por tabs, assets de Memo y componentes del template. Todavia no hay implementacion de dominio para reuniones, tareas, Supabase, audio o Alma.

## Objetivo de producto

Memo se organiza en estos modulos objetivo:

- Procesamiento de reuniones en vivo: capturar audio, transcribir, resumir y detectar compromisos.
- Asistente post-reunion: procesar notas de voz o audios posteriores para generar planes de accion.
- Alma: agente interactivo de baja latencia en el home, con estados visuales y conversacionales.
- Gestion de reuniones y tareas: consultar reuniones, transcripciones, resumenes y tareas personales.
- Participacion compartida: permitir que usuarios invitados de Memo vean reuniones en las que participaron.

## Prioridades iniciales

La prioridad de documentacion y desarrollo debe favorecer primero:

- Base frontend solida en Expo SDK 57.
- Integracion con Supabase Auth, DB y Storage.
- Flujo de reuniones con audio, transcripcion y resumen.
- Modelo claro de tareas personales.
- Alma como interfaz funcional, antes de cerrar mascota o identidad visual final.

## Fuera de alcance

Por ahora no se debe disenar ni implementar funcionamiento de Zavu, n8n, integraciones de calendario ni CRUD de contactos. Tampoco se debe asumir un backend propio como parte del MVP de la app.
