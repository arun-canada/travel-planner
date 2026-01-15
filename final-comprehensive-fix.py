import re

print("=== Comprehensive AI Assistant Fix ===\n")

# Read app.js
with open('app.js', 'r', encoding='utf-8') as f:
    content = f.read()

original_content = content

# 1. Fix Back buttons showing '? Back'
content = content.replace("innerHTML = '? Back'", "innerHTML = '\\u2190 Back'")
content = content.replace("'? Back'", "'\\u2190 Back'")
content = content.replace('"? Back"', '"\\u2190 Back"')

# 2. Fix Continue buttons showing 'Continue ?'
content = content.replace("'Continue ?'", "'Continue \\u2192'")
content = content.replace('"Continue ?"', '"Continue \\u2192"')

# 3. Fix All Categories showing '? All Categories'  
content = content.replace("'? All Categories'", "'\\u2190 All Categories'")

# 4. Fix task list chevrons showing '?'
content = content.replace("'?'  // Chevron", "'\\u203a'")
content = content.replace("'?' // Chevron", "'\\u203a'")

# 5. Fix wizard step checkmarks
content = content.replace("${step.num < wizardStep ? '?' : step.num}", "${step.num < wizardStep ? '\\u2713' : step.num}")

# 6. Fix card styling - add better border-radius
content = re.sub(
    r'class="destination-result-card"([^>]*?)>',
    r'class="destination-result-card"\1 style="border-radius: 16px !important; overflow: hidden;">',
    content
)

# Count changes
changes_made = sum([
    content.count('\\u2190') - original_content.count('\\u2190'),
    content.count('\\u2192') - original_content.count('\\u2192'),
    content.count('\\u203a') - original_content.count('\\u203a'),
    content.count('\\u2713') - original_content.count('\\u2713')
])

with open('app.js', 'w', encoding='utf-8') as f:
    f.write(content)

print(f"✓ Fixed {changes_made} emoji/arrow instances")
print("✓ Improved card styling")
print("\nDone!")
