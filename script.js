import { egitim } from './egitim.js';

document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM içeriği yüklendi. Uygulama başlatılıyor mu ...");

    const chatInput = document.getElementById('chatInput');
    const sendMessageBtn = document.getElementById('sendMessageBtn');
    const chatArea = document.getElementById('chatArea');
    const modesToggle = document.getElementById('modesToggle');
    const modesPanel = document.getElementById('modesPanel');
    const modesContent = document.getElementById('modesContent');
    const callNetlifyBtn = document.getElementById('callNetlifyBtn');
    const netlifyResult = document.getElementById('netlifyResult');

    // Elementlerin varlığını kontrol etme
    const elementsToCheck = {
        chatInput, sendMessageBtn, chatArea, modesToggle,
        modesPanel, modesContent, callNetlifyBtn, netlifyResult
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

    async function sendMessage() {
        console.log("sendMessage fonksiyonu çağrıldı.");
        if (!chatInput || !sendMessageBtn) {
            console.error("Gönderme butonu veya giriş alanı bulunamadı.");
            return;
        }

        const userMessage = chatInput.value.trim();
        if (userMessage === '') return;

        displayMessage(userMessage, 'user');
        chatInput.value = '';
        if (chatArea) chatArea.scrollTop = chatArea.scrollHeight;

        // Yazma animasyonunu göster
        displayTypingIndicator();

        let aiResponse = "Yanıt alınamadı.";

        try {
            const res = await fetch('/.netlify/functions/hello', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ message: userMessage })
            });

            if (!res.ok) {
                const errorText = await res.text();
                throw new Error(`Netlify fonksiyon hatası: ${res.status} - ${errorText}`);
            }

            const data = await res.json();
            aiResponse = data.reply || "Netlify fonksiyonundan boş yanıt geldi.";
            console.log("Netlify fonksiyon yanıtı:", aiResponse);
        } catch (error) {
            console.error("Netlify fonksiyonu çağrılırken hata oluştu:", error);
            aiResponse = `Netlify fonksiyonu çağrılırken hata oluştu: ${error.message}`;
        }
        
        // Animasyonu kaldır ve cevabı göster
        removeTypingIndicator();
        displayMessage(aiResponse, 'ai');
        if (chatArea) chatArea.scrollTop = chatArea.scrollHeight;

    }

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

    function toggleModesPanel() {
        if (!modesPanel) return;
        modesPanel.classList.toggle('hidden');
        if (!modesPanel.classList.contains('hidden')) {
            loadModesContent();
        }
    }

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
            const res = await fetch('/.netlify/functions/hello', {
                method: 'GET'
            });
            const data = await res.json();
            netlifyResult.textContent = JSON.stringify(data, null, 2);
        } catch (error) {
            netlifyResult.textContent = `Hata: ${error.message}`;
            console.error("Netlify fonksiyonu çağrılırken hata oluştu:", error);
        }
    }

    // Event dinleyicileri
    if (sendMessageBtn) {
        sendMessageBtn.addEventListener('click', () => {
            console.log("Gönder tuşuna tıklandı.");
            sendMessage();
        });
    }
    if (modesToggle) {
        modesToggle.addEventListener('click', () => {
            console.log("Mod paneli tuşuna tıklandı.");
            toggleModesPanel();
        });
    }
    if (callNetlifyBtn) {
        callNetlifyBtn.addEventListener('click', () => {
            console.log("Netlify test tuşuna tıklandı.");
            callNetlifyFunction();
        });
    }
    if (chatInput) {
        chatInput.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                event.preventDefault();
                console.log("Enter tuşuna basıldı.");
                sendMessage();
            }
        });
    }

    // Mod panelini ilk açıldığında doldur
    loadModesContent();
});
