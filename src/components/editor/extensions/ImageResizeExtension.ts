'use client';

import { Extension } from '@tiptap/core';
import { createImageResizePlugin } from '../ImageResizePlugin';

export const ImageResizeExtension = Extension.create({
    name: 'imageResizeExtension',
    addProseMirrorPlugins() {
        return [createImageResizePlugin()];
    },
});
