import PostViewer from '@/components/blog/PostViewer';
import fs from 'fs/promises';
import path from 'path';
import { notFound } from 'next/navigation';

export default async function BlogDetailPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;

    let postData;
    try {
        const filePath = path.join(process.cwd(), 'content', 'posts', `${slug}.json`);
        const fileContent = await fs.readFile(filePath, 'utf8');
        postData = JSON.parse(fileContent);
    } catch (error) {
        console.error('Error loading post:', error);
        return notFound();
    }

    return (
        <div className="min-h-screen bg-slate-950 text-slate-50 p-4 md:p-8">
            <div className="max-w-4xl mx-auto space-y-8">
                <header className="space-y-2 border-b border-slate-800 pb-8">
                    <h1 className="text-4xl md:text-5xl font-bold font-title">{postData.title}</h1>
                    <p className="text-slate-400 text-sm">
                        마지막 업데이트: {new Date(postData.updatedAt).toLocaleString()}
                    </p>
                </header>
                <PostViewer initialContent={postData.content} />
            </div>
        </div>
    );
}
