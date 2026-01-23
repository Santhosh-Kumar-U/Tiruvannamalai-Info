document.addEventListener('DOMContentLoaded', () => {
    // =========================================
    // 1. Navigation & UI Logic
    // =========================================
    const navbar = document.querySelector('nav');

    // Navbar Scroll Effect
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // Smooth scroll for anchor links
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

    // Room Search Form handling
    const roomForm = document.getElementById('room-search-form');
    if (roomForm) {
        roomForm.addEventListener('submit', (e) => {
            e.preventDefault();
            if (!roomForm.checkValidity()) {
                roomForm.reportValidity();
                return;
            }
            const type = roomForm.querySelector('select').value;
            const searchBtn = roomForm.querySelector('button');
            const originalText = searchBtn.innerText;
            searchBtn.innerText = 'Searching availability...';
            searchBtn.style.opacity = '0.7';

            setTimeout(() => {
                alert(`We have found 3 available ${type} options for your dates! Redirecting to booking...`);
                searchBtn.innerText = originalText;
                searchBtn.style.opacity = '1';
            }, 1500);
        });
    }

    // Book Now button handling
    document.querySelectorAll('.btn-book-now').forEach(button => {
        button.addEventListener('click', function () {
            const stayName = this.parentElement.querySelector('h4').innerText;
            this.innerText = 'Redirecting...';
            setTimeout(() => {
                alert(`Proceeding to secure booking for: ${stayName}`);
                this.innerText = 'Book Now';
            }, 1000);
        });
    });

    // Scroll Animation Observer
    const revealElements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');
    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                observer.unobserve(entry.target);
            }
        });
    }, {
        root: null,
        threshold: 0.15,
        rootMargin: "0px"
    });
    revealElements.forEach(el => revealObserver.observe(el));

    // Tab Switching Logic
    const tabBtns = document.querySelectorAll('.tab-btn');
    tabBtns.forEach(btn => {
        btn.addEventListener('click', function () {
            const nav = this.closest('.tabs-nav');
            if (nav) {
                nav.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
                this.classList.add('active');
            }
            const tabId = this.getAttribute('data-tab');
            const targetPane = document.getElementById(tabId);
            if (targetPane) {
                const contentContainer = targetPane.parentElement;
                if (contentContainer) {
                    contentContainer.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
                }
                targetPane.classList.add('active');
            }
        });
    });

    // =========================================
    // 2. Global Location & Data Logic
    // =========================================
    const locationBtns = document.querySelectorAll('.btn-location');
    let userLat = null;
    let userLng = null;
    let siteData = [];

    // Helper: Calculate Haversine Distance (Shared by UI and Chatbot)
    function calculateHaversineDistance(lat1, lon1, lat2, lon2) {
        const R = 6371; // Radius of Earth in km
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distance = R * c;
        return distance.toFixed(1);
    }

    // Helper: Update Distance Badges on Cards
    function updateDistances() {
        if (!userLat || !userLng) return;
        const locationElements = document.querySelectorAll('[data-lat]');
        locationElements.forEach(el => {
            const destLat = parseFloat(el.getAttribute('data-lat'));
            const destLng = parseFloat(el.getAttribute('data-lng'));
            if (!isNaN(destLat) && !isNaN(destLng)) {
                const distance = calculateHaversineDistance(userLat, userLng, destLat, destLng);
                const badge = el.querySelector('.distance-badge');
                if (badge) {
                    badge.innerHTML = `<i class="fa-solid fa-location-arrow"></i> ${distance} km`;
                    badge.classList.add('visible');
                }
            }
        });
    }

    // Handle Location Button Clicks
    if (locationBtns.length > 0) {
        locationBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                if ("geolocation" in navigator) {
                    locationBtns.forEach(b => b.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Locating...');
                    navigator.geolocation.getCurrentPosition(
                        (position) => {
                            userLat = position.coords.latitude;
                            userLng = position.coords.longitude;
                            locationBtns.forEach(b => {
                                b.innerHTML = '<i class="fa-solid fa-check"></i> Location Enabled';
                                b.classList.add('granted');
                            });
                            updateDistances();
                        },
                        (error) => {
                            console.error("Error getting location:", error);
                            locationBtns.forEach(b => b.innerHTML = '<i class="fa-solid fa-triangle-exclamation"></i> Permission Denied');
                            alert("Could not access location. Please enable location permissions.");
                        }
                    );
                } else {
                    alert("Geolocation is not supported by your browser.");
                }
            });
        });
    }

    // =========================================
    // 3. Chatbot Logic (Integrated)
    // =========================================
    const chatWindow = document.getElementById('chat-window');
    const chatToggle = document.getElementById('chat-toggle');
    const chatForm = document.getElementById('chat-form');
    const chatInput = document.getElementById('chat-input');
    const chatMessages = document.getElementById('chat-messages');

    // Index Site Data on Load
    function indexSiteData() {
        // Lingams
        document.querySelectorAll('.lingam-item').forEach(item => {
            const h4 = item.querySelector('h4');
            if (!h4) return;
            const name = h4.innerText.split('Tap')[0].trim();
            const desc = item.querySelector('p').innerText;
            const lat = item.getAttribute('data-lat');
            const lng = item.getAttribute('data-lng');
            const detailsElement = item.querySelector('.lingam-back-content');
            const details = detailsElement ? detailsElement.innerText : '';

            siteData.push({
                name: name,
                desc: desc + " " + details,
                displayDesc: desc,
                lat: parseFloat(lat),
                lng: parseFloat(lng),
                type: 'Lingam'
            });
        });

        // Places
        document.querySelectorAll('.place-card').forEach(item => {
            const h3 = item.querySelector('h3');
            if (!h3) return;
            const name = h3.innerText.trim();
            const desc = item.querySelector('p').innerText;
            const lat = item.getAttribute('data-lat');
            const lng = item.getAttribute('data-lng');
            const detailsElement = item.querySelector('.flip-card-back');
            const details = detailsElement ? detailsElement.innerText : '';

            siteData.push({
                name: name,
                desc: desc + " " + details,
                displayDesc: desc,
                lat: parseFloat(lat),
                lng: parseFloat(lng),
                type: 'Place'
            });
        });

        // Essentials
        document.querySelectorAll('.essential-card').forEach(item => {
            const nameEl = item.querySelector('h3');
            if (!nameEl) return;
            const name = nameEl.innerText.trim();
            const descElement = item.querySelector('.e-desc');
            const desc = descElement ? descElement.innerText : 'Essential service.';
            const lat = item.getAttribute('data-lat');
            const lng = item.getAttribute('data-lng');

            siteData.push({
                name: name,
                desc: desc,
                displayDesc: desc,
                lat: parseFloat(lat),
                lng: parseFloat(lng),
                type: 'Service'
            });
        });

        // Stays
        document.querySelectorAll('.stay-card').forEach(item => {
            const h4 = item.querySelector('h4');
            if (!h4) return;
            const name = h4.innerText.trim();
            const p = item.querySelector('p');
            const desc = p ? p.innerText : 'Accommodation';

            siteData.push({
                name: name,
                desc: desc,
                displayDesc: desc,
                lat: null,
                lng: null,
                type: 'Stay'
            });
        });

        console.log("Chatbot indexed " + siteData.length + " items.");
    }

    // Call indexing immediately
    indexSiteData();

    // Toggle Chat
    if (chatToggle) {
        chatToggle.addEventListener('click', () => {
            chatWindow.classList.toggle('active');
            chatToggle.classList.toggle('open');
            const icon = chatToggle.querySelector('i');

            if (chatWindow.classList.contains('active')) {
                icon.classList.remove('fa-comment-dots');
                icon.classList.add('fa-xmark');
                if (chatInput) chatInput.focus();

                initGuidedChatOnOpen();

                // Silent location check if we don't have it yet
                if (!userLat && "geolocation" in navigator) {
                    navigator.geolocation.getCurrentPosition(pos => {
                        userLat = pos.coords.latitude;
                        userLng = pos.coords.longitude;
                        // Also update UI badges if they weren't
                        updateDistances();
                    });
                }
            } else {
                icon.classList.remove('fa-xmark');
                icon.classList.add('fa-comment-dots');
                // Reset input styling when closing
                if (chatInput) {
                    chatInput.value = '';
                    chatInput.style.color = '';
                    chatInput.style.fontWeight = '';
                    chatInput.setAttribute('placeholder', 'Type a message...');
                }
            }
        });
    }

    // Handle Chat Messages
    if (chatForm) {
        chatForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const text = chatInput.value.trim();
            if (!text) return;

            addMessage(text, 'user');
            chatInput.value = '';

            const typingId = addTypingIndicator();

            setTimeout(() => {
                removeTypingIndicator(typingId);
                const response = generateResponse(text);
                addMessage(response, 'bot');
            }, 600 + Math.random() * 500);
        });
    }

    function addMessage(text, sender) {
        const div = document.createElement('div');
        div.classList.add('message', sender);
        div.innerHTML = text;
        chatMessages.appendChild(div);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function addTypingIndicator() {
        const div = document.createElement('div');
        div.classList.add('message', 'bot', 'typing-indicator');
        div.id = 'typing-' + Date.now();
        div.innerText = 'typing...';
        div.style.opacity = '0.7';
        div.style.fontStyle = 'italic';
        chatMessages.appendChild(div);
        chatMessages.scrollTop = chatMessages.scrollHeight;
        return div.id;
    }

    function removeTypingIndicator(id) {
        const el = document.getElementById(id);
        if (el) el.remove();
    }

    function ensureChatState() {
        if (!window.chatState) {
            window.chatState = {
                language: null,
                currentTopic: null,
                started: false,
                ended: false,
                optionHandlerAttached: false
            };
        }
    }

    function initGuidedChatOnOpen() {
        ensureChatState();
        if (window.chatState.ended) {
            // Show restart prompt in input
            if (chatInput) {
                chatInput.value = 'hello';
                chatInput.style.color = 'var(--primary)';
                chatInput.style.fontWeight = '600';
                chatInput.setAttribute('placeholder', 'Click to start again');
            }
            return;
        }

        if (!window.chatState.started) {
            chatMessages.innerHTML = '';
            window.chatState.language = null;
            window.chatState.currentTopic = null;
            window.chatState.started = true;

            addMessage(getWelcomeMessage(), 'bot');
        }

        attachChatOptionHandlerOnce();
    }

    function attachChatOptionHandlerOnce() {
        ensureChatState();
        if (window.chatState.optionHandlerAttached) return;

        chatMessages.addEventListener('click', (e) => {
            const btn = e.target.closest('.chat-option');
            if (!btn) return;

            ensureChatState();
            if (window.chatState.ended) return;

            const label = btn.innerText.trim();
            const action = btn.getAttribute('data-action');
            const value = btn.getAttribute('data-value');
            const target = btn.getAttribute('data-target');
            const tab = btn.getAttribute('data-tab');

            if (label) addMessage(label, 'user');

            const response = handleChatAction(action, value, target, tab);
            if (response) addMessage(response, 'bot');
        });

        window.chatState.optionHandlerAttached = true;
    }

    function handleChatAction(action, value, targetId, tabId) {
        ensureChatState();
        if (window.chatState.ended) return '';

        const a = String(action || '').toLowerCase();

        if (a === 'end') {
            window.chatState.ended = true;
            return getEndMessage();
        }

        if (a === 'language') {
            window.chatState.language = value === 'tamil' ? 'tamil' : 'english';
            return getMenuMessage();
        }

        if (a === 'menu') {
            window.chatState.currentTopic = value;
            return getTopicMessage(value);
        }

        if (a === 'goto') {
            navigateToTarget(targetId, tabId);
            return getAfterNavigationMessage();
        }

        if (a === 'back') {
            window.chatState.currentTopic = null;
            return getMenuMessage();
        }

        return getMenuMessage();
    }

    function navigateToTarget(targetId, tabId) {
        if (tabId) {
            const tabBtn = document.querySelector(`.tab-btn[data-tab="${tabId}"]`);
            if (tabBtn) tabBtn.click();
        }

        if (!targetId) return;
        const el = document.getElementById(targetId);
        if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }

    function escapeHtml(text) {
        return String(text)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
    }

    function escapeAttr(text) {
        return String(text)
            .replace(/&/g, '&amp;')
            .replace(/"/g, '&quot;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
    }

    function renderOptions(options) {
        const safeOptions = Array.isArray(options) ? options : [];
        return `<div class="chat-options">${safeOptions.map(o => {
            const label = escapeHtml(o.label);
            const action = escapeAttr(o.action);
            const value = o.value ? ` data-value="${escapeAttr(o.value)}"` : '';
            const target = o.target ? ` data-target="${escapeAttr(o.target)}"` : '';
            const tab = o.tab ? ` data-tab="${escapeAttr(o.tab)}"` : '';
            return `<button type="button" class="chat-option" data-action="${action}"${value}${target}${tab}>${label}</button>`;
        }).join('')}</div>`;
    }

    function getWelcomeMessage() {
        return `Welcome to Tiruvannamalai Guide 🙏<br>Please choose your preferred language:${renderOptions([
            { label: 'English', action: 'language', value: 'english' },
            { label: 'தமிழ்', action: 'language', value: 'tamil' }
        ])}`;
    }

    function getEndMessage() {
        return `Thank you for visiting Tiruvannamalai Guide 🙏<br>Have a peaceful journey.`;
    }

    function getMenuMessage() {
        const lang = window.chatState.language;

        if (lang === 'tamil') {
            return `இன்று நான் உங்களுக்கு எப்படி உதவ வேண்டும்?${renderOptions([
                { label: 'கோவில் & கிரிவலம்', action: 'menu', value: 'temple' },
                { label: 'பயணம் & வழித்தடங்கள்', action: 'menu', value: 'travel' },
                { label: 'உணவு & தங்குமிடம்', action: 'menu', value: 'food' },
                { label: 'பார்க்க வேண்டிய இடங்கள்', action: 'menu', value: 'places' },
                { label: 'அவசரங்கள் (Essentials)', action: 'menu', value: 'essentials' },
                { label: 'விதிமுறைகள் & பாதுகாப்பு', action: 'menu', value: 'rules' }
            ])}<br><br>Suggested questions:<br>• எந்த இடத்திற்கு செல்ல வேண்டும்?<br>• எந்த லிங்கம் பற்றி தெரிந்துகொள்ள வேண்டும்?<br>• தங்குமிடம் பகுதி எங்கே?`;
        }

        return `How can I help you today?${renderOptions([
            { label: 'Temple & Girivalam', action: 'menu', value: 'temple' },
            { label: 'Travel & routes', action: 'menu', value: 'travel' },
            { label: 'Food & stay options', action: 'menu', value: 'food' },
            { label: 'Places to visit', action: 'menu', value: 'places' },
            { label: 'Essentials (Medical/Bank/Transport)', action: 'menu', value: 'essentials' },
            { label: 'Rules & safety tips', action: 'menu', value: 'rules' }
        ])}<br><br>Suggested questions:<br>• Where is the Girivalam section on this website?<br>• Which places are listed to visit?<br>• Where can I find stays listed?`;
    }

    function getAfterNavigationMessage() {
        const lang = window.chatState.language;

        if (lang === 'tamil') {
            return `இந்தப் பகுதியை பக்கத்தில் திறந்துவிட்டேன்.${renderOptions([
                { label: 'மெனுவிற்கு திரும்பவும்', action: 'back' }
            ])}<br><br>Suggested questions:<br>• வேறு எந்த இடத்தை பார்க்க வேண்டும்?<br>• கிரிவலம் பாதையில் உள்ள லிங்கங்கள் என்ன?<br>• Essentials பகுதியில் என்ன உள்ளது?`;
        }

        return `Opened that section on the page.${renderOptions([
            { label: 'Back to menu', action: 'back' }
        ])}<br><br>Suggested questions:<br>• Which other place is listed on the website?<br>• What other Lingams are on the Girivalam path?<br>• Where is the Essentials section?`;
    }

    function getTopicMessage(topic) {
        const lang = window.chatState.language;
        const t = String(topic || '').toLowerCase();

        if (t === 'temple') {
            const lingams = siteData.filter(item => item.type === 'Lingam');
            const options = [
                { label: lang === 'tamil' ? 'அருணாசலேஸ்வரர் கோவில்' : 'Arunachaleswarar Temple', action: 'goto', target: 'arunachaleswarar-temple' },
                { label: lang === 'tamil' ? 'கிரிவலம் பகுதி' : 'Girivalam section', action: 'goto', target: 'girivalam' },
                { label: lang === 'tamil' ? 'மற்ற லிங்கங்கள்' : 'Other Lingams list', action: 'goto', target: 'girivalam-lingams' }
            ];
            lingams.forEach(l => {
                options.push({
                    label: l.name,
                    action: 'goto',
                    target: l.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
                });
            });
            options.push({ label: lang === 'tamil' ? 'மெனுவிற்கு திரும்பவும்' : 'Back to menu', action: 'back' });
            const suggested = lang === 'tamil' ?
                'பரிந்துரைக்கப்பட்ட கேள்விகள்:<br>• 8 லிங்கங்கள் என்ன?<br>• விருபாக்ஷ குகை பற்றி சொல்லுங்கள்<br>• ஸ்கந்தாச்ரமம் எங்கே?' :
                'Suggested questions:<br>• What are the 8 Lingams listed on the site?<br>• Where is Virupaksha Cave on the page?<br>• Where is Skandasramam listed?';
            return `${lang === 'tamil' ? 'கீழே தேர்வு செய்யவும்:' : 'Choose one:'}${renderOptions(options)}<br><br>${suggested}`;
        }

        if (t === 'travel') {
            if (lang === 'tamil') {
                return `கீழே தேர்வு செய்யவும்:${renderOptions([
                    { label: 'Plan Visit பகுதி', action: 'goto', target: 'visit' },
                    { label: 'Transport Hubs (Essentials)', action: 'goto', target: 'transport', tab: 'transport' },
                    { label: 'மெனுவிற்கு திரும்பவும்', action: 'back' }
                ])}<br><br>Suggested questions:<br>• பஸ் நிலையம் விவரம் என்ன?<br>• ரயில் நிலையம் விவரம் என்ன?<br>• உள்ளூர் போக்குவரத்து பகுதி எது?`;
            }

            return `Choose one:${renderOptions([
                { label: 'Plan Visit section', action: 'goto', target: 'visit' },
                { label: 'Transport Hubs (Essentials)', action: 'goto', target: 'transport', tab: 'transport' },
                { label: 'Back to menu', action: 'back' }
            ])}<br><br>Suggested questions:<br>• Where is the bus stand info listed?<br>• Where is the railway station info listed?<br>• What does the site say about local transport?`;
        }

        if (t === 'food') {
            if (lang === 'tamil') {
                return `கீழே தேர்வு செய்யவும்:${renderOptions([
                    { label: 'Room Booking பகுதி', action: 'goto', target: 'booking' },
                    { label: 'Dining (Essentials)', action: 'goto', target: 'dining', tab: 'dining' },
                    { label: 'மெனுவிற்கு திரும்பவும்', action: 'back' }
                ])}<br><br>Suggested questions:<br>• எந்த தங்குமிடங்கள் பட்டியலில் உள்ளன?<br>• எந்த உணவகங்கள் பட்டியலில் உள்ளன?<br>• Essentials பகுதி எங்கே?`;
            }

            return `Choose one:${renderOptions([
                { label: 'Room Booking section', action: 'goto', target: 'booking' },
                { label: 'Dining (Essentials)', action: 'goto', target: 'dining', tab: 'dining' },
                { label: 'Back to menu', action: 'back' }
            ])}<br><br>Suggested questions:<br>• Which stays are listed in Room Booking?<br>• Which dining places are listed?<br>• Where is the Essentials section?`;
        }

        if (t === 'places') {
            const places = siteData.filter(item => item.type === 'Place');
            const options = places.map(p => ({
                label: p.name,
                action: 'goto',
                target: p.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
            }));
            options.push({ label: 'Back to menu', action: 'back' });
            const lang = window.chatState.language;
            const suggested = lang === 'tamil' ?
                'பரிந்துரைக்கப்பட்ட கேள்விகள்:<br>• ரமண மஹரிஷி பற்றி என்ன குறிப்பிடப்பட்டுள்ளது?<br>• விருபாக்ஷ குகையின் வரலாறு என்ன?<br>• கிரிவலம் பாதையில் வேறு என்ன உள்ளது?' :
                'Suggested questions:<br>• What does the site say about Ramana Maharshi?<br>• What is the history of Virupaksha Cave?<br>• What else is listed on the Girivalam path?';
            return `${lang === 'tamil' ? 'கீழே தேர்வு செய்யவும்:' : 'Choose one:'}${renderOptions(options)}<br><br>${suggested}`;
        }

        if (t === 'essentials') {
            if (lang === 'tamil') {
                return `கீழே தேர்வு செய்யவும்:${renderOptions([
                    { label: 'மருத்துவமனை (Medical)', action: 'goto', target: 'medical', tab: 'medical' },
                    { label: 'வங்கி (Banking)', action: 'goto', target: 'banking', tab: 'banking' },
                    { label: 'போக்குவரத்து (Transport)', action: 'goto', target: 'transport', tab: 'transport' },
                    { label: 'அவசர உதவி (Emergency)', action: 'goto', target: 'emergency', tab: 'emergency' },
                    { label: 'உணவகங்கள் (Dining)', action: 'goto', target: 'dining', tab: 'dining' },
                    { label: 'மெனுவிற்கு திரும்பவும்', action: 'back' }
                ])}<br><br>Suggested questions:<br>• மருத்துவமனை எங்கே உள்ளது?<br>• எந்த வங்கிகள் பட்டியலில் உள்ளன?<br>• பஸ் நிலையம் விவரம் என்ன?<br>• அவசர எண்கள் எங்கே?`;
            }

            return `Choose one:${renderOptions([
                { label: 'Medical', action: 'goto', target: 'medical', tab: 'medical' },
                { label: 'Banking', action: 'goto', target: 'banking', tab: 'banking' },
                { label: 'Transport', action: 'goto', target: 'transport', tab: 'transport' },
                { label: 'Emergency Help', action: 'goto', target: 'emergency', tab: 'emergency' },
                { label: 'Dining', action: 'goto', target: 'dining', tab: 'dining' },
                { label: 'Back to menu', action: 'back' }
            ])}<br><br>Suggested questions:<br>• Where are medical services listed?<br>• Which banks are listed?<br>• Where is bus stand info listed?<br>• Where are emergency numbers listed?`;
        }

        if (t === 'rules') {
            if (lang === 'tamil') {
                return `கீழே தேர்வு செய்யவும்:${renderOptions([
                    { label: 'Plan Visit (Travel Tips)', action: 'goto', target: 'travel-tips' },
                    { label: 'Emergency Help (Essentials)', action: 'goto', target: 'emergency', tab: 'emergency' },
                    { label: 'மெனுவிற்கு திரும்பவும்', action: 'back' }
                ])}<br><br>Suggested questions:<br>• உடை விதிமுறைகள் என்ன?<br>• அவசர எண்கள் எங்கே பட்டியலில் உள்ளது?<br>• கிரிவலம் பற்றிய குறிப்புகள் என்ன?`;
            }

            return `Choose one:${renderOptions([
                { label: 'Plan Visit (Travel Tips)', action: 'goto', target: 'travel-tips' },
                { label: 'Emergency Help (Essentials)', action: 'goto', target: 'emergency', tab: 'emergency' },
                { label: 'Back to menu', action: 'back' }
            ])}<br><br>Suggested questions:<br>• Where is dress code mentioned on page?<br>• Where are emergency numbers listed?<br>• What travel tips are listed?`;
        }

        return getMenuMessage();
    }

    // Response Engine
    function generateResponse(query) {
        ensureChatState();
        if (window.chatState.ended) {
            const q = String(query || '').trim().toLowerCase();
            if (q === 'hello') {
                // Reset chat state and restart
                window.chatState.ended = false;
                window.chatState.language = null;
                window.chatState.currentTopic = null;
                window.chatState.started = false;
                // Clear chat messages and show welcome
                chatMessages.innerHTML = '';
                return getWelcomeMessage();
            }
            return '';
        }

        const q = String(query || '').trim();
        const qLower = q.toLowerCase();

        if (qLower === 'end') {
            window.chatState.ended = true;
            return getEndMessage();
        }

        if (!window.chatState.language) {
            if (qLower === 'english' || qLower === '1') {
                return handleChatAction('language', 'english');
            }
            if (q === 'தமிழ்' || qLower === '2') {
                return handleChatAction('language', 'tamil');
            }
            return getWelcomeMessage();
        }

        if (qLower === 'menu') return getMenuMessage();

        if (qLower.includes('temple') || qLower.includes('girivalam') || qLower === '1') {
            return handleChatAction('menu', 'temple');
        }
        if (qLower.includes('travel') || qLower.includes('route') || qLower === '2') {
            return handleChatAction('menu', 'travel');
        }
        if (qLower.includes('food') || qLower.includes('stay') || qLower === '3') {
            return handleChatAction('menu', 'food');
        }
        if (qLower.includes('place') || qLower.includes('visit') || qLower === '4') {
            return handleChatAction('menu', 'places');
        }
        if (qLower.includes('rule') || qLower.includes('safety') || qLower === '5') {
            return handleChatAction('menu', 'rules');
        }
        if (qLower.includes('essential') || qLower.includes('medical') || qLower.includes('bank') || qLower.includes('transport') || qLower === '6') {
            return handleChatAction('menu', 'essentials');
        }

        return getMenuMessage();
    }
    
    function getTempleInfo() {
        return `**Temple & Girivalam Information**

• **Arunachaleswarar Temple**: One of the largest temples in Tamil Nadu, dedicated to Lord Shiva as the element of Fire. Architecture is a marvel of Dravidian style.

• **Temple Timings**: Open from 5:30 AM to 12:30 PM and 3:30 PM to 9:30 PM.

• **Girivalam**: The sacred 14km circumambulation around Arunachala Hill. It involves walking barefoot clockwise.

• **Best Time for Girivalam**: During Full Moon (Pournami) days. Early mornings (4 AM - 6 AM) are also great.

• **8 Cardinal Lingams**: Indra, Agni, Yama, Niruthi, Varuna, Vayu, Kubera, and Esanya - each with unique benefits.

Suggested questions:
• Tell me about Indra Lingam
• When is the best time for Girivalam?
• What are the temple timings?`;
    }
    
    function getTravelInfo() {
        return `**Travel & Routes Information**

• **By Road**: Tiruvannamalai is well connected by road from major cities.

• **By Rail**: Tiruvannamalai has railway connectivity from nearby cities.

• **Nearest Airport**: Chennai (185km away).

• **Local Transport**: Auto-rickshaws and taxis available for local travel.

• **Girivalam Path**: 14km circular path around Arunachala Hill with 8 lingams.

Suggested questions:
• How far is Chennai from Tiruvannamalai?
• What is the distance of Girivalam?
• Is there local transport available?`;
    }
    
    function getFoodStayInfo() {
        return `**Food & Stay Options**

**Accommodations** (Available on website):
• Various accommodations from Ashrams to Resorts are listed in our 'Room Booking' section.

**Food**:
• Tiruvannamalai offers plenty of pure vegetarian dining options.
• Check our 'Essentials' section for detailed food options.

For specific hotels and restaurants, please refer to the 'Room Booking' and 'Essentials' sections on the website.

Suggested questions:
• What type of accommodations are available?
• Is vegetarian food easily available?
• Where can I find food options?`;
    }
    
    function getPlacesInfo() {
        return `**Places to Visit**

**Famous Places** (Available on website):
• **Arunachaleswarar Temple**: Main temple dedicated to Lord Shiva
• **Sri Ramana Ashram**: Sanctuary where sage Ramana Maharshi lived
• **Virupaksha Cave**: Ancient cave shaped like sacred 'Om'

**Sacred Spots on Girivalam Path**:
• **Surya Lingam**: Dedicated to Sun God for health and vitality
• **Chandra Lingam**: Dedicated to Moon God for mental peace
• **Skandashramam**: Cave hermitage where Ramana Maharshi lived (1916-1922)

Suggested questions:
• Tell me about Arunachaleswarar Temple
• What is special about Virupaksha Cave?
• Where did Ramana Maharshi meditate?`;
    }
    
    function getRulesInfo() {
        return `**Rules & Safety Tips**

**Dress Code**:
• Modest clothing covering shoulders and knees is recommended
• Girivalam is walked barefoot

**General Guidelines**:
• Maintain silence and respect in sacred places
• Follow temple rules and timings
• Carry water during Girivalam
• Be prepared for crowds during Full Moon days

**Safety**:
• Stay hydrated during long walks
• Keep valuables secure
• Follow local customs and traditions

Suggested questions:
• What should I wear for temple visit?
• Is Girivalam safe at night?
• What should I carry for Girivalam?`;
    }
    
    function getTempleInfoTamil() {
        return `**கோவில் & கிரிவலம் தகவல்**

• **அருணாசலேஸ்வரர் கோவில்**: தமிழ்நாட்டின் மிகப்பெரிய கோவில்களில் ஒன்று, நெருப்பு உறுப்பாக இறைவன் சிவனுக்கு அர்ப்பணிக்கப்பட்டது.

• **கோவில் நேரம்**: காலை 5:30 மணி முதல் மதியம் 12:30 மணி வரை, மாலை 3:30 மணி முதல் இரவு 9:30 மணி வரை.

• **கிரிவலம்**: அருணாசல மலையை சுற்றி 14 கிமீ தூரம் வரும் புனித பிரதட்சணம்.

• **8 கர்தித லிங்கங்கள்**: இந்திரன், அக்னி, யமன், நிருதி, வருணன், வாயு, குபேரன், மற்றும் ஈசான்யன்.

பரிந்துரைக்கப்பட்ட கேள்விகள்:
• இந்திர லிங்கம் பற்றி சொல்லுங்கள்
• கிரிவலத்திற்கு சிறந்த நேரம் எப்போது?
• கோவில் நேரங்கள் என்ன?`;
    }
    
    function getTravelInfoTamil() {
        return `**பயணம் & வழித்தடங்கள் தகவல்**

• **சாலை வழி**: முக்கிய நகரங்களிலிருந்து சாலை வழியாக நன்கு இணைக்கப்பட்டுள்ளது.

• **தொடர்வண்டி**: அருகிலுள்ள நகரங்களிலிருந்து தொடர்வண்டி இணைப்பு உள்ளது.

• **அருகிலுள்ள விமான நிலையம்**: சென்னை (185 கிமீ தொலைவில்).

• **உள்ளூர் போக்குவரத்து**: ஆட்டோ ரிக்ஷா மற்றும் டாக்ஸி வசதி உள்ளது.

பரிந்துரைக்கப்பட்ட கேள்விகள்:
• சென்னையிலிருந்து திருவண்ணாமலை எவ்வளவு தூரம்?
• கிரிவலத்தின் தூரம் என்ன?
• உள்ளூர் போக்குவரத்து உள்ளதா?`;
    }
    
    function getFoodStayInfoTamil() {
        return `**உணவு & தங்குமிட விருப்பங்கள்**

**தங்குமிடங்கள்**:
• ஆசிரமங்கள் முதல் ரிசார்ட்கள் வரை பல்வேறு தங்குமிட விருப்பங்கள் உள்ளன.

**உணவு**:
• திருவண்ணாமலையில் தூய சைவ உணவு விருப்பங்கள் ஏராளமாக உள்ளன.
• விரிவான உணவு விருப்பங்களுக்கு எங்களின் 'அத்தியாவசியங்கள்' பகுதியைப் பார்க்கவும்.

பரிந்துரைக்கப்பட்ட கேள்விகள்:
• எந்த வகையான தங்குமிடங்கள் உள்ளன?
• சைவ உணவு எளிதில் கிடைக்குமா?
• உணவு விருப்பங்கள் எங்கே கிடைக்கும்?`;
    }
    
    function getPlacesInfoTamil() {
        return `**பார்க்க வேண்டிய இடங்கள்**

**பிரபலமான இடங்கள்**:
• **அருணாசலேஸ்வரர் கோவில்**: இறைவன் சிவனுக்கு அர்ப்பணிக்கப்பட்ட முக்கிய கோவில்
• **ஸ்ரீ ரமண ஆசிரமம்**: முனிவர் ரமண மஹரிஷி வாழ்ந்த இடம்
• **விருபாக்ஷ குகை**: புனித 'ஓம்' வடிவிலான பழமையான குகை

**கிரிவலம் பாதையில் புனித இடங்கள்**:
• **சூரிய லிங்கம்**: சூரிய பகவானுக்கு அர்ப்பணிக்கப்பட்டது
• **சந்திர லிங்கம்**: சந்திர பகவானுக்கு அர்ப்பணிக்கப்பட்டது

பரிந்துரைக்கப்பட்ட கேள்விகள்:
• அருணாசலேஸ்வரர் கோவில் பற்றி சொல்லுங்கள்
• விருபாக்ஷ குகையின் சிறப்பு என்ன?
• ரமண மஹரிஷி எங்கு தியானம் செய்தார்?`;
    }
    
    function getRulesInfoTamil() {
        return `**விதிமுறைகள் & பாதுகாப்பு குறிப்புகள்**

**உடை விதிமுறைகள்**:
• தோள்கள் மற்றும் முழங்கால்களை மூடும் மிதமான உடை பரிந்துரைக்கப்படுகிறது
• கிரிவலம் வெறும் காலுடன் செய்யப்படுகிறது

**பொதுவான வழிகாட்டுதல்கள்**:
• புனித இடங்களில் அமைதியையும் மரியாதையையும் கடைப்பிடிக்கவும்
• கோவில் விதிகள் மற்றும் நேரங்களைப் பின்பற்றவும்

பரிந்துரைக்கப்பட்ட கேள்விகள்:
• கோவில் வருகைக்கு என்ன உடை அணிய வேண்டும்?
• இரவு நேரத்தில் கிரிவலம் பாதுகாப்பானதா?
• கிரிவலத்திற்கு என்ன எடுத்துச் செல்ல வேண்டும்?`;
    }

    function formatSiteResponse(item, uLat, uLng, showDistanceHint) {
        let response = `<strong>${item.name}</strong><br>${item.displayDesc}`;
        if (!isNaN(item.lat) && item.lat !== null && uLat && uLng) {
            const dist = calculateHaversineDistance(uLat, uLng, item.lat, item.lng);
            response += `<br><br><i class="fa-solid fa-location-arrow"></i> It is approximately <strong>${dist} km</strong> from your current location.`;
        } else if (!isNaN(item.lat) && item.lat !== null && !uLat) {
            if (showDistanceHint) {
                response += `<br><br><i>(Enable location to see distance)</i>`;
            }
        }
        return response;
    }

    // =========================================
    // PWA Install Prompt
    // =========================================
    let deferredPrompt;
    const installBtn = document.getElementById('install-btn');

    window.addEventListener('beforeinstallprompt', (e) => {
        // Prevent the mini-infobar from appearing on mobile
        e.preventDefault();
        // Stash the event so it can be triggered later
        deferredPrompt = e;
        // Show the install button
        if (installBtn) {
            installBtn.style.display = 'inline-block';
        }
    });

    // Handle install button click
    if (installBtn) {
        installBtn.addEventListener('click', () => {
            if (deferredPrompt) {
                // Show the install prompt
                deferredPrompt.prompt();
                // Wait for the user to respond to the prompt
                deferredPrompt.userChoice.then((choiceResult) => {
                    if (choiceResult.outcome === 'accepted') {
                        console.log('User accepted the install prompt');
                    } else {
                        console.log('User dismissed the install prompt');
                    }
                    deferredPrompt = null;
                    // Hide the install button
                    installBtn.style.display = 'none';
                });
            }
        });
    }

    // Hide install button if app is already installed
    window.addEventListener('appinstalled', () => {
        if (installBtn) {
            installBtn.style.display = 'none';
        }
        console.log('PWA was installed');
    });

    // =========================================
    // PWA Service Worker Registration
    // =========================================
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/sw.js')
                .then((registration) => {
                    console.log('Service Worker registered successfully:', registration);
                })
                .catch((error) => {
                    console.log('Service Worker registration failed:', error);
                });
        });
    }
});
