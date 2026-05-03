#!/bin/bash
# Desktop Automation Helper Script
# Detects platform and provides unified interface for desktop automation

set -e

# Detect platform
detect_platform() {
  case "$(uname -s)" in
    Darwin*) echo "macos" ;;
    Linux*) echo "linux" ;;
    *) echo "unknown" ;;
  esac
}

# Get mouse position
get_mouse_position() {
  local platform=$(detect_platform)
  
  if [ "$platform" = "macos" ]; then
    cliclick p | sed 's/.*x:\([0-9]*\) y:\([0-9]*\).*/\1 \2/'
  elif [ "$platform" = "linux" ]; then
    xdotool getmouselocation | sed 's/x:\([0-9]*\) y:\([0-9]*\).*/\1 \2/'
  fi
}

# Move and click mouse
click_at() {
  local x=$1
  local y=$2
  local platform=$(detect_platform)
  
  if [ "$platform" = "macos" ]; then
    cliclick "c:${x},${y}"
  elif [ "$platform" = "linux" ]; then
    xdotool mousemove "$x" "$y" click 1
  fi
}

# Type text
type_text() {
  local text="$1"
  local platform=$(detect_platform)
  
  if [ "$platform" = "macos" ]; then
    cliclick "t:${text}"
  elif [ "$platform" = "linux" ]; then
    xdotool type "$text"
  fi
}

# Take screenshot
screenshot() {
  local output_path="${1:-screenshot.png}"
  local platform=$(detect_platform)
  
  if [ "$platform" = "macos" ]; then
    screencapture "$output_path"
  elif [ "$platform" = "linux" ]; then
    scrot "$output_path"
  fi
  
  echo "Screenshot saved to: $output_path"
}

# Main command handler
case "$1" in
  position)
    get_mouse_position
    ;;
  click)
    click_at "$2" "$3"
    ;;
  type)
    type_text "$2"
    ;;
  screenshot)
    screenshot "$2"
    ;;
  *)
    echo "Usage: $0 {position|click <x> <y>|type <text>|screenshot [path]}"
    exit 1
    ;;
esac
