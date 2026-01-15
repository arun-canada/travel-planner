import re
import sys

# Read with fallback encoding
try:
    with open('app.js', 'rb') as f:
        raw_bytes = f.read()
    content = raw_bytes.decode('utf-8', errors='replace')
except Exception as e:
    print(f"Error reading file: {e}")
    sys.exit(1)

# Find all instances of replacement character (�) or ?? patterns
issues = []
for i, char in enumerate(content):
    if char == '\ufffd' or (char == '?' and i > 0 and content[i-1] == '?'):
        context_start = max(0, i - 30)
        context_end = min(len(content), i + 30)
        issues.append({
            'pos': i,
            'char': char,
            'context': content[context_start:context_end]
        })

# Print first 20 issues
print(f"Found {len(issues)} potential corruption points")
for issue in issues[:20]:
    print(f"Position {issue['pos']}: ...{issue['context']}...")
    
sys.stdout.buffer.write(b'\n')
