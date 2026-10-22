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
            menuToggle.setAttribute('aria-label', 'Fermer le menu');
        } else {
            nav.classList.remove('open');
            if (icon) {
                icon.classList.remove('fa-xmark');
                icon.classList.add('fa-bars');
            }
            menuToggle.setAttribute('aria-expanded', 'false');
            menuToggle.setAttribute('aria-label', 'Ouvrir le menu');
        }
    };

    if (menuToggle && nav) {
        menuToggle.setAttribute('aria-expanded', 'false');
        menuToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            const isOpen = nav.classList.contains('open');
            updateMenuState(!isOpen);
        });

        // Clic en dehors du menu mobile pour le fermer automatiquement
        document.addEventListener('click', (e) => {
            if (nav.classList.contains('open') && !nav.contains(e.target)) {
                updateMenuState(false);
            }
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
    // --- 2. Module Général de Carrousel Défilant (Lecture Automatique / Autoplay) ---
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
        let autoplayTimer = null;
        const autoplayInterval = 4000; // Défilement automatique toutes les 4 secondes

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

        // Gestion de la lecture automatique
        function startAutoplay() {
            stopAutoplay();
            if (getMaxIndex() > 0) {
                autoplayTimer = setInterval(() => {
                    goToSlide(currentIndex + 1);
                }, autoplayInterval);
            }
        }

        function stopAutoplay() {
            if (autoplayTimer) {
                clearInterval(autoplayTimer);
                autoplayTimer = null;
            }
        }

        function resetAutoplay() {
            stopAutoplay();
            startAutoplay();
        }

        // Pause de l'autoplay sur survol de la souris ou interaction tactile
        container.addEventListener('mouseenter', stopAutoplay);
        container.addEventListener('mouseleave', startAutoplay);

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
                dot.addEventListener('click', () => {
                    goToSlide(i);
                    resetAutoplay();
                });
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

            if (maxIdx <= 0) {
                currentIndex = 0;
            } else if (index > maxIdx) {
                currentIndex = 0; // Navigation circulaire : retour au début
            } else if (index < 0) {
                currentIndex = maxIdx; // Navigation circulaire : passage à la fin
            } else {
                currentIndex = index;
            }

            pauseVideos();

            const slideWidthPercent = 100 / getVisibleCount();
            track.style.transform = `translateX(-${currentIndex * slideWidthPercent}%)`;

            // Les boutons restent actifs pour permettre la navigation circulaire en boucle
            if (prevBtn) prevBtn.disabled = maxIdx <= 0;
            if (nextBtn) nextBtn.disabled = maxIdx <= 0;

            // Mise à jour des puces
            if (indicatorsContainer) {
                const dots = indicatorsContainer.querySelectorAll('.carousel-dot');
                dots.forEach((dot, idx) => {
                    dot.classList.toggle('active', idx === currentIndex);
                });
            }
        }

        // Événements boutons Gauche / Droite avec gestion préventive et réinitialisation autoplay
        if (prevBtn) {
            prevBtn.addEventListener('click', (e) => {
                e.preventDefault();
                goToSlide(currentIndex - 1);
                resetAutoplay();
            });
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', (e) => {
                e.preventDefault();
                goToSlide(currentIndex + 1);
                resetAutoplay();
            });
        }

        // Support Tactile (Swipe)
        let startX = 0;
        let isSwiping = false;

        track.addEventListener('touchstart', (e) => {
            stopAutoplay();
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
            startAutoplay();
        }, { passive: true });

        // Ajustement sur changement de taille d'écran
        window.addEventListener('resize', () => {
            renderIndicators();
            goToSlide(currentIndex);
            resetAutoplay();
        });

        // Initialisation du carrousel et lancement de l'autoplay
        renderIndicators();
        goToSlide(0);
        startAutoplay();
    }

    // Initialisation des carrousels
    initCarousel('foncierchain-carousel');
    initCarousel('coursly-carousel');

    // ==========================================================
    // --- 2.5. Vitrine Unifiée AGP (Single Screen Showcase) ---
    // ==========================================================
    function initAGPSingleScreenShowcase() {
        const tabBtns = document.querySelectorAll('.agp-tab-btn');
        const mainVideo = document.getElementById('agp-main-video');
        const videoSrc = document.getElementById('agp-main-video-src');
        const deviceBadge = document.getElementById('agp-device-badge');
        const moduleTitle = document.getElementById('agp-module-title');
        const moduleDesc = document.getElementById('agp-module-desc');
        const techPills = document.getElementById('agp-tech-pills');
        const stepsList = document.getElementById('agp-steps-list');

        if (!tabBtns.length || !mainVideo) return;

        const agpModulesData = {
            inscription: {
                title: '<i class="fas fa-mobile-screen-button" style="color: #3b82f6;"></i> 1. AGP Pay — Inscription & Activation Passager',
                desc: 'Parcours usager complet : création du profil, vérification OTP par SMS, enregistrement de l\'immatriculation du véhicule et génération du Pass QR Code sécurisé.',
                video: 'videos/agp_pay_mobile_inscription_passager.mp4',
                poster: 'images/agp_framed/frame_agp_pay_mobile_inscription_passager.mp4_0.png',
                badge: '<i class="fab fa-apple"></i> iPhone 15 Pro • App Mobile Flutter',
                pills: [
                    '<span class="agp-pill"><i class="fas fa-code"></i> Flutter / Dart</span>',
                    '<span class="agp-pill"><i class="fas fa-server"></i> API Django REST</span>',
                    '<span class="agp-pill"><i class="fas fa-qrcode"></i> Pass QR Code JWT</span>',
                    '<span class="agp-pill"><i class="fas fa-comment-sms"></i> OTP SMS Twilio</span>'
                ],
                steps: [
                    'Lancement de l\'application AGP Pay & Écran d\'accueil',
                    'Sélection du profil Usager Passager / Conducteur',
                    'Saisie du numéro de téléphone & vérification OTP SMS',
                    'Informations personnelles & immatriculation du véhicule',
                    'Génération du Pass QR Code sécurisé unique',
                    'Accès au tableau de bord usager avec statut du pass'
                ]
            },
            recharge: {
                title: '<i class="fas fa-wallet" style="color: #3b82f6;"></i> 2. AGP Pay — Recharge Mobile Money & Péage',
                desc: 'Recharge instantanée via Mobile Money (PayDunya / SankMoney), confirmation par Webhooks sécurisés et débit automatique lors du passage aux barrières de péage.',
                video: 'videos/agp_pay_mobile_recharge_paiement.mp4',
                poster: 'images/agp_framed/frame_agp_pay_mobile_recharge_paiement.mp4_0.png',
                badge: '<i class="fab fa-apple"></i> iPhone 15 Pro • Mobile Money & Scan QR',
                pills: [
                    '<span class="agp-pill"><i class="fas fa-wallet"></i> PayDunya API</span>',
                    '<span class="agp-pill"><i class="fas fa-money-bill-transfer"></i> SankMoney</span>',
                    '<span class="agp-pill"><i class="fas fa-bolt"></i> Webhooks Instantanés</span>',
                    '<span class="agp-pill"><i class="fas fa-receipt"></i> Reçu Numérique PDF</span>'
                ],
                steps: [
                    'Consultation du solde actuel sur le portefeuille mobile',
                    'Choix de l\'opérateur Mobile Money (PayDunya / SankMoney)',
                    'Saisie du montant en FCFA & validation de la transaction',
                    'Mise à jour instantanée du solde via Webhook sécurisé',
                    'Présentation du QR Code au borne de voie de péage',
                    'Débit automatique & ouverture instantanée de la barrière',
                    'Téléchargement du reçu numérique & historique comptable'
                ]
            },
            dashboard: {
                title: '<i class="fas fa-desktop" style="color: #3b82f6;"></i> 3. AGP Admin — Dashboard & Monitoring Web',
                desc: 'Supervision globale et en temps réel du réseau national de péage sur portail Angular : recettes cumulées, trafic horaire et cartographie des gares.',
                video: 'videos/agp_admin_web_dashboard_monitoring.mp4',
                poster: 'images/agp_framed/frame_agp_admin_web_dashboard_monitoring.mp4_0.png',
                badge: '<i class="fab fa-apple"></i> macOS • Portal Web Angular 17',
                pills: [
                    '<span class="agp-pill"><i class="fab fa-angular"></i> Web Angular</span>',
                    '<span class="agp-pill"><i class="fas fa-chart-line"></i> Analytics Temps Réel</span>',
                    '<span class="agp-pill"><i class="fas fa-shield-halved"></i> Auth JWT & Rôles</span>',
                    '<span class="agp-pill"><i class="fas fa-map-location-dot"></i> Mapping Postes</span>'
                ],
                steps: [
                    'Connexion sécurisée au portail AGP Admin avec authentification JWT',
                    'Indicateurs clés de performance (KPIs) & recettes nationales',
                    'Carte interactive de supervision géolocalisée des postes de péage',
                    'Surveillance en temps réel de l\'état des voies & barrières',
                    'Graphiques dynamiques des flux de trafic horaire & hebdomadaire',
                    'Gestion centralisée des comptes administrateurs et privilèges'
                ]
            },
            postes: {
                title: '<i class="fas fa-sliders" style="color: #3b82f6;"></i> 4. AGP Admin — Postes de Péage & Tarification',
                desc: 'Configuration centralisée des gares de péage, voies d\'accès, grilles tarifaires par catégorie de véhicule (Poids lourds, Léger, Moto) et abonnements.',
                video: 'videos/agp_admin_web_gestion_postes_tarifs.mp4',
                poster: 'images/agp_framed/frame_agp_admin_web_gestion_postes_tarifs.mp4_0.png',
                badge: '<i class="fab fa-apple"></i> macOS • Portal Web Angular 17',
                pills: [
                    '<span class="agp-pill"><i class="fas fa-building-columns"></i> Postes & Voies</span>',
                    '<span class="agp-pill"><i class="fas fa-tags"></i> Grilles Tarifaires</span>',
                    '<span class="agp-pill"><i class="fas fa-id-card"></i> Abonnements Pass</span>',
                    '<span class="agp-pill"><i class="fas fa-network-wired"></i> Synchro Local Node</span>'
                ],
                steps: [
                    'Création & paramétrage des postes de péage nationaux',
                    'Configuration des lignes & équipements par voie (Caméras, Barrières)',
                    'Définition des grilles tarifaires selon la classe du véhicule',
                    'Gestion des exemptions, cartes d\'abonnement & pass permanents',
                    'Propagation instantanée des tarifs aux serveurs locaux des postes',
                    'Audit & validation des directives par la direction générale'
                ]
            },
            synchro: {
                title: '<i class="fas fa-cloud-arrow-up" style="color: #3b82f6;"></i> 5. AGP System — DataSynchro Cloud & Reporting',
                desc: 'Architecture résiliente multi-sites avec moteur DataSynchro : réplication bidirectionnelle Cloud/Local, tolérance aux pannes réseau et reporting financier.',
                video: 'videos/agp_system_synchro_cloud_reporting.mp4',
                poster: 'images/agp_framed/frame_agp_system_synchro_cloud_reporting.mp4_0.png',
                badge: '<i class="fab fa-apple"></i> Hybrid Cloud VPS & Local Nodes',
                pills: [
                    '<span class="agp-pill"><i class="fas fa-arrows-rotate"></i> Moteur DataSynchro</span>',
                    '<span class="agp-pill"><i class="fas fa-wifi-slash"></i> Resilient Offline Mode</span>',
                    '<span class="agp-pill"><i class="fas fa-database"></i> PostgreSQL & SQLite</span>',
                    '<span class="agp-pill"><i class="fas fa-file-invoice-dollar"></i> Reporting & Audits</span>'
                ],
                steps: [
                    'Architecture distribuée : Serveur Cloud VPS & Serveurs de Voie Locaux',
                    'Moteur DataSynchro pour la réplication continue des transactions',
                    'Fonctionnement 100% autonome en cas de coupure Internet locale',
                    'Rattrapage automatique & synchronisation delta dès le rétablissement',
                    'Génération automatisée des bilans financiers & audits comptables',
                    'Synergie de l\'écosystème complet AGP (Django REST, Angular, Flutter)'
                ]
            }
        };

        function switchModule(modKey) {
            const modData = agpModulesData[modKey];
            if (!modData) return;

            // Update active tab button
            tabBtns.forEach(btn => {
                btn.classList.toggle('active', btn.getAttribute('data-module') === modKey);
            });

            // Update video & poster frame
            if (videoSrc && mainVideo) {
                mainVideo.pause();
                if (modData.poster) {
                    mainVideo.poster = modData.poster;
                }
                videoSrc.src = modData.video;
                mainVideo.load();
                mainVideo.play().catch(() => {});
            }

            // Update badge
            if (deviceBadge) {
                deviceBadge.innerHTML = modData.badge;
            }

            // Update title & desc
            if (moduleTitle) moduleTitle.innerHTML = modData.title;
            if (moduleDesc) moduleDesc.textContent = modData.desc;

            // Update tech pills
            if (techPills) {
                techPills.innerHTML = modData.pills.join('');
            }

            // Update workflow steps
            if (stepsList) {
                stepsList.innerHTML = modData.steps.map((stepText, idx) => `
                    <li class="agp-step-item">
                        <span class="agp-step-number">${idx + 1}</span>
                        <span>${stepText}</span>
                    </li>
                `).join('');
            }
        }

        // Attach click listener to tab buttons
        tabBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const modKey = btn.getAttribute('data-module');
                switchModule(modKey);
            });
        });

        // Initialize with default module 'inscription'
        switchModule('inscription');
    }

    initAGPSingleScreenShowcase();

    // ==========================================================
    // --- 3. Interface Modale FoncierChain (Ouverture sans Redirection) ---
    // ==========================================================
    const modalOverlay = document.getElementById('foncierchain-modal');
    const modalIframe = document.getElementById('modal-iframe');
    const modalUrlTitle = document.getElementById('modal-url-title');
    const modalBtnClose = document.getElementById('modal-btn-close');
    const modalBtnOpenAll = document.getElementById('modal-btn-open-all');

    let currentActiveUrl = '';

    function openModal(url, title) {
        if (!modalOverlay || !modalIframe) return;
        currentActiveUrl = url;
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

    // Bouton "Tout ouvrir" (ouvre uniquement le lien du site indexé actuellement affiché)
    if (modalBtnOpenAll) {
        modalBtnOpenAll.addEventListener('click', () => {
            if (currentActiveUrl) {
                window.open(currentActiveUrl, '_blank');
            } else if (modalIframe && modalIframe.src) {
                window.open(modalIframe.src, '_blank');
            }
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
