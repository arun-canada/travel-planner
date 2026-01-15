// TripFlow - Travel Planning PWA

// Complete Application Logic



// ========== STATE MANAGEMENT ==========

const state = {

  trips: [], // { id, name, destinations: [], startDate, endDate, budget, notes, packingList: [], expenses: [], documents: [] }

  activeTripId: null,

  currentView: 'home', // home, trip-detail, explore

  activeFilters: { budget: 'all', season: 'all', vibes: [] },

  planningMode: false, // NEW: Track if user is in "Explore to Plan" flow

  tempDestinations: [], // NEW: Buffer for selected destinations in Explore flow

  achievements: [

    { id: 'first_trip', icon: '\ud83c\udfc6', title: 'First Steps', desc: 'Create your first trip' },

    { id: 'budget_master', icon: '\\ud83c\\udfc6', title: 'Budget Master', desc: 'Plan a trip under budget' },

    { id: 'globetrotter', icon: '\ud83c\udf0d', title: 'Globetrotter', desc: 'Visit 3 different countries' }

  ],

  userLevel: 1,

  xp: 0,

  profile: {
    level: 1,
    xp: 0,
    achievements: [],
    stats: {
      totalTrips: 0,
      totalDestinations: 0,
      countriesVisited: 0,
      totalExpenses: 0
    }
  }

};



// ========== ACHIEVEMENTS DEFINITION ==========

const ACHIEVEMENTS = {

  first_adventure: { id: 'first_adventure', name: 'First Adventure', icon: '\ud83c\udfc6', description: 'Create your first trip', xp: 100 },

  explorer: { id: 'explorer', name: 'Explorer', icon: '\ud83d\udccd', description: 'Add 10 destinations', xp: 200 },

  budget_master: { id: 'budget_master', name: 'Budget Master', icon: '\\ud83c\\udfc6', description: 'Track 20+ expenses', xp: 150 },

  frequent_flyer: { id: 'frequent_flyer', name: 'Frequent Flyer', icon: '\u2708\ufe0f', description: 'Create 5 trips', xp: 250 },

  globe_trotter: { id: 'globe_trotter', name: 'Globe Trotter', icon: '\ud83c\udf0e', description: 'Visit 5+ countries', xp: 500 },

  organized_traveler: { id: 'organized_traveler', name: 'Organized Traveler', icon: '\ud83c\udf92', description: 'Complete 3 packing lists', xp: 150 },

  completionist: { id: 'completionist', name: 'Completionist', icon: '\u2b50', description: 'Use all features in one trip', xp: 300 },

  document_keeper: { id: 'document_keeper', name: 'Document Keeper', icon: '\ud83d\udcc4', description: 'Upload 5+ documents', xp: 200 }

};

// ========== GEMINI AI INTEGRATION ==========

// Using gemini-1.5-flash - stable and widely available
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

function saveGeminiApiKey() {
  const apiKeyInput = document.getElementById('geminiApiKey');
  const statusEl = document.getElementById('apiKeyStatus');
  const apiKey = apiKeyInput.value.trim();

  if (!apiKey) {
    statusEl.innerHTML = '<span style="color: var(--warning);">Please enter an API key</span>';
    return;
  }

  localStorage.setItem('tripflow_gemini_api_key', apiKey);
  statusEl.innerHTML = '<span style="color: var(--mint);">API key saved successfully!</span>';
  apiKeyInput.value = '';
  apiKeyInput.placeholder = '••••••••••••••••';
}

function getGeminiApiKey() {
  return localStorage.getItem('tripflow_gemini_api_key');
}

function hasGeminiApiKey() {
  return !!getGeminiApiKey();
}

async function generateAIItinerary(destination, startDate, endDate, preferences = {}) {
  const apiKey = getGeminiApiKey();

  if (!apiKey) {
    throw new Error('No Gemini API key configured. Please add your API key in Profile settings.');
  }

  const start = new Date(startDate);
  const end = new Date(endDate);
  const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

  const prompt = `You are a travel planning expert. Create a detailed ${days}-day itinerary for a trip to ${destination}.

Trip Details:
- Destination: ${destination}
- Duration: ${days} days (${startDate} to ${endDate})
- Travel Style: ${preferences.style || 'balanced'}
- Pace: ${preferences.pace || 'moderate'}
- Budget Level: ${preferences.budget ? '$' + preferences.budget : 'moderate'}
- Travelers: ${preferences.travelers || 1} person(s)
- Interests: ${preferences.interests?.join(', ') || 'general sightseeing'}
${preferences.mustDos?.length ? `- Must-do activities: ${preferences.mustDos.join(', ')}` : ''}

Please provide a realistic itinerary with REAL places, restaurants, and attractions that actually exist in ${destination}.

IMPORTANT: Respond ONLY with valid JSON in this exact format (no markdown, no explanation):
{
  "destination": "${destination}",
  "summary": "Brief 1-2 sentence trip summary",
  "days": [
    {
      "day": 1,
      "date": "${startDate}",
      "theme": "Arrival & Exploration",
      "activities": [
        {
          "time": "9:00 AM",
          "title": "Activity name",
          "description": "Brief description",
          "location": "Specific place name",
          "type": "sightseeing|food|transport|relaxation|adventure",
          "duration": 120,
          "cost_estimate": "$20-30"
        }
      ]
    }
  ],
  "tips": ["Local tip 1", "Local tip 2"],
  "estimated_daily_budget": "$100-150"
}

Generate activities from morning to evening for each day. Include real restaurant names, real attractions, and accurate locations.`;

  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 8192,
        }
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Failed to generate itinerary');
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      throw new Error('No response from Gemini API');
    }

    // Clean up the response - remove markdown code blocks if present
    let cleanedText = text.trim();
    if (cleanedText.startsWith('```json')) {
      cleanedText = cleanedText.slice(7);
    } else if (cleanedText.startsWith('```')) {
      cleanedText = cleanedText.slice(3);
    }
    if (cleanedText.endsWith('```')) {
      cleanedText = cleanedText.slice(0, -3);
    }
    cleanedText = cleanedText.trim();

    const itinerary = JSON.parse(cleanedText);
    console.log('[generateAIItinerary] Successfully generated itinerary:', itinerary);
    return itinerary;

  } catch (error) {
    console.error('[generateAIItinerary] Error:', error);
    throw error;
  }
}

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

  { id: 'costarica', name: 'San Jos\\ud83d\\udccd', country: 'Costa Rica', budget: 'budget', climate: ['tropical'], vibe: ['adventure', 'nature', 'beach'], activities: ['wildlife', 'hiking', 'beaches'], group: ['families', 'friends'], months: [12, 1, 2, 3, 4], coords: [9.9281, -84.0907], desc: 'Biodiverse country with rainforests and beaches' },

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



  showToast(`+${amount} XP \\ud83c\\udfc6 ${reason}`, 'success');

  checkAchievements();

}



function updateXPBar() {

  const xpInLevel = state.profile.xp % 1000;

  const progress = (xpInLevel / 1000) * 100;



  document.getElementById('xpText').textContent = `Level ${state.profile.level} \ud83c\udfc6 ${xpInLevel}/1000 XP`;

  document.getElementById('xpFill').style.width = `${progress}%`;

}



function showLevelUp(level) {

  showToast(`\ud83c\udf89 Level Up! You're now Level ${level}!`, 'success');

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



  const icons = { success: '\u2713', error: '\u274c', info: '\u2139\ufe0f', warning: '\u26a0\ufe0f' };



  toast.innerHTML = `

    <div class="toast-icon">${icons[type] || icons.info}</div>

    <div class="toast-content">

      <div class="toast-message">${sanitizeHTML(message)}</div>

    </div>

    <button class="toast-close" onclick="this.parentElement.remove()">?</button>

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

      <button class="modal-close" onclick="closeModal()">?</button>

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



  // Defensive: Ensure budget object exists

  if (!trip.budget) {

    trip.budget = { total: 0, currency: 'USD', expenses: [] };

  }

  // Defensive: Ensure expenses array exists

  if (!trip.budget.expenses) {

    trip.budget.expenses = [];

  }



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

  if (!trip || !trip.budget || !trip.budget.expenses) return;



  trip.budget.expenses.splice(index, 1);

  saveData();

  renderBudgetTab(trip);

}



function getCategoryIcon(category) {

  const icons = {

    food: '\ud83c\udf7d\ufe0f', transport: '\ud83d\ude97', lodging: '\ud83c\udfe8',

    activities: '\ud83c\udfad', shopping: '\ud83d\udecd\ufe0f', flights: '\u2708\ufe0f', other: '\ud83d\udcb5'

  };

  return icons[category] || '\ud83d\udcb5';

}



function addPackingItem(tripId, category, item) {

  const trip = getTripById(tripId);

  if (!trip) return;



  if (!trip.packingList) trip.packingList = [];



  const existingCategory = trip.packingList.find(c => c.category === category);

  if (existingCategory) {

    existingCategory.items.push({ name: item, checked: false });

  } else {

    trip.packingList.push({

      category,

      items: [{ name: item, checked: false }]

    });

  }



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

    attribution: '\\ud83c\\udfc6 OpenStreetMap contributors'

  }).addTo(mapInstance);



  const markers = [];

  const coords = [];



  // Get base coordinates from the destination

  const mainDestination = trip.destinations[0]?.name || trip.name;

  const baseCoord = CITY_COORDS[mainDestination.toLowerCase()] ||

    CITY_COORDS[mainDestination.split(',')[0].trim().toLowerCase()];



  if (!baseCoord) {

    // Try to extract city name from trip name

    const tripNameParts = trip.name.toLowerCase().split(' ');

    let foundCoord = null;

    for (let part of tripNameParts) {

      if (CITY_COORDS[part]) {

        foundCoord = CITY_COORDS[part];

        break;

      }

    }



    if (!foundCoord) {

      document.getElementById('mapInfo').textContent =

        'No coordinates found for this destination';

      return;

    }

    baseCoord = foundCoord;

  }



  let totalActivities = 0;

  const colors = ['#1F7A5A', '#F2C94C', '#EB5757', '#56CCF2', '#BB6BD9']; // Different colors for days



  // Loop through itinerary days and activities

  if (trip.itinerary && trip.itinerary.length > 0) {

    trip.itinerary.forEach((day, dayIndex) => {

      const dayColor = colors[dayIndex % colors.length];



      day.activities.forEach((activity, actIndex) => {

        // Create a small offset for each activity to spread them out

        const offsetLat = (Math.random() - 0.5) * 0.02; // ~1-2 km radius

        const offsetLng = (Math.random() - 0.5) * 0.02;



        const actCoord = [

          baseCoord[0] + offsetLat,

          baseCoord[1] + offsetLng

        ];



        coords.push(actCoord);



        // Create custom icon with day number

        const icon = L.divIcon({

          className: 'custom-marker',

          html: `<div style="background-color: ${dayColor}; color: white; border-radius: 50%; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; font-weight: bold; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3); font-size: 11px;">${dayIndex + 1}-${actIndex + 1}</div>`,

          iconSize: [32, 32],

          iconAnchor: [16, 16]

        });



        const marker = L.marker(actCoord, { icon }).addTo(mapInstance);

        marker.bindPopup(`

          <div style="min-width: 200px;">

            <b>Day ${day.day}: ${activity.title}</b><br>

            <small style="color: #666;">

              \ud83d\udcc5 ${day.weekday}<br>

              \u23f1\ufe0f ${activity.duration} minutes<br>

              \ud83c\udfaf ${activity.type}<br>

              ${activity.steps ? `\ud83d\udc63 ${activity.steps} steps` : ''}

            </small>

          </div>

        `);

        markers.push(marker);

        totalActivities++;

      });

    });



    // Add polylines connecting activities in chronological order

    if (coords.length > 1) {

      L.polyline(coords, {

        color: '#1F7A5A',

        weight: 2,

        opacity: 0.6,

        dashArray: '5, 10'

      }).addTo(mapInstance);

    }

  } else {

    // Fallback to destinations if no itinerary

    trip.destinations.forEach(dest => {

      const coord = CITY_COORDS[dest.name.toLowerCase()];

      if (coord) {

        coords.push(coord);

        const marker = L.marker(coord).addTo(mapInstance);

        marker.bindPopup(`<b>${dest.name}</b><br>${dest.notes || 'No notes'}`);

        markers.push(marker);

      }

    });

  }



  if (coords.length > 0) {

    mapInstance.fitBounds(coords, { padding: [50, 50] });

  }



  setTimeout(() => mapInstance.invalidateSize(), 100);



  document.getElementById('mapInfo').textContent =

    trip.itinerary ?

      `Showing ${totalActivities} activities from ${trip.itinerary.length} day(s)` :

      `Showing ${coords.length} destination(s)`;

}



// ========== EXPLORE SEARCH =========

async function searchCountries(query) {

  const grid = document.getElementById('countryGrid');

  if (!query) {

    renderDestinationCards(DESTINATION_DATABASE);

    return;

  }



  const lowerQuery = query.toLowerCase();



  // 1. Search Local Database FIRST (Cities/Destinations)

  const localMatches = DESTINATION_DATABASE.filter(dest =>

    dest.name.toLowerCase().includes(lowerQuery) ||

    dest.country.toLowerCase().includes(lowerQuery) ||

    dest.desc.toLowerCase().includes(lowerQuery)

  );



  // 2. Render local matches immediately

  if (localMatches.length > 0) {

    renderDestinationCards(localMatches);

    // Optional: Could still fetch API to append, but for now local is better quality

    return;

  }



  // 3. Fallback to API if no local matches found

  try {

    const response = await fetch(`https://restcountries.com/v3.1/name/${encodeURIComponent(query)}`);

    if (!response.ok) throw new Error('Not found');



    const countries = await response.json();

    // Use the API results but format appropriately? 

    // The previous renderCountryCards was specific to API structure.

    renderCountryCards(countries); // Show all results, no slice limit

  } catch (e) {

    grid.innerHTML = `

      <div class="empty-state">

        <div class="empty-icon">\ud83d\udccd</div>

        <p class="empty-message">No destinations found for "${sanitizeHTML(query)}"</p>

        <button class="btn btn-sm btn-outline mt-sm" onclick="renderDestinationCards(DESTINATION_DATABASE)">Show All</button>

      </div>

    `;

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

  // If no trips, handle gracefully

  let tripOptions = '';

  if (state.trips.length > 0) {

    tripOptions = state.trips.map(t =>

      `<option value="${t.id}">${sanitizeHTML(t.name)}</option>`

    ).join('');

  } else {

    tripOptions = '<option value="" disabled selected>No trips created yet</option>';

  }



  const createTripHtml = `

    <div class="text-center mt-sm">

      <span class="text-muted text-sm">Or</span>

      <button class="btn btn-sm btn-outline btn-block mt-xs" onclick="closeModal(); launchInlinePlanner()">

        ? Create New Trip

      </button>

    </div>

  `;



  showModal('Add to Trip', `

    <div class="form-group">

      <label class="form-label">Select Trip</label>

      <select id="tripSelect" class="form-select" ${state.trips.length === 0 ? 'disabled' : ''}>${tripOptions}</select>

    </div>

    ${createTripHtml}

    <div class="form-group">

      <label class="form-label">Notes (optional)</label>

      <input type="text" id="destNotes" class="form-input" placeholder="E.g., Visit museums">

    </div>

  `, [

    { label: 'Cancel', class: 'btn-secondary', onclick: 'closeModal()' },

    {

      label: 'Add',

      class: 'btn-primary',

      onclick: state.trips.length > 0 ? `confirmAddCountryToTrip('${countryName.replace(/'/g, "\\'")}')` : ''

    }

  ]);



  // Update button state if no trips

  if (state.trips.length === 0) {

    const addBtn = document.querySelector('.modal-footer .btn-primary');

    if (addBtn) {

      addBtn.disabled = true;

      addBtn.innerHTML = 'Create Trip First ??';

    }

  }

}



function confirmAddCountryToTrip(countryName) {

  const tripId = document.getElementById('tripSelect').value;

  const notes = document.getElementById('destNotes').value;



  addDestination(tripId, countryName, notes);

  closeModal();

  showToast(`Added ${countryName} to trip!`, 'success');

}



// ========== EXPLORE PAGE FILTERS ==========

function toggleFilters() {

  const filterContent = document.getElementById('filterContent');

  filterContent.classList.toggle('hidden');

}



function applyFilters() {

  const budgetFilter = document.getElementById('budgetFilter').value;

  const seasonFilter = document.getElementById('seasonFilter').value;

  const vibeButtons = document.querySelectorAll('.vibe-tag.active');

  const selectedVibes = Array.from(vibeButtons).map(btn => btn.dataset.vibe);



  // Update state

  state.activeFilters = {

    budget: budgetFilter,

    season: seasonFilter,

    vibes: selectedVibes

  };



  // Filter destinations from database

  const filtered = DESTINATION_DATABASE.filter(dest => {

    // Budget filter

    if (budgetFilter !== 'all' && dest.budget !== budgetFilter) {

      return false;

    }



    // Vibe filter (if any vibes selected, destination must match at least one)

    if (selectedVibes.length > 0) {

      const hasMatchingVibe = selectedVibes.some(vibe => dest.vibe.includes(vibe));

      if (!hasMatchingVibe) return false;

    }



    // Season filter (simplified - check if destination is good in selected months)

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



  // Render filtered destinations

  renderDestinationCards(filtered);

  showToast(`Showing ${filtered.length} destination(s)`, 'success');

}



function clearFilters() {

  // Reset UI

  document.getElementById('budgetFilter').value = 'all';

  document.getElementById('seasonFilter').value = 'all';

  document.querySelectorAll('.vibe-tag').forEach(tag => tag.classList.remove('active'));



  // Reset state

  state.activeFilters = { budget: 'all', season: 'all', vibes: [] };



  // Show all destinations

  renderDestinationCards(DESTINATION_DATABASE);

  showToast('Filters cleared', 'info');

}



function renderDestinationCards(destinations) {

  const grid = document.getElementById('countryGrid');



  if (destinations.length === 0) {

    grid.innerHTML = `

      <div class="empty-state">

        <div class="empty-icon">\ud83d\udccd</div>

        <p class="empty-message">No destinations match your filters</p>

        <button class="btn btn-secondary" onclick="clearFilters()">Clear Filters</button>

      </div>

    `;

    return;

  }



  grid.innerHTML = destinations.slice(0, 24).map(dest => `

    <div class="country-card">

      <div class="country-content">

        <h3 class="country-name">${dest.name}, ${dest.country}</h3>

        <p class="country-desc">${dest.desc}</p>

        <div class="country-info">

          <div class="country-info-item">

            <span>Budget:</span>

            <strong class="badge badge-${dest.budget}">${dest.budget.toUpperCase()}</strong>

          </div>

          <div class="country-info-item">

            <span>Vibe:</span>

            <strong>${dest.vibe.slice(0, 2).join(', ')}</strong>

          </div>

        </div>

        <button class="btn btn-primary" onclick="addDestinationToTrip('${dest.name}, ${dest.country}')">

          Add to Trip

        </button>

      </div>

    </div>

  `).join('');

}



function addDestinationToTrip(destName) {

  // If planning mode, add to temp

  if (state.planningMode) {

    if (!state.tempDestinations.includes(destName)) {

      state.tempDestinations.push(destName);

      showToast(`Added ${destName} to plan`, 'success');

      renderExplore(); // Update builder bar

    } else {

      showToast(`${destName} is already selected`, 'info');

    }

    return;

  }



  // Normal mode: Add to existing or new

  const tripOptions = state.trips.map(t =>

    `<option value="${t.id}">${sanitizeHTML(t.name)}</option>`

  ).join('');



  const newTripOption = `<option value="NEW_TRIP">? Create New Trip...</option>`;



  showModal('Add to Trip', `

    <div class="form-group mb-md">

      <label class="form-label">Select Trip</label>

      <select id="tripSelect" class="form-select" onchange="toggleNewTripName(this.value)">

         ${tripOptions}

         ${newTripOption}

      </select>

    </div>

    

    <div id="newTripNameField" class="form-group mb-md hidden">

       <label class="form-label">Trip Name</label>

       <input type="text" id="newTripName" class="form-input" placeholder="e.g. My ${destName} Adventure" value="Trip to ${destName}">

    </div>



    <div class="form-group">

      <label class="form-label">Notes (optional)</label>

      <input type="text" id="destNotes" class="form-input" placeholder="E.g., Visit museums">

    </div>

  `, [

    { label: 'Cancel', class: 'btn-secondary', onclick: 'closeModal()' },

    { label: 'Add', class: 'btn-primary', onclick: `confirmAddDestinationToTrip('${destName.replace(/'/g, "\\'")}')` }

  ]);



  // Auto-show new field if no trips

  if (state.trips.length === 0) {

    const select = document.getElementById('tripSelect');

    select.value = 'NEW_TRIP';

    document.getElementById('newTripNameField').classList.remove('hidden');

  }

}



function toggleNewTripName(val) {

  const field = document.getElementById('newTripNameField');

  if (val === 'NEW_TRIP') field.classList.remove('hidden');

  else field.classList.add('hidden');

}



// ========== EXPLORE PAGE FILTERS ==========

// ========== EXPLORE PAGE FILTERS ==========

// ========== EXPLORE PAGE FILTERS ==========

function toggleFilters() {

  console.log('\ud83d\udccd toggleFilters() triggered');

  const filterContent = document.getElementById('filterContent');

  if (filterContent) {

    const isHidden = filterContent.classList.contains('hidden');

    console.log('   Current user-visible state:', isHidden ? 'HIDDEN' : 'VISIBLE');



    if (isHidden) {

      filterContent.classList.remove('hidden');

      console.log('   \ud83d\udccd ACTION: Removed "hidden" class');

    } else {

      filterContent.classList.add('hidden');

      console.log('   \ud83d\udccd ACTION: Added "hidden" class');

    }

  } else {

    console.error('? filterContent element not found!');

  }

}



function clearFilters() {

  // Reset UI

  const budget = document.getElementById('budgetFilter');

  const season = document.getElementById('seasonFilter');

  if (budget) budget.value = 'all';

  if (season) season.value = 'all';



  document.querySelectorAll('.vibe-tag').forEach(tag => tag.classList.remove('active'));



  // Reset state

  state.activeFilters = { budget: 'all', season: 'all', vibes: [] };



  // Show all destinations

  renderDestinationCards(DESTINATION_DATABASE);

  showToast('Filters cleared', 'info');

}



function applyFilters() {

  const budgetFilter = document.getElementById('budgetFilter').value;

  const seasonFilter = document.getElementById('seasonFilter').value;

  const vibeButtons = document.querySelectorAll('.vibe-tag.active');

  const selectedVibes = Array.from(vibeButtons).map(btn => btn.dataset.vibe);



  // Update state

  state.activeFilters = {

    budget: budgetFilter,

    season: seasonFilter,

    vibes: selectedVibes

  };



  // Filter destinations from database

  const filtered = DESTINATION_DATABASE.filter(dest => {

    // Budget filter

    if (budgetFilter !== 'all' && dest.budget !== budgetFilter) {

      return false;

    }



    // Vibe filter (if any vibes selected, destination must match at least one)

    if (selectedVibes.length > 0) {

      const hasMatchingVibe = selectedVibes.some(vibe => dest.vibe.includes(vibe));

      if (!hasMatchingVibe) return false;

    }



    // Season filter

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



  // Render filtered destinations

  renderDestinationCards(filtered);

  showToast(`Showing ${filtered.length} destination(s)`, 'success');

}



function confirmAddDestinationToTrip(destName) {

  const tripSelect = document.getElementById('tripSelect');

  if (!tripSelect || tripSelect.disabled) return;



  const tripId = tripSelect.value;

  const notes = document.getElementById('destNotes').value;



  // NEW TRIP LOGIC

  if (tripId === 'NEW_TRIP') {

    const tripName = document.getElementById('newTripName').value || `Trip to ${destName}`;



    // Create Minimal Trip

    const newTrip = {

      id: generateId(),

      name: tripName,

      description: 'Created from Explore',

      startDate: new Date().toISOString().split('T')[0],

      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Default 1 week

      destinations: [{ name: destName, notes: notes || 'Added from Explore' }],

      budget: { total: 0, currency: 'USD', expenses: [] },

      packingList: [],

      documents: [],

      itinerary: [], // Empty initially

      healthScore: null // No itinerary yet

    };



    // Auto-generate itinerary for this simple trip?

    // Let's generate a basic one

    newTrip.itinerary = generateItinerary(newTrip.startDate, newTrip.endDate, { pace: 'balanced', style: 'balanced', mustDos: [] });

    newTrip.healthScore = calculateHealthScore(newTrip.itinerary, { pace: 'balanced', style: 'balanced' });



    state.trips.push(newTrip);

    state.profile.stats.totalTrips++;

    state.profile.stats.totalDestinations++;

    saveData();



    showToast(`Created trip "${tripName}"!`, 'success');

    closeModal();



    // Navigate to it

    navigateTo('itinerary', newTrip.id);

    return;

  }



  // EXISTING TRIP LOGIC

  const trip = getTripById(tripId);

  if (trip) {

    // Defensive: Ensure destinations array exists

    if (!trip.destinations) {

      trip.destinations = [];

    }



    if (!trip.destinations.find(d => d.name === destName)) {

      trip.destinations.push({ name: destName, notes: notes });

      saveData();

      showToast(`Added ${destName} to ${trip.name}`, 'success');

      closeModal();



      // Update UI if we are on itinerary page

      if (state.currentView === 'itinerary' && state.currentTripId === tripId) {

        renderTripDetail(tripId);

      }

    } else {

      showToast(`${destName} is already in this trip`, 'info');

    }

  }

}



// ========== AI ASSISTANT (MENU-BASED) ==========



// Assistant state

const ASSISTANT_MENU = {

  categories: [

    { id: 'destinations', icon: '\ud83c\udfc6', name: 'Find a destination', taskCount: 10 },

    { id: 'budget', icon: '\ud83c\udfc6', name: 'Budget trip planning', taskCount: 8 },

    { id: 'flights', icon: '\ud83c\udfc6', name: 'Flights', taskCount: 8 },

    { id: 'hotels', icon: '\ud83c\udfc6', name: 'Hotels and stays', taskCount: 8 },

    { id: 'activities', icon: '\ud83c\udfc6', name: 'Activities and bookings', taskCount: 8 },

    { id: 'itinerary', icon: '\ud83c\udfc6', name: 'Build an itinerary', taskCount: 8 },

    { id: 'health', icon: '\ud83c\udfc6', name: 'Health + energy planning', taskCount: 5 }

  ],

  tasks: {

    destinations: [

      { id: 'suggest_vibe', title: 'Suggest destinations for my vibe', desc: 'Get personalized recommendations' },

      { id: 'beach', title: 'Warm beach trip ideas', desc: '7 beach cities with best neighborhoods' },

      { id: 'nature', title: 'Mountain / nature trip ideas', desc: '6 nature destinations + top hikes' },

      { id: 'city_food', title: 'City break ideas (food + museums)', desc: '5 cities ranked by walkability' },

      { id: 'weekend', title: 'Weekend trips from my city', desc: '8 weekend options with costs' },

      { id: 'cheap', title: 'Cheapest places to visit this month', desc: '10 budget-friendly options' },

      { id: 'quiet', title: 'Quiet/relaxing destinations', desc: '6 low-key cities' },

      { id: 'group', title: 'Best for couples/family/friends/solo', desc: 'Tailored to your group' },

      { id: 'similar', title: 'Destinations similar to X', desc: 'Find alternatives to places you loved' },

      { id: 'local', title: 'Avoid touristy places', desc: '5 underrated cities' }

    ],

    budget: [

      { id: 'plan_budget', title: 'Plan a trip within $X', desc: 'Complete trip with budget allocation' },

      { id: 'cheaper', title: 'Make it cheaper without changing dates', desc: '8 ways to reduce cost' },

      { id: 'hotel_vs_exp', title: 'Hotel-heavy vs experience-heavy?', desc: 'Rebalance your budget' },

      { id: 'breakdown', title: 'Show budget breakdown', desc: 'Category breakdown + per-day spend' },

      { id: 'track', title: 'Track expenses automatically', desc: 'Upload receipts, categorize spend' },

      { id: 'alert', title: 'Alert me when I\'m over budget', desc: 'Get warnings and suggestions' },

      { id: 'tiers', title: 'Give me 3 budget tiers', desc: 'Budget / Mid / Premium versions' },

      { id: 'value', title: 'Optimize for value', desc: 'Best value within budget' }

    ],

    itinerary: [

      { id: 'create', title: 'Create a 3/5/7-day itinerary', desc: 'Day-by-day plan with timing' },

      { id: 'relax', title: 'Make it more relaxed', desc: 'Reduce activities, add breaks' },

      { id: 'packed', title: 'Make it more packed', desc: 'Optimize route, more activities' },

      { id: 'mustdo', title: 'Plan around my must-dos', desc: 'Lock must-dos, fill gaps' },

      { id: 'rain', title: 'Rain plan', desc: 'Indoor alternative itinerary' },

      { id: 'order', title: 'Best order to do things', desc: 'Optimize by proximity and hours' },

      { id: 'late', title: 'Late start itinerary', desc: 'Schedule for late risers' },

      { id: 'surprise', title: 'Surprise me', desc: '3 itinerary styles to choose from' }

    ]

  }

};



function initializeChatbot() {

  // Initialize assistant state

  state.chatAssistant = {

    mode: 'menu',

    currentCategory: null,

    currentTask: null,

    userInputs: {},

    navigationStack: []

  };



  const container = document.getElementById('chatMessages');

  container.innerHTML = '';



  renderCategoryMenu();

}



function renderCategoryMenu() {

  const container = document.getElementById('chatMessages');



  const html = `

    <div class="assistant-home">

      <div class="assistant-header">

        <h2>\ud83d\udccd AI Travel Assistant</h2>

        <p class="assistant-subtitle">What can I help you with?</p>

      </div>

      

      <div class="category-grid">

        ${ASSISTANT_MENU.categories.map(cat => `

          <div class="category-card" onclick="showCategoryTasks('${cat.id}')">

            <div class="category-icon">${cat.icon}</div>

            <div class="category-info">

              <h3>${cat.name}</h3>

              <span class="category-count">${cat.taskCount} tasks</span>

            </div>

          </div>

        `).join('')}

      </div>

    </div>

  `;



  container.innerHTML = html;

  state.chatAssistant.mode = 'menu';

  state.chatAssistant.navigationStack = [];

}



function showCategoryTasks(categoryId) {

  const category = ASSISTANT_MENU.categories.find(c => c.id === categoryId);

  const tasks = ASSISTANT_MENU.tasks[categoryId] || [];



  state.chatAssistant.currentCategory = categoryId;

  state.chatAssistant.mode = 'category';

  state.chatAssistant.navigationStack.push({ type: 'category', id: categoryId });



  const container = document.getElementById('chatMessages');



  const html = `

    <div class="assistant-category">

      <div class="assistant-header">

        <button class="btn-back" onclick="goBackAssistant()">\u2190 All Categories</button>

        <h2>${category.icon} ${category.name}</h2>

      </div>

      

      <div class="task-list">

        ${tasks.map(task => `

          <div class="task-item" onclick="selectTask('${categoryId}', '${task.id}')">

            <div class="task-content">

              <h4>${task.title}</h4>

              <p>${task.desc}</p>

            </div>

            <span class="task-arrow">?</span>

          </div>

        `).join('')}

      </div>

    </div>

  `;



  container.innerHTML = html;

}



function selectTask(categoryId, taskId) {

  state.chatAssistant.currentTask = taskId;

  state.chatAssistant.mode = 'task';

  state.chatAssistant.userInputs = {};



  // Route to appropriate handler

  if (categoryId === 'destinations') {

    handleDestinationTask(taskId);

  } else if (categoryId === 'budget') {

    handleBudgetTask(taskId);

  } else if (categoryId === 'itinerary') {

    handleItineraryTask(taskId);

  } else {

    showComingSoon(categoryId, taskId);

  }

}



function handleDestinationTask(taskId) {

  const tasks = ASSISTANT_MENU.tasks.destinations;

  const task = tasks.find(t => t.id === taskId);



  switch (taskId) {

    case 'suggest_vibe':

      askFollowup('suggest_vibe', 0);

      break;

    case 'beach':

      askFollowup('beach', 0);

      break;

    case 'nature':

      askFollowup('nature', 0);

      break;

    case 'city_food':

      askFollowup('city_food', 0);

      break;

    case 'cheap':

      showCheapDestinations();

      break;

    case 'quiet':

      showQuietDestinations();

      break;

    default:

      showComingSoon('destinations', taskId);

  }

}



function handleBudgetTask(taskId) {

  if (taskId === 'breakdown' && state.trips.length > 0) {

    showBudgetBreakdown();

  } else {

    showComingSoon('budget', taskId);

  }

}



function handleItineraryTask(taskId) {

  showComingSoon('itinerary', taskId);

}



// Follow-up question system

const FOLLOWUP_QUESTIONS = {

  suggest_vibe: [

    { q: 'When are you traveling?', type: 'daterange', key: 'dates' },

    { q: 'What\'s your budget?', type: 'buttons', key: 'budget', options: ['Budget-Friendly', 'Mid-Range', 'Luxury'] },

    { q: 'What interests you?', type: 'multi', key: 'interests', options: ['Beach', 'Culture', 'Adventure', 'Food', 'Nightlife', 'Nature', 'Relaxation'] }

  ],

  beach: [

    { q: 'When?', type: 'daterange', key: 'dates' },

    { q: 'Budget range?', type: 'budget_slider', key: 'budget' },

    { q: 'Trip length?', type: 'buttons', key: 'length', options: ['Weekend', '3-5 days', 'Week+', '2+ weeks'] }

  ],

  nature: [

    { q: 'Dates?', type: 'daterange', key: 'dates' },

    { q: 'Activity level?', type: 'buttons', key: 'activity', options: ['Easy hikes', 'Moderate', 'Challenging'] },

    { q: 'Budget?', type: 'buttons', key: 'budget', options: ['Budget', 'Mid', 'Luxury'] }

  ],

  city_food: [

    { q: 'Travel dates?', type: 'daterange', key: 'dates' },

    { q: 'Budget per day?', type: 'budget_slider', key: 'dailyBudget' }

  ]

};



function askFollowup(taskId, questionIndex) {

  const questions = FOLLOWUP_QUESTIONS[taskId];

  if (!questions || questionIndex >= questions.length) {

    // All questions answered, show results

    showTaskResults(taskId);

    return;

  }



  const question = questions[questionIndex];

  const container = document.getElementById('chatMessages');



  let inputHtml = '';

  if (question.type === 'buttons') {

    inputHtml = `

      <div class="button-options">

        ${question.options.map(opt => `

          <button class="btn btn-option" onclick="answerFollowup('${taskId}', ${questionIndex}, '${question.key}', '${opt}')">

            ${opt}

          </button>

        `).join('')}

      </div>

    `;

  } else if (question.type === 'multi') {

    inputHtml = `

      <div class="multi-select-options" id="multiSelect_${question.key}">

        ${question.options.map(opt => `

          <label class="multi-option">

            <input type="checkbox" value="${opt}">

            <span>${opt}</span>

          </label>

        `).join('')}

      </div>

      <button class="btn btn-primary mt-md" onclick="submitMultiSelect('${taskId}', ${questionIndex}, '${question.key}')">

        Continue \u2192

      </button>

    `;

  } else if (question.type === 'daterange') {

    const today = new Date().toISOString().split('T')[0];

    inputHtml = `

      <div class="date-inputs">

        <input type="date" id="startDate" class="form-input" min="${today}" value="${today}">

        <span>to</span>

        <input type="date" id="endDate" class="form-input" min="${today}">

      </div>

      <button class="btn btn-primary mt-md" onclick="submitDateRange('${taskId}', ${questionIndex}, '${question.key}')">

        Continue \u2192

      </button>

    `;

  } else if (question.type === 'budget_slider') {

    inputHtml = `

      <div class="budget-slider">

        <input type="range" id="budgetRange" min="500" max="10000" step="100" value="2000"  

               oninput="document.getElementById('budgetValue').textContent = '$' + this.value">

        <div class="budget-display">

          <span id="budgetValue">$2000</span>

        </div>

      </div>

      <button class="btn btn-primary mt-md" onclick="submitBudgetSlider('${taskId}', ${questionIndex}, '${question.key}')">

        Continue \u2192

      </button>

    `;

  }



  const html = `

    <div class="followup-question">

      <button class="btn-back" onclick="goBackAssistant()">\u2190 Back</button>

      <div class="question-header">

        <div class="progress-dots">

          ${questions.map((_, i) => `<span class="dot ${i === questionIndex ? 'active' : i < questionIndex ? 'done' : ''}"></span>`).join('')}

        </div>

        <h3>${question.q}</h3>

      </div>

      ${inputHtml}

    </div>

  `;



  container.innerHTML = html;

}



function answerFollowup(taskId, questionIndex, key, value) {

  state.chatAssistant.userInputs[key] = value;

  askFollowup(taskId, questionIndex + 1);

}



function submitMultiSelect(taskId, questionIndex, key) {

  const checkboxes = document.querySelectorAll(`#multiSelect_${key} input:checked`);

  const values = Array.from(checkboxes).map(cb => cb.value);

  state.chatAssistant.userInputs[key] = values;

  askFollowup(taskId, questionIndex + 1);

}



function submitDateRange(taskId, questionIndex, key) {

  const start = document.getElementById('startDate').value;

  const end = document.getElementById('endDate').value;

  state.chatAssistant.userInputs[key] = { start, end };

  askFollowup(taskId, questionIndex + 1);

}



function submitBudgetSlider(taskId, questionIndex, key) {

  const value = document.getElementById('budgetRange').value;

  state.chatAssistant.userInputs[key] = parseInt(value);

  askFollowup(taskId, questionIndex + 1);

}



function showTaskResults(taskId) {

  const inputs = state.chatAssistant.userInputs;



  if (taskId === 'suggest_vibe') {

    showVibeResults(inputs);

  } else if (taskId === 'beach') {

    showBeachResults(inputs);

  } else if (taskId === 'nature') {

    showNatureResults(inputs);

  } else if (taskId === 'city_food') {

    showCityFoodResults(inputs);

  }

}



function showVibeResults(inputs) {

  // Filter destinations based on inputs

  const budget = inputs.budget?.toLowerCase().replace('-', '').replace('friendly', '').trim() || 'mid';

  const budgetMap = { 'budget': 'budget', 'mid': 'mid', 'midrange': 'mid', 'luxury': 'luxury' };

  const budgetFilter = budgetMap[budget] || 'mid';



  const interests = inputs.interests || [];



  let matches = DESTINATION_DATABASE.filter(dest => {

    let score = 0;

    if (dest.budget === budgetFilter) score += 3;

    interests.forEach(interest => {

      if (dest.vibe.includes(interest.toLowerCase())) score += 2;

    });

    return score > 0;

  }).sort((a, b) => {

    let scoreA = 0, scoreB = 0;

    if (a.budget === budgetFilter) scoreA += 3;

    if (b.budget === budgetFilter) scoreB += 3;

    interests.forEach(interest => {

      if (a.vibe.includes(interest.toLowerCase())) scoreA += 2;

      if (b.vibe.includes(interest.toLowerCase())) scoreB += 2;

    });

    return scoreB - scoreA;

  }).slice(0, 8);



  renderDestinationResults(matches, 'Based on your vibe, here are your top matches:');

}



function showBeachResults(inputs) {

  const beaches = DESTINATION_DATABASE.filter(d => d.vibe.includes('beach')).slice(0, 7);

  renderDestinationResults(beaches, 'Perfect beach destinations for your dates:');

}



function showNatureResults(inputs) {

  const nature = DESTINATION_DATABASE.filter(d =>

    d.vibe.includes('nature') || d.vibe.includes('adventure')

  ).slice(0, 6);

  renderDestinationResults(nature, '6 nature-focused destinations:');

}



function showCityFoodResults(inputs) {

  const cities = DESTINATION_DATABASE.filter(d =>

    d.vibe.includes('cultural') || d.vibe.includes('food')

  ).slice(0, 5);

  renderDestinationResults(cities, '5 cities ranked by food scene and walkability:');

}



function showCheapDestinations() {

  const cheap = DESTINATION_DATABASE.filter(d => d.budget === 'budget').slice(0, 10);

  renderDestinationResults(cheap, '10 budget-friendly destinations this month:');

}



function showQuietDestinations() {

  const quiet = DESTINATION_DATABASE.filter(d =>

    d.vibe.includes('relaxing') || d.vibe.includes('nature')

  ).slice(0, 6);

  renderDestinationResults(quiet, '6 quiet, relaxing destinations:');

}



function renderDestinationResults(destinations, title) {

  const container = document.getElementById('chatMessages');



  const html = `

    <div class="results-view">

      <button class="btn-back" onclick="renderCategoryMenu()">\u2190 Start Over</button>

      <h2>${title}</h2>

      

      <div class="results-grid">

        ${destinations.map((dest, i) => `

          <div class="destination-result-card" style="position: relative; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.08); transition: all 0.3s ease;" style="border-radius: 16px !important; overflow: hidden;">

            <div class="result-rank" style="position: absolute; top: 12px; left: 12px; background: linear-gradient(135deg, var(--primary-alpine), var(--mint)); color: white; padding: 6px 14px; border-radius: 20px; font-size: 0.9rem; font-weight: 700; z-index: 10; box-shadow: 0 2px 8px rgba(0,0,0,0.2);">#${i + 1}</div>

            <img src="https://source.unsplash.com/400x300/?${dest.name.toLowerCase()},travel" 

                 alt="${dest.name}" class="result-image">

            <div class="result-content">

              <h3>${dest.name}, ${dest.country}</h3>

              <p>${dest.desc}</p>

              <div class="result-tags">

                <span class="badge badge-${dest.budget}">\ud83d\udccd ${dest.budget}</span>

                ${dest.vibe.slice(0, 2).map(v =>

    `<span class="badge">${v}</span>`

  ).join('')}

              </div>

              <button class="btn btn-sm btn-primary" onclick="addDestinationFromChat('${dest.name}', '${dest.country}')">

                Add to Trip

              </button>

            </div>

          </div>

        `).join('')}

      </div>

      

      <div class="results-actions">

        <button class="btn btn-outline" onclick="renderCategoryMenu()">Start New Search</button>

      </div>

    </div>

  `;



  container.innerHTML = html;

  container.scrollTop = 0;

}



function showBudgetBreakdown() {

  if (!state.trips || state.trips.length === 0) {

    showComingSoon('budget', 'breakdown');

    return;

  }



  const trip = state.trips[0]; // Show first trip for demo

  const budget = trip.budget;



  const container = document.getElementById('chatMessages');

  const html = `

    <div class="results-view">

      <button class="btn-back" onclick="renderCategoryMenu()">\u2190 Start Over</button>

      <h2>Budget Breakdown: ${trip.name}</h2>

      

      <div class="budget-summary">

        <div class="budget-total">

          <h3>Total Budget</h3>

          <span class="budget-amount">${formatCurrency(budget.total, budget.currency)}</span>

        </div>

        

        <div class="budget-categories">

          <div class="budget-item">

            <span>Lodging (Est.)</span>

            <strong>${formatCurrency(budget.total * 0.4, budget.currency)}</strong>

          </div>

          <div class="budget-item">

            <span>Activities</span>

            <strong>${formatCurrency(budget.total * 0.3, budget.currency)}</strong>

          </div>

          <div class="budget-item">

            <span>Food (Est.)</span>

            <strong>${formatCurrency(budget.total * 0.2, budget.currency)}</strong>

          </div>

          <div class="budget-item">

            <span>Transport</span>

            <strong>${formatCurrency(budget.total * 0.1, budget.currency)}</strong>

          </div>

        </div>

        

        ${budget.expenses && budget.expenses.length > 0 ? `

          <div class="expenses-list">

            <h4>Tracked Expenses</h4>

            ${budget.expenses.map(exp => `

              <div class="expense-item">

                <span>${exp.description}</span>

                <strong>${formatCurrency(exp.amount, budget.currency)}</strong>

              </div>

            `).join('')}

          </div>

        ` : ''}

      </div>

    </div>

  `;



  container.innerHTML = html;

}



function showComingSoon(categoryId, taskId) {

  const container = document.getElementById('chatMessages');

  const category = ASSISTANT_MENU.categories.find(c => c.id === categoryId);



  const html = `

    <div class="coming-soon">

      <button class="btn-back" onclick="goBackAssistant()">\u2190 Back</button>

      <div class="coming-soon-content">

        <h2>\ud83d\udccd Coming Soon</h2>

        <p>This feature is being developed and will be available soon!</p>

        <button class="btn btn-primary" onclick="renderCategoryMenu()">Back to Menu</button>

      </div>

    </div>

  `;



  container.innerHTML = html;

}



function goBackAssistant() {

  const stack = state.chatAssistant.navigationStack;

  if (stack.length > 0) {

    stack.pop();

    if (stack.length === 0) {

      renderCategoryMenu();

    } else {

      const prev = stack[stack.length - 1];

      if (prev.type === 'category') {

        showCategoryTasks(prev.id);

      }

    }

  } else {

    renderCategoryMenu();

  }

}



function addChatMessage(sender, text, html = null) {

  // Keep for compatibility but not used in menu mode

  return;

}



function sendChatMessage() {

  // No longer needed - using menu instead

  return;

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

      <div class="wizard-step-circle">${step.num < wizardStep ? '\u2713' : step.num}</div>

      <div class="wizard-step-label">${step.label}</div>

    </div>

  `).join('');

}



function renderWizardStep(step) {

  const content = document.getElementById('wizardContent');

  const prevBtn = document.getElementById('wizardPrev');

  const nextBtn = document.getElementById('wizardNext');



  prevBtn.style.display = step === 1 ? 'none' : 'inline-flex';

  // Set button text and onclick handler for final step
  if (step === 7) {
    nextBtn.textContent = 'Create Trip ✓';
    nextBtn.style.display = 'inline-flex';
    nextBtn.disabled = false;
    nextBtn.onclick = function() {
      console.log('[Create Trip Button] Clicked! Calling savePlannedTrip...');
      savePlannedTrip();
    };
  } else {
    nextBtn.textContent = 'Next →';
    nextBtn.style.display = 'inline-flex';
    nextBtn.disabled = false;
    nextBtn.onclick = function() {
      wizardNext();
    };
  }



  switch (step) {

    case 1:

      content.innerHTML = `

        <h3 class="mb-md">Basic Trip Details</h3>

        <div class="field-group mb-md">

          <label class="form-label">Trip Name</label>

          <input type="text" id="plannerDestination" class="form-input" placeholder="e.g. Summer in Europe" value="${state.tripPlannerState.destination || ''}">

          <small class="text-muted">Give your trip a name!</small>

        </div>

        

        <!-- NEW DATES SECTION -->

        <div class="grid grid-2 gap-md mb-md">

           <div class="field-group">

            <label class="form-label">Start Date</label>

            <input type="date" id="plannerStartDate" class="form-input" value="${state.tripPlannerState.startDate || ''}">

          </div>

          <div class="field-group">

            <label class="form-label">End Date</label>

            <input type="date" id="plannerEndDate" class="form-input" value="${state.tripPlannerState.endDate || ''}">

          </div>

        </div>



        <div class="grid grid-2 gap-md">

          <div class="field-group">

            <label class="form-label">Total Budget</label>

            <input type="number" id="plannerBudget" class="form-input" placeholder="5000" value="${state.tripPlannerState.totalBudget || ''}">

          </div>

          <div class="field-group">

            <label class="form-label">Currency</label>

            <select id="plannerCurrency" class="form-select">

              <option value="USD">USD - US Dollar</option>

              <option value="EUR">EUR - Euro</option>

              <option value="GBP">GBP - British Pound</option>

              <option value="CAD">CAD - Canadian Dollar</option>

            </select>

          </div>

        </div>

        

        <div class="form-group mt-md">

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

            <button class="preference-option ${state.tripPlannerState.style === 'relaxing' ? 'selected' : ''}" onclick="selectOption('style', 'relaxing', this)">

              \ud83d\udccd Relaxing<br><small>Mostly downtime at hotel/spa</small>

            </button>

            <button class="preference-option ${state.tripPlannerState.style === 'balanced' ? 'selected' : ''}" onclick="selectOption('style', 'balanced', this)">

              \ud83d\udccd Balanced<br><small>Mix of activities & rest</small>

            </button>

            <button class="preference-option ${state.tripPlannerState.style === 'active' ? 'selected' : ''}" onclick="selectOption('style', 'active', this)">

              \ud83d\udccd Active<br><small>Packed with activities</small>

            </button>

          </div>

        </div>

        

        <div class="preference-question">

          <h3>What pace do you prefer?</h3>

          <div class="preference-options">

            <button class="preference-option ${state.tripPlannerState.pace === 'relaxed' ? 'selected' : ''}" onclick="selectOption('pace', 'relaxed', this)">

              \ud83d\udccd Relaxed<br><small>Take it slow</small>

            </button>

            <button class="preference-option ${state.tripPlannerState.pace === 'moderate' ? 'selected' : ''}" onclick="selectOption('pace', 'moderate', this)">

              \ud83d\udccd Moderate<br><small>Comfortable pace</small>

            </button>

            <button class="preference-option ${state.tripPlannerState.pace === 'packed' ? 'selected' : ''}" onclick="selectOption('pace', 'packed', this)">

              \ud83d\udccd Packed<br><small>See everything</small>

            </button>

          </div>

        </div>

        

        <div class="form-group">

          <label class="form-label">Interests (select all that apply)</label>

          <div class="preference-options">

            ${['Museums', 'Food', 'Shopping', 'Nature', 'Architecture', 'Nightlife'].map(interest => `

              <button class="preference-option ${state.tripPlannerState.interests.includes(interest) ? 'selected' : ''}" 

                      onclick="toggleInterest('${interest}', this)">

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

            <div class="budget-category-icon">\ud83d\udccd</div>

            <div class="budget-category-label">Lodging</div>

            <div class="budget-category-amount">${formatCurrency(allocation.lodging, state.tripPlannerState.currency)}</div>

            <div class="budget-category-percent">40%</div>

          </div>

          <div class="budget-category">

            <div class="budget-category-icon">\ud83d\udccd</div>

            <div class="budget-category-label">Activities</div>

            <div class="budget-category-amount">${formatCurrency(allocation.activities, state.tripPlannerState.currency)}</div>

            <div class="budget-category-percent">25%</div>

          </div>

          <div class="budget-category">

            <div class="budget-category-icon">\ud83d\uddd1\ufe0f</div>

            <div class="budget-category-label">Food</div>

            <div class="budget-category-amount">${formatCurrency(allocation.food, state.tripPlannerState.currency)}</div>

            <div class="budget-category-percent">25%</div>

          </div>

          <div class="budget-category">

            <div class="budget-category-icon">\ud83d\udccd</div>

            <div class="budget-category-label">Transport</div>

            <div class="budget-category-amount">${formatCurrency(allocation.transport, state.tripPlannerState.currency)}</div>

            <div class="budget-category-percent">10%</div>

          </div>

        </div>

      `;

      break;



    case 4:

      const hotelBudget = Math.round(state.tripPlannerState.budget * 0.40) || 0;

      const dest = state.tripPlannerState.destination || 'Destination';

      content.innerHTML = `

        <h3 class="mb-md">Choose Your Accommodation</h3>

        <p style="margin-bottom: 1rem;">Based on your ${formatCurrency(hotelBudget, state.tripPlannerState.currency)} lodging budget:</p>

        

        <div class="hotel-tier-card ${state.tripPlannerState.selectedHotel === 'budget' ? 'selected' : ''}" onclick="selectHotel('budget', this)">

          <div class="hotel-tier-badge budget">Budget</div>

          <h4>${dest} Budget Hotel</h4>

          <p>Comfortable accommodation in a great location. Clean rooms, friendly staff, basic amenities.</p>

          <p><strong>${formatCurrency(hotelBudget * 0.4, state.tripPlannerState.currency)}</strong> total</p>

          <a href="https://www.booking.com/searchresults.html?ss=${encodeURIComponent(dest)}" target="_blank" class="btn btn-sm btn-outline" onclick="event.stopPropagation()">View on Booking.com</a>

        </div>

        

        <div class="hotel-tier-card ${state.tripPlannerState.selectedHotel === 'mid' ? 'selected' : ''}" onclick="selectHotel('mid', this)">

          <div class="hotel-tier-badge mid">Mid-Range</div>

          <h4>${dest} Boutique Hotel</h4>

          <p>Stylish accommodation with excellent amenities. Pool, gym, room service, central location.</p>

          <p><strong>${formatCurrency(hotelBudget * 0.7, state.tripPlannerState.currency)}</strong> total</p>

          <a href="https://www.booking.com/searchresults.html?ss=${encodeURIComponent(dest)}" target="_blank" class="btn btn-sm btn-outline" onclick="event.stopPropagation()">View on Booking.com</a>

        </div>

        

        <div class="hotel-tier-card ${state.tripPlannerState.selectedHotel === 'premium' ? 'selected' : ''}" onclick="selectHotel('premium', this)">

          <div class="hotel-tier-badge premium">Premium</div>

          <h4>${dest} Luxury Resort</h4>

          <p>5-star luxury experience. Spa, fine dining, concierge service, premium location with views.</p>

          <p><strong>${formatCurrency(hotelBudget * 1.0, state.tripPlannerState.currency)}</strong> total</p>

          <a href="https://www.booking.com/searchresults.html?ss=${encodeURIComponent(dest)}" target="_blank" class="btn btn-sm btn-outline" onclick="event.stopPropagation()">View on Booking.com</a>

        </div>

      `;

      break;



    case 5:

      const activityBudget = Math.round(state.tripPlannerState.budget * 0.25) || 0;

      const sampleActivities = [

        { id: 'act1', name: 'City Walking Tour', cost: activityBudget * 0.1, duration: '3 hours', desc: 'Explore the main sights with a local guide' },

        { id: 'act2', name: 'Museum Pass', cost: activityBudget * 0.15, duration: 'Full day', desc: 'Access to top museums and cultural sites' },

        { id: 'act3', name: 'Food Tour', cost: activityBudget * 0.2, duration: '4 hours', desc: 'Taste local cuisine at hidden gems' },

        { id: 'act4', name: 'Day Trip', cost: activityBudget * 0.3, duration: 'Full day', desc: 'Excursion to nearby attractions' },

        { id: 'act5', name: 'Cultural Show', cost: activityBudget * 0.12, duration: '2 hours', desc: 'Traditional performance or event' },

        { id: 'act6', name: 'Adventure Activity', cost: activityBudget * 0.25, duration: 'Half day', desc: 'Outdoor adventure suited to location' }

      ];



      content.innerHTML = `

        <h3 class="mb-md">Select Activities</h3>

        <p style="margin-bottom: 1rem;">Your activity budget: ${formatCurrency(activityBudget, state.tripPlannerState.currency)}</p>

        

        ${sampleActivities.map((act) => `

          <div class="activity-card ${state.tripPlannerState.selectedActivities.some(a => a.id === act.id) ? 'selected' : ''}" onclick="toggleActivity('${act.id}', this)">

            <h4>${act.name}</h4>

            <p>${act.desc}</p>

            <div style="display: flex; justify-content: space-between; align-items: center;">

              <span><strong>${formatCurrency(act.cost, state.tripPlannerState.currency)}</strong> \\ud83c\\udfc6 ${act.duration}</span>

              <a href="https://www.viator.com/searchResults/all?text=${encodeURIComponent(state.tripPlannerState.destination + ' ' + act.name)}" target="_blank" class="btn btn-sm btn-outline" onclick="event.stopPropagation()">Book Now</a>

            </div>

          </div>

        `).join('')}

      `;

      // Pre-load MOCK_ACTIVITIES to ensure they exist for the toggle function

      if (typeof MOCK_ACTIVITIES === 'undefined' || !MOCK_ACTIVITIES.length) {

        window.MOCK_ACTIVITIES = sampleActivities;

      }

      break;



    case 6:

      content.innerHTML = `

        <h3 class="mb-md">Health & Readiness Integration</h3>

        <p style="margin-bottom: 2rem;">Connect your health data to optimize your daily itinerary based on your energy levels.</p>

        

        ${state.tripPlannerState.healthConnected ? `

          <div class="card card-dark">

            <h4 style="color: var(--mint); margin-bottom: 1rem;">? Health Data Connected</h4>

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

              \ud83d\udccd Your itinerary will adapt daily based on energy levels. Low-energy days will have lighter schedules with more downtime.

            </p>

          </div>

        ` : `

          <div class="card" style="text-align: center; padding: 3rem;">

            <div style="font-size: 4rem; margin-bottom: 1rem;">\ud83d\udccd</div>

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
      // Show loading state and trigger AI itinerary generation
      if (hasGeminiApiKey()) {
        content.innerHTML = `
          <div class="text-center" style="padding: 3rem;">
            <div class="loading-spinner" style="font-size: 3rem; margin-bottom: 1rem;">🌍</div>
            <h3 style="margin-bottom: 0.5rem;">Generating Your Personalized Itinerary...</h3>
            <p style="color: #666;">Our AI is creating a custom travel plan for ${state.tripPlannerState.destination}</p>
            <div class="loading-dots" style="margin-top: 1rem;">
              <span style="animation: pulse 1s infinite;">.</span>
              <span style="animation: pulse 1s infinite 0.2s;">.</span>
              <span style="animation: pulse 1s infinite 0.4s;">.</span>
            </div>
          </div>
          <style>
            @keyframes pulse { 0%, 100% { opacity: 0.3; } 50% { opacity: 1; } }
            .loading-spinner { animation: spin 2s linear infinite; }
            @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
          </style>
        `;
        // Trigger async AI generation
        loadAIItinerary();
      } else {
        // No API key - show message to configure it
        content.innerHTML = `
          <div class="text-center" style="padding: 2rem;">
            <div style="font-size: 3rem; margin-bottom: 1rem;">🔑</div>
            <h3 style="margin-bottom: 1rem;">AI Itinerary Generation</h3>
            <p style="color: #666; margin-bottom: 1.5rem;">
              To generate a personalized itinerary with real places and activities,
              please add your Gemini API key in your Profile settings.
            </p>
            <button class="btn btn-primary" onclick="navigateTo('profile')">Go to Settings</button>
            <p style="margin-top: 1.5rem; font-size: 0.9rem; color: #888;">
              Or continue to create the trip with a basic template itinerary.
            </p>
          </div>
        `;
      }
      break;

  }

}

// Load AI-generated itinerary for step 7
async function loadAIItinerary() {
  const content = document.getElementById('wizardContent');
  const ps = state.tripPlannerState;

  try {
    const aiItinerary = await generateAIItinerary(
      ps.destination,
      ps.startDate,
      ps.endDate,
      {
        style: ps.style,
        pace: ps.pace,
        budget: ps.budget,
        currency: ps.currency,
        travelers: ps.travelers,
        interests: ps.interests,
        mustDos: ps.mustDos
      }
    );

    // Store the AI itinerary in state for later use when saving
    state.tripPlannerState.aiItinerary = aiItinerary;

    // Render the AI-generated itinerary
    let html = `
      <div class="ai-itinerary">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
          <h3 style="margin: 0;">Your ${aiItinerary.destination} Itinerary</h3>
          <span style="background: var(--mint); color: var(--surface); padding: 0.25rem 0.75rem; border-radius: 1rem; font-size: 0.8rem;">AI Generated</span>
        </div>
        ${aiItinerary.summary ? `<p style="color: #666; margin-bottom: 1.5rem;">${aiItinerary.summary}</p>` : ''}
    `;

    // Render each day
    aiItinerary.days.forEach(day => {
      html += `
        <div class="itinerary-day" style="margin-bottom: 1.5rem; border: 1px solid #e0e0e0; border-radius: 12px; overflow: hidden;">
          <div class="itinerary-day-header" style="background: var(--surface); color: white; padding: 1rem; display: flex; justify-content: space-between; align-items: center;">
            <div>
              <strong>Day ${day.day}</strong> - ${formatDate(day.date)}
            </div>
            <div style="font-size: 0.85rem; opacity: 0.9;">${day.theme || ''}</div>
          </div>
          <div class="itinerary-activities" style="padding: 1rem;">
      `;

      day.activities.forEach(activity => {
        const typeIcon = {
          'sightseeing': '📍',
          'food': '🍽️',
          'transport': '🚗',
          'relaxation': '🧘',
          'adventure': '🎯',
          'shopping': '🛍️',
          'culture': '🎭'
        }[activity.type] || '📌';

        html += `
          <div class="itinerary-activity" style="display: flex; gap: 1rem; padding: 0.75rem 0; border-bottom: 1px solid #f0f0f0;">
            <div class="itinerary-activity-time" style="min-width: 80px; font-weight: 600; color: var(--primary);">${activity.time}</div>
            <div style="flex: 1;">
              <div style="font-weight: 500;">${typeIcon} ${activity.title}</div>
              ${activity.description ? `<div style="font-size: 0.85rem; color: #666; margin-top: 0.25rem;">${activity.description}</div>` : ''}
              ${activity.location ? `<div style="font-size: 0.8rem; color: #888; margin-top: 0.25rem;">📍 ${activity.location}</div>` : ''}
            </div>
            ${activity.cost_estimate ? `<div style="font-size: 0.8rem; color: var(--accent);">${activity.cost_estimate}</div>` : ''}
          </div>
        `;
      });

      html += `
          </div>
        </div>
      `;
    });

    // Add tips if available
    if (aiItinerary.tips && aiItinerary.tips.length > 0) {
      html += `
        <div style="background: #f8f8f8; padding: 1rem; border-radius: 8px; margin-top: 1rem;">
          <h4 style="margin: 0 0 0.5rem 0;">💡 Local Tips</h4>
          <ul style="margin: 0; padding-left: 1.5rem;">
            ${aiItinerary.tips.map(tip => `<li style="margin-bottom: 0.25rem;">${tip}</li>`).join('')}
          </ul>
        </div>
      `;
    }

    if (aiItinerary.estimated_daily_budget) {
      html += `
        <div style="text-align: center; margin-top: 1rem; padding: 1rem; background: var(--surface); color: white; border-radius: 8px;">
          Estimated Daily Budget: <strong>${aiItinerary.estimated_daily_budget}</strong>
        </div>
      `;
    }

    html += '</div>';
    content.innerHTML = html;

  } catch (error) {
    console.error('[loadAIItinerary] Error:', error);
    content.innerHTML = `
      <div class="text-center" style="padding: 2rem;">
        <div style="font-size: 3rem; margin-bottom: 1rem;">⚠️</div>
        <h3 style="margin-bottom: 1rem;">Could not generate itinerary</h3>
        <p style="color: #666; margin-bottom: 1rem;">${error.message}</p>
        <button class="btn btn-secondary" onclick="loadAIItinerary()">Try Again</button>
        <p style="margin-top: 1rem; font-size: 0.85rem; color: #888;">
          You can still create the trip - we'll use a basic template instead.
        </p>
      </div>
    `;
  }
}

function wizardNext() {

  console.log('[wizardNext] ENTER - current wizardStep:', wizardStep);

  const ps = state.tripPlannerState;



  // Validate current step

  if (wizardStep === 1) {

    if (!document.getElementById('plannerBudget').value ||

      !document.getElementById('plannerDestination').value ||

      !document.getElementById('plannerStartDate').value ||

      !document.getElementById('plannerEndDate').value) {

      showToast('Please fill in all required fields (Destination, Budget, Dates)', 'error');

      return;

    }

    ps.budget = parseFloat(document.getElementById('plannerBudget').value);

    ps.currency = document.getElementById('plannerCurrency').value;

    ps.destination = document.getElementById('plannerDestination').value;

    ps.startDate = document.getElementById('plannerStartDate').value;

    ps.endDate = document.getElementById('plannerEndDate').value;

    ps.travelers = parseInt(document.getElementById('plannerTravelers').value);

    console.log('[wizardNext] Step 1 data captured:', ps);

  }



  if (wizardStep === 2) {

    const mustDosInput = document.getElementById('plannerMustDos');

    if (mustDosInput) {

      ps.mustDos = mustDosInput.value.split(',').map(s => s.trim()).filter(s => s);

    }

  }



  if (wizardStep === 7) {

    // Create the trip

    try {

      savePlannedTrip();

    } catch (e) {

      console.error("Trip Creation Failed:", e);

      showToast('Error creating trip: ' + e.message, 'error');

    }

    return;

  }



  wizardStep++;

  console.log('[wizardNext] AFTER increment - wizardStep is now:', wizardStep);

  renderWizardSteps();

  renderWizardStep(wizardStep);

  console.log('[wizardNext] EXIT - rendering step:', wizardStep);

}



// HELPER FUNCTIONS LOST IN REFACTOR



function generateId() {

  return '_' + Math.random().toString(36).substr(2, 9);

}



function formatCurrency(amount, currency) {

  return new Intl.NumberFormat('en-US', { style: 'currency', currency: currency }).format(amount);

}



function wizardPrev() {

  wizardStep--;

  renderWizardSteps();

  renderWizardStep(wizardStep);

}



// ========== WIZARD INTERACTION FUNCTIONS ==========

// These functions handle button clicks in the wizard steps



function selectOption(category, value, btn) {

  // Update state

  state.tripPlannerState[category] = value;



  // Visual Feedback - remove selected from siblings, add to this button

  if (btn && btn.parentElement) {

    const container = btn.parentElement;

    const buttons = container.querySelectorAll('.preference-option, .selection-card, .btn-selection');

    buttons.forEach(b => b.classList.remove('selected'));

    btn.classList.add('selected');

  }



  console.log('selectOption:', category, '=', value);

}



function toggleInterest(interest, btn) {

  const interests = state.tripPlannerState.interests;

  const index = interests.indexOf(interest);



  if (index === -1) {

    interests.push(interest);

    if (btn) btn.classList.add('selected');

  } else {

    interests.splice(index, 1);

    if (btn) btn.classList.remove('selected');

  }



  console.log('toggleInterest:', interest, 'Interests now:', interests);

}



function selectHotel(tier, btn) {

  state.tripPlannerState.selectedHotel = tier;



  // Visual Feedback

  if (btn) {

    const container = btn.parentElement || document.getElementById('wizardContent');

    const cards = container.querySelectorAll('.hotel-tier-card');

    cards.forEach(c => c.classList.remove('selected'));

    btn.classList.add('selected');

  }



  console.log('selectHotel:', tier);

}



function toggleActivity(activityId, btn) {

  const activities = state.tripPlannerState.selectedActivities;



  // Find existing activity

  const existingIndex = activities.findIndex(a => a === activityId || (a && a.id === activityId));



  if (existingIndex === -1) {

    // Add the activity (store just the ID for simplicity)

    activities.push(activityId);

    if (btn) btn.classList.add('selected');

  } else {

    // Remove it

    activities.splice(existingIndex, 1);

    if (btn) btn.classList.remove('selected');

  }



  console.log('toggleActivity:', activityId, 'Activities now:', activities);

}



function connectHealthData() {

  state.tripPlannerState.healthConnected = true;

  renderWizardStep(wizardStep);

  showToast('Health data connected! (Simulated)', 'success');

}





function savePlannedTrip() {
  console.log('[savePlannedTrip] FUNCTION CALLED');
  try {
    console.log('[savePlannedTrip] Starting trip creation...');
    const ps = state.tripPlannerState;
    console.log('[savePlannedTrip] Planner state:', JSON.stringify(ps, null, 2));

    // Validate required fields
    if (!ps.destination || !ps.startDate || !ps.endDate) {
      showToast('Missing required trip details. Please go back and fill in all fields.', 'error');
      return;
    }

    // Use AI-generated itinerary if available, otherwise generate basic one
    let itinerary;
    if (ps.aiItinerary && ps.aiItinerary.days) {
      console.log('[savePlannedTrip] Using AI-generated itinerary');
      // Convert AI itinerary format to internal format
      itinerary = ps.aiItinerary.days.map((day, index) => {
        const activities = day.activities.map(act => ({
          title: act.title,
          description: act.description || '',
          location: act.location || '',
          time: act.time,
          type: act.type || 'sightseeing',
          duration: act.duration || 60,
          cost_estimate: act.cost_estimate || '',
          cals: 100,
          steps: 2000
        }));

        const dailySteps = activities.length * 2000;
        const dailyCals = activities.length * 100;

        return {
          day: day.day,
          date: day.date,
          weekday: new Date(day.date).toLocaleDateString('en-US', { weekday: 'long' }),
          focus: day.theme || 'Exploration',
          activities: activities,
          healthStats: {
            steps: dailySteps,
            calories: dailyCals
          }
        };
      });
      // Store tips and summary
      if (ps.aiItinerary.tips) {
        state.tripPlannerState.tips = ps.aiItinerary.tips;
      }
    } else {
      console.log('[savePlannedTrip] Using basic generated itinerary');
      itinerary = generateItinerary(ps.startDate, ps.endDate, ps);
    }
    console.log('[savePlannedTrip] Itinerary has', itinerary.length, 'days');

    // Calculate Health Score & Mode
    const healthData = calculateHealthScore(itinerary, ps);

    // Build trip name safely
    const tripName = (ps.destination && ps.destination.includes('Trip to'))
      ? ps.destination
      : `Trip to ${ps.destination || 'Unknown'}`;

    // Build description safely
    const tripDescription = `${ps.style || 'Custom'} trip with ${ps.pace || 'flexible'} pace`;

    const trip = {
      id: generateId(),
      name: tripName,
      description: tripDescription,
      startDate: ps.startDate,
      endDate: ps.endDate,
      destinations: [{ name: ps.destination, notes: `Budget: ${formatCurrency(ps.budget || 0, ps.currency || 'USD')}` }],
      budget: { total: ps.budget || 0, currency: ps.currency || 'USD', expenses: [] },
      itinerary: itinerary,
      healthScore: healthData,
      currentMode: 'Balanced',
      bodyStats: {
        mood: 'Good',
        sleep: 7,
        restingHR: 62,
        steps: 0
      },
      packingList: [],
      documents: []
    };

    // Merge temp destinations if any
    if (state.tempDestinations && state.tempDestinations.length > 0) {
      state.tempDestinations.forEach(d => {
        if (!trip.destinations.find(existing => existing.name === d)) {
          trip.destinations.push({ name: d, notes: 'Added from Explore' });
        }
      });
      state.tempDestinations = [];
      state.planningMode = false;
    }

    state.trips.push(trip);
    state.profile.stats.totalTrips++;
    state.profile.stats.totalDestinations += trip.destinations.length;
    saveData();

    awardXP(100, 'Created trip with planner');

    // CLOSE THE WIZARD UI
    closeInlinePlanner();

    showToast('Trip created successfully!', 'success');
    console.log('[savePlannedTrip] Trip created, navigating to itinerary');
    navigateTo('itinerary', trip.id);
  } catch (error) {
    console.error('[savePlannedTrip] Error creating trip:', error);
    showToast('Error creating trip: ' + error.message, 'error');
  }
}



// ==========================================

// ITINERARY GENERATION ENGINE (ENHANCED)

// ==========================================

function generateItinerary(start, end, prefs) {

  const startDt = new Date(start);

  const endDt = new Date(end);

  const diffTime = Math.abs(endDt - startDt);

  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

  const days = [];



  const activities = [

    { title: 'Morning Walk & Breakfast', type: 'active', duration: 90, cals: 300, steps: 4000, temp: 18, transit: 10 },

    { title: 'City Museum Tour', type: 'walking', duration: 120, cals: 200, steps: 3000, temp: 21, transit: 20 },

    { title: 'Local Market Exploration', type: 'walking', duration: 120, cals: 150, steps: 3000, temp: 27, transit: 15 },

    { title: 'Relaxing Lunch', type: 'sedentary', duration: 60, cals: 0, steps: 0, temp: 22, transit: 5 },

    { title: 'Afternoon Hike / Park', type: 'active', duration: 120, cals: 400, steps: 6000, temp: 20, transit: 30 },

    { title: 'Sunset Viewpoint', type: 'walking', duration: 60, cals: 100, steps: 1500, temp: 19, transit: 15 },

    { title: 'Dinner at Local Gem', type: 'sedentary', duration: 90, cals: 0, steps: 0, temp: 18, transit: 10 }

  ];



  for (let i = 0; i < diffDays; i++) {

    const currentDt = new Date(startDt);

    currentDt.setDate(startDt.getDate() + i);



    // Distribute Must-Dos

    let dayActivities = [];

    if (prefs.mustDos && prefs.mustDos.length > 0 && i < prefs.mustDos.length) {

      dayActivities.push({

        title: `Visit ${prefs.mustDos[i]}`,

        type: 'walking',

        duration: 120,

        cals: 200,

        steps: 2500,

        temp: 22,

        transit: 20,

        isMustDo: true

      });

    }



    // Fill remaining day based on pace

    const slots = prefs.pace === 'packed' ? 4 : (prefs.pace === 'moderate' ? 3 : 2);

    for (let j = 0; j < slots; j++) {

      const randomAct = activities[Math.floor(Math.random() * activities.length)];

      dayActivities.push({ ...randomAct });

    }



    // Calculate daily stats

    const dailySteps = dayActivities.reduce((acc, act) => acc + (act.steps || 0), 0);

    const dailyCals = dayActivities.reduce((acc, act) => acc + (act.cals || 0), 0);



    days.push({

      day: i + 1,

      date: currentDt.toISOString().split('T')[0],

      weekday: currentDt.toLocaleDateString('en-US', { weekday: 'long' }),

      focus: i === 0 ? 'Arrival' : (i === diffDays - 1 ? 'Departure' : 'Exploration'),

      activities: dayActivities,

      healthStats: {

        steps: dailySteps,

        calories: dailyCals

      }

    });

  }



  return days;

}



// ==========================================

// HEALTH SCORE ALGORITHM

// ==========================================

function calculateHealthScore(itinerary, prefs) {

  let score = 50; // Base score

  let totalSteps = 0;

  let activeMinutes = 0;



  itinerary.forEach(day => {

    totalSteps += day.healthStats.steps;

    day.activities.forEach(act => {

      if (act.type === 'active' || act.type === 'walking') {

        activeMinutes += act.duration;

      }

    });

  });



  const avgSteps = totalSteps / itinerary.length;



  // Scoring Logic

  if (avgSteps > 10000) score += 30;

  else if (avgSteps > 7000) score += 20;

  else if (avgSteps > 5000) score += 10;

  else score -= 10;



  if (prefs.style === 'active') score += 10;

  if (prefs.pace === 'packed') score += 5;

  if (prefs.foodStyle === 'healthy') score += 10;



  // Cap at 100, Min 0

  score = Math.min(100, Math.max(0, score));



  // Generate Suggestions

  const suggestions = [];

  if (avgSteps < 6000) suggestions.push("Try adding a morning walk to boost your step count.");

  if (prefs.style === 'relaxing' && score < 60) suggestions.push("Even a relaxing trip needs movement! Consider a yoga session.");

  if (activeMinutes / itinerary.length < 60) suggestions.push("Aim for at least 60 active minutes per day.");

  if (suggestions.length === 0) suggestions.push("You're doing great! Keep up the active lifestyle.");



  return {

    score: Math.round(score),

    rating: score > 80 ? 'Wellness Warrior' : (score > 60 ? 'Balanced Explorer' : 'Chill Seeker'),

    suggestions: suggestions,

    totalSteps: totalSteps,

    avgSteps: Math.round(avgSteps)

  };

}



// Global Alias for Create Trip Button

function showCreateTripModal() {

  launchInlinePlanner();

}



// NOTE: generateItinerary is defined earlier in the file (around line 1842)

// The function below generates mode-aware itineraries based on current mode and health data



// ==========================================

// MODE-AWARE ITINERARY GENERATION

// ==========================================

const ACTIVITY_POOL = {

  relaxed: [

    { title: 'Leisurely Breakfast at Cafe', type: 'sedentary', duration: 90, cals: 50, steps: 500, temp: 22, transit: 10 },

    { title: 'Gentle Morning Stroll', type: 'walking', duration: 60, cals: 100, steps: 2000, temp: 20, transit: 0 },

    { title: 'Spa & Wellness Session', type: 'sedentary', duration: 120, cals: 50, steps: 200, temp: 24, transit: 15 },

    { title: 'Scenic Lunch with View', type: 'sedentary', duration: 90, cals: 0, steps: 300, temp: 22, transit: 10 },

    { title: 'Quiet Reading in Park', type: 'sedentary', duration: 90, cals: 20, steps: 500, temp: 21, transit: 10 },

    { title: 'Sunset Wine Tasting', type: 'sedentary', duration: 90, cals: 30, steps: 400, temp: 19, transit: 15 },

    { title: 'Early Dinner & Rest', type: 'sedentary', duration: 90, cals: 0, steps: 300, temp: 20, transit: 10 }

  ],

  balanced: [

    { title: 'Morning Walk & Breakfast', type: 'active', duration: 90, cals: 300, steps: 4000, temp: 18, transit: 10 },

    { title: 'City Museum Tour', type: 'walking', duration: 120, cals: 200, steps: 3000, temp: 21, transit: 20 },

    { title: 'Local Market Exploration', type: 'walking', duration: 120, cals: 150, steps: 3000, temp: 27, transit: 15 },

    { title: 'Relaxing Lunch', type: 'sedentary', duration: 60, cals: 0, steps: 0, temp: 22, transit: 5 },

    { title: 'Afternoon Hike / Park', type: 'active', duration: 120, cals: 400, steps: 6000, temp: 20, transit: 30 },

    { title: 'Sunset Viewpoint', type: 'walking', duration: 60, cals: 100, steps: 1500, temp: 19, transit: 15 },

    { title: 'Dinner at Local Gem', type: 'sedentary', duration: 90, cals: 0, steps: 0, temp: 18, transit: 10 }

  ],

  intense: [

    { title: 'Sunrise Jogging Tour', type: 'active', duration: 60, cals: 500, steps: 8000, temp: 16, transit: 0 },

    { title: 'Mountain/Hill Hike', type: 'active', duration: 180, cals: 800, steps: 12000, temp: 18, transit: 30 },

    { title: 'City Walking Tour (Extended)', type: 'walking', duration: 180, cals: 400, steps: 8000, temp: 22, transit: 15 },

    { title: 'Adventure Activity (Kayak/Bike)', type: 'active', duration: 150, cals: 600, steps: 3000, temp: 24, transit: 25 },

    { title: 'Quick Lunch Break', type: 'sedentary', duration: 45, cals: 0, steps: 0, temp: 22, transit: 5 },

    { title: 'Evening Night Market Crawl', type: 'walking', duration: 120, cals: 250, steps: 5000, temp: 20, transit: 10 },

    { title: 'Late Night Food Tour', type: 'walking', duration: 90, cals: 150, steps: 3000, temp: 18, transit: 15 }

  ]

};



function generateModeAwareItinerary(trip, mode) {

  const start = trip.startDate;

  const end = trip.endDate;

  const startDt = new Date(start);

  const endDt = new Date(end);

  const diffTime = Math.abs(endDt - startDt);

  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

  const days = [];



  // Select activity pool based on mode

  let activityPool;

  let slotsPerDay;



  switch (mode) {

    case 'Protect':

      activityPool = ACTIVITY_POOL.relaxed;

      slotsPerDay = 2; // Fewer activities for recovery

      break;

    case 'Go Big':

      activityPool = ACTIVITY_POOL.intense;

      slotsPerDay = 5; // Maximum activities

      break;

    case 'Balanced':

    default:

      activityPool = ACTIVITY_POOL.balanced;

      slotsPerDay = 3; // Moderate activities

      break;

  }



  // Consider health data if available

  const bodyStats = trip.bodyStats || {};

  if (bodyStats.sleep && bodyStats.sleep < 6) {

    // Poor sleep: reduce intensity

    slotsPerDay = Math.max(2, slotsPerDay - 1);

  }

  if (bodyStats.mood === 'Tired') {

    // Tired mood: reduce intensity

    slotsPerDay = Math.max(2, slotsPerDay - 1);

  }



  for (let i = 0; i < diffDays; i++) {

    const currentDt = new Date(startDt);

    currentDt.setDate(startDt.getDate() + i);



    let dayActivities = [];



    // Add varied activities for the day

    const usedIndices = new Set();

    for (let j = 0; j < slotsPerDay; j++) {

      let idx;

      do {

        idx = Math.floor(Math.random() * activityPool.length);

      } while (usedIndices.has(idx) && usedIndices.size < activityPool.length);

      usedIndices.add(idx);

      dayActivities.push({ ...activityPool[idx], id: `act-${i}-${j}` });

    }



    // Calculate daily stats

    const dailySteps = dayActivities.reduce((acc, act) => acc + (act.steps || 0), 0);

    const dailyCals = dayActivities.reduce((acc, act) => acc + (act.cals || 0), 0);



    days.push({

      day: i + 1,

      date: currentDt.toISOString().split('T')[0],

      weekday: currentDt.toLocaleDateString('en-US', { weekday: 'long' }),

      focus: i === 0 ? 'Arrival' : (i === diffDays - 1 ? 'Departure' : 'Exploration'),

      activities: dayActivities,

      healthStats: {

        steps: dailySteps,

        calories: dailyCals

      }

    });

  }



  return days;

}



// ==========================================

// HEALTH SCORE ALGORITHM

// ==========================================

function calculateHealthScore(itinerary, prefs) {

  let score = 50; // Base score

  let totalSteps = 0;

  let activeMinutes = 0;



  itinerary.forEach(day => {

    totalSteps += day.healthStats.steps;

    day.activities.forEach(act => {

      if (act.type === 'active' || act.type === 'walking') {

        activeMinutes += act.duration;

      }

    });

  });



  const avgSteps = totalSteps / itinerary.length;



  // Scoring Logic

  if (avgSteps > 10000) score += 30;

  else if (avgSteps > 7000) score += 20;

  else if (avgSteps > 5000) score += 10;

  else score -= 10;



  if (prefs.style === 'active') score += 10;

  if (prefs.pace === 'packed') score += 5;

  if (prefs.foodStyle === 'healthy') score += 10;



  // Cap at 100, Min 0

  score = Math.min(100, Math.max(0, score));



  // Generate Suggestions

  const suggestions = [];

  if (avgSteps < 6000) suggestions.push("Try adding a morning walk to boost your step count.");

  if (prefs.style === 'relaxing' && score < 60) suggestions.push("Even a relaxing trip needs movement! Consider a yoga session.");

  if (activeMinutes / itinerary.length < 60) suggestions.push("Aim for at least 60 active minutes per day.");

  if (suggestions.length === 0) suggestions.push("You're doing great! Keep up the active lifestyle.");



  return {

    score: Math.round(score),

    rating: score > 80 ? 'Wellness Warrior' : (score > 60 ? 'Balanced Explorer' : 'Chill Seeker'),

    suggestions: suggestions,

    totalSteps: totalSteps,

    avgSteps: Math.round(avgSteps)

  };

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

    document.getElementById('explorePage').classList.remove('hidden');

    // Auto-load destinations when Explore page is displayed

    setTimeout(() => {

      if (document.getElementById('countryGrid').innerHTML.trim() === '') {

        renderDestinationCards(DESTINATION_DATABASE);

      }

    }, 50);

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

  document.getElementById('chatPage').classList.remove('hidden');

  if (!state.chatAssistant || !state.chatAssistant.mode) {

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

      '<div class="empty-state"><div class="empty-icon">\ud83d\udccd</div><p class="empty-message">Search for countries or cities to explore destinations</p></div>';

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



function renderCityResults(cities) {

  const grid = document.getElementById('countryGrid');



  if (cities.length === 0) {

    grid.innerHTML = '<div class="empty-state"><div class="empty-icon">\ud83d\udccd</div><p class="empty-message">No destinations match your filters</p></div>';

    return;

  }



  grid.innerHTML = cities.map(city => `

    <div class="city-card">

      <h3 class="country-name">${city.name}</h3>

      <div style="opacity: 0.7; margin-bottom: 0.5rem;">${city.country}</div>

      <p style="font-size: 0.875rem; margin-bottom: 1rem;">${city.desc}</p>

      <div style="display: flex; gap: 0.5rem; flex-wrap: wrap; margin-bottom: 1rem;">

        <span style="background: rgba(31,122,90,0.1); padding: 0.25rem 0.5rem; border-radius: 4px; font-size: 0.75rem;">\ud83d\udccd ${city.budget}</span>

        ${city.vibe.slice(0, 2).map(v => `<span style="background: rgba(31,122,90,0.1); padding: 0.25rem 0.5rem; border-radius: 4px; font-size: 0.75rem;">${v}</span>`).join('')}

      </div>

      <button class="btn btn-primary" onclick="addCountryToTrip('${city.name}, ${city.country}')">Add to Trip</button>

    </div>

  `).join('');

}



function renderHome() {

  document.getElementById('homePage').classList.remove('hidden');

  const grid = document.getElementById('tripsGrid');



  // Safety check and filter

  const validTrips = (state.trips || []).filter(t => t && t.id && t.name);



  if (validTrips.length === 0) {

    grid.innerHTML = `

      <div class="empty-state" style="grid-column: 1 / -1;">

        <div class="empty-icon">\ud83d\udccd</div>

        <h3 class="empty-title">No trips yet</h3>

        <p class="empty-message">Start planning your first adventure!</p>

        <button class="btn btn-primary" onclick="showCreateTripModal()">Create Trip</button>

      </div>

    `;

    return;

  }



  grid.innerHTML = validTrips.map(trip => `

    <div class="card trip-card">

      <div class="card-header">

        <h3 class="card-title">${sanitizeHTML(trip.name)}</h3>

        <p class="card-subtitle">${formatDate(trip.startDate)} - ${formatDate(trip.endDate)}</p>

      </div>

      <div class="card-body">

        <p>${sanitizeHTML(trip.description || 'No description')}</p>

        <div class="trip-stats">

          <div class="trip-stat">

            <span class="trip-stat-icon">\ud83d\udccd</span>

            <span>${trip.destinations ? trip.destinations.length : 0} destinations</span>

          </div>

          <div class="trip-stat">

            <span class="trip-stat-icon">\ud83d\udccd</span>

            <span>${trip.budget?.expenses?.length || 0} expenses</span>

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



// ========== TRIP DETAIL PAGE ==========

// ========== TRIP DETAIL PAGE ==========

function renderTripDetail(tripId) {

  console.log('Rendering Trip Detail for:', tripId);

  const trip = getTripById(tripId);

  if (!trip) {

    console.error('Trip not found:', tripId);

    navigateTo('home');

    return;

  }

  console.log('Trip Data:', trip);



  document.getElementById('tripDetailPage').classList.remove('hidden');



  document.getElementById('tripHeader').innerHTML = `

    <div class="card card-dark">

      <h1 style="color: var(--text-light); margin-bottom: 1rem;">${sanitizeHTML(trip.name)}</h1>

      <p style="color: var(--mint); margin-bottom: 1rem;">${formatDate(trip.startDate)} - ${formatDate(trip.endDate)}</p>

      <p style="color: var(--text-light);">${sanitizeHTML(trip.description || 'No description')}</p>

      <div style="margin-top: 1rem; display: flex; gap: 0.5rem;">

        <button class="btn btn-sm btn-primary" onclick="shareTrip('${trip.id}')">\ud83d\udd17 Share</button>

        <button class="btn btn-sm btn-danger" onclick="deleteTrip('${trip.id}')">Delete Trip</button>

      </div>

    </div>

  `;



  // Render all tab contents so they are populated when user clicks tabs

  renderOverviewTab(trip);

  renderItinerary(trip);

  renderBudgetTab(trip);

  renderMapTab(trip);

  renderPackingTab(trip);

  renderDocumentsTab(trip);



  // Attach Tab Listeners (Dynamically if needed, or rely on global)

  // Ensure we switch to overview by default or keep current

  console.log('Switching to Overview Tab');

  switchTab('overview');

}



// Global Tab Switching Logic

function switchTab(tabName) {

  console.log('Switching tab to:', tabName);

  document.querySelectorAll('.tab').forEach(t => {

    t.classList.toggle('active', t.dataset.tab === tabName);

  });

  document.querySelectorAll('.tab-content').forEach(c => {

    c.classList.toggle('active', c.id === `${tabName}Tab`);

    if (c.id === `${tabName}Tab`) console.log('Activating tab content:', c.id);

  });

  state.currentTab = tabName;



  // Fix map rendering: reinitialize or resize map when map tab becomes visible

  if (tabName === 'map') {

    setTimeout(() => {

      if (mapInstance) {

        // Map exists, just resize it to fit the container

        mapInstance.invalidateSize();

        console.log('Map resized');

      } else {

        // Map doesn't exist, initialize it

        const trip = getTripById(state.currentTripId);

        if (trip) {

          initializeMap(trip);

          console.log('Map initialized');

        }

      }

    }, 100);

  }

}



// ========== TAB RENDERING ==========

function renderOverviewTab(trip) {

  console.log('Rendering Overview Tab', trip);

  const container = document.getElementById('overviewTab');

  if (!container) {

    console.error('Overview Tab Container Not Found!');

    return;

  }



  // Health Score HTML

  let healthHTML = '';

  if (trip.healthScore) {

    const hs = trip.healthScore;

    const color = hs.score > 80 ? '#1F7A5A' : (hs.score > 50 ? '#F2C94C' : '#EB5757');



    healthHTML = `

        <div class="card mb-lg">

          <div class="flex-between align-center mb-md">

            <div>

               <h3 class="mb-xs">Health Score</h3>

               <div class="text-sm text-muted">Based on your itinerary</div>

            </div>

            <div style="text-align: right;">

               <div style="font-size: 2rem; font-weight: 800; color: ${color};">${hs.score}</div>

               <div class="badge" style="background: ${color}20; color: ${color};">${hs.rating}</div>

            </div>

          </div>

          

          <div class="mb-md">

            <div class="flex-between mb-xs">

              <span>Average Daily Steps</span>

              <strong>${hs.avgSteps.toLocaleString()} \ud83d\udccd</strong>

            </div>

            <div class="progress-bar">

               <div class="progress-fill" style="width: ${Math.min(100, (hs.avgSteps / 10000) * 100)}%; background-color: ${color};"></div>

            </div>

          </div>

          

          <div class="p-sm bg-light rounded">

            <strong>\ud83d\udccd Suggestion:</strong> ${hs.suggestions[0]}

          </div>

        </div>

      `;

  } else {

    console.warn('Trip has no healthScore');

  }



  container.innerHTML = `

    <div class="grid grid-2 gap-lg">

      <div class="trip-stats-col">

          ${healthHTML}

          

          <div class="card mb-lg">

             <div class="flex-between mb-md">

                <h3>Destinations</h3>

                <button class="btn btn-sm btn-primary" onclick="showAddDestinationModal('${trip.id}')">+ Add</button>

             </div>

             <ul class="dest-list">

               ${(trip.destinations || []).map((d, i) => `

                 <li class="card p-sm mb-sm flex-between align-center">

                    <span>\ud83d\udccd ${d.name} <small class="text-muted">(${d.notes || 'No notes'})</small></span>

                    <button class="btn btn-sm btn-icon btn-danger" onclick="deleteDestination('${trip.id}', ${i})">\ud83d\uddd1\ufe0f</button>

                 </li>

               `).join('')}

             </ul>

             ${(!trip.destinations || trip.destinations.length === 0) ? '<p class="text-muted">No destinations yet.</p>' : ''}

          </div>

      </div>

      

      <div class="trip-details-col">

         <div class="card">

           <h3 class="mb-md">Budget Overview</h3>

           <div class="text-3xl font-bold mb-xs">${formatCurrency(trip.budget?.total || 0, trip.budget?.currency || 'USD')}</div>

           <p class="text-muted">Total Budget</p>

         </div>

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

            <div class="empty-icon">\ud83d\udccd</div>

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

                    <div class="expense-meta">${exp.category} \\ud83c\\udfc6 ${formatDate(exp.date)}</div>

                  </div>

                </div>

                <div class="expense-amount">${formatCurrency(exp.amount, trip.budget.currency)}</div>

                <button class="btn btn-sm btn-icon btn-danger" onclick="deleteExpense('${trip.id}', ${i})">\ud83d\uddd1\ufe0f</button>

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

  const categoryIcons = { Documents: '\ud83d\udfe0', Clothing: '\ud83d\udfe0', Toiletries: '\ud83d\udfe0', Electronics: '\ud83d\udfe0', Other: '\ud83d\udfe0' };



  const totalItems = trip.packingList.length;

  const checkedItems = trip.packingList.filter(item => item.checked).length;

  const progress = totalItems > 0 ? (checkedItems / totalItems) * 100 : 0;



  document.getElementById('packingTab').innerHTML = `

    <div class="card">

      <div class="card-header">

        <h3>Packing List</h3>

        <div style="display: flex; gap: 0.5rem;">

          <button class="btn btn-sm btn-outline" onclick="addSmartSuggestions('${trip.id}')">? Smart Suggestions</button>

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

            <div class="empty-icon">\ud83d\udccd</div>

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

                          <button class="btn btn-sm btn-icon btn-danger" onclick="deletePackingItem('${trip.id}', ${globalIndex})">\ud83d\uddd1\ufe0f</button>

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

  const typeIcons = { Passport: '\ud83d\udfe0', Visa: '\ud83d\udfe0', Insurance: '\ud83d\udfe0', Ticket: '\ud83d\udfe0', Other: '\ud83d\udfe0' };



  document.getElementById('documentsTab').innerHTML = `

    <div class="card">

      <div class="card-header flex-between">

        <h3>Documents <span class="badge">${trip.documents.length}</span></h3>

        <button class="btn btn-sm btn-primary" onclick="showUploadDocumentModal('${trip.id}')">+ Upload</button>

      </div>

      <div class="card-body">

        ${trip.documents.length === 0 ? `

          <div class="empty-state">

            <div class="empty-icon">\ud83d\udccd</div>

            <p class="empty-message">No documents uploaded yet</p>

          </div>

        ` : `

          <div class="document-list">

            ${trip.documents.map((doc, i) => `

              <div class="document-item">

                <div class="document-icon-large">${typeIcons[doc.type] || '\ud83d\udcb5'}</div>

                <div class="document-name">${sanitizeHTML(doc.name)}</div>

                <div class="document-meta">${doc.type} \\ud83c\\udfc6 ${(doc.size / 1024).toFixed(1)} KB</div>

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



// ========== EXPLORE PAGE ==========

function renderExplore() {

  const explorePage = document.getElementById('explorePage');

  explorePage.classList.remove('hidden');



  // PLANNING MODE BAR

  let builderBar = document.getElementById('tripBuilderBar');

  if (state.planningMode) {

    if (!builderBar) {

      builderBar = document.createElement('div');

      builderBar.id = 'tripBuilderBar';

      builderBar.className = 'trip-builder-bar';

      builderBar.innerHTML = `

        <div class="container flex-between align-center">

          <div>

            <span class="text-lg mr-sm">\ud83d\uddd1\ufe0f <b>Trip Builder</b></span>

            <span id="builderDestCount" class="badge badge-primary">${state.tempDestinations.length} places selected</span>

          </div>

          <div>

            <button class="btn btn-sm btn-outline mr-sm" onclick="cancelPlanningMode()">Cancel</button>

            <button class="btn btn-sm btn-primary" onclick="launchInlinePlanner()">Done & Plan ?</button>

          </div>

        </div>

      `;

      document.body.appendChild(builderBar);

    } else {

      // Update count

      const countBadge = document.getElementById('builderDestCount');

      if (countBadge) countBadge.innerText = `${state.tempDestinations.length} places selected`;

    }

  } else if (builderBar) {

    builderBar.remove();

  }



  // Default search if empty

  const countryGrid = document.getElementById('countryGrid');

  if (!countryGrid.hasChildNodes()) {

    searchCountries(''); // Load all

  }

}



function cancelPlanningMode() {

  state.planningMode = false;

  state.tempDestinations = [];

  renderExplore();

  showToast('Planning cancelled', 'info');

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

  // Update API key status
  const apiKeyStatus = document.getElementById('apiKeyStatus');
  const apiKeyInput = document.getElementById('geminiApiKey');
  if (apiKeyStatus && apiKeyInput) {
    if (hasGeminiApiKey()) {
      apiKeyStatus.innerHTML = '<span style="color: var(--mint);">API key is configured</span>';
      apiKeyInput.placeholder = '••••••••••••••••';
    } else {
      apiKeyStatus.innerHTML = '<span style="color: #666;">No API key configured yet</span>';
    }
  }
}



// ========== MODAL HELPERS ==========

function showCreateTripModal() {

  showModal('Create New Trip', `

    <div class="field-group">

      <label>Your Name for this Trip</label>

      <input type="text" id="tripDestination" value="${state.tripPlannerState.destination}" placeholder="e.g. Summer in Europe">

      <small class="text-muted">If entering specific place, type it here. If exploring multiple, give it a fun name!</small>

    </div>

    <div class="grid grid-2 gap-md mt-md">

      <div class="field-group">

        <label>Start Date</label>

        <input type="date" id="tripStartDate" value="${state.tripPlannerState.startDate}" class="form-input">

      </div>

       <div class="field-group">

        <label>End Date</label>

        <input type="date" id="tripEndDate" value="${state.tripPlannerState.endDate}" class="form-input">

      </div>

    </div>

    <div class="field-group mt-md">

      <label>Who is traveling?</label>

      <input type="number" id="travelers" value="${state.tripPlannerState.travelers}" min="1" class="form-input">

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



// NOTE: switchTab function is defined earlier (line 2280) and takes only tabName argument

// Do NOT redefine it here. The global event delegation handles tab switching.



// ========== INITIALIZATION ==========

document.addEventListener('DOMContentLoaded', () => {

  loadData();



  window.addEventListener('hashchange', handleRouteChange);



  document.getElementById('createTripBtn').addEventListener('click', showCreateTripModal);

  document.getElementById('createTripBtn2').addEventListener('click', showCreateTripModal);



  document.getElementById('tripTabs').addEventListener('click', (e) => {

    if (e.target.classList.contains('tab')) {

      switchTab(e.target.dataset.tab);

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



  // NOTE: Wizard navigation is wired in initInlinePlannerListeners()

  // Do NOT add duplicate event listeners here



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

      applyFilters(); // Call the proper filter function

    });

  }



  const clearFiltersBtn = document.getElementById('clearFilters');

  if (clearFiltersBtn) {

    clearFiltersBtn.addEventListener('click', () => {

      clearFilters(); // Call the proper clear function

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

        icon: '\ud83d\udccd',

        name: dest.name,

        country: dest.country,

        meta: `${dest.country} \\ud83c\\udfc6 City`,

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



// Launch the inline trip planner wizard (Branching Entry Point)

// Launch the inline trip planner wizard (Branching Entry Point)

function launchInlinePlanner() {

  console.log('Launching Planner. Mode:', state.planningMode, 'Destinations:', state.tempDestinations);



  // ROBUST CHECK: If we have temp destinations, we are definitely in planning mode

  if (state.tempDestinations && state.tempDestinations.length > 0) {

    startPlanningWizard(state.tempDestinations);

    return;

  }



  // Show Choice Modal

  const content = `

    <div class="text-center p-md">

      <div class="emoji-xl mb-md">?</div>

      <h3 class="mb-md">How would you like to start?</h3>

      <div class="grid grid-2 gap-md">

        <button class="btn btn-outline p-lg text-center" style="height: auto; white-space: normal; flex-direction: column; width: 100%; min-height: 180px;" onclick="closeModal(); startPlanningWizard()">

          <div class="text-2xl mb-sm">\ud83d\udccd</div>

          <div class="font-bold">I know where I'm going</div>

          <div class="text-xs text-muted mt-xs" style="opacity: 0.8; font-weight: 400;">Enter a specific destination</div>

        </button>

        <button class="btn btn-primary p-lg text-center" style="height: auto; white-space: normal; flex-direction: column; width: 100%; min-height: 180px;" onclick="closeModal(); enterExplorePlanningMode()">

          <div class="text-2xl mb-sm">\ud83d\udccd</div>

          <div class="font-bold">Inspire Me</div>

          <div class="text-xs text-light mt-xs" style="opacity: 0.9; font-weight: 400;">Browse & select places to visit</div>

        </button>

      </div>

    </div>

  `;

  showModal('Create New Trip', content, []);

}



function initializeEventListeners() {

  initInlinePlannerListeners();



  // ROBUST TAB SWITCHING (Event Delegation)

  // This works even if tabs are re-rendered

  document.body.addEventListener('click', (e) => {

    if (e.target.matches('.tab')) {

      const target = e.target.dataset.tab;

      if (target) {

        console.log('Tab Clicked via Delegation:', target);

        switchTab(target);

      }

    }

  });



  console.log('? Global Event Listeners Initialized (Delegated)');

}



function enterExplorePlanningMode() {

  state.planningMode = true;

  state.tempDestinations = [];

  navigateTo('explore');

  showToast('Planning Mode: Select destinations to build your trip! ???', 'info');

  renderExplore(); // Re-render to show trip builder bar

}



function startPlanningWizard(prefilledDestinations = []) {

  const overlay = document.getElementById('inlinePlannerOverlay');

  if (!overlay) {

    console.error('Inline planner overlay not found');

    return;

  }



  // Reset wizard state for new trip creation

  wizardStep = 1;

  state.tripPlannerState = {

    destination: prefilledDestinations.length > 0 ? prefilledDestinations.join(', ') : '',

    startDate: '',

    endDate: '',

    travelers: 1,

    budget: '', // Changed from totalBudget to match wizardNext validation

    currency: 'USD',

    pace: 'moderate',

    style: 'balanced', // Renamed from foodStyle/accommodation mismatch

    interests: [],

    mustDos: [],

    selectedHotel: null,

    selectedActivities: [],

    healthConnected: false

  };



  // Show overlay

  overlay.classList.remove('hidden');



  // Initialize wizard

  renderWizardSteps();

  renderWizardStep(1);



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



// ========== WIZARD INTERACTION FUNCTIONS (RESTORED) ==========



function selectOption(category, value, btn) {

  // Update state

  state.tripPlannerState[category] = value;



  // Visual Feedback

  const container = btn.parentElement;

  const buttons = container.querySelectorAll('.selection-card, .btn-selection'); // Handle both styles

  buttons.forEach(b => b.classList.remove('selected'));

  btn.classList.add('selected');

}



function toggleInterest(interest, btn) {

  const index = state.tripPlannerState.interests.indexOf(interest);

  if (index === -1) {

    state.tripPlannerState.interests.push(interest);

    btn.classList.add('selected');

  } else {

    state.tripPlannerState.interests.splice(index, 1);

    btn.classList.remove('selected');

  }

}



function selectHotel(hotelId, btn) {

  // Find hotel object

  const hotel = MOCK_HOTELS.find(h => h.id === hotelId);

  state.tripPlannerState.selectedHotel = hotel;



  // Visual Feedback

  const container = document.getElementById('hotelSelectionContainer');

  const cards = container.querySelectorAll('.selection-card');

  cards.forEach(c => c.classList.remove('selected'));

  btn.classList.add('selected');

}



function toggleActivity(activityId, btn) {

  const activity = MOCK_ACTIVITIES.find(a => a.id === activityId);

  if (!activity) return;



  const index = state.tripPlannerState.selectedActivities.findIndex(a => a.id === activityId);



  if (index === -1) {

    state.tripPlannerState.selectedActivities.push(activity);

    btn.classList.add('selected');

  } else {

    state.tripPlannerState.selectedActivities.splice(index, 1);

    btn.classList.remove('selected');

  }

}



// NOTE: wizardPrev and wizardNext functions are defined earlier in the file

// Do NOT redefine them here



// Updated savePlannedTrip function to persist itinerary





// ==========================================

// HEALTH DASHBOARD & DETAILED ITINERARY

// ==========================================



function renderHealthDashboard(trip) {

  const mode = trip.currentMode || 'Balanced';

  const body = trip.bodyStats || { mood: 'Good', sleep: 7, restingHR: 60, steps: 0 };

  const energy = 95; // Mock energy used

  const energyLimit = mode === 'Protect' ? 80 : (mode === 'Balanced' ? 120 : 180);



  return `

    <!-- Mode Selection -->

    <div class="card mb-lg">

      <h3 class="mb-sm">Current Mode</h3>

      <div class="mode-selector">

        <div class="mode-card ${mode === 'Protect' ? 'active' : ''}" onclick="setTripMode('${trip.id}', 'Protect')">

           <div class="mode-header">\ud83d\uddd1\ufe0f Protect</div>

           <div class="mode-desc">Minimize strain, prioritize recovery</div>

           <div class="text-xs text-muted mt-xs">Strain limit: 80</div>

        </div>

        <div class="mode-card ${mode === 'Balanced' ? 'active' : ''}" onclick="setTripMode('${trip.id}', 'Balanced')">

           <div class="mode-header">\ud83d\udccd Balanced</div>

           <div class="mode-desc">Sustainable energy, strategic recovery</div>

           <div class="text-xs text-muted mt-xs">Strain limit: 120</div>

        </div>

        <div class="mode-card ${mode === 'Go Big' ? 'active' : ''}" onclick="setTripMode('${trip.id}', 'Go Big')">

           <div class="mode-header">\ud83d\udccd Go Big</div>

           <div class="mode-desc">Maximum experience, accept fatigue</div>

           <div class="text-xs text-muted mt-xs">Strain limit: 180</div>

        </div>

      </div>

      

      <div>

        <div class="flex-between text-sm mb-xs">

           <strong>Today's Energy Use</strong>

           <span>${energy} / ${energyLimit}</span>

        </div>

        <div class="energy-bar-container">

           <div class="energy-fill" style="width: ${(energy / energyLimit) * 100}%"></div>

        </div>

        <div class="flex-between text-xs text-muted mt-xs">

           <span>\ud83d\udccd Looking good</span>

        </div>

      </div>

    </div>

    

    <!-- Body Monitor -->

    <div class="card mb-lg body-monitor">

      <div class="flex-between mb-md">

         <h3>Body Monitor</h3>

         <button class="btn btn-sm btn-outline" onclick="simulateBodyData('${trip.id}')">? Simulate Data</button>

      </div>

      

      <div class="monitor-grid">

         <div class="monitor-row">

            <div class="monitor-label">\ud83d\udccd Sleep Quality</div>

            <div class="monitor-value">${body.sleep}/10 <span class="text-xs text-muted font-normal">Normal</span></div>

         </div>

         <div class="monitor-row">

            <div class="monitor-label">\ud83d\udccd Mood</div>

            <div class="monitor-value">${body.mood}</div>

         </div>

         <div class="monitor-row">

            <div class="monitor-label">\ud83d\udccd Resting HR</div>

            <div class="monitor-value">${body.restingHR} bpm</div>

         </div>

         <div class="monitor-row">

            <div class="monitor-label">\ud83d\udccd Steps Today</div>

            <div class="monitor-value">${(body.steps || 0).toLocaleString()}</div>

         </div>

      </div>

    </div>

  `;

}



function renderItinerary(trip) {

  const container = document.getElementById('itineraryTab');

  if (!trip.itinerary || trip.itinerary.length === 0) {

    container.innerHTML = '<div class="empty-state"><p>No itinerary generated yet.</p></div>';

    return;

  }



  const dashboardHTML = renderHealthDashboard(trip);



  // Build suggestion panel HTML if there's a pending suggestion

  let suggestionHTML = '';

  if (state.pendingSuggestion && state.pendingSuggestion.tripId === trip.id) {

    const { reason, mode } = state.pendingSuggestion;

    const healthSuggestions = state.healthSuggestions || [];



    suggestionHTML = `

      <div class="suggestion-panel">

        <div class="suggestion-header">

          <span class="suggestion-icon">?</span>

          <h4>Smart Suggestion</h4>

        </div>

        <div class="suggestion-body">

          <p><strong>${reason}</strong></p>

          <p class="text-muted">${getModeDescription(mode)}</p>

          ${healthSuggestions.length > 0 ? `

            <div class="health-suggestions">

              ${healthSuggestions.map(s => `

                <div class="health-suggestion ${s.type}">

                  <span class="suggestion-emoji">${s.icon}</span>

                  <span>${s.text}</span>

                </div>

              `).join('')}

            </div>

          ` : ''}

        </div>

        <div class="suggestion-actions">

          <button class="btn btn-primary btn-sm" onclick="applyItinerarySuggestion('${trip.id}')">

            \ud83d\udccd Regenerate Itinerary

          </button>

          <button class="btn btn-outline btn-sm" onclick="dismissItinerarySuggestion('${trip.id}')">

            Keep Current

          </button>

        </div>

      </div>

    `;

  }



  const itineraryHTML = trip.itinerary.map((day, dayIndex) => `

    <div class="itinerary-day">

      <div class="day-header flex-between align-center">

         <div>

           <h3 class="mb-none">Day ${day.day} of ${trip.itinerary.length}</h3>

           <span class="text-muted">${day.weekday} \\ud83c\\udfc6 ${day.focus}</span>

         </div>

         <div style="display: flex; gap: 0.5rem; align-items: center;">

           <div class="badge badge-primary">${day.healthStats.steps} steps exp.</div>

           <button class="btn btn-sm btn-outline" onclick="editDayActivities('${trip.id}', ${dayIndex})" title="Edit this day">

             ??

           </button>

         </div>

      </div>

      

      <div class="activity-timeline">

         ${day.activities.map((act, actIndex) => `

            <div class="detailed-activity-card">

               <div class="act-header">

                  <span>${act.title}</span>

                  <span class="text-muted font-normal">${act.duration} min</span>

               </div>

               <div class="act-body">

                  <div class="act-stats-grid">

                     <div class="act-stat">\ud83d\udccd Walking: ${act.steps || 0} steps</div>

                     <div class="act-stat">\ud83d\udccd Transit: ${act.transit || 0} min</div>

                     <div class="act-stat">\ud83d\uddd1\ufe0f Temp: ${act.temp || 20}\\ud83d\\udccdC</div>

                     <div class="act-stat">\ud83d\udccd Duration: ${act.duration} min</div>

                  </div>

               </div>

            </div>

         `).join('')}

      </div>

    </div>

  `).join('');



  container.innerHTML = `

    <div style="font-family: 'Inter', sans-serif;">

       ${dashboardHTML}

       ${suggestionHTML}

       ${itineraryHTML}

    </div>

  `;

}



// Interactive helper functions

window.setTripMode = function (tripId, mode) {

  const trip = state.trips.find(t => t.id === tripId);

  if (trip) {

    const previousMode = trip.currentMode;

    trip.currentMode = mode;

    saveData();



    // Show suggestion panel if mode changed

    if (previousMode !== mode) {

      showItinerarySuggestion(trip, `Mode changed to ${mode}`, getModeDescription(mode));

    } else {

      renderItinerary(trip); // Just re-render if no change

    }

  }

};



function getModeDescription(mode) {

  switch (mode) {

    case 'Protect':

      return 'Relaxed pace with fewer activities for recovery. ~2 activities/day.';

    case 'Go Big':

      return 'Maximum experiences! Pack your days with adventures. ~5 activities/day.';

    case 'Balanced':

    default:

      return 'Sustainable mix of activities and rest. ~3 activities/day.';

  }

}



function showItinerarySuggestion(trip, title, description) {

  // Store pending suggestion state

  state.pendingSuggestion = {

    tripId: trip.id,

    mode: trip.currentMode,

    reason: title

  };



  renderItinerary(trip);

}



function getHealthSuggestions(bodyStats) {

  const suggestions = [];



  if (bodyStats.sleep && bodyStats.sleep < 6) {

    suggestions.push({

      type: 'warning',

      icon: '\ud83c\udfc6',

      text: 'Low sleep detected. Consider lighter activities today.',

      action: 'reduce_intensity'

    });

  }



  if (bodyStats.mood === 'Tired') {

    suggestions.push({

      type: 'warning',

      icon: '\ud83c\udfc6',

      text: 'Feeling tired? Swap high-energy activities for relaxing ones.',

      action: 'add_rest'

    });

  }



  if (bodyStats.restingHR && bodyStats.restingHR > 70) {

    suggestions.push({

      type: 'info',

      icon: '\ud83c\udfc6',

      text: 'Elevated heart rate. Light activity recommended.',

      action: 'reduce_intensity'

    });

  }



  if (bodyStats.mood === 'Energetic' && bodyStats.sleep >= 8) {

    suggestions.push({

      type: 'success',

      icon: '\ud83c\udfc6',

      text: 'Great energy levels! Perfect day for adventures.',

      action: 'increase_intensity'

    });

  }



  return suggestions;

}



window.applyItinerarySuggestion = function (tripId) {

  const trip = state.trips.find(t => t.id === tripId);

  if (trip) {

    // Regenerate itinerary based on current mode and health

    trip.itinerary = generateModeAwareItinerary(trip, trip.currentMode);

    state.pendingSuggestion = null;

    saveData();

    renderItinerary(trip);

    showToast('Itinerary updated based on your mode!', 'success');

  }

};



window.dismissItinerarySuggestion = function (tripId) {

  state.pendingSuggestion = null;

  state.healthSuggestions = null;

  const trip = state.trips.find(t => t.id === tripId);

  if (trip) {

    renderItinerary(trip);

  }

};



// ========== EDIT DAY ACTIVITIES ==========

window.editDayActivities = function (tripId, dayIndex) {

  const trip = state.trips.find(t => t.id === tripId);

  if (!trip || !trip.itinerary || !trip.itinerary[dayIndex]) return;



  const day = trip.itinerary[dayIndex];

  const mode = trip.currentMode || 'Balanced';

  const activityPool = mode === 'Protect' ? ACTIVITY_POOL.relaxed :

    mode === 'Go Big' ? ACTIVITY_POOL.intense : ACTIVITY_POOL.balanced;



  const actCount = day.activities.length;



  const activitiesHTML = day.activities.map((act, i) => `

    <div class="edit-activity-row" data-index="${i}">

      <div class="activity-order-btns">

        <button class="btn btn-xs btn-outline ${i === 0 ? 'disabled' : ''}" 

                onclick="moveActivityUp('${tripId}', ${dayIndex}, ${i})" 

                ${i === 0 ? 'disabled' : ''} title="Move up">?</button>

        <button class="btn btn-xs btn-outline ${i === actCount - 1 ? 'disabled' : ''}" 

                onclick="moveActivityDown('${tripId}', ${dayIndex}, ${i})" 

                ${i === actCount - 1 ? 'disabled' : ''} title="Move down">?</button>

      </div>

      <span class="activity-name">${act.title}</span>

      <span class="activity-meta">${act.duration}min \\ud83c\\udfc6 ${act.steps || 0} steps</span>

      <button class="btn btn-sm btn-danger" onclick="removeActivityFromDay('${tripId}', ${dayIndex}, ${i})">?</button>

    </div>

  `).join('');



  const availableHTML = activityPool.map((act, i) => `

    <div class="available-activity" onclick="addActivityToDay('${tripId}', ${dayIndex}, ${i})">

      <span>+ ${act.title}</span>

      <span class="text-muted text-xs">${act.duration}min</span>

    </div>

  `).join('');



  showModal(`Edit Day ${day.day} - ${day.weekday}`, `

    <div class="edit-day-container">

      <h4 class="mb-md">Current Activities</h4>

      <p class="text-muted text-sm mb-sm">Use \ud83d\udccd arrows to reorder</p>

      <div class="current-activities-list">

        ${activitiesHTML || '<p class="text-muted">No activities</p>'}

      </div>

      

      <hr class="my-lg">

      

      <h4 class="mb-md">Add Custom Activity</h4>

      <div class="custom-activity-form">

        <div class="form-row">

          <input type="text" id="customActivityTitle" class="form-input" placeholder="Activity name (e.g., Lunch at Cafe)" />

        </div>

        <div class="form-row-grid">

          <div>

            <label class="text-xs text-muted">Duration (min)</label>

            <input type="number" id="customActivityDuration" class="form-input" value="60" min="15" max="480" />

          </div>

          <div>

            <label class="text-xs text-muted">Est. Steps</label>

            <input type="number" id="customActivitySteps" class="form-input" value="500" min="0" max="20000" />

          </div>

          <div>

            <label class="text-xs text-muted">Type</label>

            <select id="customActivityType" class="form-input">

              <option value="sedentary">Sedentary (rest/food)</option>

              <option value="walking">Walking</option>

              <option value="active">Active</option>

            </select>

          </div>

        </div>

        <button class="btn btn-primary btn-sm mt-sm" onclick="addCustomActivity('${tripId}', ${dayIndex})">

          + Add Custom Activity

        </button>

      </div>

      

      <hr class="my-lg">

      

      <h4 class="mb-md">Quick Add (${mode} mode)</h4>

      <div class="available-activities-list">

        ${availableHTML}

      </div>

    </div>

  `, [

    { label: 'Done', class: 'btn-primary', onclick: `closeModal(); renderItinerary(state.trips.find(t => t.id === '${tripId}'))` }

  ]);

};



window.removeActivityFromDay = function (tripId, dayIndex, actIndex) {

  const trip = state.trips.find(t => t.id === tripId);

  if (!trip || !trip.itinerary || !trip.itinerary[dayIndex]) return;



  trip.itinerary[dayIndex].activities.splice(actIndex, 1);



  // Recalculate day stats

  const day = trip.itinerary[dayIndex];

  day.healthStats.steps = day.activities.reduce((acc, act) => acc + (act.steps || 0), 0);

  day.healthStats.calories = day.activities.reduce((acc, act) => acc + (act.cals || 0), 0);



  saveData();

  editDayActivities(tripId, dayIndex); // Refresh modal

  showToast('Activity removed', 'info');

};



// Move activity up in the order

window.moveActivityUp = function (tripId, dayIndex, actIndex) {

  const trip = state.trips.find(t => t.id === tripId);

  if (!trip || !trip.itinerary || !trip.itinerary[dayIndex]) return;

  if (actIndex <= 0) return; // Already at top



  const activities = trip.itinerary[dayIndex].activities;

  // Swap with previous activity

  [activities[actIndex - 1], activities[actIndex]] = [activities[actIndex], activities[actIndex - 1]];



  saveData();

  editDayActivities(tripId, dayIndex); // Refresh modal

};



// Move activity down in the order

window.moveActivityDown = function (tripId, dayIndex, actIndex) {

  const trip = state.trips.find(t => t.id === tripId);

  if (!trip || !trip.itinerary || !trip.itinerary[dayIndex]) return;



  const activities = trip.itinerary[dayIndex].activities;

  if (actIndex >= activities.length - 1) return; // Already at bottom



  // Swap with next activity

  [activities[actIndex], activities[actIndex + 1]] = [activities[actIndex + 1], activities[actIndex]];



  saveData();

  editDayActivities(tripId, dayIndex); // Refresh modal

};



// Add a custom activity

window.addCustomActivity = function (tripId, dayIndex) {

  const trip = state.trips.find(t => t.id === tripId);

  if (!trip || !trip.itinerary || !trip.itinerary[dayIndex]) return;



  const title = document.getElementById('customActivityTitle').value.trim();

  const duration = parseInt(document.getElementById('customActivityDuration').value) || 60;

  const steps = parseInt(document.getElementById('customActivitySteps').value) || 0;

  const type = document.getElementById('customActivityType').value || 'sedentary';



  if (!title) {

    showToast('Please enter an activity name', 'error');

    return;

  }



  const newActivity = {

    id: `custom-${Date.now()}`,

    title: title,

    type: type,

    duration: duration,

    steps: steps,

    cals: type === 'active' ? Math.round(steps * 0.05) : (type === 'walking' ? Math.round(steps * 0.03) : 0),

    temp: 22,

    transit: 0,

    isCustom: true

  };



  trip.itinerary[dayIndex].activities.push(newActivity);



  // Recalculate day stats

  const day = trip.itinerary[dayIndex];

  day.healthStats.steps = day.activities.reduce((acc, act) => acc + (act.steps || 0), 0);

  day.healthStats.calories = day.activities.reduce((acc, act) => acc + (act.cals || 0), 0);



  saveData();

  editDayActivities(tripId, dayIndex); // Refresh modal

  showToast(`"${title}" added!`, 'success');

};



window.addActivityToDay = function (tripId, dayIndex, poolIndex) {

  const trip = state.trips.find(t => t.id === tripId);

  if (!trip || !trip.itinerary || !trip.itinerary[dayIndex]) return;



  const mode = trip.currentMode || 'Balanced';

  const activityPool = mode === 'Protect' ? ACTIVITY_POOL.relaxed :

    mode === 'Go Big' ? ACTIVITY_POOL.intense : ACTIVITY_POOL.balanced;



  const newActivity = { ...activityPool[poolIndex], id: `act-${Date.now()}` };

  trip.itinerary[dayIndex].activities.push(newActivity);



  // Recalculate day stats

  const day = trip.itinerary[dayIndex];

  day.healthStats.steps = day.activities.reduce((acc, act) => acc + (act.steps || 0), 0);

  day.healthStats.calories = day.activities.reduce((acc, act) => acc + (act.cals || 0), 0);



  saveData();

  editDayActivities(tripId, dayIndex); // Refresh modal

  showToast('Activity added', 'success');

};



window.simulateBodyData = function (tripId) {

  const trip = state.trips.find(t => t.id === tripId);

  if (trip) {

    if (!trip.bodyStats) trip.bodyStats = {};

    trip.bodyStats.sleep = Math.floor(Math.random() * 5) + 5; // 5-10 (wider range for testing)

    trip.bodyStats.restingHR = Math.floor(Math.random() * 25) + 55; // 55-80

    trip.bodyStats.steps = Math.floor(Math.random() * 10000);

    trip.bodyStats.mood = ['Good', 'Great', 'Tired', 'Energetic'][Math.floor(Math.random() * 4)];



    saveData();



    // Check for health-based suggestions

    const suggestions = getHealthSuggestions(trip.bodyStats);

    if (suggestions.length > 0) {

      state.healthSuggestions = suggestions;

      state.pendingSuggestion = {

        tripId: trip.id,

        mode: trip.currentMode,

        reason: 'Health data updated'

      };

    }



    renderItinerary(trip);

    showToast('Body metrics updated from wearable', 'success');

  }

};



// ==========================================

// INLINE PLANNER & WIZARD ENGINE

// ==========================================



function launchInlinePlanner() {

  if (state.planningMode) {

    startPlanningWizard();

    return;

  }



  // Clean choice modal

  showModal('Create New Trip', `

    <div style="display: flex; gap: 1rem; flex-wrap: wrap;">

       <button class="btn btn-outline" style="flex: 1; min-height: 180px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 1rem; text-align: center; white-space: normal;" onclick="startPlanningWizard()">

          <span style="font-size: 2rem;">\ud83d\udccd</span>

          <span style="font-weight: bold; font-size: 1.1rem;">I know where I'm going</span>

          <span style="font-size: 0.9rem; opacity: 0.8;">Go straight to the planner</span>

       </button>

       

       <button class="btn btn-outline" style="flex: 1; min-height: 180px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 1rem; text-align: center; white-space: normal;" onclick="enterExplorePlanningMode()">

          <span style="font-size: 2rem;">\ud83d\udccd</span>

          <span style="font-weight: bold; font-size: 1.1rem;">Inspire Me</span>

          <span style="font-size: 0.9rem; opacity: 0.8;">Browse destinations first</span>

       </button>

    </div>

  `, [], 'planning-choice-modal');

}



function startPlanningWizard() {

  closeModal(); // Close choice modal if open

  const overlay = document.getElementById('inlinePlannerOverlay');

  if (overlay) overlay.classList.remove('hidden');



  // Reset Wizard State

  wizardStep = 1;

  state.tripPlannerState = {

    budget: null,

    currency: 'USD',

    destination: '',

    startDate: '',

    endDate: '',

    travelers: 1,

    interests: [],

    mustDos: [],

    selectedHotel: null,

    selectedActivities: [],

    healthConnected: false

  };



  // Pre-fill if temp data exists

  if (state.tempDestinations && state.tempDestinations.length > 0) {

    state.tripPlannerState.destination = state.tempDestinations.join(', ');

  }



  renderWizardSteps();

  renderWizardStep(1);

}



function closeInlinePlanner() {

  const overlay = document.getElementById('inlinePlannerOverlay');

  if (overlay) overlay.classList.add('hidden');

}



function enterExplorePlanningMode() {

  closeModal();

  state.planningMode = true;

  state.tempDestinations = [];

  navigateTo('explore'); // SWITCH VIEW

  showToast('Planning Mode: Select destinations to build your trip!', 'info');

  renderExplore();

}



function cancelPlanningMode() {

  state.planningMode = false;

  state.tempDestinations = [];

  renderExplore();

}



console.log('✅ Inline Trip Planner functions loaded');

// Enhanced initInlinePlannerListeners with event listener wiring

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



function initializeEventListeners() {

  console.log('\ud83d\udccd Initializing Global Event Listeners...');



  // 1. Planner Listeners

  initInlinePlannerListeners();



  // 2. Tab Switching Logic (Event Delegation)

  document.body.addEventListener('click', (e) => {

    if (e.target.matches('.tab')) {

      const target = e.target.dataset.tab;

      if (target) {

        console.log('Tab Clicked via Delegation:', target);

        switchTab(target);

      }

    }

  });



  // 3. Country Search

  const countrySearch = document.getElementById('countrySearch');

  if (countrySearch) {

    countrySearch.addEventListener('input', (e) => {

      const query = e.target.value.trim();

      if (!query) {

        renderDestinationCards(DESTINATION_DATABASE);

      } else {

        searchCountries(query);

      }

    });

  }



  // 4. Chat Listeners

  const chatSend = document.getElementById('chatSend');

  const chatInput = document.getElementById('chatInput');

  if (chatSend) {

    chatSend.addEventListener('click', sendChatMessage);

  }

  if (chatInput) {

    chatInput.addEventListener('keypress', (e) => {

      if (e.key === 'Enter') sendChatMessage();

    });

  }



  console.log('? Global Event Listeners Initialized');

}



// ========== INITIALIZATION ==========

// Wait for DOM to be ready

document.addEventListener('DOMContentLoaded', () => {

  loadData();

  initializeEventListeners();

  updateXPBar();



  // Check hash on load

  const hash = window.location.hash.slice(1);

  if (hash.startsWith('itinerary/')) {

    const tripId = hash.split('/')[1];

    navigateTo('itinerary', tripId);

  } else {

    render(); // Default render

  }

});



// Handle hash changes

window.addEventListener('hashchange', () => {

  const hash = window.location.hash.slice(1);

  if (hash.startsWith('itinerary/')) {

    const tripId = hash.split('/')[1];

    navigateTo('itinerary', tripId);

  } else {

    navigateTo(hash || 'home');

  }

});



// End of app.js

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

    addDestinationFromChat(parts[0].trim(), parts.length > 1 ? parts[1].trim() : '');

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






