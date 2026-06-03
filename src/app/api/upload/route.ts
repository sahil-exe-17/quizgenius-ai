import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { prisma } from "@/lib/db";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const numberOfQuestions = formData.get("numberOfQuestions") || "10";
    const difficulty = formData.get("difficulty") || "Medium";

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // Convert PDF to base64 for Gemini
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64PDF = buffer.toString("base64");

    // Prompt Gemini for Quizzes and Flashcards
    const promptText = `
    Analyze this educational PDF document and generate a structured JSON output with a Quiz and Flashcards.
    
    Format Requirements:
    - Output must be exactly in the following JSON structure without markdown formatting or code blocks:
    {
      "title": "Title of the topic/chapter",
      "questions": [
        {
          "type": "MULTIPLE_CHOICE",
          "questionText": "Question text here?",
          "options": ["A", "B", "C", "D"],
          "correctAnswer": "A",
          "explanation": "Explanation here"
        }
      ],
      "flashcards": [
        {
          "front": "Term or question",
          "back": "Definition or answer"
        }
      ]
    }
    
    Ensure you generate EXACTLY ${numberOfQuestions} multiple choice questions and 5 flashcards based on the core concepts in the text.
    The difficulty level of the questions must be strictly set to "${difficulty}".
    Ensure the questions are well-distributed across the entire document's content, focusing on the core concepts suitable for the ${difficulty} level.

    IMPORTANT SOLVABLE MATH REQUIREMENT:
    For math, physics, or computational topics:
    - Focus heavily on generating practical, solvable problems, exercises, calculations, and numerical questions that test problem-solving skills (e.g., "Find the value of $k$...", "Evaluate the integral...", "Calculate the distance...", "Solve for $x$...").
    - Avoid generating simple conceptual, theoretical, or definition-based questions (e.g., avoid "What is the definition of Beta function?").
    - Ensure that all generated options ($A, B, C, D$) are mathematically correct and include plausible distractor answers representing common student errors.
    - Provide a step-by-step mathematical proof or solution derivation in the "explanation" field so the student can follow along.

    IMPORTANT MATH RENDERING REQUIREMENT:
    If the document contains mathematical formulas, equations, variables, integration, limits, summation, exponents, fractions, geometry symbols, or scientific notation, you MUST format them using standard LaTeX syntax.
    - Wrap inline math elements (like variables, simple exponents, small terms) in single dollar signs (e.g., $B(m,n)$, $x^{m-1}$, $\Gamma(n)$, $5x + 7y = 3$, or $\\Delta ABC \\sim \\Delta PQR$).
    - Wrap larger block equations or integrals in double dollar signs (e.g., $$\\int_{0}^{1} x^{m-1} (1-x)^{n-1} dx$$ or $$B(m,n) = \\frac{\\Gamma(m)\\Gamma(n)}{\\Gamma(m+n)}$$).
    - Ensure backslashes are properly escaped in your JSON output (e.g., use double backslashes like \\\\int or \\\\frac in the JSON string so that it remains valid JSON).
    - This is critical for making sure that all mathematical expressions are perfectly readable on the screen and in the exported PDF question paper.
    `;

    let response;
    const modelsToTry = ["gemini-2.0-flash", "gemini-2.5-flash"];
    let lastError = null;

    for (const modelName of modelsToTry) {
      try {
        console.log(`Attempting generation with model: ${modelName}`);
        response = await ai.models.generateContent({
          model: modelName,
          contents: [
            promptText,
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
        if (response) {
          console.log(`Generation succeeded with model: ${modelName}`);
          break;
        }
      } catch (err: any) {
        console.warn(`Model ${modelName} failed:`, err.message || err);
        lastError = err;
      }
    }

    if (!response) {
      console.error("All generation models failed. Last error:", lastError);
      throw lastError || new Error("All generation models failed");
    }

    const aiResponseText = response.text || "{}";
    const generatedData = JSON.parse(aiResponseText);

    // Save to Database
    const document = await prisma.document.create({
      data: {
        fileName: file.name,
        fileSize: file.size,
        content: "Content parsed natively by Gemini API",
      }
    });

    const quiz = await prisma.quiz.create({
      data: {
        title: generatedData.title || "Generated Quiz",
        documentId: document.id,
        questions: {
          create: generatedData.questions.map((q: any) => ({
            type: q.type || "MULTIPLE_CHOICE",
            questionText: q.questionText,
            options: JSON.stringify(q.options || []),
            correctAnswer: q.correctAnswer,
            explanation: q.explanation
          }))
        },
        flashcards: {
          create: generatedData.flashcards.map((f: any) => ({
            front: f.front,
            back: f.back
          }))
        }
      },
      include: {
        questions: true,
        flashcards: true
      }
    });

    return NextResponse.json({ success: true, quiz });
  } catch (error: any) {
    console.error("Upload/Processing Error:", error);
    return NextResponse.json({ error: error.message || "Failed to process file" }, { status: 500 });
  }
}
