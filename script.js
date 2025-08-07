document.addEventListener('DOMContentLoaded', () => {
    // Element referansları
    const chatInput = document.getElementById('userInput');
    const sendMessageBtn = document.getElementById('sendMessageBtn');
    const chatArea = document.getElementById('chatArea');
    const menuToggleBtn = document.getElementById('menuToggleBtn');
    const sidebar = document.getElementById('sidebar');
    const newChatBtn = document.getElementById('newChatBtn');
    const deleteChatBtn = document.getElementById('deleteChatBtn');
    
    // API Anahtarı
    const API_KEY = 'EYWALLAH_AI_ORION';
    
    // Sohbet yönetimi için değişkenler
    let messages = [];
    let currentChatId = null;
    
    // Sayfa yüklendiğinde mevcut sohbeti yükle
    loadCurrentChat();
    
    // Event Listeners
    sendMessageBtn.addEventListener('click', sendMessage);
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            sendMessage();
        }
    });
    menuToggleBtn.addEventListener('click', toggleSidebar);
    newChatBtn.addEventListener('click', startNewChat);
    deleteChatBtn.addEventListener('click', deleteCurrentChat);
    
    // Mesaj gönderme fonksiyonu
    async function sendMessage() {
        const text = chatInput.value.trim();
        if (!text) return;
        
        try {
            // Kullanıcı mesajını göster
            displayMessage('user', text);
            chatInput.value = '';
            
            // AI yanıtı için bekleme animasyonu
            displayTypingIndicator();
            
            // AI yanıtını al
            const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${API_KEY}`,
                    'HTTP-Referer': 'https://eywallahai-chat.github.io/',
                    'X-Title': 'Eywallah AI Orion 1'
                },
                body: JSON.stringify({
                    model: 'deepseek/deepseek-r1-0528-qwen3-8b',
                    messages: [...messages, { role: 'user', content: text }]
                })
            });
            
            const data = await response.json();
            removeTypingIndicator();
            
            if (data.choices && data.choices[0]) {
                const aiMessage = data.choices[0].message.content;
                displayMessage('ai', aiMessage);
                messages.push(
                    { role: 'user', content: text },
                    { role: 'assistant', content: aiMessage }
                );
                saveCurrentChat();
            } else {
                throw new Error('AI yanıtı alınamadı');
            }
            
        } catch (error) {
            console.error('Hata:', error);
            removeTypingIndicator();
            displayMessage('ai', 'Üzgünüm, bir hata oluştu. Lütfen tekrar deneyin.');
        }
    }
    
    // Yardımcı fonksiyonlar
    function displayMessage(role, content) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', role);
        messageDiv.textContent = content;
        chatArea.appendChild(messageDiv);
        chatArea.scrollTop = chatArea.scrollHeight;
    }
    
    function displayTypingIndicator() {
        const typingDiv = document.createElement('div');
        typingDiv.id = 'typingIndicator';
        typingDiv.classList.add('message', 'ai');
        typingDiv.innerHTML = `
            <div class="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
            </div>
        `;
        chatArea.appendChild(typingDiv);
        chatArea.scrollTop = chatArea.scrollHeight;
    }
    
    function removeTypingIndicator() {
        const indicator = document.getElementById('typingIndicator');
        if (indicator) {
            indicator.remove();
        }
    }
    
    function toggleSidebar() {
        sidebar.classList.toggle('open');
    }
    
    function startNewChat() {
        currentChatId = Date.now().toString();
        messages = [];
        chatArea.innerHTML = '';
        saveCurrentChat();
        toggleSidebar();
    }
    
    function deleteCurrentChat() {
        if (!currentChatId) return;
        
        if (confirm('Bu sohbeti silmek istediğinizden emin misiniz?')) {
            localStorage.removeItem(`chat_${currentChatId}`);
            startNewChat();
        }
    }
    
    function saveCurrentChat() {
        if (!currentChatId) return;
        localStorage.setItem(`chat_${currentChatId}`, JSON.stringify({
            id: currentChatId,
            messages: messages
        }));
    }
    
    function loadCurrentChat() {
        const savedChats = Object.keys(localStorage)
            .filter(key => key.startsWith('chat_'))
            .map(key => JSON.parse(localStorage.getItem(key)))
            .sort((a, b) => b.id - a.id);
        
        if (savedChats.length > 0) {
            const lastChat = savedChats[0];
            currentChatId = lastChat.id;
            messages = lastChat.messages;
            messages.forEach(msg => {
                displayMessage(msg.role === 'user' ? 'user' : 'ai', msg.content);
            });
        } else {
            startNewChat();
        }
    }
});
