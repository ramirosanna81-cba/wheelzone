# Documento de Buenas Prácticas: Willson \- Plataforma de Coleccionables

Este documento recopila las mejores prácticas técnicas, operativas y de experiencia de usuario para garantizar el éxito, la seguridad y el mantenimiento a largo plazo de la plataforma web de **Willson**.

---

## 1\. Buenas Prácticas de Desarrollo y Código (Frontend & Backend)

* **Enfoque Mobile-First:** Dado que la inmensa mayoría de los coleccionistas accederán desde sus celulares (provenientes de Instagram, Facebook o WhatsApp), todo el diseño y la maquetación deben priorizar primero la visualización móvil y luego adaptarse a computadoras de escritorio.  
* **Optimización de Imágenes (Performance):** Las fotos de los autitos subidas por Willson deben procesarse o comprimirse automáticamente antes de guardarse en *Supabase Storage* para evitar tiempos de carga lentos en conexiones móviles. Se recomienda usar formatos modernos (como WebP) cuando sea posible.  
* **Componentes Modulares:** Estructurar el código en componentes reutilizables (por ejemplo: la tarjeta de producto, los filtros, los botones de acción) para facilitar futuras modificaciones o escalabilidad sin romper la aplicación.  
* **Variables de Entorno (Security):** Las credenciales sensibles, claves de API y URLs de conexión a Supabase nunca deben estar escritas directamente en el código fuente (*hardcodeadas*), sino gestionadas de forma segura mediante variables de entorno (`.env.local` en desarrollo y los ajustes de configuración en Vercel).

---

## 2\. Buenas Prácticas Operativas para el Administrador (Willson)

* **Fotografías Claras y Reales:** Para generar confianza absoluta en los coleccionistas (que son sumamente detallistas con el estado de los modelos y blísteres), se aconseja tomar las fotos con buena iluminación natural, mostrando el frente, dorso y cualquier detalle del cartón si tuviera alguna marca.  
* **Actualización Constante de Stock:** El valor diferencial de una web interactiva frente a una red social es la precisión. Es una buena práctica marcar inmediatamente como "Vendido" o descontar el stock ni bien se concreta una operación por transferencia.  
* **Gestión de Leads (Encargos Especiales):** Revisar periódicamente la sección de clientes y encargos en el panel privado para dar seguimiento a los coleccionistas que buscan piezas raras, fidelizando la relación comercial mediante un contacto personalizado por WhatsApp o correo.

---

## 3\. Buenas Prácticas de Seguridad y Mantenimiento

* **Control de Accesos (Supabase Auth):** El enlace o ruta del panel de administración (`/admin`) no debe difundirse públicamente ni indexarse en buscadores. La contraseña de acceso debe ser robusta para evitar modificaciones no autorizadas en el catálogo o precios.  
* **Respaldo de la Base de Datos:** Aunque Supabase gestiona respaldos automáticos en su infraestructura en nube, es una buena práctica realizar exportaciones periódicas (en formato CSV) de las tablas de productos y clientes como medida preventiva de control.  
* **Monitoreo del Plan Gratuito:** Controlar mensualmente el consumo de ancho de banda y almacenamiento en Vercel y Supabase para asegurar que el proyecto se mantenga dentro de los límites generosos del plan gratuito sin sobresaltos.