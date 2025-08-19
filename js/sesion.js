// SweetAlert
function sweet(icon, text) {
    Swal.fire({
        icon: icon,
        text: text
    });
}


// Login
async function login() {
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();

    // Validar campos vacíos
    if (!username || !password) {
        Swal.fire({
            icon: 'warning',
            title: 'Campos vacíos',
            text: 'Por favor, ingrese el nombre de usuario y la contraseña.',
            customClass: {
                container: 'my-swal-container'
            }
        });
        return; // Detener la ejecución si hay campos vacíos
    }

    try {
        const response = await fetch(' https://mcl-backend-ten.vercel.app/usuarios/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ usuario: username, password: password })
        });

        const data = await response.json();

        if (response.ok && data.token) {
            // Almacenar el token en localStorage
            localStorage.setItem('authToken', data.token);

            // Mensaje de éxito y redirección
            Swal.fire({
                icon: 'success',
                title: 'Inicio de sesión exitoso',
                text: 'Redirigiendo...',
                timer: 1500,
                timerProgressBar: true,
                showConfirmButton: false,
                customClass: {
                    container: 'my-swal-container'
                }
            }).then(() => {
                localStorage.setItem('loggedIn', 'true'); // Guardar el estado de la sesión
                window.location.href = 'carrusel-admin.html';
            });
        } else {
            // Manejo de errores de autenticación
            sweet("error",data.error || "Nombre de usuario o contraseña incorrectos");
        }
        
    } catch (error) {
        console.error('Error durante el login:', error);
        sweet("error","Nombre de usuario o contraseña incorrectos");
    }
}

/* ACA CAMBIA EL TOKEN EN EL HEADER */
async function fetchWithAuth(url, options = {}) {
    const token = localStorage.getItem('authToken');
    if (!token) {
        throw new Error('Token not found');
    }

    options.headers = {
        ...options.headers,
        'Authorization': `Bearer ${token}`,
    };

    // Eliminar 'Content-Type' si el body es una instancia de FormData
    if (options.body instanceof FormData) {
        delete options.headers['Content-Type'];
    } else {
        options.headers['Content-Type'] = 'application/json';
    }

    const response = await fetch(url, options);
    let data;
    try {
        data = await response.json();
    } catch (error) {
        data = null;
    }
    return { data, ok: response.ok };
}

// Verificar si el usuario ha iniciado sesión
function checkLoginStatus() {
    if (localStorage.getItem('loggedIn') !== 'true') {
        alert('Debe iniciar sesión para acceder a esta página.');
        window.location.href = 'sesion.html'; // Redirigir a la página de inicio de sesión
    }
}

// Ejecutar la verificación de sesión solo en index-admin.html y menu-admin.html
if (window.location.pathname.endsWith('carrusel-admin.html') ||  window.location.pathname.endsWith('medidas-admin.html') ||  window.location.pathname.endsWith('ofertas-admin.html') ||  window.location.pathname.endsWith('productos-admin.html') ) {
    checkLoginStatus();
}

// Cerrar sesión
function logout() {
    localStorage.removeItem('loggedIn'); // Eliminar el estado de la sesión
}
/* FIN INCIO DE SESION */