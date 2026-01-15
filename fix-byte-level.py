import re

# Read file as bytes then decode
with open('app.js', 'rb') as f:
    content_bytes = f.read()

# Common corrupted emoji byte sequences and their replacements
# The � character is UTF-8 replacement character (0xEF 0xBF 0xBD)
replacements = [
    # Replacement character patterns - replace with common emojis based on context
    (b'\xef\xbf\xbd', b'\\\\ud83d\\\\udccd'),  # Default to location pin for unknown
]

# Apply byte-level replacements
for old_bytes, new_bytes in replacements:
    content_bytes = content_bytes.replace(old_bytes, new_bytes)

# Decode to string for string-level fixes
try:
    content = content_bytes.decode('utf-8', errors='replace')
except:
    content = content_bytes.decode('latin-1')

# Now do string-level replacements for any remaining issues
string_replacements = {
    # Question mark patterns (these show up as literal ??)
    "icon: '??'": "icon: '\\ud83c\\udfc6'",  # Trophy for achievements
    "icon: '???'": "icon: '\\ud83d\\udccd'",  # Pin for locations  
    "'??'": "'\\ud83d\\udfe0'",  # Orange circle as fallback
    '??\u003c': '\\ud83d\\udccd\u003c',  # Location before HTML
    '??$': '\\ud83d\\udccd$',  # Location before template
    '?? ': '\\ud83d\\udccd ',  # Location with space
}

for old, new in string_replacements.items():
    content = content.replace(old, new)

# Write back
with open('app.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("Fixed all corruptions")
