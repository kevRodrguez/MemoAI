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

El repo actual es una app Expo/React Native recien iniciada. Contiene estructura de frontend, navegacion base por tabs, assets de Memo y componentes del template. Todavia no hay implementacion de dominio para reuniones, tareas, Supabase, audio o Memo.

## Objetivo de producto

Memo se organiza en estos modulos objetivo:

- Procesamiento de reuniones en vivo: capturar audio, transcribir, resumir y detectar compromisos.
- Asistente post-reunion: procesar notas de voz o audios posteriores para generar planes de accion.
- Memo: agente interactivo de baja latencia en el home, con estados visuales y conversacionales.
- Gestion de reuniones y tareas: consultar reuniones, transcripciones, resumenes y tareas personales.
- Participacion compartida: permitir que usuarios invitados de Memo vean reuniones en las que participaron.

## Prioridades iniciales

La prioridad de documentacion y desarrollo debe favorecer primero:

- Base frontend solida en Expo SDK 57.
- Integracion con Supabase Auth, DB y Storage.
- Flujo de reuniones con audio, transcripcion y resumen.
- Modelo claro de tareas personales.
- Memo como interfaz funcional, antes de cerrar mascota o identidad visual final.

## Contrato n8n acotado

El home de Memo puede enviar mensajes de chat a un webhook de n8n configurado por ambiente.
Este contrato es una integracion tecnica inicial para prototipar respuesta y procesamiento, no
un backend principal ni una definicion completa de automatizaciones externas.

Payload minimo de chat:

```json
{
  "message": "texto del usuario",
  "userId": "uuid-auth-o-null",
  "profileId": "uuid-profile-o-null",
  "userEmail": "correo-o-null",
  "sentAt": "ISO-8601",
  "source": "memo-home"
}
```

La respuesta puede incluir `reply`, `message` o `text` para mostrarse como ultima respuesta de
Memo. Si falta `EXPO_PUBLIC_N8N_CHAT_WEBHOOK_URL`, la app no debe fallar al iniciar; debe
mostrar un error amigable cuando el usuario intente enviar el mensaje.

## Fuera de alcance

Por ahora no se debe disenar ni implementar funcionamiento de Zavu, integraciones de calendario
ni CRUD de contactos. n8n queda limitado al contrato de webhook descrito arriba hasta que el
producto redefina una automatizacion mas amplia. Tampoco se debe asumir un backend propio como
parte del MVP de la app.
