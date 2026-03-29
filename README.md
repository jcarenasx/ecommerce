# E-commerce Software Solution

## Table of contents

1. [Visión](#visión)
2. [Arquitectura](#arquitectura)
3. [Decisiones de ingeniería](#decisiones-de-ingeniería)
4. [Backend](#backend)
5. [Frontend](#frontend)
6. [Setup de desarrollo](#setup-de-desarrollo)
7. [Base de datos](#base-de-datos)
8. [Autenticación](#autenticación)
9. [Flujo administrativo](#flujo-administrativo)
10. [Guía de pruebas manuales](#guía-de-pruebas-manuales)
11. [Capturas sugeridas](#capturas-sugeridas)
12. [Calidad y mantenimiento](#calidad-y-mantenimiento)
13. [Despliegue](#despliegue)
14. [Próximos pasos](#próximos-pasos)

## Visión

Solución integral de software para e-commerce.

Aplicación full-stack diseñada para la comercialización de productos, que implementa un flujo completo de compra para clientes, junto con un panel de administración para la gestión de productos, inventario, usuarios y pedidos.

Construida con una arquitectura desacoplada entre frontend y backend, enfocada en escalabilidad, mantenibilidad y buenas prácticas de ingeniería.

## Arquitectura

- `backend/`: API REST construida en Node.js + Express con TypeScript, validación con Zod y persistencia mediante Prisma/PostgreSQL. 
- `frontend/`: SPA construida con Vite + React 19 + React Router 7 + React Query 5 + Tailwind CSS, con contextos para autenticación y carrito.
- Comunicación protegida por cookies HTTP-only (`ecom_access`) y CORS restringido al origen configurado en `WEB_ORIGIN`.
- Separación clara de responsabilidad y scripts independientes para cada paquete.

## Decisiones de ingeniería

- **Axios**: cliente HTTP centralizado con interceptores para gestión global de errores, renovación de sesión y aplicación de headers comunes.
- **React Query**: sincronización del estado del servidor, caché e invalidación específica para mantener los datos consistentes sin sobrecargar las peticiones.
- **Context API**: estados globales ligeros (auth y carrito) que priorizan simplicidad y rendimiento frente a soluciones más pesadas como Redux o Zustand.
- **Prisma + PostgreSQL**: tipado fuerte en el backend, integridad referencial y pipeline de migraciones/migrations que mantiene la base de datos alineada con el modelo del dominio.
- **Seguridad (HTTP-Only Cookies)**: mitigación de riesgos XSS almacenando tokens de sesión exclusivamente en el servidor; el frontend nunca sintetiza los JWT en memoria.

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
- `frontend/src/lib/axiosInstance.ts`: instancia Axios con `withCredentials`, timeout, interceptores potenciales y manejo centralizado de errores, lo que permite aplicar headers globales, retry y transformación del payload antes/después de cada llamada.
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

## Guía de pruebas manuales

1. **Login y autenticación**  
   - Usa `/auth/register` o el modal de frontend para crear una cuenta y verifica que `AuthModal` muestra errores cuando las credenciales son inválidas.  
   - Repite el flujo con `login`, comprueba que la cookie `ecom_access` llega al navegador y que `useAuth` carga el contexto (observa el banner en `Navbar`).

2. **Carrito persistente (invitado vs. usuario)**  
   - Añade productos al carrito sin estar autenticado. Cierra/recarga la pestaña y observa que `localStorage` (`ecommerce_cart`) mantiene los ítems.  
   - Haz login, asegúrate de que `syncGuestCartToServer` vacía `guest_cart_items` y que los datos aparecen en `/cart` del backend.  
   - Intenta editar cantidades y eliminar para validar los endpoints `PUT/DELETE /cart/:productId` y su reflejo en el UI.

3. **Checkout completo**  
   - Con carrito no vacío, navega a `/checkout`. Verifica que el panel muestra totales correctos y que el botón `Confirmar compra` lanza `POST /orders`.  
   - Comprueba en `AdminOrdersPage` que la orden aparece con el snapshot de productos, y cambia su estado para validar `/api/admin/orders/:id/status`.

## Capturas sugeridas

> Reemplaza los placeholders con las capturas finales (`PNG`/`webp`) antes de publicar el repo.

- **Home (tienda pública)**  
  ![Home placeholder](docs/screenshots/home.png)

- **Admin Panel (productos y órdenes)**  
  ![Admin placeholder](docs/screenshots/admin.png)

- **Checkout (resumen y confirmación)**  
  ![Checkout placeholder](docs/screenshots/checkout.png)
