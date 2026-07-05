# Diseno y UX

## Direccion visual

Memo debe sentirse como una app movil moderna, enfocada y de baja friccion. La direccion actual es dark-first, con fondos oscuros, gradientes azules en las esquinas y una sensibilidad visual cercana a una app iOS contemporanea tipo Gemini.

La interfaz debe favorecer sesiones de voz, informacion clara y accion rapida. No debe sentirse como landing page ni dashboard pesado.

## Estado actual

El repo todavia conserva pantallas de template de Expo. Ya existen assets de marca Memo y una paleta base, pero no hay sistema visual completo ni componentes finales del producto.

## Principios de experiencia

- Voice-first: la accion principal debe poder iniciarse por voz o con una interaccion tactil minima.
- Baja carga cognitiva: durante una reunion, la app debe mostrar estado y resultados sin distraer.
- Claridad de estado: el usuario debe entender si Memo esta apagado, escuchando, procesando o respondiendo.
- Privacidad visible: grabacion, transcripcion y procesamiento deben tener estados explicitos.
- Tareas personales: las tareas se presentan como compromisos propios, no como elementos compartidos por toda la reunion.

## Memo

Memo es el agente interactivo del home. En esta etapa se documenta como concepto funcional, no como mascota visual cerrada.

Estados minimos:

- Apagada: la sesion de voz no esta activa.
- Escuchando: Memo esta capturando audio o esperando comando.
- Pensando: Memo procesa o consulta contexto.
- Hablando: Memo responde al usuario.

Memo debe comunicar estos estados mediante animacion, color, microinteracciones y feedback textual minimo.

## Pantallas objetivo

Pantallas esperadas para el producto:

- Home con Memo y control de sesion.
- Reuniones recientes.
- Detalle de reunion con audio, transcripcion y resumen.
- Tareas personales detectadas o creadas desde reuniones.
- Flujo post-reunion para subir o grabar nota de voz.
- Perfil/sesion de usuario.

## Pendiente

- Identidad visual final de Memo.
- Componentes definitivos de grabacion y reproduccion de audio.
- Sistema de estados vacios, carga y errores.
- Lineamientos de accesibilidad y contraste.
- Motion spec para animaciones de Memo.
