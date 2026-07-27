import type { AnalysisResult } from "../analyzer/index.js";

export function buildReadmePrompt(analysis: AnalysisResult, existingReadme?: string): string {
  const sections: string[] = [
    "# Instrucciones",
    "Eres un asistente experto en documentación técnica. Genera un README.md completo y profesional en español para el siguiente proyecto.",
    "",
    "El README debe incluir estas secciones si aplican:",
    "- Nombre del proyecto (como título)",
    "- Descripción breve",
    "- 🚀 Características principales",
    "- 📋 Requisitos previos",
    "- 🔧 Instalación y configuración",
    "- ⚙️ Variables de entorno (con tabla)",
    "- 🐳 Docker (si aplica)",
    "- 📦 Scripts disponibles",
    "- 🗄️ Base de datos (si aplica)",
    "- 🚀 Despliegue (si aplica)",
    "- 🤝 Contribución",
    "- 📄 Licencia",
    "",
    "# Información del proyecto",
    `Nombre: ${analysis.project.name}`,
    `Versión: ${analysis.project.version}`,
    `Descripción: ${analysis.project.description}`,
    `Tipo: ${analysis.project.type}`,
    `Framework: ${analysis.project.framework}`,
    `Lenguaje principal: ${analysis.project.language}`,
    "",
  ];

  if (analysis.dependencies.dependencies.length > 0) {
    sections.push("## Dependencias principales:", ...analysis.dependencies.dependencies.map((d) => `- ${d}`), "");
  }

  if (analysis.envVars.length > 0) {
    sections.push("## Variables de entorno:", "| Variable | Descripción | Requerida |");
    sections.push("|----------|-------------|-----------|");
    for (const v of analysis.envVars) {
      sections.push(`| ${v.key} | ${v.description || "-"} | ${v.required ? "✅ Sí" : "❌ No"} |`);
    }
    sections.push("");
  }

  if (analysis.docker.hasDockerfile || analysis.docker.hasDockerCompose) {
    sections.push("## Docker:");
    if (analysis.docker.hasDockerfile) sections.push(`- Dockerfile (${analysis.docker.baseImage || "imagen base no detectada"})`);
    if (analysis.docker.hasDockerCompose) sections.push("- docker-compose.yml");
    if (analysis.docker.ports.length > 0) sections.push(`- Puertos expuestos: ${analysis.docker.ports.join(", ")}`);
    sections.push("");
  }

  if (analysis.cicd) {
    sections.push(`## CI/CD: ${analysis.cicd.provider}`);
    sections.push(...analysis.cicd.configs.map((c) => `- ${c}`));
    sections.push("");
  }

  if (analysis.database) {
    sections.push(`## Base de datos: ${analysis.database.type}`);
    if (analysis.database.provider) sections.push(`- Proveedor: ${analysis.database.provider}`);
    if (analysis.database.models.length > 0) {
      sections.push("- Modelos:", ...analysis.database.models.map((m) => `  - ${m}`));
    }
    sections.push("");
  }

  if (Object.keys(analysis.scripts.scripts).length > 0) {
    sections.push("## Scripts:", "| Comando | Descripción |");
    sections.push("|---------|-------------|");
    for (const [name, cmd] of Object.entries(analysis.scripts.scripts)) {
      sections.push(`| \`${name}\` | ${cmd} |`);
    }
    sections.push("");
  }

  sections.push(
    "Genera SOLO el contenido del README.md, sin explicaciones adicionales.",
    "Usa un tono profesional pero accesible.",
    "Si hay secciones que no aplican, omítelas.",
  );

  if (existingReadme) {
    sections.push("", "# README existente (actualiza y mejora conservando lo relevante):", existingReadme);
  }

  return sections.join("\n");
}
