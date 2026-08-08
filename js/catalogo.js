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
    window.productosMCL_ORIGINAL = data;
    displayCategorias(data);
    displayProductosMCL(data);
  } catch (err) {
    console.error('Error trayendo productos MCL:', err);
    const cont = document.getElementById('productos');
    if (cont) cont.innerHTML = `<p style="color:#b11">Error cargando productos.</p>`;
  }
}

// Filtros
let categoriaSeleccionadaId = null;
let subcategoriaSeleccionadaId = null;

// Mostrar categorías en la barra
function displayCategorias(data) {
    const categoriasContenedor = document.getElementById('categorias-contenedor');
    categoriasContenedor.innerHTML = '';

    // Botón "Todas"
    const btnTodas = document.createElement('button');
    btnTodas.className = 'categoria-btn selected';
    btnTodas.textContent = 'Todas las categorías';
    btnTodas.onclick = () => {
        categoriaSeleccionadaId = null;
        subcategoriaSeleccionadaId = null;
        marcarSeleccionCategoria(null);
        document.getElementById('marcas-contenedor').style.display = 'none';
        categoriasContenedor.classList.remove('sin-radius-abajo');
        displayProductosMCL(window.productosMCL_ORIGINAL);
    };
    categoriasContenedor.appendChild(btnTodas);

    data.forEach(categoria => {
        const categoriaBtn = document.createElement('button');
        categoriaBtn.className = 'categoria-btn';
        categoriaBtn.textContent = categoria.nombre;
        categoriaBtn.onclick = () => filtrarPorCategoria(categoria.id, data);
        categoriasContenedor.appendChild(categoriaBtn);
    });
}

// Mostrar subcategorías en la barra
function displayMarcas(subcategorias) {
    console.log('Subcategorias recibidas:', subcategorias);
    subcategorias.forEach(sub => console.log('Sub:', sub));
    const marcasContenedor = document.getElementById('marcas-contenedor');
    if (!marcasContenedor) return;
    marcasContenedor.innerHTML = '';

    // Botón "Todas"
    const btnTodas = document.createElement('button');
    btnTodas.className = 'marca-btn selected';
    btnTodas.textContent = 'Todas las subcategorías';
    btnTodas.dataset.subcategoriaId = 'null';
    btnTodas.onclick = () => {
        subcategoriaSeleccionadaId = null;
        marcarSeleccionMarca(null);
        filtrarPorCategoria(categoriaSeleccionadaId, window.productosMCL_ORIGINAL, false);
    };
    marcasContenedor.appendChild(btnTodas);

    subcategorias.forEach(subcategoria => {
        const marcaBtn = document.createElement('button');
        marcaBtn.className = 'marca-btn';
        marcaBtn.textContent = subcategoria.nombre;
        marcaBtn.dataset.subcategoriaNombre = subcategoria.nombre;
        marcaBtn.onclick = () => filtrarPorMarca(subcategoria.nombre, window.productosMCL_ORIGINAL);
        marcasContenedor.appendChild(marcaBtn);
    });
}

// Marcar seleccionado
function marcarSeleccionCategoria(id) {
    document.querySelectorAll('.categoria-btn').forEach(btn => btn.classList.remove('selected'));
    if (id === null) {
        document.querySelector('.categoria-btn').classList.add('selected');
    } else {
        document.querySelectorAll('.categoria-btn').forEach(btn => {
            if (btn.textContent.trim() === getCategoriaNombreById(id).trim()) btn.classList.add('selected');
        });
    }
}
function marcarSeleccionMarca(nombre) {
    const botones = document.querySelectorAll('.marca-btn');
    
    botones.forEach((btn) => {
        btn.classList.remove('selected');
        // Comparar por nombre
        const btnNombre = btn.dataset.subcategoriaNombre;
        const targetNombre = nombre === null ? null : nombre;
        
        if (nombre === null) {
            // Si es null, marca el primer botón (Todas las subcategorías)
            if (btn === botones[0]) {
                btn.classList.add('selected');
            }
        } else if (btnNombre === targetNombre) {
            btn.classList.add('selected');
        }
    });
}
function getCategoriaNombreById(id) {
    const cat = window.productosMCL_ORIGINAL.find(c => c.id === id);
    return cat ? cat.nombre : '';
}
function getSubcategoriaNombreById(id) {
    for (const cat of window.productosMCL_ORIGINAL) {
        const sub = (cat.SubCategorias || []).find(s => s.id === id);
        if (sub) return sub.nombre;
    }
    return '';
}


// Filtrar productos por categoría
function filtrarPorCategoria(categoriaId, data, mostrarMarcas = true) {
    categoriaSeleccionadaId = categoriaId;
    subcategoriaSeleccionadaId = null;
    marcarSeleccionCategoria(categoriaId);

    const categoriasContenedor = document.querySelector('.categorias-contenedor');
    const marcasContenedor = document.getElementById('marcas-contenedor');

    if (!categoriaId) {
        categoriasContenedor.classList.remove('sin-radius-abajo'); // <-- AQUÍ
        marcasContenedor.style.display = 'none';
        displayProductosMCL(data);
        return;
    }
    categoriasContenedor.classList.add('sin-radius-abajo'); // <-- AQUÍ
    const categoriaFiltrada = data.find(categoria => categoria.id === categoriaId);
    if (categoriaFiltrada && categoriaFiltrada.SubCategorias && categoriaFiltrada.SubCategorias.length > 0 && mostrarMarcas) {
        marcasContenedor.style.display = 'flex';
        displayMarcas(categoriaFiltrada.SubCategorias);
    } else {
        marcasContenedor.style.display = 'none';
    }
    displayProductosMCL([categoriaFiltrada]);
}
// Filtrar productos por subcategoría (por nombre)
function filtrarPorMarca(subcategoriaNombre, data) {
    subcategoriaSeleccionadaId = subcategoriaNombre;
    marcarSeleccionMarca(subcategoriaNombre);

    // Solo filtrar dentro de la categoría seleccionada
    if (categoriaSeleccionadaId) {
        const categoria = data.find(cat => cat.id === categoriaSeleccionadaId);
        if (categoria) {
            const subcategoriasFiltradas = (categoria.SubCategorias || []).filter(
                subcategoria => subcategoria.nombre === subcategoriaNombre
            );
            displayProductosMCL([{ ...categoria, SubCategorias: subcategoriasFiltradas }]);
            return;
        }
    }

    // Si no hay categoría seleccionada, filtrar en todos
    const categoriasFiltradas = data.map(categoria => {
        const subcategoriasFiltradas = (categoria.SubCategorias || []).filter(subcategoria => subcategoria.nombre === subcategoriaNombre);
        if (subcategoriasFiltradas.length > 0) {
            return { ...categoria, SubCategorias: subcategoriasFiltradas };
        } else {
            return null;
        }
    }).filter(categoria => categoria !== null);

    displayProductosMCL(categoriasFiltradas);
}

function buscarYCargarCatalogo(query) {
  const data = window.productosMCL_ORIGINAL;
  if (!query || !query.trim()) {
    displayCategorias(data);
    displayProductosMCL(data);
    return;
  }
  const q = query.trim().toLowerCase();

  // Solo filtra productos, mantiene solo las subcategorías que tienen productos coincidentes
  const resultado = data.map(cat => {
    const subFiltradas = (cat.SubCategorias || [])
      .map(sub => {
        // Filtrar solo productos
        const productosFiltrados = (sub.Productos || []).filter(prod =>
          (prod.nombre && prod.nombre.toLowerCase().includes(q)) ||
          (prod.version && prod.version.toLowerCase().includes(q)) ||
          (prod.modelo && String(prod.modelo).toLowerCase().includes(q))
        );
        // Si hay productos que coinciden, devuelve la subcategoría
        if (productosFiltrados.length > 0) {
          return { ...sub, Productos: productosFiltrados };
        }
        return null;
      })
      .filter(Boolean); // Elimina las subcategorías sin productos

    // Solo devuelve la categoría si tiene subcategorías con productos
    if (subFiltradas.length > 0) {
      return { ...cat, SubCategorias: subFiltradas };
    }
    return null;
  }).filter(Boolean); // Elimina las categorías sin subcategorías

  displayCategorias(resultado);
  displayProductosMCL(resultado);
}

document.addEventListener('DOMContentLoaded', function() {
  const input = document.getElementById('buscar-input'); // <--- este es el id correcto
  if (input) {
    input.addEventListener('input', function() {
      buscarYCargarCatalogo(this.value);
    });
  }
});

document.addEventListener('DOMContentLoaded', function() {
  const input = document.getElementById('buscar-input');
  const btn = document.getElementById('buscar-btn');
  if (input) {
    input.addEventListener('input', function() {
      buscarYCargarCatalogo(this.value);
    });
  }
  if (btn && input) {
    btn.addEventListener('click', function() {
      buscarYCargarCatalogo(input.value);
    });
  }
});

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

    (categoria.SubCategorias || []).sort((a, b) => (a.nombre || '').localeCompare((b.nombre || ''), 'es-AR')).forEach(sub => {
      const subDiv = document.createElement('div');
      subDiv.className = 'subcategory';
      subDiv.id = `subcategoria-${sub.id}`;
      subDiv.innerHTML = `
        <h3>${escapeHTML(sub.nombre)}</h3>
      `;

      const row = document.createElement('div');
      row.className = 'products-row';

      (sub.Productos || [])
      .filter(prod => !prod.esOculto)
      .sort((a, b) => (a.nombre || '').localeCompare((b.nombre || ''), 'es-AR') * -1)
      .forEach(prod => {
        const cardWrap = document.createElement('div');
        cardWrap.className = 'product-container';

        const card = document.createElement('div');
        card.className = 'product-index';
        card.id = `producto-${prod.id}`;

        const fotos = (prod.Fotos || []).map(f => f.url);
        const cover = createCoverImageMCL(fotos, prod.nombre, () => openModal(prod));

        const info = document.createElement('div');
        info.className = 'product-info';

        const precioNum = parseFloat(prod.precio);
        const precioFmt = isFinite(precioNum)
          ? `$${Math.floor(precioNum).toLocaleString('es-AR')}`
          : `$${prod.precio}`;

        const kmFmt = prod.kilometros != null && prod.kilometros !== ''
          ? `${Number(prod.kilometros).toLocaleString('es-AR')} km`
          : '';

        info.innerHTML = `
          <strong class="product-card-title">${escapeHTML(prod.nombre)}</strong>
          <div class="producto_descripcion product-card-meta">
            ${prod.version ? `<div class="product-card-meta-row"><b>Versión</b><span>${escapeHTML(prod.version)}</span></div>` : ''}
            ${prod.modelo  ? `<div class="product-card-meta-row"><b>Modelo</b><span>${escapeHTML(String(prod.modelo))}</span></div>` : ''}
            ${kmFmt ? `<div class="product-card-meta-row"><b>Kilómetros</b><span>${escapeHTML(kmFmt)}</span></div>` : ''}
          </div>
          <div class="divPrecio">${precioFmt}</div>
        `;

        // Botón "Ver más"
        const verMasBtn = document.createElement('button');
        verMasBtn.classList.add('ver-mas-btn');
        verMasBtn.innerHTML = 'Ver más';
        verMasBtn.onclick = function () {
          openModal(prod);
        };

        // Botón WhatsApp
        const wppBtn = document.createElement('a');
        wppBtn.className = 'wpp-contact-btn';
        wppBtn.target = '_blank';
        wppBtn.rel = 'noopener';

        // Mensaje personalizado
        const mensaje = encodeURIComponent(
          `¡Hola! Quiero consultar por este vehículo:\n` +
          `• Nombre: ${prod.nombre}\n` +
          (prod.version ? `• Versión: ${prod.version}\n` : '') +
          (prod.modelo ? `• Modelo: ${prod.modelo}\n` : '') +
          (prod.kilometros ? `• Kilómetros: ${prod.kilometros}\n` : '') +
          `• Precio: ${precioFmt}`
        );
        // Reemplaza el número por el tuyo real (sin + ni espacios, solo números y código país)
        const numeroWpp = '5493572683013';
        wppBtn.href = `https://wa.me/${numeroWpp}?text=${mensaje}`;
        wppBtn.innerHTML = `<i class="fab fa-whatsapp"></i>`;

        // Botonera
        const btns = document.createElement('div');
        btns.className = 'product-buttons';
        btns.appendChild(verMasBtn);
        btns.appendChild(wppBtn);

        // Armado
        card.appendChild(cover);
        card.appendChild(info);
        card.appendChild(btns);
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
  if (contentWrapper) {
    contentWrapper.classList.add('mcl-modal-content');
    let closeBtn = contentWrapper.querySelector('.close-btn');
    if (!closeBtn) {
      closeBtn = document.createElement('button');
      closeBtn.className = 'close-btn';
      contentWrapper.prepend(closeBtn);
      closeBtn.addEventListener('click', closeModal);
    }
    closeBtn.innerHTML = '&times;';
    closeBtn.setAttribute('aria-label', 'Cerrar detalle del vehículo');
    closeBtn.setAttribute('role', 'button');
    if (closeBtn.tagName === 'BUTTON') closeBtn.type = 'button';
  }

  // Formateos
  const precioNum = parseFloat(prod.precio);
  const precioFmt = isFinite(precioNum)
    ? `$${Math.floor(precioNum).toLocaleString('es-AR')}`
    : `$${prod.precio}`;

  const kmFmt = (prod.kilometros != null && prod.kilometros !== '')
    ? `${Number(prod.kilometros).toLocaleString('es-AR')} km`
    : '';

  // Carrusel dentro del modal (reusa tu createCarouselMCL)
  const modalContentWrapper = modal.querySelector('.modal-content');
  if (modalContentWrapper) {
    modalContentWrapper.querySelectorAll('.mcl-modal-gallery, .carousel-producto').forEach(el => el.remove());

    const fotos = (prod.Fotos || []).map(f => f.url);
    const modalCarousel = createCarouselMCL(fotos, prod.nombre);
    const gallery = document.createElement('div');
    gallery.className = 'mcl-modal-gallery';
    gallery.appendChild(modalCarousel);
    modalContentWrapper.insertBefore(gallery, modalContent);
  }

  // ----- Botón WhatsApp -----
  const mensaje = encodeURIComponent(
    `¡Hola! Quiero consultar por este vehículo:\n` +
    `• Nombre: ${prod.nombre}\n` +
    (prod.version ? `• Versión: ${prod.version}\n` : '') +
    (prod.modelo ? `• Modelo: ${prod.modelo}\n` : '') +
    (prod.kilometros ? `• Kilómetros: ${prod.kilometros}\n` : '') +
    `• Precio: ${precioFmt}`
  );
  const numeroWpp = '5493572683013'; // tu número real
  const wppBtnHtml = `
    <a class="wpp-contact-btn-modal" href="https://wa.me/${numeroWpp}?text=${mensaje}" target="_blank" rel="noopener">
      <i class="fab fa-whatsapp"></i> Consultar
    </a>
  `;

  modalContent.classList.add('mcl-modal-info');

  // ----- Llenar el modal con la información -----
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

// Event listener para el botón close
document.addEventListener('DOMContentLoaded', function() {
  const closeBtn = document.getElementById('modal-close-btn');
  if (closeBtn) {
    closeBtn.addEventListener('click', closeModal);
  }
});




// función placeholder para manejar el cambio de "esOculto"
function toggleOculto(idProducto, value) {
  console.log(`Producto ${idProducto} oculto = ${value}`);
  // acá podés hacer fetchWithAuth(...) al backend para actualizar
}




// === Portada simple para la tarjeta (solo primera imagen) ===
function createCoverImageMCL(urls = [], altBase = 'foto', onClick = null) {
  const wrap = document.createElement('div');
  wrap.className = 'product-cover';

  if (!urls.length) {
    const empty = document.createElement('div');
    empty.className = 'carousel-empty';
    empty.textContent = 'Sin imágenes';
    wrap.appendChild(empty);
    return wrap;
  }

  const img = document.createElement('img');
  img.src = urls[0];
  img.alt = `${altBase} 1`;
  img.loading = 'lazy';
  img.decoding = 'async';
  img.className = 'product-cover-image';
  if (typeof onClick === 'function') {
    img.style.cursor = 'pointer';
    img.addEventListener('click', onClick);
  }
  wrap.appendChild(img);
  return wrap;
}

// CARRUSEL DE IMAGENES PARA LA PANTALLA MODAL //
function createCarouselMCLLegacy(urls = [], altBase = 'foto') {
  const wrap = document.createElement('div');
  wrap.className = 'carousel-producto';

  // estado interno
  let index = 0;
  const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

  // contenedor de imágenes
  const imgsWrap = document.createElement('div');
  imgsWrap.className = 'carousel-images';
  imgsWrap.dataset.index = "0";

  if (!urls.length) {
    const empty = document.createElement('div');
    empty.className = 'carousel-empty';
    empty.textContent = 'Sin imágenes';
    imgsWrap.appendChild(empty);
    wrap.appendChild(imgsWrap);
    return wrap;
  }

  // imágenes
  urls.forEach((src, i) => {
    const img = document.createElement('img');
    img.src = src;
    img.alt = `${altBase} ${i + 1}`;
    img.loading = 'lazy';
    img.decoding = 'async';
    img.className = 'carousel-image';
    imgsWrap.appendChild(img);
  });

  // flechas
  const prev = document.createElement('button');
  prev.className = 'carousel-control prev';
  prev.innerHTML = '&lt;';

  const next = document.createElement('button');
  next.className = 'carousel-control next';
  next.innerHTML = '&gt;';

  prev.onclick = () => jump(-1);
  next.onclick = () => jump(1);

  // miniaturas
  const thumbs = document.createElement('div');
  thumbs.className = 'carousel-thumbs';
  urls.forEach((src, i) => {
    const t = document.createElement('img');
    t.src = src;
    t.alt = `mini ${i + 1}`;
    t.className = 'carousel-thumb';
    t.addEventListener('click', () => goTo(i));
    thumbs.appendChild(t);
  });

  // helpers
  function render() {
    imgsWrap.style.transform = `translateX(-${index * 100}%)`;
    imgsWrap.dataset.index = String(index);
    thumbs.querySelectorAll('.carousel-thumb').forEach((el, i) => {
      el.classList.toggle('active', i === index);
    });
  }
  function goTo(i) {
    index = clamp(i, 0, urls.length - 1);
    render();
  }
  function jump(step) {
    index = (index + step + urls.length) % urls.length;
    render();
  }

  // swipe/touch
  let startX = 0, deltaX = 0;
  imgsWrap.addEventListener('touchstart', (e) => {
    startX = e.touches[0].clientX;
    deltaX = 0;
  }, { passive: true });
  imgsWrap.addEventListener('touchmove', (e) => {
    deltaX = e.touches[0].clientX - startX;
  }, { passive: true });
  imgsWrap.addEventListener('touchend', () => {
    const threshold = 40;
    if (Math.abs(deltaX) > threshold) jump(deltaX < 0 ? 1 : -1);
    deltaX = 0;
  });

  // teclado
  wrap.tabIndex = 0;
  wrap.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') { e.preventDefault(); jump(-1); }
    if (e.key === 'ArrowRight') { e.preventDefault(); jump(1); }
  });

  // armar DOM
  wrap.appendChild(prev);
  wrap.appendChild(imgsWrap);
  wrap.appendChild(next);
  wrap.appendChild(thumbs);

  // inicial
  render();
  return wrap;
}

// Compat: si en algún lugar seguís llamando moveCarouselMCL(...)
function createCarouselMCL(urls = [], altBase = 'foto') {
  const wrap = document.createElement('div');
  wrap.className = 'carousel-producto';

  if (!urls.length) {
    const empty = document.createElement('div');
    empty.className = 'carousel-empty';
    empty.textContent = 'Sin imágenes';
    wrap.appendChild(empty);
    return wrap;
  }

  let currentIndex = 0;

  const main = document.createElement('div');
  main.className = 'modal-gallery-main';

  const mainImg = document.createElement('img');
  mainImg.className = 'modal-main-image';
  mainImg.loading = 'eager';
  mainImg.decoding = 'async';
  mainImg.addEventListener('click', () => {
    if (mainImg.src) openMCLImageLightbox(mainImg.src, mainImg.alt || altBase);
  });

  const prev = document.createElement('button');
  prev.className = 'carousel-control prev';
  prev.type = 'button';
  prev.setAttribute('aria-label', 'Imagen anterior');
  prev.innerHTML = '&lt;';

  const next = document.createElement('button');
  next.className = 'carousel-control next';
  next.type = 'button';
  next.setAttribute('aria-label', 'Imagen siguiente');
  next.innerHTML = '&gt;';

  const thumbs = document.createElement('div');
  thumbs.className = 'carousel-thumbs';

  urls.forEach((src, i) => {
    const thumb = document.createElement('img');
    thumb.src = src;
    thumb.alt = `mini ${i + 1}`;
    thumb.className = 'carousel-thumb';
    thumb.loading = 'lazy';
    thumb.decoding = 'async';
    thumb.addEventListener('click', () => setActiveImage(i));
    thumbs.appendChild(thumb);
  });

  function setActiveImage(nextIndex) {
    currentIndex = (nextIndex + urls.length) % urls.length;
    mainImg.src = urls[currentIndex];
    mainImg.alt = `${altBase} ${currentIndex + 1}`;

    thumbs.querySelectorAll('.carousel-thumb').forEach((thumb, i) => {
      const isActive = i === currentIndex;
      thumb.classList.toggle('active', isActive);
      if (isActive) {
        thumb.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
      }
    });
  }

  function jump(step) {
    setActiveImage(currentIndex + step);
  }

  prev.addEventListener('click', () => jump(-1));
  next.addEventListener('click', () => jump(1));

  let startX = 0;
  let deltaX = 0;
  main.addEventListener('touchstart', (e) => {
    startX = e.touches[0].clientX;
    deltaX = 0;
  }, { passive: true });
  main.addEventListener('touchmove', (e) => {
    deltaX = e.touches[0].clientX - startX;
  }, { passive: true });
  main.addEventListener('touchend', () => {
    if (Math.abs(deltaX) > 40) jump(deltaX < 0 ? 1 : -1);
    deltaX = 0;
  });

  wrap.tabIndex = 0;
  wrap.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') { e.preventDefault(); jump(-1); }
    if (e.key === 'ArrowRight') { e.preventDefault(); jump(1); }
  });

  main.appendChild(prev);
  main.appendChild(mainImg);
  main.appendChild(next);
  wrap.appendChild(main);
  wrap.appendChild(thumbs);

  setActiveImage(0);
  return wrap;
}

let mclImageLightbox = null;
let mclLightboxState = {
  isOpen: false,
  scale: 1,
  translateX: 0,
  translateY: 0,
  previousBodyOverflow: '',
  pointers: new Map(),
  isDragging: false,
  didDrag: false,
  dragStartX: 0,
  dragStartY: 0,
  dragBaseX: 0,
  dragBaseY: 0,
  pinchStartDistance: 0,
  pinchStartScale: 1
};

function ensureMCLImageLightbox() {
  if (mclImageLightbox) return mclImageLightbox;

  const lightbox = document.createElement('div');
  lightbox.className = 'mcl-image-lightbox';
  lightbox.setAttribute('role', 'dialog');
  lightbox.setAttribute('aria-modal', 'true');
  lightbox.setAttribute('aria-label', 'Vista ampliada del vehículo');

  lightbox.innerHTML = `
    <div class="lightbox-toolbar">
      <button class="lightbox-control lightbox-zoom-out" type="button" aria-label="Alejar">-</button>
      <span class="lightbox-zoom-value" aria-live="polite">100%</span>
      <button class="lightbox-control lightbox-zoom-in" type="button" aria-label="Acercar">+</button>
      <button class="lightbox-control lightbox-reset" type="button" aria-label="Restablecer zoom">Restablecer</button>
      <button class="lightbox-control lightbox-close" type="button" aria-label="Cerrar imagen">&times;</button>
    </div>
    <div class="lightbox-stage">
      <img class="lightbox-image" alt="">
    </div>
  `;

  document.body.appendChild(lightbox);

  const stage = lightbox.querySelector('.lightbox-stage');
  const img = lightbox.querySelector('.lightbox-image');
  const zoomValue = lightbox.querySelector('.lightbox-zoom-value');
  const zoomOut = lightbox.querySelector('.lightbox-zoom-out');
  const zoomIn = lightbox.querySelector('.lightbox-zoom-in');
  const reset = lightbox.querySelector('.lightbox-reset');
  const close = lightbox.querySelector('.lightbox-close');

  mclImageLightbox = { lightbox, stage, img, zoomValue, zoomOut, zoomIn, reset, close };

  zoomOut.addEventListener('click', () => setMCLLightboxZoom(mclLightboxState.scale - 0.25));
  zoomIn.addEventListener('click', () => setMCLLightboxZoom(mclLightboxState.scale + 0.25));
  reset.addEventListener('click', resetMCLLightboxZoom);
  close.addEventListener('click', closeMCLImageLightbox);

  stage.addEventListener('wheel', (e) => {
    if (!mclLightboxState.isOpen) return;
    e.preventDefault();
    setMCLLightboxZoom(mclLightboxState.scale + (e.deltaY < 0 ? 0.25 : -0.25));
  }, { passive: false });

  stage.addEventListener('click', (e) => {
    if (e.target === stage && mclLightboxState.scale === 1 && !mclLightboxState.didDrag) {
      closeMCLImageLightbox();
    }
  });

  img.addEventListener('dblclick', (e) => {
    e.preventDefault();
    setMCLLightboxZoom(mclLightboxState.scale === 1 ? 2 : 1);
  });

  stage.addEventListener('pointerdown', handleMCLLightboxPointerDown);
  stage.addEventListener('pointermove', handleMCLLightboxPointerMove);
  stage.addEventListener('pointerup', handleMCLLightboxPointerUp);
  stage.addEventListener('pointercancel', handleMCLLightboxPointerUp);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mclLightboxState.isOpen) {
      e.preventDefault();
      e.stopPropagation();
      closeMCLImageLightbox();
    }
  }, true);

  window.addEventListener('resize', () => {
    if (mclLightboxState.isOpen) {
      clampMCLLightboxPan();
      applyMCLLightboxTransform();
    }
  });

  return mclImageLightbox;
}

function openMCLImageLightbox(src, alt = 'Vehículo') {
  const lightbox = ensureMCLImageLightbox();
  mclLightboxState.previousBodyOverflow = document.body.style.overflow;
  mclLightboxState.isOpen = true;
  lightbox.img.src = src;
  lightbox.img.alt = alt;
  document.body.style.overflow = 'hidden';
  resetMCLLightboxZoom();
  lightbox.lightbox.classList.add('is-open');
  lightbox.close.focus();
}

function closeMCLImageLightbox() {
  if (!mclImageLightbox || !mclLightboxState.isOpen) return;
  mclImageLightbox.lightbox.classList.remove('is-open');
  document.body.style.overflow = mclLightboxState.previousBodyOverflow;
  mclLightboxState.isOpen = false;
  mclLightboxState.pointers.clear();
  resetMCLLightboxZoom();
  mclImageLightbox.img.removeAttribute('src');
}

function resetMCLLightboxZoom() {
  mclLightboxState.scale = 1;
  mclLightboxState.translateX = 0;
  mclLightboxState.translateY = 0;
  mclLightboxState.didDrag = false;
  applyMCLLightboxTransform();
}

function setMCLLightboxZoom(nextScale) {
  mclLightboxState.scale = Math.max(1, Math.min(4, nextScale));
  if (mclLightboxState.scale === 1) {
    mclLightboxState.translateX = 0;
    mclLightboxState.translateY = 0;
  }
  clampMCLLightboxPan();
  applyMCLLightboxTransform();
}

function getMCLLightboxPanBounds() {
  const { stage, img } = ensureMCLImageLightbox();
  const rect = stage.getBoundingClientRect();
  const naturalW = img.naturalWidth || rect.width;
  const naturalH = img.naturalHeight || rect.height;
  const fitRatio = Math.min(rect.width / naturalW, rect.height / naturalH);
  const baseW = naturalW * fitRatio;
  const baseH = naturalH * fitRatio;
  return {
    maxX: Math.max(0, (baseW * mclLightboxState.scale - rect.width) / 2),
    maxY: Math.max(0, (baseH * mclLightboxState.scale - rect.height) / 2)
  };
}

function clampMCLLightboxPan() {
  const { maxX, maxY } = getMCLLightboxPanBounds();
  mclLightboxState.translateX = Math.max(-maxX, Math.min(maxX, mclLightboxState.translateX));
  mclLightboxState.translateY = Math.max(-maxY, Math.min(maxY, mclLightboxState.translateY));
}

function applyMCLLightboxTransform() {
  if (!mclImageLightbox) return;
  const { img, zoomValue } = mclImageLightbox;
  img.style.transform = `translate(${mclLightboxState.translateX}px, ${mclLightboxState.translateY}px) scale(${mclLightboxState.scale})`;
  img.classList.toggle('is-zoomed', mclLightboxState.scale > 1);
  zoomValue.textContent = `${Math.round(mclLightboxState.scale * 100)}%`;
}

function handleMCLLightboxPointerDown(e) {
  if (!mclLightboxState.isOpen) return;
  const { stage } = ensureMCLImageLightbox();
  if (stage.setPointerCapture) {
    try {
      stage.setPointerCapture(e.pointerId);
    } catch (error) {
      // Algunas pruebas/eventos sinteticos no registran un pointer capturable.
    }
  }
  mclLightboxState.pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
  mclLightboxState.didDrag = false;

  if (mclLightboxState.pointers.size === 1 && mclLightboxState.scale > 1) {
    mclLightboxState.isDragging = true;
    mclLightboxState.dragStartX = e.clientX;
    mclLightboxState.dragStartY = e.clientY;
    mclLightboxState.dragBaseX = mclLightboxState.translateX;
    mclLightboxState.dragBaseY = mclLightboxState.translateY;
  }

  if (mclLightboxState.pointers.size === 2) {
    const points = Array.from(mclLightboxState.pointers.values());
    mclLightboxState.pinchStartDistance = Math.hypot(points[0].x - points[1].x, points[0].y - points[1].y);
    mclLightboxState.pinchStartScale = mclLightboxState.scale;
    mclLightboxState.isDragging = false;
  }
}

function handleMCLLightboxPointerMove(e) {
  if (!mclLightboxState.isOpen || !mclLightboxState.pointers.has(e.pointerId)) return;
  mclLightboxState.pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });

  if (mclLightboxState.pointers.size === 2) {
    const points = Array.from(mclLightboxState.pointers.values());
    const distance = Math.hypot(points[0].x - points[1].x, points[0].y - points[1].y);
    if (mclLightboxState.pinchStartDistance > 0) {
      setMCLLightboxZoom(mclLightboxState.pinchStartScale * (distance / mclLightboxState.pinchStartDistance));
    }
    return;
  }

  if (!mclLightboxState.isDragging || mclLightboxState.scale <= 1) return;
  const dx = e.clientX - mclLightboxState.dragStartX;
  const dy = e.clientY - mclLightboxState.dragStartY;
  if (Math.abs(dx) > 3 || Math.abs(dy) > 3) mclLightboxState.didDrag = true;
  mclLightboxState.translateX = mclLightboxState.dragBaseX + dx;
  mclLightboxState.translateY = mclLightboxState.dragBaseY + dy;
  clampMCLLightboxPan();
  applyMCLLightboxTransform();
}

function handleMCLLightboxPointerUp(e) {
  if (!mclLightboxState.pointers.has(e.pointerId)) return;
  mclLightboxState.pointers.delete(e.pointerId);
  mclLightboxState.isDragging = false;

  if (mclLightboxState.pointers.size === 1 && mclLightboxState.scale > 1) {
    const point = Array.from(mclLightboxState.pointers.values())[0];
    mclLightboxState.isDragging = true;
    mclLightboxState.dragStartX = point.x;
    mclLightboxState.dragStartY = point.y;
    mclLightboxState.dragBaseX = mclLightboxState.translateX;
    mclLightboxState.dragBaseY = mclLightboxState.translateY;
  }
}

function moveCarouselMCL(step, imgsWrap) {
  const imgs = imgsWrap.querySelectorAll('.carousel-image');
  if (!imgs.length) return;
  let index = Number(imgsWrap.dataset.index || 0);
  index = (index + step + imgs.length) % imgs.length;
  imgsWrap.dataset.index = String(index);
  imgsWrap.style.transform = `translateX(-${index * 100}%)`;
  const wrap = imgsWrap.parentElement;
  const thumbs = wrap?.querySelectorAll('.carousel-thumb') || [];
  thumbs.forEach((t, i) => t.classList.toggle('active', i === index));
}

// 4) Util
function escapeHTML(str) {
  return String(str).replace(/[&<>"']/g, s => (
    ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[s])
  ));
}

// 5) Iniciar
document.addEventListener('DOMContentLoaded', fetchProductosMCL);

window.openModal = openModal;
