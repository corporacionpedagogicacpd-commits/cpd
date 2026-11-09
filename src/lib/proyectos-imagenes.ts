/**
 * Portadas de los proyectos.
 *
 * Ilustración editorial abstracta generada para cada línea de trabajo
 * (sin personas, sin texto) y llevada a la paleta de la marca con un
 * duotono noche → magenta. Vive acá y no en el frontmatter porque Astro
 * solo resuelve imports estáticos: un `src` en texto plano nunca pasa por
 * el pipeline de imágenes.
 *
 * Mientras el cliente no entregue fotografía real de cada proyecto, esta
 * es la portada. Cuando lleguen las fotos, se reemplaza el archivo con el
 * mismo nombre y no hay que tocar ni el contenido ni las páginas.
 */
import type { ImageMetadata } from 'astro';

import senderos from '../assets/asset-cpd/proyectos/senderos.jpg';
import jovenes from '../assets/asset-cpd/proyectos/jovenes.jpg';
import imprimiendo from '../assets/asset-cpd/proyectos/imprimiendo.jpg';
import tejiendo from '../assets/asset-cpd/proyectos/tejiendo.jpg';
import ecoTrueque from '../assets/asset-cpd/proyectos/eco-trueque.jpg';
import parque from '../assets/asset-cpd/proyectos/parque.jpg';
import papel from '../assets/asset-cpd/proyectos/papel.jpg';
import fondo from '../assets/asset-cpd/proyectos/fondo.jpg';

/** Clave = id de la entrada en la colección `proyectos`. */
export const portadas: Record<string, ImageMetadata> = {
  'senderos-de-aprendizaje-neurodiversos': senderos,
  'jovenes-constructores-de-ciudadania-y-derechos': jovenes,
  'imprimiendo-inclusion': imprimiendo,
  'tejiendo-inclusion': tejiendo,
  'eco-trueque-agroindustrial': ecoTrueque,
  'parque-industrial-galapa': parque,
  'tejiendo-cultura-papel-artesanal': papel,
  'fondo-neurodivergente-2027': fondo,
};
