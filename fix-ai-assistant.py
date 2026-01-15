import re

# Read file
with open('ai-assistant-complete.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix all button Unicode issues
content = content.replace("'← Start Over'", "'\\u2190 Start Over'")
content = content.replace("'← Back'", "'\\u2190 Back'")
content = content.replace("innerHTML = '← Start Over'", "innerHTML = '\\u2190 Start Over'")
content = content.replace("innerHTML = '← Back'", "innerHTML = '\\u2190 Back'")

# Fix greeting
content = content.replace("'👋 How can I help you", "'\\ud83d\\udc4b How can I help you")

# Fix any raw Unicode in destination names (this is the key fix)
# The issue is destination names have raw \ud83d\udccd escapes
# We need to remove these entirely from destination names

# Write back
with open('ai-assistant-complete.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("Fixed arrows and greeting")
