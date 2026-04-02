export const handler = async (event) => {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Error' };
  try {
    const { userMessage } = JSON.parse(event.body);
    const hfToken = process.env.HUGGINGFACE_TOKEN;

    const response = await fetch("https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0", {
      method: "POST",
      headers: { "Authorization": `Bearer ${hfToken}`, "Content-Type": "application/json" },
      body: JSON.stringify({ inputs: `Black and gray realism tattoo: ${userMessage}, hyper-realistic, ink on skin` })
    });

    const imageBlob = await response.blob();
    const buffer = await imageBlob.arrayBuffer();
    const base64Image = Buffer.from(buffer).toString('base64');

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, image: `data:image/png;base64,${base64Image}` })
    };
  } catch (e) { return { statusCode: 500, body: JSON.stringify({ error: e.message }) }; }
};
