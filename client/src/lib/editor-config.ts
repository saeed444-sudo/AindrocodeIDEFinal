// Advanced Monaco editor configuration with autocompletion and snippets

import type { editor } from "monaco-editor";

// HTML tag snippets
const htmlSnippets: any[] = [
  {
    label: "div",
    kind: 27, // Snippet
    insertText: "<div>$0</div>",
    insertTextRules: 4, // InsertAsSnippet
    detail: "HTML div element",
  },
  {
    label: "p",
    kind: 27,
    insertText: "<p>$0</p>",
    insertTextRules: 4,
    detail: "HTML paragraph element",
  },
  {
    label: "a",
    kind: 27,
    insertText: '<a href="$1">$0</a>',
    insertTextRules: 4,
    detail: "HTML anchor element",
  },
  {
    label: "button",
    kind: 27,
    insertText: "<button>$0</button>",
    insertTextRules: 4,
    detail: "HTML button element",
  },
  {
    label: "span",
    kind: 27,
    insertText: "<span>$0</span>",
    insertTextRules: 4,
    detail: "HTML span element",
  },
  {
    label: "h1",
    kind: 27,
    insertText: "<h1>$0</h1>",
    insertTextRules: 4,
    detail: "HTML heading 1",
  },
  {
    label: "h2",
    kind: 27,
    insertText: "<h2>$0</h2>",
    insertTextRules: 4,
    detail: "HTML heading 2",
  },
  {
    label: "h3",
    kind: 27,
    insertText: "<h3>$0</h3>",
    insertTextRules: 4,
    detail: "HTML heading 3",
  },
  {
    label: "ul",
    kind: 27,
    insertText: "<ul>\n  <li>$0</li>\n</ul>",
    insertTextRules: 4,
    detail: "HTML unordered list",
  },
  {
    label: "ol",
    kind: 27,
    insertText: "<ol>\n  <li>$0</li>\n</ol>",
    insertTextRules: 4,
    detail: "HTML ordered list",
  },
  {
    label: "li",
    kind: 27,
    insertText: "<li>$0</li>",
    insertTextRules: 4,
    detail: "HTML list item",
  },
  {
    label: "form",
    kind: 27,
    insertText: '<form>\n  <input type="text" />\n  $0\n</form>',
    insertTextRules: 4,
    detail: "HTML form element",
  },
  {
    label: "input",
    kind: 27,
    insertText: '<input type="$1" placeholder="$0" />',
    insertTextRules: 4,
    detail: "HTML input element",
  },
  {
    label: "textarea",
    kind: 27,
    insertText: '<textarea placeholder="$0"></textarea>',
    insertTextRules: 4,
    detail: "HTML textarea element",
  },
  {
    label: "img",
    kind: 27,
    insertText: '<img src="$1" alt="$0" />',
    insertTextRules: 4,
    detail: "HTML image element",
  },
  {
    label: "html",
    kind: 27,
    insertText: "<!DOCTYPE html>\n<html lang=\"en\">\n<head>\n  <meta charset=\"UTF-8\">\n  <title>$0</title>\n</head>\n<body>\n  \n</body>\n</html>",
    insertTextRules: 4,
    detail: "HTML5 boilerplate",
  },
  {
    label: "body",
    kind: 27,
    insertText: "<body>\n  $0\n</body>",
    insertTextRules: 4,
    detail: "HTML body element",
  },
  {
    label: "head",
    kind: 27,
    insertText: "<head>\n  <meta charset=\"UTF-8\">\n  <title>$0</title>\n</head>",
    insertTextRules: 4,
    detail: "HTML head element",
  },
  {
    label: "style",
    kind: 27,
    insertText: "<style>\n  $0\n</style>",
    insertTextRules: 4,
    detail: "HTML style element",
  },
  {
    label: "script",
    kind: 27,
    insertText: "<script>\n  $0\n</script>",
    insertTextRules: 4,
    detail: "HTML script element",
  },
];

// JavaScript/TypeScript common completions
const jsCompletions: any[] = [
  {
    label: "console.log",
    kind: 2, // Method
    insertText: "console.log($0)",
    insertTextRules: 4,
    detail: "Print to console",
  },
  {
    label: "function",
    kind: 27,
    insertText: "function $1() {\n  $0\n}",
    insertTextRules: 4,
    detail: "Function declaration",
  },
  {
    label: "const",
    kind: 27,
    insertText: "const $1 = $0;",
    insertTextRules: 4,
    detail: "Constant declaration",
  },
  {
    label: "let",
    kind: 27,
    insertText: "let $1 = $0;",
    insertTextRules: 4,
    detail: "Let declaration",
  },
  {
    label: "if",
    kind: 27,
    insertText: "if ($1) {\n  $0\n}",
    insertTextRules: 4,
    detail: "If statement",
  },
  {
    label: "for",
    kind: 27,
    insertText: "for (let i = 0; i < $1; i++) {\n  $0\n}",
    insertTextRules: 4,
    detail: "For loop",
  },
  {
    label: "forEach",
    kind: 2,
    insertText: ".forEach((item) => {\n  $0\n})",
    insertTextRules: 4,
    detail: "Array forEach method",
  },
  {
    label: "map",
    kind: 2,
    insertText: ".map((item) => $0)",
    insertTextRules: 4,
    detail: "Array map method",
  },
  {
    label: "filter",
    kind: 2,
    insertText: ".filter((item) => $0)",
    insertTextRules: 4,
    detail: "Array filter method",
  },
  {
    label: "async",
    kind: 27,
    insertText: "async function $1() {\n  $0\n}",
    insertTextRules: 4,
    detail: "Async function",
  },
  {
    label: "await",
    kind: 27,
    insertText: "await $0",
    insertTextRules: 4,
    detail: "Await expression",
  },
  {
    label: "try",
    kind: 27,
    insertText: "try {\n  $0\n} catch (error) {\n  console.error(error);\n}",
    insertTextRules: 4,
    detail: "Try-catch block",
  },
];

// Python completions
const pythonCompletions: any[] = [
  {
    label: "print",
    kind: 2,
    insertText: "print($0)",
    insertTextRules: 4,
    detail: "Print output",
  },
  {
    label: "def",
    kind: 27,
    insertText: "def $1($2):\n    $0",
    insertTextRules: 4,
    detail: "Function definition",
  },
  {
    label: "class",
    kind: 27,
    insertText: "class $1:\n    def __init__(self):\n        $0",
    insertTextRules: 4,
    detail: "Class definition",
  },
  {
    label: "if",
    kind: 27,
    insertText: "if $1:\n    $0",
    insertTextRules: 4,
    detail: "If statement",
  },
  {
    label: "for",
    kind: 27,
    insertText: "for $1 in $2:\n    $0",
    insertTextRules: 4,
    detail: "For loop",
  },
  {
    label: "while",
    kind: 27,
    insertText: "while $1:\n    $0",
    insertTextRules: 4,
    detail: "While loop",
  },
  {
    label: "import",
    kind: 27,
    insertText: "import $0",
    insertTextRules: 4,
    detail: "Import module",
  },
  {
    label: "from",
    kind: 27,
    insertText: "from $1 import $0",
    insertTextRules: 4,
    detail: "From import",
  },
];

function getWordRange(model: any, position: any, monaco: any): any {
  const word = model.getWordUntilPosition(position);
  return {
    startLineNumber: position.lineNumber,
    endLineNumber: position.lineNumber,
    startColumn: word.startColumn,
    endColumn: word.endColumn,
  };
}

export function registerCompletionProviders(monaco: any): void {
  const createSuggestions = (items: any[], model: any, position: any) => {
    const wordRange = getWordRange(model, position, monaco);
    return items.map((item) => ({
      ...item,
      range: wordRange,
      filterText: item.label,
      sortText: item.label,
    }));
  };

  // HTML completions
  monaco.languages.registerCompletionItemProvider("html", {
    triggerCharacters: ["<", "/"],
    provideCompletionItems: (model: any, position: any) => {
      return { suggestions: createSuggestions(htmlSnippets, model, position) };
    },
  });

  // JavaScript completions
  monaco.languages.registerCompletionItemProvider("javascript", {
    triggerCharacters: [".", " "],
    provideCompletionItems: (model: any, position: any) => {
      return { suggestions: createSuggestions(jsCompletions, model, position) };
    },
  });

  // TypeScript completions
  monaco.languages.registerCompletionItemProvider("typescript", {
    triggerCharacters: [".", " "],
    provideCompletionItems: (model: any, position: any) => {
      return { suggestions: createSuggestions(jsCompletions, model, position) };
    },
  });

  // Python completions
  monaco.languages.registerCompletionItemProvider("python", {
    triggerCharacters: [".", " "],
    provideCompletionItems: (model: any, position: any) => {
      return { suggestions: createSuggestions(pythonCompletions, model, position) };
    },
  });
}

// Enhanced editor options
export const EDITOR_OPTIONS: editor.IStandaloneEditorConstructionOptions = {
  minimap: { enabled: true },
  fontSize: 14,
  fontFamily: "JetBrains Mono, Fira Code, monospace",
  lineNumbers: "on",
  roundedSelection: false,
  scrollBeyondLastLine: false,
  automaticLayout: true,
  tabSize: 2,
  insertSpaces: true,
  wordWrap: "off",
  scrollbar: {
    vertical: "auto",
    horizontal: "auto",
    useShadows: false,
  },
  // Enhanced autocompletion settings
  quickSuggestions: {
    other: true,
    comments: false,
    strings: false,
  },
  suggestOnTriggerCharacters: true,
  acceptSuggestionOnEnter: "on",
  suggest: {
    localityBonus: true,
    shareSuggestSelections: true,
  },
  autoClosingBrackets: "always",
  autoClosingQuotes: "always",
  autoClosingOvertype: "auto",
  autoSurround: "brackets",
  // Formatters
  formatOnPaste: true,
  formatOnType: true,
};
