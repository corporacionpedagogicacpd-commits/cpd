# Auditoría de contenido: sitio ANTIGUO vs sitio NUEVO (scaffold Astro)

**Fecha:** 2026-09-28 · **Modo:** solo lectura (no se modificó ningún archivo de contenido)
**Fuente antigua:** `/home/pixell-bot/Proyectos/cpd-sitio-antiguo-referencia/sitio-antiguo/` (WordPress+Divi, 7 HTML)
**Fuente nueva:** `/home/pixell-bot/Proyectos/corpedagogicadiversidad/src/` (9 páginas + collections)

> **HALLAZGO ESTRUCTURAL (bloqueante):** el sitio NUEVO está **sin terminar**. Los 4 archivos de content collections y las 2 subpáginas están **vacíos (0 bytes)**:
> `src/content/{proyectos,eventos}/*.md` (4 archivos, 0 B cada uno) y `src/pages/{proyectos,eventos}/index.astro` (0 B).
> **No existe directorio `public/` ni ningún asset** → las **21 referencias `src="/…"`** de las páginas nuevas (`/logo.png`, `/hero-bg.jpg`, `/galeria/imagen1-8.png`, `/educacion/imagen1-3.png`, `/eventos/evento1-2.jpg`, `/proyectos/proyecto1-3.jpg`, `/logo-white.png`) están **ROTAS**.
> Verificado: `find . -maxdepth 2 -type f \( -name '*.png' … \)` no devuelve nada fuera de `node_modules`.

---

## 1. Tabla: página nueva → contenido que tiene → qué falta del sitio antiguo

| Página nueva (`src/pages/…`) | Contenido que tiene | Falta respecto al antiguo |
|---|---|---|
| `index.astro` | Hero, 3 stats (12 años / 28 proyectos / 1.750 jóvenes) + "Nuestros ejes de acción" | Hero usa imágenes de **Unsplash remoto** (`components/sections/Hero.astro`), no las **SLIDER-1…5.jpg** reales. Stats **inventados**: el antiguo dice **"+10 años de compromiso"** y **"200 colaboradores"** (`index.html`, `data-number-value="+10"` / `"200"`). Faltan bloques: **"¡Estamos comprometidos con Antioquia!"**, **"Establecemos alianzas para crecer juntos"**, **4 pilares** (prevención/reeducación/salud mental/equidad), **sección eventos recientes**, **"Transformando Vidas a Través de la Educación"**, bloque redes sociales, y los botones "Conócenos/Impulsamos". |
| `nosotros.astro` | Historia 2012, hito Itagüí 2017, Misión | Falta **Visión** ("En 10 años seremos…"), **4 pilares** (inclusión/educación/prevención/bienestar con sus descripciones), **objeto/objetivos sociales largos** (2 párrafos en `nosotros/nosotros.html`), párrafo de equipo y párrafo de salud mental/adolescencia/OMS (texto extenso art. 3.º). Falta la 3.ª entidad: nada sobre **IPS 360** ni **turismo** (ítems de menú del antiguo apuntando a `/nosotros/`). |
| `educacion.astro` | 3 programas genéricos con imágenes inexistentes | En el antiguo **`educacion-2/educacion-2.html` está prácticamente vacío** (solo header/footer). → Los 3 programas del nuevo **NO provienen del sitio antiguo** (posible invención). Ausente en ambas fuentes: contenido real de programas. |
| `proyectos.astro` | 3 tarjetas (Proyectos educativos / Talleres de prevención / Campaña salud mental) | El antiguo tiene página `proyectos/` en menú (ver Anexo A: no volcada) **y** sección de eventos con entradas "Evento prueba 2/3/4" (`index.html`). El enlace "Ver más proyectos" del nuevo apunta a `/proyectos` → **`src/pages/proyectos/index.astro` vacío (0 B)**. Tarjetas nuevas no citan proyectos reales del antiguo. |
| `eventos.astro` | 2 tarjetas (Día de la salud mental / Taller de bienestar) | El antiguo lista **"Evento prueba 2, 3, 4"** (Dic 3, 2024, texto *Lorem ipsum*) y enlaces a `/evento-prueba-2/ -3/ -4/`. El botón "Ver más eventos" apunta a **`/eventos` cuyo `index.astro` está vacío (0 B)**. |
| `galeria.astro` | 8 tarjetas con títulos genéricos | El antiguo tiene **~40 imágenes reales** `FOTO10…FOTO55` en `galeria/galeria.html` (masonry). El nuevo reemplaza por `/galeria/imagen1-8.png` **inexistentes**. Se pierde el texto "Explora nuestra galería…" y las fotos reales. |
| `donaciones.astro` | 3 razones, botones Wompi + Payco | Faltan **7 de las 9 razones reales** del antiguo y su redacción completa (p.ej. "Transformar muchas vidas", "Crear un cambio duradero", "Participar activamente", "Aseguras calidad e Impacto"). Falta texto "Una donación puede cambiar vidas" y "¿Quieres hacer una donación?". **Epayco** (única pasarela enlazada con nombre en el antiguo) aparece como **"pago de Epayco"** sin botón propio; el nuevo solo pone `secure.payco.co/` genérico (link real distinto). Faltan FAQ/formulario. |
| `alianza.astro` | Alianza UdeA, 3 objetivos, 1 formulario Google | Faltan **CÓMO participar (2 formularios distintos)**, el relato del **convenio Facultad de Medicina UdeA**, la nota **"Lee la nota completa aquí"** (`https://shorturl.at/cz1yA`), y **TODO el evento "Senderos educativos neuro diversos"** (sábado 25 de octubre, 8am-12m, auditorio Facultad de Medicina UdeA) y el proyecto **"Senderos de Aprendizaje Neurodiversos"**. Falta 1 de los 2 forms. |
| `contacto.astro` | Formulario + bloque contacto | Email **incorrecto** (ver §3). Falta **segunda dirección** ("Calle 111e #64a-78", `contacto/contacto.html`), falta el encabezado "¡Aquí puedes contactarte con nosotros!", falta bloque redes sociales con **Facebook/X**. Nombre del form distinto (antiguo: Nombre+Apellido+Celular+Correo+Mensaje; nuevo: omite apellido y celular). |

**Anexo A — Páginas antiguas no volcadas en el dump:** menú antiguo enlaza `/proyectos/`, `/eventos/`, `/evento-prueba-2..4/`, `/page/2/` — **no existen como HTML** en el dump (solo la raíz de cada sección). Contenido de esas páginas: **AUSENTE en ambas fuentes**, no auditable.

---

## 2. Contenido FALTANTE priorizado

### CRÍTICO (datos de contacto/legales/funcionalidad rotos)
1. **Email real ausente:** antiguo `corporacionpedagogicacpd@gmail.com` (presente en el header de **las 7 páginas**) → el nuevo usa `info@corpedagogicadiversidad.org` (**no existe en el antiguo = inventado**).
2. **Dirección del mapa es falsa:** nuevo `contacto.astro` → `https://maps.app.goo.gl/AB34567890123456` (**placeholder inventado**). Antiguo real: `https://maps.app.goo.gl/g1wMJKatmPNEcLFP6` y `https://www.google.com/maps/place/Calle+47+%2343-37,+Medellín`.
3. **Segunda dirección perdida:** "Calle 111e #64a-78" (`contacto/contacto.html`).
4. **21 imágenes rotas** (no existe `public/`): logos, hero, galería, eventos, proyectos, educación.
5. **Páginas vacías 0 B:** `src/pages/{proyectos,eventos}/index.astro` y los 4 `.md` de `src/content/`.
6. **Formularios Google reales perdidos:** `forms.gle/aMPHhEf2TPYBCvDt5` (beneficiario) y `forms.gle/YJEbhdLZw1Jx2Pne9` (aliado/aportante); el nuevo solo conserva **un** form distinto.
7. **WhatsApp/teléfono:** coincide (`+57 300 3079290`, `wa.me/573003079290`) — OK, pero el antiguo además usa `api.whatsapp.com/send?phone=+57...`.

### IMPORTANTE (textos institucionales/secciones)
8. **Visión, 4 pilares, objeto social y objetivos largos** (nosotros): 4+ párrafos del antiguo ausentes.
9. **Menú "Proyectos" y "Eventos"** existían como páginas propias en el antiguo; en el nuevo la nav (`Header.astro`) **no** los incluye (solo vía botones internos), y las subpáginas están vacías.
10. **Ítems de menú "IPS 360" y "turismo"** (enlazados a `/nosotros/` en `index.html`) sin equivalente en el nuevo.
11. **Evento "Senderos educativos neuro diversos"** + proyecto "Senderos de Aprendizaje Neurodiversos" + nota del convenio UdeA (`shorturl.at/cz1yA`).
12. **Razones de donación completas** (7 de 9 ausentes) y texto "Una donación puede cambiar vidas".
13. **Redes sociales:** Facebook y X (@CorpoDiversidad) citadas en footer antiguo (`dinaciones/donaciones.html`) — ausentes en nuevo.
14. **Bloque de evento reciente / boletín** en home ("Nuestros Eventos: Transformando Comunidades").
15. **Pasarela Epayco** como opción explícita (antiguo: "pago de Epayco", `secure.payco.co/checkoutopen/6a93c332-8934-4da4-b33c-f0291b346984`).

### OPCIONAL
16. Texto "¡Estamos comprometidos con Antioquia!" (banner recurrente).
17. Crédito de autoría: "@2025 Sitio elaborado y administrado por: [imagen `Logo_digitalF.jpeg`]" (`digitaljf.com`) — el nuevo pone "Desarrollado con ♥️ y Astro".
18. Año de copyright: antiguo **© 2025**; nuevo **© 2026**.
19. "Evento prueba 2/3/4" con Lorem ipsum (era contenido dummy del antiguo; a decidir si se porta o se descarta).

---

## 3. Datos de contacto/enlaces REALES del antiguo que el nuevo NO tiene

| Dato | Valor real (antiguo) | En el nuevo |
|---|---|---|
| Email | `corporacionpedagogicacpd@gmail.com` | ❌ reemplazado por `info@corpedagogicadiversidad.org` (inventado) |
| Teléfono | `+57 300 3079290` / `+57 3003079290` | ✅ `+57 300 3079290` |
| WhatsApp | `https://wa.me/573003079290`, `api.whatsapp.com/send?phone=+573003079290` | ⚠️ solo `wa.me/…` |
| Dirección 1 | `Calle 47 #43-37, Medellín` | ✅ texto igual, pero **link de mapa falso** |
| Dirección 2 | `Calle 111e #64a-78` | ❌ ausente |
| Mapa real | `maps.app.goo.gl/g1wMJKatmPNEcLFP6` y `google.com/maps/place/Calle+47+%2343-37` | ❌ nuevo usa `…AB34567890123456` (falso) |
| Instagram | `instagram.com/corpodiversidad?igsh=NHV0MnNxOHVsN280` | ⚠️ nuevo `instagram.com/corpodiversidad` (sin `igsh`) |
| Facebook | `@CorpoDiversidad` (etiqueta en footer) | ⚠️ etiqueta sin URL real extraída; ausente en nuevo |
| X/Twitter | `@CorpoDiversidad` (etiqueta en footer) | ❌ ausente |
| Form beneficiario | `https://forms.gle/aMPHhEf2TPYBCvDt5` | ❌ ausente |
| Form aliado | `https://forms.gle/YJEbhdLZw1Jx2Pne9` | ❌ ausente |
| Nota convenio UdeA | `https://shorturl.at/cz1yA` | ❌ ausente |
| Pasarela Epayco | `https://secure.payco.co/checkoutopen/6a93c332-8934-4da4-b33c-f0291b346984` | ⚠️ nuevo `https://secure.payco.co/` (raíz) |
| Wompi | `https://checkout.wompi.co/l/VPOS_ddGDbY` | ✅ igual |
| Google Form nuevo | — | ⚠️ nuevo usa `docs.google.com/forms/…/1FAIpQLSd368Qd4562qR171qY9Z4q2q782Q084tWd5Z1074J2dR7166Q` (**no existe en el antiguo**; verificar si es inventado) |
| Form aliado nuevo | — | `https://github.com/N3KOSAURIO/corpedagogicadiversidad`, `https://cpd.mork.click`, `https://veeduria-ciudadana.vercel.app` (**no en el antiguo**) |

---

## 4. Explícitamente AUSENTE en AMBAS fuentes (no se puede portar)

- **Contenido real de `proyectos/` y `eventos/`** (páginas antiguas no volcadas; nuevo: 0 B). Solo existen "Evento prueba 2/3/4" con Lorem ipsum.
- **Fotos/alt reales de la galería:** hay 40 URLs `FOTO…jpg` pero **no hay archivos locales** en el dump (`wp-content/uploads/` solo trae 13 recortes) ni en el nuevo.
- **Dirección exacta/ubicación de "IPS 360" y "turismo":** aparecen solo como ítems de menú sin contenido propio.
- **Datos bancarios / NIT / razón social legal / certificado de donación:** no aparecen en el antiguo; el nuevo enlaza a Epayco/Wompi sin desglose.
- **Redes Facebook/X URL canónica:** el antiguo muestra las etiquetas `@CorpoDiversidad` pero **no contiene la URL completa** (`facebook.com/…`, `x.com/…`) en el HTML; no hay dato verificable que copiar.

*(Fin — verificación por grep/find sobre ambos árboles; rutas citadas en cada punto.)*
