import React from 'react';

export interface KimoAction {
  type: string;
  windowId?: string;
  theme?: 'dark' | 'light';
  route?: 'terminal' | 'landing';
  symbol?: string;
  filter?: string;
  amount?: number;
  preset?: 'default' | 'split-duo' | 'tiled-quad' | 'full-focus';
}

export interface ParsedKimoResponse {
  displayText: string;
  actions: KimoAction[];
}

/**
 * Extracts action blocks and cleans markdown text
 */
export function parseKimoResponse(rawContent: string): ParsedKimoResponse {
  if (!rawContent) return { displayText: '', actions: [] };

  const actions: KimoAction[] = [];
  let cleaned = rawContent;

  // Extract ```json:action [...]``` or ```json action {...}``` or JSON actions
  const actionBlockRegex = /```(?:json:action|json action|action|json)?\s*(\{[\s\S]*?\}|\[[\s\S]*?\])\s*```/gi;
  let match;
  while ((match = actionBlockRegex.exec(rawContent)) !== null) {
    try {
      const parsed = JSON.parse(match[1]);
      if (Array.isArray(parsed)) {
        actions.push(...parsed);
      } else if (parsed && typeof parsed === 'object') {
        actions.push(parsed);
      }
    } catch {
      // Ignore JSON parse errors in action block
    }
  }

  // Remove the action block from display text so user doesn't see raw JSON
  cleaned = cleaned.replace(actionBlockRegex, '').trim();

  // Also check for trailing ACTION: [...] or ACTION: {...} if model outputted without code blocks
  const inlineActionRegex = /ACTION:\s*(\{[\s\S]*?\}|\[[\s\S]*?\])/gi;
  while ((match = inlineActionRegex.exec(cleaned)) !== null) {
    try {
      const parsed = JSON.parse(match[1]);
      if (Array.isArray(parsed)) {
        actions.push(...parsed);
      } else if (parsed && typeof parsed === 'object') {
        actions.push(parsed);
      }
    } catch {
      // Ignore
    }
  }
  cleaned = cleaned.replace(inlineActionRegex, '').trim();

  return { displayText: cleaned, actions };
}

/**
 * Renders markdown text safely with clean bolding, headers, code, and bullet lists.
 * Explicitly resolves the "asterisk issue" by parsing all valid markdown bold/italics
 * and stripping any remaining stray/orphan asterisks so raw ** or * never appear in UI.
 */
export const KimoMarkdownRenderer: React.FC<{ text: string }> = ({ text }) => {
  if (!text) return null;

  const lines = text.split('\n');

  return (
    <div className="space-y-2 text-xs leading-relaxed text-slate-800 dark:text-slate-200">
      {lines.map((line, idx) => {
        const trimmed = line.trim();
        if (!trimmed) {
          return <div key={idx} className="h-1" />;
        }

        // Headers
        if (trimmed.startsWith('### ')) {
          return (
            <h4 key={idx} className="font-bold text-sm text-purple-700 dark:text-purple-300 mt-2 mb-1">
              {renderInlineFormatting(trimmed.slice(4))}
            </h4>
          );
        }
        if (trimmed.startsWith('## ')) {
          return (
            <h3 key={idx} className="font-black text-sm text-slate-900 dark:text-slate-100 mt-2 mb-1">
              {renderInlineFormatting(trimmed.slice(3))}
            </h3>
          );
        }
        if (trimmed.startsWith('# ')) {
          return (
            <h2 key={idx} className="font-black text-base text-slate-900 dark:text-slate-100 mt-2.5 mb-1.5">
              {renderInlineFormatting(trimmed.slice(2))}
            </h2>
          );
        }

        // Bullet point lists
        if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
          const itemText = trimmed.slice(2);
          return (
            <div key={idx} className="flex items-start space-x-2 pl-1.5 my-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-1.5 shrink-0" />
              <div className="flex-1">{renderInlineFormatting(itemText)}</div>
            </div>
          );
        }

        // Numbered list
        const numMatch = trimmed.match(/^(\d+)\.\s+(.*)$/);
        if (numMatch) {
          return (
            <div key={idx} className="flex items-start space-x-2 pl-1.5 my-0.5">
              <span className="font-mono text-purple-600 dark:text-purple-400 font-bold shrink-0 text-[11px]">
                {numMatch[1]}.
              </span>
              <div className="flex-1">{renderInlineFormatting(numMatch[2])}</div>
            </div>
          );
        }

        // Normal paragraph
        return <p key={idx}>{renderInlineFormatting(trimmed)}</p>;
      })}
    </div>
  );
};

/**
 * Handles inline bold (**text**), italic (*text*), inline code (`code`),
 * and completely strips any orphan/unmatched asterisks.
 */
function renderInlineFormatting(raw: string): React.ReactNode[] {
  // First, parse code blocks/inline code
  const segments: React.ReactNode[] = [];
  const codeRegex = /`([^`]+)`/g;
  let lastIndex = 0;
  let codeMatch;

  while ((codeMatch = codeRegex.exec(raw)) !== null) {
    if (codeMatch.index > lastIndex) {
      const textBefore = raw.substring(lastIndex, codeMatch.index);
      segments.push(...renderBoldItalic(textBefore));
    }
    segments.push(
      <code
        key={`code-${codeMatch.index}`}
        className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-purple-600 dark:text-purple-300 font-mono text-[11px]"
      >
        {codeMatch[1]}
      </code>
    );
    lastIndex = codeRegex.lastIndex;
  }

  if (lastIndex < raw.length) {
    segments.push(...renderBoldItalic(raw.substring(lastIndex)));
  }

  return segments;
}

/**
 * Parses **bold** and *italic* accurately, stripping any stray asterisks
 */
function renderBoldItalic(text: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  
  // Match **bold** or *italic*
  // Regex matches **...** first, then *...*
  const formatRegex = /(\*\*([^*]+)\*\*|\*([^*]+)\*)/g;
  let lastIndex = 0;
  let match;

  while ((match = formatRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      // Clean any stray asterisks in plaintext
      const plain = text.substring(lastIndex, match.index).replace(/\*/g, '');
      if (plain) parts.push(plain);
    }

    if (match[2]) {
      // Bold **text**
      parts.push(
        <strong key={`bold-${match.index}`} className="font-bold text-slate-900 dark:text-white">
          {match[2]}
        </strong>
      );
    } else if (match[3]) {
      // Italic *text*
      parts.push(
        <em key={`italic-${match.index}`} className="italic text-slate-700 dark:text-slate-300">
          {match[3]}
        </em>
      );
    }

    lastIndex = formatRegex.lastIndex;
  }

  if (lastIndex < text.length) {
    const trailing = text.substring(lastIndex).replace(/\*/g, '');
    if (trailing) parts.push(trailing);
  }

  return parts;
}
