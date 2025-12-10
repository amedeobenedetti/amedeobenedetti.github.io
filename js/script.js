/**
 * Script JavaScript per Portfolio
 * Gestisce: Menu Mobile, Smooth Scroll, Validazione Form
 */

document.addEventListener('DOMContentLoaded', () => {
    
    // --- Gestione Menu Mobile ---
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    const navLinksItems = document.querySelectorAll('.nav-links li a');

    hamburger.addEventListener('click', () => {
        // Toggle classi active
        hamburger.classList.toggle('active');
        navLinks.classList.toggle('active');
        
        // Blocca lo scroll del body quando il menu è aperto
        document.body.style.overflow = navLinks.classList.contains('active') ? 'hidden' : 'auto';
    });

    // Chiudi il menu quando si clicca su un link
    navLinksItems.forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('active');
            navLinks.classList.remove('active');
            document.body.style.overflow = 'auto';
        });
    });

    // --- Smooth Scroll per link interni (fallback per browser vecchi) ---
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);

            if (targetElement) {
                // Calcola offset per l'header fisso
                const headerOffset = 70;
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: "smooth"
                });
            }
        });
    });

    // --- Gestione Form Contatti (Integrazione Formspree) ---
    const contactForm = document.getElementById('contactForm');

    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const btn = contactForm.querySelector('button');
            const originalText = btn.innerText;
            
            // Feedback visivo caricamento
            btn.innerText = 'Invio in corso...';
            btn.disabled = true;
            btn.style.opacity = '0.7';

            // Dati del form
            const formData = new FormData(contactForm);
            
            try {
                // Endpoint Formspree configurato
                // Esempio: https://formspree.io/f/xmqzbwpy
                const response = await fetch("https://formspree.io/f/mblnzrbr", {
                    method: "POST",
                    body: formData,
                    headers: {
                        'Accept': 'application/json'
                    }
                });

                if (response.ok) {
                    // Successo
                    btn.innerText = 'Messaggio Inviato!';
                    btn.style.backgroundColor = '#10b981'; // Verde successo
                    btn.style.opacity = '1';
                    contactForm.reset();
                } else {
                    // Errore dal servizio
                    const data = await response.json();
                    console.error('Errore Formspree:', data);
                    throw new Error('Errore nell\'invio');
                }
            } catch (error) {
                // Errore di rete o altro
                btn.innerText = 'Errore. Riprova.';
                btn.style.backgroundColor = '#ef4444'; // Rosso errore
                btn.style.opacity = '1';
                console.error('Errore invio form:', error);
            } finally {
                // Ripristina bottone dopo 4 secondi
                setTimeout(() => {
                    btn.innerText = originalText;
                    btn.style.backgroundColor = '';
                    btn.disabled = false;
                }, 4000);
            }
        });
    }

    // --- Animazione Navbar allo scroll ---
    const header = document.querySelector('.header');
    let lastScroll = 0;

    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;

        // Aggiungi ombra se scrollato
        if (currentScroll > 50) {
            header.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
        } else {
            header.style.boxShadow = 'none';
        }
        
        lastScroll = currentScroll;
    });
});