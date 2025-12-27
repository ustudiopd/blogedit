import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import YouTube from '@tiptap/extension-youtube';
import { Color } from '@tiptap/extension-color';
import { TextStyle } from '@tiptap/extension-text-style';
import Highlight from '@tiptap/extension-highlight';

export const extensions = [
    StarterKit.configure({
        heading: {
            levels: [1, 2, 3],
        },
        link: false,
    }),
    TextStyle,
    Color,
    Highlight.configure({
        multicolor: true,
    }),
    Image.configure({
        inline: true,
        allowBase64: true,
        HTMLAttributes: {
            class: 'rounded-lg',
        },
    }),
    Link.configure({
        openOnClick: false,
        HTMLAttributes: {
            class: 'text-cyan-400 hover:text-cyan-300 underline',
        },
    }),
    YouTube.configure({
        width: 640,
        height: 480,
        HTMLAttributes: {
            class: 'rounded-lg',
        },
    }),
    TaskList,
    TaskItem.configure({
        nested: true,
    }),
];
