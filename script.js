/* Fichier: script.js */

document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. Gestion du Défilement Fluide (Smooth Scrolling) ---
    // (Inchangé, mais une bonne pratique)
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            if (targetId.length > 1 && document.querySelector(targetId)) { 
                document.querySelector(targetId).scrollIntoView({
                    behavior: 'smooth'
                });
            }
            
            // Fermer le menu si on clique sur un lien sur mobile
            const nav = document.querySelector('nav');
            if (nav.classList.contains('open')) {
                nav.classList.remove('open');
                document.querySelector('.menu-toggle i').classList.remove('fa-xmark');
                document.querySelector('.menu-toggle i').classList.add('fa-bars');
            }
        });
    });

    // --- 2. Gestion du Menu Hamburger (Responsive) ---
    const menuToggle = document.querySelector('.menu-toggle');
    const nav = document.querySelector('nav');
    
    if (menuToggle && nav) {
        menuToggle.addEventListener('click', () => {
            nav.classList.toggle('open');
            // Changement d'icône (bars <-> close)
            const icon = menuToggle.querySelector('i');
            if (nav.classList.contains('open')) {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-xmark'); // Icône de fermeture
            } else {
                icon.classList.remove('fa-xmark');
                icon.classList.add('fa-bars');
            }
        });
    }

    // --- 3. Gestionnaire de Formulaire de Contact (AJAX Asynchrone) ---
    const contactForm = document.querySelector('.contact-form');
    const formStatus = document.getElementById('form-status');

    if (contactForm && formStatus) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault(); // Empêche le rechargement standard

            const submitButton = contactForm.querySelector('button[type="submit"]');
            
            // État de chargement
            submitButton.disabled = true;
            submitButton.textContent = 'Envoi en cours...';
            formStatus.textContent = ''; // Vider le statut précédent
            formStatus.style.color = 'var(--text-color)';
            
            try {
                const formData = new FormData(contactForm);
                // Utilisation de Fetch pour l'envoi AJAX (Formspree)
                const response = await fetch(contactForm.action, {
                    method: contactForm.method,
                    body: formData,
                    headers: {
                        'Accept': 'application/json'
                    }
                });

                if (response.ok) {
                    formStatus.style.color = 'green';
                    formStatus.textContent = "✅ Message envoyé ! Merci pour votre intérêt, je vous recontacterai rapidement à l'adresse fournie.";
                    contactForm.reset();
                } else {
                    // Tenter de lire l'erreur de Formspree si possible
                    const data = await response.json();
                    if (data.error) {
                         formStatus.textContent = `❌ Erreur : ${data.error}`;
                    } else {
                         formStatus.textContent = "❌ Une erreur s'est produite lors de l'envoi. Veuillez réessayer ou utiliser l'e-mail.";
                    }
                    formStatus.style.color = 'red';
                }

            } catch (error) {
                formStatus.style.color = 'red';
                formStatus.textContent = "❌ Une erreur de connexion s'est produite. Veuillez vérifier votre réseau.";
            } finally {
                // Réactiver le bouton
                submitButton.disabled = false;
                submitButton.textContent = 'Envoyer';
            }
        });
    }

    // --- 4. Animation : Apparition du Hero ---
    const heroContent = document.querySelector('.hero-content');
    if (heroContent) {
        // Le CSS gère l'animation, on s'assure juste que les styles initiaux sont appliqués si non présents
        // L'effet est déjà géré par le CSS et le JS d'origine, on garde la structure
        heroContent.style.opacity = 0; 
        heroContent.style.transition = 'opacity 1s ease-out, transform 1s ease-out';
        heroContent.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            heroContent.style.opacity = 1;
            heroContent.style.transform = 'translateY(0)';
        }, 300); 
    }
});
