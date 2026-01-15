$content = Get-Content "app.js" -Raw -Encoding UTF8

# Navigation & Common
$content = $content -replace '🏠', '\\ud83c\\udfe0'
$content = $content -replace '🔍', '\\ud83d\\udd0d'
$content = $content -replace '🤖', '\\ud83e\\udd16'
$content = $content -replace '👤', '\\ud83d\\udc64'

# Tabs
$content = $content -replace '📋', '\\ud83d\\udccb'
$content = $content -replace '📅', '\\ud83d\\udcc5'
$content = $content -replace '💰', '\\ud83d\\udcb0'
$content = $content -replace '🗺️', '\\ud83d\\uddfa\\ufe0f'
$content = $content -replace '🗺', '\\ud83d\\uddfa'
$content = $content -replace '🎒', '\\ud83c\\udf92'
$content = $content -replace '📄', '\\ud83d\\udcc4'

# Buttons & Actions
$content = $content -replace '✨', '\\u2728'
$content = $content -replace '➕', '\\u2795'
$content = $content -replace '✏️', '\\u270f\\ufe0f'
$content = $content -replace '✏', '\\u270f'
$content = $content -replace '🗑️', '\\ud83d\\uddd1\\ufe0f'
$content = $content -replace '🗑', '\\ud83d\\uddd1'
$content = $content -replace '❌', '\\u274c'
$content = $content -replace '✓', '\\u2713'
$content = $content -replace '✔️', '\\u2714\\ufe0f'
$content = $content -replace '✔', '\\u2714'

# Vibes & Categories
$content = $content -replace '🏖️', '\\ud83c\\udfd6\\ufe0f'
$content = $content -replace '🏖', '\\ud83c\\udfd6'
$content = $content -replace '🏛️', '\\ud83c\\udfdb\\ufe0f'
$content = $content -replace '🏛', '\\ud83c\\udfdb'
$content = $content -replace '🏔️', '\\ud83c\\udfd4\\ufe0f'
$content = $content -replace '🏔', '\\ud83c\\udfd4'
$content = $content -replace '🎉', '\\ud83c\\udf89'
$content = $content -replace '🧘', '\\ud83e\\uddd8'
$content = $content -replace '💎', '\\ud83d\\udc8e'

# Travel & Places
$content = $content -replace '✈️', '\\u2708\\ufe0f'
$content = $content -replace '✈', '\\u2708'
$content = $content -replace '🏨', '\\ud83c\\udfe8'
$content = $content -replace '🎭', '\\ud83c\\udfad'
$content = $content -replace '🌍', '\\ud83c\\udf0d'
$content = $content -replace '💪', '\\ud83d\\udcaa'

# Misc
$content = $content -replace '🏆', '\\ud83c\\udfc6'
$content = $content -replace '🔧', '\\ud83d\\udd27'
$content = $content -replace '⚙️', '\\u2699\\ufe0f'
$content = $content -replace '⚙', '\\u2699'
$content = $content -replace '🔙', '\\ud83d\\udd19'
$content = $content -replace '🏙️', '\\ud83c\\udfd9\\ufe0f'
$content = $content -replace '🏙', '\\ud83c\\udfd9'
$content = $content -replace '⭐', '\\u2b50'
$content = $content -replace '💵', '\\ud83d\\udcb5'
$content = $content -replace '🍽️', '\\ud83c\\udf7d\\ufe0f'
$content = $content -replace '🍽', '\\ud83c\\udf7d'
$content = $content -replace '🚶', '\\ud83d\\udeb6'
$content = $content -replace '🏃', '\\ud83c\\udfc3'

Set-Content "app.js" $content -Encoding UTF8
Write-Host "✓ Emoji replacement complete in app.js"
