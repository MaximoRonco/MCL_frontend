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

    // Botón WhatsApp
    const precioFmt = Number(prod.precio).toLocaleString('es-AR');
    const mensaje = encodeURIComponent(
      `¡Hola! Quiero consultar por este vehículo:\n` +
      `• Nombre: ${prod.nombre}\n` +
      (prod.version ? `• Versión: ${prod.version}\n` : '') +
      (prod.modelo ? `• Modelo: ${prod.modelo}\n` : '') +
      (prod.kilometros ? `• Kilómetros: ${prod.kilometros}\n` : '') +
      `• Precio: $${precioFmt}`
    );
    const numeroWpp = '5493572503289'; // Cambia por tu número real
    const wppBtn = `<a class="wpp-contact-btn" target="_blank" rel="noopener" href="https://wa.me/${numeroWpp}?text=${mensaje}" title="Consultar por WhatsApp"><i class="fab fa-whatsapp"></i></a>`;

    // Botón Ver más
   // Botón Ver más
    const verMasBtn = `<button class="ver-mas-btn" onclick='openModal(${JSON.stringify(prod)})'>Ver más</button>`;

    card.innerHTML = `
      <div class="card-img-wrap">
        <img src="${imgSrc}" alt="${escapeHTML(prod.nombre)}">
      </div>
      <div class="card-body">
        <h3>${escapeHTML(prod.nombre)}</h3>
        <p>
          ${prod.version ? `<b>Versión:</b> ${escapeHTML(prod.version)}<br>` : ''}
          ${prod.modelo ? `<b>Modelo:</b> ${escapeHTML(String(prod.modelo))}<br>` : ''}
          ${prod.kilometros ? `<b>Kilómetros:</b> ${Number(prod.kilometros).toLocaleString('es-AR')} km<br>` : ''}
        </p>
        <div class="card-precio">
          $${precioFmt}
        </div>
        <div class="product-buttons" style="margin-top:12px; justify-content:center;">
          ${verMasBtn}
          ${wppBtn}
        </div>
      </div>
    `;
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

window.openModalIndexProducto = function(prodStr) {
  // prodStr es un string JSON, lo parseamos
  const prod = typeof prodStr === 'string' ? JSON.parse(prodStr) : prodStr;
  const modal = document.getElementById('productModal');
  if (!modal) return;

  // Si tienes un carrusel, puedes agregarlo aquí igual que en catalogo.js
  const modalContent = modal.querySelector('.modal-content');
  if (modalContent) {
    modalContent.innerHTML = `
      <span class="close-btn" onclick="closeModal()">&times;</span>
      <div id="modal-product-info">
        <strong class="product-nombre">${escapeHTML(prod.nombre)}</strong>
        <p class="producto_descripcion">
          ${prod.version ? `<b>Versión:</b> ${escapeHTML(prod.version)}<br>` : ''}
          ${prod.modelo ? `<b>Modelo:</b> ${escapeHTML(String(prod.modelo))}<br>` : ''}
          ${prod.kilometros ? `<b>Kilómetros:</b> ${Number(prod.kilometros).toLocaleString('es-AR')} km<br>` : ''}
          ${prod.descripcion ? `<b>Descripción:</b> ${escapeHTML(prod.descripcion)}<br>` : ''}
        </p>
        <div class="divPrecio-modal">$${Number(prod.precio).toLocaleString('es-AR')}</div>
      </div>
    `;
  }
  modal.style.display = 'flex';
};

window.closeModal = function() {
  const modal = document.getElementById('productModal');
  if (!modal) return;
  modal.style.display = 'none';
};

document.addEventListener('DOMContentLoaded', fetchUltimosProductos);