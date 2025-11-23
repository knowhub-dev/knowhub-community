'use client';

import dynamic from 'next/dynamic';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ChevronDown,
  ChevronRight,
  File as FileIcon,
  Folder,
  FolderPlus,
  Loader2,
  Save,
  UploadCloud,
} from 'lucide-react';
import { containerFileService } from '@/lib/services/containerFiles';
import { ContainerFileEntry } from '@/types/containerFiles';

const MonacoEditor = dynamic(() => import('@monaco-editor/react'), { ssr: false });

type Props = {
  containerId: number;
};

export function FileExplorer({ containerId }: Props) {
  const [tree, setTree] = useState<Record<string, ContainerFileEntry[]>>({});
  const [expanded, setExpanded] = useState<Set<string>>(new Set(['']));
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [fileContent, setFileContent] = useState<string>('');
  const [loadingFile, setLoadingFile] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [activeDir, setActiveDir] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    void fetchDirectory('');
  }, [containerId]);

  const currentDirectory = useMemo(() => {
    if (selectedFile) {
      const segments = selectedFile.split('/');
      segments.pop();
      return segments.join('/');
    }
    return activeDir;
  }, [selectedFile, activeDir]);

  const fetchDirectory = async (path: string) => {
    const entries = await containerFileService.listFiles(containerId, path);
    setTree((prev) => ({ ...prev, [path]: entries }));
  };

  const toggleDirectory = async (path: string) => {
    setActiveDir(path);
    const updated = new Set(expanded);
    if (updated.has(path)) {
      updated.delete(path);
    } else {
      updated.add(path);
      if (!tree[path]) {
        await fetchDirectory(path);
      }
    }
    setExpanded(updated);
  };

  const loadFile = async (entry: ContainerFileEntry) => {
    setSelectedFile(entry.path);
    setActiveDir(entry.path.split('/').slice(0, -1).join('/'));
    setLoadingFile(true);
    try {
      const response = await containerFileService.getFileContent(containerId, entry.path);
      setFileContent(response.content ?? '');
    } finally {
      setLoadingFile(false);
    }
  };

  const handleUploadClick = () => fileInputRef.current?.click();

  const handleFileInput = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    await containerFileService.uploadFile(containerId, currentDirectory, file);
    await fetchDirectory(currentDirectory);
    event.target.value = '';
  };

  const handleCreateFolder = async () => {
    const name = window.prompt('Folder name');
    if (!name) return;
    await containerFileService.createFolder(containerId, currentDirectory, name);
    await fetchDirectory(currentDirectory);
  };

  const handleSave = async () => {
    if (!selectedFile) return;
    setSaving(true);
    try {
      await containerFileService.saveFile(containerId, selectedFile, fileContent);
    } finally {
      setSaving(false);
    }
  };

  const renderNodes = (path: string, depth = 0): JSX.Element[] => {
    const nodes = tree[path] ?? [];

    return nodes
      .sort((a, b) => a.type.localeCompare(b.type) || a.name.localeCompare(b.name))
      .map((entry) => {
        const isDirectory = entry.type === 'directory';
        const childPath = entry.path;
        const isExpanded = expanded.has(childPath);
        const padding = 12 * depth;

        return (
          <div key={entry.path} className="text-sm text-muted-foreground">
            <button
              type="button"
              onClick={() => (isDirectory ? toggleDirectory(childPath) : loadFile(entry))}
              className={`flex w-full items-center gap-2 rounded-lg px-2 py-1 text-left hover:bg-muted/60 ${
                selectedFile === entry.path ? 'bg-muted' : ''
              }`}
              style={{ paddingLeft: `${padding}px` }}
            >
              {isDirectory ? (
                <>
                  {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                  <Folder className="h-4 w-4 text-amber-500" />
                  <span className="font-medium text-foreground">{entry.name}</span>
                </>
              ) : (
                <>
                  <FileIcon className="h-4 w-4 text-blue-500" />
                  <span className="truncate text-foreground">{entry.name}</span>
                </>
              )}
            </button>
            {isDirectory && isExpanded && <div className="ml-6 border-l border-border/60 pl-3">{renderNodes(childPath, depth + 1)}</div>}
          </div>
        );
      });
  };

  return (
    <div className="grid h-full grid-cols-1 gap-4 lg:grid-cols-[1fr_3fr]">
      <div className="rounded-2xl border border-border bg-card/80 p-3 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-sm font-semibold text-foreground">Workspace</p>
          <span className="rounded-full bg-muted px-2 py-1 text-[11px] text-muted-foreground">/app{currentDirectory ? `/${currentDirectory}` : ''}</span>
        </div>
        <div className="space-y-1 overflow-auto text-sm">
          {tree[''] ? renderNodes('') : <p className="text-xs text-muted-foreground">Loading tree...</p>}
        </div>
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card/80 p-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleUploadClick}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition hover:brightness-110"
          >
            <UploadCloud className="h-4 w-4" /> Upload File
          </button>
          <button
            type="button"
            onClick={handleCreateFolder}
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-muted px-3 py-2 text-sm font-semibold text-foreground shadow-sm transition hover:bg-muted/70"
          >
            <FolderPlus className="h-4 w-4" /> New Folder
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={!selectedFile || saving}
            className="inline-flex items-center gap-2 rounded-lg bg-emerald-500 px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save
          </button>
          <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileInput} />
        </div>

        <div className="flex-1 rounded-xl border border-border bg-muted/40 p-2">
          {selectedFile ? (
            <div className="h-full">
              {loadingFile ? (
                <div className="flex h-full items-center justify-center text-muted-foreground">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading file...
                </div>
              ) : (
                <MonacoEditor
                  height="500px"
                  language="javascript"
                  theme="vs-dark"
                  value={fileContent}
                  onChange={(value) => setFileContent(value ?? '')}
                  options={{ minimap: { enabled: false }, fontSize: 14 }}
                />
              )}
            </div>
          ) : (
            <div className="flex h-full min-h-[320px] items-center justify-center rounded-lg border border-dashed border-border/80 bg-card text-sm text-muted-foreground">
              Select a file from the tree to start editing.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
