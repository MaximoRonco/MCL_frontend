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
        const carrusel = createCarouselMCL(fotos, prod.nombre);

        const info = document.createElement('div');
        info.className = 'product-info';

        const precioNum = parseFloat(prod.precio);
        const precioFmt = isFinite(precioNum)
          ? `$${Math.floor(precioNum).toLocaleString('es-AR')}`
          : `$${prod.precio}`;

        const kmFmt = prod.kilometros != null
          ? `${Number(prod.kilometros).toLocaleString('es-AR')} km`
          : '';

        info.innerHTML = `
          <strong>${escapeHTML(prod.nombre)}</strong><br>
          <p class="producto_descripcion">
            ${prod.version ? `<b>Versión:</b> ${escapeHTML(prod.version)}<br>` : ''}
            ${prod.modelo ? `<b>Modelo:</b> ${escapeHTML(String(prod.modelo))}<br>` : ''}
            ${kmFmt ? `<b>Kilómetros:</b> ${kmFmt}<br>` : ''}
            ${prod.descripcion ? `${escapeHTML(prod.descripcion)}` : ''}
          </p>
          <div class="divPrecio">${precioFmt}</div>
        `;

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

        card.appendChild(carrusel);
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

// 3) Carrusel simple (soporta N imágenes)
function createCarouselMCL(urls = [], altBase = 'foto') {
  const wrap = document.createElement('div');
  wrap.className = 'carousel';

  const imgsWrap = document.createElement('div');
  imgsWrap.className = 'carousel-images';

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
      if (i === 0) img.classList.add('active');
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
  return wrap;
}

function moveCarouselMCL(step, imgsWrap) {
  const imgs = imgsWrap.querySelectorAll('.carousel-image');
  if (!imgs.length) return;
  let current = Array.from(imgs).findIndex(img => img.classList.contains('active'));
  if (current === -1) current = 0;

  imgs[current].classList.remove('active');
  let next = current + step;
  if (next < 0) next = imgs.length - 1;
  if (next >= imgs.length) next = 0;
  imgs[next].classList.add('active');
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
