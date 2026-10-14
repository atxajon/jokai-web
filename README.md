# Jokai · web estática multilingüe alimentada por markdown

Landing para **jokai.eus** que se construye a partir de archivos de texto.
Editas el `.md`, refrescas el navegador, y la web se actualiza. Sin compilar,
sin backend. Dos idiomas: **euskara** (`content.eu.md`) y **español**
(`content.es.md`), con conmutador EU / ES en la cabecera.

La estructura responde al plan de marketing: doble público (**familias** y
**técnicos de programación cultural**), slogan _"Euskal mitologia eskuetan"_,
sección B2B propia, prueba social, FAQ y agenda.

---

## 0. Colocar la carpeta en tu Mac

Descomprime `jokai-web.zip`. Para dejarla en tu ruta de trabajo:

```bash
# desde la carpeta donde descomprimiste:
mkdir -p /Users/jonatxa/www
mv jokai-web /Users/jonatxa/www/
cd /Users/jonatxa/www/jokai-web
```

(Nota: la ruta correcta en macOS es `/Users/jonatxa/www/`, con barras.)

## 1. Arrancar la web (servidor local)

El navegador bloquea la lectura de archivos locales, así que hace falta un
servidor local mínimo:

```bash
cd /Users/jonatxa/www/jokai-web
python3 -m http.server 8000
```
Abre **http://localhost:8000**

Atajos: **Mac** doble clic en `start.command` · **Windows** `start.bat`.
Para parar: `Ctrl + C`.

Para abrir directamente en un idioma: `http://localhost:8000/?lang=es`
La elección se recuerda en el navegador.

---

## 2. Editar el contenido

Abre **`content.eu.md`** (euskara) o **`content.es.md`** (español) con
cualquier editor de texto. Todo el contenido visible está ahí, **incluidos los
menús, botones y títulos**: al cambiar de idioma se cambia el archivo entero.

Solo 3 reglas:

1. Cada sección empieza con `<!-- @id -->`. No los borres ni renombres.
   Para ocultar una sección, borra su bloque completo.
2. Bajo el marcador van campos `clave: valor` (hasta la primera línea en
   blanco): `title:`, `cta_primary_label:`, `email:`, etc.
3. El resto es markdown: `## Título`, `**negrita**`, `[texto](enlace)`,
   listas con `-`, citas con `>`. En las secciones con varios elementos
   (juegos, FAQ, agenda, testimonios, profesionales) **cada `###` es un
   elemento nuevo**.

Busca las marcas `⚠️ RELLENAR` / `⚠️ BETE`: son datos de ejemplo (fechas,
cifras, testimonios) que debes sustituir por datos reales.

> **Importante:** edita los dos archivos en paralelo. Lo que cambies en
> `content.es.md` no se traduce solo a `content.eu.md` ni al revés.

### Ejemplos

Añadir una sesión a la agenda (en `content.es.md`, dentro de `<!-- @agenda -->`):
```
### 8 de marzo · Bilbao
place: Arriaga · Larun
18:00 · Sesión familiar
[Reservar plaza](#kontaktua)
```

Quitar el badge de "próxima sesión" del hero → deja `event:` vacío.

### Añadir un tercer idioma (p. ej. francés)

1. Copia `content.es.md` como `content.fr.md` y tradúcelo.
2. En `app.js`, en la lista `LANGS`, añade `{ code: "fr", label: "FR" }`.

---

## 3. Archivos

```
jokai-web/
├── index.html       estructura (no necesitas tocarlo)
├── content.eu.md    ← contenido en EUSKARA
├── content.es.md    ← contenido en ESPAÑOL
├── styles.css       diseño y colores
├── app.js           motor (lee el .md y pinta la web)
├── vendor/          marked.js (lector de markdown, funciona sin internet)
├── start.command    arranque rápido en Mac
└── start.bat         arranque rápido en Windows
```

Las tipografías se cargan desde Google Fonts (necesitan internet la primera
vez). Para 100% offline, descárgalas y enlázalas localmente en `index.html`.

---

## 4. Publicarla en internet

Es estática: sube la carpeta tal cual a **Netlify**, **GitHub Pages**,
**Cloudflare Pages** o cualquier hosting estático. El servidor local solo es
para trabajar en tu ordenador.

---

## 5. Preview público + edición por el cliente (GitHub Pages)

Este repositorio se publica automáticamente con **GitHub Pages**:

- URL pública de preview: `https://<usuario>.github.io/jokai-web/`
- Cada `commit` al repositorio **redespliega** la web en ~1 minuto.
- El cliente edita `content.es.md` / `content.eu.md` desde la web de GitHub
  (botón ✏️ → "Commit changes"). Ver **`COMO-EDITAR.md`**.

Para que el cliente pueda editar, hay que invitarle como colaborador del
repositorio (Settings → Collaborators) con su usuario de GitHub.
