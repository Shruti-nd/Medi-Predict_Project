const DEFAULT_SYSTEM_PROMPT =
  'You are a medical AI backend. Analyze patient data. Return ONLY JSON: [{"diseaseName": "Str", "likelihood": "High (X%)", "rationale": "Str"}] for top 3 risks.';

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let data = "";
    req.on("data", (chunk) => {
      data += chunk;
      if (data.length > 1e7) {
        reject(new Error("Payload too large"));
        req.destroy();
      }
    });
    req.on("end", () => {
      try {
        resolve(data ? JSON.parse(data) : {});
      } catch (error) {
        reject(error);
      }
    });
    req.on("error", (error) => reject(error));
  });
}

async function callGemini({ contextString, fileData }) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured");
  }

  const modelName =
    process.env.GEMINI_MODEL_NAME || "gemini-2.5-flash-preview-09-2025";
  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;

  const parts = [{ text: `Data: ${contextString}` }];
  if (fileData?.data && fileData?.mimeType) {
    parts.push({
      inlineData: {
        mimeType: fileData.mimeType,
        data: fileData.data,
      },
    });
  }

  const response = await fetch(apiUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts }],
      systemInstruction: { parts: [{ text: DEFAULT_SYSTEM_PROMPT }] },
      generationConfig: { responseMimeType: "application/json" },
    }),
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(`Gemini request failed: ${message}`);
  }

  const data = await response.json();
  const resultText = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!resultText) {
    throw new Error("Prediction Model Failed");
  }

  return JSON.parse(resultText);
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const body = await parseBody(req);
    if (!body?.contextString) {
      return res.status(400).json({ error: "contextString is required" });
    }

    const predictions = await callGemini({
      contextString: body.contextString,
      fileData: body.fileData,
    });

    res.status(200).json({ predictions });
  } catch (error) {
    console.error("[predict] failure", error);
    res
      .status(500)
      .json({ error: "Prediction request failed", details: error.message });
  }
};

