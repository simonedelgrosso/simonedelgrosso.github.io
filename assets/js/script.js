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
    
    // Skills Elements
    const skillBars = document.querySelectorAll('.skill-progress');
    
    // Form Element
    const contactForm = document.getElementById('contact-form');
    const contactMeBtn = document.getElementById('contact-me');
    const downloadCvBtn = document.getElementById('download-cv');
    const filterBadges = document.querySelectorAll('.filter-badge');
    const projectCards = document.querySelectorAll('.project-card');

    // Runtime flags
    let preloaderActive = true;

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

    // Mobile Navigation Toggle
    function toggleMobileNav() {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
        
        // Animate hamburger bars
        const bars = hamburger.querySelectorAll('.bar');
        if (hamburger.classList.contains('active')) {
            bars[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
            bars[1].style.opacity = '0';
            bars[2].style.transform = 'rotate(-45deg) translate(5px, -5px)';
        } else {
            bars[0].style.transform = 'none';
            bars[1].style.opacity = '1';
            bars[2].style.transform = 'none';
        }
    }

    // Close mobile nav when clicking on a link
    function closeMobileNav() {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
        const bars = hamburger.querySelectorAll('.bar');
        bars[0].style.transform = 'none';
        bars[1].style.opacity = '1';
        bars[2].style.transform = 'none';
    }

    // Fixed Smooth Scrolling for Navigation Links
    function smoothScroll(targetId) {
        const element = document.querySelector(targetId);
        if (element) {
            const offsetTop = element.offsetTop - 80; // Account for fixed navbar
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
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

    // Animate Skills Progress Bars
    function animateSkillBar(skillBar) {
        const targetWidth = skillBar.getAttribute('data-skill');
        skillBar.style.width = targetWidth + '%';
    }

    // Intersection Observer for Animations
    function createObserver() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // Animate timeline items
                    if (entry.target.classList.contains('timeline-item')) {
                        entry.target.style.animationDelay = '0.25s';
                        entry.target.style.animationFillMode = 'forwards';
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

                    // Animate skill bars
                    if (entry.target.classList.contains('skill-progress') && !entry.target.classList.contains('animated')) {
                        entry.target.classList.add('animated');
                        setTimeout(() => animateSkillBar(entry.target), 500);
                    }

                    // Add fade-in animation to cards
                    if (entry.target.classList.contains('certification-card') || 
                        entry.target.classList.contains('project-card')) {
                        entry.target.style.opacity = '1';
                        entry.target.style.transform = 'translateY(0)';
                    }
                }
            });
        }, observerOptions);

        // Observe elements
        document.querySelectorAll('.timeline-item, .stat-number, .skill-progress, .certification-card, .project-card')
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

    // Initialize Cards Animation
    function initializeCardsAnimation() {
        const cards = document.querySelectorAll('.certification-card, .project-card');
        cards.forEach(card => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(30px)';
            card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        });
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
            behavior: 'smooth'
        });
    }

    // Add Scroll to Top Button
    function createScrollToTopButton() {
        const scrollBtn = document.createElement('button');
        scrollBtn.innerHTML = '<i class="fas fa-chevron-up"></i>';
        scrollBtn.className = 'scroll-to-top';

        scrollBtn.addEventListener('click', scrollToTop);
        
        // Show/hide based on scroll position
        window.addEventListener('scroll', () => {
            if (window.scrollY > 500) {
                scrollBtn.style.display = 'flex';
            } else {
                scrollBtn.style.display = 'none';
            }
        });

        document.body.appendChild(scrollBtn);
    }

    // Preloader Function
    function createPreloader() {
        const preloader = document.createElement('div');
        preloader.id = 'preloader';
        preloader.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: var(--portfolio-dark);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 9999;
            transition: opacity 0.5s ease;
        `;
        
        preloader.innerHTML = `
            <div style="text-align: center;">
                <div style="
                    width: 60px;
                    height: 60px;
                    border: 3px solid var(--color-bg-1);
                    border-top: 3px solid var(--portfolio-primary);
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                    margin: 0 auto 20px auto;
                "></div>
            </div>
        `;

        // Add spinner animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
        `;
        document.head.appendChild(style);

        document.body.insertBefore(preloader, document.body.firstChild);

        // Remove preloader after page load
        window.addEventListener('load', () => {
            setTimeout(() => {
                preloader.style.opacity = '0';
                setTimeout(() => {
                    preloader.remove();
                    // Mark preloader as done and trigger pending hero counters if already in view
                    preloaderActive = false;
                    triggerHeroCountersIfVisible();
                }, 500);
            }, 1000);
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

    // // Theme toggle functionality (bonus feature)
    // function createThemeToggle() {
    //     const themeToggle = document.createElement('button');
    //     themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
    //     themeToggle.className = 'theme-toggle';
    //     themeToggle.style.cssText = `
    //         position: fixed;
    //         top: 50%;
    //         right: 20px;
    //         transform: translateY(-50%);
    //         width: 50px;
    //         height: 50px;
    //         background: var(--color-surface);
    //         border: 2px solid var(--color-border);
    //         border-radius: 50%;
    //         color: var(--color-text);
    //         cursor: pointer;
    //         display: flex;
    //         align-items: center;
    //         justify-content: center;
    //         font-size: 18px;
    //         z-index: 999;
    //         transition: all 0.3s ease;
    //     `;

    //     themeToggle.addEventListener('click', () => {
    //         const currentTheme = document.body.getAttribute('data-color-scheme');
    //         const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    //         document.body.setAttribute('data-color-scheme', newTheme);
            
    //         themeToggle.innerHTML = newTheme === 'dark' 
    //             ? '<i class="fas fa-sun"></i>' 
    //             : '<i class="fas fa-moon"></i>';
    //     });

    //     document.body.appendChild(themeToggle);
    // }

    // Add particle effect to hero section with connected faint lines
    function createParticles() {
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
            const count = Math.min(70, Math.max(35, Math.floor((width * height) / 18000)));
            for (let i = 0; i < count; i++) {
                particles.push({
                    x: Math.random() * width,
                    y: Math.random() * height,
                    vx: (Math.random() - 0.5) * 0.6,
                    vy: (Math.random() - 0.5) * 0.6,
                    bouncePhase: Math.random() * Math.PI * 2,
                    bounceSpeed: 0.015 + Math.random() * 0.02,
                    bounceAmp: 0.3 + Math.random() * 0.4,
                    radius: 2 + Math.random() * 1.5,
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
                            ctx.strokeStyle = `rgba(255, 255, 255, ${Math.min(0.9, factor * 0.95)})`;
                            ctx.lineWidth = 2;
                        } else {
                            ctx.strokeStyle = `rgba(0, 200, 255, ${factor * 0.18})`;
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
                    ctx.fillStyle = '#fff';
                    ctx.shadowColor = '#fff';
                    ctx.shadowBlur = 10;
                } else {
                    ctx.fillStyle = 'rgba(0, 200, 255, 0.63)';
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
        
        // Navigation links - FIXED smooth scrolling
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href');
                if (targetId && targetId.startsWith('#')) {
                    smoothScroll(targetId);
                    closeMobileNav();
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
        createPreloader();
        createScrollToTopButton();
        // createThemeToggle();
        initializeCardsAnimation();
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
        
        // Start typing effect after a short delay
        setTimeout(() => {
            if (typingText) {
                typeEffect();
            }
        }, 1500);

        // Counters are triggered via IntersectionObserver; avoid double-starts

        // Add some interactive hover effects
        projectCards.forEach(card => {
            card.addEventListener('mouseenter', () => {
                card.style.transform = 'translateY(-8px) scale(1.02)';
            });
            
            card.addEventListener('mouseleave', () => {
                card.style.transform = 'translateY(0) scale(1)';
            });
        });

        // Console welcome message
        console.log('%c👋 Ciao! Benvenuto nel mio portfolio!', 'color: #22D3EE; font-size: 16px; font-weight: bold;');
        console.log('%c🚀 Sviluppato da Simone Del Grosso', 'color: #64748B; font-size: 12px;');
        console.log('%c📧 simonedelgrosso@outlook.it', 'color: #64748B; font-size: 12px;');
    }

    // Initialize the application
    init();
});