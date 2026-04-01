export default async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    const { prompt, userMessage } = await req.json();
    const hfToken = process.env.HUGGINGFACE_TOKEN;

    if (!hfToken) {
      return new Response(
        JSON.stringify({ error: "HuggingFace token not configured" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    // Önce Claude ile prompt'u optimize et
    let finalPrompt = prompt;
    
    if (userMessage && !prompt) {
      const claudeResponse = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": process.env.ANTHROPIC_API_KEY,
          "anthropic-version": "2023-06-01"
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 200,
          messages: [{
            role: "user",
            content: `Kullanıcının tattoo isteğini Stable Diffusion prompt'una çevir.
            
Kullanıcı isteği: "${userMessage}"

METE TUNGAZ SIGNATURE STYLE:
- Deep blacks with smooth gradients
- Bold white highlights (eyes, metal surfaces)
- Photorealistic shading, no outlines
- Dramatic shadows (chin, neck, eye sockets)
- Soft spray fade at edges
- Mythological warrior themes
- Multi-element storytelling

Format: "Black and gray realism tattoo: [detaylı açıklama], photorealistic shading"`
          }]
        })
      });

      const claudeData = await claudeResponse.json();
      finalPrompt = claudeData.content[0].text;
    }

    // Hugging Face Stable Diffusion
    const response = await fetch(
      "https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${hfToken}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          inputs: finalPrompt,
          parameters: {
            negative_prompt: "color, colored, cartoon, anime, low quality, blurry, text, watermark, outline",
            num_inference_steps: 40,
            guidance_scale: 8.5,
            width: 1024,
            height: 1024
          }
        })
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      return new Response(
        JSON.stringify({ error: "Image generation failed", details: errorText }),
        { status: response.status, headers: { "Content-Type": "application/json" } }
      );
    }

    const imageBlob = await response.blob();
    const buffer = await imageBlob.arrayBuffer();
    const base64Image = Buffer.from(buffer).toString('base64');

    return new Response(
      JSON.stringify({
        success: true,
        image: `data:image/png;base64,${base64Image}`,
        prompt: finalPrompt
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );

  } catch (error) {
    return new Response(
      JSON.stringify({ error: "Failed to generate design", message: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};

export const config = { path: "/api/generate-design" };
