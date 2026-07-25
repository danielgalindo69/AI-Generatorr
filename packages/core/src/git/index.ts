import git from "isomorphic-git";
import fs from "node:fs";
import path from "node:path";
import type { DiffResult } from "../types.js";

export async function getDiff(
  dir: string,
  stagedOnly = false,
): Promise<DiffResult> {
  const statusMatrix = await git.statusMatrix({ fs, dir });
  const modifiedFiles = statusMatrix
    .filter(([, s1, s2]) => s1 !== 1 || s2 !== 1)
    .map(([filepath]) => filepath);

  if (modifiedFiles.length === 0) {
    return {
      files: [],
      diff: "",
      staged: false,
      summary: { added: 0, modified: 0, deleted: 0 },
    };
  }

  let added = 0;
  let deleted = 0;
  let modified = 0;

  const diff = modifiedFiles
    .map((f) => {
      const fullPath = path.join(dir, f);
      if (!fs.existsSync(fullPath)) {
        deleted++;
        return `Archivo eliminado: ${f}`;
      }
      const content = fs.readFileSync(fullPath, "utf-8");
      if (statusMatrix.find(([fp]) => fp === f)?.[1] === 0) {
        added++;
      } else {
        modified++;
      }
      return `--- a/${f}\n+++ b/${f}\n${content}`;
    })
    .join("\n\n");

  return {
    files: modifiedFiles,
    diff,
    staged: stagedOnly,
    summary: { added, modified, deleted },
  };
}

export async function getRecentCommits(
  dir: string,
  count = 5,
): Promise<string[]> {
  try {
    const commits = await git.log({ fs, dir, depth: count });
    return commits.map((c) => c.commit.message);
  } catch {
    return [];
  }
}
