// Netlify Sunucu Fonksiyonu
const fetch = require('node-fetch');

// API anahtarını ortam değişkeninden al
const openrouterApiKey = process.env.EYWALLAH_AI_ORION;

exports.handler = async (event) => {
    // Sadece POST isteklerini kabul et
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: 'Yalnızca POST metoduna izin verilir.'
        };
    }

    try {
        const { prompt } = JSON.parse(event.body);

        // Prompt kontrolü
        if (!prompt) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'İstek gövdesinde prompt alanı eksik.' })
            };
        }

        // OpenRouter API isteği için payload
        const payload = {
            model: "deepseek/deepseek-r1-0528-qwen3-8b",
            messages: [{ role: "user", content: prompt }]
        };

        // OpenRouter API çağrısı
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${openrouterApiKey}`,
                'HTTP-Referer': 'https://eywallahai-chat.github.io/',
                'X-Title': 'Eywallah AI Orion 1'
            },
            body: JSON.stringify(payload)
        });

        // Hata kontrolü
        if (!response.ok) {
            const errorBody = await response.text();
            console.error("OpenRouter API hata yanıtı:", response.status, errorBody);
            return {
                statusCode: response.status,
                body: JSON.stringify({ error: `OpenRouter API hatası: ${response.status} - ${errorBody}` })
            };
        }

        // Başarılı yanıt
        const result = await response.json();
        const aiReply = result.choices?.[0]?.message?.content || 'Hata: AI cevap veremedi';

        return {
            statusCode: 200,
            body: JSON.stringify({ reply: aiReply })
        };
    } catch (error) {
        console.error("API çağrılırken hata oluştu:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: `Sunucu hatası: ${error.message}` })
        };
    }
};
