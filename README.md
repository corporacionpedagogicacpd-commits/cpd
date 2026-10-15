# Corporación Pedagógica Diversidad — Sitio web

Sitio web institucional de la Corporación Pedagógica Diversidad: una entidad sin ánimo de lucro
que trabaja por la educación, la inclusión y el acompañamiento de población neurodiversa en Colombia.

## Requisitos

- Node.js 20 o superior (recomendado 22 LTS).
- npm 10 o superior.

## Ejecutar en local

```bash
npm install
npm run dev
```

El sitio queda disponible en `http://localhost:4321`.

## Construir y previsualizar

```bash
npm run build     # genera el sitio estático en dist/
npm run preview   # sirve localmente la versión compilada
```

Para revisar tipos y errores en los componentes `.astro`:

```bash
npm run check
```

## Estructura del proyecto

```
public/            Archivos estáticos servidos tal cual (favicon, imágenes de galería, etc.)
src/
  pages/           Páginas del sitio (una por ruta)
  components/      Componentes reutilizables (Header, Footer, PageHero)
  layouts/         Plantilla base del sitio (BaseLayout.astro)
  content/         Contenido editable en Markdown (proyectos y eventos)
  assets/          Imágenes y logotipos importados por los componentes
  styles/          Estilos globales (Tailwind)
```

### Páginas

| Ruta | Archivo |
| --- | --- |
| `/` | `src/pages/index.astro` |
| `/nosotros` | `src/pages/nosotros.astro` |
| `/educacion` | `src/pages/educacion.astro` |
| `/alianza` | `src/pages/alianza.astro` |
| `/eventos` | `src/pages/eventos/index.astro` |
| `/proyectos` | `src/pages/proyectos/index.astro` |
| `/galeria` | `src/pages/galeria.astro` |
| `/donaciones` | `src/pages/donaciones.astro` |
| `/contacto` | `src/pages/contacto.astro` |

## Cómo agregar contenido nuevo

Los proyectos y los eventos se administran como archivos Markdown, sin necesidad de tocar el código.

- **Proyecto nuevo:** crear `src/content/proyectos/mi-proyecto.md`
- **Evento nuevo:** crear `src/content/eventos/mi-evento.md`

El nombre del archivo se recomienda con el formato `AAAA-MM-DD-titulo-corto.md`. Ejemplo de proyecto:

```markdown
---
titulo: "Nombre del proyecto"
fecha: 2026-01-15
resumen: "Descripción breve que aparece en el listado."
destacado: true
estado: "activo"
---

Contenido del proyecto en Markdown.
```

Ejemplo de evento:

```markdown
---
titulo: "Nombre del evento"
fecha: 2026-02-20
lugar: "Medellín"
resumen: "Descripción breve que aparece en el listado."
---

Contenido del evento en Markdown.
```

La página `/proyectos` y `/eventos` leen estos archivos automáticamente, así que el contenido
aparece en el sitio al guardar el archivo y reconstruir. Las imágenes se suben a `src/assets/`
(o a `public/` cuando no requieren procesamiento) y se referencian desde el campo `imagen`.

### Galería

Las fotografías de la página `/galeria` se toman automáticamente de la carpeta `public/galeria/`.
Para agregar una foto, basta con copiarla ahí con el nombre `FOTO<n>.jpg` (por ejemplo `FOTO56.jpg`)
y reconstruir el sitio: aparece sola, ordenada de mayor a menor número. La página las optimiza
en el build (redimensiona y convierte a WebP), así que no hay que preparar los archivos a mano.

## Despliegue

El sitio se publica en **Vercel** con dominio **corpedagogicadiversidad.org**.

La rama principal se despliega automáticamente a producción en cada `push`. Para forzar un
despliegue desde la interfaz web de Vercel, se ejecuta el *Redeploy* del último deployment.
La configuración es la estándar de Astro: comando `npm run build`, carpeta de salida `dist`.

## Créditos

Diseño y desarrollo: Pixell

© Corporación Pedagógica Diversidad. Todos los derechos reservados.
