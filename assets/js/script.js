// Portfolio JavaScript Functionality

document.addEventListener('DOMContentLoaded', function() {
    // Navigation Elements
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');
    const navbar = document.getElementById('navbar');

    // Hero Elements
    const typingText = document.getElementById('typing-text');
    const heroCursor = document.querySelector('.typing-container .cursor');
    const statNumbers = document.querySelectorAll('.stat-number');

    // Form Element
    const contactForm = document.getElementById('contact-form');
    const contactMeBtn = document.getElementById('contact-me');
    const downloadCvBtn = document.getElementById('download-cv');
    const filterBadges = document.querySelectorAll('.filter-badge');
    const projectCards = document.querySelectorAll('.project-card');

    // Runtime flags
    let preloaderActive = true;

    // Read once at startup. The CSS block at the end of style.css turns off
    // transitions/animations; this flag covers the effects driven from JS
    // (particle canvas, typing, counters, smooth scrolling). Changing the OS
    // setting takes effect on the next load, which is the norm for this kind of
    // preference and keeps the effects from being torn down mid-animation.
    const reduceMotion = typeof window.matchMedia === 'function' &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Typing Effect Configuration
    const phrases = [
        'Full-Stack Developer',
        'React Developer',
        'Angular Developer',
        '.NET Developer',
        'Azure Specialist'
    ];
    let currentPhraseIndex = 0;
    let currentCharIndex = 0;
    let isDeleting = false;

    // Mobile Navigation
    // The hamburger is a real <button>, so Enter/Space come for free. All state
    // changes go through setMobileNav() so mouse, keyboard, Escape and the
    // breakpoint reset can never disagree about aria-expanded or the scroll lock.
    //
    // Last element focused inside the navbar. The breakpoint handler needs it
    // because the browser blurs the hamburger (display: none above the nav
    // breakpoint) before the matchMedia change event reaches us, so
    // activeElement is already <body> by then.
    let lastNavFocus = null;

    function isMobileNavOpen() {
        return !!navMenu && navMenu.classList.contains('active');
    }

    // The drawer covers the whole viewport below the navbar and the page is
    // scroll-locked behind it, so nothing outside the navbar may be focused,
    // clicked or read out while it is open. `inert` on the body's other children
    // covers pointer input and assistive tech; the Tab wrap in
    // setupEventListeners() keeps the cycle inside the navbar for engines that
    // ignore the attribute (and stops Tab leaving the document for the browser
    // chrome, which would be the next step otherwise).
    //
    // Only the elements this function made inert are recorded, so closing never
    // clears an `inert` that some other feature set for its own reasons.
    let inertedElements = [];

    function setPageInert(inert) {
        if (!inert) {
            inertedElements.forEach(function (el) { el.removeAttribute('inert'); });
            inertedElements = [];
            return;
        }
        const children = document.body.children;
        for (let i = 0; i < children.length; i++) {
            const el = children[i];
            if (el === navbar || el.tagName === 'SCRIPT' || el.hasAttribute('inert')) continue;
            el.setAttribute('inert', '');
            inertedElements.push(el);
        }
    }

    // Focusable elements inside the navbar, in DOM order: the eight drawer links
    // first, then the theme toggle, the two language links and the hamburger.
    // getClientRects() filters out anything display:none'd at this breakpoint.
    function navFocusables() {
        if (!navbar) return [];
        return Array.prototype.filter.call(
            navbar.querySelectorAll('a[href], button'),
            function (el) { return el.getClientRects().length > 0; }
        );
    }

    function setMobileNav(open, options) {
        if (!hamburger || !navMenu) return;
        const opts = options || {};

        hamburger.classList.toggle('active', open);
        navMenu.classList.toggle('active', open);
        hamburger.setAttribute('aria-expanded', open ? 'true' : 'false');

        // Lock the page behind the full-screen menu. --scrollbar-width lets the
        // navbar compensate for the scrollbar that disappears, so the controls do
        // not shift on narrow desktop windows (overlay scrollbars report 0).
        const scrollbar = open ? window.innerWidth - document.documentElement.clientWidth : 0;
        document.body.classList.toggle('nav-open', open);
        document.body.style.setProperty('--scrollbar-width', scrollbar > 0 ? scrollbar + 'px' : '0px');

        setPageInert(open);

        if (!open && opts.returnFocus) {
            // preventScroll: the button lives in the fixed navbar, so focusing it
            // must not disturb a smooth scroll that is starting in the same task.
            hamburger.focus({ preventScroll: true });
        }
    }

    function toggleMobileNav() {
        setMobileNav(!isMobileNavOpen());
    }

    // Close mobile nav when clicking on a link. Focus goes back to the hamburger:
    // the menu is hidden right after, and a hidden element must not keep focus.
    function closeMobileNav() {
        if (isMobileNavOpen()) setMobileNav(false, { returnFocus: true });
    }

    // The mobile menu sits directly under the navbar. Measuring it instead of
    // hard-coding a pixel value keeps the two aligned when fonts load, the logo
    // changes size or the user zooms.
    function syncNavbarHeight() {
        if (!navbar) return;
        navbar.style.setProperty('--navbar-height', navbar.offsetHeight + 'px');
    }

    // Fixed Smooth Scrolling for Navigation Links
    function smoothScroll(targetId) {
        const element = document.querySelector(targetId);
        if (element) {
            const offsetTop = element.offsetTop - 80; // Account for fixed navbar
            window.scrollTo({
                top: offsetTop,
                behavior: reduceMotion ? 'auto' : 'smooth'
            });
        }
    }

    // Typing Effect Function
    function typeEffect() {
        const currentPhrase = phrases[currentPhraseIndex];
        
        if (isDeleting) {
            typingText.textContent = currentPhrase.substring(0, currentCharIndex - 1);
            currentCharIndex--;
        } else {
            typingText.textContent = currentPhrase.substring(0, currentCharIndex + 1);
            currentCharIndex++;
        }

        let typeSpeed = 100;
        let isPaused = false;
        
        if (isDeleting) {
            typeSpeed /= 2;
        }

        if (!isDeleting && currentCharIndex === currentPhrase.length) {
            typeSpeed = 2000; // Pause at the end
            isDeleting = true;
            isPaused = true;
        } else if (isDeleting && currentCharIndex === 0) {
            isDeleting = false;
            currentPhraseIndex = (currentPhraseIndex + 1) % phrases.length;
            typeSpeed = 500; // Pause before starting new phrase
            isPaused = true;
        }

        // The cursor blinks only when stationary/paused; while moving (writing/deleting), it stays fixed solid
        if (heroCursor) {
            if (isPaused) {
                heroCursor.classList.add('blinking');
            } else {
                heroCursor.classList.remove('blinking');
            }
        }

        setTimeout(typeEffect, typeSpeed);
    }

    // Animate Counter Numbers (fixed per-increment interval, idempotent, no overshoot)
    function animateCounter(element) {
        const target = parseInt(element.getAttribute('data-target')) || 0;

        // Reduced motion: show the final value immediately.
        if (reduceMotion) {
            element.textContent = String(target);
            return;
        }

        const currentValue = parseInt((element.textContent || '0').replace(/\D/g, '')) || 0;
        if (element.dataset.animating === 'true' || currentValue === target) return;

        // Every increment takes the same time for all counters
        const intervalPerStepMs = 250; // adjust to taste (smaller = faster)
        let value = 0; // always start from 0 for smooth reload behavior
        let lastTime = performance.now();
        let accumulator = 0;

        element.dataset.animating = 'true';
        element.textContent = '0';

        const tick = (now) => {
            const delta = now - lastTime;
            lastTime = now;
            accumulator += delta;

            while (accumulator >= intervalPerStepMs && value < target) {
                value += 1;
                accumulator -= intervalPerStepMs;
            }

            // Clamp and render
            if (value > target) value = target;
            element.textContent = String(value);

            if (value < target) {
                requestAnimationFrame(tick);
            } else {
                delete element.dataset.animating;
            }
        };

        requestAnimationFrame(tick);
    }

    // Intersection Observer for Animations
    function createObserver() {
        // Everything here is observer-driven. Without the API the items must stay
        // in their default, visible state rather than being hidden below.
        if (typeof IntersectionObserver !== 'function') {
            return;
        }

        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        // Timeline items and the certification/project cards start hidden from
        // JS, not from CSS: a no-JS visitor (or a script error) still sees them.
        // The observer below reveals each one as it scrolls in. The old markup
        // used a CSS animation that started on load, so the timeline cards had
        // finished long before anyone scrolled to them, and the cards got inline
        // styles that outranked their :hover lift.
        document.querySelectorAll('.timeline-item, .certification-card, .project-card')
            .forEach(el => el.classList.add('is-pending'));

        // A keyboard user can focus a card's link before the observer has fired
        // (the browser scrolls it into view to focus it). CSS keeps a focused
        // card fully visible, but the pending state must also be cleared for
        // real: otherwise leaving focus would fade the card back out until the
        // observer catches up, and the user would have seen it vanish.
        document.querySelectorAll('.project-card').forEach(card => {
            card.addEventListener('focusin', () => card.classList.remove('is-pending'));
        });

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // Reveal timeline items
                    if (entry.target.classList.contains('timeline-item')) {
                        entry.target.classList.remove('is-pending');
                    }

                    // Animate stat numbers
                    if (entry.target.classList.contains('stat-number') && !entry.target.classList.contains('animated')) {
                        // Defer counters until preloader is finished
                        if (preloaderActive) {
                            return;
                        }
                        entry.target.classList.add('animated');
                        // ensure we start from 0 for a smooth experience
                        entry.target.textContent = '0';
                        animateCounter(entry.target);
                    }

                    // Add fade-in animation to cards
                    if (entry.target.classList.contains('certification-card') || 
                        entry.target.classList.contains('project-card')) {
                        entry.target.classList.remove('is-pending');
                    }
                }
            });
        }, observerOptions);

        // Observe elements
        document.querySelectorAll('.timeline-item, .stat-number, .certification-card, .project-card')
            .forEach(el => observer.observe(el));
    }

    // Navbar Scroll Effect
    function handleNavbarScroll() {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    }

    // Active Navigation Link Highlighting
    function updateActiveNavLink() {
        const sections = document.querySelectorAll('section[id]');
        const scrollPos = window.scrollY + 100;

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');

            if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${sectionId}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }

    // Contact Form Handler
    function handleContactForm(e) {
        e.preventDefault();
        const formData = new FormData(contactForm);
        const name = (formData.get('name') || '').toString().trim();
        const email = (formData.get('email') || '').toString().trim();
        const subject = (formData.get('subject') || '').toString().trim();
        const message = (formData.get('message') || '').toString().trim();

        const recipient = 'simonedelgrosso@outlook.it';
        const subjectLine = subject ? subject : '';
        const bodyLines = [
            message,
            '',
            '--',
            name ? name : '',
            email ? `<${email}>` : ''
        ].join('\n');

        const mailtoLink = `mailto:${recipient}?subject=${encodeURIComponent(subjectLine)}&body=${encodeURIComponent(bodyLines)}`;

        // Open default email client with pre-filled fields
        window.location.href = mailtoLink;

        // Optional: reset the form after triggering the mail client
        contactForm.reset();
    }

    // Download CV Handler
    function handleDownloadCV(e) {
        e.preventDefault();
        
        // Simulate CV download
        const link = document.createElement('a');
        link.href = '#'; // In a real application, this would be the actual CV file path
        link.download = 'Simone_Del_Grosso_CV.pdf';
        
        // Show download message
        alert('Il download del CV inizierà a breve. (Questa è una demo - in un\'applicazione reale il file verrebbe scaricato automaticamente)');
    }

    // Compute and set dynamic targets for hero counters
    function setHeroStatsTargets() {
        const heroStatNumbers = document.querySelectorAll('.hero-stats .stat-number');
        if (!heroStatNumbers || heroStatNumbers.length < 3) return;

        // Years of experience since 2023-06-21
        const startDate = new Date('2023-06-21T00:00:00');
        const today = new Date();
        let years = today.getFullYear() - startDate.getFullYear();
        const hasAnniversaryPassed = (
            today.getMonth() > startDate.getMonth() ||
            (today.getMonth() === startDate.getMonth() && today.getDate() >= startDate.getDate())
        );
        if (!hasAnniversaryPassed) {
            years -= 1;
        }
        years = Math.max(0, years);

        // Projects count
        const projectsCount = document.querySelectorAll('#projects .project-card').length;

        // Certifications count
        const certificationsCount = document.querySelectorAll('#certifications .certification-card').length;

        // Order: [Experience, Projects, Certifications]
        heroStatNumbers[0].setAttribute('data-target', years.toString());
        heroStatNumbers[1].setAttribute('data-target', projectsCount.toString());
        heroStatNumbers[2].setAttribute('data-target', certificationsCount.toString());
    }

    // Scroll to Top Function
    function scrollToTop() {
        window.scrollTo({
            top: 0,
            behavior: reduceMotion ? 'auto' : 'smooth'
        });
    }

    // Add Scroll to Top Button
    function createScrollToTopButton() {
        const scrollBtn = document.createElement('button');
        scrollBtn.innerHTML = '<i class="fas fa-chevron-up" aria-hidden="true"></i>';
        scrollBtn.className = 'scroll-to-top';
        scrollBtn.setAttribute('aria-label', document.documentElement.dataset.scrollTopLabel || 'Back to top');

        scrollBtn.addEventListener('click', scrollToTop);

        // Visibility is a class, not an inline style, so CSS owns the transition
        // and the reduced-motion block can turn it off.
        const syncVisibility = () => {
            scrollBtn.classList.toggle('is-visible', window.scrollY > 500);
        };
        window.addEventListener('scroll', syncVisibility, { passive: true });

        document.body.appendChild(scrollBtn);
        // A restored scroll position does not fire a scroll event, so the first
        // state must be painted explicitly.
        syncVisibility();
    }

    // Preloader Function
    // Markup and styling live in CSS (#preloader / .preloader__spinner); this only
    // inserts it, then removes it once the page has loaded. The old version
    // carried a cssText block and injected its own @keyframes, kept the overlay
    // for a fixed 1.5s and always animated the fade.
    function createPreloader() {
        const preloader = document.createElement('div');
        preloader.id = 'preloader';
        preloader.setAttribute('aria-hidden', 'true');
        preloader.innerHTML = '<div class="preloader__spinner"></div>';

        document.body.insertBefore(preloader, document.body.firstChild);

        // Let a very fast load still show the overlay for a moment instead of
        // flashing it, but never hold the page for longer than this.
        const MIN_VISIBLE_MS = 250;

        window.addEventListener('load', () => {
            setTimeout(() => {
                preloader.classList.add('is-hidden');
                let removed = false;
                const done = () => {
                    // Both the transitionend and the safety timeout can fire.
                    if (removed) return;
                    removed = true;
                    preloader.remove();
                    // Mark preloader as done and trigger pending hero counters if already in view
                    preloaderActive = false;
                    triggerHeroCountersIfVisible();
                };
                if (reduceMotion) {
                    // No fade to wait for.
                    done();
                } else {
                    preloader.addEventListener('transitionend', done, { once: true });
                    // Safety net: if the transition never fires (element already
                    // gone, transition disabled), remove anyway.
                    setTimeout(done, 600);
                }
            }, MIN_VISIBLE_MS);
        });
    }

    // Trigger hero counters if they are already visible when preloader ends
    function triggerHeroCountersIfVisible() {
        const numbers = document.querySelectorAll('.hero-stats .stat-number');
        numbers.forEach(el => {
            if (el.classList.contains('animated')) return;
            const rect = el.getBoundingClientRect();
            const isVisible = rect.top < (window.innerHeight || document.documentElement.clientHeight) && rect.bottom > 0;
            if (isVisible) {
                el.classList.add('animated');
                el.textContent = '0';
                animateCounter(el);
            }
        });
    }

    // Theme toggle (light/dark)
    // The active scheme lives on <html data-color-scheme>, resolved before first paint
    // by the inline script in _layouts/default.html. These helpers only keep it in sync
    // afterwards: toggle state, storage, browser UI color and the `themechange` event.

    function getTheme() {
        return document.documentElement.getAttribute('data-color-scheme') === 'dark' ? 'dark' : 'light';
    }

    function getStoredTheme() {
        try {
            const stored = localStorage.getItem('theme');
            return stored === 'dark' || stored === 'light' ? stored : null;
        } catch (e) {
            return null; // storage blocked (privacy mode, disabled cookies)
        }
    }

    // `notify` is false for the initial sync: nothing changed, and
    // createParticles() reads the current tokens when it is created anyway.
    // Every real state change must notify, on window, for the particle recolor.
    function applyTheme(scheme, notify) {
        document.documentElement.setAttribute('data-color-scheme', scheme);

        const toggle = document.getElementById('theme-toggle');
        if (toggle) {
            toggle.setAttribute('aria-pressed', scheme === 'dark' ? 'true' : 'false');
        }

        const meta = document.getElementById('theme-color');
        if (meta) {
            // Read the token instead of a second hard-coded map: the browser UI
            // colour can then never drift from the page background. The inline
            // pre-paint script must keep its literals (the stylesheet is not
            // guaranteed to be resolved yet), so the value now lives in exactly
            // two places instead of three.
            const bg = getComputedStyle(document.documentElement)
                .getPropertyValue('--color-background').trim();
            if (bg) {
                meta.setAttribute('content', bg);
            }
        }

        if (notify !== false) {
            // Must stay on window: createParticles() listens there to re-read its color tokens.
            window.dispatchEvent(new CustomEvent('themechange', { detail: { scheme: scheme } }));
        }
    }

    function setupThemeToggle() {
        // Reflect the scheme chosen before first paint (also fixes aria-pressed on reload).
        applyTheme(getTheme(), false);

        const toggle = document.getElementById('theme-toggle');
        if (toggle) {
            toggle.addEventListener('click', () => {
                const next = getTheme() === 'dark' ? 'light' : 'dark';
                applyTheme(next);
                try {
                    localStorage.setItem('theme', next);
                } catch (e) {
                    /* storage blocked: the choice lasts for this page view only */
                }
            });
        }

        // Until the visitor picks a theme explicitly, keep following the OS preference.
        if (window.matchMedia) {
            const query = window.matchMedia('(prefers-color-scheme: dark)');
            const onSchemeChange = (event) => {
                if (getStoredTheme()) return;
                applyTheme(event.matches ? 'dark' : 'light');
            };
            if (query.addEventListener) {
                query.addEventListener('change', onSchemeChange);
            } else if (query.addListener) {
                query.addListener(onSchemeChange); // Safari < 14
            }
        }
    }

    // Add particle effect to hero section with connected faint lines
    function createParticles() {
        // Decorative only: with reduced motion the canvas is not created at all,
        // so there is no loop, no resize listener and nothing repainting.
        if (reduceMotion) return;

        const hero = document.querySelector('.hero');
        if (!hero) return;

        const existingCanvas = document.getElementById('hero-particles-canvas');
        if (existingCanvas) existingCanvas.remove();

        const canvas = document.createElement('canvas');
        canvas.id = 'hero-particles-canvas';
        canvas.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 0;
            pointer-events: none;
        `;
        hero.appendChild(canvas);

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Particle colors come from the theme tokens so both schemes stay readable.
        function readColorTokens() {
            const styles = getComputedStyle(document.documentElement);
            return {
                particle: styles.getPropertyValue('--particle-rgb').trim() || '129, 140, 248',
                line: styles.getPropertyValue('--particle-line-rgb').trim() || '255, 255, 255'
            };
        }
        let themeColors = readColorTokens();
        window.addEventListener('themechange', () => {
            themeColors = readColorTokens();
        });

        let width = 0;
        let height = 0;
        let particles = [];
        let mouse = { x: -1000, y: -1000, active: false };

        function resize() {
            width = canvas.width = hero.offsetWidth;
            height = canvas.height = hero.offsetHeight;
            initParticles();
        }

        function initParticles() {
            particles = [];
            // Quiet background texture: fewer, smaller dots than the old
            // 35-70 range. The canvas covers the whole hero, so the count
            // scales with its area but stays inside 24-48.
            const count = Math.min(48, Math.max(24, Math.floor((width * height) / 26000)));
            for (let i = 0; i < count; i++) {
                particles.push({
                    x: Math.random() * width,
                    y: Math.random() * height,
                    vx: (Math.random() - 0.5) * 0.6,
                    vy: (Math.random() - 0.5) * 0.6,
                    bouncePhase: Math.random() * Math.PI * 2,
                    bounceSpeed: 0.015 + Math.random() * 0.02,
                    bounceAmp: 0.3 + Math.random() * 0.4,
                    radius: 1.6 + Math.random() * 1.2,
                    isHovered: false
                });
            }
        }

        function onMouseMove(e) {
            const rect = hero.getBoundingClientRect();
            mouse.x = e.clientX - rect.left;
            mouse.y = e.clientY - rect.top;
            mouse.active = true;
        }

        function onMouseLeave() {
            mouse.x = -1000;
            mouse.y = -1000;
            mouse.active = false;
        }

        hero.addEventListener('mousemove', onMouseMove);
        hero.addEventListener('mouseleave', onMouseLeave);

        function animate() {
            ctx.clearRect(0, 0, width, height);

            let hoveredParticle = null;
            let minMouseDist = Infinity;
            const hoverRadius = 35;

            for (let i = 0; i < particles.length; i++) {
                const p = particles[i];
                p.bouncePhase += p.bounceSpeed;
                p.x += p.vx;
                p.y += p.vy + Math.sin(p.bouncePhase) * p.bounceAmp;

                if (p.x < 0) { p.x = 0; p.vx *= -1; }
                if (p.x > width) { p.x = width; p.vx *= -1; }
                if (p.y < 0) { p.y = 0; p.vy *= -1; }
                if (p.y > height) { p.y = height; p.vy *= -1; }

                if (mouse.active) {
                    const dx = mouse.x - p.x;
                    const dy = mouse.y - p.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < hoverRadius && dist < minMouseDist) {
                        minMouseDist = dist;
                        hoveredParticle = p;
                    }
                }
                p.isHovered = false;
            }

            if (hoveredParticle) {
                hoveredParticle.isHovered = true;
            }

            const maxConnectDist = 130;
            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const p1 = particles[i];
                    const p2 = particles[j];
                    const dx = p1.x - p2.x;
                    const dy = p1.y - p2.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    if (dist < maxConnectDist) {
                        const isLineHovered = p1.isHovered || p2.isHovered;
                        const factor = 1 - dist / maxConnectDist;

                        ctx.beginPath();
                        ctx.moveTo(p1.x, p1.y);
                        ctx.lineTo(p2.x, p2.y);

                        if (isLineHovered) {
                            ctx.strokeStyle = `rgba(${themeColors.line}, ${Math.min(0.85, factor * 0.85)})`;
                            ctx.lineWidth = 2;
                        } else {
                            ctx.strokeStyle = `rgba(${themeColors.particle}, ${factor * 0.16})`;
                            ctx.lineWidth = 1.5;
                        }
                        ctx.stroke();
                    }
                }
            }

            for (let i = 0; i < particles.length; i++) {
                const p = particles[i];
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.isHovered ? p.radius + 1.8 : p.radius, 0, Math.PI * 2);

                if (p.isHovered) {
                    ctx.fillStyle = `rgb(${themeColors.line})`;
                    ctx.shadowColor = `rgb(${themeColors.line})`;
                    ctx.shadowBlur = 10;
                } else {
                    ctx.fillStyle = `rgba(${themeColors.particle}, 0.55)`;
                    ctx.shadowBlur = 0;
                }
                ctx.fill();
                ctx.shadowBlur = 0;
            }

            requestAnimationFrame(animate);
        }

        window.addEventListener('resize', resize);
        resize();
        requestAnimationFrame(animate);
    }

    // Utility functions
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Language Switcher Slider Animation
    function setupLanguageSwitcher() {
        const langSwitch = document.querySelector('.lang-switch');
        if (!langSwitch) return;

        const langLinks = langSwitch.querySelectorAll('.lang-link');

        function switchLanguage(targetLink, e) {
            if (targetLink.classList.contains('active')) {
                return;
            }
            if (e && (e.metaKey || e.ctrlKey || e.shiftKey || e.which === 2)) {
                return;
            }
            if (e) {
                e.preventDefault();
            }

            const targetUrl = targetLink.getAttribute('href');
            const targetLang = targetLink.getAttribute('data-lang');

            // Slide circle to active position
            langSwitch.classList.remove('en-active', 'it-active');
            langSwitch.classList.add(targetLang + '-active');
            langLinks.forEach(l => l.classList.remove('active'));
            targetLink.classList.add('active');

            // Navigate after transition completes
            setTimeout(() => {
                window.location.href = targetUrl;
            }, 220);
        }

        langLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                switchLanguage(this, e);
            });
        });

        // Clicking on the pill switch track toggles to the inactive language
        langSwitch.addEventListener('click', function(e) {
            if (e.target.closest('.lang-link')) {
                return;
            }
            const inactiveLink = langSwitch.querySelector('.lang-link:not(.active)');
            if (inactiveLink) {
                switchLanguage(inactiveLink, e);
            }
        });
    }

    // Event Listeners Setup
    function setupEventListeners() {
        // Language switcher
        setupLanguageSwitcher();

        // Hamburger menu
        if (hamburger) {
            hamburger.addEventListener('click', toggleMobileNav);
        }

        // Keep the mobile menu glued to the bottom of the navbar.
        syncNavbarHeight();
        if (navbar) {
            if (typeof ResizeObserver === 'function') {
                new ResizeObserver(syncNavbarHeight).observe(navbar);
            } else {
                window.addEventListener('resize', syncNavbarHeight);
            }
        }

        // Escape closes the menu and hands focus back to the button that opened it.
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && isMobileNavOpen()) {
                setMobileNav(false, { returnFocus: true });
            }
        });

        // While the drawer is open, Tab cycles inside the navbar: the eight
        // drawer links, then the theme toggle, the language links and the
        // hamburger. Without this, Tab walks into the page content that the
        // opaque drawer is covering (and `inert` is ignored by older engines).
        document.addEventListener('keydown', (e) => {
            if (e.key !== 'Tab' || !isMobileNavOpen()) return;
            const items = navFocusables();
            if (!items.length) return;
            const first = items[0];
            const last = items[items.length - 1];
            const active = document.activeElement;
            if (!navbar.contains(active)) {
                e.preventDefault();
                first.focus();
            } else if (e.shiftKey && active === first) {
                e.preventDefault();
                last.focus();
            } else if (!e.shiftKey && active === last) {
                e.preventDefault();
                first.focus();
            }
        });

        // Widening past the breakpoint must not leave the page scroll-locked.
        // It must also not drop focus onto <body>: the hamburger is display:none
        // above it, so a user who had focus on it loses all context. The
        // drawer's first link is laid out inline there, so hand focus to it.
        // (Focus on a menu link survives on its own: it is the same <a>, still
        // visible on desktop. That is why only the hamburger needs help.)
        if (window.matchMedia) {
            const mobileNavQuery = window.matchMedia('(max-width: 1024px)');
            const handleMobileNavBreakpoint = (e) => {
                if (e.matches) return;
                const restoreFocus = lastNavFocus === hamburger;
                setMobileNav(false);
                if (restoreFocus) {
                    const firstLink = navMenu && navMenu.querySelector('.nav-link');
                    // preventScroll: the link lives in the fixed navbar, so there
                    // is nothing to reveal, and focusing must not jump the page.
                    if (firstLink) firstLink.focus({ preventScroll: true });
                }
                lastNavFocus = null;
            };
            if (mobileNavQuery.addEventListener) {
                mobileNavQuery.addEventListener('change', handleMobileNavBreakpoint);
            } else if (mobileNavQuery.addListener) {
                mobileNavQuery.addListener(handleMobileNavBreakpoint);
            }
        }

        // Record what has focus inside the navbar, and forget it the moment focus
        // moves anywhere else — a stale hamburger value would otherwise pull focus
        // into the nav on some later resize. This is safe for the breakpoint case
        // because the browser blurs the hamburger to <body> WITHOUT firing a
        // focusin (verified), so `lastNavFocus` is still the hamburger when the
        // matchMedia change event arrives.
        document.addEventListener('focusin', (e) => {
            lastNavFocus = navbar && navbar.contains(e.target) ? e.target : null;
        });
        
        // Navigation links - FIXED smooth scrolling
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href');
                if (targetId && targetId.startsWith('#')) {
                    // Close first: the drawer's scroll lock hides the scrollbar, so
                    // the content is ~15px wider while it is open. Measuring the
                    // target under the locked layout and reflowing straight after
                    // would leave the smooth scroll aiming at a stale offset.
                    closeMobileNav();
                    smoothScroll(targetId);
                }
            });
        });

        // Contact form
        if (contactForm) {
            contactForm.addEventListener('submit', handleContactForm);
        }

        // Hero contact me button
        if (contactMeBtn) {
            contactMeBtn.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = contactMeBtn.getAttribute('href');
                if (targetId && targetId.startsWith('#')) {
                    smoothScroll(targetId);
                }
            });
        }
        
        // Download CV button
        if (downloadCvBtn) {
            downloadCvBtn.addEventListener('click', handleDownloadCV);
        }

        // Optimized scroll handler
        const scrollProgressEl = document.getElementById('scroll-progress');
        const optimizedScrollHandler = debounce(() => {
            handleNavbarScroll();
            updateActiveNavLink();
        }, 10);

        // Scroll progress bar — uses rAF for buttery smoothness
        function updateScrollProgress() {
            if (!scrollProgressEl) return;
            const scrollTop = window.scrollY || document.documentElement.scrollTop;
            const docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
            const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
            scrollProgressEl.style.width = Math.min(progress, 100) + '%';
        }

        window.addEventListener('scroll', optimizedScrollHandler);
        window.addEventListener('scroll', () => requestAnimationFrame(updateScrollProgress), { passive: true });

        // Projects filter badges
        if (filterBadges && filterBadges.length > 0) {
            filterBadges.forEach(badge => {
                badge.addEventListener('click', () => {
                    const filter = badge.getAttribute('data-filter');

                    // Update active state and aria-pressed
                    filterBadges.forEach(b => {
                        b.classList.remove('active');
                        b.setAttribute('aria-pressed', 'false');
                    });
                    badge.classList.add('active');
                    badge.setAttribute('aria-pressed', 'true');

                    // Filter cards
                    projectCards.forEach(card => {
                        const category = (card.getAttribute('data-category') || '').toLowerCase();
                        const shouldShow = filter === 'all' || category === filter;
                        card.style.display = shouldShow ? '' : 'none';
                    });
                });
            });
        }
    }

    // Initialize everything
    function init() {
        setupThemeToggle();
        createPreloader();
        createScrollToTopButton();
        // Ensure hero stat targets are set before observers/animations start
        setHeroStatsTargets();
        createObserver();
        createParticles();
        setupEventListeners();
        
        // Set current year in footer
        const currentYearEl = document.getElementById('current-year');
        if (currentYearEl) {
            currentYearEl.textContent = new Date().getFullYear();
        }

        // Compute and set dynamic age (supports #age and .age elements)
        const today = new Date();
        const birthDate = new Date('1998-02-01T00:00:00');
        let computedAge = today.getFullYear() - birthDate.getFullYear();
        const hasHadBirthdayThisYear = (
            today.getMonth() > birthDate.getMonth() ||
            (today.getMonth() === birthDate.getMonth() && today.getDate() >= birthDate.getDate())
        );
        if (!hasHadBirthdayThisYear) {
            computedAge -= 1;
        }

        document.querySelectorAll('.age').forEach(el => {
            el.textContent = computedAge.toString();
        });
        
        // Start the typing effect after a short delay. With reduced motion the
        // first phrase is simply there: no loop, no deleting, no cursor blink
        // (the CSS block also stops the blink).
        if (reduceMotion) {
            if (typingText) {
                typingText.textContent = phrases[0];
            }
        } else {
            setTimeout(() => {
                if (typingText) {
                    typeEffect();
                }
            }, 1500);
        }

        // Counters are triggered via IntersectionObserver; avoid double-starts

        // Console welcome message
        console.log('%c👋 Ciao! Benvenuto nel mio portfolio!', 'color: #22D3EE; font-size: 16px; font-weight: bold;');
        console.log('%c🚀 Sviluppato da Simone Del Grosso', 'color: #64748B; font-size: 12px;');
        console.log('%c📧 simonedelgrosso@outlook.it', 'color: #64748B; font-size: 12px;');
    }

    // Initialize the application
    init();
});
