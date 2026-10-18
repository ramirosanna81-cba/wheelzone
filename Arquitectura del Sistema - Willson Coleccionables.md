# Arquitectura del Sistema: Willson \- Plataforma de Coleccionables

Este documento detalla la arquitectura técnica, los componentes, el flujo de datos y las especificaciones de diseño para el desarrollo de la plataforma web de **Willson**, un emprendimiento de venta de Hot Wheels y autitos coleccionables.

---

## 1\. Resumen Ejecutivo y Objetivos

La plataforma tiene como propósito principal profesionalizar el negocio digital de Willson, eliminando la fricción en las ventas por redes sociales (Instagram/Facebook) mediante una **vidriera digital interactiva, autogestionable y adaptada 100% para dispositivos móviles y PC (Responsive / Mobile-First)**.

Además de exhibir el stock disponible, la plataforma incluye un **módulo de encargos y captación de clientes (Leads)** para fidelizar coleccionistas que buscan piezas específicas.

---

## 2\. Stack Tecnológico (100% Gratuito y Escalable)

* **Frontend & Hosting:**  
  * *Next.js (App Router):* Permite renderizado ultrarrápido, páginas estáticas para el catálogo público y rutas protegidas (privadas) para el panel de administración.  
  * *Vercel:* Hosting gratuito, con dominio seguro (HTTPS) automático y despliegues continuos.  
* **Estilos y Diseño:**  
  * *Tailwind CSS:* Framework para un diseño adaptable (Mobile-First), interfaz moderna en modo oscuro (*Dark Mode*) con acentos vibrantes (estilo industrial/carreras).  
* **Base de Datos y Backend (BaaS):**  
  * *Supabase (PostgreSQL):* Base de datos relacional en la nube para gestionar productos, stock y registros de clientes.  
* **Almacenamiento de Archivos:**  
  * *Supabase Storage:* Bucket en la nube para almacenar de forma segura las fotografías de los autitos subidas desde el panel de control.  
* **Autenticación:**  
  * *Supabase Auth:* Control de acceso seguro por correo y contraseña exclusivamente para el administrador (Willson).

---

## 3\. Arquitectura General y Flujo de Datos

\[ Clientes / Visitantes \] ──(Navegan, filtran, encargan)──┐

                                                          ▼

\[ Administrador (Willson) \] ──(Gestiona stock y leads)──\> \[ Next.js (Mobile-First / Tailwind) \]

                                                          │

          ┌─────────────────────┬─────────────────────────┴─────────────────────────┐

          ▼                     ▼                                                   ▼

\[ Supabase Auth \]     \[ Supabase PostgreSQL DB \]                            \[ Supabase Storage \]

(Login de Admin)      (Tablas: Products, Leads / Clientes)                  (Fotos de los autitos)

1. **Vista Pública:** Los usuarios ingresan desde celulares o PCs, visualizan el catálogo con filtros avanzados, buscan modelos y pueden realizar consultas directas vía WhatsApp o enviar solicitudes de encargos especiales.  
2. **Panel de Administración Privado (`/admin`):** Protegido por credenciales. Permite a Willson agregar, editar o pausar autitos arrastrando fotos y completando un formulario intuitivo, además de visualizar la base de datos de clientes interesados.

---

## 4\. Estructura de la Base de Datos (Supabase)

### A. Tabla `products` (Catálogo de Autitos)

Almacena el inventario de piezas coleccionables disponibles o pausadas.

| Columna | Tipo de Dato | Descripción |
| :---- | :---- | :---- |
| `id` | UUID / SERIAL | Identificador único de la pieza (Primary Key). |
| `marca` | TEXT | Marca del modelo (Ej: Hot Wheels, Matchbox, Maisto, GreenLight). |
| `modelo` | TEXT | Nombre del vehículo (Ej: Nissan Skyline GT-R R34). |
| `escala` | TEXT | Escala del modelo (Ej: 1:64, 1:43, 1:18). |
| `anio` | INTEGER | Año de lanzamiento o modelo (Ej: 2024). |
| `categoria` | TEXT | Clasificación (Ej: JDM, Muscle Cars, Exóticos, Pop Culture, Treasure Hunt). |
| `precio` | NUMERIC | Precio de venta en moneda local. |
| `stock` | INTEGER | Unidades disponibles. |
| `imagen_url` | TEXT | Enlace público del archivo en Supabase Storage. |
| `estado_blister` | TEXT | Condición (Ej: Impecable, Dañado/Blister doblado, Loose/Suelto). |
| `destacado` | BOOLEAN | Indica si se muestra en la sección de novedades de la página principal. |
| `created_at` | TIMESTAMP | Fecha y hora de registro automático. |

### B. Tabla `leads_encargos` (Base de Datos de Clientes y Búsquedas Especiales)

Registra las consultas avanzadas y solicitudes de piezas raras realizadas a través del formulario de contacto extraordinario.

| Columna | Tipo de Dato | Descripción |
| :---- | :---- | :---- |
| `id` | UUID / SERIAL | Identificador único del registro. |
| `nombre` | TEXT | Nombre y apellido del coleccionista. |
| `telefono` | TEXT | Número de contacto o WhatsApp. |
| `email` | TEXT | Correo electrónico de contacto. |
| `modelo_buscado` | TEXT | Descripción detallada del autito que desea conseguir. |
| `estado` | TEXT | Estado de gestión (Ej: Pendiente, En búsqueda, Contactado). |
| `created_at` | TIMESTAMP | Fecha de recepción de la solicitud. |

---

## 5\. Estructura de Directorios del Proyecto (Next.js)

willson-store/

├── app/

│   ├── page.js                  \# Landing Page \+ Catálogo público con filtros avanzados (Mobile-First)

│   ├── contacto/

│   │   └── page.js              \# Formulario de encargos y búsquedas especiales

│   ├── admin/

│   │   ├── page.js              \# Panel principal de administración de stock

│   │   ├── nuevo-auto/page.js   \# Formulario simplificado para carga de fotos y datos

│   │   └── clientes/page.js     \# Listado de clientes y solicitudes de encargos guardados

│   └── layout.js                \# Estilos globales, tipografías y contenedores responsivos

├── lib/

│   └── supabase.js              \# Cliente centralizado de conexión a Supabase

└── public/

    └── logo.png                 \# Logotipo institucional de Willson

---

## 6\. Funcionalidades Clave para Coleccionistas

* **Filtros Avanzados:** Filtrado instantáneo por marca, escala (ej. 1:64), año, categoría temática (JDM, Muscle Cars, Pop Culture) y estado del blíster.  
* **Buscador Inteligente:** Barra de búsqueda en tiempo real para encontrar modelos específicos (ej. "Batimovil", "Skyline").  
* **Carrito / Compra a WhatsApp:** Cada tarjeta de producto incluye un botón directo que genera un mensaje automatizado en WhatsApp con el detalle exacto de la pieza seleccionada.  
* **Panel Anti-complicaciones:** Diseñado para que el administrador pueda subir fotos mediante arrastrar y soltar (*Drag & Drop*) sin necesidad de conocimientos técnicos avanzados.