// PASTE THIS IN CONSOLE, THEN CLICK "APPLY FILTERS" BUTTON

// Override applyFilters to add logging
const originalApplyFilters = window.applyFilters;
window.applyFilters = function () {
    console.log('=== applyFilters() CALLED ===');

    const budgetFilter = document.getElementById('budgetFilter').value;
    const seasonFilter = document.getElementById('seasonFilter').value;
    const vibeButtons = document.querySelectorAll('.vibe-tag.active');
    const selectedVibes = Array.from(vibeButtons).map(btn => btn.dataset.vibe);

    console.log('Budget filter:', budgetFilter);
    console.log('Season filter:', seasonFilter);
    console.log('Selected vibes:', selectedVibes);

    const filtered = DESTINATION_DATABASE.filter(dest => {
        if (budgetFilter !== 'all' && dest.budget !== budgetFilter) {
            return false;
        }
        if (selectedVibes.length > 0) {
            const hasMatchingVibe = selectedVibes.some(vibe => dest.vibe.includes(vibe));
            if (!hasMatchingVibe) return false;
        }
        if (seasonFilter !== 'all') {
            const seasonMonths = {
                'spring': [3, 4, 5],
                'summer': [6, 7, 8],
                'fall': [9, 10, 11],
                'winter': [12, 1, 2]
            };
            const months = seasonMonths[seasonFilter];
            const hasMatchingMonth = months.some(m => dest.months.includes(m));
            if (!hasMatchingMonth) return false;
        }
        return true;
    });

    console.log('Filtered count:', filtered.length);
    console.log('First 5 names:', filtered.slice(0, 5).map(d => d.name));

    // Call original
    return originalApplyFilters.call(this);
};

console.log('✅ Logging enabled. Now click "Apply Filters" and watch the console!');
