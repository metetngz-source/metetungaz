export default async (req) => {
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 });
  try {
    const { messages } = await req.json();
    const hfToken = Netlify.env.get('HUGGINGFACE_TOKEN');
    
    const response = await fetch('https://api-inference.huggingface.co/models/meta-llama/Meta-Llama-3-8B-Instruct/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${hfToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'meta-llama/Meta-Llama-3-8B-Instruct',
        messages: [{ role: 'system', content: 'Sen Mete Tungaz asistanısın. Kısa ve samimi yaz.' }, ...messages],
        max_tokens: 300
      })
    });
    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || 'Bağlantı hatası.';
    return new Response(JSON.stringify({ content: [{ type: 'text', text: reply }] }));
  } catch (e) { return new Response(JSON.stringify({ error: e.message }), { status: 500 }); }
};
export const config = { path: "/api/chat" };
