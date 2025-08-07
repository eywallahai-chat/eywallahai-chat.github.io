document.addEventListener('DOMContentLoaded', () => {
    // Element referansları
    const chatInput = document.getElementById('userInput');
    const sendMessageBtn = document.getElementById('sendMessageBtn');
    const chatArea = document.getElementById('chatArea');
    const menuToggleBtn = document.getElementById('menuToggleBtn');
    const sidebar = document.getElementById('sidebar');
    const newChatBtn = document.getElementById('newChatBtn');
    const deleteChatBtn = document.getElementById('deleteChatBtn');
    
    // API Anahtarı - Environment variable'dan al
    const API_KEY = import.meta.env.EYWALLAH_AI_ORION;
    
    // API anahtarı kontrolü
    if (!API_KEY) {
        console.error('API anahtarı bulunamadı! Environment variable kontrol edilmeli.');
        displayMessage('ai', 'API anahtarı yapılandırması eksik. Lütfen sistem yöneticisiyle iletişime geçin.');
        return;
    }
    
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
            
            // API isteği için headers ve body hazırla
            const headers = {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_KEY}`,
                'HTTP-Referer': window.location.origin,
                'X-Title': 'Eywallah AI Orion 1'
            };
            
            const body = {
                model: 'deepseek/deepseek-r1-0528-qwen3-8b',
                messages: [...messages, { role: 'user', content: text }],
                temperature: 0.7,
                max_tokens: 1000
            };
            
            console.log('API isteği gönderiliyor...', {
                url: 'https://openrouter.ai/api/v1/chat/completions',
                headers: { ...headers, 'Authorization': 'Bearer [HIDDEN]' },
                body: body
            });
            
            // API isteğini yap
            const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(body)
            });
            
            if (!response.ok) {
                const errorData = await response.text();
                console.error('API Yanıt:', response.status, errorData);
                throw new Error(`API Hatası: ${response.status}`);
            }
            
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
    
    // Diğer fonksiyonlar aynı kalacak...
});
