/* ==== Carrusel MCL (solo GET + mostrar) ==== */

async function fetchCarruselMCL() {
  try {
    const res = await fetch('https://mcl-backend-ten.vercel.app/carrusel/urls');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    const urls = Array.isArray(data) ? data : (data && data.urls) || [];
    displayCarruselMCL(urls);
  } catch (err) {
    console.error('Error al traer carrusel MCL:', err);
    displayCarruselMCL([]); // si falla, muestra vacío
  }
}

function displayCarruselMCL(urls) {
  const carouselInner = document.getElementById('carousel-inner');
  if (!carouselInner) return;

  carouselInner.innerHTML = '';

  if (!Array.isArray(urls) || urls.length === 0) {
    const itemDiv = document.createElement('div');
    itemDiv.className = 'carousel-item active';
    const empty = document.createElement('div');
    empty.style.cssText = 'display:flex;align-items:center;justify-content:center;height:240px;background:#f5f5f5;';
    empty.textContent = 'Sin imágenes de carrusel';
    itemDiv.appendChild(empty);
    carouselInner.appendChild(itemDiv);
    return;
  }

  urls.forEach((url, index) => {
    const itemDiv = document.createElement('div');
    itemDiv.className = 'carousel-item' + (index === 0 ? ' active' : '');

    const img = document.createElement('img');
    img.src = url;
    img.className = 'd-block w-100';
    img.alt = `Slide ${index + 1}`;

    itemDiv.appendChild(img);
    carouselInner.appendChild(itemDiv);
  });
}

// Cargar carrusel al abrir la página
window.addEventListener('load', fetchCarruselMCL);


/* ==== Carrusel MCL: agregar y eliminar ==== */

async function addImageToCarouselMCL() {
  Swal.fire({
    title: '¿Estás seguro?',
    text: "¡Quieres agregar esta imagen al carrusel!",
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: 'Sí, agregar'
  }).then(async (result) => {
    if (!result.isConfirmed) return;

    const imageInput = document.getElementById('imageInput');
    const file = imageInput.files[0];

    if (!file) {
      Swal.fire('Error', 'Por favor, selecciona una imagen para agregar.', 'error');
      return;
    }

    const formData = new FormData();
    formData.append('file', file); // el backend espera 'file'

    try {
      const { data, ok } = await fetchWithAuth('https://mcl-backend-ten.vercel.app/carrusel/', {
        method: 'POST',
        body: formData
      });

      if (ok) {
        Swal.fire('Éxito', 'Imagen agregada al carrusel correctamente.', 'success');
        await fetchCarruselMCL(); // refresca el carrusel
      } else {
        const msg = (data && (data.error || data.message)) || 'No se pudo agregar la imagen';
        Swal.fire('Error', msg, 'error');
      }
    } catch (error) {
      console.error('Error al agregar la imagen:', error);
      Swal.fire('Error', 'Hubo un error al agregar la imagen.', 'error');
    }
  });
}

async function deleteImageFromCarouselMCL() {
  Swal.fire({
    title: '¿Estás seguro?',
    text: "¡No podrás revertir esto!",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Sí, eliminar'
  }).then(async (result) => {
    if (!result.isConfirmed) return;

    const activeItem = document.querySelector('.carousel-inner .active');
    if (!activeItem) {
      Swal.fire('Error', 'No hay una imagen activa para eliminar.', 'error');
      return;
    }

    const img = activeItem.querySelector('img');
    const imageUrl = img.src;

    try {
      const { data, ok } = await fetchWithAuth('https://mcl-backend-ten.vercel.app/carrusel/img', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ src: imageUrl }) // ⚠️ confirmá si tu backend espera { src } o { url }
      });

      if (ok) {
        Swal.fire('Éxito', 'Imagen eliminada correctamente.', 'success');
        await fetchCarruselMCL(); // refresca el carrusel
      } else {
        const msg = (data && (data.error || data.message)) || 'No se pudo eliminar la imagen';
        Swal.fire('Error', msg, 'error');
      }
    } catch (error) {
      console.error('Error al eliminar la imagen:', error);
      Swal.fire('Error', 'Hubo un error al eliminar la imagen.', 'error');
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
    // Función para inicializar el carrusel
    const initializeCarousel = () => {
        const carousel = new bootstrap.Carousel(document.querySelector('#carouselExampleFade'), {
            interval: 2000, // Intervalo de 2 segundos
            ride: 'carousel'
        });
    };
    initializeCarousel();
});


/* Eventos de botones */
document.getElementById('addImageBtn').addEventListener('click', addImageToCarouselMCL);
document.getElementById('deleteImageBtn').addEventListener('click', deleteImageFromCarouselMCL);
