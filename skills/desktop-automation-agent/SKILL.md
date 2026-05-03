---
name: desktop-automation-agent
description: Control your desktop from OpenClaw. Automate mouse clicks, keyboard input, window management, and screen capture across macOS and Linux. Perfect for automating repetitive desktop tasks, testing GUI applications, and creating AI-powered desktop workflows.
tags: [automation, desktop, gui, mouse, keyboard, cli]
author: thenatechambers
version: 1.0.0
---

# Desktop Automation Agent

Control your desktop environment directly from OpenClaw. This skill enables your AI agent to perform mouse movements, keyboard input, window management, and screen captures — opening up automation possibilities beyond the browser.

## What It Does

- **Mouse Control:** Click, move, drag, and scroll anywhere on screen
- **Keyboard Input:** Type text, send keyboard shortcuts, trigger hotkeys
- **Window Management:** Find, focus, move, and resize application windows
- **Screen Capture:** Take screenshots for analysis or verification
- **App Launching:** Open applications with specific documents or URLs

## Use Cases

- **Automated Testing:** Have your agent test desktop applications by interacting with their UI
- **Data Entry:** Fill forms in desktop apps that lack APIs (legacy systems, proprietary software)
- **Content Creation:** Automate repetitive tasks in design tools (Photoshop, Figma, Blender)
- **Workflow Orchestration:** Chain desktop actions with web automation and API calls
- **GUI Scripting:** Build visual macros that work across any application

## Prerequisites

### macOS
```bash
# Install cliclick for mouse/keyboard automation
brew install cliclick

# Install screencapture (built-in)
# No additional install needed
```

### Linux (Ubuntu/Debian)
```bash
# Install xdotool for X11 automation
sudo apt-get install xdotool

# Install scrot for screenshots
sudo apt-get install scrot

# For Wayland, install wtype and grim
sudo apt-get install wtype grim
```

## Installation

1. Copy this skill to your OpenClaw workspace:
   ```bash
   cp -r skills/desktop-automation-agent /path/to/openclaw/skills/
   ```

2. Verify dependencies are installed (see Prerequisites above)

3. Test basic functionality:
   ```bash
   # macOS
   cliclick p  # Prints current mouse position
   
   # Linux
   xdotool getmouselocation  # Prints current mouse position
   ```

## Usage Examples

### Basic Mouse Click
```markdown
Click at screen coordinates (500, 300)
```

The agent will execute:
```bash
# macOS
cliclick c:500,300

# Linux
xdotool mousemove 500 300 click 1
```

### Type Text into Active Window
```markdown
Type "Hello, World!" into the currently focused text field
```

The agent will execute:
```bash
# macOS
cliclick t:"Hello, World!"

# Linux
xdotool type "Hello, World!"
```

### Take Screenshot and Analyze
```markdown
Take a screenshot of the current screen and describe what you see
```

The agent will:
1. Capture screen: `screencapture screen.png` (macOS) or `scrot screen.png` (Linux)
2. Use the `image` tool to analyze the screenshot
3. Report findings

### Open Application
```markdown
Open Safari and navigate to example.com
```

The agent will execute:
```bash
# macOS
open -a Safari "https://example.com"

# Linux
xdg-open "https://example.com"
```

### Keyboard Shortcuts
```markdown
Send Command+S to save the current document
```

The agent will execute:
```bash
# macOS
cliclick kd:cmd s ku:cmd

# Linux
xdotool key "ctrl+s"
```

### Window Management
```markdown
Find the Chrome window titled "Inbox" and move it to the left half of the screen
```

The agent will execute:
```bash
# macOS (using osascript for window management)
osascript -e 'tell application "System Events" to tell process "Chrome"
  set position of window 1 to {0, 25}
  set size of window 1 to {960, 1055}
end tell'

# Linux
xdotool search --name "Inbox" windowactivate
xdotool search --name "Inbox" windowsize 960 1055
xdotool search --name "Inbox" windowmove 0 0
```

## Advanced Workflows

### Automated Data Entry
```markdown
I need to transfer 50 records from a CSV into a desktop CRM that has no API.

The workflow is:
1. Copy the next value from column A in the CSV
2. Click on the CRM's "Name" field at coordinates (400, 200)
3. Paste the value
4. Repeat for columns B and C
5. Click the "Save" button at (800, 600)
6. Wait 2 seconds for the save to complete
7. Repeat for the next row
```

Your agent can script this entire workflow using the desktop automation tools.

### Visual Regression Testing
```markdown
Every morning, open the dashboard app, navigate to the Reports section, 
take a screenshot, and compare it to yesterday's to spot visual changes.
```

The agent can:
1. Launch the dashboard application
2. Navigate through menus using clicks and keyboard shortcuts
3. Capture screenshots at each step
4. Use the `image` tool to compare screenshots and flag differences

### Cross-Application Workflows
```markdown
Extract data from a web app, process it in Excel, then paste results into Slack
```

The agent can:
1. Use browser tools to extract data from the web app
2. Switch to Excel using window activation
3. Input and process data using desktop automation
4. Switch to Slack and paste results

## Security Considerations

⚠️ **Important:** Desktop automation has elevated privileges. Use with care:

- This skill can interact with ANY application on your desktop
- Never run untrusted automation scripts
- Be cautious when automating password entry or sensitive actions
- Consider using a dedicated automation user/account for testing
- Review all commands before execution in production environments

## Configuration

Create a `~/.openclaw/desktop-automation.json` config file:

```json
{
  "platform": "auto",
  "screenshot_directory": "~/Screenshots",
  "default_delay_ms": 500,
  "safety_confirm_destructive": true
}
```

## Troubleshooting

### "cliclick: command not found"
Install cliclick: `brew install cliclick`

### "xdotool: command not found"
Install xdotool: `sudo apt-get install xdotool`

### Screenshot permission denied (macOS)
Grant Terminal/Shell screen recording permission:
- System Preferences → Security & Privacy → Privacy → Screen Recording
- Add your terminal application

### Window not found errors
Some applications require accessibility permissions:
- macOS: System Preferences → Security & Privacy → Privacy → Accessibility
- Add the application running OpenClaw

## Platform Differences

| Feature | macOS | Linux (X11) | Linux (Wayland) |
|---------|-------|-------------|-----------------|
| Mouse/Keyboard | cliclick | xdotool | wtype (limited) |
| Screenshots | screencapture | scrot | grim |
| Window mgmt | osascript | xdotool | Limited support |
| App launching | open | xdg-open | xdg-open |

## Extending This Skill

Add new capabilities by creating wrapper scripts in the `scripts/` directory:

```bash
# scripts/smart-click.sh
#!/bin/bash
# Click only if element exists at coordinates (with image recognition)
```

## Resources

- [cliclick documentation](https://github.com/BlueM/cliclick)
- [xdotool documentation](https://github.com/jordansissel/xdotool)
- [AppleScript window management](https://developer.apple.com/library/archive/documentation/AppleScript/Conceptual/AppleScriptLangGuide/)

## License

MIT — Free for personal and commercial use.
