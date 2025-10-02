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

 // ==========================================
    // 2. Gestion du Formulaire de Contact (Formspree avec Fetch API)
    // Permet l'envoi des données sans recharger la page et affiche un statut.
    // ==========================================
    const contactForm = document.getElementById('contactForm'); // Assurez-vous d'avoir l'ID 'contactForm' dans votre HTML
    const statusMessage = document.getElementById('formStatusMessage'); // Assurez-vous d'avoir l'ID 'formStatusMessage' dans votre HTML
    const submitButton = document.getElementById('submitButton'); // Assurez-vous d'avoir l'ID 'submitButton' dans votre HTML

    if (contactForm && statusMessage && submitButton) {
        // Récupération de l'URL Formspree depuis l'attribut 'action'
        const formUrl = contactForm.action;
        
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault(); 
            
            // --- Préparation et affichage du statut "En cours d'envoi" ---
            statusMessage.style.display = 'block';
            statusMessage.textContent = 'Envoi en cours... 📨';
            statusMessage.style.color = '#007bff'; // Bleu
            submitButton.disabled = true; // Désactive le bouton pendant l'envoi
            submitButton.textContent = 'Envoi...';

            const formData = new FormData(contactForm);
            
            try {
                // Envoi des données via Fetch API
                const response = await fetch(formUrl, {
                    method: 'POST',
                    body: formData,
                    headers: {
                        'Accept': 'application/json' // Requis par Formspree pour une réponse JSON
                    }
                });

                if (response.ok) {
                    // Succès de l'envoi
                    statusMessage.textContent = 'Message envoyé avec succès ! Je vous recontacterai rapidement. ✅';
                    statusMessage.style.color = '#28a745'; // Vert
                    contactForm.reset(); // Vide les champs du formulaire
                } else {
                    // Échec de l'envoi (ex: validation Formspree, erreur serveur)
                    const data = await response.json();
                    let errorMessage = data.error || 'Erreur lors de l\'envoi du message. ❌';
                    statusMessage.textContent = 'Erreur : ' + errorMessage;
                    statusMessage.style.color = '#dc3545'; // Rouge
                }
            } catch (error) {
                // Erreur de connexion/réseau (ex: l'utilisateur est hors ligne)
                statusMessage.textContent = 'Erreur réseau. Veuillez vérifier votre connexion ou m\'envoyer un email directement. ❌';
                statusMessage.style.color = '#dc3545';
                console.error('Erreur Formspree/Fetch:', error);
            } finally {
                // --- Rétablit l'état du formulaire ---
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



