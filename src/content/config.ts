import { defineCollection } from 'astro:content';

export const events = defineCollection({
  schema: ({ image }) => ({
    name: { type: 'string', required: true },
    date: { type: 'date', required: true },
    description: { type: 'string', required: true },
    media: { type: 'array', of: { type: 'image' }, required: false },
  }),
});