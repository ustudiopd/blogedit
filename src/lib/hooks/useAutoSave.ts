import { useState, useEffect, useRef, useCallback } from 'react';
import type { JSONContent } from '@tiptap/core';

export type SaveStatus = 'saved' | 'saving' | 'error' | 'offline';

interface UseAutoSaveOptions {
    docId: string;
    debounceMs?: number;
    onSave?: (content: JSONContent, title?: string) => Promise<void>;
}

export function useAutoSave({
    docId,
    debounceMs = 2000,
    onSave,
}: UseAutoSaveOptions) {
    const [saveStatus, setSaveStatus] = useState<SaveStatus>('saved');
    const [lastSaved, setLastSaved] = useState<Date | null>(null);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const isOnlineRef = useRef(typeof window !== 'undefined' ? navigator.onLine : true);

    const getBackupKey = useCallback(
        (type: 'content' | 'title') => `blog-post-${docId}-${type}`,
        [docId]
    );

    useEffect(() => {
        const handleOnline = () => {
            isOnlineRef.current = true;
            setSaveStatus((prev) => (prev === 'offline' ? 'saved' : prev));
        };
        const handleOffline = () => {
            isOnlineRef.current = false;
            setSaveStatus('offline');
        };

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);
        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    const backupToLocal = useCallback(
        (content: JSONContent, title?: string) => {
            try {
                localStorage.setItem(getBackupKey('content'), JSON.stringify(content));
                if (title) localStorage.setItem(getBackupKey('title'), title);
            } catch (error) {
                console.error('Error backing up to localStorage:', error);
            }
        },
        [getBackupKey]
    );

    const restoreFromLocal = useCallback((): { content: JSONContent | null; title: string | null } => {
        try {
            const contentStr = localStorage.getItem(getBackupKey('content'));
            const title = localStorage.getItem(getBackupKey('title'));
            return {
                content: contentStr ? JSON.parse(contentStr) : null,
                title,
            };
        } catch (error) {
            console.error('Error restoring from localStorage:', error);
            return { content: null, title: null };
        }
    }, [getBackupKey]);

    const performSave = useCallback(
        async (content: JSONContent, title?: string) => {
            if (!isOnlineRef.current) {
                setSaveStatus('offline');
                backupToLocal(content, title);
                return;
            }
            if (!onSave) {
                backupToLocal(content, title);
                return;
            }
            setSaveStatus('saving');
            try {
                await onSave(content, title);
                setSaveStatus('saved');
                setLastSaved(new Date());
                backupToLocal(content, title);
            } catch (error) {
                console.error('Error saving:', error);
                setSaveStatus('error');
                backupToLocal(content, title);
            }
        },
        [onSave, backupToLocal]
    );

    const triggerSave = useCallback(
        (content: JSONContent, title?: string) => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            backupToLocal(content, title);
            timeoutRef.current = setTimeout(() => {
                performSave(content, title);
            }, debounceMs);
        },
        [debounceMs, backupToLocal, performSave]
    );

    useEffect(() => {
        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, []);

    return {
        saveStatus,
        lastSaved,
        triggerSave,
        restoreFromLocal,
    };
}
