export default async (req, context) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  const { messages } = await req.json();
  const hfToken = Netlify.env.get('HUGGINGFACE_TOKEN');

  if (!hfToken) {
    return Response.json({ error: 'HUGGINGFACE_TOKEN missing' }, { status: 500 });
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

  // HuggingFace mesaj formatina cevir
  const hfMessages = [
    { role: 'system', content: system },
    ...messages.map(m => ({ role: m.role, content: m.content }))
  ];

  try {
    const response = await fetch(
      'https://router.huggingface.co/novita/v3/openai/chat/completions',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${hfToken}`,
          'Content-Type': 'application/json'
        },        body: JSON.stringify({
          model: 'deepseek/deepseek-v3-0324',
          messages: hfMessages,
          max_tokens: 500
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error('HF API error:', JSON.stringify(data));
      return Response.json(
        { error: 'API hatasi', details: data },
        { status: 500 }
      );
    }

    const reply = data.choices?.[0]?.message?.content || 'Bir hata olustu.';
    return Response.json({ content: [{ type: 'text', text: reply }] });
  } catch (error) {
    console.error('Function error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
};

export const config = {
  path: "/api/chat"
};