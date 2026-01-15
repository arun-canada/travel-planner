import sys

try:
    # Try UTF-8 first
    with open('app.js', 'r', encoding='utf-8') as f:
        content = f.read()
except UnicodeDecodeError:
    # Fall back to latin-1 which accepts all bytes
    with open('app.js', 'r', encoding='latin-1') as f:
        content = f.read()

# Direct replacements only - no regex
content = content.replace("icon: '??', title: 'First Steps'", "icon: '\\ud83c\\udfc6', title: 'First Steps'")
content = content.replace("icon: '??', title: 'Budget Master'", "icon: '\\ud83d\\udcb0', title: 'Budget Master'")
content = content.replace("icon: '??', title: 'Globetrotter'", "icon: '\\ud83c\\udf0d', title: 'Globetrotter'")
content = content.replace("icon: '??', description: 'Create your", "icon: '\\ud83c\\udfc6', description: 'Create your")
content = content.replace("icon: '???', description: 'Add", "icon: '\\ud83d\\udccd', description: 'Add")
content = content.replace("icon: '??', description: 'Track", "icon: '\\ud83d\\udcb0', description: 'Track")
content = content.replace("icon: '??', description: 'Create 5", "icon: '\\u2708\\ufe0f', description: 'Create 5")
content = content.replace("icon: '??', description: 'Visit", "icon: '\\ud83c\\udf0e', description: 'Visit")
content = content.replace("icon: '??', description: 'Complete 3", "icon: '\\ud83c\\udf92', description: 'Complete 3")
content = content.replace("icon: '??', description: 'Use all", "icon: '\\u2b50', description: 'Use all")
content = content.replace("icon: '??', description: 'Upload", "icon: '\\ud83d\\udcc4', description: 'Upload")
content = content.replace("showToast(`?? Level Up", "showToast(`\\ud83c\\udf89 Level Up")
content = content.replace("{ success: '?', error: '?', info: '??', warning: '??' }", "{ success: '\\u2713', error: '\\u274c', info: '\\u2139\\ufe0f', warning: '\\u26a0\\ufe0f' }")
content = content.replace("food: '??'", "food: '\\ud83c\\udf7d\\ufe0f'")
content = content.replace("transport: '??'", "transport: '\\ud83d\\ude97'")
content = content.replace("lodging: '??'", "lodging: '\\ud83c\\udfe8'")
content = content.replace("activities: '???'", "activities: '\\ud83c\\udfad'")
content = content.replace("shopping: '???'", "shopping: '\\ud83d\\udecd\\ufe0f'")
content = content.replace("flights: '??'", "flights: '\\u2708\\ufe0f'")
content = content.replace("other: '??'", "other: '\\ud83d\\udcb5'")
content = content.replace("|| '??'", "|| '\\ud83d\\udcb5'")
content = content.replace("?? ${day.weekday}", "\\ud83d\\udcc5 ${day.weekday}")
content = content.replace("?? ${activity.duration}", "\\u23f1\\ufe0f ${activity.duration}")
content = content.replace("?? ${activity.type}", "\\ud83c\\udfaf ${activity.type}")
content = content.replace("?? ${activity.steps}", "\\ud83d\\udc63 ${activity.steps}")
content = content.replace("?? Share", "\\ud83d\\udd17 Share")
content = content.replace("?? ${trip.destinations", "\\ud83d\\udccd ${trip.destinations")
content = content.replace("?? ${trip.budget.expenses", "\\ud83d\\udcb0 ${trip.budget.expenses")
content = content.replace("?? ${d.name}", "\\ud83d\\udccd ${d.name}")
content = content.replace(">${i + 1}. ??", ">${i + 1}. \\ud83d\\udccd")
content = content.replace("\u003e???", "\u003e\\ud83d\\uddd1\\ufe0f")  # Delete icon

with open('app.js', 'w', encoding='utf-8') as f:
    f.write(content)

sys.stdout.buffer.write(b'Done - Fixed emojis\n')
