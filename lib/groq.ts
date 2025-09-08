import Groq from "groq-sdk";
import { SUMMARY_SYSTEM_PROMPT } from "@/utils/prompts";

// Initialize Groq API
const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY || "",
});

export async function generateSummaryFromGroq(pdfText: string) {
    try {
        const completion = await groq.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: SUMMARY_SYSTEM_PROMPT
                },
                {
                    role: "user",
                    content: `Transform this document into an engaging, easy-to-read summary with contextually relevant emojis and proper markdown formatting:\n\n${pdfText}`
                }
            ],
            model: "llama-3.1-8b-instant",
            temperature: 0.7,
            max_tokens: 1500,
        });

        if (!completion.choices[0]?.message?.content) {
            throw new Error("Empty response from Groq API");
        }

        return completion.choices[0].message.content;
    } catch (error: any) {
        console.error("Groq API Error:", error);
        throw error;
    }
}
