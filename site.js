/* SERVI TRAILER – estilo tipo Romarco (sin copiar código/activos del sitio de referencia) */

(function(){
  const $$ = (sel, root=document) => Array.from(root.querySelectorAll(sel));
  const $ = (sel, root=document) => root.querySelector(sel);

  // Mobile nav
  const hamb = $("#hamburger");
  const mob = $("#mobileNav");
  if (hamb && mob){
    hamb.addEventListener("click", () => {
      mob.classList.toggle("open");
      hamb.setAttribute("aria-expanded", mob.classList.contains("open") ? "true" : "false");
    });
  }

  // Mark active nav (simple)
  const path = (location.pathname || "").toLowerCase();
  $$(".nav a, .mobileNav a").forEach(a => {
    const href = (a.getAttribute("href") || "").toLowerCase();
    if (!href || href === "#") return;
    // active if ends with same folder or is index page
    const normalized = href.replace("./","").replace("../","").replace("../../","").replace("index.html","");
    const pNorm = path.replace("index.html","");
    if (normalized && pNorm.endsWith(normalized.replace(/^\//,""))){
      a.classList.add("active");
    }
  });

  // Tabs in product detail
  $$(".productDetail").forEach(block => {
    const btns = $$(".tabBtn", block);
    const lists = $$(".pdList", block);
    const setTab = (name) => {
      btns.forEach(b => b.classList.toggle("active", b.dataset.tab === name));
      lists.forEach(l => {
        const is = l.dataset.list === name;
        l.style.display = is ? "block" : "none";
      });
    };
    btns.forEach(b => b.addEventListener("click", () => setTab(b.dataset.tab)));
    // default
    const first = btns[0]?.dataset?.tab;
    if (first) setTab(first);
  });

  // Accessories collapsible
  $$(".multiSelect").forEach(ms => {
    const toggle = $("button[data-acc-toggle]", ms);
    const grid = $(".accGrid", ms);
    if (toggle && grid){
      toggle.addEventListener("click", () => {
        const open = grid.style.display !== "none";
        grid.style.display = open ? "none" : "grid";
        toggle.textContent = open ? "Ver opciones" : "Ocultar";
      });
      // Start open on desktop, collapsed on mobile
      if (window.matchMedia("(max-width: 720px)").matches){
        grid.style.display = "none";
        toggle.textContent = "Ver opciones";
      }
    }
  });

  // Quote storage
  const QUOTE_KEY = "servi_trailer_quote_v1";
  const readAccessories = (productId) => {
    return $$(`input[data-acc-for="${productId}"]:checked`).map(i => i.value);
  };
  const saveQuote = (payload) => {
    try{ localStorage.setItem(QUOTE_KEY, JSON.stringify(payload)); }catch(e){}
  };
  const loadQuote = () => {
    try{ return JSON.parse(localStorage.getItem(QUOTE_KEY) || "null"); }catch(e){ return null; }
  };

  // Handle "Cotiza" buttons in product pages
  $$( "[data-quote]" ).forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      const productId = btn.dataset.quote;
      const productName = btn.dataset.productName || productId;
      const category = btn.dataset.category || "";
      const accessories = readAccessories(productId);
      const measures = btn.dataset.measures || "";
      saveQuote({
        productId, productName, category, accessories, measures,
        ts: Date.now()
      });
      const href = btn.getAttribute("href") || "";
      window.location.href = href;
    });
  });

  // Lightbox
  const lb = $("#lightbox");
  const lbImg = lb ? $("#lightboxImg", lb) : null;
  const lbClose = lb ? $("#lbClose", lb) : null;
  const lbPrev = lb ? $("#lbPrev", lb) : null;
  const lbNext = lb ? $("#lbNext", lb) : null;

  const galleries = $$(".galleryGrid");
  galleries.forEach(g => {
    const thumbs = $$(".thumb", g);
    if (!thumbs.length) return;

    let idx = 0;
    const sources = thumbs.map(t => $("img", t)?.getAttribute("src")).filter(Boolean);

    const openAt = (i) => {
      if (!lb || !lbImg) return;
      idx = (i + sources.length) % sources.length;
      lbImg.src = sources[idx];
      lb.classList.add("open");
      document.body.style.overflow = "hidden";
    };
    thumbs.forEach((t, i) => t.addEventListener("click", () => openAt(i)));

    const close = () => {
      if (!lb) return;
      lb.classList.remove("open");
      document.body.style.overflow = "";
    };
    const step = (dir) => openAt(idx + dir);

    if (lbClose) lbClose.addEventListener("click", close);
    if (lbPrev) lbPrev.addEventListener("click", () => step(-1));
    if (lbNext) lbNext.addEventListener("click", () => step(1));
    if (lb){
      lb.addEventListener("click", (e) => {
        if (e.target.classList.contains("backdrop")) close();
      });
      window.addEventListener("keydown", (e) => {
        if (!lb.classList.contains("open")) return;
        if (e.key === "Escape") close();
        if (e.key === "ArrowLeft") step(-1);
        if (e.key === "ArrowRight") step(1);
      });
    }
  });

  // Cotizar page prefill
  const quoteBox = $("#quoteSummary");
  const quoteForm = $("#quoteForm");
  if (quoteBox || quoteForm){
    const q = loadQuote();
    if (q){
      const acc = (q.accessories && q.accessories.length) ? q.accessories.join(", ") : "Ninguno";
      if (quoteBox){
        quoteBox.innerHTML = `
          <strong>Producto:</strong> ${escapeHtml(q.productName)}<br/>
          <strong>Accesorios:</strong> ${escapeHtml(acc)}<br/>
          ${q.measures ? `<strong>Medidas:</strong> ${escapeHtml(q.measures)}<br/>` : ``}
          <span class="smallMuted">Puedes completar tus datos y enviar la solicitud por WhatsApp.</span>
        `;
      }
      const prodSelect = $("#producto");
      if (prodSelect){
        // set option if exists
        const opt = Array.from(prodSelect.options).find(o => o.value === q.productId);
        if (opt) prodSelect.value = q.productId;
      }
    }
  }

  // WhatsApp send
  const waBtn = $("#sendWhatsApp");
  if (waBtn){
    waBtn.addEventListener("click", (e) => {
      e.preventDefault();
      const q = loadQuote();
      const name = ($("#nombre")?.value || "").trim();
      const company = ($("#empresa")?.value || "").trim();
      const city = ($("#ciudad")?.value || "").trim();
      const phone = ($("#telefono")?.value || "").trim();
      const email = ($("#email")?.value || "").trim();
      const notes = ($("#mensaje")?.value || "").trim();

      const prod = q?.productName || ($("#producto option:checked")?.textContent || "Producto");
      const acc = q?.accessories?.length ? q.accessories.join(", ") : "Ninguno";
      const measures = q?.measures ? `\n• Medidas: ${q.measures}` : "";

      const text =
`Hola SERVI TRAILER 👋
Quiero cotizar:

• Producto: ${prod}
• Accesorios: ${acc}${measures}

Datos:
• Nombre: ${name || "-"}
• Empresa: ${company || "-"}
• Ciudad: ${city || "-"}
• Teléfono: ${phone || "-"}
• Email: ${email || "-"}
• Detalles: ${notes || "-"}`;

      const raw = waBtn.dataset.wa || "573216480178";
      const url = `https://wa.me/${raw}?text=${encodeURIComponent(text)}`;
      window.open(url, "_blank");
    });
  }

  function escapeHtml(str){
    return String(str)
      .replaceAll("&","&amp;")
      .replaceAll("<","&lt;")
      .replaceAll(">","&gt;")
      .replaceAll('"',"&quot;")
      .replaceAll("'","&#039;");
  }
})();


// Set blurred background for product media so images look consistent (no cropping + no empty space)
function setPdMediaBackgrounds(){
  document.querySelectorAll(".pdMedia").forEach(media => {
    const img = media.querySelector("img");
    if (!img) return;
    const src = img.getAttribute("src");
    if (!src) return;
    media.style.setProperty("--pd-bg", `url('${src}')`);
  });
}

window.addEventListener('load', setPdMediaBackgrounds);
