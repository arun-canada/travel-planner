import re

print("Fixing all emoji issues...")

# Fix app.js
with open('app.js', 'r', encoding='utf-8') as f:
    app_content = f.read()

# Fix XP bar display (Level badge)
app_content = re.sub(r"Level \$\{level\} \\\\ud83d\\\\udcb0 \$\{xp\}", r"Level ${level} \ud83c\udfc6 ${xp}", app_content)
app_content = re.sub(r"Level \$\{level\} \\\\ud83d\\\\udccd \$\{xp\}", r"Level ${level} \ud83c\udfc6 ${xp}", app_content)

# Fix any remaining navigation arrows in app.js
app_content = app_content.replace("'? Back'", "'\\u2190 Back'")
app_content = app_content.replace("'? All Categories'", "'\\u2190 All Categories'")  
app_content = app_content.replace("'Continue ?'", "'Continue \\u2192'")

# Fix task list arrows
app_content = app_content.replace("'?'  // Chevron", "'\\u203a'  // Chevron")

with open('app.js', 'w', encoding='utf-8') as f:
    f.write(app_content)

print("Fixed app.js")

# Fix ai-assistant-complete.js
with open('ai-assistant-complete.js', 'r', encoding='utf-8') as f:
    ai_content = f.read()

# Fix any remaining issues
ai_content = ai_content.replace("'? Back'", "'\\u2190 Back'")
ai_content = ai_content.replace("'? All Categories'", "'\\u2190 All Categories'")
ai_content = ai_content.replace("'Continue ?'", "'Continue \\u2192'")

with open('ai-assistant-complete.js', 'w', encoding='utf-8') as f:
    f.write(ai_content)

print("Fixed ai-assistant-complete.js")

print("✓ All emoji issues fixed!")
