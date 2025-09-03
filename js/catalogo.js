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
    const marcasContenedor = document.getElementById('marcas-contenedor');
    marcasContenedor.innerHTML = '';

    // Botón "Todas"
    const btnTodas = document.createElement('button');
    btnTodas.className = 'marca-btn selected';
    btnTodas.textContent = 'Todas las subcategorías';
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
        marcaBtn.onclick = () => filtrarPorMarca(subcategoria.id, window.productosMCL_ORIGINAL);
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
            if (btn.textContent === getCategoriaNombreById(id)) btn.classList.add('selected');
        });
    }
}
function marcarSeleccionMarca(id) {
    document.querySelectorAll('.marca-btn').forEach(btn => btn.classList.remove('selected'));
    if (id === null) {
        document.querySelector('.marca-btn').classList.add('selected');
    } else {
        document.querySelectorAll('.marca-btn').forEach(btn => {
            if (btn.textContent === getSubcategoriaNombreById(id)) btn.classList.add('selected');
        });
    }
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
// Filtrar productos por subcategoría
function filtrarPorMarca(subcategoriaId, data) {
    subcategoriaSeleccionadaId = subcategoriaId;
    marcarSeleccionMarca(subcategoriaId);

    const categoriasFiltradas = data.map(categoria => {
        const subcategoriasFiltradas = (categoria.SubCategorias || []).filter(subcategoria => subcategoria.id === subcategoriaId);
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

  const resultado = data.map(cat => {
    // Si la categoría coincide, la devolvemos completa
    if (cat.nombre.toLowerCase().includes(q)) {
      return cat;
    }
    // Si no, filtramos subcategorías
    const subFiltradas = (cat.SubCategorias || []).map(sub => {
      // Filtrar productos
      const productosFiltrados = (sub.Productos || []).filter(prod =>
        (prod.nombre && prod.nombre.toLowerCase().includes(q)) ||
        (prod.version && prod.version.toLowerCase().includes(q)) ||
        (prod.modelo && String(prod.modelo).toLowerCase().includes(q))
      );
      if (
        sub.nombre.toLowerCase().includes(q) ||
        productosFiltrados.length > 0
      ) {
        return { ...sub, Productos: productosFiltrados };
      }
      return null;
    }).filter(Boolean);

    if (subFiltradas.length > 0) {
      return { ...cat, SubCategorias: subFiltradas };
    }
    return null;
  }).filter(Boolean);

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

    (categoria.SubCategorias || []).forEach(sub => {
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
          <strong>${escapeHTML(prod.nombre)}</strong><br>
          <p class="producto_descripcion">
            ${prod.version ? `<b>Versión:</b> ${escapeHTML(prod.version)}<br>` : ''}
            ${prod.modelo  ? `<b>Modelo:</b> ${escapeHTML(String(prod.modelo))}<br>` : ''}
            ${kmFmt ? `<b>Kilómetros:</b> ${kmFmt}<br>` : ''}
          </p>
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
        const numeroWpp = '5493572587819';
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
        cardWrap.appendChild(card);
        cardWrap.appendChild(btns);
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
  const modalContentWrapper = modal.querySelector('.modal-content');
  if (modalContentWrapper) {
    // limpiar carrusel previo si lo hubiera
    const previous = modalContentWrapper.querySelector('.carousel-producto');
    if (previous) previous.remove();

    const fotos = (prod.Fotos || []).map(f => f.url);
    const modalCarousel = createCarouselMCL(fotos, prod.nombre);
    modalContentWrapper.insertBefore(modalCarousel, modalContent); // arriba del texto
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
  const numeroWpp = '5493572587819'; // tu número real
  const wppBtnHtml = `
    <a class="wpp-contact-btn-modal" href="https://wa.me/${numeroWpp}?text=${mensaje}" target="_blank" rel="noopener">
      <i class="fab fa-whatsapp"></i> Consultar
    </a>
  `;

  // ----- Llenar el modal con la información -----
  modalContent.innerHTML = `
    <strong class="product-nombre">${escapeHTML(prod.nombre)}</strong>
    <p class="producto_descripcion_modal">
      ${prod.version ? `<b>Versión:</b> ${escapeHTML(prod.version)}<br>` : ''}
      ${prod.modelo ? `<b>Modelo:</b> ${escapeHTML(String(prod.modelo))}<br>` : ''}
      ${kmFmt ? `<b>Kilómetros:</b> ${kmFmt}<br>` : ''}
      ${prod.descripcion ? `<b>Descripción:</b> ${escapeHTML(prod.descripcion)}<br>` : ''}
    </p>
    <div class="divPrecio-modal">${precioFmt}</div>
    <div class="modal-buttons">
      ${wppBtnHtml}
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
function createCarouselMCL(urls = [], altBase = 'foto') {
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