document.addEventListener('DOMContentLoaded', () => {
    // Element referansları
    const chatInput = document.getElementById('userInput');
    const sendMessageBtn = document.getElementById('sendMessageBtn');
    const chatArea = document.getElementById('chatArea');
    const menuToggleBtn = document.getElementById('menuToggleBtn');
    const sidebar = document.getElementById('sidebar');
    const newChatBtn = document.getElementById('newChatBtn');
    const deleteChatBtn = document.getElementById('deleteChatBtn');
    
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
            
            // Netlify Function'a istek gönder
            const response = await fetch('/.netlify/functions/hello', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    prompt: text,
                    messages: messages
                })
            });
            
            if (!response.ok) {
                const errorData = await response.text();
                console.error('API Yanıt:', response.status, errorData);
                throw new Error(`API Hatası: ${response.status}`);
            }
            
            const data = await response.json();
            removeTypingIndicator();
            
            if (data.reply) {
                displayMessage('ai', data.reply);
                messages.push(
                    { role: 'user', content: text },
                    { role: 'assistant', content: data.reply }
                );
                saveCurrentChat();
            } else {
                throw new Error('AI yanıtı alınamadı');
            }
            
        } catch (error) {
            console.error('Hata:', error);
            removeTypingIndicator();
            let errorMessage = 'Üzgünüm, bir hata oluştu. ';
            if (error.message.includes('401')) {
                errorMessage += 'API anahtarı geçersiz veya eksik.';
            } else if (error.message.includes('429')) {
                errorMessage += 'Çok fazla istek gönderildi. Lütfen biraz bekleyin.';
            } else {
                errorMessage += 'Lütfen tekrar deneyin.';
            }
            displayMessage('ai', errorMessage);
        }
    }

    // Diğer yardımcı fonksiyonlar aynı kalacak...
    // ... (displayMessage, displayTypingIndicator, removeTypingIndicator, vs.)
});
