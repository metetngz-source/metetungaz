export default async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    const { messages } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;

    // Debug log
    console.log("GEMINI_API_KEY exists:", !!apiKey);
    console.log("GEMINI_API_KEY length:", apiKey?.length);

    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "GEMINI_API_KEY missing" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    // Basit test - direkt cevap
    return new Response(
      JSON.stringify({
        content: [{ 
          type: "text", 
          text: "Merhaba! Ben Mete'nin AI asistanıyım. Chatbot çalışıyor! 🎉" 
        }]
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};

export const config = { path: "/api/chat" };
