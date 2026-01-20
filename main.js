// ===== Helpers =====
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

function escapeHtml(str){
  return String(str).replace(/[&<>"']/g, s => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"
  }[s]));
}

// ===== Mobile Nav =====
const navToggle = $("#navToggle");
const navMenu = $("#navMenu");

if (navToggle && navMenu){
  navToggle.addEventListener("click", () => {
    const open = navMenu.classList.toggle("is-open");
    navToggle.setAttribute("aria-expanded", String(open));
  });

  // Close menu when clicking a link
  $$(".nav__link, .nav__cta", navMenu).forEach(a => {
    a.addEventListener("click", () => {
      navMenu.classList.remove("is-open");
      navToggle.setAttribute("aria-expanded", "false");
    });
  });
}

// ===== Data =====
const WHATSAPP_NUMBER = "573216480178"; // SERVI TRAILER (Colombia +57)
const COMPANY_LABEL = "SERVI TRAILER";

const products = [
  {
    id: "plataforma-fija",
    category: "plataformas",
    name: "Plataforma Fija",
    image: "assets/img/plataforma1.jpg",
    desc: "Solución robusta para carga general y logística. Configurable por aplicación.",
    tags: ["Robusta", "Modular", "Fácil mantenimiento"],
    accessories: [
      { name: "Cajas de herramienta", note: "Con soporte y tapa reforzada" },
      { name: "Anclajes adicionales", note: "Puntos extra de amarre" },
      { name: "Barandas laterales", note: "Removibles / fijas" },
      { name: "Piso antideslizante", note: "Según operación" }
    ],
    specs: {
      "Medidas": "Largo 12.60 m • Ancho 2.60 m",
      "Capacidad": "Según operación",
      "Acabado": "Pintura industrial"

    }
  },
  {
    id: "plataforma-portacont",
    category: "plataformas",
    name: "Plataforma Porta-Contenedor",
    image: "assets/img/plataforma2.jpg",
    desc: "Diseñada para operación logística. Configuración y anclajes según estándar.",
    tags: ["Anclajes", "Refuerzos", "Operación logística"],
    accessories: [
      { name: "Twistlocks", note: "Según estándar del contenedor" },
      { name: "Cajas de herramienta", note: "Con soporte y tapa" },
      { name: "Luces laterales", note: "Kit de iluminación (según alcance)" },
      { name: "Pintura especial", note: "Color corporativo" }
    ],
    specs: {
      "Medidas": "Base: Largo 12.60 m • Ancho 2.60 m (ajustable)",
      "Configuración": "20/40 ft (según proyecto)",
      "Anclajes": "Twistlocks (según aplique)"

    }
  },
  {
    id: "volco-batea",
    category: "volcos",
    name: "Volco Tipo Batea",
    image: "assets/img/volco1.jpg",
    desc: "Para agregados/obra: refuerzos, compuerta y volumen según operación.",
    tags: ["Alta exigencia", "Refuerzo", "Durabilidad"],
    accessories: [
      { name: "Compuerta reforzada", note: "Configuración según carga" },
      { name: "Lona / carpa", note: "Sistema de cubierta" },
      { name: "Refuerzos adicionales", note: "Para operación exigente" },
      { name: "Pintura especial", note: "Color corporativo" }
    ],
    specs: {
      "Medidas": "Largo 11.00 m • Ancho 2.60 m • Alto 1.60 m",
      "Volumen": "Según operación",
      "Acabado": "Pintura industrial"

    }
  },
  {
    id: "volco-agro",
    category: "volcos",
    name: "Volco Agrícola",
    image: "assets/img/volco2.jpg",
    desc: "Optimizado para descarga eficiente y disponibilidad en campo.",
    tags: ["Eficiente", "Ligero", "Servicio rápido"],
    accessories: [
      { name: "Compuerta rápida", note: "Optimiza descarga" },
      { name: "Lona / carpa", note: "Sistema de cubierta" },
      { name: "Escalera y pasamanos", note: "Acceso seguro" },
      { name: "Pintura especial", note: "Color corporativo" }
    ],
    specs: {
      "Medidas": "Largo 11.00 m • Ancho 2.60 m • Alto 1.60 m",
      "Volumen": "Según operación",
      "Protecciones": "Según carga"

    }
  },
  {
    id: "tanque-agua",
    category: "tanques",
    name: "Tanque para Agua",
    image: "assets/img/tanque1.jpg",
    desc: "Para riego, obra y abastecimiento. Accesorios según requerimiento.",
    tags: ["Accesorios", "Servicio", "A medida"],
    accessories: [
      { name: "Boca de inspección", note: "Según requerimiento" },
      { name: "Válvulas y conexiones", note: "Según especificación" },
      { name: "Sistema de bombeo", note: "Según alcance" },
      { name: "Gabinete", note: "Opcional" }
    ],
    specs: {
      "Capacidad": "Según requerimiento",
      "Válvulas": "Según especificación",
      "Seguridad": "Venteos/bridas (según aplique)"
    }
  },
  {
    id: "tanque-comb",
    category: "tanques",
    name: "Tanque para Combustible",
    image: "assets/img/tanque2.jpg",
    desc: "Solución para abastecimiento/transporte. Configurable por normativa aplicable.",
    tags: ["Seguridad", "Documentación", "A medida"],
    accessories: [
      { name: "Gabinete", note: "Mangueras y accesorios" },
      { name: "Medidor", note: "Según alcance" },
      { name: "Compartimentos", note: "Opcional" },
      { name: "Válvulas y conexiones", note: "Según especificación" }
    ],
    specs: {
      "Capacidad": "Según requerimiento",
      "Compartimentos": "Opcional",
      "Accesorios": "Gabinete, mangueras, medidor"
    }
  }
];

const gallery = [
  { title: "Plataforma (vista 1)", category: "plataformas", src: "assets/img/plataforma1.jpg" },
  { title: "Plataforma (vista 2)", category: "plataformas", src: "assets/img/plataforma2.jpg" },
  { title: "Plataforma (vista 3)", category: "plataformas", src: "assets/img/plataforma3.jpg" },
  { title: "Volco (vista 1)", category: "volcos", src: "assets/img/volco1.jpg" },
  { title: "Volco (vista 2)", category: "volcos", src: "assets/img/volco2.jpg" },
  { title: "Tanque (vista 1)", category: "tanques", src: "assets/img/tanque1.jpg" },
  { title: "Tanque (vista 2)", category: "tanques", src: "assets/img/tanque2.jpg" },
  { title: "Tanque (vista 3)", category: "tanques", src: "assets/img/tanque3.jpg" }
];

// ===== Render Products =====
const productGrid = $("#productGrid");

// ===== Product click delegation =====
let productDelegationBound = false;
function bindProductDelegation(){
  if (productDelegationBound) return;
  productDelegationBound = true;

  document.addEventListener("click", (e) => {
    const openBtn = e.target.closest && e.target.closest("[data-open-product]");
    if (openBtn){
      e.preventDefault();
      e.stopPropagation();
      openProductModal(openBtn.dataset.openProduct);
      return;
    }
    const quoteBtn = e.target.closest && e.target.closest("[data-quote-product]");
    if (quoteBtn){
      e.preventDefault();
      e.stopPropagation();
      jumpToQuote(quoteBtn.dataset.quoteProduct);
      return;
    }
  });
}

const filterButtons = $$(".chipBtn[data-filter]");
const quoteProductSelect = $("#quoteProduct");

function renderProducts(filter = "all"){
  if (!productGrid) return;
  const list = (filter === "all") ? products : products.filter(p => p.category === filter);

  productGrid.innerHTML = list.map(p => `
    <article class="card" data-category="${escapeHtml(p.category)}" data-card-product="${escapeHtml(p.id)}" role="button" tabindex="0">
      <div class="card__img" data-image="${p.image || ''}" role="img" aria-label="${escapeHtml(p.name)}"></div>
      <div class="card__body">
        <h3>${escapeHtml(p.name)}</h3>
        <p>${escapeHtml(p.desc)}</p>
        <div class="tagRow">
          ${p.tags.map(t => `<span class="tag">${escapeHtml(t)}</span>`).join("")}
        </div>
        <div class="card__actions">
          <button type="button" class="btn btn--ghost" data-open-product="${escapeHtml(p.id)}">Ver ficha</button>
          <button type="button" class="btn btn--primary" data-quote-product="${escapeHtml(p.id)}">Cotizar</button>
        </div>
      </div>
    </article>
  `).join("");
  // Aplicar fotos de fondo a las tarjetas (si existen)
  $$('.card__img[data-image]', productGrid).forEach(el => {
    const src = el.dataset.image;
    if (!src) return;
    el.style.backgroundImage = `linear-gradient(135deg, rgba(255,255,255,.06), rgba(255,255,255,.02)), url('${src}')`;
  });
  // Delegate: click/keyboard on card opens product modal
  if (productGrid && productGrid.dataset.delegateBound !== "1"){
    productGrid.dataset.delegateBound = "1";
    productGrid.addEventListener("click", (e) => {
      const quoteBtn = e.target.closest("[data-quote-product]");
      if (quoteBtn) return; // handled by button
      const openBtn = e.target.closest("[data-open-product]");
      if (openBtn) return; // handled by button
      const card = e.target.closest("[data-card-product]");
      if (card) openProductModal(card.dataset.cardProduct);
    });
    productGrid.addEventListener("keydown", (e) => {
      if (e.key !== "Enter" && e.key !== " ") return;
      const card = e.target.closest && e.target.closest("[data-card-product]");
      if (card){ e.preventDefault(); openProductModal(card.dataset.cardProduct); }
    });
  }

  // Bind buttons
$$("[data-open-product]").forEach(btn => {
    btn.addEventListener("click", () => openProductModal(btn.dataset.openProduct));
  });
  $$("[data-quote-product]").forEach(btn => {
    btn.addEventListener("click", () => jumpToQuote(btn.dataset.quoteProduct));
  });
}

function populateQuoteSelect(){
  if (!quoteProductSelect) return;
  quoteProductSelect.innerHTML =
    `<option value="" selected disabled>Selecciona…</option>` +
    products.map(p => `<option value="${escapeHtml(p.id)}">${escapeHtml(p.name)}</option>`).join("");
}

// Filters UI
filterButtons.forEach(b => {
  b.addEventListener("click", () => {
    filterButtons.forEach(x => x.classList.remove("is-active"));
    b.classList.add("is-active");
    renderProducts(b.dataset.filter);
  });
});

// ===== Product Modal =====
const productModal = $("#productModal");
const modalBody = $("#modalBody");
const modalQuoteBtn = $("#modalQuoteBtn");

let currentProductId = null;

function openModal(modalEl){
  modalEl.classList.add("is-open");
  modalEl.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}
function closeModal(modalEl){
  modalEl.classList.remove("is-open");
  modalEl.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

function openProductModal(productId){
  const p = products.find(x => x.id === productId);
  if (!p || !productModal || !modalBody) return;

  currentProductId = productId;

  const specsHtml = Object.entries(p.specs || {}).map(([k,v]) =>
    `<li><strong>${escapeHtml(k)}:</strong> <span class="muted">${escapeHtml(v)}</span></li>`
  ).join("");

  modalBody.innerHTML = `
    ${p.image ? `<div class="productPhoto" id="productPhoto" style="background-image:url('${p.image}')" title="Clic para ver en grande"></div>` : ``}
    <p class="muted">${escapeHtml(p.desc)}</p>
    <div class="panel" style="margin:0; margin-top:1rem;">
      <h4 style="margin:.1rem 0 .6rem;">Accesorios (opcional)</h4>
      <div class="multiSelect" id="modalAccessoriesSelect">
        <button class="multiSelect__toggle" id="modalAccessoriesToggle" type="button" aria-expanded="false">Seleccionar accesorios…</button>
        <div class="multiSelect__panel" id="modalAccessoriesPanel" hidden>
          <div class="accessories__grid" id="modalAccessoriesGrid"></div>
        </div>
      </div>
      <p class="muted small" style="margin:.45rem 0 0;">Puedes seleccionar más de uno.</p>
    </div>
    <div style="display:grid; gap:.9rem; margin-top:1rem;">
      <div class="panel" style="margin:0;">
        <h4 style="margin:.1rem 0 .6rem;">Especificaciones (referencia)</h4>
        <ul class="list" style="margin:.2rem 0 0;">${specsHtml}</ul>
      </div>
      <div class="panel" style="margin:0;">
        <h4 style="margin:.1rem 0 .6rem;">Opciones</h4>
        <p class="muted" style="margin:0;">Dimensiones, refuerzos, accesorios, acabados y documentación según operación.</p>
      </div>
    </div>
  `;

  // Modal addons
  renderModalAccessoriesForProduct(productId);
  attachProductPhotoZoom();

  openModal(productModal);
}

if (productModal){
  productModal.addEventListener("click", (e) => {
    const t = e.target;
    if (t && (t.dataset.close !== undefined)) closeModal(productModal);
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && productModal.classList.contains("is-open")) closeModal(productModal);
  });
}

if (modalQuoteBtn){
  modalQuoteBtn.addEventListener("click", () => {
    if (currentProductId) jumpToQuote(currentProductId, (typeof modalSelectedAccessories !== "undefined" ? modalSelectedAccessories : []));
    if (productModal) closeModal(productModal);
  });
}

function jumpToQuote(productId, preselectedAccessories){
  const quote = $("#cotizar");
  if (quote) quote.scrollIntoView({behavior:"smooth", block:"start"});
  if (quoteProductSelect) {
    quoteProductSelect.value = productId;
    renderAccessoriesForProduct(productId);
    // Apply preselected accessories (if provided)
    if (accessoriesGrid && Array.isArray(preselectedAccessories) && preselectedAccessories.length){
      const wanted = new Set(preselectedAccessories.map(a => a.name));
      selectedAccessories = [];
      $$('input[type="checkbox"][data-acc-name]', accessoriesGrid).forEach(cb => {
        if (wanted.has(cb.dataset.accName)){
          cb.checked = true;
          selectedAccessories.push({ name: cb.dataset.accName, note: cb.dataset.accNote || "" });
        }
      });
      updateAccessoriesToggle();
    }

  }
}

// ===== Gallery =====
const galleryPreview = $("#galleryPreview");
const galleryModal = $("#galleryModal");
const galleryGrid = $("#galleryGrid");
const openGalleryBtn = $("#openGallery");

const galleryViewer = $("#galleryViewer");
const galleryBackBtn = $("#galleryBackBtn");
const galleryPrevBtn = $("#galleryPrevBtn");
const galleryNextBtn = $("#galleryNextBtn");
const galleryViewerCloseBtn = $("#galleryViewerCloseBtn");
const galleryViewerImg = $("#galleryViewerImg");
const galleryViewerCap = $("#galleryViewerCap");

let galleryIndex = 0;

function closeGalleryViewer(){
  if (galleryViewer) galleryViewer.hidden = true;
  if (galleryGrid) galleryGrid.hidden = false;
}

function openGalleryViewer(index){
  if (!gallery || !gallery.length) return;
  if (!galleryViewer || !galleryViewerImg) return;

  galleryIndex = (index + gallery.length) % gallery.length;
  const item = gallery[galleryIndex];

  if (galleryGrid) galleryGrid.hidden = true;
  galleryViewer.hidden = false;

  galleryViewerImg.src = item.src;
  galleryViewerImg.alt = item.title || "Foto del proyecto";
  if (galleryViewerCap) galleryViewerCap.textContent = item.title || "";
}

function stepGallery(dir){
  openGalleryViewer(galleryIndex + dir);
}

if (galleryBackBtn) galleryBackBtn.addEventListener("click", closeGalleryViewer);
if (galleryViewerCloseBtn) galleryViewerCloseBtn.addEventListener("click", closeGalleryViewer);
if (galleryPrevBtn) galleryPrevBtn.addEventListener("click", () => stepGallery(-1));
if (galleryNextBtn) galleryNextBtn.addEventListener("click", () => stepGallery(1));

if (galleryGrid){
  // Click en miniatura -> abrir grande
  galleryGrid.addEventListener("click", (e) => {
    const thumb = e.target.closest(".thumb");
    if (!thumb) return;
    const thumbs = Array.from(galleryGrid.querySelectorAll(".thumb"));
    const idx = thumbs.indexOf(thumb);
    if (idx >= 0) openGalleryViewer(idx);
  });
}

document.addEventListener("keydown", (e) => {
  if (!galleryModal) return;
  if (!galleryModal.classList.contains("is-open")) return;
  if (!galleryViewer || galleryViewer.hidden) return;

  if (e.key === "ArrowLeft") { e.preventDefault(); stepGallery(-1); }
  if (e.key === "ArrowRight") { e.preventDefault(); stepGallery(1); }
  if (e.key === "Escape") { e.preventDefault(); closeGalleryViewer(); }
});

function renderGalleryPreview(){
  if (!galleryPreview) return;
  const preview = gallery.slice(0, 4);
  galleryPreview.innerHTML = preview.map(g =>
    `<div class="thumb" role="img" aria-label="${escapeHtml(g.title)}" style="background-image:url('${g.src}');" title="${escapeHtml(g.title)}"></div>`
  ).join("");
}

function renderGalleryFull(){
  if (!galleryGrid) return;
  galleryGrid.innerHTML = gallery.map(g =>
    `<div class="thumb" role="img" aria-label="${escapeHtml(g.title)}" style="background-image:url('${g.src}');" title="${escapeHtml(g.title)}"></div>`
  ).join("");
}

if (openGalleryBtn && galleryModal){
  openGalleryBtn.addEventListener("click", () => {
    renderGalleryFull();
    closeGalleryViewer();
    openModal(galleryModal);
  });
}

if (galleryModal){
  galleryModal.addEventListener("click", (e) => {
    const t = e.target;
    if (t && (t.dataset.close !== undefined)) closeModal(galleryModal);
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && galleryModal.classList.contains("is-open")) closeModal(galleryModal);
  });
}

// ===== WhatsApp + Quote form =====
const quoteForm = $("#quoteForm");
// const sendEmailBtn = $("#sendEmailBtn"); // (opcional)
const whatsAppQuick = $("#whatsAppQuick");
const waFloat = $("#waFloat");
const whatsAppFooter = $("#whatsAppFooter");

function buildQuoteMessage(data){
  const accText = (selectedAccessories && selectedAccessories.length)
    ? ("• Accesorios: " + selectedAccessories.map(a => a.note ? `${a.name} (${a.note})` : a.name).join(", "))
    : null;

  const p = products.find(x => x.id === data.producto);
  const prodName = p ? p.name : data.producto;

  return [
    `Hola, soy ${data.nombre}. Quiero cotizar con ${COMPANY_LABEL}:`,
    `• Producto: ${prodName}`,
    `• Capacidad / medida: ${data.capacidad}`,
    `• Ciudad: ${data.ciudad}`,
    data.fecha ? `• Fecha objetivo: ${data.fecha}` : null,
    `• Detalles: ${data.detalle}`,
    accText,
    `• Teléfono: ${data.telefono}`
  ].filter(Boolean).join("\n");
}

function openWhatsApp(message){
  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
  window.open(url, "_blank", "noopener,noreferrer");
}

function setGenericWhatsAppLinks(){
  const msg = `Hola, quiero información de ${COMPANY_LABEL} sobre plataformas, volcos, tanques o repuestos.`;
  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
  if (whatsAppQuick) whatsAppQuick.href = url;
  if (waFloat) waFloat.href = url;
  if (whatsAppFooter) whatsAppFooter.href = url;
}

if (quoteForm){
  quoteForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const fd = new FormData(quoteForm);
    const data = Object.fromEntries(fd.entries());

    if (!data.producto){
      alert("Selecciona un producto.");
      return;
    }

    const message = buildQuoteMessage(data);
    openWhatsApp(message);
  });
}

// ===== Footer year =====
const yearEl = $("#year");
if (yearEl) yearEl.textContent = new Date().getFullYear();

// ===== Init =====
populateQuoteSelect();
renderProducts("all");
renderGalleryPreview();
setGenericWhatsAppLinks();
mountHeroSlides();
  bindProductDelegation();
if (quoteProductSelect && quoteProductSelect.value) renderAccessoriesForProduct(quoteProductSelect.value);


// ===== Hero background slideshow (like a video that cycles images) =====
const HERO_SLIDES = [
  "assets/img/hero1.jpg",
  "assets/img/hero2.jpg",
  "assets/img/hero3.jpg",
  "assets/img/hero4.jpg"
];

function mountHeroSlides(){
  const heroBg = $("#heroBg");
  if (!heroBg) return;
  heroBg.innerHTML = HERO_SLIDES.map(src =>
    `<div class="heroBg__slide" style="background-image:url('${src}')"></div>`
  ).join("");
}

// ===== Accessories (quote) =====
const accessoriesGrid = $("#accessoriesGrid");
let selectedAccessories = [];

const accessoriesToggle = $("#accessoriesToggle");
const accessoriesPanel = $("#accessoriesPanel");

function closeAccessoriesPanel(){
  if (!accessoriesPanel || !accessoriesToggle) return;
  accessoriesPanel.hidden = true;
  accessoriesToggle.setAttribute("aria-expanded", "false");
}

function openAccessoriesPanel(){
  if (!accessoriesPanel || !accessoriesToggle) return;
  accessoriesPanel.hidden = false;
  accessoriesToggle.setAttribute("aria-expanded", "true");
}

function toggleAccessoriesPanel(){
  if (!accessoriesPanel) return;
  const isOpen = !accessoriesPanel.hidden;
  isOpen ? closeAccessoriesPanel() : openAccessoriesPanel();
}

function updateAccessoriesToggle(){
  if (!accessoriesToggle) return;

  const n = selectedAccessories ? selectedAccessories.length : 0;
  if (!n){
    accessoriesToggle.textContent = "Seleccionar accesorios…";
    return;
  }
  if (n <= 2){
    accessoriesToggle.textContent = `Accesorios: ${selectedAccessories.map(a => a.name).join(", ")}`;
    return;
  }
  accessoriesToggle.textContent = `${n} accesorios seleccionados`;
}

if (accessoriesToggle){
  accessoriesToggle.addEventListener("click", (e) => {
    e.preventDefault();
    toggleAccessoriesPanel();
  });
}

document.addEventListener("click", (e) => {
  if (!accessoriesPanel || !accessoriesToggle) return;
  if (accessoriesPanel.hidden) return;

  const inside = e.target.closest("#accessoriesSelect");
  if (!inside) closeAccessoriesPanel();
});

function renderAccessoriesForProduct(productId){
  const p = products.find(x => x.id === productId);
  selectedAccessories = [];
  if (!accessoriesGrid) return;
  closeAccessoriesPanel();
  updateAccessoriesToggle();

  if (!p || !p.accessories || p.accessories.length === 0){
    accessoriesGrid.innerHTML = `<p class="muted small" style="margin:0;">Este producto no tiene accesorios configurados.</p>`;
    return;
  }

  accessoriesGrid.innerHTML = p.accessories.map((a, idx) => {
    const id = `acc_${productId}_${idx}`;
    return `
      <label class="accCheck" for="${id}">
        <input type="checkbox" id="${id}" data-acc-name="${escapeHtml(a.name)}" data-acc-note="${escapeHtml(a.note || "")}">
        <div>
          <span>${escapeHtml(a.name)}</span>
          ${a.note ? `<small>${escapeHtml(a.note)}</small>` : ``}
        </div>
      </label>
    `;
  }).join("");

  updateAccessoriesToggle();

  $$('input[type="checkbox"][data-acc-name]', accessoriesGrid).forEach(cb => {
    cb.addEventListener("change", () => {
      const name = cb.dataset.accName;
      const note = cb.dataset.accNote || "";
      if (cb.checked){
        selectedAccessories.push({ name, note });
      } else {
        selectedAccessories = selectedAccessories.filter(x => x.name !== name);
      }
      updateAccessoriesToggle();
    });
  });
}

if (quoteProductSelect){
  quoteProductSelect.addEventListener("change", () => {
    renderAccessoriesForProduct(quoteProductSelect.value);
  });
}


// ===== Product modal: accessories + photo zoom =====
let modalSelectedAccessories = [];

function closeModalAccPanel(){
  const panel = $("#modalAccessoriesPanel");
  const toggle = $("#modalAccessoriesToggle");
  if (!panel || !toggle) return;
  panel.hidden = true;
  toggle.setAttribute("aria-expanded", "false");
}

function updateModalAccToggle(){
  const toggle = $("#modalAccessoriesToggle");
  if (!toggle) return;
  toggle.textContent = modalSelectedAccessories.length
    ? `Accesorios: ${modalSelectedAccessories.length} seleccionados`
    : "Seleccionar accesorios…";
}

function renderModalAccessoriesForProduct(productId){
  const p = products.find(x => x.id === productId);
  modalSelectedAccessories = [];
  const grid = $("#modalAccessoriesGrid");
  const panel = $("#modalAccessoriesPanel");
  const toggle = $("#modalAccessoriesToggle");
  if (!grid || !panel || !toggle) return;

  closeModalAccPanel();
  updateModalAccToggle();

  if (!p || !p.accessories || p.accessories.length === 0){
    grid.innerHTML = `<p class="muted small" style="margin:0;">Este producto no tiene accesorios configurados.</p>`;
    return;
  }

  grid.innerHTML = p.accessories.map((a, idx) => {
    const id = `macc_${productId}_${idx}`;
    const note = a.note || "";
    return `
      <label class="accCheck" for="${id}">
        <input id="${id}" type="checkbox" data-macc-name="${escapeHtml(a.name)}" data-macc-note="${escapeHtml(note)}" />
        <span class="accCheck__meta">
          <span class="accCheck__name">${escapeHtml(a.name)}</span>
          ${note ? `<span class="accCheck__note">${escapeHtml(note)}</span>` : ``}
        </span>
      </label>
    `;
  }).join("");

  // Toggle open/close (bind once per open)
  toggle.onclick = () => {
    const open = toggle.getAttribute("aria-expanded") === "true";
    toggle.setAttribute("aria-expanded", open ? "false" : "true");
    panel.hidden = open;
  };

  $$('input[type="checkbox"][data-macc-name]', grid).forEach(cb => {
    cb.addEventListener("change", () => {
      const name = cb.dataset.maccName;
      const note = cb.dataset.maccNote || "";
      if (cb.checked){
        modalSelectedAccessories.push({ name, note });
      } else {
        modalSelectedAccessories = modalSelectedAccessories.filter(x => x.name !== name);
      }
      updateModalAccToggle();
    });
  });
}

// Simple photo zoom: open the image in a full-screen overlay (within the same modal)
function attachProductPhotoZoom(){
  const photo = $("#productPhoto");
  if (!photo) return;
  const bg = photo.style.backgroundImage || "";
  const srcMatch = bg.match(/url\(['"]?(.*?)['"]?\)/i);
  const src = srcMatch ? srcMatch[1] : "";

  photo.onclick = () => {
    if (!src) return;
    const overlay = document.createElement("div");
    overlay.className = "imgOverlay";
    overlay.innerHTML = `
      <div class="imgOverlay__backdrop"></div>
      <div class="imgOverlay__panel" role="dialog" aria-modal="true">
        <button class="iconBtn imgOverlay__close" aria-label="Cerrar">✕</button>
        <img class="imgOverlay__img" src="${src}" alt="Vista en grande" />
      </div>
    `;
    document.body.appendChild(overlay);

    const close = () => { overlay.remove(); };
    overlay.querySelector(".imgOverlay__backdrop").addEventListener("click", close);
    overlay.querySelector(".imgOverlay__close").addEventListener("click", close);
    document.addEventListener("keydown", function esc(e){
      if (e.key === "Escape"){ close(); document.removeEventListener("keydown", esc); }
    });
  };
}
