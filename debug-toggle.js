// PASTE THIS IN CONSOLE TO DEBUG TOGGLE
console.log('=== TOGGLE DEBUG ===');

const toggleBtn = document.getElementById('toggleFilters');
const content = document.getElementById('filterContent');

console.log('Button:', toggleBtn);
console.log('Content:', content);

if (content) {
    console.log('Initial classes:', content.className);
    console.log('Computed display:', window.getComputedStyle(content).display);
}

// Manually try to toggle
if (toggleBtn && content) {
    console.log('Triggering click...');
    // Add a one-time listener to see if it catches
    toggleBtn.addEventListener('click', () => console.log('🖱️ Native click detected!'), { once: true });

    // Call the function directly if it exists
    if (typeof toggleFilters === 'function') {
        console.log('Calling toggleFilters() manually...');
        toggleFilters();
        console.log('Classes after manual call:', content.className);
    } else {
        console.error('toggleFilters function missing!');
    }
}
