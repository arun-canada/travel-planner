// PASTE THIS IN CONSOLE TO DEBUG FILTERS

console.log('=== FILTER DIAGNOSTIC ===');

// Check filter values
const budgetValue = document.getElementById('budgetFilter').value;
const seasonValue = document.getElementById('seasonFilter').value;
const vibeButtons = document.querySelectorAll('.vibe-tag.active');

console.log('Budget filter value:', budgetValue);
console.log('Season filter value:', seasonValue);
console.log('Active vibe tags:', vibeButtons.length);

// Test filtering manually
const testFiltered = DESTINATION_DATABASE.filter(dest => {
    console.log(`Testing ${dest.name}: budget=${dest.budget}, matches=${dest.budget === budgetValue}`);

    if (budgetValue !== 'all' && dest.budget !== budgetValue) {
        return false;
    }
    return true;
});

console.log('Filtered destinations:', testFiltered.length);
console.log('First 3:', testFiltered.slice(0, 3).map(d => `${d.name} (${d.budget})`));

// Now check what applyFilters() actually does
console.log('\n=== CALLING applyFilters() ===');
applyFilters();
