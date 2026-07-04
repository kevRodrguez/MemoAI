# Frontend

## Estado actual

El frontend esta basado en Expo SDK 57 con Expo Router. El codigo de aplicacion vive en `src/`.

Entrypoints actuales:

- `src/app/_layout.tsx`: configura tema, splash overlay y tabs.
- `src/app/index.tsx`: pantalla Home del template.
- `src/app/explore.tsx`: pantalla Explore del template.

Componentes base:

- `src/components/app-tabs.tsx`: tabs nativos con `expo-router/unstable-native-tabs`.
- `src/components/app-tabs.web.tsx`: tabs web con `expo-router/ui`.
- `src/components/themed-text.tsx` y `src/components/themed-view.tsx`: wrappers visuales.
- `src/components/animated-icon.tsx`: animacion/splash actual del template.

## Stack

- Expo `~57.0.2`.
- React Native `0.86.0`.
- React `19.2.3`.
- TypeScript.
- Expo Router.
- `expo-image`, `expo-symbols`, `expo-splash-screen`, `expo-glass-effect`.
- React Native Reanimated 4.

Antes de agregar o cambiar APIs de Expo, consultar siempre la documentacion exacta de SDK 57:

<https://docs.expo.dev/versions/v57.0.0/>

## Navegacion

La navegacion actual tiene dos tabs:

- Home: futuro lugar principal de Memo y del estado de sesion.
- Explore: pantalla de template que deberia ser reemplazada o reutilizada cuando exista una seccion real.

La estructura usa rutas file-based de Expo Router. Nuevas pantallas deben vivir bajo `src/app/` y respetar las convenciones de Expo Router SDK 57.

## Tema y assets

El tema base esta en `src/constants/theme.ts`. La paleta de marca inicial esta en `assets/colors.ts`:

- `mainBlue`: azul principal de Memo.
- `secondaryBlue`: azul secundario.
- `white`.
- `black`.

La app debe evolucionar hacia una experiencia dark-first con gradientes azules en esquinas, sin perder soporte de tema si se mantiene light/dark.

Assets relevantes:

- `assets/MemoIcon1080px.png`.
- `assets/MemoLogoName.png`.
- Iconos y splash en `assets/images/`.

## Convenciones

- Mantener TypeScript.
- Usar rutas y APIs compatibles con Expo SDK 57.
- Preferir componentes existentes antes de crear nuevas capas.
- Separar estado actual de vision futura en comentarios y docs.
- No introducir logica de backend propio en este repo.

## Pendiente

- Reemplazar contenido del template por experiencia Memo.
- Definir componentes reales para Memo.
- Agregar cliente Supabase.
- Agregar flujos de autenticacion.
- Agregar pantallas para reuniones y tareas personales.
- Definir pruebas y linting real del frontend.
