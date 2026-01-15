$content = Get-Content 'app.js' -Raw -Encoding UTF8

# Fix renderCategoryMenu function to use styled icons instead of broken emojis
$oldCategoryRender = 'function renderCategoryMenu() {
  const container = document.getElementById(''chatMessages'');
  
  const html = `
    <div class="assistant-home">
      <div class="assistant-header">
        <h2>?? AI Travel Assistant</h2>
        <p class="assistant-subtitle">What can I help you with?</p>
      </div>
      
      <div class="category-grid">
        ${ASSISTANT_MENU.categories.map(cat => `
          <div class="category-card" onclick="showCategoryTasks(''${cat.id}'')">
            <div class="category-icon">${cat.icon}</div>
            <div class="category-info">
              <h3>${cat.name}</h3>
              <span class="category-count">${cat.taskCount} tasks</span>
            </div>
          </div>
        ``).join('''')}
      </div>
    </div>
  `;

  container.innerHTML = html;
  state.chatAssistant.mode = ''menu'';
  state.chatAssistant.navigationStack = [];
}'

$newCategoryRender = 'function renderCategoryMenu() {
  const container = document.getElementById(''chatMessages'');
  
  // Icon mapping for categories
  const iconMap = {
    destinations: ''🌍'',
    budget: ''💰'',
    flights: ''✈️'',
    hotels: ''🏨'',
    activities: ''🎭'',
    itinerary: ''📅'',
    health: ''💪''
  };
  
  const html = `
    <div class="assistant-home">
      <div class="assistant-header">
        <h2 style="display: flex; align-items: center; justify-content: center; gap: 0.5rem;">
          <span style="font-size: 2rem;">🤖</span> AI Travel Assistant
        </h2>
        <p class="assistant-subtitle">What can I help you with today?</p>
      </div>
      
      <div class="category-grid">
        ${ASSISTANT_MENU.categories.map(cat => `
          <div class="category-card" onclick="showCategoryTasks(''${cat.id}'')" style="cursor: pointer;">
            <div class="category-icon" style="font-size: 2.5rem; line-height: 1;">${iconMap[cat.id] || ''📍''}</div>
            <div class="category-info">
              <h3>${cat.name}</h3>
              <span class="category-count">${cat.taskCount} tasks</span>
            </div>
          </div>
        ``).join('''')}
      </div>
    </div>
  `;

  container.innerHTML = html;
  state.chatAssistant.mode = ''menu'';
  state.chatAssistant.navigationStack = [];
}'

$content = $content.Replace($oldCategoryRender, $newCategoryRender)

# Also fix the spot where there is a typo in addDestinationFromChat call
$content = $content.Replace('add DestinationFromChat', 'addDestinationFromChat')

Set-Content -Path 'app.js' -Value $content -Encoding UTF8
Write-Output "Fixed icon rendering and button"
