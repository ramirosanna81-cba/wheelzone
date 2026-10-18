# 🏎️ Wheels Zone - Plataforma de Coleccionables y Hot Wheels

Bienvenido a la plataforma web oficial de **Wheels Zone**, un ecosistema e-commerce y vitrina digital de alta velocidad especializada en modelos die-cast, Hot Wheels Premium, Super Treasure Hunts ($TH), Red Line Club (RLC), Kaido House y Matchbox.

Desarrollada bajo una estética agresiva de competición automotriz (*Telemetry Speed Track*), con texturas de fibra de carbono (`#0B0B0B`), acentos de fuego rojo (`#E51937`) y amarillo llama (`#FFC200`), y arquitectura moderna **Mobile-First**.

---

## 🚀 1. Stack Tecnológico

* **Frontend:** [Next.js 14](https://nextjs.org/) (App Router, Server Components y Client Components).
* **Estilos:** [Tailwind CSS](https://tailwindcss.com/) con el sistema de diseño oficial *Telemetry Speed Track* y fuentes tipográficas Google Fonts (`Barlow Condensed` y `DM Sans`).
* **Efectos Visuales:** Canvas dinámico interactivo de partículas de fuego y ascuas (`components/FireParticles.tsx`), cortes angulares chamfered y confetti de victoria.
* **Backend y Base de Datos (BaaS):** [Supabase](https://supabase.com/) (PostgreSQL 15, Supabase Auth y Supabase Storage).
* **Modo Autónomo / Graceful Degradation:** La plataforma incluye un motor de almacenamiento local en `lib/supabase.ts` que permite navegar, filtrar, agregar productos y probar el panel de administración al 100% incluso sin configurar Supabase en primera instancia.

---

## 📁 2. Arquitectura de Páginas y Módulos

### 🏁 A. Inicio / Landing Page (`/`)
* **Top Banner:** Cinta de telemetría de stock en vivo con promociones clave (10% OFF transferencia, envíos en blíster protegido, retiros gratis).
* **Header Institucional:** Emblema oficial Wheels Zone con llamas y neumático de carreras, buscador y acceso rápido a carrito y soporte.
* **Hero Section con Partículas de Fuego:** Efecto interactivo sobre fondo de fibra de carbono, métricas de pista en tiempo real (+1,250 stock, 100% blíster cuidado, 980+ coleccionistas) y tarjeta spotlight.
* **Destacados de la Semana:** Grid de 4 piezas icónicas con tarjeta de blíster C-10, escala 1:64 y botón de compra directa a WhatsApp.
* **Formulario de Encargos Especiales (`#encargos`):** Conectado directamente a la tabla `leads_encargos` para captar solicitudes de piezas raras y cotizaciones.
* **Blindaje y Garantía Total:** Pilares de embalaje militar, verificación de autenticidad y pasarela con descuento.

### 🛍️ B. Tienda & Catálogo (`/tienda`)
* **Panel Lateral (Sidebar) de Filtros en Tiempo Real:**
  * Búsqueda telemétrica por texto libre (casting, serie, año).
  * Filtro por Marca & Tirada (Hot Wheels Premium, STH, Mainline, Kaido House, Matchbox).
  * Filtro por Escala Die-Cast (1:64, 1:43, 1:24, 1:18).
  * Filtro por Condición de Blíster (Impecable Mint 10/10, Muy Bueno 8.5-9.5, Desgaste, Loose).
  * Selector de Temática Motorsport (JDM, Muscle Cars, Boulevard, Off-Road).
  * Slider de Rango de Inversión ($5.000 a $65.000+ ARS).
  * Switch de stock inmediato y botón de restablecer filtros.
* **Grid de Productos:** Tarjetas con badges aerodinámicos, botón de compra por WhatsApp con mensaje pre-armado, agregar al carrito y modal de inspección técnica en alta resolución.
* **Carrito de Compras (Slide-over Drawer):** Cálculo de subtotal, 10% OFF por transferencia bancaria y checkout automatizado a WhatsApp.

### 👥 C. El Garaje de la Comunidad (`/comunidad`)
* **Paddock Comunitario:** Métricas de satisfacción auditadas (4.9/5, 428 vitrinas homologadas).
* **Boxes de Ingreso (Formulario de Testimonio y Fotos):** Formulario intuitivo donde los clientes ingresan su nombre/handle, ubicación, pieza destacada, calificación de 1 a 5 estrellas interactiva, reseña y suben su fotografía con compresión automática a WebP.
* **Galería Interactiva:** Muro de vitrinas reales con insignias de coleccionista verificado, tags y botón interactivo de "Like / Fuego 🔥".

### 🔒 D. Módulo de Administración Privado (`/admin`)
* **Autenticación:** Control de acceso mediante Supabase Auth y sesión segura.
* **KPIs en Vivo:** Total de modelos en catálogo, despachos pendientes, leads recibidos y valuación del inventario en ARS.
* **Pestaña 1 - Carga Rápida (Anti-complicaciones):** Sistema Drag & Drop para subir fotografías a Supabase Storage con compresión WebP y formulario de registro simplificado en `products`.
* **Pestaña 2 - Inventario & Stock:** Tabla con ajuste rápido de stock (+ / -), pausar/activar publicaciones, cambio de precios y eliminación.
* **Pestaña 3 - Encargos y Leads:** Visualización de solicitudes de la tabla `leads_encargos`, selector de estado (`Pendiente`, `En búsqueda`, `Contactado`) y botón para abrir directamente el WhatsApp del cliente con mensaje de respuesta personalizado.
* **Pestaña 4 - Moderación de Comunidad:** Aprobación y supervisión de fotos publicadas por compradores.

---

## 🗄️ 3. Configuración de Base de Datos (Supabase)

Para conectar tu proyecto a Supabase en la nube:

1. Creá una cuenta o proyecto en [Supabase](https://supabase.com).
2. Andá al **SQL Editor** en tu dashboard de Supabase y ejecutá el script [supabase_schema.sql](file:///c:/SITIOS%20WEB/WEELZONE/supabase_schema.sql). Este script creará:
   * La tabla `public.products` (catálogo).
   * La tabla `public.leads_encargos` (pedidos de coleccionistas).
   * La tabla `public.community_posts` (garaje de clientes).
   * Las políticas de seguridad Row Level Security (RLS).
3. Creá un bucket en **Storage** llamado `diecast-media` y configuralo como público.
4. Creá o editá el archivo `.env.local` en la raíz del proyecto con tus credenciales:

```env
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-clave-anon-publica
NEXT_PUBLIC_WHATSAPP_PHONE=5491122334455
```

---

## 💻 4. Comandos de Ejecución Local

```bash
# Instalar dependencias
npm run install

# Compilar producción (comprobación de tipos y optimización de rutas)
npm run build

# Iniciar servidor de producción local
npm run start

# Iniciar en modo desarrollo con recarga en caliente
npm run dev
```

La plataforma estará disponible en [http://localhost:3000](http://localhost:3000).

---

## 🔐 5. Credenciales de Administrador para Pruebas

* **URL del panel:** [http://localhost:3000/admin](http://localhost:3000/admin)
* **Email:** `admin@wheelszone.com`
* **Contraseña demo:** `admin123` (o hacé clic en el botón *"⚡ Acceso Rápido Modo Demostración"* en el formulario de login).
