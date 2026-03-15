/**
 * Mock data — active while VITE_MOCK_MODE=true
 * Replace with Supabase queries when credentials are available
 */

export const MOCK_SELLERS = [
  {
    id: '1',
    name: 'Sofia Martínez',
    username: 'sofiamx',
    category: 'UX/UI',
    tagline: 'Diseño que convierte visitantes en clientes',
    avatar: null,
    rating: 4.9,
    reviews: 127,
    is_verified: true,
    accent: 'blue',
    services: [
      { id: 's1', title: 'Diseño de App Móvil', price: 'Desde $800 USD', delivery: '7 días' },
      { id: 's2', title: 'Auditoría UX Completa', price: 'Desde $300 USD', delivery: '3 días' },
      { id: 's3', title: 'Sistema de Diseño', price: 'Desde $1,200 USD', delivery: '14 días' },
    ],
  },
  {
    id: '2',
    name: 'Carlos Reyes',
    username: 'carlosrey',
    category: 'Marketing',
    tagline: 'Estrategias digitales con resultados medibles',
    avatar: null,
    rating: 4.8,
    reviews: 89,
    is_verified: true,
    accent: 'green',
    services: [
      { id: 's4', title: 'Estrategia de Contenido', price: 'Desde $400 USD', delivery: '5 días' },
      { id: 's5', title: 'Gestión de Redes Sociales', price: 'Desde $600 USD/mes', delivery: 'Mensual' },
    ],
  },
  {
    id: '3',
    name: 'Ana Beltrán',
    username: 'anabeltran',
    category: 'Audiovisual',
    tagline: 'Video branding que hace que te recuerden',
    avatar: null,
    rating: 5.0,
    reviews: 43,
    is_verified: true,
    accent: 'red',
    services: [
      { id: 's6', title: 'Video Corporativo', price: 'Desde $1,500 USD', delivery: '10 días' },
      { id: 's7', title: 'Reels para Redes', price: 'Desde $250 USD', delivery: '3 días' },
    ],
  },
  {
    id: '4',
    name: 'Miguel Torres',
    username: 'migueltd',
    category: 'UX/UI',
    tagline: 'Interfaces premium para productos SaaS',
    avatar: null,
    rating: 4.7,
    reviews: 211,
    is_verified: false,
    accent: 'yellow',
    services: [
      { id: 's8', title: 'Landing Page', price: 'Desde $500 USD', delivery: '5 días' },
      { id: 's9', title: 'Prototipo Interactivo', price: 'Desde $350 USD', delivery: '4 días' },
    ],
  },
  {
    id: '5',
    name: 'Lucía Vargas',
    username: 'luciav',
    category: 'Marketing',
    tagline: 'SEO y performance para marcas que quieren crecer',
    avatar: null,
    rating: 4.6,
    reviews: 158,
    is_verified: true,
    accent: 'black',
    services: [
      { id: 's10', title: 'Auditoría SEO', price: 'Desde $200 USD', delivery: '2 días' },
      { id: 's11', title: 'Posicionamiento Web', price: 'Desde $800 USD/mes', delivery: 'Mensual' },
    ],
  },
]

export const MOCK_USER = {
  id: 'user-1',
  name: 'Javier D.',
  email: 'javier@elitemarket.co',
  user_role: 'buyer',
  is_verified: false,
  avatar: null,
}

export const CATEGORIES = ['Todos', 'UX/UI', 'Marketing', 'Audiovisual']

export const ACCENT_COLORS = {
  black:  { bg: '#000000', text: '#ffffff' },
  red:    { bg: '#ef4444', text: '#ffffff' },
  yellow: { bg: '#f59e0b', text: '#000000' },
  blue:   { bg: '#3b82f6', text: '#ffffff' },
  green:  { bg: '#10b981', text: '#ffffff' },
  white:  { bg: '#ffffff', text: '#000000' },
}
