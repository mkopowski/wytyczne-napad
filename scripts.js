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

    // 5. ZAPIS DO SCHOWKA
    navigator.clipboard.writeText(textToCopy).then(() => {
        trigger.classList.add('skopiowano');
        setTimeout(() => trigger.classList.remove('skopiowano'), 1000);
        console.log('Skopiowano czysty kod do schowka!');
    }).catch(err => {
        console.error('Błąd podczas kopiowania do schowka: ', err);
    });
});


// Nasłuchiwanie na załadowanie dokumentu
document.addEventListener('DOMContentLoaded', function () {
    const btnDodajPytanie = document.getElementById('btn-dodaj-pytanie');
    const btnGeneruj = document.getElementById('btn-generuj-faq');
    const kontenerPol = document.getElementById('faq-pola-kontener');
    const kontenerWyniku = document.getElementById('faq-wynik-kontener');
    const poleWyniku = document.getElementById('faq-wygenerowany-kod');
    const btnKopiuj = document.getElementById('btn-kopiuj-faq');

    // Funkcja generująca pojedynczy wiersz formularza (Pytanie + Odpowiedź)
    function stworzWierszPytania(numer) {
        const div = document.createElement('div');
        // Usunięto z głównego diva klasy "row" i "align-items-center"
        // Dzięki temu nagłówek i pola tekstowe układają się w naturalnym pionowym bloku
        div.className = 'wiersz-faq mb-3 p-3 bg-white border rounded';

        div.innerHTML = `
            <div class="font-weight-bold text-secondary mb-2">
                Pytanie <span class="numer-pytania">${numer}</span>
            </div>
            <div class="row align-items-start">
                <div class="col-md-5 mb-2 mb-md-0">
                    <input type="text" class="form-control pole-pytanie py-3" placeholder="Treść pytania...">
                </div>
                <div class="col-md-6 mb-2 mb-md-0">
                    <textarea class="form-control pole-odpowiedz" placeholder="Treść odpowiedzi..." rows="2"></textarea>
                </div>
                <div class="col-md-1">
                    <button class="btn btn-danger btn-block btn-usun-pytanie" title="Usuń pytanie">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </div>
        `;

        // Obsługa usuwania danego pytania
        div.querySelector('.btn-usun-pytanie').addEventListener('click', function () {
            div.remove();
            przenumerujPytania();
        });

        return div;
    }

    // Funkcja aktualizująca numerację po usunięciu wiersza
    function przenumerujPytania() {
        const wiersze = kontenerPol.querySelectorAll('.wiersz-faq');
        wiersze.forEach((wiersz, index) => {
            wiersz.querySelector('.numer-pytania').innerText = index + 1;
        });
    }

    // Zdarzenie: Dodanie nowego pustego pytania
    if (btnDodajPytanie) {
        btnDodajPytanie.addEventListener('click', function () {
            const aktualnaLiczba = kontenerPol.querySelectorAll('.wiersz-faq').length;
            kontenerPol.appendChild(stworzWierszPytania(aktualnaLiczba + 1));
        });
    }

    // Zdarzenie: Generowanie kodu
    if (btnGeneruj) {
        btnGeneruj.addEventListener('click', function () {
            const wiersze = kontenerPol.querySelectorAll('.wiersz-faq');
            const liczbaPytan = wiersze.length;

            if (liczbaPytan === 0) {
                alert('Dodaj przynajmniej jedno pytanie.');
                return;
            }

            let pytaniaHtml = '';

            // Pętla generująca wewnętrzny kod dla poszczególnych pytań
            wiersze.forEach((wiersz, index) => {
                const numer = index + 1;
                const pytanieText = wiersz.querySelector('.pole-pytanie').value.trim();
                const odpowiedzText = wiersz.querySelector('.pole-odpowiedz').value.trim();

                pytaniaHtml += `
                <div class="card border m-0 px-0 py-1" itemscope itemprop="mainEntity" itemtype="https://schema.org/Question">
                    <div class="card-header bg-white px-2 py-1" id="heading-${numer}">
                        <button class="btn btn-md btn-link btn-block text-left text-dark p-0 d-flex justify-content-between align-items-center collapsed shadow-none" type="button" data-toggle="collapse" data-target="#collapse-${numer}" aria-expanded="false" aria-controls="collapse-${numer}">
                            <i class="fa-regular fa-circle-question d-none d-md-inline-block mr-2"> </i>
                            <span itemprop="name">
                                ${pytanieText}
                            </span>
                            <span class="text-secondary ml-auto d-flex align-items-center"><i class="fa fa-chevron-down faq-toggle-icon"></i></span>
                        </button>
                    </div>
                    <div id="collapse-${numer}" class="collapse" aria-labelledby="heading-${numer}" data-parent="#productFaqAccordion" itemscope itemprop="acceptedAnswer" itemtype="https://schema.org/Answer">
                        <div class="card-body text-dark" itemprop="text">
                            <p class="my-0">
                                ${odpowiedzText}
                            </p>
                        </div>
                    </div>
                </div>
                \n`;
            });

            let finalnyHtml = '';

            // Wybór szablonu na podstawie ilości pytań
            if (liczbaPytan <= 4) {
                finalnyHtml = `
<header class="mb-3">
    <h2 id="faq-title" class="h6">Odpowiedzi na najczęściej zadawane pytania dotyczące tego produktu.</h2>
</header>

<div id="productFaqAccordion" aria-labelledby="faq-title" itemscope itemtype="https://schema.org/FAQPage">
    <section class="product-faq px-0">
        <div class="row col-12 mx-auto my-0 p-0">
            <div class="accordion col-sm-12 m-0 p-0">
${pytaniaHtml.trimEnd()}
            </div>
        </div>
    </section>
</div>`;
            } else {
                // Szablon dla 5 i więcej pytań
                finalnyHtml = `
<header class="mb-3">
    <h2 id="faq-title" class="h6">Odpowiedzi na najczęściej zadawane pytania dotyczące tego produktu.</h2>
</header>

<div class="accordion-item" id="productFaqAccordion" aria-labelledby="faq-title" itemscope itemtype="https://schema.org/FAQPage">
    <div class="accordion-content text-short with-cover">
        <section class="product-faq px-0 pb-5">
            <div class="row col-12 mx-auto my-0 p-0">
                <div class="accordion col-sm-12 m-0 p-0">
${pytaniaHtml.trimEnd()}
                </div>
            </div>
        </section>
    </div>
    
    <div class="accordion-toggle-btn-container mt-0">
        <button type="button" class="accordion-toggle btn btn-primary js-text-dropdown-btn" data-open="Pokaż mniej" data-close="Pokaż więcej">
            <span class="text">Pokaż więcej</span>
            <svg class="arrow" width="20" height="20" viewBox="0 0 24 24">
                <path d="M6 9l6 6 6-6" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
            </svg>
        </button>
    </div>
</div>`;
            }

            // Osadzenie kodu w polu tekstowym i pokazanie sekcji
            poleWyniku.value = finalnyHtml.trim();
            kontenerWyniku.classList.remove('d-none');
        });
    }

    // Zdarzenie: Kopiowanie wygenerowanego kodu do schowka
    if (btnKopiuj) {
        btnKopiuj.addEventListener('click', function () {
            poleWyniku.select();
            navigator.clipboard.writeText(poleWyniku.value).then(() => {
                const oryginalnyTekst = btnKopiuj.innerHTML;
                btnKopiuj.innerHTML = '<i class="fas fa-check"></i> Skopiowano!';
                btnKopiuj.classList.replace('btn-dark', 'btn-success');

                setTimeout(() => {
                    btnKopiuj.innerHTML = oryginalnyTekst;
                    btnKopiuj.classList.replace('btn-success', 'btn-dark');
                }, 1500);
            });
        });
    }

    // Dodanie jednego pustego pytania na start
    if (btnDodajPytanie) {
        btnDodajPytanie.click();
    }
});
///////////////////////////////////////////////////////////////////////////////
////////////////////////// AKTUALIZACJA SPECYFIKACJI //////////////////////////
///////////////////////////////////////////////////////////////////////////////

document.getElementById('convertBtn').addEventListener('click', function () {
    const input = document.getElementById('input').value;
    if (!input.trim()) {
        alert('Wklej najpierw HTML tabeli.');
        return;
    }


    const temp = document.createElement('div');
    temp.innerHTML = input;


    let wrapper = temp.querySelector('div.table-responsive');
    let table = wrapper ? wrapper.querySelector('table.table') : temp.querySelector('table.table');
    if (!table) {
        alert('Nie znaleziono tabeli z klasą table.');
        return;
    }


    const sections = [];
    let currentSection = null;


[...table.querySelectorAll('thead, tbody')].forEach(section => {
        if (section.tagName === 'THEAD') {
            const tr = section.querySelector('tr');
            if (!tr) return;
            tr.className = 'thead';
            currentSection = [tr];
            sections.push(currentSection);
        } else if (section.tagName === 'TBODY') {
            const rows = [...section.querySelectorAll('tr')];
            rows.forEach(r => r.className = 'tbody');
            if (currentSection) currentSection.push(...rows);
        }
    });


    sections.forEach(sec => {
        if (sec.length > 1) sec[sec.length - 1].classList.add('last');
    });


    // Zachowaj wcięcia z oryginalnego HTML
    const originalLines = input.split('\n');
    const indentMap = new Map();
    originalLines.forEach(line => {
        const trimmed = line.trimStart();
        if (trimmed.startsWith('<tr')) {
            const indent = line.match(/^\s*/)[0];
            const key = trimmed.replace(/\s+/g, '');
            indentMap.set(key, indent);
        }
    });


    table.innerHTML = '';
    sections.forEach(sec => {
        sec.forEach(tr => {
            const key = tr.outerHTML.replace(/\s+/g, '');
            const indent = indentMap.get(key) || '';
            table.appendChild(document.createTextNode(indent));
            table.appendChild(tr);
            table.appendChild(document.createTextNode('\n'));
        });
    });


    const resultHTML = wrapper ? wrapper.outerHTML : table.outerHTML;
    document.getElementById('output').value = resultHTML;
});


document.getElementById('copySpec').addEventListener('click', function () {
    const output = document.getElementById('output');
    if (!output.value.trim()) {
        alert('Nie ma nic do skopiowania 🙂');
        return;
    }
    output.select();
    document.execCommand('copy');
    alert('Skopiowano do schowka!');
});