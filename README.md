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
| `tasks.html` | Proyectos | Proyectos internos, cada uno con el tablero que elijas: Kanban, Checklist, Notas o Post-it. |

El sidebar es idéntico y totalmente enlazado en las 9 páginas (Dashboard, Tasks, Courses, Diplomas, Masterclasses, Ebooks, Analytics).

## Cotizador de Auditoría y Estrategia Digital (`cotizador-auditoria-politica.html`)

Herramienta independiente (marca **Impulso Digital**) para cotizar en línea el servicio
de auditoría y estrategia digital de comunicación política. No forma parte del sidebar
de CEM Workspace; es una página autocontenida pensada para compartir el link con un
prospecto.

- **Checklist por categoría**: las 22 macro-categorías del `Cotizador_Auditoria_Digital_Politica.xlsx`
  original (276 puntos de análisis en total), cada una desplegable, con un checkbox por
  punto. Los puntos con precio propio suman al elegirlos; los que vienen incluidos sin
  costo adicional se marcan como "Incluido".
- **Sumatoria en vivo**: cada categoría muestra su subtotal (igual que la columna
  `SUBTOTAL` del Excel) y el panel lateral acumula el total general, con campo de
  descuento (%) — igual que la hoja `RESUMEN` del Excel.
- **Buscador** de puntos/categorías y botones "Todo" / "Ninguno" / "Seleccionar toda la
  categoría".
- **Datos del cliente**: nombre y cargo/campaña, con número de cotización autogenerado.
- **Exportable**: botón para exportar la cotización a **PDF** (vista de impresión con
  membrete y desglose formal), descargar un **.txt** con el resumen, o **copiar** el
  texto de la cotización al portapapeles.
- Guarda la selección en `localStorage` del navegador para no perderla al recargar.

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
  botones *Guardar* y *Video*, los checks **Hecho en video** y **Publicado**, barra de
  formato (negrita, cursiva, subrayado, H1, H2, cita, lista, insertar imagen) y el área
  de escritura.

Los **tres indicadores** de la izquierda se calculan solos y se mueven en vivo al
escribir o marcar los checks:

| Indicador | Mide |
| --- | --- |
| Avance del guión | Documentos que ya tienen contenido escrito |
| Videos realizados | Documentos con el check *Hecho en video* |
| Publicación | Documentos con el check *Publicado* |

Los submódulos ya grabados o publicados muestran su icono en el árbol de módulos, y
una tarjeta destacada (★) enseña los tres indicadores en el registro.

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

## Proyectos y tareas (`tasks.html`)

Proyectos internos, cada uno con el tipo de tablero que elijas al crearlo:

- **Kanban** — columnas por fase y tarjetas que se arrastran entre ellas.
- **Checklist** — grupos de tareas con casilla y barra de progreso.
- **Notas en grid** — tarjetas de nota con título y cuerpo.
- **Post-it** — notas adhesivas de colores.

En la barra superior, en lugar de *Quick Capture*, hay **Guardar** y **Nuevo proyecto**
(el botón del lateral hace lo mismo). Al crear un proyecto se elige primero el tipo de
tablero; después se entra a él y todo —nombre, descripción, columnas, tarjetas, tareas,
notas— es editable en línea y se guarda solo. Mismas limitaciones locales que arriba.

La página es responsive igual que el resto del sitio: en móvil el lateral fijo se
oculta y aparece la barra de navegación inferior, para que el contenido ocupe toda
la pantalla.

## Edición en vivo del resto de páginas (✏️ Editar / 💾 Guardar)

Las demás páginas (`index.html`, `analytics.html`, `ebooks.html`,
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
