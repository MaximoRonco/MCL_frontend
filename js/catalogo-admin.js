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
    displayCategorias(data); // Mostrar las categorías en la barra
    document.getElementById('marcas-contenedor').style.display = 'none'; // Oculta marcas al inicio
    displayProductosMCL(data);
  } catch (err) {
    console.error('Error trayendo productos MCL:', err);
    const cont = document.getElementById('productos');
    if (cont) cont.innerHTML = `<p style="color:#b11">Error cargando productos.</p>`;
  }
}

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
        displayProductosMCL(data);
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



// 2) Render como Cardelli (categoría > subcategoría > productos)
function displayProductosMCL(data) {
  if (!Array.isArray(data)) return;

  const productosDiv = document.getElementById('productos');
  productosDiv.innerHTML = '';

  // 🔹 Botón global para agregar Categoría
  const btnAddCategory = document.createElement('div');
  btnAddCategory.className = 'contenedorBotonesGlobal';
  btnAddCategory.innerHTML = `
    <button class="add" onclick="addCategory()">
      <i class="bi bi-plus-circle"></i> Categoría
    </button>
  `;
  productosDiv.appendChild(btnAddCategory);

  data.forEach(categoria => {
    const catDiv = document.createElement('div');
    catDiv.className = 'category';
    catDiv.id = `category-${categoria.id}`;
    catDiv.innerHTML = `
      <h2>${escapeHTML(categoria.nombre)}</h2>
      <div class="contenedorBotonesCat">
        <button class="edit" onclick="editCategory(${categoria.id}, '${escapeHTML(categoria.nombre)}')">
          <i class="bi bi-pencil-square"></i> Categoría
        </button>
        <button class="delete" onclick="deleteCategory(${categoria.id})">
          <i class="bi bi-trash"></i> Categoría
        </button>
        <button class="add" onclick="addSubcategory(${categoria.id})">
          <i class="bi bi-plus-circle"></i> Subcategoría
        </button>
      </div>
    `;

    (categoria.SubCategorias || []).forEach(sub => {
      const subDiv = document.createElement('div');
      subDiv.className = 'subcategory';
      subDiv.id = `subcategoria-${sub.id}`;
      subDiv.innerHTML = `
        <h3>${escapeHTML(sub.nombre)}</h3>
        <div class="contenedorBotonesSub">
          <button class="edit" onclick="editSubcategory(${categoria.id}, ${sub.id}, '${escapeHTML(sub.nombre)}')">
            <i class="bi bi-pencil-square"></i> Subcategoría
          </button>
          <button class="delete" onclick="deleteSubcategory(${categoria.id}, ${sub.id})">
            <i class="bi bi-trash"></i> Subcategoría
          </button>
          <button class="add" onclick="addProduct(${sub.id})">
            <i class="bi bi-plus-circle"></i> Producto
          </button>
        </div>
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
        btns.innerHTML = `
          <button class="edit" onclick="editProduct(${prod.id})">
            <i class="bi bi-pencil-square"></i> Producto
          </button>
          <button class="delete" onclick="deleteProduct(${prod.id})">
            <i class="bi bi-trash"></i> Producto
          </button>
        `;

        // Armado
        card.appendChild(cover);
        card.appendChild(info);
        card.appendChild(verMasBtn);
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
    <p class="producto_descripcion_modal">
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
      <label for="oculto-${prod.id}"><b>Oculto:</b>
      ${prod.esOculto ? 'Si' : 'No'}</label>
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


/* AGREGAR CATEGORIA (MCL) */
async function addCategory() {
  const { value: categoryName } = await Swal.fire({
    title: 'Agregar Categoría',
    input: 'text',
    inputLabel: 'Nombre de la categoría',
    showCancelButton: true,
    inputValidator: (value) => {
      if (!value) return '¡Debes escribir algo!';
    }
  });

  if (categoryName) {
    try {
      const response = await fetchWithAuth('https://mcl-backend-ten.vercel.app/categorias', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre: categoryName.trim() })
      });

      if (response.ok) {
        const data = response.data;
        sweet('success', 'Categoría creada con éxito.');
        console.log('Respuesta de la API al agregar categoría:', data);
        createCategoryElement(data.id, data.nombre);
      } else {
        Swal.fire('Error', response.data ? response.data.message : 'Hubo un error al crear la categoría', 'error');
      }
    } catch (error) {
      console.error('Error al crear la categoría:', error);
      Swal.fire('Error', 'Hubo un error al crear la categoría', 'error');
    }
  }
}

/* ELIMINAR CATEGORIA (MCL) */
async function deleteCategory(categoryId) {
  Swal.fire({
    title: '¿Estás seguro?',
    text: "¡No podrás revertir esto!",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Sí, eliminarlo'
  }).then(async (result) => {
    if (result.isConfirmed) {
      try {
        const response = await fetchWithAuth(
          `https://mcl-backend-ten.vercel.app/categorias/${categoryId}`,
          { method: 'DELETE' }
        );

        if (response.ok) {
          sweet("success", "Categoría eliminada con éxito.");
          const categoryElement = document.getElementById(`category-${categoryId}`);
          if (categoryElement) categoryElement.remove();
        } else {
          sweet("error", response.data?.message || "Hubo un error al eliminar la categoría.");
        }
      } catch (error) {
        console.error('Error al eliminar la categoría:', error);
        sweet("error", "Hubo un error al eliminar la categoría.");
      }
    }
  });
}

/* EDITAR CATEGORIA (MCL, con fallback al DOM) */
async function editCategory(categoryId, currentCategoryName) {
  // Si no recibo currentCategoryName, lo leo directo del DOM
  let nameNow = (typeof currentCategoryName === 'string' && currentCategoryName.trim())
    ? currentCategoryName.trim()
    : (document.querySelector(`#category-${categoryId} h2`)?.textContent || '').trim();

  const { value: newCategoryName } = await Swal.fire({
    title: 'Modificar Categoría',
    input: 'text',
    inputLabel: 'Nuevo nombre de la categoría',
    inputValue: nameNow,
    showCancelButton: true,
    inputValidator: (value) => {
      if (!value) return '¡Debes escribir algo!';
    }
  });

  if (!newCategoryName) return;

  try {
    const response = await fetchWithAuth(
      `https://mcl-backend-ten.vercel.app/categorias/${categoryId}`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre: newCategoryName.trim() })
      }
    );

    if (response.ok) {
      Swal.fire('Éxito', 'Categoría modificada con éxito.', 'success');

      // Actualizar el nombre en el DOM
      const categoryTitleEl = document.querySelector(`#category-${categoryId} h2`);
      if (categoryTitleEl) {
        categoryTitleEl.textContent = newCategoryName.trim();
      }
    } else {
      sweet('error', response.data?.message || 'Hubo un error al modificar la categoría');
    }
  } catch (error) {
    console.error('Error al modificar la categoría:', error);
    sweet('error', 'Hubo un error al modificar la categoría.');
  }
}


/* CREAR ELEMENTO CATEGORIA */
function createCategoryElement(categoryId, categoryTitle) {
  const productos = document.getElementById('productos');

  const categoryDiv = document.createElement('div');
  categoryDiv.className = 'category';
  categoryDiv.id = `category-${Number(categoryId)}`;

  categoryDiv.innerHTML = `
    <h2>${escapeHTML(categoryTitle)}</h2>
    <div class="contenedorBotonesCat">
      <button class="edit" onclick="editCategory(${Number(categoryId)}, '${escapeHTML(categoryTitle)}')">
        <i class="bi bi-pencil-square"></i> Categoría
      </button>
      <button class="delete" onclick="deleteCategory(${Number(categoryId)})">
        <i class="bi bi-trash"></i> Categoría
      </button>
      <button class="add" onclick="addSubcategory(${Number(categoryId)})">
        <i class="bi bi-plus-circle"></i> Subcategoría
      </button>
    </div>
    <!-- 💡 Importante: el contenedor de subcategorías va FUERA de los botones -->
    <div id="subcategories-${Number(categoryId)}" class="subcategories"></div>
  `;

  productos.appendChild(categoryDiv);
}

/* FIN CATEGORIAS */


/*Incio Subcategorias */
/* AGREGAR SUBCATEGORÍA (MCL) */
async function addSubcategory(categoryId) {
  const { value: subcategoryTitle } = await Swal.fire({
    title: 'Agregar Subcategoría',
    input: 'text',
    inputLabel: 'Nombre de la subcategoría',
    showCancelButton: true,
    inputValidator: (value) => {
      if (!value) return '¡Debes escribir algo!';
    }
  });

  if (!subcategoryTitle) return;

  try {
    const response = await fetchWithAuth(
      'https://mcl-backend-ten.vercel.app/subcategorias',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // MCL: usa idCategoria
        body: JSON.stringify({ nombre: subcategoryTitle.trim(), idCategoria: Number(categoryId) })
      }
    );

    if (response.ok) {
      const data = response.data; // se espera { id, nombre, idCategoria, ... }
      Swal.fire('Éxito', 'Subcategoría creada correctamente.', 'success');
      console.log('API subcategoría creada:', data);
      createSubcategoryElement(categoryId, data.id, data.nombre);
    } else {
      Swal.fire('Error', response.data?.message || 'Hubo un error al crear la subcategoría', 'error');
    }
  } catch (error) {
    console.error('Error al crear la subcategoría:', error);
    Swal.fire('Error', 'Hubo un error al crear la subcategoría', 'error');
  }
}

/* ELIMINAR SUBCATEGORÍA (MCL) */
async function deleteSubcategory(categoryId, subcategoryId) {
  Swal.fire({
    title: '¿Estás seguro?',
    text: "¡No podrás revertir esto!",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Sí, eliminarlo'
  }).then(async (result) => {
    if (!result.isConfirmed) return;

    try {
      const response = await fetchWithAuth(
        `https://mcl-backend-ten.vercel.app/subcategorias/${subcategoryId}`,
        { method: 'DELETE' }
      );

      if (response.ok) {
        Swal.fire('Eliminado', 'Subcategoría eliminada con éxito.', 'success');

        // Remover del DOM
        const subcategoryElement = document.getElementById(`subcategoria-${subcategoryId}`);
        if (subcategoryElement) {
          subcategoryElement.remove();
        } else {
          console.error(`No se encontró el elemento con id subcategoria-${subcategoryId}`);
        }
      } else {
        Swal.fire('Error', response.data?.message || 'Hubo un error al eliminar la subcategoría', 'error');
      }
    } catch (error) {
      console.error('Error al eliminar la subcategoría:', error);
      Swal.fire('Error', 'Hubo un error al eliminar la subcategoría', 'error');
    }
  });
}

/* EDITAR SUBCATEGORÍA (MCL) */
async function editSubcategory(categoryId, subcategoryId) {
  // Tomar el nombre actual desde el DOM (fallback)
  const currentName =
    (document.querySelector(`#subcategoria-${subcategoryId} h3`)?.textContent || '').trim();

  const { value: subcategoryTitle } = await Swal.fire({
    title: 'Editar Subcategoría',
    input: 'text',
    inputLabel: 'Nuevo nombre de la subcategoría',
    inputValue: currentName,
    showCancelButton: true,
    inputValidator: (value) => {
      if (!value) return '¡Debes escribir algo!';
    }
  });

  if (!subcategoryTitle) return;

  try {
    const response = await fetchWithAuth(
      `https://mcl-backend-ten.vercel.app/subcategorias/${subcategoryId}`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre: subcategoryTitle.trim() })
      }
    );

    if (response.ok) {
      // Actualizar el título en la UI
      const subcategoryElement = document.querySelector(`#subcategoria-${subcategoryId} h3`);
      if (subcategoryElement) subcategoryElement.textContent = subcategoryTitle.trim();
      Swal.fire('Éxito', 'Subcategoría modificada con éxito.', 'success');
    } else {
      Swal.fire('Error', response.data?.message || 'Hubo un error al editar la subcategoría', 'error');
    }
  } catch (error) {
    console.error('Error al editar la subcategoría:', error);
    Swal.fire('Error', 'Hubo un error al editar la subcategoría', 'error');
  }
}




/* CREAR ELEMENTO SUBCATEGORÍA (DOM, estilo Cardelli) */
function createSubcategoryElement(categoryId, subcategoryId, subcategoryTitle) {
  const categoryDiv = document.getElementById(`category-${Number(categoryId)}`);
  if (!categoryDiv) return;

  // Usar/crear contenedor de subcategorías bajo esta categoría
  let subList = document.getElementById(`subcategories-${Number(categoryId)}`);
  if (!subList) {
    subList = document.createElement('div');
    subList.id = `subcategories-${Number(categoryId)}`;
    subList.className = 'subcategories';
    categoryDiv.appendChild(subList);
  }

  const subDiv = document.createElement('div');
  subDiv.className = 'subcategory';
  subDiv.id = `subcategoria-${Number(subcategoryId)}`;
  subDiv.innerHTML = `
    <h3>${escapeHTML(subcategoryTitle)}</h3>
    <div class="contenedorBotonesSub">
      <button class="edit" onclick="editSubcategory(${Number(categoryId)}, ${Number(subcategoryId)}, '${escapeHTML(subcategoryTitle)}')">
        <i class="bi bi-pencil-square"></i> Subcategoría
      </button>
      <button class="delete" onclick="deleteSubcategory(${Number(categoryId)}, ${Number(subcategoryId)})">
        <i class="bi bi-trash"></i> Subcategoría
      </button>
      <button class="add" onclick="addProduct(${Number(subcategoryId)})">
        <i class="bi bi-plus-circle"></i> Producto
      </button>
    </div>
    <div class="products-row"></div>
  `;

  // Inserto arriba para que se vea primero, como en tu flujo
  subList.prepend(subDiv);
}

//PRODUCTOS

// =============================
// Config
// =============================
const MCL_API_BASE = 'https://mcl-backend-ten.vercel.app'; // <- CAMBIA si tu backend usa otro dominio o prefijo
const MCL_UPLOAD_PATH = '/productos';               // <- CAMBIA si tu ruta es distinta

// =============================
// Crear Producto (MCL)
// =============================

function isMobileDevice() {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

/* =============================
   Cloudinary (conversión a JPG)
   ============================= */
const CLOUDINARY = {
  cloudName: 'dxdfjjz4f',               // <-- completá
  uploadPreset: 'mcl_unsigned',   // <-- el preset unsigned que crees
  targetWidth: 1600,                        // "estándar" tipo WhatsApp
  quality: 'auto:good'
};

// Sube el archivo en el formato que sea y obtiene un JPG "normalizado"
async function cldUploadAndGetJpgUrl(file) {
  const url = `https://api.cloudinary.com/v1_1/${CLOUDINARY.cloudName}/auto/upload`;

  const fd = new FormData();
  fd.append('file', file);
  fd.append('upload_preset', CLOUDINARY.uploadPreset);
  // Pedimos el JPG ya procesado como "resultado eager"

  const res = await fetch(url, { method: 'POST', body: fd });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error?.message || 'Error subiendo a Cloudinary');

  // Si por alguna razón no vuelve "eager", construimos la URL on-the-fly
  const eager = data.eager?.[0]?.secure_url;
  const onTheFly = data.secure_url?.replace(
    '/upload/',
    `/upload/c_limit,w_${CLOUDINARY.targetWidth}/f_jpg/q_${CLOUDINARY.quality}/`
  );

  return eager || onTheFly;
}

// Convierte la URL JPG a un File (para seguir mandando "files" a tu backend)
async function jpgUrlToFile(jpgUrl, baseName = 'foto') {
  const r = await fetch(jpgUrl);
  const b = await r.blob();
  return new File([b], `${baseName}.jpg`, { type: 'image/jpeg' });
}

// Atajo: archivo cualquiera -> (Cloudinary) -> JPG File
async function toJpgFileViaCloudinary(file) {
  // 1) Si parece venir de WhatsApp y ya es JPG, lo dejamos tal cual
  if (shouldBypassTransform(file)) {
    return file; // sin subir a Cloudinary, sin convertir
  }

  // 2) Para el resto (HEIC/HEIF/PNG/WebP/JPEG no-WhatsApp), normalizamos a JPG
  const base = (file.name || 'foto').replace(/\.[^.]+$/, '');
  const url  = await cldUploadAndGetJpgUrl(file);  // on-the-fly c_limit,w_1600/f_jpg/q_auto:good
  return await jpgUrlToFile(url, base);
}

// --- Detectar archivos de WhatsApp (heurísticas de nombre) ---
const WHATSAPP_PATTERNS = [
  /^IMG-\d{8}-WA\d+/i,                          // IMG-20250909-WA0001.jpg
  /^WhatsApp Image \d{4}-\d{2}-\d{2} at /i,     // WhatsApp Image 2025-09-09 at 10.22.33.jpeg
  /^WA-\d{6,}/i                                 // WA-1234567.jpg (algunas variantes)
];
function isWhatsAppFilename(name = "") {
  return /whatsapp|wa/i.test(name) || WHATSAPP_PATTERNS.some(r => r.test(name));
}
function shouldBypassTransform(file) {
  // Dejamos “tal cual” si:
  // - ya es JPEG (lo que WhatsApp usa) Y
  // - su nombre parece venir de WhatsApp (patrones típicos)
  return file && file.type === 'image/jpeg' && isWhatsAppFilename(file.name || '');
}


async function addProduct(subcategoryId) {
  let selectedFiles = [];
  // Mapa clave -> File para mantener identidad estable en el DOM
  let fileMap = new Map();

  const { value: formValues } = await Swal.fire({
    title: 'Agregar Producto',
    html: `
      <input id="mcl-name" class="swal2-input" placeholder="Nombre *">
      <input id="mcl-version" class="swal2-input" placeholder="Versión (ej: High Line)">
      <input id="mcl-modelo" class="swal2-input" placeholder="Modelo (año)">
      <input id="mcl-km" type="number" class="swal2-input" placeholder="Kilómetros">
      <textarea id="mcl-description" class="swal2-input" placeholder="Descripción *"></textarea>
      <input id="mcl-price" type="number" class="swal2-input" placeholder="Precio *">
      <input id="mcl-prioridad" type="number" class="swal2-input" placeholder="Prioridad (orden)">
      <label style="display:block; text-align:left; margin:0 0 4px 5px;"><b>Oculto *</b></label>
      <select id="mcl-oculto" class="swal2-select" style="width:100%; padding:6px;">
        <option value="false" selected>No</option>
        <option value="true">Sí</option>
      </select>
      <label style="display:block; text-align:left; margin:12px 0 4px 5px;"><b>Imágenes *</b></label>
      <input id="mcl-images" type="file" class="swal2-file" multiple>
      <div id="mcl-images-preview" style="display:flex; gap:8px; flex-wrap:wrap; margin-top:8px; min-height:70px;"></div>
      <small id="mcl-images-help"></small>
    `,
    didOpen: () => {
      const input = document.getElementById('mcl-images');
      const preview = document.getElementById('mcl-images-preview');
      const help = document.getElementById('mcl-images-help');

      input.addEventListener('change', function () {
        selectedFiles = Array.from(this.files);
        // construir claves estables
        fileMap = new Map(selectedFiles.map((f, i) => [makeKey(f, i), f]));
        renderPreview();
        ensureSortable();
      });

      function makeKey(file, idx) {
        // clave suficientemente única por sesión
        return `${file.name}__${file.size}__${file.lastModified}__${idx}`;
      }

      function renderPreview() {
        preview.innerHTML = '';

        // Si por alguna razón se vació el map y hay files, lo reconstruimos
        if (fileMap.size === 0 && selectedFiles.length > 0) {
          fileMap = new Map(selectedFiles.map((f, i) => [makeKey(f, i), f]));
        }

        let idxFallback = 0;
        for (const f of selectedFiles) {
          const key = [...fileMap.entries()].find(([, file]) => file === f)?.[0] ?? makeKey(f, idxFallback++);
          if (!fileMap.has(key)) fileMap.set(key, f);

          const reader = new FileReader();
          reader.onload = (e) => {
            const imgWrap = document.createElement('div');
            imgWrap.style.position = 'relative';
            imgWrap.style.display = 'inline-block';
            imgWrap.style.marginRight = '4px';
            imgWrap.dataset.key = key; // <- lo usa Sortable para reconstruir el orden

            const img = document.createElement('img');
            img.src = e.target.result;
            img.style.width = '60px';
            img.style.height = '60px';
            img.style.objectFit = 'cover';
            img.style.borderRadius = '6px';
            img.title = f.name;

            // Botón Quitar (opcional, cómodo en mobile)
            const del = document.createElement('button');
            del.textContent = '×';
            del.style.position = 'absolute';
            del.style.top = '-6px';
            del.style.right = '-6px';
            del.style.width = '20px';
            del.style.height = '20px';
            del.style.borderRadius = '50%';
            del.style.border = 'none';
            del.style.cursor = 'pointer';
            del.style.lineHeight = '20px';
            del.style.fontSize = '14px';
            del.style.background = '#f33';
            del.style.color = '#fff';
            del.title = 'Quitar imagen';
            del.addEventListener('click', () => {
              fileMap.delete(key);
              selectedFiles = selectedFiles.filter(ff => ff !== f);
              renderPreview();
              ensureSortable();
            });

            imgWrap.appendChild(img);
            imgWrap.appendChild(del);
            preview.appendChild(imgWrap);
          };
          reader.readAsDataURL(f);
        }
      }

      let sortableInstance = null;
      function ensureSortable() {
        if (sortableInstance) {
          sortableInstance.destroy();
          sortableInstance = null;
        }
        sortableInstance = Sortable.create(preview, {
          animation: 150,
          ghostClass: 'drag-ghost',
          onEnd: () => {
            // reconstruimos selectedFiles según el orden visual actual
            const newOrder = [];
            preview.querySelectorAll('[data-key]').forEach(node => {
              const key = node.dataset.key;
              const file = fileMap.get(key);
              if (file) newOrder.push(file);
            });
            selectedFiles = newOrder;
          }
        });
      }

      help.textContent = 'Arrastrá para reordenar (funciona en celular y PC).';
    },
    focusConfirm: false,
    confirmButtonText: 'Crear',
    showCancelButton: true,
    preConfirm: () => {
      const name = document.getElementById('mcl-name').value.trim();
      const version = document.getElementById('mcl-version').value.trim();
      const modelo = document.getElementById('mcl-modelo').value;
      const km = document.getElementById('mcl-km').value;
      const description = document.getElementById('mcl-description').value.trim();
      const price = document.getElementById('mcl-price').value;
      const prioridad = document.getElementById('mcl-prioridad').value;
      const esOcultoStr = document.getElementById('mcl-oculto').value;

      if (!name || !description || !price || selectedFiles.length === 0) {
        Swal.showValidationMessage('Campos obligatorios: Nombre, Descripción, Precio e Imágenes.');
        return false;
      }

      const precioNum = Number(price);
      if (!Number.isFinite(precioNum) || precioNum <= 0) {
        Swal.showValidationMessage('Ingresá un precio válido.');
        return false;
      }

      const kmNum = km ? Number(km) : null;
      if (km && (!Number.isFinite(kmNum) || kmNum < 0)) {
        Swal.showValidationMessage('Kilómetros inválidos.');
        return false;
      }

      const modeloNum = modelo ? Number(modelo) : null;
      if (modelo && (!Number.isFinite(modeloNum) || modeloNum < 1900)) {
        Swal.showValidationMessage('Modelo inválido.');
        return false;
      }

      const prioridadNum = prioridad ? Number(prioridad) : null;
      if (prioridad && (!Number.isFinite(prioridadNum) || prioridadNum < 0)) {
        Swal.showValidationMessage('Prioridad inválida (número >= 0).');
        return false;
      }

      const esOculto = esOcultoStr === 'true';

      return {
        name,
        version,
        modelo: modeloNum,
        km: kmNum,
        description,
        price: precioNum,
        prioridad: prioridadNum,
        esOculto,
        imageFiles: selectedFiles
      };
    }
  });

  if (!formValues) return;

  const {
    name, version, modelo, km, description, price, prioridad, esOculto, imageFiles
  } = formValues;

  // Render inmediato en UI local (como ya hacías)
  createProductElementMCL(subcategoryId, {
    nombre: name,
    version,
    modelo,
    kilometros: km,
    descripcion: description,
    precio: price,
    prioridad,
    esOculto
  }, imageFiles);

  // 1) Convertimos SIEMPRE a JPG vía Cloudinary (HEIC/HEIF, PNG, etc.)
  const jpgFiles = [];
  for (const f of imageFiles) {
    const jpgFile = await toJpgFileViaCloudinary(f);
    jpgFiles.push(jpgFile);
  }

  // 2) Armamos el FormData con JPG normalizados
  const formData = new FormData();
  const dataPayload = {
    nombre: name,
    version: version || null,
    modelo: modelo ?? null,
    kilometros: km ?? null,
    descripcion: description,
    precio: price.toFixed(2),
    prioridad: prioridad ?? null,
    idSubCategoria: subcategoryId,
    esOculto: !!esOculto
  };
  formData.append('data', JSON.stringify(dataPayload));
  for (const f of jpgFiles) formData.append('files', f);

  try {
    const { data, ok } = await fetchWithAuth(`${MCL_API_BASE}${MCL_UPLOAD_PATH}`, {
      method: 'POST',
      body: formData
    });

    if (ok) {
      Swal.fire('Éxito', 'Producto agregado con éxito.', 'success');
      if (typeof fetchProductosMCL === 'function') {
        fetchProductosMCL();
      }
    } else {
      console.error('Error en la respuesta:', data);
      Swal.fire('Error', (data && data.error) || 'Hubo un error al agregar el producto', 'error');
    }
  } catch (err) {
    console.error('Error al agregar el producto:', err);
    Swal.fire('Error', 'Hubo un error al agregar el producto', 'error');
  }
}



// =============================
// Preview en DOM (MCL)
// =============================
function createProductElementMCL(subcategoryId, prod, imageFiles) {
  const subcategoryDiv = document.getElementById(`subcategoria-${subcategoryId}`);
  if (!subcategoryDiv) {
    console.error(`No se encontró el elemento con id subcategoria-${subcategoryId}`);
    return;
  }
  const productsRowDiv = subcategoryDiv.querySelector('.products-row');

  // Contenedor
  const productContainerDiv = document.createElement('div');
  productContainerDiv.classList.add('product-container');

  // Card
  const productDiv = document.createElement('div');
  productDiv.classList.add('product-index');

  // URLs de preview (ObjectURL)
  const urls = Array.from(imageFiles).map(f => URL.createObjectURL(f));

  // Armamos un "prod" de preview para el modal (incluye Fotos: [{url}])
  const previewProd = {
    ...prod,
    Fotos: urls.map(u => ({ url: u })),
  };

  // Portada (solo 1ra imagen) y la hacemos clickeable para abrir modal
  const cover = createCoverImageMCL(urls, prod.nombre || 'foto', () => openModal(previewProd));
  productDiv.appendChild(cover);

  // Info
  const productInfoDiv = document.createElement('div');
  productInfoDiv.classList.add('product-info');

  const precioFmt = Number.isFinite(Number(prod.precio))
    ? `$${Math.floor(Number(prod.precio)).toLocaleString('es-AR')}`
    : `$${String(prod.precio)}`;

  const kmFmt = (prod.kilometros != null && prod.kilometros !== '')
    ? `${Number(prod.kilometros).toLocaleString('es-AR')} km`
    : '';

  const prioridadDisplay = (prod.prioridad ?? '') === '' ? '—' : String(prod.prioridad);

  productInfoDiv.innerHTML = `
          <strong>${escapeHTML(prod.nombre)}</strong><br>
          <p class="producto_descripcion">
            ${prod.version ? `<b>Versión:</b> ${escapeHTML(prod.version)}<br>` : ''}
            ${prod.modelo  ? `<b>Modelo:</b> ${escapeHTML(String(prod.modelo))}<br>` : ''}
            ${kmFmt ? `<b>Kilómetros:</b> ${kmFmt}<br>` : ''}
          </p>
          <div class="divPrecio">${precioFmt}</div>
        `;


  productDiv.appendChild(productInfoDiv);

  // 🔹 Botón "Ver más" (abre modal con carrusel)
  const verMasBtn = document.createElement('button');
  verMasBtn.classList.add('ver-mas-btn');
  verMasBtn.textContent = 'Ver más';
  verMasBtn.onclick = () => openModal(previewProd);
  productDiv.appendChild(verMasBtn);

  // Botones (preview sin ID real aún)
  const productButtonsDiv = document.createElement('div');
  productButtonsDiv.classList.add('product-buttons');
  productButtonsDiv.innerHTML = `
    <div class="cont-btnProd">
      <button class="edit modProducto" disabled title="Disponible al recargar"><i class="bi bi-pencil-square"></i>Producto</button>
      <button class="delete delProducto" disabled title="Disponible al recargar"><i class="bi bi-trash"></i>Producto</button>
    </div>
  `;

  // Append
  productContainerDiv.appendChild(productDiv);
  productContainerDiv.appendChild(productButtonsDiv);
  productsRowDiv.appendChild(productContainerDiv);

  // Limpieza de ObjectURL cuando se quite el elemento (opcional)
  productContainerDiv.addEventListener('DOMNodeRemoved', () => {
    urls.forEach(u => URL.revokeObjectURL(u));
  });
}


async function deleteProduct(productId) {
  Swal.fire({
    title: '¿Estás seguro?',
    text: '¡No podrás revertir esto!',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Sí, eliminarlo'
  }).then(async (result) => {
    if (!result.isConfirmed) return;

    try {
      const { data, ok } = await fetchWithAuth(`${MCL_API_BASE}/productos/${productId}`, {
        method: 'DELETE'
      });

      if (ok) {
        Swal.fire('Éxito', 'Producto eliminado con éxito.', 'success');
        // refrescá la grilla de MCL
        if (typeof fetchProductosMCL === 'function') {
          await fetchProductosMCL();
        }
      } else {
        // data puede venir null si el backend no devuelve JSON
        const msg = (data && (data.message || data.error)) || 'Hubo un error al eliminar el producto';
        Swal.fire('Error', msg, 'error');
      }
    } catch (error) {
      console.error('Error al eliminar el producto:', error);
      Swal.fire('Error', 'Hubo un error al eliminar el producto', 'error');
    }
  });
}

// =============================
// Editar Producto (MCL)
// =============================
function isMobileDevice() {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

async function editProduct(productId) {
  try {
    // 1) Traer datos actuales
    const { data: prod, ok } = await fetchWithAuth(`${MCL_API_BASE}/productos/${productId}`, { method: 'GET' });
    if (!ok) {
      Swal.fire('Error', 'No se pudo obtener la información del producto.', 'error');
      return;
    }

    let selectedFiles = [];
    let currentFotos = (prod.Fotos || []).map(f => f.url);

    const { value: formValues } = await Swal.fire({
      title: 'Editar Producto',
      html: `
        <input id="mcl-name-edit" class="swal2-input" placeholder="Nombre *" value="${escapeHTML(prod.nombre) || ''}">
        <input id="mcl-version-edit" class="swal2-input" placeholder="Versión" value="${escapeHTML(prod.version || '')}">
        <input id="mcl-modelo-edit" type="text" class="swal2-input" placeholder="Modelo (ej: 2024 o 0km)" value="${prod.modelo ?? ''}">
        <input id="mcl-km-edit" type="number" class="swal2-input" placeholder="Kilómetros" value="${prod.kilometros || ''}">
        <textarea id="mcl-description-edit" class="swal2-input" placeholder="Descripción *">${escapeHTML(prod.descripcion || '')}</textarea>
        <input id="mcl-price-edit" type="number" class="swal2-input" placeholder="Precio *" value="${prod.precio ? Math.floor(Number(prod.precio)) : ''}">
        <input id="mcl-prioridad-edit" type="number" class="swal2-input" placeholder="Prioridad" value="${prod.prioridad ?? ''}">
        <label style="display:block; text-align:left; margin:0 0 4px 5px;"><b>Oculto *</b></label>
        <select id="mcl-oculto-edit" class="swal2-select" style="width:100%; padding:6px;">
          <option value="false" ${!prod.esOculto ? 'selected' : ''}>No</option>
          <option value="true" ${prod.esOculto ? 'selected' : ''}>Sí</option>
        </select>
        <label style="display:block; text-align:left; margin:12px 0 4px 5px;"><b>Imágenes actuales</b></label>
        <div id="mcl-images-preview-edit" style="display:flex; gap:8px; flex-wrap:wrap; margin-bottom:8px; min-height:70px;"></div>
        <label style="display:block; text-align:left; margin:12px 0 4px 5px;"><b>Cambiar Imágenes</b></label>
        <input id="mcl-images-edit" type="file" class="swal2-file" multiple>
        <div id="mcl-images-preview-new" style="display:flex; gap:8px; flex-wrap:wrap; margin-top:8px; min-height:70px;"></div>
        <small id="mcl-images-help-edit"></small>
        <div style="margin-top:8px;font-size:.8em;color:#888;">
          (Las imágenes existentes se mantienen si no seleccionás nuevas)
        </div>
      `,
      didOpen: () => {
        const isMobile = isMobileDevice();
        const previewEdit = document.getElementById('mcl-images-preview-edit');
        const inputEdit = document.getElementById('mcl-images-edit');
        const previewNew = document.getElementById('mcl-images-preview-new');
        const help = document.getElementById('mcl-images-help-edit');

        function renderCurrentFotos() {
          previewEdit.innerHTML = '';
          currentFotos.forEach(url => {
            const imgWrap = document.createElement('div');
            imgWrap.style.position = 'relative';
            imgWrap.style.display = 'inline-block';
            imgWrap.style.marginRight = '4px';

            const img = document.createElement('img');
            img.src = url;
            img.style.width = '60px';
            img.style.height = '60px';
            img.style.objectFit = 'cover';
            img.style.borderRadius = '6px';
            img.title = 'Imagen actual';

            imgWrap.appendChild(img);
            previewEdit.appendChild(imgWrap);
          });
        }

        function renderPreviewNew() {
          previewNew.innerHTML = '';
          selectedFiles.forEach((file, idx) => {
            const reader = new FileReader();
            reader.onload = function (e) {
              const imgWrap = document.createElement('div');
              imgWrap.style.position = 'relative';
              imgWrap.style.display = 'inline-block';
              imgWrap.style.marginRight = '4px';

              const img = document.createElement('img');
              img.src = e.target.result;
              img.style.width = '60px';
              img.style.height = '60px';
              img.style.objectFit = 'cover';
              img.style.borderRadius = '6px';
              img.title = file.name;

              imgWrap.appendChild(img);

              if (!isMobile) {
                imgWrap.draggable = true;
                imgWrap.style.cursor = 'grab';
                imgWrap.dataset.idx = idx;

                imgWrap.addEventListener('dragstart', (ev) => {
                  ev.dataTransfer.setData('text/plain', idx);
                  imgWrap.style.opacity = '0.5';
                });
                imgWrap.addEventListener('dragend', () => {
                  imgWrap.style.opacity = '';
                });
                imgWrap.addEventListener('dragover', (ev) => {
                  ev.preventDefault();
                  imgWrap.style.outline = '2px solid #2f2f8f';
                });
                imgWrap.addEventListener('dragleave', () => {
                  imgWrap.style.outline = '';
                });
                imgWrap.addEventListener('drop', (ev) => {
                  ev.preventDefault();
                  imgWrap.style.outline = '';
                  const fromIdx = Number(ev.dataTransfer.getData('text/plain'));
                  const toIdx = Number(imgWrap.dataset.idx);
                  if (fromIdx !== toIdx) {
                    const moved = selectedFiles.splice(fromIdx, 1)[0];
                    selectedFiles.splice(toIdx, 0, moved);
                    renderPreviewNew();
                  }
                });
              }

              previewNew.appendChild(imgWrap);
            };
            reader.readAsDataURL(file);
          });
        }

        renderCurrentFotos();

        inputEdit.addEventListener('change', function () {
          selectedFiles = Array.from(this.files);
          renderPreviewNew();
        });

        help.textContent = isMobile
          ? 'El orden de las imágenes será el de selección. Para reordenar, usá una computadora.'
          : 'Arrastrá las imágenes para reordenarlas antes de guardar.';
      },
      focusConfirm: false,
      confirmButtonText: 'Guardar',
      showCancelButton: true,
      preConfirm: () => {
        const name = document.getElementById('mcl-name-edit').value.trim();
        const version = document.getElementById('mcl-version-edit').value.trim();
        const modelo = document.getElementById('mcl-modelo-edit').value.trim();
        const km = document.getElementById('mcl-km-edit').value;
        const description = document.getElementById('mcl-description-edit').value.trim();
        const price = document.getElementById('mcl-price-edit').value;
        const prioridad = document.getElementById('mcl-prioridad-edit').value;
        const esOcultoStr = document.getElementById('mcl-oculto-edit').value;

        if (!name || !description || !price) {
          Swal.showValidationMessage('Campos obligatorios: Nombre, Descripción y Precio.');
          return false;
        }

        const precioNum = Number(price);
        if (!Number.isFinite(precioNum) || precioNum <= 0) {
          Swal.showValidationMessage('Ingresá un precio válido.');
          return false;
        }

        const kmNum = km ? Number(km) : null;
        if (km && (!Number.isFinite(kmNum) || kmNum < 0)) {
          Swal.showValidationMessage('Kilómetros inválidos.');
          return false;
        }

        const prioridadNum = prioridad ? Number(prioridad) : null;
        if (prioridad && (!Number.isFinite(prioridadNum) || prioridadNum < 0)) {
          Swal.showValidationMessage('Prioridad inválida (número >= 0).');
          return false;
        }

        const esOculto = esOcultoStr === 'true';

        return {
          name,
          version,
          modelo,
          km: kmNum,
          description,
          price: precioNum,
          prioridad: prioridadNum,
          esOculto,
          imageFiles: selectedFiles
        };
      }
    });

    if (!formValues) return;

    const { name, version, modelo, km, description, price, prioridad, esOculto, imageFiles } = formValues;

    // 2) Armado del FormData
    const formData = new FormData();
    const dataPayload = {
      nombre: name,
      version: version || null,
      modelo: modelo ?? null,
      kilometros: km ?? null,
      descripcion: description,
      precio: price.toFixed(2),
      prioridad: prioridad ?? null,
      esOculto: !!esOculto
    };
    formData.append('data', JSON.stringify(dataPayload));

    // ⬇️⬇️ CAMBIO CLAVE: convertir nuevas imágenes a JPG vía Cloudinary ⬇️⬇️
    if (imageFiles && imageFiles.length > 0) {
      for (const f of imageFiles) {
        const jpgFile = await toJpgFileViaCloudinary(f); // <- mismo helper que en "crear"
        formData.append('files', jpgFile);
      }
    }
    // ⬆️⬆️ FIN CAMBIO CLAVE ⬆️⬆️
    // (Si no se seleccionan nuevas, el backend mantiene las existentes)

    // 3) Enviar
    const { ok: okPut, data: dataPut } = await fetchWithAuth(`${MCL_API_BASE}/productos/${productId}`, {
      method: 'PUT',
      body: formData
    });

    if (okPut) {
      Swal.fire('Éxito', 'Producto editado correctamente.', 'success');
      if (typeof fetchProductosMCL === 'function') fetchProductosMCL();
    } else {
      Swal.fire('Error', (dataPut && (dataPut.error || dataPut.message)) || 'Error al editar el producto.', 'error');
    }
  } catch (err) {
    console.error('Error al editar producto:', err);
    Swal.fire('Error', 'Hubo un error al editar el producto.', 'error');
  }
}
