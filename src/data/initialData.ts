import { Product, EventPost, HeaderBanner, SidebarBanner } from '../types';

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    name: 'Fone Bluetooth Noise Cancelling Pro',
    category: 'Eletrônicos',
    price: 649.90,
    oldPrice: 899.00,
    description: 'Áudio imersivo com cancelamento ativo de ruído, bateria de 40 horas e acabamento premium em couro vegetal.',
    imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
    status: 'promotion',
    tags: ['Áudio', 'Bluetooth', 'Sem Fio'],
    featured: true
  },
  {
    id: 'prod-2',
    name: 'Smartwatch Ultra Sport Titanium',
    category: 'Vestíveis',
    price: 1199.00,
    oldPrice: 1450.00,
    description: 'Monitoramento de saúde em tempo real, GPS integrado, resistência à água até 50m e tela AMOLED de alta luminosidade.',
    imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80',
    status: 'featured',
    tags: ['Relógio', 'Fitness', 'GPS'],
    featured: true
  },
  {
    id: 'prod-3',
    name: 'Câmera Mirrorless 4K Creator Kit',
    category: 'Fotografia',
    price: 3499.00,
    description: 'Sensor Full-Frame com gravação 4K 60fps, foco automático ultrarrápido com detecção de olhos e lente 24-70mm inclusa.',
    imageUrl: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80',
    status: 'new',
    tags: ['Câmera', 'Vídeo', 'Foto'],
    featured: true
  },
  {
    id: 'prod-4',
    name: 'Mochila Minimalista Impermeável Urban',
    category: 'Acessórios',
    price: 289.00,
    description: 'Design ergonômico, compartimento acolchoado para notebook de até 16", tecido repelente a água e entradas USB externas.',
    imageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80',
    status: 'available',
    tags: ['Mochila', 'Viagem', 'Trabalho'],
    featured: false
  },
  {
    id: 'prod-5',
    name: 'Luminária de Mesa Inteligente LED RGB',
    category: 'Casa & Setup',
    price: 189.90,
    oldPrice: 229.00,
    description: 'Controle de temperatura de cor, integração com assistentes de voz e base com carregador por indução wireless.',
    imageUrl: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=800&q=80',
    status: 'promotion',
    tags: ['Setup', 'Iluminação', 'Smart'],
    featured: false
  },
  {
    id: 'prod-6',
    name: 'Teclado Mecânico Compacto Sem Fio',
    category: 'Eletrônicos',
    price: 450.00,
    description: 'Switches táteis silenciosos, iluminação retroiluminada branca suave e conexão tri-mode (Bluetooth, 2.4Ghz e cabo USB-C).',
    imageUrl: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80',
    status: 'available',
    tags: ['Setup', 'Teclado', 'Produtividade'],
    featured: false
  }
];

export const INITIAL_EVENTS: EventPost[] = [
  {
    id: 'event-1',
    title: 'Festival Criativo & Lançamento da Coleção 2026',
    date: '24 de Março, 2026',
    location: 'Pavilhão das Artes - São Paulo, SP',
    category: 'Lançamento',
    description: 'Celebração de abertura da nova temporada com desfile exclusivo, demonstração de produtos e apresentação musical ao vivo com centenas de participantes.',
    coverImage: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=80',
    images: [
      'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=1000&q=80'
    ]
  },
  {
    id: 'event-2',
    title: 'Workshop de Tecnologia & Inovação Digital',
    date: '10 de Fevereiro, 2026',
    location: 'Hub de Inovação - Rio de Janeiro, RJ',
    category: 'Workshop',
    description: 'Um dia intenso de palestras, troca de experiências e painéis práticos sobre o futuro do design, desenvolvimento e tecnologias imersivas.',
    coverImage: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&w=1200&q=80',
    images: [
      'https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1528605248644-14dd04022da1?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1000&q=80'
    ]
  },
  {
    id: 'event-3',
    title: 'Encontro Anual da Comunidade & Premiação',
    date: '18 de Janeiro, 2026',
    location: 'Centro de Convenções - Curitiba, PR',
    category: 'Comunidade',
    description: 'Confraternização especial homenageando os parceiros mais inovadores do ano, com estandes interativos e coquetel de encerramento.',
    coverImage: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=1200&q=80',
    images: [
      'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1531058020387-3be344556be6?auto=format&fit=crop&w=1000&q=80'
    ]
  }
];

export const INITIAL_HEADER_BANNERS: HeaderBanner[] = [
  {
    id: 'banner-head-1',
    title: 'Nova Temporada 2026',
    subtitle: 'Confira nossos lançamentos exclusivos com design premium e entrega rápida para todo o Brasil.',
    buttonText: 'Ver Catálogo Completo',
    buttonLink: 'catalogo',
    imageUrl: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1600&q=85',
    active: true
  },
  {
    id: 'banner-head-2',
    title: 'Galeria dos Melhores Momentos',
    subtitle: 'Veja todas as fotos dos nossos eventos, encontros da comunidade e premiações.',
    buttonText: 'Explorar Eventos',
    buttonLink: 'eventos',
    imageUrl: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?auto=format&fit=crop&w=1600&q=85',
    active: true
  },
  {
    id: 'banner-head-3',
    title: 'Promoções Especiais da Semana',
    subtitle: 'Até 35% de desconto em itens selecionados de tecnologia, áudio e acessórios.',
    buttonText: 'Aproveitar Ofertas',
    buttonLink: 'catalogo',
    imageUrl: 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?auto=format&fit=crop&w=1600&q=85',
    active: true
  }
];

export const INITIAL_SIDEBAR_BANNERS: SidebarBanner[] = [
  {
    id: 'side-banner-1',
    title: 'Super Oferta de Fones',
    subtitle: 'Cancelamento de ruído com até 30% OFF nesta semana!',
    imageUrl: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=600&q=80',
    linkUrl: '#',
    badge: 'Destaque',
    active: true
  },
  {
    id: 'side-banner-2',
    title: 'Próximo Evento ao Vivo',
    subtitle: 'Garanta seu convite VIP para o encontro em São Paulo.',
    imageUrl: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=600&q=80',
    linkUrl: '#',
    badge: 'Evento VIP',
    active: true
  }
];
