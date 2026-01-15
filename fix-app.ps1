$lines = Get-Content 'app.js'
$keep = $lines[0..1603] + $lines[1896..($lines.Count-1)]
$keep | Set-Content 'app.js-new'
Move-Item -Path 'app.js-new' -Destination 'app.js' -Force
Write-Output "Successfully removed old chatbot code"
