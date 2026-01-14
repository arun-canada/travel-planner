/* PASTE THIS IN BROWSER CONSOLE TO TEST FILTERS */

// Test 1: Check if DESTINATION_DATABASE exists
console.log('Database length:', DESTINATION_DATABASE?.length);

// Test 2: Check filter state
console.log('Active filters:', state.activeFilters);

// Test 3: Check grid element
const grid = document.getElementById('countryGrid');
console.log('Grid element exists:', !!grid);
console.log('Grid HTML length:', grid?.innerHTML?.length);

// Test 4: Manually render 3 destinations
const testDests = DESTINATION_DATABASE.slice(0, 3);
console.log('Test destinations:', testDests.map(d => d.name));
renderDestinationCards(testDests);
console.log('After render, grid HTML length:', grid.innerHTML.length);

// Test 5: Check if cards are in DOM
const cards = document.querySelectorAll('.country-card');
console.log('Number of cards found:', cards.length);

// Test 6: Apply filters manually
document.getElementById('budgetFilter').value = 'budget';
applyFilters();
console.log('After budget filter applied');

// If no results, check what's being filtered
const budgetDests = DESTINATION_DATABASE.filter(d => d.budget === 'budget');
console.log('Budget destinations count:', budgetDests.length);
console.log('Budget destinations:', budgetDests.map(d => d.name));
