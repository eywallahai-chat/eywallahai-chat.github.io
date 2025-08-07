// Bu dosya, Netlify'da "hello.js" adıyla çalışacak fonksiyon kodudur.
// Ön yüz (script.js) bu fonksiyonu `/.netlify/functions/hello` adresi üzerinden çağırır.

// Netlify Fonksiyonu için gerekli kütüphaneler
const { Client } = require('pg');
const fetch = require('node-fetch');

// Ortam değişkenleri ile Neon veritabanına bağlantı
// NOT: Netlify'da NEON_DB_URL ve EYWALLAH_AI_ORION ortam değişkenlerini tanımlamanız gerekiyor.
const neonClient = new Client({
    connectionString: process.env.NEON_DB_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

// AI API için gerekli ortam değişkeni
const eywallahAiOrionApiKey = process.env.EYWALLAH_AI_ORION;

// OpenRouter API'den yanıt alma
async function getAIResponse(prompt) {
    const payload = {
        model: "deepseek/deepseek-r1-0528-qwen3-8b", // Kullanılacak yeni model
        messages: [{ role: "user", content: prompt }]
    };
    const apiUrl = `https://openrouter.ai/api/v1/chat/completions`;

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${eywallahAiOrionApiKey}`
            },
            body: JSON.stringify(payload)
        });

        // Hata durumlarını kontrol et
        if (!response.ok) {
            const errorBody = await response.text();
            console.error("OpenRouter API hata yanıtı:", response.status, errorBody);
            throw new Error(`OpenRouter API hatası: ${response.status} - ${errorBody}`);
        }

        const result = await response.json();
        // Geçerli bir yanıt gelip gelmediğini kontrol et
        if (result.choices && result.choices.length > 0 && result.choices[0].message) {
            return result.choices[0].message.content;
        } else {
            console.error("OpenRouter API'den geçerli bir yanıt alınamadı:", JSON.stringify(result));
            return "OpenRouter'dan boş veya hatalı bir yanıt alındı.";
        }
    } catch (error) {
        console.error("OpenRouter API çağrılırken hata oluştu:", error);
        return `OpenRouter'dan yanıt alınamadı: ${error.message}`;
    }
}

// Netlify fonksiyonunun ana işleyicisi
exports.handler = async (event) => {
    try {
        // GET ve POST isteklerini işleme
        if (event.httpMethod === 'GET') {
            const { action, userId, chatId } = event.queryStringParameters;
            await neonClient.connect();
            
            switch (action) {
                case 'get_chats':
                    const chatsQuery = `SELECT id, title FROM chats WHERE user_id = $1 ORDER BY created_at DESC`;
                    const chatsResult = await neonClient.query(chatsQuery, [userId]);
                    return {
                        statusCode: 200,
                        body: JSON.stringify(chatsResult.rows)
                    };
                
                case 'get_messages':
                    const messagesQuery = `SELECT sender, text FROM messages WHERE chat_id = $1 ORDER BY created_at ASC`;
                    const messagesResult = await neonClient.query(messagesQuery, [chatId]);
                    return {
                        statusCode: 200,
                        body: JSON.stringify(messagesResult.rows)
                    };

                case 'test_netlify':
                    return {
                        statusCode: 200,
                        body: JSON.stringify({ message: "Netlify fonksiyonu başarılı." })
                    };

                default:
                    return {
                        statusCode: 400,
                        body: JSON.stringify({ error: 'Geçersiz GET işlemi.' })
                    };
            }
        } else if (event.httpMethod === 'POST') {
            const { action, userId, chatId, message } = JSON.parse(event.body);
            await neonClient.connect();

            switch (action) {
                case 'new_chat':
                    const newChatQuery = `INSERT INTO chats (user_id, title) VALUES ($1, $2) RETURNING id`;
                    const newChatResult = await neonClient.query(newChatQuery, [userId, 'Yeni Sohbet']);
                    return {
                        statusCode: 200,
                        body: JSON.stringify({ chatId: newChatResult.rows[0].id })
                    };

                case 'delete_chat':
                    const deleteChatQuery = `DELETE FROM chats WHERE id = $1 AND user_id = $2`;
                    await neonClient.query(deleteChatQuery, [chatId, userId]);
                    return {
                        statusCode: 200,
                        body: JSON.stringify({ success: true })
                    };

                case 'send_message':
                    const insertMessageQuery = `
                        INSERT INTO messages (chat_id, sender, text) VALUES ($1, $2, $3)
                    `;
                    await neonClient.query(insertMessageQuery, [chatId, 'user', message]);
                    
                    const aiResponse = await getAIResponse(message);
                    
                    const insertAiMessageQuery = `
                        INSERT INTO messages (chat_id, sender, text) VALUES ($1, $2, $3)
                    `;
                    await neonClient.query(insertAiMessageQuery, [chatId, 'ai', aiResponse]);

                    return {
                        statusCode: 200,
                        body: JSON.stringify({ reply: aiResponse })
                    };

                default:
                    return {
                        statusCode: 400,
                        body: JSON.stringify({ error: 'Geçersiz POST işlemi.' })
                    };
            }
        }
    } catch (error) {
        console.error("Veritabanı veya API hatası:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ reply: `Sunucu hatası: ${error.message}` })
        };
    } finally {
        if (neonClient) {
            await neonClient.end();
        }
    }
};
