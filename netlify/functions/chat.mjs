export default async (req) => {
  if (req.method !== "POST") return new Response("nope", { status: 405 });

  const { messages } = await req.json();
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) return new Response(
    JSON.stringify({ error: "no key" }),
    { status: 500, headers: { "Content-Type": "application/json" } }
  );

  const system = "Sen Mete Tungaz'in AI tasarim asistanisin. " +
    "Mete, Black & Gray Realism uzman dovme sanatcisi. Marmaris, Alanya, Istanbul. " +
    "2016 Rotterdam 2. odulu. Instagram: @metetungaz.\n\n" +
    "GOREV: Musteriden adim adim bilgi toplayarak Black & Gray Realism tasarim konsepti olustur.\n" +
    "SIRASYLA sor (hepsini bir anda sorma):\n" +
    "1. Hangi vucut bolgesine?\n" +
    "2. Ne motif/konu? (portre, hayvan, doga, soyut...)\n" +
    "3. Boyut? (kucuk 5-8cm / orta 10-15cm / buyuk 20cm+ / sleeve)\n" +
    "4. Ozel anlam veya referans var mi?\n\n" +
    "Bilgileri aldiktan sonra 'Bu tasarim Mete Tungaz'in elinde...' diye baslayan " +
    "detaili Black & Gray konsept yaz. Golgeler, kontrast, kompozisyon anlat.\n\n" +
    "FIYAT KURALI: Fiyat/ucret sorulursa SADECE su mesaji ver:\n" +
    "Fiyat icin Mete ile direkt iletisime gecebilirsin: https://wa.me/905464068636\n\n" +
    "Kisa ve samimi (konsept haric max 2-3 cumle). Markdown kullanma. " +
    "Turkce soruya Turkce, Ingilizce soruya Ingilizce cevap ver.";

  // Gemini API format
  const geminiMessages = messages.map(m => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }]
  }));

  const resp = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: geminiMessages,
        systemInstruction: { parts: [{ text: system }] }
      })
    }
  );

  const data = await resp.json();
  
  // Gemini response'u Claude formatına çevir
  const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "Bir hata olustu.";
  
  return new Response(JSON.stringify({
    content: [{ type: "text", text: reply }]
  }), {
    status: 200,
    headers: { "Content-Type": "application/json" }
  });
};

export const config = { path: "/api/chat" };
