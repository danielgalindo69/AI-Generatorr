import { analyzeProject, type ProjectInfo } from "./project.js";
import { analyzeDependencies, type Dependencies } from "./dependencies.js";
import { analyzeEnv, type EnvVar } from "./env.js";
import { analyzeDocker, type DockerInfo } from "./docker.js";
import { analyzeCICD, type CICDInfo } from "./cicd.js";
import { analyzeDatabase, type DatabaseInfo } from "./database.js";
import { analyzeScripts, type Scripts } from "./scripts.js";

export interface AnalysisResult {
  project: ProjectInfo;
  dependencies: Dependencies;
  envVars: EnvVar[];
  docker: DockerInfo;
  cicd: CICDInfo | null;
  database: DatabaseInfo | null;
  scripts: Scripts;
}

export function analyzeRepository(dir: string): AnalysisResult {
  return {
    project: analyzeProject(dir),
    dependencies: analyzeDependencies(dir),
    envVars: analyzeEnv(dir),
    docker: analyzeDocker(dir),
    cicd: analyzeCICD(dir),
    database: analyzeDatabase(dir),
    scripts: analyzeScripts(dir),
  };
}
