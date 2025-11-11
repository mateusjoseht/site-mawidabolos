// =================================
// SCRIPT 1: NAVEGAÇÃO POR ABAS (TABS) + A11y
// =================================
(function() {
    const tablist = document.querySelector('.tab-navigation');
    if (!tablist) return; // Só na página de produtos

    const tabs = Array.from(tablist.querySelectorAll('.tab-button'));
    const panels = Array.from(document.querySelectorAll('.tab-content'));

    // Garantir atributos ARIA iniciais e estado
    tabs.forEach((tab, idx) => {
        tab.setAttribute('role', 'tab');
        const targetId = tab.getAttribute('aria-controls') || tab.dataset.tab;
        tab.dataset.tab = targetId;
        const isActive = tab.classList.contains('active');
        tab.setAttribute('aria-selected', String(isActive));
        if (!tab.id) tab.id = `tab-btn-${targetId}`;
    });

    panels.forEach(panel => {
        panel.setAttribute('role', 'tabpanel');
        const labelledBy = panel.getAttribute('aria-labelledby');
        if (!labelledBy) {
            const btn = tabs.find(t => (t.dataset.tab === panel.id));
            if (btn) panel.setAttribute('aria-labelledby', btn.id);
        }
        const isActive = panel.classList.contains('active');
        panel.toggleAttribute('hidden', !isActive);
        panel.setAttribute('tabindex', '0');
    });

    function activateTab(tab) {
        const targetId = tab.dataset.tab;
        if (!targetId) return;
        const targetPanel = document.getElementById(targetId);
        if (!targetPanel) return;

        tabs.forEach(t => {
            t.classList.toggle('active', t === tab);
            t.setAttribute('aria-selected', String(t === tab));
        });
        panels.forEach(p => {
            const isTarget = (p.id === targetId);
            p.classList.toggle('active', isTarget);
            p.toggleAttribute('hidden', !isTarget);
        });
    }

    // Delegação de eventos: clique
    tablist.addEventListener('click', (e) => {
        const btn = e.target.closest('.tab-button');
        if (!btn || !tablist.contains(btn)) return;
        activateTab(btn);
    });

    // Teclado (padrão WAI-ARIA): Setas Navegam, Home/End
    tablist.addEventListener('keydown', (e) => {
        const current = document.activeElement.closest('.tab-button');
        if (!current) return;
        const i = tabs.indexOf(current);
        if (i === -1) return;

        let nextIndex = i;
        if (e.key === 'ArrowRight') { nextIndex = (i + 1) % tabs.length; }
        else if (e.key === 'ArrowLeft') { nextIndex = (i - 1 + tabs.length) % tabs.length; }
        else if (e.key === 'Home') { nextIndex = 0; }
        else if (e.key === 'End') { nextIndex = tabs.length - 1; }
        else { return; }

        e.preventDefault();
        const next = tabs[nextIndex];
        next.focus();
        activateTab(next);
    });
})();

// =================================
// SCRIPT 2: BOTÕES DE ENCOMENDA (WHATSAPP)
// =================================
(function() {
    const phone = '558130717968'; 
    const orderButtons = document.querySelectorAll('.order-button');
    if (!orderButtons.length) return; // Sai se não estiver na pág. de produtos

    orderButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            // para <a> não navegar e para <button> não submeter dentro de forms futuros
            e.preventDefault(); 
            const card = e.currentTarget.closest('.product-card');
            if (!card) return;

            let productTitle = 'um produto'; 

            const selectEl = card.querySelector('.product-options');
            if (selectEl) {
                productTitle = selectEl.value;
            } else {
                const titleEl = card.querySelector('h4');
                if (titleEl) {
                    productTitle = titleEl.textContent.trim();
                }
            }

            const msg = `Olá! Tenho interesse em encomendar: ${productTitle}`;
            const url = `https://api.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(msg)}`;
            window.open(url, '_blank');
        });
    });
})();

// =================================
// SCRIPT 3: MENU HAMBURGUER (MOBILE)
// =================================
(function() {
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');
    if (!navToggle || !navMenu) return;

    navToggle.addEventListener('click', (e) => {
        const isOpen = navMenu.classList.contains('open');
        navMenu.classList.toggle('open');
        navToggle.setAttribute('aria-expanded', String(!isOpen));
        document.body.classList.toggle('nav-open', !isOpen);
    });

    // Fecha o menu ao clicar num link
    navMenu.querySelectorAll('a').forEach(a => {
        a.addEventListener('click', () => {
            if (navMenu.classList.contains('open')) {
                navMenu.classList.remove('open');
                navToggle.setAttribute('aria-expanded', 'false');
                document.body.classList.remove('nav-open');
            }
        });
    });

    // Fecha o menu ao clicar fora
    document.addEventListener('click', (e) => {
        if (!navMenu.contains(e.target) && !navToggle.contains(e.target) && navMenu.classList.contains('open')) {
            navMenu.classList.remove('open');
            navToggle.setAttribute('aria-expanded', 'false');
            document.body.classList.remove('nav-open');
        }
    });

    // Fecha o menu com tecla Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && navMenu.classList.contains('open')) {
            navMenu.classList.remove('open');
            navToggle.setAttribute('aria-expanded', 'false');
            document.body.classList.remove('nav-open');
            navToggle.focus();
        }
    });
})();
