document.addEventListener('click', function (event) {
    const trigger = event.target.closest('[data-kopiuj-trigger]');
    if (!trigger) return;

    const container = trigger.closest('.kopia-kontener');
    if (!container) {
        console.error('Nie znaleziono elementu nadrzędnego .kopia-kontener');
        return;
    }

    const targetSelector = trigger.getAttribute('data-kopiuj-cel');
    const copyType = trigger.getAttribute('data-kopiuj-typ') || 'outer';

    let targetElement = container;

    if (targetSelector) {
        targetElement = container.querySelector(targetSelector);
    }

    if (!targetElement) return;

    // 1. KLONOWANIE: Tworzenie kopii elementu w pamięci (bez naruszania widoku strony)
    const clone = targetElement.cloneNode(true);

    // 2. CZYSZCZENIE KLONU GŁÓWNEGO: 
    // Usunięcie atrybutów technicznych z samego głównego elementu
    clone.removeAttribute('data-kopiuj-trigger');
    clone.removeAttribute('data-kopiuj-cel');
    clone.removeAttribute('data-kopiuj-typ');
    clone.classList.remove('kopia-kontener');

    // Jeśli po usunięciu klasy atrybut class został pusty, usuwamy go całkowicie
    if (clone.getAttribute('class') === '') {
        clone.removeAttribute('class');
    }

    // 3. CZYSZCZENIE DZIECI KLONU:
    // Całkowite usuwanie elementów, które nie powinny trafić do docelowego kodu 
    // (np. przycisk kopiowania, jeśli znajdował się wewnątrz kopiowanego obszaru)
    const elementsToRemove = clone.querySelectorAll('.usun-przy-kopiowaniu, .btn-kopiuj');
    elementsToRemove.forEach(el => el.remove());

    // Usunięcie atrybutów technicznych z elementów zagnieżdżonych (jeśli jakieś je posiadają)
    const innerTriggers = clone.querySelectorAll('[data-kopiuj-trigger]');
    innerTriggers.forEach(el => {
        el.removeAttribute('data-kopiuj-trigger');
        el.removeAttribute('data-kopiuj-cel');
        el.removeAttribute('data-kopiuj-typ');
    });

    // 4. POBRANIE CZYSTEGO HTML
    let textToCopy = copyType === 'inner' ? clone.innerHTML : clone.outerHTML;
    textToCopy = textToCopy.trim();
    textToCopy = textToCopy.replace(/&lt;/g, '<').replace(/&gt;/g, '>');
    // 5. ZAPIS DO SCHOWKA
    navigator.clipboard.writeText(textToCopy).then(() => {
        trigger.classList.add('skopiowano');
        setTimeout(() => trigger.classList.remove('skopiowano'), 1000);
        console.log('Skopiowano czysty kod do schowka!');
    }).catch(err => {
        console.error('Błąd podczas kopiowania do schowka: ', err);
    });
});