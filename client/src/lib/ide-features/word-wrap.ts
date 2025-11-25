// Word wrap configuration for editor
export interface WordWrapSettings {
  enabled: boolean;
}

export function getWordWrapSettings(): WordWrapSettings {
  try {
    const stored = localStorage.getItem("aindrocode-word-wrap");
    if (!stored) return { enabled: true };
    const parsed = JSON.parse(stored);
    return { enabled: parsed.enabled ?? true };
  } catch (error) {
    console.warn("Failed to parse word wrap settings:", error);
    localStorage.removeItem("aindrocode-word-wrap");
    return { enabled: true };
  }
}

export function saveWordWrapSettings(settings: WordWrapSettings): void {
  localStorage.setItem("aindrocode-word-wrap", JSON.stringify(settings));
}

export function toggleWordWrap(): boolean {
  const current = getWordWrapSettings();
  const updated = !current.enabled;
  saveWordWrapSettings({ enabled: updated });
  return updated;
}
