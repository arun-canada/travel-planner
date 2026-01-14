// OPEN BROWSER CONSOLE AND RUN THIS LINE BY LINE

// Test 1: Check if database exists
console.log('1. Database exists:', typeof DESTINATION_DATABASE !== 'undefined');
console.log('   Database length:', DESTINATION_DATABASE?.length);

// Test 2: Check if functions exist
console.log('2. Functions exist:');
console.log('   - renderDestinationCards:', typeof renderDestinationCards);
console.log('   - applyFilters:', typeof applyFilters);
console.log('   - toggleFilters:', typeof toggleFilters);

// Test 3: Check if grid element exists
console.log('3. Grid element:', document.getElementById('countryGrid'));

// Test 4: Manually call render to show all destinations
console.log('4. Calling renderDestinationCards with all destinations...');
renderDestinationCards(DESTINATION_DATABASE);

// Test 5: Check if cards appeared
setTimeout(() => {
    const cards = document.querySelectorAll('.country-card');
    console.log('5. Number of cards in DOM:', cards.length);
    if (cards.length > 0) {
        console.log('✅ Cards are rendering! Filter logic might be the issue.');
    } else {
        console.log('❌ Cards not rendering. Check console for errors.');
    }
}, 100);

// Test 6: Try applying a filter
console.log('6. Testing budget filter...');
document.getElementById('budgetFilter').value = 'budget';
applyFilters();
