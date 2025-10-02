document.addEventListener('DOMContentLoaded', () => {
    
    // ==========================================
    // 1. Défilement Fluide (Smooth Scrolling)
    // ==========================================
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            // Vérifie si l'ID est valide et si l'élément existe
            if (targetId.length > 1 && document.querySelector(targetId)) { 
                document.querySelector(targetId).scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });

    // ==========================================
    // 2. Gestion du Formulaire de Contact (Formspree)
    // ==========================================
    const contactForm = document.getElementById('contactForm');
    const statusMessage = document.getElementById('formStatusMessage');
    const submitButton = document.getElementById('submitButton');

    if (contactForm && statusMessage && submitButton) {
        // Récupération de l'URL Formspree depuis l'attribut 'action'
        const formUrl = contactForm.action;
        
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault(); 
            
            // Affichage du statut "En cours d'envoi"
            statusMessage.style.display = 'block';
            statusMessage.textContent = 'Envoi en cours... 📨';
            statusMessage.style.color = '#007bff'; // Couleur pour le statut
            submitButton.disabled = true; // Désactive le bouton pendant l'envoi
            submitButton.textContent = 'Envoi...';

            // Construction des données à envoyer
            const formData = new FormData(contactForm);
            
            try {
                // Envoi des données via Fetch API
                const response = await fetch(formUrl, {
                    method: 'POST',
                    body: formData,
                    headers: {
                        'Accept': 'application/json' // Formspree recommande cet en-tête
                    }
                });

                if (response.ok) {
                    // Succès de l'envoi
                    statusMessage.textContent = 'Message envoyé avec succès ! Merci de m\'avoir contacté. ✅';
                    statusMessage.style.color = '#28a745'; // Vert pour le succès
                    contactForm.reset();
                } else {
                    // Échec de l'envoi
                    const data = await response.json();
                    let errorMessage = data.error || 'Erreur lors de l\'envoi du message. ❌';
                    statusMessage.textContent = errorMessage + ' Veuillez réessayer ou utiliser l\'email direct.';
                    statusMessage.style.color = '#dc3545'; // Rouge pour l'erreur
                }
            } catch (error) {
                // Erreur de connexion/réseau
                statusMessage.textContent = 'Erreur réseau : Impossible de contacter le serveur. ❌';
                statusMessage.style.color = '#dc3545';
                console.error('Erreur Formspree/Fetch:', error);
            } finally {
                // Rétablit l'état du bouton après l'envoi
                submitButton.disabled = false;
                submitButton.textContent = 'Envoyer';
                // Masque le message de statut après 5 secondes
                setTimeout(() => {
                    statusMessage.style.display = 'none';
                    statusMessage.textContent = '';
                }, 5000); 
            }
        });
    }

    // ==========================================
    // 3. Animation d'Apparition du Hero
    // ==========================================
    const heroContent = document.querySelector('.hero-content');
    if (heroContent) {
        // Ajout initial en JS pour être sûr, si ce n'est pas déjà dans styles.css
        heroContent.style.opacity = 0; 
        heroContent.style.transition = 'opacity 1s ease-out, transform 1s ease-out';
        heroContent.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            heroContent.style.opacity = 1;
            heroContent.style.transform = 'translateY(0)';
        }, 300); 
    }
});
