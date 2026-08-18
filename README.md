# CEM Workspace

Sitio estático que replica el prototipo de diseño "CEM Workspace" (sistema de diseño *Luminous Spectrum* — Glassmorphism, ver `DESIGN.md`). Construido con HTML + Tailwind CSS (CDN) + Google Fonts (Poppins / Material Symbols), sin build step: se abre directamente en el navegador.

## Páginas

| Archivo | Pantalla | Descripción |
| --- | --- | --- |
| `index.html` | Dashboard / Overview | Métricas generales, pipeline de producción, actividad reciente y masterclass destacada. |
| `analytics.html` | Executive Overview / Analytics | Metas académicas, diplomas otorgados, cursos activos, velocidad de producción, reuniones y horas de clase. |
| `courses.html` | Panel de Cursos | Crear y estructurar cursos: módulos, submódulos, guiones, imágenes. |
| `course-production.html` | Course Production Tracker | Detalle de producción de un curso ("Marketing Strategy 2024"): timeline, tareas activas, assets y ficha del curso. |
| `course-lesson.html` | Lesson Editor | Vista de un módulo/lección dentro de un curso ("Advanced SEO Tactics"): progreso, navegación de módulos y editor de contenido. |
| `diplomas.html` | Panel de Diplomados | Crear y estructurar diplomados: módulos, submódulos, guiones, imágenes. |
| `masterclasses.html` | Panel de Masterclasses | Crear y estructurar masterclasses: módulos, submódulos, guiones, imágenes. |
| `ebooks.html` | Ebook Collection | Biblioteca de ebooks descargables con tarjeta destacada y grid de recursos. |
| `tasks.html` | Content Pipeline (Kanban) | Tablero Kanban arrastrable con las fases de producción de contenido educativo. |

El sidebar es idéntico y totalmente enlazado en las 9 páginas (Dashboard, Tasks, Courses, Diplomas, Masterclasses, Ebooks, Analytics).

## Panel de contenido (Cursos, Diplomados, Masterclasses)

`courses.html`, `diplomas.html` y `masterclasses.html` son paneles de gestión de
contenido: sirven para **crear y estructurar** los programas educativos, no para
mostrarlos al público. Cada página gestiona su propio tipo de programa de forma
independiente.

Navegación en tres niveles:

1. **Lista de programas** — tarjetas con imagen, título, descripción y contadores
   de módulos/submódulos. El botón `+` crea uno nuevo.
2. **Programa** — al entrar en una tarjeta: título, descripción e imagen
   referencial (16:9) editables, más la lista de sus módulos. `+ Nuevo módulo`.
3. **Módulo** — al entrar en un módulo: su título y descripción, más la lista de
   submódulos. `+ Nuevo submódulo`.

Cada **submódulo** tiene: título, duración, imagen 16:9, texto, guión y nota extra.
Todo se edita haciendo clic directamente sobre el campo. Las migas de pan
(*Cursos › Programa › Módulo*) permiten volver a cualquier nivel, y la `×` de cada
tarjeta elimina ese elemento.

**Guardado automático:** cada cambio se guarda solo en `localStorage`, con un aviso
`✓ Guardado` abajo a la izquierda. No hay botón de guardar manual.

**Importante:** el guardado es **local, por navegador**. No hay backend ni base de
datos, así que los cambios no se comparten entre dispositivos ni con otras
personas, y se pierden si borras los datos del navegador. Las imágenes se guardan
incrustadas como data URL, y `localStorage` ronda los 5–10 MB por sitio: si cargas
muchas imágenes pesadas puede llenarse (el aviso lo indicará). Para persistencia
real y compartida haría falta conectar una base de datos (ej. Firebase/Supabase).

## Edición en vivo del resto de páginas (✏️ Editar / 💾 Guardar)

Las demás páginas (`index.html`, `analytics.html`, `tasks.html`, `ebooks.html`,
`course-production.html`, `course-lesson.html`) usan un editor más simple
(`editable.js`) con una barra flotante:

- **✏️ Editar** — vuelve editable el contenido principal de la página.
- **➕ Agregar…** — dentro de listas marcadas, duplica el último elemento.
- **💾 Guardar** — guarda el HTML de la página en `localStorage`.
- **↺ Restablecer** — descarta lo guardado y vuelve al original.

Mismas limitaciones de alcance local que arriba.

## Uso

No requiere instalación ni build. Simplemente abre `index.html` en un navegador, o sirve la carpeta con cualquier servidor estático:

```bash
npx serve .
# o
python3 -m http.server 8080
```

## Créditos de diseño

Basado en los mockups y el sistema de diseño `DESIGN.md` (Luminous Spectrum) provistos para CEM.
