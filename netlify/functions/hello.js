// Bu dosya, Netlify'da "hello.js" adıyla çalışacak fonksiyon kodudur.
// Ön yüz (index.html) bu fonksiyonu `/.netlify/functions/hello` adresi üzerinden çağırır.

// API çağrısı için gerekli kütüphane
const fetch = require('node-fetch');

// Ortam değişkeni ile AI API anahtarını alıyoruz.
// NOT: Netlify'da 'OPENROUTER_API_KEY' adında bir ortam değişkeni tanımlamanız gerekiyor.
const openrouterApiKey = process.env.EYWALLAH_AI_ORION;

// Netlify fonksiyonunun ana işleyicisi
exports.handler = async (event) => {
    // Sadece POST isteklerini işliyoruz
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: 'Yalnızca POST metoduna izin verilir.'
        };
    }

    try {
        const { prompt } = JSON.parse(event.body);

        if (!prompt) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'İstek gövdesinde prompt alanı eksik.' })
            };
        }

        const payload = {
            model: "deepseek/deepseek-r1-0528-qwen3-8b",
            messages: [{ role: "user", content: prompt }]
        };
        
        const apiUrl = `https://openrouter.ai/api/v1/chat/completions`;

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${openrouterApiKey}` // API anahtarını güvenli bir şekilde kullan
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorBody = await response.text();
            console.error("OpenRouter API hata yanıtı:", response.status, errorBody);
            return {
                statusCode: response.status,
                body: JSON.stringify({ error: `OpenRouter API hatası: ${response.status} - ${errorBody}` })
            };
        }

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
            body: JSON.stringify({ reply: `Sunucu hatası: ${error.message}` })
        };
    }
};

