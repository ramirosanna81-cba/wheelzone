import { Product, BlisterCondition } from './types';

export interface CatalogBrandOption {
  label: string;
  value: string;
  aliases?: string[];
}

export const CATALOG_BRANDS: CatalogBrandOption[] = [
  { label: 'Hw básicos', value: 'Hw básicos', aliases: ['básico', 'basico', 'mainline'] },
  { label: 'Hw Silver', value: 'Hw Silver', aliases: ['silver'] },
  { label: 'Hw Premium', value: 'Hw Premium', aliases: ['premium', 'car culture', 'boulevard', 'speed machines', 'circuit legends', 'fast & furious'] },
  { label: 'Hw th', value: 'Hw th', aliases: ['treasure hunt', 'th regular', 'hw th'] },
  { label: 'Hw sth', value: 'Hw sth', aliases: ['super treasure hunt', 'sth', '$th'] },
  { label: 'Hw team transport premium', value: 'Hw team transport premium', aliases: ['team transport'] },
  { label: 'Tarmac', value: 'Tarmac', aliases: ['tarmac works', 'tarmac'] },
  { label: 'Inno64', value: 'Inno64', aliases: ['inno64', 'inno 64'] },
  { label: 'Matchbox', value: 'Matchbox', aliases: ['matchbox'] },
  { label: 'Majorette', value: 'Majorette', aliases: ['majorette'] },
  { label: 'Mini GT', value: 'Mini GT', aliases: ['mini gt', 'minigt', 'tsm'] },
  { label: 'Poster cars', value: 'Poster cars', aliases: ['poster cars', 'poster'] },
  { label: 'Burago', value: 'Burago', aliases: ['burago', 'bburago'] },
  { label: 'kaido House/ Mini gt', value: 'kaido House/ Mini gt', aliases: ['kaido house', 'kaido'] },
  { label: 'Inolvidables', value: 'Inolvidables', aliases: ['inolvidables', 'inolvidable'] },
  { label: 'Inolvidables 80/90', value: 'Inolvidables 80/90', aliases: ['80/90', 'inolvidables 80', 'inolvidables 90'] },
  { label: 'Inolvidables reparto y servicio', value: 'Inolvidables reparto y servicio', aliases: ['reparto', 'servicio', 'reparto y servicio'] },
  { label: 'GreenLight', value: 'GreenLight', aliases: ['greenlight'] },
  { label: 'M2 Machines', value: 'M2 Machines', aliases: ['m2 machines', 'm2'] },
  { label: 'Johnny Lightning', value: 'Johnny Lightning', aliases: ['johnny lightning'] },
  { label: 'Kinsmart', value: 'Kinsmart', aliases: ['kinsmart'] },
  { label: 'Jada', value: 'Jada', aliases: ['jada', 'jada toys'] },
  { label: 'Welly', value: 'Welly', aliases: ['welly', 'welly nex'] },
  { label: 'Otra marca o categoría', value: 'Otra marca o categoría', aliases: [] },
];

export const CATALOG_SCALES = ['1:64', '1:43', '1:36', '1:32', '1:24', '1:18'];

export const CATALOG_THEMES = [
  'Línea Premium',
  'Básicos / Mainline',
  'JDM',
  'Muscle Cars',
  'Carreras / GT / Rally / F1',
  'Exóticos / Hiperautos',
  'Camionetas Off-Road',
  'Autos Inolvidables / Kiosco',
  'Edición Limitada / Especial',
  'Super Treasure Hunt ($TH)',
  'Treasure Hunt (TH)',
  'Car Culture / Boulevard',
  'Red Line Club (RLC)',
  'Colección General',
];

export const CATALOG_BLISTER_CONDITIONS: BlisterCondition[] = [
  'Impecable',
  'Muy Bueno',
  'Desgaste / Abrir',
  'Suelto Nuevo',
  'Suelto Usado',
];

/**
 * Función unificada para determinar si un producto coincide con una marca/línea seleccionada
 */
export function matchesBrand(product: Product, brandFilterValue: string): boolean {
  if (!brandFilterValue) return true;

  const brandValLower = brandFilterValue.toLowerCase().trim();
  const prodMarcaLower = (product.marca || '').toLowerCase().trim();
  const prodCatLower = (product.categoria || '').toLowerCase().trim();
  const prodSerieLower = (product.serie || '').toLowerCase().trim();
  const prodModeloLower = (product.modelo || '').toLowerCase().trim();
  const fullText = `${prodMarcaLower} ${prodCatLower} ${prodSerieLower} ${prodModeloLower}`;

  // Coincidencia exacta o directa en marca
  if (prodMarcaLower === brandValLower) {
    return true;
  }

  // Reglas especializadas para líneas y submarcas
  if (brandValLower === 'hw básicos') {
    return (
      prodMarcaLower === 'hw básicos' ||
      fullText.includes('básico') ||
      fullText.includes('basico') ||
      fullText.includes('mainline')
    );
  }
  if (brandValLower === 'hw silver') {
    return prodMarcaLower === 'hw silver' || fullText.includes('silver');
  }
  if (brandValLower === 'hw premium') {
    return (
      prodMarcaLower === 'hw premium' ||
      fullText.includes('premium') ||
      fullText.includes('car culture') ||
      fullText.includes('boulevard') ||
      fullText.includes('speed machines') ||
      fullText.includes('circuit legends') ||
      fullText.includes('fast & furious')
    );
  }
  if (brandValLower === 'hw th') {
    return (
      prodMarcaLower === 'hw th' ||
      (fullText.includes('treasure hunt') && !fullText.includes('super')) ||
      fullText.includes('hw th') ||
      fullText.includes('th regular')
    );
  }
  if (brandValLower === 'hw sth') {
    return (
      prodMarcaLower === 'hw sth' ||
      fullText.includes('super treasure hunt') ||
      fullText.includes('sth') ||
      fullText.includes('$th')
    );
  }
  if (brandValLower === 'hw team transport premium') {
    return prodMarcaLower === 'hw team transport premium' || fullText.includes('team transport');
  }
  if (brandValLower === 'burago') {
    return fullText.includes('burago') || fullText.includes('bburago');
  }
  if (brandValLower.includes('kaido')) {
    return fullText.includes('kaido');
  }
  if (brandValLower === 'mini gt') {
    return fullText.includes('mini gt') || fullText.includes('minigt');
  }
  if (brandValLower === 'poster cars') {
    return fullText.includes('poster');
  }
  if (brandValLower === 'inolvidables 80/90') {
    return (
      prodMarcaLower === 'inolvidables 80/90' ||
      fullText.includes('80/90') ||
      (fullText.includes('inolvidables') && (fullText.includes('80') || fullText.includes('90')))
    );
  }
  if (brandValLower === 'inolvidables reparto y servicio') {
    return (
      prodMarcaLower === 'inolvidables reparto y servicio' ||
      fullText.includes('reparto') ||
      fullText.includes('servicio')
    );
  }
  if (brandValLower === 'inolvidables') {
    return (
      (prodMarcaLower === 'inolvidables' || fullText.includes('inolvidable')) &&
      !fullText.includes('80') &&
      !fullText.includes('90') &&
      !fullText.includes('reparto')
    );
  }

  // Buscar en alias configurados
  const option = CATALOG_BRANDS.find(
    (b) => b.value.toLowerCase() === brandValLower || b.label.toLowerCase() === brandValLower
  );
  if (option?.aliases) {
    for (const alias of option.aliases) {
      if (fullText.includes(alias.toLowerCase())) {
        return true;
      }
    }
  }

  return fullText.includes(brandValLower);
}

export interface DescriptionTemplate {
  label: string;
  category: string;
  text: string;
}

export const DESCRIPTION_TEMPLATES: DescriptionTemplate[] = [
  {
    label: 'Básico en Blíster',
    category: 'Hot Wheels',
    text: 'Hot Wheels escala 1:64 en blíster original cerrado. Casting metálico con base plástica y gráficos originales de fábrica.',
  },
  {
    label: 'Premium / Real Riders',
    category: 'Hot Wheels',
    text: 'Edición Premium para coleccionistas: carrocería y chasis Metal/Metal, neumáticos de goma Real Riders y tampografía nítida.',
  },
  {
    label: 'Tarjeta Protegida',
    category: 'Protegido',
    text: 'Pieza de colección en blíster cerrado con tarjeta protegida en protector rígido. Ideal para colgar o exhibir.',
  },
  {
    label: 'Suelto Nuevo (Vitrina)',
    category: 'Suelto',
    text: 'Pieza suelta 1:64 nueva, retirada de blíster únicamente para exhibición en vitrina. Sin detalles ni marcas de rodado.',
  },
  {
    label: 'Suelto Usado / Vintage',
    category: 'Suelto',
    text: 'Pieza suelta vintage en buen estado general. Pintura y ruedas revisadas para colección o restauración.',
  },
  {
    label: 'Mini GT / Kaido House',
    category: 'Alta Gama',
    text: 'Modelo de alta precisión en escala 1:64 con chasis de aleación, interior detallado y caja original con blíster protector interior.',
  },
  {
    label: 'Matchbox / Moving Parts',
    category: 'Matchbox',
    text: 'Matchbox escala 1:64 serie Moving Parts con partes funcionales móviles (aperturas) y detalles realistas de carrocería.',
  },
  {
    label: 'Autos Inolvidables',
    category: 'Kiosco',
    text: 'Réplica a escala con carrocería die-cast detallada, interiores fieles y base expositora con peana identificatoria.',
  },
];

/**
 * Genera una descripción inteligente según el estado del blíster, marca y escala si el producto no tiene una personalizada
 */
export function getDefaultProductDescription(product: Partial<Product>): string {
  const marca = product.marca || 'Hot Wheels';
  const escala = product.escala || '1:64';
  const blister = (product.estado_blister || '').toLowerCase();
  const cat = (product.categoria || '').toLowerCase();
  const marcaLower = marca.toLowerCase();

  // 1. Piezas sueltas
  if (blister.includes('suelto') || blister.includes('loose')) {
    if (blister.includes('usado')) {
      return `Pieza suelta en escala ${escala} en buen estado general, revisada para colección o exhibición en vitrina.`;
    }
    return `Pieza suelta en escala ${escala} nueva, impecable sin rodar, ideal para vitrina o diorama.`;
  }

  // 2. Marcas de alta gama
  if (marcaLower.includes('mini gt') || marcaLower.includes('kaido') || marcaLower.includes('inno64') || marcaLower.includes('tarmac')) {
    return `${marca} en escala ${escala} de alta precisión para coleccionistas, chasis de aleación y caja original.`;
  }

  // 3. Super Treasure Hunt / RLC / Especiales
  if (cat.includes('super treasure') || cat.includes('sth') || cat.includes('$th') || cat.includes('rlc')) {
    return `Edición especial ${marca} escala ${escala} con pintura Spectraflame de alto brillo, neumáticos Real Riders y tarjeta protegida.`;
  }

  // 4. Líneas Premium
  if (cat.includes('premium') || marcaLower.includes('premium') || cat.includes('car culture') || cat.includes('boulevard')) {
    return `${marca} Premium escala ${escala}: construcción Metal/Metal con neumáticos de goma Real Riders en blíster original.`;
  }

  // 5. Matchbox Moving Parts
  if (marcaLower.includes('matchbox') && cat.includes('moving parts')) {
    return `Matchbox escala ${escala} serie Moving Parts con aperturas funcionales y detalles realistas de carrocería.`;
  }

  // 6. Autos Inolvidables / Kiosco
  if (marcaLower.includes('inolvidable')) {
    return `Modelo die-cast escala ${escala} con interiores detallados y base expositora para coleccionistas.`;
  }

  // 7. General / Básico por defecto
  return `${marca} escala ${escala} en blíster original cerrado con casting detallado.`;
}
