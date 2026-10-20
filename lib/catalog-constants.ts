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
  { label: 'Otra marca o categoría', value: 'Otra marca o categoría', aliases: [] },
];

export const CATALOG_SCALES = ['1:64', '1:43', '1:24', '1:36', '1:18'];

export const CATALOG_THEMES = [
  'JDM',
  'Muscle Cars',
  'Car Culture',
  'Boulevard',
  'Camionetas Off-Road',
  'Super Treasure Hunt ($TH)',
  'Treasure Hunt (TH)',
  'Mainline / Básico',
  'Fast & Furious Premium',
  'Red Line Club (RLC)',
  'Exóticos / Hiperautos',
];

export const CATALOG_BLISTER_CONDITIONS: BlisterCondition[] = [
  'Impecable',
  'Muy Bueno',
  'Desgaste / Abrir',
  'Loose',
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
