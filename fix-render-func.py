import re

with open('app.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Find and replace the renderDestinationResults function
# Looking for the function start
pattern = r'function renderDestinationResults\(destinations, title\) \{[\s\S]*?<div class="results-actions">'

replacement = '''function renderDestinationResults(destinations, title) {
  const container = document.getElementById('chatMessages');

  const html = `
    <div class="results-view" style="padding: 1.5rem;">
      <button class="btn-back" onclick="renderCategoryMenu()" style="background: transparent; border: none; color: var(--primary-alpine); font-size: 1rem; font-weight: 600; cursor: pointer; padding: 0.5rem 1rem; border-radius: var(--radius-md); transition: all 0.2s; margin-bottom: 1.5rem; display: inline-flex; align-items: center; gap: 0.5rem;">
        <span>\\u2190</span> Start Over
      </button>

      <h2 style="margin: 0 0 2rem 0; font-size: 1.75rem; color: var(--text-dark); font-weight: 700;">${title}</h2>
      
      <div class="results-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 1.5rem; margin-bottom: 2rem;">
        ${destinations.map((dest, i) => `
          <div class="destination-result-card" style="position: relative; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.08); transition: all 0.3s ease; cursor: pointer; border: 1px solid #f0f0f0;" onmouseover="this.style.transform='translateY(-4px)'; this.style.boxShadow='0 8px 24px rgba(0,0,0,0.12)'" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 12px rgba(0,0,0,0.08)'">
            <div style="position: absolute; top: 12px; left: 12px; background: linear-gradient(135deg, var(--primary-alpine), var(--mint)); color: white; padding: 6px 14px; border-radius: 20px; font-size: 0.9rem; font-weight: 700; z-index: 10; box-shadow: 0 2px 8px rgba(0,0,0,0.2);">
              #${i + 1}
            </div>
            
            <img src="https://images.unsplash.com/photo-${1513635269975 + i * 123456}?w=400&h=250&fit=crop&q=80" 
                 alt="${dest.name}" 
                 style="width: 100%; height: 200px; object-fit: cover; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);"
                 onerror="this.style.background='linear-gradient(135deg, var(--primary-alpine), var(--mint))'; this.style.display='block';">
            
            <div style="padding: 1.5rem;">
              <h3 style="margin: 0 0 0.75rem 0; font-size: 1.4rem; color: var(--text-dark); font-weight: 700; line-height: 1.3;">${dest.name}, ${dest.country}</h3>
              
              <p style="margin: 0 0 1.25rem 0; color: #666; font-size: 0.95rem; line-height: 1.6; min-height: 3rem;">${dest.desc || 'Discover this amazing destination.'}</p>
              
              <div style="display: flex; gap: 0.75rem; margin-bottom: 1.25rem; flex-wrap: wrap;">
                <span style="display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.5rem 1rem; background: linear-gradient(135deg, #d4fc79 0%, #96e6a1 100%); color: #1b5e20; border-radius: 20px; font-size: 0.875rem; font-weight: 600; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                  <span style="font-size: 1.1rem;">\\ud83d\\udcb0</span> ${dest.budget || 'Mid-Range'}
                </span>
                ${(dest.vibe || []).slice(0, 2).map(v => `
                  <span style="display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.5rem 1rem; background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%); color: #0d47a1; border-radius: 20px; font-size: 0.875rem; font-weight: 600; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                    <span style="font-size: 1.1rem;">\\ud83c\\udfaf</span> ${v}
                  </span>
                `).join('')}
              </div>
              
              <button class="btn btn-primary" onclick="addDestinationFromChat('${dest.name}', '${dest.country}')" style="width: 100%; padding: 0.875rem; font-size: 1rem; font-weight: 600; background: var(--gradient-summit); border: none; border-radius: 10px; cursor: pointer; transition: all 0.3s ease; box-shadow: 0 4px 12px rgba(31, 122, 90, 0.3); color: white;">
                <span style="font-size: 1.1rem; margin-right: 0.5rem;">\\u2795</span> Add to Trip
              </button>
            </div>
          </div>
        `).join('')}
      </div>
      
      <div class="results-actions"'''

content = re.sub(pattern, replacement, content, flags=re.MULTILINE)

with open('app.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("Replaced renderDestinationResults function")
