import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/extension.ts"],
  format: ["cjs"],
  dts: true,
  clean: true,
  external: ["vscode"],
  noExternal: ["@aigit/core"],
});
