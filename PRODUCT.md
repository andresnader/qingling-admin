# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Hoy, un único usuario: Andrés (dueño del proyecto, perfil técnico), que carga y mantiene el catálogo de camiones, los textos de las páginas y la configuración del sitio público de QINGLING Ecuador. Puede sumarse gente de CORASA más adelante, pero no hay fecha ni rol confirmado todavía — se construye para el uso de hoy (una persona técnica), no para un equipo grande no técnico.

## Product Purpose

Panel de administración (CMS interno) del sitio público `qinglingmotors.com.ec`. Permite editar, sin tocar código, el catálogo de camiones QINGLING, los textos/hero de las páginas (Home, Nosotros), y la configuración global del sitio (teléfonos, WhatsApp, redes, horarios, footer). El sitio público lee estos datos vía la API (`qingling-api`); un cambio guardado en el admin se refleja ahí.

## Positioning

No es un CMS genérico: está hecho a medida del catálogo real de QINGLING/CORASA (modelos de camión con specs técnicas por sección — motor, embrague, frenos, etc. — categorías de uso, landings por modelo), no de "páginas" o "posts" abstractos. Su contraparte es el código fuente/Prisma Studio — existe para que editar contenido no requiera tocar la base de datos ni el repo.

## Operating Context

Uso esporádico, no diario: sesiones cortas para cargar un camión nuevo, ajustar un texto o actualizar un teléfono/WhatsApp antes o durante el lanzamiento del sitio. Corre como servicio aparte en Railway (`qingling-admin`, dominio `admin.qinglingmotors.com.ec`), habla con `qingling-api` (Express + Prisma + Postgres) vía JWT. El sitio público (`qingling-web`) y la API comparten la misma base de marca (rojo `#e31e24`, Montserrat/Outfit) que este admin no refleja todavía.

## Capabilities and Constraints

- Tres secciones hoy: **Camiones** (CRUD con specs técnicas, categoría, imagen, destacado, activo), **Contenido** (título/subtítulo/CTA/hero/bloques de texto por página — Home y Nosotros tienen bloques editables), **Configuración** (contacto, WhatsApp, horarios, redes, footer, países del mapa de presencia).
- Falta una sección de **Multimedia**: la API ya tiene `/api/media` completo (listar, subir a S3, actualizar alt/carpeta, borrar), pero el admin no tiene pantalla para eso — hoy las imágenes se pegan a mano como URL de texto en los campos "URL Imagen" / "URL de Imagen Hero". Es la carencia que motiva este rediseño, junto con la falta de identidad visual.
- Autenticación: JWT con login (rate-limited) + `PATCH /api/auth/password` ya construido para que el propio usuario rote su contraseña (sin UI todavía en este momento del rediseño — revisar si ya se agregó).
- Regla de marca dura (ver `AGENTS.md` del proyecto hermano `qingling-web`): el sitio público nunca muestra precios ni cuotas — no reintroducir un campo de precio en el formulario de camiones.
- Roles: `ADMIN` y `EDITOR` existen en el modelo de datos; hoy todo el admin trata a cualquier usuario autenticado igual (sin UI que distinga permisos por rol).
- Alcance de este rediseño: mantener las 3 secciones actuales y sus campos tal cual (confirmado por el usuario — "nada más que eso" a preservar), sumar Multimedia, y resolver la identidad visual (hoy genérica, sin relación con la marca del sitio público).

## Brand Commitments

- Nombre del producto/dueño: **QINGLING Motors Ecuador**, representado y distribuido en Ecuador por **CORASA** (Corporación Automotriz S.A., 80 años — 1946-2026).
- Activos de marca reales ya copiados a `public/`: `logo-qingling.png` (isotipo + wordmark QINGLING MOTORS ECUADOR, rojo sobre transparente), `logo-corasa.png` (wordmark CORASA 80 años, negro con acento rojo, sobre transparente), `favicon.png`/`favicon.svg` (isotipo QINGLING).
- El sitio público (`qingling-web`) ya tiene un sistema de marca resuelto y en producción: rojo `#e31e24` como color de marca, negro/blanco, tipografía Montserrat (headings) + Outfit (texto), con tema oscuro por defecto y toggle claro/oscuro. Es la autoridad de marca real — el admin debe sentirse del mismo producto, no debe inventar una paleta nueva.

## Evidence on Hand

- Sitio público en producción: `qinglingmotors.com.ec` (tras una clave de acceso "Próximamente" — pre-lanzamiento). Su código fuente (`../qingling-web`) es la referencia de marca viva: `src/index.css` tiene los tokens reales (color, tipografía, superficies claro/oscuro).
- API en producción: `qingling-api-production.up.railway.app` / `api.qinglingmotors.com.ec`, con Postgres + bucket S3 (`qingling-media`) ya configurado y funcionando para medios.
- No hay capturas de pantalla, user research ni métricas de uso del admin — es una herramienta interna sin instrumentación.

## Product Principles

1. **Mismo producto, misma marca.** El admin es la trastienda del sitio QINGLING/CORASA — debe leerse como parte de la misma familia visual, no como una herramienta genérica aparte.
2. **Editar contenido real sin fricción de URLs.** Cualquier campo de imagen debe permitir subir un archivo directo (vía `/api/media`), no solo pegar una URL a mano.
3. **Herramienta de trabajo, no vitrina.** Prioriza claridad y velocidad para tareas cortas y esporádicas sobre ornamentación — common sense de "Operate", no de landing de marketing.
4. **No tocar lo que ya funciona.** Los campos y flujos de Camiones, Contenido y Configuración se mantienen; este trabajo es de identidad visual + la sección de Multimedia que falta, no una reescritura funcional.
5. **La regla de marca del sitio público aplica acá también.** Nunca reintroducir precios/cuotas en ningún formulario del admin.

## Accessibility & Inclusion

Sin requisito específico confirmado por el usuario. Mantener buen contraste y tamaños de toque razonables como práctica general (usuario único, uso de escritorio).
