/* =============================================================
   WIENER BLUUT — Rendering + Editor
   Renders the page from content.json. In edit mode (#edit) the
   content is published back through the local Setzer tool, which
   commits it to the site's Git repository.
   ============================================================= */
(function () {
  "use strict";

  var MONTHS = ["Jän", "Feb", "Mär", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dez"];

  // content.json is the single source of truth, fetched at load.
  var CONTENT_URL = "content.json";
  var data = {};

  function load() {
    return fetch(CONTENT_URL, { cache: "no-store" }).then(function (r) {
      if (!r.ok) throw new Error("HTTP " + r.status);
      return r.json();
    }).then(function (json) { data = normalizeImages(json); });
  }

  // Image fields may be a plain label (legacy) or { src, alt }. Normalise to
  // { src, alt } so the renderer and editor treat them uniformly.
  function toImage(v) {
    return (v && typeof v === "object") ? { src: v.src || "", alt: v.alt || "" } : { src: "", alt: v || "" };
  }
  function normalizeImages(d) {
    if (d.hero) d.hero.image = toImage(d.hero.image);
    if (d.about && d.about.members) d.about.members.forEach(function (m) { m.image = toImage(m.image); });
    if (d.galerie && d.galerie.images) d.galerie.images = d.galerie.images.map(toImage);
    return d;
  }

  // -- helpers
  function el(tag, attrs, children) {
    var n = document.createElement(tag);
    if (attrs) for (var k in attrs) {
      if (k === "class") n.className = attrs[k];
      else if (k === "html") n.innerHTML = attrs[k];
      else if (k === "text") n.textContent = attrs[k];
      else n.setAttribute(k, attrs[k]);
    }
    if (children) children.forEach(function (c) { if (c) n.appendChild(c); });
    return n;
  }
  function esc(s) { return (s == null ? "" : String(s)).replace(/[&<>"]/g, function (c) { return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]; }); }
  function uu(s) { return esc(s).replace(/uu/g, '<span class="uu">uu</span>'); }
  function ph(label, cls) {
    return '<div class="ph ' + (cls || "") + '"><span class="ph-label">' + esc(label) + '</span></div>';
  }

  // imgOrPh renders an <img> when the image has a src, else the placeholder.
  function imgOrPh(image, cls) {
    if (image && image.src) {
      return '<img class="' + (cls || "") + '" src="' + esc(image.src) + '" alt="' + esc(image.alt || "") + '" loading="lazy">';
    }
    return ph((image && image.alt) || "", cls);
  }

  // ============================================================
  //  RENDER
  // ============================================================
  function render() {
    document.title = data.site.name + " — " + data.site.tagline;
    renderHeader();
    renderHero();
    renderAbout();
    renderProgramm();
    renderTermine();
    renderStimmen();
    renderGalerie();
    renderKontakt();
    renderFooter();
  }

  function renderHeader() {
    var nav = document.querySelector(".site-header .wrap");
    nav.innerHTML =
      '<a class="brand" href="#top">' + uu(data.site.name) + '</a>' +
      '<button class="nav-toggle" aria-label="Menü"><span></span><span></span><span></span></button>' +
      '<nav class="nav">' +
        '<a href="#programm">Programm</a>' +
        '<a href="#termine">Termine</a>' +
        '<a href="#stimmen">Stimmen</a>' +
        '<a href="#galerie">Galerie</a>' +
        '<a class="nav-cta" href="#kontakt">Anfragen</a>' +
      '</nav>';
    var toggle = nav.querySelector(".nav-toggle");
    var menu = nav.querySelector(".nav");
    toggle.addEventListener("click", function () { menu.classList.toggle("open"); });
    menu.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () { menu.classList.remove("open"); });
    });
  }

  function renderHero() {
    var h = data.hero;
    document.getElementById("hero").innerHTML =
      '<div class="wrap">' +
        '<div class="hero-copy">' +
          '<p class="kicker">' + esc(h.kicker) + '</p>' +
          '<h1>' + uu(h.title) + '</h1>' +
          '<p class="hero-sub">' + esc(h.subtitle) + '</p>' +
          '<p class="hero-intro">' + esc(h.intro) + '</p>' +
          '<div class="hero-cta">' +
            '<a class="btn btn-gold" href="' + esc(h.primaryCta.href) + '">' + esc(h.primaryCta.label) + '</a>' +
            '<a class="btn btn-ghost" href="' + esc(h.secondaryCta.href) + '">' + esc(h.secondaryCta.label) + '</a>' +
          '</div>' +
        '</div>' +
        (h.image && h.image.src
          ? '<div class="hero-portrait on-dark"><img src="' + esc(h.image.src) + '" alt="' + esc(h.image.alt || "") + '"></div>'
          : '<div class="hero-portrait ph on-dark"><span class="ph-label">' + esc(h.image.alt || "") + '</span></div>') +
      '</div>';
  }

  function renderAbout() {
    var a = data.about;
    var paras = a.paragraphs.map(function (p) { return '<p>' + esc(p) + '</p>'; }).join("");
    var members = a.members.map(function (m) {
      return '<div class="member">' + imgOrPh(m.image) +
        '<div><div class="m-name">' + esc(m.name) + '</div>' +
        '<div class="m-role">' + esc(m.role) + '</div>' +
        '<div class="m-note">' + esc(m.note) + '</div></div></div>';
    }).join("");
    document.getElementById("about").innerHTML =
      '<div class="wrap about-grid">' +
        '<div><p class="section-label">' + esc(a.label) + '</p><h2>' + esc(a.title) + '</h2>' + paras + '</div>' +
        '<div class="members">' + members + '</div>' +
      '</div>';
  }

  function renderProgramm() {
    var p = data.programm;
    var cards = p.items.map(function (it, i) {
      var n = ("0" + (i + 1)).slice(-2);
      return '<article class="prog-card"><span class="num">' + n + '</span><h3>' + esc(it.title) + '</h3><p>' + esc(it.text) + '</p></article>';
    }).join("");
    document.getElementById("programm").innerHTML =
      '<div class="wrap">' +
        '<div class="head"><p class="section-label">' + esc(p.label) + '</p><h2>' + esc(p.title) + '</h2><p class="lead">' + esc(p.intro) + '</p></div>' +
        '<div class="prog-grid">' + cards + '</div>' +
      '</div>';
  }

  function renderTermine() {
    var t = data.termine;
    var events = (t.events || []).slice().sort(function (a, b) { return (a.date || "").localeCompare(b.date || ""); });
    var rows;
    if (!events.length) {
      rows = '<p class="empty-msg">Zurzeit keine Termine angekündigt — schauen Sie bald wieder vorbei.</p>';
    } else {
      rows = '<div class="events">' + events.map(function (e) {
        var d = parseDate(e.date);
        var ticket = e.ticket ? '<a class="btn btn-primary ev-action" href="' + esc(e.ticket) + '" target="_blank" rel="noopener">Tickets</a>'
                              : '<a class="btn btn-ghost ev-action" href="#kontakt">Reservieren</a>';
        var place = [e.venue, e.city].filter(Boolean).map(esc).join(", ");
        var meta = '<strong>' + place + '</strong>';
        if (e.time) meta += ' · ' + esc(e.time) + ' Uhr';
        if (e.address) meta += '<br>' + esc(e.address);
        return '<div class="event">' +
          '<div class="ev-date">' +
            (d ? '<div class="ev-day">' + d.day + '</div><div class="ev-mon">' + d.mon + '</div><div class="ev-year">' + d.year + '</div>' : '<div class="ev-mon">tba</div>') +
          '</div>' +
          '<div><div class="ev-title">' + esc(e.title) + '</div><div class="ev-meta">' + meta + '</div></div>' +
          ticket +
          '</div>';
      }).join("") + '</div>';
    }
    document.getElementById("termine").innerHTML =
      '<div class="wrap">' +
        '<div class="head"><p class="section-label">' + esc(t.label) + '</p><h2>' + esc(t.title) + '</h2><p class="lead">' + esc(t.intro) + '</p></div>' +
        rows +
        (t.note ? '<p class="note">' + esc(t.note) + '</p>' : '') +
      '</div>';
  }

  function parseDate(s) {
    if (!s) return null;
    var p = s.split("-");
    if (p.length < 3) return null;
    return { day: p[2], mon: MONTHS[parseInt(p[1], 10) - 1] || "", year: p[0] };
  }

  function renderStimmen() {
    var s = data.stimmen;
    var quotes = s.quotes.map(function (q) {
      return '<figure class="quote"><span class="q-mark">&ldquo;</span><p>' + esc(q.text) + '</p><figcaption class="q-author">' + esc(q.author) + '</figcaption></figure>';
    }).join("");
    document.getElementById("stimmen").innerHTML =
      '<div class="wrap">' +
        '<p class="section-label">' + esc(s.label) + '</p><h2>' + esc(s.title) + '</h2><p class="intro">' + esc(s.intro) + '</p>' +
        '<div class="quotes">' + quotes + '</div>' +
      '</div>';
  }

  function renderGalerie() {
    var g = data.galerie;
    var imgs = g.images.map(function (image) { return imgOrPh(image); }).join("");
    document.getElementById("galerie").innerHTML =
      '<div class="wrap">' +
        '<div class="head"><p class="section-label">' + esc(g.label) + '</p><h2>' + esc(g.title) + '</h2></div>' +
        '<div class="gal-grid">' + imgs + '</div>' +
      '</div>';
  }

  function renderKontakt() {
    var k = data.kontakt;
    var details = '';
    details += '<div class="k-detail"><span class="k-key">E-Mail</span><a href="mailto:' + esc(k.email) + '">' + esc(k.email) + '</a></div>';
    if (k.phone) details += '<div class="k-detail"><span class="k-key">Telefon</span><a href="tel:' + esc(k.phone.replace(/\s/g, "")) + '">' + esc(k.phone) + '</a></div>';
    if (k.location) details += '<div class="k-detail"><span class="k-key">Ort</span><span>' + esc(k.location) + '</span></div>';
    document.getElementById("kontakt").innerHTML =
      '<div class="wrap k-grid">' +
        '<div><p class="section-label">' + esc(k.label) + '</p><h2>' + esc(k.title) + '</h2><p class="intro">' + esc(k.intro) + '</p>' + details + '</div>' +
        '<form class="booking" novalidate>' +
          '<div class="field-row">' +
            '<div class="field"><label>Name</label><input name="name" required></div>' +
            '<div class="field"><label>E-Mail</label><input type="email" name="email" required></div>' +
          '</div>' +
          '<div class="field-row">' +
            '<div class="field"><label>Anlass</label><input name="anlass" placeholder="Vernissage, Feier, Konzert …"></div>' +
            '<div class="field"><label>Wunschtermin</label><input type="date" name="datum"></div>' +
          '</div>' +
          '<div class="field"><label>Nachricht</label><textarea name="nachricht" required></textarea></div>' +
          '<button class="btn btn-primary" type="submit">Anfrage senden</button>' +
          '<p class="form-note">Die Anfrage öffnet Ihr E-Mail-Programm mit vorausgefüllten Angaben.</p>' +
        '</form>' +
      '</div>';
    wireForm(k);
  }

  function wireForm(k) {
    var form = document.querySelector("form.booking");
    form.addEventListener("submit", function (ev) {
      ev.preventDefault();
      var f = form.elements;
      if (k.formAction) {
        form.action = k.formAction; form.method = "POST"; form.submit(); return;
      }
      var body =
        "Name: " + f.name.value + "\n" +
        "E-Mail: " + f.email.value + "\n" +
        "Anlass: " + f.anlass.value + "\n" +
        "Wunschtermin: " + f.datum.value + "\n\n" +
        f.nachricht.value;
      var subject = "Booking-Anfrage — " + (f.anlass.value || "Wiener Bluut");
      window.location.href = "mailto:" + k.email + "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);
      toast("E-Mail-Programm wird geöffnet …");
    });
  }

  function renderFooter() {
    var f = data.footer;
    var links = f.links.map(function (l) { return '<a href="' + esc(l.href) + '">' + esc(l.label) + '</a>'; }).join("");
    // The edit affordance only exists when served by Setzer (window.Setzer);
    // on GitHub Pages there's no editor at all.
    var editBtn = window.Setzer ? '<button class="f-edit" id="open-editor">Inhalte bearbeiten</button>' : '';
    document.querySelector(".site-footer .wrap").innerHTML =
      '<div><div class="f-brand">' + uu(data.site.name) + '</div><div class="f-note">' + esc(f.note) + '</div>' +
      '<a class="f-legal" href="impressum.html">Impressum</a>' +
      editBtn + '</div>' +
      '<div class="f-links">' + links + '</div>';
    if (window.Setzer) {
      document.getElementById("open-editor").addEventListener("click", openEditor);
      window.Setzer.onEditorStolen(handleStolen);
    }
  }

  // ============================================================
  //  EDITOR
  // ============================================================
  function buildEditorShell() {
    if (document.querySelector(".editor")) return;
    var backdrop = el("div", { class: "editor-backdrop" });
    var editor = el("div", { class: "editor" });
    editor.innerHTML =
      '<div class="editor-head"><h3>Inhalte bearbeiten</h3><button class="close" aria-label="Schließen">&times;</button></div>' +
      '<div class="editor-body"></div>' +
      '<div class="editor-foot">' +
        '<button class="btn btn-primary" data-act="save">Veröffentlichen</button>' +
        '<button class="btn btn-ghost" data-act="reset">Verwerfen</button>' +
      '</div>';
    document.body.appendChild(backdrop);
    document.body.appendChild(editor);
    backdrop.addEventListener("click", closeEditor);
    editor.querySelector(".close").addEventListener("click", closeEditor);
    editor.querySelector('[data-act="save"]').addEventListener("click", function () {
      render(); // optimistic preview
      var btn = editor.querySelector('[data-act="save"]');
      btn.disabled = true;
      var files = [{ path: CONTENT_URL, content: JSON.stringify(data, null, 2) + "\n" }];
      Object.keys(pendingImages).forEach(function (p) { files.push({ path: p, content: pendingImages[p] }); });
      window.Setzer.publish(files).then(function (res) {
        clearPendingImages();
        toast("Veröffentlicht — in ~1 Min. live" + (res && res.commit ? " (" + String(res.commit).slice(0, 7) + ")" : ""));
      }).catch(function (e) {
        if (e.conflict) {
          // Setzer offloaded the edit to a branch and reverted to the published
          // version — reload it, and offer the GitHub merge link.
          load().then(function () { render(); buildEditorBody(currentTab); });
          toast(e.message, { url: e.conflict.url });
        } else {
          toast("Veröffentlichen fehlgeschlagen: " + e.message + " (läuft Setzer?)");
        }
      }).then(function () { btn.disabled = false; });
    });
    editor.querySelector('[data-act="reset"]').addEventListener("click", function () {
      if (confirm("Ungespeicherte Änderungen verwerfen und neu laden?")) {
        load().then(function () { render(); buildEditorBody(currentTab); toast("Neu geladen"); })
              .catch(function (e) { toast("Neu laden fehlgeschlagen: " + e.message); });
      }
    });
  }

  var currentTab = "termine";
  var TABS = [
    { id: "termine", label: "Termine" },
    { id: "programm", label: "Programm" },
    { id: "stimmen", label: "Stimmen" },
    { id: "texte", label: "Texte" },
    { id: "bilder", label: "Bilder" },
    { id: "kontakt", label: "Kontakt" },
    { id: "impressum", label: "Impressum" }
  ];

  function buildEditorBody(tab) {
    currentTab = tab;
    var body = document.querySelector(".editor-body");
    var tabs = '<div class="ed-tabs">' + TABS.map(function (t) {
      return '<button class="ed-tab' + (t.id === tab ? " active" : "") + '" data-tab="' + t.id + '">' + t.label + '</button>';
    }).join("") + '</div>';
    body.innerHTML = tabs + '<div class="ed-content"></div>';
    body.querySelectorAll(".ed-tab").forEach(function (b) {
      b.addEventListener("click", function () { buildEditorBody(b.getAttribute("data-tab")); });
    });
    var c = body.querySelector(".ed-content");
    if (tab === "termine") buildTermineEditor(c);
    else if (tab === "programm") buildListEditor(c, data.programm.items, ["title", "text"], { title: "Titel", text: "Beschreibung" }, "Programmpunkt", "Wiener Lieder");
    else if (tab === "stimmen") buildListEditor(c, data.stimmen.quotes, ["text", "author"], { text: "Zitat", author: "Name" }, "Stimme", "");
    else if (tab === "texte") buildTexteEditor(c);
    else if (tab === "bilder") buildBilderEditor(c);
    else if (tab === "kontakt") buildKontaktEditor(c);
    else if (tab === "impressum") buildImpressumEditor(c);
  }

  function fieldRow(label, value, multiline, onInput) {
    var wrap = el("div", { class: "ed-field" });
    wrap.appendChild(el("label", { text: label }));
    var input = multiline ? el("textarea") : el("input");
    input.value = value == null ? "" : value;
    input.addEventListener("input", function () { onInput(input.value); });
    wrap.appendChild(input);
    return wrap;
  }

  function buildTermineEditor(c) {
    c.innerHTML = '<p class="ed-hint">Termine hinzufügen, bearbeiten oder entfernen. Datum im Format JJJJ-MM-TT. „Veröffentlichen“ speichert die Änderungen und stellt sie online.</p>';
    var list = el("div");
    data.termine.events.forEach(function (e, i) {
      var g = el("div", { class: "ed-group" });
      var rm = el("button", { class: "ed-remove", text: "×" });
      rm.addEventListener("click", function () { data.termine.events.splice(i, 1); buildTermineEditor(c); });
      g.appendChild(rm);
      g.appendChild(fieldRow("Titel", e.title, false, function (v) { e.title = v; }));
      g.appendChild(fieldRow("Datum (JJJJ-MM-TT)", e.date, false, function (v) { e.date = v; }));
      g.appendChild(fieldRow("Uhrzeit", e.time, false, function (v) { e.time = v; }));
      g.appendChild(fieldRow("Ort / Venue", e.venue, false, function (v) { e.venue = v; }));
      g.appendChild(fieldRow("Stadt", e.city, false, function (v) { e.city = v; }));
      g.appendChild(fieldRow("Adresse", e.address, false, function (v) { e.address = v; }));
      g.appendChild(fieldRow("Ticket-Link (optional)", e.ticket, false, function (v) { e.ticket = v; }));
      list.appendChild(g);
    });
    c.appendChild(list);
    var add = el("button", { class: "ed-add", text: "+ Termin hinzufügen" });
    add.addEventListener("click", function () {
      data.termine.events.push({ date: "", time: "20:00", title: "", venue: "", city: "Berlin", address: "", ticket: "" });
      buildTermineEditor(c);
    });
    c.appendChild(add);
  }

  function buildListEditor(c, arr, keys, labels, noun, sampleTitle) {
    c.innerHTML = '<p class="ed-hint">' + noun + 'e hinzufügen, bearbeiten oder entfernen.</p>';
    var list = el("div");
    arr.forEach(function (item, i) {
      var g = el("div", { class: "ed-group" });
      var rm = el("button", { class: "ed-remove", text: "×" });
      rm.addEventListener("click", function () { arr.splice(i, 1); buildListEditor(c, arr, keys, labels, noun, sampleTitle); });
      g.appendChild(rm);
      keys.forEach(function (k) {
        g.appendChild(fieldRow(labels[k], item[k], k === "text", function (v) { item[k] = v; }));
      });
      list.appendChild(g);
    });
    c.appendChild(list);
    var add = el("button", { class: "ed-add", text: "+ " + noun + " hinzufügen" });
    add.addEventListener("click", function () {
      var obj = {}; keys.forEach(function (k) { obj[k] = k === "title" ? sampleTitle : ""; });
      arr.push(obj);
      buildListEditor(c, arr, keys, labels, noun, sampleTitle);
    });
    c.appendChild(add);
  }

  function buildTexteEditor(c) {
    c.innerHTML = '<p class="ed-hint">Allgemeine Texte für Startseite und Vorstellung.</p>';
    c.appendChild(fieldRow("Tagline", data.site.tagline, false, function (v) { data.site.tagline = v; data.hero.subtitle = v; }));
    c.appendChild(fieldRow("Hero — Kicker", data.hero.kicker, false, function (v) { data.hero.kicker = v; }));
    c.appendChild(fieldRow("Hero — Einleitung", data.hero.intro, true, function (v) { data.hero.intro = v; }));
    c.appendChild(fieldRow("Über — Titel", data.about.title, false, function (v) { data.about.title = v; }));
    data.about.paragraphs.forEach(function (p, i) {
      c.appendChild(fieldRow("Über — Absatz " + (i + 1), p, true, function (v) { data.about.paragraphs[i] = v; }));
    });
  }

  function buildKontaktEditor(c) {
    c.innerHTML = '<p class="ed-hint">Kontaktdaten und Booking-Einstellungen.</p>';
    var k = data.kontakt;
    c.appendChild(fieldRow("Einleitung", k.intro, true, function (v) { k.intro = v; }));
    c.appendChild(fieldRow("E-Mail", k.email, false, function (v) { k.email = v; }));
    c.appendChild(fieldRow("Telefon", k.phone, false, function (v) { k.phone = v; }));
    c.appendChild(fieldRow("Ort", k.location, false, function (v) { k.location = v; }));
    c.appendChild(fieldRow("Formular-Endpoint (optional)", k.formAction, false, function (v) { k.formAction = v; }));
  }

  function buildImpressumEditor(c) {
    c.innerHTML = '<p class="ed-hint">Pflichtangaben nach § 5 DDG. Diese Daten erscheinen auf der Impressum-Seite. Die E-Mail wird aus dem Tab „Kontakt“ übernommen.</p>';
    var im = data.impressum || (data.impressum = { name: "", street: "", city: "", phone: "" });
    c.appendChild(fieldRow("Name (verantwortliche Person)", im.name, false, function (v) { im.name = v; }));
    c.appendChild(fieldRow("Straße und Hausnummer", im.street, false, function (v) { im.street = v; }));
    c.appendChild(fieldRow("PLZ und Ort", im.city, false, function (v) { im.city = v; }));
    c.appendChild(fieldRow("Telefon (optional)", im.phone, false, function (v) { im.phone = v; }));
  }

  function openEditor() {
    if (!(window.Setzer && window.Setzer.beginEdit)) { doOpenEditor(); return; }
    window.Setzer.beginEdit(doOpenEditor, function (steal) {
      if (confirm("Ein Editor ist bereits in einem anderen Tab geöffnet.\n\nTrotzdem hier übernehmen? Nicht gespeicherte Änderungen im anderen Tab gehen verloren.")) steal();
    });
  }
  function doOpenEditor() {
    buildEditorShell();
    buildEditorBody(currentTab);
    document.querySelector(".editor-backdrop").classList.add("open");
    document.querySelector(".editor").classList.add("open");
  }
  function closeEditor() {
    var b = document.querySelector(".editor-backdrop"), e = document.querySelector(".editor");
    if (b) b.classList.remove("open");
    if (e) e.classList.remove("open");
    if (window.Setzer && window.Setzer.endEdit) window.Setzer.endEdit();
  }
  // Another tab took over editing — stand down here.
  function handleStolen() {
    closeEditor();
    toast("Bearbeitung in einem anderen Tab übernommen.");
  }

  // ============================================================
  //  IMAGES — pick, crop, hold for the next publish
  // ============================================================
  var pendingImages = {}; // path -> Blob (with ._url for preview), sent on publish

  // Per-slot geometry: crop aspect (w/h), output max width, preview class.
  var IMG_SPECS = {
    hero:    { aspect: 4 / 5, maxW: 900,  cls: "" },
    member:  { aspect: 1,     maxW: 500,  cls: "square" },
    gallery: { aspect: 4 / 3, maxW: 1100, cls: "wide" }
  };

  function clearPendingImages() {
    Object.keys(pendingImages).forEach(function (p) {
      if (pendingImages[p]._url) URL.revokeObjectURL(pendingImages[p]._url);
    });
    pendingImages = {};
  }

  // imageControl builds a DOM widget for one image slot. `image` is the {src,alt}
  // object (mutated in place); `path` is the web-relative file path; `spec` is
  // from IMG_SPECS. On crop it stores the blob in pendingImages[path] and points
  // image.src at the path (cache-busted).
  function imageControl(image, path, spec) {
    var preview = el("div");
    function draw() {
      var url = (pendingImages[path] && pendingImages[path]._url) || image.src || "";
      preview.innerHTML = url
        ? '<img class="ed-thumb ' + spec.cls + '" src="' + esc(url) + '" alt="">'
        : '<div class="ed-thumb ' + spec.cls + ' ph"><span>' + esc(image.alt || "Kein Bild") + '</span></div>';
    }
    draw();
    var input = el("input", { type: "file", accept: "image/*", style: "display:none" });
    var pick = el("button", { class: "btn btn-ghost ed-pick", text: image.src ? "Bild ersetzen" : "Bild wählen" });
    pick.addEventListener("click", function () { input.click(); });
    input.addEventListener("change", function () {
      var file = input.files && input.files[0];
      input.value = "";
      if (!file) return;
      openCropper(file, spec.aspect, spec.maxW, function (blob) {
        if (pendingImages[path] && pendingImages[path]._url) URL.revokeObjectURL(pendingImages[path]._url);
        blob._url = URL.createObjectURL(blob);
        pendingImages[path] = blob;
        image.src = path + "?v=" + Date.now(); // cache-bust; the committed file is `path`
        pick.textContent = "Bild ersetzen";
        draw();
      });
    });
    return el("div", { class: "ed-image" }, [preview, pick, input]);
  }

  // openCropper shows a drag + zoom crop modal at the target aspect, then exports
  // a WebP Blob at maxW. Pure canvas, no dependency.
  function openCropper(file, aspect, maxW, onDone) {
    var url = URL.createObjectURL(file);
    var img = new Image();
    img.onload = function () {
      var fw = Math.min(360, window.innerWidth - 90);
      var fh = Math.round(fw / aspect);
      var minScale = Math.max(fw / img.naturalWidth, fh / img.naturalHeight);
      var scale = minScale;
      var ox = (fw - img.naturalWidth * scale) / 2;
      var oy = (fh - img.naturalHeight * scale) / 2;

      var imgEl = el("img", { src: url });
      var frame = el("div", { class: "cropper-frame" }, [imgEl]);
      frame.style.width = fw + "px"; frame.style.height = fh + "px";
      var zoom = el("input", { type: "range", min: "1", max: "4", step: "0.01", value: "1" });
      var cancel = el("button", { class: "btn btn-ghost", text: "Abbrechen" });
      var ok = el("button", { class: "btn btn-primary", text: "Übernehmen" });
      var modal = el("div", { class: "cropper" }, [
        el("div", { class: "cropper-box" }, [
          frame,
          el("div", { class: "cropper-ctrls" }, [el("span", { text: "Zoom" }), zoom]),
          el("div", { class: "cropper-actions" }, [cancel, ok])
        ])
      ]);
      document.body.appendChild(modal);

      function apply() {
        var w = img.naturalWidth * scale, h = img.naturalHeight * scale;
        ox = Math.min(0, Math.max(fw - w, ox));
        oy = Math.min(0, Math.max(fh - h, oy));
        imgEl.style.transform = "translate(" + ox + "px," + oy + "px) scale(" + scale + ")";
      }
      apply();

      zoom.addEventListener("input", function () {
        var prev = scale;
        scale = minScale * parseFloat(zoom.value);
        ox = fw / 2 - (fw / 2 - ox) * (scale / prev);
        oy = fh / 2 - (fh / 2 - oy) * (scale / prev);
        apply();
      });

      var drag = null;
      frame.addEventListener("pointerdown", function (e) {
        drag = { x: e.clientX, y: e.clientY, ox: ox, oy: oy };
        frame.classList.add("grabbing");
        frame.setPointerCapture(e.pointerId);
      });
      frame.addEventListener("pointermove", function (e) {
        if (!drag) return;
        ox = drag.ox + (e.clientX - drag.x);
        oy = drag.oy + (e.clientY - drag.y);
        apply();
      });
      frame.addEventListener("pointerup", function () { drag = null; frame.classList.remove("grabbing"); });

      function close() { document.body.removeChild(modal); URL.revokeObjectURL(url); }
      cancel.addEventListener("click", close);
      ok.addEventListener("click", function () {
        var th = Math.round(maxW / aspect);
        var canvas = el("canvas");
        canvas.width = maxW; canvas.height = th;
        canvas.getContext("2d").drawImage(img, -ox / scale, -oy / scale, fw / scale, fh / scale, 0, 0, maxW, th);
        canvas.toBlob(function (blob) { close(); if (blob) onDone(blob); }, "image/webp", 0.82);
      });
    };
    img.src = url;
  }

  function buildBilderEditor(c) {
    c.innerHTML = '<p class="ed-hint">Fotos hochladen und zuschneiden. „Veröffentlichen“ stellt sie online. Tipp: Querformat-Fotos wirken in der Galerie am besten.</p>';
    c.appendChild(el("h4", { text: "Bühnenbild" }));
    c.appendChild(imageControl(data.hero.image, "img/hero.webp", IMG_SPECS.hero));
    c.appendChild(el("h4", { text: "Das Duo" }));
    data.about.members.forEach(function (m, i) {
      c.appendChild(el("div", { class: "ed-sub", text: m.name }));
      c.appendChild(imageControl(m.image, "img/member-" + (i + 1) + ".webp", IMG_SPECS.member));
    });
    c.appendChild(el("h4", { text: "Galerie" }));
    data.galerie.images.forEach(function (im, i) {
      c.appendChild(imageControl(im, "img/galerie-" + (i + 1) + ".webp", IMG_SPECS.gallery));
    });
  }

  // -- toast
  var toastTimer;
  function toast(msg, opts) {
    opts = opts || {};
    var t = document.getElementById("toast");
    if (!t) { t = el("div", { class: "toast", id: "toast" }); document.body.appendChild(t); }
    t.onclick = null; t.style.cursor = "";
    if (opts.url) {
      t.textContent = msg + "  ↗ auf GitHub zusammenführen";
      t.style.cursor = "pointer";
      t.onclick = function () { window.open(opts.url, "_blank", "noopener"); };
    } else {
      t.textContent = msg;
    }
    t.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.classList.remove("show"); }, opts.url ? 12000 : 3200);
  }

  // ============================================================
  load().then(function () {
    render();
    if (location.hash === "#edit") openEditor();
  }).catch(function (e) {
    document.body.innerHTML = '<p style="padding:48px;font-family:sans-serif;color:#7a2d28">' +
      'Inhalt konnte nicht geladen werden (' + esc(e.message) + ').</p>';
  });
  window.addEventListener("hashchange", function () { if (location.hash === "#edit") openEditor(); });
})();
