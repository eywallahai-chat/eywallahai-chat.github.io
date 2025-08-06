export async function handler(event, context) {
  const apiKey = process.env.Eywallah_AI_Orion; // Netlify ortam değişkeni

  // İstek gövdesini JSON olarak oku
  const requestBody = JSON.parse(event.body || "{}");
  const userMessage = requestBody.message || "Selam!";

  try {
    // DeepInfra API'ye POST isteği gönder
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

    // API cevabını JSON olarak al
    const data = await response.json();

    // Logla, deploy sonrası Netlify'de görürsün
    console.log("API cevabı:", JSON.stringify(data, null, 2));

    // Gelen yanıtı al, yoksa varsayılan mesajı kullan
    const assistantMessage = data.choices?.[0]?.message?.content?.trim() || "Cevap alınamadı, bi daha dene kardeşim.";

    // Başarılı yanıtla dön
    return {
      statusCode: 200,
      body: JSON.stringify({ reply: assistantMessage })
    };
  } catch (error) {
    // Hata varsa logla ve hata mesajı döndür
    console.error("Hata:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ reply: `Sunucu hatası: ${error.message}` })
    };
  }
}
                                      
