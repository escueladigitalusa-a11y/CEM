# CEM Workspace

Sitio estático que replica el prototipo de diseño "CEM Workspace" (sistema de diseño *Luminous Spectrum* — Glassmorphism, ver `DESIGN.md`). Construido con HTML + Tailwind CSS (CDN) + Google Fonts (Poppins / Material Symbols), sin build step: se abre directamente en el navegador.

## Páginas

| Archivo | Pantalla | Descripción |
| --- | --- | --- |
| `index.html` | Dashboard / Overview | Métricas generales, pipeline de producción, actividad reciente y masterclass destacada. |
| `analytics.html` | Executive Overview / Analytics | Metas académicas, diplomas otorgados, cursos activos, velocidad de producción, reuniones y horas de clase. |
| `diplomas.html` | Detalle de Diploma | Vista de un programa de diploma ("Digital Marketing Mastery") con módulos, instructor y recursos. |
| `tasks.html` | Content Pipeline (Kanban) | Tablero Kanban arrastrable con las fases de producción de contenido educativo. |

El sidebar es consistente entre las 4 páginas (Dashboard, Tasks, Courses, Diplomas, Masterclasses, Ebooks, Analytics); los enlaces a Dashboard, Tasks, Diplomas y Analytics funcionan entre las páginas incluidas. Courses, Masterclasses y Ebooks quedan como placeholders (`#`) porque no había un mockup para esas pantallas.

## Uso

No requiere instalación ni build. Simplemente abre `index.html` en un navegador, o sirve la carpeta con cualquier servidor estático:

```bash
npx serve .
# o
python3 -m http.server 8080
```

## Créditos de diseño

Basado en los mockups y el sistema de diseño `DESIGN.md` (Luminous Spectrum) provistos para CEM.
