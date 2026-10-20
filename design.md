---
name: Wheels Zone Collectibles Platform
colors:
  surface: '#131313'
  surface-dim: '#131313'
  surface-bright: '#3a3939'
  surface-container-lowest: '#0e0e0e'
  surface-container-low: '#1c1b1b'
  surface-container: '#201f1f'
  surface-container-high: '#2a2a2a'
  surface-container-highest: '#353534'
  on-surface: '#e5e2e1'
  on-surface-variant: '#d3c5ab'
  inverse-surface: '#e5e2e1'
  inverse-on-surface: '#313030'
  outline: '#9c8f78'
  outline-variant: '#4f4632'
  surface-tint: '#f9bd00'
  primary: '#ffe5b0'
  on-primary: '#3f2e00'
  primary-container: '#ffc200'
  on-primary-container: '#6d5100'
  inverse-primary: '#785a00'
  secondary: '#ffb3b1'
  on-secondary: '#680011'
  secondary-container: '#d6022e'
  on-secondary-container: '#ffe7e5'
  tertiary: '#dae9ff'
  on-tertiary: '#233143'
  tertiary-container: '#becde3'
  on-tertiary-container: '#48576a'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#ffdf9c'
  primary-fixed-dim: '#f9bd00'
  on-primary-fixed: '#251a00'
  on-primary-fixed-variant: '#5b4300'
  secondary-fixed: '#ffdad8'
  secondary-fixed-dim: '#ffb3b1'
  on-secondary-fixed: '#410007'
  on-secondary-fixed-variant: '#92001c'
  tertiary-fixed: '#d4e4fa'
  tertiary-fixed-dim: '#b9c8de'
  on-tertiary-fixed: '#0d1c2d'
  on-tertiary-fixed-variant: '#39485a'
  background: '#0b0b0b'
  on-background: '#e5e2e1'
  surface-variant: '#353534'
typography:
  display-hero:
    fontFamily: Barlow Condensed
    fontSize: 56px
    fontWeight: '800'
    lineHeight: 56px
    letterSpacing: 0.02em
  display-hero-mobile:
    fontFamily: Barlow Condensed
    fontSize: 36px
    fontWeight: '800'
    lineHeight: 38px
    letterSpacing: 0.02em
  headline-lg:
    fontFamily: Barlow Condensed
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 36px
    letterSpacing: 0.03em
  headline-md:
    fontFamily: Barlow Condensed
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 28px
    letterSpacing: 0.025em
  headline-sm:
    fontFamily: Barlow Condensed
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 24px
    letterSpacing: 0.02em
  body-lg:
    fontFamily: DM Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: DM Sans
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: DM Sans
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
  label-telemetry:
    fontFamily: Barlow Condensed
    fontSize: 13px
    fontWeight: '700'
    lineHeight: 14px
    letterSpacing: 0.08em
  label-price:
    fontFamily: Barlow Condensed
    fontSize: 26px
    fontWeight: '800'
    lineHeight: 26px
    letterSpacing: 0.01em
spacing:
  gutter: 1rem
  gutter-desktop: 1.5rem
  margin: 1rem
  margin-desktop: 2.5rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.5rem
  space-2xl: 4rem
---

# ESPECIFICACIÓN Y VOLCADO TÉCNICO COMPLETO - WHEELS ZONE

## 1. BRAND & VISUAL CONCEPT

The design system projects adrenaline, precision engineering, and elite collectible motorsport culture. Tailored for die-cast collectors, track day enthusiasts, and vintage treasure hunters, the interface fuses the visceral heat of track racing with the surgical clarity of racing telemetry.

- **Carbon Monocoque Foundations:** Jet-black matte bases (`#0B0B0B` to `#131313`) layered with structural asphalt tones and a repeating 45-degree carbon weave pattern.
- **Ignition Accents:** Kinetic bursts of flame yellow (`#FFC200`), tachometer red (`#D6022E` / `#E51937`), and metallic aluminum trim (`#94A3B8`).
- **Aggressive Geometry:** 0-radius edges, chamfered corner cuts (45° clip-path aero panels), angled chevron motifs, and high-density technical readouts.
- **Tactile Urgency:** High-octane contrast, razor-sharp outlines, and telemetry badges that immediately declare blister condition (C-1 to C-10), casting series, and scale.

---

## 2. TOKENS GLOBALES Y ESTILOS CSS

### 2.1. Tokens de Color (HEX y Roles)

| Rol del Token | Nombre Tailwind | HEX Exacto | Aplicación en Interfaz |
| :--- | :--- | :--- | :--- |
| **Canvas Base** | `background` / `race-carbon` | `#0B0B0B` | Fondo de body, scrollbars y capas inferiores. |
| **Superficie Nivel 1** | `surface` / `surface-dim` | `#131313` | Fondo principal de secciones y contenedores. |
| **Superficie Nivel 2** | `surface-container-low` | `#1C1B1B` | Tarjetas de producto, inputs, barras de estado. |
| **Superficie Nivel 3** | `surface-container` | `#201F1F` | Controles secundarios, divisores, modales. |
| **Superficie Nivel 4** | `surface-container-high` | `#2A2A2A` | Bordes activos, estados hover y botones secundarios. |
| **Superficie Nivel 5** | `surface-container-highest` | `#353534` | Bordes finos, selectores y divisores técnicos. |
| **Primario Ignición** | `primary-container` / `race-yellow` | `#FFC200` | Botones de compra principales, precios y destaques. |
| **Texto s/ Primario** | `on-primary-container` | `#6D5100` / `#0E0E0E` | Texto sobre fondos amarillos de alta luminosidad. |
| **Secundario Carrera** | `secondary-container` / `race-red` | `#D6022E` / `#E51937` | Ticker superior, badges $TH y alertas. |
| **Texto s/ Secundario**| `on-secondary-container` | `#FFE7E5` | Textos sobre rojos intensos. |
| **Acento Titanio** | `race-titanium` / `tertiary` | `#94A3B8` / `#DAE9FF` | Chips de escala (1:64), bordes telemétricos. |
| **Texto Principal** | `on-surface` | `#E5E2E1` | Títulos, precios y contenido de máxima lectura. |
| **Texto Secundario** | `on-surface-variant` | `#D3C5AB` | Especificaciones técnicas, párrafos y notas. |
| **Bordes & Líneas** | `outline` | `#9C8F78` | Etiquetas telemétricas y bordes estructurales. |

### 2.2. Clases Utilitarias CSS Requeridas

```css
/* Base Body */
body {
  background-color: #0B0B0B;
  color: #E5E2E1;
  font-family: 'DM Sans', sans-serif;
  overflow-x: hidden;
}

/* Patrón de Fibra de Carbono */
.bg-carbon-pattern {
  background-color: #0B0B0B;
  background-image: 
    linear-gradient(45deg, #111111 25%, transparent 25%), 
    linear-gradient(-45deg, #111111 25%, transparent 25%), 
    linear-gradient(45deg, transparent 75%, #111111 75%), 
    linear-gradient(-45deg, transparent 75%, #111111 75%);
  background-size: 8px 8px;
  background-position: 0 0, 0 4px, 4px -4px, -4px 0px;
}

/* Grilla de Puntos Telemétrica */
.bg-telemetry-grid {
  background-image: radial-gradient(#2A2A2A 1px, transparent 1px);
  background-size: 24px 24px;
}

/* Biseles Aerodinámicos (Chamfer Cuts) */
.chamfer-tr {
  clip-path: polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 0 100%);
}
.chamfer-br {
  clip-path: polygon(0 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%);
}
.chamfer-diagonal {
  clip-path: polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px);
}

/* Resplandores Neón */
.glow-ignite {
  box-shadow: 0 0 25px rgba(255, 194, 0, 0.25);
}
.glow-redline {
  box-shadow: 0 0 25px rgba(229, 25, 55, 0.30);
}

/* Degradados de Texto de Fuego */
.text-gradient-flame {
  background: linear-gradient(135deg, #FFC200 0%, #FF8C00 50%, #E51937 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
.text-gradient-gold {
  background: linear-gradient(135deg, #FFE5B0 0%, #FFC200 60%, #B8860B 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

/* Custom Scrollbar */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
::-webkit-scrollbar-track {
  background: #0B0B0B;
}
::-webkit-scrollbar-thumb {
  background: #2A2A2A;
  border-radius: 0px;
}
::-webkit-scrollbar-thumb:hover {
  background: #FFC200;
}
```

---

## 3. COMPONENTES Y ESTRUCTURA VISUAL COMPLETA (HTML / JSX)

### 3.1. Barra de Navegación Fija y Ticker (`Navbar.tsx`)

```html
<header class="fixed top-0 left-0 right-0 z-40 bg-surface/95 backdrop-blur-md border-b border-surface-container">
  <!-- Ticker Superior de Telemetría -->
  <div class="bg-secondary-container text-on-secondary-container px-4 py-1 overflow-hidden select-none">
    <div class="w-full flex items-center justify-between font-label-telemetry text-xs uppercase tracking-wider">
      <div class="flex items-center gap-6 animate-pulse whitespace-nowrap overflow-x-auto">
        <span>🔥 Envíos a todo el país en blíster protegido</span>
        <span class="text-primary-container">//</span>
        <span>💳 10% OFF pagando con Transferencia Bancaria</span>
        <span class="text-primary-container">//</span>
        <span>📍 Retiros sin costo: Rioja 281, Junín</span>
        <span class="text-primary-container">//</span>
        <span>⚡ Stock 100% verificado y garantizado C-10</span>
      </div>
      <div class="hidden lg:flex items-center gap-2 pl-4">
        <span class="w-2 h-2 rounded-full bg-primary-container animate-ping"></span>
        <span class="text-on-secondary-container font-bold">TELÉMETRIA DE STOCK EN VIVO</span>
      </div>
    </div>
  </div>

  <!-- Header Principal -->
  <div class="h-20 w-full px-4 md:px-8 mx-auto flex items-center justify-between gap-4 max-w-7xl">
    <!-- Logotipo Oficial -->
    <a href="/" class="flex items-center gap-2 select-none group">
      <div class="relative h-12 w-12 md:h-14 md:w-14 overflow-hidden rounded-full border border-primary-container/40 group-hover:border-primary-container transition-colors shadow-lg shadow-primary-container/10">
        <img src="/images/logos/logo-badge-dark.jpg" alt="Wheels Zone Emblema Oficial" class="object-cover w-full h-full" />
      </div>
      <div class="flex flex-col">
        <span class="font-display-hero text-2xl md:text-3xl uppercase tracking-tighter text-on-surface leading-none group-hover:text-primary transition-colors">
          WHEELS<span class="text-primary-container">ZONE</span>
        </span>
        <span class="font-label-telemetry text-[10px] uppercase tracking-widest text-outline">
          DIE-CAST & HOT WHEELS COLLECTIBLES
        </span>
      </div>
    </a>

    <!-- Menú de Enlaces Desktop -->
    <nav class="hidden xl:flex items-center gap-2">
      <a href="/" class="font-label-telemetry text-xs uppercase tracking-wider px-3 py-1.5 transition-all text-primary-container bg-surface-container-high font-bold border-b-2 border-primary-container">Inicio</a>
      <a href="/tienda" class="font-label-telemetry text-xs uppercase tracking-wider px-3 py-1.5 transition-all text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low">Tienda & Catálogo</a>
      <a href="/#showroom" class="font-label-telemetry text-xs uppercase tracking-wider px-3 py-1.5 transition-all text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low">Showroom Junín</a>
      <a href="/comunidad" class="font-label-telemetry text-xs uppercase tracking-wider px-3 py-1.5 transition-all text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low">El Garaje (Comunidad)</a>
      <a href="/#encargos" class="font-label-telemetry text-xs uppercase tracking-wider px-3 py-1.5 transition-all text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low">Encargos Especiales</a>
      <a href="/admin" class="font-label-telemetry text-xs uppercase tracking-wider px-3 py-1.5 transition-all text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low">Admin</a>
    </nav>

    <!-- Barra de Búsqueda y Botones de Acción -->
    <div class="flex items-center gap-3">
      <form class="relative hidden md:block w-56 lg:w-64">
        <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <span class="material-symbols-outlined text-outline text-lg">search</span>
        </div>
        <input type="search" placeholder="Buscar casting, serie..." class="w-full pl-9 pr-3 py-1.5 bg-surface-container-low border border-surface-container-high text-on-surface font-body-sm text-xs placeholder:text-outline focus:outline-none focus:border-primary-container transition-colors" />
      </form>

      <a href="https://wa.me/5492364275322" target="_blank" rel="noopener noreferrer" class="h-9 px-3 bg-surface-container-high hover:bg-surface-container-highest text-on-surface border border-surface-container-highest flex items-center gap-1.5 font-label-telemetry text-xs font-bold uppercase tracking-wider transition-colors select-none whitespace-nowrap">
        <span class="material-symbols-outlined text-primary-container text-base">support_agent</span>
        <span class="hidden sm:inline">CONTACTANOS POR WHATSAPP</span>
      </a>

      <button class="h-9 px-3.5 bg-primary-container hover:bg-surface-tint active:scale-95 text-on-primary-container font-label-telemetry text-xs tracking-wider font-bold uppercase flex items-center gap-1.5 transition-all shadow-md select-none">
        <span class="material-symbols-outlined text-base">shopping_cart</span>
        <span class="hidden sm:inline">CARRITO</span>
        <span class="px-1.5 py-0.5 bg-on-primary-container text-primary-container text-xs font-bold leading-none">2</span>
      </button>

      <button class="xl:hidden p-2 text-on-surface-variant hover:text-on-surface focus:outline-none">
        <span class="material-symbols-outlined text-2xl">menu</span>
      </button>
    </div>
  </div>

  <!-- Mobile Drawer Menu -->
  <div class="xl:hidden bg-surface-container-lowest border-t border-surface-container px-4 py-4 flex flex-col gap-2 shadow-2xl">
    <form class="relative w-full mb-2">
      <span class="material-symbols-outlined absolute left-3 top-2.5 text-outline text-lg">search</span>
      <input type="search" placeholder="Buscar casting, serie, año..." class="w-full pl-10 pr-3 py-2 bg-surface-container-low border border-surface-container-high text-on-surface text-sm placeholder:text-outline focus:outline-none focus:border-primary-container" />
    </form>
    <a href="/" class="px-3 py-2 text-sm font-headline-sm uppercase tracking-wider text-primary-container bg-surface-container-high font-bold">Inicio</a>
    <a href="/tienda" class="px-3 py-2 text-sm font-headline-sm uppercase tracking-wider text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low">Tienda & Catálogo</a>
    <a href="/#showroom" class="px-3 py-2 text-sm font-headline-sm uppercase tracking-wider text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low">Showroom Junín</a>
    <a href="/comunidad" class="px-3 py-2 text-sm font-headline-sm uppercase tracking-wider text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low">El Garaje (Comunidad)</a>
    <a href="/#encargos" class="px-3 py-2 text-sm font-headline-sm uppercase tracking-wider text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low">Encargos Especiales</a>
    <a href="/admin" class="px-3 py-2 text-sm font-headline-sm uppercase tracking-wider text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low">Admin</a>
    <a href="https://wa.me/5492364275322" target="_blank" rel="noopener noreferrer" class="mt-2 px-3 py-2.5 bg-surface-container-high hover:bg-surface-container-highest text-on-surface border border-surface-container-highest flex items-center justify-center gap-2 font-label-telemetry text-xs font-bold uppercase tracking-wider transition-colors">
      <span class="material-symbols-outlined text-primary-container text-base">support_agent</span>
      <span>CONTACTANOS POR WHATSAPP</span>
    </a>
  </div>
</header>
```

---

### 3.2. Paddock Cart Drawer (`CartDrawer.tsx`)

```html
<div class="fixed inset-0 z-50 flex justify-end">
  <div class="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"></div>
  <div class="relative w-full max-w-md bg-surface-container-lowest border-l border-surface-container-high h-full flex flex-col z-10 shadow-2xl">
    <!-- Header -->
    <div class="p-4 bg-surface-container-low border-b border-surface-container flex items-center justify-between">
      <div class="flex items-center gap-2">
        <span class="material-symbols-outlined text-primary-container text-xl">shopping_cart</span>
        <div>
          <h2 class="font-headline-md uppercase text-on-surface tracking-wider text-lg">Paddock Carrito (1)</h2>
          <span class="text-xs font-label-telemetry text-primary-container uppercase">Embalaje Blindado C-10 Incluido</span>
        </div>
      </div>
      <button class="p-1 text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors">
        <span class="material-symbols-outlined text-2xl">close</span>
      </button>
    </div>

    <!-- Items List -->
    <div class="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
      <div class="bg-surface-container-low border border-surface-container p-3 flex gap-3 relative group">
        <div class="relative w-20 h-20 bg-surface-container-lowest flex-shrink-0 overflow-hidden border border-surface-container">
          <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuDQvZS12mbKb8nmB3EtCJiJFGVrC8KgusEcf8NfnxbrNmoTRwX7Yxzw1u9EtVLnYTfrsjRSYO3ATU-owjBX_Jt-uaSJrJMDKvyVvxlg5A3eajb3_AtPwcMS-WHlSCQyfOwAIaBHtg8tJK2GwCJbgRn6J6gsq45t2aqHvbzhLNwe0kceg2QHxRLFGhfuqRi1TaD3VU6AChARkeYG4ke0XBy1ICk9BO-igcP8TW9y3X_nOG6RIB_mXQbXcA" alt="Nissan Skyline" class="object-cover w-full h-full" />
        </div>
        <div class="flex-1 flex flex-col justify-between min-w-0">
          <div class="flex flex-col">
            <span class="text-[11px] font-label-telemetry uppercase text-primary-container truncate">Hot Wheels // 1:64</span>
            <h4 class="font-headline-sm uppercase text-on-surface text-sm truncate leading-tight">Nissan Skyline GT-R BNR34 Nismo</h4>
            <span class="text-[10px] text-outline font-label-telemetry uppercase mt-0.5">Blíster: Impecable C-10</span>
          </div>
          <div class="flex items-center justify-between mt-2">
            <div class="flex items-center bg-surface-container border border-surface-container-highest">
              <button class="px-2 py-0.5 text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high text-xs">-</button>
              <span class="px-2 text-xs font-label-telemetry font-bold text-on-surface">1</span>
              <button class="px-2 py-0.5 text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high text-xs">+</button>
            </div>
            <span class="font-label-price text-primary-container text-base">$18.500</span>
          </div>
        </div>
        <button class="absolute top-2 right-2 text-outline hover:text-race-red transition-colors" title="Quitar">
          <span class="material-symbols-outlined text-sm">delete</span>
        </button>
      </div>
    </div>

    <!-- Controls & WhatsApp Checkout -->
    <div class="p-4 bg-surface-container border-t border-surface-container-high flex flex-col gap-3">
      <div class="grid grid-cols-2 gap-1.5 font-label-telemetry text-xs uppercase">
        <button type="button" class="py-1.5 px-2 flex items-center justify-center gap-1 border transition-colors bg-primary-container text-on-primary-container border-primary-container font-bold">
          <span class="material-symbols-outlined text-sm">local_shipping</span>
          <span>Envío Blindado</span>
        </button>
        <button type="button" class="py-1.5 px-2 flex items-center justify-center gap-1 border transition-colors bg-surface-container-low text-on-surface-variant border-surface-container hover:text-on-surface">
          <span class="material-symbols-outlined text-sm">storefront</span>
          <span>Retiro en Junín</span>
        </button>
      </div>

      <div class="grid grid-cols-2 gap-2">
        <input type="text" placeholder="Tu nombre..." class="bg-surface-container-lowest px-3 py-1.5 text-xs text-on-surface placeholder:text-outline border border-surface-container-highest focus:outline-none focus:border-primary-container" />
        <input type="text" placeholder="Ciudad de envío..." class="bg-surface-container-lowest px-3 py-1.5 text-xs text-on-surface placeholder:text-outline border border-surface-container-highest focus:outline-none focus:border-primary-container" />
      </div>

      <div class="flex flex-col gap-1 text-xs font-label-telemetry uppercase">
        <div class="flex justify-between text-on-surface-variant">
          <span>Subtotal (1 piezas):</span>
          <span>$18.500</span>
        </div>
        <div class="flex justify-between text-secondary">
          <span class="flex items-center gap-1">
            <span class="material-symbols-outlined text-xs">savings</span>
            10% OFF Transferencia:
          </span>
          <span>-$1.850</span>
        </div>
        <div class="flex justify-between text-base font-bold text-on-surface pt-1 border-t border-surface-container-highest">
          <span class="font-headline-sm uppercase text-sm">Total Transferencia:</span>
          <span class="font-label-price text-primary-container text-xl">$16.650</span>
        </div>
      </div>

      <button class="w-full py-3 bg-gradient-to-r from-primary-container via-surface-tint to-secondary-container text-surface-container-lowest font-headline-md uppercase tracking-wider text-sm flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-95 transition-all shadow-lg">
        <span class="material-symbols-outlined text-lg">chat</span>
        <span>COMPRAR VÍA WHATSAPP</span>
      </button>

      <div class="flex items-center justify-between text-[11px] font-label-telemetry text-outline">
        <span>💳 Aceptamos Transferencias y MP</span>
        <button class="underline hover:text-race-red transition-colors">Vaciar Carrito</button>
      </div>
    </div>
  </div>
</div>
```

---

### 3.3. Portada Home (`app/page.tsx`): Hero, Spotlight, Destacados y Showroom

```html
<div class="flex flex-col w-full">
  <!-- Hero Section -->
  <section class="relative w-full overflow-hidden bg-carbon-pattern py-12 md:py-20 lg:py-28 border-b border-surface-container">
    <div class="absolute -top-32 -left-32 w-96 h-96 bg-secondary-container/20 rounded-full blur-[140px] pointer-events-none"></div>
    <div class="absolute top-1/2 right-0 w-[32rem] h-[32rem] bg-primary-container/15 rounded-full blur-[150px] pointer-events-none"></div>
    <div class="absolute inset-0 bg-telemetry-grid opacity-30 pointer-events-none"></div>

    <div class="relative w-full px-4 md:px-8 mx-auto max-w-7xl z-10">
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
        <!-- Hero Deck (7 Cols) -->
        <div class="lg:col-span-7 flex flex-col gap-5">
          <div class="flex flex-wrap items-center gap-2">
            <span class="inline-flex items-center gap-1.5 px-3 py-1 bg-secondary-container text-on-secondary-container font-label-telemetry text-xs tracking-widest uppercase">
              <span class="material-symbols-outlined text-sm animate-bounce" style="font-variation-settings: 'FILL' 1;">local_fire_department</span>
              STOCK LIMITADO
            </span>
            <span class="inline-flex items-center gap-1.5 px-3 py-1 bg-surface-container-high text-primary-container font-label-telemetry text-xs tracking-widest uppercase border border-surface-container-highest">
              <span class="material-symbols-outlined text-sm">shield</span>
              ENVÍO BLINDADO CARD-PROTECT
            </span>
            <span class="hidden sm:inline-flex items-center gap-1 px-2 py-1 text-outline font-label-telemetry text-xs">
              RADAR: ONLINE // EDICIÓN 2024
            </span>
          </div>

          <div class="flex flex-col">
            <span class="font-headline-sm text-sm md:text-base uppercase tracking-widest text-primary-container flex items-center gap-2">
              <span class="w-8 h-1 bg-primary-container inline-block"></span>
              DIVISIÓN PADDOCK 1:64
            </span>
            <h1 class="font-display-hero text-4xl sm:text-5xl md:text-6xl uppercase text-on-surface tracking-tight mt-2 leading-[0.95] drop-shadow-md">
              LA ZONA DEFINITIVA PARA <span class="text-gradient-flame italic">COLECCIONISTAS</span> DE ALTA VELOCIDAD
            </h1>
          </div>

          <p class="font-body-lg text-sm sm:text-base text-on-surface-variant max-w-2xl leading-relaxed">
            Encontrá piezas únicas, Mainlines seleccionados, líneas Premium, exclusividades RLC y los codiciados Super Treasure Hunts con embalaje de grado industrial blindado a todo el país.
          </p>

          <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
            <a href="/tienda" class="relative group px-6 py-4 bg-gradient-to-r from-primary-container via-surface-tint to-secondary-container text-surface-container-lowest font-headline-md text-base md:text-lg uppercase tracking-wider flex items-center justify-center gap-2 transition-transform duration-200 hover:scale-[1.02] active:scale-95 shadow-xl shadow-primary-container/20 chamfer-tr">
              <span class="material-symbols-outlined text-xl" style="font-variation-settings: 'FILL' 1;">speed</span>
              <span>EXPLORAR CATÁLOGO COMPLETO</span>
            </a>
            <a href="#encargos" class="px-6 py-4 bg-surface-container hover:bg-surface-container-high border border-surface-container-highest text-on-surface font-headline-md text-base md:text-lg uppercase tracking-wider flex items-center justify-center gap-2 transition-colors duration-200">
              <span class="material-symbols-outlined text-xl text-primary-container">travel_explore</span>
              <span>HACER UN ENCARGO ESPECIAL</span>
            </a>
          </div>

          <div class="grid grid-cols-3 gap-3 pt-4 border-t border-surface-container-high">
            <div class="p-3 bg-surface-container-low border border-surface-container flex flex-col">
              <span class="font-headline-lg text-2xl md:text-3xl text-primary-container tracking-tighter leading-none">+1,250</span>
              <span class="font-label-telemetry text-[11px] uppercase text-on-surface-variant mt-1">Modelos en Stock</span>
            </div>
            <div class="p-3 bg-surface-container-low border border-surface-container flex flex-col">
              <span class="font-headline-lg text-2xl md:text-3xl text-secondary tracking-tighter leading-none">100%</span>
              <span class="font-label-telemetry text-[11px] uppercase text-on-surface-variant mt-1">Blíster Cuidado C-10</span>
            </div>
            <div class="p-3 bg-surface-container-low border border-surface-container flex flex-col">
              <span class="font-headline-lg text-2xl md:text-3xl text-tertiary-fixed tracking-tighter leading-none">980+</span>
              <span class="font-label-telemetry text-[11px] uppercase text-on-surface-variant mt-1">Coleccionistas Felices</span>
            </div>
          </div>
        </div>

        <!-- Spotlight Card (5 Cols) -->
        <div class="lg:col-span-5 relative flex justify-center items-center">
          <div class="absolute w-[300px] h-[300px] md:w-[420px] md:h-[420px] bg-secondary-container/10 rounded-full flex items-center justify-center pointer-events-none animate-pulse">
            <div class="w-3/4 h-3/4 bg-primary-container/10 rounded-full flex items-center justify-center">
              <div class="w-1/2 h-1/2 bg-surface-container-highest/20 rounded-full"></div>
            </div>
          </div>

          <div class="relative z-10 w-full max-w-md bg-surface-container-low border-2 border-primary-container/40 p-4 shadow-2xl flex flex-col gap-3 group">
            <div class="flex items-center justify-between pb-1 border-b border-surface-container-highest">
              <div class="flex items-center gap-1.5">
                <span class="w-2.5 h-2.5 bg-secondary-container rounded-full animate-ping"></span>
                <span class="font-label-telemetry text-xs uppercase text-primary tracking-widest font-bold">SPOTLIGHT OFICIAL</span>
              </div>
              <span class="font-label-telemetry text-[11px] px-2 py-0.5 bg-surface-container-highest text-outline uppercase">SERIE PREMIUM CAR CULTURE</span>
            </div>

            <div class="relative w-full h-72 md:h-80 bg-surface-container-lowest overflow-hidden border border-surface-container flex items-center justify-center">
              <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuDQvZS12mbKb8nmB3EtCJiJFGVrC8KgusEcf8NfnxbrNmoTRwX7Yxzw1u9EtVLnYTfrsjRSYO3ATU-owjBX_Jt-uaSJrJMDKvyVvxlg5A3eajb3_AtPwcMS-WHlSCQyfOwAIaBHtg8tJK2GwCJbgRn6J6gsq45t2aqHvbzhLNwe0kceg2QHxRLFGhfuqRi1TaD3VU6AChARkeYG4ke0XBy1ICk9BO-igcP8TW9y3X_nOG6RIB_mXQbXcA" alt="Nissan Skyline" class="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500" />
              <div class="absolute top-2 left-2 flex flex-col gap-1">
                <span class="bg-secondary-container text-on-secondary-container font-label-telemetry text-[11px] px-2 py-0.5 uppercase font-bold tracking-wider">SPECTRAFLAME FINISH</span>
                <span class="bg-surface-container-lowest/90 backdrop-blur-sm text-primary font-label-telemetry text-[11px] px-2 py-0.5 uppercase tracking-wider">REAL RIDERS TIRES</span>
              </div>
              <div class="absolute bottom-0 inset-x-0 p-3 bg-gradient-to-t from-black via-black/80 to-transparent flex items-end justify-between">
                <div>
                  <span class="font-headline-sm text-base text-white uppercase block leading-tight">Nissan Skyline R34 Nismo</span>
                  <span class="font-body-sm text-xs text-on-surface-variant">Chasis Metálico // Edición Limitada</span>
                </div>
                <span class="font-label-price text-2xl text-primary-container">$18.500</span>
              </div>
            </div>

            <div class="flex items-center justify-between pt-1 font-label-telemetry text-xs text-outline">
              <span>ESC: 1:64 REAL DIE-CAST</span>
              <span class="text-primary-container flex items-center gap-1 font-bold">
                <span class="material-symbols-outlined text-sm">verified</span> CERTIFICADO MINT 10/10
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- Destacados de la Semana -->
  <section class="w-full bg-surface py-16 md:py-24 border-b border-surface-container" id="destacados">
    <div class="w-full px-4 md:px-8 mx-auto max-w-7xl flex flex-col gap-8">
      <div class="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2 border-b border-surface-container">
        <div class="flex flex-col gap-1">
          <div class="flex items-center gap-2">
            <span class="w-3 h-3 bg-secondary-container"></span>
            <span class="font-label-telemetry text-xs uppercase tracking-widest text-secondary font-bold">CIRCUITO DE RAREZAS // EDICIONES LIMITADAS</span>
          </div>
          <h2 class="font-display-hero text-3xl md:text-5xl uppercase tracking-tight text-on-surface">
            DESTACADOS DE LA <span class="text-primary-container italic">SEMANA</span>
          </h2>
        </div>
        <div class="flex items-center gap-4">
          <p class="font-body-sm text-xs text-on-surface-variant max-w-md hidden md:block">
            Piezas verificadas bajo el estricto protocolo C-10 con protector incluido.
          </p>
          <a href="/tienda" class="font-headline-sm text-sm uppercase text-primary-container hover:underline flex items-center gap-1 whitespace-nowrap">
            Ver todo el catálogo
            <span class="material-symbols-outlined text-base">arrow_forward</span>
          </a>
        </div>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="group bg-surface-container-low hover:bg-surface-container transition-all duration-300 flex flex-col border border-surface-container hover:border-primary-container relative overflow-hidden">
          <div class="relative w-full h-64 bg-surface-container-lowest overflow-hidden">
            <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuDQvZS12mbKb8nmB3EtCJiJFGVrC8KgusEcf8NfnxbrNmoTRwX7Yxzw1u9EtVLnYTfrsjRSYO3ATU-owjBX_Jt-uaSJrJMDKvyVvxlg5A3eajb3_AtPwcMS-WHlSCQyfOwAIaBHtg8tJK2GwCJbgRn6J6gsq45t2aqHvbzhLNwe0kceg2QHxRLFGhfuqRi1TaD3VU6AChARkeYG4ke0XBy1ICk9BO-igcP8TW9y3X_nOG6RIB_mXQbXcA" alt="Ford GT40 STH" class="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500" />
            <div class="absolute top-2 left-2 flex flex-col gap-1 z-10">
              <span class="bg-surface-container-highest/90 text-on-surface font-label-telemetry text-[11px] px-2 py-0.5 uppercase tracking-wider">ESCALA 1:64</span>
              <span class="bg-secondary-container text-on-secondary-container font-label-telemetry text-[11px] px-2 py-0.5 uppercase font-bold tracking-wider flex items-center gap-1">
                <span class="material-symbols-outlined text-xs" style="font-variation-settings: 'FILL' 1;">whatshot</span>
                STH ULTRA RARO
              </span>
            </div>
            <div class="absolute top-2 right-2 z-10">
              <span class="bg-surface-container-lowest/90 text-tertiary-fixed font-label-telemetry text-[11px] px-2 py-0.5 border border-surface-container">BLÍSTER 10/10</span>
            </div>
          </div>
          <div class="p-4 flex flex-col flex-grow justify-between gap-3">
            <div class="flex flex-col gap-1">
              <span class="font-label-telemetry text-[11px] uppercase text-outline truncate">Super Treasure Hunt // 2024</span>
              <h3 class="font-headline-md text-lg uppercase text-on-surface group-hover:text-primary transition-colors leading-snug line-clamp-1">Ford GT40 MKII Spectraflame</h3>
              <p class="font-body-sm text-xs text-on-surface-variant line-clamp-2">Pintura spectraflame dorada exclusiva con ruedas de goma Real Riders.</p>
            </div>
            <div class="flex flex-col gap-2 pt-2 border-t border-surface-container">
              <div class="flex items-baseline justify-between">
                <span class="font-label-price text-2xl text-primary-container">$34.000</span>
                <span class="font-label-telemetry text-xs text-outline">STOCK: 1 UNID.</span>
              </div>
              <div class="grid grid-cols-2 gap-2">
                <button class="py-2.5 px-2 bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-headline-sm text-xs uppercase flex items-center justify-center gap-1 transition-colors border border-surface-container-highest">
                  <span class="material-symbols-outlined text-sm">add_shopping_cart</span>
                  <span>CARRITO</span>
                </button>
                <a href="https://wa.me/5492364275322" target="_blank" rel="noopener noreferrer" class="py-2.5 px-2 bg-primary-container hover:bg-surface-tint text-on-primary-container font-headline-sm text-xs uppercase flex items-center justify-center gap-1 transition-colors font-bold">
                  <span class="material-symbols-outlined text-sm">chat</span>
                  <span>COMPRAR</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- Showroom Junín (5 Cols + 7 Cols) -->
  <section class="w-full bg-carbon-pattern py-16 md:py-24 border-b border-surface-container relative" id="showroom">
    <div class="w-full px-4 md:px-8 mx-auto max-w-7xl relative z-10 flex flex-col gap-10">
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        <div class="lg:col-span-5 bg-surface-container-low border border-surface-container p-6 md:p-8 flex flex-col justify-between gap-6 shadow-2xl">
          <div class="flex flex-col gap-5">
            <div class="flex items-center justify-between pb-2 border-b border-surface-container">
              <span class="font-headline-sm uppercase text-sm text-on-surface tracking-wider">WHEELS ZONE HEADQUARTERS</span>
              <span class="font-label-telemetry text-[11px] px-2 py-0.5 bg-secondary-container text-on-secondary-container uppercase font-bold">PUNTO DE RETIRO</span>
            </div>
            <div class="flex flex-col gap-1.5 p-3.5 bg-surface-container border border-surface-container-high">
              <p class="font-headline-sm text-lg uppercase text-on-surface leading-snug">Rioja 281, B6022 Junín, Argentina</p>
              <span class="text-xs font-body-sm text-on-surface-variant">Provincia de Buenos Aires // Showroom presencial</span>
            </div>
          </div>
          <a href="https://wa.me/5492364275322" target="_blank" rel="noopener noreferrer" class="w-full py-3.5 bg-gradient-to-r from-primary-container via-surface-tint to-secondary-container text-surface-container-lowest font-headline-md uppercase text-sm tracking-wider flex items-center justify-center gap-2 font-bold shadow-lg">
            <span class="material-symbols-outlined text-lg">calendar_month</span>
            <span>COORDINAR VISITA POR WHATSAPP</span>
          </a>
        </div>

        <div class="lg:col-span-7 bg-surface-container-low border-2 border-primary-container/40 p-2 shadow-2xl relative overflow-hidden flex flex-col min-h-[420px]">
          <div class="relative w-full h-full min-h-[400px] bg-surface-container-lowest overflow-hidden">
            <iframe title="Showroom" src="https://maps.google.com/maps?q=Rioja+281,+B6022+Jun%C3%ADn,+Provincia+de+Buenos+Aires&t=&z=16&ie=UTF8&iwloc=&output=embed" class="w-full h-full min-h-[400px] border-0" style="filter: invert(90%) hue-rotate(180deg) contrast(125%) grayscale(25%);"></iframe>
          </div>
        </div>
      </div>
    </div>
  </section>
</div>
```

---

### 3.4. Footer Institucional (`Footer.tsx`)

```html
<footer class="w-full bg-surface-container-lowest text-on-surface-variant border-t border-surface-container mt-16">
  <div class="w-full max-w-7xl px-4 md:px-8 mx-auto py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
    <div class="flex flex-col gap-4">
      <div class="relative h-12 w-48">
        <img src="/images/logos/logo-swoosh-transparent.png" alt="Wheels Zone Flame Logo" class="object-contain object-left w-full h-full" />
      </div>
      <p class="font-body-sm text-xs text-on-surface-variant leading-relaxed">
        El hub definitivo para coleccionistas de alta gama, rarezas Mainline, Red Line Club (RLC), Super Treasure Hunts y piezas die-cast 1:64 con certificación C-10.
      </p>
      <div class="flex items-center gap-2 pt-2">
        <span class="w-2.5 h-2.5 bg-race-red rounded-full animate-ping"></span>
        <span class="font-label-telemetry text-xs uppercase text-primary-container">ATENCIÓN PERSONALIZADA 24/7</span>
      </div>
    </div>

    <div class="flex flex-col gap-3">
      <span class="font-headline-sm uppercase text-on-surface tracking-wider text-base">Blindaje de Empaque</span>
      <p class="font-body-sm text-xs text-on-surface-variant leading-relaxed">
        Cada pieza viaja en protector acrílico rígido o burbuja termoformada, resguardada en cajas corrugadas tricapa reforzadas para evitar esquinas dobladas.
      </p>
      <div class="flex flex-col gap-1.5 font-label-telemetry text-xs text-outline pt-1">
        <span class="flex items-center gap-2 text-on-surface">
          <span class="material-symbols-outlined text-primary-container text-sm">verified</span>
          PROTECTOR CARD CASE INCLUIDO
        </span>
        <span class="flex items-center gap-2 text-on-surface">
          <span class="material-symbols-outlined text-primary-container text-sm">shield</span>
          SELLO ANTI-APLASTAMIENTO C-10
        </span>
      </div>
    </div>

    <div class="flex flex-col gap-3">
      <span class="font-headline-sm uppercase text-on-surface tracking-wider text-base">Pasarela & Despachos</span>
      <p class="font-body-sm text-xs text-on-surface-variant leading-relaxed">
        Aboná de forma segura por transferencia bancaria instantánea y obtené un 10% de descuento directo en cualquier modelo. Aceptamos Mercado Pago.
      </p>
      <div class="flex flex-col gap-1 font-label-telemetry text-xs text-primary-container bg-surface-container-low p-2.5 border border-surface-container">
        <div class="flex items-center gap-2 text-secondary">
          <span class="material-symbols-outlined text-base">local_shipping</span>
          <span class="font-bold">DESPACHO EXPRESS 24/48HS</span>
        </div>
        <span class="text-[11px] text-outline">Seguimiento por WhatsApp en tiempo real</span>
      </div>
    </div>

    <div class="flex flex-col gap-3">
      <span class="font-headline-sm uppercase text-on-surface tracking-wider text-base">Protocolo Coleccionista</span>
      <ul class="flex flex-col gap-2 font-body-sm text-xs text-on-surface-variant">
        <li><a href="/tienda" class="hover:text-primary-container transition-colors flex items-center gap-1.5"><span class="material-symbols-outlined text-xs text-primary-container">chevron_right</span>Guía de Grados de Blíster (C-1 a C-10)</a></li>
        <li><a href="/comunidad" class="hover:text-primary-container transition-colors flex items-center gap-1.5"><span class="material-symbols-outlined text-xs text-primary-container">chevron_right</span>El Garaje de la Comunidad (Reseñas)</a></li>
        <li><a href="/#encargos" class="hover:text-primary-container transition-colors flex items-center gap-1.5"><span class="material-symbols-outlined text-xs text-primary-container">chevron_right</span>Cacería de Piezas Raras & Importación</a></li>
        <li><a href="/admin" class="hover:text-primary-container transition-colors flex items-center gap-1.5 text-outline"><span class="material-symbols-outlined text-xs text-secondary-container">lock</span>Portal de Administración (Privado)</a></li>
      </ul>
    </div>
  </div>

  <div class="w-full bg-surface-container-low border-t border-surface-container py-4">
    <div class="w-full max-w-7xl px-4 md:px-8 mx-auto flex flex-col md:flex-row items-center justify-between gap-3 font-label-telemetry text-xs text-outline">
      <div><span>© 2026 WHEELS ZONE PLATFORM. TODOS LOS DERECHOS RESERVADOS.</span></div>
      <div class="flex items-center gap-4">
        <span>TRACK-TESTED PACKAGING SYSTEM</span>
        <span class="text-primary-container">//</span>
        <span>PADDOCK ENLACE SEGURO</span>
        <span class="text-primary-container">//</span>
        <a href="/admin" class="hover:text-primary-container transition-colors">ADMIN CONTROL</a>
      </div>
    </div>
  </div>
</footer>
```

---

## 4. RESPONSIVE BEHAVIOR Y BREAKPOINTS

- **Desktop (≥ 1024px / 1280px):** 12 columnas activas. Menú horizontal completo, barra de búsqueda persistente, grilla de tienda en 3 columnas de productos con sidebar fijo a 3 columnas. Showroom dividido en 5 columnas de datos y 7 columnas para mapa interactivo.
- **Tablet (768px - 1023px):** Menú colapsa elementos secundarios. Catálogo pasa a 2 columnas. Tarjetas spotlight y showcase mantienen formato compacto.
- **Mobile (< 768px):** Diseño 100% monocolumna vertical apilado. El titular hero se reduce de 56px a 36px. Los botones de acción ocupan el 100% del ancho (`w-full`). El drawer del carrito y los filtros de catálogo se abren en pantalla completa táctil.
