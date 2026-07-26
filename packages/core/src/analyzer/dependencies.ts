import fs from "node:fs";
import path from "node:path";

export interface Dependencies {
  dependencies: string[];
  devDependencies: string[];
}

export function analyzeDependencies(dir: string): Dependencies {
  const result: Dependencies = { dependencies: [], devDependencies: [] };
  const pkgPath = path.join(dir, "package.json");
  if (fs.existsSync(pkgPath)) {
    const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));
    result.dependencies = Object.keys(pkg.dependencies || {});
    result.devDependencies = Object.keys(pkg.devDependencies || {});
  }
  return result;
}
