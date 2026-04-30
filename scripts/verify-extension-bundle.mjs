import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const contentScriptPath = resolve("dist/src/content.js");
const contentScript = readFileSync(contentScriptPath, "utf8");

if (/^\s*import(?:\s|[{*"'])/m.test(contentScript) || /^\s*export(?:\s|[{*])/m.test(contentScript)) {
  console.error("Content script bundle must not contain top-level import/export statements.");
  console.error("Manifest-declared content scripts run as classic scripts.");
  process.exit(1);
}
