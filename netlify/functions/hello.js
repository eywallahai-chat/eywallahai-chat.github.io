import { egitim } from './egitim.js';

document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM içeriği yüklendi. Uygulama başlatılıyor...");

    // HTML elementleri
    const chatInput = document.getElementById('chatInput');
    const sendMessageBtn = document.getElementById('sendMessageBtn');
    const chatArea = document.getElementById('chatArea');
    const modesToggle = document.getElementById('modesToggle');
    const modesPanel = document.getElementById('modesPanel');
    const modesContent = document.getElementById('modesContent');
    const callNetlifyBtn = document.getElementById('callNetlifyBtn');
    const netlifyResult = document.getElementById('netlifyResult');
    const menuToggleBtn = document.getElementById('menuToggleBtn');
    const sidebar = document.getElementById('sidebar');
    const newChatBtn = document.getElementById('newChatBtn');
    const deleteChatBtn = document.getElementById('deleteChatBtn');
    const chatList = document.getElementById('chatList');
    
    // Geçici bir kullanıcı ID'si atama
    const userId = "temp_user_id";
    let currentChatId = null;

    // Elementlerin varlığını kontrol etme
    const elementsToCheck = {
        chatInput, sendMessageBtn, chatArea, modesToggle, modesPanel, modesContent, callNetlifyBtn, netlifyResult,
        menuToggleBtn, sidebar, newChatBtn, deleteChatBtn, chatList
    };

    for (const key in elementsToCheck) {
        if (!elementsToCheck[key]) {
            console.error(`Hata: '${key}' ID'sine sahip HTML elementi bulunamadı. Lütfen index.html dosyasını kontrol edin.`);
        }
    }

    // Egitim modülünün yüklenip yüklenmediğini kontrol et
    if (typeof egitim === 'undefined' || !egitim) {
        console.error("Hata: 'egitim.js' modülü yüklenemedi veya boş. Lütfen dosya yolunu ve içeriğini kontrol edin.");
    }
    
    // AI yanıtı gelene kadar "yazıyor..." animasyonunu gösterir
    function displayTypingIndicator() {
        if (!chatArea) return;
        const typingIndicatorDiv = document.createElement('div');
        typingIndicatorDiv.id = 'typingIndicator';
        typingIndicatorDiv.classList.add('flex', 'justify-start', 'mb-4');
        typingIndicatorDiv.innerHTML = `
            <div class="bg-gray-700 text-gray-200 p-3 rounded-xl max-w-xs shadow-md">
                <span class="dot-flashing"></span>
            </div>
        `;
        chatArea.appendChild(typingIndicatorDiv);
        chatArea.scrollTop = chatArea.scrollHeight;
    }

    // "Yazıyor..." animasyonunu kaldırır
    function removeTypingIndicator() {
        const typingIndicator = document.getElementById('typingIndicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }

    // Sohbet listesini arka uçtan (Netlify Fonksiyonu) yükleme
    async function loadChats() {
        try {
            // Netlify fonksiyonunu hello.js olarak çağırma
            const response = await fetch(`/.netlify/functions/hello?action=get_chats&userId=${userId}`);
            const chats = await response.json();
            
            if (chatList) {
                chatList.innerHTML = '';
            }
            if (chats.length === 0) {
                // Eğer hiç sohbet yoksa, otomatik olarak yeni bir tane oluştur
                await startNewChat();
                return;
            }

            let isFirstChat = true;
            chats.forEach(chat => {
                const chatItem = document.createElement('li');
                chatItem.classList.add('chat-item', 'p-2', 'rounded-md', 'text-sm');
                chatItem.textContent = chat.title || `Sohbet ${chat.id.substring(0, 8)}`;
                chatItem.dataset.chatId = chat.id;
                
                chatItem.addEventListener('click', () => {
                    selectChat(chat.id);
                });

                if (chatList) {
                    chatList.appendChild(chatItem);
                }

                if (isFirstChat) {
                    selectChat(chat.id);
                    isFirstChat = false;
                }
            });
        } catch (error) {
            console.error("Sohbet listesi yüklenirken hata oluştu:", error);
            displayMessage(`Sohbetler yüklenemedi: ${error.message}`, 'ai');
        }
    }

    // Sohbeti seçme ve mesajlarını yükleme
    async function selectChat(chatId) {
        if (chatId === currentChatId) return;

        currentChatId = chatId;
        
        // Aktif sohbeti vurgula
        document.querySelectorAll('.chat-item').forEach(item => {
            item.classList.remove('active', 'bg-emerald-400');
            item.classList.add('bg-gray-700');
        });
        const selectedChatElement = document.querySelector(`[data-chat-id="${chatId}"]`);
        if (selectedChatElement) {
            selectedChatElement.classList.add('active', 'bg-emerald-400');
            selectedChatElement.classList.remove('bg-gray-700');
        }

        if (chatArea) {
            chatArea.innerHTML = '';
            displayMessage('Sohbet yükleniyor...', 'ai');
        }
        
        try {
            // Netlify fonksiyonunu hello.js olarak çağırma
            const response = await fetch(`/.netlify/functions/hello?action=get_messages&userId=${userId}&chatId=${chatId}`);
            const messages = await response.json();
            
            if (chatArea) {
                chatArea.innerHTML = '';
            }
            
            if (messages.length > 0) {
                messages.forEach(msg => {
                    displayMessage(msg.text, msg.sender);
                });
            } else {
                if (chatArea) {
                    displayMessage('Bu sohbette henüz mesaj yok.', 'ai');
                }
            }
            if (chatArea) chatArea.scrollTop = chatArea.scrollHeight;
        } catch (error) {
            console.error("Mesajlar yüklenirken hata oluştu:", error);
            displayMessage(`Mesajlar yüklenemedi: ${error.message}`, 'ai');
        }
    }

    // Mesaj gönderme fonksiyonu
    async function sendMessage() {
        console.log("sendMessage fonksiyonu çağrıldı.");
        if (!chatInput || !sendMessageBtn || !currentChatId) {
            console.error("Gönderme butonu, giriş alanı veya seçili sohbet bulunamadı.");
            return;
        }

        const userMessage = chatInput.value.trim();
        if (userMessage === '') return;

        displayMessage(userMessage, 'user');
        chatInput.value = '';
        if (chatArea) chatArea.scrollTop = chatArea.scrollHeight;

        displayTypingIndicator();

        let aiResponse = "Yanıt alınamadı.";

        try {
            // Netlify fonksiyonunu hello.js olarak çağırma
            const res = await fetch('/.netlify/functions/hello', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ action: 'send_message', userId, chatId: currentChatId, message: userMessage })
            });

            if (!res.ok) {
                const errorText = await res.text();
                throw new Error(`Netlify fonksiyon hatası: ${res.status} - ${errorText}`);
            }

            const data = await res.json();
            aiResponse = data.reply || "Netlify fonksiyonundan boş yanıt geldi.";
            console.log("Netlify fonksiyon yanıtı:", aiResponse);
        } catch (error) {
            console.error("Mesaj gönderilirken hata oluştu:", error);
            aiResponse = `Mesaj gönderilirken hata oluştu: ${error.message}`;
        }
        
        removeTypingIndicator();
        displayMessage(aiResponse, 'ai');
        if (chatArea) chatArea.scrollTop = chatArea.scrollHeight;
    }

    // Mesajı DOM'a yazdıran fonksiyon
    function displayMessage(message, sender) {
        if (!chatArea) return;
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('flex', 'mb-4');

        if (sender === 'user') {
            messageDiv.classList.add('justify-end');
            messageDiv.innerHTML = `<div class="bg-emerald-600 text-white p-3 rounded-xl max-w-xs shadow-md">${message}</div>`;
        } else {
            messageDiv.classList.add('justify-start');
            messageDiv.innerHTML = `<div class="bg-gray-700 text-gray-200 p-3 rounded-xl max-w-xs shadow-md">${message}</div>`;
        }
        chatArea.appendChild(messageDiv);
    }
    
    // Modlar panelini açıp kapatma fonksiyonu
    function toggleModesPanel() {
        if (!modesPanel) return;
        modesPanel.classList.toggle('hidden');
        if (!modesPanel.classList.contains('hidden')) {
            loadModesContent();
        }
    }

    // Modlar panelinin içeriğini yükleme fonksiyonu
    function loadModesContent() {
        if (!modesContent) return;
        modesContent.innerHTML = '';
        if (typeof egitim === 'undefined' || !egitim) {
            modesContent.innerHTML = `<p class="text-red-400">Hata: Eğitim modülü yüklenemedi.</p>`;
            return;
        }

        const { projeTanimi, hedefOzellikler, teknikAltyapi, modlar } = egitim;

        const projectDesc = document.createElement('p');
        projectDesc.classList.add('text-gray-200', 'font-medium', 'text-lg');
        projectDesc.innerHTML = `<span class="text-emerald-400">Proje Tanımı:</span> ${projeTanimi}`;
        modesContent.appendChild(projectDesc);

        const featuresTitle = document.createElement('h3');
        featuresTitle.classList.add('text-xl', 'font-semibold', 'text-white', 'mt-4');
        featuresTitle.textContent = 'Hedef Özellikler:';
        modesContent.appendChild(featuresTitle);
        const featuresList = document.createElement('ul');
        featuresList.classList.add('list-disc', 'list-inside', 'ml-4', 'space-y-1');
        hedefOzellikler.forEach(feature => {
            const li = document.createElement('li');
            li.textContent = feature;
            featuresList.appendChild(li);
        });
        modesContent.appendChild(featuresList);

        const techStackTitle = document.createElement('h3');
        techStackTitle.classList.add('text-xl', 'font-semibold', 'text-white', 'mt-4');
        techStackTitle.textContent = 'Teknik Altyapı:';
        modesContent.appendChild(techStackTitle);
        const techStackDiv = document.createElement('div');
        techStackDiv.classList.add('ml-4', 'space-y-1');
        techStackDiv.innerHTML = `<p><strong>Model:</strong> ${teknikAltyapi.model}</p><p><strong>Geliştirme Dili:</strong> ${teknikAltyapi.gelistirmeDili.join(', ')}</p><p><strong>API Entegrasyonları:</strong> ${teknikAltyapi.apiEntegrasyonlari.join(', ')}</p>`;
        modesContent.appendChild(techStackDiv);

        const modesTitle = document.createElement('h3');
        modesTitle.classList.add('text-xl', 'font-semibold', 'text-white', 'mt-4');
        modesTitle.textContent = 'Mevcut Modlar:';
        modesContent.appendChild(modesTitle);
        modlar.forEach(mode => {
            const modeDiv = document.createElement('div');
            modeDiv.classList.add('bg-gray-700', 'p-3', 'rounded-lg', 'shadow-sm');
            modeDiv.innerHTML = `<h4 class="font-semibold text-emerald-300">${mode.ad}</h4><p class="text-sm text-gray-400">${mode.amac}</p>`;
            modesContent.appendChild(modeDiv);
        });
    }

    async function callNetlifyFunction() {
        if (!netlifyResult) return;
        netlifyResult.textContent = 'Netlify fonksiyonu çağrılıyor...';
        try {
            // Netlify fonksiyonunu hello.js olarak çağırma
            const res = await fetch('/.netlify/functions/hello?action=test_netlify');
            const data = await res.json();
            netlifyResult.textContent = JSON.stringify(data, null, 2);
        } catch (error) {
            netlifyResult.textContent = `Hata: ${error.message}`;
            console.error("Netlify fonksiyonu çağrılırken hata oluştu:", error);
        }
    }

    // Yeni sohbet başlatma fonksiyonu
    async function startNewChat() {
        try {
            // Netlify fonksiyonunu hello.js olarak çağırma
            const response = await fetch('/.netlify/functions/hello', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'new_chat', userId })
            });
            const newChat = await response.json();
            if (newChat.chatId) {
                currentChatId = newChat.chatId;
                await loadChats();
                selectChat(newChat.chatId);
            }
        } catch (error) {
            console.error("Yeni sohbet başlatılırken hata oluştu:", error);
            displayMessage(`Yeni sohbet başlatılamadı: ${error.message}`, 'ai');
        }
        toggleSidebar();
    }

    // Sohbeti silme fonksiyonu
    async function deleteCurrentChat() {
        if (!currentChatId) return;
        try {
            // Netlify fonksiyonunu hello.js olarak çağırma
            const response = await fetch('/.netlify/functions/hello', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'delete_chat', userId, chatId: currentChatId })
            });
            await response.json();
            currentChatId = null;
            await loadChats();
        } catch (error) {
            console.error("Sohbet silinirken hata oluştu:", error);
            displayMessage(`Sohbet silinemedi: ${error.message}`, 'ai');
        }
        toggleSidebar();
    }

    // Sidebar'ı açıp kapama
    function toggleSidebar() {
        if (sidebar) {
            sidebar.classList.toggle('open');
        }
    }

    // Event dinleyicileri
    if (sendMessageBtn) {
        sendMessageBtn.addEventListener('click', sendMessage);
    }
    if (modesToggle) {
        modesToggle.addEventListener('click', toggleModesPanel);
    }
    if (callNetlifyBtn) {
        callNetlifyBtn.addEventListener('click', callNetlifyFunction);
    }
    if (chatInput) {
        chatInput.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                event.preventDefault();
                sendMessage();
            }
        });
    }
    if (menuToggleBtn) {
        menuToggleBtn.addEventListener('click', toggleSidebar);
    }
    if (newChatBtn) {
        newChatBtn.addEventListener('click', startNewChat);
    }
    if (deleteChatBtn) {
        deleteChatBtn.addEventListener('click', deleteCurrentChat);
    }

    // Uygulama başladığında sohbetleri yükle
    loadChats();
    loadModesContent();
});
