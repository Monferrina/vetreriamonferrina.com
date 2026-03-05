import { defineType } from 'sanity';

export default defineType({
  name: 'aboutPage',
  title: 'Chi Siamo',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Titolo',
      type: 'string',
    },
    {
      name: 'intro',
      title: 'Introduzione',
      type: 'text',
    },
    {
      name: 'story',
      title: 'La Nostra Storia',
      type: 'array',
      of: [{ type: 'block' }],
    },
    {
      name: 'values',
      title: 'I Nostri Valori',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            { name: 'title', title: 'Titolo', type: 'string' },
            { name: 'description', title: 'Descrizione', type: 'text' },
          ],
        },
      ],
    },
    {
      name: 'teamPhotos',
      title: 'Foto Team',
      type: 'array',
      of: [{ type: 'image', options: { hotspot: true } }],
    },
    {
      name: 'workerPhotos',
      title: 'Foto Squadra',
      type: 'array',
      of: [{ type: 'image', options: { hotspot: true } }],
    },
  ],
});
