/**
 * Amedeo Benedetti — Portfolio
 * Tema chiaro/scuro, menu mobile, link attivo, parola rotante,
 * copia email e invio del form (Formspree) con validazione inline.
 */

document.addEventListener('DOMContentLoaded', () => {
    const root = document.documentElement;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

    // ========================================
    // TEMA CHIARO / SCURO
    // ========================================
    const systemDark = window.matchMedia('(prefers-color-scheme: dark)');
    const currentTheme = () => root.getAttribute('data-theme') || (systemDark.matches ? 'dark' : 'light');

    document.getElementById('theme-toggle')?.addEventListener('click', () => {
        const next = currentTheme() === 'dark' ? 'light' : 'dark';
        root.setAttribute('data-theme', next);
        try { localStorage.setItem('theme', next); } catch (e) {}
    });

    // ========================================
    // MENU MOBILE
    // ========================================
    const hamburger = document.getElementById('hamburger');
    const navbar = document.getElementById('navbar');

    const setMenu = (open) => {
        navbar.classList.toggle('open', open);
        hamburger.setAttribute('aria-expanded', String(open));
        hamburger.setAttribute('aria-label', open ? 'Chiudi il menu' : 'Apri il menu');
    };

    hamburger.addEventListener('click', () => setMenu(!navbar.classList.contains('open')));
    navbar.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => setMenu(false)));
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && navbar.classList.contains('open')) {
            setMenu(false);
            hamburger.focus();
        }
    });
    document.addEventListener('pointerdown', (e) => {
        if (navbar.classList.contains('open') && !e.target.closest('.header')) setMenu(false);
    });

    // ========================================
    // BARRA: SEPARATORE SOLO QUANDO C'È CONTENUTO SOTTO
    // ========================================
    const header = document.getElementById('header');
    const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 4);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    // ========================================
    // LINK ATTIVO
    // ========================================
    const navLinks = [...document.querySelectorAll('.nav-links a:not(.btn)')];
    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                const id = '#' + entry.target.id;
                navLinks.forEach((a) => {
                    const active = a.getAttribute('href') === id;
                    a.classList.toggle('active', active);
                    if (active) a.setAttribute('aria-current', 'true');
                    else a.removeAttribute('aria-current');
                });
            });
        }, { rootMargin: '-45% 0px -50% 0px' });
        document.querySelectorAll('main section[id]').forEach((s) => observer.observe(s));
    }

    // ========================================
    // PAROLA ROTANTE NELL'HERO
    // Dissolvenza breve con un piccolo spostamento verticale; solo dissolvenza
    // se l'utente preferisce meno movimento.
    // ========================================
    const rotator = document.getElementById('rotator');
    const words = ['performanti.', 'scalabili.', 'innovative.', 'intelligenti.'];
    let wordIndex = 0;

    const swapWord = async () => {
        if (!rotator || document.hidden || typeof rotator.animate !== 'function') return;
        const shift = reduceMotion.matches ? '0' : '0.2em';
        const next = words[(wordIndex + 1) % words.length];

        await rotator.animate(
            [{ opacity: 1, transform: 'translateY(0)' }, { opacity: 0, transform: `translateY(-${shift})` }],
            { duration: 220, easing: 'cubic-bezier(0.5, 0, 0.75, 0)', fill: 'forwards' }
        ).finished;
        rotator.textContent = next;
        await rotator.animate(
            [{ opacity: 0, transform: `translateY(${shift})` }, { opacity: 1, transform: 'translateY(0)' }],
            { duration: 500, easing: 'cubic-bezier(0.25, 1, 0.5, 1)', fill: 'forwards' }
        ).finished;
        wordIndex = (wordIndex + 1) % words.length;
    };

    if (rotator) setInterval(swapWord, 3000);

    // ========================================
    // COPIA EMAIL
    // ========================================
    const copyBtn = document.getElementById('copy-email');
    const emailLink = document.getElementById('email-address');

    copyBtn?.addEventListener('click', async () => {
        try {
            await navigator.clipboard.writeText(emailLink.textContent.trim());
            copyBtn.classList.add('copied');
            copyBtn.textContent = 'Copiata';
            setTimeout(() => {
                copyBtn.classList.remove('copied');
                copyBtn.textContent = 'Copia';
            }, 2000);
        } catch (err) {
            // Se la copia non è permessa, seleziona il testo per copiarlo a mano
            const range = document.createRange();
            range.selectNodeContents(emailLink);
            const sel = window.getSelection();
            sel.removeAllRanges();
            sel.addRange(range);
        }
    });

    // ========================================
    // FORM DI CONTATTO (Formspree)
    // ========================================
    const contactForm = document.getElementById('contactForm');
    if (!contactForm) return;

    const submitBtn = document.getElementById('submit-btn');
    const btnLabel = submitBtn.querySelector('.btn-label');
    const statusEl = document.getElementById('form-status');
    const fields = ['name', 'email', 'message'].map((id) => document.getElementById(id));

    const errorFor = (field) => {
        const value = field.value.trim();
        if (field.id === 'name' && !value) return 'Inserisci il tuo nome.';
        if (field.id === 'email' && !value) return 'Inserisci la tua email.';
        if (field.id === 'email' && !field.checkValidity()) return 'Controlla l\'email: deve essere nel formato nome@dominio.it.';
        if (field.id === 'message' && !value) return 'Scrivi qualche riga sul tuo progetto.';
        return '';
    };

    const validateField = (field) => {
        const msg = errorFor(field);
        const errorEl = document.getElementById(`${field.id}-error`);
        field.closest('.form-group').classList.toggle('invalid', Boolean(msg));
        field.setAttribute('aria-invalid', msg ? 'true' : 'false');
        if (msg) field.setAttribute('aria-describedby', errorEl.id);
        else field.removeAttribute('aria-describedby');
        errorEl.textContent = msg;
        return !msg;
    };

    fields.forEach((field) => {
        // Validazione inline: quando si lascia un campo compilato, poi in tempo reale finché c'è un errore
        field.addEventListener('blur', () => { if (field.value.trim()) validateField(field); });
        field.addEventListener('input', () => {
            if (field.closest('.form-group').classList.contains('invalid')) validateField(field);
        });
    });

    const setButton = (state) => {
        submitBtn.classList.remove('is-loading', 'is-success', 'is-error');
        submitBtn.disabled = state === 'loading';
        const labels = {
            loading: 'Invio in corso...',
            success: 'Messaggio Inviato',
            error: 'Errore. Riprova.',
            idle: 'Invia Messaggio'
        };
        if (state !== 'idle') submitBtn.classList.add(`is-${state}`);
        btnLabel.textContent = labels[state];
    };

    const setStatus = (text, kind = '') => {
        statusEl.textContent = text;
        statusEl.className = 'form-status' + (kind ? ' ' + kind : '');
    };

    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const results = fields.map(validateField);
        if (results.includes(false)) {
            fields[results.indexOf(false)].focus();
            return;
        }

        setButton('loading');
        setStatus('');

        try {
            const response = await fetch('https://formspree.io/f/mblnzrbr', {
                method: 'POST',
                body: new FormData(contactForm),
                headers: { Accept: 'application/json' }
            });
            if (!response.ok) throw new Error('Errore invio');

            setButton('success');
            setStatus('Grazie! Ti risponderò il prima possibile.', 'ok');
            contactForm.reset();
        } catch (error) {
            setButton('error');
            setStatus('Invio non riuscito. Controlla la connessione e riprova, oppure scrivimi direttamente via email.', 'err');
        }
        setTimeout(() => setButton('idle'), 4000);
    });
});
