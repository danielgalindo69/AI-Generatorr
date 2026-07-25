import type { AIProvider, CommitContext } from "../../types.js";
import { buildCommitPrompt } from "../prompt.js";

export class GroqProvider implements AIProvider {
  private model: string;

  constructor(
    private apiKey: string,
    model?: string,
  ) {
    this.model = model ?? "llama-3.3-70b-versatile";
  }

  async generateCommit(
    diff: string,
    context: CommitContext,
  ): Promise<string> {
    const Groq = (await import("groq-sdk")).default;
    const groq = new Groq({ apiKey: this.apiKey });

    const prompt = buildCommitPrompt(diff, context);
    const completion = await groq.chat.completions.create({
      model: this.model,
      messages: [{ role: "user", content: prompt }],
    });
    return completion.choices[0]?.message?.content?.trim() ?? "";
  }
}