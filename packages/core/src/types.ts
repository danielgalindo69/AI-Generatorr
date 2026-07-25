export interface AigitConfig {
  aiProvider: "gemini" | "groq" | "ollama";
  apiKey?: string;
  model?: string;
  language: string;
  commitStyle: "conventional" | "simple" | "emoji";
  ollamaHost?: string;
}

export interface DiffResult {
  files: string[];
  diff: string;
  staged: boolean;
  summary: { added: number; modified: number; deleted: number };
}

export interface CommitResult {
  message: string;
  applied: boolean;
}

export interface AIProvider {
  generateCommit(diff: string, context: CommitContext): Promise<string>;
}

export interface CommitContext {
  projectType: string;
  framework: string;
  recentCommits: string[];
  language: string;
  style: string;
  userHint?: string;
}

export interface ProjectInfo {
  type: string;
  framework: string;
  dependencies: string[];
  hasDocker: boolean;
  hasCI: boolean;
  envVars: string[];
}