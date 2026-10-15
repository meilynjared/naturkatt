export type OptionValue = {
  label: string
  priceDelta?: number
  swatch?: string
}

export type ProductOption = {
  id: string
  name: string
  values: OptionValue[]
}

export type Product = {
  slug: string
  name: string
  category: 'kit' | 'producto'
  line: string
  price: number
  compareAt?: number
  image: string
  short: string
  description: string
  includes?: string[]
  benefits: string[]
  idealFor: string
  options: ProductOption[]
  rating: number
  reviewCount: number
  badge?: string
}

export const GIFT_WRAP_PRICE = 2990
export const FREE_SHIPPING_THRESHOLD = 30000

export const products: Product[] = [
  {
    slug: 'kit-regalo-perfume',
    name: 'Kit de Regalo de Perfume',
    category: 'kit',
    line: 'Floral Amazónico',
    price: 49990,
    compareAt: 59990,
    image: '/images/kit-perfume.png',
    short: 'Perfume floral 100 ml + crema corporal perfumada en estuche de regalo.',
    description:
      'El regalo que nunca falla. Un perfume floral con notas de orquídea y flores amazónicas, acompañado de su crema corporal perfumada para que el aroma dure todo el día. Llega listo para regalar.',
    includes: ['Perfume Floral Amazónico 100 ml', 'Crema corporal perfumada 200 ml', 'Estuche de regalo con cinta'],
    benefits: ['Fijación de 6 a 8 horas', 'Ingredientes de origen vegetal', 'Listo para regalar'],
    idealFor: 'Cumpleaños, aniversarios y Día de la Madre',
    options: [
      {
        id: 'aroma',
        name: 'Familia olfativa',
        values: [
          { label: 'Floral', swatch: '#E8B4C0' },
          { label: 'Frutal', swatch: '#F2A65A' },
          { label: 'Amaderado', swatch: '#8B6B4A' },
        ],
      },
      {
        id: 'tamano',
        name: 'Tamaño del perfume',
        values: [{ label: '100 ml' }, { label: '75 ml', priceDelta: -8000 }],
      },
    ],
    rating: 4.9,
    reviewCount: 128,
    badge: 'Más vendido',
  },
  {
    slug: 'kit-rutina-facial-botanica',
    name: 'Kit Rutina Facial Botánica',
    category: 'kit',
    line: 'Botánica Esencial',
    price: 39990,
    compareAt: 46990,
    image: '/images/kit-facial.png',
    short: 'Limpiador + sérum + hidratante: tu rutina completa en 3 pasos.',
    description:
      'Una rutina simple y efectiva en 3 pasos: limpia, trata e hidrata. Formulada con activos botánicos para que tu piel se vea más luminosa desde la primera semana.',
    includes: ['Gel limpiador facial 150 ml', 'Sérum facial 30 ml', 'Crema hidratante 50 g'],
    benefits: ['Rutina de solo 3 pasos', 'Dermatológicamente testeado', 'Resultados visibles en 4 semanas'],
    idealFor: 'Quienes quieren empezar a cuidar su piel sin complicarse',
    options: [
      {
        id: 'piel',
        name: 'Tipo de piel',
        values: [
          { label: 'Normal a seca', swatch: '#F3D9B1' },
          { label: 'Mixta a grasa', swatch: '#BFD8B8' },
          { label: 'Sensible', swatch: '#F0C9C9' },
        ],
      },
    ],
    rating: 4.8,
    reviewCount: 96,
    badge: 'Recomendado por Gloria',
  },
  {
    slug: 'kit-cuidado-corporal-castana',
    name: 'Kit Cuidado Corporal Castaña',
    category: 'kit',
    line: 'Castaña Nutritiva',
    price: 29990,
    compareAt: 35990,
    image: '/images/kit-corporal.png',
    short: 'Jabón, crema y aceite de castaña para nutrición intensa.',
    description:
      'Nutrición profunda para piel seca, ideal para el clima del norte. La castaña aporta ácidos grasos que hidratan por hasta 24 horas y dejan la piel suave y perfumada.',
    includes: ['Jabón en barra de castaña x2', 'Crema corporal 400 ml', 'Aceite corporal 200 ml'],
    benefits: ['Hidratación 24 horas', 'Ideal para piel seca por sol y viento', 'Aroma suave y cálido'],
    idealFor: 'Piel seca y uso diario en familia',
    options: [
      {
        id: 'formato',
        name: 'Formato de crema',
        values: [{ label: 'Pote 400 ml' }, { label: 'Repuesto ecológico', priceDelta: -3000 }],
      },
    ],
    rating: 4.9,
    reviewCount: 74,
  },
  {
    slug: 'kit-regalo-masculino',
    name: 'Kit Regalo Masculino',
    category: 'kit',
    line: 'Madera Urbana',
    price: 44990,
    compareAt: 52990,
    image: '/images/kit-masculino.png',
    short: 'Colonia amaderada + gel de ducha + desodorante en caja de regalo.',
    description:
      'Un set completo para él con una colonia amaderada intensa, gel de ducha refrescante y desodorante de larga duración. Presentado en caja verde lista para regalar.',
    includes: ['Colonia Madera Urbana 100 ml', 'Gel de ducha 250 ml', 'Desodorante roll-on 75 ml', 'Caja de regalo'],
    benefits: ['Aroma intenso y elegante', 'Protección 48 horas', 'Presentación premium'],
    idealFor: 'Día del Padre, cumpleaños y amigo secreto',
    options: [
      {
        id: 'intensidad',
        name: 'Intensidad de la colonia',
        values: [
          { label: 'Fresca', swatch: '#9CC5B0' },
          { label: 'Intensa', swatch: '#2F4A3A' },
        ],
      },
    ],
    rating: 4.8,
    reviewCount: 61,
  },
  {
    slug: 'kit-mama-y-bebe',
    name: 'Kit Mamá y Bebé',
    category: 'kit',
    line: 'Ternura',
    price: 27990,
    image: '/images/kit-mama-bebe.png',
    short: 'Shampoo, crema y colonia suave para el cuidado del bebé.',
    description:
      'Fórmulas suaves, hipoalergénicas y sin lágrimas para el cuidado diario del bebé. Un regalo perfecto para baby showers y nuevas mamás.',
    includes: ['Shampoo sin lágrimas 200 ml', 'Crema hidratante 200 ml', 'Colonia suave 100 ml'],
    benefits: ['Hipoalergénico', 'Sin lágrimas', 'Testeado pediátricamente'],
    idealFor: 'Baby shower y recién nacidos',
    options: [
      {
        id: 'aroma',
        name: 'Aroma',
        values: [{ label: 'Manzanilla' }, { label: 'Sin perfume' }],
      },
    ],
    rating: 5,
    reviewCount: 38,
  },
  {
    slug: 'kit-spa-en-casa-maracuya',
    name: 'Kit Spa en Casa Maracuyá',
    category: 'kit',
    line: 'Maracuyá Relax',
    price: 34990,
    compareAt: 39990,
    image: '/images/kit-spa.png',
    short: 'Exfoliante, aceite relajante y vela aromática para tu momento.',
    description:
      'Convierte tu baño en un spa. El maracuyá es conocido por su efecto relajante: exfolia, masajea y enciende la vela para desconectarte al final del día.',
    includes: ['Exfoliante corporal 200 g', 'Aceite de masaje 150 ml', 'Vela aromática 180 g'],
    benefits: ['Efecto relajante', 'Piel renovada y suave', 'Ideal para regalar o regalarte'],
    idealFor: 'Regalos para ella y autocuidado',
    options: [
      {
        id: 'vela',
        name: 'Aroma de la vela',
        values: [{ label: 'Maracuyá' }, { label: 'Lavanda' }],
      },
    ],
    rating: 4.7,
    reviewCount: 45,
    badge: 'Nuevo',
  },
  {
    slug: 'perfume-floral-amazonico',
    name: 'Perfume Floral Amazónico',
    category: 'producto',
    line: 'Floral Amazónico',
    price: 32990,
    image: '/images/perfume-floral.png',
    short: 'Eau de parfum floral con notas de orquídea. 100 ml.',
    description:
      'Un perfume femenino floral y luminoso, con salida de frutas rojas, corazón de orquídea y fondo de almizcle suave.',
    benefits: ['Fijación de 6 a 8 horas', 'Notas de orquídea y frutas rojas', 'Frasco reciclable'],
    idealFor: 'Uso diario y ocasiones especiales',
    options: [
      {
        id: 'tamano',
        name: 'Tamaño',
        values: [{ label: '100 ml' }, { label: '50 ml', priceDelta: -10000 }],
      },
    ],
    rating: 4.9,
    reviewCount: 210,
  },
  {
    slug: 'serum-vitamina-c',
    name: 'Sérum Iluminador Vitamina C',
    category: 'producto',
    line: 'Botánica Esencial',
    price: 21990,
    image: '/images/serum-vitamina-c.png',
    short: 'Sérum facial con vitamina C para una piel más luminosa. 30 ml.',
    description:
      'Sérum de rápida absorción con vitamina C estabilizada que unifica el tono y aporta luminosidad. Se aplica mañana y noche antes de la crema.',
    benefits: ['Unifica el tono', 'Textura ligera no grasa', 'Apto para todo tipo de piel'],
    idealFor: 'Piel opaca o con manchas',
    options: [],
    rating: 4.8,
    reviewCount: 87,
  },
  {
    slug: 'crema-corporal-castana',
    name: 'Crema Corporal Castaña',
    category: 'producto',
    line: 'Castaña Nutritiva',
    price: 13990,
    image: '/images/crema-castana.png',
    short: 'Crema de nutrición intensa con aceite de castaña. 400 ml.',
    description: 'Hidratación profunda por 24 horas con aceite de castaña. Textura cremosa que se absorbe rápido.',
    benefits: ['Hidratación 24 horas', 'Absorción rápida', 'Aroma cálido'],
    idealFor: 'Piel seca',
    options: [],
    rating: 4.9,
    reviewCount: 156,
  },
  {
    slug: 'aceite-trifasico',
    name: 'Aceite Trifásico Corporal',
    category: 'producto',
    line: 'Maracuyá Relax',
    price: 16990,
    image: '/images/aceite-trifasico.png',
    short: 'Aceite hidratante de tres fases para después de la ducha. 200 ml.',
    description: 'Tres fases que se mezclan al agitar: aceites vegetales, extractos hidratantes y fragancia. Piel sedosa sin sensación grasa.',
    benefits: ['Sin sensación grasa', 'Se aplica con la piel húmeda', 'Perfuma suavemente'],
    idealFor: 'Después de la ducha',
    options: [
      {
        id: 'aroma',
        name: 'Aroma',
        values: [{ label: 'Maracuyá' }, { label: 'Castaña' }, { label: 'Pitanga' }],
      },
    ],
    rating: 4.7,
    reviewCount: 69,
  },
  {
    slug: 'labial-hidratante',
    name: 'Labial Mate Hidratante',
    category: 'producto',
    line: 'Color',
    price: 9990,
    image: '/images/labial.png',
    short: 'Labial de acabado mate con manteca de cacao. Larga duración.',
    description: 'Color intenso de acabado mate que no reseca, gracias a la manteca de cacao y aceites vegetales.',
    benefits: ['No reseca', 'Duración de hasta 8 horas', 'Acabado mate aterciopelado'],
    idealFor: 'Maquillaje diario',
    options: [
      {
        id: 'tono',
        name: 'Tono',
        values: [
          { label: 'Nude', swatch: '#C99A84' },
          { label: 'Rosa', swatch: '#C25B6E' },
          { label: 'Terracota', swatch: '#A4472E' },
        ],
      },
    ],
    rating: 4.6,
    reviewCount: 112,
  },
  {
    slug: 'colonia-madera-urbana',
    name: 'Colonia Madera Urbana',
    category: 'producto',
    line: 'Madera Urbana',
    price: 28990,
    image: '/images/perfume-madera.png',
    short: 'Colonia masculina amaderada con notas de cedro. 100 ml.',
    description: 'Una colonia masculina con notas de cedro, vetiver y un toque cítrico. Elegante para el día y la noche.',
    benefits: ['Notas de cedro y vetiver', 'Fijación prolongada', 'Frasco de vidrio reciclable'],
    idealFor: 'Hombres que buscan un aroma elegante',
    options: [],
    rating: 4.8,
    reviewCount: 93,
  },
]

export const kits = products.filter((p) => p.category === 'kit')
export const singles = products.filter((p) => p.category === 'producto')

export function getProduct(slug: string) {
  return products.find((p) => p.slug === slug)
}

export type Review = {
  id: string
  name: string
  city: string
  rating: number
  date: string
  productSlug: string
  text: string
  photo?: string
}

export const reviews: Review[] = [
  {
    id: 'r1',
    name: 'Carolina M.',
    city: 'Iquique',
    rating: 5,
    date: 'Septiembre 2026',
    productSlug: 'kit-regalo-perfume',
    text: 'Se lo regalé a mi mamá y quedó feliz. Llegó al día siguiente, súper bien envuelto y con la tarjetita que pedí. Gloria me ayudó a elegir el aroma por WhatsApp.',
    photo: '/images/resena-1.png',
  },
  {
    id: 'r2',
    name: 'Valentina R.',
    city: 'Alto Hospicio',
    rating: 5,
    date: 'Agosto 2026',
    productSlug: 'kit-rutina-facial-botanica',
    text: 'Nunca había tenido una rutina facial y esta es facilísima. Flor, la asistente, me recomendó el kit para piel mixta y acertó. Mi piel se ve mucho más pareja.',
    photo: '/images/resena-2.png',
  },
  {
    id: 'r3',
    name: 'Patricia G.',
    city: 'Iquique',
    rating: 5,
    date: 'Septiembre 2026',
    productSlug: 'kit-cuidado-corporal-castana',
    text: 'Con el sol de acá mi piel sufre mucho. La crema de castaña es lo único que me dura todo el día. Ya voy en mi tercer pedido.',
    photo: '/images/resena-3.png',
  },
  {
    id: 'r4',
    name: 'Matías F.',
    city: 'Iquique',
    rating: 5,
    date: 'Junio 2026',
    productSlug: 'kit-regalo-masculino',
    text: 'Lo pedí para mí en realidad, jaja. La colonia intensa es muy buena y dura harto. Pagué por transferencia y me lo trajeron a la casa.',
    photo: '/images/resena-4.png',
  },
  {
    id: 'r5',
    name: 'Javiera T.',
    city: 'Antofagasta',
    rating: 5,
    date: 'Julio 2026',
    productSlug: 'kit-spa-en-casa-maracuya',
    text: 'Me llegó a Antofagasta en 3 días. La vela huele increíble y el exfoliante deja la piel como seda. Muy confiable comprarle a Gloria.',
  },
  {
    id: 'r6',
    name: 'Rosa A.',
    city: 'Iquique',
    rating: 5,
    date: 'Mayo 2026',
    productSlug: 'kit-mama-y-bebe',
    text: 'Lo regalé en un baby shower y fue el regalo más comentado. Productos suaves, sin olor fuerte. Gloria es muy atenta.',
  },
  {
    id: 'r7',
    name: 'Daniela P.',
    city: 'Pozo Almonte',
    rating: 4,
    date: 'Agosto 2026',
    productSlug: 'perfume-floral-amazonico',
    text: 'El perfume es precioso y dura bastante. Me demoró un día más por ser fuera de Iquique, pero me avisaron todo el tiempo por WhatsApp.',
  },
  {
    id: 'r8',
    name: 'Fernanda L.',
    city: 'Iquique',
    rating: 5,
    date: 'Septiembre 2026',
    productSlug: 'serum-vitamina-c',
    text: 'Tenía miedo de comprar online pero fue rapidísimo: elegí, apreté comprar y Gloria me confirmó al tiro. El sérum me encantó.',
  },
]
