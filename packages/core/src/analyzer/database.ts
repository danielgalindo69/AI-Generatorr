import fs from "node:fs";
import path from "node:path";

export interface DatabaseInfo {
  type: string;
  schemaPath?: string;
  models: string[];
  provider?: string;
}

export function analyzeDatabase(dir: string): DatabaseInfo | null {
  const schemaPath = path.join(dir, "prisma", "schema.prisma");
  if (fs.existsSync(schemaPath)) {
    const content = fs.readFileSync(schemaPath, "utf-8");
    const providerMatch = content.match(/provider\s*=\s*"(\w+)"/);
    const models: string[] = [];
    const modelRegex = /model\s+(\w+)\s*{/g;
    let match;
    while ((match = modelRegex.exec(content)) !== null) {
      models.push(match[1]);
    }
    return { type: "Prisma", schemaPath: "prisma/schema.prisma", models, provider: providerMatch?.[1] };
  }

  const ormConfigs = ["ormconfig.json", "typeorm.json", "drizzle.config.ts", "drizzle.config.js"];
  for (const cfg of ormConfigs) {
    if (fs.existsSync(path.join(dir, cfg))) {
      return { type: "ORM", schemaPath: cfg, models: [] };
    }
  }

  return null;
}
