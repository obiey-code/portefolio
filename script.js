document.addEventListener('DOMContentLoaded', () => {
    
    // Fonction pour le Défilement Fluide (Smooth Scrolling)
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            // Empêche le comportement de saut par défaut
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            // S'assure que l'ID n'est pas juste '#'
            if (targetId.length > 1 && document.querySelector(targetId)) { 
                document.querySelector(targetId).scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });

    // Gestionnaire de Formulaire de Contact (Exemple simple)
    const contactForm = document.querySelector('.contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            // Empêche l'envoi standard du formulaire
            e.preventDefault(); 
            
            // NOTE : C'est ici que vous intégrerez l'API ou le service d'envoi (Formspree, Netlify Forms, etc.)
            
            alert("Merci OBIEY Christ Dany pour votre message ! Je vous recontacterai rapidement à l'adresse fournie.");
            contactForm.reset();
        });
    }

    // Exemple d'animation : Ajout d'une classe pour l'apparition du Hero
    const heroContent = document.querySelector('.hero-content');
    if (heroContent) {
        // Ajoute une classe pour animer l'apparition après le chargement de la page
        heroContent.style.opacity = 0; // Ajout initial en JS pour être sûr
        heroContent.style.transition = 'opacity 1s ease-out, transform 1s ease-out';
        heroContent.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            heroContent.style.opacity = 1;
            heroContent.style.transform = 'translateY(0)';
        }, 300); 
    }
});
