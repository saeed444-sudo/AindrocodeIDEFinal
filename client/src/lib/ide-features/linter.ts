// Linting & error checking system

export interface LintError {
  line: number;
  column: number;
  message: string;
  severity: 'error' | 'warning' | 'info';
  code?: string;
}

export function lintCode(code: string, language: string): LintError[] {
  const errors: LintError[] = [];
  const lines = code.split('\n');

  switch (language) {
    case 'javascript':
    case 'typescript':
      errors.push(...lintJavaScript(code, lines));
      break;
    case 'python':
      errors.push(...lintPython(code, lines));
      break;
    case 'html':
      errors.push(...lintHTML(code, lines));
      break;
  }

  return errors;
}

function lintJavaScript(code: string, lines: string[]): LintError[] {
  const errors: LintError[] = [];

  // Check for unused variables (simple pattern)
  const varPattern = /(?:let|const|var)\s+(\w+)/g;
  let match;
  const declaredVars = new Map<string, number>();
  
  while ((match = varPattern.exec(code)) !== null) {
    declaredVars.set(match[1], code.substring(0, match.index).split('\n').length - 1);
  }

  declaredVars.forEach((line, varName) => {
    const usageCount = (code.match(new RegExp(`\\b${varName}\\b`, 'g')) || []).length;
    if (usageCount === 1) {
      errors.push({
        line,
        column: 0,
        message: `Variable '${varName}' is declared but never used`,
        severity: 'warning',
        code: 'no-unused-vars',
      });
    }
  });

  return errors;
}

function lintPython(code: string, lines: string[]): LintError[] {
  const errors: LintError[] = [];

  lines.forEach((line, index) => {
    // Check for mixed tabs/spaces
    if (line.includes('\t') && line.includes(' ')) {
      errors.push({
        line: index,
        column: 0,
        message: 'Mixed tabs and spaces',
        severity: 'error',
        code: 'mixed-indentation',
      });
    }

    // Check for trailing whitespace
    if (line !== line.trimRight()) {
      errors.push({
        line: index,
        column: line.length,
        message: 'Trailing whitespace',
        severity: 'warning',
        code: 'trailing-whitespace',
      });
    }
  });

  return errors;
}

function lintHTML(code: string, lines: string[]): LintError[] {
  const errors: LintError[] = [];

  // Check for missing alt on images
  const imgPattern = /<img[^>]*>/g;
  let match;
  let lineNum = 0;

  while ((match = imgPattern.exec(code)) !== null) {
    if (!match[0].includes('alt=')) {
      lineNum = code.substring(0, match.index).split('\n').length - 1;
      errors.push({
        line: lineNum,
        column: 0,
        message: 'Image missing alt attribute',
        severity: 'warning',
        code: 'img-alt-missing',
      });
    }
  }

  return errors;
}
