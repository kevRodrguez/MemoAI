# Frontend

## Estado actual

El frontend esta basado en Expo SDK 57 con Expo Router. El codigo de aplicacion vive en `src/`.

Entrypoints actuales:

- `src/app/_layout.tsx`: configura tema, splash overlay y tabs.
- `src/app/(protected)/index.tsx`: home principal de Memo.
- `src/app/(protected)/meetings.tsx`: placeholder protegido de reuniones.
- `src/app/(protected)/tasks.tsx`: placeholder protegido de tareas personales.
- `src/app/(protected)/profile.tsx`: placeholder protegido de perfil.

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
- `@expo/ui` para composer y controles nativos disponibles.
- React Native Reanimated 4.

Antes de agregar o cambiar APIs de Expo, consultar siempre la documentacion exacta de SDK 57:

<https://docs.expo.dev/versions/v57.0.0/>

## Navegacion

La navegacion actual tiene tres tabs protegidos:

- Meetings: placeholder de reuniones recientes.
- Chat: home principal de Memo.
- Tasks: placeholder de tareas personales.

La pantalla `profile` vive bajo el grupo protegido y se abre desde el header del home. Nuevas
pantallas deben vivir bajo `src/app/` y respetar las convenciones de Expo Router SDK 57.

## Home de Memo

El home protegido usa `GradientBackground`, logo de Memo en blanco, acciones de perfil/llamada/
escucha y una bubble central interactiva con estados locales:

- `off`
- `listening`
- `thinking`
- `speaking`

En iOS, las acciones de header usan `@expo/ui/swift-ui` desde componentes `.ios.tsx`. Las rutas
no deben importar `@expo/ui/swift-ui` directamente para mantener fallback web/Android. En otras
plataformas, los botones usan React Native y `expo-symbols`.

El composer inferior envia mensajes a `EXPO_PUBLIC_N8N_CHAT_WEBHOOK_URL` mediante el servicio
tipado `src/services/memo-webhooks.ts`.

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
- `assets/MemoLogoNameWhite.png`.
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
