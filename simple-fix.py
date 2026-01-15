with open('app.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Simple string replacements
content = content.replace('? Back', '\\u2190 Back')
content = content.replace('? All Categories', '\\u2190 All Categories')
content = content.replace('Continue ?', 'Continue \\u2192')

with open('app.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("Done")
