document.addEventListener('DOMContentLoaded', () => {
    
    const copyButtons = document.querySelectorAll('.copy-btn');
    const toast = document.getElementById('toast');
    let toastTimeout;

    // Funkcja pokazująca powiadomienie "Skopiowano!"
    const showToast = (message) => {
        toast.textContent = message;
        toast.classList.add('show');
        
        clearTimeout(toastTimeout);
        toastTimeout = setTimeout(() => {
            toast.classList.remove('show');
        }, 2500); // Znika po 2.5 sekundy
    };

    // Logika kopiowania
    copyButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            // Znajdź główny kontener karty (najbliższy element z klasą snippet-card)
            const card = e.target.closest('.snippet-card');
            // Szuka najbliższego rodzica, który jest dużą kartą LUB małym kafelkiem
            const card = e.target.closest('.snippet-card, .feature-tile');
            
            if (card) {
                // Wyodrębnij ukryty kod z tej samej karty
                const codeElement = card.querySelector('.snippet-code');
                
                if (codeElement) {
                    // .trim() usuwa białe znaki na początku i końcu
                    const codeToCopy = codeElement.innerHTML.trim();
                    
                    // Użycie nowoczesnego API schowka
                    navigator.clipboard.writeText(codeToCopy).then(() => {
                        showToast('Skopiowano kod do schowka!');
                    }).catch(err => {
                        console.error('Błąd kopiowania: ', err);
                        showToast('Błąd: Nie udało się skopiować.');
                    });
                }
            }
        });
    });

    // Opcjonalnie: Płynne przewijanie do sekcji z paska bocznego
    document.querySelectorAll('.nav-links a').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            if(targetId.startsWith('#')) {
                e.preventDefault();
                const targetElement = document.querySelector(targetId);
                if(targetElement) {
                    targetElement.scrollIntoView({
                        behavior: 'smooth'
                    });
                }
            }
        });
    });
});