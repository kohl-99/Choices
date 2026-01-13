import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';

// Initialize with a placeholder or process.env (it might be empty initially)
// We'll handle the missing key error gracefully in the response
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(req: Request) {
    try {
        const apiKey = process.env.GEMINI_API_KEY;
        console.log('API Key present:', !!apiKey); // Debug log
        if (!apiKey) {
            return NextResponse.json(
                { error: 'Gemini API Key not configured. Please add GEMINI_API_KEY to .env.local' },
                { status: 500 }
            );
        }

        const body = await req.json();
        const { messages, systemPrompt } = body;

        // "messages" from the frontend might be in a different format.
        // Google Generative AI expects history in specific format or we can just append to prompt for simple MVP.
        // For MVP 1-on-1 chat, using the `chat` method is best.

        // Convert simple message list to Gemini history format if needed
        // But for simplicity in this MVP, let's just construct a strong prompt with history
        // Or better, use the chatSession.

        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

        // Transform frontend messages to Gemini format
        // Frontend sends: { role: 'user' | 'assistant', content: string }[]
        // Gemini expects: { role: 'user' | 'model', parts: [{ text: string }] }[]
        const history = messages.slice(0, -1).map((m: { role: string, content: string }) => ({
            role: m.role === 'user' ? 'user' : 'model',
            parts: [{ text: m.content }],
        }));

        const lastMessage = messages[messages.length - 1].content;

        const chat = model.startChat({
            history: [
                {
                    role: 'user',
                    parts: [{ text: `SYSTEM INSTRUCTION: ${systemPrompt}` }]
                },
                {
                    role: 'model',
                    parts: [{ text: "Understood. I will act as this persona." }]
                },
                ...history
            ],
            generationConfig: {
                maxOutputTokens: 500,
            },
        });

        const result = await chat.sendMessage(lastMessage);
        const response = result.response;
        const text = response.text();

        return NextResponse.json({ role: 'assistant', content: text });

    } catch (error: unknown) {
        console.error('Gemini API Error:', error);
        return NextResponse.json(
            { error: 'Failed to generate response', details: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}
