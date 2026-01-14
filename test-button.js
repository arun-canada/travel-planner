// PASTE THIS IN CONSOLE TO CHECK THE BUTTON

console.log('=== BUTTON CHECK ===');

// Check if button exists
const btn = document.getElementById('applyFilters');
console.log('Button exists:', !!btn);
console.log('Button element:', btn);

// Check if it has a click listener (we can't see this directly, but we can test)
if (btn) {
    console.log('Button HTML:', btn.outerHTML);

    // Try clicking it programmatically
    console.log('Clicking button programmatically...');
    btn.click();

    // OR try adding a listener manually
    console.log('Adding manual listener...');
    btn.addEventListener('click', function () {
        console.log('🎉 BUTTON CLICKED! Manual listener works!');

        // Now call the filter function
        if (typeof applyFilters === 'function') {
            applyFilters();
        } else {
            console.error('applyFilters function does not exist!');
        }
    });

    console.log('✅ Manual listener added. Now click the button!');
}
