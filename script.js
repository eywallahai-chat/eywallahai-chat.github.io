import { egitim } from './egitim.js';

// DOM Elements
const chatInput = document.getElementById('userInput');
const sendMessageBtn = document.getElementById('sendMessageBtn');
const chatArea = document.getElementById('chatArea');
const newChatBtn = document.getElementById('newChatBtn');
const deleteChatBtn = document.getElementById('deleteChatBtn');
const chatListEl = document.getElementById('chatList');
const searchChats = document.getElementById('searchChats');

const CHAT_PREFIX = 'chat_';
const IDS_KEY = 'chat_ids_v1';
let currentChatId = null;
let messages = [];

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
  chatInput?.addEventListener('keydown', handleInputKeydown);
  chatInput?.addEventListener('input', autoResize);
  sendMessageBtn?.addEventListener('click', handleSend);
  newChatBtn?.addEventListener('click', () => startNewChat(true));
  deleteChatBtn?.addEventListener('click', deleteCurrentChat);
  searchChats?.addEventListener('input', () => renderChatList(searchChats.value));
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

    const mapped = arr
      .map(id => {
        const item = localStorage.getItem(createChatKey(id));
        if (!item) return null;
        try {
          return { id, lastUpdated: JSON.parse(item).lastUpdated || '' };
        } catch {
          return null;
        }
      })
      .filter(Boolean);

    mapped.sort((a, b) => b.lastUpdated.localeCompare(a.lastUpdated));
    return mapped.map(x => x.id);
  } catch (e) {
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
  item.className = 'chat-item cursor-pointer px-3 py-2 rounded hover:bg-gray-700 flex justify-between items-center';
  if (id === currentChatId) item.classList.add('bg-gray-700');

  const left = document.createElement('div');
  left.className = 'flex flex-col';
  const titleEl = document.createElement('div');
  titleEl.textContent = title;
  titleEl.className = 'font-semibold text-sm truncate max-w-[12rem]';

  const subEl = document.createElement('div');
  subEl.textContent = lastUpdated;
  subEl.className = 'text-xs text-gray-400';

  left.appendChild(titleEl);
  left.appendChild(subEl);

  item.appendChild(left);
  item.addEventListener('click', () => selectChat(id));

  return item;
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
  div.classList.add('message');

  if (role === 'assistant' || role === 'ai') {
    div.classList.add('assistant');
    div.innerHTML = formatMarkdown(sanitizeText(content));
  } else if (role === 'user') {
    div.classList.add('user');
    div.textContent = content;
  } else {
    div.textContent = content;
  }

  chatArea.appendChild(div);
  scrollToBottom();
}

function scrollToBottom() {
  if (!chatArea) return;
  chatArea.scrollTop = chatArea.scrollHeight;
}

function sanitizeText(text) {
  return text
    .replace(/[\u2010-\u2015]/g, "-") // tüm özel tireleri normal tireye çevir
    .replace(/[\u2018\u2019]/g, "'")   // özel tırnakları normal tırnağa çevir
    .replace(/[\u201C\u201D]/g, '"');  // özel çift tırnakları normal çift tırnağa çevir
}

function formatMarkdown(text = '') {
  co
