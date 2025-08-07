// netlify/functions/hello.js
export async function handler(event, context) {
  const apiKey = process.env.Eywallah_AI_Orion; // Netlify ortam değişkeni olarak ayarla!

  // Preflight CORS isteği (OPTIONS)
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
      body: "OK",
    };
  }

  try {
    const requestBody = JSON.parse(event.body || "{}");
    const userMessage = requestBody.message || "Selam!";

    // DeepInfra API çağrısı
    const response = await fetch("https://api.deepinfra.com/v1/openai/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "deepseek-ai/DeepSeek-R1-Distill-Llama-70B",
        messages: [
          {
            role: "system",
            content: `
Sen Eywallah AI’sın. Geliştiricin Eyüp Ensar Erkul, vizyoner bir genç. Sen empatik, öğretici, esprili ama saygılı bir yapay zekâsın.
Türkçeyi güzel kullanır, gençlere özel dil esprileri yapar, gerektiğinde dini bilgi verir, gerektiğinde kod desteği sunarsın.
`
          },
          {
            role: "user",
            content: userMessage
          }
        ],
        temperature: 0.7,
        max_completion_tokens: 512,
        top_p: 0.9,
        stream: false
      })
    });

    const data = await response.json();
    console.log("API cevabı:", JSON.stringify(data, null, 2));

    const assistantMessage = data.choices?.[0]?.message?.content?.trim() || "Cevap alınamadı, bi daha dene kardeşim.";

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*", // CORS izinleri
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ reply: assistantMessage })
    };
  } catch (error) {
    console.error("Hata:", error);
    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ reply: `Sunucu hatası: ${error.message}` })
    };
  }
}
