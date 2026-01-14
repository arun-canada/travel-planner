// TripFlow - Travel Planning PWA
// Complete Application Logic

// ========== STATE MANAGEMENT ==========
const state = {
  currentPage: 'home',
  currentTripId: null,
  currentTab: 'overview',
  trips: [],
  profile: {
    xp: 0,
    level: 1,
    achievements: [],
    stats: {
      totalTrips: 0,
      totalDestinations: 0,
      countriesVisited: 0,
      totalExpenses: 0,
      packingListsCompleted: 0,
      documentsUploaded: 0
    }
  }
};

// ========== ACHIEVEMENTS DEFINITION ==========
const ACHIEVEMENTS = {
  first_adventure: { id: 'first_adventure', name: 'First Adventure', icon: '🎒', description: 'Create your first trip', xp: 100 },
  explorer: { id: 'explorer', name: 'Explorer', icon: '🗺️', description: 'Add 10 destinations', xp: 200 },
  budget_master: { id: 'budget_master', name: 'Budget Master', icon: '💰', description: 'Track 20+ expenses', xp: 150 },
  frequent_flyer: { id: 'frequent_flyer', name: 'Frequent Flyer', icon: '✈️', description: 'Create 5 trips', xp: 250 },
  globe_trotter: { id: 'globe_trotter', name: 'Globe Trotter', icon: '🌍', description: 'Visit 5+ countries', xp: 500 },
  organized_traveler: { id: 'organized_traveler', name: 'Organized Traveler', icon: '📝', description: 'Complete 3 packing lists', xp: 150 },
  completionist: { id: 'completionist', name: 'Completionist', icon: '🎯', description: 'Use all features in one trip', xp: 300 },
  document_keeper: { id: 'document_keeper', name: 'Document Keeper', icon: '📄', description: 'Upload 5+ documents', xp: 200 }
};

// ========== CITY COORDINATES DATABASE ==========
const CITY_COORDS = {
  'new york': [40.7128, -74.0060], 'los angeles': [34.0522, -118.2437], 'london': [51.5074, -0.1278],
  'paris': [48.8566, 2.3522], 'tokyo': [35.6762, 139.6503], 'bangkok': [13.7563, 100.5018],
  'dubai': [25.2048, 55.2708], 'singapore': [1.3521, 103.8198], 'rome': [41.9028, 12.4964],
  'barcelona': [41.3851, 2.1734], 'amsterdam': [52.3676, 4.9041], 'berlin': [52.5200, 13.4050],
  'sydney': [-33.8688, 151.2093], 'melbourne': [-37.8136, 144.9631], 'toronto': [43.6532, -79.3832],
  'vancouver': [49.2827, -123.1207], 'miami': [25.7617, -80.1918], 'chicago': [41.8781, -87.6298],
  'san francisco': [37.7749, -122.4194], 'seattle': [47.6062, -122.3321], 'boston': [42.3601, -71.0589],
  'madrid': [40.4168, -3.7038], 'lisbon': [38.7223, -9.1393], 'athens': [37.9838, 23.7275],
  'istanbul': [41.0082, 28.9784], 'cairo': [30.0444, 31.2357], 'mumbai': [19.0760, 72.8777],
  'delhi': [28.7041, 77.1025], 'beijing': [39.9042, 116.4074], 'shanghai': [31.2304, 121.4737],
  'hong kong': [22.3193, 114.1694], 'seoul': [37.5665, 126.9780]
};

// ========== LOCALSTORAGE FUNCTIONS ==========
function loadData() {
  try {
    const trips = localStorage.getItem('tripflow_itineraries');
    const profile = localStorage.getItem('tripflow_profile');
    if (trips) state.trips = JSON.parse(trips);
    if (profile) state.profile = JSON.parse(profile);
  } catch (e) {
    console.error('Error loading data:', e);
  }
}

function saveData() {
  try {
    localStorage.setItem('tripflow_itineraries', JSON.stringify(state.trips));
    localStorage.setItem('tripflow_profile', JSON.stringify(state.profile));
  } catch (e) {
    console.error('Error saving data:', e);
    showToast('Storage limit reached. Please delete some data.', 'error');
  }
}

// ========== UTILITY FUNCTIONS ==========
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function sanitizeHTML(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatCurrency(amount, currency = 'USD') {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
}

// ========== XP & GAMIFICATION ==========
function awardXP(amount, reason) {
  state.profile.xp += amount;
  const oldLevel = state.profile.level;
  state.profile.level = Math.floor(state.profile.xp / 1000) + 1;

  saveData();
  updateXPBar();

  if (state.profile.level > oldLevel) {
    showLevelUp(state.profile.level);
  }

  showToast(`+${amount} XP • ${reason}`, 'success');
  checkAchievements();
}

function updateXPBar() {
  const xpInLevel = state.profile.xp % 1000;
  const progress = (xpInLevel / 1000) * 100;

  document.getElementById('xpText').textContent = `Level ${state.profile.level} • ${xpInLevel}/1000 XP`;
  document.getElementById('xpFill').style.width = `${progress}%`;
}

function showLevelUp(level) {
  showToast(`🎉 Level Up! You're now Level ${level}!`, 'success');
}

function unlockAchievement(achievementId) {
  if (state.profile.achievements.includes(achievementId)) return;

  const achievement = ACHIEVEMENTS[achievementId];
  if (!achievement) return;

  state.profile.achievements.push(achievementId);
  state.profile.xp += achievement.xp;
  saveData();

  showAchievementUnlock(achievement);
}

function showAchievementUnlock(achievement) {
  const overlay = document.getElementById('achievementOverlay');
  overlay.innerHTML = `
    <div class="achievement-card">
      <div class="achievement-icon">${achievement.icon}</div>
      <h2 class="achievement-title">Achievement Unlocked!</h2>
      <p class="achievement-description">${achievement.name}</p>
      <p style="opacity: 0.8;">${achievement.description}</p>
      <div class="achievement-xp">+${achievement.xp} XP</div>
    </div>
  `;
  overlay.classList.remove('hidden');

  setTimeout(() => {
    overlay.classList.add('hidden');
    updateXPBar();
  }, 4000);
}

function checkAchievements() {
  const stats = state.profile.stats;

  if (stats.totalTrips >= 1) unlockAchievement('first_adventure');
  if (stats.totalDestinations >= 10) unlockAchievement('explorer');
  if (stats.totalExpenses >= 20) unlockAchievement('budget_master');
  if (stats.totalTrips >= 5) unlockAchievement('frequent_flyer');
  if (stats.countriesVisited >= 5) unlockAchievement('globe_trotter');
  if (stats.packingListsCompleted >= 3) unlockAchievement('organized_traveler');
  if (stats.documentsUploaded >= 5) unlockAchievement('document_keeper');
}

// ========== TOAST NOTIFICATIONS ==========
function showToast(message, type = 'info') {
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;

  const icons = { success: '✅', error: '❌', info: 'ℹ️', warning: '⚠️' };

  toast.innerHTML = `
    <div class="toast-icon">${icons[type] || icons.info}</div>
    <div class="toast-content">
      <div class="toast-message">${sanitizeHTML(message)}</div>
    </div>
    <button class="toast-close" onclick="this.parentElement.remove()">✕</button>
  `;

  container.appendChild(toast);

  setTimeout(() => toast.remove(), 4000);
}

// ========== MODAL SYSTEM ==========
function showModal(title, content, actions = []) {
  const overlay = document.getElementById('modalOverlay');
  const modal = document.getElementById('modalContent');

  let actionsHTML = '';
  actions.forEach(action => {
    actionsHTML += `<button class="btn ${action.class || 'btn-primary'}" onclick="${action.onclick}">${action.label}</button>`;
  });

  modal.innerHTML = `
    <div class="modal-header">
      <h3 class="modal-title">${sanitizeHTML(title)}</h3>
      <button class="modal-close" onclick="closeModal()">✕</button>
    </div>
    <div class="modal-body">${content}</div>
    ${actionsHTML ? `<div class="modal-footer">${actionsHTML}</div>` : ''}
  `;

  overlay.classList.remove('hidden');
}

function closeModal() {
  document.getElementById('modalOverlay').classList.add('hidden');
}

// ========== TRIP MANAGEMENT (CRUD) ==========
function createTrip(name, description, startDate, endDate) {
  const trip = {
    id: generateId(),
    name,
    description,
    startDate,
    endDate,
    destinations: [],
    budget: { total: 0, currency: 'USD', expenses: [] },
    packingList: [],
    documents: []
  };

  state.trips.push(trip);
  state.profile.stats.totalTrips++;
  saveData();

  awardXP(50, 'Created a trip');
  closeModal();
  navigateTo('home');
}

function deleteTrip(tripId) {
  if (!confirm('Are you sure you want to delete this trip?')) return;

  state.trips = state.trips.filter(t => t.id !== tripId);
  saveData();
  showToast('Trip deleted', 'info');
  navigateTo('home');
}

function getTripById(id) {
  return state.trips.find(t => t.id === id);
}

// ========== DESTINATION MANAGEMENT ==========
function addDestination(tripId, name, notes = '') {
  const trip = getTripById(tripId);
  if (!trip) return;

  trip.destinations.push({ name: sanitizeHTML(name), notes: sanitizeHTML(notes) });
  state.profile.stats.totalDestinations++;

  const uniqueCountries = new Set(state.trips.flatMap(t => t.destinations.map(d => d.name.toLowerCase())));
  state.profile.stats.countriesVisited = uniqueCountries.size;

  saveData();
  awardXP(20, 'Added destination');
  renderTripDetail(tripId);
}

function deleteDestination(tripId, index) {
  if (!confirm('Remove this destination?')) return;

  const trip = getTripById(tripId);
  if (!trip) return;

  trip.destinations.splice(index, 1);
  saveData();
  showToast('Destination removed', 'info');
  renderTripDetail(tripId);
}

function updateDestination(tripId, index, name, notes) {
  const trip = getTripById(tripId);
  if (!trip) return;

  trip.destinations[index] = {
    name: sanitizeHTML(name),
    notes: sanitizeHTML(notes)
  };

  saveData();
  showToast('Destination updated', 'success');
  renderTripDetail(tripId);
}

// ========== BUDGET TRACKING ==========
function setBudget(tripId, total, currency) {
  const trip = getTripById(tripId);
  if (!trip) return;

  trip.budget.total = parseFloat(total);
  trip.budget.currency = currency;
  saveData();
  awardXP(25, 'Set budget');
  renderBudgetTab(trip);
}

function addExpense(tripId, amount, category, description, date) {
  const trip = getTripById(tripId);
  if (!trip) return;

  trip.budget.expenses.push({
    amount: parseFloat(amount),
    category,
    description: sanitizeHTML(description),
    date
  });

  state.profile.stats.totalExpenses++;
  saveData();
  awardXP(10, 'Added expense');
  renderBudgetTab(trip);
}

function deleteExpense(tripId, index) {
  const trip = getTripById(tripId);
  if (!trip) return;

  trip.budget.expenses.splice(index, 1);
  saveData();
  renderBudgetTab(trip);
}

function getCategoryIcon(category) {
  const icons = {
    'Flights': '✈️', 'Hotels': '🏨', 'Food': '🍽️',
    'Activities': '🎭', 'Shopping': '🛍️', 'Transport': '🚗', 'Other': '📦'
  };
  return icons[category] || '📦';
}

// ========== PACKING LIST ==========
function addPackingItem(tripId, category, item) {
  const trip = getTripById(tripId);
  if (!trip) return;

  trip.packingList.push({ category, item: sanitizeHTML(item), checked: false });
  saveData();
  renderPackingTab(trip);
}

function togglePackingItem(tripId, index) {
  const trip = getTripById(tripId);
  if (!trip) return;

  trip.packingList[index].checked = !trip.packingList[index].checked;

  const allChecked = trip.packingList.every(item => item.checked);
  if (allChecked && trip.packingList.length > 0) {
    state.profile.stats.packingListsCompleted++;
    awardXP(30, 'Completed packing list');
  }

  saveData();
  renderPackingTab(trip);
}

function deletePackingItem(tripId, index) {
  const trip = getTripById(tripId);
  if (!trip) return;

  trip.packingList.splice(index, 1);
  saveData();
  renderPackingTab(trip);
}

function addSmartSuggestions(tripId) {
  const trip = getTripById(tripId);
  if (!trip) return;

  const suggestions = [
    { category: 'Documents', item: 'Passport' },
    { category: 'Documents', item: 'Travel Insurance' },
    { category: 'Documents', item: 'Tickets' },
    { category: 'Clothing', item: 'Socks' },
    { category: 'Clothing', item: 'Underwear' },
    { category: 'Toiletries', item: 'Toothbrush' },
    { category: 'Toiletries', item: 'Shampoo' },
    { category: 'Electronics', item: 'Phone Charger' },
    { category: 'Electronics', item: 'Power Bank' }
  ];

  suggestions.forEach(s => {
    if (!trip.packingList.find(item => item.item === s.item)) {
      trip.packingList.push({ ...s, checked: false });
    }
  });

  saveData();
  showToast('Added smart suggestions', 'success');
  renderPackingTab(trip);
}

// ========== DOCUMENT STORAGE ==========
function uploadDocument(tripId, file, type) {
  const trip = getTripById(tripId);
  if (!trip) return;

  if (file.size > 2 * 1024 * 1024) {
    showToast('File too large. Max 2MB', 'error');
    return;
  }

  const reader = new FileReader();
  reader.onload = (e) => {
    trip.documents.push({
      name: file.name,
      type,
      data: e.target.result,
      size: file.size,
      uploadDate: new Date().toISOString()
    });

    state.profile.stats.documentsUploaded++;
    saveData();
    awardXP(15, 'Uploaded document');
    renderDocumentsTab(trip);
  };
  reader.readAsDataURL(file);
}

function downloadDocument(doc) {
  const link = document.createElement('a');
  link.href = doc.data;
  link.download = doc.name;
  link.click();
}

function deleteDocument(tripId, index) {
  const trip = getTripById(tripId);
  if (!trip) return;

  trip.documents.splice(index, 1);
  saveData();
  renderDocumentsTab(trip);
}

// ========== MAP FUNCTIONS ==========
let mapInstance = null;

function initializeMap(trip) {
  const container = document.getElementById('mapContainer');
  if (!container) return;

  if (mapInstance) {
    mapInstance.remove();
  }

  mapInstance = L.map('mapContainer').setView([20, 0], 2);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
  }).addTo(mapInstance);

  const markers = [];
  const coords = [];

  trip.destinations.forEach(dest => {
    const coord = CITY_COORDS[dest.name.toLowerCase()];
    if (coord) {
      coords.push(coord);
      const marker = L.marker(coord).addTo(mapInstance);
      marker.bindPopup(`<b>${dest.name}</b><br>${dest.notes || 'No notes'}`);
      markers.push(marker);
    }
  });

  if (coords.length > 1) {
    L.polyline(coords, { color: '#1F7A5A', weight: 2 }).addTo(mapInstance);
  }

  if (coords.length > 0) {
    mapInstance.fitBounds(coords);
  }

  setTimeout(() => mapInstance.invalidateSize(), 100);

  const mapped = coords.length;
  const total = trip.destinations.length;
  document.getElementById('mapInfo').textContent =
    `Showing ${mapped} of ${total} destinations on map`;
}

// ========== REST COUNTRIES API ==========
async function searchCountries(query) {
  if (!query) {
    document.getElementById('countryGrid').innerHTML =
      '<div class="empty-state"><div class="empty-icon">🌍</div><p class="empty-message">Search for countries to explore destinations</p></div>';
    return;
  }

  try {
    const response = await fetch(`https://restcountries.com/v3.1/name/${encodeURIComponent(query)}`);
    if (!response.ok) throw new Error('Not found');

    const countries = await response.json();
    renderCountryCards(countries.slice(0, 12));
  } catch (e) {
    document.getElementById('countryGrid').innerHTML =
      '<div class="empty-state"><div class="empty-icon">😕</div><p class="empty-message">No countries found</p></div>';
  }
}

function renderCountryCards(countries) {
  const grid = document.getElementById('countryGrid');

  grid.innerHTML = countries.map(country => `
    <div class="country-card">
      <img src="${country.flags.png}" alt="${country.name.common}" class="country-flag">
      <div class="country-content">
        <h3 class="country-name">${country.name.common}</h3>
        <div class="country-info">
          <div class="country-info-item">
            <span>Capital:</span>
            <strong>${country.capital?.[0] || 'N/A'}</strong>
          </div>
          <div class="country-info-item">
            <span>Region:</span>
            <strong>${country.region}</strong>
          </div>
          <div class="country-info-item">
            <span>Population:</span>
            <strong>${(country.population / 1000000).toFixed(1)}M</strong>
          </div>
        </div>
        <button class="btn btn-primary" onclick="addCountryToTrip('${country.name.common.replace(/'/g, "\\'")}')">
          Add to Trip
        </button>
      </div>
    </div>
  `).join('');
}

function addCountryToTrip(countryName) {
  if (state.trips.length === 0) {
    showToast('Create a trip first!', 'warning');
    return;
  }

  const tripOptions = state.trips.map(t =>
    `<option value="${t.id}">${sanitizeHTML(t.name)}</option>`
  ).join('');

  showModal('Add to Trip', `
    <div class="form-group">
      <label class="form-label">Select Trip</label>
      <select id="tripSelect" class="form-select">${tripOptions}</select>
    </div>
    <div class="form-group">
      <label class="form-label">Notes (optional)</label>
      <input type="text" id="destNotes" class="form-input" placeholder="E.g., Visit museums">
    </div>
  `, [
    { label: 'Cancel', class: 'btn-secondary', onclick: 'closeModal()' },
    { label: 'Add', class: 'btn-primary', onclick: `confirmAddCountryToTrip('${countryName.replace(/'/g, "\\'")}')` }
  ]);
}

function confirmAddCountryToTrip(countryName) {
  const tripId = document.getElementById('tripSelect').value;
  const notes = document.getElementById('destNotes').value;

  addDestination(tripId, countryName, notes);
  closeModal();
  showToast(`Added ${countryName} to trip!`, 'success');
}

// ========== ROUTING ==========
function navigateTo(page, param = null) {
  state.currentPage = page;

  if (page === 'itinerary' && param) {
    state.currentTripId = param;
    window.location.hash = `itinerary/${param}`;
  } else {
    window.location.hash = page;
  }

  render();
}

function handleRouteChange() {
  const hash = window.location.hash.slice(1) || 'home';
  const parts = hash.split('/');

  state.currentPage = parts[0];

  if (parts[0] === 'itinerary' && parts[1]) {
    state.currentTripId = parts[1];
  }

  render();
}

// ========== RENDERING ==========
function render() {
  document.querySelectorAll('.page-container').forEach(p => p.classList.add('hidden'));
  document.querySelectorAll('.nav-link').forEach(link => {
    link.classList.toggle('active', link.dataset.page === state.currentPage);
  });

  if (state.currentPage === 'home') {
    renderHome();
  } else if (state.currentPage === 'itinerary' && state.currentTripId) {
    renderTripDetail(state.currentTripId);
  } else if (state.currentPage === 'explore') {
    renderExplore();
  } else if (state.currentPage === 'profile') {
    renderProfile();
  }

  updateXPBar();
}

function renderHome() {
  document.getElementById('homePage').classList.remove('hidden');
  const grid = document.getElementById('tripsGrid');

  if (state.trips.length === 0) {
    grid.innerHTML = `
      <div class="empty-state" style="grid-column: 1 / -1;">
        <div class="empty-icon">🎒</div>
        <h3 class="empty-title">No trips yet</h3>
        <p class="empty-message">Start planning your first adventure!</p>
        <button class="btn btn-primary" onclick="showCreateTripModal()">Create Trip</button>
      </div>
    `;
    return;
  }

  grid.innerHTML = state.trips.map(trip => `
    <div class="card trip-card">
      <div class="card-header">
        <h3 class="card-title">${sanitizeHTML(trip.name)}</h3>
        <p class="card-subtitle">${formatDate(trip.startDate)} - ${formatDate(trip.endDate)}</p>
      </div>
      <div class="card-body">
        <p>${sanitizeHTML(trip.description || 'No description')}</p>
        <div class="trip-stats">
          <div class="trip-stat">
            <span class="trip-stat-icon">📍</span>
            <span>${trip.destinations.length} destinations</span>
          </div>
          <div class="trip-stat">
            <span class="trip-stat-icon">💰</span>
            <span>${trip.budget.expenses.length} expenses</span>
          </div>
        </div>
      </div>
      <div class="card-footer">
        <button class="btn btn-sm btn-outline" onclick="navigateTo('itinerary', '${trip.id}')">View</button>
        <button class="btn btn-sm btn-danger" onclick="deleteTrip('${trip.id}')">Delete</button>
      </div>
    </div>
  `).join('');
}

function renderTripDetail(tripId) {
  const trip = getTripById(tripId);
  if (!trip) {
    navigateTo('home');
    return;
  }

  document.getElementById('tripDetailPage').classList.remove('hidden');

  document.getElementById('tripHeader').innerHTML = `
    <div class="card card-dark">
      <h1 style="color: var(--text-light); margin-bottom: 1rem;">${sanitizeHTML(trip.name)}</h1>
      <p style="color: var(--mint); margin-bottom: 1rem;">${formatDate(trip.startDate)} - ${formatDate(trip.endDate)}</p>
      <p style="color: var(--text-light);">${sanitizeHTML(trip.description || 'No description')}</p>
      <div style="margin-top: 1rem; display: flex; gap: 0.5rem;">
        <button class="btn btn-sm btn-primary" onclick="shareTrip('${trip.id}')">🔗 Share</button>
        <button class="btn btn-sm btn-danger" onclick="deleteTrip('${trip.id}')">Delete Trip</button>
      </div>
    </div>
  `;

  renderOverviewTab(trip);
}

function renderOverviewTab(trip) {
  document.getElementById('overviewTab').innerHTML = `
    <div class="card">
      <div class="card-header flex-between">
        <h3>Destinations <span class="badge">${trip.destinations.length}</span></h3>
        <button class="btn btn-sm btn-primary" onclick="showAddDestinationModal('${trip.id}')">+ Add</button>
      </div>
      <div class="card-body">
        ${trip.destinations.length === 0 ? `
          <div class="empty-state">
            <div class="empty-icon">📍</div>
            <p class="empty-message">No destinations added yet</p>
          </div>
        ` : `
          <div class="destination-list">
            ${trip.destinations.map((dest, i) => `
              <div class="destination-item">
                <div class="destination-info">
                  <div class="destination-name">${sanitizeHTML(dest.name)}</div>
                  ${dest.notes ? `<div class="destination-notes">${sanitizeHTML(dest.notes)}</div>` : ''}
                </div>
                <div class="destination-actions">
                  <button class="btn btn-sm btn-icon btn-outline" onclick="showEditDestinationModal('${trip.id}', ${i}, '${sanitizeHTML(dest.name).replace(/'/g, "\\'")}', '${sanitizeHTML(dest.notes).replace(/'/g, "\\'")}')" title="Edit">✏️</button>
                  <button class="btn btn-sm btn-icon btn-danger" onclick="deleteDestination('${trip.id}', ${i})" title="Delete">🗑️</button>
                </div>
              </div>
            `).join('')}
          </div>
        `}
      </div>
    </div>
  `;
}

function renderBudgetTab(trip) {
  const total = trip.budget.total || 0;
  const spent = trip.budget.expenses.reduce((sum, e) => sum + e.amount, 0);
  const remaining = total - spent;
  const percentage = total > 0 ? (spent / total) * 100 : 0;

  document.getElementById('budgetTab').innerHTML = `
    <div class="card">
      <div class="card-header">
        <h3>Budget Overview</h3>
        ${total === 0 ? `<button class="btn btn-sm btn-primary" onclick="showSetBudgetModal('${trip.id}')">Set Budget</button>` : ''}
      </div>
      <div class="card-body">
        ${total > 0 ? `
          <div class="mb-lg">
            <div class="flex-between mb-sm">
              <span>Budget: ${formatCurrency(total, trip.budget.currency)}</span>
              <span>Spent: ${formatCurrency(spent, trip.budget.currency)}</span>
            </div>
            <div class="progress-bar">
              <div class="progress-fill" style="width: ${Math.min(percentage, 100)}%"></div>
            </div>
            <p class="progress-text">${remaining >= 0 ? `${formatCurrency(remaining, trip.budget.currency)} remaining` : `Over budget by ${formatCurrency(-remaining, trip.budget.currency)}`}</p>
          </div>
        ` : '<p class="empty-message">Set a budget to track expenses</p>'}
        
        <div class="flex-between mb-md">
          <h4>Expenses</h4>
          <button class="btn btn-sm btn-primary" onclick="showAddExpenseModal('${trip.id}')">+ Add Expense</button>
        </div>
        
        ${trip.budget.expenses.length === 0 ? `
          <div class="empty-state">
            <div class="empty-icon">💳</div>
            <p class="empty-message">No expenses tracked yet</p>
          </div>
        ` : `
          <div class="expense-list">
            ${trip.budget.expenses.map((exp, i) => `
              <div class="expense-item">
                <div class="expense-info">
                  <div class="expense-icon">${getCategoryIcon(exp.category)}</div>
                  <div class="expense-details">
                    <div class="expense-description">${sanitizeHTML(exp.description)}</div>
                    <div class="expense-meta">${exp.category} • ${formatDate(exp.date)}</div>
                  </div>
                </div>
                <div class="expense-amount">${formatCurrency(exp.amount, trip.budget.currency)}</div>
                <button class="btn btn-sm btn-icon btn-danger" onclick="deleteExpense('${trip.id}', ${i})">🗑️</button>
              </div>
            `).join('')}
          </div>
        `}
      </div>
    </div>
  `;
}

function renderMapTab(trip) {
  document.getElementById('mapTab').innerHTML = `
    <div id="mapContainer" class="map-container"></div>
    <div id="mapInfo" class="map-info"></div>
  `;

  setTimeout(() => initializeMap(trip), 100);
}

function renderPackingTab(trip) {
  const categories = ['Documents', 'Clothing', 'Toiletries', 'Electronics', 'Other'];
  const categoryIcons = { Documents: '📄', Clothing: '👕', Toiletries: '🧴', Electronics: '🔌', Other: '📦' };

  const totalItems = trip.packingList.length;
  const checkedItems = trip.packingList.filter(item => item.checked).length;
  const progress = totalItems > 0 ? (checkedItems / totalItems) * 100 : 0;

  document.getElementById('packingTab').innerHTML = `
    <div class="card">
      <div class="card-header">
        <h3>Packing List</h3>
        <div style="display: flex; gap: 0.5rem;">
          <button class="btn btn-sm btn-outline" onclick="addSmartSuggestions('${trip.id}')">✨ Smart Suggestions</button>
          <button class="btn btn-sm btn-primary" onclick="showAddPackingItemModal('${trip.id}')">+ Add Item</button>
        </div>
      </div>
      <div class="card-body">
        ${totalItems > 0 ? `
          <div class="mb-lg">
            <div class="progress-bar">
              <div class="progress-fill" style="width: ${progress}%"></div>
            </div>
            <p class="progress-text">${checkedItems} of ${totalItems} items packed</p>
          </div>
        ` : ''}
        
        ${totalItems === 0 ? `
          <div class="empty-state">
            <div class="empty-icon">🎒</div>
            <p class="empty-message">No packing items yet</p>
          </div>
        ` : `
          <div class="packing-list">
            ${categories.map(cat => {
    const items = trip.packingList.filter(item => item.category === cat);
    if (items.length === 0) return '';

    return `
                <div class="packing-category">
                  <div class="packing-category-title">${categoryIcons[cat]} ${cat}</div>
                  <div class="packing-items">
                    ${items.map((item, i) => {
      const globalIndex = trip.packingList.indexOf(item);
      return `
                        <div class="packing-item ${item.checked ? 'checked' : ''}">
                          <input type="checkbox" class="packing-checkbox" ${item.checked ? 'checked' : ''} 
                            onchange="togglePackingItem('${trip.id}', ${globalIndex})">
                          <span class="packing-item-text">${sanitizeHTML(item.item)}</span>
                          <button class="btn btn-sm btn-icon btn-danger" onclick="deletePackingItem('${trip.id}', ${globalIndex})">🗑️</button>
                        </div>
                      `;
    }).join('')}
                  </div>
                </div>
              `;
  }).join('')}
          </div>
        `}
      </div>
    </div>
  `;
}

function renderDocumentsTab(trip) {
  const typeIcons = { Passport: '🛂', Visa: '📋', Insurance: '🏥', Ticket: '🎫', Other: '📄' };

  document.getElementById('documentsTab').innerHTML = `
    <div class="card">
      <div class="card-header flex-between">
        <h3>Documents <span class="badge">${trip.documents.length}</span></h3>
        <button class="btn btn-sm btn-primary" onclick="showUploadDocumentModal('${trip.id}')">+ Upload</button>
      </div>
      <div class="card-body">
        ${trip.documents.length === 0 ? `
          <div class="empty-state">
            <div class="empty-icon">📄</div>
            <p class="empty-message">No documents uploaded yet</p>
          </div>
        ` : `
          <div class="document-list">
            ${trip.documents.map((doc, i) => `
              <div class="document-item">
                <div class="document-icon-large">${typeIcons[doc.type] || '📄'}</div>
                <div class="document-name">${sanitizeHTML(doc.name)}</div>
                <div class="document-meta">${doc.type} • ${(doc.size / 1024).toFixed(1)} KB</div>
                <div class="document-actions">
                  <button class="btn btn-sm btn-outline" onclick='downloadDocument(${JSON.stringify(doc)})'>Download</button>
                  <button class="btn btn-sm btn-danger" onclick="deleteDocument('${trip.id}', ${i})">Delete</button>
                </div>
              </div>
            `).join('')}
          </div>
        `}
      </div>
    </div>
  `;
}

function renderExplore() {
  document.getElementById('explorePage').classList.remove('hidden');
  searchCountries('');
}

function renderProfile() {
  document.getElementById('profilePage').classList.remove('hidden');

  const level = state.profile.level;
  const xpInLevel = state.profile.xp % 1000;

  document.getElementById('profileLevel').textContent = `Level ${level} Explorer`;
  document.getElementById('profileXP').textContent = `${xpInLevel} / 1000 XP`;

  const stats = state.profile.stats;
  document.getElementById('statsGrid').innerHTML = `
    <div class="stat-card"><div class="stat-value">${stats.totalTrips}</div><div class="stat-label">Total Trips</div></div>
    <div class="stat-card"><div class="stat-value">${stats.totalDestinations}</div><div class="stat-label">Destinations</div></div>
    <div class="stat-card"><div class="stat-value">${stats.countriesVisited}</div><div class="stat-label">Countries</div></div>
    <div class="stat-card"><div class="stat-value">${stats.totalExpenses}</div><div class="stat-label">Expenses Tracked</div></div>
  `;

  const achievementsHTML = Object.values(ACHIEVEMENTS).map(ach => {
    const unlocked = state.profile.achievements.includes(ach.id);
    return `
      <div class="achievement-item ${unlocked ? 'unlocked' : 'locked'}">
        <div class="achievement-item-icon">${ach.icon}</div>
        <div class="achievement-item-name">${ach.name}</div>
        <div class="achievement-item-description">${ach.description}</div>
        <div class="achievement-item-xp">+${ach.xp} XP</div>
      </div>
    `;
  }).join('');

  document.getElementById('achievementsGrid').innerHTML = achievementsHTML;
}

// ========== MODAL HELPERS ==========
function showCreateTripModal() {
  showModal('Create New Trip', `
    <div class="form-group">
      <label class="form-label">Trip Name</label>
      <input type="text" id="tripName" class="form-input" placeholder="Summer in Europe" required>
    </div>
    <div class="form-group">
      <label class="form-label">Description</label>
      <textarea id="tripDesc" class="form-textarea" placeholder="Describe your adventure..."></textarea>
    </div>
    <div class="form-group">
      <label class="form-label">Start Date</label>
      <input type="date" id="tripStart" class="form-input" required>
    </div>
    <div class="form-group">
      <label class="form-label">End Date</label>
      <input type="date" id="tripEnd" class="form-input" required>
    </div>
  `, [
    { label: 'Cancel', class: 'btn-secondary', onclick: 'closeModal()' },
    { label: 'Create', class: 'btn-primary', onclick: 'submitCreateTrip()' }
  ]);
}

function submitCreateTrip() {
  const name = document.getElementById('tripName').value.trim();
  const desc = document.getElementById('tripDesc').value.trim();
  const start = document.getElementById('tripStart').value;
  const end = document.getElementById('tripEnd').value;

  if (!name || !start || !end) {
    showToast('Please fill required fields', 'error');
    return;
  }

  createTrip(name, desc, start, end);
}

function showAddDestinationModal(tripId) {
  showModal('Add Destination', `
    <div class="form-group">
      <label class="form-label">Destination Name</label>
      <input type="text" id="destName" class="form-input" placeholder="Paris" required>
    </div>
    <div class="form-group">
      <label class="form-label">Notes (optional)</label>
      <input type="text" id="destNotes" class="form-input" placeholder="Visit Eiffel Tower">
    </div>
  `, [
    { label: 'Cancel', class: 'btn-secondary', onclick: 'closeModal()' },
    { label: 'Add', class: 'btn-primary', onclick: `submitAddDestination('${tripId}')` }
  ]);
}

function submitAddDestination(tripId) {
  const name = document.getElementById('destName').value.trim();
  const notes = document.getElementById('destNotes').value.trim();

  if (!name) {
    showToast('Enter destination name', 'error');
    return;
  }

  addDestination(tripId, name, notes);
  closeModal();
}

function showSetBudgetModal(tripId) {
  showModal('Set Budget', `
    <div class="form-group">
      <label class="form-label">Total Budget</label>
      <input type="number" id="budgetAmount" class="form-input" placeholder="5000" required>
    </div>
    <div class="form-group">
      <label class="form-label">Currency</label>
      <select id="budgetCurrency" class="form-select">
        <option>USD</option><option>EUR</option><option>GBP</option><option>JPY</option><option>CAD</option>
      </select>
    </div>
  `, [
    { label: 'Cancel', class: 'btn-secondary', onclick: 'closeModal()' },
    { label: 'Set', class: 'btn-primary', onclick: `submitSetBudget('${tripId}')` }
  ]);
}

function submitSetBudget(tripId) {
  const amount = document.getElementById('budgetAmount').value;
  const currency = document.getElementById('budgetCurrency').value;

  if (!amount || amount <= 0) {
    showToast('Enter valid amount', 'error');
    return;
  }

  setBudget(tripId, amount, currency);
  closeModal();
}

function showAddExpenseModal(tripId) {
  showModal('Add Expense', `
    <div class="form-group">
      <label class="form-label">Amount</label>
      <input type="number" id="expAmount" class="form-input" placeholder="150" required>
    </div>
    <div class="form-group">
      <label class="form-label">Category</label>
      <select id="expCategory" class="form-select">
        <option>Flights</option><option>Hotels</option><option>Food</option>
        <option>Activities</option><option>Shopping</option><option>Transport</option><option>Other</option>
      </select>
    </div>
    <div class="form-group">
      <label class="form-label">Description</label>
      <input type="text" id="expDesc" class="form-input" placeholder="Hotel night" required>
    </div>
    <div class="form-group">
      <label class="form-label">Date</label>
      <input type="date" id="expDate" class="form-input" required>
    </div>
  `, [
    { label: 'Cancel', class: 'btn-secondary', onclick: 'closeModal()' },
    { label: 'Add', class: 'btn-primary', onclick: `submitAddExpense('${tripId}')` }
  ]);
}

function submitAddExpense(tripId) {
  const amount = document.getElementById('expAmount').value;
  const category = document.getElementById('expCategory').value;
  const desc = document.getElementById('expDesc').value.trim();
  const date = document.getElementById('expDate').value;

  if (!amount || !desc || !date) {
    showToast('Fill all fields', 'error');
    return;
  }

  addExpense(tripId, amount, category, desc, date);
  closeModal();
}

function showAddPackingItemModal(tripId) {
  showModal('Add Packing Item', `
    <div class="form-group">
      <label class="form-label">Category</label>
      <select id="packCategory" class="form-select">
        <option>Documents</option><option>Clothing</option><option>Toiletries</option>
        <option>Electronics</option><option>Other</option>
      </select>
    </div>
    <div class="form-group">
      <label class="form-label">Item</label>
      <input type="text" id="packItem" class="form-input" placeholder="Passport" required>
    </div>
  `, [
    { label: 'Cancel', class: 'btn-secondary', onclick: 'closeModal()' },
    { label: 'Add', class: 'btn-primary', onclick: `submitAddPackingItem('${tripId}')` }
  ]);
}

function submitAddPackingItem(tripId) {
  const category = document.getElementById('packCategory').value;
  const item = document.getElementById('packItem').value.trim();

  if (!item) {
    showToast('Enter item name', 'error');
    return;
  }

  addPackingItem(tripId, category, item);
  closeModal();
}

function showUploadDocumentModal(tripId) {
  showModal('Upload Document', `
    <div class="form-group">
      <label class="form-label">Document Type</label>
      <select id="docType" class="form-select">
        <option>Passport</option><option>Visa</option><option>Insurance</option>
        <option>Ticket</option><option>Other</option>
      </select>
    </div>
    <div class="form-group">
      <label class="form-label">File (max 2MB)</label>
      <input type="file" id="docFile" class="form-input" accept=".pdf,.jpg,.jpeg,.png" required>
    </div>
  `, [
    { label: 'Cancel', class: 'btn-secondary', onclick: 'closeModal()' },
    { label: 'Upload', class: 'btn-primary', onclick: `submitUploadDocument('${tripId}')` }
  ]);
}

function submitUploadDocument(tripId) {
  const type = document.getElementById('docType').value;
  const file = document.getElementById('docFile').files[0];

  if (!file) {
    showToast('Select a file', 'error');
    return;
  }

  uploadDocument(tripId, file, type);
  closeModal();
}

function shareTrip(tripId) {
  const trip = getTripById(tripId);
  if (!trip) return;

  const text = `Check out my trip: ${trip.name}!`;

  if (navigator.share) {
    navigator.share({ title: trip.name, text }).catch(() => { });
  } else {
    navigator.clipboard.writeText(text);
    showToast('Trip info copied to clipboard!', 'success');
  }
}

// ========== TAB SWITCHING ==========
function switchTab(tripId, tabName) {
  state.currentTab = tabName;

  document.querySelectorAll('.tab').forEach(tab => {
    tab.classList.toggle('active', tab.dataset.tab === tabName);
  });

  document.querySelectorAll('.tab-content').forEach(content => {
    content.classList.remove('active');
  });

  const trip = getTripById(tripId);
  if (!trip) return;

  if (tabName === 'overview') {
    document.getElementById('overviewTab').classList.add('active');
    renderOverviewTab(trip);
  } else if (tabName === 'budget') {
    document.getElementById('budgetTab').classList.add('active');
    renderBudgetTab(trip);
  } else if (tabName === 'map') {
    document.getElementById('mapTab').classList.add('active');
    renderMapTab(trip);
  } else if (tabName === 'packing') {
    document.getElementById('packingTab').classList.add('active');
    renderPackingTab(trip);
  } else if (tabName === 'documents') {
    document.getElementById('documentsTab').classList.add('active');
    renderDocumentsTab(trip);
  }
}

// ========== INITIALIZATION ==========
document.addEventListener('DOMContentLoaded', () => {
  loadData();

  window.addEventListener('hashchange', handleRouteChange);

  document.getElementById('createTripBtn').addEventListener('click', showCreateTripModal);
  document.getElementById('createTripBtn2').addEventListener('click', showCreateTripModal);

  document.getElementById('tripTabs').addEventListener('click', (e) => {
    if (e.target.classList.contains('tab')) {
      switchTab(state.currentTripId, e.target.dataset.tab);
    }
  });

  let searchTimeout;
  document.getElementById('countrySearch').addEventListener('input', (e) => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => searchCountries(e.target.value), 500);
  });

  document.getElementById('modalOverlay').addEventListener('click', (e) => {
    if (e.target.id === 'modalOverlay') closeModal();
  });

  handleRouteChange();
});
// ========== EDIT DESTINATION MODAL ==========
function showEditDestinationModal(tripId, index, currentName, currentNotes) {
  showModal('Edit Destination', `
    <div class="form-group">
      <label class="form-label">Destination Name</label>
      <input type="text" id="editDestName" class="form-input" value="${currentName}" required>
    </div>
    <div class="form-group">
      <label class="form-label">Notes (optional)</label>
      <input type="text" id="editDestNotes" class="form-input" value="${currentNotes}">
    </div>
  `, [
    { label: 'Cancel', class: 'btn-secondary', onclick: 'closeModal()' },
    { label: 'Save', class: 'btn-primary', onclick: `submitEditDestination('${tripId}', ${index})` }
  ]);
}

function submitEditDestination(tripId, index) {
  const name = document.getElementById('editDestName').value.trim();
  const notes = document.getElementById('editDestNotes').value.trim();
  if (!name) {
    showToast('Enter destination name', 'error');
    return;
  }
  updateDestination(tripId, index, name, notes);
  closeModal();
}

