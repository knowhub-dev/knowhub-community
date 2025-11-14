"use client";

import dynamic from "next/dynamic";
import type { PostCollaborationPanelProps } from "./PostCollaborationPanel";

const LazyPanel = dynamic(() => import("./PostCollaborationPanel"), {
  ssr: false,
  loading: () => (
    <div className="rounded-2xl border border-slate-200 bg-white/60 p-6 text-center text-sm text-slate-500 shadow-sm">
      Hamkorlik paneli yuklanmoqda…
    </div>
  ),
});

export default function PostCollaborationPanelWrapper(props: PostCollaborationPanelProps) {
  return <LazyPanel {...props} />;
}
