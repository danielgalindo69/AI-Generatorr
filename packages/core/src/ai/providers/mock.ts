import type { AIProvider, CommitContext } from "../../types.js";

export class MockAIProvider implements AIProvider {
  constructor(private response: string) {}

  async generateCommit(
    _diff: string,
    _context: CommitContext,
  ): Promise<string> {
    return this.response;
  }
}
