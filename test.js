require("dotenv").config();
const { GoogleGenAI } = require("@google/genai");

async function main() {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const fs = require("fs");
    fs.writeFileSync("test.pdf", "dummy pdf content");
    const base64PDF = fs.readFileSync("test.pdf").toString("base64");
    
    console.log("Sending request to Gemini...");
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        "Analyze this educational PDF document and generate a structured JSON output.",
        {
          inlineData: {
            data: base64PDF,
            mimeType: "application/pdf"
          }
        }
      ],
      config: {
        responseMimeType: "application/json",
      },
    });
    console.log("Success:", response.text);
  } catch (error) {
    console.error("Gemini API Error:");
    console.error(error);
  }
}
main();
