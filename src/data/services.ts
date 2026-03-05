export interface Service {
  slug: string;
  name: string;
  description: string;
  category:
    | 'box-doccia'
    | 'parapetti'
    | 'installazioni'
    | 'vetri'
    | 'specchi'
    | 'personalizzazioni'
    | 'lavorazioni';
  image?: string;
}

export const services: Service[] = [
  // Box doccia
  {
    slug: 'box-doccia',
    name: 'Box doccia',
    description: 'Box doccia su misura in vetro temperato. Design moderno, sicurezza garantita.',
    category: 'box-doccia',
    image: '/images/services/box-doccia.webp',
  },
  // Parapetti
  {
    slug: 'parapetti',
    name: 'Parapetti',
    description: 'Parapetti in vetro per balconi, scale e terrazze. Trasparenza e sicurezza.',
    category: 'parapetti',
    image: '/images/gallery/vetri-parapetto-moderno.webp',
  },
  // Installazioni
  {
    slug: 'pensiline',
    name: 'Pensiline',
    description: 'Pensiline in vetro per ingressi e terrazze. Protezione con eleganza.',
    category: 'installazioni',
    image: '/images/gallery/installazioni-pensilina.webp',
  },
  {
    slug: 'vetrine',
    name: 'Posa di vetrine',
    description: 'Installazione vetrine per negozi e attività commerciali.',
    category: 'installazioni',
    image: '/images/gallery/vetri-facciata-commerciale.webp',
  },
  {
    slug: 'sostituzione-vetri',
    name: 'Sostituzione vetri finestre',
    description: 'Sostituzione vetri per finestre esistenti. Servizio su disponibilità.',
    category: 'installazioni',
    image: '/images/gallery/vetri-arco-bianco.webp',
  },
  // Vetri
  {
    slug: 'blindati',
    name: 'Vetri blindati',
    description: 'Vetri blindati antieffrazione per massima sicurezza.',
    category: 'vetri',
    image: '/images/services/blindati.webp',
  },
  {
    slug: 'madras',
    name: 'Vetri Madras',
    description: "Vetro decorativo Madras per privacy e design d'interni.",
    category: 'vetri',
    image: '/images/gallery/lavorazioni-arco-sabbiato.webp',
  },
  {
    slug: 'stratificati',
    name: 'Vetri stratificati',
    description: 'Vetri stratificati trasparenti, satinati e colorati. Sicurezza e versatilità.',
    category: 'vetri',
    image: '/images/services/stratificati.webp',
  },
  {
    slug: 'monolitici',
    name: 'Vetri monolitici',
    description: 'Vetri monolitici trasparenti e satinati per ogni esigenza.',
    category: 'vetri',
    image: '/images/services/monolitici.webp',
  },
  {
    slug: 'vetrocamera',
    name: 'Vetri camera',
    description: 'Vetrocamera doppi per isolamento termico e acustico.',
    category: 'vetri',
    image: '/images/gallery/vetri-grande-vetrata.webp',
  },
  {
    slug: 'vetrocamera-tripli',
    name: 'Vetri camera tripli',
    description: 'Triplo vetro per massimo isolamento termico e acustico.',
    category: 'vetri',
    image: '/images/services/vetrocamera-tripli.webp',
  },
  // Specchi
  {
    slug: 'specchi',
    name: 'Specchi',
    description: "Specchi su misura per bagni, armadi e complementi d'arredo.",
    category: 'specchi',
    image: '/images/services/specchi.webp',
  },
  // Personalizzazioni
  {
    slug: 'porte-interne',
    name: 'Porte interne',
    description: 'Porte interne in vetro, scorrevoli e a battente. Luce e design.',
    category: 'personalizzazioni',
    image: '/images/gallery/lavorazioni-porta-fiori.webp',
  },
  // Lavorazioni
  {
    slug: 'sagomature',
    name: 'Sagomature',
    description: 'Taglio e sagomatura vetro su misura per qualsiasi forma.',
    category: 'lavorazioni',
    image: '/images/gallery/lavorazioni-pannello-rose.webp',
  },
  {
    slug: 'fori',
    name: 'Fori',
    description: 'Foratura vetro per maniglie, cerniere e fissaggi.',
    category: 'lavorazioni',
    image: '/images/services/fori.webp',
  },
  {
    slug: 'molature',
    name: 'Molature',
    description: 'Molatura bordi vetro a filo lucido, filo opaco e bisello.',
    category: 'lavorazioni',
    image: '/images/services/molature.webp',
  },
];

export const categories = {
  'box-doccia': 'Box doccia',
  installazioni: 'Installazioni',
  lavorazioni: 'Lavorazioni',
  parapetti: 'Parapetti',
  personalizzazioni: 'Personalizzazioni',
  specchi: 'Specchi',
  vetri: 'Vetri',
} as const;

export type CategoryKey = keyof typeof categories;
