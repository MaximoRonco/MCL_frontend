/* Funcionalidad btn wpp */

document.getElementById('btnWpp').addEventListener('click', function() {
    const phoneNumber = '3572503289'; 
    const message = encodeURIComponent('Hola, me gustaría obtener más información sobre los vehículos en MCL Automotores. ¡Gracias!'); 
    const whatsappURL = `https://wa.me/${phoneNumber}?text=${message}`;

    // Redirige a la URL de WhatsApp
    window.open(whatsappURL, '_blank');
});

/* Fin btn wpp */

/* ANIMACION DE LOS SERVICIOS */

// Selecciona todos los servicios
const items = document.querySelectorAll('.servicios .item');

// Asigna direcciones de animación alternadas
items.forEach((item, index) => {
  if (index % 2 === 0) {
    item.setAttribute('data-anim', 'left');
  } else {
    item.setAttribute('data-anim', 'right');
  }
});

// Observador para mostrar cuando entren en pantalla
const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('show');
    }
  });
}, { threshold: 0.2 });

items.forEach(item => observer.observe(item));



/* Fin animacion de los servicios */


/* Animacion de barra de info adicional */

document.addEventListener("DOMContentLoaded", () => {
    const marquee = document.querySelector(".marquee");

    // Solo duplicar si es móvil o tablet
    if (window.innerWidth <= 768) {
        marquee.innerHTML += marquee.innerHTML; // Duplica el contenido
    }
});


/* Fin animacion de barra de info adicional */


/* Animación de tarjetas del catálogo */
const cards = document.querySelectorAll('.card');

cards.forEach((card, index) => {
  // Alterna la dirección: par = izquierda, impar = derecha
  if (index % 2 === 0) {
    card.classList.add('from-left');
  }
});

const observerCard = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('show');
      observerCard.unobserve(entry.target); // No vuelve a ocultarse
    }
  });
}, { threshold: 0.2 }); // Se activa cuando 20% de la card es visible

cards.forEach(card => observerCard.observe(card));

/* Fin animación de tarjetas del catálogo */


/* Animación de la sección de contacto */

const contactoElements = document.querySelectorAll('.contacto, .formulario-container');

const observerContacto = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('show');
      observerContacto.unobserve(entry.target);
    }
  });
}, { threshold: 0.2 });

contactoElements.forEach(el => observerContacto.observe(el));
// Fin animación de la sección de contacto














// Menu hamburguesa
/*
document.addEventListener('DOMContentLoaded', function() {
  const menuToggle = document.getElementById('menuToggle');
  const navLinks = document.getElementById('navLinks');

  if (menuToggle && navLinks) {
    menuToggle.addEventListener('click', function() {
      navLinks.classList.toggle('menu-open');
      menuToggle.classList.toggle('active');
    });

    document.addEventListener('click', function(e) {
      if (!navLinks.contains(e.target) && !menuToggle.contains(e.target)) {
        navLinks.classList.remove('menu-open');
        menuToggle.classList.remove('active');
      }
    });
  }
});
*/
// Fin Menu hamburguesa


/* menu hamburguesa */
/*
document.addEventListener('DOMContentLoaded', function() {
    const menuToggle = document.querySelector('.menu-toggle');
    const navegacion = document.querySelector('.navegacion');
    const overlay = document.querySelector('.overlay');
    const menuClose = document.querySelector('.menu-close');

    // Abrir menú al hacer clic en el botón de menú
    menuToggle.addEventListener('click', function(event) {
        navegacion.classList.toggle('show');
        overlay.classList.toggle('show');
        event.stopPropagation();
    });

    // Cerrar menú al hacer clic en la cruz
    menuClose.addEventListener('click', function() {
        navegacion.classList.remove('show');
        overlay.classList.remove('show');
    });

    // Cerrar menú al hacer clic fuera de él
    document.addEventListener('click', function(event) {
        if (!navegacion.contains(event.target) && !menuToggle.contains(event.target)) {
            navegacion.classList.remove('show');
            overlay.classList.remove('show');
        }
    });

    // Evitar que el clic dentro del menú cierre el menú
    navegacion.addEventListener('click', function(event) {
        event.stopPropagation();
    });
});
*/