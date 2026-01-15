// Quick add to trip function for AI assistant
function quickAddToTrip(destName) {
    if (state.trips.length === 0) {
        // Create a new trip with this destination
        const parts = destName.split(',');
        const cityName = parts[0].trim();

        const newTrip = {
            id: generateId(),
            name: `Trip to ${cityName}`,
            description: 'Created from AI Assistant',
            startDate: new Date().toISOString().split('T')[0],
            endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            destinations: [{ name: destName, notes: 'Added from AI Assistant' }],
            budget: { total: 0, currency: 'USD', expenses: [] },
            packingList: [],
            documents: [],
            itinerary: [],
            healthScore: null
        };

        // Generate itinerary
        newTrip.itinerary = generateItinerary(newTrip.startDate, newTrip.endDate, { pace: 'balanced', style: 'balanced', mustDos: [] });
        newTrip.healthScore = calculateHealthScore(newTrip.itinerary, { pace: 'balanced', style: 'balanced' });

        state.trips.push(newTrip);
        state.profile.stats.totalTrips++;
        state.profile.stats.totalDestinations++;
        saveData();

        showToast(`Created trip to ${cityName}!`, 'success');

        // Navigate to the trip
        setTimeout(() => {
            navigateTo('itinerary', newTrip.id);
        }, 500);
    } else {
        // Show modal to select existing trip or create new
        const parts = destName.split(',');
    add DestinationFromChat(parts[0].trim(), parts.length > 1 ? parts[1].trim() : '');
    }
}

function addDestinationFromChat(name, country) {
    const fullName = country ? `${name}, ${country}` : name;

    if (state.trips.length === 0) {
        quickAddToTrip(fullName);
        return;
    }

    const tripOptions = state.trips.map(t =>
        `<option value="${t.id}">${sanitizeHTML(t.name)}</option>`
    ).join('');

    showModal('Add to Trip', `
    <div class="form-group">
      <label class="form-label">Select Trip</label>
      <select id="tripSelect" class="form-select">
        <option value="NEW_TRIP">➕ Create New Trip</option>
        ${tripOptions}
      </select>
    </div>
    <div class="form-group" id="newTripNameField" style="display: none;">
      <label class="form-label">New Trip Name</label>
      <input type="text" id="newTripName" class="form-input" value="Trip to ${name}" placeholder="E.g., Summer in Europe">
    </div>
    <div class="form-group">
      <label class="form-label">Notes (optional)</label>
      <input type="text" id="destNotes" class="form-input" placeholder="E.g., Visit museums">
    </div>
  `, [
        { label: 'Cancel', class: 'btn-secondary', onclick: 'closeModal()' },
        { label: 'Add', class: 'btn-primary', onclick: `confirmAddChatDestination('${fullName.replace(/'/g, "\\'")}')` }
    ]);

    // Add change listener to show/hide new trip field
    setTimeout(() => {
        const select = document.getElementById('tripSelect');
        select.addEventListener('change', (e) => {
            const field = document.getElementById('newTripNameField');
            field.style.display = e.target.value === 'NEW_TRIP' ? 'block' : 'none';
        });
    }, 100);
}

function confirmAddChatDestination(destName) {
    const tripSelect = document.getElementById('tripSelect');
    const tripId = tripSelect.value;
    const notes = document.getElementById('destNotes').value;

    if (tripId === 'NEW_TRIP') {
        const tripName = document.getElementById('newTripName').value || `Trip to ${destName.split(',')[0]}`;

        const newTrip = {
            id: generateId(),
            name: tripName,
            description: 'Created from AI Assistant',
            startDate: new Date().toISOString().split('T')[0],
            endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            destinations: [{ name: destName, notes: notes || 'Added from AI Assistant' }],
            budget: { total: 0, currency: 'USD', expenses: [] },
            packingList: [],
            documents: [],
            itinerary: [],
            healthScore: null
        };

        newTrip.itinerary = generateItinerary(newTrip.startDate, newTrip.endDate, { pace: 'balanced', style: 'balanced', mustDos: [] });
        newTrip.healthScore = calculateHealthScore(newTrip.itinerary, { pace: 'balanced', style: 'balanced' });

        state.trips.push(newTrip);
        state.profile.stats.totalTrips++;
        state.profile.stats.totalDestinations++;
        saveData();

        closeModal();
        showToast(`Created trip "${tripName}"!`, 'success');

        setTimeout(() => {
            navigateTo('itinerary', newTrip.id);
        }, 500);
    } else {
        const trip = getTripById(tripId);
        if (trip) {
            if (!trip.destinations) {
                trip.destinations = [];
            }

            if (!trip.destinations.find(d => d.name === destName)) {
                trip.destinations.push({ name: destName, notes: notes });
                saveData();
                closeModal();
                showToast(`Added ${destName} to ${trip.name}`, 'success');

                if (state.currentView === 'itinerary' && state.currentTripId === tripId) {
                    renderTripDetail(tripId);
                }
            } else {
                showToast(`${destName} is already in this trip`, 'info');
            }
        }
    }
}
