// DEBUG VIBES
console.log('=== VIBE DEBUG ===');
const content = document.getElementById('filterContent');
const vibes = document.querySelectorAll('.vibe-tag');

console.log('Filter Content:', content);
console.log('Vibe Tags found:', vibes.length);

if (content) {
    content.addEventListener('click', (e) => {
        console.log('Click on filterContent target:', e.target);
        const closest = e.target.closest('.vibe-tag');
        console.log('Closest vibe-tag:', closest);
        if (closest) {
            console.log('Has active before:', closest.classList.contains('active'));
        }
    });
}

// Check CSS
if (vibes.length > 0) {
    const styles = window.getComputedStyle(vibes[0]);
    console.log('Color:', styles.color);
    console.log('Background:', styles.backgroundColor);

    // Force active to see if it changes
    vibes[0].classList.add('active');
    const activeStyles = window.getComputedStyle(vibes[0]);
    console.log('Active Background:', activeStyles.backgroundColor);
}
