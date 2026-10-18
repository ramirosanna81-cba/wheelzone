# Documento de Requisitos del Sistema (SRS): Willson \- Plataforma de Coleccionables

Este documento especifica los requerimientos funcionales y no funcionales para el desarrollo de la plataforma web del emprendimiento **Willson**, orientada a la comercialización de autitos coleccionables (Hot Wheels y otras marcas).

---

## 1\. Alcance del Proyecto

El sistema consiste en una aplicación web interactiva dividida en dos grandes módulos:

1. **Módulo Público (Vidriera Digital):** Catálogo interactivo accesible desde dispositivos móviles y computadoras, optimizado para la experiencia de los coleccionistas.  
2. **Módulo de Administración Privado:** Panel de control exclusivo para el administrador (Willson), diseñado con una interfaz sumamente intuitiva para la gestión manual del inventario y la visualización de clientes.

---

## 2\. Requerimientos Funcionales (RF)

### A. Módulo Público (Visitantes / Clientes)

* **RF01 \- Visualización Adaptable (Mobile-First):** La interfaz debe ajustarse perfectamente a pantallas de celulares (donde se concentra el tráfico principal desde redes sociales) y computadoras de escritorio.  
* **RF02 \- Catálogo Interactivo de Modelos:** Visualización en formato de tarjetas (*grid*) con fotografía principal, marca, modelo, escala, año, categoría, estado del blíster y precio.  
* **RF03 \- Sistema de Filtros Avanzados:** Los usuarios podrán filtrar el catálogo en tiempo real según:  
  * Marca (Hot Wheels, Matchbox, Maisto, etc.).  
  * Escala (ej. 1:64, 1:43, 1:18).  
  * Categoría temática (JDM, Muscle Cars, Pop Culture, etc.).  
  * Estado del blíster (Impecable, Dañado, Loose).  
* **RF04 \- Buscador Rápido:** Barra de búsqueda por texto libre para encontrar modelos específicos al instante.  
* **RF05 \- Botón de Compra / Consulta vía WhatsApp:** Cada producto contará con un botón de acción directa que abrirá WhatsApp con un mensaje prearmado que incluye los datos del modelo consultado.  
* **RF06 \- Información de Pago:** Se especificará claramente en la plataforma que las operaciones comerciales se realizan mediante **transferencia bancaria**.  
* **RF07 \- Sección de Envíos y Retiros (Texto General):** Se incluirá un apartado informativo general sobre las modalidades de entrega y protección de piezas (sujeto a definiciones posteriores del administrador).  
* **RF08 \- Formulario de Encargos Especiales:** Un espacio de contacto extraordinario para que los coleccionistas soliciten la búsqueda de modelos específicos no disponibles en el stock actual.

### B. Módulo de Administración (Panel Privado \- Willson)

* **RF09 \- Autenticación Segura (Supabase Auth):** Acceso restringido mediante correo electrónico y contraseña exclusiva para el administrador.  
* **RF10 \- Carga Simplificada de Productos (Anti-complicaciones):** Formulario intuitivo para registrar nuevos autitos que incluya:  
  * Campos de texto y selectores para marca, modelo, escala, año, categoría, precio y stock.  
  * Sistema de arrastrar y soltar (*Drag & Drop*) para subir la fotografía del modelo de forma automática a Supabase Storage.  
* **RF11 \- Gestión Manual de Stock y Catálogo:** El administrador tendrá el control absoluto para modificar precios, actualizar stock o dar de baja/marcar como vendidos los modelos directamente desde su panel de control.  
* **RF12 \- Base de Datos de Clientes y Leads:** Un listado en el panel administrativo donde se almacenarán automáticamente los datos de contacto y las solicitudes de encargos especiales enviadas por los usuarios.

---

## 3\. Requerimientos No Funcionales (RNF)

* **RNF01 \- Costo Operativo Cero:** Toda la arquitectura debe mantenerse estrictamente dentro de los planes gratuitos de las tecnologías seleccionadas (Next.js en Vercel y Supabase para base de datos/storage).  
* **RNF02 \- Rendimiento y Velocidad:** Tiempos de carga mínimos en dispositivos móviles, optimizando el peso de las imágenes subidas al catálogo.  
* **RNF03 \- Seguridad de Datos:** Aislamiento estricto de las rutas de administración para evitar modificaciones de stock o precios por parte de usuarios externos.  
* **RNF04 \- Usabilidad (User Experience):** El panel administrativo debe ser sumamente sencillo, pensado para un usuario sin formación técnica avanzada en informática.