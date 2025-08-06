const chatOutput = document.getElementById('chat-output');
const chatList = document.getElementById('chat-list');
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');
const newChatBtn = document.getElementById('new-chat');
const modToggle = document.getElementById('mod-toggle');
const modMenu = document.getElementById('mod-menu');

let chats = [];
let currentChatIndex = -1;
let currentMode = 'egitim';

// Yeni sohbet aç
function newChat() {
  chats.push({ mode: currentMode, messages: [] });
  currentChatIndex = chats.length - 1;
  renderChatList();
  renderChatOutput();
}

// Sohbet listesini göster
function renderChatList() {
  chatList.innerHTML = '';
  chats.forEach((chat, index) => {
    const li = document.createElement('li');
    li.textContent = `Sohbet ${index + 1} - ${chat.mode}`;
    if (index === currentChatIndex) li.classList.add('active');
    li.onclick = () => {
      currentChatIndex = index;
      renderChatOutput();
      renderChatList();
    };
    chatList.appendChild(li);
  });
}

// Sohbet mesajlarını göster
function renderChatOutput() {
  chatOutput.innerHTML = '';
  if (currentChatIndex < 0) return;
  chats[currentChatIndex].messages.forEach(msg => {
    const div = document.createElement('div');
    div.classList.add('message');
    div.classList.add(msg.user === 'user' ? 'user-message' : 'bot-message');
    div.textContent = msg.text;
    chatOutput.appendChild(div);
  });
  chatOutput.scrollTop = chatOutput.scrollHeight;
}

// Mesaj gönderme
function sendMessage() {
  const text = userInput.value.trim();
  if (!text || currentChatIndex < 0) return;
  // Kullanıcı mesajı ekle
  chats[currentChatIndex].messages.push({ user: 'user', text });
  renderChatOutput();
  userInput.value = '';
  userInput.focus();

  // Basit bot cevabı (örnek)
  setTimeout(() => {
    const botReply = `Eywallah AI (${currentMode} modu): ${text.split('').reverse().join('')}`;
    chats[currentChatIndex].messages.push({ user: 'bot', text: botReply });
    renderChatOutput();
  }, 500);
}

// Mod menüsünü aç/kapa
function toggleModMenu() {
  modMenu.classList.toggle('hidden');
}

// Mod seç
function setMode(mode) {
  currentMode = mode;
  toggleModMenu();
  if (currentChatIndex >= 0) {
    chats[currentChatIndex].mode = mode;
    renderChatList();
    renderChatOutput();
  }
}

// Event Listeners
sendBtn.addEventListener('click', (e) => {
  e.preventDefault();
  sendMessage();
});

userInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
});

newChatBtn.addEventListener('click', newChat);
modToggle.addEventListener('click', toggleModMenu);

modMenu.querySelectorAll('button[data-mode]').forEach(button => {
  button.addEventListener('click', () => {
    setMode(button.getAttribute('data-mode'));
  });
});

// Başlangıçta bir sohbet oluştur
newChat();