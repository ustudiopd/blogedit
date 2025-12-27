import { NextRequest, NextResponse } from 'next/server';
import { google } from '@ai-sdk/google';
import { generateText } from 'ai';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const title = body.title;

        if (!title || typeof title !== 'string' || title.trim().length === 0) {
            return NextResponse.json({ error: '제목이 필요합니다.' }, { status: 400 });
        }

        const apiKey = process.env.GOOGLE_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;
        if (!apiKey) {
            const fallbackSlug = title
                .toLowerCase()
                .replace(/[^a-z0-9\s-]/g, '')
                .replace(/\s+/g, '-')
                .replace(/-+/g, '-')
                .replace(/^-|-$/g, '')
                .trim()
                .substring(0, 50);
            return NextResponse.json({ slug: fallbackSlug || 'untitled' });
        }

        const prompt = `Generate a URL-friendly English slug for the following blog post title.
- If the title is in Korean, translate it to English first.
- Use only a-z, 0-9, and hyphens.
- Max 50 characters.
Output ONLY the slug.
Title: "${title}"`;

        const { createGoogleGenerativeAI } = await import('@ai-sdk/google');
        const googleProvider = createGoogleGenerativeAI({
            apiKey: apiKey,
        });

        const { text: slug } = await generateText({
            model: googleProvider('gemini-2.0-flash-exp'),
            prompt,
            maxTokens: 50,
        });

        const cleanedSlug = slug
            .trim()
            .toLowerCase()
            .replace(/[^a-z0-9-]/g, '')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '')
            .substring(0, 50);

        return NextResponse.json({ slug: cleanedSlug || 'untitled' });
    } catch (error: any) {
        console.error('Error generating slug:', error);
        return NextResponse.json({ error: '슬러그 생성 중 오류가 발생했습니다.' }, { status: 500 });
    }
}
