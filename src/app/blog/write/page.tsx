'use client';

import { useState, useEffect } from 'react';
import BlogEditor from '@/components/editor/BlogEditor';
import { useAutoSave } from '@/lib/hooks/useAutoSave';
import type { JSONContent } from '@tiptap/core';

export default function BlogWritePage() {
    const [title, setTitle] = useState('');
    const [slug, setSlug] = useState('');
    const [content, setContent] = useState<JSONContent | undefined>();
    const [generatingSlug, setGeneratingSlug] = useState(false);

    // 실시간 저장 (초안 저장용 - 여기서는 콘솔 출력으로 대체)
    const { saveStatus, lastSaved, triggerSave } = useAutoSave({
        docId: 'new-draft',
        debounceMs: 2000,
        onSave: async (savedContent, savedTitle) => {
            console.log('Saving to server...', { savedTitle, savedContent });
            // 실제 API 호출 로직은 여기에 들어감
        },
    });

    // 제목 변경 시 슬러그 자동 생성
    useEffect(() => {
        if (!title || title.trim().length === 0) return;

        const timeoutId = setTimeout(async () => {
            if (slug && slug.trim().length > 0) return;

            setGeneratingSlug(true);
            try {
                const response = await fetch('/api/blog/generate-slug', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ title }),
                });
                const data = await response.json();
                if (data.slug) setSlug(data.slug);
            } catch (error) {
                console.error('Error generating slug:', error);
            } finally {
                setGeneratingSlug(false);
            }
        }, 1000);

        return () => clearTimeout(timeoutId);
    }, [title, slug]);

    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newTitle = e.target.value;
        setTitle(newTitle);
        if (content) triggerSave(content, newTitle);
    };

    const handleContentChange = (newContent: JSONContent) => {
        setContent(newContent);
        triggerSave(newContent, title);
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-50 p-4 md:p-8">
            <div className="max-w-4xl mx-auto space-y-6">
                <header className="flex justify-between items-center border-b border-slate-800 pb-4">
                    <h1 className="text-2xl font-bold">블로그 작성</h1>
                    <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-2">
                            {saveStatus === 'saving' && <span className="text-yellow-500 animate-pulse">저장 중...</span>}
                            {saveStatus === 'saved' && lastSaved && (
                                <span className="text-slate-400">
                                    마지막 저장: {lastSaved.toLocaleTimeString()}
                                </span>
                            )}
                            {saveStatus === 'offline' && <span className="text-orange-500">오프라인</span>}
                            {saveStatus === 'error' && <span className="text-red-500">저장 실패</span>}
                        </div>
                        <button className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-md transition-colors font-medium">
                            발행하기
                        </button>
                    </div>
                </header>

                <section className="space-y-4">
                    <input
                        type="text"
                        placeholder="제목을 입력하세요"
                        value={title}
                        onChange={handleTitleChange}
                        className="w-full bg-transparent text-4xl font-bold focus:outline-none placeholder:text-slate-700"
                    />
                    <div className="flex items-center gap-2 text-sm text-slate-400">
                        <span className="font-mono">URLSlug:</span>
                        <input
                            type="text"
                            placeholder="url-slug-appears-here"
                            value={slug}
                            onChange={(e) => setSlug(e.target.value)}
                            className="bg-slate-900 border border-slate-800 rounded px-2 py-1 flex-1 focus:outline-none focus:border-slate-600"
                        />
                        {generatingSlug && <span className="animate-spin truncate">⌛</span>}
                    </div>
                </section>

                <section className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden min-h-[600px]">
                    <BlogEditor content={content} onChange={handleContentChange} />
                </section>
            </div>
        </div>
    );
}
