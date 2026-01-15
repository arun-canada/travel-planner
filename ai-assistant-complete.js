// =======================
// AI ASSISTANT - MENU-BASED SYSTEM (Standalone Version)
// =======================

// Initialize state if it doesn't exist (in case app.js fails to load)
if (typeof window.state === 'undefined') {
    window.state = {
        trips: JSON.parse(localStorage.getItem('tripflowData'))?.trips || [],
        profile: JSON.parse(localStorage.getItem('tripflowData'))?.profile || {
            level: 1,
            xp: 0,
            stats: { totalTrips: 0, totalDestinations: 0, totalExpenses: 0 }
        },
        chatAssistant: null,
        currentView: null,
        currentTripId: null
    };
}

// Helper functions (fallbacks if app.js doesn't provide them)
if (typeof generateId === 'undefined') {
    window.generateId = () => '_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
}

if (typeof saveData === 'undefined') {
    window.saveData = () => {
        try {
            localStorage.setItem('tripflowData', JSON.stringify({
                trips: state.trips,
                profile: state.profile
            }));
        } catch (e) {
            console.error('Failed to save data:', e);
        }
    };
}

if (typeof showToast === 'undefined') {
    window.showToast = (message, type = 'info') => {
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.style.cssText = `
            position: fixed;
            bottom: 2rem;
            right: 2rem;
            background: ${type === 'success' ? '#4caf50' : type === 'error' ? '#f44336' : '#2196F3'};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 10000;
            animation: slideIn 0.3s ease;
        `;
        toast.textContent = message;
        document.body.appendChild(toast);

        setTimeout(() => {
            toast.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    };
}

if (typeof navigateTo === 'undefined') {
    window.navigateTo = (view, id) => {
        if (view === 'itinerary' && id) {
            window.location.hash = `trip/${id}`;
        } else {
            window.location.hash = view;
        }
        window.location.reload();
    };
}

if (typeof showModal === 'undefined') {
    window.showModal = (title, content, buttons) => {
        const overlay = document.getElementById('modalOverlay');
        const modal = document.getElementById('modalContent');
        if (!overlay || !modal) return;

        const buttonHTML = buttons.map(btn =>
            `<button class="btn ${btn.class}" onclick="${btn.onclick}">${btn.label}</button>`
        ).join('');

        modal.innerHTML = `
            <h3>${title}</h3>
            <div style="margin: 1.5rem 0;">${content}</div>
            <div style="display: flex; gap: 0.5rem; justify-content: flex-end;">${buttonHTML}</div>
        `;
        overlay.classList.remove('hidden');
    };
}

if (typeof closeModal === 'undefined') {
    window.closeModal = () => {
        const overlay = document.getElementById('modalOverlay');
        if (overlay) overlay.classList.add('hidden');
    };
}

if (typeof sanitizeHTML === 'undefined') {
    window.sanitizeHTML = (str) => {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    };
}

if (typeof getTripById === 'undefined') {
    window.getTripById = (id) => state.trips.find(t => t.id === id);
}

if (typeof generateItinerary === 'undefined') {
    window.generateItinerary = (startDate, endDate, prefs) => {
        // Simple placeholder itinerary
        return [
            {
                day: 1, date: startDate, activities: [
                    { time: '09:00', name: 'Arrival & Check-in', type: 'travel' },
                    { time: '14:00', name: 'Explore neighborhood', type: 'leisure' }
                ]
            }
        ];
    };
}

if (typeof calculateHealthScore === 'undefined') {
    window.calculateHealthScore = (itinerary, prefs) => ({ score: 75, recommendations: [] });
}

// Menu data structure
const ASSISTANT_MENU = {
    destinations: {
        icon: '\uD83C\uDF0D', // 🌍
        name: 'Find a destination',
        tasks: [
            { id: 'dest_cheap', label: 'Cheapest places to visit this month' },
            { id: 'dest_budget', label: 'Destinations matching my budget' },
            { id: 'dest_vibe', label: 'Places with a specific vibe' },
            { id: 'dest_group', label: 'Best for families/couples/solo' }
        ]
    },
    budget: {
        icon: '\uD83D\uDCB0', // 💰
        name: 'Budget trip planning',
        tasks: [
            { id: 'budget_estimate', label: 'Estimate trip cost' },
            { id: 'budget_breakdown', label: 'Daily spending breakdown' },
            { id: 'budget_save', label: 'How to travel cheaper' }
        ]
    },
    flights: {
        icon: '\u2708\uFE0F', // ✈️
        name: 'Flights',
        tasks: [
            { id: 'flight_when', label: 'Best time to book' },
            { id: 'flight_deals', label: 'Find flight deals' }
        ]
    },
    hotels: {
        icon: '\uD83C\uDFE8', // 🏨
        name: 'Hotels and stays',
        tasks: [
            { id: 'hotel_find', label: 'Find accommodations' },
            { id: 'hotel_compare', label: 'Hotel vs Airbnb' }
        ]
    },
    activities: {
        icon: '\uD83C\uDFAD', // 🎭
        name: 'Activities and bookings',
        tasks: [
            { id: 'activity_popular', label: 'Popular activities' },
            { id: 'activity_local', label: 'Local experiences' }
        ]
    },
    itinerary: {
        icon: '\uD83D\uDCC5', // 📅
        name: 'Build an itinerary',
        tasks: [
            { id: 'itinerary_auto', label: 'Auto-generate itinerary' },
            { id: 'itinerary_custom', label: 'Custom day-by-day plan' }
        ]
    },
    health: {
        icon: '\uD83D\uDCAA', // 💪
        name: 'Health + energy planning',
        tasks: [
            { id: 'health_jetlag', label: 'Manage jet lag' },
            { id: 'health_pace', label: 'Optimize daily energy' }
        ]
    }
};

// Follow-up questions for each task
const FOLLOWUP_QUESTIONS = {
    dest_cheap: [
        { id: 'budget', label: 'What\'s your budget?', type: 'buttons', options: ['Under $500', '$500-$1000', '$1000-$2000', '$2000+'] },
        { id: 'climate', label: 'Preferred climate?', type: 'buttons', options: ['Warm & sunny', 'Cool & mild', 'Any'] }
    ],
    dest_budget: [
        { id: 'amount', label: 'Total budget (USD)', type: 'input', placeholder: 'e.g., 1500' },
        { id: 'duration', label: 'Trip duration (days)', type: 'input', placeholder: 'e.g., 7' }
    ],
    dest_vibe: [
        { id: 'vibe', label: 'What vibe are you looking for?', type: 'buttons', options: ['Adventure', 'Relaxing', 'Cultural', 'Nightlife', 'Nature'] }
    ]
};

// Initialize AI assistant - replaces old chatbot
function initializeChatbot() {
    if (!state.chatAssistant) {
        state.chatAssistant = {
            mode: 'menu',
            history: []
        };
    }

    // Show category menu
    renderCategoryMenu();
}

// Render main category menu with proper icons
function renderCategoryMenu() {
    const chatPanel = document.getElementById('chatMessages');
    if (!chatPanel) {
        console.error('Error: chatMessages element not found');
        return;
    }
    chatPanel.innerHTML = '';

    // Welcome message
    const welcome = document.createElement('div');
    welcome.className = 'chat-message assistant';
    welcome.innerHTML = `
    <div style="margin-bottom: 1.5rem;">
      <h3 style="margin: 0 0 0.5rem 0; color: var(--text-primary);">👋 How can I help you today?</h3>
      <p style="margin: 0; color: var(--text-secondary); font-size: 0.9rem;">Select a category below:</p>
    </div>
  `;
    chatPanel.appendChild(welcome);

    // Category grid
    const grid = document.createElement('div');
    grid.className = 'category-grid';
    grid.style.cssText = 'display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 1rem; margin-top: 1rem;';

    Object.entries(ASSISTANT_MENU).forEach(([key, category]) => {
        const card = document.createElement('button');
        card.className = 'category-card';
        card.style.cssText = `
      padding: 1.5rem 1rem;
      background: var(--card-bg, #fff);
      border: 1px solid var(--border-color, #e0e0e0);
      border-radius: 12px;
      cursor: pointer;
      transition: all 0.3s ease;
      text-align: center;
      box-shadow: 0 2px 4px rgba(0,0,0,0.05);
    `;
        card.onmouseover = () => { card.style.transform = 'translateY(-4px)'; card.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)'; };
        card.onmouseout = () => { card.style.transform = 'translateY(0)'; card.style.boxShadow = '0 2px 4px rgba(0,0,0,0.05)'; };
        card.onclick = () => showCategoryTasks(key);

        card.innerHTML = `
      <div style="font-size: 2.5rem; margin-bottom: 0.5rem;">${category.icon}</div>
      <div style="font-size: 0.9rem; font-weight: 500; color: var(--text-primary);">${category.name}</div>
    `;
        grid.appendChild(card);
    });

    chatPanel.appendChild(grid);
}

// Show tasks for a specific category
function showCategoryTasks(categoryKey) {
    const category = ASSISTANT_MENU[categoryKey];
    const chatPanel = document.getElementById('chatMessages');
    if (!chatPanel) return;
    chatPanel.innerHTML = '';

    // Back button
    const backBtn = document.createElement('button');
    backBtn.className = 'btn-secondary';
    backBtn.innerHTML = '← Start Over';
    backBtn.onclick = () => renderCategoryMenu();
    backBtn.style.marginBottom = '1rem';
    chatPanel.appendChild(backBtn);

    // Category header
    const header = document.createElement('div');
    header.className = 'chat-message assistant';
    header.innerHTML = `
    <div style="margin-bottom: 1rem;">
      <h3 style="margin: 0 0 0.5rem 0; color: var(--text-primary);">${category.icon} ${category.name}</h3>
      <p style="margin: 0; color: var(--text-secondary); font-size: 0.9rem;">Choose what you'd like to do:</p>
    </div>
  `;
    chatPanel.appendChild(header);

    // Task list
    const tasks = document.createElement('div');
    tasks.style.cssText = 'display: flex; flex-direction: column; gap: 0.75rem;';

    category.tasks.forEach(task => {
        const taskBtn = document.createElement('button');
        taskBtn.className = 'task-button';
        taskBtn.style.cssText = `
      padding: 1rem 1.25rem;
      background: var(--card-bg, #fff);
      border: 1px solid var(--border-color, #e0e0e0);
      border-radius: 8px;
      cursor: pointer;
      text-align: left;
      font-size: 0.95rem;
      transition: all 0.2s ease;
    `;
        taskBtn.onmouseover = () => { taskBtn.style.background = 'var(--primary-light, #f0f7ff)'; taskBtn.style.borderColor = 'var(--primary, #2196F3)'; };
        taskBtn.onmouseout = () => { taskBtn.style.background = 'var(--card-bg, #fff)'; taskBtn.style.borderColor = 'var(--border-color, #e0e0e0)'; };
        taskBtn.textContent = task.label;
        taskBtn.onclick = () => handleTaskSelection(task.id);
        tasks.appendChild(taskBtn);
    });

    chatPanel.appendChild(tasks);
}

// Handle task selection and ask follow-up questions
function handleTaskSelection(taskId) {
    const questions = FOLLOWUP_QUESTIONS[taskId];

    if (!questions) {
        // No follow-ups, show results directly
        showTaskResults(taskId, {});
        return;
    }

    askFollowup(taskId, questions, 0, {});
}

// Ask follow-up questions one at a time
function askFollowup(taskId, questions, index, answers) {
    if (index >= questions.length) {
        // All questions answered, show results
        showTaskResults(taskId, answers);
        return;
    }

    const question = questions[index];
    const chatPanel = document.getElementById('chatMessages');
    if (!chatPanel) return;
    chatPanel.innerHTML = '';

    // Back button
    const backBtn = document.createElement('button');
    backBtn.className = 'btn-secondary';
    backBtn.innerHTML = '← Back';
    backBtn.onclick = () => index === 0 ? renderCategoryMenu() : askFollowup(taskId, questions, index - 1, answers);
    backBtn.style.marginBottom = '1rem';
    chatPanel.appendChild(backBtn);

    // Question
    const questionDiv = document.createElement('div');
    questionDiv.className = 'chat-message assistant';
    questionDiv.innerHTML = `<p style="margin: 0; font-weight: 500;">${question.label}</p>`;
    chatPanel.appendChild(questionDiv);

    // Answer input/buttons
    const answerContainer = document.createElement('div');
    answerContainer.style.cssText = 'margin-top: 1rem;';

    if (question.type === 'buttons') {
        answerContainer.style.cssText += 'display: flex; flex-wrap: wrap; gap: 0.5rem;';
        question.options.forEach(option => {
            const btn = document.createElement('button');
            btn.className = 'btn-primary';
            btn.textContent = option;
            btn.onclick = () => {
                answers[question.id] = option;
                askFollowup(taskId, questions, index + 1, answers);
            };
            answerContainer.appendChild(btn);
        });
    } else {
        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'form-input';
        input.placeholder = question.placeholder || '';
        input.style.marginBottom = '0.75rem';

        const submitBtn = document.createElement('button');
        submitBtn.className = 'btn-primary';
        submitBtn.textContent = 'Next';
        submitBtn.onclick = () => {
            if (input.value.trim()) {
                answers[question.id] = input.value.trim();
                askFollowup(taskId, questions, index + 1, answers);
            }
        };

        answerContainer.appendChild(input);
        answerContainer.appendChild(submitBtn);
    }

    chatPanel.appendChild(answerContainer);
}

// Show results for a task
function showTaskResults(taskId, answers) {
    // For now, only implement destination finding
    if (taskId === 'dest_cheap' || taskId === 'dest_budget' || taskId === 'dest_vibe') {
        showDestinationResults(taskId, answers);
    } else {
        const chatPanel = document.getElementById('chatMessages');
        if (!chatPanel) return;
        chatPanel.innerHTML = '<div class="chat-message assistant"><p>This feature is coming soon!</p></div>';

        setTimeout(() => renderCategoryMenu(), 2000);
    }
}

// Render destination results with beautiful cards
function renderDestinationResults(taskId, answers) {
    // Mock data - in real app, this would come from API
    const destinations = [
        { name: 'Lisbon', country: 'Portugal', desc: 'Charming coastal capital with historic neighborhoods, great food, and affordable prices.', budget: 'Low', vibe: 'Cultural', img: 'lisbon-portugal' },
        { name: 'Budapest', country: 'Hungary', desc: 'Stunning architecture, thermal baths, vibrant nightlife, and very budget-friendly.', budget: 'Low', vibe: 'Cultural', img: 'budapest-hungary' },
        { name: 'Bangkok', country: 'Thailand', desc: 'Exotic temples, street food paradise, bustling markets, and incredible value.', budget: 'Low', vibe: 'Adventure', img: 'bangkok-thailand' },
        { name: 'Krakow', country: 'Poland', desc: 'Medieval charm, rich history, great beer, and very affordable.', budget: 'Low', vibe: 'Cultural', img: 'krakow-poland' }
    ];

    const chatPanel = document.getElementById('chatMessages');
    if (!chatPanel) return;
    chatPanel.innerHTML = '';

    // Back button
    const backBtn = document.createElement('button');
    backBtn.className = 'btn-secondary';
    backBtn.innerHTML = '← Start Over';
    backBtn.onclick = () => renderCategoryMenu();
    backBtn.style.cssText = 'margin-bottom: 1rem;';
    chatPanel.appendChild(backBtn);

    // Header
    const header = document.createElement('div');
    header.innerHTML = '<h3 style="margin: 0 0 1.5rem 0; color: var(--text-primary);">Recommended Destinations</h3>';
    chatPanel.appendChild(header);

    // Results grid
    destinations.forEach((dest, i) => {
        const card = document.createElement('div');
        card.className = 'destination-result-card';
        card.style.cssText = `
      position: relative;
      background: var(--card-bg, #fff);
      border: 1px solid var(--border-color, #e0e0e0);
      border-radius: 12px;
      overflow: hidden;
      margin-bottom: 1rem;
      box-shadow: 0 2px 8px rgba(0,0,0,0.08);
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    `;
        card.onmouseover = () => { card.style.transform = 'translateY(-2px)'; card.style.boxShadow = '0 4px 16px rgba(0,0,0,0.12)'; };
        card.onmouseout = () => { card.style.transform = 'translateY(0)'; card.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)'; };

        // Use working Unsplash image URL format
        const imgUrl = `https://images.unsplash.com/photo-1${513635269975 + i}?w=400&h=300&fit=crop&q=80`;

        card.innerHTML = `
      <div style="position: absolute; top: 12px; left: 12px; background: rgba(0,0,0,0.75); color: white; padding: 4px 12px; border-radius: 20px; font-size: 0.85rem; font-weight: 600; z-index: 1;">
        #${i + 1}
      </div>
      <img src="${imgUrl}" alt="${dest.name}" style="width: 100%; height: 200px; object-fit: cover; background: #f5f5f5;">
      <div style="padding: 1.25rem;">
        <h4 style="margin: 0 0 0.5rem 0; font-size: 1.25rem; color: var(--text-primary);">${dest.name}, ${dest.country}</h4>
        <p style="margin: 0 0 1rem 0; color: var(--text-secondary); font-size: 0.9rem; line-height: 1.5;">${dest.desc}</p>
        
        <div style="display: flex; gap: 0.5rem; margin-bottom: 1rem; flex-wrap: wrap;">
          <span style="display: inline-flex; align-items: center; gap: 0.25rem; padding: 0.25rem 0.75rem; background: #e8f5e9; color: #2e7d32; border-radius: 12px; font-size: 0.85rem; font-weight: 500;">
            💰 ${dest.budget}
          </span>
          <span style="padding: 0.25rem 0.75rem; background: #e3f2fd; color: #1976d2; border-radius: 12px; font-size: 0.85rem;">
            ${dest.vibe}
          </span>
        </div>
        
        <button class="btn-primary" onclick="quickAddToTrip('${dest.name}, ${dest.country}')" style="width: 100%; padding: 0.75rem; font-size: 0.95rem;">
          ➕ Add to Trip
        </button>
      </div>
    `;
        chatPanel.appendChild(card);
    });

    // New search button
    const newSearchBtn = document.createElement('button');
    newSearchBtn.className = 'btn-secondary';
    newSearchBtn.textContent = 'Start New Search';
    newSearchBtn.onclick = () => renderCategoryMenu();
    newSearchBtn.style.cssText = 'width: 100%; margin-top: 1rem;';
    chatPanel.appendChild(newSearchBtn);
}

// Alias for backward compatibility
function showDestinationResults(taskId, answers) {
    renderDestinationResults(taskId, answers);
}

// Quick add destination to trip
function quickAddToTrip(destName) {
    try {
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
            if (state.profile && state.profile.stats) {
                state.profile.stats.totalTrips++;
                state.profile.stats.totalDestinations++;
            }
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
    } catch (error) {
        console.error('Error adding to trip:', error);
        showToast('Failed to add destination. Please try again.', 'error');
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
        if (select) {
            select.addEventListener('change', (e) => {
                const field = document.getElementById('newTripNameField');
                if (field) {
                    field.style.display = e.target.value === 'NEW_TRIP' ? 'block' : 'none';
                }
            });
        }
    }, 100);
}

function confirmAddChatDestination(destName) {
    try {
        const tripSelect = document.getElementById('tripSelect');
        if (!tripSelect) return;

        const tripId = tripSelect.value;
        const notesInput = document.getElementById('destNotes');
        const notes = notesInput ? notesInput.value : '';

        if (tripId === 'NEW_TRIP') {
            const tripNameInput = document.getElementById('newTripName');
            const tripName = (tripNameInput ? tripNameInput.value : '') || `Trip to ${destName.split(',')[0]}`;

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
            if (state.profile && state.profile.stats) {
                state.profile.stats.totalTrips++;
                state.profile.stats.totalDestinations++;
            }
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
                        if (typeof renderTripDetail === 'function') {
                            renderTripDetail(tripId);
                        }
                    }
                } else {
                    showToast(`${destName} is already in this trip`, 'info');
                }
            }
        }
    } catch (error) {
        console.error('Error confirming destination:', error);
        showToast('Failed to add destination. Please try again.', 'error');
    }
}

// Auto-initialize when chat page becomes visible
document.addEventListener('DOMContentLoaded', () => {
    const chatPage = document.getElementById('chatPage');
    if (chatPage && !chatPage.classList.contains('hidden')) {
        initializeChatbot();
    }
});

// Listen for hash changes to reinitialize
window.addEventListener('hashchange', () => {
    if (window.location.hash === '#chat') {
        setTimeout(() => {
            const chatMessages = document.getElementById('chatMessages');
            if (chatMessages && chatMessages.children.length === 0) {
                initializeChatbot();
            }
        }, 100);
    }
});

console.log('✅ AI Assistant module loaded successfully');
