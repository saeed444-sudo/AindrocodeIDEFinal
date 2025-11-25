// Code snippets library for quick insertion

export interface Snippet {
  id: string;
  label: string;
  language: string;
  prefix: string;
  body: string;
  description: string;
}

const BUILTIN_SNIPPETS: Snippet[] = [
  // JavaScript/TypeScript
  {
    id: 'js-arrow-fn',
    label: 'Arrow Function',
    language: 'javascript',
    prefix: 'arrow',
    body: 'const ${1:functionName} = (${2:params}) => {\n  ${3:// body}\n};',
    description: 'Create arrow function',
  },
  {
    id: 'js-async-fn',
    label: 'Async Function',
    language: 'javascript',
    prefix: 'async',
    body: 'async function ${1:functionName}(${2:params}) {\n  ${3:// body}\n}',
    description: 'Create async function',
  },
  {
    id: 'ts-interface',
    label: 'TypeScript Interface',
    language: 'typescript',
    prefix: 'interface',
    body: 'interface ${1:InterfaceName} {\n  ${2:property}: ${3:type};\n}',
    description: 'Create TypeScript interface',
  },
  // Python
  {
    id: 'py-for-loop',
    label: 'For Loop',
    language: 'python',
    prefix: 'for',
    body: 'for ${1:item} in ${2:iterable}:\n    ${3:# body}',
    description: 'Create for loop',
  },
  {
    id: 'py-function',
    label: 'Function Definition',
    language: 'python',
    prefix: 'def',
    body: 'def ${1:function_name}(${2:params}):\n    """${3:Docstring}"""\n    ${4:pass}',
    description: 'Create function definition',
  },
  {
    id: 'py-class',
    label: 'Class Definition',
    language: 'python',
    prefix: 'class',
    body: 'class ${1:ClassName}:\n    def __init__(self, ${2:params}):\n        ${3:pass}',
    description: 'Create class definition',
  },
  // HTML
  {
    id: 'html-boilerplate',
    label: 'HTML Boilerplate',
    language: 'html',
    prefix: 'html5',
    body: '<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n  <title>${1:Document}</title>\n</head>\n<body>\n  ${2:<!-- content -->}\n</body>\n</html>',
    description: 'HTML5 boilerplate',
  },
  // SQL
  {
    id: 'sql-select',
    label: 'SELECT Statement',
    language: 'sql',
    prefix: 'select',
    body: 'SELECT ${1:columns}\nFROM ${2:table}\nWHERE ${3:condition};',
    description: 'Create SELECT statement',
  },
  {
    id: 'sql-insert',
    label: 'INSERT Statement',
    language: 'sql',
    prefix: 'insert',
    body: 'INSERT INTO ${1:table} (${2:columns})\nVALUES (${3:values});',
    description: 'Create INSERT statement',
  },
];

export function getSnippetsForLanguage(language: string): Snippet[] {
  return BUILTIN_SNIPPETS.filter(s => s.language === language);
}

export function getAllSnippets(): Snippet[] {
  return BUILTIN_SNIPPETS;
}

export function getCustomSnippets(): Snippet[] {
  const stored = localStorage.getItem('aindro-custom-snippets');
  if (!stored) return [];
  try {
    return JSON.parse(stored);
  } catch {
    return [];
  }
}

export function saveCustomSnippet(snippet: Snippet): void {
  const custom = getCustomSnippets();
  const index = custom.findIndex(s => s.id === snippet.id);
  if (index >= 0) {
    custom[index] = snippet;
  } else {
    custom.push(snippet);
  }
  localStorage.setItem('aindro-custom-snippets', JSON.stringify(custom));
}

export function deleteCustomSnippet(id: string): void {
  const custom = getCustomSnippets();
  const filtered = custom.filter(s => s.id !== id);
  localStorage.setItem('aindro-custom-snippets', JSON.stringify(filtered));
}

export function expandSnippet(code: string, snippet: Snippet, position: number): { code: string; newPosition: number } {
  const before = code.substring(0, position);
  const after = code.substring(position);
  const expanded = before + snippet.body + after;
  return {
    code: expanded,
    newPosition: position + snippet.body.length,
  };
}
