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

### Arquitectura profesional (routes → controllers → services → models → utils)

- **Routes** (`routes/*.ts`): exponen los endpoints y solo conectan la ruta con el controller, definiendo qué middleware se ejecuta (auth/admin) y qué validaciones globales aplica cada ruta.
- **Controllers** (`controllers/*.ts`): se responsabilizan de validar payloads (Zod), aplicar tipos estrictos en `req.body`, `req.auth` y `res`, manejar cookies y llamar a los servicios correctos según el endpoint. Devuelven siempre `Response<Success | Error>` para evitar `any` y alinearse con el principio de responsabilidad única.
- **Services** (`services/*.ts`): contienen la lógica de negocio, las transacciones (Prisma) y las reglas SOLID: cada servicio opera sobre una entidad y no conoce detalles de Express, lo que facilita pruebas unitarias o reemplazar el transport layer.
- **Models** (`models/*.ts`): encapsulan el acceso a Prisma y definen los tipos reutilizables (`ProductPayload`, `CreateUserInput`, etc.), evitando que los servicios repitan queries o estructuras.
- **Utils** (`utils/*.ts`): helpers como `serializeUser`, `ServiceError`, `signAccessToken`, `verifyAccessToken` y la gestión de cookies centralizan comportamiento transversal, cumpliendo el principio de abstracción.

La combinación garantiza cohesión dentro de cada capa y bajo acoplamiento: los routers no tocan Prisma, los servicios no tocan Express, y los models no hacen validación HTTP. Además, todo el backend está fuertemente tipado y evita `any`, cumpliendo los principios SOLID (Single Responsibility, Open/Closed, Liskov, Interface Segregation y Dependency Inversion) desde la estructura hasta los servicios reutilizables.

### Stack principal y endpoints clave

- TypeScript con `tsx` para hot reload (`npm run dev`).
- Express 5 en `src/index.ts` con routers por recurso (`auth`, `products`, `cart`, `orders`, `api/admin/orders`).
- Prisma v6, JWT (`jsonwebtoken`), cookies HTTP-only y validación con Zod.
- Los console.log en `src/index.ts` y `prisma/seed.ts` documentan inicio y seed; permanecen con `// eslint-disable-next-line no-console` para que los recruiters vean los logs sin romper ESLint.

Endpoints principales:

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

### Setup / desarrollo

1. Instala dependencias y prepara Prisma (`backend/`):
   ```bash
   npm install
   npm run prisma:generate
   npm run prisma:migrate dev --name init
   npm run prisma:seed
   ```
2. Corre el backend en modo desarrollo con hot reload:
   ```bash
   npm run dev
   ```
3. Revisa el linteo profesional con:
   ```bash
   npm run lint
   ```
   ESLint carga `eslint.config.cjs` y usa `tsconfig.eslint.json` para incluir `prisma.config.ts`. Las únicas advertencias provienen de los `console.log` mencionados y están justificados con `// eslint-disable-next-line no-console`.

### Tipado seguro

Todo el backend está tipado estrictamente: cada `req.body`, `req.auth`, `res` y dato intermedio lleva un tipo claro, se usan uniones como `Response<ErrorResponse | AuthSuccessResponse>` y se eliminó todo `any`. Los servicios reciben inputs tipados (`RegisterInput`, `ProductPayload`, etc.) y devuelven modelos firmes (Prisma/TypeScript), lo que reduce errores y demuestra dominio de seguridad de tipos ante reclutadores.

### Prisma y modelos

- `User` con rol `USER|ADMIN`, `cartItems` y `orders`.  
- `Product` (precio en centavos) con relación inversa.  
- `CartItem` unido a `User` + `Product` con constraint único (`userId_productId`).  
- `Order` incluye `OrderItem` y se actualiza con transacción para vaciar carrito.  
- `OrderStatus` enum (`PENDING`, `PAID`, `SHIPPED`, `COMPLETED`, `CANCELLED`).  
- El seed genera tres productos base (`Camiseta`, `Pantalón`, `Zapatos`).  
Los modelos Prisma están encapsulados en `src/models/*` y se invocan desde services (sin lógica HTTP), lo que facilita que cualquier reclutador vea claramente la separación de responsabilidades.

### Smoke test mínimo

El backend incluye un script autónomo (`backend/smokeTest.ts`) que recorre los endpoints `/auth/register`, `/auth/login` y `/auth/me` con un usuario temporal, valida los status (`201`/`200`) y comprueba que los payloads tienen `id`, `email` y `name`. Está escrito en TypeScript sin `any` y se puede ejecutar desde la raíz del backend con:

```bash
npx tsx smokeTest.ts
```

El script recoge la cookie `ecom_access` devuelta por el login, la reusa en `/auth/me` y reporta con `console.log` si cada paso pasa o falla; eso garantiza una verificación mínima (`middleware → controller → service → model`) y refuerza la idea de que ya hay automatización ligera estándar en el portafolio. Puedes ajustar `API_BASE_URL` o `COOKIE_NAME` con variables de entorno si el backend no corre en `http://localhost:4000`.

## Frontend

### Stack y estructura

- `Vite` con `@vitejs/plugin-react`.
- Axios: Cliente HTTP con instancia centralizada e interceptores para gestión de sesión.
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
