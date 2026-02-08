"use server";

import { GoogleAuth } from 'google-auth-library';
import fs from 'fs/promises';
import path from 'path';

const SERVICE_ACCOUNT_JSON = process.env.GOOGLE_SERVICE_ACCOUNT_JSON
    ? JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON)
    : {};

interface ImageGenerationParams {
    prompt: string;
    negativePrompt?: string;
    aspectRatio?: string;
    style?: string;
    refImage?: string | null;
}

interface VideoGenerationParams {
    prompt: string;
    duration?: number;
    fps?: number;
    aspectRatio?: string;
}

// --- IMAGE GENERATION (Imagen 3) ---
export async function generateImage(params: ImageGenerationParams) {
    console.log("🚀 Imagen 3 Image Gen Start...");

    try {
        const auth = new GoogleAuth({
            credentials: SERVICE_ACCOUNT_JSON,
            scopes: ['https://www.googleapis.com/auth/cloud-platform'],
        });

        const client = await auth.getClient();
        const accessTokenResponse = await client.getAccessToken();
        const accessToken = accessTokenResponse.token;
        if (!accessToken) throw new Error("Authentication Failed");

        const projectId = SERVICE_ACCOUNT_JSON.project_id;
        const location = "us-central1";
        const url = `https://${location}-aiplatform.googleapis.com/v1/projects/${projectId}/locations/${location}/publishers/google/models/imagegeneration@006:predict`;

        const validAspectRatio = params.aspectRatio || "16:9";
        const enhancedPrompt = `${params.style === 'photorealistic' ? 'Photorealistic, cinematic lighting, 8k, highly detailed' : params.style} style. ${params.prompt}`;

        let instanceData: any = { prompt: enhancedPrompt };

        if (params.refImage) {
            const cleanBase64 = params.refImage.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, "");
            instanceData.image = { bytesBase64Encoded: cleanBase64 };
        }

        const requestBody = {
            instances: [instanceData],
            parameters: {
                sampleCount: 1,
                aspectRatio: validAspectRatio,
                negativePrompt: params.negativePrompt || "",
            }
        };

        const response = await fetch(url, {
            method: "POST",
            headers: { "Authorization": `Bearer ${accessToken}`, "Content-Type": "application/json; charset=utf-8" },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Vertex AI API Error: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        const predictions = data.predictions;
        if (!predictions || predictions.length === 0) throw new Error("No image generated.");

        const base64Image = predictions[0].bytesBase64Encoded;

        // Yerel dosya sistemine kaydet (public/uploads)
        const buffer = Buffer.from(base64Image, 'base64');
        const fileName = `ai-${Date.now()}.png`;
        const uploadDir = path.join(process.cwd(), 'public', 'uploads');

        // Klasör yoksa oluştur
        await fs.mkdir(uploadDir, { recursive: true });

        const filePath = path.join(uploadDir, fileName);
        await fs.writeFile(filePath, buffer);

        // Kamu erişim URL'sini döndür
        return `/uploads/${fileName}`;

    } catch (error: any) {
        console.error("❌ Image Generation Failed:", error);
        throw new Error(error.message || "Something went wrong.");
    }
}

// --- VIDEO GENERATION (Imagen 2 / Video AI) ---
export async function generateVideo(params: VideoGenerationParams) {
    console.log("🎥 Video Generation Start...", params);

    await new Promise(resolve => setTimeout(resolve, 4000));

    const mockVideos = [
        "https://videos.pexels.com/video-files/3129671/3129671-uhd_2560_1440_30fps.mp4",
        "https://videos.pexels.com/video-files/856882/856882-hd_1920_1080_30fps.mp4",
        "https://videos.pexels.com/video-files/3130284/3130284-hd_1920_1080_30fps.mp4"
    ];

    return mockVideos[Math.floor(Math.random() * mockVideos.length)];
}
