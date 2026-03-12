// Clipboard Manager App
// This app saves clipboard history locally

// Store for clipboard history
const STORAGE_KEY = 'clipboard-history';
const MAX_ITEMS = 50;

// 🚀 Step 1: Initialize Neutralino FIRST
console.log('Initializing Neutralino...');
Neutralino.init();

// 🚀 Step 2: Wait for Neutralino to be READY, then start the app
Neutralino.events.on("ready", () => {
    console.log('✓ Neutralino is ready! Clipboard object:', Neutralino.clipboard);
    showAppInfo();
    loadHistory();
    console.log('Calling updateClipboardDisplay...');
    updateClipboardDisplay();
    
    // Refresh clipboard every 2 seconds
    setInterval(updateClipboardDisplay, 2000);
});

// Handle window close
Neutralino.events.on("windowClose", () => Neutralino.app.exit());

// 📋 Function: Display current clipboard content
async function updateClipboardDisplay() {
    try {
        console.log('Reading clipboard...');
        // Use Neutralino's clipboard API
        const clipboard = await Neutralino.clipboard.readText();
        console.log('Clipboard content:', clipboard);
        document.getElementById('clipboard-input').value = clipboard;
    } catch (error) {
        console.error('Clipboard error:', error.message, error.code);
    }
}

// 💾 Function: Save current clipboard to history
function saveToHistory() {
    const content = document.getElementById('clipboard-input').value;
    
    if (!content.trim()) {
        alert('Clipboard is empty. Nothing to save.');
        return;
    }
    
    // Get existing history
    let history = getHistory();
    
    // Check if this item already exists at the top
    if (history.length > 0 && history[0].content === content) {
        alert('This item is already at the top of history!');
        return;
    }
    
    // Create new history item with timestamp
    const newItem = {
        id: Date.now(),
        content: content,
        timestamp: new Date().toLocaleString(),
        savedDate: new Date()
    };
    
    // Add to beginning of array
    history.unshift(newItem);
    
    // Keep only MAX_ITEMS
    if (history.length > MAX_ITEMS) {
        history = history.slice(0, MAX_ITEMS);
    }
    
    // Save to localStorage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    
    // Refresh display
    loadHistory();
    updateStats();
    
    console.log('✓ Saved to history:', content.substring(0, 50) + '...');
}

// 📚 Function: Get history from localStorage
function getHistory() {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
}

// 🎨 Function: Display history in the UI
function loadHistory() {
    const history = getHistory();
    const historyList = document.getElementById('history-list');
    
    // Clear existing list
    historyList.innerHTML = '';
    
    if (history.length === 0) {
        historyList.innerHTML = '<p class="empty-message">No history yet. Save something!</p>';
        return;
    }
    
    // Create HTML for each history item
    history.forEach((item) => {
        const itemEl = createHistoryItemElement(item);
        historyList.appendChild(itemEl);
    });
    
    updateStats();
}

// 🛠️ Function: Create a history item DOM element
function createHistoryItemElement(item) {
    const div = document.createElement('div');
    div.className = 'history-item';
    
    // Preview text (first 100 characters)
    const preview = item.content.substring(0, 100);
    const hasMore = item.content.length > 100;
    
    div.innerHTML = `
        <div style="flex: 1;">
            <div class="history-item-content" title="${item.content}">
                ${escapeHtml(preview)}${hasMore ? '...' : ''}
            </div>
            <div class="history-item-time">${item.timestamp}</div>
        </div>
        <div class="history-item-buttons">
            <button class="copy-btn" onclick="copyToClipboard('${item.id}')">Copy</button>
            <button class="delete-btn" onclick="deleteItem('${item.id}')">Delete</button>
        </div>
    `;
    
    return div;
}

// 📋 Function: Copy item to clipboard
async function copyToClipboard(itemId) {
    const history = getHistory();
    const item = history.find(h => h.id == itemId);
    
    if (!item) return;
    
    try {
        // Write to system clipboard using Neutralino
        await Neutralino.clipboard.writeText(item.content);
        
        // Visual feedback
        const button = event.target;
        const originalText = button.textContent;
        button.textContent = '✓ Copied!';
        button.style.background = 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)';
        
        setTimeout(() => {
            button.textContent = originalText;
            button.style.background = '';
        }, 1500);
        
        console.log('✓ Copied to clipboard');
        updateClipboardDisplay();
    } catch (error) {
        alert('Error copying to clipboard: ' + error.message);
    }
}

// 🗑️ Function: Delete a history item
function deleteItem(itemId) {
    if (!confirm('Delete this item?')) return;
    
    let history = getHistory();
    history = history.filter(h => h.id != itemId);
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    loadHistory();
    
    console.log('✓ Item deleted');
}

// 🧹 Function: Clear all history
function clearHistory() {
    if (!confirm('Clear all history? This cannot be undone.')) return;
    
    localStorage.removeItem(STORAGE_KEY);
    loadHistory();
    
    console.log('✓ History cleared');
}

// 📊 Function: Update statistics
function updateStats() {
    const history = getHistory();
    document.getElementById('stats-text').textContent = `Items saved: ${history.length} / ${MAX_ITEMS}`;
}

// 🔧 Function: Escape HTML to prevent injection
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}

// ℹ️ Function: Show app info
function showAppInfo() {
    const info = `${NL_APPID} • Port: ${NL_PORT} • ${NL_OS} • v${NL_VERSION}`;
    document.getElementById('app-info').textContent = info;
}

// Neutralino.init() is called at the top of the file
