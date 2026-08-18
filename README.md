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

`courses.html`, `diplomas.html` y `masterclasses.html` son paneles para **crear y
escribir** el contenido de los programas educativos. Cada página gestiona su propio
tipo, con su propio almacén, y tiene dos pantallas:

### 1. Registro

Grid de tarjetas con el tipo, título, descripción, nº de módulos y estado
(*Live · En producción · Planificación*). El botón flotante **`+`** crea un programa
nuevo. En cada tarjeta: **★** la destaca (pasa a mostrar el % de documentos
escritos), el **estado** se cicla al pulsarlo, y **⋮** permite duplicar o eliminar.
Las píldoras superiores filtran por estado.

### 2. Programa (editor de documentos)

Al entrar en una tarjeta:

- **Migas de pan** `Cursos › Programa › Documento` para volver.
- **Título y descripción** del programa, editables en línea.
- **Panel izquierdo:** tarjeta de *Avance* (% de documentos con contenido, calculado
  automáticamente) y el árbol de **Módulos → Submódulos**, con `+ Nuevo módulo` y
  `+ Submódulo`, duración por submódulo y `×` para eliminar.
- **Panel derecho:** el **documento** del submódulo seleccionado — título, duración,
  botones *Guardar* y *Video*, barra de formato (negrita, cursiva, subrayado, H1, H2,
  cita, lista, insertar imagen) y el área de escritura.

Cada submódulo es un documento independiente: ahí escribes el guión y el contenido
de esa clase. Cambiar de submódulo conserva lo escrito en el anterior.

**Guardado automático** en cada cambio (aviso `✓ Guardado`), más un volcado inmediato
al cerrar u ocultar la pestaña para no perder lo último escrito.

**Importante:** el guardado es **local, por navegador**. No hay backend ni base de
datos, así que el contenido no se comparte entre dispositivos ni con otras personas,
y se pierde si borras los datos del navegador. Las imágenes insertadas se guardan
incrustadas y `localStorage` ronda los 5–10 MB por sitio: si lo llenas, el aviso te
lo dirá. Para persistencia real y compartida haría falta un backend (ej.
Firebase/Supabase).

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
