export interface HeadingItem {
  id: string;
  text: string;
  level: number;
}

const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');

export const slugifyHeading = (value: string) => slugify(value || 'section');

export const extractHeadings = (markdown: string): HeadingItem[] => {
  const headings: HeadingItem[] = [];
  const lines = markdown.split(/\r?\n/);

  lines.forEach((line) => {
    const match = line.match(/^(#{1,4})\s+(.*)$/);
    if (!match) return;

    const level = match[1].length;
    const rawText = match[2]?.replace(/[\*`_]/g, '').trim() ?? '';
    const id = slugifyHeading(rawText);

    headings.push({
      id,
      text: rawText,
      level,
    });
  });

  return headings;
};

export type TokenType =
  | 'comment'
  | 'string'
  | 'keyword'
  | 'boolean'
  | 'number'
  | 'operator'
  | 'function'
  | 'constant';

interface TokenMatch {
  start: number;
  end: number;
  type: TokenType;
  text: string;
}

const COMMON_MATCHERS: Record<TokenType, RegExp> = {
  comment: /(?:\/\/.*$|#.*$|\/\*[\s\S]*?\*\/)/gm,
  string: /(['`\"])(?:\\.|(?!\1)[^\\])*?\1/gm,
  keyword:
    /\b(?:const|let|var|function|return|if|else|for|while|switch|case|break|class|extends|import|from|export|default|new|try|catch|throw|async|await|type|interface|implements|package|public|private|protected|static|yield)\b/gm,
  boolean: /\b(?:true|false|null|undefined)\b/gm,
  number: /\b(?:0x[\da-fA-F]+|\d+(?:\.\d+)?(?:e[+-]?\d+)?)\b/gm,
  operator: /[+\-*/=%!<>|&]+/g,
  function: /\b[A-Za-z_][A-Za-z0-9_]*(?=\s*\()/g,
  constant: /\b[A-Z_]{2,}\b/g,
};

const SHELL_MATCHERS: Record<TokenType, RegExp> = {
  ...COMMON_MATCHERS,
  keyword: /(^|\s)(?:cd|ls|cat|npm|yarn|pnpm|bun|git|node|python3?|php|composer|artisan)(?=\s|$)/gm,
  operator: /[|><&]{1,2}/g,
};

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\"/g, '&quot;')
    .replace(/'/g, '&#039;');

const collectTokens = (code: string, patterns: Record<TokenType, RegExp>) => {
  const tokens: TokenMatch[] = [];

  Object.entries(patterns).forEach(([type, regex]) => {
    regex.lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = regex.exec(code)) !== null) {
      tokens.push({
        start: match.index,
        end: match.index + match[0].length,
        type: type as TokenType,
        text: match[0],
      });
    }
  });

  tokens.sort((a, b) => a.start - b.start || b.end - a.end);

  const merged: TokenMatch[] = [];
  let lastEnd = -1;

  tokens.forEach((token) => {
    if (token.start < lastEnd) return;
    merged.push(token);
    lastEnd = token.end;
  });

  return merged;
};

export const highlightCode = (code: string, language?: string) => {
  const patterns = language?.startsWith('sh') || language === 'bash' ? SHELL_MATCHERS : COMMON_MATCHERS;
  const tokens = collectTokens(code, patterns);

  let cursor = 0;
  let highlighted = '';

  tokens.forEach((token) => {
    if (token.start > cursor) {
      highlighted += escapeHtml(code.slice(cursor, token.start));
    }

    highlighted += `<span class="token ${token.type}">${escapeHtml(token.text)}</span>`;
    cursor = token.end;
  });

  if (cursor < code.length) {
    highlighted += escapeHtml(code.slice(cursor));
  }

  return highlighted;
};
