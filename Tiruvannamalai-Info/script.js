window.toggleServiceBubbles = function () {
    const bubbleContainer = document.getElementById('service-bubbles');
    const heroContainer = document.querySelector('.hero-services-container');
    const btn = document.getElementById('service-btn');
    if (bubbleContainer && btn) {
        const isActive = bubbleContainer.classList.toggle('active');
        if (heroContainer) heroContainer.classList.toggle('active', isActive);
    }
};

window.handleServiceClick = function (type) {
    const sectionMap = {
        'about': 'about',
        'places': 'places',
        'girivalam': 'girivalam',
        'booking': 'booking',
        'essentials': 'essentials',
        'visit': 'visit',
        'tips': 'tips'
    };

    const targetId = sectionMap[type];
    const target = document.getElementById(targetId);
    if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
    }

    // Close the bubbles after clicking
    const bubbleContainer = document.getElementById('service-bubbles');
    const heroContainer = document.querySelector('.hero-services-container');
    if (bubbleContainer) {
        bubbleContainer.classList.remove('active');
        if (heroContainer) heroContainer.classList.remove('active');
    }
};

window.toggleTranslate = function (e) {
    if (e && e.stopPropagation) e.stopPropagation();

    const el = document.getElementById('google_translate_element');
    const btn = document.getElementById('translate-btn');

    if (!el || !btn) return;

    // Use computed style or check class to be more robust
    const isHidden = window.getComputedStyle(el).display === 'none';

    if (isHidden) {
        el.style.display = 'block';
        btn.innerHTML = '<i class="fa-solid fa-xmark"></i> <span>Close</span>';
        btn.classList.add('active');

        // Focus the combo box when it appears
        setTimeout(() => {
            const select = el.querySelector('.goog-te-combo');
            if (select) select.focus();
        }, 300);
    } else {
        el.style.display = 'none';
        btn.innerHTML = '<i class="fa-solid fa-language"></i> <span>Translate</span>';
        btn.classList.remove('active');
    }
};

document.addEventListener('DOMContentLoaded', () => {
    // =========================================
    // 1. Navigation & UI Logic
    // =========================================
    const navbar = document.querySelector('nav');
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');

    // Mobile Menu Toggle
    if (mobileMenuBtn && navLinks) {
        mobileMenuBtn.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            const icon = mobileMenuBtn.querySelector('i');
            if (navLinks.classList.contains('active')) {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-xmark');
            } else {
                icon.classList.remove('fa-xmark');
                icon.classList.add('fa-bars');
            }
        });

        // Close menu when clicking a link
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('active');
                const icon = mobileMenuBtn.querySelector('i');
                if (icon) {
                    icon.classList.remove('fa-xmark');
                    icon.classList.add('fa-bars');
                }
            });
        });
    }

    // Navbar Scroll Effect
    window.addEventListener('scroll', () => {
        if (navbar) {
            if (window.scrollY > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        }
    }, { passive: true });

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href === '#') return;
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                const navHeight = navbar ? navbar.offsetHeight : 80;
                const elementPosition = target.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - navHeight;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Room Search Form handling
    const roomForm = document.getElementById('room-search-form');
    if (roomForm) {
        roomForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const type = roomForm.querySelector('select').value;
            const searchBtn = roomForm.querySelector('button');
            const originalText = searchBtn.innerText;
            searchBtn.innerText = 'Searching availability...';
            searchBtn.style.opacity = '0.7';

            setTimeout(() => {
                alert(`We have found best available ${type} options for your dates! Redirecting to booking...`);
                searchBtn.innerText = originalText;
                searchBtn.style.opacity = '1';
            }, 1500);
        });
    }

    // =========================================
    // 3. Essentials Hub Tab Logic
    // =========================================
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabPanes = document.querySelectorAll('.tab-pane');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabId = btn.getAttribute('data-tab');

            // 1. Visual feedback for the button click
            btn.style.transform = 'scale(0.95)';
            setTimeout(() => {
                btn.style.transform = '';
            }, 100);

            // 2. Update button states
            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            // 3. Update panes with a smooth transition
            tabPanes.forEach(pane => {
                pane.classList.remove('active');
                if (pane.id === tabId) {
                    pane.classList.add('active');

                    // 4. Automatically scroll to the selected category content
                    const navbarHeight = navbar ? navbar.offsetHeight : 80;
                    const elementPosition = pane.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.pageYOffset - navbarHeight - 40;

                    window.scrollTo({
                        top: offsetPosition,
                        behavior: 'smooth'
                    });
                }
            });
        });
    });

    // =========================================
    // 5. Google Translate Logic
    // =========================================


    // Close translation on click outside
    document.addEventListener('click', (e) => {
        const el = document.getElementById('google_translate_element');
        const btn = document.getElementById('translate-btn');
        if (el && el.style.display === 'block') {
            if (!el.contains(e.target) && !btn.contains(e.target)) {
                el.style.display = 'none';
                btn.innerHTML = '<i class="fa-solid fa-language"></i> <span>Translate</span>';
                btn.classList.remove('active');
            }
        }
    });

    // Intersection Observer for scroll animations
    const revealElements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            }
        });
    }, { threshold: 0.1 });

    revealElements.forEach(el => observer.observe(el));

    // --- PWA Installation Logic ---
    let deferredPrompt;
    const pwaBanner = document.getElementById('pwa-install-banner');
    const installBtn = document.getElementById('pwa-install-btn');
    const closeBtn = document.getElementById('pwa-close-btn');

    // Only show if not already dismissed in this session
    const isDismissed = sessionStorage.getItem('pwaDismissed');

    window.addEventListener('beforeinstallprompt', (e) => {
        // Prevent Chrome 67 and earlier from automatically showing the prompt
        e.preventDefault();
        // Stash the event so it can be triggered later.
        deferredPrompt = e;

        // Show the banner if it's a mobile device (standard PWA check) and not recently dismissed
        if (!isDismissed) {
            setTimeout(() => {
                if (pwaBanner) {
                    pwaBanner.style.display = 'flex';
                    // Force reflow for animation
                    pwaBanner.offsetHeight;
                    pwaBanner.classList.add('show');
                }
            }, 3000); // Show after 3 seconds for better UX
        }
    });

    if (installBtn) {
        installBtn.addEventListener('click', async () => {
            if (deferredPrompt) {
                // Show the native install prompt
                deferredPrompt.prompt();
                // Wait for the user to respond to the prompt
                const { outcome } = await deferredPrompt.userChoice;
                console.log(`User response to install prompt: ${outcome}`);
                // We've used the prompt, and can't use it again, so clear it
                deferredPrompt = null;
                // Hide our banner
                if (pwaBanner) pwaBanner.classList.remove('show');
            }
        });
    }

    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            if (pwaBanner) {
                pwaBanner.classList.remove('show');
                // Don't show again in this session
                sessionStorage.setItem('pwaDismissed', 'true');
                setTimeout(() => {
                    pwaBanner.style.display = 'none';
                }, 600);
            }
        });
    }

    // Hide banner if app is installed
    window.addEventListener('appinstalled', (evt) => {
        console.log('App was successfully installed');
        if (pwaBanner) pwaBanner.style.display = 'none';
    });
});