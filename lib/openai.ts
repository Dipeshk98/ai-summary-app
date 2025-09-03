import { OpenAI } from 'openai';
import { SUMMARY_SYSTEM_PROMPT } from '@/utils/prompts';

let openai: OpenAI | null = null;

// Only initialize if API key is available
if (process.env.OPENAI_API_KEY) {
    openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
    });
}

export async function generateSummaryFromOpenAI(pdfText: string) {
    if (!openai) {
        throw new Error('OpenAI API key not configured');
    }
    
    try {
        const completion = await openai.chat.completions.create({
            model: 'gpt-4',
            messages: [
                { role: 'system', content: SUMMARY_SYSTEM_PROMPT },
                {
                    role: 'user',
                    content: `Transform this document into an engaging, easy-to-read summary with contextually relevant emojis and proper markdown formatting:\n\n${pdfText}`,
                },
            ],
            temperature: 0.7,
            max_tokens: 1500,
        });

        return completion.choices[0].message.content;
    } catch (error: any) {
        if (error.status === 429) {
            throw new Error('RATE_LIMIT_EXCEEDED');
        }
        throw error;
    }
}