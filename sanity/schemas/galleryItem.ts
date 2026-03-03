import { defineType } from 'sanity';

export default defineType({
  name: 'galleryItem',
  title: 'Foto Galleria',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Titolo',
      type: 'string',
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
      name: 'image',
      title: 'Immagine',
      type: 'image',
      options: { hotspot: true },
      validation: (r) => r.required(),
    },
    {
      name: 'order',
      title: 'Ordine',
      type: 'number',
    },
  ],
  preview: {
    select: { title: 'title', media: 'image' },
  },
});
