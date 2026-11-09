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

    // --- Catálogo de proyectos 2026 ---
    // `orden` es el orden editorial del catálogo (01…08); `fecha` queda como
    // fecha de registro. La portada de cada proyecto es arte generado
    // (ProjectArt) porque los documentos oficiales no traen fotografía.
    orden: z.number().default(99),
    periodo: z.string().optional(),
    territorio: z.string().optional(),
    linea: z.string().optional(),
    aliados: z.array(z.string()).default([]),
    cifras: z.array(z.object({ valor: z.string(), etiqueta: z.string() })).default([]),
    icono: z
      .enum(['educacion', 'derechos', 'impresion', 'textiles', 'agro', 'parque', 'papel', 'finanzas'])
      .default('educacion'),
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
