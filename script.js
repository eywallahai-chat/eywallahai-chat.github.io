async function sendMessage() {
    if (!chatInput || !sendMessageBtn) {
        console.error("Gönderme butonu veya giriş alanı bulunamadı.");
        return;
    }

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
            body: JSON.stringify({
                message: userMessage,
                model: "deepseek/deepseek-r1-distill-llama-70b:free"
            })
        });

        if (!res.ok) {
            const errorData = await res.json();
            throw new Error(`Netlify fonksiyon hatası: ${res.status} - ${errorData.error || errorData.reply}`);
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
