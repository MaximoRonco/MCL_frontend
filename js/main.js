/* Funcionalidad btn wpp */

document.getElementById('btnWpp').addEventListener('click', function() {
    const phoneNumber = '3572503289'; 
    const message = encodeURIComponent('Hola, me gustaría obtener más información sobre los vehículos en MCL Automotores. ¡Gracias!'); 
    const whatsappURL = `https://wa.me/${phoneNumber}?text=${message}`;

    // Redirige a la URL de WhatsApp
    window.open(whatsappURL, '_blank');
});

/* Fin btn wpp */