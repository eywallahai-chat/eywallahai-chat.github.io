import { egitim } from './egitim.js';

// DOM Elements
const chatInput = document.getElementById('userInput');
const sendMessageBtn = document.getElementById('sendMessageBtn');
const chatArea = document.getElementById('chatArea');
const menuToggleBtn = document.getElementById('menuToggleBtn');
const sidebar = document.getElementById('sidebar');
const newChatBtn = document.getElementById('newChatBtn');
const deleteChatBtn = document.getElementById('deleteChatBtn');
const chatListEl = document.getElementById('chatList');
const searchChats = document.getElementById('searchChats');

// Constants
const CHAT_PREFIX = 'chat_';
const IDS_KEY = 'chat_ids_v1';
let currentChatId = null;
let messages = [];

// Karakter temizleme fonksiyonu
function sanitizeText(text) {
    return text
        .replace(/[\u2010-\u2015]/g, "-") // tüm özel tireleri normal tireye çevir
        .replace(/[\u2018\u2019]/g, "'")   // özel tırnakları normal tırnağa çevir
        .replace(/[\u201C\u201D]/g, '"');  // özel çift tırnakları normal çift tırnağa çevir
}

// Initialization
document.addEventListener('DOMContentLoaded', () => {
    bindEvents();
    renderChatList();
    const ids = loadChatIds();
    if (ids.length) selectChat(ids[0]);
    else startNewChat();
    autoResize();
});

// Event Bindings
function bindEvents() {
    // Chat input events
    chatInput?.addEventListener('keydown', handleInputKeydown);
    chatInput?.addEventListener('input', autoResize);
    
    // Button click events
    sendMessageBtn?.addEventListener('click', handleSend);
    menuToggleBtn?.addEventListener('click', toggleSidebar);
    newChatBtn?.addEventListener('click', () => startNewChat(true));
    deleteChatBtn?.addEventListener('click', deleteCurrentChat);
    
    // Search functionality
    searchChats?.addEventListener('input', () => renderChatList(searchChats.value));
    
    // Window resize event for mobile responsiveness
    window.addEventListener('resize', () => {
        if (window.innerWidth > 1024) sidebar?.classList.remove('open');
    });
}

// Input Handling
function handleInputKeydown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
    }
}

function autoResize() {
    if (!chatInput) return;
    chatInput.style.height = 'auto';
    chatInput.style.height = Math.min(chatInput.scrollHeight, window.innerHeight * 0.4) + 'px';
}

// UI Functions
function toggleSidebar() {
    sidebar?.classList.toggle('open');
}

// Chat Storage Functions
function createChatKey(id) {
    return `${CHAT_PREFIX}${id}`;
}

function loadChatIds() {
    try {
        const raw = localStorage.getItem(IDS_KEY);
        if (!raw) return [];
        const arr = JSON.parse(raw);
        if (!Array.isArray(arr)) return [];
        
        // Sort by lastUpdated descending
        const mapped = arr.map(id => {
            const item = localStorage.getItem(createChatKey(id));
            if (!item) return null;
            try {
                return { id, lastUpdated: JSON.parse(item).lastUpdated || '' };
            } catch {
                return null;
            }
        }).filter(Boolean);
        
        mapped.sort((a, b) => b.lastUpdated.localeCompare(a.lastUpdated));
        return mapped.map(x => x.id);
    } catch(e) {
        console.warn('Error loading chat IDs:', e);
        return [];
    }
}

function saveChatIds(ids) {
    localStorage.setItem(IDS_KEY, JSON.stringify(ids));
}

// Chat List Rendering
function renderChatList(filter = '') {
    if (!chatListEl) return;
    chatListEl.innerHTML = '';
    const ids = loadChatIds();
    const keep = [];

    ids.forEach(id => {
        const raw = localStorage.getItem(createChatKey(id));
        if (!raw) return;
        
        const obj = JSON.parse(raw);
        const title = obj.title || (obj.messages?.[0]?.content || 'Yeni Sohbet').slice(0, 50);
        const last = obj.lastUpdated ? new Date(obj.lastUpdated).toLocaleString() : '';
        
        if (filter && !title.toLowerCase().includes(filter.toLowerCase())) return;

        const item = createChatListItem(id, title, last);
        chatListEl.appendChild(item);
        keep.push(id);
    });

    saveChatIds(keep);
}

function createChatListItem(id, title, lastUpdated) {
    const item = document.createElement('div');
    item.className = 'chat-item';
    if (id === currentChatId) item.classList.add('active');

    const left = document.createElement('div');
    const titleEl = document.createElement('div');
    titleEl.textContent = title;
    titleEl.className = 'meta';
    
    const subEl = document.createElement('div');
    subEl.textContent = lastUpdated;
    subEl.className = 'time';
    
    left.appendChild(titleEl);
    left.appendChild(subEl);

    const right = createChatItemButtons(id);

    item.appendChild(left);
    item.appendChild(right);
    item.addEventListener('click', () => selectChat(id));
    
    return item;
}

function createChatItemButtons(id) {
    const right = document.createElement('div');
    
    const openBtn = document.createElement('button');
    openBtn.innerText = 'Aç';
    openBtn.className = 'px-3 py-1 rounded-md bg-gray-800 text-sm';
    openBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        selectChat(id);
    });

    const delBtn = document.createElement('button');
    delBtn.innerText = 'Sil';
    delBtn.className = 'ml-2 px-3 py-1 rounded-md bg-red-700 text-sm';
    delBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if(confirm('Sohbeti silmek istediğinize emin misiniz?')) removeChat(id);
    });

    right.appendChild(openBtn);
    right.appendChild(delBtn);
    return right;
}

// Chat Management Functions
function selectChat(id) {
    const raw = localStorage.getItem(createChatKey(id));
    if (!raw) return startNewChat();
    
    const obj = JSON.parse(raw);
    currentChatId = id;
    messages = Array.isArray(obj.messages) ? obj.messages : [];
    
    renderMessages();
    updateChatList(id);
    sidebar?.classList.remove('open');
}

function updateChatList(id) {
    const ids = loadChatIds().filter(x => x !== id);
    ids.unshift(id);
    saveChatIds(ids);
    renderChatList();
}

function startNewChat(focus = true) {
    const id = Date.now().toString();
    currentChatId = id;
    messages = [];
    
    saveCurrentChat();
    renderMessages();
    updateChatList(id);
    
    if (focus && chatInput) {
        chatInput.value = '';
        autoResize();
        chatInput.focus();
    }
}

function removeChat(id) {
    localStorage.removeItem(createChatKey(id));
    const ids = loadChatIds().filter(x => x !== id);
    saveChatIds(ids);
    
    if (id === currentChatId) {
        if (ids.length) selectChat(ids[0]);
        else startNewChat();
    } else {
        renderChatList();
    }
}

function deleteCurrentChat() {
    if (!currentChatId || !confirm('Aktif sohbeti silmek istediğinize emin misiniz?')) return;
    removeChat(currentChatId);
}

function saveCurrentChat() {
    if (!currentChatId) return;
    
    const data = {
        id: currentChatId,
        messages,
        lastUpdated: new Date().toISOString(),
        title: generateTitleFromMessages(messages) || `Sohbet ${new Date().toLocaleString()}`
    };
    
    localStorage.setItem(createChatKey(currentChatId), JSON.stringify(data));
}

// Message Handling Functions
function generateTitleFromMessages(msgs) {
    if (!Array.isArray(msgs) || msgs.length === 0) return '';
    const m = msgs.find(x => x.role === 'user') || msgs[0];
    return (m.content || '').slice(0, 60).replace(/\n/g, ' ');
}

function renderMessages() {
    if (!chatArea) return;
    chatArea.innerHTML = '';
    messages.forEach(m => displayMessage(m.role, m.content));
    scrollToBottom();
}

function displayMessage(role, content) {
    if (!chatArea) return;
    const div = document.createElement('div');
    div.classList.add('message', role === 'assistant' ? 'ai' : role === 'user' ? 'user' : role);
    
    if (role === 'assistant' || role === 'ai') {
        div.innerHTML = formatMarkdown(sanitizeText(content));
    } else {
        div.textContent = content;
    }
    
    chatArea.appendChild(div);
    scrollToBottom();
}

function scrollToBottom() {
    if (chatArea) chatArea.scrollTop = chatArea.scrollHeight;
}

// Loading Indicator Functions
function displayTypingIndicator() {
    if (document.getElementById('typingIndicator')) return;
    
    const indicator = document.createElement('div');
    indicator.id = 'typingIndicator';
    indicator.className = 'message ai';
    indicator.innerHTML = `<div class="typing-indicator"><span></span><span></span><span></span></div>`;
    
    chatArea?.appendChild(indicator);
    scrollToBottom();
}

function removeTypingIndicator() {
    document.getElementById('typingIndicator')?.remove();
}

// Markdown Formatting
function formatMarkdown(text = '') {
    const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    let out = esc(text);
    
    // Basic Markdown formatting
    out = out.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');  // Bold
    out = out.replace(/\*(.+?)\*/g, '<em>$1</em>');             // Italic
    out = out.replace(/`([^`]+)`/g, '<code>$1</code>');         // Code
    out = out.replace(/\n/g, '<br>');                           // Line breaks
    
    return out;
}

// API Communication
async function handleSend() {
    const text = chatInput?.value.trim();
    if (!text) return;

    // Local message display
    displayMessage('user', text);
    messages.push({ role: 'user', content: text });
    saveCurrentChat();
    
    if (chatInput) {
        chatInput.value = '';
        autoResize();
    }
    
    displayTypingIndicator();

    try {
        const resp = await fetch('/.netlify/functions/hello', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ messages })
        });

        if (!resp.ok) {
            const txt = await resp.text();
            console.error('Function returned error', resp.status, txt);
            throw new Error(`HTTP ${resp.status}: ${txt}`);
        }

        const data = await resp.json();
        removeTypingIndicator();

        // Handle OpenRouter response
        const aiText = extractAIResponse(data);
        displayMessage('assistant', aiText);
        messages.push({ role: 'assistant', content: aiText });
        saveCurrentChat();
        
    } catch (err) {
        console.error('Send error:', err);
        removeTypingIndicator();
        
        const errorMessage = `Üzgünüm, bir hata oluştu: ${err.message}`;
        displayMessage('assistant', errorMessage);
        messages.push({ role: 'assistant', content: errorMessage });
        saveCurrentChat();
    }
}

function extractAIResponse(data) {
    if (data?.choices?.[0]?.message?.content) {
        const content = data.choices[0].message.content;
        
        if (typeof content === 'string') {
            return content;
        }
        if (Array.isArray(content)) {
            const textContent = content.find(c => c.type === 'text' && typeof c.text === 'string');
            return textContent ? textContent.text : JSON.stringify(content);
        }
        if (content?.text) {
            return content.text;
        }
        return JSON.stringify(content);
    }
    
    if (data?.error) {
        throw new Error(data.error);
    }
    
    throw new Error('Geçersiz API yanıtı');
}

// Export for use in other modules if needed
export {
    startNewChat,
    handleSend,
    sanitizeText
};
