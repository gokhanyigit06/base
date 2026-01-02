import { NextResponse } from 'next/server';
import { GoogleAuth } from 'google-auth-library';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { brandName, topic, type } = body;

        // 1. Authenticate with Google
        // We use the JSON key from .env.local directly
        const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON || '{}');
        const auth = new GoogleAuth({
            credentials,
            scopes: ['https://www.googleapis.com/auth/cloud-platform'],
        });

        const client = await auth.getClient();
        const accessToken = await client.getAccessToken();
        const token = accessToken.token;
        const projectId = credentials.project_id;
        const location = 'us-central1'; // Vertex AI region
        const modelId = 'gemini-1.5-flash-001'; // Fast and capable model

        // 2. Construct the Prompt
        const promptText = `
        Act as a professional Social Media Manager for the brand "${brandName}".
        Create a high-quality Instagram ${type || 'post'} about: "${topic}".
        
        Return the response in strictly valid JSON format with NO markdown formatting (no backticks).
        The JSON object must have these keys:
        - "caption": A creative, engaging caption with hashtags and emojis. Turkish language.
        - "image_prompt": A highly detailed AI image generation prompt (in English) to create a visual for this post.
        - "recommended_time": A future ISO date string (e.g. 2024-06-20T18:00:00Z) representing the best time to post this next week.
        `;

        // 3. Call Vertex AI API
        const url = `https://us-central1-aiplatform.googleapis.com/v1/projects/${projectId}/locations/${location}/publishers/google/models/${modelId}:generateContent`;

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: promptText }]
                }],
                generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 1024,
                    responseMimeType: "application/json" // Force JSON output
                }
            })
        });

        const data = await response.json();

        if (!response.ok) {
            console.error('Vertex AI Error:', data);
            throw new Error(data.error?.message || 'Vertex AI request failed');
        }

        // 4. Parse the Response
        const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!aiText) {
            throw new Error('No content generated');
        }

        // Clean up markdown if Gemini adds it despite instructions
        const cleanJson = aiText.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsedContent = JSON.parse(cleanJson);

        return NextResponse.json(parsedContent);

    } catch (error: any) {
        console.error('AI Generation Error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to generate content' },
            { status: 500 }
        );
    }
}
