import { defineType } from 'sanity';

export default defineType({
  name: 'siteSettings',
  title: 'Impostazioni Sito',
  type: 'document',
  fields: [
    {
      name: 'companyName',
      title: 'Ragione Sociale',
      type: 'string',
    },
    {
      name: 'vatNumber',
      title: 'P.IVA',
      type: 'string',
    },
    {
      name: 'address',
      title: 'Indirizzo',
      type: 'string',
    },
    {
      name: 'city',
      title: 'Citta',
      type: 'string',
    },
    {
      name: 'phone',
      title: 'Telefono',
      type: 'string',
    },
    {
      name: 'email',
      title: 'Email',
      type: 'string',
    },
    {
      name: 'openingHours',
      title: 'Orari di Apertura',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            { name: 'days', title: 'Giorni', type: 'string' },
            { name: 'hours', title: 'Orari', type: 'string' },
          ],
        },
      ],
    },
  ],
});
