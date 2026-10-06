# Design

<!-- impeccable:design-schema 1 -->
<!-- Escrito por Claude directo (sin el subagente impeccable-documenter: no estaba
     disponible en esta sesión). Sustitución revelada — ver reporte al usuario. -->

## World

Hereda la marca ya resuelta del sitio público hermano (`qingling-web/src/index.css`),
no inventa una propia: rojo QINGLING como único acento sobre ink/blanco, Montserrat
para headings, Outfit para texto, radios de 6–14px, sombras suaves con offset (nunca
halos de color a offset cero). El admin se queda en **modo claro** — distinto del
oscuro-por-defecto del sitio público — porque la escena de uso es una sesión de
escritorio/oficina editando formularios, no un visitante bajo luz variable.

## Color

```css
--primary: #15171a;        /* ink — headings, botón "Editar", íconos estructurales */
--accent: #e31e24;         /* rojo de marca — el único acento: CTAs, pestaña activa, foco */
--accent-hover: #ff2a31;
--accent-press: #c4171d;
--accent-soft: rgba(227, 30, 36, 0.08);
--accent-ring: rgba(227, 30, 36, 0.35);
--bg: #f4f4f6;
--card: #ffffff;
--border: #e3e4e8;
--text: #1b1d21;
--text-light: #5c6068;
--success: #1b8a4a;
--danger: #d12f2f;
```

Estrategia: **Restrained** (neutrales + un acento) — es el default correcto para
una herramienta Operate de uso esporádico, no una superficie Persuade. El rojo
aparece solo en botones primarios, pestaña activa, foco y estados "destacado/activo";
nunca como fondo de página ni como color de texto estructural.

## Typography

Montserrat (headings, 600–900) + Outfit (texto, 300–700) — mismo par del sitio
público. El detector de la skill marca Montserrat como "fuente sobreusada en IA";
es un falso positivo acá: es la tipografía de marca ya confirmada en el sitio en
producción (ver `PRODUCT.md` → Brand Commitments), no una elección estética mía.

## Shape & elevation

- Radios: `--radius-sm: 6px` (inputs, botones), `--radius-md: 10px` (tarjetas de
  lista), `--radius-lg: 14px` (modal, tarjeta de login).
- Sombras con offset + blur reales (`--shadow-xs/sm/md/lg`), nunca `0 0 Npx` plano.
- Un solo momento de movimiento autorizado: entrada de la tarjeta de login
  (`login-card-in`) y del modal (`modal-in`/`scrim-in`), fade+scale suave,
  respeta `prefers-reduced-motion`.

## Components

- **Login**: fondo oscuro con halo rojo radial sutil arriba-izquierda, tarjeta
  blanca centrada — isotipo QINGLING arriba, "PANEL DE ADMINISTRACIÓN" como
  etiqueta (no kicker/eyebrow — es la identificación del producto, no un adorno),
  CORASA al pie tras un separador.
- **Header**: logos reales (QINGLING + divisor + CORASA) en vez de texto, badge
  "Admin" en rojo suave, acciones a la derecha. En pantallas de teléfono el logo
  CORASA y el divisor se ocultan (queda el isotipo principal) y el header pasa a
  dos filas (`flex-wrap`) — ver nota de responsive abajo.
- **Nav**: pestañas con ícono + texto, subrayado rojo en la activa. Scroll
  horizontal propio en pantallas chicas (no empuja la página).
- **Tarjetas de ítem / modal de formulario**: mismo lenguaje en toda la app —
  borde 1px + sombra xs en reposo, sombra sm al hover; modal con scrim oscuro y
  entrada suave.
- **Multimedia (nueva)**: grid de tarjetas (miniatura 1:1, nombre de archivo,
  tamaño, copiar URL, borrar), toolbar con filtro de carpeta + botón de subida,
  paginación simple. Mismo lenguaje de tarjeta que el resto del admin.
- **Campo de imagen con subida** (`ImageUploadField`, usado en Camiones y
  Contenido): input de URL + botón de subida directa a `/api/media`, con previsualización.

## Bugs reales encontrados y corregidos en este pase

No eran inventados para la ocasión — se encontraron auditando el código existente:

1. `var(--grey-text)` se usaba en varios estilos en línea de `SiteConfigManager.jsx`
   pero nunca estuvo definido — el texto quedaba sin color intencional. Agregado
   como alias de `--text-light`.
2. Los botones "Guardar" de `SiteConfigManager.jsx` y el mensaje de éxito de
   `ChangePasswordModal.jsx` usaban `var(--primary)` (ink oscuro) en vez de
   `var(--accent)` (rojo) — inconsistente con el resto de los CTAs primarios del
   producto, que sí usaban el acento. Unificado.
3. `SiteConfigManager.jsx` usaba `<MapPin />` sin importarlo de `lucide-react` —
   `ReferenceError` en tiempo de ejecución que tumbaba toda la pantalla al
   renderizar esa sección (no lo agarra el build, solo se ve en producción).
4. El header y el nav no eran responsive: en una pantalla de teléfono real
   (390px) desbordaban horizontalmente — el nav en particular por un bug clásico
   de flexbox (contenedor con `overflow-x:auto` pero sin `width:100%; min-width:0`,
   así que crecía con su contenido y empujaba toda la página). Corregido;
   verificado en un viewport real de 390×844 sin scroll horizontal.

## Explicitly not changed

Por pedido del usuario (confirmado en `PRODUCT.md`): los campos y flujos de
Camiones, Contenido y Configuración se mantienen tal cual — este trabajo es de
identidad visual + Multimedia, no una reescritura funcional. Las categorías de
camión (`LIVIANO/MEDIANO/TRACTO/BUS/ESPECIAL`) y la discrepancia con las
etiquetas del sitio público ("Pesados" en vez de "Tractos") quedan sin tocar —
es una desalineación ya señalada al usuario, fuera del alcance de este pase.

## Process note

Stitch (MCP) no conectó en esta sesión ("Incompatible auth server") — se generó
el sistema con `ui-ux-pro-max` (paleta/tipografía/patrones de referencia,
adaptados a la marca real ya confirmada) y se construyó directo en código,
siguiendo `impeccable`'s craft floor. Los subagentes `impeccable-finish-reviewer`
y `impeccable-documenter` tampoco estaban disponibles esta sesión: la revisión
final y este documento los hice yo mismo, en el mismo hilo — sustitución
revelada acá y en el reporte al usuario, como pide la skill.

## Last reviewed

2026-10-06, por Claude (Sonnet 5), construcción + autorevisión en el mismo hilo.
