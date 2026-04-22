# MusicTwins Frontend

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-149eca?logo=react&logoColor=white)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178c6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-06b6d4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Estado](https://img.shields.io/badge/estado-en%20desarrollo-e06c1a)](#)
[![Repositorio](https://img.shields.io/badge/licencia-private-6b6a67)](#)

Frontend oficial de MusicTwins: una experiencia social musical construida sobre Next.js (App Router) donde los usuarios conectan por afinidad de escucha, comparten actividad, conversan en tiempo real y gestionan su perfil.

## Tabla De Contenidos

- [Resumen](#resumen)
- [Stack Tecnico](#stack-tecnico)
- [Caracteristicas](#caracteristicas)
- [Arquitectura Del Proyecto](#arquitectura-del-proyecto)
- [Requisitos Previos](#requisitos-previos)
- [Instalacion Y Ejecucion](#instalacion-y-ejecucion)
- [Variables De Entorno](#variables-de-entorno)
- [Scripts Disponibles](#scripts-disponibles)
- [Rutas De La App](#rutas-de-la-app)
- [Flujo De Autenticacion](#flujo-de-autenticacion)
- [Guia De Contribucion](#guia-de-contribucion)
- [API Contract Por Modulo](#api-contract-por-modulo)
- [Checklist De Release](#checklist-de-release)
- [Plantilla De Pull Request](#plantilla-de-pull-request)
- [Despliegue](#despliegue)

## Resumen

MusicTwins combina:

- Landing editorial para onboarding.
- Dashboard social para actividad musical en tiempo real.
- Módulos de feed, mensajería, twin-match y perfil.
- Integración con backend vía REST y Socket.IO.

## Stack Tecnico

- Framework: Next.js 16 (App Router)
- UI: React 19 + Tailwind CSS
- Lenguaje: TypeScript
- Estado global: Zustand
- Tiempo real: Socket.IO Client
- Animaciones: Framer Motion
- Iconografía: IconScout React Unicons

## Caracteristicas

- UI editorial/noir consistente entre landing y app interna.
- Feed con actividad social musical y tendencias.
- Chat entre usuarios con soporte de eventos en tiempo real.
- Vista Twin Match para gestión de amistades y conexiones.
- Perfil de usuario con información de cuenta y estado musical.

## Arquitectura Del Proyecto

```text
src/
	app/                    # Rutas App Router (paginas)
	core/
		api/                  # Cliente HTTP y base URL
		components/           # Layout shell y componentes globales
		realtime/             # Cliente websocket
		store/                # Estado global (auth)
	features/
		auth/
		feed/
		messages/
		profile/
		twin-match/           # Dominio por feature (components/services/types)
```

Principio de organización:

- Lógica de negocio en `services`.
- UI en `components`.
- Contratos y modelos en `types`.
- Infraestructura compartida en `core`.

## Requisitos Previos

- Node.js 20+
- npm 10+

## Instalacion Y Ejecucion

1. Instalar dependencias:

```bash
npm install
```

2. Crear archivo de entorno:

```bash
cp .env.example .env.local
```

Si no dispones de `.env.example`, puedes crear `.env.local` manualmente usando las variables de la sección de entorno.

3. Levantar entorno local:

```bash
npm run dev
```

4. Abrir en navegador:

```text
http://localhost:3000
```

## Variables De Entorno

Variables detectadas en el código:

```env
NEXT_PUBLIC_API_URL=https://api.tu-dominio.com/api/v1
NEXT_PUBLIC_SOCKET_URL=https://ws.tu-dominio.com
```

Notas:

- Nunca publiques en este archivo valores reales de entornos internos o privados.
- Usa siempre placeholders en documentación y define los valores reales solo en `.env.local` o en secretos del proveedor de despliegue.
- Si no se definen, el frontend usa valores por defecto definidos en el código.
- Para desarrollo local con backend propio, sobrescribe ambas variables en `.env.local`.

## Scripts Disponibles

```bash
npm run dev    # Inicia Next.js en modo desarrollo
npm run build  # Compila para produccion
npm run start  # Ejecuta build en modo produccion
```

## Rutas De La App

- `/`: Landing principal.
- `/auth-loading`: Pantalla de transición post-auth.
- `/feed`: Muro principal de actividad.
- `/messages`: Mensajería entre usuarios.
- `/twin-match`: Conexiones y red musical.
- `/profile`: Perfil de usuario.

## Flujo De Autenticacion

Resumen del flujo implementado:

1. El usuario inicia sesión desde landing.
2. Se procesa token y perfil en `/auth-loading`.
3. El token se persiste localmente y se hidrata estado global.
4. El usuario es redirigido al feed (`/feed`).

## Guia De Contribucion

Para mantener consistencia del repositorio:

1. Crea una rama por cambio (`feature/...`, `fix/...`).
2. Mantén separación por feature (UI, servicios, tipos).
3. Evita mezclar refactors grandes con cambios funcionales.
4. Verifica build antes de abrir PR:

```bash
npm run build
```

5. En PRs, incluye:

- Contexto del cambio.
- Alcance (feature/bug/refactor).
- Evidencia visual si hubo cambios de UI.

## API Contract Por Modulo

Este frontend consume APIs desde la capa `services` de cada feature.

- Auth: login, perfil y sesión.
- Feed: actividad, resumen de amigos, tendencias y now playing.
- Messages: conversaciones, mensajes, marcar como leído.
- Twin Match: red de amigos, solicitudes y búsqueda de usuarios.
- Profile: datos de perfil y top tracks.

Referencia de implementación:

- `src/features/auth/services/`
- `src/features/feed/services/`
- `src/features/messages/services/`
- `src/features/twin-match/services/`
- `src/features/profile/services/`

## Checklist De Release

Antes de publicar una versión:

1. Verificar variables de entorno de producción.
2. Ejecutar build local sin errores.
3. Validar rutas críticas: `/`, `/feed`, `/messages`, `/twin-match`, `/profile`.
4. Revisar flujo de autenticación completo (`/` -> `/auth-loading` -> `/feed`).
5. Confirmar que no se exponen endpoints internos ni secretos en documentación.
6. Confirmar que el README y changelog reflejan los cambios.

Comandos mínimos:

```bash
npm install
npm run build
npm run start
```

## Plantilla De Pull Request

```md
## Resumen
-

## Tipo de cambio
- [ ] feat
- [ ] fix
- [ ] refactor
- [ ] docs
- [ ] chore

## Alcance
- Modulos afectados:
- Rutas afectadas:

## Evidencia
- Capturas / videos:

## Validacion
- [ ] `npm run build` sin errores
- [ ] Flujo de auth validado
- [ ] No hay secretos ni endpoints internos en el diff
```

## Despliegue

El proyecto es compatible con cualquier plataforma que soporte Next.js (por ejemplo Vercel o infraestructura propia con Node).

Pasos mínimos:

1. Configurar variables de entorno de producción.
2. Ejecutar `npm run build`.
3. Levantar con `npm run start`.
