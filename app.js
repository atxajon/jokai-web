/* ===================================================================
   JOKAI · app.js
   Descarga content.md, lo parte en secciones y lo renderiza.
   No necesitas tocar este archivo para cambiar contenido: edita
   content.md. Este motor solo traduce ese markdown a la página.
   =================================================================== */

/* --- idiomas ------------------------------------------------------- */
/* Para añadir un idioma: 1) crea content.<code>.md  2) añádelo aquí. */
const LANGS = [
  { code: "eu", label: "EU" },
  { code: "es", label: "ES" },
];
const DEFAULT_LANG = "eu";

/* Cadenas generadas por el motor (no vienen del .md) */
const UI = {
  eu: { empty: "Laster jarriko ditugu hurrengo saioak hemen.",
        loading: "Edukia kargatzen…",
        err_title: "Ezin izan da edukia kargatu",
        err_intro: "Ezin izan da" },
  es: { empty: "Pronto publicaremos aquí las próximas sesiones.",
        loading: "Cargando contenido…",
        err_title: "No se ha podido cargar el contenido",
        err_intro: "No se ha podido leer" },
};

/* Nombres de mes para las tarjetas de calendario de la agenda */
const MONTHS = {
  eu: ["urtarrila","otsaila","martxoa","apirila","maiatza","ekaina",
       "uztaila","abuztua","iraila","urria","azaroa","abendua"],
  es: ["enero","febrero","marzo","abril","mayo","junio",
       "julio","agosto","septiembre","octubre","noviembre","diciembre"],
};

/* Tarjeta tipo calendario a partir de  YYYY-MM-DD  (sin zonas horarias). */
function calendarCard(iso) {
  const m = (iso || "").trim().match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return "";
  const [, year, mm, dd] = m;
  const names = MONTHS[currentLang] || MONTHS[DEFAULT_LANG];
  const month = names[parseInt(mm, 10) - 1];
  if (!month) return "";
  return `
        <time class="cal" datetime="${year}-${mm}-${dd}">
          <span class="cal__month">${esc(month)}</span>
          <span class="cal__day">${dd}</span>
          <span class="cal__year">${year}</span>
        </time>`;
}

let currentLang = DEFAULT_LANG;
/* Páginas: cada <body data-page="..."> elige su contenido y sus secciones. */
const PAGES = {
  home: {
    content: "content", homeHref: "#hero",
    order: ["hero", "norentzat", "jokoak", "profesionalak",
            "iritziak", "faq", "agenda", "kontaktua"],
    nav: [["#jokoak", "nav_jokoak"], ["#norentzat", "nav_norentzat"],
          ["#agenda", "nav_agenda"], ["#profesionalak", "nav_pro"],
          ["#kontaktua", "nav_kontaktua"]],
  },
  larun: {
    content: "../larun", homeHref: "../",   /* la página vive en /larun/ */
    order: ["hero", "sarrera", "mari", "montessori", "sortzaileak", "kontaktua"],
    nav: [["../#jokoak", "nav_back"], ["#mari", "nav_mari"],
          ["#montessori", "nav_montessori"], ["#sortzaileak", "nav_sortzaileak"],
          ["#kontaktua", "nav_kontaktua"]],
  },
};
const PAGE = PAGES[document.body.dataset.page] || PAGES.home;
const contentUrl = (lang) => `${PAGE.content}.${lang}.md`;

function getLang() {
  const valid = LANGS.map((l) => l.code);
  const fromUrl = new URLSearchParams(location.search).get("lang");
  if (valid.includes(fromUrl)) return fromUrl;
  try {
    const saved = localStorage.getItem("jokai_lang");
    if (valid.includes(saved)) return saved;
  } catch (e) { /* localStorage puede estar bloqueado */ }
  return DEFAULT_LANG;
}

function setLang(code) {
  if (code === currentLang) return;
  try { localStorage.setItem("jokai_lang", code); } catch (e) { /* noop */ }
  const url = new URL(location.href);
  url.searchParams.set("lang", code);
  history.replaceState(null, "", url);
  render(code);
}

/* --- utilidades de markdown --------------------------------------- */
marked.use({ breaks: true });
const md = (s) => marked.parse((s || "").trim());          // bloque
const mdInline = (s) => marked.parseInline((s || "").trim()); // en línea
const esc = (s) => (s || "").replace(/[&<>"]/g, (c) =>
  ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

/* Separa el "frontmatter" (líneas  clave: valor  al principio)
   del cuerpo markdown. Devuelve { fields, body }. */
function parseFields(text) {
  const lines = text.split("\n");
  const fields = {};
  let i = 0;
  while (i < lines.length && lines[i].trim() === "") i++; // saltar blancos
  for (; i < lines.length; i++) {
    const line = lines[i];
    if (line.trim() === "") { i++; break; }
    const m = line.match(/^([A-Za-z_][A-Za-z0-9_]*):\s?(.*)$/);
    if (!m) break;
    fields[m[1]] = m[2];
  }
  return { fields, body: lines.slice(i).join("\n") };
}

/* Parte un bloque en elementos delimitados por  ###  */
function splitItems(body) {
  const parts = body.split(/^###\s+/m).map((p) => p.trim()).filter(Boolean);
  return parts.map((p) => {
    const nl = p.indexOf("\n");
    const title = (nl === -1 ? p : p.slice(0, nl)).trim();
    const rest = nl === -1 ? "" : p.slice(nl + 1);
    const { fields, body } = parseFields(rest);
    return { title, fields, body };
  });
}

/* Convierte el .md entero en { id: {fields, body} } */
function parseContent(raw) {
  const re = /<!--\s*@([\w-]+)\s*-->/g;
  const sections = {};
  let m, last = null, lastIdx = 0;
  while ((m = re.exec(raw)) !== null) {
    if (last !== null) sections[last] = raw.slice(lastIdx, m.index);
    last = m[1];
    lastIdx = re.lastIndex;
  }
  if (last !== null) sections[last] = raw.slice(lastIdx);
  const out = {};
  for (const id in sections) {
    const { fields, body } = parseFields(sections[id]);
    out[id] = { fields, body, raw: sections[id] };
  }
  return out;
}

/* --- firma visual: barra rítmica de txalaparta --------------------- */
function beatBar(animated) {
  // 11 tablas; el ritmo (alto/bajo) imita el ttakun/herrena alternante.
  const pattern = [3, 1, 2, 1, 3, 1, 2, 1, 3, 1, 2];
  const planks = pattern.map((h, i) =>
    `<span class="plank h${h}" style="--d:${i * 70}ms"></span>`).join("");
  return `<div class="beatbar${animated ? " is-anim" : ""}" aria-hidden="true">${planks}</div>`;
}

/* --- renderizadores por sección ----------------------------------- */
const R = {
  hero(s, meta) {
    const f = s.fields;
    const slogan = esc(f.slogan).replace(/\\n/g, "<br>");
    const event = f.event
      ? `<p class="hero__event"><span class="dot"></span>${mdInline(f.event)}</p>`
      : "";
    return `
    <section id="hero" class="hero">
      <div class="wrap hero__inner">
        ${beatBar(true)}
        ${f.eyebrow ? `<p class="eyebrow">${mdInline(f.eyebrow)}</p>` : ""}
        <h1 class="hero__slogan">${slogan}</h1>
        ${f.subtitle ? `<p class="hero__sub">${mdInline(f.subtitle)}</p>` : ""}
        ${(f.cta_primary_label || f.cta_secondary_label) ? `<div class="hero__cta">
          ${f.cta_primary_label ? `<a class="btn btn--primary" href="${esc(f.cta_primary_href)}">${esc(f.cta_primary_label)}</a>` : ""}
          ${f.cta_secondary_label ? `<a class="btn btn--ghost" href="${esc(f.cta_secondary_href)}">${esc(f.cta_secondary_label)} <span aria-hidden="true">→</span></a>` : ""}
        </div>` : ""}
        ${event}
      </div>
    </section>`;
  },

  norentzat(s) {
    const items = splitItems(s.body).map((it, i) => `
      <article class="card card--who">
        <span class="card__index">${String(i + 1).padStart(2, "0")}</span>
        <h3>${esc(it.title)}</h3>
        ${md(it.body)}
      </article>`).join("");
    return section("norentzat", s.fields, `<div class="grid grid-3">${items}</div>`);
  },

  jokoak(s) {
    const items = splitItems(s.body).map((it) => `
      <article class="card card--game">
        <div class="card__head">
          <h3>${esc(it.title)}</h3>
          ${it.fields.tag ? `<span class="tag">${esc(it.fields.tag)}</span>` : ""}
        </div>
        ${md(it.body)}
      </article>`).join("");
    return section("jokoak", s.fields, `<div class="grid grid-2">${items}</div>`);
  },

  profesionalak(s) {
    const items = splitItems(s.body).map((it) => {
      const cta = it.fields.cta_label
        ? `<a class="btn btn--solid" href="${esc(it.fields.cta_href)}">${esc(it.fields.cta_label)}</a>`
        : "";
      return `
      <article class="card card--pro">
        <h3>${esc(it.title)}</h3>
        ${md(it.body)}
        ${cta}
      </article>`;
    }).join("");
    return section("profesionalak", s.fields,
      `<div class="grid grid-3">${items}</div>`, "band band--pro");
  },

  iritziak(s) {
    const f = s.fields;
    const stats = [1, 2, 3].map((n) => f[`stat${n}_num`] != null
      ? `<div class="stat"><span class="stat__num">${esc(f[`stat${n}_num`])}</span><span class="stat__label">${mdInline(f[`stat${n}_label`])}</span></div>`
      : "").join("");
    const cards = splitItems(s.body).map((it) => `
      <figure class="quote">
        ${md(it.body)}
        <figcaption>${esc(it.title)}</figcaption>
      </figure>`).join("");
    const statsBlock = stats.trim() ? `<div class="stats">${stats}</div>` : "";
    return section("iritziak", s.fields,
      `${statsBlock}<div class="grid grid-2">${cards}</div>`);
  },

  faq(s) {
    const items = splitItems(s.body).map((it) => `
      <details class="faq">
        <summary>${esc(it.title)}</summary>
        <div class="faq__a">${md(it.body)}</div>
      </details>`).join("");
    return section("faq", s.fields, `<div class="faq__list">${items}</div>`);
  },

  agenda(s) {
    const items = splitItems(s.body);
    const rows = items.length ? items.map((it) => {
      const link = (it.body.match(/\[([^\]]+)\]\(([^)]+)\)/));
      const bodyNoLink = it.body.replace(/\[([^\]]+)\]\(([^)]+)\)/, "").trim();
      // Con campo  date: YYYY-MM-DD  -> tarjeta de calendario.
      // Sin él (o mal escrito) -> se mantiene el título de texto de siempre.
      const card = calendarCard(it.fields.date);
      const when = card
        ? card
        : `<div class="event__when">${esc(it.title)}</div>`;
      const town = card ? `<span class="event__town">${esc(it.title)}</span>` : "";
      return `
      <article class="event${card ? " event--cal" : ""}">
        ${when}
        <div class="event__what">
          ${town}
          ${it.fields.place ? `<strong>${esc(it.fields.place)}</strong>` : ""}
          ${md(bodyNoLink)}
        </div>
        ${link ? `<a class="btn btn--ghost btn--sm" href="${esc(link[2])}">${esc(link[1])}</a>` : ""}
      </article>`;
    }).join("")
      : `<p class="empty">${esc((UI[currentLang] || UI[DEFAULT_LANG]).empty)}</p>`;
    return section("agenda", s.fields, `<div class="agenda">${rows}</div>`);
  },

  mari(s) {
    // Cada línea:  Nombre | descripción corta (opcional)
    const chips = s.body.split("\n").map((l) => l.trim())
      .filter((l) => l && !l.startsWith("<!--"))
      .map((l) => {
        const [name, ...gloss] = l.split("|");
        const g = gloss.join("|").trim();
        return `<li class="figura"><strong>${esc(name.trim())}</strong>${g ? `<span>${esc(g)}</span>` : ""}</li>`;
      }).join("");
    return section("mari", s.fields, `<ul class="figurak">${chips}</ul>`);
  },

  sortzaileak(s) {
    const items = splitItems(s.body).map((it) => {
      const name = it.fields.href
        ? `<a href="${esc(it.fields.href)}" target="_blank" rel="noopener">${esc(it.title)}</a>`
        : esc(it.title);
      return `
      <article class="card card--credit">
        <h3>${name}</h3>
        ${md(it.body)}
      </article>`;
    }).join("");
    return section("sortzaileak", s.fields, `<div class="grid grid-3">${items}</div>`);
  },

  kontaktua(s) {
    const f = s.fields;
    const links = `
      <div class="contact__links">
        ${f.email ? `<a class="contact__big" href="mailto:${esc(f.email)}">${esc(f.email)}</a>` : ""}
        ${f.phone ? `<a class="contact__phone" href="tel:${esc(f.phone.replace(/\s/g, ""))}">${esc(f.phone)}</a>` : ""}
        ${f.phone2 ? `<a class="contact__phone" href="tel:${esc(f.phone2.replace(/\s/g, ""))}">${esc(f.phone2)}</a>` : ""}
      </div>`;
    return section("kontaktua", s.fields,
      `<div class="contact">${md(s.body)}${links}</div>`, "band band--ink");
  },
};

/* Secciones de texto libre (título + intro + markdown) */
const textSection = (id, band) => (s) =>
  section(id, s.fields, `<div class="prose">${md(s.body)}</div>`, band);
R.sarrera = textSection("sarrera");
R.montessori = textSection("montessori", "band band--pro");

/* Envoltorio común de sección con cabecera + divisor rítmico */
function section(id, fields, inner, bandClass) {
  const head = `
    <header class="sec__head">
      ${fields.title ? `<h2 class="sec__title">${esc(fields.title)}</h2>` : ""}
      ${beatBar(false)}
      ${fields.intro ? `<p class="sec__intro">${mdInline(fields.intro)}</p>` : ""}
    </header>`;
  return `
    <section id="${id}" class="sec ${bandClass || ""}">
      <div class="wrap">${head}${inner}</div>
    </section>`;
}

/* --- cabecera / navegación ---------------------------------------- */
function renderTopbar(meta) {
  const f = meta ? meta.fields : {};
  const items = PAGE.nav.map(([h, k]) => [h, f[k]])
.filter(([, l]) => l)
    .map(([h, l]) => `<a href="${h}">${esc(l)}</a>`).join("");
  const langs = LANGS.map((l) =>
    `<button class="langswitch__btn${l.code === currentLang ? " is-active" : ""}" data-lang="${l.code}">${esc(l.label)}</button>`
  ).join("");
  return `
    <div class="wrap topbar__inner">
      <a class="brand" href="${PAGE.homeHref}">${esc(f.brand || "Jokai")}</a>
      <nav class="nav">${items}</nav>
      <div class="langswitch" role="group" aria-label="Hizkuntza / Idioma">${langs}</div>
      <button class="menu-toggle" aria-label="Menu" aria-expanded="false">≡</button>
    </div>`;
}

/* --- arranque ------------------------------------------------------ */
async function render(lang) {
  currentLang = lang;
  document.documentElement.lang = lang;
  const app = document.getElementById("app");
  const top = document.getElementById("topbar");
  try {
    const res = await fetch(contentUrl(lang), { cache: "no-store" });
    if (!res.ok) throw new Error(res.status + " " + res.statusText);
    const raw = await res.text();
    const data = parseContent(raw);

    top.innerHTML = renderTopbar(data.meta);
    if (data.meta && data.meta.fields.page_title) document.title = data.meta.fields.page_title;

    const html = PAGE.order
      .filter((id) => data[id] && R[id])
      .map((id) => R[id](data[id], data.meta))
      .join("");
    app.innerHTML = html;

    wireUp();
  } catch (err) {
    const t = UI[lang] || UI[DEFAULT_LANG];
    top.innerHTML = renderTopbar(null);
    app.innerHTML = `
      <div class="wrap fallback">
        <h1>${esc(t.err_title)}</h1>
        <p>${esc(t.err_intro)} <code>${esc(contentUrl(lang))}</code>.</p>
        <p>Casi siempre es porque abriste el archivo con doble clic
           (<code>file://</code>). Esta web necesita un servidor local.
           Abre una terminal en esta carpeta y ejecuta:</p>
        <pre>python3 -m http.server 8000</pre>
        <p>Luego visita <a href="http://localhost:8000">http://localhost:8000</a>.</p>
        <p class="muted">${esc(String(err.message || err))}</p>
      </div>`;
    wireUp();
    console.error(err);
  }
}

/* Interacciones: idioma + menú móvil + revelar barras al hacer scroll */
function wireUp() {
  document.querySelectorAll(".langswitch__btn").forEach((b) =>
    b.addEventListener("click", () => setLang(b.dataset.lang)));

  const toggle = document.querySelector(".menu-toggle");
  const nav = document.querySelector(".nav");
  if (toggle && nav) {
    toggle.addEventListener("click", () => {
      const open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", String(open));
    });
    nav.querySelectorAll("a").forEach((a) =>
      a.addEventListener("click", () => {
        nav.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
      }));
  }
  if (!matchMedia("(prefers-reduced-motion: reduce)").matches && "IntersectionObserver" in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("is-anim"); io.unobserve(e.target); } });
    }, { threshold: 0.4 });
    document.querySelectorAll(".sec .beatbar").forEach((b) => io.observe(b));
  }
}

document.addEventListener("DOMContentLoaded", () => render(getLang()));
