import type { AIProvider, CommitContext } from "../../types.js";
import { buildCommitPrompt } from "../prompt.js";

export class GeminiProvider implements AIProvider {
  private model: string;

  constructor(
    private apiKey: string,
    model?: string,
  ) {
    this.model = model ?? "gemini-2.0-flash";
  }

  async generateCommit(
    diff: string,
    context: CommitContext,
  ): Promise<string> {
    const { GoogleGenerativeAI } = await import("@google/generative-ai");
    const genAI = new GoogleGenerativeAI(this.apiKey);
    const model = genAI.getGenerativeModel({ model: this.model });

    const prompt = buildCommitPrompt(diff, context);
    const result = await model.generateContent(prompt);
    return result.response.text().trim();
  }
}