'use client';

import { useMemo, useState } from 'react';
import {
    EditorRoot,
    EditorContent,
    type JSONContent,
    EditorCommand,
    EditorCommandEmpty,
    EditorCommandList,
    EditorCommandItem,
    createImageUpload,
    handleImagePaste,
    handleImageDrop,
    UpdatedImage,
    UploadImagesPlugin
} from 'novel';
import { extensions as defaultExtensions, createSuggestionItemsWithUpload } from './extensions';
import { ImageResizeExtension } from './extensions/ImageResizeExtension';
import { createClient } from '@/lib/supabase/client';

interface BlogEditorProps {
    content?: JSONContent;
    onChange?: (content: JSONContent) => void;
    uploadFn?: (file: File) => Promise<string>;
    placeholder?: string;
}

export default function BlogEditor({
    content,
    onChange,
    uploadFn,
    placeholder = '내용을 입력하세요... (슬래시 "/" 를 눌러 메뉴 확인)',
}: BlogEditorProps) {
    const supabase = createClient();

    // 이미지 업로드 함수
    const imageUploadFn = useMemo(() => {
        return createImageUpload({
            validateFn: (file: File) => {
                if (!file.type.startsWith('image/')) {
                    alert('이미지 파일만 업로드할 수 있습니다.');
                    return false;
                }
                if (file.size > 50 * 1024 * 1024) {
                    alert('파일 크기는 50MB를 초과할 수 없습니다.');
                    return false;
                }
                return true;
            },
            onUpload: async (file: File): Promise<string> => {
                if (uploadFn) return uploadFn(file);

                const fileExt = file.name.split('.').pop();
                const fileName = `${Math.random()}.${fileExt}`;
                const filePath = `blog-images/${fileName}`;

                const { data, error } = await supabase.storage.from('blog-images').upload(filePath, file);
                if (error) throw error;

                const { data: { publicUrl } } = supabase.storage.from('blog-images').getPublicUrl(filePath);
                return publicUrl;
            },
        });
    }, [uploadFn, supabase]);

    // 이미지 확장 설정 (Novel.sh UpdatedImage 기반)
    const imageExtension = useMemo(() => {
        return UpdatedImage.extend({
            addProseMirrorPlugins() {
                return [
                    UploadImagesPlugin({
                        imageClass: 'opacity-40 rounded-lg border border-slate-300',
                    }),
                ];
            },
        }).configure({
            allowBase64: false,
            HTMLAttributes: {
                class: 'rounded-lg border border-slate-300',
                style: 'max-width: 100%; height: auto; max-height: 600px; object-fit: contain; cursor: pointer;',
            },
            inline: false,
        });
    }, []);

    // 에디터 확장 목록
    const extensions = useMemo(() => {
        return [...defaultExtensions, imageExtension, ImageResizeExtension];
    }, [imageExtension]);

    // 슬래시 메뉴 아이템
    const editorSuggestionItems = useMemo(() => {
        return createSuggestionItemsWithUpload(async (file) => {
            // 내부 명령용 업로드
            return imageUploadFn(file);
        });
    }, [imageUploadFn]);

    return (
        <EditorRoot>
            <EditorContent
                initialContent={content}
                extensions={extensions}
                onUpdate={({ editor }) => {
                    onChange?.(editor.getJSON());
                }}
                editorProps={{
                    handlePaste: (view, event) => handleImagePaste(view, event, imageUploadFn),
                    handleDrop: (view, event, slice, moved) => handleImageDrop(view, event, moved, imageUploadFn),
                    attributes: {
                        class: 'prose prose-invert prose-headings:font-title font-default focus:outline-none max-w-full',
                    },
                }}
                slotAfter={
                    <EditorCommand className="z-50 h-auto max-h-[330px] w-72 overflow-y-auto rounded-md border border-slate-700 bg-slate-900 px-1 py-2 shadow-md">
                        <EditorCommandEmpty className="px-2 text-sm text-slate-400">결과 없음</EditorCommandEmpty>
                        <EditorCommandList>
                            {editorSuggestionItems.map((item: any) => (
                                <EditorCommandItem
                                    value={item.title}
                                    onCommand={(val: any) => {
                                        item.command(val);
                                    }}
                                    className="flex w-full items-center space-x-2 rounded-md px-2 py-1 text-left text-sm hover:bg-slate-800 aria-selected:bg-slate-800"
                                    key={item.title}>
                                    <div className="flex h-10 w-10 items-center justify-center rounded-md border border-slate-700 bg-slate-800">
                                        {item.icon}
                                    </div>
                                    <div>
                                        <p className="font-medium text-slate-200">{item.title}</p>
                                        <p className="text-xs text-slate-400">{item.description}</p>
                                    </div>
                                </EditorCommandItem>
                            ))}
                        </EditorCommandList>
                    </EditorCommand>
                }
            >
            </EditorContent>
        </EditorRoot>
    );
}
