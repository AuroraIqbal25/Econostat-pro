export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed"
    });
  }

  try {
    const { system, message } = req.body;

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": process.env.GEMINI_API_KEY
        },
        body: JSON.stringify({
          systemInstruction: {
            parts: [
              {
                text: system || ""
              }
            ]
          },
          contents: [
            {
              role: "user",
              parts: [
                {
                  text: message || ""
                }
              ]
            }
          ]
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: data.error?.message || "Gemini API request failed"
      });
    }

    const text =
      data.candidates?.[0]?.content?.parts
        ?.map(part => part.text || "")
        .join("") || "";

    if (!text) {
      return res.status(500).json({
        error: "Gemini returned an empty response."
      });
    }

    return res.status(200).json({
      content: [
        {
          text: text
        }
      ]
    });

  } catch (error) {
    return res.status(500).json({
      error: error.message || "Server error"
    });
  }
}
