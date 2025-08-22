// Guarda los datos originales para filtrar sin perderlos
window.productosMCL_ORIGINAL = window.productosMCL_ORIGINAL || [];

// Función de filtrado global
window.filtrarPorBusqueda = function() {
  const input = document.getElementById('buscar-input');
  if (!input) return;
  const query = input.value.trim().toLowerCase();

  if (!query) {
    if (window.displayProductosMCL && window.productosMCL_ORIGINAL)
      window.displayProductosMCL(window.productosMCL_ORIGINAL);
    return;
  }

  // Filtra categorías, subcategorías y productos
  const filtrado = (window.productosMCL_ORIGINAL || [])
    .map(cat => {
      const catMatch = cat.nombre && cat.nombre.toLowerCase().includes(query);

      const subFiltradas = (cat.SubCategorias || []).map(sub => {
        const subMatch = sub.nombre && sub.nombre.toLowerCase().includes(query);

        const prodFiltrados = (sub.Productos || []).filter(prod => {
          const nombre = (prod.nombre || '').toLowerCase();
          const version = (prod.version || '').toLowerCase();
          const modelo = String(prod.modelo || '').toLowerCase();
          const km = String(prod.kilometros || '').toLowerCase();
          const precio = String(prod.precio || '').toLowerCase();

          return (
            nombre.includes(query) ||
            version.includes(query) ||
            modelo.includes(query) ||
            km.includes(query) ||
            precio.includes(query)
          );
        });

        if (subMatch || prodFiltrados.length > 0) {
          return { ...sub, Productos: prodFiltrados };
        }
        return null;
      }).filter(Boolean);

      if (catMatch || subFiltradas.length > 0) {
        return { ...cat, SubCategorias: subFiltradas };
      }
      return null;
    })
    .filter(Boolean);

  if (window.displayProductosMCL)
    window.displayProductosMCL(filtrado);
};

// Asigna eventos al input y al botón de búsqueda
document.addEventListener('DOMContentLoaded', () => {
  const input = document.getElementById('buscar-input');
  const btn = document.getElementById('buscar-btn');
  if (input) input.addEventListener('keyup', window.filtrarPorBusqueda);
  if (btn) btn.addEventListener('click', window.filtrarPorBusqueda);
});