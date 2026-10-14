# Cómo cambiar el texto de la web (sin saber programar)

Toda la web se controla desde dos archivos de texto:

- **`content.es.md`** → versión en **español**
- **`content.eu.md`** → versión en **euskara**

Cambias el texto en esos archivos, y la web pública se actualiza sola en
aproximadamente 1 minuto. No hay que instalar nada.

---

## Editar desde la web de GitHub (lo más fácil)

1. Entra en el repositorio en GitHub (el enlace que te hemos pasado).
2. Haz clic en el archivo que quieras cambiar, p. ej. **`content.es.md`**.
3. Pulsa el **icono del lápiz** (✏️) arriba a la derecha ("Edit this file").
4. Cambia el texto que necesites (ver las reglas abajo).
5. Baja hasta el botón verde **"Commit changes"** y púlsalo.
6. Espera ~1 minuto y refresca la web pública. Listo.

> Cada cambio queda guardado con su fecha, así que nunca se pierde nada:
> siempre se puede volver a una versión anterior.

---

## Las 3 reglas del archivo

1. **No toques los marcadores** del tipo `<!-- @hero -->`, `<!-- @agenda -->`.
   Son las "etiquetas" de cada sección.
2. Debajo de cada marcador hay líneas tipo `clave: valor`
   (por ejemplo `title: Nuestros juegos`). Cambia lo que va **después** de
   los dos puntos, no la clave.
3. El resto es texto normal. Para dar formato:
   - `**negrita**` → **negrita**
   - `*cursiva*` → *cursiva*
   - `- ` al principio de una línea → viñeta de lista
   - `[texto del enlace](https://…)` → enlace

Las líneas marcadas con **⚠️ RELLENAR** son datos de ejemplo (fechas, cifras,
testimonios): sustitúyelas por los datos reales.

---

## Ejemplos

**Cambiar el subtítulo de portada** — en `content.es.md`, dentro de
`<!-- @hero -->`, edita la línea que empieza por `subtitle:`.

**Añadir una sesión a la agenda** — dentro de `<!-- @agenda -->`, copia este
bloque y cámbialo:
```
### 8 de marzo · Bilbao
place: Teatro Arriaga · Larun
18:00 · Sesión familiar
[Reservar plaza](#kontaktua)
```

**Quitar una sesión** — borra su bloque entero (desde su `###` hasta antes
del siguiente `###`).

---

## Importante

- El español y el euskara son archivos **separados**. Si cambias uno, el otro
  **no** se cambia solo: edita los dos si quieres que coincidan.
- Si algo se rompe, no pasa nada: avísanos y recuperamos la versión anterior
  en segundos.
