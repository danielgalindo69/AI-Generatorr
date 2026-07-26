import fs from "node:fs";
import path from "node:path";

export interface CICDInfo {
  provider: string;
  configs: string[];
}

export function analyzeCICD(dir: string): CICDInfo | null {
  const githubDir = path.join(dir, ".github", "workflows");
  if (fs.existsSync(githubDir)) {
    const configs = fs.readdirSync(githubDir).filter((f) => f.endsWith(".yml") || f.endsWith(".yaml"));
    if (configs.length > 0) return { provider: "GitHub Actions", configs };
  }

  const gitlabDir = path.join(dir, ".gitlab-ci.yml");
  if (fs.existsSync(gitlabDir)) return { provider: "GitLab CI", configs: [".gitlab-ci.yml"] };

  const circleDir = path.join(dir, ".circleci");
  if (fs.existsSync(circleDir)) return { provider: "CircleCI", configs: fs.readdirSync(circleDir) };

  return null;
}
