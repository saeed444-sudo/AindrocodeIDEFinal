// Search & Replace utility for code editor
export interface SearchMatch {
  line: number;
  column: number;
  text: string;
  length: number;
}

export interface SearchOptions {
  caseSensitive?: boolean;
  wholeWord?: boolean;
  useRegex?: boolean;
}

export function findMatches(code: string, query: string, options: SearchOptions = {}): SearchMatch[] {
  if (!query) return [];

  const matches: SearchMatch[] = [];
  const lines = code.split('\n');
  
  let pattern: RegExp;
  try {
    let flags = 'g';
    if (!options.caseSensitive) flags += 'i';
    
    if (options.useRegex) {
      pattern = new RegExp(query, flags);
    } else {
      const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const wordBoundary = options.wholeWord ? '\\b' : '';
      pattern = new RegExp(wordBoundary + escaped + wordBoundary, flags);
    }
  } catch (e) {
    return [];
  }

  lines.forEach((line, lineIndex) => {
    let match;
    while ((match = pattern.exec(line)) !== null) {
      matches.push({
        line: lineIndex,
        column: match.index,
        text: match[0],
        length: match[0].length,
      });
    }
  });

  return matches;
}

export function replaceAll(code: string, query: string, replacement: string, options: SearchOptions = {}): string {
  if (!query) return code;

  try {
    let flags = 'g';
    if (!options.caseSensitive) flags += 'i';
    
    let pattern: RegExp;
    if (options.useRegex) {
      pattern = new RegExp(query, flags);
    } else {
      const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const wordBoundary = options.wholeWord ? '\\b' : '';
      pattern = new RegExp(wordBoundary + escaped + wordBoundary, flags);
    }

    return code.replace(pattern, replacement);
  } catch (e) {
    return code;
  }
}

export function getLineContent(code: string, lineNumber: number): string {
  return code.split('\n')[lineNumber] || '';
}

export function goToLine(code: string, lineNumber: number): number {
  const lines = code.split('\n');
  let position = 0;
  for (let i = 0; i < Math.min(lineNumber, lines.length); i++) {
    position += lines[i].length + 1; // +1 for newline
  }
  return position;
}
