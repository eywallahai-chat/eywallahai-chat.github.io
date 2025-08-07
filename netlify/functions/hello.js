import fetch from 'node-fetch';
import { egitim } from '../../egitim.js';

export const handler = async (event) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: JSON.stringify({ error: 'Method Not Allowed' }) };
    }

    try {
        const { messages } = JSON.parse(event.body);

        const fullMessages = [
            { role: 'system', content: egitim.sistemPrompt },
            ...messages
        ];

        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.EYWALLAH_AI_GEMINI}`,
                'HTTP-Referer': 'https://eywallahai.netlify.app',
                'X-Title': 'Eywallah AI – Orion 1'
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

        if (!response.ok) throw new Error(await response.text());

        const data = await response.json();
        return { statusCode: 200, body: JSON.stringify(data) };
    } catch (err) {
        console.error(err);
        return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
    }
};
