import { egitim } from './egitim.js';

document.addEventListener('DOMContentLoaded', () => {
    console.log("DOMContentLoaded yüklendi. Uygulama başlatılıyor...");

    const chatInput = document.getElementById('chatInput');
    const sendMessageBtn = document.getElementById('sendMessageBtn');
    const chatArea = document.getElementById('chatArea');
    const modesToggle = document.getElementById('modesToggle');
    const modesPanel = document.getElementById('modesPanel');
    const modesContent = document.getElementById('modesContent');
    const callNetlifyBtn = document.getElementById('callNetlifyBtn');
    const netlifyResult = document.getElementById('netlifyResult');

    if (!chatInput) console.error("Hata: 'chatInput' elementi bulunamadı!");
    if (!sendMessageBtn) console.error("Hata: 'sendMessageBtn' elementi bulunamadı!");
    if (!chatArea) console.error("Hata: 'chatArea' elementi bulunamadı!");
    if (!modesToggle) console.error("Hata: 'modesToggle' elementi bulunamadı!");
    if (!modesPanel) console.error("Hata: 'modesPanel' elementi bulunamadı!");
    if (!modesContent) console.error("Hata: 'modesContent' elementi bulunamadı!");
    if (!callNetlifyBtn) console.error("Hata: 'callNetlifyBtn' elementi bulunamadı!");
    if (!netlifyResult) console.error("Hata: 'netlifyResult' elementi bulunamadı!");

    async function sendMessage() {
        console.log("sendMessage fonksiyonu çağrıldı.");
        if (!chatInput) return;
        const userMessage = chatInput.value.trim();
        if (userMessage === '') return;

        displayMessage(userMessage, 'user');
        chatInput.value = '';
        if (chatArea) chatArea.scrollTop = chatArea.scrollHeight;

        let aiResponse = "Yanıt alınamadı.";

        try {
            const res = await fetch('/.netlify/functions/hello', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ message: userMessage }) // ✅ Doğru isimle gönderiyoruz
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(`Netlify fonksiyon hatası: ${res.status} - ${errorData.message}`);
            }

            const data = await res.json();
            aiResponse = data.reply || "Netlify fonksiyonundan boş yanıt geldi.";
            console.log("Netlify fonksiyon yanıtı:", aiResponse);
        } catch (error) {
            console.error("Netlify fonksiyonu çağrılırken hata oluştu:", error);
            aiResponse = `Netlify fonksiyonu çağrılırken hata oluştu: ${error.message}`;
        }

        setTimeout(() => {
            displayMessage(aiResponse, 'ai');
            if (chatArea) chatArea.scrollTop = chatArea.scrollHeight;
        }, 700);
    }

    function displayMessage(message, sender) {
        if (!chatArea) return;
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

    function toggleModesPanel() {
        if (!modesPanel) return;
        modesPanel.classList.toggle('hidden');

        if (!modesPanel.classList.contains('hidden') && modesContent && modesContent.innerHTML.includes("yükleniyor")) {
            loadModesContent();
        }
    }

    function loadModesContent() {
        if (!modesContent) return;
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

    if (sendMessageBtn) {
        sendMessageBtn.addEventListener('click', sendMessage);
    }
    if (modesToggle) {
        modesToggle.addEventListener('click', toggleModesPanel);
    }
    if (callNetlifyBtn) {
        callNetlifyBtn.addEventListener('click', callNetlifyFunction);
    }

    loadModesContent();
});
