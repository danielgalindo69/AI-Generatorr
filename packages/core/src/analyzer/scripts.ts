import fs from "node:fs";
import path from "node:path";

export interface Scripts {
  scripts: Record<string, string>;
}

export function analyzeScripts(dir: string): Scripts {
  const pkgPath = path.join(dir, "package.json");
  if (fs.existsSync(pkgPath)) {
    const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));
    return { scripts: pkg.scripts || {} };
  }
  return { scripts: {} };
}
