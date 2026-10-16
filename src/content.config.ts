import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const proyectos = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/proyectos' }),
  schema: z.object({
    titulo: z.string(),
    fecha: z.coerce.date(),
    resumen: z.string(),
    imagen: z.string().optional(),
    destacado: z.boolean().default(false),
    estado: z.enum(['activo', 'finalizado', 'planificado']).default('activo'),
  }),
});

const eventos = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/eventos' }),
  schema: z.object({
    titulo: z.string(),
    fecha: z.coerce.date(),
    lugar: z.string().optional(),
    resumen: z.string(),
    imagen: z.string().optional(),
    enlace: z.string().url().optional(),
    enlaceTexto: z.string().optional(),
  }),
});

export const collections = { proyectos, eventos };
