import type { CommitContext } from "../types.js";

export function buildCommitPrompt(
  diff: string,
  context: CommitContext,
): string {
  return [
    "Eres un asistente que genera mensajes de commit en git.",
    context.style === "conventional"
      ? "Sigue Conventional Commits (feat:, fix:, chore:, docs:, refactor:, test:, perf:, style:)."
      : context.style === "emoji"
        ? "Usa emojis al inicio del mensaje."
        : "Genera un mensaje claro y descriptivo.",
    "",
    "Contexto del proyecto:",
    `- Tipo: ${context.projectType}`,
    `- Framework: ${context.framework}`,
    `- Idioma: ${context.language}`,
    "",
    "Últimos commits del proyecto:",
    ...context.recentCommits.map((c) => `  - ${c}`),
    "",
    context.userHint ? `Contexto adicional: ${context.userHint}` : "",
    "",
    "Diff de los archivos modificados:",
    diff,
    "",
    "Genera SOLO el mensaje de commit, sin explicaciones adicionales.",
    `Máximo 72 caracteres para el título.`,
    "Si hay múltiples cambios, usa un título corto y cuerpo con viñetas.",
  ]
    .filter(Boolean)