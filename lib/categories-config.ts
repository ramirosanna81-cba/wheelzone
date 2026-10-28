export interface CategoryConfig {
  slug: string;
  title: string;
  seoTitle: string;
  description: string;
  keywords: string[];
  filterFn: (product: any) => boolean;
}

export const CATEGORY_DEFINITIONS: Record<string, CategoryConfig> = {
  'hot-wheels-premium': {
    slug: 'hot-wheels-premium',
    title: 'Hot Wheels Premium',
    seoTitle: 'Hot Wheels Premium en Argentina | Car Culture, Boulevard y Real Riders',
    description:
      'Comprá Hot Wheels Premium originales en Argentina: Car Culture, Boulevard, Team Transport y Speed Machines con llantas de goma Real Riders y chasis de metal.',
    keywords: [
      'Hot Wheels Premium Argentina',
      'Car Culture',
      'Boulevard Hot Wheels',
      'Real Riders',
      'Team Transport',
      'Hot Wheels Metal Metal',
    ],
    filterFn: (p) => {
      const full = `${p.marca || ''} ${p.categoria || ''} ${p.serie || ''} ${p.modelo || ''}`.toLowerCase();
      return (
        full.includes('premium') ||
        full.includes('car culture') ||
        full.includes('boulevard') ||
        full.includes('team transport') ||
        full.includes('real riders')
      );
    },
  },
  'mini-gt': {
    slug: 'mini-gt',
    title: 'Mini GT',
    seoTitle: 'Mini GT en Argentina | Autos a Escala 1:64 de Alta Precisión',
    description:
      'Catálogo de Mini GT y Kaido House escala 1:64 en Argentina. Piezas de altísima fidelidad, chasis metálico y cajas selladas originales.',
    keywords: [
      'Mini GT Argentina',
      'Mini GT 1:64',
      'Kaido House',
      'Autos a escala coleccion',
      'TSM Model Mini GT',
    ],
    filterFn: (p) => {
      const full = `${p.marca || ''} ${p.categoria || ''} ${p.serie || ''} ${p.modelo || ''}`.toLowerCase();
      return full.includes('mini gt') || full.includes('minigt') || full.includes('kaido');
    },
  },
  'super-treasure-hunt': {
    slug: 'super-treasure-hunt',
    title: 'Super Treasure Hunt (STH)',
    seoTitle: 'Super Treasure Hunt (STH) en Argentina | Hot Wheels $TH Ultra Raros',
    description:
      'Colección de Super Treasure Hunt ($TH) originales en Argentina. Pintura Spectraflame, llantas Real Riders con goma y logotipo "TH" oculto. Envíos protegidos.',
    keywords: [
      'Super Treasure Hunt Argentina',
      'STH Hot Wheels',
      '$TH',
      'Spectraflame',
      'Hot Wheels Raros',
      'Treasure Hunt Super',
    ],
    filterFn: (p) => {
      const full = `${p.marca || ''} ${p.categoria || ''} ${p.serie || ''} ${p.modelo || ''}`.toLowerCase();
      return (
        full.includes('super treasure hunt') ||
        full.includes('sth') ||
        full.includes('$th') ||
        (p.categoria && p.categoria.includes('Super Treasure Hunt'))
      );
    },
  },
  'jdm': {
    slug: 'jdm',
    title: 'JDM (Japanese Domestic Market)',
    seoTitle: 'Autos JDM a Escala en Argentina | Hot Wheels Nissan, Toyota, Honda, Mazda',
    description:
      'Encontrá los mejores autos JDM a escala 1:64 en Argentina: Nissan Skyline GT-R, Silvia, Honda Civic, Toyota Supra, Mazda RX-7 y más íconos japoneses.',
    keywords: [
      'JDM Hot Wheels Argentina',
      'Nissan Skyline 1:64',
      'Toyota Supra Hot Wheels',
      'Honda Civic Diecast',
      'Japanese Domestic Market escala',
    ],
    filterFn: (p) => {
      const full = `${p.marca || ''} ${p.categoria || ''} ${p.serie || ''} ${p.modelo || ''}`.toLowerCase();
      return (
        full.includes('jdm') ||
        full.includes('nissan') ||
        full.includes('skyline') ||
        full.includes('gtr') ||
        full.includes('gt-r') ||
        full.includes('silvia') ||
        full.includes('supra') ||
        full.includes('toyota') ||
        full.includes('honda') ||
        full.includes('civic') ||
        full.includes('mazda') ||
        full.includes('rx-7') ||
        full.includes('subaru') ||
        full.includes('mitsubishi')
      );
    },
  },
  'muscle-cars': {
    slug: 'muscle-cars',
    title: 'Muscle Cars Americanos',
    seoTitle: 'Muscle Cars a Escala en Argentina | Hot Wheels Mustang, Camaro, Dodge',
    description:
      'Potencia americana a escala 1:64: Ford Mustang, Chevrolet Camaro, Dodge Charger, Challenger y clásicos V8 en blíster cerrado con envíos a todo el país.',
    keywords: [
      'Muscle Cars Hot Wheels',
      'Mustang escala 1:64',
      'Camaro diecast',
      'Dodge Charger Hot Wheels',
      'Autos americanos coleccion',
    ],
    filterFn: (p) => {
      const full = `${p.marca || ''} ${p.categoria || ''} ${p.serie || ''} ${p.modelo || ''}`.toLowerCase();
      return (
        full.includes('muscle') ||
        full.includes('mustang') ||
        full.includes('camaro') ||
        full.includes('corvette') ||
        full.includes('dodge') ||
        full.includes('charger') ||
        full.includes('challenger') ||
        full.includes('chevy') ||
        full.includes('ford') ||
        full.includes('pontiac')
      );
    },
  },
};
