import type { AIProvider, CommitContext } from "../../types.js";
import { buildCommitPrompt } from "../prompt.js";

export class OllamaProvider implements AIProvider {
  private host: string;
  private model: string;

  constructor(host?: string, model?: string) {
    this.host = host ?? "http://localhost:11434";
    this.model = model ?? "codellama";
  }

  async generateCommit(
    diff: string,
    context: CommitContext,
  ): Promise<string> {
    const prompt = buildCommitPrompt(diff, context);
    const response = await fetch(`${this.host}/api/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: this.model,
        prompt,
        stream: false,
      }),
    });

    const data = (await response.json()) as { response: string };
    return data.response.trim();
  }
}