# CEM Workspace

Sitio estático que replica el prototipo de diseño "CEM Workspace" (sistema de diseño *Luminous Spectrum* — Glassmorphism, ver `DESIGN.md`). Construido con HTML + Tailwind CSS (CDN) + Google Fonts (Poppins / Material Symbols), sin build step: se abre directamente en el navegador.

## Páginas

| Archivo | Pantalla | Descripción |
| --- | --- | --- |
| `index.html` | Dashboard / Overview | Métricas generales, pipeline de producción, actividad reciente y masterclass destacada. |
| `analytics.html` | Executive Overview / Analytics | Metas académicas, diplomas otorgados, cursos activos, velocidad de producción, reuniones y horas de clase. |
| `courses.html` | Program Registry | Grid de todos los programas (cursos, diplomas, masterclasses) con estado y métricas. |
| `course-production.html` | Course Production Tracker | Detalle de producción de un curso ("Marketing Strategy 2024"): timeline, tareas activas, assets y ficha del curso. |
| `course-lesson.html` | Lesson Editor | Vista de un módulo/lección dentro de un curso ("Advanced SEO Tactics"): progreso, navegación de módulos y editor de contenido. |
| `diplomas.html` | Detalle de Diploma | Vista de un programa de diploma ("Digital Marketing Mastery") con módulos, instructor y recursos. |
| `masterclasses.html` | Detalle de Masterclass | Sesión en vivo ("The Future of AI in Design"): video, detalles de sesión, speakers y guión por segmentos. |
| `ebooks.html` | Ebook Collection | Biblioteca de ebooks descargables con tarjeta destacada y grid de recursos. |
| `tasks.html` | Content Pipeline (Kanban) | Tablero Kanban arrastrable con las fases de producción de contenido educativo. |

El sidebar es idéntico y totalmente enlazado en las 9 páginas (Dashboard, Tasks, Courses, Diplomas, Masterclasses, Ebooks, Analytics). Desde `courses.html`, las tarjetas de programa enlazan a `course-lesson.html`, `course-production.html`, `diplomas.html` y `masterclasses.html` según corresponda.

## Edición en vivo (✏️ Editar / 💾 Guardar)

Cada página incluye una barra flotante abajo a la izquierda con tres botones:

- **✏️ Editar** — activa el modo edición: todo el contenido principal de la página se vuelve editable haciendo clic y escribiendo directamente (como un documento).
- **➕ Agregar…** — aparece dentro de las listas/grillas del sitio (producciones, actividad reciente, cursos activos, programas, tareas, módulos, tarjetas Kanban, columnas, segmentos, ebooks…) al activar el modo edición. Duplica el último elemento de esa lista para que lo edites.
- **💾 Guardar** — guarda el contenido actual de la página en el `localStorage` del navegador. Al volver a abrir esa página en el mismo navegador, tus cambios se restauran automáticamente.
- **↺ Restablecer** — borra lo guardado y vuelve a la versión original del archivo.

**Importante:** el guardado es **solo local, por navegador y por página** — no hay backend ni base de datos. Si abres el sitio en otro dispositivo, otro navegador, o borras el caché/localStorage, no verás esos cambios. Para persistencia real compartida entre dispositivos/usuarios haría falta conectar una base de datos (ej. Firebase/Supabase) — no está implementado.

## Uso

No requiere instalación ni build. Simplemente abre `index.html` en un navegador, o sirve la carpeta con cualquier servidor estático:

```bash
npx serve .
# o
python3 -m http.server 8080
```

## Créditos de diseño

Basado en los mockups y el sistema de diseño `DESIGN.md` (Luminous Spectrum) provistos para CEM.
