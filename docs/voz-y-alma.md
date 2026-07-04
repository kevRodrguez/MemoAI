# Voz y Alma

## Objetivo

La capa de voz permite que Memo capture reuniones y que Alma funcione como agente conversacional. La experiencia debe permitir trabajar sin tocar el teclado durante discusiones presenciales.

## Estado actual

No existe implementacion de captura de audio, transcripcion, ElevenLabs ni agente conversacional en el repo actual. Este documento define la direccion objetivo.

## Modos de voz

Memo tendra dos modos de voz con ElevenLabs:

- Modo escucha: usa Scribe v2 realtime para capturar y transcribir reuniones.
- Modo conversacional: usa ElevenLabs para interaccion directa con Alma.

El modo escucha esta orientado a reuniones completas. El modo conversacional esta orientado a preguntas o respuestas puntuales con baja latencia.

## Alma como interfaz

Alma vive en el home y funciona como el punto principal de interaccion. Debe tener un control claro de sesion para iniciar o detener escucha.

Estados funcionales:

- Apagada: no hay sesion activa.
- Escuchando: hay captura o espera activa.
- Pensando: se esta procesando informacion.
- Hablando: Alma esta respondiendo.

La UI debe representar estos estados con animacion y feedback breve. No se debe depender solo de texto para comunicar el estado.

## Reuniones en vivo

Flujo objetivo:

1. Usuario inicia sesion de escucha.
2. Memo captura audio en tiempo real.
3. El audio se procesa para generar transcripcion.
4. Al terminar, la reunion queda asociada a audio, transcripcion y resumen.
5. Las tareas detectadas se crean como tareas personales.

## Post-reunion

Flujo objetivo:

1. Usuario graba una nota de voz o sube audio posterior.
2. Memo procesa el audio como reunion tipo `POST`.
3. Se genera transcripcion y resumen.
4. Se extraen posibles tareas personales.

## Pendiente

- Libreria exacta de captura de audio en Expo SDK 57.
- Permisos nativos de microfono.
- Estrategia de streaming desde React Native.
- Manejo de cortes de red.
- UX de consentimiento y grabacion activa.
- Contrato final entre transcripcion, resumen y creacion de tareas.
