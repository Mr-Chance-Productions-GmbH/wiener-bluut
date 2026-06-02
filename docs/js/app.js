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
  // Setzer's local save endpoint (only present when the Setzer tool is running).
  var SAVE_URL = "/__save";
  var data = {};

  function load() {
    return fetch(CONTENT_URL, { cache: "no-store" }).then(function (r) {
      if (!r.ok) throw new Error("HTTP " + r.status);
      return r.json();
    }).then(function (json) { data = json; });
  }

  // publish sends the current content to the local Setzer tool, which commits
  // and pushes it. Resolves with the server's JSON response.
  function publish() {
    return fetch(SAVE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    }).then(function (r) {
      return r.json().catch(function () { return {}; }).then(function (body) {
        if (r.status === 409) throw new Error("conflict");
        if (!r.ok) throw new Error((body && body.error) || ("HTTP " + r.status));
        return body;
      });
    });
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
        '<div class="hero-portrait ph on-dark"><span class="ph-label">' + esc(h.image) + '</span></div>' +
      '</div>';
  }

  function renderAbout() {
    var a = data.about;
    var paras = a.paragraphs.map(function (p) { return '<p>' + esc(p) + '</p>'; }).join("");
    var members = a.members.map(function (m) {
      return '<div class="member">' + ph(m.image) +
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
    var imgs = g.images.map(function (label) { return ph(label); }).join("");
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
    document.querySelector(".site-footer .wrap").innerHTML =
      '<div><div class="f-brand">' + uu(data.site.name) + '</div><div class="f-note">' + esc(f.note) + '</div>' +
      '<button class="f-edit" id="open-editor">Inhalte bearbeiten</button></div>' +
      '<div class="f-links">' + links + '</div>';
    document.getElementById("open-editor").addEventListener("click", openEditor);
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
      publish().then(function (res) {
        toast("Veröffentlicht — in ~1 Min. live" + (res && res.commit ? " (" + String(res.commit).slice(0, 7) + ")" : ""));
      }).catch(function (e) {
        if (e.message === "conflict") toast("Inhalt wurde zwischenzeitlich geändert — bitte neu laden.");
        else toast("Veröffentlichen fehlgeschlagen: " + e.message + " (läuft Setzer?)");
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
    { id: "kontakt", label: "Kontakt" }
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
    else if (tab === "kontakt") buildKontaktEditor(c);
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

  function openEditor() {
    buildEditorShell();
    buildEditorBody(currentTab);
    document.querySelector(".editor-backdrop").classList.add("open");
    document.querySelector(".editor").classList.add("open");
  }
  function closeEditor() {
    var b = document.querySelector(".editor-backdrop"), e = document.querySelector(".editor");
    if (b) b.classList.remove("open");
    if (e) e.classList.remove("open");
  }

  // -- toast
  var toastTimer;
  function toast(msg) {
    var t = document.getElementById("toast");
    if (!t) { t = el("div", { class: "toast", id: "toast" }); document.body.appendChild(t); }
    t.textContent = msg; t.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.classList.remove("show"); }, 3200);
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
