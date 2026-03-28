export default async (req) => {
  if (req.method !== "POST") return new Response("nope", { status: 405 });

  const { messages } = await req.json();
  const apiKey = Netlify.env.get("ANTHROPIC_API_KEY");

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
    "detayli Black & Gray konsept yaz. Golgeler, kontrast, kompozisyon anlat.\n\n" +
    "FIYAT KURALI: Fiyat/ucret sorulursa SADECE su mesaji ver:\n" +
    "Fiyat icin Mete ile direkt iletisime gecebilirsin: https://wa.me/905464068636\n\n" +
    "Kisa ve samimi (konsept haric max 2-3 cumle). Markdown kullanma. " +
    "Turkce soruya Turkce, Ingilizce soruya Ingilizce cevap ver.";

  const resp = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01"
    },
    body: JSON.stringify({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 600,
      system,
      messages
    })
  });

  const data = await resp.json();
  console.log("API response status:", resp.status, JSON.stringify(data).slice(0, 200));

  return new Response(JSON.stringify(data), {
    status: resp.status,
    headers: { "Content-Type": "application/json" }
  });
};

export const config = { path: "/api/chat" };
