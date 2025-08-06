import { egitim } from './egitim.js';

// DOMContentLoaded olayını bekleyerek elementlerin hazır olduğundan emin olalım
document.addEventListener('DOMContentLoaded', () => {
    console.log("DOMContentLoaded yüklendi. Uygulama başlatılıyor...");

    // DOM elementlerini güvenli bir şekilde seç
    const chatInput = document.getElementById('chatInput');
    const sendMessageBtn = document.getElementById('sendMessageBtn');
    const chatArea = document.getElementById('chatArea');
    const modesToggle = document.getElementById('modesToggle');
    const modesPanel = document.getElementById('modesPanel');
    const modesContent = document.getElementById('modesContent');
    const callNetlifyBtn = document.getElementById('callNetlifyBtn');
    const netlifyResult = document.getElementById('netlifyResult');

    // Elementlerin varlığını kontrol et
    if (!chatInput) console.error("Hata: 'chatInput' elementi bulunamadı!");
    if (!sendMessageBtn) console.error("Hata: 'sendMessageBtn' elementi bulunamadı!");
    if (!chatArea) console.error("Hata: 'chatArea' elementi bulunamadı!");
    if (!modesToggle) console.error("Hata: 'modesToggle' elementi bulunamadı!");
    if (!modesPanel) console.error("Hata: 'modesPanel' elementi bulunamadı!");
    if (!modesContent) console.error("Hata: 'modesContent' elementi bulunamadı!");
    if (!callNetlifyBtn) console.error("Hata: 'callNetlifyBtn' elementi bulunamadı!");
    if (!netlifyResult) console.error("Hata: 'netlifyResult' elementi bulunamadı!");

    // Mesaj gönderme fonksiyonu
    async function sendMessage() {
        console.log("sendMessage fonksiyonu çağrıldı.");
        if (!chatInput) {
            console.error("sendMessage: chatInput elementi mevcut değil.");
            return;
        }
        const userMessage = chatInput.value.trim();
        if (userMessage === '') {
            console.log("Boş mesaj gönderilmeye çalışıldı.");
            return;
        }

        displayMessage(userMessage, 'user');
        chatInput.value = '';

        if (chatArea) {
            chatArea.scrollTop = chatArea.scrollHeight;
        }

        let aiResponse = "Anlıyorum. Bu konuda size nasıl yardımcı olabilirim?";
        if (userMessage.toLowerCase().includes("selam") || userMessage.toLowerCase().includes("merhaba")) {
            aiResponse = "Merhaba! Size yardımcı olmaktan mutluluk duyarım.";
        } else if (userMessage.toLowerCase().includes("nasılsın")) {
            aiResponse = "Bir yapay zeka olarak duygularım yok ama sorularınızı yanıtlamaya hazırım!";
        } else if (userMessage.toLowerCase().includes("eywallah ai")) {
            aiResponse = egitim.projeTanimi;
        } else if (userMessage.toLowerCase().includes("modlar")) {
            aiResponse = "Modlar paneline bakarak yeteneklerimi keşfedebilirsiniz!";
            if (modesPanel && modesPanel.classList.contains('hidden')) {
                toggleModesPanel();
            }
        } else if (userMessage.toLowerCase().includes("kod")) {
            aiResponse = "Kod yazma ve hata ayıklama konusunda size yardımcı olabilirim. Hangi dilde bir sorunuz var?";
        } else if (userMessage.toLowerCase().includes("netlify")) {
            aiResponse = "Netlify fonksiyonunu çağırmak için 'Netlify Fonksiyonu Çağır' düğmesini kullanabilirsiniz.";
        }

        setTimeout(() => {
            displayMessage(aiResponse, 'ai');
            if (chatArea) {
                chatArea.scrollTop = chatArea.scrollHeight;
            }
        }, 700);
    }

    // Mesajı sohbet alanına ekleyen fonksiyon
    function displayMessage(message, sender) {
        console.log(`displayMessage çağrıldı: ${message} (${sender})`);
        if (!chatArea) {
            console.error("displayMessage: chatArea elementi mevcut değil.");
            return;
        }
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('flex', 'mb-4');

        if (sender === 'user') {
            messageDiv.classList.add('justify-end');
            messageDiv.innerHTML = `
                <div class="bg-emerald-600 text-white p-3 rounded-xl max-w-xs shadow-md">
                    ${message}
                </div>
            `;
        } else {
            messageDiv.classList.add('justify-start');
            messageDiv.innerHTML = `
                <div class="bg-gray-700 text-gray-200 p-3 rounded-xl max-w-xs shadow-md">
                    ${message}
                </div>
            `;
        }
        chatArea.appendChild(messageDiv);
    }

    // Modlar panelini açıp kapatan fonksiyon
    function toggleModesPanel() {
        console.log("Modlar düğmesine tıklandı!");
        if (!modesPanel) {
            console.error("toggleModesPanel: modesPanel elementi mevcut değil.");
            return;
        }
        modesPanel.classList.toggle('hidden');
        
        if (!modesPanel.classList.contains('hidden') && modesContent && modesContent.innerHTML.includes("yükleniyor")) {
            loadModesContent();
        }
    }

    // Eğitim dosyasındaki mod bilgilerini yükleyen fonksiyon
    function loadModesContent() {
        console.log("Mod içeriği yükleniyor...");
        if (!modesContent) {
            console.error("loadModesContent: modesContent elementi mevcut değil.");
            return;
        }
        modesContent.innerHTML = '';

        const projectDesc = document.createElement('p');
        projectDesc.classList.add('text-gray-200', 'font-medium', 'text-lg');
        projectDesc.innerHTML = `<span class="text-emerald-400">Proje Tanımı:</span> ${egitim.projeTanimi}`;
        modesContent.appendChild(projectDesc);

        const featuresTitle = document.createElement('h3');
        featuresTitle.classList.add('text-xl', 'font-semibold', 'text-white', 'mt-4');
        featuresTitle.textContent = 'Hedef Özellikler:';
        modesContent.appendChild(featuresTitle);

        const featuresList = document.createElement('ul');
        featuresList.classList.add('list-disc', 'list-inside', 'ml-4', 'space-y-1');
        egitim.hedefOzellikler.forEach(feature => {
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
        techStackDiv.innerHTML = `
            <p><strong>Model:</strong> ${egitim.teknikAltyapi.model}</p>
            <p><strong>Geliştirme Dili:</strong> ${egitim.teknikAltyapi.gelistirmeDili.join(', ')}</p>
            <p><strong>API Entegrasyonları:</strong> ${egitim.teknikAltyapi.apiEntegrasyonlari.join(', ')}</p>
        `;
        modesContent.appendChild(techStackDiv);

        const modesTitle = document.createElement('h3');
        modesTitle.classList.add('text-xl', 'font-semibold', 'text-white', 'mt-4');
        modesTitle.textContent = 'Mevcut Modlar:';
        modesContent.appendChild(modesTitle);

        egitim.modlar.forEach(mode => {
            const modeDiv = document.createElement('div');
            modeDiv.classList.add('bg-gray-700', 'p-3', 'rounded-lg', 'shadow-sm');
            modeDiv.innerHTML = `
                <h4 class="font-semibold text-emerald-300">${mode.ad}</h4>
                <p class="text-sm text-gray-400">${mode.amac}</p>
            `;
            modesContent.appendChild(modeDiv);
        });
    }

    // Netlify fonksiyonunu çağıran fonksiyon
    async function callNetlifyFunction() {
        console.log("Netlify fonksiyonu çağrılıyor...");
        if (!netlifyResult) {
            console.error("callNetlifyFunction: netlifyResult elementi mevcut değil.");
            return;
        }
        netlifyResult.textContent = 'Netlify fonksiyonu çağrılıyor...';
        try {
            const res = await fetch('/.netlify/functions/hello');
            const data = await res.json();
            netlifyResult.textContent = JSON.stringify(data, null, 2);
        } catch (error) {
            netlifyResult.textContent = `Hata: ${error.message}. Netlify fonksiyonunun çalıştığından emin olun.`;
            console.error("Netlify fonksiyonu çağrılırken hata oluştu:", error);
        }
    }

    // Olay dinleyicilerini ekle
    if (sendMessageBtn) {
        sendMessageBtn.addEventListener('click', sendMessage);
        console.log("sendMessageBtn için click listener eklendi.");
    }
    if (modesToggle) {
        modesToggle.addEventListener('click', toggleModesPanel);
        console.log("modesToggle için click listener eklendi.");
    }
    if (callNetlifyBtn) {
        callNetlifyBtn.addEventListener('click', callNetlifyFunction);
        console.log("callNetlifyBtn için click listener eklendi.");
    }

    // Mod içeriğini sayfa yüklendiğinde bir kez yükle
    loadModesContent();
});
