# Ecommerce Store (Full-stack Demo)

## Table of contents

1. [Proyecto](#proyecto)
2. [Arquitectura](#arquitectura)
3. [Backend](#backend)
4. [Frontend](#frontend)
5. [Setup de desarrollo](#setup-de-desarrollo)
6. [Base de datos](#base-de-datos)
7. [Autenticación](#autenticacion)
8. [Flujo administrativo](#flujo-administrativo)
9. [Calidad y mantenimiento](#calidad-y-mantenimiento)
10. [Despliegue](#despliegue)
11. [Próximos pasos](#proximos-pasos)

## Proyecto

Aplicación de comercio electrónico full-stack con catálogo público, carrito persistente y panel administrativo. La tienda permite registros y logins con JWT en cookie segura, diseño responsive y uso de React Query para mantener los datos sincronizados entre cliente y servidor.

## Arquitectura

- `backend/`: API REST construida en Node.js + Express con TypeScript, validación con Zod y persistencia mediante Prisma/PostgreSQL. 
- `frontend/`: SPA construida con Vite + React 19 + React Router 7 + React Query 5 + Tailwind CSS, con contextos para autenticación y carrito.
- Comunicación protegida por cookies HTTP-only (`ecom_access`) y CORS restringido al origen configurado en `WEB_ORIGIN`.
- Separación clara de responsabilidad y scripts independientes para cada paquete.

## Backend

### Stack principal

- TypeScript con `tsx` para un ciclo rápido (`npm run dev`).
- Express (v5) con rutas organizadas por recursos: `auth`, `products`, `cart`, `orders` y `api/admin/orders`.
- Prisma v6 con cliente generado, migrations y seed incorporados.
- Autenticación JWT (`jsonwebtoken`) almacenada en cookie `cookie-parser`.
- Validación estricta con Zod; errores devuelven `{ error: string, details?: { formErrors, fieldErrors } }`.

### Endpoints clave

| Método | Ruta | Privilegio | Notas |
| --- | --- | --- | --- |
| `POST` | `/auth/register` | público | crea usuario (email único). |
| `POST` | `/auth/login` | público | devuelve usuario y setea cookie. |
| `GET` | `/auth/me` | autenticado | refresca sesión. |
| `GET` | `/products` | público | catálogo ordenado por ID. |
| `GET` | `/products/:id` | público | detalle. |
| `POST` | `/products` | admin | crea nuevo producto. |
| `PUT` | `/products/:id` | admin | actualiza campos. |
| `DELETE` | `/products/:id` | admin | elimina. |
| `GET` | `/cart` | autenticado | lee carrito del usuario. |
| `POST` | `/cart` | autenticado | inserta o incrementa ítem. |
| `PUT` | `/cart/:productId` | autenticado | ajusta cantidad. |
| `DELETE` | `/cart/:productId` | autenticado | borra ítem. |
| `POST` | `/orders` | autenticado | crea orden y vacía carrito. |
| `GET` | `/orders` | autenticado | historial del usuario. |
| `GET` | `/api/admin/orders` | admin | lista con usuario y detalles. |
| `PATCH` | `/api/admin/orders/:id/status` | admin | actualiza estado. |

### Scripts disponibles (desde `backend/`)

```bash
npm run dev          # arranca dev server con tsx watch
npm run build        # transpila a dist con tsc
npm run start        # ejecuta el build en dist
npm run lint         # eslint sobre TypeScript
npm run prisma:generate
npm run prisma:migrate
npm run prisma:studio
npm run prisma:seed
```

### Variables de entorno

Copiar `.env.example` (crear manualmente) con:

```
NODE_ENV=development
PORT=4000
WEB_ORIGIN=http://localhost:5173
DATABASE_URL=postgresql://user:pass@localhost:5432/ecommerce?schema=public
JWT_ACCESS_SECRET=supersecretde32bytes
COOKIE_NAME=ecom_access
COOKIE_SECURE=false
```

`COOKIE_SECURE` debe ponerse a `true` en producción y `WEB_ORIGIN` debe coincidir con el host front. El secret de JWT exige al menos 16 caracteres y la cookie expira en 15 minutos (`setAuthCookie`).

### Prisma / modelos

- `User` con rol `USER|ADMIN`, `cartItems` y `orders`.
- `Product` (precio en centavos) con relación inversa.
- `CartItem` unido a `User` + `Product` con constraint único (`userId_productId`).
- `Order` incluye `OrderItem` y se actualiza con transacción para vaciar carrito.
- `OrderStatus` enum (`PENDING`, `PAID`, `SHIPPED`, `COMPLETED`, `CANCELLED`).
- El seed crea tres productos base (`Camiseta`, `Pantalón`, `Zapatos`).

## Frontend

### Stack y estructura

- `Vite` con `@vitejs/plugin-react`.
- React 19 + TypeScript con configuración en `tsconfig.app.json`.
- Tailwind CSS via `@tailwindcss/vite` plugin.
- Router: React Router DOM 7 (routes declarativas en `App.tsx`).
- React Query 5 para caché de `products`, `cart`, `orders`, `admin/orders`.
- Contextos: `AuthContext` maneja sesión, `CartContext` guarda `localStorage` y actualiza UI.

### Experiencia de usuario

- Catálogo responsive (`Home` + `ProductCard`).
- Carrito persistente en localStorage (clave `ecommerce_cart`) hasta login.
- Modal de auth (`AuthModal`) con switch entre login y registro; usa `useAuth`.
- Checkout bloqueado hasta login y muestra resumen (`CheckoutPage`).
- Panel administrativo (`/admin`) solo accesible con `user.role === "ADMIN"`; incluye gestión de productos y órdenes con status select (+ contacto rápido vía WhatsApp si hay teléfono).
- `CartPanel` muestra subtotal, shipping gratuito y permite ajustar cantidades con mutaciones que sincronizan server/guest.
- Hooks `useProducts`, `useCart`, `useOrders`, `useAdminProducts`, `useAdminOrders` encapsulan lógica de datos y mutaciones.

### Integraciones clave

- `frontend/src/lib/api.ts`: define `API_BASE_URL` (actualmente `http://localhost:4000`) y encapsula todas las llamadas REST con `credentials: include` para usar cookies.
- `guestCart.ts`: persiste ítems en `guest_cart_items` y sincroniza (`syncGuestCartToServer`) justo después de login/registro.
- `CartContext` sincroniza con `localStorage` (clave `ecommerce_cart`) y expone helpers de UI.
- `frontend/src/lib/axiosInstance.ts`: instancia Axios con `withCredentials`, timeout y base URL reutilizable para proyectar un patrón enterprise estándar.

### Scripts (desde `frontend/`)

```bash
npm run dev
npm run build
npm run preview
npm run lint
```

## Setup de desarrollo

1. **Instalar dependencias**  
   ```bash
   cd backend && npm install
   cd ../frontend && npm install
   ```
2. **Configurar Postgres** y poner la conexión en `backend/.env`.
3. **Generar cliente y migraciones**  
   ```bash
   cd backend
   npm run prisma:generate
   npm run prisma:migrate dev --name init
   npm run prisma:seed
   ```
4. **Levantar backend** en una terminal: `npm run dev`.
5. **Levantar frontend** en otra terminal: `cd ../frontend && npm run dev`.
6. **Acceder** a `http://localhost:5173` (o la URL que indique Vite) y probar flujos.

## Base de datos

- Usa PostgreSQL; el esquema vive en `backend/prisma/schema.prisma`.
- Las migraciones se encuentran en `backend/prisma/migrations`.
- `npm run prisma:studio` lanza una UI para revisar usuarios, productos, carritos y órdenes.

## Autenticación

- Login/registro devuelven usuario serializado (`PublicUser`) sin `passwordHash`.
- Cookie segura con nombre `COOKIE_NAME` y `sameSite="lax"`.
- Middleware `requireAuth` valida cookie y `verifyAccessToken`; `requireAdmin` verifica `role === "ADMIN"`.
- TTL de token: 15 minutos; renovar al refrescar `GET /auth/me`.

## Flujo administrativo

- Panel en `frontend/src/layouts/AdminLayout.tsx` con sidebar fijo y logout.
- Gestión de productos (`AdminProductsPage`): lista, formulario de creación/edición, validación básica de formulario.
- Gestión de órdenes (`AdminOrdersPage`): muestra items, total, botones para cambiar estado, eliminar (set STATUS `CANCELLED`) y enlace a WhatsApp si hay teléfono.
- Doble cache: `useAdminProducts` invalida `["products"]` y `useAdminOrders` invalida `["orders"]` tras cambiar estado.

## Calidad y mantenimiento

- Linting con ESLint (share config en ambos paquetes).  
- React Query maneja estados `isLoading`, `isError`, `isPending` para feedback inmediato.
- No hay tests automatizados aún; documentar flujos manuales (Login, carrito, checkout, admin).

## Despliegue

1. **Backend**:  
   - `npm run build` genera `dist/`.  
   - Exportar variables de entorno de producción y apuntar `WEB_ORIGIN` al host del frontend.  
   - Servir `dist/index.js` con PM2, Docker o como parte de un monolito.  

2. **Frontend**:  
   - `npm run build`, subir carpeta `dist` a CDN/host estático.  
   - Configurar `API_BASE_URL` (actualmente `http://localhost:4000`) a la URL del backend publicado.  
   - Opcionalmente servir frontend desde mismo servidor backend usando `express.static`.

## Próximos pasos

1. Hacer pagos simulados (Stripe, PayPal) y guardar `paymentStatus`.
2. Añadir tests end-to-end (`Cypress`/`Playwright`) y unitarios para hooks críticos.
3. Mejorar roles (colocar un dashboard para `operator`/`customer support`) y métricas de órdenes.
4. Externalizar imágenes de productos con CDN + optimizaciones de caching.
