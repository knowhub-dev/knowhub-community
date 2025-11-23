import React from 'react';
import dynamic from 'next/dynamic';
import '@uiw/react-md-editor/markdown-editor.css';
import '@uiw/react-markdown-preview/markdown.css';

const MDEditor = dynamic(
  () => import('@uiw/react-md-editor').then((mod) => mod.default),
  { ssr: false }
);

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  preview?: 'live' | 'edit' | 'preview';
}

export default function MarkdownEditor({ value, onChange, preview = 'live' }: MarkdownEditorProps) {
  return (
    <div className="w-full">
      <MDEditor
        value={value}
        onChange={(val) => onChange(val || '')}
        preview={preview}
        height={420}
        className="creator-editor"
        data-color-mode="dark"
      />
    </div>
  );
}
