/* =========================
   MCL: GET + Render productos
   ========================= */

// 1) Traer del backend
async function fetchProductosMCL() {
  const URL = 'https://mcl-backend-ten.vercel.app/productos';
  try {
    const resp = await fetch(URL);
    if (!resp.ok) throw new Error(`HTTP ${resp.status} ${resp.statusText}`);
    const data = await resp.json();
    displayProductosMCL(data);
  } catch (err) {
    console.error('Error trayendo productos MCL:', err);
    const cont = document.getElementById('productos');
    if (cont) cont.innerHTML = `<p style="color:#b11">Error cargando productos.</p>`;
  }
}

// 2) Render como Cardelli (categoría > subcategoría > productos)
function displayProductosMCL(data) {
  if (!Array.isArray(data)) return;

  const productosDiv = document.getElementById('productos');
  productosDiv.innerHTML = '';



  data.forEach(categoria => {
    const catDiv = document.createElement('div');
    catDiv.className = 'category';
    catDiv.id = `category-${categoria.id}`;
    catDiv.innerHTML = `
      <h2>${escapeHTML(categoria.nombre)}</h2>
    `;

    (categoria.SubCategorias || []).forEach(sub => {
      const subDiv = document.createElement('div');
      subDiv.className = 'subcategory';
      subDiv.id = `subcategoria-${sub.id}`;
      subDiv.innerHTML = `
        <h3>${escapeHTML(sub.nombre)}</h3>

      `;

      const row = document.createElement('div');
      row.className = 'products-row';

      (sub.Productos || []).forEach(prod => {
        const cardWrap = document.createElement('div');
        cardWrap.className = 'product-container';

        const card = document.createElement('div');
        card.className = 'product-index';
        card.id = `producto-${prod.id}`;

        const fotos = (prod.Fotos || []).map(f => f.url);
        const carrusel = createCarouselMCL(fotos, prod.nombre); // wrapper .carousel-producto

        const info = document.createElement('div');
        info.className = 'product-info';

        const precioNum = parseFloat(prod.precio);
        const precioFmt = isFinite(precioNum)
          ? `$${Math.floor(precioNum).toLocaleString('es-AR')}`
          : `$${prod.precio}`;

        const kmFmt = prod.kilometros != null && prod.kilometros !== ''
          ? `${Number(prod.kilometros).toLocaleString('es-AR')} km`
          : '';

        // === SOLO lo pedido en la tarjeta (nombre, versión, modelo, precio) ===
        info.innerHTML = `
          <strong>${escapeHTML(prod.nombre)}</strong><br>
          <p class="producto_descripcion">
            ${prod.version ? `<b>Versión:</b> ${escapeHTML(prod.version)}<br>` : ''}
            ${prod.modelo  ? `<b>Modelo:</b> ${escapeHTML(String(prod.modelo))}<br>` : ''}
            ${kmFmt ? `<b>Kilómetros:</b> ${kmFmt}<br>` : ''}
          </p>
          <div class="divPrecio">${precioFmt}</div>
        `;

        // Botón "Ver más" → abre modal
        const verMasBtn = document.createElement('button');
        verMasBtn.classList.add('ver-mas-btn');
        verMasBtn.innerHTML = 'Ver más';
        verMasBtn.onclick = function () {
          openModal(prod); // usamos openModal(prod) como pediste
        };

        // Botonera admin (mantener)
        const btns = document.createElement('div');
        btns.className = 'product-buttons';


        // Armado
        card.appendChild(carrusel);
        card.appendChild(info);
        card.appendChild(verMasBtn);
        cardWrap.appendChild(card);
        row.appendChild(cardWrap);
      });

      subDiv.appendChild(row);
      catDiv.appendChild(subDiv);
    });

    productosDiv.appendChild(catDiv);
  });
}

// ===== Modal =====
function openModal(prod) {
  const modal = document.getElementById('productModal');
  const modalContent = document.getElementById('modal-product-info');
  if (!modal || !modalContent) return;

  // AÑADIMOS NAMESPACE para ganar a Bootstrap (no quitamos tus clases)
  modal.classList.add('mcl-modal');
  const contentWrapper = modal.querySelector('.modal-content');
  if (contentWrapper) contentWrapper.classList.add('mcl-modal-content');

  // Formateos
  const precioNum = parseFloat(prod.precio);
  const precioFmt = isFinite(precioNum)
    ? `$${Math.floor(precioNum).toLocaleString('es-AR')}`
    : `$${prod.precio}`;

  const kmFmt = (prod.kilometros != null && prod.kilometros !== '')
    ? `${Number(prod.kilometros).toLocaleString('es-AR')} km`
    : '';

  // Carrusel dentro del modal (reusa tu createCarouselMCL)
  // Lo insertamos arriba del contenido textual
  const modalContentWrapper = modal.querySelector('.modal-content');
  if (modalContentWrapper) {
    // limpiar carrusel previo si lo hubiera
    const previous = modalContentWrapper.querySelector('.carousel-producto');
    if (previous) previous.remove();

    const fotos = (prod.Fotos || []).map(f => f.url);
    const modalCarousel = createCarouselMCL(fotos, prod.nombre);
    modalContentWrapper.insertBefore(modalCarousel, modalContent); // arriba del texto
  }

  // Llenar el modal con la información (incluye descripción, prioridad y oculto)
  modalContent.innerHTML = `
    <strong class="product-nombre">${escapeHTML(prod.nombre)}</strong>
    <p class="producto_descripcion">
      ${prod.version ? `<b>Versión:</b> ${escapeHTML(prod.version)}<br>` : ''}
      ${prod.modelo ? `<b>Modelo:</b> ${escapeHTML(String(prod.modelo))}<br>` : ''}
      ${kmFmt ? `<b>Kilómetros:</b> ${kmFmt}<br>` : ''}
      ${prod.descripcion ? `<b>Descripción:</b> ${escapeHTML(prod.descripcion)}<br>` : ''}
    </p>
    <div class="divPrecio-modal">${precioFmt}</div>

    <div class="divPrioridad">
      <label><b>Prioridad:</b> ${prod.prioridad ?? '—'}</label>
    </div>

    <div class="divOculto">
      <label for="oculto-${prod.id}"><b>Oculto:</b></label>
      <select id="oculto-${prod.id}" onchange="toggleOculto(${prod.id}, this.value)">
        <option value="false" ${!prod.esOculto ? 'selected' : ''}>No</option>
        <option value="true" ${prod.esOculto ? 'selected' : ''}>Sí</option>
      </select>
    </div>
  `;

  // Mostrar el modal como overlay centrado
  modal.style.display = 'flex';
}

// CLOSE MODAL 
function closeModal() {
  const modal = document.getElementById('productModal');
  if (!modal) return;
  modal.style.display = 'none';
}

// Cerrar haciendo click fuera del contenido
window.addEventListener('click', function (e) {
  const modal = document.getElementById('productModal');
  if (!modal) return;
  // si el click fue exactamente sobre el overlay
  if (e.target === modal) {
    closeModal();
  }
});




// función placeholder para manejar el cambio de "esOculto"
function toggleOculto(idProducto, value) {
  console.log(`Producto ${idProducto} oculto = ${value}`);
  // acá podés hacer fetchWithAuth(...) al backend para actualizar
}




function createCarouselMCL(urls = [], altBase = 'foto') {
  const wrap = document.createElement('div');
  wrap.className = 'carousel-producto';

  const imgsWrap = document.createElement('div');
  imgsWrap.className = 'carousel-images';
  imgsWrap.dataset.index = "0"; // índice actual

  if (!urls.length) {
    const empty = document.createElement('div');
    empty.className = 'carousel-empty';
    empty.textContent = 'Sin imágenes';
    imgsWrap.appendChild(empty);
  } else {
    urls.forEach((src, i) => {
      const img = document.createElement('img');
      img.src = src;
      img.alt = `${altBase} ${i + 1}`;
      img.className = 'carousel-image';
      imgsWrap.appendChild(img);
    });
  }

  const prev = document.createElement('button');
  prev.className = 'carousel-control prev';
  prev.innerHTML = '&lt;';
  prev.onclick = () => moveCarouselMCL(-1, imgsWrap);

  const next = document.createElement('button');
  next.className = 'carousel-control next';
  next.innerHTML = '&gt;';
  next.onclick = () => moveCarouselMCL(1, imgsWrap);

  wrap.appendChild(prev);
  wrap.appendChild(imgsWrap);
  wrap.appendChild(next);

  // Posicionar en la primera imagen
  imgsWrap.style.transform = 'translateX(0%)';

  return wrap;
}

function moveCarouselMCL(step, imgsWrap) {
  const imgs = imgsWrap.querySelectorAll('.carousel-image');
  if (!imgs.length) return;

  let index = Number(imgsWrap.dataset.index || 0);
  index = (index + step + imgs.length) % imgs.length;

  imgsWrap.dataset.index = String(index);
  imgsWrap.style.transform = `translateX(-${index * 100}%)`;
}


// 4) Util
function escapeHTML(str) {
  return String(str).replace(/[&<>"']/g, s => (
    ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[s])
  ));
}

// 5) Iniciar
document.addEventListener('DOMContentLoaded', fetchProductosMCL);