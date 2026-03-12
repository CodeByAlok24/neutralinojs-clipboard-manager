# 📋 Clipboard Manager - Neutralinojs Desktop App

A lightweight, cross-platform Clipboard Manager application built with **Neutralinojs** demonstrating native API usage for clipboard operations, event handling, and persistent storage.

## ✨ Features

- **Auto Clipboard Detection** - Automatically detects and displays copied text every 2 seconds
- **History Persistence** - Stores up to 50 clipboard items in local storage
- **Quick Copy** - One-click copy any history item back to clipboard
- **Delete Items** - Remove individual history entries
- **Clear History** - Bulk delete all saved clipboard items
- **Real-time Stats** - Display total items saved and current clipboard length
- **Beautiful UI** - Clean purple gradient design with smooth animations
- **Cross-Platform** - Works on Windows, macOS, and Linux

## 🧠 How It's Built Using Neutralinojs APIs

### 1. **Clipboard API** (`Neutralino.clipboard`)

The core of the app - handles all clipboard operations:

```javascript
// Reading clipboard text (auto-detection every 2 seconds)
const clipboardText = await Neutralino.clipboard.readText();

// Writing to clipboard
await Neutralino.clipboard.writeText(text);
```

**Implementation:**

```javascript
// Auto-detect clipboard every 2 seconds
setInterval(updateClipboardDisplay, 2000);

async function updateClipboardDisplay() {
  try {
    const currentText = await Neutralino.clipboard.readText();
    document.getElementById("clipboard-input").value = currentText;

    // Auto-save to history if different
    if (currentText && currentText !== lastClipboardText) {
      lastClipboardText = currentText;
      saveToHistory();
    }
  } catch (error) {
    console.error("Error reading clipboard:", error);
  }
}
```

### 2. **Storage API** (`Neutralino.storage`)

Persistent data storage for clipboard history:

```javascript
// Save history to storage
await Neutralino.storage.setData("clipboard-history", JSON.stringify(history));

// Load history from storage
const savedHistory = await Neutralino.storage.getData("clipboard-history");
```

**Implementation:**

```javascript
function getHistory() {
  const rawHistory = localStorage.getItem("clipboard-history");
  return rawHistory ? JSON.parse(rawHistory) : [];
}

function saveHistoryToStorage() {
  const history = getHistory();
  localStorage.setItem(
    "clipboard-history",
    JSON.stringify(history.slice(0, 50)),
  );
}
```

### 3. **Events API** (`Neutralino.events`)

Handles application lifecycle and event listening:

```javascript
// Wait for Neutralino to be ready
Neutralino.events.on("ready", () => {
  // Initialize app after framework is ready
});

// Listen for window close events
Neutralino.events.on("windowClose", () => {
  Neutralino.app.exit();
});
```

**Implementation:**

```javascript
// Initialize on Neutralino ready
Neutralino.init();

Neutralino.events.on("ready", () => {
  console.log("✓ Neutralino is ready!");
  loadHistory();
  updateClipboardDisplay();
  setInterval(updateClipboardDisplay, 2000);
});

// Handle app exit
Neutralino.events.on("windowClose", () => {
  Neutralino.app.exit();
});
```

### 4. **App API** (`Neutralino.app`)

Application control and exit handling:

```javascript
// Exit the application
Neutralino.app.exit();

// Get app info
const appInfo = await Neutralino.app.getAppInfo();
```

## 🏗️ Project Structure

```
clipboard-manager/
├── resources/
│   ├── index.html          # Main UI markup
│   ├── styles.css          # Styling & animations
│   ├── favicon.ico         # App icon
│   └── js/
│       ├── main.js         # Core logic
│       ├── neutralino.js   # Neutralino client library
│       └── neutralino.d.ts # TypeScript definitions
├── bin/                    # Neutralino runtime binaries
├── .tmp/                   # Temp files (build artifacts)
├── neutralino.config.json  # App configuration
├── LICENSE
└── README.md
```

## 🔑 Key Implementation Details

### **Initialization Order** (Critical for Success)

```javascript
// 1. Initialize Neutralino FIRST
Neutralino.init();

// 2. Wait for "ready" event before using APIs
Neutralino.events.on("ready", () => {
  // 3. THEN call any Neutralino APIs
  showAppInfo();
  loadHistory();
  updateClipboardDisplay();
  setInterval(updateClipboardDisplay, 2000);
});
```

**Why this matters:** Neutralino needs to establish communication with the native runtime before JavaScript can call any APIs. Calling APIs before the "ready" event will fail.

### **Clipboard Auto-Detection Logic**

```javascript
let lastClipboardText = "";

async function updateClipboardDisplay() {
  try {
    const currentText = await Neutralino.clipboard.readText();

    // Update textarea display
    document.getElementById("clipboard-input").value = currentText;

    // Detect NEW clipboard content (different from last check)
    if (
      currentText &&
      currentText !== lastClipboardText &&
      currentText.length > 0
    ) {
      lastClipboardText = currentText;
      saveToHistory(); // Auto-save new content
    }
  } catch (error) {
    console.error("Error reading clipboard:", error);
  }
}
```

### **History Persistence Pattern**

```javascript
// Custom localStorage wrapper
function getHistory() {
  const raw = localStorage.getItem("clipboard-history");
  return raw ? JSON.parse(raw) : [];
}

function addToHistory(text) {
  const history = getHistory();
  history.push({
    id: Date.now(),
    text: text,
    timestamp: new Date().toLocaleString(),
  });
  // Keep only last 50 items
  if (history.length > 50) history.shift();

  localStorage.setItem("clipboard-history", JSON.stringify(history));
}
```

### **Event-Driven Copy Functionality**

```javascript
async function copyToClipboard(text) {
  try {
    // Use Neutralino.clipboard to write text
    await Neutralino.clipboard.writeText(text);

    // Visual feedback
    showNotification("✓ Copied to clipboard!");

    // Update display
    document.getElementById("clipboard-input").value = text;
  } catch (error) {
    console.error("Copy failed:", error);
    showNotification("✗ Failed to copy");
  }
}
```

## 🚀 Getting Started

### Prerequisites

- [Neutralinojs CLI](https://neutralino.js.org/docs/getting-started/setup)
- Node.js v14+ (for `neu` CLI)
- Windows, macOS, or Linux

### Installation & Running

```bash
# Install Neutralinojs CLI globally
npm install -g @neutralinojs/neu

# Navigate to project
cd clipboard-manager

# Run development server
neu run

# Build for distribution
neu build
```

### Development

The app runs in a local development server on `http://localhost:60817` by default.

**Hot Reload:** Modify `resources/js/main.js` or `resources/styles.css` and refresh the app window.

## 📊 Neutralinojs APIs Configuration

The app requires these permissions in `neutralino.config.json`:

```json
{
  "nativeAllowList": ["app.*", "os.*", "clipboard.*", "debug.log"]
}
```

| Permission    | Purpose                          |
| ------------- | -------------------------------- |
| `app.*`       | Application control (exit, info) |
| `os.*`        | OS operations                    |
| `clipboard.*` | Read/write clipboard             |
| `debug.log`   | Console logging                  |

## 🎯 Technical Learnings

### Problem Encountered & Solved

**Issue:** Application crashed when path contained special characters (e.g., `GSOC'26`)

- **Cause:** Neutralino server injects global variables without escaping special chars
- **Example Bug:** `var NL_CWD='D:/GSOC'26/...'` breaks JavaScript (apostrophe terminates string)
- **Solution:** Use clean paths without special characters

### Best Practices Discovered

1. **Always initialize in order:**
   - `Neutralino.init()` → wait for `"ready"` event → use APIs

2. **Async operations:**
   - All clipboard operations are async (use `await`)
   - Handle errors with try-catch

3. **Event-driven architecture:**
   - Use `Neutralino.events.on()` for lifecycle
   - React to native events from the framework

4. **Storage patterns:**
   - Use localStorage for small data (history items)
   - Structure data in JSON for easy serialization

5. **UI/UX considerations:**
   - Provide visual feedback for clipboard operations
   - Auto-detection should have reasonable intervals (2s works well)
   - Show stats to engage users

## 🎨 UI/UX Features

- **Purple Gradient Theme** (`linear-gradient(135deg, #667eea 0%, #764ba2 100%)`)
- **Smooth Animations** (slideIn, fadeIn effects)
- **Responsive Layout** (works on different screen sizes)
- **Styled Scrollbars** (custom styling for better UX)
- **Clear Visual States** (empty state, activity feedback)

## 📦 Building for Distribution

```bash
# Build for Windows
neu build --release

# Build for macOS
neu build --release -p darwin

# Build for Linux
neu build --release -p linux
```

Output: `/dist/<platform>/` contains distributable files

## 🐛 Debugging

Open **Developer Tools** with `F12` to see:

```javascript
console.log("Initializing Neutralino...");
console.log("✓ Neutralino is ready!");
console.log("Reading clipboard...");
```

Check console for any API errors or initialization issues.

## 📋 Example Workflow

1. **User copies text** → OS clipboard updated
2. **App detects change** (every 2 seconds) → `updateClipboardDisplay()` called
3. **`Neutralino.clipboard.readText()`** → retrieves clipboard text
4. **Text displayed in textarea** → user sees current clipboard
5. **`saveToHistory()`** → adds to array & localStorage
6. **History list updated** → user sees all saved items
7. **User clicks item** → `copyToClipboard()` writes back to OS clipboard
8. **Cycle repeats** → real-time synchronization

## 🏆 Neutralinojs Advantages Demonstrated

✅ **Lightweight** - No Electron/Node.js bloat  
✅ **Fast** - Native app performance  
✅ **Cross-platform** - Single codebase works everywhere  
✅ **Native APIs** - Access OS features (clipboard, storage, events)  
✅ **Web Technologies** - HTML/CSS/JS familiar to web devs

## 📝 License

MIT License - See [LICENSE](LICENSE) file

## 🙏 Acknowledgments

Built as a practical learning project for **GSoC 2026** to understand Neutralinojs framework architecture and native API integration.

**Framework:** [Neutralinojs](https://neutralino.js.org)

---

**For Questions or Contributions:** Open an issue or submit a PR!

Made with ❤️ using Neutralinojs
