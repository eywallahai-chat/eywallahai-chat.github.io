const fetch = require('node-fetch');

exports.handler = async (event) => {
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: 'Yalnızca POST metoduna izin verilir.'
        };
    }

    try {
        const { prompt, messages } = JSON.parse(event.body);

        if (!prompt) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'Prompt eksik.' })
            };
        }

        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.EYWALLAH_AI_ORION}`,
                'HTTP-Referer': 'https://eywallahai-chat.github.io/',
                'X-Title': 'Eywallah AI Orion 1'
            },
            body: JSON.stringify({
                model: 'deepseek/deepseek-r1-0528-qwen3-8b',
                messages: [...(messages || []), { role: 'user', content: prompt }],
                temperature: 0.7,
                max_tokens: 1000
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('OpenRouter API hatası:', response.status, errorText);
            return {
                statusCode: response.status,
                body: JSON.stringify({ error: `API Hatası: ${response.status}` })
            };
        }

        const data = await response.json();
        return {
            statusCode: 200,
            body: JSON.stringify({
                reply: data.choices[0].message.content
            })
        };

    } catch (error) {
        console.error('Sunucu hatası:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Sunucu hatası oluştu.' })
        };
    }
};
