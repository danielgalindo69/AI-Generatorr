import fs from "node:fs";
import path from "node:path";

export interface DockerInfo {
  hasDockerfile: boolean;
  hasDockerCompose: boolean;
  baseImage?: string;
  ports: number[];
  services: string[];
}

export function analyzeDocker(dir: string): DockerInfo {
  const info: DockerInfo = { hasDockerfile: false, hasDockerCompose: false, ports: [], services: [] };

  const dockerfilePath = path.join(dir, "Dockerfile");
  if (fs.existsSync(dockerfilePath)) {
    info.hasDockerfile = true;
    const content = fs.readFileSync(dockerfilePath, "utf-8");
    const fromMatch = content.match(/^FROM\s+(\S+)/m);
    if (fromMatch) info.baseImage = fromMatch[1];
    const exposeMatch = content.match(/EXPOSE\s+(\d+)/g);
    if (exposeMatch) {
      info.ports = exposeMatch.map((e) => Number.parseInt(e.replace("EXPOSE ", "")));
    }
  }

  const composePath = path.join(dir, "docker-compose.yml");
  const composeAltPath = path.join(dir, "docker-compose.yaml");
  if (fs.existsSync(composePath) || fs.existsSync(composeAltPath)) {
    info.hasDockerCompose = true;
  }

  return info;
}
