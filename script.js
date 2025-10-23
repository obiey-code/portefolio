/* Fichier: script.js - Complet et Optimisé */

document.addEventListener('DOMContentLoaded', () => {

    const menuToggle = document.querySelector('.menu-toggle');
    const nav = document.querySelector('nav');
    const contactForm = document.querySelector('.contact-form');
    const formStatus = document.getElementById('form-status');
    const heroContent = document.querySelector('.hero-content');

    // ==========================================================
    // --- Fonction d'aide pour la gestion du menu (A11Y) ---
    // ==========================================================
    /**
     * Met à jour l'état visuel et ARIA du menu.
     * @param {boolean} isOpen - L'état souhaité (true pour ouvert, false pour fermé).
     */
    const updateMenuState = (isOpen) => {
        const icon = menuToggle.querySelector('i');
        
        if (isOpen) {
            nav.classList.add('open');
            icon.classList.remove('fa-bars');
            icon.classList.add('fa-xmark');
            menuToggle.setAttribute('aria-expanded', 'true');
        } else {
            nav.classList.remove('open');
            icon.classList.remove('fa-xmark');
            icon.classList.add('fa-bars');
            menuToggle.setAttribute('aria-expanded', 'false');
        }
    };

    // ==========================================================
    // --- 1. Gestion du Menu Hamburger (Responsive) ---
    // ==========================================================
    if (menuToggle && nav) {
        // Initialisation de l'état ARIA au chargement
        menuToggle.setAttribute('aria-expanded', 'false');

        menuToggle.addEventListener('click', () => {
            const isOpen = nav.classList.contains('open');
            updateMenuState(!isOpen); // Inverse l'état actuel
        });
    }

    // ==========================================================
    // --- 2. Gestion du Défilement Fluide & Fermeture Menu ---
    // ==========================================================
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);

            if (targetElement && targetId !== '#') { // Évite de défiler si href="#"
                e.preventDefault();

                targetElement.scrollIntoView({
                    behavior: 'smooth'
                });
                
                // Fermer le menu après le clic sur un lien (pour les appareils mobiles)
                if (nav && nav.classList.contains('open')) {
                    updateMenuState(false);
                }
            }
        });
    });

    // ==========================================================
    // --- 3. Animation : Apparition du Hero ---
    // ==========================================================
    if (heroContent) {
        // Déclenche l'animation CSS (classe .is-loaded) après un court délai pour l'effet d'apparition
        setTimeout(() => {
            heroContent.classList.add('is-loaded');
        }, 300);
    }

    // ==========================================================
    // --- 4. Gestionnaire de Formulaire de Contact (AJAX) ---
    // Utilise Formspree ou une autre action similaire
    // ==========================================================
    if (contactForm && formStatus) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault(); 

            const submitButton = contactForm.querySelector('button[type="submit"]');
            
            // État de chargement
            submitButton.disabled = true;
            submitButton.textContent = 'Envoi en cours...';
            formStatus.textContent = ''; 

            try {
                const formData = new FormData(contactForm);
                const response = await fetch(contactForm.action, {
                    method: contactForm.method,
                    body: formData,
                    headers: {
                        'Accept': 'application/json'
                    }
                });

                if (response.ok) {
                    // Succès
                    formStatus.style.color = 'green';
                    formStatus.textContent = "✅ Message envoyé ! Merci pour votre intérêt, je vous recontacterai rapidement à l'adresse fournie.";
                    contactForm.reset();
                } else {
                    // Erreur
                    const data = await response.json();
                    const errorMessage = data.error 
                        ? `❌ Erreur : ${data.error}` 
                        : "❌ Une erreur s'est produite lors de l'envoi. Veuillez réessayer ou utiliser l'e-mail.";
                    
                    formStatus.textContent = errorMessage;
                    formStatus.style.color = 'red';
                }

            } catch (error) {
                // Erreur de réseau
                formStatus.style.color = 'red';
                formStatus.textContent = "❌ Une erreur de connexion s'est produite. Veuillez vérifier votre réseau.";
            } finally {
                // Réactiver le bouton
                submitButton.disabled = false;
                submitButton.textContent = 'Envoyer';

                // Nettoyer le message après 10 secondes
                setTimeout(() => {
                    formStatus.textContent = '';
                }, 10000);
            }
        });
    }
});
