// netlify/functions/hello.js
const path = require('path');

let fetchFn = global.fetch;
if (!fetchFn) {
  // node-fetch fallback
  try {
    // dynamic require to avoid ESM issues
    fetchFn = require('node-fetch');
  } catch (e) {
    console.error('Global fetch yok ve node-fetch yüklenemedi. Netlify runtime Node18+ olmalı veya node-fetch npm kurulmalı.', e);
  }
}

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';

// Sistem prompt direkt fonksiyonda; ayrıca frontend egitim.js de mevcut (duplikasyon kabul edilebilir)
const SISTEM_PROMPT = `Sen Eywallah AI Orion 1'sin - kullanıcı dostu, Türkçe odaklı, esprili ve empatik bir yapay zeka asistanısın.
Her zaman Türkçe yanıt verirsin.
Tarih (UTC): ${new Date().toISOString().slice(0,19).replace('T',' ')}
Kullanıcı: eywallahai-chat`;

module.exports.handler = async (event, context) => {
  try {
    if (event.httpMethod !== 'POST') {
      return { statusCode: 405, body: JSON.stringify({ error: 'Method Not Allowed' }) };
    }

    let body;
    try {
      body = JSON.parse(event.body || '{}');
    } catch (e) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Invalid JSON body', details: e.message }) };
    }

    const incomingMessages = Array.isArray(body.messages) ? body.messages : [];
    // Prepend system prompt server-side for guaranteed behavior
    const fullMessages = [
      { role: 'system', content: SISTEM_PROMPT },
      ...incomingMessages
    ];

    // Map to OpenRouter expected content format: content: [{type:'text', text: '...'}]
    const mappedMessages = fullMessages.map(m => ({
      role: m.role,
      content: [{ type: 'text', text: m.content }]
    }));

    // Ensure API key exists
    const API_KEY = process.env.EYWALLAH_AI_GEMINI;
    if (!API_KEY) {
      console.error('EYWALLAH_AI_GEMINI environment variable not set');
      return { statusCode: 500, body: JSON.stringify({ error: 'Server misconfiguration: API key missing' }) };
    }

    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_KEY}`,
      'Referer': 'https://eywallahai.netlify.app',
      'HTTP-Referer': 'https://eywallahai.netlify.app',
      'X-Title': 'Eywallah AI – Orion 1'
    };

    const payload = {
      model: 'google/gemma-3-27b-it:free',
      messages: mappedMessages,
      temperature: 0.7,
      max_tokens: 2000
    };

    const resp = await (fetchFn || global.fetch)(OPENROUTER_URL, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
      // Netlify timeout kontrolü burada yok; OpenRouter çağrısı uzun sürerse Netlify fonksiyon zaman aşımı verebilir
    });

    if (!resp.ok) {
      const text = await resp.text().catch(()=>'<no-body>');
      console.error('OpenRouter API error', resp.status, text);
      return { statusCode: 502, body: JSON.stringify({ error: 'OpenRouter API error', status: resp.status, details: text }) };
    }

    const data = await resp.json();
    // Döndürülen veriyi olduğu gibi geçiyoruz (frontend seçim yapıyor)
    return { statusCode: 200, body: JSON.stringify(data) };

  } catch (err) {
    console.error('Function exception', err);
    return { statusCode: 500, body: JSON.stringify({ error: 'Internal Server Error', message: err.message }) };
  }
};
