$content = Get-Content 'app.js'
$lineNum = 2516  # The line with the if condition

# Replace the condition to check for chatAssistant instead
$content[2516] = '  if (!state.chatAssistant || !state.chatAssistant.mode) {'

$content | Set-Content 'app.js'
Write-Output "Fixed renderChat function to initialize properly"
