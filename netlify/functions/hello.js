// netlify/functions/hello.js
export async function handler(event, context) {
    const apiKey = process.env.Eywallah_AI_Orion;

    const allowedOrigins = ["https://eywallah-ai.netlify.app", "http://localhost:8888"];
    const origin = event.headers.origin;

    const headers = {
        "Access-Control-Allow-Origin": origin && allowedOrigins.includes(origin) ? origin : "*",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
        "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
    };

    if (event.httpMethod === "OPTIONS") {
        return { statusCode: 200, headers, body: "OK" };
    }

    if (event.httpMethod === "GET") {
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ message: "Netlify fonksiyonu başarıyla çalışıyor! POST ile mesaj göndermeyi dene." }),
        };
    }

    if (event.httpMethod !== "POST") {
        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({ error: "Sadece POST ve OPTIONS metotlarına izin verilir." }),
        };
    }

    try {
        const requestBody = JSON.parse(event.body || "{}");
        const userMessage = requestBody.message || "Merhaba!";

        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}`,
                "HTTP-Referer": "https://eywallah-ai.netlify.app",
                "X-Title": "Eywallah AI",
            },
            body: JSON.stringify({
                // Buraya OpenRouter API’den geçerli model adını yaz
                model: "deepseek-chat", // Burayı kendi modelinle değiştir. Örnek: "deepseek-chat"
                messages: [
                    {
                        role: "system",
                        content: `Sen Eywallah AI'sın. Geliştiricin Eyüp Ensar Erkul, vizyoner bir genç. Sen empatik, öğretici, esprili ama saygılı bir yapay zekâsın. Türkçeyi güzel kullanır, gençlere özel dil esprileri yapar, gerektiğinde dini bilgi verir, gerektiğinde kod desteği sunarsın.`,
                    },
                    {
                        role: "user",
                        content: userMessage,
                    },
                ],
                temperature: 0.7,
                max_tokens: 512,
                top_p: 0.9,
                stream: false,
            }),
        });

        if (!response.ok) {
            const errorData = await response.text();
            throw new Error(`OpenRouter API hatası: ${response.status} - ${errorData}`);
        }

        const data = await response.json();
        const assistantMessage = data.choices?.[0]?.message?.content?.trim() || "Cevap alınamadı, bir daha dene.";

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
