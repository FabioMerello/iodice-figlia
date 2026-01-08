document.addEventListener('DOMContentLoaded', () => {
    // ====== NAVBAR / HERO SAFE ======
    const navbar = document.getElementById('navbar');
    const hero = document.getElementById('hero') || document.querySelector('.hero'); // fallback per pagine categoria
    const nav = document.getElementById('nav');
    const menuToggle = document.getElementById('menu-toggle');

    const updateNavbarOnScroll = () => {
        if (!navbar) return;
        if (hero) {
            const heroBottom = hero.offsetTop + hero.offsetHeight;
            if (window.scrollY > heroBottom - 60) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        } else {
            if (window.scrollY > 20) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        }
    };

    updateNavbarOnScroll();
    window.addEventListener('scroll', updateNavbarOnScroll);

    // ====== MENU TOGGLE (robusto) ======
    if (menuToggle && nav) {
        menuToggle.addEventListener('click', () => {
            nav.classList.toggle('open');
            menuToggle.classList.toggle('active');
            const opened = nav.classList.contains('open');
            menuToggle.setAttribute('aria-expanded', opened ? 'true' : 'false');
        });

        nav.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                nav.classList.remove('open');
                menuToggle.classList.remove('active');
                menuToggle.setAttribute('aria-expanded', 'false');
            });
        });
    }

// LEGGI DI PIù
    document.querySelectorAll('.show-more-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const fullDesc = btn.nextElementSibling;

            if (fullDesc.style.maxHeight && fullDesc.style.maxHeight !== '0px') {
                // Chiudi
                fullDesc.style.maxHeight = '0';
                fullDesc.style.opacity = 0;
                btn.textContent = 'Leggi di più';
            } else {
                // Apri
                fullDesc.style.maxHeight = fullDesc.scrollHeight + 'px';
                fullDesc.style.opacity = 1;
                btn.textContent = 'Chiudi';
            }
        });
    });



    // FORM PRODOTTI
    document.querySelectorAll('.toggle-form-btn').forEach(button => {
        button.addEventListener('click', () => {
            const form = button.nextElementSibling;
            form.classList.toggle('active');
            button.textContent = form.classList.contains('active')
                ? 'Chiudi Modulo ✖'
                : 'Richiedi Preventivo';
        });
    });

    // ====== SCROLL FLUIDO (con offset per navbar) ======
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href') || '';
            if (href.startsWith('#')) {
                e.preventDefault();
                const targetID = href.substring(1);
                const targetElement = document.getElementById(targetID);

                if (targetElement) {
                    const header = document.getElementById('navbar');
                    const headerHeight = header ? header.offsetHeight : 0;
                    const y = targetElement.getBoundingClientRect().top + window.pageYOffset - headerHeight - 10;

                    window.scrollTo({
                        top: y,
                        behavior: 'smooth'
                    });
                }
            }
        });
    });

    // ====== AOS (se presente) ======
    if (typeof AOS !== 'undefined') {
        AOS.init({ duration: 800, once: true });
    }

    // ====== SWIPER (solo se presente nella pagina) ======
    if (typeof Swiper !== 'undefined' && document.querySelector('.mySwiper')) {
        new Swiper('.mySwiper', {
            slidesPerView: 1,
            spaceBetween: 20,
            loop: true,
            autoplay: { delay: 2500, disableOnInteraction: false },
            pagination: { el: '.swiper-pagination', clickable: true },
            navigation: { nextEl: '.swiper-button-next', prevEl: '.swiper-button-prev' },
        });
    }

    // ====== COOKIE BANNER (solo se presente nella pagina) ======
    const banner = document.getElementById('cookie-banner');
    const acceptBtn = document.getElementById('accept-cookies');

    if (banner && acceptBtn) {
        function hideBanner() {
            banner.classList.remove('show');
            setTimeout(() => { banner.style.display = 'none'; }, 600);
        }
        function showBanner() {
            banner.style.display = 'flex';
            setTimeout(() => { banner.classList.add('show'); }, 50);
        }
        if (localStorage.getItem('cookieAccepted') !== 'true') {
            showBanner();
        }
        acceptBtn.addEventListener('click', () => {
            localStorage.setItem('cookieAccepted', 'true');
            hideBanner();
        });
    }

    // ====== FILTRI PRODOTTI (sezione categoria) ======
    const productsGrid = document.getElementById('products-grid');
    if (productsGrid) {
        const searchInput = document.getElementById('search-input');
        const sortPrice = document.getElementById('sort-price');
        const categoryFilter = document.getElementById('filter-category');
        const priceBand = document.getElementById('filter-price');

        const getCards = () => Array.from(productsGrid.querySelectorAll('.product-card'));

        function matchesPriceBand(price, band) {
            if (band === 'low') return price < 15;
            if (band === 'mid') return price >= 15 && price <= 20;
            if (band === 'high') return price > 20;
            return true;
        }

        function applyFilters() {
            const text = (searchInput?.value || '').toLowerCase();
            const cat = categoryFilter?.value || 'all';
            const band = priceBand?.value || 'all';

            getCards().forEach(card => {
                const title = card.querySelector('h3')?.textContent.toLowerCase() || '';
                const desc = card.querySelector('p')?.textContent.toLowerCase() || '';
                const price = parseFloat(card.dataset.price || '0');
                const cardCat = card.dataset.category || '';

                const okText = title.includes(text) || desc.includes(text);
                const okCat = (cat === 'all') || (cardCat === cat);
                const okPrice = matchesPriceBand(price, band);

                card.style.display = (okText && okCat && okPrice) ? 'flex' : 'none';
            });
        }

        function applySort() {
            if (!sortPrice || sortPrice.value === 'default') return;
            const cards = getCards();

            cards.sort((a, b) => {
                const pa = parseFloat(a.dataset.price || '0');
                const pb = parseFloat(b.dataset.price || '0');
                return sortPrice.value === 'asc' ? pa - pb : pb - pa;
            });

            const visible = cards.filter(c => c.style.display !== 'none');
            const hidden = cards.filter(c => c.style.display === 'none');

            productsGrid.innerHTML = '';
            visible.concat(hidden).forEach(c => productsGrid.appendChild(c));
        }

        function updateList() {
            applyFilters();
            applySort();
        }

        if (searchInput) searchInput.addEventListener('input', updateList);
        if (sortPrice) sortPrice.addEventListener('change', updateList);
        if (categoryFilter) categoryFilter.addEventListener('change', updateList);
        if (priceBand) priceBand.addEventListener('change', updateList);

        updateList();
    }
});

// ====== SLIDER GALLERY ======
document.addEventListener('DOMContentLoaded', () => {
    const wrapper = document.querySelector('.slides-wrapper');
    const slides = document.querySelectorAll('.slide');
    const nextBtn = document.querySelector('.slider-btn.next');
    const prevBtn = document.querySelector('.slider-btn.prev');
    let current = 0;

    function updateSlider() {
        wrapper.style.transform = `translateX(-${current * 100}%)`;
    }

    nextBtn.addEventListener('click', () => {
        current = (current + 1) % slides.length;
        updateSlider();
    });

    prevBtn.addEventListener('click', () => {
        current = (current - 1 + slides.length) % slides.length;
        updateSlider();
    });
});


// FAQ toggle
document.querySelectorAll(".faq-question").forEach(btn => {
    btn.addEventListener("click", () => {
        const answer = btn.nextElementSibling;
        btn.classList.toggle("active");
        if (answer.style.display === "block") {
            answer.style.display = "none";
            btn.querySelector("span").textContent = "+";
        } else {
            answer.style.display = "block";
            btn.querySelector("span").textContent = "−";
        }
    });
});

// Counter animati
const counters = document.querySelectorAll('.counter');
let countersStarted = false;

function animateCounters() {
    counters.forEach(counter => {
        const update = () => {
            const target = +counter.getAttribute('data-target');
            const current = +counter.innerText;
            const increment = Math.ceil(target / 100);

            if (current < target) {
                counter.innerText = current + increment;
                setTimeout(update, 30);
            } else {
                counter.innerText = target;
            }
        };
        update();
    });
}

window.addEventListener('scroll', () => {
    const section = document.querySelector('#counters');
    if (!section) return;
    const sectionPos = section.getBoundingClientRect().top;
    const screenPos = window.innerHeight;
    if (sectionPos < screenPos && !countersStarted) {
        animateCounters();
        countersStarted = true;
    }
});

document.addEventListener("DOMContentLoaded", () => {

    const mapWrapper = document.getElementById("map-wrapper");
    const banner = document.getElementById("cookie-banner");
    const acceptBtn = document.getElementById("accept-cookies");

    const mapIframe = `
        <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d96570.15566107836!2d14.246602349999998!3d40.85393345!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x133b0866db7afaeb%3A0xd23a43cc658cb87e!2sNapoli%20NA!5e0!3m2!1sit!2sit!4v1758658099120!5m2!1sit!2sit"
            width="600"
            height="450"
            style="border:0;"
            allowfullscreen
            loading="lazy"
            referrerpolicy="no-referrer-when-downgrade">
        </iframe>
    `;

    function loadMap() {
        if (mapWrapper) mapWrapper.innerHTML = mapIframe;
    }

    // Se il consenso è già dato
    if (localStorage.getItem("cookiesAccepted") === "true") {
        loadMap();
        if (banner) banner.style.display = "none";
    } else if (banner) {
        // Mostra banner
        setTimeout(() => banner.classList.add("show"), 100);
    }

    // Click su Accetta cookie
    if (acceptBtn) {
        acceptBtn.addEventListener("click", () => {
            localStorage.setItem("cookiesAccepted", "true");
            loadMap();
            if (banner) {
                banner.classList.remove("show");
                setTimeout(() => banner.style.display = "none", 500);
            }
        });
    }

});