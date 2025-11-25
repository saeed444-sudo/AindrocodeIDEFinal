// AI Agent enhancements for code quality, testing, and refactoring

export interface CodeAnalysisResult {
  issues: CodeIssue[];
  metrics: CodeMetrics;
  suggestions: RefactoringSuggestion[];
}

export interface CodeIssue {
  severity: "error" | "warning" | "info";
  message: string;
  line?: number;
  type: "syntax" | "style" | "performance" | "security" | "logic" | "maintainability";
}

export interface CodeMetrics {
  complexity: number;
  lines: number;
  functions: number;
  avgFunctionLength: number;
  hasTests: boolean;
}

export interface RefactoringSuggestion {
  title: string;
  description: string;
  priority: "high" | "medium" | "low";
  category: "performance" | "readability" | "maintainability" | "testing";
}

export interface TestGenerationRequest {
  code: string;
  language: string;
  testFramework?: string;
}

export interface TestCase {
  name: string;
  description: string;
  input?: Record<string, unknown>;
  expected?: unknown;
  code: string;
}

// Analyzes code for quality issues
export function analyzeCodeQuality(code: string, language: string): CodeAnalysisResult {
  const lines = code.split("\n");
  const issues: CodeIssue[] = [];
  const metrics: CodeMetrics = {
    complexity: estimateComplexity(code),
    lines: lines.length,
    functions: countFunctions(code, language),
    avgFunctionLength: calculateAvgFunctionLength(code, language),
    hasTests: detectTests(code, language),
  };

  // Basic pattern-based checks
  if (code.includes("eval(")) {
    issues.push({
      severity: "error",
      message: "Usage of eval() detected - security and performance risk",
      type: "security",
    });
  }

  if (code.includes("console.log")) {
    issues.push({
      severity: "warning",
      message: "Debug console.log found in code",
      type: "style",
    });
  }

  if (metrics.avgFunctionLength > 50) {
    issues.push({
      severity: "warning",
      message: "Functions are too long - consider breaking into smaller functions",
      type: "maintainability",
    });
  }

  if (!metrics.hasTests) {
    issues.push({
      severity: "info",
      message: "No tests detected - consider adding unit tests",
      type: "logic",
    });
  }

  const suggestions: RefactoringSuggestion[] = [];

  if (metrics.complexity > 10) {
    suggestions.push({
      title: "Reduce Cyclomatic Complexity",
      description: "The code has high cyclomatic complexity. Consider extracting methods or using design patterns.",
      priority: "high",
      category: "maintainability",
    });
  }

  if (metrics.avgFunctionLength > 30) {
    suggestions.push({
      title: "Break Down Large Functions",
      description: "Some functions are too long. Consider using the Single Responsibility Principle.",
      priority: "high",
      category: "readability",
    });
  }

  suggestions.push({
    title: "Add Type Hints",
    description: "Adding type hints would improve code documentation and enable better IDE support.",
    priority: "medium",
    category: "maintainability",
  });

  suggestions.push({
    title: "Add Error Handling",
    description: "Consider adding try-catch blocks or error handling for robust code.",
    priority: "medium",
    category: "maintainability",
  });

  return { issues, metrics, suggestions };
}

// Estimates code complexity using a simple algorithm
function estimateComplexity(code: string): number {
  let complexity = 1;
  complexity += (code.match(/\bif\b/g) || []).length;
  complexity += (code.match(/\belse\b/g) || []).length;
  complexity += (code.match(/\bfor\b/g) || []).length;
  complexity += (code.match(/\bwhile\b/g) || []).length;
  complexity += (code.match(/\bswitch\b/g) || []).length * 0.8;
  complexity += (code.match(/\bcatch\b/g) || []).length * 0.5;
  return Math.round(complexity);
}

function countFunctions(code: string, language: string): number {
  if (language === "python") {
    return (code.match(/\bdef\s+\w+/g) || []).length;
  }
  if (["javascript", "typescript"].includes(language)) {
    return (
      (code.match(/\bfunction\s+\w+/g) || []).length +
      (code.match(/\w+\s*=\s*\(/g) || []).length +
      (code.match(/\w+\s*:\s*\(/g) || []).length
    );
  }
  return (code.match(/\bfn\s+\w+/g) || []).length;
}

function calculateAvgFunctionLength(code: string, language: string): number {
  const functions = countFunctions(code, language);
  if (functions === 0) return 0;
  return Math.round(code.split("\n").length / Math.max(functions, 1));
}

function detectTests(code: string, language: string): boolean {
  const testPatterns = [
    /\b(test|describe|it|assert|expect|unittest|pytest)\b/gi,
    /\bTestCase\b/,
    /\@Test\b/,
  ];
  return testPatterns.some((pattern) => pattern.test(code));
}

// Generate test cases based on code
export function generateTestCases(request: TestGenerationRequest): TestCase[] {
  const testCases: TestCase[] = [];

  if (request.language === "python") {
    testCases.push({
      name: "test_basic_functionality",
      description: "Basic functionality test",
      code: `import pytest\n\ndef test_example():\n    # TODO: Add test implementation\n    assert True`,
    });
  } else if (["javascript", "typescript"].includes(request.language)) {
    testCases.push({
      name: "test_basic_functionality",
      description: "Basic functionality test",
      code: `describe('Example', () => {\n  it('should pass', () => {\n    expect(true).toBe(true);\n  });\n});`,
    });
  }

  return testCases;
}

// Generate refactoring suggestions based on code patterns
export function getRefactoringPrompt(code: string, analysis: CodeAnalysisResult): string {
  const issues = analysis.issues.map((i) => `- ${i.message}`).join("\n");
  const suggestions = analysis.suggestions.map((s) => `- ${s.title}: ${s.description}`).join("\n");

  return `Code Quality Analysis:\n\nIssues Found:\n${issues}\n\nRefactoring Suggestions:\n${suggestions}\n\nPlease help me refactor this code to address these issues.`;
}
