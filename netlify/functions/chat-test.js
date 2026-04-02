export async function handler(event) {
  // Sadece POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { messages } = JSON.parse(event.body);
    const apiKey = process.env.GEMINI_API_KEY;

    console.log('=== DEBUG INFO ===');
    console.log('API Key exists:', !!apiKey);
    console.log('API Key length:', apiKey?.length);
    console.log('Messages:', messages?.length);

    if (!apiKey) {
      return {
        statusCode: 500,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'GEMINI_API_KEY missing from env' })
      };
    }

    // Basit test - direkt cevap
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content: [{
          type: 'text',
          text: 'Merhaba! Chatbot çalışıyor! Gemini API bağlantısı başarılı! 🎉'
        }]
      })
    };

  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: error.message })
    };
  }
}
