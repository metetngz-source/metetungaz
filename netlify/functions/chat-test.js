export async function handler(event) {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Error' };
  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      content: [{ type: 'text', text: 'Hugging Face sistemi başarıyla bağlandı! 🎉' }]
    })
  };
}
