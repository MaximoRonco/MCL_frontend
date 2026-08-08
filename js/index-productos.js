async function fetchUltimosProductos() {
  const URL = 'https://mcl-backend-ten.vercel.app/productos';
  try {
    const resp = await fetch(URL);
    if (!resp.ok) throw new Error(`HTTP ${resp.status} ${resp.statusText}`);
    const data = await resp.json();

    // Aplana todos los productos
    let productos = [];
    data.forEach(cat => {
      (cat.SubCategorias || []).forEach(sub => {
        (sub.Productos || [])
        .filter(prod => !prod.esOculto)
        .forEach(prod => {
          productos.push(prod);
        });
      });
    });

    // Ordena por id descendente y toma los últimos 5
    productos.sort((a, b) => b.id - a.id);
    const ultimos = productos.slice(0, 5);

    renderFeaturedGrid(ultimos);
    animarCardsIndex();
  } catch (err) {
    console.error('Error trayendo productos:', err);
    const cont = document.getElementById('productos-index');
    if (cont) cont.innerHTML = `<p style="color:#b11">Error cargando productos.</p>`;
  }
}

function renderFeaturedGrid(productos) {
  const cont = document.getElementById('productos-index');
  if (!cont) return;
  cont.innerHTML = '';

  productos.forEach((prod, idx) => {
    const card = document.createElement('div');
    card.className = idx === 0 ? 'featured-card' : 'mini-card';

    let imgSrc = (prod.Fotos && prod.Fotos.length > 0) ? prod.Fotos[0].url : 'https://via.placeholder.com/400x180?text=Sin+imagen';

    const precioNum = parseFloat(prod.precio);
    const precioFmt = isFinite(precioNum)
      ? `$${Math.floor(precioNum).toLocaleString('es-AR')}`
      : `$${prod.precio}`;

    const kmFmt = (prod.kilometros != null && prod.kilometros !== '')
      ? `${Number(prod.kilometros).toLocaleString('es-AR')} km`
      : '';

    const metaItems = [
      prod.modelo ? escapeHTML(String(prod.modelo)) : '',
      prod.version ? escapeHTML(prod.version) : '',
      kmFmt ? escapeHTML(kmFmt) : ''
    ].filter(Boolean);

    // Botón WhatsApp (solo nombre)
    const mensaje = encodeURIComponent(
      `¡Hola! Quiero consultar por este vehículo:\n• Nombre: ${prod.nombre}`
    );
    const numeroWpp = '5493572683013';
    const wppBtn = `<a class="wpp-contact-btn" target="_blank" rel="noopener" href="https://wa.me/${numeroWpp}?text=${mensaje}" title="Consultar por WhatsApp"><i class="fab fa-whatsapp"></i></a>`;

    // Botón Ver más (solo muestra nombre e imagen en modal si lo deseas)
    const verMasBtn = `<button class="ver-mas-btn">Ver más</button>`;

    card.innerHTML = `
      <div class="card-img-wrap">
        <img src="${imgSrc}" alt="${escapeHTML(prod.nombre)}">
      </div>
      <div class="card-body">
        <h3>${escapeHTML(prod.nombre)}</h3>
        <div class="product-buttons" style="margin-top:12px; justify-content:center;">
          ${verMasBtn}
          ${wppBtn}
        </div>
      </div>
    `;

    card.innerHTML = `
      <div class="card-img-wrap latest-card__media">
        <img src="${imgSrc}" alt="${escapeHTML(prod.nombre)}">
      </div>
      <div class="card-body latest-card__body">
        <span class="latest-card__label">${idx === 0 ? 'Recien ingresado' : 'Nuevo ingreso'}</span>
        <h3>${escapeHTML(prod.nombre)}</h3>
        <div class="latest-card__meta">
          ${metaItems.map(item => `<span>${item}</span>`).join('')}
        </div>
        <div class="latest-card__price">${precioFmt}</div>
        <div class="product-buttons latest-card__actions">
          <button class="ver-mas-btn">Ver más</button>
          ${wppBtn}
        </div>
      </div>
    `;

    // --- Abrir modal al hacer click en la imagen o en la card (mini-card) ---
    // Click en imagen (ambas)
    const imgWrap = card.querySelector('.card-img-wrap');
    if (imgWrap) {
      imgWrap.style.cursor = 'pointer';
      imgWrap.addEventListener('click', (e) => {
        e.stopPropagation();
        window.openModalIndexProducto(prod);
      });
    }
    // Click en toda la mini-card (excepto botones)
    if (card.classList.contains('mini-card')) {
      card.addEventListener('click', (e) => {
        if (e.target.closest('.ver-mas-btn') || e.target.closest('.wpp-contact-btn')) return;
        window.openModalIndexProducto(prod);
      });
    }
    // Click en botón Ver más
    const verMasBtnEl = card.querySelector('.ver-mas-btn');
    if (verMasBtnEl) {
      verMasBtnEl.addEventListener('click', (e) => {
        e.stopPropagation();
        window.openModalIndexProducto(prod);
      });
    }

    cont.appendChild(card);
  });
}

// Utilidad para evitar XSS
function escapeHTML(str) {
  return String(str).replace(/[&<>"']/g, s => (
    ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[s])
  ));
}

// Animación de entrada para las cards
function animarCardsIndex() {
  const cards = document.querySelectorAll('#productos-index .featured-card, #productos-index .mini-card');
  const observerCard = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('show');
        observerCard.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });

  cards.forEach(card => observerCard.observe(card));
}

// Modal igual al de catalogo.js, con carrusel y formato avanzado
window.openModalIndexProducto = function(prodStr) {
  const prod = typeof prodStr === 'string' ? JSON.parse(prodStr) : prodStr;
  const modal = document.getElementById('productModal');
  const modalContent = document.getElementById('modal-product-info');
  if (!modal || !modalContent) return;

  // Namespace para ganar a Bootstrap
  modal.classList.add('mcl-modal');
  const contentWrapper = modal.querySelector('.modal-content');
  if (contentWrapper) {
    contentWrapper.classList.add('mcl-modal-content');
    let closeBtn = contentWrapper.querySelector('.close-btn');
    if (!closeBtn) {
      closeBtn = document.createElement('button');
      closeBtn.className = 'close-btn';
      contentWrapper.prepend(closeBtn);
    }
    closeBtn.innerHTML = '&times;';
    closeBtn.setAttribute('aria-label', 'Cerrar detalle del vehículo');
    closeBtn.setAttribute('role', 'button');
    if (closeBtn.tagName === 'BUTTON') closeBtn.type = 'button';
    closeBtn.onclick = window.closeModal;
  }

  // Formateos
  const precioNum = parseFloat(prod.precio);
  const precioFmt = isFinite(precioNum)
    ? `$${Math.floor(precioNum).toLocaleString('es-AR')}`
    : `$${prod.precio}`;

  const kmFmt = (prod.kilometros != null && prod.kilometros !== '')
    ? `${Number(prod.kilometros).toLocaleString('es-AR')} km`
    : '';

  // Carrusel dentro del modal (igual que catalogo.js)
  if (contentWrapper) {
    contentWrapper.querySelectorAll('.mcl-modal-gallery, .carousel-producto').forEach(el => el.remove());

    // Para index, si el producto tiene Fotos (array de objetos con url), si no, usar placeholder
    let fotos = [];
    if (Array.isArray(prod.Fotos) && prod.Fotos.length > 0 && prod.Fotos[0].url) {
      fotos = prod.Fotos.map(f => f.url);
    } else if (prod.Fotos && Array.isArray(prod.Fotos) && prod.Fotos.length > 0 && typeof prod.Fotos[0] === 'string') {
      fotos = prod.Fotos;
    }
    if (!fotos.length) fotos = ['https://via.placeholder.com/800x400?text=Sin+imagen'];

    if (typeof window.createCarouselMCL === 'function') {
      const modalCarousel = window.createCarouselMCL(fotos, prod.nombre);
      const gallery = document.createElement('div');
      gallery.className = 'mcl-modal-gallery';
      gallery.appendChild(modalCarousel);
      contentWrapper.insertBefore(gallery, modalContent);
    } else {
      // fallback: solo imagen
      const img = document.createElement('img');
      img.src = fotos[0];
      img.alt = prod.nombre;
      img.style.width = '100%';
      img.style.borderRadius = '12px';
      const gallery = document.createElement('div');
      gallery.className = 'mcl-modal-gallery';
      gallery.appendChild(img);
      contentWrapper.insertBefore(gallery, modalContent);
    }
  }

  // Botón WhatsApp igual que catalogo.js
  const mensaje = encodeURIComponent(
    `¡Hola! Quiero consultar por este vehículo:\n` +
    `• Nombre: ${prod.nombre}\n` +
    (prod.version ? `• Versión: ${prod.version}\n` : '') +
    (prod.modelo ? `• Modelo: ${prod.modelo}\n` : '') +
    (prod.kilometros ? `• Kilómetros: ${prod.kilometros}\n` : '') +
    `• Precio: ${precioFmt}`
  );
  const numeroWpp = '5493572683013';
  const wppBtnHtml = `
    <a class="wpp-contact-btn-modal" href="https://wa.me/${numeroWpp}?text=${mensaje}" target="_blank" rel="noopener">
      <i class="fab fa-whatsapp"></i> Consultar
    </a>
  `;

  modalContent.classList.add('mcl-modal-info');

  // Llenar el modal con la información
  modalContent.innerHTML = `
    <div class="mcl-modal-kicker">Detalle del vehículo</div>
    <strong class="product-nombre">${escapeHTML(prod.nombre)}</strong>
    <div class="mcl-modal-meta">
      ${prod.version ? `<div class="mcl-modal-meta-item"><span>Versión</span><strong>${escapeHTML(prod.version)}</strong></div>` : ''}
      ${prod.modelo ? `<div class="mcl-modal-meta-item"><span>Modelo</span><strong>${escapeHTML(String(prod.modelo))}</strong></div>` : ''}
      ${kmFmt ? `<div class="mcl-modal-meta-item"><span>Kilómetros</span><strong>${escapeHTML(kmFmt)}</strong></div>` : ''}
    </div>
    ${prod.descripcion ? `
      <div class="mcl-modal-description">
        <span>Descripción</span>
        <p class="producto_descripcion_modal">${escapeHTML(prod.descripcion)}</p>
      </div>
    ` : ''}
    <div class="mcl-modal-action-panel">
      <span class="mcl-modal-price-label">Precio</span>
      <div class="divPrecio-modal">${precioFmt}</div>
      <div class="modal-buttons">
        ${wppBtnHtml}
      </div>
    </div>
  `;

  modal.style.display = 'flex';
};

window.closeModal = function() {
  const modal = document.getElementById('productModal');
  if (!modal) return;
  modal.style.display = 'none';
};

document.addEventListener('DOMContentLoaded', fetchUltimosProductos);
