exports.handler = async function(event, context) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method not allowed' };
  }

  const { messages } = JSON.parse(event.body);
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'GEMINI_API_KEY missing' })
    };
  }

  const system = `Sen Mete Tungaz'in AI tasarim asistanisin. Mete, Black & Gray Realism uzman dovme sanatcisi. Marmaris, Alanya, Istanbul. 2016 Rotterdam 2. odulu. Instagram: @metetungaz.

GOREV: Musteriden adim adim bilgi toplayarak Black & Gray Realism tasarim konsepti olustur.
SIRASYLA sor (hepsini bir anda sorma):
1. Hangi vucut bolgesine?
2. Ne motif/konu? (portre, hayvan, doga, soyut...)
3. Boyut? (kucuk 5-8cm / orta 10-15cm / buyuk 20cm+ / sleeve)
4. Ozel anlam veya referans var mi?

Bilgileri aldiktan sonra 'Bu tasarim Mete Tungaz'in elinde...' diye baslayan detayli Black & Gray konsept yaz.

FIYAT KURALI: Fiyat/ucret sorulursa SADECE su mesaji ver:
Fiyat icin Mete ile direkt iletisime gecebilirsin: https://wa.me/905464068636

Kisa ve samimi (konsept haric max 2-3 cumle). Markdown kullanma. Turkce soruya Turkce, Ingilizce soruya Ingilizce cevap ver.`;

  const geminiMessages = messages.map(m => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }]
  }));

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: geminiMessages,
          systemInstruction: { parts: [{ text: system }] }
        })
      }
    );

    const data = await response.json();
    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Bir hata olustu.';

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: [{ type: 'text', text: reply }] })
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};
