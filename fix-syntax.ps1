$content = Get-Content 'app.js'

# Find and fix the renderChat function (around line 2514)
$content[2515] = '  document.getElementById(''chatPage'').classList.remove(''hidden'');'
$content[2516] = '  if (!state.chatAssistant || !state.chatAssistant.mode) {'
$content[2517] = '    initializeChatbot();'
$content[2518] = '  }'
$content[2519] = '}'

$content | Set-Content 'app.js'
Write-Output "Fixed renderChat function syntax"
