// Cierra el menu desplegable de ediciones al hacer clic en una opcion o fuera de el
const dropdown = document.querySelector('.nav-dropdown');

if (dropdown) {
    // Cerrar al hacer clic en cualquier opcion del menu
    dropdown.querySelectorAll('.nav-dropdown-menu a').forEach(link => {
        link.addEventListener('click', () => {
            dropdown.removeAttribute('open');
        });
    });

    // Cerrar al hacer clic en cualquier otra parte de la pagina
    document.addEventListener('click', (event) => {
        if (!dropdown.contains(event.target)) {
            dropdown.removeAttribute('open');
        }
    });

    // Asegurar que quede cerrado si se navega atras/adelante (cache bfcache del navegador)
    window.addEventListener('pageshow', () => {
        dropdown.removeAttribute('open');
    });
}

// ══════════════════════════════════════════
// Navegación móvil + offset de las anclas
// El menú se despliega con el botón hamburguesa
// y el header deja de tapar los títulos.
// ══════════════════════════════════════════
const siteHeader = document.querySelector('header');
const menuToggle = document.querySelector('.menu-toggle');
const mainNav = document.getElementById('menu-principal');

function actualizarAlturaHeader() {
    if (!siteHeader) return;
    document.documentElement.style.setProperty('--header-height', `${siteHeader.offsetHeight}px`);
}

if (siteHeader && menuToggle && mainNav) {
    const abrirMenu = () => {
        siteHeader.classList.add('menu-abierto');
        menuToggle.setAttribute('aria-expanded', 'true');
        menuToggle.setAttribute('aria-label', 'Cerrar menú');
    };

    const cerrarMenu = () => {
        siteHeader.classList.remove('menu-abierto');
        menuToggle.setAttribute('aria-expanded', 'false');
        menuToggle.setAttribute('aria-label', 'Abrir menú');
    };

    menuToggle.addEventListener('click', () => {
        if (siteHeader.classList.contains('menu-abierto')) {
            cerrarMenu();
        } else {
            abrirMenu();
        }
    });

    // Al elegir una opción se cierra el menú y se navega normalmente
    mainNav.querySelectorAll('a').forEach((link) => {
        link.addEventListener('click', cerrarMenu);
    });

    // Cerrar al tocar fuera del header
    document.addEventListener('click', (event) => {
        if (siteHeader.classList.contains('menu-abierto') && !siteHeader.contains(event.target)) {
            cerrarMenu();
        }
    });

    // Cerrar con Escape
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            cerrarMenu();
        }
    });

    // Al volver al escritorio, restaurar el menú normal
    window.addEventListener('resize', () => {
        if (window.innerWidth > 980) {
            cerrarMenu();
        }
        actualizarAlturaHeader();
    });

    // Recalcular si el header cambia de altura
    if ('ResizeObserver' in window) {
        new ResizeObserver(actualizarAlturaHeader).observe(siteHeader);
    }
}

actualizarAlturaHeader();
window.addEventListener('load', actualizarAlturaHeader);

// ══════════════════════════════════════════
// Ventanas legales: Política, Términos y FAQ
// Se abren con <dialog> sobre la misma página,
// sin crear archivos HTML adicionales.
// ══════════════════════════════════════════
const legalTriggers = document.querySelectorAll('[data-dialog]');
const legalDialogs = document.querySelectorAll('dialog.legal-modal');

legalTriggers.forEach((trigger) => {
    trigger.addEventListener('click', () => {
        const dialog = document.getElementById(trigger.dataset.dialog);
        if (!dialog) return;

        dialog.showModal();
        document.body.classList.add('modal-abierto');
    });
});

legalDialogs.forEach((dialog) => {
    const closeButton = dialog.querySelector('.legal-modal-cerrar');

    if (closeButton) {
        closeButton.addEventListener('click', () => dialog.close());
    }

    // Cerrar al hacer clic fuera de la ventana (sobre el fondo oscuro)
    dialog.addEventListener('click', (event) => {
        if (event.target === dialog) {
            dialog.close();
        }
    });

    // Restaurar el scroll al cerrar (incluye la tecla Escape)
    dialog.addEventListener('close', () => {
        const anotherOpen = document.querySelector('dialog.legal-modal[open]');
        if (!anotherOpen) {
            document.body.classList.remove('modal-abierto');
        }
    });
});

// ══════════════════════════════════════════
// Carrusel de imágenes — sección Fundadores
// Avanza solo, responde a flechas, puntos,
// teclado y gesto de arrastre en móvil.
// ══════════════════════════════════════════
document.querySelectorAll('[data-carrusel]').forEach((carrusel) => {
    const track = carrusel.querySelector('.carrusel-track');
    const slides = Array.from(carrusel.querySelectorAll('.carrusel-slide'));
    const dotsWrap = carrusel.querySelector('.carrusel-dots');
    const prev = carrusel.querySelector('.carrusel-prev');
    const next = carrusel.querySelector('.carrusel-next');

    if (!track || !dotsWrap || slides.length === 0) return;

    let index = 0;
    let autoplayId = null;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

    const dots = slides.map((_, i) => {
        const dot = document.createElement('button');
        dot.type = 'button';
        dot.className = 'carrusel-dot';
        dot.setAttribute('aria-label', `Ir a la imagen ${i + 1} de ${slides.length}`);
        dot.setAttribute('aria-current', 'false');
        dot.addEventListener('click', () => {
            irA(i);
            iniciarAutoplay();
        });
        dotsWrap.appendChild(dot);
        return dot;
    });

    function irA(n) {
        index = (n + slides.length) % slides.length;
        track.style.transform = `translateX(-${index * 100}%)`;
        dots.forEach((dot, i) => dot.setAttribute('aria-current', String(i === index)));
        slides.forEach((slide, i) => slide.setAttribute('aria-hidden', String(i !== index)));
    }

    function siguiente() { irA(index + 1); }
    function anterior() { irA(index - 1); }

    function detenerAutoplay() {
        if (autoplayId) {
            clearInterval(autoplayId);
            autoplayId = null;
        }
    }

    function iniciarAutoplay() {
        detenerAutoplay();
        if (reduceMotion.matches || slides.length < 2) return;
        autoplayId = setInterval(siguiente, 4000);
    }

    if (prev) prev.addEventListener('click', () => { anterior(); iniciarAutoplay(); });
    if (next) next.addEventListener('click', () => { siguiente(); iniciarAutoplay(); });

    carrusel.addEventListener('keydown', (event) => {
        if (event.key === 'ArrowLeft') {
            event.preventDefault();
            anterior();
            iniciarAutoplay();
        } else if (event.key === 'ArrowRight') {
            event.preventDefault();
            siguiente();
            iniciarAutoplay();
        }
    });

    // Pausa mientras el visitante mira o interactúa con el carrusel
    carrusel.addEventListener('mouseenter', detenerAutoplay);
    carrusel.addEventListener('mouseleave', iniciarAutoplay);
    carrusel.addEventListener('focusin', detenerAutoplay);
    carrusel.addEventListener('focusout', (event) => {
        if (!carrusel.contains(event.relatedTarget)) iniciarAutoplay();
    });
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) detenerAutoplay();
        else iniciarAutoplay();
    });

    // Deslizar con el dedo / arrastrar con el mouse
    let inicioX = null;
    carrusel.addEventListener('pointerdown', (event) => {
        inicioX = event.clientX;
    });
    carrusel.addEventListener('pointerup', (event) => {
        if (inicioX === null) return;
        const delta = event.clientX - inicioX;
        inicioX = null;
        if (Math.abs(delta) < 40) return;
        if (delta < 0) siguiente();
        else anterior();
        iniciarAutoplay();
    });
    carrusel.addEventListener('pointercancel', () => {
        inicioX = null;
    });

    irA(0);
    iniciarAutoplay();
});
