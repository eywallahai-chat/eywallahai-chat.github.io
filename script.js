import { egitim } from './egitim.js';

document.addEventListener('DOMContentLoaded', () => {
  const chatInput = document.getElementById('chatInput');
  const sendMessageBtn = document.getElementById('sendMessageBtn');
  const chatArea = document.getElementById('chatArea');
  const modesToggle = document.getElementById('modesToggle');
  const modesPanel = document.getElementById('modesPanel');
  const modesContent = document.getElementById('modesContent');
  const callNetlifyBtn = document.getElementById('callNetlifyBtn');
  const netlifyResult = document.getElementById('netlifyResult');

  // Basit element kontrolü, yoksa konsola uyarı at
  const checkElement = (el, name) => {
    if (!el) console.error(`Hata: '${name}' elementi bulunamadı!`);
  };

  [ 
    [chatInput, 'chatInput'],
    [sendMessageBtn, 'sendMessageBtn'],
    [chatArea, 'chatArea'],
    [modesToggle, 'modesToggle'],
    [modesPanel, 'modesPanel'],
    [modesContent, 'modesContent'],
    [callNetlifyBtn, 'callNetlifyBtn'],
    [netlifyResult, 'netlifyResult']
  ].forEach(([el, name]) => checkElement(el, name));

  async function sendMessage() {
    if (!chatInput) return;
    const userMessage = chatInput.value.trim();
    if (!userMessage) return;

    displayMessage(userMessage, 'user');
    chatInput.value = '';
    scrollToBottom();

    let aiResponse = "Yanıt alınamadı.";

    try {
      const res = await fetch('/.netlify/functions/hello', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage }) // backend ile uyumlu
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(`Netlify fonksiyon hatası: ${res.status} - ${errorData.message || 'Bilinmeyen hata'}`);
      }

      const data = await res.json();
      aiResponse = data.reply || "Netlify fonksiyonundan boş yanıt geldi.";
    } catch (error) {
      console.error("Netlify fonksiyonu çağrılırken hata oluştu:", error);
      aiResponse = `Netlify fonksiyonu çağrılırken hata oluştu: ${error.message}`;
    }

    setTimeout(() => {
      displayMessage(aiResponse, 'ai');
      scrollToBottom();
    }, 700);
  }

  function displayMessage(message, sender) {
    if (!chatArea) return;

    const wrapper = document.createElement('div');
    wrapper.classList.add('flex', 'mb-4', sender === 'user' ? 'justify-end' : 'justify-start');

    const msgDiv = document.createElement('div');
    msgDiv.classList.add(
      sender === 'user' ? 'bg-emerald-600 text-white' : 'bg-gray-700 text-gray-200',
      'p-3', 'rounded-xl', 'max-w-xs', 'shadow-md'
    );
    msgDiv.textContent = message;

    wrapper.appendChild(msgDiv);
    chatArea.appendChild(wrapper);
  }

  function scrollToBottom() {
    if (!chatArea) return;
    chatArea.scrollTop = chatArea.scrollHeight;
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
    egitim.hedefOzellikler.forEach(f => {
      const li = document.createElement('li');
      li.textContent = f;
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
      const res = await fetch('/.netlify/functions/hello', { method: 'GET' });
      const data = await res.json();
      netlifyResult.textContent = JSON.stringify(data, null, 2);
    } catch (error) {
      netlifyResult.textContent = `Hata: ${error.message}`;
      console.error("Netlify fonksiyonu çağrılırken hata oluştu:", error);
    }
  }

  sendMessageBtn?.addEventListener('click', sendMessage);
  modesToggle?.addEventListener('click', toggleModesPanel);
  callNetlifyBtn?.addEventListener('click', callNetlifyFunction);

  loadModesContent();
});
