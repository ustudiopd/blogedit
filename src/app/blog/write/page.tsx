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

    // 실시간 저장 (GitHub API 연동)
    const { saveStatus, lastSaved, triggerSave } = useAutoSave({
        docId: slug || 'new-draft',
        debounceMs: 5000, // 너무 빈번한 커밋 방지를 위해 시간을 늘림
        onSave: async (savedContent, savedTitle) => {
            if (!slug || !savedTitle) return;

            try {
                await fetch('/api/blog/save', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        title: savedTitle,
                        content: savedContent,
                        slug: slug,
                    }),
                });
            } catch (error) {
                console.error('Auto-save error:', error);
            }
        },
    });

    const handlePublish = async () => {
        if (!title || !content || !slug) {
            alert('제목, 내용, 슬러그를 모두 입력해주세요.');
            return;
        }

        try {
            const response = await fetch('/api/blog/save', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title, content, slug }),
            });
            if (response.ok) {
                alert('GitHub에 성공적으로 발행되었습니다! Netlify에서 다시 빌드될 때까지 1~2분 정도 기다려주세요.');
            } else {
                throw new Error('저장 실패');
            }
        } catch (error) {
            alert('발행 중 오류가 발생했습니다.');
        }
    };

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
                        <button
                            onClick={handlePublish}
                            className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-md transition-colors font-medium">
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
