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
        card.appendChild(carrusel);
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


// ===== Modal =====
function openModal(prod) {
  const modal = document.getElementById('productModal');
  const modalContent = document.getElementById('modal-product-info');
  if (!modal || !modalContent) return;

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

  // Llenar el modal con la información (SIN prioridad, SIN oculto, SIN descripción)
  modalContent.innerHTML = `
    <strong>${escapeHTML(prod.nombre)}</strong><br>
    <p class="producto_descripcion">
      ${prod.version ? `<b>Versión:</b> ${escapeHTML(prod.version)}<br>` : ''}
      ${prod.modelo ? `<b>Modelo:</b> ${escapeHTML(String(prod.modelo))}<br>` : ''}
      ${kmFmt ? `<b>Kilómetros:</b> ${kmFmt}<br>` : ''}
      ${prod.descripcion ? `<b>Descripción:</b> ${escapeHTML(prod.descripcion)}<br>` : ''}
    </p>
    <div class="divPrecio">${precioFmt}</div>

    <!-- 🔹 Prioridad -->
    <div class="divPrioridad">
      <label><b>Prioridad:</b> ${prod.prioridad ?? '—'}</label>
    </div>

    <!-- 🔹 Oculto -->
    <div class="divOculto">
      <label for="oculto-${prod.id}"><b>Oculto:</b></label>
      <select id="oculto-${prod.id}" onchange="toggleOculto(${prod.id}, this.value)">
        <option value="false" ${!prod.esOculto ? 'selected' : ''}>No</option>
        <option value="true" ${prod.esOculto ? 'selected' : ''}>Sí</option>
      </select>
    </div>
    `;

  // Mostrar el modal
  modal.style.display = 'flex';
}

function closeModal() {
  const modal = document.getElementById('productModal');
  if (!modal) return;
  modal.style.display = 'none';
}



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
  categoryDiv.classList.add('category');
  categoryDiv.id = `category-${categoryId}`;

  categoryDiv.innerHTML = `
    <h2>${categoryTitle}</h2>
    <div class="contenedorBotonesCat">
      <button class="edit" onclick="editCategory('${categoryId}')">
        <i class="bi bi-pencil-square"></i> Categoría
      </button>
      <button class="delete" onclick="deleteCategory('${categoryId}')">
        <i class="bi bi-trash"></i> Categoría
      </button>
      <button class="add" onclick="addSubcategory('${categoryId}')">
        <i class="bi bi-plus-circle"></i> Subcategoría
      </button>
      <div id="subcategories-${categoryId}" class="subcategories"></div>
    </div>
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
  const categoryDiv = document.getElementById(`category-${categoryId}`);
  if (!categoryDiv) return;

  // Usar/crear contenedor de subcategorías bajo esta categoría
  let subList = document.getElementById(`subcategories-${categoryId}`);
  if (!subList) {
    subList = document.createElement('div');
    subList.id = `subcategories-${categoryId}`;
    subList.className = 'subcategories';
    categoryDiv.appendChild(subList);
  }

  const subDiv = document.createElement('div');
  subDiv.className = 'subcategory';
  subDiv.id = `subcategoria-${subcategoryId}`;
  subDiv.innerHTML = `
    <h3>${subcategoryTitle}</h3>
    <div class="contenedorBotonesSub">
      <button class="edit" onclick="editSubcategory(${Number(categoryId)}, ${Number(subcategoryId)})">
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
async function addProduct(subcategoryId) {
  // Modal con campos de MCL
  const { value: formValues } = await Swal.fire({
    title: 'Agregar Producto',
    html: `
      <input id="mcl-name" class="swal2-input" placeholder="Nombre *">
      <input id="mcl-version" class="swal2-input" placeholder="Versión (ej: High Line)">
      <input id="mcl-modelo" type="number" class="swal2-input" placeholder="Modelo (año)">
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
    `,
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
      const imageFiles = document.getElementById('mcl-images').files;

      // Validaciones mínimas
      if (!name || !description || !price || imageFiles.length === 0) {
        Swal.showValidationMessage('Campos obligatorios: Nombre, Descripción, Precio e Imágenes.');
        return false;
      }

      // Sanitización
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
        imageFiles
      };
    }
  });

  if (!formValues) return;

  const {
    name, version, modelo, km, description, price, prioridad, esOculto, imageFiles
  } = formValues;

  // ✅ Preview inmediato en el DOM (igual que Cardelli)
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

  // 📦 Armado del payload según tu modelo MCL
  const formData = new FormData();
  const dataPayload = {
    nombre: name,
    version: version || null,
    modelo: modelo ?? null,
    kilometros: km ?? null,
    descripcion: description,
    precio: price.toFixed(2),     // backend ejemplo usa string "13500000.00"
    prioridad: prioridad ?? null, // puede ir null si no la cargaron
    idSubCategoria: subcategoryId,
    esOculto: !!esOculto
  };
  formData.append('data', JSON.stringify(dataPayload));
  for (let i = 0; i < imageFiles.length; i++) {
    formData.append('files', imageFiles[i]);
  }

  // 🚀 POST al backend (autenticado)
  try {
    const { data, ok } = await fetchWithAuth(`${MCL_API_BASE}${MCL_UPLOAD_PATH}`, {
      method: 'POST',
      body: formData
    });

    if (ok) {
      Swal.fire('Éxito', 'Producto agregado con éxito.', 'success');
      // Si querés traer ID/fotos reales del backend:
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

  // Carrusel preview con ObjectURL
  const urls = Array.from(imageFiles).map(f => URL.createObjectURL(f));
  const carrusel = createCarouselMCL(urls, prod.nombre || 'foto');
  productDiv.appendChild(carrusel);

  // Info
  const productInfoDiv = document.createElement('div');
  productInfoDiv.classList.add('product-info');

  const precioFmt = Number.isFinite(Number(prod.precio))
    ? `$${Math.floor(Number(prod.precio)).toLocaleString('es-AR')}`
    : `$${String(prod.precio)}`;

  const kmFmt = prod.kilometros != null
    ? `${Number(prod.kilometros).toLocaleString('es-AR')} km`
    : '';

  const prioridadDisplay = (prod.prioridad ?? '') === '' ? '—' : String(prod.prioridad);

  productInfoDiv.innerHTML = `
    <div class="product-header-line" style="display:flex;justify-content:space-between;align-items:center;gap:8px;">
      <strong>${escapeHTML(prod.nombre || '')}</strong>
      <div class="badges" style="display:flex;gap:6px;align-items:center;">
        ${prod.esOculto ? `<span class="badge-oculto" style="font-size:.8rem;padding:2px 6px;border-radius:12px;background:#ffd6d6;border:1px solid #ff9f9f;">Oculto</span>` : ''}
        <span class="badge-prioridad" style="font-size:.8rem;padding:2px 6px;border-radius:12px;border:1px solid #ccc;">${prioridadDisplay}</span>
      </div>
    </div>
    <p class="producto_descripcion">
      ${prod.version ? `<b>Versión:</b> ${escapeHTML(prod.version)}<br>` : ''}
      ${prod.modelo ? `<b>Modelo:</b> ${escapeHTML(String(prod.modelo))}<br>` : ''}
      ${kmFmt ? `<b>Kilómetros:</b> ${kmFmt}<br>` : ''}
      ${prod.descripcion ? `${escapeHTML(prod.descripcion)}` : ''}
    </p>
    <div class="divPrecio">${precioFmt}</div>

    <div class="divOculto" style="margin-top:8px;">
      <label for="oculto-preview-${Date.now()}"><b>Oculto:</b></label>
      <select disabled>
        <option ${!prod.esOculto ? 'selected' : ''}>No</option>
        <option ${prod.esOculto ? 'selected' : ''}>Sí</option>
      </select>
    </div>
  `;

  productDiv.appendChild(productInfoDiv);

  // Botones (preview sin ID real aún)
  const productButtonsDiv = document.createElement('div');
  productButtonsDiv.classList.add('product-buttons');
  productButtonsDiv.innerHTML = `
    <div class="cont-btnProd">
      <button class="edit modProducto" disabled title="Disponible al recargar"><i class="bi bi-pencil-square"></i>Editar Producto</button>
      <button class="delete delProducto" disabled title="Disponible al recargar"><i class="bi bi-trash"></i>Eliminar Producto</button>
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
/*async function editProduct(productId) {
  try {
    // 1. Obtener datos actuales del producto
    const { data: prod, ok } = await fetchWithAuth(`${MCL_API_BASE}/productos/${productId}`, {
      method: 'GET'
    });
    if (!ok) {
      Swal.fire('Error', 'No se pudo obtener la información del producto.', 'error');
      return;
    }

    // 2. Mostrar modal de edición
    const { value: formValues } = await Swal.fire({
      title: 'Editar Producto',
      html: `
        <input id="mcl-name-edit" class="swal2-input" placeholder="Nombre *" value="${escapeHTML(prod.nombre) || ''}">
        <input id="mcl-version-edit" class="swal2-input" placeholder="Versión" value="${escapeHTML(prod.version || '')}">
        <input id="mcl-modelo-edit" type="number" class="swal2-input" placeholder="Modelo (año)" value="${prod.modelo || ''}">
        <input id="mcl-km-edit" type="number" class="swal2-input" placeholder="Kilómetros" value="${prod.kilometros || ''}">
        <textarea id="mcl-description-edit" class="swal2-input" placeholder="Descripción *">${escapeHTML(prod.descripcion || '')}</textarea>
        <input id="mcl-price-edit" type="number" class="swal2-input" placeholder="Precio *" value="${prod.precio || ''}">
        <input id="mcl-prioridad-edit" type="number" class="swal2-input" placeholder="Prioridad" value="${prod.prioridad ?? ''}">
        <label style="display:block; text-align:left; margin:0 0 4px 5px;"><b>Oculto *</b></label>
        <select id="mcl-oculto-edit" class="swal2-select" style="width:100%; padding:6px;">
          <option value="false" ${!prod.esOculto ? 'selected' : ''}>No</option>
          <option value="true" ${prod.esOculto ? 'selected' : ''}>Sí</option>
        </select>
        <label style="display:block; text-align:left; margin:12px 0 4px 5px;"><b>Cambiar Imágenes</b></label>
        <input id="mcl-images-edit" type="file" class="swal2-file" multiple>
        <div style="margin-top:8px;font-size:.8em;color:#888;">
          (Las imágenes existentes se mantienen si no seleccionás nuevas)
        </div>
      `,
      focusConfirm: false,
      confirmButtonText: 'Guardar',
      showCancelButton: true,
      preConfirm: () => {
        const name = document.getElementById('mcl-name-edit').value.trim();
        const version = document.getElementById('mcl-version-edit').value.trim();
        const modelo = document.getElementById('mcl-modelo-edit').value;
        const km = document.getElementById('mcl-km-edit').value;
        const description = document.getElementById('mcl-description-edit').value.trim();
        const price = document.getElementById('mcl-price-edit').value;
        const prioridad = document.getElementById('mcl-prioridad-edit').value;
        const esOcultoStr = document.getElementById('mcl-oculto-edit').value;
        const imageFiles = document.getElementById('mcl-images-edit').files;

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
          imageFiles
        };
      }
    });

    if (!formValues) return;

    // 3. Preparar y hacer el PUT (o el método que tu backend espere)
    const {
      name, version, modelo, km, description, price, prioridad, esOculto, imageFiles
    } = formValues;

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
    if (imageFiles && imageFiles.length) {
      for (let i = 0; i < imageFiles.length; i++) {
        formData.append('files', imageFiles[i]);
      }
    }

    const { ok: okPut, data: dataPut } = await fetchWithAuth(`${MCL_API_BASE}/productos/${productId}`, {
      method: 'PUT',
      body: formData
    });

    if (okPut) {
      Swal.fire('Éxito', 'Producto editado correctamente.', 'success');
      if (typeof fetchProductosMCL === 'function') {
        fetchProductosMCL();
      }
    } else {
      Swal.fire('Error', (dataPut && dataPut.error) || 'Error al editar el producto.', 'error');
    }
  } catch (err) {
    console.error('Error al editar producto:', err);
    Swal.fire('Error', 'Hubo un error al editar el producto.', 'error');
  }
}*/