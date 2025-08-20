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


