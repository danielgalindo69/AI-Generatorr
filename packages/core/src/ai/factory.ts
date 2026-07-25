import type { AIProvider, AigitConfig } from "../types.js";
import { GeminiProvider } from "./providers/gemini.js";
import { GroqProvider } from "./providers/groq.js";
import { OllamaProvider } from "./providers/ollama.js";

export function createAIProvider(config: AigitConfig): AIProvider {
  switch (config.aiProvider) {
    case "gemini": {
      if (!config.apiKey)
        throw new Error(
          "GEMINI_API_KEY no configurada. Ejecuta: aigit config set apiKey <tu-key>",
        );
      return new GeminiProvider(config.apiKey, config.model);
    }
    case "groq": {
      if (!config.apiKey)
        throw new Error(
          "GROQ_API_KEY no configurada. Ejecuta: aigit config set apiKey <tu-key>",
        );
      return new GroqProvider(config.apiKey, config.model);
    }
    case "ollama":
      return new OllamaProvider(config.ollamaHost, config.model);
    default:
      throw new Error(`Proveedor IA no soportado: ${config.aiProvider}`);
  }
}