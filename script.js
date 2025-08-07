import fetch from 'node-fetch';
import { egitim } from '../../egitim.js';

// Karakter temizleme fonksiyonu
function sanitizeText(text) {
  return text
    .replace(/[\u2010-\u2015]/g, "-") // tüm özel tireleri normal tireye çevir
    .replace(/[\u2018\u2019]/g, "'")  // özel tırnakları normal tırnağa çevir
    .replace(/[\u201C\u201D]/g, '"'); // özel çift tırnakları normal çift tırnağa çevir
}

export const handler = async (event) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: JSON.stringify({ error: 'Method Not Allowed' }) };
    }

    try {
        const { messages } = JSON.parse(event.body);

        // Sistem promptunu ekle ve tüm mesajları temizle
        const fullMessages = [
            { role: 'system', content: sanitizeText(egitim.sistemPrompt) },
            ...messages.map(msg => ({
                role: msg.role,
                content: sanitizeText(msg.content)
            }))
        ];

        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.EYWALLAH_AI_GEMINI}`,
                'HTTP-Referer': 'https://eywallahai.netlify.app',
                'X-Title': sanitizeText('Eywallah AI - Orion 1') // Başlık da temizlendi
            },
            body: JSON.stringify({
                model: 'google/gemma-3-27b-it:free',
                messages: fullMessages.map(msg => ({
                    role: msg.role,
                    content: [{ type: 'text', text: msg.content }]
                })),
                temperature: 0.7,
                max_tokens: 2000
            })
        });

        if (!response.ok) {
            const errText = await response.text();
            throw new Error(`OpenRouter API error: ${errText}`);
        }

        const data = await response.json();
        return { statusCode: 200, body: JSON.stringify(data) };
    } catch (err) {
        console.error(err);
        return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
    }
};
