import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

const model = genAI.getGenerativeModel({
  model: "gemini-2.0-flash",
});

const generationConfig = {
  temperature: 1,
  topP: 0.95,
  topK: 64,
  maxOutputTokens: 8192,
  responseMimeType: "text/plain",
};

export async function POST(request) {
  try {
    const { input, title, tags } = await request.json();
    if (!input) {
      return NextResponse.json(
        { error: "Content is required" },
        { status: 400 },
      );
    }

    const prompt = `Analyze the following note content:
  -------------------
  ${input}
  -------------------
  ${title ? "Existing title: " + title : "No title provided."}
  ${tags ? "Existing tags: " + tags : "No tags provided."}
  
  Return a JSON with:
   - "structuredContent": A refined version of the content WITH MARKDOWN FORMATTING (use headings, lists, emphasis, etc. where appropriate).
   - "suggestedTags": Not more than 5 relevant tags as a comma-separated string that best represent the content.
   - "suggestedTitle": A concise title that accurately reflects the content.
   - "shouldUpdateTitle": true if the existing title doesn't accurately reflect the content (or if no title exists), false otherwise.
   - "shouldUpdateTags": true if the existing tags aren't relevant or comprehensive (or if no tags exist), false otherwise.

   Note: 
   - Update content based on currency, relevance, and coherence. DO NOT REPEAT THE OLD CONTENT IF UPDATED
   - Correct any grammatical errors, and ensure the content is concise and clear. DO NOT INDICATE THAT THERE ARE CORRECTIONS MADE
   - For title and tags, analyze if they properly represent the content - only mark shouldUpdate as true if they clearly don't match
   - Be somewhat conservative - only suggest changes if the existing title/tags are clearly incorrect or missing
  
  Ensure a valid JSON response with proper markdown formatting.`;

    const chatSession = model.startChat({
      generationConfig,
      history: [
        {
          role: "user",
          parts: [{ text: prompt }],
        },
      ],
    });

    const result = await chatSession.sendMessage("Generate your analysis.");

    // Ensure Gemini API returned a response
    if (!result || !result.response) {
      console.error("Gemini API did not return a valid response");
      return NextResponse.json(
        { error: "AI Service Unavailable" },
        { status: 503 },
      );
    }

    const textResponse = result.response.text();
    console.log("Raw Gemini Response:", textResponse); // Debugging

    let analysis;
    try {
      // Try to parse the JSON response
      analysis = JSON.parse(textResponse);

      // Ensure all required fields exist
      if (!analysis.structuredContent) analysis.structuredContent = input;
      if (!analysis.suggestedTags) analysis.suggestedTags = tags || "";
      if (!analysis.suggestedTitle) analysis.suggestedTitle = title || "";
      if (analysis.shouldUpdateTitle === undefined)
        analysis.shouldUpdateTitle = !title;
      if (analysis.shouldUpdateTags === undefined)
        analysis.shouldUpdateTags = !tags;
    } catch (error) {
      console.error("JSON Parsing Error:", error, textResponse);

      // If JSON parsing fails, try to extract data using regex
      try {
        const structuredContentMatch = textResponse.match(
          /"structuredContent"\s*:\s*"([^"]*)"/,
        );
        const suggestedTagsMatch = textResponse.match(
          /"suggestedTags"\s*:\s*"([^"]*)"/,
        );
        const suggestedTitleMatch = textResponse.match(
          /"suggestedTitle"\s*:\s*"([^"]*)"/,
        );
        const shouldUpdateTitleMatch = textResponse.match(
          /"shouldUpdateTitle"\s*:\s*(true|false)/,
        );
        const shouldUpdateTagsMatch = textResponse.match(
          /"shouldUpdateTags"\s*:\s*(true|false)/,
        );

        analysis = {
          structuredContent: structuredContentMatch
            ? structuredContentMatch[1]
                .replace(/\\n/g, "\n")
                .replace(/\\"/g, '"')
            : input,
          suggestedTags: suggestedTagsMatch
            ? suggestedTagsMatch[1]
            : tags || "",
          suggestedTitle: suggestedTitleMatch
            ? suggestedTitleMatch[1]
            : title || "",
          shouldUpdateTitle: shouldUpdateTitleMatch
            ? shouldUpdateTitleMatch[1] === "true"
            : !title,
          shouldUpdateTags: shouldUpdateTagsMatch
            ? shouldUpdateTagsMatch[1] === "true"
            : !tags,
        };
      } catch (error) {
        console.log(error);
        return NextResponse.json({
          structuredContent: input,
          suggestedTags: tags || "",
          suggestedTitle: title || "",
          shouldUpdateTitle: !title,
          shouldUpdateTags: !tags,
          error: "Could not process AI response",
        });
      }
    }

    return NextResponse.json(analysis);
  } catch (error) {
    console.error("Server Error:", error);
    return NextResponse.json(
      {
        structuredContent: input || "",
        suggestedTags: "",
        suggestedTitle: "",
        shouldUpdateTitle: false,
        shouldUpdateTags: false,
        error: "Internal Server Error",
      },
      { status: 500 },
    );
  }
}
