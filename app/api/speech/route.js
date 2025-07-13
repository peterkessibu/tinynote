import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash",
});

const generationConfig = {
    temperature: 0.7,
    topP: 0.95,
    topK: 64,
    maxOutputTokens: 8192,
    responseMimeType: "text/plain",
};

export async function POST(request) {
    try {
        const { transcription, confidence } = await request.json();

        if (!transcription) {
            return NextResponse.json(
                { error: "Transcription is required" },
                { status: 400 },
            );
        }

        const prompt = `You are an expert editor specializing in converting speech transcriptions into well-structured, polished notes. 

    Original Speech Transcription:
    -------------------
    ${transcription}
    -------------------
    
    Transcription Confidence Level: ${Math.round((confidence || 0) * 100)}%
    
    Your task is to transform this raw speech transcription into a polished, professional note. Please:
    
    1. **Fix Speech Artifacts**: Remove filler words (um, uh, like, you know), false starts, repetitions, and conversational redundancies
    2. **Correct Grammar**: Fix grammatical errors, incomplete sentences, and run-on sentences that are common in speech
    3. **Structure Content**: Organize the content with proper paragraphs, bullet points, or numbered lists where appropriate
    4. **Enhance Clarity**: Improve word choice and sentence flow while preserving the original meaning and tone
    5. **Add Formatting**: Use markdown formatting (headers, emphasis, lists) to make the content more readable
    6. **Maintain Voice**: Keep the personal voice and style of the speaker while making it more professional
    7. **Preserve Intent**: Ensure all key points, ideas, and context from the original transcription are maintained
    
    Return a JSON response with:
    - "polishedContent": The refined transcription with proper markdown formatting, grammar corrections, and improved structure
    - "suggestedTitle": A concise, descriptive title (5-8 words) that captures the main topic or purpose
    - "suggestedTags": Up to 5 relevant tags as a comma-separated string based on the content themes
    
    Special Instructions:
    - If the transcription seems incomplete or unclear due to low confidence, indicate this in the polished content
    - If the content appears to be a brainstorming session, organize it as bullet points or numbered lists
    - If it's a meeting or call, structure it with clear sections (agenda, discussion points, action items)
    - If it's a personal note or reminder, keep it conversational but well-organized
    - Always use proper markdown formatting for better readability
    - Remove any false starts or repeated phrases that don't add value
    
    Focus on creating content that is professional, clear, and well-structured while maintaining the original speaker's intent and key information.
    
    Provide a valid JSON response with proper markdown formatting in the polishedContent field.`;

        const chatSession = model.startChat({
            generationConfig,
            history: [
                {
                    role: "user",
                    parts: [{ text: prompt }],
                },
            ],
        });

        const result = await chatSession.sendMessage("Process this transcription.");

        // Ensure Gemini API returned a response
        if (!result || !result.response) {
            console.error("Gemini API did not return a valid response");
            return NextResponse.json(
                { error: "AI Service Unavailable" },
                { status: 503 },
            );
        }

        const textResponse = result.response.text();
        console.log("Raw Gemini Response:", textResponse);

        let analysis;
        try {
            // Try to parse the JSON response
            analysis = JSON.parse(textResponse);

            // Ensure all required fields exist
            if (!analysis.polishedContent) analysis.polishedContent = transcription;
            if (!analysis.suggestedTitle) analysis.suggestedTitle = "Voice Note";
            if (!analysis.suggestedTags) analysis.suggestedTags = "voice, note";
        } catch (error) {
            console.error("JSON Parsing Error:", error, textResponse);

            // If JSON parsing fails, try to extract data using regex
            try {
                const polishedContentMatch = textResponse.match(
                    /"polishedContent"\s*:\s*"([^"]*(?:\\.[^"]*)*)"/s,
                );
                const suggestedTitleMatch = textResponse.match(
                    /"suggestedTitle"\s*:\s*"([^"]*)"/,
                );
                const suggestedTagsMatch = textResponse.match(
                    /"suggestedTags"\s*:\s*"([^"]*)"/,
                );

                analysis = {
                    polishedContent: polishedContentMatch
                        ? polishedContentMatch[1]
                            .replace(/\\n/g, "\n")
                            .replace(/\\"/g, '"')
                            .replace(/\\\\/g, "\\")
                        : transcription,
                    suggestedTitle: suggestedTitleMatch
                        ? suggestedTitleMatch[1]
                        : "Voice Note",
                    suggestedTags: suggestedTagsMatch
                        ? suggestedTagsMatch[1]
                        : "voice, note",
                };
            } catch (regexError) {
                console.error("Regex parsing failed:", regexError);
                return NextResponse.json({
                    polishedContent: transcription,
                    suggestedTitle: "Voice Note",
                    suggestedTags: "voice, note",
                    error: "Could not process AI response - using original transcription",
                });
            }
        }

        return NextResponse.json(analysis);
    } catch (error) {
        console.error("Server Error:", error);
        return NextResponse.json(
            {
                polishedContent: transcription || "",
                suggestedTitle: "Voice Note",
                suggestedTags: "voice, note",
                error: "Internal Server Error",
            },
            { status: 500 },
        );
    }
} 