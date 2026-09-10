import { ScreenItem } from '../types';

export const INITIAL_SCREENS: ScreenItem[] = [
  {
    id: 'tela-1',
    title: 'Tela de Boas-vindas / Onboarding',
    category: 'Onboarding',
    description: 'Tela inicial com ilustração de boas-vindas, chamada para ação e apresentação do app.',
    imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
    aspectRatio: 'mobile',
    tags: ['Início', 'Mobile', 'Auth']
  },
  {
    id: 'tela-2',
    title: 'Painel Principal / Dashboard',
    category: 'Dashboard',
    description: 'Visão geral de métricas, cards de acesso rápido e resumo de atividades do usuário.',
    imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80',
    aspectRatio: 'desktop',
    tags: ['Métricas', 'Desktop', 'Visão Geral']
  },
  {
    id: 'tela-3',
    title: 'Feed de Conteúdo & Exploração',
    category: 'Explorar',
    description: 'Lista dinâmica de produtos, posts ou itens com imagens de alta resolução e filtros.',
    imageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80',
    aspectRatio: 'desktop',
    tags: ['Feed', 'Produtos', 'Busca']
  },
  {
    id: 'tela-4',
    title: 'Perfil & Configurações',
    category: 'Conta',
    description: 'Informações do usuário, preferências da conta, status e botões de atalho.',
    imageUrl: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=800&q=80',
    aspectRatio: 'mobile',
    tags: ['Perfil', 'Mobile', 'Configurações']
  }
];
