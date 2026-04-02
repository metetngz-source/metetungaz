export default async (req, context) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  const { messages } = await req.json();
  const apiKey = Netlify.env.get('GEMINI_API_KEY');

  if (!apiKey) {
    return Response.json({ error: 'GEMINI_API_KEY missing' }, { status: 500 });
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
    if (!response.ok) {
      console.error('Gemini API error:', JSON.stringify(data));
      return Response.json(
        { error: 'Gemini API hatasi', details: data },
        { status: 500 }
      );
    }

    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Bir hata olustu.';

    return Response.json({ content: [{ type: 'text', text: reply }] });
  } catch (error) {
    console.error('Function error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
};

export const config = {
  path: "/api/chat"
};
