export const formatNumber = (value?: number) => {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return "—";
  }

  return value.toLocaleString("uz-UZ");
};

export const formatDuration = (seconds?: number | null) => {
  if (!seconds && seconds !== 0) {
    return "—";
  }

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return `${hours} soat ${minutes} daqiqa`;
};

export const timeAgo = (timestamp?: string) => {
  if (!timestamp) return "hozir";

  const now = Date.now();
  const then = new Date(timestamp).getTime();
  const diff = now - then;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days} kun oldin`;
  if (hours > 0) return `${hours} soat oldin`;
  if (minutes > 0) return `${minutes} daqiqa oldin`;
  if (seconds >= 0) return `${seconds} soniya oldin`;
  return "hozir";
};

export const buildSnippet = (content: {
  excerpt?: string;
  summary?: string;
  content_preview?: string;
  content_markdown?: string;
  content?: string;
},
length = 160,
) => {
  const raw =
    content.excerpt ??
    content.summary ??
    content.content_preview ??
    content.content_markdown ??
    content.content ??
    "";

  if (!raw) {
    return "";
  }

  const sanitized = raw.replace(/<[^>]*>?/g, "");
  const clean = sanitized.replace(/[#*_`>\-]/g, " ").replace(/\s+/g, " ").trim();
  return clean.length > length ? `${clean.slice(0, length)}…` : clean;
};
