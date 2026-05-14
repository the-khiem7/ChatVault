import { spawn } from "node:child_process";
import { resolve } from "node:path";

const target = process.argv[2] || "chrome";
const viteBin = resolve(process.cwd(), "node_modules/vite/bin/vite.js");
const child = spawn(
  process.execPath,
  [viteBin, "build"],
  {
    stdio: "inherit",
    env: {
      ...process.env,
      BROWSER_TARGET: target
    }
  }
);

child.on("exit", (code) => {
  process.exit(code ?? 1);
});
