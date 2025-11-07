// =================================
// SCRIPT 1: NAVEGAÇÃO POR ABAS (TABS)
// =================================
(function() {
    const tabButtons = document.querySelectorAll('.tab-button');
    if (!tabButtons.length) return; // Sai se não estiver na pág. de produtos

    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetTabId = button.dataset.tab; 
            
            tabButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            tabContents.forEach(content => content.classList.remove('active'));
            document.getElementById(targetTabId).classList.add('active');
        });
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
})();
