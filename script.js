/* Fichier: script.js - Optimisé */

document.addEventListener('DOMContentLoaded', () => {

    const menuToggle = document.querySelector('.menu-toggle');
    const nav = document.querySelector('nav');
    // const navList = document.querySelector('.nav-list'); // Non utilisé directement, laissé en commentaire
    const contactForm = document.querySelector('.contact-form');
    const formStatus = document.getElementById('form-status');
    const heroContent = document.querySelector('.hero-content');

    // ==========================================================
    // --- Fonction d'aide pour la gestion du menu (A11Y) ---
    // Cette fonction centralise la gestion des classes et des attributs ARIA.
    // ==========================================================
    const updateMenuState = (isOpen) => {
        const icon = menuToggle.querySelector('i');
        
        if (isOpen) {
            nav.classList.add('open');
            icon.classList.remove('fa-bars');
            icon.classList.add('fa-xmark');
            // Met à jour l'état ARIA: menu ouvert
            menuToggle.setAttribute('aria-expanded', 'true');
        } else {
            nav.classList.remove('open');
            icon.classList.remove('fa-xmark');
            icon.classList.add('fa-bars');
            // Met à jour l'état ARIA: menu fermé
            menuToggle.setAttribute('aria-expanded', 'false');
        }
    };

    // ==========================================================
    // --- 1. Gestion du Menu Hamburger (Responsive) ---
    // ==========================================================
    if (menuToggle && nav) {
        // Initialisation de l'état ARIA au chargement (doit correspondre au CSS par défaut)
        menuToggle.setAttribute('aria-expanded', 'false');

        menuToggle.addEventListener('click', () => {
            const isOpen = nav.classList.contains('open');
            updateMenuState(!isOpen); // Inverse l'état actuel
        });
    }

    // ==========================================================
    // --- 2. Gestion du Défilement Fluide (Smooth Scrolling) ---
    // (Inclut la fermeture du menu pour l'UX mobile)
    // ==========================================================
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);

            if (targetElement) {
                e.preventDefault();

                targetElement.scrollIntoView({
                    behavior: 'smooth'
                });
                
                // Fermer le menu après le clic sur un lien (sur mobile)
                if (nav && nav.classList.contains('open')) {
                    updateMenuState(false);
                }
            }
        });
    });

    // ==========================================================
    // --- 3. Animation : Apparition du Hero (Déclenchement CSS) ---
    // Utilise une classe pour déléguer l'animation au CSS, plus performant.
    // ==========================================================
    if (heroContent) {
        // Ajout d'une classe après chargement pour déclencher l'animation CSS
        setTimeout(() => {
            heroContent.classList.add('is-loaded');
        }, 300);
    }

    // ==========================================================
    // --- 4. Gestionnaire de Formulaire de Contact (AJAX Asynchrone) ---
    // Utilise fetch et async/await pour une expérience utilisateur sans rechargement.
    // ==========================================================
    if (contactForm && formStatus) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault(); 

            const submitButton = contactForm.querySelector('button[type="submit"]');
            
            // État de chargement (UX)
            submitButton.disabled = true;
            submitButton.textContent = 'Envoi en cours...';
            formStatus.textContent = ''; // Vider le statut précédent

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
                    // Erreur (inclut la tentative de lire l'erreur Formspree)
                    const data = await response.json();
                    const errorMessage = data.error 
                        ? `❌ Erreur : ${data.error}` 
                        : "❌ Une erreur s'est produite lors de l'envoi. Veuillez réessayer ou utiliser l'e-mail.";
                    
                    formStatus.textContent = errorMessage;
                    formStatus.style.color = 'red';
                }

            } catch (error) {
                // Erreur de réseau (e.g., hors ligne)
                formStatus.style.color = 'red';
                formStatus.textContent = "❌ Une erreur de connexion s'est produite. Veuillez vérifier votre réseau.";
            } finally {
                // Réactiver le bouton
                submitButton.disabled = false;
                submitButton.textContent = 'Envoyer';

                // Nettoyer le message après 10 secondes (bonne pratique UX)
                setTimeout(() => {
                    formStatus.textContent = '';
                }, 10000);
            }
        });
    }
});
