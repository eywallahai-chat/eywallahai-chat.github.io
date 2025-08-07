import { egitim } from './egitim.js';

const chatInput = document.getElementById('userInput');
const sendMessageBtn = document.getElementById('sendMessageBtn');
const chatArea = document.getElementById('chatArea');
const menuToggleBtn = document.getElementById('menuToggleBtn');
const sidebar = document.getElementById('sidebar');
const newChatBtn = document.getElementById('newChatBtn');
const deleteChatBtn = document.getElementById('deleteChatBtn');
const chatListEl = document.getElementById('chatList');
const searchChats = document.getElementById('searchChats');

const CHAT_PREFIX = 'chat_';
const IDS_KEY = 'chat_ids_v1';
let currentChatId = null;
let messages = [];

// Init
document.addEventListener('DOMContentLoaded', () => {
  bindEvents();
  renderChatList();
  const ids = loadChatIds();
  if (ids.length) selectChat(ids[0]);
  else startNewChat();
  autoResize();
});

function bindEvents(){
  sendMessageBtn?.addEventListener('click', handleSend);
  chatInput?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  });
  chatInput?.addEventListener('input', autoResize);
  menuToggleBtn?.addEventListener('click', () => sidebar?.classList.toggle('open'));
  newChatBtn?.addEventListener('click', () => startNewChat(true));
  deleteChatBtn?.addEventListener('click', deleteCurrentChat);
  searchChats?.addEventListener('input', () => renderChatList(searchChats.value));
}

function autoResize(){
  chatInput.style.height = 'auto';
  chatInput.style.height = Math.min(chatInput.scrollHeight, window.innerHeight * 0.4) + 'px';
}

function createChatKey(id){ return `${CHAT_PREFIX}${id}`; }
function loadChatIds(){
  try{
    const raw = localStorage.getItem(IDS_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    if (!Array.isArray(arr)) return [];
    // Sort by lastUpdated descending
    const mapped = arr.map(id => {
      const item = localStorage.getItem(createChatKey(id));
      if (!item) return null;
      try { return { id, lastUpdated: JSON.parse(item).lastUpdated || '' }; } catch { return null; }
    }).filter(Boolean);
    mapped.sort((a,b) => b.lastUpdated.localeCompare(a.lastUpdated));
    return mapped.map(x => x.id);
  }catch(e){ console.warn(e); return []; }
}
function saveChatIds(ids){ localStorage.setItem(IDS_KEY, JSON.stringify(ids)); }

function renderChatList(filter = ''){
  chatListEl.innerHTML = '';
  const ids = loadChatIds();
  const keep = [];
  ids.forEach(id => {
    const raw = localStorage.getItem(createChatKey(id));
    if (!raw) return;
    const obj = JSON.parse(raw);
    const title = obj.title || (obj.messages && obj.messages[0] ? (obj.messages[0].content||'Yeni Sohbet').slice(0,50) : 'Yeni Sohbet');
    const last = obj.lastUpdated ? new Date(obj.lastUpdated).toLocaleString() : '';
    if (filter && !title.toLowerCase().includes(filter.toLowerCase())) return;

    const item = document.createElement('div'); item.className = 'chat-item'; if (id === currentChatId) item.classList.add('active');
    const left = document.createElement('div');
    const titleEl = document.createElement('div'); titleEl.textContent = title; titleEl.className = 'meta';
    const subEl = document.createElement('div'); subEl.textContent = last; subEl.className = 'time';
    left.appendChild(titleEl); left.appendChild(subEl);

    const right = document.createElement('div');
    const openBtn = document.createElement('button'); openBtn.innerText = 'Aç'; openBtn.className='px-3 py-1 rounded-md bg-gray-800 text-sm';
    openBtn.addEventListener('click', (e)=>{ e.stopPropagation(); selectChat(id); });
    const delBtn = document.createElement('button'); delBtn.innerText = 'Sil'; delBtn.className='ml-2 px-3 py-1 rounded-md bg-red-700 text-sm';
    delBtn.addEventListener('click', (e)=>{ e.stopPropagation(); if(confirm('Sohbeti sil?')) removeChat(id); });
    right.appendChild(openBtn); right.appendChild(delBtn);

    item.appendChild(left); item.appendChild(right);
    item.addEventListener('click', ()=> selectChat(id));
    chatListEl.appendChild(item);
    keep.push(id);
  });
  saveChatIds(keep);
}

function generateTitleFromMessages(msgs){ if(!Array.isArray(msgs) || msgs.length===0) return ''; const m = msgs.find(x=>x.role==='user')||msgs[0]; return (m.content||'').slice(0,60).replace(/\n/g,' '); }

function selectChat(id){
  const raw = localStorage.getItem(createChatKey(id));
  if (!raw) return startNewChat();
  const obj = JSON.parse(raw);
  currentChatId = id;
  messages = Array.isArray(obj.messages) ? obj.messages : [];
  renderMessages();
  const ids = loadChatIds().filter(x=>x!==id); ids.unshift(id); saveChatIds(ids);
  renderChatList();
  sidebar?.classList.remove('open');
}

function startNewChat(focus=true){
  const id = Date.now().toString();
  currentChatId = id; messages = [];
  saveCurrentChat();
  renderMessages();
  const ids = loadChatIds().filter(x=>x!==id); ids.unshift(id); saveChatIds(ids);
  renderChatList();
  if (focus){ chatInput.value=''; autoResize(); chatInput.focus(); }
}

function removeChat(id){
  localStorage.removeItem(createChatKey(id));
  const ids = loadChatIds().filter(x=>x!==id); saveChatIds(ids);
  if (id === currentChatId){ if (ids.length) selectChat(ids[0]); else startNewChat(); } else renderChatList();
}
function deleteCurrentChat(){ if (!currentChatId) return; if (!confirm('Aktif sohbeti silmek istediğinize emin misiniz?')) return; removeChat(currentChatId); }

function saveCurrentChat(){
  if (!currentChatId) return;
  const data = { id: currentChatId, messages, lastUpdated: new Date().toISOString(), title: generateTitleFromMessages(messages) || `Sohbet ${new Date().toLocaleString()}` };
  localStorage.setItem(createChatKey(currentChatId), JSON.stringify(data));
}

function renderMessages(){
  chatArea.innerHTML = '';
  messages.forEach(m => displayMessage(m.role, m.content));
  chatArea.scrollTop = chatArea.scrollHeight;
}
function displayMessage(role, content){
  const div = document.createElement('div');
  div.classList.add('message', role === 'assistant' ? 'ai' : role === 'user' ? 'user' : role);
  if (role === 'assistant' || role === 'ai') div.innerHTML = formatMarkdown(content);
  else div.textContent = content;
  chatArea.appendChild(div);
  chatArea.scrollTop = chatArea.scrollHeight;
}
function displayTypingIndicator(){ if (document.getElementById('typingIndicator')) return; const d = document.createElement('div'); d.id='typingIndicator'; d.className='message ai'; d.innerHTML=`<div class="typing-indicator"><span></span><span></span><span></span></div>`; chatArea.appendChild(d); chatArea.scrollTop = chatArea.scrollHeight;}
function removeTypingIndicator(){ document.getElementById('typingIndicator')?.remove(); }
function formatMarkdown(text=''){ const esc = s => s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); let out = esc(text); out = out.replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>'); out = out.replace(/\*(.+?)\*/g,'<em>$1</em>'); out = out.replace(/`([^`]+)`/g,'<code>$1</code>'); out = out.replace(/\n/g,'<br>'); return out; }

// --- SEND FLOW (calls Netlify)
async function handleSend(){
  const text = chatInput.value.trim();
  if (!text) return;
  // local immediate echo
  displayMessage('user', text);
  messages.push({ role: 'user', content: text });
  saveCurrentChat();
  chatInput.value=''; autoResize();
  displayTypingIndicator();

  // Build payload: include system prompt on server side; here we only send conversation messages
  try{
    const resp = await fetch('/.netlify/functions/hello', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages })
    });

    if (!resp.ok){
      const txt = await resp.text();
      console.error('Function returned error', resp.status, txt);
      throw new Error(`HTTP ${resp.status}: ${txt}`);
    }

    const data = await resp.json();
    removeTypingIndicator();

    // OpenRouter style -> support several content shapes
    let aiText = '';
    if (data?.choices?.[0]?.message?.content){
      const content = data.choices[0].message.content;
      if (typeof content === 'string') aiText = content;
      else if (Array.isArray(content)){
        const t = content.find(c=>c.type==='text' && typeof c.text==='string');
        aiText = t ? t.text : JSON.stringify(content);
      } else if (content?.text) aiText = content.text;
      else aiText = JSON.stringify(content);
    } else if (data?.error){
      throw new Error(data.error);
    } else {
      throw new Error('Geçersiz API yanıtı');
    }

    displayMessage('assistant', aiText);
    messages.push({ role: 'assistant', content: aiText });
    saveCurrentChat();
  }catch(err){
    console.error('send error', err);
    removeTypingIndicator();
    const msg = `Üzgünüm, bir hata oluştu: ${err.message}`;
    displayMessage('assistant', msg);
    messages.push({ role: 'assistant', content: msg });
    saveCurrentChat();
  }
}
