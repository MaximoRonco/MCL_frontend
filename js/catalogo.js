document.addEventListener('DOMContentLoaded', fetchCatalogoMCL);

async function fetchCatalogoMCL() {
  const URL = 'https://mcl-backend-ten.vercel.app/productos';
  const contenedor = document.getElementById('lista-vehiculos');
  contenedor.innerHTML = '<p>Cargando productos...</p>';

  try {
    const resp = await fetch(URL);
    if (!resp.ok) throw new Error('Error al cargar productos');
    const data = await resp.json();

    if (!Array.isArray(data) || data.length === 0) {
      contenedor.innerHTML = '<p>No hay productos disponibles.</p>';
      return;
    }

    contenedor.innerHTML = '';
    data.forEach(prod => {
      const card = document.createElement('div');
      card.className = 'card';

      // Imagen principal (primera foto o placeholder)
        let imgHtml = '';
        if (prod.Fotos && prod.Fotos.length > 0) {
        imgHtml = `<img src="${prod.Fotos[0].url}" alt="${escapeHTML(prod.nombre)}" class="card-img-top" style="width:100%;height:180px;object-fit:cover;border-radius:8px 8px 0 0;">`;
        } else {
        imgHtml = `<div style="width:100%;height:180px;display:flex;align-items:center;justify-content:center;background:#eee;color:#888;border-radius:8px 8px 0 0;font-size:1.1rem;">Sin imagen</div>`;
        }
        card.innerHTML = `
        ${imgHtml}
        <div class="card-body">
            <h3>${escapeHTML(prod.nombre)}</h3>
            <p>${prod.descripcion ? escapeHTML(prod.descripcion) : ''}</p>
            <hr>
            <div class="card-info">
            <p><b>Precio:</b> $${Number(prod.precio).toLocaleString('es-AR')}</p>
            ${prod.modelo ? `<p><b>Modelo:</b> ${escapeHTML(String(prod.modelo))}</p>` : ''}
            ${prod.kilometros ? `<p><b>Kilómetros:</b> ${Number(prod.kilometros).toLocaleString('es-AR')} km</p>` : ''}
            </div>
        </div>
        `;
      contenedor.appendChild(card);
    });
  } catch (err) {
    contenedor.innerHTML = '<p style="color:#b11">No se pudieron cargar los productos.</p>';
    console.error(err);
  }
}

// Función para evitar XSS en los textos
function escapeHTML(str) {
  return String(str).replace(/[&<>"']/g, s => (
    ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[s])
  ));
}