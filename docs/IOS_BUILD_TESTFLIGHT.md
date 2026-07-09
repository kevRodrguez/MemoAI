# Guía: Build iOS local (EAS) + TestFlight — Teffi

Guía de referencia para compilar Teffi en Mac y distribuirla por TestFlight como app **standalone** (sin depender de Metro ni de la Mac encendida).

**Enfoque adoptado en Teffi:**

- Compilación: `eas build --local` en Mac (no consume cuota de builds en nube de Expo).
- Perfil EAS: `preview` (no `production` — reservado para lanzamiento App Store).
- Distribución: **TestFlight** (testers internos).

---

## Tabla de contenidos

1. [Contexto y decisiones](#contexto-y-decisiones)
2. [Prerrequisitos en Mac](#prerrequisitos-en-mac)
3. [Configuración EAS (](#configuración-eas-easjson)`eas.json`[)](#configuración-eas-easjson)
4. [Apple Developer y App Store Connect](#apple-developer-y-app-store-connect)
5. [App Store Connect API Key (evitar 2FA)](#app-store-connect-api-key-evitar-2fa)
6. [Credenciales iOS (](#credenciales-ios-eas-credentials)`eas credentials`[)](#credenciales-ios-eas-credentials)
7. [Variables de entorno para build local](#variables-de-entorno-para-build-local)
8. [Sentry: DSN vs auth token](#sentry-dsn-vs-auth-token)
9. [Build local](#build-local)
10. [Submit a TestFlight](#submit-a-testflight)
11. [Instalar y probar en iPhone](#instalar-y-probar-en-iphone)
12. [Flujo para builds futuros](#flujo-para-builds-futuros)
13. [Desarrollo diario vs TestFlight](#desarrollo-diario-vs-testflight)
14. [Solución de problemas](#solución-de-problemas)
15. [FAQ](#faq)

---



## Contexto y decisiones



### ¿EAS Build es la única opción?

No. Con Mac también puedes compilar localmente. Para TestFlight siempre necesitas un `.ipa` **firmado en Release** subido a App Store Connect.


| Método               | ¿Cuota EAS?                  | ¿TestFlight? | Notas                       |
| -------------------- | ---------------------------- | ------------ | --------------------------- |
| `eas build --local`  | **No**                       | Sí           | Enfoque de Teffi            |
| `eas build` (nube)   | Sí (15 iOS/mes en plan Free) | Sí           | Más simple si no tienes Mac |
| `expo run:ios`       | No                           | No           | Solo dev/debug              |
| Xcode Archive manual | No                           | Sí           | Más fricción con signing    |




### ¿Por qué TestFlight y no dev client?


| Tipo                           | ¿Funciona sin Mac/Metro? | Uso                                                  |
| ------------------------------ | ------------------------ | ---------------------------------------------------- |
| **Dev client** (`development`) | No                       | Hot reload con `expo start --dev-client`             |
| **Preview** (`preview`)        | **Sí**                   | App real en el iPhone vía TestFlight                 |
| **Production**                 | Sí                       | Igual técnicamente; reservado para App Store pública |


Teffi tiene módulo nativo propio (`modules/glass-surface`) — no funciona en Expo Go. Para uso diario en el celular sin Mac, un build `preview` + TestFlight es el camino correcto.

### ¿Por qué perfil `preview` y no `production`?

El nombre del perfil en `eas.json` es **solo una etiqueta**. `production` no significa que la app ya esté en la App Store.

- `preview` → builds de prueba / TestFlight mientras desarrollas.
- `production` → cuando publiques en la tienda.

Ambos usan `distribution: "store"` para TestFlight.

### Expo org vs Apple enrollment


| Concepto                  | Teffi                                                                     | ¿Afecta signing?     |
| ------------------------- | ------------------------------------------------------------------------- | -------------------- |
| Org Expo (`owner: teffi`) | Proyecto en expo.dev                                                      | No                   |
| Apple Team Type           | **Individual** o **Company** según cómo te inscribiste en Apple ($99/año) | **Sí**               |
| Bundle ID                 | `app.teffi.mobile`                                                        | Sí                   |
| Slug Expo                 | `teffi` (ligado al `projectId`, no renombrable)                           | No afecta TestFlight |


Al configurar credenciales en EAS, elige **Individual** si tu membresía Apple Developer es personal, aunque el proyecto Expo esté bajo la org `teffi`.

---



## Prerrequisitos en Mac



### Herramientas obligatorias para `eas build --local` iOS

Verifica **todas** antes del primer build:

```bash
xcode-select -p
xcodebuild -version      # Xcode 16+ recomendado (Expo 55)
node -v                  # Node 20+
eas --version            # >= 16.0.1 (idealmente última: npm i -g eas-cli)
fastlane --version       # brew install fastlane
pod --version            # brew install cocoapods
```

Si falta algo:

```bash
brew install fastlane cocoapods
npm install -g eas-cli@latest
sudo xcodebuild -license accept
eas login
```



### Cuentas necesarias

- [x] Cuenta Expo (org `teffi`, `projectId` en `app.json`)
- [x] Apple Developer Program ($99/año)
- [x] App ID `app.teffi.mobile` en [developer.apple.com](https://developer.apple.com)
- [ ] App **Teffi** creada en [App Store Connect](https://appstoreconnect.apple.com) (antes de `eas submit`)

---



## Configuración EAS (`eas.json`)



### `eas init`

```bash
cd TeffiMobile
eas init
```

Vincula el proyecto existente (`projectId: f88ac34d-f098-4ef0-b43e-8189fd2e7fbb`).

#### Prompt: owner mismatch (`teffi` vs `kevrodrguez`)

Responde `Y` — el proyecto en expo.dev vive bajo la org **teffi**.

#### Prompt: slug mismatch (`teffi` vs `teffi-mobile`)

El slug **no se puede cambiar** en un proyecto EAS existente ([expo.fyi/eas-project-id](https://expo.fyi/eas-project-id)). No hay opción "rename slug" en expo.dev.

Responde `Y` → `app.json` queda con `"slug": "teffi"`. El slug solo afecta la URL interna de Expo, no TestFlight ni el nombre en el iPhone.

### Contenido de `eas.json`

```json
{
  "cli": {
    "version": ">= 16.0.1",
    "appVersionSource": "remote"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "ios": { "simulator": false }
    },
    "preview": {
      "distribution": "store",
      "autoIncrement": true,
      "env": {
        "APP_VARIANT": "preview",
        "SENTRY_DISABLE_AUTO_UPLOAD": "true"
      }
    },
    "production": {
      "distribution": "store",
      "autoIncrement": true,
      "env": { "APP_VARIANT": "production" }
    }
  },
  "submit": {
    "preview": {},
    "production": {}
  }
}
```

`autoIncrement: true` incrementa el build number automáticamente en cada build (necesario para que Apple acepte binarios nuevos en TestFlight).

---



## Apple Developer y App Store Connect



### Son dos sitios distintos


| Sitio                                                          | Qué configuras                                          |
| -------------------------------------------------------------- | ------------------------------------------------------- |
| [developer.apple.com](https://developer.apple.com)             | App ID, capabilities (Sign in with Apple), certificados |
| [appstoreconnect.apple.com](https://appstoreconnect.apple.com) | Registro de app, TestFlight, subida de `.ipa`           |


Tener el **Identifier** en Developer **no crea** la app en App Store Connect.

### Crear la app en App Store Connect (obligatorio antes de submit)

1. **Apps** → **+** → **New App**
2. Campos:


| Campo       | Valor Teffi                         |
| ----------- | ----------------------------------- |
| Platform    | iOS                                 |
| Name        | Teffi                               |
| Bundle ID   | `app.teffi.mobile`                  |
| SKU         | `teffi-mobile-ios` (interno, único) |
| User Access | Full Access                         |


**User Access** controla qué miembros del **equipo** ven la app en el panel de App Store Connect. **No** hace la app pública ni descargable por cualquiera.

1. **App Information** → anota el **Apple ID** numérico (~10 dígitos) para `eas submit` si lo pide.



### Sign in with Apple

En Developer Portal → **Identifiers** → `app.teffi.mobile` → capability **Sign in with Apple** habilitada (ya en `app.json`: `usesAppleSignIn: true`).

---



## App Store Connect API Key (evitar 2FA)

El login con Apple ID + 2FA en `eas credentials` / `eas build` falla a menudo (códigos por llamada, SMS, *"Invalid code"*, *"Too many verification codes"*).

**Solución recomendada:** API Key de App Store Connect.

### Crear la key

1. [App Store Connect](https://appstoreconnect.apple.com) → **Users and Access** → **Integrations** → **App Store Connect API**
2. **+** → nombre ej. `EAS Teffi` → rol **Admin** o **App Manager**
3. **Download** del `.p8` (solo una vez)
4. Anota **Key ID** e **Issuer ID**



### Guardar la key en `appstore.apikey.env`

Evita rutas con espacios (`Teffi Docs/...`). Mejor:

```bash
mkdir -p ~/.app-store-connect
mv AuthKey_XXXXXXXXXX.p8 ~/.app-store-connect/
cp appstore.apikey.env.example appstore.apikey.env
```

Edita `appstore.apikey.env`:

```bash
export EXPO_ASC_API_KEY_PATH="$HOME/.app-store-connect/AuthKey_Z5JJUUUHSQ.p8"
export EXPO_ASC_KEY_ID="Z5JJUUUHSQ"
export EXPO_ASC_ISSUER_ID="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
export EXPO_APPLE_TEAM_ID="R9R2B4WXYX"
```

**Team ID:** [developer.apple.com/account](https://developer.apple.com/account) → **Membership** → 10 caracteres alfanuméricos.

Rutas con espacios **requieren comillas** en el archivo `export`.

El script `[scripts/load-preview-env.sh](../scripts/load-preview-env.sh)` carga este archivo automáticamente — no hace falta exportar a mano en cada sesión.

---



## Credenciales iOS (`eas credentials`)

```bash
eas credentials -p ios
```



### Menú principal


| Opción                                 | Cuándo                                               |
| -------------------------------------- | ---------------------------------------------------- |
| **Build Credentials**                  | **Primera vez** — certificado + provisioning profile |
| Push Notifications                     | Solo si usas push                                    |
| App Store Connect: Manage your API Key | Registrar `.p8` en EAS (alternativa a env vars)      |




### Build Credentials → All

1. Perfil: `preview`
2. **All: Set up all the required credentials**
3. Apple Team Type: **Individual** (si tu membresía Apple es personal) o **Company/Organization** (si te inscribiste como empresa)
4. **Generate a new Apple Distribution Certificate?** → **Y**
5. **Generate a new Apple Provisioning Profile?** → **Y**

Resultado esperado:

```
Distribution Certificate  — App Store, activo
Provisioning Profile      — app.teffi.mobile, activo
Apple Team                — R9R2B4WXYX (ejemplo)
```



### Si pide login con Apple ID

Con las env vars `EXPO_ASC_*` exportadas, EAS debería usar la API key. Si aún pregunta y las credenciales **ya están en el servidor de Expo** (`Using remote iOS credentials`), responde `no` al login de Apple — no es necesario en cada build.

---



## Variables de entorno para build local

En builds `--local`, las variables EAS "Secret" de la nube **no se inyectan**. Usa archivos locales gitignored + el script de carga.

### Setup inicial (una vez)

```bash
cp .env.preview.local.example .env.preview.local
cp appstore.apikey.env.example appstore.apikey.env
cp sentry.build.env.example sentry.build.env   # opcional — ver sección Sentry
# Editar los tres con valores reales
```



### Archivos de entorno (no commitear)


| Archivo                                                 | Plantilla                     | Cuándo se usa                      | Contenido                            |
| ------------------------------------------------------- | ----------------------------- | ---------------------------------- | ------------------------------------ |
| `[.env.preview.local](../.env.preview.local.example)`   | `.env.preview.local.example`  | Runtime en la app empaquetada      | `EXPO_PUBLIC_*` (Supabase, API, DSN) |
| `[appstore.apikey.env](../appstore.apikey.env.example)` | `appstore.apikey.env.example` | Build + submit (EAS ↔ Apple)       | `EXPO_ASC_*`, Team ID                |
| `[sentry.build.env](../sentry.build.env.example)`       | `sentry.build.env.example`    | Solo durante el compile (opcional) | `SENTRY_AUTH_TOKEN`                  |


**Crítico:** `EXPO_PUBLIC_API_SYNC_URL` debe ser `https://` en release o `syncApi.ts` crashea al abrir.

### Script `[scripts/load-preview-env.sh](../scripts/load-preview-env.sh)`

Carga los tres archivos si existen. Ejecutar en **cada sesión nueva** de Terminal:

```bash
source scripts/load-preview-env.sh
```

Salida esperada:

```
Variables preview cargadas.
  EXPO_PUBLIC_API_SYNC_URL=https://api.teffi.app/api
  EXPO_ASC_KEY_ID=Z5JJUUUHSQ
```

Si falta `.env.preview.local`, el script termina con error. Si falta `appstore.apikey.env`, avisa pero continúa (EAS puede pedir login Apple).

---



## Sentry: DSN vs auth token

Son **dos cosas distintas** con momentos distintos:


| Variable                 | Cuándo                                 | Para qué                                  |
| ------------------------ | -------------------------------------- | ----------------------------------------- |
| `EXPO_PUBLIC_SENTRY_DSN` | **Runtime** (app en el iPhone)         | Enviar crashes y errores a Sentry         |
| `SENTRY_AUTH_TOKEN`      | **Build time** (`sentry-cli` en Xcode) | Subir **source maps** y símbolos de debug |




### ¿Para qué sirve el auth token?

Sin source maps, Sentry **sí recibe** los crashes (si el DSN está en el build), pero el stack trace aparece **minificado/ofuscado** — difícil de leer en producción:

```
at a (main.jsbundle:1:28491)
at b (main.jsbundle:1:30102)
```

Con source maps subidos en el build, Sentry muestra archivos y líneas reales:

```
at syncApi.ts:36
at HomeScreen (index.tsx:42)
```

El plugin `@sentry/react-native` corre `sentry-cli` automáticamente durante el archive. Sin token, ese paso falla (a menos que lo desactives).

### ¿Es recomendado en producción?

**Sí.** Para App Store / usuarios reales conviene tener source maps para depurar crashes rápido.

En **preview / TestFlight** es opcional: el DSN basta para ver que hay errores; los stacks ilegibles suelen ser aceptables mientras iteras.

### Configuración actual en Teffi


| Perfil       | Source maps en build                                               | Crashes en runtime                |
| ------------ | ------------------------------------------------------------------ | --------------------------------- |
| `preview`    | **Desactivados** (`SENTRY_DISABLE_AUTO_UPLOAD=true` en `eas.json`) | Sí (vía `EXPO_PUBLIC_SENTRY_DSN`) |
| `production` | **Recomendado activar** con `SENTRY_AUTH_TOKEN`                    | Sí                                |




### ¿Por qué no activarlo desde ya?

**Puedes hacerlo cuando quieras** — no hay impedimento técnico:

1. [sentry.io](https://sentry.io) → **Settings → Developer Settings → Organization Tokens** → **Create New Token**
2. Org: **teffi-app** (no uses *Personal Token* — es para API de usuario, no CI)
3. Copia el token (`sntrys_...`) a `sentry.build.env` (desde `sentry.build.env.example`). Solo se muestra una vez.
4. Quita `SENTRY_DISABLE_AUTO_UPLOAD` del perfil `preview` en `eas.json` (o ponlo en `false`)

`load-preview-env.sh` ya carga `sentry.build.env` si existe.

**Por qué empezamos sin token:** desbloquear el primer build a TestFlight sin otra credencial más. El DSN ya reporta crashes; los source maps son mejora de diagnóstico, no requisito para instalar la app.

### Alternativas si no quieres token en local


| Opción                                    | Efecto                                                |
| ----------------------------------------- | ----------------------------------------------------- |
| `SENTRY_DISABLE_AUTO_UPLOAD=true`         | Omite subida; build pasa (config actual en `preview`) |
| `SENTRY_ALLOW_FAILURE=true`               | Intenta subir; si falla, el build **no** se aborta    |
| `SENTRY_AUTH_TOKEN` en `sentry.build.env` | Sube source maps correctamente                        |


---



## Build local

```bash
cd TeffiMobile
source scripts/load-preview-env.sh
eas build -p ios --profile preview --local
```



### Prompts durante el build


| Pregunta                      | Respuesta                                                                  |
| ----------------------------- | -------------------------------------------------------------------------- |
| Standard/exempt encryption?   | **Y** (HTTPS estándar; `ITSAppUsesNonExemptEncryption: false` en app.json) |
| Log in to your Apple account? | **No** (si credenciales remotas ya configuradas y API key exportada)       |
| Apple Team Type               | **Individual** (según tu membresía Apple)                                  |




### Qué hace EAS localmente

1. Valida proyecto en expo.dev
2. Descarga credenciales del servidor Expo
3. `expo prebuild` → genera `ios/` (gitignored)
4. `pod install`
5. `xcodebuild` Release (~15–40 min la primera vez)



### Resultado

```
Build successful
Artifacts: .../TeffiMobile/build-1234567890.ipa
```

---



## Submit a TestFlight

**Requisito:** app Teffi creada en App Store Connect.

```bash
eas submit -p ios --profile preview --path ./build-XXXXXXXXXX.ipa
```

Con API key exportada, no debería pedir 2FA.

**Alternativa:** app **Transporter** de Apple → arrastrar el `.ipa` → Deliver.

En App Store Connect → **TestFlight** → el build pasa por **Processing** (~5–30 min).

---



## Instalar y probar en iPhone



### Testers internos

1. App Store Connect → **TestFlight** → **Internal Testing**
2. Grupo + build procesado
3. Testers internos (hasta 100) — acceso **inmediato**, sin beta review



### En el iPhone

1. Instalar app **TestFlight** desde App Store
2. Abrir invitación o TestFlight → **Install** en Teffi
3. La app arranca **sin Metro** y **sin Mac**



### Smoke test

- [ ] App abre sin crash
- [ ] Login Supabase (email + Apple Sign In)
- [ ] SQLite offline + sync con API
- [ ] UI `glass-surface` (módulo nativo)

Si falla solo en TestFlight y no en simulador → casi siempre **env vars incorrectas en el build**.

---



## Flujo para builds futuros

Cada nueva versión en TestFlight:

```bash
cd TeffiMobile
source scripts/load-preview-env.sh
eas build -p ios --profile preview --local
eas submit -p ios --profile preview --path ./build-*.ipa
```

Utilidades:

```bash
eas build:version:get -p ios
eas build:list
eas credentials -p ios
```

---



## Desarrollo diario vs TestFlight


| Objetivo                                 | Flujo                                       |
| ---------------------------------------- | ------------------------------------------- |
| Hot reload en simulador                  | `npm start` + `npm run ios`                 |
| App en iPhone sin Mac                    | Build `preview` → TestFlight                |
| Solo cambios JS                          | Rebuild preview (o EAS Update en el futuro) |
| Cambios nativos (plugins, glass-surface) | Rebuild preview obligatorio                 |


**No** uses perfil `development` para TestFlight — requiere Metro.

### ¿Dos apps en el iPhone (dev + TestFlight)?

Con el mismo bundle ID solo hay **una** app instalada. Para ambas a la vez necesitas bundle ID distinto para dev (ej. `app.teffi.mobile.dev`).

---



## Solución de problemas


| Error                                   | Causa                                  | Solución                                                                               |
| --------------------------------------- | -------------------------------------- | -------------------------------------------------------------------------------------- |
| `spawn fastlane ENOENT`                 | Fastlane no instalado                  | `brew install fastlane`                                                                |
| `pod --version exited with non-zero`    | CocoaPods no instalado                 | `brew install cocoapods`                                                               |
| `export: not valid in this context`     | Ruta con espacios sin comillas         | `export VAR="/ruta/con espacios/file.p8"`                                              |
| `Invalid code` (2FA Apple)              | Bug conocido EAS + llamada/SMS         | API Key `EXPO_ASC_*`; ver [eas-cli#1725](https://github.com/expo/eas-cli/issues/1725)  |
| `Too many verification codes`           | Rate limit Apple                       | Esperar 30–60 min; usar API Key; no reintentar login Apple                             |
| `Slug does not match projectId`         | slug local ≠ slug del proyecto EAS     | Alinear a `teffi` en `app.json`                                                        |
| `No suitable application records found` | Falta app en App Store Connect         | Crear Teffi en ASC (sección arriba)                                                    |
| `sentry-cli` Auth token is required     | Plugin Sentry sin token ni disable     | `preview` tiene `SENTRY_DISABLE_AUTO_UPLOAD=true`. O crea `sentry.build.env` con token |
| Login Apple en cada build               | Innecesario si credenciales remotas OK | **No** al prompt; usar `appstore.apikey.env` + `load-preview-env.sh`                   |
| App crashea al abrir en TestFlight      | Env no cargada o API sin https         | `source scripts/load-preview-env.sh` antes del build                                   |




### Limpiar caché de auth Apple en EAS

```bash
rm -rf ~/.app-store/
```



### Logs de build local fallido

```bash
EAS_LOCAL_BUILD_SKIP_CLEANUP=1 eas build -p ios --profile preview --local
# revisar ios/logs/
```

---



## FAQ

**¿**`eas build --local` **consume los 15 builds iOS/mes del plan Free?**  
No. Solo los builds en la nube de Expo cuentan.

**¿**`npx testflight`**?**  
Usa perfil `production` por defecto. Para Teffi usa `--profile preview` explícito.

**¿Puedo cambiar el slug a** `teffi-mobile` **en expo.dev?**  
No en un proyecto existente. El `projectId` está ligado al slug original.

**¿Individual o Company en EAS credentials?**  
Depende de cómo te inscribiste en **Apple Developer**, no de la org Expo.

**¿Tengo que reexportar variables al abrir Terminal nueva?**  
Sí. Ejecuta `source scripts/load-preview-env.sh` — carga `.env.preview.local`, `appstore.apikey.env` y `sentry.build.env`.

**¿Qué es** `EXPO_PUBLIC_SENTRY_DSN` **vs** `SENTRY_AUTH_TOKEN`**?**  
DSN = la app envía crashes en runtime. Auth token = el build sube source maps para leer esos crashes. Ver [Sentry: DSN vs auth token](#sentry-dsn-vs-auth-token).

**¿Debo configurar el auth token de Sentry ya?**  
Opcional en preview (deshabilitamos upload en `eas.json`). Recomendado en `production` antes del lanzamiento App Store.

---



## Referencia rápida

```bash
# Setup inicial (una vez)
cp .env.preview.local.example .env.preview.local
cp appstore.apikey.env.example appstore.apikey.env
# opcional: cp sentry.build.env.example sentry.build.env

eas login && eas init
eas credentials -p ios    # Build Credentials → All → preview

# Cada build TestFlight
source scripts/load-preview-env.sh
eas build -p ios --profile preview --local
eas submit -p ios --profile preview --path ./build-*.ipa
```

**Identificadores Teffi:**


| Campo                   | Valor                                  |
| ----------------------- | -------------------------------------- |
| Bundle ID               | `app.teffi.mobile`                     |
| Expo owner              | `teffi`                                |
| Expo slug               | `teffi`                                |
| EAS projectId           | `f88ac34d-f098-4ef0-b43e-8189fd2e7fbb` |
| Perfil build TestFlight | `preview`                              |


