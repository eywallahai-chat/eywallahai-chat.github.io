document.addEventListener('DOMContentLoaded', () => {
    // Elements
    const chatInput = document.getElementById('userInput');
    const sendMessageBtn = document.getElementById('sendMessageBtn');
    const chatArea = document.getElementById('chatArea');
    const menuToggleBtn = document.getElementById('menuToggleBtn');
    const sidebar = document.getElementById('sidebar');
    const newChatBtn = document.getElementById('newChatBtn');
    const deleteChatBtn = document.getElementById('deleteChatBtn');

    // Chat state
    let messages = [];
    let currentChatId = null;

    // Initialize
    loadCurrentChat();
    setupEventListeners();

    function setupEventListeners() {
        sendMessageBtn?.addEventListener('click', handleSend);
        chatInput?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
            }
        });
        menuToggleBtn?.addEventListener('click', () => sidebar?.classList.toggle('open'));
        newChatBtn?.addEventListener('click', startNewChat);
        deleteChatBtn?.addEventListener('click', deleteCurrentChat);
    }

    async function handleSend() {
        const text = chatInput?.value.trim();
        if (!text) return;

        try {
            // Clear input and show user message
            chatInput.value = '';
            displayMessage('user', text);
            
            // Add to messages array
            messages.push({ role: 'user', content: text });
            
            // Show typing indicator
            displayTypingIndicator();

            // Call Netlify function
            const response = await fetch('/.netlify/functions/hello', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ messages })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            // Remove typing indicator
            removeTypingIndicator();

            if (data.choices?.[0]?.message?.content) {
                const aiMessage = data.choices[0].message.content;
                displayMessage('ai', aiMessage);
                messages.push({ role: 'assistant', content: aiMessage });
                saveCurrentChat();
            } else {
                throw new Error('Invalid response format');
            }

        } catch (error) {
            console.error('Chat error:', error);
            removeTypingIndicator();
            displayMessage('ai', 'Üzgünüm, bir hata oluştu. Lütfen tekrar deneyin.');
        }
    }

    function displayMessage(role, content) {
        if (!chatArea) return;

        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', role);
        
        // Convert markdown to HTML if it's an AI message
        if (role === 'ai') {
            const formattedContent = content
                .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                .replace(/\*(.*?)\*/g, '<em>$1</em>')
                .replace(/`(.*?)`/g, '<code>$1</code>')
                .replace(/\n/g, '<br>');
            messageDiv.innerHTML = formattedContent;
        } else {
            messageDiv.textContent = content;
        }
        
        chatArea.appendChild(messageDiv);
        chatArea.scrollTop = chatArea.scrollHeight;
    }

    function displayTypingIndicator() {
        if (!chatArea) return;
        
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
        indicator?.remove();
    }

    function startNewChat() {
        currentChatId = Date.now().toString();
        messages = [];
        if (chatArea) chatArea.innerHTML = '';
        saveCurrentChat();
        sidebar?.classList.remove('open');
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
            messages: messages,
            lastUpdated: new Date().toISOString()
        }));
    }

    function loadCurrentChat() {
        const savedChats = Object.keys(localStorage)
            .filter(key => key.startsWith('chat_'))
            .map(key => JSON.parse(localStorage.getItem(key)))
            .sort((a, b) => b.lastUpdated.localeCompare(a.lastUpdated));

        if (savedChats.length > 0) {
            const lastChat = savedChats[0];
            currentChatId = lastChat.id;
            messages = lastChat.messages;
            messages.forEach(msg => {
                displayMessage(msg.role, msg.content);
            });
        } else {
            startNewChat();
        }
    }
});
