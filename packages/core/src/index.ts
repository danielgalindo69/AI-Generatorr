export { getDiff, getRecentCommits } from "./git/index.js";
export { createAIProvider } from "./ai/factory.js";
export { MockAIProvider } from "./ai/providers/mock.js";
export { buildCommitPrompt } from "./ai/prompt.js";
export { GeminiProvider } from "./ai/providers/gemini.js";
export { GroqProvider } from "./ai/providers/groq.js";
export { OllamaProvider } from "./ai/providers/ollama.js";
export { generateCommit, applyCommit } from "./commit/index.js";
export {
  getDefaultConfig,
  getProjectConfig,
  saveProjectConfig,
  getGlobalConfig,
  saveGlobalConfig,
} from "./config/index.js";
export { analyzeRepository } from "./analyzer/index.js";
export { generateReadme } from "./documentator/index.js";
export type {
  AigitConfig,
  AIProvider,
  CommitContext,
  CommitResult,
  DiffResult,
  ProjectInfo,
} from "./types.js";
export type { AnalysisResult } from "./analyzer/index.js";
