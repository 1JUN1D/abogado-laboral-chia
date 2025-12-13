// ===================================
// MAIN.JS - JavaScript Modular
// Para todas las páginas del sitio
// ===================================

// Cargar navbar
fetch('navbar.html')
    .then(response => response.text())
    .then(data => {
        document.getElementById('navbar-placeholder').innerHTML = data;
        initMobileMenu();
    })
    .catch(error => console.error('Error loading navbar:', error));

// Cargar footer
fetch('footer.html')
    .then(response => response.text())
    .then(data => {
        document.getElementById('footer-placeholder').innerHTML = data;
    })
    .catch(error => console.error('Error loading footer:', error));

// Cargar service areas
const serviceAreasPlaceholder = document.getElementById('service-areas-placeholder');
if (serviceAreasPlaceholder) {
    fetch('service-areas.html')
        .then(response => response.text())
        .then(data => {
            serviceAreasPlaceholder.innerHTML = data;
        })
        .catch(error => console.error('Error loading service areas:', error));
}

// Cargar map
const mapPlaceholder = document.getElementById('map-placeholder');
if (mapPlaceholder) {
    fetch('map.html')
        .then(response => response.text())
        .then(data => {
            mapPlaceholder.innerHTML = data;
        })
        .catch(error => console.error('Error loading map:', error));
}

// Cargar WhatsApp button
fetch('whatsapp-button.html')
    .then(response => response.text())
    .then(data => {
        document.getElementById('whatsapp-placeholder').innerHTML = data;
    })
    .catch(error => console.error('Error loading WhatsApp button:', error));

// ===================================
// MENÚ MÓVIL
// ===================================
function initMobileMenu() {
    const menuToggle = document.querySelector('.menu-toggle');
    const navMenu = document.querySelector('.nav-menu');
    
    if (menuToggle && navMenu) {
        menuToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            menuToggle.classList.toggle('active');
        });

        // Cerrar menú al hacer click en un enlace
        const navLinks = navMenu.querySelectorAll('a');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
                menuToggle.classList.remove('active');
            });
        });

        // Cerrar menú al hacer click fuera
        document.addEventListener('click', (e) => {
            if (!menuToggle.contains(e.target) && !navMenu.contains(e.target)) {
                navMenu.classList.remove('active');
                menuToggle.classList.remove('active');
            }
        });
    }
}

// ===================================
// SMOOTH SCROLL
// ===================================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// ===================================
// SCROLL TO TOP
// ===================================
window.addEventListener('scroll', () => {
    const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
    
    // Añadir clase al navbar cuando se hace scroll
    const navbar = document.querySelector('.navbar');
    if (navbar) {
        if (scrollTop > 100) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    }
});

// ===================================
// LAZY LOADING DE IMÁGENES
// ===================================
if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.remove('lazy');
                imageObserver.unobserve(img);
            }
        });
    });

    document.querySelectorAll('img.lazy').forEach(img => {
        imageObserver.observe(img);
    });
}

// ===================================
// ANIMACIONES AL SCROLL
// ===================================
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const fadeInObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('fade-in');
        }
    });
}, observerOptions);

// Observar elementos que tendrán animación
document.addEventListener('DOMContentLoaded', () => {
    const animatedElements = document.querySelectorAll('.service-card, .benefit-card, .area-card, .feature-item, .process-step');
    animatedElements.forEach(el => {
        fadeInObserver.observe(el);
    });
});

// ===================================
// VALIDACIÓN DE FORMULARIOS
// ===================================
const forms = document.querySelectorAll('form');
forms.forEach(form => {
    form.addEventListener('submit', (e) => {
        const inputs = form.querySelectorAll('input[required], textarea[required]');
        let isValid = true;

        inputs.forEach(input => {
            if (!input.value.trim()) {
                isValid = false;
                input.classList.add('error');
            } else {
                input.classList.remove('error');
            }
        });

        if (!isValid) {
            e.preventDefault();
            alert('Por favor complete todos los campos obligatorios');
        }
    });
});

// ===================================
// CONSOLA - INFO DEL SITIO
// ===================================
console.log('%c Miguel Bermúdez - Abogado Laboral ', 'background: #1a3a52; color: #d4af37; font-size: 16px; padding: 10px;');
console.log('%c Sitio desarrollado con SEO LOCAL MASTER ', 'background: #2c5f7f; color: white; font-size: 12px; padding: 5px;');