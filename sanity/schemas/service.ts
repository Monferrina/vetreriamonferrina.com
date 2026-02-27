import { defineType } from 'sanity';

export default defineType({
  name: 'service',
  title: 'Servizio',
  type: 'document',
  fields: [
    {
      name: 'name',
      title: 'Nome',
      type: 'string',
      validation: (r) => r.required(),
    },
    {
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'name' },
      validation: (r) => r.required(),
    },
    {
      name: 'category',
      title: 'Categoria',
      type: 'string',
      options: {
        list: [
          { title: 'Installazioni', value: 'installazioni' },
          { title: 'Vetri', value: 'vetri' },
          { title: 'Lavorazioni', value: 'lavorazioni' },
        ],
      },
      validation: (r) => r.required(),
    },
    {
      name: 'description',
      title: 'Descrizione',
      type: 'text',
    },
    {
      name: 'image',
      title: 'Immagine',
      type: 'image',
      options: { hotspot: true },
    },
    {
      name: 'order',
      title: 'Ordine',
      type: 'number',
    },
  ],
  preview: {
    select: { title: 'name', subtitle: 'category' },
  },
});
