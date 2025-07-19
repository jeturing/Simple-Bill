export function init() {
    const navButtons = document.querySelectorAll('.nav-btn');
    const contentSections = document.querySelectorAll('.content-section');

    function showSection(sectionId) {
        contentSections.forEach(section => {
            section.classList.add('hidden');
        });
        const activeSection = document.getElementById(`${sectionId}-section`);
        if (activeSection) {
            activeSection.classList.remove('hidden');
        }
        navButtons.forEach(btn => {
            btn.classList.remove('text-blue-600', 'border-blue-600');
            if (btn.dataset.section === sectionId) {
                btn.classList.add('text-blue-600', 'border-blue-600');
            }
        });
    }

    navButtons.forEach(button => {
        button.addEventListener('click', () => {
            showSection(button.dataset.section);
        });
    });

    // Show default section
    showSection('factura');
}
