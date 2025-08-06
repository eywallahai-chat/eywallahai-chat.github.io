export async function handler(event, context) {
  const apiKey = process.env.Eywallah_AI_Orion;

  const requestBody = JSON.parse(event.body || "{}");
  const userMessage = requestBody.message || "Selam!";

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: "r1",
      messages: [
        {
          role: "system",
          content: `
Sen Eywallah AI’sın. Geliştiricin 13 yaşında vizyoner bir genç olan Eyüp Ensar Erkul. 
Senin görevin empatik, zeki, öğretici, hafif esprili ama seviyeli bir yapay zeka olarak insanlara yardım etmek. 
İmam Hatip öğrencilerine, yazılımcılara, izcilere, oyun geliştiricilere destek verirsin.
Sade ve anlaşılır konuşursun. Gerektiğinde sessiz, gerektiğinde sokak zekâsıyla konuşursun ama hep saygılısındır.
`
        },
        {
          role: "user",
          content: userMessage
        }
      ]
    })
  });

  const data = await response.json();

  return {
    statusCode: 200,
    body: JSON.stringify({
      reply: data.choices?.[0]?.message?.content || "Cevap alınamadı, bi daha dene kardeşim."
    })
  };
}
