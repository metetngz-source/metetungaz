export default async (req, context) => {
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 });

  try {
    const { messages } = await req.json();
    const hfToken = Netlify.env.get('HUGGINGFACE_TOKEN');

    if (!hfToken) return Response.json({ error: 'HF_TOKEN_MISSING' }, { status: 500 });

    const systemPrompt = `Sen Mete Tungaz'ın profesyonel dövme asistanısın. 
Mete: Siyah-Gri Realizm uzmanı, 2016 Rotterdam 2.si. Şubeler: Alanya, Marmaris ve global.
KURAL: Kısa yaz, her mesajda sadece 1 soru sor. Sırayla: Bölge, Motif, Boyut.
Fiyat/Randevu: https://wa.me/905464068636`;

    const response = await fetch(
      'https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2/v1/chat/completions',
      {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${hfToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'mistralai/Mistral-7B-Instruct-v0.2',
          messages: [{ role: 'system', content: systemPrompt }, ...messages],
          max_tokens: 300
        })
      }
    );

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || "Küçük bir teknik aksaklık oldu, tekrar yazar mısın? 💉";

    return Response.json({ content: [{ type: 'text', text: reply }] });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
};

export const config = { path: "/api/chat" };
