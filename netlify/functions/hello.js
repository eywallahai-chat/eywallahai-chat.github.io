// netlify/functions/hello.js
export async function handler(event, context) {
    // Sadece POST isteklerini işle
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({ message: "Method Not Allowed" }),
        };
    }

    let userMessage = "Merhaba!"; // Varsayılan mesaj

    try {
        const body = JSON.parse(event.body);
        userMessage = body.userMessage || userMessage; // Kullanıcı mesajını al
    } catch (error) {
        console.error("Gelen isteğin gövdesi ayrıştırılamadı:", error);
        return {
            statusCode: 400,
            body: JSON.stringify({ message: "Invalid JSON body" }),
        };
    }

    let chatHistory = [];
    chatHistory.push({ role: "user", parts: [{ text: userMessage }] });

    const payload = { contents: chatHistory };
    const apiKey = ""; // Canvas ortamında boş bırakılacak, çalışma zamanında sağlanır.
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`API hatası: ${response.status} - ${errorText}`);
        }

        const result = await response.json();
        let aiResponseText = "Üzgünüm, yanıt alınamadı.";

        if (result.candidates && result.candidates.length > 0 &&
            result.candidates[0].content && result.candidates[0].content.parts &&
            result.candidates[0].content.parts.length > 0) {
            aiResponseText = result.candidates[0].content.parts[0].text;
        } else {
            console.warn("Gemini API'den beklenen formatta yanıt gelmedi:", result);
            aiResponseText = "Üzgünüm, API'den beklenen yanıt alınamadı.";
        }

        return {
            statusCode: 200,
            body: JSON.stringify({ message: aiResponseText }),
        };

    } catch (error) {
        console.error("Gemini API çağrılırken hata oluştu:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: `Sunucu hatası: ${error.message}` }),
        };
    }
}
