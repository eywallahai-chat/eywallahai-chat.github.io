import { egitim } from '../../egitim.js';

// Karakter temizleme fonksiyonu
function sanitizeText(text) {
  return text
    .replace(/[\u2010-\u2015]/g, "-") // özel tireleri standart tireye çevir
    .replace(/[\u2018\u2019]/g, "'")   // özel tek tırnakları standart tek tırnağa çevir
    .replace(/[\u201C\u201D]/g, '"');  // özel çift tırnakları standart çift tırnağa çevir
}

export const handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed' }),
    };
  }

  try {
    const { messages } = JSON.parse(event.body);

    // Sistem promptunu ve kullanıcı mesajlarını düzgün biçimde hazırla
    const fullMessages = [
      {
        role: 'system',
        content: sanitizeText(egitim.sistemPrompt),
      },
      ...messages.map(msg => {
        // Eğer içerik array ise metin + görsel destekle
        if (Array.isArray(msg.content)) {
          return {
            role: msg.role,
            content: msg.content.map(item => {
              if (item.type === 'text') {
                return { type: 'text', text: sanitizeText(item.text) };
              }
              if (item.type === 'image_url' && item.image_url?.url) {
                return { type: 'image_url', image_url: { url: item.image_url.url } };
              }
              // Bilinmeyen tip varsa direkt geç
              return item;
            }),
          };
        }
        // Değilse, tek metin olarak temizle
        return {
          role: msg.role,
          content: [{ type: 'text', text: sanitizeText(msg.content) }],
        };
      }),
    ];

    // OpenRouter API çağrısı
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.EYWALLAH_AI_GEMINI}`,
        'HTTP-Referer': 'https://eywallahai.netlify.app',
        'X-Title': sanitizeText('Eywallah AI - Orion 1'),
      },
      body: JSON.stringify({
        model: 'openai/gpt-4o-mini',  // veya desteklenen başka model
        messages: fullMessages,
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`OpenRouter API error: ${errText}`);
    }

    const data = await response.json();

    return {
      statusCode: 200,
      body: JSON.stringify(data),
    };
  } catch (err) {
    console.error('Error in function:', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
