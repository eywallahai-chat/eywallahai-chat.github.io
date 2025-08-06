import { egitim } from './egitim.js';

// DOM elementlerini seç
const chatInput = document.getElementById('chatInput');
const sendMessageBtn = document.getElementById('sendMessageBtn');
const chatArea = document.getElementById('chatArea');
const modesToggle = document.getElementById('modesToggle');
const modesPanel = document.getElementById('modesPanel');
const modesContent = document.getElementById('modesContent');
const callNetlifyBtn = document.getElementById('callNetlifyBtn');
const netlifyResult = document.getElementById('netlifyResult');

// Mesaj gönderme fonksiyonu
async function sendMessage() {
    const userMessage = chatInput.value.trim();
    if (userMessage === '') return;

    // Kullanıcı mesajını göster
    displayMessage(userMessage, 'user');
    chatInput.value = ''; // Giriş alanını temizle

    // Sohbet alanını en alta kaydır
    chatArea.scrollTop = chatArea.scrollHeight;

    // Basit bir AI yanıtı simülasyonu
    let aiResponse = "Anlıyorum. Bu konuda size nasıl yardımcı olabilirim?";
    if (userMessage.toLowerCase().includes("selam") || userMessage.toLowerCase().includes("merhaba")) {
        aiResponse = "Merhaba! Size yardımcı olmaktan mutluluk duyarım.";
    } else if (userMessage.toLowerCase().includes("nasılsın")) {
        aiResponse = "Bir yapay zeka olarak duygularım yok ama sorularınızı yanıtlamaya hazırım!";
    } else if (userMessage.toLowerCase().includes("eywallah ai")) {
        aiResponse = egitim.projeTanimi;
    } else if (userMessage.toLowerCase().includes("modlar")) {
        aiResponse = "Modlar paneline bakarak yeteneklerimi keşfedebilirsiniz!";
        // Modlar panelini otomatik aç
        if (modesPanel.classList.contains('hidden')) {
            toggleModesPanel();
        }
    } else if (userMessage.toLowerCase().includes("kod")) {
        aiResponse = "Kod yazma ve hata ayıklama konusunda size yardımcı olabilirim. Hangi dilde bir sorunuz var?";
    } else if (userMessage.toLowerCase().includes("netlify")) {
        aiResponse = "Netlify fonksiyonunu çağırmak için 'Netlify Fonksiyonu Çağır' düğmesini kullanabilirsiniz.";
    }

    // AI yanıtını göster (küçük bir gecikmeyle daha doğal görünmesi için)
    setTimeout(() => {
        displayMessage(aiResponse, 'ai');
        chatArea.scrollTop = chatArea.scrollHeight; // Sohbet alanını tekrar en alta kaydır
    }, 700);
}

// Mesajı sohbet alanına ekleyen fonksiyon
function displayMessage(message, sender) {
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
    modesPanel.classList.toggle('hidden');
    modesPanel.classList.toggle('flex'); // hidden kaldırıldığında flex yapar
    if (!modesPanel.classList.contains('hidden') && modesContent.innerHTML.includes("yükleniyor")) {
        // Modlar paneli açıldığında ve henüz yüklenmediyse bilgileri yükle
        loadModesContent();
    }
}

// Eğitim dosyasındaki mod bilgilerini yükleyen fonksiyon
function loadModesContent() {
    modesContent.innerHTML = ''; // İçeriği temizle

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

// Netlify fonksiyonunu çağıran fonksiyon (kullanıcının sağladığı ile aynı)
async function callNetlifyFunction() {
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

// Olay dinleyicileri
sendMessageBtn.addEventListener('click', sendMessage);
modesToggle.addEventListener('click', toggleModesPanel);
callNetlifyBtn.addEventListener('click', callNetlifyFunction);

// Sayfa yüklendiğinde mod içeriğini önceden yükle (gizli kalsa bile hızlı açılma için)
document.addEventListener('DOMContentLoaded', loadModesContent);
