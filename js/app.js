(function () {
  "use strict";

  var data = window.GLOW_UP;
  if (!data) return;
  var contact = data.contact;
  var products = data.products;
  var categories = data.categories;

  var money = new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 });
  var catLabel = {};
  categories.forEach(function (c) { catLabel[c.id] = c.label; });

  var $ = function (id) { return document.getElementById(id); };
  var grid = $("grid");
  var state = { category: "all", sort: "featured" };

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  // wa.me link; without a number WhatsApp lets the visitor pick the contact
  function waUrl(message) {
    var base = contact.whatsapp ? "https://wa.me/" + contact.whatsapp : "https://wa.me/";
    return base + "?text=" + encodeURIComponent(message);
  }

  function discount(p) {
    return p.oldPrice ? Math.round((1 - p.price / p.oldPrice) * 100) : 0;
  }

  /* ---------- Static bits from data ---------- */
  $("strip-installments").textContent = contact.installments + " cuotas sin interés";
  $("c-hours").textContent = contact.hours;
  $("c-address").textContent = contact.address;
  $("c-wa").href = waUrl("Hola Glow Up! Quiero coordinar una visita al showroom.");
  var ig = $("c-ig");
  ig.href = contact.instagram;
  ig.textContent = contact.instagramHandle;

  /* ---------- Filters ---------- */
  var chipBox = $("chips");
  function buildChips() {
    var items = [{ id: "all", label: "Todo" }].concat(categories);
    items.forEach(function (c) {
      var b = el("button", "chip", c.label);
      b.type = "button";
      b.dataset.cat = c.id;
      b.setAttribute("aria-pressed", String(c.id === state.category));
      chipBox.appendChild(b);
    });
  }
  chipBox.addEventListener("click", function (e) {
    var b = e.target.closest(".chip");
    if (!b) return;
    state.category = b.dataset.cat;
    Array.prototype.forEach.call(chipBox.children, function (c) {
      c.setAttribute("aria-pressed", String(c === b));
    });
    renderGrid(true);
  });
  $("sort").addEventListener("change", function (e) {
    state.sort = e.target.value;
    renderGrid(true);
  });

  /* ---------- Grid ---------- */
  function visibleProducts() {
    var list = products.filter(function (p) {
      return state.category === "all" || p.category === state.category;
    });
    if (state.sort === "asc") list = list.slice().sort(function (a, b) { return a.price - b.price; });
    if (state.sort === "desc") list = list.slice().sort(function (a, b) { return b.price - a.price; });
    return list;
  }

  function priceNode(p) {
    var wrap = el("p", "price", money.format(p.price));
    if (p.oldPrice) wrap.appendChild(el("s", null, money.format(p.oldPrice)));
    return wrap;
  }

  function buildCard(p, animate) {
    var card = el("article", "card" + (animate ? " is-in" : ""));

    var frame = el("div", "frame");
    var img = el("img");
    img.src = p.image;
    img.alt = p.imageAlt;
    img.width = 900;
    img.height = 1125;
    img.loading = "lazy";
    img.decoding = "async";
    frame.appendChild(img);
    if (p.badge) {
      var label = p.badge;
      var isSale = p.badge === "Oferta";
      if (isSale && p.oldPrice) label += " −" + discount(p) + "%";
      frame.appendChild(el("span", "badge" + (isSale ? " badge-sale" : ""), label));
    }
    card.appendChild(frame);

    var body = el("div", "card-body");
    body.appendChild(el("p", "cat-label", catLabel[p.category] || p.category));
    var h = el("h3", null);
    var btn = el("button", "card-name", p.name);
    btn.type = "button";
    btn.addEventListener("click", function () { openProduct(p); });
    h.appendChild(btn);
    body.appendChild(h);
    body.appendChild(el("p", "card-meta", p.fabric + " · " + p.fit));
    body.appendChild(priceNode(p));

    var foot = el("div", "card-foot");
    var sw = el("div", "swatches");
    p.colors.forEach(function (c) {
      var s = el("span", "swatch");
      s.style.backgroundColor = c.hex;
      s.title = c.name;
      sw.appendChild(s);
    });
    foot.appendChild(sw);
    foot.appendChild(el("span", "sizes", p.sizes.join(" · ")));
    body.appendChild(foot);

    card.appendChild(body);
    return card;
  }

  function renderGrid(animate) {
    var list = visibleProducts();
    var frag = document.createDocumentFragment();
    list.forEach(function (p) { frag.appendChild(buildCard(p, animate)); });
    grid.replaceChildren(frag);
    $("count").textContent = list.length + (list.length === 1 ? " prenda" : " prendas");
  }

  /* ---------- Product dialog ---------- */
  var dlg = $("pd");
  var current = null;
  var sel = { color: null, size: null };

  function updateWa() {
    var p = current;
    var msg = "Hola Glow Up! Me interesa: " + p.name +
      " · Color: " + sel.color.name +
      " · Talle: " + (sel.size || "a definir") +
      " · " + money.format(p.price) + ". ¿Está disponible?";
    $("pd-wa").href = waUrl(msg);
  }

  function renderColors(p) {
    var box = $("pd-colors");
    box.replaceChildren();
    function setLabel() {
      var l = $("pd-color-label");
      l.textContent = "Color: ";
      l.appendChild(el("span", null, sel.color.name));
    }
    p.colors.forEach(function (c) {
      var b = el("button", "swatch-btn");
      b.type = "button";
      b.setAttribute("aria-label", c.name);
      b.setAttribute("aria-pressed", String(c === sel.color));
      b.appendChild(el("i"));
      b.firstChild.style.backgroundColor = c.hex;
      b.addEventListener("click", function () {
        sel.color = c;
        Array.prototype.forEach.call(box.children, function (n) {
          n.setAttribute("aria-pressed", String(n === b));
        });
        setLabel();
        updateWa();
      });
      box.appendChild(b);
    });
    setLabel();
  }

  function renderSizes(p) {
    var box = $("pd-sizes");
    box.replaceChildren();
    if (p.sizes.length === 1 && p.sizes[0] === "Único") {
      sel.size = "Único";
      box.appendChild(el("span", "size-single", "Talle único"));
      return;
    }
    p.sizes.forEach(function (s) {
      var b = el("button", "chip", s);
      b.type = "button";
      b.setAttribute("aria-pressed", "false");
      b.addEventListener("click", function () {
        var same = sel.size === s;
        sel.size = same ? null : s; // second tap clears
        Array.prototype.forEach.call(box.children, function (n) {
          n.setAttribute("aria-pressed", String(!same && n === b));
        });
        updateWa();
      });
      box.appendChild(b);
    });
  }

  function renderSpecs(p) {
    var specs = $("pd-specs");
    specs.replaceChildren();
    [
      ["Tela", p.fabric + " — " + p.composition],
      [p.category === "accesorios" ? "Medidas" : "Calce", p.fit],
      ["Detalles", p.details.join(" · ")],
      ["Cuidados", p.care]
    ].forEach(function (row) {
      var d = el("div");
      d.appendChild(el("dt", null, row[0]));
      d.appendChild(el("dd", null, row[1]));
      specs.appendChild(d);
    });
  }

  function fillDialog(p) {
    current = p;
    sel.color = p.colors[0];
    sel.size = null;
    var img = $("pd-img");
    img.src = p.image;
    img.alt = p.imageAlt;
    $("pd-cat").textContent = catLabel[p.category] || p.category;
    $("pd-name").textContent = p.name;
    var price = $("pd-price");
    price.replaceChildren(document.createTextNode(money.format(p.price)));
    if (p.oldPrice) price.appendChild(el("s", null, money.format(p.oldPrice)));
    var n = contact.installments;
    $("pd-inst").textContent = "o " + n + " cuotas sin interés de " + money.format(Math.round(p.price / n));
    $("pd-desc").textContent = p.description;
    renderColors(p);
    renderSizes(p);
    renderSpecs(p);
    updateWa();
    $("pd").querySelector(".pd-scroll").scrollTop = 0;
    var body = dlg.querySelector(".pd-body");
    if (body) body.scrollTop = 0;
  }

  function openProduct(p) {
    fillDialog(p);
    if (!dlg.open) dlg.showModal();
    history.replaceState(null, "", "#p-" + p.id);
  }

  function clearHash() {
    if (/^#p-/.test(location.hash)) {
      history.replaceState(null, "", location.pathname + location.search);
    }
  }

  $("pd-close").addEventListener("click", function () { dlg.close(); });
  dlg.addEventListener("click", function (e) {
    if (e.target === dlg) dlg.close(); // click landed on the backdrop
  });
  dlg.addEventListener("close", clearHash);

  function openFromHash() {
    var m = /^#p-(.+)$/.exec(location.hash);
    if (!m) return;
    var id = decodeURIComponent(m[1]);
    var p = products.filter(function (x) { return x.id === id; })[0];
    if (p) openProduct(p);
  }
  window.addEventListener("hashchange", function () {
    if (/^#p-/.test(location.hash)) openFromHash();
  });

  /* ---------- Init ---------- */
  buildChips();
  renderGrid(false);
  openFromHash();
})();
