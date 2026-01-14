
// ========== AUTOCOMPLETE SYSTEM ==========
let autocompleteSelectedIndex = -1;
let autocompleteMatches = [];

function performAutocompleteSearch(query, inputId, dropdownId) {
    if (!query || query.length < 2) {
        hideAutocomplete(dropdownId);
        return;
    }

    const lower = query.toLowerCase();
    const results = [];

    // Search cities
    DESTINATION_DATABASE.forEach(dest => {
        const nameMatch = dest.name.toLowerCase().includes(lower);
        const countryMatch = dest.country.toLowerCase().includes(lower);

        if (nameMatch || countryMatch) {
            results.push({
                type: 'city',
                icon: '🏙️',
                name: dest.name,
                country: dest.country,
                meta: `${dest.country} • City`,
                budget: dest.budget,
                data: dest
            });
        }
    });

    autocompleteMatches = results.slice(0, 8);
    renderAutocomplete(autocompleteMatches, dropdownId, inputId);
}

function renderAutocomplete(results, dropdownId, inputId) {
    const dropdown = document.getElementById(dropdownId);

    if (!dropdown) return;

    if (results.length === 0) {
        dropdown.innerHTML = '<div class="autocomplete-empty">No destinations found</div>';
        dropdown.classList.remove('hidden');
        return;
    }

    dropdown.innerHTML = results.map((r, i) => `
    <div class="autocomplete-item ${i === autocompleteSelectedIndex ? 'selected' : ''}" 
         data-index="${i}"
         data-name="${r.name}"
         data-country="${r.country}">
      <div class="autocomplete-icon">${r.icon}</div>
      <div class="autocomplete-details">
        <div class="autocomplete-name">${r.name}</div>
        <div class="autocomplete-meta">${r.meta}</div>
      </div>
      <div class="autocomplete-badge">${r.budget}</div>
    </div>
  `).join('');

    dropdown.classList.remove('hidden');

    // Add click handlers
    dropdown.querySelectorAll('.autocomplete-item').forEach((item, idx) => {
        item.addEventListener('click', () => selectAutocompleteItem(idx, inputId, dropdownId));
    });
}

function selectAutocompleteItem(index, inputId, dropdownId) {
    if (index < 0 || index >= autocompleteMatches.length) return;

    const selected = autocompleteMatches[index];
    const input = document.getElementById(inputId);

    const displayText = selected.type === 'city'
        ? `${selected.name}, ${selected.country}`
        : selected.name;

    input.value = displayText;
    hideAutocomplete(dropdownId);

    // Trigger search with selected value
    if (inputId === 'countrySearch') {
        searchDestinations(selected.name);
    }
}

function hideAutocomplete(dropdownId) {
    const dropdown = document.getElementById(dropdownId);
    if (dropdown) {
        dropdown.classList.add('hidden');
    }
    autocompleteSelectedIndex = -1;
    autocompleteMatches = [];
}

function handleAutocompleteKeyboard(e, inputId, dropdownId) {
    const dropdown = document.getElementById(dropdownId);

    if (!dropdown || dropdown.classList.contains('hidden')) {
        return;
    }

    switch (e.key) {
        case 'ArrowDown':
            e.preventDefault();
            autocompleteSelectedIndex = Math.min(autocompleteSelectedIndex + 1, autocompleteMatches.length - 1);
            renderAutocomplete(autocompleteMatches, dropdownId, inputId);
            break;

        case 'ArrowUp':
            e.preventDefault();
            autocompleteSelectedIndex = Math.max(autocompleteSelectedIndex - 1, -1);
            renderAutocomplete(autocompleteMatches, dropdownId, inputId);
            break;

        case 'Enter':
            e.preventDefault();
            if (autocompleteSelectedIndex >= 0) {
                selectAutocompleteItem(autocompleteSelectedIndex, inputId, dropdownId);
            }
            break;

        case 'Escape':
            hideAutocomplete(dropdownId);
            break;
    }
}

// Initialize autocomplete on search input
if (document.getElementById('countrySearch')) {
    const searchInput = document.getElementById('countrySearch');
    let searchTimeout;

    searchInput.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            performAutocompleteSearch(e.target.value, 'countrySearch', 'searchAutocomplete');
        }, 200);
    });

    searchInput.addEventListener('keydown', (e) => {
        handleAutocompleteKeyboard(e, 'countrySearch', 'searchAutocomplete');
    });

    // Hide autocomplete when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.autocomplete-container')) {
            hideAutocomplete('searchAutocomplete');
        }
    });
}
