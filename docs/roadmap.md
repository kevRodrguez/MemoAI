# Roadmap

## Estado actual

Memo esta en fase inicial de frontend. El repo conserva pantallas del template de Expo y aun no implementa flujos reales de producto.

## Fase 1: Base frontend

Objetivo:

- Reemplazar template por experiencia Memo.
- Crear Home con Memo como centro de interaccion.
- Definir navegacion real de la app.
- Consolidar tema visual dark-first.
- Mantener compatibilidad con Expo SDK 57.

## Fase 2: Supabase

Objetivo:

- Agregar Supabase Auth.
- Conectar perfiles de usuario.
- Implementar reuniones, participantes y tareas personales.
- Guardar audio en Supabase Storage.
- Mostrar audio, transcripcion y resumen en detalle de reunion.

## Fase 3: Voz

Objetivo:

- Implementar captura de audio.
- Integrar ElevenLabs Scribe v2 realtime para modo escucha.
- Integrar modo conversacional de ElevenLabs para Memo.
- Definir estados visuales de sesion y procesamiento.

## Fase 4: Inteligencia de reuniones

Objetivo:

- Generar resumen ejecutivo.
- Extraer tareas personales desde reuniones.
- Distinguir reuniones `LIVE` y `POST`.
- Permitir que participantes invitados consulten reunion, resumen, audio y transcripcion.

## Fase futura: integraciones externas

Un backend propio de Node.js puede agregarse mas adelante para exponer Memo a integraciones externas. Esta fase no pertenece al MVP frontend y no debe bloquear la implementacion inicial.

## Pendiente

- Definir politicas de privacidad y consentimiento.
- Definir retencion de audio.
- Definir pruebas automatizadas.
- Definir observabilidad y manejo de errores.
- Definir experiencia offline o de red inestable.
