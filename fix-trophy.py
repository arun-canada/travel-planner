with open('app.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace all instances of money bag with trophy
content = content.replace('\\\\ud83d\\\\udcb0', '\\\\ud83c\\\\udfc6')

with open('app.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("Fixed XP bar trophy emoji")
