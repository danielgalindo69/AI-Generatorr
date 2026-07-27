import fs from "node:fs";
import path from "node:path";

export interface ProjectInfo {
  name: string;
  version: string;
  description: string;
  type: string;
  framework: string;
  language: string;
}

export function analyzeProject(dir: string): ProjectInfo {
  const pkgPath = path.join(dir, "package.json");
  if (fs.existsSync(pkgPath)) {
    const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));
    const framework = detectFramework(dir);
    return {
      name: pkg.name || path.basename(dir),
      version: pkg.version || "0.1.0",
      description: pkg.description || "",
      type: "Node.js",
      framework,
      language: detectLanguage(dir),
    };
  }

  if (fs.existsSync(path.join(dir, "Cargo.toml"))) {
    return { name: path.basename(dir), version: "0.1.0", description: "", type: "Rust", framework: "", language: "Rust" };
  }
  if (fs.existsSync(path.join(dir, "pyproject.toml"))) {
    return { name: path.basename(dir), version: "0.1.0", description: "", type: "Python", framework: "", language: "Python" };
  }
  if (fs.existsSync(path.join(dir, "go.mod"))) {
    return { name: path.basename(dir), version: "0.1.0", description: "", type: "Go", framework: "", language: "Go" };
  }

  return { name: path.basename(dir), version: "", description: "", type: "Unknown", framework: "", language: detectLanguage(dir) };
}

function detectFramework(dir: string): string {
  if (fs.existsSync(path.join(dir, "next.config.js")) || fs.existsSync(path.join(dir, "next.config.ts"))) return "Next.js";
  if (fs.existsSync(path.join(dir, "vite.config.ts")) || fs.existsSync(path.join(dir, "vite.config.js"))) return "Vite";
  if (fs.existsSync(path.join(dir, "astro.config.mjs"))) return "Astro";
  if (fs.existsSync(path.join(dir, "angular.json"))) return "Angular";
  if (fs.existsSync(path.join(dir, "nuxt.config.ts")) || fs.existsSync(path.join(dir, "nuxt.config.js"))) return "Nuxt";
  if (fs.existsSync(path.join(dir, "svelte.config.js"))) return "SvelteKit";
  if (fs.existsSync(path.join(dir, ".expo"))) return "Expo/React Native";
  if (fs.existsSync(path.join(dir, "Cargo.toml"))) return "Rust";
  return "";
}

function detectLanguage(dir: string): string {
  const counts: Record<string, number> = {};
  const extMap: Record<string, string> = {
    ".ts": "TypeScript", ".tsx": "TypeScript", ".js": "JavaScript", ".jsx": "JavaScript",
    ".rs": "Rust", ".py": "Python", ".go": "Go", ".rb": "Ruby", ".java": "Java",
    ".cs": "C#", ".swift": "Swift", ".kt": "Kotlin", ".php": "PHP",
  };

  function walk(d: string, depth = 0) {
    if (depth > 3) return;
    try {
      for (const entry of fs.readdirSync(d, { withFileTypes: true })) {
        if (entry.name.startsWith(".") || entry.name === "node_modules" || entry.name === "target" || entry.name === "dist" || entry.name === "build") continue;
        const fullPath = path.join(d, entry.name);
        if (entry.isDirectory()) walk(fullPath, depth + 1);
        else {
          const ext = path.extname(entry.name);
          if (extMap[ext]) counts[extMap[ext]] = (counts[extMap[ext]] || 0) + 1;
        }
      }
    } catch {}
  }

  walk(dir);
  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  return sorted.length > 0 ? sorted[0][0] : "Unknown";
}
