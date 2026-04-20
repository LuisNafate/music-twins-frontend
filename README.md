# MusicTwins Frontend

MusicTwins es una app social musical construida con Next.js, TypeScript y Tailwind CSS. La experiencia mezcla una landing editorial con un dashboard oscuro de tono cinematografico, orientado a descubrir compatibilidad musical, mensajes y perfil.

## Stack

- Next.js App Router
- React 19
- TypeScript
- Tailwind CSS
- IconScout Unicons

## Rutas

- `/` landing
- `/auth-loading` transicion de autenticacion
- `/feed` actividad principal
- `/messages` mensajes
- `/twin-match` compatibilidad musical
- `/profile` perfil

## Desarrollo

```bash
npm install
npm run dev
```

## Produccion

```bash
npm run build
npm run start
```

## Notas

- El proyecto ya no usa Vite.
- Los iconos estan resueltos con una libreria de iconos, no con imagenes.
- El layout y la navegacion viven en el App Router de Next.js.
