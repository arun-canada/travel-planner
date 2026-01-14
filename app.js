// TripFlow - Travel Planning PWA
// Complete Application Logic

// ========== STATE MANAGEMENT ==========
const state = {
  currentPage: 'home',
  currentTripId: null,
  currentTab: 'overview',
  trips: [],
  chatHistory: [],
  chatbotContext: {},
  tripPlannerState: {},
  activeFilters: { budget: 'all', season: 'all', vibes: [] },
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

// ========== COMPREHENSIVE DESTINATION DATABASE ==========
const DESTINATION_DATABASE = [
  { id: 'bali', name: 'Bali', country: 'Indonesia', budget: 'budget', climate: ['tropical', 'warm'], vibe: ['beach', 'cultural', 'relaxing'], activities: ['surfing', 'temples', 'yoga'], group: ['solo', 'couples'], months: [4, 5, 6, 7, 8, 9], coords: [-8.3405, 115.0920], desc: 'Tropical paradise with beautiful beaches and ancient temples' },
  { id: 'tokyo', name: 'Tokyo', country: 'Japan', budget: 'mid', climate: ['temperate'], vibe: ['cultural', 'nightlife', 'adventure'], activities: ['food', 'shopping', 'museums'], group: ['solo', 'couples', 'friends'], months: [3, 4, 5, 9, 10, 11], coords: [35.6762, 139.6503], desc: 'Vibrant metropolis blending tradition and cutting-edge modernity' },
  { id: 'paris', name: 'Paris', country: 'France', budget: 'luxury', climate: ['temperate'], vibe: ['cultural', 'luxury', 'romantic'], activities: ['museums', 'food', 'architecture'], group: ['couples', 'friends'], months: [4, 5, 6, 9, 10], coords: [48.8566, 2.3522], desc: 'The City of Light, famous for art, fashion, and romance' },
  { id: 'bangkok', name: 'Bangkok', country: 'Thailand', budget: 'budget', climate: ['tropical', 'hot'], vibe: ['cultural', 'nightlife', 'adventure'], activities: ['food', 'temples', 'shopping'], group: ['solo', 'friends', 'couples'], months: [11, 12, 1, 2], coords: [13.7563, 100.5018], desc: 'Bustling capital with ornate shrines and vibrant street life' },
  { id: 'barcelona', name: 'Barcelona', country: 'Spain', budget: 'mid', climate: ['mediterranean'], vibe: ['beach', 'cultural', 'nightlife'], activities: ['architecture', 'beach', 'food'], group: ['friends', 'couples'], months: [5, 6, 9, 10], coords: [41.3851, 2.1734], desc: 'Mediterranean gem with stunning architecture and beach vibes' },
  { id: 'dubai', name: 'Dubai', country: 'UAE', budget: 'luxury', climate: ['desert', 'hot'], vibe: ['luxury', 'adventure'], activities: ['shopping', 'desert', 'architecture'], group: ['couples', 'families'], months: [11, 12, 1, 2, 3], coords: [25.2048, 55.2708], desc: 'Futuristic city with luxury shopping and modern architecture' },
  { id: 'iceland', name: 'Reykjavik', country: 'Iceland', budget: 'luxury', climate: ['cold'], vibe: ['adventure', 'nature'], activities: ['hiking', 'nature', 'photography'], group: ['couples', 'friends'], months: [6, 7, 8], coords: [64.1466, -21.9426], desc: 'Land of fire and ice with stunning natural phenomena' },
  { id: 'rome', name: 'Rome', country: 'Italy', budget: 'mid', climate: ['mediterranean'], vibe: ['cultural', 'romantic'], activities: ['museums', 'food', 'architecture'], group: ['couples', 'families'], months: [4, 5, 6, 9, 10], coords: [41.9028, 12.4964], desc: 'Eternal City packed with ancient ruins and Renaissance art' },
  { id: 'marrakech', name: 'Marrakech', country: 'Morocco', budget: 'budget', climate: ['desert', 'hot'], vibe: ['cultural', 'adventure'], activities: ['markets', 'food', 'desert'], group: ['couples', 'friends'], months: [3, 4, 5, 10, 11], coords: [31.6295, -7.9811], desc: 'Exotic city with colorful souks and desert adventures' },
  { id: 'nyc', name: 'New York', country: 'USA', budget: 'luxury', climate: ['temperate'], vibe: ['cultural', 'nightlife', 'urban'], activities: ['museums', 'food', 'shopping'], group: ['solo', 'friends'], months: [4, 5, 6, 9, 10], coords: [40.7128, -74.0060], desc: 'The city that never sleeps, cultural melting pot' },
  { id: 'santorini', name: 'Santorini', country: 'Greece', budget: 'luxury', climate: ['mediterranean'], vibe: ['beach', 'romantic', 'relaxing'], activities: ['beach', 'food', 'photography'], group: ['couples'], months: [5, 6, 7, 8, 9], coords: [36.3932, 25.4615], desc: 'Stunning island with white-washed buildings and sunsets' },
  { id: 'prague', name: 'Prague', country: 'Czech Republic', budget: 'budget', climate: ['temperate'], vibe: ['cultural', 'historical'], activities: ['architecture', 'food', 'museums'], group: ['friends', 'couples'], months: [4, 5, 6, 9, 10], coords: [50.0755, 14.4378], desc: 'Fairy-tale city with Gothic architecture and rich history' },
  { id: 'singapore', name: 'Singapore', country: 'Singapore', budget: 'mid', climate: ['tropical'], vibe: ['urban', 'food', 'cultural'], activities: ['food', 'shopping', 'gardens'], group: ['families', 'couples'], months: [1, 2, 3, 4, 7, 8], coords: [1.3521, 103.8198], desc: 'Modern city-state known for its gardens and cuisine' },
  { id: 'lisbon', name: 'Lisbon', country: 'Portugal', budget: 'budget', climate: ['mediterranean'], vibe: ['cultural', 'beach', 'relaxing'], activities: ['food', 'architecture', 'beach'], group: ['couples', 'solo'], months: [4, 5, 6, 9, 10], coords: [38.7223, -9.1393], desc: 'Charming coastal capital with hills and historic trams' },
  { id: 'sydney', name: 'Sydney', country: 'Australia', budget: 'mid', climate: ['temperate'], vibe: ['beach', 'urban', 'adventure'], activities: ['beach', 'food', 'outdoors'], group: ['friends', 'families'], months: [12, 1, 2, 3], coords: [-33.8688, 151.2093], desc: 'Harbor city famous for opera house and beaches' },
  { id: 'maldives', name: 'Maldives', country: 'Maldives', budget: 'luxury', climate: ['tropical'], vibe: ['beach', 'relaxing', 'luxury'], activities: ['diving', 'beach', 'spa'], group: ['couples'], months: [11, 12, 1, 2, 3, 4], coords: [3.2028, 73.2207], desc: 'Tropical paradise with overwater bungalows' },
  { id: 'amsterdam', name: 'Amsterdam', country: 'Netherlands', budget: 'mid', climate: ['temperate'], vibe: ['cultural', 'nightlife'], activities: ['museums', 'cycling', 'canals'], group: ['friends', 'solo'], months: [4, 5, 6, 9], coords: [52.3676, 4.9041], desc: 'Canal city with world-class museums and cycling culture' },
  { id: 'cusco', name: 'Cusco', country: 'Peru', budget: 'budget', climate: ['temperate'], vibe: ['adventure', 'cultural'], activities: ['hiking', 'ruins', 'culture'], group: ['friends', 'solo'], months: [5, 6, 7, 8, 9], coords: [-13.5319, -71.9675], desc: 'Gateway to Machu Picchu and ancient Incan culture' },
  { id: 'seoul', name: 'Seoul', country: 'South Korea', budget: 'mid', climate: ['temperate'], vibe: ['urban', 'cultural', 'food'], activities: ['food', 'shopping', 'tech'], group: ['friends', 'solo'], months: [3, 4, 5, 9, 10, 11], coords: [37.5665, 126.9780], desc: 'High-tech capital with traditional palaces and K-culture' },
  { id: 'cairo', name: 'Cairo', country: 'Egypt', budget: 'budget', climate: ['desert', 'hot'], vibe: ['historical', 'adventure'], activities: ['pyramids', 'museums', 'history'], group: ['families', 'couples'], months: [10, 11, 12, 1, 2, 3], coords: [30.0444, 31.2357], desc: 'Ancient city home to the Pyramids of Giza' },
  { id: 'vancouver', name: 'Vancouver', country: 'Canada', budget: 'mid', climate: ['temperate'], vibe: ['nature', 'urban', 'adventure'], activities: ['hiking', 'skiing', 'food'], group: ['friends', 'families'], months: [6, 7, 8, 9], coords: [49.2827, -123.1207], desc: 'Mountain-meets-ocean city with outdoor adventures' },
  { id: 'istanbul', name: 'Istanbul', country: 'Turkey', budget: 'budget', climate: ['temperate'], vibe: ['cultural', 'historical', 'food'], activities: ['mosques', 'markets', 'food'], group: ['couples', 'families'], months: [4, 5, 6, 9, 10], coords: [41.0082, 28.9784], desc: 'City spanning two continents with rich history' },
  { id: 'croatia', name: 'Dubrovnik', country: 'Croatia', budget: 'mid', climate: ['mediterranean'], vibe: ['beach', 'cultural', 'relaxing'], activities: ['beach', 'history', 'sailing'], group: ['couples', 'friends'], months: [5, 6, 7, 8, 9], coords: [42.6507, 18.0944], desc: 'Pearl of the Adriatic with medieval walls' },
  { id: 'capetown', name: 'Cape Town', country: 'South Africa', budget: 'mid', climate: ['temperate'], vibe: ['adventure', 'nature', 'beach'], activities: ['hiking', 'wine', 'beach'], group: ['couples', 'friends'], months: [11, 12, 1, 2, 3], coords: [-33.9249, 18.4241], desc: 'Stunning coastal city beneath Table Mountain' },
  { id: 'buenosaires', name: 'Buenos Aires', country: 'Argentina', budget: 'budget', climate: ['temperate'], vibe: ['cultural', 'nightlife', 'food'], activities: ['tango', 'food', 'culture'], group: ['couples', 'solo'], months: [10, 11, 12, 1, 2, 3], coords: [-34.6037, -58.3816], desc: 'Passionate city known for tango and steak' },
  { id: 'newzealand', name: 'Queenstown', country: 'New Zealand', budget: 'mid', climate: ['temperate'], vibe: ['adventure', 'nature'], activities: ['hiking', 'skiing', 'adventure'], group: ['friends', 'couples'], months: [12, 1, 2, 6, 7, 8], coords: [-45.0312, 168.6626], desc: 'Adventure capital with stunning mountain scenery' },
  { id: 'croatia2', name: 'Split', country: 'Croatia', budget: 'budget', climate: ['mediterranean'], vibe: ['beach', 'cultural'], activities: ['beach', 'history', 'islands'], group: ['friends', 'couples'], months: [5, 6, 7, 8, 9], coords: [43.5081, 16.4402], desc: 'Coastal city with Roman palace and island hopping' },
  { id: 'edinburgh', name: 'Edinburgh', country: 'Scotland', budget: 'mid', climate: ['temperate', 'cool'], vibe: ['cultural', 'historical'], activities: ['castles', 'whisky', 'culture'], group: ['couples', 'solo'], months: [5, 6, 7, 8], coords: [55.9533, -3.1883], desc: 'Historic Scottish capital with castle and festivals' },
  { id: 'vienna', name: 'Vienna', country: 'Austria', budget: 'mid', climate: ['temperate'], vibe: ['cultural', 'romantic'], activities: ['music', 'museums', 'coffeehouses'], group: ['couples', 'families'], months: [4, 5, 6, 9, 10], coords: [48.2082, 16.3738], desc: 'Imperial city of classical music and elegant coffee houses' },
  { id: 'florence', name: 'Florence', country: 'Italy', budget: 'mid', climate: ['mediterranean'], vibe: ['cultural', 'romantic', 'art'], activities: ['museums', 'food', 'art'], group: ['couples', 'families'], months: [4, 5, 6, 9, 10], coords: [43.7696, 11.2558], desc: 'Cradle of the Renaissance with world-class art' },
  { id: 'costarica', name: 'San José', country: 'Costa Rica', budget: 'budget', climate: ['tropical'], vibe: ['adventure', 'nature', 'beach'], activities: ['wildlife', 'hiking', 'beaches'], group: ['families', 'friends'], months: [12, 1, 2, 3, 4], coords: [9.9281, -84.0907], desc: 'Biodiverse country with rainforests and beaches' },
  { id: 'copenhagen', name: 'Copenhagen', country: 'Denmark', budget: 'luxury', climate: ['temperate', 'cool'], vibe: ['cultural', 'urban'], activities: ['cycling', 'food', 'design'], group: ['couples', 'solo'], months: [5, 6, 7, 8, 9], coords: [55.6761, 12.5683], desc: 'Design-forward city with cycling culture and hygge' },
  { id: 'bali2', name: 'Ubud', country: 'Indonesia', budget: 'budget', climate: ['tropical'], vibe: ['cultural', 'relaxing', 'nature'], activities: ['yoga', 'temples', 'rice terraces'], group: ['solo', 'couples'], months: [4, 5, 6, 7, 8, 9], coords: [-8.5069, 115.2625], desc: 'Cultural heart of Bali with rice paddies and wellness' },
  { id: 'mexico', name: 'Mexico City', country: 'Mexico', budget: 'budget', climate: ['temperate'], vibe: ['cultural', 'food', 'urban'], activities: ['food', 'museums', 'markets'], group: ['friends', 'couples'], months: [11, 12, 1, 2, 3, 4], coords: [19.4326, -99.1332], desc: 'Vibrant capital with ancient ruins and amazing food' },
  { id: 'athens', name: 'Athens', country: 'Greece', budget: 'budget', climate: ['mediterranean'], vibe: ['historical', 'cultural'], activities: ['ruins', 'museums', 'food'], group: ['families', 'couples'], months: [4, 5, 6, 9, 10], coords: [37.9838, 23.7275], desc: 'Ancient city with Acropolis and Greek history' },
  { id: 'berlin', name: 'Berlin', country: 'Germany', budget: 'budget', climate: ['temperate'], vibe: ['cultural', 'nightlife', 'urban'], activities: ['museums', 'history', 'nightlife'], group: ['friends', 'solo'], months: [5, 6, 7, 8, 9], coords: [52.5200, 13.4050], desc: 'Eclectic capital with rich history and vibrant culture' },
  { id: 'phuket', name: 'Phuket', country: 'Thailand', budget: 'budget', climate: ['tropical'], vibe: ['beach', 'nightlife', 'relaxing'], activities: ['beach', 'diving', 'islands'], group: ['couples', 'friends'], months: [11, 12, 1, 2], coords: [7.8804, 98.3923], desc: 'Thailand island paradise with beaches and nightlife' },
  { id: 'vietnam', name: 'Hanoi', country: 'Vietnam', budget: 'budget', climate: ['tropical'], vibe: ['cultural', 'food', 'adventure'], activities: ['food', 'culture', 'markets'], group: ['solo', 'friends'], months: [10, 11, 12, 1, 2, 3], coords: [21.0285, 105.8542], desc: 'Charming capital with French colonial architecture' },
  { id: 'montreal', name: 'Montreal', country: 'Canada', budget: 'mid', climate: ['temperate'], vibe: ['cultural', 'food', 'urban'], activities: ['food', 'festivals', 'culture'], group: ['friends', 'couples'], months: [6, 7, 8, 9], coords: [45.5017, -73.5673], desc: 'French-Canadian city with festivals and cuisine' },
  { id: 'peru', name: 'Lima', country: 'Peru', budget: 'budget', climate: ['coastal'], vibe: ['food', 'cultural', 'urban'], activities: ['food', 'surfing', 'museums'], group: ['solo', 'friends'], months: [12, 1, 2, 3], coords: [-12.0464, -77.0428], desc: 'Coastal capital with world-class cuisine' }
];

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

// ========== AI CHATBOT SYSTEM ==========
function initializeChatbot() {
  state.chatHistory = [];
  state.chatbotContext = {
    budget: null,
    climate: [],
    vibe: [],
    activities: [],
    group: null,
    months: [],
    askedQuestions: []
  };

  const container = document.getElementById('chatMessages');
  container.innerHTML = '';

  addChatMessage('bot', 'Hello! 👋 I\'m your AI travel assistant. I can help you find the perfect destination for your next adventure! Tell me what you\'re looking for, or I can ask you some questions to get started.');
}

function addChatMessage(sender, text, html = null) {
  const container = document.getElementById('chatMessages');
  const message = document.createElement('div');
  message.className = `chat-message ${sender}`;

  if (html) {
    message.innerHTML = html;
  } else {
    message.textContent = text;
  }

  container.appendChild(message);
  container.scrollTop = container.scrollHeight;

  state.chatHistory.push({ sender, text, timestamp: new Date() });
}

function sendChatMessage() {
  const input = document.getElementById('chatInput');
  const message = input.value.trim();

  if (!message) return;

  addChatMessage('user', message);
  input.value = '';

  // Show typing indicator
  showTypingIndicator();

  // Process message after delay
  setTimeout(() => {
    hideTypingIndicator();
    processChatbotResponse(message);
  }, 800 + Math.random() * 400);
}

function showTypingIndicator() {
  const container = document.getElementById('chatMessages');
  const indicator = document.createElement('div');
  indicator.className = 'chat-typing-indicator';
  indicator.id = 'typingIndicator';
  indicator.innerHTML = '<span></span><span></span><span></span>';
  container.appendChild(indicator);
  container.scrollTop = container.scrollHeight;
}

function hideTypingIndicator() {
  const indicator = document.getElementById('typingIndicator');
  if (indicator) indicator.remove();
}

function processChatbotResponse(userMessage) {
  const lower = userMessage.toLowerCase();
  const ctx = state.chatbotContext;

  // Extract numeric budget first (e.g., "5000", "$5000", "5,000")
  const budgetMatch = userMessage.match(/\$?\s*(\d+(?:,\d{3})*(?:\.\d{2})?)/);
  if (budgetMatch && !ctx.budget) {
    const amount = parseFloat(budgetMatch[1].replace(/,/g, ''));
    // Only treat as budget if it's a reasonable trip budget (>= 500)
    if (amount >= 500) {
      if (amount < 2000) {
        ctx.budget = 'budget';
      } else if (amount <= 6000) {
        ctx.budget = 'mid';
      } else {
        ctx.budget = 'luxury';
      }
    }
  }

  // Extract information from message
  if (!ctx.budget && (lower.includes('budget') || lower.includes('cheap') || lower.includes('expensive') || lower.includes('luxury'))) {
    if (lower.includes('budget') || lower.includes('cheap') || lower.includes('affordable')) {
      ctx.budget = 'budget';
    } else if (lower.includes('luxury') || lower.includes('expensive') || lower.includes('high-end')) {
      ctx.budget = 'luxury';
    } else {
      ctx.budget = 'mid';
    }
  }

  if (lower.includes('beach') || lower.includes('ocean') || lower.includes('coast')) ctx.vibe.push('beach');
  if (lower.includes('culture') || lower.includes('history') || lower.includes('museum')) ctx.vibe.push('cultural');
  if (lower.includes('adventure') || lower.includes('hiking') || lower.includes('outdoor')) ctx.vibe.push('adventure');
  if (lower.includes('relax') || lower.includes('calm') || lower.includes('peaceful')) ctx.vibe.push('relaxing');
  if (lower.includes('party') || lower.includes('nightlife') || lower.includes('club')) ctx.vibe.push('nightlife');

  if (lower.includes('solo')) ctx.group = 'solo';
  if (lower.includes('couple') || lower.includes('romantic')) ctx.group = 'couples';
  if (lower.includes('friend') || lower.includes('group')) ctx.group = 'friends';
  if (lower.includes('family') || lower.includes('kids')) ctx.group = 'families';

  if (lower.includes('warm') || lower.includes('hot') || lower.includes('tropical')) ctx.climate.push('tropical', 'warm');
  if (lower.includes('cold') || lower.includes('snow') || lower.includes('winter')) ctx.climate.push('cold');
  if (lower.includes('cool') || lower.includes('mild')) ctx.climate.push('temperate');

  // Check if we have enough info to recommend
  const hasEnoughInfo = ctx.budget || ctx.vibe.length > 0 || ctx.group || ctx.climate.length > 0;

  if (hasEnoughInfo) {
    // Ask follow-up or give recommendations
    const missingFields = [];
    if (!ctx.budget) missingFields.push('budget');
    if (ctx.vibe.length === 0) missingFields.push('vibe');
    if (!ctx.group) missingFields.push('group');

    if (missingFields.length > 0 && ctx.askedQuestions.length < 2) {
      askFollowUpQuestion(missingFields[0]);
    } else {
      generateRecommendations();
    }
  } else {
    // Ask initial question
    addChatMessage('bot', 'Great! Let me help you find the perfect destination. What\'s your approximate budget for this trip? (Budget-friendly, Mid-range, or Luxury)');
    ctx.askedQuestions.push('budget');
  }
}

function askFollowUpQuestion(field) {
  const ctx = state.chatbotContext;
  ctx.askedQuestions.push(field);

  const questions = {
    budget: 'What\'s your budget range for this trip? (Budget-friendly, Mid-range, or Luxury)',
    vibe: 'What kind of experience are you looking for? (Beach, Cultural, Adventure, Relaxing, Nightlife)',
    group: 'Who are you traveling with? (Solo, Couple, Friends, or Family)',
    climate: 'What kind of weather do you prefer? (Warm & Tropical, Cool & Temperate, or Cold)'
  };

  addChatMessage('bot', questions[field] || 'Tell me more about what you\'d like to do!');
}

function generateRecommendations() {
  const ctx = state.chatbotContext;
  const matches = DESTINATION_DATABASE.filter(dest => {
    let score = 0;

    if (ctx.budget && dest.budget === ctx.budget) score += 3;
    if (ctx.budget && ((ctx.budget === 'budget' && dest.budget !== 'luxury') ||
      (ctx.budget === 'luxury' && dest.budget !== 'budget'))) score += 1;

    ctx.vibe.forEach(v => {
      if (dest.vibe.includes(v)) score += 2;
    });

    ctx.climate.forEach(c => {
      if (dest.climate.includes(c)) score += 2;
    });

    if (ctx.group && dest.group.includes(ctx.group)) score += 2;

    return score > 0;
  }).sort((a, b) => {
    // Calculate scores
    let scoreA = 0, scoreB = 0;

    if (ctx.budget) {
      if (a.budget === ctx.budget) scoreA += 3;
      if (b.budget === ctx.budget) scoreB += 3;
    }
    ctx.vibe.forEach(v => {
      if (a.vibe.includes(v)) scoreA += 2;
      if (b.vibe.includes(v)) scoreB += 2;
    });

    return scoreB - scoreA;
  }).slice(0, 5);

  if (matches.length === 0) {
    addChatMessage('bot', 'Hmm, I couldn\'t find exact matches. Let me broaden the search... How about trying different criteria?');
    state.chatbotContext = { budget: null, climate: [], vibe: [], activities: [], group: null, months: [], askedQuestions: [] };
    return;
  }

  addChatMessage('bot', `Perfect! Based on what you\'ve told me, here are my top ${matches.length} recommendations for you:`);

  matches.forEach(dest => {
    const card = `
      <div class="chat-destination-card">
        <h4>${dest.name}, ${dest.country}</h4>
        <p>${dest.desc}</p>
        <div style="display: flex; gap: 0.5rem; flex-wrap: wrap; margin-bottom: 0.5rem;">
          <span style="background: rgba(31,122,90,0.1); padding: 0.25rem 0.5rem; border-radius: 4px; font-size: 0.75rem;">💰 ${dest.budget}</span>
          <span style="background: rgba(31,122,90,0.1); padding: 0.25rem 0.5rem; border-radius: 4px; font-size: 0.75rem;">${dest.vibe.slice(0, 2).join(', ')}</span>
        </div>
        <button class="btn btn-sm btn-primary" onclick="addDestinationFromChat('${dest.name}', '${dest.country}')">Add to Trip</button>
      </div>
    `;
    const container = document.getElementById('chatMessages');
    const msgDiv = document.createElement('div');
    msgDiv.className = 'chat-message bot';
    msgDiv.innerHTML = card;
    container.appendChild(msgDiv);
  });

  addChatMessage('bot', 'Would you like to refine these recommendations or start planning a complete trip for one of these destinations?');
}

function addDestinationFromChat(name, country) {
  const fullName = `${name}, ${country}`;
  if (state.trips.length === 0) {
    showToast('Create a trip first from the Home page!', 'warning');
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
    { label: 'Add', class: 'btn-primary', onclick: `confirmAddChatDestination('${fullName.replace(/'/g, "\\'")}')` }
  ]);
}

function confirmAddChatDestination(destName) {
  const tripId = document.getElementById('tripSelect').value;
  const notes = document.getElementById('destNotes').value;

  addDestination(tripId, destName, notes);
  closeModal();
  showToast(`Added ${destName} to trip!`, 'success');
}

// ========== TRIP PLANNER WIZARD ==========
let wizardStep = 1;
const wizardSteps = [
  { num: 1, label: 'Basics' },
  { num: 2, label: 'Preferences' },
  { num: 3, label: 'Budget' },
  { num: 4, label: 'Hotels' },
  { num: 5, label: 'Activities' },
  { num: 6, label: 'Health' },
  { num: 7, label: 'Review' }
];

function initializeTripPlanner() {
  wizardStep = 1;
  state.tripPlannerState = {
    budget: 0,
    currency: 'USD',
    destination: '',
    startDate: '',
    endDate: '',
    travelers: 1,
    style: 'balanced',
    pace: 'moderate',
    interests: [],
    mustDos: [],
    mobility: 'full',
    selectedHotel: null,
    selectedActivities: [],
    healthConnected: false
  };

  renderWizardSteps();
  renderWizardStep(1);
}

function renderWizardSteps() {
  const container = document.getElementById('wizardSteps');
  container.innerHTML = wizardSteps.map(step => `
    <div class="wizard-step ${step.num === wizardStep ? 'active' : ''} ${step.num < wizardStep ? 'completed' : ''}">
      <div class="wizard-step-circle">${step.num < wizardStep ? '✓' : step.num}</div>
      <div class="wizard-step-label">${step.label}</div>
    </div>
  `).join('');
}

function renderWizardStep(step) {
  const content = document.getElementById('wizardContent');
  const prevBtn = document.getElementById('wizardPrev');
  const nextBtn = document.getElementById('wizardNext');

  prevBtn.style.display = step === 1 ? 'none' : 'inline-flex';
  nextBtn.textContent = step === 7 ? 'Create Trip' : 'Next →';

  switch (step) {
    case 1:
      content.innerHTML = `
        <h3 class="mb-md">Basic Trip Details</h3>
        <div class="form-group">
          <label class="form-label">Total Budget</label>
          <input type="number" id="plannerBudget" class="form-input" placeholder="5000" value="${state.tripPlannerState.budget || ''}">
        </div>
        <div class="form-group">
          <label class="form-label">Currency</label>
          <select id="plannerCurrency" class="form-select">
            <option value="USD">USD - US Dollar</option>
            <option value="EUR">EUR - Euro</option>
            <option value="GBP">GBP - British Pound</option>
            <option value="CAD">CAD - Canadian Dollar</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Destination</label>
          <input type="text" id="plannerDestination" class="form-input" placeholder="Paris, Tokyo, Bali..." value="${state.tripPlannerState.destination || ''}">
        </div>
        <div class="form-group">
          <label class="form-label">Start Date</label>
          <input type="date" id="plannerStartDate" class="form-input" value="${state.tripPlannerState.startDate || ''}">
        </div>
        <div class="form-group">
          <label class="form-label">End Date</label>
          <input type="date" id="plannerEndDate" class="form-input" value="${state.tripPlannerState.endDate || ''}">
        </div>
        <div class="form-group">
          <label class="form-label">Number of Travelers</label>
          <input type="number" id="plannerTravelers" class="form-input" min="1" value="${state.tripPlannerState.travelers || 1}">
        </div>
      `;
      break;

    case 2:
      content.innerHTML = `
        <div class="preference-question">
          <h3>What's your travel style?</h3>
          <p style="margin-bottom: 1rem;">This helps us tailor your itinerary</p>
          <div class="preference-options">
            <button class="preference-option ${state.tripPlannerState.style === 'relaxing' ? 'selected' : ''}" onclick="selectPreference('style', 'relaxing')">
              🧘 Relaxing<br><small>Mostly downtime at hotel/spa</small>
            </button>
            <button class="preference-option ${state.tripPlannerState.style === 'balanced' ? 'selected' : ''}" onclick="selectPreference('style', 'balanced')">
              ⚖️ Balanced<br><small>Mix of activities & rest</small>
            </button>
            <button class="preference-option ${state.tripPlannerState.style === 'active' ? 'selected' : ''}" onclick="selectPreference('style', 'active')">
              🏃 Active<br><small>Packed with activities</small>
            </button>
          </div>
        </div>
        
        <div class="preference-question">
          <h3>What pace do you prefer?</h3>
          <div class="preference-options">
            <button class="preference-option ${state.tripPlannerState.pace === 'relaxed' ? 'selected' : ''}" onclick="selectPreference('pace', 'relaxed')">
              🐢 Relaxed<br><small>Take it slow</small>
            </button>
            <button class="preference-option ${state.tripPlannerState.pace === 'moderate' ? 'selected' : ''}" onclick="selectPreference('pace', 'moderate')">
              🚶 Moderate<br><small>Comfortable pace</small>
            </button>
            <button class="preference-option ${state.tripPlannerState.pace === 'packed' ? 'selected' : ''}" onclick="selectPreference('pace', 'packed')">
              🏃 Packed<br><small>See everything</small>
            </button>
          </div>
        </div>
        
        <div class="form-group">
          <label class="form-label">Interests (select all that apply)</label>
          <div class="preference-options">
            ${['Museums', 'Food', 'Shopping', 'Nature', 'Architecture', 'Nightlife'].map(interest => `
              <button class="preference-option ${state.tripPlannerState.interests.includes(interest) ? 'selected' : ''}" 
                      onclick="toggleInterest('${interest}')">
                ${interest}
              </button>
            `).join('')}
          </div>
        </div>
        
        <div class="form-group">
          <label class="form-label">Must-Do Activities (optional)</label>
          <input type="text" id="plannerMustDos" class="form-input" placeholder="E.g., Eiffel Tower, Louvre" value="${state.tripPlannerState.mustDos.join(', ')}">
        </div>
      `;
      break;

    case 3:
      const budget = state.tripPlannerState.budget;
      const allocation = {
        lodging: Math.round(budget * 0.40),
        activities: Math.round(budget * 0.25),
        food: Math.round(budget * 0.25),
        transport: Math.round(budget * 0.10)
      };

      content.innerHTML = `
        <h3 class="mb-md">Smart Budget Allocation</h3>
        <p style="margin-bottom: 2rem;">Based on your preferences, here's how we recommend allocating your ${formatCurrency(budget, state.tripPlannerState.currency)} budget:</p>
        
        <div class="budget-breakdown">
          <div class="budget-category">
            <div class="budget-category-icon">🏨</div>
            <div class="budget-category-label">Lodging</div>
            <div class="budget-category-amount">${formatCurrency(allocation.lodging, state.tripPlannerState.currency)}</div>
            <div class="budget-category-percent">40%</div>
          </div>
          <div class="budget-category">
            <div class="budget-category-icon">🎭</div>
            <div class="budget-category-label">Activities</div>
            <div class="budget-category-amount">${formatCurrency(allocation.activities, state.tripPlannerState.currency)}</div>
            <div class="budget-category-percent">25%</div>
          </div>
          <div class="budget-category">
            <div class="budget-category-icon">🍽️</div>
            <div class="budget-category-label">Food</div>
            <div class="budget-category-amount">${formatCurrency(allocation.food, state.tripPlannerState.currency)}</div>
            <div class="budget-category-percent">25%</div>
          </div>
          <div class="budget-category">
            <div class="budget-category-icon">🚗</div>
            <div class="budget-category-label">Transport</div>
            <div class="budget-category-amount">${formatCurrency(allocation.transport, state.tripPlannerState.currency)}</div>
            <div class="budget-category-percent">10%</div>
          </div>
        </div>
      `;
      break;

    case 4:
      const hotelBudget = Math.round(state.tripPlannerState.budget * 0.40);
      const dest = state.tripPlannerState.destination;
      content.innerHTML = `
        <h3 class="mb-md">Choose Your Accommodation</h3>
        <p style="margin-bottom: 1rem;">Based on your ${formatCurrency(hotelBudget, state.tripPlannerState.currency)} lodging budget:</p>
        
        <div class="hotel-tier-card ${state.tripPlannerState.selectedHotel === 'budget' ? 'selected' : ''}" onclick="selectHotel('budget')">
          <div class="hotel-tier-badge budget">Budget</div>
          <h4>${dest} Budget Hotel</h4>
          <p>Comfortable accommodation in a great location. Clean rooms, friendly staff, basic amenities.</p>
          <p><strong>${formatCurrency(hotelBudget * 0.4, state.tripPlannerState.currency)}</strong> total</p>
          <a href="https://www.booking.com/searchresults.html?ss=${encodeURIComponent(dest)}" target="_blank" class="btn btn-sm btn-outline">View on Booking.com</a>
        </div>
        
        <div class="hotel-tier-card ${state.tripPlannerState.selectedHotel === 'mid' ? 'selected' : ''}" onclick="selectHotel('mid')">
          <div class="hotel-tier-badge mid">Mid-Range</div>
          <h4>${dest} Boutique Hotel</h4>
          <p>Stylish accommodation with excellent amenities. Pool, gym, room service, central location.</p>
          <p><strong>${formatCurrency(hotelBudget * 0.7, state.tripPlannerState.currency)}</strong> total</p>
          <a href="https://www.booking.com/searchresults.html?ss=${encodeURIComponent(dest)}" target="_blank" class="btn btn-sm btn-outline">View on Booking.com</a>
        </div>
        
        <div class="hotel-tier-card ${state.tripPlannerState.selectedHotel === 'premium' ? 'selected' : ''}" onclick="selectHotel('premium')">
          <div class="hotel-tier-badge premium">Premium</div>
          <h4>${dest} Luxury Resort</h4>
          <p>5-star luxury experience. Spa, fine dining, concierge service, premium location with views.</p>
          <p><strong>${formatCurrency(hotelBudget * 1.0, state.tripPlannerState.currency)}</strong> total</p>
          <a href="https://www.booking.com/searchresults.html?ss=${encodeURIComponent(dest)}" target="_blank" class="btn btn-sm btn-outline">View on Booking.com</a>
        </div>
      `;
      break;

    case 5:
      const activityBudget = Math.round(state.tripPlannerState.budget * 0.25);
      const sampleActivities = [
        { name: 'City Walking Tour', cost: activityBudget * 0.1, duration: '3 hours', desc: 'Explore the main sights with a local guide' },
        { name: 'Museum Pass', cost: activityBudget * 0.15, duration: 'Full day', desc: 'Access to top museums and cultural sites' },
        { name: 'Food Tour', cost: activityBudget * 0.2, duration: '4 hours', desc: 'Taste local cuisine at hidden gems' },
        { name: 'Day Trip', cost: activityBudget * 0.3, duration: 'Full day', desc: 'Excursion to nearby attractions' },
        { name: 'Cultural Show', cost: activityBudget * 0.12, duration: '2 hours', desc: 'Traditional performance or event' },
        { name: 'Adventure Activity', cost: activityBudget * 0.25, duration: 'Half day', desc: 'Outdoor adventure suited to location' }
      ];

      content.innerHTML = `
        <h3 class="mb-md">Select Activities</h3>
        <p style="margin-bottom: 1rem;">Your activity budget: ${formatCurrency(activityBudget, state.tripPlannerState.currency)}</p>
        
        ${sampleActivities.map((act, i) => `
          <div class="activity-card ${state.tripPlannerState.selectedActivities.includes(i) ? 'selected' : ''}" onclick="toggleActivity(${i})">
            <h4>${act.name}</h4>
            <p>${act.desc}</p>
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span><strong>${formatCurrency(act.cost, state.tripPlannerState.currency)}</strong> • ${act.duration}</span>
              <a href="https://www.viator.com/searchResults/all?text=${encodeURIComponent(dest + ' ' + act.name)}" target="_blank" class="btn btn-sm btn-outline" onclick="event.stopPropagation()">Book Now</a>
            </div>
          </div>
        `).join('')}
      `;
      break;

    case 6:
      content.innerHTML = `
        <h3 class="mb-md">Health & Readiness Integration</h3>
        <p style="margin-bottom: 2rem;">Connect your health data to optimize your daily itinerary based on your energy levels.</p>
        
        ${state.tripPlannerState.healthConnected ? `
          <div class="card card-dark">
            <h4 style="color: var(--mint); margin-bottom: 1rem;">✅ Health Data Connected</h4>
            <p style="margin-bottom: 1rem;">Simulated health metrics for trip planning:</p>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 1rem;">
              <div>
                <div style="font-size: 0.875rem; color: #aaa;">Sleep Score</div>
                <div style="font-size: 1.5rem; font-weight: 700; color: var(--mint);">85/100</div>
              </div>
              <div>
                <div style="font-size: 0.875rem; color: #aaa;">Readiness</div>
                <div style="font-size: 1.5rem; font-weight: 700; color: var(--mint);">High</div>
              </div>
              <div>
                <div style="font-size: 0.875rem; color: #aaa;">HRV</div>
                <div style="font-size: 1.5rem; font-weight: 700; color: var(--mint);">65ms</div>
              </div>
            </div>
            <p style="margin-top: 1rem; font-size: 0.875rem; color: #ccc;">
              💡 Your itinerary will adapt daily based on energy levels. Low-energy days will have lighter schedules with more downtime.
            </p>
          </div>
        ` : `
          <div class="card" style="text-align: center; padding: 3rem;">
            <div style="font-size: 4rem; margin-bottom: 1rem;">📱</div>
            <h4 style="margin-bottom: 1rem;">Connect Health Data</h4>
            <p style="margin-bottom: 2rem; color: #666;">
              This demo simulates integration with Apple Health, Oura Ring, or other health trackers.
              In a real app, this would request permission to access your actual health data.
            </p>
            <button class="btn btn-primary btn-lg" onclick="connectHealthData()">
              Simulate Health Connection
            </button>
          </div>
        `}
      `;
      break;

    case 7:
      const days = Math.ceil((new Date(state.tripPlannerState.endDate) - new Date(state.tripPlannerState.startDate)) / (1000 * 60 * 60 * 24));
      const dailyBudget = Math.round(state.tripPlannerState.budget / days);

      let itineraryHTML = '<h3 class="mb-lg">Your Complete Itinerary</h3>';

      for (let i = 0; i < Math.min(days, 7); i++) {
        const date = new Date(state.tripPlannerState.startDate);
        date.setDate(date.getDate() + i);
        const energy = i % 3 === 0 ? 'high' : (i % 3 === 1 ? 'medium' : 'low');
        const energyLabel = energy === 'high' ? '⚡ High Energy' : (energy === 'medium' ? '💫 Medium Energy' : '😴 Low Energy');

        itineraryHTML += `
          <div class="itinerary-day">
            <div class="itinerary-day-header">
              <div class="itinerary-day-date">Day ${i + 1} - ${formatDate(date.toISOString().split('T')[0])}</div>
              <div class="health-indicator ${energy}">${energyLabel}</div>
            </div>
            <div class="itinerary-activities">
              ${energy === 'low' ? `
                <div class="itinerary-activity">
                  <div class="itinerary-activity-time">9:00 AM</div>
                  <div>Leisurely breakfast at hotel</div>
                </div>
                <div class="itinerary-activity">
                  <div class="itinerary-activity-time">11:00 AM</div>
                  <div>Relaxed museum visit</div>
                </div>
                <div class="itinerary-activity">
                  <div class="itinerary-activity-time">2:00 PM</div>
                  <div>Spa / Downtime</div>
                </div>
              ` : energy === 'medium' ? `
                <div class="itinerary-activity">
                  <div class="itinerary-activity-time">8:00 AM</div>
                  <div>Breakfast & hotel checkout</div>
                </div>
                <div class="itinerary-activity">
                  <div class="itinerary-activity-time">10:00 AM</div>
                  <div>City walking tour</div>
                </div>
                <div class="itinerary-activity">
                  <div class="itinerary-activity-time">1:00 PM</div>
                  <div>Lunch at local restaurant</div>
                </div>
                <div class="itinerary-activity">
                  <div class="itinerary-activity-time">3:00 PM</div>
                  <div>Free time / Shopping</div>
                </div>
              ` : `
                <div class="itinerary-activity">
                  <div class="itinerary-activity-time">7:00 AM</div>
                  <div>Early breakfast</div>
                </div>
                <div class="itinerary-activity">
                  <div class="itinerary-activity-time">8:00 AM</div>
                  <div>Full day excursion</div>
                </div>
                <div class="itinerary-activity">
                  <div class="itinerary-activity-time">1:00 PM</div>
                  <div>Lunch included in tour</div>
                </div>
                <div class="itinerary-activity">
                  <div class="itinerary-activity-time">6:00 PM</div>
                  <div>Dinner & evening activity</div>
                </div>
              `}
            </div>
            <div class="itinerary-day-budget">Daily Budget: ~${formatCurrency(dailyBudget, state.tripPlannerState.currency)}</div>
          </div>
        `;
      }

      content.innerHTML = itineraryHTML;
      break;
  }
}

function selectPreference(key, value) {
  state.tripPlannerState[key] = value;
  renderWizardStep(wizardStep);
}

function toggleInterest(interest) {
  const interests = state.tripPlannerState.interests;
  const index = interests.indexOf(interest);
  if (index > -1) {
    interests.splice(index, 1);
  } else {
    interests.push(interest);
  }
  renderWizardStep(wizardStep);
}

function selectHotel(tier) {
  state.tripPlannerState.selectedHotel = tier;
  renderWizardStep(wizardStep);
}

function toggleActivity(index) {
  const activities = state.tripPlannerState.selectedActivities;
  const idx = activities.indexOf(index);
  if (idx > -1) {
    activities.splice(idx, 1);
  } else {
    activities.push(index);
  }
  renderWizardStep(wizardStep);
}

function connectHealthData() {
  state.tripPlannerState.healthConnected = true;
  renderWizardStep(wizardStep);
  showToast('Health data connected! (Simulated)', 'success');
}

function wizardNext() {
  const ps = state.tripPlannerState;

  // Validate current step
  if (wizardStep === 1) {
    if (!document.getElementById('plannerBudget').value || !document.getElementById('plannerDestination').value) {
      showToast('Please fill in all required fields', 'error');
      return;
    }
    ps.budget = parseFloat(document.getElementById('plannerBudget').value);
    ps.currency = document.getElementById('plannerCurrency').value;
    ps.destination = document.getElementById('plannerDestination').value;
    ps.startDate = document.getElementById('plannerStartDate').value;
    ps.endDate = document.getElementById('plannerEndDate').value;
    ps.travelers = parseInt(document.getElementById('plannerTravelers').value);
  }

  if (wizardStep === 2) {
    const mustDosInput = document.getElementById('plannerMustDos');
    if (mustDosInput) {
      ps.mustDos = mustDosInput.value.split(',').map(s => s.trim()).filter(s => s);
    }
  }

  if (wizardStep === 7) {
    // Create the trip
    savePlannedTripWithItinerary();
    return;
  }

  wizardStep++;
  renderWizardSteps();
  renderWizardStep(wizardStep);
}

function wizardPrev() {
  wizardStep--;
  renderWizardSteps();
  renderWizardStep(wizardStep);
}

function savePlannedTrip() {
  const ps = state.tripPlannerState;

  const trip = {
    id: generateId(),
    name: `Trip to ${ps.destination}`,
    description: `${ps.style} trip with ${ps.pace} pace`,
    startDate: ps.startDate,
    endDate: ps.endDate,
    destinations: [{ name: ps.destination, notes: `Budget: ${formatCurrency(ps.budget, ps.currency)}` }],
    budget: { total: ps.budget, currency: ps.currency, expenses: [] },
    packingList: [],
    documents: []
  };

  state.trips.push(trip);
  state.profile.stats.totalTrips++;
  state.profile.stats.totalDestinations++;
  saveData();

  awardXP(100, 'Created trip with planner');
  showToast('Trip created successfully!', 'success');
  navigateTo('itinerary', trip.id);
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
  } else if (state.currentPage === 'chat') {
    renderChat();
  } else if (state.currentPage === 'planner') {
    renderPlanner();
  } else if (state.currentPage === 'profile') {
    renderProfile();
  }

  updateXPBar();
}

function renderChat() {
  document.getElementById('chatPage').classList.remove('hidden');
  if (state.chatHistory.length === 0) {
    initializeChatbot();
  }
}

function renderPlanner() {
  document.getElementById('plannerPage').classList.remove('hidden');
  if (wizardStep === 1 && !state.tripPlannerState.budget) {
    initializeTripPlanner();
  }
}

// ========== ENHANCED DESTINATION SEARCH ==========
function searchDestinations(query) {
  if (!query) {
    document.getElementById('countryGrid').innerHTML =
      '<div class="empty-state"><div class="empty-icon">🌍</div><p class="empty-message">Search for countries or cities to explore destinations</p></div>';
    return;
  }

  const lower = query.toLowerCase();

  // Search in destination database first
  const cityMatches = DESTINATION_DATABASE.filter(dest =>
    dest.name.toLowerCase().includes(lower) ||
    dest.country.toLowerCase().includes(lower)
  );

  // Apply filters
  const filteredCities = applyFilters(cityMatches);

  // Also search countries via API
  searchCountries(query);

  // If we have city matches, show them first
  if (filteredCities.length > 0) {
    renderCityResults(filteredCities);
  }
}

function applyFilters(destinations) {
  const filters = state.activeFilters;

  return destinations.filter(dest => {
    // Budget filter
    if (filters.budget !== 'all' && dest.budget !== filters.budget) {
      return false;
    }

    //Season filter  
    if (filters.season !== 'all') {
      const seasonMonths = {
        'spring': [3, 4, 5],
        'summer': [6, 7, 8],
        'fall': [9, 10, 11],
        'winter': [12, 1, 2]
      };
      const months = seasonMonths[filters.season];
      if (!dest.months.some(m => months.includes(m))) {
        return false;
      }
    }

    // Vibe filters
    if (filters.vibes.length > 0) {
      if (!filters.vibes.some(v => dest.vibe.includes(v))) {
        return false;
      }
    }

    return true;
  });
}

function renderCityResults(cities) {
  const grid = document.getElementById('countryGrid');

  if (cities.length === 0) {
    grid.innerHTML = '<div class="empty-state"><div class="empty-icon">😕</div><p class="empty-message">No destinations match your filters</p></div>';
    return;
  }

  grid.innerHTML = cities.map(city => `
    <div class="city-card">
      <h3 class="country-name">${city.name}</h3>
      <div style="opacity: 0.7; margin-bottom: 0.5rem;">${city.country}</div>
      <p style="font-size: 0.875rem; margin-bottom: 1rem;">${city.desc}</p>
      <div style="display: flex; gap: 0.5rem; flex-wrap: wrap; margin-bottom: 1rem;">
        <span style="background: rgba(31,122,90,0.1); padding: 0.25rem 0.5rem; border-radius: 4px; font-size: 0.75rem;">💰 ${city.budget}</span>
        ${city.vibe.slice(0, 2).map(v => `<span style="background: rgba(31,122,90,0.1); padding: 0.25rem 0.5rem; border-radius: 4px; font-size: 0.75rem;">${v}</span>`).join('')}
      </div>
      <button class="btn btn-primary" onclick="addCountryToTrip('${city.name}, ${city.country}')">Add to Trip</button>
    </div>
  `).join('');
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

  // Chat event listeners
  const chatSendBtn = document.getElementById('chatSend');
  const chatInput = document.getElementById('chatInput');

  if (chatSendBtn) {
    chatSendBtn.addEventListener('click', sendChatMessage);
  }

  if (chatInput) {
    chatInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        sendChatMessage();
      }
    });
  }

  // Wizard navigation
  const wizardNextBtn = document.getElementById('wizardNext');
  const wizardPrevBtn = document.getElementById('wizardPrev');

  if (wizardNextBtn) {
    wizardNextBtn.addEventListener('click', wizardNext);
  }

  if (wizardPrevBtn) {
    wizardPrevBtn.addEventListener('click', wizardPrev);
  }

  // Filter panel toggle
  const toggleFiltersBtn = document.getElementById('toggleFilters');
  if (toggleFiltersBtn) {
    toggleFiltersBtn.addEventListener('click', () => {
      const content = document.getElementById('filterContent');
      content.classList.toggle('hidden');
    });
  }

  // Filter controls
  const applyFiltersBtn = document.getElementById('applyFilters');
  if (applyFiltersBtn) {
    applyFiltersBtn.addEventListener('click', () => {
      state.activeFilters.budget = document.getElementById('budgetFilter').value;
      state.activeFilters.season = document.getElementById('seasonFilter').value;

      const query = document.getElementById('countrySearch').value;
      if (query) {
        searchDestinations(query);
      }

      showToast('Filters applied', 'success');
    });
  }

  const clearFiltersBtn = document.getElementById('clearFilters');
  if (clearFiltersBtn) {
    clearFiltersBtn.addEventListener('click', () => {
      state.activeFilters = { budget: 'all', season: 'all', vibes: [] };
      document.getElementById('budgetFilter').value = 'all';
      document.getElementById('seasonFilter').value = 'all';

      document.querySelectorAll('.vibe-tag').forEach(tag => {
        tag.classList.remove('active');
      });

      const query = document.getElementById('countrySearch').value;
      if (query) {
        searchDestinations(query);
      }

      showToast('Filters cleared', 'info');
    });
  }

  // Vibe tag clicks
  const vibeTags = document.querySelectorAll('.vibe-tag');
  vibeTags.forEach(tag => {
    tag.addEventListener('click', () => {
      const vibe = tag.dataset.vibe;
      tag.classList.toggle('active');

      const index = state.activeFilters.vibes.indexOf(vibe);
      if (index > -1) {
        state.activeFilters.vibes.splice(index, 1);
      } else {
        state.activeFilters.vibes.push(vibe);
      }
    });
  });

  // Update search to use new search function
  let searchTimeout;
  document.getElementById('countrySearch').addEventListener('input', (e) => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => searchDestinations(e.target.value || ''), 500);
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

  // Search cities from DESTINATION_DATABASE
  DESTINATION_DATABASE.forEach(dest => {
    const nameMatch = dest.name.toLowerCase().includes(lower);
    const countryMatch = dest.country.toLowerCase().includes(lower);
    
    if (nameMatch || countryMatch) {
      results.push({
        type: 'city',
        icon: '???',
        name: dest.name,
        country: dest.country,
        meta: `${dest.country} � City`,
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
         data-index="${i}">
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
  
  // Trigger city search
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

  switch(e.key) {
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

// Initialize autocomplete when DOM is ready
(function initAutocomplete() {
  const searchInput = document.getElementById('countrySearch');
  if (!searchInput) {
    // Retry after DOM is fully loaded
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initAutocomplete);
    }
    return;
  }
  
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
})();
// ==============================================
// INLINE TRIP PLANNER INTEGRATION
// ==============================================

// Launch the inline trip planner wizard
function launchInlinePlanner() {
    const overlay = document.getElementById('inlinePlannerOverlay');
    if (!overlay) {
        console.error('Inline planner overlay not found');
        return;
    }

    // Reset wizard state for new trip creation
    wizardStep = 0;
    state.tripPlannerState = {
        destination: '',
        startDate: '',
        endDate: '',
        travelers: 1,
        totalBudget: 0,
        pace: '',
        foodStyle: '',
        accommodation: '',
        interests: [],
        selectedHotel: null,
        selectedActivities: [],
        healthData: null
    };

    // Show overlay
    overlay.classList.remove('hidden');

    // Initialize wizard
    renderWizardSteps();
    renderWizardStep();

    // Prevent body scroll
    document.body.style.overflow = 'hidden';
}

// Close the inline trip planner wizard
function closeInlinePlanner() {
    const overlay = document.getElementById('inlinePlannerOverlay');
    if (overlay) {
        overlay.classList.add('hidden');
    }

    // Restore body scroll
    document.body.style.overflow = '';

    // Reset wizard state
    wizardStep = 0;
}

// Updated savePlannedTrip function to persist itinerary
function savePlannedTripWithItinerary() {
    const ps = state.tripPlannerState;

    if (!ps.destination || !ps.startDate || !ps.endDate) {
        showToast('âš ï¸ Please complete all required fields');
        return;
    }

    // Generate full itinerary
    const itinerary = generateCompleteItinerary(ps);

    // Create new trip with itinerary data
    const trip = {
        id: generateId(),
        name: ps.destination,
        description: `${ps.pace || 'Custom'} pace trip to ${ps.destination}`,
        startDate: ps.startDate,
        endDate: ps.endDate,
        destinations: [ps.destination],
        expenses: [],
        packingList: [],
        documents: [],
        // NEW: Itinerary data
        itinerary: {
            days: itinerary.days,
            budget: {
                total: ps.totalBudget,
                lodging: Math.round(ps.totalBudget * 0.4),
                activities: Math.round(ps.totalBudget * 0.25),
                food: Math.round(ps.totalBudget * 0.25),
                transport: Math.round(ps.totalBudget * 0.1)
            },
            hotelDetails: ps.selectedHotel,
            preferences: {
                pace: ps.pace,
                foodStyle: ps.foodStyle,
                accommodation: ps.accommodation,
                interests: ps.interests
            },
            healthPreferences: ps.healthData
        }
    };

    state.trips.push(trip);
    saveState();

    // Close inline planner
    closeInlinePlanner();

    // Navigate to trip detail
    navigateTo('itinerary', trip.id);

    // Show success message
    showToast('ðŸŽ‰ Trip created with full itinerary!');
    addXP(100);
}

// Generate complete day-by-day itinerary
function generateCompleteItinerary(plannerState) {
    const { destination, startDate, endDate, interests, pace } = plannerState;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const dayCount = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

    const days = [];

    // Get destination-specific activities
    const destData = DESTINATION_DATABASE.find(d =>
        d.name.toLowerCase().includes(destination.toLowerCase()) ||
        destination.toLowerCase().includes(d.name.toLowerCase())
    );

    for (let i = 0; i < dayCount; i++) {
        const currentDate = new Date(start);
        currentDate.setDate(start.getDate() + i);

        const activities = generateDayActivities(i + 1, interests, pace, destData);

        days.push({
            dayNumber: i + 1,
            date: currentDate.toISOString().split('T')[0],
            activities: activities,
            notes: ''
        });
    }

    return { days };
}

// Generate activities for a specific day
function generateDayActivities(dayNum, interests, pace, destData) {
    const activities = [];
    const activityCount = pace === 'Relaxed' ? 2 : pace === 'Packed' ? 5 : 3;

    const timeSlots = ['Morning', 'Afternoon', 'Evening'];
    const defaultActivities = {
        'Morning': ['Breakfast at local cafÃ©', 'Museum visit', 'Walking tour'],
        'Afternoon': ['Lunch', 'Sightseeing', 'Shopping'],
        'Evening': ['Dinner', 'Sunset viewing', 'Local entertainment']
    };

    // Use destination-specific activities if available
    const destActivities = destData?.activities || [];

    for (let i = 0; i < Math.min(activityCount, timeSlots.length); i++) {
        const slot = timeSlots[i];
        let activityName;

        if (destActivities.length > 0 && dayNum <= destActivities.length) {
            activityName = destActivities[(dayNum - 1 + i) % destActivities.length];
        } else {
            activityName = defaultActivities[slot][i % defaultActivities[slot].length];
        }

        activities.push({
            time: slot,
            name: activityName,
            duration: '2-3 hours',
            type: interests[i % interests.length] || 'Sightseeing'
        });
    }

    return activities;
}

// Initialize inline planner event listeners
function initInlinePlannerListeners() {
    const closeBtn = document.getElementById('closePlanner');
    if (closeBtn) {
        closeBtn.addEventListener('click', closeInlinePlanner);
    }

    // Close on overlay click (click outside modal)
    const overlay = document.getElementById('inlinePlannerOverlay');
    if (overlay) {
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                closeInlinePlanner();
            }
        });
    }
}

console.log('âœ… Inline Trip Planner functions loaded');
// Enhanced initInlinePlannerListeners with event listener wiring
function initInlinePlannerListeners() {
    const closeBtn = document.getElementById('closePlanner');
    if (closeBtn) {
        closeBtn.addEventListener('click', closeInlinePlanner);
    }

    // Close on overlay click (click outside modal)
    const overlay = document.getElementById('inlinePlannerOverlay');
    if (overlay) {
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                closeInlinePlanner();
            }
        });
    }

    // Wire up wizard navigation buttons
    const nextBtn = document.getElementById('wizardNext');
    const prevBtn = document.getElementById('wizardPrev');

    if (nextBtn && typeof wizardNext === 'function') {
        nextBtn.onclick = () => wizardNext();
    }

    if (prevBtn && typeof wizardPrev === 'function') {
        prevBtn.onclick = () => wizardPrev();
    }

    // Wire up create trip buttons to launch inline planner
    const createBtn1 = document.getElementById('createTripBtn');
    const createBtn2 = document.getElementById('createTripBtn2');

    if (createBtn1) {
        createBtn1.addEventListener('click', (e) => {
            e.preventDefault();
            launchInlinePlanner();
        });
    }

    if (createBtn2) {
        createBtn2.addEventListener('click', (e) => {
            e.preventDefault();
            launchInlinePlanner();
        });
    }
}

// Replace the old init function
console.log('âœ… Enhanced initInlinePlannerListeners with full event wiring');
