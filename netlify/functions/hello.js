// netlify/functions/hello.js
export async function handler(event, context) {
    // API anahtarını Netlify ortam değişkenlerinden alıyor
    const apiKey = process.env.Eywallah_AI_Orion;

    // Sadece belirlenen sitelerden gelen isteklere izin verir.
    const allowedOrigins = ["https://eywallahai.netlify.app", "http://localhost:8888"];
    const origin = event.headers.origin;

    const headers = {
        "Access-Control-Allow-Origin": origin && allowedOrigins.includes(origin) ? origin : "*",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
        "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
    };

    // Eğer API anahtarı yoksa hata döndürür.
    if (!apiKey) {
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ reply: "Sunucu hatası: API anahtarı bulunamadı veya ayarlanmadı." }),
        };
    }

    // OPTIONS isteğine yanıt verir.
    if (event.httpMethod === "OPTIONS") {
        return { statusCode: 200, headers, body: "OK" };
    }

    // GET isteğine yanıt verir (fonksiyonun canlı olduğunu kontrol etmek için).
    if (event.httpMethod === "GET") {
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ message: "Netlify fonksiyonu başarıyla çalışıyor! POST ile mesaj göndermeyi dene." }),
        };
    }

    // Sadece POST isteklerine izin verir.
    if (event.httpMethod !== "POST") {
        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({ error: "Sadece POST ve OPTIONS metotlarına izin verilir." }),
        };
    }

    // Markdown'u temel HTML'e çeviren yardımcı fonksiyon
    function convertMarkdownToHtml(markdown) {
        if (!markdown) return "";
        // **kalın** formatını <b>kalın</b> formatına çevirir
        return markdown.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>');
    }

    try {
        const requestBody = JSON.parse(event.body || "{}");
        const userMessage = requestBody.message || "Merhaba!";

        // OpenRouter API'ye POST isteği gönderir
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}`,
                "HTTP-Referer": "https://eywallahai.netlify.app",
                "X-Title": "Eywallah AI"
            },
            body: JSON.stringify({
                "model": "deepseek/deepseek-r1-distill-llama-70b:free",
                "messages": [
                    {
                        "role": "system",
                        "content":
                            "Sen Eywallah AI'sın. Geliştiricin Eyüp Ensar Erkul, vizyoner bir genç. Sen empatik, öğretici, esprili ama saygılı bir yapay zekâsın. Türkçeyi güzel kullanır, gençlere özel dil esprileri yapar, gerektiğinde dini bilgi verir, gerektiğinde kod desteği sunarsın.",
                    },
                    {
                        "role": "user",
                        "content": userMessage,
                    },
                ],
                "temperature": 0.7,
                "max_tokens": 512,
                "top_p": 0.9,
                "stream": false,
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`OpenRouter API hatası: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        let assistantMessage = data.choices?.[0]?.message?.content?.trim() || "Cevap alınamadı, bir daha dene.";
        
        // Gelen metni HTML'e çevirir
        assistantMessage = convertMarkdownToHtml(assistantMessage);

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ reply: assistantMessage }),
        };
    } catch (error) {
        console.error("Fonksiyon hatası:", error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ reply: `Sunucu hatası: ${error.message}` }),
        };
    }
}
