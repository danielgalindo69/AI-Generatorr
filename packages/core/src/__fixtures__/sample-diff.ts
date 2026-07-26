export const SAMPLE_DIFF = `--- a/src/index.ts
+++ b/src/index.ts
@@ -1,5 +1,6 @@
-const oldCode = "hello";
+const newCode = "hello world";
+const extra = "new line";
 export function greet() {
-  return oldCode;
+  return newCode;
 }`;

export const SAMPLE_DIFF_ADD = `--- /dev/null
+++ b/src/new-file.ts
@@ -0,0 +1,3 @@
+export function newFeature() {
+  return "brand new";
+}`;
