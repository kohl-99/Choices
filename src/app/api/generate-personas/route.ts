import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';
import { Person, ProductSpec, Region } from '@/lib/types';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(req: Request) {
  try {
    console.log('[API] Persona generation request received');
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error('[API] No API key found');
      return NextResponse.json(
        { error: 'Gemini API Key not configured. Please add GEMINI_API_KEY to .env.local' },
        { status: 500 }
      );
    }

    const body = await req.json();
    console.log('[API] Request body:', JSON.stringify(body, null, 2));
    const { productSpec, count, region }: { productSpec: ProductSpec; count: number; region: Region } = body;

    // Validate productSpec
    if (!productSpec || !productSpec.name) {
      console.error('[API] Invalid productSpec:', productSpec);
      return NextResponse.json(
        { error: 'Invalid product specification. Product name is required.' },
        { status: 400 }
      );
    }

    console.log('[API] Product:', productSpec.name, 'Count:', count, 'Region:', region);

    // Construct a detailed prompt for persona generation
    const prompt = `You are a user research expert. Generate ${count} realistic user personas for the following product context:

Product Name: ${productSpec.name}
Value Proposition: ${productSpec.prop}
Price: ${productSpec.price}
Competitor/Alternative: ${productSpec.competitor || 'N/A'}
Target Region: ${region}

For each persona, create a JSON object with the following structure:
{
  "id": "unique_id",
  "name": "Full Name",
  "demographics": {
    "age": number (18-75),
    "gender": "Male" | "Female" | "Non-binary",
    "race": string,
    "education": "High School Diploma" | "Bachelor's Degree" | "Master's Degree" | etc,
    "religion": string,
    "hometownType": "Urban" | "Suburban" | "Rural",
    "incomeLevel": "Low" | "Middle" | "High",
    "occupation": string
  },
  "politics": "Liberal" | "Conservative" | "Moderate" | etc,
  "personality": {
    "openness": 0-1,
    "conscientiousness": 0-1,
    "extraversion": 0-1,
    "agreeableness": 0-1,
    "neuroticism": 0-1
  },
  "biases": {
    "confirmationBias": 0-1,
    "statusQuoBias": 0-1,
    "authorityBias": 0-1,
    "negativityBias": 0-1
  },
  "background": "2-3 sentence backstory relevant to this product",
  "goals": "What they want to achieve (1 sentence)",
  "specificBarriers": {
    "priceSensitivity": "Detailed explanation of their price sensitivity in context of ${productSpec.price}",
    "loyalty": "Explanation of their loyalty to ${productSpec.competitor || 'existing solutions'}",
    "skepticism": "Their skepticism level toward new products like ${productSpec.name}"
  }
}

Create diverse personas with varying levels of price sensitivity, brand loyalty, and innovation adoption. Make them realistic and grounded in the ${region} region's demographics and culture.

Return ONLY a valid JSON array of ${count} persona objects. No markdown, no explanation, just the JSON array.`;

    console.log('[API] Calling Gemini API...');
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      generationConfig: {
        temperature: 0.9,
        maxOutputTokens: 8000,
      }
    });

    const result = await model.generateContent(prompt);
    console.log('[API] Gemini response received');
    const response = result.response;
    let text = response.text();
    console.log('[API] Raw response text:', text.substring(0, 500));

    // Clean up markdown code blocks if present
    text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    // Parse the JSON
    console.log('[API] Attempting to parse JSON...');
    const people: Person[] = JSON.parse(text);
    console.log('[API] Successfully parsed', people.length, 'personas');

    // Add avatarUrl to each person (using DiceBear API)
    const enrichedPeople = people.map((person, index) => ({
      ...person,
      id: `llm_${Date.now()}_${index}`,
      avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(person.name)}`
    }));

    console.log('[API] Returning enriched personas');
    return NextResponse.json({ people: enrichedPeople });

  } catch (error: unknown) {
    console.error('[API] Persona Generation Error:', error);
    console.error('[API] Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    return NextResponse.json(
      {
        error: 'Failed to generate personas',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
