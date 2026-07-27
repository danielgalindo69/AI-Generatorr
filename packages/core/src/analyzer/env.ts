import fs from "node:fs";
import path from "node:path";

export interface EnvVar {
  key: string;
  description: string;
  required: boolean;
}

export function analyzeEnv(dir: string): EnvVar[] {
  const vars: EnvVar[] = [];

  const envFiles = [".env.example", ".env", ".env.local", ".env.development", ".env.production"];

  for (const file of envFiles) {
    const filePath = path.join(dir, file);
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, "utf-8");
      for (const line of content.split("\n")) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith("#")) continue;
        const eqIdx = trimmed.indexOf("=");
        if (eqIdx === -1) continue;
        const key = trimmed.slice(0, eqIdx).trim();
        const value = trimmed.slice(eqIdx + 1).trim();
        if (key) {
          vars.push({
            key,
            description: extractEnvComment(line, content),
            required: !value || value === "" || value.includes("your_") || value.includes("YOUR_"),
          });
        }
      }
    }
  }

  return vars;
}

function extractEnvComment(line: string, fullContent: string): string {
  const lines = fullContent.split("\n");
  const idx = lines.indexOf(line);
  if (idx > 0) {
    const prev = lines[idx - 1].trim();
    if (prev.startsWith("#")) {
      return prev.replace(/^#\s*/, "").trim();
    }
  }
  return "";
}
