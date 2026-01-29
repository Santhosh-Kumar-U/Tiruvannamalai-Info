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

    // Book Now button handling
    document.querySelectorAll('.stay-card .map-link').forEach(button => {
        if (button.classList.contains('map-link')) return; // Skip actual map links
        button.addEventListener('click', function (e) {
            if (this.href.includes('google.com/maps')) return;
            e.preventDefault();
            const stayName = this.closest('.stay-content').querySelector('h4').innerText;
            alert(`Proceeding to secure booking for: ${stayName}`);
        });
    });


    // =========================================
    // 3. Location & Distances logic
    // =========================================
    // =========================================
    // 3. Essentials Hub Tab Logic
    // =========================================
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabPanes = document.querySelectorAll('.tab-pane');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabId = btn.getAttribute('data-tab');

            // Update buttons
            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            // Update panes
            tabPanes.forEach(pane => {
                pane.classList.remove('active');
                if (pane.id === tabId) {
                    pane.classList.add('active');
                }
            });
        });
    });

    // =========================================
    // 4. Service Interaction Logic
    // =========================================
    window.toggleServiceBubbles = function () {
        const bubbleContainer = document.getElementById('service-bubbles');
        const btn = document.getElementById('service-btn');
        if (bubbleContainer && btn) {
            const isActive = bubbleContainer.classList.toggle('active');
            if (isActive) {
                // Wait for the container to display:flex so we can get correct offsets
                setTimeout(() => {
                    drawServiceRoots();
                }, 50);
            } else {
                clearServiceRoots();
            }
        }
    };

    function drawServiceRoots() {
        const svg = document.getElementById('service-roots-svg');
        const btn = document.getElementById('service-btn');
        const bubbles = document.querySelectorAll('.service-bubble');
        const container = document.querySelector('.hero-services-container');

        if (!svg || !btn || !bubbles.length || !container) return;

        svg.innerHTML = ''; // Clear existing roots

        const containerRect = container.getBoundingClientRect();
        const btnRect = btn.getBoundingClientRect();

        // Start point: center bottom of the button relative to container
        const startX = (btnRect.left + btnRect.width / 2) - containerRect.left;
        const startY = (btnRect.top + btnRect.height) - containerRect.top;

        bubbles.forEach((bubble, index) => {
            const bubbleRect = bubble.getBoundingClientRect();

            // End point: center top of the bubble relative to container
            const endX = (bubbleRect.left + bubbleRect.width / 2) - containerRect.left;
            const endY = (bubbleRect.top) - containerRect.top;

            // Draw a curved path (root)
            const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');

            // Control points for the Bezier curve to make it look like a root
            const midY = startY + (endY - startY) * 0.5;
            const d = `M ${startX} ${startY} C ${startX} ${midY}, ${endX} ${startY + 20}, ${endX} ${endY}`;

            path.setAttribute('d', d);
            path.setAttribute('class', 'root-path');

            // Add a slight delay for each root to show a "growing" effect sequence
            path.style.transitionDelay = `${index * 0.05}s`;

            svg.appendChild(path);
        });
    }

    function clearServiceRoots() {
        const svg = document.getElementById('service-roots-svg');
        if (svg) svg.innerHTML = '';
    }

    // Re-draw roots on window resize to maintain connections
    window.addEventListener('resize', () => {
        const bubbleContainer = document.getElementById('service-bubbles');
        if (bubbleContainer && bubbleContainer.classList.contains('active')) {
            drawServiceRoots();
        }
    });

    window.handleServiceClick = function (type) {
        const sectionMap = {
            'temple': 'places',
            'travel': 'girivalam',
            'food': 'booking',
            'places': 'places',
            'jeevasamadhi': 'places',
            'essentials': 'essentials',
            'rules': 'essentials'
        };

        const targetId = sectionMap[type];
        const target = document.getElementById(targetId);
        if (target) {
            if (type === 'jeevasamadhi') {
                // Specific logic for submenus if needed, but smooth scroll for now
                if (typeof showSubmenu === 'function') {
                    showSubmenu('jeevasamadhi');
                }
            }
            target.scrollIntoView({ behavior: 'smooth' });
        }
    };

    // =========================================
    // 5. Google Translate Logic
    // =========================================
    window.toggleTranslate = function (e) {
        if (e && e.stopPropagation) e.stopPropagation();

        const el = document.getElementById('google_translate_element');
        const btn = document.getElementById('translate-btn');

        if (!el || !btn) return;

        const isHidden = el.style.display === 'none';

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
});