/* Fichier: script.js - Complet, Carrousels, Modale & Interaction */

document.addEventListener('DOMContentLoaded', () => {

    const menuToggle = document.querySelector('.menu-toggle');
    const nav = document.querySelector('nav');
    const contactForm = document.querySelector('.contact-form');
    const formStatus = document.getElementById('form-status');
    const heroContent = document.querySelector('.hero-content');

    // ==========================================================
    // --- 1. Navigation & Mobile Menu ---
    // ==========================================================
    const updateMenuState = (isOpen) => {
        if (!menuToggle || !nav) return;
        const icon = menuToggle.querySelector('i');
        
        if (isOpen) {
            nav.classList.add('open');
            if (icon) {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-xmark');
            }
            menuToggle.setAttribute('aria-expanded', 'true');
        } else {
            nav.classList.remove('open');
            if (icon) {
                icon.classList.remove('fa-xmark');
                icon.classList.add('fa-bars');
            }
            menuToggle.setAttribute('aria-expanded', 'false');
        }
    };

    if (menuToggle && nav) {
        menuToggle.setAttribute('aria-expanded', 'false');
        menuToggle.addEventListener('click', () => {
            const isOpen = nav.classList.contains('open');
            updateMenuState(!isOpen);
        });
    }

    // Défilement fluide & fermeture menu mobile
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            if (targetId && targetId !== '#') {
                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    e.preventDefault();
                    targetElement.scrollIntoView({ behavior: 'smooth' });
                    if (nav && nav.classList.contains('open')) {
                        updateMenuState(false);
                    }
                }
            }
        });
    });

    // Animation Hero
    if (heroContent) {
        setTimeout(() => {
            heroContent.classList.add('is-loaded');
        }, 300);
    }

    // ==========================================================
    // --- 2. Module Général de Carrousel Défilant ---
    // ==========================================================
    function initCarousel(carouselId) {
        const container = document.getElementById(carouselId);
        if (!container) return;

        const track = container.querySelector('.carousel-track');
        const slides = container.querySelectorAll('.carousel-slide');
        const prevBtn = container.querySelector('.carousel-btn-prev');
        const nextBtn = container.querySelector('.carousel-btn-next');
        const indicatorsContainer = container.querySelector('.carousel-indicators');

        if (!track || slides.length === 0) return;

        let currentIndex = 0;

        // Détermine le nombre de cartes visibles selon la largeur
        function getVisibleCount() {
            const width = window.innerWidth;
            if (width >= 992) return 3;
            if (width >= 640) return 2;
            return 1;
        }

        function getMaxIndex() {
            const visible = getVisibleCount();
            return Math.max(0, slides.length - visible);
        }

        // Crée les puces de pagination
        function renderIndicators() {
            if (!indicatorsContainer) return;
            indicatorsContainer.innerHTML = '';
            const maxIdx = getMaxIndex();

            if (maxIdx <= 0) return; // Pas besoin de puces si tout rentre

            for (let i = 0; i <= maxIdx; i++) {
                const dot = document.createElement('div');
                dot.classList.add('carousel-dot');
                if (i === currentIndex) dot.classList.add('active');
                dot.addEventListener('click', () => goToSlide(i));
                indicatorsContainer.appendChild(dot);
            }
        }

        // Met en pause toutes les vidéos dans ce carrousel
        function pauseVideos() {
            const videos = container.querySelectorAll('video');
            videos.forEach(v => {
                if (!v.paused) {
                    v.pause();
                }
            });
        }

        function goToSlide(index) {
            const maxIdx = getMaxIndex();
            currentIndex = Math.min(Math.max(index, 0), maxIdx);

            pauseVideos();

            const slideWidthPercent = 100 / getVisibleCount();
            track.style.transform = `translateX(-${currentIndex * slideWidthPercent}%)`;

            // Mise à jour des boutons
            if (prevBtn) prevBtn.disabled = currentIndex === 0;
            if (nextBtn) nextBtn.disabled = currentIndex >= maxIdx;

            // Mise à jour des puces
            if (indicatorsContainer) {
                const dots = indicatorsContainer.querySelectorAll('.carousel-dot');
                dots.forEach((dot, idx) => {
                    dot.classList.toggle('active', idx === currentIndex);
                });
            }
        }

        // Événements boutons Gauche / Droite
        if (prevBtn) {
            prevBtn.addEventListener('click', () => goToSlide(currentIndex - 1));
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', () => goToSlide(currentIndex + 1));
        }

        // Support Tactile (Swipe)
        let startX = 0;
        let isSwiping = false;

        track.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            isSwiping = true;
        }, { passive: true });

        track.addEventListener('touchend', (e) => {
            if (!isSwiping) return;
            isSwiping = false;
            const endX = e.changedTouches[0].clientX;
            const diffX = startX - endX;

            if (Math.abs(diffX) > 40) {
                if (diffX > 0) {
                    goToSlide(currentIndex + 1);
                } else {
                    goToSlide(currentIndex - 1);
                }
            }
        }, { passive: true });

        // Ajustement sur changement de taille d'écran
        window.addEventListener('resize', () => {
            renderIndicators();
            goToSlide(currentIndex);
        });

        // Initialisation du carrousel
        renderIndicators();
        goToSlide(0);
    }

    // Initialisation des 3 carrousels
    initCarousel('foncierchain-carousel');
    initCarousel('coursly-carousel');
    initCarousel('agp-videos-carousel');

    // ==========================================================
    // --- 3. Interface Modale FoncierChain (Ouverture sans Redirection) ---
    // ==========================================================
    const modalOverlay = document.getElementById('foncierchain-modal');
    const modalIframe = document.getElementById('modal-iframe');
    const modalUrlTitle = document.getElementById('modal-url-title');
    const modalBtnClose = document.getElementById('modal-btn-close');
    const modalBtnOpenAll = document.getElementById('modal-btn-open-all');

    // Liste complète des 4 liens MVP FoncierChain pour le bouton "Tout ouvrir"
    const foncierMvpUrls = [
        { title: "Web App Vercel", url: "https://foncier-chain-web1.vercel.app/" },
        { title: "Mobile Version Web", url: "https://foncierchain.github.io/FoncierChain-Mobile1/" },
        { title: "Application Android (APK)", url: "https://drive.google.com/drive/folders/1YERhQn0vkk9kO0ml8p4oXJCgguA_Rxw8?usp=drive_link" },
        { title: "Site Vitrine Projet", url: "https://foncierchain.github.io/FoncierChain/" }
    ];

    function openModal(url, title) {
        if (!modalOverlay || !modalIframe) return;
        modalIframe.src = url;
        if (modalUrlTitle) {
            modalUrlTitle.textContent = title || "FoncierChain MVP";
        }
        modalOverlay.classList.add('active');
        modalOverlay.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
    }

    function closeModal() {
        if (!modalOverlay || !modalIframe) return;
        modalOverlay.classList.remove('active');
        modalOverlay.setAttribute('aria-hidden', 'true');
        modalIframe.src = '';
        document.body.style.overflow = '';
    }

    // Attach click event to all FoncierChain MVP links
    document.querySelectorAll('.foncier-mvp-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetUrl = link.getAttribute('href');
            const targetTitle = link.getAttribute('data-title') || link.textContent.trim();
            openModal(targetUrl, targetTitle);
        });
    });

    // Bouton "Fermer la fenêtre"
    if (modalBtnClose) {
        modalBtnClose.addEventListener('click', closeModal);
    }

    // Clic sur l'arrière-plan de la modale pour fermer
    if (modalOverlay) {
        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) {
                closeModal();
            }
        });
    }

    // Touche Échap (ESC) pour fermer la modale
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modalOverlay && modalOverlay.classList.contains('active')) {
            closeModal();
        }
    });

    // Bouton "Tout ouvrir" (ouvre les 4 liens MVP dans de nouveaux onglets)
    if (modalBtnOpenAll) {
        modalBtnOpenAll.addEventListener('click', () => {
            foncierMvpUrls.forEach(item => {
                window.open(item.url, '_blank');
            });
        });
    }

    // ==========================================================
    // --- 4. Gestionnaire de Formulaire de Contact ---
    // ==========================================================
    if (contactForm && formStatus) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault(); 
            const submitButton = contactForm.querySelector('button[type="submit"]');
            submitButton.disabled = true;
            submitButton.textContent = 'Envoi en cours...';
            formStatus.textContent = ''; 

            try {
                const formData = new FormData(contactForm);
                const response = await fetch(contactForm.action, {
                    method: contactForm.method,
                    body: formData,
                    headers: { 'Accept': 'application/json' }
                });

                if (response.ok) {
                    formStatus.style.color = 'green';
                    formStatus.textContent = "✅ Message envoyé ! Merci pour votre intérêt, je vous recontacterai rapidement.";
                    contactForm.reset();
                } else {
                    const data = await response.json();
                    formStatus.textContent = data.error ? `❌ Erreur : ${data.error}` : "❌ Une erreur s'est produite lors de l'envoi.";
                    formStatus.style.color = 'red';
                }
            } catch (error) {
                formStatus.style.color = 'red';
                formStatus.textContent = "❌ Une erreur de connexion s'est produite. Veuillez vérifier votre réseau.";
            } finally {
                submitButton.disabled = false;
                submitButton.textContent = "Envoyer l'Email";
                setTimeout(() => { formStatus.textContent = ''; }, 10000);
            }
        });
    }

});
