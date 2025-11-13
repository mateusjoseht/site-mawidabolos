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
// SCRIPT 4: CONFIGURADOR DE BOLO (FESTA) -> WhatsApp
// =================================
(function() {
    const form = document.getElementById('festa-configurator');
    if (!form) return; // Apenas na página de produtos quando o form existir

    const totalEl = document.getElementById('festa-total');
    const phone = '558130717968';

    function parseNumber(v) {
        const n = Number(String(v).replace(',', '.'));
        return Number.isFinite(n) ? n : 0;
    }

    function computeTotal() {
        const coberturaEl = form.querySelector('input[name="cobertura"]:checked');
        const sizeEl = form.querySelector('input[name="tamanho"]:checked');
        const extrasEls = Array.from(form.querySelectorAll('input[name="extras"]:checked'));

        const pricePerKg = coberturaEl ? parseNumber(coberturaEl.dataset.pricePerKg) : 0;
        const weight = sizeEl ? parseNumber(sizeEl.dataset.weight) : 1;

        let total = pricePerKg * weight;

        extrasEls.forEach(el => {
            total += parseNumber(el.dataset.price || 0);
        });

        return total;
    }

    function formatBRL(v) {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);
    }

    function updateTotalUI() {
        if (!totalEl) return;
        const total = computeTotal();
        totalEl.textContent = `Valor total: ${formatBRL(total)}`;
    }

    // Update total on any change inside the form
    form.addEventListener('change', updateTotalUI);
    // Initialize
    updateTotalUI();

    form.addEventListener('submit', function(e) {
        e.preventDefault();

        const cobertura = form.querySelector('input[name="cobertura"]:checked')?.value || '';
        const massa = form.querySelector('input[name="massa"]:checked')?.value || '';
        const recheio = form.querySelector('input[name="recheio"]:checked')?.value || '';
        const tamanho = form.querySelector('input[name="tamanho"]:checked')?.value || '';
        const extrasEls = Array.from(form.querySelectorAll('input[name="extras"]:checked'));
        const extras = extrasEls.map(el => el.value);
        const extrasText = extras.length ? extras.join(', ') : 'Nenhum';

        const total = computeTotal();
        const totalText = formatBRL(total);

        const message = `Olá! Gostaria de encomendar um bolo de festa.%0ACobertura: ${cobertura}%0AMassa: ${massa}%0ARecheio: ${recheio}%0ATamanho: ${tamanho}%0AExtras: ${extrasText}%0ATotal aproximado: ${totalText}`;

        const url = `https://api.whatsapp.com/send?phone=${phone}&text=${message}`;
        window.open(url, '_blank');
    });
})();

// =================================
// SCRIPT 5: FESTA WIZARD (STEP-BY-STEP)
// =================================
(function() {
    const overlay = document.getElementById('festa-wizard-overlay');
    if (!overlay) return; // não existe na página

    const wizard = overlay.querySelector('.festa-wizard');
    const startBtn = document.getElementById('start-festa-wizard');
    const closeBtn = document.getElementById('wizard-close');
    const nextBtn = document.getElementById('wizard-next');
    const backBtn = document.getElementById('wizard-back');
    const stepNumber = document.getElementById('wizard-step-number');
    const progressBar = document.getElementById('wizard-progress-bar');

    const steps = Array.from(overlay.querySelectorAll('.wizard-step'));
    let current = 0;
    const state = {
        tamanho: null,
        massa: null,
        recheio: null,
        cobertura: null,
        coberturaPricePerKg: 0,
        extras: []
    };

    function openWizard() {
        overlay.classList.add('open');
        overlay.setAttribute('aria-hidden', 'false');
        document.body.classList.add('nav-open');
        showStep(0);
    }

    function closeWizard() {
        overlay.classList.remove('open');
        overlay.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('nav-open');
    }

    function showStep(i) {
        current = i;
        steps.forEach((s, idx) => s.classList.toggle('active', idx === i));
        stepNumber.textContent = (i + 1);
        const pct = Math.round(((i) / (steps.length - 1)) * 100);
        progressBar.style.width = pct + '%';
        // change next/back text
        if (i === steps.length - 1) nextBtn.textContent = 'Enviar pedido';
        else nextBtn.textContent = 'Confirmar';
        backBtn.style.display = i === 0 ? 'none' : 'inline-block';
        updateSummaryIfNeeded();
    }

    function updateSummaryIfNeeded() {
        if (steps[current].dataset.step === '6') {
            const summaryEl = document.getElementById('wizard-summary');
            const totalEl = document.getElementById('wizard-total');
            if (!summaryEl || !totalEl) return;
            const extrasText = state.extras.length ? state.extras.map(e => e.value).join(', ') : 'Nenhum';
            const total = computeTotalWizard();
            summaryEl.innerHTML = `Tamanho: ${state.tamanho || '-'}<br>Massa: ${state.massa || '-'}<br>Recheio: ${state.recheio || '-'}<br>Cobertura: ${state.cobertura || '-'}<br>Extras: ${extrasText}`;
            totalEl.textContent = `Total aproximado: ${formatBRL(total)}`;
        }
    }

    function computeTotalWizard() {
        const weight = Number(state.tamanhoWeight || 1);
        const pricePerKg = Number(state.coberturaPricePerKg || 0);
        let total = pricePerKg * weight;
        state.extras.forEach(e => { total += Number(e.price || 0); });
        return total;
    }

    function formatBRL(v) { return new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(v); }

    // Remove currency/price fragments from a size label when composing messages
    function sanitizeSizeForMessage(sizeText) {
        if (!sizeText) return sizeText;
        // remove patterns like 'R$ 85,90' or 'R$85,90' and any extra whitespace
        const withoutCurrency = sizeText.replace(/R\$\s?\d+[\d\.]*[,\d]*/g, '').trim();
        // also remove duplicated spaces
        return withoutCurrency.replace(/\s{2,}/g, ' ').trim();
    }

    // Update the visible prices for size options using the currently selected cobertura price per kg
    function updateSizePrices() {
        // find selected coverage price
        let pricePerKg = Number(state.coberturaPricePerKg) || 0;
        if (!pricePerKg) {
            // fallback: take the first coverage option's data-price-per-kg
            const coverOpt = overlay.querySelector('.wizard-step[data-step="4"] .wizard-option[data-price-per-kg]');
            if (coverOpt) pricePerKg = Number(coverOpt.dataset.pricePerKg || 0);
        }

        const sizeEls = overlay.querySelectorAll('.wizard-step[data-step="1"] .wizard-option');
        sizeEls.forEach(el => {
            const weight = Number(el.dataset.weight || 1);
            const price = pricePerKg * weight;
            let span = el.querySelector('.size-price');
            if (!span) {
                span = document.createElement('span');
                span.className = 'size-price';
                span.style.display = 'block';
                span.style.marginTop = '6px';
                span.style.fontWeight = '700';
                span.style.color = 'var(--cor-primaria)';
                el.appendChild(span);
            }
            span.textContent = formatBRL(price);
        });
    }

    // Option selection handling: delegate clicks inside wizard
    overlay.addEventListener('click', (e) => {
        const option = e.target.closest('.wizard-option');
        if (!option || !wizard.contains(option)) return;
        e.preventDefault();
        e.stopPropagation();
        const parentStep = option.closest('.wizard-step');
        const stepIdx = Number(parentStep.dataset.step);

        // keep input state in sync if the option contains a native input
        const input = option.querySelector('input[type="checkbox"], input[type="radio"]');

        // identify which field
        if (stepIdx === 1) {
            // tamanho (single-select)
            overlay.querySelectorAll('.wizard-step[data-step="1"] .wizard-option').forEach(o => {
                o.classList.remove('selected');
                const inp = o.querySelector('input[type="radio"]'); if (inp) inp.checked = false;
            });
            option.classList.add('selected');
            if (input) input.checked = true;
            state.tamanho = option.dataset.value || option.textContent.trim();
            state.tamanhoWeight = option.dataset.weight || 1;
        } else if (stepIdx === 2) {
            overlay.querySelectorAll('.wizard-step[data-step="2"] .wizard-option').forEach(o => { o.classList.remove('selected'); const inp = o.querySelector('input[type="radio"]'); if (inp) inp.checked = false; });
            option.classList.add('selected');
            if (input) input.checked = true;
            state.massa = option.dataset.value || option.textContent.trim();
        } else if (stepIdx === 3) {
            overlay.querySelectorAll('.wizard-step[data-step="3"] .wizard-option').forEach(o => { o.classList.remove('selected'); const inp = o.querySelector('input[type="radio"]'); if (inp) inp.checked = false; });
            option.classList.add('selected');
            if (input) input.checked = true;
            state.recheio = option.dataset.value || option.textContent.trim();
        } else if (stepIdx === 4) {
            overlay.querySelectorAll('.wizard-step[data-step="4"] .wizard-option').forEach(o => { o.classList.remove('selected'); const inp = o.querySelector('input[type="radio"]'); if (inp) inp.checked = false; });
            option.classList.add('selected');
            if (input) input.checked = true;
            state.cobertura = option.dataset.value || option.textContent.trim();
            state.coberturaPricePerKg = option.dataset.pricePerKg || option.dataset.pricePerKg || 0;
            // when coverage changes update size prices
            updateSizePrices();
        } else if (stepIdx === 5) {
            // extras (multi-select) — toggle
            const wasSelected = option.classList.toggle('selected');
            // if there's a native checkbox inside, toggle it explicitly (prevents radio groups from stealing selection)
            if (input) {
                if (input.type === 'checkbox') input.checked = !!wasSelected;
                else if (input.type === 'radio') {
                    // if author mistakenly used radios, emulate checkbox behaviour
                    input.checked = !!wasSelected;
                }
            }
            const value = option.dataset.value || option.textContent.trim();
            const price = Number(option.dataset.price || 0);
            const idx = state.extras.findIndex(x => x.value === value);
            if (idx === -1 && wasSelected) state.extras.push({ value, price });
            else if (idx !== -1 && !wasSelected) state.extras.splice(idx,1);
        }
        updateSummaryIfNeeded();
    });

    // Controls
    startBtn.addEventListener('click', openWizard);
    closeBtn.addEventListener('click', closeWizard);
    overlay.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeWizard(); });

    backBtn.addEventListener('click', () => { if (current>0) showStep(current-1); });

    nextBtn.addEventListener('click', () => {
        if (current < steps.length - 1) {
            // validate selection for current step
            const curStep = steps[current];
            if (curStep.dataset.step !== '5') {
                const selected = curStep.querySelector('.wizard-option.selected');
                if (!selected) {
                    // brief feedback
                    selectedFlash(curStep);
                    return;
                }
            }
            showStep(current+1);
        } else {
            // final: send whatsapp using state
            const phone = '558130717968';
            const extrasText = state.extras.length ? state.extras.map(e=>e.value).join(', ') : 'Nenhum';
            const total = computeTotalWizard();
            const totalText = formatBRL(total);
            const sanitizedSize = sanitizeSizeForMessage(state.tamanho);
            const message = `Olá! Gostaria de encomendar um bolo de festa.%0ATamanho: ${sanitizedSize}%0AMassa: ${state.massa}%0ARecheio: ${state.recheio}%0ACobertura: ${state.cobertura}%0AExtras: ${extrasText}%0ATotal aproximado: ${totalText}`;
            window.open(`https://api.whatsapp.com/send?phone=${phone}&text=${message}`,'_blank');
            closeWizard();
        }
    });

    function selectedFlash(stepEl) {
        stepEl.animate([{ transform: 'translateY(0)' },{ transform: 'translateY(-6px)' },{ transform: 'translateY(0)'}],{ duration: 260 });
    }

    // Initialize
    // Make .wizard-option elements keyboard accessible and clickable via Enter/Space
    const optionEls = overlay.querySelectorAll('.wizard-option');
    optionEls.forEach(el => {
        // allow keyboard focus
        if (!el.hasAttribute('tabindex')) el.setAttribute('tabindex','0');
        // make it obvious via cursor
        el.style.cursor = 'pointer';
        // support keyboard activation
        el.addEventListener('keydown', (ev) => {
            if (ev.key === 'Enter' || ev.key === ' ') {
                ev.preventDefault();
                el.click();
            }
        });
    });

    // ensure click/tap on nested elements still toggles selection
    // (the overlay click handler already uses closest('.wizard-option'))

    showStep(0);
    // populate size prices on open/init
    updateSizePrices();
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
