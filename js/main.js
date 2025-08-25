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

